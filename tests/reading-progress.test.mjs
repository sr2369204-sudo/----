import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_DAILY_AYAH_TARGET,
  loadDailyReadingPlan,
  parseDailyReadingPlan,
  parseLastReadingPosition,
  serializeDailyReadingPlan,
  setDailyAyahTarget,
  toggleDailyAyahCompletion,
  toggleDailyAyahs,
} from '../src/features/reader/services/reading-progress.ts';

function createSettingsDatabase(initialSettings = new Map()) {
  const settings = new Map(initialSettings);
  return {
    settings,
    async getFirstAsync(_sql, key) {
      const value = settings.get(key);
      return value === undefined ? null : { value };
    },
    async runAsync(_sql, key, value) {
      settings.set(key, value);
    },
  };
}

test('starts a new daily plan with the default ayah target', () => {
  assert.deepEqual(parseDailyReadingPlan(null, new Date(2026, 10, 4)), {
    date: '2026-11-04',
    targetAyahs: DEFAULT_DAILY_AYAH_TARGET,
    completedAyahs: [],
  });
});

test('counts distinct ayahs, including ayahs selected from a range', () => {
  const plan = {
    date: '2026-11-04',
    targetAyahs: 20,
    completedAyahs: ['2:255'],
  };

  assert.deepEqual(toggleDailyAyahs(plan, [{ surahNumber: 2, ayahNumber: 255 }]), {
    ...plan,
    completedAyahs: [],
  });
  assert.deepEqual(
    toggleDailyAyahs(plan, [
      { surahNumber: 2, ayahNumber: 255 },
      { surahNumber: 2, ayahNumber: 256 },
      { surahNumber: 2, ayahNumber: 256 },
    ]).completedAyahs,
    ['2:255', '2:256'],
  );
});

test('resets completed ayahs on a new local day and preserves the target', () => {
  const stored = serializeDailyReadingPlan({
    date: '2026-11-03',
    targetAyahs: 35,
    completedAyahs: ['2:255'],
  });

  assert.deepEqual(parseDailyReadingPlan(stored, new Date(2026, 10, 4)), {
    date: '2026-11-04',
    targetAyahs: 35,
    completedAyahs: [],
  });
});

test('migrates legacy page-based plans without claiming unverified ayah progress', () => {
  const legacy = JSON.stringify({
    format: 'mushaf-daily-reading-plan',
    version: 1,
    date: '2026-11-04',
    targetPages: 8,
    visitedPages: [2, 3],
  });

  assert.deepEqual(parseDailyReadingPlan(legacy, new Date(2026, 10, 4)), {
    date: '2026-11-04',
    targetAyahs: DEFAULT_DAILY_AYAH_TARGET,
    completedAyahs: [],
  });
});

test('rejects invalid daily plans and ayah references', () => {
  assert.throws(() => parseDailyReadingPlan('{"date":"2026-11-04"}'), /غير صالحة/);
  assert.throws(
    () => toggleDailyAyahs(
      { date: '2026-11-04', targetAyahs: 20, completedAyahs: [] },
      [{ surahNumber: 2, ayahNumber: 287 }],
    ),
    /حدد آية واحدة على الأقل/,
  );
  assert.throws(
    () => serializeDailyReadingPlan({
      date: '2026-11-04',
      targetAyahs: 501,
      completedAyahs: [],
    }),
    /غير صالحة/,
  );
});

test('validates and reads a saved ayah position', () => {
  const stored = JSON.stringify({
    format: 'mushaf-last-reading-position',
    version: 1,
    surahNumber: 2,
    ayahNumber: 255,
    pageNumber: 42,
  });

  assert.deepEqual(parseLastReadingPosition(stored), {
    surahNumber: 2,
    ayahNumber: 255,
    pageNumber: 42,
  });
  assert.equal(parseLastReadingPosition(null), null);
  assert.throws(
    () => parseLastReadingPosition('{"format":"mushaf-last-reading-position","version":1}'),
    /موضع القراءة المحفوظ غير صالح/,
  );
});

test('persists the selected ayah target and counts each completed ayah once', async () => {
  const database = createSettingsDatabase();
  const date = new Date(2026, 10, 4);

  await setDailyAyahTarget(database, 25, date);
  await toggleDailyAyahCompletion(database, [{ surahNumber: 2, ayahNumber: 255 }], date);
  await toggleDailyAyahCompletion(database, [{ surahNumber: 2, ayahNumber: 255 }], date);
  await toggleDailyAyahCompletion(database, [{ surahNumber: 2, ayahNumber: 256 }], date);

  assert.deepEqual(await loadDailyReadingPlan(database, date), {
    date: '2026-11-04',
    targetAyahs: 25,
    completedAyahs: ['2:256'],
  });
});

test('persists and migrates legacy plans when loaded from settings', async () => {
  const legacy = JSON.stringify({
    format: 'mushaf-daily-reading-plan',
    version: 1,
    date: '2026-11-04',
    targetPages: 8,
    visitedPages: [2, 3],
  });
  const database = createSettingsDatabase(new Map([['reader.dailyReadingPlan', legacy]]));
  const plan = await loadDailyReadingPlan(database, new Date(2026, 10, 4));

  assert.deepEqual(plan, {
    date: '2026-11-04',
    targetAyahs: DEFAULT_DAILY_AYAH_TARGET,
    completedAyahs: [],
  });
  assert.equal(JSON.parse(database.settings.get('reader.dailyReadingPlan')).version, 2);
});
