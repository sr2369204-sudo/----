# Architecture

## Current milestone

Mushaf is an Arabic-first Expo application. Quran text is requested directly from the public Quran.com API; the app does not require an app-owned backend. User annotations are stored locally.

## Application boundaries

- `app/`: Expo Router screens and route layouts.
- `src/features/`: feature-specific UI, hooks, and application logic.
- `src/core/`: shared persistence, provider contracts, and infrastructure.
- `docs/`: source, architecture, and release decisions.
- `supabase/`: future versioned server migrations and Edge Functions.

UI components should call feature services or repositories rather than own persistence or API logic.

## Content and trust boundaries

- Quran text and Tajweed are immutable source content, separate from user data.
- Provider response types are normalized into internal domain types.
- The mobile client never receives confidential Content API credentials.
- Unknown or unavailable content is an explicit unavailable state, never synthetic Quran content.
- Synthetic data used by tests must be clearly labeled and must not enter production content.

## Offline persistence

Expo SQLite is the local source of truth for annotations and, in a later content-import milestone, cached verified content. User operations are committed locally before any future background synchronization.

**Current limitation:** Quran content is fetched on demand from Quran.com and is not stored for offline reading. Opening a surah requires an internet connection and availability of the external API.

Annotations are separate records with stable target references (`word`, `ayah`, or `range`). Highlights and notes have independent lifecycles; multiple highlights may overlap and deleting one must not delete another.

## Reading modes

Interactive verse mode uses stable word identifiers and RTL layout. Traditional page mode is deferred until a verified page/line dataset and compatible rendering strategy are available; arbitrary text wrapping is not an acceptable substitute for a printed Mushaf layout.

## Optional future backend

Supabase/PostgreSQL is reserved for opt-in account and synchronization features. User-owned records require Row Level Security. No backend is needed for Quran text retrieval. If a future integration uses confidential credentials, those credentials must remain server-side.

## Decisions and constraints

- Expo SDK and dependencies are selected through Expo's official project template and `npx expo install`.
- The app uses Quran.com API v4 endpoints directly for chapter metadata and Uthmani word text; no app credentials are embedded.
- Quran.com API availability does not establish redistribution or commercial-use rights; review current terms before publishing.
