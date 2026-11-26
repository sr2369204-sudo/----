/**
 * Quran text, tafsir and word meanings bundled inside the app.
 *
 * Everything here is read from files shipped with the app, so it works with no
 * connection and answers in milliseconds. The data is loaded the first time it
 * is needed (or when `warmOfflineData` runs) and then stays in memory.
 *
 * Sources are the same ones the app used to call over the network:
 * - Quran text: Quran.com `text_uthmani`.
 * - Tafsir: «التفسير الميسر» (Quran.com resource 16). One entry can cover
 *   several ayahs, so ayahs point at a shared entry.
 * - Word meanings: «السراج في بيان غريب القرآن» (QuranEnc), one block of
 *   `word:meaning` lines per ayah, empty when every word is clear.
 */
import type { AyahWordMeaning } from '@/features/quran/services/content-provider';
import type { AyahSearchResult } from '@/features/quran/types';

type QuranTextFile = { counts: number[]; ayahs: string[] };
type TafsirFile = { entries: string[]; ayahEntry: number[] };
type MeaningsFile = { meanings: string[] };

type Prepared = {
  /** Index of the first ayah of each surah in the flat ayah list. */
  surahStart: number[];
  ayahs: string[];
  ayahNorm: string[];
  tafsirEntries: string[];
  tafsirNorm: string[];
  ayahEntry: number[];
  /** First ayah (flat index) covered by each tafsir entry. */
  entryFirstAyah: number[];
  meanings: string[];
};

let prepared: Prepared | null = null;

const MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const ALEF_FORMS = /[أإآٱى]/g;
const NON_LETTERS = /[^\u0621-\u064A\u0671-\u06D3]+/g;

/** Lower-case, no diacritics, one alef, letters separated by single spaces. */
export function normalizeForSearch(value: string): string {
  return ` ${value
    .toLowerCase()
    .replace(MARKS, '')
    .replace(ALEF_FORMS, (letter) => (letter === 'ى' ? 'ي' : 'ا'))
    .replace(NON_LETTERS, ' ')
    .trim()} `;
}

function load(): Prepared {
  if (prepared) {
    return prepared;
  }
  // Required lazily so the large files are only read when first needed.
  const quran = require('./quran-text.json') as QuranTextFile;
  const tafsir = require('./tafsir-muyassar.json') as TafsirFile;
  const meanings = require('./word-meanings.json') as MeaningsFile;

  const surahStart: number[] = [];
  let running = 0;
  for (const count of quran.counts) {
    surahStart.push(running);
    running += count;
  }
  const entryFirstAyah: number[] = new Array(tafsir.entries.length).fill(-1);
  tafsir.ayahEntry.forEach((entry, ayah) => {
    if (entryFirstAyah[entry] === -1) {
      entryFirstAyah[entry] = ayah;
    }
  });

  prepared = {
    surahStart,
    ayahs: quran.ayahs,
    ayahNorm: quran.ayahs.map(normalizeForSearch),
    tafsirEntries: tafsir.entries,
    tafsirNorm: tafsir.entries.map(normalizeForSearch),
    ayahEntry: tafsir.ayahEntry,
    entryFirstAyah,
    meanings: meanings.meanings,
  };
  return prepared;
}

/** Loads and indexes everything now, so the first search is instant. */
export function warmOfflineData(): void {
  load();
}

function flatIndex(data: Prepared, surahNumber: number, ayahNumber: number): number | null {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return null;
  }
  const start = data.surahStart[surahNumber - 1];
  const end = surahNumber === 114 ? data.ayahs.length : data.surahStart[surahNumber];
  if (!Number.isInteger(ayahNumber) || ayahNumber < 1 || start + ayahNumber - 1 >= end) {
    return null;
  }
  return start + ayahNumber - 1;
}

function toReference(data: Prepared, index: number): { surahNumber: number; ayahNumber: number } {
  let surah = 114;
  while (data.surahStart[surah - 1] > index) {
    surah -= 1;
  }
  return { surahNumber: surah, ayahNumber: index - data.surahStart[surah - 1] + 1 };
}

export function getBundledAyahText(surahNumber: number, ayahNumber: number): string | null {
  const data = load();
  const index = flatIndex(data, surahNumber, ayahNumber);
  return index === null ? null : data.ayahs[index];
}

export function getBundledTafsir(surahNumber: number, ayahNumber: number): string | null {
  const data = load();
  const index = flatIndex(data, surahNumber, ayahNumber);
  if (index === null) {
    return null;
  }
  const text = data.tafsirEntries[data.ayahEntry[index]];
  return text && text.length > 0 ? text : null;
}

