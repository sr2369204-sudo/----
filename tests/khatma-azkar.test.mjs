import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addKhatmaPage,
  khatmaStatus,
  parseKhatma,
  restartKhatma,
  serializeKhatma,
  startKhatma,
} from '../src/features/khatma/services/khatma.ts';
import {
  parseAzkarProgress,
  serializeAzkarProgress,
  tapAzkarItem,
  azkarSetSummary,
} from '../src/features/azkar/services/azkar-progress.ts';
import { AZKAR_SETS } from '../src/features/azkar/data/azkar.ts';
import { DAILY_DHIKR, pickDailyDhikr } from '../src/features/daily-dhikr/daily-dhikr.ts';

test('khatma counts each page once and tracks today', () => {
  let k = startKhatma('2026-11-25', 30);
  k = addKhatmaPage(k, 1, '2026-11-25');
  k = addKhatmaPage(k, 1, '2026-11-25');
  k = addKhatmaPage(k, 2, '2026-11-25');
  assert.equal(k.pages.length, 2);
  const s = khatmaStatus(k, '2026-11-25');
  assert.equal(s.done, 2);
  assert.equal(s.todayDone, 2);
  assert.equal(s.perDay, 21); // ceil(604 / 30)
  assert.equal(s.nextPage, 3);
});

test('khatma reports behind and ahead of plan', () => {
  const k = startKhatma('2026-11-01', 30);
  assert.ok(khatmaStatus(k, '2026-11-11').behindBy > 0);
  const ahead = startKhatma('2026-11-01', 30, Array.from({ length: 300 }, (_, i) => i + 1));
  assert.ok(khatmaStatus(ahead, '2026-11-02').behindBy < 0);
});

test('khatma round-trips and restarts with the count', () => {
  const full = startKhatma('2026-11-01', 7, Array.from({ length: 604 }, (_, i) => i + 1));
  assert.equal(khatmaStatus(full, '2026-11-03').finished, true);
  assert.deepEqual(parseKhatma(serializeKhatma(full)), full);
  assert.equal(restartKhatma(full, '2026-11-04').completed, 1);
  assert.equal(parseKhatma('garbage'), null);
});

test('azkar counts stop at the target and reset each day', () => {
  const set = AZKAR_SETS[2];
  const item = set.items[0];
  let p = parseAzkarProgress(null, '2026-11-25');
  for (let i = 0; i < item.count + 2; i += 1) p = tapAzkarItem(p, set.id, item);
  assert.equal(p.counts[`${set.id}:${item.id}`], item.count);
  assert.equal(azkarSetSummary(p, set.id, set.items).done, 1);
  assert.deepEqual(parseAzkarProgress(serializeAzkarProgress(p), '2026-11-25'), p);
  assert.deepEqual(parseAzkarProgress(serializeAzkarProgress(p), '2026-11-26').counts, {});
});

test('daily dhikr is stable within a day and varies across days', () => {
  assert.equal(pickDailyDhikr('2026-11-25'), pickDailyDhikr('2026-11-25'));
  const seen = new Set(Array.from({ length: DAILY_DHIKR.length }, (_, i) => pickDailyDhikr(`2026-12-${String(i + 1).padStart(2, '0')}`).text));
  assert.equal(seen.size, DAILY_DHIKR.length);
});
