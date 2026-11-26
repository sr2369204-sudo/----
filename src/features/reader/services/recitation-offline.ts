import { Directory, File, Paths } from 'expo-file-system';

import { friendlyError, NETWORK_ERROR_MESSAGE } from '@/features/errors/friendly-error';
import type { AyahTimeSpan, RecitationTrack } from '@/features/quran/services/content-provider';
import {
  ContentUnavailableError,
  isFullSurahReciter,
  quranContentProvider,
} from '@/features/quran/services/content-provider';
import type { QuranSurahSummary } from '@/features/quran/types';

const RECITATION_DIRECTORY = 'recitations';

export type RecitationDownloadProgress = {
  done: number;
  total: number;
};

/** Live state of one surah while a download runs. */
export type SurahDownloadState = {
  done: number;
  total: number;
  failed: number;
};

function getDirectory(reciterId: number): Directory {
  const directory = new Directory(Paths.document, RECITATION_DIRECTORY, String(reciterId));
  directory.create({ idempotent: true, intermediates: true });
  return directory;
}

export function getOfflineTrackFile(reciterId: number, track: RecitationTrack): File {
  return new File(
    getDirectory(reciterId),
    `${track.surahNumber}-${track.ayahNumber}.mp3`,
  );
}

export function getOfflineTrackUri(reciterId: number, track: RecitationTrack): string | null {
  const file = getOfflineTrackFile(reciterId, track);
  return file.exists ? file.uri : null;
}

function getTimingFile(reciterId: number, surahNumber: number): File {
  return new File(getDirectory(reciterId), `${surahNumber}-0.timing.json`);
}

function readStoredAyahTimings(reciterId: number, surahNumber: number): AyahTimeSpan[] | null {
  try {
    const file = getTimingFile(reciterId, surahNumber);
    if (!file.exists) {
      return null;
    }
    const parsed: unknown = JSON.parse(file.textSync());
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as AyahTimeSpan[]) : null;
  } catch {
    return null;
  }
}

function storeAyahTimings(reciterId: number, surahNumber: number, spans: AyahTimeSpan[]): void {
  try {
    const file = getTimingFile(reciterId, surahNumber);
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(spans));
  } catch {
    // The timings are re-fetched next time; nothing else depends on the copy.
  }
}

/**
 * Ayah spans of a whole-surah recording: the copy stored next to a downloaded
 * surah first, so the highlight works offline, then the source. Null when the
 * reciter has no timing data.
 */
export async function loadFullSurahAyahTimings(
  reciterId: number,
  surahNumber: number,
): Promise<AyahTimeSpan[] | null> {
  const stored = readStoredAyahTimings(reciterId, surahNumber);
  if (stored) {
    return stored;
  }
  const spans = await quranContentProvider.getFullSurahAyahTimings(reciterId, surahNumber);
  if (spans && getOfflineTrackFile(reciterId, { surahNumber, ayahNumber: 0, url: '' }).exists) {
    storeAyahTimings(reciterId, surahNumber, spans);
  }
  return spans;
}

/** Tracks are fetched this many at a time: faster, without flooding the source. */
const TRACK_CONCURRENCY = 3;
const TRACK_ATTEMPTS = 3;
const TRACK_RETRY_BACKOFF_MS = 600;

export type RecitationDownloadOptions = {
  onProgress?: (progress: RecitationDownloadProgress) => void;
  /** Reports the per-surah counts every time a track finishes or fails. */
  onSurahProgress?: (states: Record<number, SurahDownloadState>) => void;
  /** Checked between tracks; returning true stops the download cleanly. */
  shouldCancel?: () => boolean;
};

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function downloadTrack(reciterId: number, track: RecitationTrack): Promise<void> {
  const file = getOfflineTrackFile(reciterId, track);
  if (file.exists) {
    return;
  }
  // Download to a temporary .part file first, so an interrupted download
  // never looks like a completed track.
  const tempFile = new File(file.parentDirectory, `${file.name}.part`);
  for (let attempt = 1; ; attempt += 1) {
    try {
      if (tempFile.exists) {
        tempFile.delete();
      }
      await File.downloadFileAsync(track.url, tempFile);
      await tempFile.move(file);
      return;
    } catch (error) {
      try {
        if (tempFile.exists) {
          tempFile.delete();
        }
      } catch {
        // Best-effort cleanup only.
      }
      if (attempt >= TRACK_ATTEMPTS) {
        throw error;
      }
      await delay(TRACK_RETRY_BACKOFF_MS * attempt);
    }
  }
}

/**
 * Stores the recitation of the given surahs. A track that keeps failing no
 * longer stops the whole download: the rest are still fetched and the failure
 * is reported at the end. Surahs the reciter never recorded are skipped and
 * reported the same way instead of aborting the selection. Tracks that were
 * stored stay stored, so running it again only fetches what is missing.
 */
