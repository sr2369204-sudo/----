const arabicMarks = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const arabicLetters = /[أإآٱى]/g;
const arabicDigits = /[٠-٩۰-۹]/g;

export function normalizeSurahSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(arabicMarks, '')
    .replace(arabicLetters, (letter) => {
      if (letter === 'ى') {
        return 'ي';
      }
      return 'ا';
    })
    .replace(arabicDigits, (digit) => {
      const codePoint = digit.codePointAt(0) ?? 0;
      const zero = codePoint >= 0x06f0 ? 0x06f0 : 0x0660;
      return String(codePoint - zero);
    })
    .trim();
}
