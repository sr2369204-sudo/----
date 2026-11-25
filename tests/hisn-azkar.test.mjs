import assert from 'node:assert/strict';
import test from 'node:test';

import { AZKAR_SETS } from '../src/features/azkar/data/azkar.ts';
import { HISN_SETS } from '../src/features/azkar/data/hisn-azkar.ts';

const items = HISN_SETS.flatMap((set) => set.items);

test('hisn sets do not clash with the core sets and have items', () => {
  assert.equal(HISN_SETS.length, 10);
  for (const set of HISN_SETS) {
    assert.ok(!AZKAR_SETS.some((core) => core.id === set.id));
    assert.ok(set.items.length > 0);
  }
});

test('hisn items have unique ids, positive counts and no source', () => {
  const ids = new Set(items.map((item) => item.id));
  assert.equal(ids.size, items.length);
  for (const item of items) {
    assert.ok(item.count >= 1);
    assert.equal('source' in item, false);
  }
});

test('hisn text has no Quran braces or brackets and no narration lead-in', () => {
  for (const item of items) {
    assert.doesNotMatch(item.text, /[{}[\]]/);
    assert.doesNotMatch(item.text, /صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:/);
  }
});

test('the disputed market dua is left out', () => {
  assert.ok(!items.some((item) => item.id.startsWith('h99-')));
});
