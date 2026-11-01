# API Integrations

## Quran.com API

The mobile app requests Quran text directly from the public Quran.com API v4. This does not require an app-owned backend, API credentials, or environment configuration.

Base URL: `https://api.quran.com/api/v4`

| Purpose | Request |
|---|---|
| Arabic surah directory | `GET /chapters?language=ar` |
| Surah metadata | `GET /chapters/{id}?language=ar` |
| Uthmani words and Tajweed | `GET /verses/by_chapter/{id}?language=ar&words=true&word_fields=text_uthmani&fields=text_uthmani_tajweed&per_page=300` |
| Mushaf page/line/word metadata | `GET /verses/by_page/{1..604}?language=ar&mushaf=19&words=true&word_fields=code_v2,text_uthmani,audio_url&fields=text_uthmani_tajweed&per_page=300` |
| First page of a surah or juz | `GET /verses/by_chapter/{id}?fields=page_number&per_page=1`; `GET /verses/by_juz/{id}?fields=page_number&per_page=1` |
| Reciter list | `GET /resources/chapter_reciters?language=ar` |
| Ayah audio URL | `GET /recitations/{reciter_id}/by_ayah/{surah}:{ayah}` |

The reader uses the Quran.com API's 604-page Mushaf 19 dataset. Page responses supply the page number, verse keys, Uthmani text, Tajweed markup, word IDs, line numbers, and `code_v2` glyphs. The provider checks page/verse/word sequence and rejects malformed or incomplete responses. Verse-end markers remain on their source line but are not treated as selectable words.

Each page is rendered with its corresponding Quran Foundation QCF Tajweed V4 COLRv1 font at `https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p{page}.woff2`. Source line numbers determine row placement, source word order determines each row's RTL text flow, and empty source rows remain empty; rows are not centered individually, justified, or stretched vertically to fill the page. A single uniform font size may be reduced for the whole page when needed to prevent the longest line from clipping. Surah names come from the API directory; when a page opens a surah that uses the Basmala, its QCF glyphs and page 1 font are cached with that page.

The API provides line numbers and word order, but no printed horizontal word coordinates or official surah-title frame artwork. The renderer therefore preserves the verified page/line structure and source glyphs without claiming pixel-identical reproduction of the physical Mushaf. Exact x/y placement and title ornamentation require a licensed page-layout dataset or original page assets that are not currently available in the project.

Page data and the matching font are cached in SQLite when a page is first opened. Previously opened pages can be reopened offline; uncached pages and surah-directory lookups still need a connection. The app does not bundle or predownload all 604 pages. Audio streams through Expo Audio. The settings list is checked against the verse-audio endpoint and omits reciters whose endpoint returns HTTP 404. Quran.com audio may be hosted on `verses.quran.com` or the verified Husary paths on `mirrors.quranicaudio.com`; source word clips are used when a word is selected. Audio is not bundled or cached offline.

The live chapter 1 endpoint was verified without authentication and returned all seven verses. `api-v4` identifies the API schema, not a separately versioned Quran text dataset.

### Limitations and terms

- An internet connection and availability of Quran.com are required for first-time page loads. Only pages already opened are cached for offline use.
- Quran.com terms describe content as for personal, non-commercial use. Public API access does not itself grant rights to redistribute, cache, or commercially publish the text. Review current API and content terms for the intended distribution; see [licensing](./licensing.md).
- Reciter recordings may have separate rights and attribution requirements; verify before publishing, redistributing, or caching audio.
- Quran Foundation Content APIs use a separate credentialed flow. This app does not call those APIs directly and does not bundle their client secrets.
- Tajweed tags and page/line metadata are provided by the API. Tafsir and printed page images are not integrated; the app does not bundle page scans.

## Optional future services

An app-owned backend may be introduced later for opt-in synchronization or other server-only features, but it is not required for Quran text retrieval.
