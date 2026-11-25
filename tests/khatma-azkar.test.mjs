import assert from 'node:assert/strict';
import test from 'node:test';

import {
  markReached,
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

test('khatma marks the reached page and tracks today', () => {
  let k = startKhatma('2026-11-25', 30);
  let r = markReached(k, 10, '2026-11-25');
  assert.equal(r.kind, 'advanced');
  k = r.khatma;
  assert.equal(k.reachedPage, 10);
  const s = khatmaStatus(k, '2026-11-25');
  assert.equal(s.done, 10);
  assert.equal(s.todayDone, 10);
  assert.equal(s.perDay, 21); // ceil((594 + 10) / 30)
  assert.equal(s.nextPage, 11);
  // an earlier page never moves the mark back
  assert.equal(markReached(k, 5, '2026-11-25').kind, 'ahead');
  // the same page again takes it back one page
  const undone = markReached(k, 10, '2026-11-25');
  assert.equal(undone.kind, 'undone');
  assert.equal(undone.khatma.reachedPage, 9);
});

test('khatma rolls the day and reports behind and ahead of plan', () => {
  let k = markReached(startKhatma('2026-11-01', 30), 40, '2026-11-01').khatma;
  const next = khatmaStatus(k, '2026-11-02');
  assert.equal(next.todayDone, 0);
  assert.ok(khatmaStatus(startKhatma('2026-11-01', 30), '2026-11-11').behindBy > 0);
  assert.ok(khatmaStatus(startKhatma('2026-11-01', 30, 300), '2026-11-02').behindBy < 0);
});

test('khatma round-trips and restarts with the count', () => {
  const full = startKhatma('2026-11-01', 7, 604);
  assert.equal(khatmaStatus(full, '2026-11-03').finished, true);
  assert.deepEqual(parseKhatma(serializeKhatma(full)), full);
  assert.equal(restartKhatma(full, '2026-11-04').completed, 1);
  assert.equal(restartKhatma(full, '2026-11-04').reachedPage, 0);
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

test('azkar sets have unique ids and respect morning/evening-only items', () => {
  for (const set of AZKAR_SETS) {
    const ids = set.items.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, set.id);
    assert.ok(set.items.every((item) => item.count >= 1 && item.text.length > 0));
  }
  const morning = AZKAR_SETS[0].items.map((i) => i.id);
  const evening = AZKAR_SETS[1].items.map((i) => i.id);
  assert.ok(morning.includes('adadkhalqihi') && !evening.includes('adadkhalqihi'));
  assert.ok(evening.includes('kalimat') && !morning.includes('kalimat'));
});
