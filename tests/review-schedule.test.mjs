import assert from 'node:assert/strict';
import test from 'node:test';

import {
  dueSurahs,
  parseReviewDates,
  reconcileReviewDates,
  serializeReviewDates,
} from '../src/features/memorization/services/review-schedule.ts';

test('a surah is due seven days after its last review, oldest first', () => {
  const dates = { 1: '2026-01-01', 2: '2026-01-05', 3: '2026-01-10' };
  const due = dueSurahs(dates, '2026-01-12');
  assert.deepEqual(due.map((item) => item.surahNumber), [1, 2]);
  assert.equal(due[0].daysSince, 11);
});

test('new memorized surahs start today and forgotten ones are dropped', () => {
  const next = reconcileReviewDates([1, 2], { 1: '2026-01-01', 9: '2026-01-02' }, '2026-02-01');
  assert.deepEqual(next, { 1: '2026-01-01', 2: '2026-02-01' });
});

test('damaged review text reads as empty and a round trip keeps the dates', () => {
  assert.deepEqual(parseReviewDates('not json'), {});
  assert.deepEqual(parseReviewDates(null), {});
  const dates = { 5: '2026-03-03' };
  assert.deepEqual(parseReviewDates(serializeReviewDates(dates)), dates);
});
