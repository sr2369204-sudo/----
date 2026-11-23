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
 * Direct download of the signed Android build, attached to the matching GitHub
 * release. The link must stay valid forever, which a release asset does and a
 * build-artifact URL does not. Replace `mohamedsaeed7` with the account that
 * hosts the release.
 */
export const ANDROID_APK_URL =
  'https://github.com/mohamedsaeed7/mushaf/releases/latest/download/mushaf.apk';

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
