import { toArabicNumbers } from '@/features/home/utils/format';
import { SURAH_END_PAGES, SURAH_START_PAGES } from '@/features/khatma/data/surah-start-pages';
import { khatmaTotal, MUSHAF_PAGES, type Khatma } from '@/features/khatma/services/khatma';
import { BUNDLED_SURAH_DIRECTORY } from '@/features/quran/data/bundled-surah-directory';

function surahName(number: number): string {
  return BUNDLED_SURAH_DIRECTORY.surahs[number - 1]?.nameArabic ?? '';
}

/** The surah that starts on `page`, if any (the last one when two start on the same page). */
function surahStartingOn(page: number): number | null {
  const index = SURAH_START_PAGES.lastIndexOf(page);
  return index === -1 ? null : index + 1;
}

function surahEndingOn(page: number): number | null {
  const index = SURAH_END_PAGES.indexOf(page);
  return index === -1 ? null : index + 1;
}

/** A short Arabic description of the khatma's range, e.g. "من سورة البقرة إلى سورة الناس". */
export function khatmaRangeLabel(khatma: Pick<Khatma, 'startPage' | 'endPage'>): string {
  const { startPage, endPage } = khatma;
  const startSurah = surahStartingOn(startPage);
  const total = khatmaTotal(khatma);
  if (total === MUSHAF_PAGES) {
    return startPage === 1
      ? 'المصحف كله'
      : `المصحف كله من ${startSurah ? `سورة ${surahName(startSurah)}` : `صفحة ${toArabicNumbers(startPage)}`}`;
  }
  const endSurah = surahEndingOn(endPage);
  if (startSurah && endSurah && startSurah === endSurah) {
    return `سورة ${surahName(startSurah)}`;
  }
  const from = startSurah ? `سورة ${surahName(startSurah)}` : `صفحة ${toArabicNumbers(startPage)}`;
  const to = endSurah ? `سورة ${surahName(endSurah)}` : `صفحة ${toArabicNumbers(endPage)}`;
  return `من ${from} إلى ${to}`;
}
