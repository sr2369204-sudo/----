import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 9;

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

    if (currentVersion < 2) {
      await database.execAsync(`
        CREATE TABLE mushaf_page_cache (
          page_number INTEGER NOT NULL CHECK (page_number BETWEEN 1 AND 604),
          mushaf_id INTEGER NOT NULL,
          page_json TEXT NOT NULL,
          page_sha256 TEXT NOT NULL CHECK (length(page_sha256) = 64),
          font_data BLOB NOT NULL CHECK (length(font_data) > 4),
          font_sha256 TEXT NOT NULL CHECK (length(font_sha256) = 64),
          cached_at TEXT NOT NULL,
          PRIMARY KEY (page_number, mushaf_id)
        );

        PRAGMA user_version = 2;
      `);
    }

    if (currentVersion < 3) {
      await database.execAsync(`
        DELETE FROM mushaf_page_cache;
        PRAGMA user_version = 3;
      `);
    }

    if (currentVersion < 4) {
      await database.execAsync(`
        DELETE FROM mushaf_page_cache;
        PRAGMA user_version = 4;
      `);
    }

    if (currentVersion < 5) {
      await database.execAsync(`
        ALTER TABLE mushaf_page_cache ADD COLUMN basmala_font_data BLOB;
        ALTER TABLE mushaf_page_cache ADD COLUMN basmala_font_sha256 TEXT;
        DELETE FROM mushaf_page_cache;
        PRAGMA user_version = 5;
      `);
    }

    if (currentVersion < 6) {
      await database.execAsync(`
        CREATE TABLE bookmarks (
          id TEXT PRIMARY KEY NOT NULL,
          surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
          ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
          created_at TEXT NOT NULL,
          UNIQUE (surah_number, ayah_number)
        );

        CREATE INDEX bookmarks_by_reference
          ON bookmarks (surah_number, ayah_number);

        PRAGMA user_version = 6;
      `);
    }

    if (currentVersion < 7) {
      await database.execAsync(`
        CREATE TABLE saved_words (
          id TEXT PRIMARY KEY NOT NULL,
          surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
          ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
          word_id TEXT NOT NULL CHECK (length(word_id) > 0),
          word_text TEXT NOT NULL CHECK (length(word_text) > 0),
          created_at TEXT NOT NULL,
          UNIQUE (surah_number, ayah_number, word_id)
        );

        CREATE INDEX saved_words_by_reference
          ON saved_words (surah_number, ayah_number);

        PRAGMA user_version = 7;
      `);
    }

    if (currentVersion < 8) {
      await database.execAsync(`
        CREATE TABLE quran_content_cache (
          cache_key TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        PRAGMA user_version = 8;
      `);
    }

    if (currentVersion < 9) {
      await database.execAsync(`
        CREATE TABLE word_voice_notes (
          id TEXT PRIMARY KEY NOT NULL,
          surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
          ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
          word_id TEXT NOT NULL CHECK (length(word_id) > 0),
          file_uri TEXT NOT NULL CHECK (length(file_uri) > 0),
          duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
          created_at TEXT NOT NULL
        );

        CREATE INDEX word_voice_notes_by_word
          ON word_voice_notes (surah_number, ayah_number, word_id);

        PRAGMA user_version = 9;
      `);
    }
  });
}