let tafsirCenterMeanings: string[][] | null = null;

/**
 * One meaning per printed word of the ayah, in word order, from the Tafsir
 * Center for Quranic Studies (CC BY 4.0). Null when the ayah is unknown.
 */
export function getTafsirCenterWordMeanings(surahNumber: number, ayahNumber: number): string[] | null {
  const data = load();
  const index = flatIndex(data, surahNumber, ayahNumber);
  if (index === null) {
    return null;
  }
  if (!tafsirCenterMeanings) {
    // Required lazily: the file is large and only the word sheet needs it.
    tafsirCenterMeanings = require('./word-meanings-tafsir.json') as string[][];
  }
  return tafsirCenterMeanings[index] ?? null;
}

/** Meanings of one ayah, or an empty list when all its words are clear. */
export function getBundledWordMeanings(
  surahNumber: number,
  ayahNumber: number,
): AyahWordMeaning[] | null {
  const data = load();
  const index = flatIndex(data, surahNumber, ayahNumber);
  if (index === null) {
    return null;
  }
  const block = data.meanings[index];
  if (!block) {
    return [];
  }
  return block.split('\n').map((line) => {
    const separator = line.indexOf(':');
    return { word: line.slice(0, separator), meaning: line.slice(separator + 1) };
  });
}

export type BundledSearchResult = AyahSearchResult & {
  /** `tafsir` when the words were found in the tafsir text, not in the ayah. */
  matchedIn?: 'ayah' | 'tafsir';
};

const TAFSIR_RESULTS_LIMIT = 10;

function snippetAround(text: string, normalizedWord: string): string {
  // Cut the original tafsir around its first matching word. The normalised text
  // has a different length, so look the word up by its letters in the original.
  const words = text.split(' ');
  const hit = words.findIndex((word) => normalizeForSearch(word).trim().startsWith(normalizedWord));
  const from = Math.max(0, (hit < 0 ? 0 : hit) - 8);
  const piece = words.slice(from, from + 28).join(' ');
  return `${from > 0 ? '… ' : ''}${piece}${from + 28 < words.length ? ' …' : ''}`;
}

/**
 * Searches the ayah text first, then the tafsir. Words are matched from the
 * start of a word, and the last word may be unfinished, so results appear as
 * soon as the first letter is typed.
 */
export function searchBundled(query: string, limit: number): BundledSearchResult[] {
  const normalized = normalizeForSearch(query).trim();
  if (normalized.length === 0) {
    return [];
  }
  const data = load();
  const results: BundledSearchResult[] = [];
  const phrase = ` ${normalized}`;
  const seenEntries = new Set<number>();

  for (let i = 0; i < data.ayahNorm.length && results.length < limit; i += 1) {
    if (data.ayahNorm[i].includes(phrase)) {
      results.push({ ...toReference(data, i), text: data.ayahs[i], matchedIn: 'ayah' });
      seenEntries.add(data.ayahEntry[i]);
    }
  }

  const words = normalized.split(' ').map((word) => ` ${word}`);
  let tafsirCount = 0;
  for (let e = 0; e < data.tafsirNorm.length && tafsirCount < TAFSIR_RESULTS_LIMIT; e += 1) {
    const text = data.tafsirNorm[e];
    if (!words.every((word) => text.includes(word))) {
      continue;
    }
    const first = data.entryFirstAyah[e];
    if (first < 0) {
      continue;
    }
    // Skip entries whose ayah was already listed from its own text.
    if (seenEntries.has(e)) {
      continue;
    }
    results.push({
      ...toReference(data, first),
      text: snippetAround(data.tafsirEntries[e], words[0].trim()),
      matchedIn: 'tafsir',
    });
    tafsirCount += 1;
  }
  return results;
}

/** Number of words in one ayah, counted from the bundled Quran text. */
export function getAyahWordCount(surahNumber: number, ayahNumber: number): number {
  const data = load();
  const start = data.surahStart[surahNumber - 1];
  if (start === undefined) {
    return 0;
  }
  const text = data.ayahs[start + ayahNumber - 1];
  return text ? text.split(/\s+/).filter((part) => part.length > 0).length : 0;
}

/** Ayah count of one surah, from the bundled Quran text. */
export function getSurahAyahCount(surahNumber: number): number {
  const data = load();
  const start = data.surahStart[surahNumber - 1];
  const next = data.surahStart[surahNumber];
  if (start === undefined) {
    return 0;
  }
  return (next ?? data.ayahs.length) - start;
}
