# Data Sources

| Data | Intended source | Current status | Integrity and licensing notes |
|---|---|---|---|
| Quran text | Quran.com public API v4 | Direct request verified; no app-owned backend or API credentials required | Fetch Uthmani word text and Arabic chapter names; validate response completeness. Review terms for the intended app distribution. |
| Tajweed | A separately verified, reviewed dataset | Not integrated | No inferred or fabricated rules. Requires source, version, offsets, and scholarly review. |
| Tafsir and word information | Quran Foundation content, subject to endpoint availability and each source's terms | Not integrated | Attribute each work; availability does not imply redistribution rights. |
| Recitation audio | Quran Foundation audio metadata/provider after reciter and recording verification | Not integrated | Verify the exact reciter, recitation type, attribution, and streaming/offline rights before enabling playback or downloads. |
| Page and line metadata | Verified Mushaf metadata associated with the selected script | Not integrated | Required for traditional page mode; do not simulate page layout with arbitrary wrapping. |

## Source review checklist

Before importing or caching any source, record its canonical endpoint or dataset release, schema, version/checksum, license, attribution, caching/redistribution terms, and validation results in this document. Do not publish unreviewed content as complete or certified.

## Quran.com API

- API base URL: <https://api.quran.com/api/v4>
- Chapter directory: `GET /chapters?language=ar`
- Chapter metadata: `GET /chapters/{id}?language=ar`
- Uthmani words: `GET /verses/by_chapter/{id}?language=ar&words=true&word_fields=text_uthmani&per_page=300`
- A live request to the chapter 1 endpoint returned all seven verses without authentication; the API advertises permissive CORS for web clients.
- The app requests data directly and validates chapter identity, verse count/order, word IDs/positions, and non-empty Uthmani text before display.
- Quran.com's terms state that service content is for personal, non-commercial use. Confirm the current API and content rights for the intended distribution; public availability alone does not grant redistribution rights.
- `api-v4` identifies the API schema, not a Quran corpus release or checksum.
