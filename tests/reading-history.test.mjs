import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addPageRead,
  currentStreak,
  EMPTY_HISTORY,
  parseReadingHistory,
  serializeReadingHistory,
} from '../src/features/reader/services/reading-history.ts';

test('reading a page records it once and the day once', () => {
  let history = addPageRead(EMPTY_HISTORY, 5, '2026-01-02');
  history = addPageRead(history, 5, '2026-01-02');
  history = addPageRead(history, 3, '2026-01-02');
  assert.deepEqual(history.pages, [3, 5]);
  assert.deepEqual(history.days, ['2026-01-02']);
  assert.equal(addPageRead(history, 9999, '2026-01-02'), history);
});

test('the streak counts consecutive days and survives a not yet read morning', () => {
  const days = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-05'];
  assert.equal(currentStreak(days, '2026-01-05'), 1);
  assert.equal(currentStreak(days, '2026-01-04'), 3);
  assert.equal(currentStreak(days, '2026-01-09'), 0);
  assert.equal(currentStreak(['2025-12-31', '2026-01-01'], '2026-01-01'), 2);
});

test('damaged history reads as empty', () => {
  assert.deepEqual(parseReadingHistory('{{'), EMPTY_HISTORY);
  const history = { pages: [1, 2], days: ['2026-01-01'] };
  assert.deepEqual(parseReadingHistory(serializeReadingHistory(history)), history);
});
