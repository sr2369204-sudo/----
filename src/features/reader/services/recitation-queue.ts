import {
  ContentUnavailableError,
  isFullSurahReciter,
  quranContentProvider,
  type AyahTimeSpan,
  type RecitationTrack,
} from '@/features/quran/services/content-provider';
import { BUNDLED_SURAH_DIRECTORY } from '@/features/quran/data/bundled-surah-directory';
import { getOfflineTrackFile } from '@/features/reader/services/recitation-offline';

/**
 * A user-chosen playback range. Ranges are resolved into an ordered list of
 * ayah recordings from the source reciter before playback starts.
 */
export type RecitationScope =
  | { type: 'ayah'; surahNumber: number; ayahNumber: number }
  | { type: 'ayahRange'; surahNumber: number; fromAyah: number; toAyah: number }
  | { type: 'surah'; surahNumber: number }
  | { type: 'juz'; juzNumber: number }
  | { type: 'pageRange'; fromPage: number; toPage: number };

export type RecitationQueue = {
  scope: RecitationScope;
  /** Short Arabic description of the range, shown in the mini player. */
  label: string;
  tracks: RecitationTrack[];
  /**
   * Set when the queue plays a slice of one whole-surah file: the player jumps
   * to `startMs` and stops at `endMs` (the end of the chosen ayah or ayahs).
   */
  seek?: { startMs: number; endMs: number };
};

/**
 * The part of a whole-surah recording that holds ayahs `fromAyah..toAyah`, or
 * null when the timings do not cover them.
 */
export function seekWindowFor(
  spans: AyahTimeSpan[] | null,
  fromAyah: number,
  toAyah: number,
): { startMs: number; endMs: number } | null {
  if (!spans) {
    return null;
  }
  const first = spans.find((span) => span.ayahNumber === fromAyah);
  const last = spans.find((span) => span.ayahNumber === toAyah);
  if (!first || !last || last.endMs <= first.startMs) {
    return null;
  }
  return { startMs: first.startMs, endMs: last.endMs };
}

export const AYAH_REPEAT_COUNTS = [1, 2, 3, 5, 10] as const;
export const MAX_REPEATED_PLAYLIST_TRACKS = 4096;

export function getAvailableAyahRepeatCounts(trackCount: number): number[] {
  return AYAH_REPEAT_COUNTS.filter(
    (count) => count === 1 || trackCount * count <= MAX_REPEATED_PLAYLIST_TRACKS,
  );
}

export function resolveAyahRepeatCount(
  tracks: RecitationTrack[],
  requestedCount: number,
): number {
  if (tracks.length === 0 || tracks.some((track) => track.ayahNumber <= 0)) {
    return 1;
  }
  const availableCounts = getAvailableAyahRepeatCounts(tracks.length);
  const eligibleCounts = availableCounts.filter((count) => count <= requestedCount);
  return eligibleCounts[eligibleCounts.length - 1] ?? 1;
}

export function describeRecitationScope(scope: RecitationScope): string {
  switch (scope.type) {
    case 'ayah':
      return `الآية ${scope.surahNumber}:${scope.ayahNumber}`;
    case 'ayahRange':
      return scope.fromAyah === scope.toAyah
        ? `الآية ${scope.surahNumber}:${scope.fromAyah}`
        : `الآيات ${scope.surahNumber}:${scope.fromAyah}–${scope.toAyah}`;
    case 'surah':
      return `سورة ${scope.surahNumber}`;
    case 'juz':
      return `الجزء ${scope.juzNumber}`;
    case 'pageRange':
      return scope.fromPage === scope.toPage
        ? `صفحة ${scope.fromPage}`
        : `صفحات ${scope.fromPage}–${scope.toPage}`;
  }
}

/**
 * Tracks read straight from the downloaded files, with no network call. Returns
 * null unless every wanted ayah (or, for whole-surah reciters, the surah file)
 * is stored, so a partly downloaded surah still goes through the online path.
 */
function offlineTracksFor(
  reciterId: number,
  wanted: { surahNumber: number; ayahNumber: number }[],
): RecitationTrack[] | null {
  try {
    const tracks: RecitationTrack[] = [];
    for (const item of wanted) {
      const ayahNumber = isFullSurahReciter(reciterId) ? 0 : item.ayahNumber;
      const probe = { surahNumber: item.surahNumber, ayahNumber, url: '' };
      const file = getOfflineTrackFile(reciterId, probe);
      if (!file.exists) {
        return null;
      }
      if (isFullSurahReciter(reciterId) && tracks.some((track) => track.surahNumber === item.surahNumber)) {
        continue;
      }
      tracks.push({ surahNumber: item.surahNumber, ayahNumber, url: file.uri });
    }
    return tracks;
  } catch {
    return null;
  }
}

