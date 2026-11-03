const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

/** Renders Latin digits with Arabic-Indic shapes so the UI reads naturally. */
export function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)]);
}

/**
 * Verse count with the Arabic grammar the Mushaf uses: «آية واحدة», «آيتان»,
 * «٧ آيات» for three to ten, and «٢٨٦ آية» above that.
 */
export function formatAyahCount(count: number): string {
  if (count === 1) {
    return 'آية واحدة';
  }
  if (count === 2) {
    return 'آيتان';
  }
  const digits = toArabicNumbers(count);
  return count >= 3 && count <= 10 ? `${digits} آيات` : `${digits} آية`;
}
