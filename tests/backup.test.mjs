import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

import {
  createBackup,
  parseBackup,
  restoreBackup,
  serializeBackup,
} from '../src/features/backup/backup.ts';
import { initializeDatabase } from '../src/core/database/migrations.ts';

function adapter(sqlite) {
  return {
    async getAllAsync(sql, ...params) {
      return sqlite.prepare(sql).all(...params);
    },
    async getFirstAsync(sql, ...params) {
      return sqlite.prepare(sql).get(...params) ?? null;
    },
    async runAsync(sql, ...params) {
      return sqlite.prepare(sql).run(...params);
    },
    async execAsync(sql) {
      sqlite.exec(sql);
    },
    async withTransactionAsync(task) {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

async function freshDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  const database = adapter(sqlite);
  await initializeDatabase(database);
  return database;
}

const now = '2026-01-01T00:00:00.000Z';

test('a backup restores bookmarks, words and settings on a new database', async () => {
  const source = await freshDatabase();
  await source.runAsync('INSERT INTO bookmarks (id, surah_number, ayah_number, created_at) VALUES (?, ?, ?, ?)', 'b1', 2, 255, now);
  await source.runAsync(
    'INSERT INTO saved_words (id, surah_number, ayah_number, word_id, word_text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    'w1', 1, 2, '1:2:1', 'الحمد', now,
  );
  const heart = JSON.stringify({ format: 'mushaf-quran-heart', version: 1, surahs: [1, 112] });
  await source.runAsync('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)', 'memorization.heartSurahs', heart, now);
  await source.runAsync('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)', 'offline.autoDownload', 'yes', now);

  const text = serializeBackup(await createBackup(source));
  assert.ok(!text.includes('offline.autoDownload'));

  const target = await freshDatabase();
  await target.runAsync('INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)', 'memorization.heartSurahs',
    JSON.stringify({ format: 'mushaf-quran-heart', version: 1, surahs: [114] }), now);
  const summary = await restoreBackup(target, parseBackup(text));
  assert.equal(summary.rows.bookmarks, 1);
  assert.equal(summary.rows.saved_words, 1);

  const bookmarks = await target.getAllAsync('SELECT * FROM bookmarks');
  assert.equal(bookmarks.length, 1);
  const row = await target.getFirstAsync("SELECT value FROM app_settings WHERE key = 'memorization.heartSurahs'");
  assert.deepEqual(JSON.parse(row.value).surahs, [1, 112, 114]);
});

test('rejects text that is not a backup', () => {
  assert.throws(() => parseBackup('hello'), /ليس نسخة/);
  assert.throws(() => parseBackup('{"format":"other"}'), /ليس نسخة/);
});
