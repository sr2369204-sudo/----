# Data Sources

| Data | Intended source | Current status | Integrity and licensing notes |
|---|---|---|---|
| Quran text | Quran.com public API v4 | Direct request verified; no app-owned backend or API credentials required | Fetch Uthmani word text and Arabic chapter names; validate response completeness. Review terms for the intended app distribution. |
| Tajweed | Quran.com API v4 `text_uthmani_tajweed` | Loaded with each surah | Render only the rule tags returned by the source; preserve script text and map tags to selectable word IDs by source order. |
| Tafsir and word information | Quran Foundation content, subject to endpoint availability and each source's terms | Not integrated | Attribute each work; availability does not imply redistribution rights. |
| Recitation audio | Quran.com API v4 reciter directory and verse-audio endpoint | Implemented for streaming; only reciters with a verified Al-Fatiha audio URL are offered | Supports Quran.com verse URLs and its verified QuranicAudio Husary mirror URLs. Confirm current audio rights before distribution or offline caching. |
| Page and line metadata | Quran.com API v4 `verses/by_page/{page}?mushaf=19` | Integrated for pages 1–604; each response is validated for page number, verse sequence, word IDs, and line positions | Source records define line breaks and token order. They do not include printed x/y coordinates; horizontal placement is limited to source glyph advances and natural RTL text flow. |
| Quran font | Quran Foundation QCF Tajweed V4 page fonts (`p{page}.woff2`) | Fetched and cached with each visited page | Font is required to render the source's `code_v2` glyphs and embedded Tajweed palette. Verify font use and local caching rights before distribution. |

## Source review checklist

Before importing or caching any source, record its canonical endpoint or dataset release, schema, version/checksum, license, attribution, caching/redistribution terms, and validation results in this document. Do not publish unreviewed content as complete or certified.

## Quran.com API

- API base URL: <https://api.quran.com/api/v4>
- Chapter directory: `GET /chapters?language=ar`
- Chapter metadata: `GET /chapters/{id}?language=ar`
- Uthmani words: `GET /verses/by_chapter/{id}?language=ar&words=true&word_fields=text_uthmani&per_page=300`
- Uthmani Tajweed markup: add `fields=text_uthmani_tajweed` to the verse request.
- Reciter directory: `GET /resources/chapter_reciters?language=ar`
- Ayah audio: `GET /recitations/{reciter_id}/by_ayah/{surah}:{ayah}`
- Word audio: source word `audio_url` paths are streamed from the Quran.com audio CDN.
- Mushaf page: `GET /verses/by_page/{1..604}?language=ar&mushaf=19&words=true&word_fields=code_v2%2Ctext_uthmani%2Caudio_url&fields=text_uthmani_tajweed&per_page=300`
- Surah start location: `GET /verses/by_chapter/{id}?fields=page_number&per_page=1`
- Juz start location: `GET /verses/by_juz/{id}?fields=page_number&per_page=1`
- Page font: `https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p{page}.woff2`
- A live request to the chapter 1 endpoint returned all seven verses without authentication; the API advertises permissive CORS for web clients.
- The app requests data directly and validates chapter identity, verse count/order, word IDs/positions, and non-empty Uthmani text before display.
- Mushaf pages use source page numbers, verse keys, word IDs, line numbers, and `code_v2` glyphs. Source line numbers and their gaps control row placement; source order controls word flow within each row.
- Quran.com page records do not supply printed horizontal coordinates or title-frame artwork. The app does not claim pixel-identical reproduction; it does not invent word coordinates or apply line justification to imitate them.
- Page data and its page-specific font are stored in the local SQLite page cache after download. This is an on-demand cache, not a bundled 604-page offline corpus; only pages previously opened can be read offline.
- In the verse reader, Tajweed tags are parsed as text, never rendered as HTML. In Mushaf page mode, Tajweed colors come from the source QCF COLRv1 font palette, with a grayscale toggle and explanatory legend.
- Audio streams at playback time; no files are bundled or downloaded for offline use. The selected reciter applies to ayah audio; word-level clips use the source's provided word recording.
- The reader filters out reciters whose verse-audio endpoint returns HTTP 404. Quran.com may return protocol-relative audio URLs from `mirrors.quranicaudio.com`; only the verified Husary mirror paths are accepted.
- Quran.com's terms state that service content is for personal, non-commercial use. Confirm the current API, local-cache, font, and content rights for the intended distribution; public availability alone does not grant redistribution rights.
- `api-v4` identifies the API schema, not a Quran corpus release or checksum.
