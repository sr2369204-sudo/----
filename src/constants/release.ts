import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Linking, Platform } from 'react-native';

import {
  compareVersions,
  isNewerRelease,
  LATEST_RELEASE_URL,
  type LatestRelease,
  parseLatestRelease,
} from '@/features/release/latest-release';

/**
 * The first native build that contains `react-native-svg`, which the Quran
 * Heart draws with. `expo-updates` ships JavaScript only, so an older binary
 * can download this code and then die the moment the Heart renders.
 */
export const HEART_MIN_NATIVE_VERSION = '1.0.1';

/**
 * Used only when `latest-release.json` cannot be downloaded (no internet, file
 * missing). The real answer comes from that file, so old builds learn about new
 * APKs without any new code. Download page of the signed Android build on
 * MediaFire; the file's *page* URL is used on purpose because MediaFire hands
 * out a different direct link on every request.
 */
const FALLBACK_RELEASE: LatestRelease = {
  version: HEART_MIN_NATIVE_VERSION,
  apkUrl: 'https://www.mediafire.com/file/ueg0wlpbsg47ou1/mushaf.apk/file',
};

/** Installed native build version, or null when updates are off (web, Expo Go, dev client). */
export function getInstalledNativeVersion(): string | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  return Updates.runtimeVersion ?? null;
}

/** True when the installed binary predates the native code the Heart needs. */
export function isNativeUpdateRequired(): boolean {
  const installed = getInstalledNativeVersion();
  if (installed === null) {
    return false;
  }
  const result = compareVersions(installed, HEART_MIN_NATIVE_VERSION);
  return result !== null && result < 0;
}

async function fetchLatestRelease(signal: AbortSignal): Promise<LatestRelease> {
  try {
    const response = await fetch(`${LATEST_RELEASE_URL}?t=${Date.now()}`, {
      signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      return FALLBACK_RELEASE;
    }
    return parseLatestRelease(await response.json()) ?? FALLBACK_RELEASE;
  } catch {
    return FALLBACK_RELEASE;
  }
}

/**
 * The newest APK when it is newer than the installed build, otherwise null.
 * Shows nothing on web / dev builds and when the check fails offline.
 */
export function useNewerRelease(): LatestRelease | null {
  const [release, setRelease] = useState<LatestRelease | null>(null);

  useEffect(() => {
    const installed = getInstalledNativeVersion();
    if (installed === null) {
      return;
    }
    const controller = new AbortController();
    void fetchLatestRelease(controller.signal).then((latest) => {
      if (!controller.signal.aborted && isNewerRelease(installed, latest)) {
        setRelease(latest);
      }
    });
    return () => controller.abort();
  }, []);

  return release;
}

/** Hands the APK link to the browser, which passes the file to the system installer. */
export function openAndroidUpdateDownload(apkUrl: string = FALLBACK_RELEASE.apkUrl): Promise<void> {
  return Linking.openURL(apkUrl);
}
