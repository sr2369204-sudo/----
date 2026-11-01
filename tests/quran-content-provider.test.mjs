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
    revelation_place: 'makkah',
  },
};

const syntheticVerses = {
  verses: [
    {
      verse_number: 1,
      text_uthmani_tajweed: 'SYNTHETIC_TEST_TOKEN <span class=end>١</span>',
      words: [
        {
          id: 1,
          position: 1,
          char_type_name: 'word',
          text_uthmani: 'SYNTHETIC_TEST_TOKEN',
          audio_url: 'wbw/001_001_001.mp3',
        },
        {
          id: 2,
          position: 2,
          char_type_name: 'end',
          text_uthmani: '١',
          audio_url: null,
        },
      ],
    },
  ],
  pagination: { total_records: 1 },
};

const syntheticPageChapter = {
  chapter: {
    ...syntheticChapter.chapter,
    verses_count: 7,
  },
};

const syntheticPageVerses = {
  verses: Array.from({ length: 7 }, (_, index) => {
    const ayahNumber = index + 1;
    const lineNumber = index + 2;
    return {
      verse_number: ayahNumber,
      verse_key: `1:${ayahNumber}`,
      page_number: 1,
      text_uthmani_tajweed:
        `SYNTHETIC_TEST_TOKEN_${ayahNumber} <span class=end>${String.fromCharCode(0x0660 + ayahNumber)}</span>`,
      words: [
        {
          id: ayahNumber * 2 - 1,
          position: 1,
          char_type_name: 'word',
          page_number: 1,
          line_number: lineNumber,
          code_v2: `SYNTHETIC_GLYPH_${ayahNumber}`,
          text_uthmani: `SYNTHETIC_TEST_TOKEN_${ayahNumber}`,
          audio_url: `wbw/001_001_00${ayahNumber}.mp3`,
        },
        {
          id: ayahNumber * 2,
          position: 2,
          char_type_name: 'end',
          page_number: 1,
          line_number: lineNumber,
          code_v2: `SYNTHETIC_END_${ayahNumber}`,
          text_uthmani: String(ayahNumber),
          audio_url: null,
        },
      ],
    };
  }),
  pagination: { total_records: 7 },
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
          revelation_place: index % 2 === 0 ? 'makkah' : 'madinah',
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
  assert.equal(directory.surahs[0].ayahCount, 1);
  assert.equal(directory.surahs[0].revelationPlace, 'makkah');
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
  assert.equal(surah.ayahs[0].words[0].audioUrl, 'wbw/001_001_001.mp3');
  assert.equal(surah.ayahs[0].tajweedText, 'SYNTHETIC_TEST_TOKEN <span class=end>١</span>');
});

test('loads QCF Tajweed page one as source-ordered lines and words', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    const body = String(url).includes('/chapters/1?')
      ? syntheticPageChapter
      : syntheticPageVerses;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const page = await new QuranComContentProvider().getMushafPage(1);

  assert.equal(requestedUrls.length, 2);
  assert.ok(requestedUrls.some((url) => url.includes('/verses/by_page/1?language=ar&mushaf=19')));
  assert.equal(page.mushafId, 19);
  assert.equal(page.pageNumber, 1);
  assert.equal(page.surah.ayahs.length, 7);
  assert.deepEqual(page.lines.map((line) => line.lineNumber), [2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(
    page.lines.map((line) => line.words.map((word) => word.ayahNumber)),
    [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]],
  );
  assert.equal(page.lines[0].words[0].codeV2, 'SYNTHETIC_GLYPH_1');
  assert.equal(page.surah.ayahs[0].words[0].audioUrl, 'wbw/001_001_001.mp3');
});

test('resolves source-backed ayah audio URLs and reciter metadata', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    const body = String(url).includes('/resources/chapter_reciters')
      ? {
          reciters: [
            {
              id: 7,
              name: 'Mishari Rashid al-`Afasy',
              style: { name: 'Murattal' },
            },
          ],
        }
      : {
          audio_files: [{ verse_key: '1:1', url: 'Alafasy/mp3/001001.mp3' }],
        };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const provider = new QuranComContentProvider();
  const audioUrl = await provider.getAyahAudioUrl(7, 1, 1);
  const reciters = await provider.getReciters();

  assert.equal(audioUrl, 'https://verses.quran.com/Alafasy/mp3/001001.mp3');
  assert.deepEqual(reciters, [{ id: 7, name: 'Mishari Rashid al-`Afasy', style: 'Murattal' }]);
  assert.ok(requestedUrls.some((url) => url.endsWith('/recitations/7/by_ayah/1:1')));
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
