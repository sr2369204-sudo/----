import { File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';

const APK_MIME_TYPE = 'application/vnd.android.package-archive';
const ACTION_VIEW = 'android.intent.action.VIEW';
/** Intent.FLAG_GRANT_READ_URI_PERMISSION: lets the system installer read our file. */
const FLAG_GRANT_READ_URI_PERMISSION = 1;
/** An error page is a few KB; a real APK is many MB. Guards against saving a web page as the APK. */
const MIN_APK_BYTES = 1_000_000;

/**
 * Downloads the APK into the app cache and opens Android's installer for it.
 * The reader still has to allow "install from this app" once and tap Install;
 * Android never installs silently. Resolves when the reader comes back from the
 * installer screen. Throws when the download or the hand-off fails, so the
 * caller can fall back to the download page.
 *
 * `onProgress` gets a number from 0 to 1, or null when the size is unknown.
 */
export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress: (fraction: number | null) => void,
): Promise<void> {
  const destination = new File(Paths.cache, 'mushaf-update.apk');
  if (destination.exists) {
    destination.delete();
  }

  const task = File.createDownloadTask(apkUrl, destination, {
    onProgress: ({ bytesWritten, totalBytes }) => {
      onProgress(totalBytes > 0 ? Math.min(1, bytesWritten / totalBytes) : null);
    },
  });
  const file = await task.downloadAsync();
  if (!file || !file.exists || (file.size ?? 0) < MIN_APK_BYTES) {
    throw new Error('The downloaded file is not a valid APK.');
  }

  await startActivityAsync(ACTION_VIEW, {
    data: file.contentUri,
    type: APK_MIME_TYPE,
    flags: FLAG_GRANT_READ_URI_PERMISSION,
  });
}
