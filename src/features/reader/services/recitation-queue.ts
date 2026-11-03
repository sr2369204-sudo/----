import {
  ContentUnavailableError,
  quranContentProvider,
  type RecitationTrack,
} from '@/features/quran/services/content-provider';

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
};

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

  const chapters = [...new Set(wanted.map((item) => item.surahNumber))];
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

export async function buildRecitationQueue(
  reciterId: number,
  scope: RecitationScope,
): Promise<RecitationQueue> {
  const label = describeRecitationScope(scope);

  if (scope.type === 'ayah') {
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
    pages.map((pageNumber) => quranContentProvider.getVerseKeysForPage(pageNumber)),
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
