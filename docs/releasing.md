# Releasing

## Normal change (screens, text, logic, images)
Push to `main`. The workflow publishes an over-the-air update. Keep `version` in
`app.json` unchanged: with the `appVersion` runtime policy an update only reaches
phones whose installed APK has the same version. Phones check for the update when
the app opens and ask the reader to install it.

## Change that needs a new APK (new native library, new permission, icon, Expo upgrade)
1. Bump `version` in `app.json` (and `package.json`), for example 1.0.1 to 1.0.2.
2. Run the workflow "Build Mushaf APK" by hand (Actions > Run workflow). Download `Mushaf-APK`.
3. Upload the APK to the download page (currently MediaFire) and keep the link.
4. Edit `latest-release.json` in the repo: set `version` to the new version and
   `apkUrl` to the download link. Commit to `main`.

After step 4, any installed build that opens the app and is older than `version`
shows the "new version" banner with a Download button, whatever version it was on.
That works only for builds that already contain this banner code (1.0.1 after it
is delivered as an update). Builds older than that still need the link sent to
them by hand.

Android always asks the reader to tap Install; an app cannot install itself silently.
The new APK must be signed with the same key as the old one, otherwise Android
refuses to install it over the old app. Do not delete the EAS-held Android keystore.
