import type { SQLiteDatabase } from 'expo-sqlite';

import { HEART_CELLS } from '@/features/memorization/data/heart-cells';

const MEMORIZED_KEY = 'memorization.heartSurahs';
const FORMAT = 'mushaf-quran-heart';

/** Ayah total of the Mushaf, derived from the heart geometry itself. */
const TOTAL_AYAHS = HEART_CELLS.reduce((sum, cell) => sum + cell.ayahCount, 0);

export type HeartProgress = {
  /** Surah numbers currently marked as memorized, ascending. */
  memorizedSurahs: number[];
  memorizedCount: number;
  remainingCount: number;
  totalCount: number;
  memorizedAyahs: number;
  totalAyahs: number;
  /** Ayah-weighted completion, 0..100. */
  percentage: number;
};

/** Parses the stored payload; `[]` means "nothing memorized yet". */
export function parseMemorizedSurahs(value: string | null): number[] {
  if (value === null) {
    return [];
  }
  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    parsed.format !== FORMAT ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.surahs) ||
    !parsed.surahs.every(isValidSurahNumber)
  ) {
    throw new Error('بيانات الحفظ المحفوظة غير صالحة.');
  }
  return [...new Set(parsed.surahs as number[])].sort((a, b) => a - b);
}

export function serializeMemorizedSurahs(surahs: number[]): string {
  const unique = [...new Set(surahs)];
  if (!unique.every(isValidSurahNumber)) {
    throw new RangeError('رقم السورة المرجعي غير صالح.');
  }
  return JSON.stringify({
    format: FORMAT,
    version: 1,
    surahs: unique.sort((a, b) => a - b),
  });
}

export async function loadMemorizedSurahs(database: SQLiteDatabase): Promise<number[]> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    MEMORIZED_KEY,
  );
  return parseMemorizedSurahs(row?.value ?? null);
}

export async function saveMemorizedSurahs(
  database: SQLiteDatabase,
  surahs: number[],
): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    MEMORIZED_KEY,
    serializeMemorizedSurahs(surahs),
    new Date().toISOString(),
  );
}

/** Ayah-weighted progress for the map header. */
export function computeHeartProgress(memorized: Iterable<number>): HeartProgress {
  const set = memorized instanceof Set ? memorized : new Set(memorized);
  let memorizedAyahs = 0;
  let memorizedCount = 0;
  for (const cell of HEART_CELLS) {
    if (set.has(cell.surahNumber)) {
      memorizedCount += 1;
      memorizedAyahs += cell.ayahCount;
    }
  }
  const percentage = TOTAL_AYAHS === 0
    ? 0
    : Math.round((memorizedAyahs / TOTAL_AYAHS) * 100);
  return {
    memorizedSurahs: [...set].sort((a, b) => a - b),
    memorizedCount,
    remainingCount: HEART_CELLS.length - memorizedCount,
    totalCount: HEART_CELLS.length,
    memorizedAyahs,
    totalAyahs: TOTAL_AYAHS,
    percentage,
  };
}

function isValidSurahNumber(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 114;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
