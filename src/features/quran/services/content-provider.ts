import type { MushafPage, MushafPageLine, QuranSurah, QuranSurahDirectory } from '../types';

export type ContentUnavailableReason = 'network' | 'invalid-data' | 'server';

export class ContentUnavailableError extends Error {
  readonly reason: ContentUnavailableReason;

  constructor(
    reason: ContentUnavailableReason,
    message: string,
  ) {
    super(message);
    this.name = 'ContentUnavailableError';
    this.reason = reason;
  }
}

export interface QuranContentProvider {
  getSurahDirectory(): Promise<QuranSurahDirectory>;
  getSurah(surahNumber: number): Promise<QuranSurah>;
  getMushafPage(pageNumber: number): Promise<MushafPage>;
  getAyahAudioUrl(reciterId: number, surahNumber: number, ayahNumber: number): Promise<string>;
  getReciters(): Promise<QuranReciter[]>;
}

const API_BASE_URL = 'https://api.quran.com/api/v4';
const AYAH_AUDIO_BASE_URL = 'https://verses.quran.com/';
const WORD_AUDIO_BASE_URL = 'https://audio.qurancdn.com/';
const SOURCE_ID = 'quran-com-api';
const CONTENT_VERSION = 'api-v4';

export type QuranReciter = {
  id: number;
  name: string;
  style: string;
};

export class QuranComContentProvider implements QuranContentProvider {
  async getSurahDirectory(): Promise<QuranSurahDirectory> {
    const payload = await this.requestJson('/chapters?language=ar');
    if (!isRecord(payload) || !Array.isArray(payload.chapters) || payload.chapters.length !== 114) {
      throw new ContentUnavailableError('invalid-data', 'Surah directory has an invalid shape.');
    }

    const seen = new Set<number>();
    const surahs = payload.chapters.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'number' ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        item.id > 114 ||
        typeof item.name_arabic !== 'string' ||
        item.name_arabic.trim().length === 0 ||
        typeof item.verses_count !== 'number' ||
        !Number.isInteger(item.verses_count) ||
        item.verses_count < 1 ||
        item.revelation_place !== 'makkah' && item.revelation_place !== 'madinah' ||
        seen.has(item.id)
      ) {
        throw new ContentUnavailableError(
          'invalid-data',
          'Surah directory contains an invalid or duplicate entry.',
        );
      }

