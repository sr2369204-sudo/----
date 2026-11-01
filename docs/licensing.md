# Licensing and Attribution

No Quran text, Tajweed, tafsir, audio, or page-layout dataset is bundled in the project. The Al-Fatihah proof of concept downloads page-one QCF Tajweed V4 data from the Quran.com public API and its page-specific font from Quran Foundation, then stores both in the on-device SQLite database so that page can be reopened offline after a successful download. Other surahs and audio remain runtime requests.

Before a source is imported, cached offline, redistributed, or shown in production:

1. Review the current source license and terms for the exact content, including the Quran.com [Terms of Service](https://quran.com/terms-and-conditions) and Quran Foundation [API documentation](https://api-docs.quran.foundation/).
2. Verify commercial-use, offline-caching, and redistribution permissions separately.
3. Preserve required text, reciter, translator, and publisher attribution.
4. Record the canonical source, version, checksum, license, and required notices in `docs/data-sources.md`.
5. Obtain scholarly/content review for Quranic and Tajweed datasets where required.

Quran.com API availability is not by itself confirmation that content can be redistributed, cached offline, or used commercially. The published terms limit service content to personal, non-commercial use; confirm the applicable rights before distributing this app. Reciter recordings may have separate rights and attribution requirements and must be reviewed individually.

The page-one endpoint currently uses the public Quran.com API v4 response tested by this proof of concept; it is not the OAuth-protected Quran Foundation Content API and is not guaranteed to remain anonymously available. The QCF page font is fetched from `verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p1.woff2`. Local caching is for the user's own device only; it does not grant redistribution rights or permit bundling the page data or font.

## Release gate

Do not ship bundled content or offline audio until the applicable license, attribution, and caching/redistribution rights have been verified and recorded. Direct API display also remains subject to the source's terms.
