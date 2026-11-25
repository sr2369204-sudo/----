import type { SQLiteDatabase } from 'expo-sqlite';

import type { AzkarItem, AzkarSetId } from '@/features/azkar/data/azkar';

/**
 * Today's azkar counts, kept on the phone. The counts start over each new day.
 * Keys look like `morning:kursi`.
 */
export const AZKAR_KEY = 'azkar.progress';
const FORMAT = 'mushaf-azkar-progress';

export type AzkarProgress = {
  date: string;
  counts: Record<string, number>;
};

export function emptyAzkarProgress(today: string): AzkarProgress {
  return { date: today, counts: {} };
}

export function azkarKey(setId: AzkarSetId, itemId: string): string {
  return `${setId}:${itemId}`;
}

export function parseAzkarProgress(value: string | null, today: string): AzkarProgress {
  if (value === null) {
    return emptyAzkarProgress(today);
  }
  try {
    const parsed = JSON.parse(value) as { date?: unknown; counts?: unknown };
    if (parsed.date !== today || typeof parsed.counts !== 'object' || parsed.counts === null) {
      return emptyAzkarProgress(today);
    }
    const counts: Record<string, number> = {};
    for (const [key, count] of Object.entries(parsed.counts)) {
      if (Number.isInteger(count) && (count as number) > 0) {
        counts[key] = count as number;
      }
    }
    return { date: today, counts };
  } catch {
    return emptyAzkarProgress(today);
  }
}

export function serializeAzkarProgress(progress: AzkarProgress): string {
  return JSON.stringify({ format: FORMAT, version: 1, ...progress });
}

/** One tap on an item. The count stops at the item's target. */
export function tapAzkarItem(
  progress: AzkarProgress,
  setId: AzkarSetId,
  item: AzkarItem,
): AzkarProgress {
  const key = azkarKey(setId, item.id);
  const current = progress.counts[key] ?? 0;
  if (current >= item.count) {
    return progress;
  }
  return { ...progress, counts: { ...progress.counts, [key]: current + 1 } };
}

export function resetAzkarSet(
  progress: AzkarProgress,
  setId: AzkarSetId,
): AzkarProgress {
  const counts = Object.fromEntries(
    Object.entries(progress.counts).filter(([key]) => !key.startsWith(`${setId}:`)),
  );
  return { ...progress, counts };
}

export function azkarSetSummary(
  progress: AzkarProgress,
  setId: AzkarSetId,
  items: AzkarItem[],
): { done: number; total: number } {
  let done = 0;
  for (const item of items) {
    if ((progress.counts[azkarKey(setId, item.id)] ?? 0) >= item.count) {
      done += 1;
    }
  }
  return { done, total: items.length };
}

export async function loadAzkarProgress(
  database: SQLiteDatabase,
  today: string,
): Promise<AzkarProgress> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    AZKAR_KEY,
  );
  return parseAzkarProgress(row?.value ?? null, today);
}

export async function saveAzkarProgress(
  database: SQLiteDatabase,
  progress: AzkarProgress,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    AZKAR_KEY,
    serializeAzkarProgress(progress),
    new Date().toISOString(),
  );
}
