import type { QuranSurahSummary } from '../../quran/types';

export type AyahSearchReference = {
  surahNumber: number;
  ayahNumber: number;
};

export function resolveAyahSearchReference(
  query: string,
  surahs: QuranSurahSummary[],
  normalize: (value: string) => string,
): AyahSearchReference | null {
  const normalized = normalize(query).replace(/\s+/g, ' ').trim();
  const referenceMatch = /^(.+?)\s*[:：/]\s*(\d+)$/.exec(normalized)
    ?? /^(.+?)\s+(\d+)$/.exec(normalized);

  if (!referenceMatch) {
    return null;
  }

  const surahIdentifier = referenceMatch[1].replace(/^سورة\s+/, '').trim();
  const surahNumber = /^\d+$/.test(surahIdentifier)
    ? Number(surahIdentifier)
    : surahs.find(
        (surah) => normalize(surah.nameArabic) === surahIdentifier,
      )?.surahNumber;
  const ayahNumber = Number(referenceMatch[2]);

  if (
    surahNumber === undefined ||
    surahNumber < 1 ||
    surahNumber > 114 ||
    ayahNumber < 1
  ) {
    return null;
  }

  return { surahNumber, ayahNumber };
}
