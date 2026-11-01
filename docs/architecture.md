# Architecture

## Current milestone

Mushaf is an Arabic-first, offline-first Expo application. The initial implementation is deliberately limited to the reader foundation and local annotations; Quran text, Tajweed, and audio are loaded only from sources that have been verified and licensed.

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

**Current limitation:** no Quran content has been imported or cached yet. The initial reader requests the app-owned backend and reports unavailable content when it is not configured. Offline Quran reading remains a release requirement, not an implemented feature.

Annotations are separate records with stable target references (`word`, `ayah`, or `range`). Highlights and notes have independent lifecycles; multiple highlights may overlap and deleting one must not delete another.

## Reading modes

Interactive verse mode uses stable word identifiers and RTL layout. Traditional page mode is deferred until a verified page/line dataset and compatible rendering strategy are available; arbitrary text wrapping is not an acceptable substitute for a printed Mushaf layout.

## Future backend

Supabase/PostgreSQL is reserved for opt-in account and synchronization features. User-owned records require Row Level Security. API credentials and server-only integrations belong in a backend or serverless function, not in the mobile bundle.

## Decisions and constraints

- Expo SDK and dependencies are selected through Expo's official project template and `npx expo install`.
- Quran Foundation Content APIs use server-side OAuth2 Client Credentials and `scope=content`.
- Pre-live provides only Al-Fatihah and Al-Baqarah, according to the current official quickstart; full Quran content requires production access.
- The current environment has no Android SDK/ADB or Quran Foundation credentials, so device and live API validation are blocked until configured.
