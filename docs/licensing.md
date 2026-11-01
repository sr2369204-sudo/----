# Licensing and Attribution

No Quran text, Tajweed, tafsir, audio, or page image is bundled in the project. The reader downloads Quran.com API v4 Mushaf 19 page data and the corresponding QCF Tajweed V4 page font from Quran Foundation, then caches pages opened by the user in on-device SQLite. Cached pages can be reopened offline; unvisited pages and audio remain runtime requests. This on-device cache does not grant redistribution rights.

Before a source is imported, cached offline, redistributed, or shown in production:

1. Review the current source license and terms for the exact content, including the Quran.com [Terms of Service](https://quran.com/terms-and-conditions) and Quran Foundation [API documentation](https://api-docs.quran.foundation/).
2. Verify commercial-use, offline-caching, and redistribution permissions separately.
3. Preserve required text, reciter, translator, and publisher attribution.
4. Record the canonical source, version, checksum, license, and required notices in `docs/data-sources.md`.
5. Obtain scholarly/content review for Quranic and Tajweed datasets where required.

Quran.com API availability is not by itself confirmation that content can be redistributed, cached offline, or used commercially. The published terms limit service content to personal, non-commercial use; confirm the applicable rights before distributing this app. Reciter recordings may have separate rights and attribution requirements and must be reviewed individually.

The page endpoint uses the public Quran.com API v4 and is not the OAuth-protected Quran Foundation Content API; anonymous availability is not guaranteed. Each QCF page font is fetched from `verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p{page}.woff2`. Local caching is for pages the user has opened; it does not grant redistribution rights or permit bundling the page data or font.

## Release gate

Do not ship bundled content or offline audio until the applicable license, attribution, and caching/redistribution rights have been verified and recorded. Direct API display also remains subject to the source's terms.
