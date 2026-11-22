import type { SQLiteDatabase } from 'expo-sqlite';

import { Colors } from '@/constants/theme';

const APPEARANCE_KEY = 'memorization.heartAppearance';
const FORMAT = 'mushaf-heart-appearance';
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Every part of the heart map whose colour the reader can change. */
export type HeartColorKey =
  | 'background'
  | 'cellFill'
  | 'memorizedFill'
  | 'labelColor'
  | 'memorizedLabelColor'
  | 'focusStroke';

export type HeartPalette = Record<HeartColorKey, string>;

/** Only the keys the reader actually changed; the rest follow the theme. */
export type HeartColorOverrides = Partial<Record<HeartColorKey, string>>;

export const HEART_COLOR_FIELDS: { key: HeartColorKey; label: string }[] = [
  { key: 'background', label: 'الخلفية' },
  { key: 'cellFill', label: 'خلية غير محفوظة' },
  { key: 'memorizedFill', label: 'خلية محفوظة' },
  { key: 'labelColor', label: 'اسم غير محفوظ' },
  { key: 'memorizedLabelColor', label: 'اسم محفوظ' },
  { key: 'focusStroke', label: 'إطار السورة المحدّدة' },
];

/** Swatches offered per element — emerald/gold house palette plus neutrals. */
export const HEART_COLOR_SWATCHES: string[] = [
  '#0E7A57',
  '#2FBF90',
  '#0A5C42',
  '#0B4030',
  '#173A2C',
  '#0A2419',
  '#08201A',
  '#12211C',
  '#3F3F46',
  '#6C7D76',
  '#98ABA3',
  '#DDE8E2',
  '#EFF4F1',
  '#FFFDF8',
  '#FFFFFF',
  '#F0E0BE',
  '#C9973C',
  '#E3B75E',
  '#B4485A',
  '#6C4AB6',
  '#2B3A55',
  '#000000',
];

/** The look the map ships with: emerald cells on the page background. */
export function defaultHeartPalette(theme: 'light' | 'dark'): HeartPalette {
  const palette = Colors[theme];
  return {
    background: palette.background,
    cellFill: theme === 'dark' ? '#173A2C' : '#DDE8E2',
    memorizedFill: palette.primary,
    labelColor: palette.text,
    memorizedLabelColor: palette.onPrimary,
    focusStroke: palette.accent,
  };
}

/** Theme defaults with the reader's choices layered on top. */
export function resolveHeartPalette(
  theme: 'light' | 'dark',
  overrides: HeartColorOverrides,
): HeartPalette {
  return { ...defaultHeartPalette(theme), ...overrides };
}

export function parseHeartColorOverrides(value: string | null): HeartColorOverrides {
  if (value === null) {
    return {};
  }
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || parsed.format !== FORMAT || parsed.version !== 1) {
    throw new Error('بيانات ألوان القلب المحفوظة غير صالحة.');
  }
  if (!isRecord(parsed.colors)) {
    throw new Error('بيانات ألوان القلب المحفوظة غير صالحة.');
  }
  const overrides: HeartColorOverrides = {};
  for (const { key } of HEART_COLOR_FIELDS) {
    const color = parsed.colors[key];
    if (color === undefined) {
      continue;
    }
    if (typeof color !== 'string' || !HEX_RE.test(color)) {
      throw new Error('لون محفوظ غير صالح.');
    }
    overrides[key] = color;
  }
  return overrides;
}

export function serializeHeartColorOverrides(overrides: HeartColorOverrides): string {
  const colors: HeartColorOverrides = {};
  for (const { key } of HEART_COLOR_FIELDS) {
    const color = overrides[key];
    if (color === undefined) {
      continue;
    }
    if (!HEX_RE.test(color)) {
      throw new Error('لون غير صالح: يجب أن يكون بصيغة #RRGGBB.');
    }
    colors[key] = color;
  }
  return JSON.stringify({ format: FORMAT, version: 1, colors });
}

export async function loadHeartColorOverrides(
  database: SQLiteDatabase,
): Promise<HeartColorOverrides> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    APPEARANCE_KEY,
  );
  return parseHeartColorOverrides(row?.value ?? null);
}

export async function saveHeartColorOverrides(
  database: SQLiteDatabase,
  overrides: HeartColorOverrides,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    APPEARANCE_KEY,
    serializeHeartColorOverrides(overrides),
    new Date().toISOString(),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
