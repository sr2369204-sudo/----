import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A private reading log kept on the phone: which Mushaf pages were really
 * read (for the "ختمتك" bar) and on which days the reader read (for the
 * streak). Nothing leaves the device.
 */
export const HISTORY_KEY = 'streak.history';
const FORMAT = 'mushaf-reading-history';
const MAX_DAYS = 800;

export type ReadingHistory = {
  /** Pages read at least once, 1..604, ascending. */
  pages: number[];
  /** Days (YYYY-MM-DD) with any reading, ascending. */
  days: string[];
};

export const EMPTY_HISTORY: ReadingHistory = { pages: [], days: [] };

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseReadingHistory(value: string | null): ReadingHistory {
  if (value === null) {
    return EMPTY_HISTORY;
  }
  try {
    const parsed = JSON.parse(value) as { pages?: unknown; days?: unknown };
    const pages = Array.isArray(parsed.pages)
      ? parsed.pages.filter((p): p is number => Number.isInteger(p) && p >= 1 && p <= 604)
      : [];
    const days = Array.isArray(parsed.days) ? parsed.days.filter(isDateKey) : [];
    return {
      pages: [...new Set(pages)].sort((a, b) => a - b),
      days: [...new Set(days)].sort(),
    };
  } catch {
    return EMPTY_HISTORY;
  }
}

export function serializeReadingHistory(history: ReadingHistory): string {
  return JSON.stringify({ format: FORMAT, version: 1, ...history });
}

export function addPageRead(history: ReadingHistory, pageNumber: number, today: string): ReadingHistory {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
    return history;
  }
  const pages = history.pages.includes(pageNumber)
    ? history.pages
    : [...history.pages, pageNumber].sort((a, b) => a - b);
  const days = history.days.includes(today) ? history.days : [...history.days, today].sort();
  if (pages === history.pages && days === history.days) {
    return history;
  }
  return { pages, days: days.slice(-MAX_DAYS) };
}

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + delta));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Consecutive days ending today. A streak that ended yesterday still counts,
 * so it does not show zero in the morning before the reader has opened the Mushaf.
 */
export function currentStreak(days: string[], today: string): number {
  const set = new Set(days);
  let cursor = set.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export async function loadReadingHistory(database: SQLiteDatabase): Promise<ReadingHistory> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    HISTORY_KEY,
  );
  return parseReadingHistory(row?.value ?? null);
}

export async function recordPageRead(
  database: SQLiteDatabase,
  pageNumber: number,
  today: string,
): Promise<ReadingHistory> {
  const current = await loadReadingHistory(database);
  const next = addPageRead(current, pageNumber, today);
  if (next !== current) {
    await database.runAsync(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      HISTORY_KEY,
      serializeReadingHistory(next),
      new Date().toISOString(),
    );
  }
  return next;
}
