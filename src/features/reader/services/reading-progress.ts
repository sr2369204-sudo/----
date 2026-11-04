import type { SQLiteDatabase } from 'expo-sqlite';

const DAILY_PLAN_KEY = 'reader.dailyReadingPlan';
const LAST_POSITION_KEY = 'reader.lastPosition';
const DAILY_PLAN_FORMAT = 'mushaf-daily-reading-plan';
const LAST_POSITION_FORMAT = 'mushaf-last-reading-position';

export const DEFAULT_DAILY_AYAH_TARGET = 20;
export const DAILY_AYAH_TARGET_STEP = 5;
export const MAX_DAILY_AYAH_TARGET = 500;

export type DailyReadingPlan = {
  date: string;
  targetAyahs: number;
  completedAyahs: string[];
};

export type AyahReference = {
  surahNumber: number;
  ayahNumber: number;
};

export type LastReadingPosition = {
  surahNumber: number;
  ayahNumber: number;
  pageNumber: number;
};

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDailyReadingPlan(
  value: string | null,
  date: Date = new Date(),
): DailyReadingPlan {
  const today = getLocalDateKey(date);
  if (value === null) {
    return { date: today, targetAyahs: DEFAULT_DAILY_AYAH_TARGET, completedAyahs: [] };
  }

  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || parsed.format !== DAILY_PLAN_FORMAT || !isValidDate(parsed.date)) {
    throw new Error('بيانات خطة القراءة اليومية المحفوظة غير صالحة.');
  }

  if (parsed.version === 1) {
    if (
      !isValidPageTarget(parsed.targetPages) ||
      !Array.isArray(parsed.visitedPages) ||
      !parsed.visitedPages.every(isValidPageNumber)
    ) {
      throw new Error('بيانات خطة القراءة اليومية المحفوظة غير صالحة.');
    }
    return { date: today, targetAyahs: DEFAULT_DAILY_AYAH_TARGET, completedAyahs: [] };
  }

  if (
    parsed.version !== 2 ||
    !isValidAyahTarget(parsed.targetAyahs) ||
    !Array.isArray(parsed.completedAyahs) ||
    !parsed.completedAyahs.every(isValidAyahReferenceKey)
  ) {
    throw new Error('بيانات خطة القراءة اليومية المحفوظة غير صالحة.');
  }

  const completedAyahs = [...new Set(parsed.completedAyahs as string[])];
  return {
    date: today,
    targetAyahs: parsed.targetAyahs,
    completedAyahs: parsed.date === today ? completedAyahs : [],
  };
}

export function serializeDailyReadingPlan(plan: DailyReadingPlan): string {
  validatePlan(plan);
  return JSON.stringify({
    format: DAILY_PLAN_FORMAT,
    version: 2,
    ...plan,
  });
}

export function toggleDailyAyahs(
  plan: DailyReadingPlan,
  references: AyahReference[],
): DailyReadingPlan {
  validatePlan(plan);
  if (references.length === 0 || !references.every(isValidAyahReference)) {
    throw new RangeError('حدد آية واحدة على الأقل من المصحف.');
  }
  const keys = [...new Set(references.map(ayahReferenceKey))];
  const completed = new Set(plan.completedAyahs);
  const remove = keys.every((key) => completed.has(key));
  for (const key of keys) {
    if (remove) {
      completed.delete(key);
    } else {
      completed.add(key);
    }
  }
  return { ...plan, completedAyahs: [...completed].sort(compareAyahKeys) };
}

export function parseLastReadingPosition(value: string | null): LastReadingPosition | null {
  if (value === null) {
    return null;
  }
  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    parsed.format !== LAST_POSITION_FORMAT ||
    parsed.version !== 1 ||
    !isValidSurahNumber(parsed.surahNumber) ||
    !Number.isInteger(parsed.ayahNumber) ||
    (parsed.ayahNumber as number) < 1 ||
    (parsed.ayahNumber as number) > 286 ||
    !isValidPageNumber(parsed.pageNumber)
  ) {
    throw new Error('موضع القراءة المحفوظ غير صالح.');
  }
  return {
    surahNumber: parsed.surahNumber,
    ayahNumber: parsed.ayahNumber as number,
    pageNumber: parsed.pageNumber,
  };
}

