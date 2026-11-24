const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toArabicNumbers(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

/** Bytes as megabytes with at most one decimal, in Arabic digits. */
export function formatMegabytes(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  const rounded = megabytes >= 10 ? Math.round(megabytes) : Math.round(megabytes * 10) / 10;
  return toArabicNumbers(String(rounded).replace('.', '٫'));
}
