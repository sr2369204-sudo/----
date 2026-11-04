import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolvePagePull,
  resolvePageTurnIntent,
} from '../src/features/reader/services/page-turn.ts';

test('a left-to-right swipe turns to the next page', () => {
  assert.equal(resolvePageTurnIntent(100, 0, 50), 'next');
  assert.equal(resolvePageTurnIntent(30, 250, 50), 'next');
  assert.equal(resolvePagePull(100, true, false), 100);
});

test('a right-to-left swipe turns to the previous page', () => {
  assert.equal(resolvePageTurnIntent(-100, 0, 50), 'previous');
  assert.equal(resolvePageTurnIntent(-30, -250, 50), 'previous');
  assert.equal(resolvePagePull(-100, false, true), -100);
});

test('a blocked neighbour prevents pulling the page strip', () => {
  assert.equal(resolvePagePull(100, false, true), 0);
  assert.equal(resolvePagePull(-100, true, false), 0);
});

test('short, slow drags do not turn pages', () => {
  assert.equal(resolvePageTurnIntent(25, 100, 50), null);
  assert.equal(resolvePageTurnIntent(-25, -100, 50), null);
});
