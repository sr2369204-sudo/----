import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A khatma (one full reading of the Mushaf) with a goal in days. Pages come
 * from the same "page was really read" signal as the reading log. Everything
 * stays on the phone.
 */
export const KHATMA_KEY = 'khatma.plan';
const FORMAT = 'mushaf-khatma';
export const MUSHAF_PAGES = 604;
export const KHATMA_PRESETS = [7, 10, 15, 30, 60] as const;

export type Khatma = {
  startDate: string;
  targetDays: number;
  /** Pages read since the khatma started, ascending. */
  pages: number[];
  /** Pages read on `todayDate`, for the daily goal. */
  todayDate: string;
  todayCount: number;
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
  /** Pages the plan expected by the end of today, minus pages read. Negative means ahead. */
  behindBy: number;
  finished: boolean;
  nextPage: number | null;
};

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
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
  seedPages: number[] = [],
  completed = 0,
): Khatma {
  const pages = [...new Set(seedPages.filter((p) => Number.isInteger(p) && p >= 1 && p <= MUSHAF_PAGES))]
    .sort((a, b) => a - b);
  return {
    startDate: today,
    targetDays: Math.max(1, Math.min(365, Math.round(targetDays))),
    pages,
    todayDate: today,
    todayCount: 0,
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
    const pages = Array.isArray(p.pages)
      ? p.pages.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= MUSHAF_PAGES)
      : [];
    return {
      startDate: p.startDate,
      targetDays: p.targetDays as number,
      pages: [...new Set(pages)].sort((a, b) => a - b),
      todayDate: isDateKey(p.todayDate) ? p.todayDate : p.startDate,
      todayCount: Number.isInteger(p.todayCount) && (p.todayCount as number) >= 0 ? (p.todayCount as number) : 0,
      completed: Number.isInteger(p.completed) && (p.completed as number) >= 0 ? (p.completed as number) : 0,
    };
  } catch {
    return null;
  }
}

export function serializeKhatma(khatma: Khatma): string {
  return JSON.stringify({ format: FORMAT, version: 1, ...khatma });
}

export function addKhatmaPage(khatma: Khatma, pageNumber: number, today: string): Khatma {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > MUSHAF_PAGES) {
    return khatma;
  }
  const todayCount = khatma.todayDate === today ? khatma.todayCount : 0;
  if (khatma.pages.includes(pageNumber)) {
    return khatma.todayDate === today ? khatma : { ...khatma, todayDate: today, todayCount: 0 };
  }
  return {
    ...khatma,
    pages: [...khatma.pages, pageNumber].sort((a, b) => a - b),
    todayDate: today,
    todayCount: todayCount + 1,
  };
}

export function khatmaStatus(khatma: Khatma, today: string): KhatmaStatus {
  const done = khatma.pages.length;
  const remaining = MUSHAF_PAGES - done;
  const daysElapsed = Math.max(0, daysBetween(khatma.startDate, today));
  // Day 1 is the start day: with a 30-day goal the last day is day 30.
  const daysLeft = Math.max(1, khatma.targetDays - daysElapsed);
  const todayDone = khatma.todayDate === today ? khatma.todayCount : 0;
  // Today's share: what was left this morning spread over the days left.
  const leftBeforeToday = remaining + todayDone;
  const perDay = Math.ceil(leftBeforeToday / daysLeft);
  const expectedByToday = Math.min(
    MUSHAF_PAGES,
    Math.ceil((MUSHAF_PAGES * Math.min(khatma.targetDays, daysElapsed + 1)) / khatma.targetDays),
  );
  let nextPage: number | null = null;
  for (let page = 1; page <= MUSHAF_PAGES; page += 1) {
    if (!khatma.pages.includes(page)) {
      nextPage = page;
      break;
    }
  }
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
    nextPage,
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

/** Called when a page is read. Does nothing when no khatma is active. */
export async function recordKhatmaPage(
  database: SQLiteDatabase,
  pageNumber: number,
  today: string,
): Promise<void> {
  const current = await loadKhatma(database);
  if (current === null) {
    return;
  }
  const next = addKhatmaPage(current, pageNumber, today);
  if (next !== current) {
    await saveKhatma(database, next);
  }
}

/** After a finished khatma: count it and start a new one with the same goal. */
export function restartKhatma(khatma: Khatma, today: string): Khatma {
  const finished = khatma.pages.length >= MUSHAF_PAGES ? 1 : 0;
  return startKhatma(today, khatma.targetDays, [], khatma.completed + finished);
}
