# Implementation Status

Statuses are intentionally conservative. An integration is not marked tested unless it has been run against the real service or platform.

| Area | Status | Notes |
|---|---|---|
| Workspace inspection | Tested | Existing Expo project and local development environment inspected. |
| Expo foundation | Implemented | Expo SDK 58, strict TypeScript, Router, SQLite, Zustand, and TanStack Query are configured. Android SDK/ADB is unavailable in this environment. |
| Arabic-first navigation and screens | Implemented | Searchable/filterable surah directory, inline Mushaf-style reader, configurable system/light/dark appearance, and settings. |
| Quran provider contract | Implemented | Validates Quran.com chapter metadata, complete ayah/word sequences, word positions, and Uthmani text. |
| Quran.com direct integration | Implemented | Mobile app fetches API v4 text, Tajweed, 604-page Mushaf 19 metadata, reciter metadata, and audio URLs directly; no app-owned backend or credentials required. |
| Color Tajweed | Implemented | Renders source-provided Tajweed classes, including nested rule tags; validated against live Al-Fatihah, Al-Baqarah, At-Tawbah, and An-Nas responses. |
| Ayah and word audio | Implemented | Expo Audio streams a selected-reciter ayah or the source word clip after selection. |
| Quran.com content licensing | Requires Review | Terms currently limit service content to personal, non-commercial use; confirm rights before distribution. |
| Al-Fatihah content validation | Tested | Live endpoint returned all seven verses; app rejects incomplete or malformed responses. |
| Local SQLite annotations | Implemented | Versioned schema and repositories for independent word/ayah/range highlights and private notes; runtime device persistence still needs Android testing. |
| Mushaf page reader | Implemented; source-validated on representative pages | Page 1, page 2, page 19, page 49/50 (surah opening), page 187, and page 604 load source page/line metadata and their QCF page fonts. Transient page/font requests retry with bounded backoff and adjacent-page prefetch. This is a data-driven recreation, not a pixel-certified print reproduction. |
| Word and ayah selection | Implemented | Source word IDs are carried end-to-end from the rendered glyph to selection and playback; the selection actions use an animated bottom sheet. Highlights and notes are stored locally against stable source IDs. |
| Offline Quran content | Partial | Each page and its matching font are cached after the first online visit. Unvisited pages, the surah directory, and audio require internet access; the app does not predownload all 604 pages. |
| Word-synchronized and range playback | Not Started | The current audio source does not provide verified word timing metadata; continuous word highlighting and multi-ayah range playback are not implemented. Do not infer word timing by dividing verse duration. |
| Audio rights | Requires License Verification | Reciter recordings stream from Quran.com; review recording-specific rights before distributing or caching audio. |
| Supabase and synchronization | Not Started | Later milestone; reading remains local and account-free. |
| Android device testing | Blocked | `adb` and `ANDROID_HOME` are not present. |
| Validation | Tested | TypeScript, lint, all 8 provider/Tajweed tests, Expo web export, and mobile-sized browser checks for navigation, dark appearance, Tajweed, selection, and audio controls pass. Android device runtime testing remains unavailable. |
