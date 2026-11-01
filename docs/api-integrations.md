# API Integrations

## Quran.com API

The mobile app requests Quran text directly from the public Quran.com API v4. This does not require an app-owned backend, API credentials, or environment configuration.

Base URL: `https://api.quran.com/api/v4`

| Purpose | Request |
|---|---|
| Arabic surah directory | `GET /chapters?language=ar` |
| Surah metadata | `GET /chapters/{id}?language=ar` |
| Uthmani verse words | `GET /verses/by_chapter/{id}?language=ar&words=true&word_fields=text_uthmani&per_page=300` |

The provider fetches surah metadata and verses together, then validates the requested chapter, Arabic name, verse count and order, word IDs and positions, and non-empty Uthmani text. Verse-end markers are excluded from selectable words. Invalid or incomplete responses are rejected instead of displayed as complete content.

The live chapter 1 endpoint was verified without authentication and returned all seven verses. `api-v4` identifies the API schema, not a separately versioned Quran text dataset.

### Limitations and terms

- An internet connection and availability of Quran.com are required to load content. No Quran content is cached for offline use yet.
- Quran.com terms describe content as for personal, non-commercial use. Public API access does not itself grant rights to redistribute, cache, or commercially publish the text. Review current API and content terms for the intended distribution; see [licensing](./licensing.md).
- Quran Foundation Content APIs use a separate credentialed flow. This app does not call those APIs directly and does not bundle their client secrets.
- Audio, Tajweed, tafsir, and printed page metadata are not provided by this integration; each requires separate source and rights review.

## Optional future services

An app-owned backend may be introduced later for opt-in synchronization or other server-only features, but it is not required for Quran text retrieval.
