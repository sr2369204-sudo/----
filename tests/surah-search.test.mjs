import assert from 'node:assert/strict';
import test from 'node:test';

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
