# Implementation Status

Statuses are intentionally conservative. An integration is not marked tested unless it has been run against the real service or platform.

| Area | Status | Notes |
|---|---|---|
| Workspace inspection | Tested | Existing Expo project and local development environment inspected. |
| Expo foundation | Implemented | Expo SDK 58, strict TypeScript, Router, SQLite, Zustand, and TanStack Query are configured. Android SDK/ADB is unavailable in this environment. |
| Arabic-first navigation and screens | Implemented | Arabic home, dynamic source-backed surah directory, interactive reader route, and settings screen. |
| Quran provider contract | Implemented | Validates Quran.com chapter metadata, complete ayah/word sequences, word positions, and Uthmani text. |
| Quran.com direct integration | Implemented | Mobile app fetches public API v4 endpoints directly; no app-owned backend or credentials required. Live Al-Fatihah request verified. |
| Quran.com content licensing | Requires Review | Terms currently limit service content to personal, non-commercial use; confirm rights before distribution. |
| Al-Fatihah content validation | Tested | Live endpoint returned all seven verses; app rejects incomplete or malformed responses. |
| Tajweed | Requires Scholarly Review | No verified Tajweed dataset is configured. |
| Local SQLite annotations | Implemented | Versioned schema and repositories for independent word/ayah/range highlights and private notes; runtime device persistence still needs Android testing. |
| Word and ayah selection | Implemented | Tap and long press, target-specific action sheet, multiple highlight layers, and local note creation when a validated content response exists. |
| Offline Quran content | Not Started | Quran text is fetched on demand and is unavailable without internet; no offline cache is implemented. |
| Audio | Requires License Verification | No reciter/provider has been validated. |
| Supabase and synchronization | Not Started | Later milestone; reading remains local and account-free. |
| Android device testing | Blocked | `adb` and `ANDROID_HOME` are not present. |
| Validation | Tested | `npx tsc --noEmit`, `npm run lint`, `npm test`, and `npx expo export --platform web` pass. Live Quran.com request returned all 114 surahs and complete Al-Fatihah. Android runtime testing remains unavailable. |
