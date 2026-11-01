export type QuranWord = {
  id: string;
  position: number;
  textUthmani: string;
  audioUrl: string | null;
};

export type QuranAyah = {
  ayahNumber: number;
  words: QuranWord[];
  tajweedText: string;
};

export type QuranSurah = {
  surahNumber: number;
  nameArabic: string;
  revelationPlace: 'makkah' | 'madinah';
  sourceId: string;
  contentVersion: string;
  ayahCount: number;
  ayahs: QuranAyah[];
};

export type QuranSurahSummary = {
  surahNumber: number;
  nameArabic: string;
  ayahCount: number;
  revelationPlace: 'makkah' | 'madinah';
};

export type QuranSurahDirectory = {
  sourceId: string;
  contentVersion: string;
  surahs: QuranSurahSummary[];
};

export type MushafPageWord = {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  position: number;
  pageNumber: number;
  lineNumber: number;
  charType: 'word' | 'end';
  codeV2: string;
  textUthmani: string;
  audioUrl: string | null;
};

export type MushafPageLine = {
  lineNumber: number;
  words: MushafPageWord[];
};

export type MushafPage = {
  pageNumber: number;
  mushafId: 19;
  juzNumber: number;
  hizbNumber: number;
  basmalaTajweed: string | null;
  surahs: QuranSurahSummary[];
  ayahs: (QuranAyah & { surahNumber: number })[];
  lines: MushafPageLine[];
};
