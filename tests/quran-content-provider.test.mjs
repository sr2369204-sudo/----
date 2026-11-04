import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ContentUnavailableError,
  QuranComContentProvider,
} from '../src/features/quran/services/content-provider.ts';
import { getReciterPortrait } from '../src/features/quran/services/reciter-portraits.ts';

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
          translation: { text: 'SYNTHETIC_TRANSLATION' },
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

const syntheticPageVerses = {
  verses: Array.from({ length: 7 }, (_, index) => {
    const ayahNumber = index + 1;
    const lineNumber = index + 2;
    return {
      verse_number: ayahNumber,
      verse_key: `1:${ayahNumber}`,
      page_number: 1,
      juz_number: 1,
      hizb_number: 1,
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
          audio_url: '',
        },
      ],
    };
  }),
  pagination: { total_records: 7 },
};

const syntheticSurahDirectory = {
  chapters: Array.from({ length: 114 }, (_, index) => ({
    id: index + 1,
    name_arabic: `سورة ${index + 1}`,
    verses_count: index === 0 ? 7 : 1,
    revelation_place: index % 2 === 0 ? 'makkah' : 'madinah',
  })),
};

function mockFetch(t, handler) {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = handler;
}

test('uses verified source portraits and leaves unknown reciters without a photo', () => {
  const husaryPortrait = getReciterPortrait(6);
  const saudPortrait = getReciterPortrait(10);

  assert.ok(husaryPortrait);
  assert.match(husaryPortrait.imageUrl, /Hussary\.jpg/);
  assert.equal(husaryPortrait.license, 'Public domain');
  assert.equal(getReciterPortrait(12)?.sourceUrl, husaryPortrait.sourceUrl);
  assert.ok(saudPortrait);
  assert.equal(saudPortrait.license, 'CC0');
  assert.equal(getReciterPortrait(7), undefined);
  assert.equal(getReciterPortrait(4), undefined);
});

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
  assert.equal(surah.ayahs[0].words[0].translationText, 'SYNTHETIC_TRANSLATION');
  assert.equal(surah.ayahs[0].tajweedText, 'SYNTHETIC_TEST_TOKEN <span class=end>١</span>');
});

test('loads QCF Tajweed page one as source-ordered lines and words', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    const body = String(url).includes('/chapters?')
      ? syntheticSurahDirectory
      : syntheticPageVerses;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const page = await new QuranComContentProvider().getMushafPage(1);

  assert.equal(requestedUrls.length, 2);
  assert.ok(requestedUrls.some((url) => url.includes('/verses/by_page/1?language=ar&mushaf=19')));
  assert.ok(
    requestedUrls.some((url) =>
      url.startsWith('https://api.qurancdn.com/api/qdc/verses/by_page/1?'),
    ),
  );
  assert.ok(requestedUrls.some((url) => url.endsWith('/chapters?language=ar')));
  assert.equal(page.mushafId, 19);
  assert.equal(page.pageNumber, 1);
  assert.deepEqual(page.surahs.map((surah) => surah.surahNumber), [1]);
  assert.equal(page.ayahs.length, 7);
  assert.deepEqual(page.lines.map((line) => line.lineNumber), [2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(
    page.lines.map((line) => line.words.map((word) => word.ayahNumber)),
    [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]],
  );
  assert.equal(page.lines[0].words[0].codeV2, 'SYNTHETIC_GLYPH_1');
  assert.equal(page.ayahs[0].words[0].audioUrl, 'wbw/001_001_001.mp3');
  // An empty source path means "no recording", exactly like a missing one.
  assert.equal(page.lines[0].words[1].audioUrl, null);
  assert.equal(page.juzNumber, 1);
  assert.equal(page.hizbNumber, 1);
  assert.equal(page.basmalaWords, null);
});

