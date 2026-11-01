export type QuranWord = {
  id: string;
  position: number;
  textUthmani: string;
};

export type QuranAyah = {
  ayahNumber: number;
  words: QuranWord[];
};

export type QuranSurah = {
  surahNumber: number;
  nameArabic: string;
  sourceId: string;
  contentVersion: string;
  ayahCount: number;
  ayahs: QuranAyah[];
};

export type QuranSurahSummary = {
  surahNumber: number;
  nameArabic: string;
};

export type QuranSurahDirectory = {
  sourceId: string;
  contentVersion: string;
  surahs: QuranSurahSummary[];
};
