import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function initializeDatabase(database: SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA foreign_keys = ON;');
  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `Local database version ${currentVersion} is newer than supported version ${DATABASE_VERSION}.`,
    );
  }

  if (currentVersion === DATABASE_VERSION) {
    return;
  }

  await database.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await database.execAsync(`
        CREATE TABLE highlights (
          id TEXT PRIMARY KEY NOT NULL,
          target_type TEXT NOT NULL CHECK (target_type IN ('word', 'ayah', 'range')),
          surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
          ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
          start_word_id TEXT,
          end_word_id TEXT,
          color TEXT NOT NULL CHECK (length(color) = 7 AND substr(color, 1, 1) = '#'),
          opacity REAL NOT NULL CHECK (opacity >= 0 AND opacity <= 1),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK (
            (target_type = 'ayah' AND start_word_id IS NULL AND end_word_id IS NULL) OR
            (target_type = 'word' AND start_word_id IS NOT NULL AND end_word_id IS NULL) OR
            (target_type = 'range' AND start_word_id IS NOT NULL AND end_word_id IS NOT NULL)
          )
        );

        CREATE INDEX highlights_by_ayah
          ON highlights (surah_number, ayah_number, target_type);

        CREATE TABLE notes (
          id TEXT PRIMARY KEY NOT NULL,
          target_type TEXT NOT NULL CHECK (target_type IN ('word', 'ayah', 'range')),
          surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
          ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
          start_word_id TEXT,
          end_word_id TEXT,
          body TEXT NOT NULL CHECK (length(trim(body)) > 0),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK (
            (target_type = 'ayah' AND start_word_id IS NULL AND end_word_id IS NULL) OR
            (target_type = 'word' AND start_word_id IS NOT NULL AND end_word_id IS NULL) OR
            (target_type = 'range' AND start_word_id IS NOT NULL AND end_word_id IS NOT NULL)
          )
        );

        CREATE INDEX notes_by_ayah
          ON notes (surah_number, ayah_number, target_type);

        CREATE TABLE app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        PRAGMA user_version = 1;
      `);
    }
  });
}
