# API Integrations

## Quran Foundation Content API

**Status:** Backend adapter implemented; live calls are blocked pending developer-console credentials.

The official Content API quickstart requires a backend/server app and OAuth2 Client Credentials with `scope=content`. Keep `QF_CLIENT_ID` and `QF_CLIENT_SECRET` on the backend only. The mobile app must never bundle a client secret.

For TypeScript server code, the official SDK entrypoint is:

```ts
import { createServerClient } from "@quranjs/api/server";
```

For a new pre-live app, configure the matching pre-live credentials and service URLs together. The official quickstart documents `POST /oauth2/token`, then Content API requests carrying `x-auth-token` and `x-client-id`; the SDK handles token retrieval/caching. Do not use production URLs with pre-live credentials or vice versa.

The local server in `backend/server.mjs` uses the official `@quranjs/api/server` SDK. It exposes the app-owned directory and surah routes, loads chapters and Uthmani word fields via SDK v4, checks chapter/ayah/word completeness, and caches validated responses in memory for five minutes. It binds to `127.0.0.1` by default and allows the local Expo web origin only. It is development-only; deploy production integrations behind a hardened backend with appropriate access controls.

For pre-live, the server limits its surah directory and content requests to chapters 1 and 2, matching Quran Foundation's published dataset limitation. Production configuration is available only for credentials with production approval.

Before implementing an adapter, verify the current endpoint-specific schemas for chapters, verses/words, audio, page metadata, tafsir, and search. Normalize provider responses behind app-owned interfaces and validate pagination and content references.

### Environment configuration

Backend only:

```text
QF_CLIENT_ID=
QF_CLIENT_SECRET=
QF_ENV=prelive
```

No values are configured in the inspected environment. Never commit a populated environment file.

### Current limitations

- No Developer Console app credentials are configured; live calls/imports have not been tested.
- Quran Foundation's current quickstart states pre-live has Al-Fatihah and Al-Baqarah only. Full Quran import depends on approved production access.
- Search requires separate pre-live permission according to the current developer journey.
- Audio, timestamps, and licensing must be verified per reciter before exposing playback.

## Mobile/backend boundary

The mobile app consumes the implemented local backend provider where confidential app credentials are needed. The backend returns Quran text only after checking required source fields and completeness. The app still has no offline Quran content cache.

### Mobile API contract

These are routes for the future Mushaf backend, **not Quran Foundation API endpoints**:

- `GET /quran/surahs` returns `{ sourceId, contentVersion, surahs: [{ surahNumber, nameArabic }] }`.
- `GET /quran/surahs/{surahNumber}` returns `{ sourceId, contentVersion, textScript: "uthmani", narration: "hafs-an-asim", surahNumber, nameArabic, ayahCount, ayahs: [{ ayahNumber, words: [{ id, position, textUthmani }] }] }`.

The mobile adapter rejects responses with missing source/version metadata, the wrong script/narration, incomplete/noncontiguous ayah or word sequences, duplicate or invalid directory entries, or invalid word references. Backend mapping is covered by synthetic-only tests; it has not yet been tested against a live Quran Foundation response.

The backend's `contentVersion: "api-v4"` identifies the upstream API version only; Quran Foundation does not provide an imported-corpus checksum through this adapter. Do not treat it as a dataset release identifier.

For Android local development, configure a host address reachable from the emulator/device rather than assuming `localhost` refers to the development machine.

Offline content caching and content checksum import are not yet implemented. Until then, a network failure must remain an explicit unavailable state.

## Local setup

1. Register a **Backend/server app** in the [Quran Foundation Developer Console](https://dev-console.quran.foundation/projects/new).
2. Copy `backend/.env.example` to `backend/.env`; set the issued `QF_CLIENT_ID` and `QF_CLIENT_SECRET`.
3. Run `npm --prefix backend install`, then start the server with `npm run backend`.
4. Copy root `.env.example` to `.env`, keeping its local backend URL, and restart Expo.

Never put backend credentials in root `.env`, mobile code, or any `EXPO_PUBLIC_*` variable.
