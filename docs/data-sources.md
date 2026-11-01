# Data Sources

| Data | Intended source | Current status | Integrity and licensing notes |
|---|---|---|---|
| Quran text | Quran Foundation Content API; evaluate Tanzil as a separately licensed import source | Not imported; credentials absent | Preserve canonical Uthmani text, source/version metadata, and attribution. Validate API responses before persistence. |
| Tajweed | A separately verified, reviewed dataset | Not integrated | No inferred or fabricated rules. Requires source, version, offsets, and scholarly review. |
| Tafsir and word information | Quran Foundation content, subject to endpoint availability and each source's terms | Not integrated | Attribute each work; availability does not imply redistribution rights. |
| Recitation audio | Quran Foundation audio metadata/provider after reciter and recording verification | Not integrated | Verify the exact reciter, recitation type, attribution, and streaming/offline rights before enabling playback or downloads. |
| Page and line metadata | Verified Mushaf metadata associated with the selected script | Not integrated | Required for traditional page mode; do not simulate page layout with arbitrary wrapping. |

## Source review checklist

Before importing or caching any source, record its canonical endpoint or dataset release, schema, version/checksum, license, attribution, caching/redistribution terms, and validation results in this document. Do not publish unreviewed content as complete or certified.

## Quran Foundation API

- Official docs: <https://api-docs.quran.com/>
- Developer journey: <https://api-docs.quran.foundation/docs/developer-journey/>
- Content quickstart: <https://api-docs.quran.foundation/docs/quickstart/>
- The current quickstart says pre-live content includes Al-Fatihah and Al-Baqarah; production content requires approved access.
- No API response has yet been obtained in this workspace.
