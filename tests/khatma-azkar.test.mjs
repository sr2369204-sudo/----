import assert from 'node:assert/strict';
import test from 'node:test';

import {
  markReached,
  khatmaTotal,
  juzRange,
  khatmaCoversPage,
  khatmaStatus,
  parseKhatma,
  restartKhatma,
  serializeKhatma,
  startKhatma,
} from '../src/features/khatma/services/khatma.ts';
import { SURAH_START_PAGES, surahEndPage, surahStartPage } from '../src/features/khatma/data/surah-start-pages.ts';
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
  assert.equal(k.done, 10);
  const s = khatmaStatus(k, '2026-11-25');
  assert.equal(s.done, 10);
  assert.equal(s.todayDone, 10);
  assert.equal(s.perDay, 21); // ceil((594 + 10) / 30)
  assert.equal(s.nextPage, 11);
  assert.equal(s.reachedPage, 10);
  const earlier = markReached(k, 5, '2026-11-25');
  assert.equal(earlier.kind, 'unchanged');
  assert.equal(earlier.reason, 'earlier');
  // Pressing the button again on the page that is already the mark does nothing.
  const same = markReached(k, 10, '2026-11-25');
  assert.equal(same.kind, 'unchanged');
  assert.equal(same.reason, 'same');
  assert.equal(same.khatma.done, 10);
});

test('khatma can start from a surah, wrap past the last page and have a kind', () => {
  // Al-Baqarah starts on page 2; reaching page 50 means 49 pages done.
  let k = startKhatma('2026-11-25', 30, { kind: 'memorization', startPage: surahStartPage(2), endPage: 1 });
  assert.equal(k.startPage, 2);
  assert.equal(k.kind, 'memorization');
  k = markReached(k, 50, '2026-11-25').khatma;
  assert.equal(k.done, 49);
  assert.equal(khatmaCoversPage(k, 30), true);
  assert.equal(khatmaCoversPage(k, 51), false);
  assert.equal(khatmaStatus(k, '2026-11-25').nextPage, 51);
  // reaching page 604 and then page 1 wraps around; page 1 is the last page of this khatma
  k = markReached(k, 604, '2026-11-25').khatma;
  assert.equal(k.done, 603);
  const end = markReached(k, 1, '2026-11-25');
  assert.equal(end.khatma.done, 604);
  assert.equal(khatmaStatus(end.khatma, '2026-11-25').finished, true);
  assert.equal(surahStartPage(114), 604);
  assert.equal(SURAH_START_PAGES.length, 114);
});

test('khatma can cover a range of pages, a juz or a single surah', () => {
  // Surah Al-Mulk to the end: pages 562..604 is 43 pages.
  let k = startKhatma('2026-11-25', 10, { startPage: surahStartPage(67), endPage: 604 });
  assert.equal(khatmaStatus(k, '2026-11-25').total, 43);
  assert.equal(markReached(k, 100, '2026-11-25').reason, 'outside');
  assert.equal(khatmaCoversPage(k, 100), false);
  k = markReached(k, 570, '2026-11-25').khatma;
  assert.equal(k.done, 9);
  assert.equal(khatmaStatus(k, '2026-11-25').percent, Math.round((9 / 43) * 100));
  k = markReached(k, 604, '2026-11-25').khatma;
  assert.equal(khatmaStatus(k, '2026-11-25').finished, true);
  assert.equal(restartKhatma(k, '2026-11-26').endPage, 604);
  // Al-Baqarah alone: pages 2..49.
  assert.equal(khatmaTotal({ startPage: surahStartPage(2), endPage: surahEndPage(2) }), 48);
  assert.deepEqual(juzRange(1), { startPage: 1, endPage: 21 });
  assert.deepEqual(juzRange(30), { startPage: 582, endPage: 604 });
  assert.equal(khatmaTotal({ startPage: 2, endPage: 1 }), 604);
});

test('khatma rolls the day and reports behind and ahead of plan', () => {
  const k = markReached(startKhatma('2026-11-01', 30), 40, '2026-11-01').khatma;
  assert.equal(khatmaStatus(k, '2026-11-02').todayDone, 0);
  assert.ok(khatmaStatus(startKhatma('2026-11-01', 30), '2026-11-11').behindBy > 0);
  assert.ok(khatmaStatus(startKhatma('2026-11-01', 30, { done: 300 }), '2026-11-02').behindBy < 0);
});

test('khatma round-trips, reads the older format and restarts with the count', () => {
  const full = startKhatma('2026-11-01', 7, { kind: 'review', startPage: 50, done: 604 });
  assert.equal(khatmaStatus(full, '2026-11-03').finished, true);
  assert.deepEqual(parseKhatma(serializeKhatma(full)), full);
  const restarted = restartKhatma(full, '2026-11-04');
  assert.equal(restarted.completed, 1);
  assert.equal(restarted.done, 0);
  assert.equal(restarted.kind, 'review');
  assert.equal(restarted.startPage, 50);
  const old = parseKhatma(JSON.stringify({ startDate: '2026-11-01', targetDays: 30, reachedPage: 12 }));
  assert.equal(old.done, 12);
  assert.equal(old.startPage, 1);
  assert.equal(old.kind, 'reading');
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
