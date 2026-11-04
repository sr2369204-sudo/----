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
- Quran text search filters approximate source results against normalized Arabic ayah text and orders matches by surah and ayah reference.
- The mobile client never receives confidential Content API credentials.
- Unknown or unavailable content is an explicit unavailable state, never synthetic Quran content.
- Synthetic data used by tests must be clearly labeled and must not enter production content.

## Offline persistence

Expo SQLite is the local source of truth for annotations and, in a later content-import milestone, cached verified content. User operations are committed locally before any future background synchronization.

**Current limitation:** Quran content is fetched on demand from Quran.com and is not stored for offline reading. Opening a surah requires an internet connection and availability of the external API.

Annotations are separate records with stable target references (`word`, `ayah`, or `range`). Highlights and notes have independent lifecycles; multiple highlights may overlap and deleting one must not delete another.

## Reading modes

The reader requests one page at a time from Quran.com API v4 using Mushaf 19. Source verse, word, page, and line metadata drive the layout; each page uses its matching QCF Tajweed V4 font. It does not infer page divisions by wrapping surah text. The page renderer is an interactive recreation, not a scan or a pixel-certified copy of a printed edition.

Word and verse selection is bridged from the page renderer with source identifiers and measured screen coordinates. User annotations remain separate SQLite records. The selection menu is positioned around the selected glyph and does not change the page's text layout.

Page text and its page-specific font are cached in SQLite when opened. Only already-opened pages are available offline; the surah directory, uncached pages, and audio still require network access. The app does not download all 604 pages in advance.

## Optional future backend

Supabase/PostgreSQL is reserved for opt-in account and synchronization features. User-owned records require Row Level Security. No backend is needed for Quran text retrieval. If a future integration uses confidential credentials, those credentials must remain server-side.

## Decisions and constraints

- Expo SDK and dependencies are selected through Expo's official project template and `npx expo install`.
- The app uses Quran.com API v4 endpoints directly for chapter metadata, page/line/word positions, Uthmani text, Tajweed markup, and audio; no app credentials are embedded.
- The reader uses Quran.com Mushaf 19 and downloads the matching page-specific QCF Tajweed V4 font on demand. Source licensing and offline-cache rights remain subject to review.
- Quran.com API availability does not establish redistribution or commercial-use rights; review current terms before publishing.
