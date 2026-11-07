# Licensing and Attribution

No Quran text, Tajweed, tafsir, audio, or page image is bundled in the project. The reader downloads Quran.com API v4 Mushaf 19 page data and the corresponding QCF Tajweed V4 page font from Quran Foundation, then caches pages opened by the user in on-device SQLite. Cached pages can be reopened offline; unvisited pages and audio remain runtime requests. This on-device cache does not grant redistribution rights.

Before a source is imported, cached offline, redistributed, or shown in production:

1. Review the current source license and terms for the exact content, including the Quran.com [Terms of Service](https://quran.com/terms-and-conditions) and Quran Foundation [API documentation](https://api-docs.quran.foundation/).
2. Verify commercial-use, offline-caching, and redistribution permissions separately.
3. Preserve required text, reciter, translator, and publisher attribution.
4. Record the canonical source, version, checksum, license, and required notices in `docs/data-sources.md`.
5. Obtain scholarly/content review for Quranic and Tajweed datasets where required.

Quran.com API availability is not by itself confirmation that content can be redistributed, cached offline, or used commercially. The published terms limit service content to personal, non-commercial use; confirm the applicable rights before distributing this app. Reciter recordings may have separate rights and attribution requirements and must be reviewed individually.

## Reciter portraits

The picker streams these portraits from Wikimedia Commons and shows a source-and-license link beside each image:

| Reciter | Source file | Credit | License |
|---|---|---|---|
| Abdul Basit Abdul Samad | [Abdul Basit 'Abd us-Samad with King Faisal](https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg) | Unknown author | Public domain |
| Abdur-Rahman as-Sudais | [Abdul-Rahman Al-Sudais (Cropped, 2011)](https://commons.wikimedia.org/wiki/File:Abdul-Rahman_Al-Sudais_(Cropped,_2011).jpg) | Prime Minister's Office | GODL-India |
| Mahmoud Khalil Al-Husary | [Hussary](https://commons.wikimedia.org/wiki/File:Hussary.jpg) | Zubairkhan1 | Public domain |
| Bandar Baleela | [Bandar Baleela](https://commons.wikimedia.org/wiki/File:Bandar_Baleela.jpg) | محبين يحيى الزعبي | CC BY-SA 3.0 |
| Islam Sobhi | [Islam Sobhi](https://commons.wikimedia.org/wiki/File:Islam_Sobhi.jpg) | Moaz600 | CC BY-SA 4.0 |
| Maher Al Muaiqly | [Mahir Al-Muaiqly](https://commons.wikimedia.org/wiki/File:Mahir_Al-Muaiqly.png) | Sazwanmisuari | CC0 |
| Muhammad Siddiq al-Minshawi | [Elminshwey](https://commons.wikimedia.org/wiki/File:Elminshwey.jpg) | Unknown author | Public domain |
| Saud al-Shuraim | [Saud Shuraim](https://commons.wikimedia.org/wiki/File:Saud_Shuraim.png) | Sazwanmisuari | CC0 |
| Yasser al-Dosari | [Yasser Al-dosari](https://commons.wikimedia.org/wiki/File:Yasser_Al-dosari.jpg) | Yasser Al-Dosari | CC0 |

Portraits without a verified source are not shown; the picker uses a neutral placeholder instead. Review each Commons file page and its current license terms before redistribution.

The page endpoint uses the public Quran.com API v4 and is not the OAuth-protected Quran Foundation Content API; anonymous availability is not guaranteed. Each QCF page font is fetched from `verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p{page}.woff2`. Local caching is for pages the user has opened; it does not grant redistribution rights or permit bundling the page data or font.

## Release gate

Do not ship bundled content or offline audio until the applicable license, attribution, and caching/redistribution rights have been verified and recorded. Direct API display also remains subject to the source's terms.