test('loads page metadata for all 604 pages and rejects invalid page numbers', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    const body = String(url).includes('/chapters?')
      ? syntheticSurahDirectory
      : { ...syntheticPageVerses, verses: syntheticPageVerses.verses.map((verse) => ({
          ...verse,
          page_number: 604,
          words: verse.words.map((word) => ({ ...word, page_number: 604 })),
        })) };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const provider = new QuranComContentProvider();
  await assert.rejects(provider.getMushafPage(605), RangeError);
  const page = await provider.getMushafPage(604);

  assert.equal(page.pageNumber, 604);
  assert.ok(requestedUrls.some((url) => url.includes('/verses/by_page/604?')));
  assert.ok(requestedUrls.some((url) => url.includes('word_fields=code_v2%2Ctext_uthmani%2Caudio_url%2Ctranslation')));
});

test('preserves source line gaps and Surah transitions on a page', async (t) => {
  const transitionVerses = {
    verses: [112, 113, 114].map((surahNumber, index) => {
      const ayahNumber = 1;
      const lineNumber = [3, 7, 12][index];
      return {
        verse_number: ayahNumber,
        verse_key: `${surahNumber}:${ayahNumber}`,
        page_number: 604,
        juz_number: 30,
        hizb_number: 60,
        text_uthmani_tajweed: `SYNTHETIC_TEST_TOKEN <span class=end>١</span>`,
        words: [
          {
            id: 900 + index * 2,
            position: 1,
            char_type_name: 'word',
            page_number: 604,
            line_number: lineNumber,
            code_v2: `SYNTHETIC_GLYPH_${surahNumber}`,
            text_uthmani: 'SYNTHETIC_TEST_TOKEN',
            audio_url: null,
          },
          {
            id: 901 + index * 2,
            position: 2,
            char_type_name: 'end',
            page_number: 604,
            line_number: lineNumber,
            code_v2: `SYNTHETIC_END_${surahNumber}`,
            text_uthmani: '١',
            audio_url: null,
          },
        ],
      };
    }),
    pagination: { total_records: 3 },
  };
  mockFetch(t, async (url) => {
    const path = String(url);
    let body;
    if (path.endsWith('/chapters?language=ar')) {
      body = syntheticSurahDirectory;
    } else if (path.includes('/chapters/1?')) {
      body = syntheticChapter;
    } else if (path.includes('/verses/by_chapter/1?')) {
      body = syntheticVerses;
    } else if (path.includes('/verses/by_page/1?')) {
      body = syntheticPageVerses;
    } else {
      body = transitionVerses;
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const page = await new QuranComContentProvider().getMushafPage(604);

  assert.deepEqual(page.surahs.map((surah) => surah.surahNumber), [112, 113, 114]);
  assert.deepEqual(page.lines.map((line) => line.lineNumber), [3, 7, 12]);
  assert.deepEqual(page.ayahs.map((ayah) => ayah.surahNumber), [112, 113, 114]);
  assert.deepEqual(page.basmalaWords, [
    { codeV2: 'SYNTHETIC_GLYPH_1', textUthmani: 'SYNTHETIC_TEST_TOKEN_1' },
  ]);
});

test('resolves source-backed first pages for surahs and juzs', async (t) => {
  mockFetch(t, async (url) => {
    const isJuzLookup = String(url).includes('/by_juz/');
    const verseKey = isJuzLookup ? '8:41' : '9:1';
    const pageNumber = isJuzLookup ? 182 : 187;
    return new Response(JSON.stringify({
      verses: [{ verse_key: verseKey, page_number: pageNumber }],
      pagination: { total_records: 1 },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const provider = new QuranComContentProvider();
  assert.equal(await provider.getPageNumberForSurah(9), 187);
  assert.equal(await provider.getPageNumberForJuz(10), 182);
});

test('resolves the Mushaf page for a specific ayah', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({
      verse: { verse_key: '2:255', page_number: 42 },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const pageNumber = await new QuranComContentProvider().getPageNumberForAyah(2, 255);

  assert.equal(pageNumber, 42);
  assert.ok(requestedUrls.some((url) => url.endsWith('/verses/by_key/2:255?fields=page_number')));
});

test('loads and cleans the source Tafsir text for an ayah', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({
      tafsir: { text: '<p>تفسير&nbsp;ميسر</p>' },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const tafsir = await new QuranComContentProvider().getAyahTafsir(2, 255);

  assert.equal(tafsir, 'تفسير ميسر');
  assert.ok(requestedUrls.some((url) => url.endsWith('/tafsirs/16/by_ayah/2:255')));
});

test('filters approximate search hits and orders exact Quran matches by reference', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    const requestUrl = new URL(String(url));
    if (requestUrl.pathname.endsWith('/search')) {
      return new Response(JSON.stringify({
        search: {
          results: [
            { verse_key: '2:255', text: 'آية&nbsp;الرحمن' },
            { verse_key: 'invalid' },
            { verse_key: '1:2', text: 'الرحيم' },
            { verse_key: '1:1', text: 'الرحمن' },
          ],
        },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    const verseKey = requestUrl.pathname.split('/').pop();
    return new Response(JSON.stringify({
      verse: {
        text_uthmani: verseKey === '2:255'
          ? 'الرَّحْمَٰنِ'
          : verseKey === '1:2'
            ? 'الرَّحِيمِ'
            : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const provider = new QuranComContentProvider();
  const results = await provider.searchAyahs('الرحمن', 20);

  assert.deepEqual(results, [
    { surahNumber: 1, ayahNumber: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { surahNumber: 2, ayahNumber: 255, text: 'الرَّحْمَٰنِ' },
  ]);
  assert.ok(requestedUrls.some((url) => url.endsWith('/search?q=%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86&size=20&page=1')));
  await assert.rejects(provider.searchAyahs('   '), RangeError);
});

test('loads Arabic word meanings for an ayah and ignores malformed lines', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({
      result: {
        translation: 'رَبِّ: الرَّبُّ: المُرَبِّي لِخَلْقِهِ.\nسِنَةٌ: نُعَاسٌ.\nبلا فاصل',
      },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const meanings = await new QuranComContentProvider().getAyahWordMeanings(2, 255);

  assert.deepEqual(meanings, [
    { word: 'رَبِّ', meaning: 'الرَّبُّ: المُرَبِّي لِخَلْقِهِ.' },
    { word: 'سِنَةٌ', meaning: 'نُعَاسٌ.' },
  ]);
  assert.ok(requestedUrls.some((url) => url.endsWith('/translation/aya/arabic_seraj/2/255')));
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
  assert.deepEqual(reciters, [{
    id: 7,
    name: 'Mishari Rashid al-`Afasy',
    style: 'Murattal',
  }]);
  assert.ok(requestedUrls.some((url) => url.endsWith('/recitations/7/by_ayah/1:1')));
});

test('resolves Quran.com audio hosted on the verified QuranicAudio mirror', async (t) => {
  mockFetch(t, async () => new Response(JSON.stringify({
    audio_files: [{
      verse_key: '1:1',
      url: '//mirrors.quranicaudio.com/everyayah/Husary_64kbps/001001.mp3',
    }],
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }));

  const audioUrl = await new QuranComContentProvider().getAyahAudioUrl(6, 1, 1);

  assert.equal(
    audioUrl,
    'https://mirrors.quranicaudio.com/everyayah/Husary_64kbps/001001.mp3',
  );
});

test('omits reciters whose source has no playable ayah audio', async (t) => {
  let activeRequests = 0;
  let maxActiveRequests = 0;
  mockFetch(t, async (url) => {
    const path = String(url);
    if (path.endsWith('/resources/chapter_reciters?language=ar')) {
      return new Response(JSON.stringify({
        reciters: [
          { id: 7, name: 'Playable reciter', style: { name: 'Murattal' } },
          { id: 97, name: 'Unavailable reciter', style: { name: 'Murattal' } },
        ],
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    activeRequests += 1;
    maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
    await new Promise((resolve) => setTimeout(resolve, 0));
    activeRequests -= 1;
    return path.includes('/recitations/97/')
      ? new Response('Not found', { status: 404 })
      : new Response(JSON.stringify({
          audio_files: [{ verse_key: '1:1', url: 'Alafasy/mp3/001001.mp3' }],
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
  });

  const reciters = await new QuranComContentProvider().getReciters();

  assert.deepEqual(reciters, [{
    id: 7,
    name: 'Playable reciter',
    style: 'Murattal',
  }]);
  assert.equal(maxActiveRequests, 1);
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

test('loads a full chapter recitation ordered by ayah number', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    requestedUrls.push(String(url));
    return new Response(JSON.stringify({
      audio_files: [
        { verse_key: '1:3', url: 'Alafasy/mp3/001003.mp3' },
        { verse_key: '1:1', url: 'Alafasy/mp3/001001.mp3' },
        { verse_key: '1:2', url: '//mirrors.quranicaudio.com/everyayah/Husary_64kbps/001002.mp3' },
      ],
      pagination: { total_records: 3 },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const provider = new QuranComContentProvider();
  const tracks = await provider.getChapterRecitation(7, 1);

  assert.deepEqual(tracks, [
    { surahNumber: 1, ayahNumber: 1, url: 'https://verses.quran.com/Alafasy/mp3/001001.mp3' },
    {
      surahNumber: 1,
      ayahNumber: 2,
      url: 'https://mirrors.quranicaudio.com/everyayah/Husary_64kbps/001002.mp3',
    },
    { surahNumber: 1, ayahNumber: 3, url: 'https://verses.quran.com/Alafasy/mp3/001003.mp3' },
  ]);
  assert.ok(
    requestedUrls.some((url) => url.endsWith('/recitations/7/by_chapter/1?per_page=300')),
  );
  await assert.rejects(provider.getChapterRecitation(7, 115), RangeError);
});

test('rejects a chapter recitation that references a different verse', async (t) => {
  mockFetch(t, async () => new Response(JSON.stringify({
    audio_files: [{ verse_key: '2:1', url: 'Alafasy/mp3/002001.mp3' }],
    pagination: { total_records: 1 },
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }));

  await assert.rejects(new QuranComContentProvider().getChapterRecitation(7, 1), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'invalid-data');
    return true;
  });
});

test('collects ordered verse keys for a page and a juz across pagination', async (t) => {
  const requestedUrls = [];
  mockFetch(t, async (url) => {
    const requestUrl = String(url);
    requestedUrls.push(requestUrl);
    if (requestUrl.includes('/verses/by_page/2?')) {
      return new Response(JSON.stringify({
        verses: [
          { verse_key: '2:6' },
          { verse_key: '2:7' },
        ],
        pagination: { total_records: 2 },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    const isSecondPage = requestUrl.includes('page=2');
    return new Response(JSON.stringify({
      verses: isSecondPage
        ? [{ verse_key: '2:3' }, { verse_key: '2:4' }]
        : [{ verse_key: '2:1' }, { verse_key: '2:2' }],
      pagination: { total_records: 4 },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  });

  const provider = new QuranComContentProvider();
  const pageKeys = await provider.getVerseKeysForPage(2);
  const juzKeys = await provider.getVerseKeysForJuz(1);

  assert.deepEqual(pageKeys, ['2:6', '2:7']);
  assert.deepEqual(juzKeys, ['2:1', '2:2', '2:3', '2:4']);
  assert.ok(
    requestedUrls.some((url) => url.endsWith('/verses/by_page/2?language=ar&mushaf=19&fields=verse_key&per_page=300&page=1')),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.startsWith('https://api.qurancdn.com/api/qdc/verses/by_page/2?'),
    ),
  );
  assert.ok(
    requestedUrls.some((url) => url.endsWith('/verses/by_juz/1?language=ar&fields=verse_key&per_page=300&page=2')),
  );
  await assert.rejects(provider.getVerseKeysForPage(605), RangeError);
  await assert.rejects(provider.getVerseKeysForJuz(31), RangeError);
});

test('rejects incomplete verse key responses', async (t) => {
  mockFetch(t, async (url) => new Response(JSON.stringify(
    String(url).includes('page=2')
      ? { verses: [], pagination: { total_records: 2 } }
      : { verses: [{ verse_key: '2:1' }], pagination: { total_records: 2 } },
  ), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }));

  await assert.rejects(new QuranComContentProvider().getVerseKeysForJuz(1), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'invalid-data');
    return true;
  });
});
