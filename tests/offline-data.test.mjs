import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/features/offline-data');
// The app bundler provides `require` for the JSON files; load them directly here.
globalThis.require = (file) => JSON.parse(readFileSync(path.join(dir, file), 'utf8'));

const data = await import('../src/features/offline-data/index.ts');

test('bundled text, tafsir and meanings cover all 6236 ayahs', () => {
  const counts = JSON.parse(readFileSync(path.join(dir, 'quran-text.json'), 'utf8')).counts;
  assert.equal(counts.length, 114);
  assert.equal(counts.reduce((a, b) => a + b, 0), 6236);
  let missingTafsir = 0;
  let withMeanings = 0;
  counts.forEach((count, s) => {
    for (let a = 1; a <= count; a += 1) {
      assert.ok(data.getBundledAyahText(s + 1, a)?.length > 0, `text ${s + 1}:${a}`);
      if (!data.getBundledTafsir(s + 1, a)) missingTafsir += 1;
      if (data.getBundledWordMeanings(s + 1, a).length > 0) withMeanings += 1;
    }
  });
  assert.equal(missingTafsir, 0);
  assert.equal(withMeanings, 3648);
  assert.equal(data.getBundledTafsir(1, 0), null);
  assert.equal(data.getBundledTafsir(1, 8), null);
  assert.equal(data.getBundledTafsir(115, 1), null);
});

test('a shared tafsir entry is returned for each ayah it covers', () => {
  assert.equal(data.getBundledTafsir(26, 222), data.getBundledTafsir(26, 223));
});

test('meanings parse into word and gloss', () => {
  const list = data.getBundledWordMeanings(1, 2);
  assert.ok(list[0].word.length > 0);
  assert.ok(list[0].meaning.length > 10);
});

test('search finds an ayah from one letter and from a part of a word', () => {
  const t0 = performance.now();
  const one = data.searchBundled('ا', 20);
  assert.equal(one.length >= 20, true);
  const part = data.searchBundled('الرحم', 20);
  assert.equal(part[0].surahNumber, 1);
  assert.equal(part[0].ayahNumber, 1);
  const phrase = data.searchBundled('قل هو الله احد', 5);
  assert.equal(phrase[0].surahNumber, 112);
  assert.ok(performance.now() - t0 < 2000);
});

test('search also finds ayahs through the tafsir text', () => {
  const found = data.searchBundled('تنزل الشياطين', 20);
  assert.ok(found.some((item) => item.matchedIn === 'tafsir'));
  assert.ok(found.every((item) => item.text.length > 0));
});

test('search answers quickly once loaded', () => {
  data.warmOfflineData();
  const t0 = performance.now();
  for (const q of ['م', 'مو', 'موس', 'موسى فرعون', 'الصبر']) data.searchBundled(q, 20);
  const per = (performance.now() - t0) / 5;
  console.log('avg ms per search', per.toFixed(1));
  assert.ok(per < 150);
});
