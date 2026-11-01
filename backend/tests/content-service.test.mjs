import assert from 'node:assert/strict';
import test from 'node:test';

import { getSurah, listSurahs, SOURCE_ID, SOURCE_VERSION } from '../content-service.mjs';

function makeClient(chapters, verses) {
  const calls = [];
  return {
    calls,
    content: {
      v4: {
        chapters: {
          list: async (options) => {
            calls.push(['chapters.list', options]);
            return chapters;
          },
          get: async (id, options) => {
            calls.push(['chapters.get', id, options]);
            return chapters.find((chapter) => String(chapter.id) === id);
          },
        },
        verses: {
          byChapter: async (id, options) => {
            calls.push(['verses.byChapter', id, options]);
            return verses;
          },
        },
      },
    },
  };
}

const syntheticChapters = [
  { id: 1, nameArabic: 'اسم اختباري ١', versesCount: 1 },
  { id: 2, nameArabic: 'اسم اختباري ٢', versesCount: 1 },
  { id: 3, nameArabic: 'اسم اختباري ٣', versesCount: 1 },
];

const syntheticVerses = [
  {
    verseNumber: 1,
    chapterId: 1,
    words: [
      {
        id: 11,
        position: 1,
        charTypeName: 'word',
        textUthmani: 'SYNTHETIC_TEST_TOKEN',
      },
    ],
  },
];

test('limits the pre-live directory to the two surahs documented as available', async () => {
  const client = makeClient(syntheticChapters, syntheticVerses);

  const directory = await listSurahs(client, 'prelive');

  assert.deepEqual(
    directory.map((surah) => surah.surahNumber),
    [1, 2],
  );
  assert.deepEqual(client.calls, [['chapters.list', { language: 'ar' }]]);
});

test('uses the official SDK word and Uthmani fields and normalizes verified source metadata', async () => {
  const client = makeClient(syntheticChapters, syntheticVerses);

  const surah = await getSurah(client, 'prelive', 1);

  assert.equal(surah.sourceId, SOURCE_ID);
  assert.equal(surah.contentVersion, SOURCE_VERSION);
  assert.equal(surah.ayahCount, 1);
  assert.deepEqual(surah.ayahs[0].words, [
    { id: '11', position: 1, textUthmani: 'SYNTHETIC_TEST_TOKEN' },
  ]);
  assert.deepEqual(client.calls[1], [
    'verses.byChapter',
    '1',
    {
      language: 'ar',
      words: true,
      wordFields: { textUthmani: true },
      perPage: 300,
    },
  ]);
});

test('rejects incomplete source responses instead of returning partial verses', async () => {
  const client = makeClient(syntheticChapters, []);

  await assert.rejects(getSurah(client, 'prelive', 1), /incomplete or mismatched chapter content/);
});

test('does not request pre-live content for chapters outside its documented dataset', async () => {
  const client = makeClient(syntheticChapters, syntheticVerses);

  assert.equal(await getSurah(client, 'prelive', 3), null);
  assert.deepEqual(client.calls, []);
});
