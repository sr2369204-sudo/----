const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

/** Arabic-Indic digits, matching the numerals used across the app. */
function toArabicDigits(value: number): string {
  return String(Math.round(value)).replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)]);
}

/** `mm:ss` length of a recording. */
export function formatRecordingDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const seconds = toArabicDigits(totalSeconds % 60).padStart(2, '٠');
  return `${toArabicDigits(Math.floor(totalSeconds / 60))}:${seconds}`;
}

/**
 * How many takes are on file, with the Arabic grammar the app uses elsewhere:
 * «تسجيل واحد», «تسجيلان», «٥ تسجيلات» up to ten, «١٢ تسجيل» above that.
 */
export function formatRecordingCount(count: number): string {
  if (count === 1) {
    return 'تسجيل واحد';
  }
  if (count === 2) {
    return 'تسجيلان';
  }
  const digits = toArabicDigits(count);
  return count >= 3 && count <= 10 ? `${digits} تسجيلات` : `${digits} تسجيل`;
}

/** Compact stamp such as `٩/١١/٢٠٢٦ · ٣:٤٥ م`, so takes read apart at a glance. */
export function formatRecordingStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const day = toArabicDigits(date.getDate());
  const month = toArabicDigits(date.getMonth() + 1);
  const year = toArabicDigits(date.getFullYear());
  const minutes = toArabicDigits(date.getMinutes()).padStart(2, '٠');
  const hour24 = date.getHours();
  const period = hour24 < 12 ? 'ص' : 'م';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${day}/${month}/${year} · ${toArabicDigits(hour12)}:${minutes} ${period}`;
}
