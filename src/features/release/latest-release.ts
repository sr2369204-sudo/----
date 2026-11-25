/**
 * Pure helpers for the "latest APK" notice. No imports on purpose, so the node
 * tests can load this file directly.
 *
 * The app downloads `latest-release.json` from the repository (see
 * docs/releasing.md) and compares its version with the installed build.
 */

export type LatestRelease = {
  version: string;
  /** Main link. A direct .apk link is installed inside the app; a download page opens in the browser. */
  apkUrl: string;
  /** Opened in the browser if the main link is a page, or if the in-app download fails. */
  fallbackUrl: string;
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

/**
 * True when the link is the APK file itself (path ends in .apk), which the app can
 * download and install on its own. A download page such as MediaFire's
 * (".../mushaf.apk/file") is not, and is opened in the browser instead.
 */
export function isDirectApkLink(url: string): boolean {
  try {
    return new URL(url).pathname.toLowerCase().endsWith('.apk');
  } catch {
    return false;
  }
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

function isHttpsUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https:\/\/[^\s]+$/.test(value.trim());
}

/** Accepts the downloaded JSON only when it has a real version and an https link. */
export function parseLatestRelease(value: unknown): LatestRelease | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { version, apkUrl, fallbackUrl } = value as Record<string, unknown>;
  if (parseVersion(version) === null || !isHttpsUrl(apkUrl)) {
    return null;
  }
  // The fallback is optional in the file; without it the direct link doubles as the fallback.
  const fallback = isHttpsUrl(fallbackUrl) ? fallbackUrl.trim() : apkUrl.trim();
  return { version: (version as string).trim(), apkUrl: apkUrl.trim(), fallbackUrl: fallback };
}

/** True only when the newest APK is strictly newer than the installed build. */
export function isNewerRelease(installedVersion: string | null, latest: LatestRelease): boolean {
  if (installedVersion === null) {
    return false;
  }
  const result = compareVersions(latest.version, installedVersion);
  return result !== null && result > 0;
}