export async function downloadRecitationSurahs(
  reciterId: number,
  surahNumbers: number[],
  optionsOrProgress?: RecitationDownloadOptions | ((progress: RecitationDownloadProgress) => void),
): Promise<{ failed: number; cancelled: boolean }> {
  const options: RecitationDownloadOptions =
    typeof optionsOrProgress === 'function' ? { onProgress: optionsOrProgress } : optionsOrProgress ?? {};
  const tracks: RecitationTrack[] = [];
  const surahStates: Record<number, SurahDownloadState> = {};
  for (const surahNumber of surahNumbers) {
    surahStates[surahNumber] = { done: 0, total: 0, failed: 0 };
  }
  // A surah the reciter never recorded is skipped, not fatal: one missing
  // surah must not stop the rest of the selection from downloading.
  const unavailableSurahs: number[] = [];
  for (const surahNumber of surahNumbers) {
    if (options.shouldCancel?.()) {
      return { failed: 0, cancelled: true };
    }
    try {
      tracks.push(...(await quranContentProvider.getChapterRecitation(reciterId, surahNumber)));
    } catch (error) {
      if (error instanceof ContentUnavailableError && error.reason === 'invalid-data') {
        unavailableSurahs.push(surahNumber);
        surahStates[surahNumber] = { done: 0, total: 0, failed: 1 };
      } else {
        throw error;
      }
    }
  }
  const total = tracks.length;
  for (const track of tracks) {
    surahStates[track.surahNumber].total += 1;
  }
  const emitSurahs = (): void => {
    const copy: Record<number, SurahDownloadState> = {};
    for (const key of Object.keys(surahStates)) {
      copy[Number(key)] = { ...surahStates[Number(key)] };
    }
    options.onSurahProgress?.(copy);
  };
  let done = 0;
  let failed = 0;
  let cursor = 0;
  let firstError: unknown = null;
  options.onProgress?.({ done, total });
  emitSurahs();

  const worker = async (): Promise<void> => {
    for (;;) {
      if (options.shouldCancel?.()) {
        return;
      }
      const index = cursor;
      cursor += 1;
      if (index >= tracks.length) {
        return;
      }
      try {
        await downloadTrack(reciterId, tracks[index]);
        if (isFullSurahReciter(reciterId)) {
          // Keep the ayah timings with the file so the highlight works offline.
          await loadFullSurahAyahTimings(reciterId, tracks[index].surahNumber).catch(() => null);
        }
        done += 1;
        surahStates[tracks[index].surahNumber].done += 1;
        options.onProgress?.({ done, total });
        emitSurahs();
      } catch (error) {
        failed += 1;
        surahStates[tracks[index].surahNumber].failed += 1;
        emitSurahs();
        firstError ??= error;
      }
    }
  };
  await Promise.all(Array.from({ length: TRACK_CONCURRENCY }, worker));

  const cancelled = options.shouldCancel?.() ?? false;
  if ((failed > 0 || unavailableSurahs.length > 0) && !cancelled) {
    const problems: string[] = [];
    if (failed > 0) {
      problems.push(
        friendlyError(firstError, '') === NETWORK_ERROR_MESSAGE
          ? `${NETWORK_ERROR_MESSAGE} تعذر تحميل ${failed} مقطع، أعد المحاولة لاستكمال الباقي.`
          : `تعذر تحميل ${failed} مقطع. أعد المحاولة لاستكمال الباقي.`,
      );
    }
    if (unavailableSurahs.length > 0) {
      problems.push(
        unavailableSurahs.length === 1
          ? 'سورة واحدة غير متوفرة بصوت هذا القارئ؛ اختر قارئًا آخر لتحميلها.'
          : `${unavailableSurahs.length} سور غير متوفرة بصوت هذا القارئ؛ اختر قارئًا آخر لتحميلها.`,
      );
    }
    throw new Error(problems.join(' '));
  }
  return { failed: failed + unavailableSurahs.length, cancelled };
}

function listStoredNames(reciterId: number): Set<string> {
  const names = new Set<string>();
  try {
    for (const entry of getDirectory(reciterId).list()) {
      if (entry instanceof File) {
        names.add(entry.name);
      }
    }
  } catch {
    // An unreadable folder simply counts as empty.
  }
  return names;
}

export async function getRecitationSurahStatuses(
  reciterId: number,
  surahs: QuranSurahSummary[],
): Promise<Record<number, boolean>> {
  // One folder listing replaces thousands of per-track existence checks.
  const names = listStoredNames(reciterId);
  const statuses: Record<number, boolean> = {};
  for (const surah of surahs) {
    if (isFullSurahReciter(reciterId)) {
      statuses[surah.surahNumber] = names.has(`${surah.surahNumber}-0.mp3`);
      continue;
    }
    let complete = true;
    for (let ayahNumber = 1; ayahNumber <= surah.ayahCount; ayahNumber += 1) {
      if (!names.has(`${surah.surahNumber}-${ayahNumber}.mp3`)) {
        complete = false;
        break;
      }
    }
    statuses[surah.surahNumber] = complete;
  }
  return statuses;
}

/** Bytes the stored recitation of one reciter occupies on the device. */
export function getRecitationStoredBytes(reciterId: number): number {
  let bytes = 0;
  try {
    for (const entry of getDirectory(reciterId).list()) {
      if (entry instanceof File && entry.name.endsWith('.mp3')) {
        bytes += entry.size ?? 0;
      }
    }
  } catch {
    // Unreadable folder counts as empty.
  }
  return bytes;
}

/** Removes every stored track of one reciter. Nothing else is affected. */
export function deleteRecitations(reciterId: number): void {
  try {
    for (const entry of getDirectory(reciterId).list()) {
      if (entry instanceof File) {
        entry.delete();
      }
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('تعذر حذف التلاوات المحمّلة.');
  }
}

export function resolveOfflineTracks(
  reciterId: number,
  tracks: RecitationTrack[],
): RecitationTrack[] {
  return tracks.map((track) => ({
    ...track,
    url: getOfflineTrackUri(reciterId, track) ?? track.url,
  }));
}