      seen.add(item.id);
      const revelationPlace: QuranSurahDirectory['surahs'][number]['revelationPlace'] =
        item.revelation_place;
      return {
        surahNumber: item.id,
        nameArabic: item.name_arabic,
        ayahCount: item.verses_count,
        revelationPlace,
      };
    });

    if (seen.size !== 114) {
      throw new ContentUnavailableError('invalid-data', 'Surah directory is incomplete.');
    }

    return {
      sourceId: SOURCE_ID,
      contentVersion: CONTENT_VERSION,
      surahs: surahs.sort((a, b) => a.surahNumber - b.surahNumber),
    };
  }

  async getSurah(surahNumber: number): Promise<QuranSurah> {
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      throw new RangeError('Surah number must be between 1 and 114.');
    }

    const [chapterPayload, versesPayload] = await Promise.all([
      this.requestJson(`/chapters/${surahNumber}?language=ar`),
      this.requestJson(
        `/verses/by_chapter/${surahNumber}?language=ar&words=true&word_fields=text_uthmani&fields=text_uthmani_tajweed&per_page=300`,
      ),
    ]);

    return parseSurah(chapterPayload, versesPayload, surahNumber);
  }

  async getMushafPage(pageNumber: number): Promise<MushafPage> {
    if (pageNumber !== 1) {
      throw new RangeError('The QCF Tajweed proof of concept currently supports page 1 only.');
    }

    const [chapterPayload, versesPayload] = await Promise.all([
      this.requestJson('/chapters/1?language=ar'),
      this.requestJson(
        '/verses/by_page/1?language=ar&mushaf=19&words=true&word_fields=code_v2%2Ctext_uthmani&fields=text_uthmani_tajweed&per_page=300',
      ),
    ]);

    return parseMushafPage(chapterPayload, versesPayload);
  }

  async getAyahAudioUrl(
    reciterId: number,
    surahNumber: number,
    ayahNumber: number,
  ): Promise<string> {
    if (
      !Number.isInteger(reciterId) ||
      reciterId < 1 ||
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      !Number.isInteger(ayahNumber) ||
      ayahNumber < 1
    ) {
      throw new RangeError('Reciter, surah, and ayah must be valid positive integers.');
    }

    const payload = await this.requestJson(
      `/recitations/${reciterId}/by_ayah/${surahNumber}:${ayahNumber}`,
    );
    if (
      !isRecord(payload) ||
      !Array.isArray(payload.audio_files) ||
      payload.audio_files.length !== 1 ||
      !isRecord(payload.audio_files[0]) ||
      payload.audio_files[0].verse_key !== `${surahNumber}:${ayahNumber}` ||
      typeof payload.audio_files[0].url !== 'string' ||
      !isSafeAudioPath(payload.audio_files[0].url)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Ayah audio response is invalid.');
    }

    return new URL(payload.audio_files[0].url, AYAH_AUDIO_BASE_URL).toString();
  }

  async getReciters(): Promise<QuranReciter[]> {
    const payload = await this.requestJson('/resources/chapter_reciters?language=ar');
    if (!isRecord(payload) || !Array.isArray(payload.reciters) || payload.reciters.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'Reciter list has an invalid shape.');
    }

    const seen = new Set<number>();
    return payload.reciters.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'number' ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        seen.has(item.id) ||
        typeof item.name !== 'string' ||
        item.name.trim().length === 0 ||
        !isRecord(item.style) ||
        typeof item.style.name !== 'string'
      ) {
        throw new ContentUnavailableError('invalid-data', 'Reciter list contains an invalid entry.');
      }

      seen.add(item.id);
      return { id: item.id, name: item.name, style: item.style.name };
    });
  }

  getWordAudioUrl(audioPath: string): string {
    if (!isSafeWordAudioPath(audioPath)) {
      throw new ContentUnavailableError('invalid-data', 'Word audio path is invalid.');
    }
    return new URL(audioPath, WORD_AUDIO_BASE_URL).toString();
  }

  private async requestJson(path: string): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`);
    } catch (error) {
      throw new ContentUnavailableError(
        'network',
        error instanceof Error ? error.message : 'Quran.com could not be reached.',
      );
    }

    if (!response.ok) {
      throw new ContentUnavailableError(
        'server',
        `Quran.com API returned HTTP ${response.status}.`,
      );
    }

    try {
      return await response.json();
    } catch {
      throw new ContentUnavailableError('invalid-data', 'Quran.com API returned invalid JSON.');
    }
  }
}

function parseMushafPage(chapterPayload: unknown, versesPayload: unknown): MushafPage {
  const surah = parseSurah(chapterPayload, versesPayload, 1);
  if (!isRecord(versesPayload) || !Array.isArray(versesPayload.verses)) {
    throw new ContentUnavailableError('invalid-data', 'Mushaf page response is invalid.');
  }

  const lines = new Map<number, MushafPageLine['words']>();
  const seenWordIds = new Set<number>();
  for (const verse of versesPayload.verses) {
    if (
      !isRecord(verse) ||
      typeof verse.verse_number !== 'number' ||
      !Number.isInteger(verse.verse_number) ||
      verse.verse_number < 1 ||
      verse.verse_number > surah.ayahCount ||
      verse.page_number !== 1 ||
      verse.verse_key !== `1:${verse.verse_number}` ||
      !Array.isArray(verse.words)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Mushaf page contains an invalid verse.');
    }

    let previousPosition = 0;
    for (const item of verse.words) {
      if (
        !isRecord(item) ||
        item.char_type_name !== 'word' && item.char_type_name !== 'end' ||
        typeof item.id !== 'number' ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        seenWordIds.has(item.id) ||
        typeof item.position !== 'number' ||
        !Number.isInteger(item.position) ||
        item.position <= previousPosition ||
        item.page_number !== 1 ||
        typeof item.line_number !== 'number' ||
        !Number.isInteger(item.line_number) ||
        item.line_number < 2 ||
        item.line_number > 8 ||
        typeof item.code_v2 !== 'string' ||
        item.code_v2.length === 0 ||
        typeof item.text_uthmani !== 'string' ||
        item.text_uthmani.length === 0
      ) {
        throw new ContentUnavailableError('invalid-data', 'Mushaf page contains an invalid word.');
      }

      previousPosition = item.position;
      seenWordIds.add(item.id);
      const lineWords = lines.get(item.line_number) ?? [];
      lineWords.push({
        id: String(item.id),
        surahNumber: 1,
        ayahNumber: verse.verse_number,
        position: item.position,
        pageNumber: 1,
        lineNumber: item.line_number,
        charType: item.char_type_name,
        codeV2: item.code_v2,
        textUthmani: item.text_uthmani,
      });
      lines.set(item.line_number, lineWords);
    }
  }

  const pageLines: MushafPageLine[] = [];
  for (let lineNumber = 2; lineNumber <= 8; lineNumber += 1) {
    const words = lines.get(lineNumber);
    if (!words || words.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'Mushaf page is missing a source line.');
    }
    pageLines.push({ lineNumber, words });
  }

  return { pageNumber: 1, mushafId: 19, surah, lines: pageLines };
}

function parseSurah(
  chapterPayload: unknown,
  versesPayload: unknown,
  requestedSurah: number,
): QuranSurah {
  if (
    !isRecord(chapterPayload) ||
    !isRecord(chapterPayload.chapter) ||
    chapterPayload.chapter.id !== requestedSurah ||
    typeof chapterPayload.chapter.name_arabic !== 'string' ||
    chapterPayload.chapter.name_arabic.trim().length === 0 ||
    chapterPayload.chapter.revelation_place !== 'makkah' &&
      chapterPayload.chapter.revelation_place !== 'madinah' ||
    typeof chapterPayload.chapter.verses_count !== 'number' ||
    !Number.isInteger(chapterPayload.chapter.verses_count) ||
    chapterPayload.chapter.verses_count < 1 ||
    !isRecord(versesPayload) ||
    !Array.isArray(versesPayload.verses) ||
    !isRecord(versesPayload.pagination) ||
    versesPayload.pagination.total_records !== chapterPayload.chapter.verses_count ||
    versesPayload.verses.length !== chapterPayload.chapter.verses_count
  ) {
    throw new ContentUnavailableError(
      'invalid-data',
      'Surah response is incomplete or has an invalid shape.',
    );
  }

  const seenWordIds = new Set<number>();
  let expectedAyahNumber = 1;
  const ayahs: QuranSurah['ayahs'] = versesPayload.verses.map((verse: unknown) => {
    if (
      !isRecord(verse) ||
      typeof verse.verse_number !== 'number' ||
      !Number.isInteger(verse.verse_number) ||
      verse.verse_number !== expectedAyahNumber ||
      !Array.isArray(verse.words)
    ) {
      throw new ContentUnavailableError('invalid-data', 'An ayah has an invalid response shape.');
    }
    expectedAyahNumber += 1;

    let expectedWordPosition = 1;
    const words = verse.words
      .filter((word: unknown) => isRecord(word) && word.char_type_name === 'word')
      .map((word: unknown) => {
        if (
          !isRecord(word) ||
          typeof word.id !== 'number' ||
          !Number.isInteger(word.id) ||
          word.id < 1 ||
          seenWordIds.has(word.id) ||
          typeof word.position !== 'number' ||
          !Number.isInteger(word.position) ||
          word.position !== expectedWordPosition ||
          typeof word.text_uthmani !== 'string' ||
          word.text_uthmani.length === 0 ||
          word.audio_url !== null &&
            (typeof word.audio_url !== 'string' || !isSafeWordAudioPath(word.audio_url))
        ) {
          throw new ContentUnavailableError('invalid-data', 'A word has an invalid response shape.');
        }

        seenWordIds.add(word.id);
        expectedWordPosition += 1;
        return {
          id: String(word.id),
          position: word.position,
          textUthmani: word.text_uthmani,
          audioUrl: word.audio_url,
        };
      });

    if (words.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'An ayah contains no source words.');
    }

    if (
      typeof verse.text_uthmani_tajweed !== 'string' ||
      !isValidTajweedText(verse.text_uthmani_tajweed, words, verse.verse_number)
    ) {
      throw new ContentUnavailableError('invalid-data', 'An ayah has invalid Tajweed text.');
    }

    return {
      ayahNumber: verse.verse_number,
      words,
      tajweedText: verse.text_uthmani_tajweed,
    };
  });

  return {
    surahNumber: requestedSurah,
    nameArabic: chapterPayload.chapter.name_arabic,
    revelationPlace: chapterPayload.chapter.revelation_place,
    sourceId: SOURCE_ID,
    contentVersion: CONTENT_VERSION,
    ayahCount: ayahs.length,
    ayahs,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSafeWordAudioPath(value: string): boolean {
  return /^wbw\/\d{3}_\d{3}_\d{3}\.mp3$/.test(value);
}

function isSafeAudioPath(value: string): boolean {
  return /^[A-Za-z0-9_-]+\/mp3\/\d{6}\.mp3$/.test(value);
}

function isValidTajweedText(
  value: string,
  words: QuranSurah['ayahs'][number]['words'],
  ayahNumber: number,
): boolean {
  const endMarker = value.match(/<span class=end>([^<>]+)<\/span>\s*$/)?.[1];
  const arabicNumber = String(ayahNumber).replace(/[0-9]/g, (digit) =>
    String.fromCharCode(0x0660 + Number(digit)),
  );
  const markup = value.match(/<[^>]*>/g) ?? [];
  const tajweedWordCount = value
    .replace(/<span class=end>[^<>]*<\/span>/g, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !(token.length === 1 && token.charCodeAt(0) === 0x06de))
    .length;
  let tajweedDepth = 0;
  let endDepth = 0;
  for (const tag of markup) {
    if (/^<tajweed class=[a-z_]+>$/.test(tag)) {
      if (endDepth !== 0) {
        return false;
      }
      tajweedDepth += 1;
    } else if (tag === '</tajweed>') {
      if (tajweedDepth === 0) {
        return false;
      }
      tajweedDepth -= 1;
    } else if (tag === '<span class=end>') {
      if (tajweedDepth !== 0 || endDepth !== 0) {
        return false;
      }
      endDepth = 1;
    } else if (tag === '</span>') {
      if (endDepth !== 1) {
        return false;
      }
      endDepth = 0;
    } else {
      return false;
    }
  }
  return (
    tajweedDepth === 0 &&
    endDepth === 0 &&
    endMarker === arabicNumber &&
    tajweedWordCount === words.length &&
    value.replace(/<[^>]*>/g, '').trim().length > 0
  );
}

export const quranContentProvider = new QuranComContentProvider();
