import * as Updates from 'expo-updates';
import { Linking, Platform } from 'react-native';

/**
 * The native build that contains every native module the current JavaScript
 * needs. The Quran Heart draws with `react-native-svg`, which is native, and
 * `expo-updates` ships JavaScript only — so a device whose binary predates that
 * library can still download this code and then die the moment the Heart
 * renders. The app uses the `appVersion` runtime-version policy, so a build's
 * runtime version is exactly the `version` in `app.json`; that is what makes
 * the two binaries distinguishable here.
 */
export const LATEST_NATIVE_VERSION = '1.0.1';

/**
 * Download page of the signed Android build, hosted on MediaFire. The file's
 * *page* URL is used on purpose: MediaFire hands out a different direct file
 * link on every request, so a captured direct link expires and would leave old
 * devices with a dead download. The page URL stays valid for as long as the
 * file exists.
 */
export const ANDROID_APK_URL =
  'https://www.mediafire.com/file/ueg0wlpbsg47ou1/mushaf.apk/file';

/** True when the installed binary is older than the JavaScript it is running. */
export function isNativeUpdateRequired(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  const runtimeVersion = Updates.runtimeVersion;
  // A missing runtime version means updates are off (web, Expo Go, a dev
  // client), so there is nothing to compare and nothing to upgrade from.
  return runtimeVersion !== null && runtimeVersion !== LATEST_NATIVE_VERSION;
}

/** Hands the APK to the browser, which passes it to the system installer. */
export function openAndroidUpdateDownload(): Promise<unknown> {
  return Linking.openURL(ANDROID_APK_URL);
}