export async function loadDailyReadingPlan(
  database: SQLiteDatabase,
  date: Date = new Date(),
): Promise<DailyReadingPlan> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    DAILY_PLAN_KEY,
  );
  const plan = parseDailyReadingPlan(row?.value ?? null, date);
  if (row && (plan.date !== getStoredPlanDate(row.value) || getStoredPlanVersion(row.value) !== 2)) {
    await saveSetting(database, DAILY_PLAN_KEY, serializeDailyReadingPlan(plan));
  }
  return plan;
}

export async function setDailyAyahTarget(
  database: SQLiteDatabase,
  targetAyahs: number,
  date: Date = new Date(),
): Promise<DailyReadingPlan> {
  if (!isValidAyahTarget(targetAyahs)) {
    throw new RangeError(`هدف القراءة يجب أن يكون بين ١ و${MAX_DAILY_AYAH_TARGET} آية.`);
  }
  const plan = await loadDailyReadingPlan(database, date);
  const updated = { ...plan, targetAyahs };
  await saveSetting(database, DAILY_PLAN_KEY, serializeDailyReadingPlan(updated));
  return updated;
}

export async function toggleDailyAyahCompletion(
  database: SQLiteDatabase,
  references: AyahReference[],
  date: Date = new Date(),
): Promise<DailyReadingPlan> {
  const plan = await loadDailyReadingPlan(database, date);
  const updated = toggleDailyAyahs(plan, references);
  if (updated.completedAyahs !== plan.completedAyahs) {
    await saveSetting(database, DAILY_PLAN_KEY, serializeDailyReadingPlan(updated));
  }
  return updated;
}

export async function loadLastReadingPosition(
  database: SQLiteDatabase,
): Promise<LastReadingPosition | null> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    LAST_POSITION_KEY,
  );
  return parseLastReadingPosition(row?.value ?? null);
}

export async function saveLastReadingPosition(
  database: SQLiteDatabase,
  position: LastReadingPosition,
): Promise<void> {
  if (
    !isValidSurahNumber(position.surahNumber) ||
    !Number.isInteger(position.ayahNumber) ||
    position.ayahNumber < 1 ||
    position.ayahNumber > 286 ||
    !isValidPageNumber(position.pageNumber)
  ) {
    throw new RangeError('موضع القراءة غير صالح.');
  }
  await saveSetting(
    database,
    LAST_POSITION_KEY,
    JSON.stringify({
      format: LAST_POSITION_FORMAT,
      version: 1,
      ...position,
    }),
  );
}

async function saveSetting(
  database: SQLiteDatabase,
  key: string,
  value: string,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    value,
    new Date().toISOString(),
  );
}

function getStoredPlanDate(value: string): string {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || !isValidDate(parsed.date)) {
    throw new Error('بيانات خطة القراءة اليومية المحفوظة غير صالحة.');
  }
  return parsed.date;
}

function getStoredPlanVersion(value: string): number {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || !Number.isInteger(parsed.version)) {
    throw new Error('بيانات خطة القراءة اليومية المحفوظة غير صالحة.');
  }
  return parsed.version as number;
}

function validatePlan(plan: DailyReadingPlan): void {
  if (
    !isValidDate(plan.date) ||
    !isValidAyahTarget(plan.targetAyahs) ||
    !Array.isArray(plan.completedAyahs) ||
    !plan.completedAyahs.every(isValidAyahReferenceKey)
  ) {
    throw new RangeError('بيانات خطة القراءة اليومية غير صالحة.');
  }
}

function isValidPageTarget(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 100;
}

function isValidPageNumber(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 604;
}

function isValidAyahTarget(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_DAILY_AYAH_TARGET;
}

function isValidAyahReference(value: unknown): value is AyahReference {
  return (
    isRecord(value) &&
    isValidSurahNumber(value.surahNumber) &&
    Number.isInteger(value.ayahNumber) &&
    (value.ayahNumber as number) >= 1 &&
    (value.ayahNumber as number) <= 286
  );
}

function isValidAyahReferenceKey(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const match = /^(\d{1,3}):(\d{1,3})$/.exec(value);
  return Boolean(match && isValidAyahReference({
    surahNumber: Number(match[1]),
    ayahNumber: Number(match[2]),
  }));
}

function ayahReferenceKey(reference: AyahReference): string {
  return `${reference.surahNumber}:${reference.ayahNumber}`;
}

function compareAyahKeys(first: string, second: string): number {
  const [firstSurah, firstAyah] = first.split(':').map(Number);
  const [secondSurah, secondAyah] = second.split(':').map(Number);
  return firstSurah - secondSurah || firstAyah - secondAyah;
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidSurahNumber(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 114;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
