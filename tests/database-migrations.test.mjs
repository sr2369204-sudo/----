import assert from 'node:assert/strict';
import test from 'node:test';

import { initializeDatabase } from '../src/core/database/migrations.ts';

function createDatabase(version) {
  const statements = [];
  return {
    statements,
    async execAsync(sql) {
      statements.push(sql);
    },
    async getFirstAsync(sql) {
      assert.equal(sql, 'PRAGMA user_version;');
      return { user_version: version };
    },
    async withTransactionAsync(callback) {
      await callback();
    },
  };
}

test('creates the initial schema and Mushaf page cache on a fresh database', async () => {
  const database = createDatabase(0);

  await initializeDatabase(database);

  const schema = database.statements.join('\n');
  assert.match(schema, /CREATE TABLE highlights/);
  assert.match(schema, /CREATE TABLE mushaf_page_cache/);
  assert.match(schema, /PRAGMA user_version = 1/);
  assert.match(schema, /PRAGMA user_version = 2/);
});

test('adds the Mushaf page cache to a version-one database', async () => {
  const database = createDatabase(1);

  await initializeDatabase(database);

  const schema = database.statements.join('\n');
  assert.doesNotMatch(schema, /CREATE TABLE highlights/);
  assert.match(schema, /CREATE TABLE mushaf_page_cache/);
  assert.match(schema, /PRAGMA user_version = 2/);
});

test('rejects databases newer than the app schema', async () => {
  const database = createDatabase(3);

  await assert.rejects(initializeDatabase(database), /newer than supported/);
});
