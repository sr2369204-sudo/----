import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ContentUnavailableError,
  QuranComContentProvider,
} from '../src/features/quran/services/content-provider.ts';

const syntheticChapter = {
  chapter: {
    id: 1,
    name_arabic: 'اسم اختباري اصطناعي',
    verses_count: 1,
  },
};

const syntheticVerses = {
  verses: [
    {
      verse_number: 1,
      words: [
        {
          id: 1,
          position: 1,
          char_type_name: 'word',
          text_uthmani: 'SYNTHETIC_TEST_TOKEN',
        },
        {
          id: 2,
          position: 2,
          char_type_name: 'end',
          text_uthmani: '١',
        },
      ],
    },
  ],
  pagination: { total_records: 1 },
};

function mockFetch(t, handler) {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = handler;
}

test('loads and validates the complete Arabic surah directory without app credentials', async (t) => {
  mockFetch(t, async (url) => {
    assert.equal(String(url), 'https://api.quran.com/api/v4/chapters?language=ar');
    return new Response(
      JSON.stringify({
        chapters: Array.from({ length: 114 }, (_, index) => ({
          id: index + 1,
          name_arabic: `سورة ${index + 1}`,
          verses_count: 1,
        })),
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  });

  const directory = await new QuranComContentProvider().getSurahDirectory();

  assert.equal(directory.sourceId, 'quran-com-api');
  assert.equal(directory.contentVersion, 'api-v4');
  assert.equal(directory.surahs.length, 114);
  assert.equal(directory.surahs[0].surahNumber, 1);
  assert.equal(directory.surahs[113].surahNumber, 114);
});

test('normalizes Uthmani words and excludes verse-end markers', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    const body = String(url).includes('/chapters/1?') ? syntheticChapter : syntheticVerses;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const surah = await new QuranComContentProvider().getSurah(1);

  assert.equal(requestedUrls.length, 2);
  assert.ok(requestedUrls.some((url) => url.includes('/verses/by_chapter/1?')));
  assert.equal(surah.sourceId, 'quran-com-api');
  assert.equal(surah.contentVersion, 'api-v4');
  assert.equal(surah.ayahs[0].words.length, 1);
  assert.equal(surah.ayahs[0].words[0].id, '1');
  assert.equal(surah.ayahs[0].words[0].textUthmani, 'SYNTHETIC_TEST_TOKEN');
});

test('rejects incomplete ayah responses instead of displaying partial content', async (t) => {
  mockFetch(t, async (url) => {
    const body = String(url).includes('/chapters/1?')
      ? { chapter: { ...syntheticChapter.chapter, verses_count: 2 } }
      : syntheticVerses;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  await assert.rejects(new QuranComContentProvider().getSurah(1), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'invalid-data');
    return true;
  });
});

test('reports network errors from the public content API', async (t) => {
  mockFetch(t, async () => {
    throw new Error('offline');
  });

  await assert.rejects(new QuranComContentProvider().getSurahDirectory(), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'network');
    assert.equal(error.message, 'offline');
    return true;
  });
});
