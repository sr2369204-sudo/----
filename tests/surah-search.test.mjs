import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAyahSearchReference } from '../src/features/home/utils/home-search.ts';
import { normalizeSurahSearch } from '../src/features/quran/services/surah-search.ts';

test('normalizes Quranic marks and common Arabic letter variants', () => {
  assert.equal(normalizeSurahSearch('ٱلْفَاتِحَة'), 'الفاتحة');
  assert.equal(normalizeSurahSearch('إِخْلَاص'), 'اخلاص');
  assert.equal(normalizeSurahSearch('مُوسَى'), 'موسي');
});

test('normalizes Arabic-Indic and Persian-Indic numbers for surah search', () => {
  assert.equal(normalizeSurahSearch('١١٤'), '114');
  assert.equal(normalizeSurahSearch('۱۱۴'), '114');
});

const surahs = [
  { surahNumber: 1, nameArabic: 'الفاتحة', ayahCount: 7, revelationPlace: 'makkah' },
  { surahNumber: 2, nameArabic: 'البقرة', ayahCount: 286, revelationPlace: 'madinah' },
];

test('resolves ayah references by surah and ayah numbers', () => {
  assert.deepEqual(resolveAyahSearchReference('٢:٢٥٥', surahs, normalizeSurahSearch), {
    surahNumber: 2,
    ayahNumber: 255,
  });
  assert.deepEqual(resolveAyahSearchReference('البقرة 255', surahs, normalizeSurahSearch), {
    surahNumber: 2,
    ayahNumber: 255,
  });
  assert.deepEqual(resolveAyahSearchReference('سورة الفاتحة:١', surahs, normalizeSurahSearch), {
    surahNumber: 1,
    ayahNumber: 1,
  });
});

test('does not interpret a surah-only or unrecognized query as an ayah reference', () => {
  assert.equal(resolveAyahSearchReference('البقرة', surahs, normalizeSurahSearch), null);
  assert.equal(resolveAyahSearchReference('255', surahs, normalizeSurahSearch), null);
  assert.equal(resolveAyahSearchReference('النساء 255', surahs, normalizeSurahSearch), null);
});