/** Resolves an ordered ayah key list into playable recordings for one reciter. */
export async function resolveVerseKeyTracks(
  reciterId: number,
  verseKeys: string[],
): Promise<RecitationTrack[]> {
  const wanted: { surahNumber: number; ayahNumber: number }[] = [];
  const seen = new Set<string>();
  for (const verseKey of verseKeys) {
    if (seen.has(verseKey)) {
      continue;
    }
    seen.add(verseKey);
    const [rawSurah, rawAyah] = verseKey.split(':');
    wanted.push({ surahNumber: Number(rawSurah), ayahNumber: Number(rawAyah) });
  }
  if (wanted.length === 0) {
    throw new ContentUnavailableError('invalid-data', 'لا توجد آيات في النطاق المحدد.');
  }

  const stored = offlineTracksFor(reciterId, wanted);
  if (stored) {
    return stored;
  }

  const chapters = [...new Set(wanted.map((item) => item.surahNumber))];
  if (isFullSurahReciter(reciterId)) {
    const chapterTracks = await Promise.all(
      chapters.map((chapter) => quranContentProvider.getChapterRecitation(reciterId, chapter)),
    );
    return chapterTracks.flat();
  }
  const chapterTracks = await Promise.all(
    chapters.map((chapter) => quranContentProvider.getChapterRecitation(reciterId, chapter)),
  );
  const urlByVerseKey = new Map<string, string>();
  for (const track of chapterTracks.flat()) {
    urlByVerseKey.set(`${track.surahNumber}:${track.ayahNumber}`, track.url);
  }

  return wanted.map((item) => {
    const url = urlByVerseKey.get(`${item.surahNumber}:${item.ayahNumber}`);
    if (!url) {
      throw new ContentUnavailableError(
        'invalid-data',
        `لا يتوفر تسجيل صوتي للآية ${item.ayahNumber} من سورة ${item.surahNumber}.`,
      );
    }
    return { surahNumber: item.surahNumber, ayahNumber: item.ayahNumber, url };
  });
}

export type RecitationQueueOptions = {
  /**
   * Verse keys of a Mushaf page read from the pages stored on the device. When
   * given, a page range is resolved from it first, so playing the page on screen
   * needs no connection once its recitation is downloaded.
   */
  pageVerseKeys?: (pageNumber: number) => Promise<string[]>;
};

export async function buildRecitationQueue(
  reciterId: number,
  scope: RecitationScope,
  options: RecitationQueueOptions = {},
): Promise<RecitationQueue> {
  const label = describeRecitationScope(scope);

  if (scope.type === 'ayah') {
    // A downloaded surah plays with no connection: no lookup is needed.
    const stored = offlineTracksFor(reciterId, [
      { surahNumber: scope.surahNumber, ayahNumber: scope.ayahNumber },
    ]);
    if (stored) {
      return {
        scope,
        label,
        tracks: stored.map((track) => ({ ...track, ayahNumber: scope.ayahNumber })),
      };
    }
    const url = await quranContentProvider.getAyahAudioUrl(
      reciterId,
      scope.surahNumber,
      scope.ayahNumber,
    );
    return {
      scope,
      label,
      tracks: [
        { surahNumber: scope.surahNumber, ayahNumber: scope.ayahNumber, url },
      ],
    };
  }

  if (scope.type === 'surah') {
    const surah = BUNDLED_SURAH_DIRECTORY.surahs.find((entry) => entry.surahNumber === scope.surahNumber);
    const stored = surah
      ? offlineTracksFor(
          reciterId,
          Array.from({ length: isFullSurahReciter(reciterId) ? 1 : surah.ayahCount }, (_, index) => ({
            surahNumber: scope.surahNumber,
            ayahNumber: index + 1,
          })),
        )
      : null;
    if (stored) {
      return { scope, label, tracks: stored };
    }
    return {
      scope,
      label,
      tracks: await quranContentProvider.getChapterRecitation(reciterId, scope.surahNumber),
    };
  }

  if (scope.type === 'ayahRange') {
    const verseKeys: string[] = [];
    for (let ayahNumber = scope.fromAyah; ayahNumber <= scope.toAyah; ayahNumber += 1) {
      verseKeys.push(`${scope.surahNumber}:${ayahNumber}`);
    }
    return { scope, label, tracks: await resolveVerseKeyTracks(reciterId, verseKeys) };
  }

  if (scope.type === 'juz') {
    const verseKeys = await quranContentProvider.getVerseKeysForJuz(scope.juzNumber);
    return { scope, label, tracks: await resolveVerseKeyTracks(reciterId, verseKeys) };
  }

  const pages = pageSequence(scope.fromPage, scope.toPage);
  const verseKeyLists = await Promise.all(
    pages.map(async (pageNumber) => {
      if (options.pageVerseKeys) {
        try {
          const stored = await options.pageVerseKeys(pageNumber);
          if (stored.length > 0) {
            return stored;
          }
        } catch {
          // Fall through to the online lookup below.
        }
      }
      return quranContentProvider.getVerseKeysForPage(pageNumber);
    }),
  );
  return {
    scope,
    label,
    tracks: await resolveVerseKeyTracks(reciterId, verseKeyLists.flat()),
  };
}

function pageSequence(fromPage: number, toPage: number): number[] {
  if (
    !Number.isInteger(fromPage) ||
    !Number.isInteger(toPage) ||
    fromPage < 1 ||
    toPage > 604 ||
    fromPage > toPage
  ) {
    throw new RangeError('نطاق الصفحات غير صالح.');
  }
  const pages: number[] = [];
  for (let page = fromPage; page <= toPage; page += 1) {
    pages.push(page);
  }
  return pages;
}
