# Releasing

> One-time setup: the workflow change that publishes releases is saved as
> `docs/release-workflow.patch` because the push token cannot edit workflow files. Apply it once:
> `git apply docs/release-workflow.patch` and commit it (or paste steps 8 and 9 and the
> `permissions: contents: write` lines into `.github/workflows/main.yml` on GitHub). Until then,
> upload `mushaf.apk` to a GitHub Release named `v<version>` by hand and edit `latest-release.json`.

## Normal change (screens, text, logic, images)
Push to `main`. The workflow publishes an over-the-air update. Keep `version` in
`app.json` unchanged: with the `appVersion` runtime policy an update only reaches
phones whose installed APK has the same version. Phones check for the update when
the app opens and ask the reader to install it.

## Change that needs a new APK (new native library, new permission, icon, Expo upgrade)
1. Bump `version` in `app.json` and `package.json` (for example 1.0.2 to 1.0.3). Merge to `main`.
2. Actions > "Build Mushaf APK" > Run workflow, branch `main`.
3. The workflow builds the APK, attaches it to a GitHub Release named `v<version>`, and
   commits `latest-release.json` with the new version (message ends with `[skip ci]`).
   The APK link never changes:
   https://github.com/sr2369204-sudo/----/releases/latest/download/mushaf.apk
4. Done. Installed apps that open and are older than `latest-release.json`'s version show the
   "new version" banner. The button downloads the APK inside the app and opens Android's installer.

Do not bump the version until the APK is ready to build: an update published under a new version
reaches only phones that already have that version's APK.

If the workflow cannot push to `main` (branch protection), edit `latest-release.json` by hand:
set `version` to the new version. Keep `apkUrl` as is. `fallbackUrl` (MediaFire page) is opened
only if the in-app download fails; keep it pointing at a copy of the latest APK, or remove the
key to reuse `apkUrl`.

## What the reader sees
- First time: Android asks to allow "install from this app" (permission REQUEST_INSTALL_PACKAGES),
  then shows its own Install screen. Android never installs silently.
- If the direct download fails, the app opens the fallback page in the browser instead.

## Which phones get what
- Phones on a build older than the first one with this code (1.0.1 before the update notice
  reached them) can't see the banner. 1.0.1 phones get the banner through a normal update first.
- The new APK must be signed with the same key as the old one or Android refuses to install over
  it. EAS keeps the Android keystore: https://docs.expo.dev/app-signing/managed-credentials
  Do not delete or regenerate it.
