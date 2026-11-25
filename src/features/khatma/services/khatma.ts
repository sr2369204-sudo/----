import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A khatma (one full reading of the Mushaf) with a goal in days. The reader
 * marks the page they reached with the "reached here" button in the reader,
 * and everything before it counts as read. Everything stays on the phone.
 */
export const KHATMA_KEY = 'khatma.plan';
const FORMAT = 'mushaf-khatma';
export const MUSHAF_PAGES = 604;
export const KHATMA_PRESETS = [7, 10, 15, 30, 60] as const;

export type Khatma = {
  startDate: string;
  targetDays: number;
  /** The last page reached, 0 before the first mark. */
  reachedPage: number;
  /** Day the `todayBase` below belongs to. */
  todayDate: string;
  /** Page reached when `todayDate` began. */
  todayBase: number;
  /** Finished khatmas so far. */
  completed: number;
};

export type KhatmaStatus = {
  done: number;
  remaining: number;
  percent: number;
  daysElapsed: number;
  daysLeft: number;
  /** Pages to read each day from now to finish on time. */
  perDay: number;
  todayDone: number;
  todayLeft: number;
  /** Pages the plan expected by the end of today, minus pages reached. Negative means ahead. */
  behindBy: number;
  finished: boolean;
  nextPage: number;
};

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clampPage(value: number): number {
  return Math.max(0, Math.min(MUSHAF_PAGES, Math.round(value)));
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}

export function startKhatma(
  today: string,
  targetDays: number,
  reachedPage = 0,
  completed = 0,
): Khatma {
  const reached = clampPage(reachedPage);
  return {
    startDate: today,
    targetDays: Math.max(1, Math.min(365, Math.round(targetDays))),
    reachedPage: reached,
    todayDate: today,
    todayBase: reached,
    completed,
  };
}

export function parseKhatma(value: string | null): Khatma | null {
  if (value === null) {
    return null;
  }
  try {
    const p = JSON.parse(value) as Partial<Khatma>;
    if (!isDateKey(p.startDate) || !Number.isInteger(p.targetDays) || (p.targetDays as number) < 1) {
      return null;
    }
    const reachedPage = Number.isInteger(p.reachedPage) ? clampPage(p.reachedPage as number) : 0;
    return {
      startDate: p.startDate,
      targetDays: p.targetDays as number,
      reachedPage,
      todayDate: isDateKey(p.todayDate) ? p.todayDate : p.startDate,
      todayBase: Number.isInteger(p.todayBase) ? Math.min(clampPage(p.todayBase as number), reachedPage) : 0,
      completed: Number.isInteger(p.completed) && (p.completed as number) >= 0 ? (p.completed as number) : 0,
    };
  } catch {
    return null;
  }
}

export function serializeKhatma(khatma: Khatma): string {
  return JSON.stringify({ format: FORMAT, version: 2, ...khatma });
}

/** Rolls the "start of today" marker forward when a new day began. */
function rollDay(khatma: Khatma, today: string): Khatma {
  return khatma.todayDate === today
    ? khatma
    : { ...khatma, todayDate: today, todayBase: khatma.reachedPage };
}

export type ReachResult =
  | { kind: 'advanced'; khatma: Khatma; from: number; to: number }
  | { kind: 'undone'; khatma: Khatma; from: number; to: number }
  | { kind: 'ahead'; khatma: Khatma };

/**
 * The reader taps "reached here" on a page. A later page moves the mark
 * forward. Tapping the page that is already the mark takes it back one page.
 * An earlier page changes nothing, so progress is never lost by accident.
 */
export function markReached(khatma: Khatma, pageNumber: number, today: string): ReachResult {
  const rolled = rollDay(khatma, today);
  const page = clampPage(pageNumber);
  if (page > rolled.reachedPage) {
    return { kind: 'advanced', khatma: { ...rolled, reachedPage: page }, from: rolled.reachedPage, to: page };
  }
  if (page === rolled.reachedPage && page > 0) {
    const to = page - 1;
    return {
      kind: 'undone',
      khatma: { ...rolled, reachedPage: to, todayBase: Math.min(rolled.todayBase, to) },
      from: page,
      to,
    };
  }
  return { kind: 'ahead', khatma: rolled };
}

export function khatmaStatus(khatma: Khatma, today: string): KhatmaStatus {
  const rolled = rollDay(khatma, today);
  const done = rolled.reachedPage;
  const remaining = MUSHAF_PAGES - done;
  const daysElapsed = Math.max(0, daysBetween(khatma.startDate, today));
  // Day 1 is the start day: with a 30-day goal the last day is day 30.
  const daysLeft = Math.max(1, khatma.targetDays - daysElapsed);
  const todayDone = Math.max(0, done - rolled.todayBase);
  // Today's share: what was left this morning spread over the days left.
  const perDay = Math.ceil((remaining + todayDone) / daysLeft);
  const expectedByToday = Math.min(
    MUSHAF_PAGES,
    Math.ceil((MUSHAF_PAGES * Math.min(khatma.targetDays, daysElapsed + 1)) / khatma.targetDays),
  );
  return {
    done,
    remaining,
    percent: Math.round((done / MUSHAF_PAGES) * 100),
    daysElapsed,
    daysLeft,
    perDay,
    todayDone,
    todayLeft: Math.max(0, perDay - todayDone),
    behindBy: expectedByToday - done,
    finished: remaining === 0,
    nextPage: Math.min(MUSHAF_PAGES, done + 1),
  };
}

export async function loadKhatma(database: SQLiteDatabase): Promise<Khatma | null> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    KHATMA_KEY,
  );
  return parseKhatma(row?.value ?? null);
}

export async function saveKhatma(database: SQLiteDatabase, khatma: Khatma | null): Promise<void> {
  if (khatma === null) {
    await database.runAsync('DELETE FROM app_settings WHERE key = ?', KHATMA_KEY);
    return;
  }
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    KHATMA_KEY,
    serializeKhatma(khatma),
    new Date().toISOString(),
  );
}

/** Marks the page reached in the saved khatma. Returns null when none is running. */
export async function markKhatmaReached(
  database: SQLiteDatabase,
  pageNumber: number,
  today: string,
): Promise<ReachResult | null> {
  const current = await loadKhatma(database);
  if (current === null) {
    return null;
  }
  const result = markReached(current, pageNumber, today);
  await saveKhatma(database, result.khatma);
  return result;
}

/** After a finished khatma: count it and start a new one with the same goal. */
export function restartKhatma(khatma: Khatma, today: string): Khatma {
  const finished = khatma.reachedPage >= MUSHAF_PAGES ? 1 : 0;
  return startKhatma(today, khatma.targetDays, 0, khatma.completed + finished);
}
