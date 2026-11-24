import { Directory, File, Paths } from 'expo-file-system';

import type { RecitationTrack } from '@/features/quran/services/content-provider';
import {
  isFullSurahReciter,
  quranContentProvider,
} from '@/features/quran/services/content-provider';
import type { QuranSurahSummary } from '@/features/quran/types';

const RECITATION_DIRECTORY = 'recitations';

export type RecitationDownloadProgress = {
  done: number;
  total: number;
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

export async function downloadRecitationSurahs(
  reciterId: number,
  surahNumbers: number[],
  onProgress?: (progress: RecitationDownloadProgress) => void,
): Promise<void> {
  const total = await Promise.all(
    surahNumbers.map(async (surahNumber) => {
      const tracks = await quranContentProvider.getChapterRecitation(reciterId, surahNumber);
      return tracks.length;
    }),
  ).then((counts) => counts.reduce((sum, count) => sum + count, 0));
  let done = 0;
  onProgress?.({ done, total });

  for (const surahNumber of surahNumbers) {
    const tracks = await quranContentProvider.getChapterRecitation(reciterId, surahNumber);
    for (const track of tracks) {
      const file = getOfflineTrackFile(reciterId, track);
      if (!file.exists) {
        // Download to a temporary .part file first, so an interrupted download
        // never looks like a completed track.
        const tempFile = new File(file.parentDirectory, `${file.name}.part`);
        try {
          await File.downloadFileAsync(track.url, tempFile);
          await tempFile.move(file);
        } catch (error) {
          try {
            tempFile.delete();
          } catch {
            // Best-effort cleanup only.
          }
          throw error;
        }
      }
      done += 1;
      onProgress?.({ done, total });
    }
  }
}

export async function getRecitationSurahStatuses(
  reciterId: number,
  surahs: QuranSurahSummary[],
): Promise<Record<number, boolean>> {
  const statuses: Record<number, boolean> = {};
  for (const surah of surahs) {
    if (isFullSurahReciter(reciterId)) {
      statuses[surah.surahNumber] = getOfflineTrackFile(reciterId, {
        surahNumber: surah.surahNumber,
        ayahNumber: 0,
        url: '',
      }).exists;
      continue;
    }
    let complete = true;
    for (let ayahNumber = 1; ayahNumber <= surah.ayahCount; ayahNumber += 1) {
      if (!getOfflineTrackFile(reciterId, { surahNumber: surah.surahNumber, ayahNumber, url: '' }).exists) {
        complete = false;
        break;
      }
    }
    statuses[surah.surahNumber] = complete;
  }
  return statuses;
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
