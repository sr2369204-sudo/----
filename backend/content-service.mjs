export const SOURCE_ID = 'quran-foundation-content-api';
export const SOURCE_VERSION = 'api-v4';

export async function listSurahs(client, environment) {
  const chapters = await client.content.v4.chapters.list({ language: 'ar' });
  if (!Array.isArray(chapters) || chapters.length === 0) {
    throw new Error('Quran Foundation returned an empty chapter directory.');
  }

  const availableChapters = environment === 'prelive'
    ? chapters.filter((chapter) => chapter.id === 1 || chapter.id === 2)
    : chapters;
  const seen = new Set();
  const surahs = availableChapters.map((chapter) => {
    if (
      !Number.isInteger(chapter.id) ||
      chapter.id < 1 ||
      chapter.id > 114 ||
      seen.has(chapter.id) ||
      typeof chapter.nameArabic !== 'string' ||
      chapter.nameArabic.trim().length === 0 ||
      !Number.isInteger(chapter.versesCount) ||
      chapter.versesCount < 1
    ) {
      throw new Error('Quran Foundation returned invalid chapter metadata.');
    }

    seen.add(chapter.id);
    return {
      surahNumber: chapter.id,
      nameArabic: chapter.nameArabic,
    };
  });

  return surahs.sort((left, right) => left.surahNumber - right.surahNumber);
}

export async function getSurah(client, environment, surahNumber) {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return null;
  }
  if (environment === 'prelive' && surahNumber > 2) {
    return null;
  }

  const [chapter, verses] = await Promise.all([
    client.content.v4.chapters.get(String(surahNumber), { language: 'ar' }),
    client.content.v4.verses.byChapter(String(surahNumber), {
      language: 'ar',
      words: true,
      wordFields: { textUthmani: true },
      perPage: 300,
    }),
  ]);

  if (
    chapter.id !== surahNumber ||
    typeof chapter.nameArabic !== 'string' ||
    chapter.nameArabic.trim().length === 0 ||
    !Number.isInteger(chapter.versesCount) ||
    !Array.isArray(verses) ||
    verses.length !== chapter.versesCount
  ) {
    throw new Error('Quran Foundation returned incomplete or mismatched chapter content.');
  }

  const seenWordIds = new Set();
  let expectedAyahNumber = 1;
  const ayahs = verses.map((verse) => {
    if (
      verse.verseNumber !== expectedAyahNumber ||
      verse.chapterId !== undefined && Number(verse.chapterId) !== surahNumber ||
      !Array.isArray(verse.words)
    ) {
      throw new Error('Quran Foundation returned a missing or invalid ayah.');
    }
    expectedAyahNumber += 1;

    let expectedWordPosition = 1;
    const words = verse.words
      .filter((word) => word.charTypeName === 'word')
      .map((word) => {
        if (
          !Number.isInteger(word.id) ||
          word.id < 1 ||
          seenWordIds.has(word.id) ||
          word.position !== expectedWordPosition ||
          typeof word.textUthmani !== 'string' ||
          word.textUthmani.length === 0
        ) {
          throw new Error('Quran Foundation returned an invalid or incomplete word.');
        }

        seenWordIds.add(word.id);
        expectedWordPosition += 1;
        return {
          id: String(word.id),
          position: word.position,
          textUthmani: word.textUthmani,
        };
      });

    if (words.length === 0) {
      throw new Error('Quran Foundation returned an ayah without word-level Uthmani text.');
    }

    return { ayahNumber: verse.verseNumber, words };
  });

  return {
    sourceId: SOURCE_ID,
    contentVersion: SOURCE_VERSION,
    textScript: 'uthmani',
    narration: 'hafs-an-asim',
    surahNumber,
    nameArabic: chapter.nameArabic,
    ayahCount: chapter.versesCount,
    ayahs,
  };
}
