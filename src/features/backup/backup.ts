import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A backup is one piece of plain text: the memorization, bookmarks, notes,
 * highlights, saved words and reading settings, nothing else. It is copied to
 * the clipboard so it can be pasted anywhere (a chat, a note) and pasted back
 * on a new phone. Voice recordings are files, so they are not part of it.
 */
export const BACKUP_FORMAT = 'mushaf-backup';
export const BACKUP_VERSION = 1;

const BACKUP_TABLES = ['highlights', 'notes', 'bookmarks', 'saved_words'] as const;
type BackupTable = (typeof BACKUP_TABLES)[number];

const SETTING_PREFIXES = ['memorization.', 'reader.', 'review.', 'streak.'];
const SETTING_KEYS = ['theme', 'reciterId'];
const MEMORIZED_KEY = 'memorization.heartSurahs';

export type MushafBackup = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  settings: { key: string; value: string }[];
  tables: Record<BackupTable, Record<string, string | number | null>[]>;
};

export type RestoreSummary = {
  settings: number;
  rows: Record<BackupTable, number>;
};

type BackupDatabase = Pick<SQLiteDatabase, 'getAllAsync' | 'runAsync' | 'withTransactionAsync'>;

export function isBackupSettingKey(key: string): boolean {
  if (key.endsWith('.damaged')) {
    return false;
  }
  return SETTING_KEYS.includes(key) || SETTING_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export async function createBackup(database: BackupDatabase): Promise<MushafBackup> {
  const settingRows = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM app_settings',
  );
  const tables = {} as MushafBackup['tables'];
  for (const table of BACKUP_TABLES) {
    tables[table] = await database.getAllAsync<Record<string, string | number | null>>(
      `SELECT * FROM ${table}`,
    );
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settingRows.filter((row) => isBackupSettingKey(row.key)),
    tables,
  };
}

export function serializeBackup(backup: MushafBackup): string {
  return JSON.stringify(backup);
}

/** Reads pasted text and returns a backup, or throws a message the reader can act on. */
export function parseBackup(text: string): MushafBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error('النص المنسوخ ليس نسخة احتياطية من المصحف.');
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as MushafBackup).format !== BACKUP_FORMAT
  ) {
    throw new Error('النص المنسوخ ليس نسخة احتياطية من المصحف.');
  }
  const candidate = parsed as MushafBackup;
  if (candidate.version !== BACKUP_VERSION) {
    throw new Error('هذه النسخة الاحتياطية من إصدار غير مدعوم.');
  }
  if (!Array.isArray(candidate.settings) || typeof candidate.tables !== 'object' || candidate.tables === null) {
    throw new Error('النسخة الاحتياطية ناقصة أو تالفة.');
  }
  for (const entry of candidate.settings) {
    if (!entry || typeof entry.key !== 'string' || typeof entry.value !== 'string') {
      throw new Error('النسخة الاحتياطية ناقصة أو تالفة.');
    }
  }
  for (const table of BACKUP_TABLES) {
    const rows = candidate.tables[table];
    if (rows !== undefined && !Array.isArray(rows)) {
      throw new Error('النسخة الاحتياطية ناقصة أو تالفة.');
    }
  }
  return candidate;
}

function unionSurahs(current: string | undefined, incoming: string): string {
  const read = (value: string | undefined): number[] => {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value) as { surahs?: unknown };
      return Array.isArray(parsed.surahs)
        ? parsed.surahs.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 114)
        : [];
    } catch {
      return [];
    }
  };
  const merged = [...new Set([...read(current), ...read(incoming)])].sort((a, b) => a - b);
  return JSON.stringify({ format: 'mushaf-quran-heart', version: 1, surahs: merged });
}

/**
 * Merges a backup into the phone: rows with the same id are replaced, nothing
 * is deleted, and memorized surahs are added to the ones already marked.
 * Everything happens in one transaction, so a bad file changes nothing.
 */
export async function restoreBackup(
  database: BackupDatabase,
  backup: MushafBackup,
): Promise<RestoreSummary> {
  const summary: RestoreSummary = {
    settings: 0,
    rows: { highlights: 0, notes: 0, bookmarks: 0, saved_words: 0 },
  };
  const columnsByTable = new Map<BackupTable, Set<string>>();
  for (const table of BACKUP_TABLES) {
    const info = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
    columnsByTable.set(table, new Set(info.map((column) => column.name)));
  }
  const existing = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM app_settings',
  );
  const existingByKey = new Map(existing.map((row) => [row.key, row.value]));
  const now = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    for (const { key, value } of backup.settings) {
      if (!isBackupSettingKey(key)) {
        continue;
      }
      const next = key === MEMORIZED_KEY ? unionSurahs(existingByKey.get(key), value) : value;
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        key,
        next,
        now,
      );
      summary.settings += 1;
    }
    for (const table of BACKUP_TABLES) {
      const allowed = columnsByTable.get(table) ?? new Set<string>();
      for (const row of backup.tables[table] ?? []) {
        const columns = Object.keys(row).filter((column) => allowed.has(column));
        if (columns.length === 0) {
          continue;
        }
        await database.runAsync(
          `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
          ...columns.map((column) => row[column] as string | number | null),
        );
        summary.rows[table] += 1;
      }
    }
  });
  return summary;
}
