import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Remembers when each memorized surah was last reviewed (on the phone only),
 * so the heart screen can say which ones are due. A surah comes due again
 * `REVIEW_INTERVAL_DAYS` days after its last review.
 */
export const REVIEW_KEY = 'review.lastReviewed';
export const REVIEW_INTERVAL_DAYS = 7;
const FORMAT = 'mushaf-review-dates';

export type ReviewDates = Record<number, string>;

export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Damaged or missing text simply means "no review dates yet". */
export function parseReviewDates(value: string | null): ReviewDates {
  if (value === null) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }
    const dates = (parsed as { dates?: unknown }).dates;
    if (typeof dates !== 'object' || dates === null) {
      return {};
    }
    const result: ReviewDates = {};
    for (const [key, date] of Object.entries(dates)) {
      const surah = Number(key);
      if (Number.isInteger(surah) && surah >= 1 && surah <= 114 && isDateKey(date)) {
        result[surah] = date;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function serializeReviewDates(dates: ReviewDates): string {
  return JSON.stringify({ format: FORMAT, version: 1, dates });
}

function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

/**
 * Keeps dates for memorized surahs only. A surah that has no date yet (it was
 * marked before this feature existed, or just now) starts today.
 */
export function reconcileReviewDates(
  memorized: Iterable<number>,
  dates: ReviewDates,
  today: string,
): ReviewDates {
  const next: ReviewDates = {};
  for (const surah of memorized) {
    next[surah] = dates[surah] ?? today;
  }
  return next;
}

export type DueSurah = { surahNumber: number; daysSince: number };

/** Surahs whose last review is at least the interval ago, oldest first. */
export function dueSurahs(
  dates: ReviewDates,
  today: string,
  intervalDays: number = REVIEW_INTERVAL_DAYS,
): DueSurah[] {
  return Object.entries(dates)
    .map(([key, date]) => ({ surahNumber: Number(key), daysSince: daysBetween(date, today) }))
    .filter((item) => item.daysSince >= intervalDays)
    .sort((left, right) => right.daysSince - left.daysSince || left.surahNumber - right.surahNumber);
}

export async function loadReviewDates(database: SQLiteDatabase): Promise<ReviewDates> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    REVIEW_KEY,
  );
  return parseReviewDates(row?.value ?? null);
}

export async function saveReviewDates(database: SQLiteDatabase, dates: ReviewDates): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    REVIEW_KEY,
    serializeReviewDates(dates),
    new Date().toISOString(),
  );
}
