import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  compareVersions,
  isNewerRelease,
  parseLatestRelease,
} from '../src/features/release/latest-release.ts';

test('compares dotted versions numerically, not as text', () => {
  assert.ok(compareVersions('1.0.10', '1.0.9') > 0);
  assert.ok(compareVersions('1.0.0', '1.0.1') < 0);
  assert.equal(compareVersions('1.0', '1.0.0'), 0);
  assert.equal(compareVersions('abc', '1.0.0'), null);
});

test('any older build is told about the newest release directly', () => {
  const latest = { version: '1.0.9', apkUrl: 'https://example.com/a.apk' };
  assert.equal(isNewerRelease('1.0.0', latest), true);
  assert.equal(isNewerRelease('1.0.8', latest), true);
  assert.equal(isNewerRelease('1.0.9', latest), false);
  assert.equal(isNewerRelease('2.0.0', latest), false);
  assert.equal(isNewerRelease(null, latest), false);
});

test('rejects a malformed or unsafe release file', () => {
  assert.equal(parseLatestRelease(null), null);
  assert.equal(parseLatestRelease({ version: 'x', apkUrl: 'https://a.b/c' }), null);
  assert.equal(parseLatestRelease({ version: '1.0.1', apkUrl: 'http://a.b/c' }), null);
  assert.equal(parseLatestRelease({ version: '1.0.1', apkUrl: 'javascript:alert(1)' }), null);
  assert.deepEqual(parseLatestRelease({ version: '1.0.1', apkUrl: 'https://a.b/c' }), {
    version: '1.0.1',
    apkUrl: 'https://a.b/c',
  });
});

test('the committed latest-release.json is valid and not ahead of app.json', () => {
  const file = parseLatestRelease(JSON.parse(readFileSync('latest-release.json', 'utf8')));
  assert.ok(file, 'latest-release.json must have a version and an https apkUrl');
  const app = JSON.parse(readFileSync('app.json', 'utf8')).expo.version;
  assert.ok(compareVersions(file.version, app) <= 0, 'release file version is ahead of app.json');
});
