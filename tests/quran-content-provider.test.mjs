import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BackendQuranContentProvider,
  ContentUnavailableError,
} from '../src/features/quran/services/content-provider.ts';

const syntheticSurah = {
  sourceId: 'test-fixture-only',
  contentVersion: 'synthetic-1',
  textScript: 'uthmani',
  narration: 'hafs-an-asim',
  surahNumber: 1,
  nameArabic: 'اسم اختباري اصطناعي',
  ayahCount: 1,
  ayahs: [
    {
      ayahNumber: 1,
      words: [{ id: 'synthetic-word-1', position: 1, textUthmani: 'SYNTHETIC_TEST_TOKEN' }],
    },
  ],
};

test('accepts a source-attributed, versioned response with the required script and narration', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify(syntheticSurah), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

  const provider = new BackendQuranContentProvider('https://backend.example.test');
  const surah = await provider.getSurah(1);

  assert.equal(surah.sourceId, 'test-fixture-only');
  assert.equal(surah.contentVersion, 'synthetic-1');
  assert.equal(surah.ayahs[0].words[0].id, 'synthetic-word-1');
  assert.equal(surah.ayahs[0].words[0].textUthmani, 'SYNTHETIC_TEST_TOKEN');
});

test('rejects a response with an unverified script or narration', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ ...syntheticSurah, textScript: 'simplified' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

  const provider = new BackendQuranContentProvider('https://backend.example.test');

  await assert.rejects(provider.getSurah(1), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'invalid-data');
    return true;
  });
});

test('rejects incomplete ayah sequences instead of displaying partial content as complete', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        ...syntheticSurah,
        ayahCount: 2,
        ayahs: [
          syntheticSurah.ayahs[0],
          {
            ayahNumber: 3,
            words: [{ id: 'synthetic-word-3', position: 1, textUthmani: 'ANOTHER_TEST_TOKEN' }],
          },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );

  const provider = new BackendQuranContentProvider('https://backend.example.test');

  await assert.rejects(provider.getSurah(1), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'invalid-data');
    return true;
  });
});

test('does not request content when the backend URL is missing', async () => {
  const provider = new BackendQuranContentProvider(undefined);

  await assert.rejects(provider.getSurah(1), (error) => {
    assert.ok(error instanceof ContentUnavailableError);
    assert.equal(error.reason, 'not-configured');
    return true;
  });
});
