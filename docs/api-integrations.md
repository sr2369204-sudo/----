# API Integrations

## Quran.com API

The mobile app requests Quran text directly from the public Quran.com API v4. This does not require an app-owned backend, API credentials, or environment configuration.

Base URL: `https://api.quran.com/api/v4`

| Purpose | Request |
|---|---|
| Arabic surah directory | `GET /chapters?language=ar` |
| Surah metadata | `GET /chapters/{id}?language=ar` |
| Uthmani words and Tajweed | `GET /verses/by_chapter/{id}?language=ar&words=true&word_fields=text_uthmani&fields=text_uthmani_tajweed&per_page=300` |
| Reciter list | `GET /resources/chapter_reciters?language=ar` |
| Ayah audio URL | `GET /recitations/{reciter_id}/by_ayah/{surah}:{ayah}` |

The provider fetches surah metadata and verses together, then validates the requested chapter, Arabic name, verse count and order, word IDs and positions, Uthmani text, and well-formed source Tajweed markup. Verse-end markers are excluded from selectable words. Invalid or incomplete responses are rejected instead of displayed as complete content.

Audio streams directly from Quran.com audio hosts through Expo Audio. The selected reciter is used for ayah recordings; source word clips are used when a word is selected. Audio is not bundled or cached offline.

The live chapter 1 endpoint was verified without authentication and returned all seven verses. `api-v4` identifies the API schema, not a separately versioned Quran text dataset.

### Limitations and terms

- An internet connection and availability of Quran.com are required to load content. No Quran content is cached for offline use yet.
- Quran.com terms describe content as for personal, non-commercial use. Public API access does not itself grant rights to redistribute, cache, or commercially publish the text. Review current API and content terms for the intended distribution; see [licensing](./licensing.md).
- Reciter recordings may have separate rights and attribution requirements; verify before publishing, redistributing, or caching audio.
- Quran Foundation Content APIs use a separate credentialed flow. This app does not call those APIs directly and does not bundle their client secrets.
- Tajweed tags are provided alongside the text. Tafsir and printed page metadata are not provided by this integration and need separate source and rights review.

## Optional future services

An app-owned backend may be introduced later for opt-in synchronization or other server-only features, but it is not required for Quran text retrieval.
