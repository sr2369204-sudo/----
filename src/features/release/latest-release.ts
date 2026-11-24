/**
 * Pure helpers for the "latest APK" notice. No imports on purpose, so the node
 * tests can load this file directly.
 *
 * The app downloads `latest-release.json` from the repository (see
 * docs/releasing.md) and compares its version with the installed build.
 */

export type LatestRelease = {
  version: string;
  apkUrl: string;
};

/** Where the app looks for the newest APK. Raw file of the main branch. */
export const LATEST_RELEASE_URL =
  'https://raw.githubusercontent.com/sr2369204-sudo/----/main/latest-release.json';

/** Splits "1.0.12" into [1, 0, 12]. Returns null for anything that is not dotted numbers. */
export function parseVersion(value: unknown): number[] | null {
  if (typeof value !== 'string' || !/^\d+(\.\d+){0,3}$/.test(value.trim())) {
    return null;
  }
  return value.trim().split('.').map(Number);
}

/** Negative when a < b, 0 when equal, positive when a > b. Null when either is not a version. */
export function compareVersions(a: string, b: string): number | null {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) {
    return null;
  }
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

/** Accepts the downloaded JSON only when it has a real version and an https link. */
export function parseLatestRelease(value: unknown): LatestRelease | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { version, apkUrl } = value as Record<string, unknown>;
  if (parseVersion(version) === null || typeof apkUrl !== 'string') {
    return null;
  }
  if (!/^https:\/\/[^\s]+$/.test(apkUrl.trim())) {
    return null;
  }
  return { version: (version as string).trim(), apkUrl: apkUrl.trim() };
}

/** True only when the newest APK is strictly newer than the installed build. */
export function isNewerRelease(installedVersion: string | null, latest: LatestRelease): boolean {
  if (installedVersion === null) {
    return false;
  }
  const result = compareVersions(latest.version, installedVersion);
  return result !== null && result > 0;
}
