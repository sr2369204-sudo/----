import { Directory, File, Paths } from 'expo-file-system';

import { getAyahWordCount, getSurahAyahCount } from '@/features/offline-data';
import { quranContentProvider } from '@/features/quran/services/content-provider';

const WORD_AUDIO_DIRECTORY = 'word-audio';
const CONCURRENCY = 6;
const ATTEMPTS = 3;

export type WordAudioProgress = { done: number; total: number; failed: number };

export type WordAudioDownloadOptions = {
  onProgress?: (progress: WordAudioProgress) => void;
  shouldCancel?: () => boolean;
};

function surahDirectory(surahNumber: number, create: boolean): Directory {
  const directory = new Directory(Paths.document, WORD_AUDIO_DIRECTORY, String(surahNumber));
  if (create) {
    directory.create({ idempotent: true, intermediates: true });
  }
  return directory;
}

function wordFile(surahNumber: number, ayahNumber: number, position: number, create: boolean): File {
  return new File(surahDirectory(surahNumber, create), `${ayahNumber}-${position}.mp3`);
}

/** Stored recording of one word, or null when it was not downloaded. */
export function getOfflineWordUri(surahNumber: number, ayahNumber: number, position: number): string | null {
  try {
    const file = wordFile(surahNumber, ayahNumber, position, false);
    return file.exists ? file.uri : null;
  } catch {
    return null;
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function downloadWord(surahNumber: number, ayahNumber: number, position: number): Promise<void> {
  const file = wordFile(surahNumber, ayahNumber, position, true);
  if (file.exists) {
    return;
  }
  const temp = new File(file.parentDirectory, `${file.name}.part`);
  const url = quranContentProvider.getWordAudioUrlForPosition(surahNumber, ayahNumber, position);
  for (let attempt = 1; ; attempt += 1) {
    try {
      if (temp.exists) {
        temp.delete();
      }
      await File.downloadFileAsync(url, temp);
      await temp.move(file);
      return;
    } catch (error) {
      try {
        if (temp.exists) {
          temp.delete();
        }
      } catch {
        // Best-effort cleanup only.
      }
      if (attempt >= ATTEMPTS) {
        throw error;
      }
      await delay(400 * attempt);
    }
  }
}

/** Words of the given surahs as `[surah, ayah, position]`, in reading order. */
function wordsOf(surahNumbers: number[]): [number, number, number][] {
  const words: [number, number, number][] = [];
  for (const surahNumber of surahNumbers) {
    const ayahCount = getSurahAyahCount(surahNumber);
    for (let ayah = 1; ayah <= ayahCount; ayah += 1) {
      const count = getAyahWordCount(surahNumber, ayah);
      for (let position = 1; position <= count; position += 1) {
        words.push([surahNumber, ayah, position]);
      }
    }
  }
  return words;
}

/** Words not stored yet, so a second run only fetches what is missing. */
export function countWordsOf(surahNumbers: number[]): number {
  return wordsOf(surahNumbers).length;
}

/**
 * Stores the word-by-word pronunciation of the given surahs. A word that keeps
 * failing is counted and skipped; the rest are still fetched. Returns how many
 * failed so the caller can tell the user in plain words.
 */
export async function downloadWordAudio(
  surahNumbers: number[],
  options: WordAudioDownloadOptions = {},
): Promise<{ failed: number; cancelled: boolean }> {
  const words = wordsOf(surahNumbers);
  const total = words.length;
  let done = 0;
  let failed = 0;
  let cursor = 0;
  options.onProgress?.({ done, total, failed });

  const worker = async (): Promise<void> => {
    for (;;) {
      if (options.shouldCancel?.()) {
        return;
      }
      const index = cursor;
      cursor += 1;
      if (index >= words.length) {
        return;
      }
      const [surahNumber, ayahNumber, position] = words[index];
      try {
        await downloadWord(surahNumber, ayahNumber, position);
        done += 1;
      } catch {
        failed += 1;
      }
      if ((done + failed) % 20 === 0 || done + failed === total) {
        options.onProgress?.({ done, total, failed });
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  options.onProgress?.({ done, total, failed });
  return { failed, cancelled: options.shouldCancel?.() ?? false };
}

/** Number of stored words and their size, for the settings card. */
export function getWordAudioStats(): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  try {
    const root = new Directory(Paths.document, WORD_AUDIO_DIRECTORY);
    if (!root.exists) {
      return { files, bytes };
    }
    for (const folder of root.list()) {
      if (folder instanceof Directory) {
        for (const entry of folder.list()) {
          if (entry instanceof File && entry.name.endsWith('.mp3')) {
            files += 1;
            bytes += entry.size ?? 0;
          }
        }
      }
    }
  } catch {
    // An unreadable folder counts as empty.
  }
  return { files, bytes };
}

export function deleteWordAudio(): void {
  const root = new Directory(Paths.document, WORD_AUDIO_DIRECTORY);
  if (root.exists) {
    root.delete();
  }
}
