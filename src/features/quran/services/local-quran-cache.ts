import type { SQLiteDatabase } from 'expo-sqlite';

import { quranContentProvider } from '@/features/quran/services/content-provider';
import type { MushafPage, QuranSurahDirectory } from '@/features/quran/types';

const DIRECTORY_KEY = 'surah-directory';
const SURAH_FIRST_PAGES_KEY = 'surah-first-pages';
const JUZ_FIRST_PAGES_KEY = 'juz-first-pages';
const LAST_MUSHAF_PAGE = 604;

/** Inclusive page range covered by one surah. */
export type SurahPageRange = { firstPage: number; lastPage: number };

/**
 * Source-backed index kept on the device so the reader can resolve a surah,
 * juz, or ayah to its Mushaf page without a round trip. The directory and the
 * indexes are read from SQLite first and only rebuilt from the API when they
 * are still missing, which is what lets browsing work with no connection.
 */
export class LocalQuranCache {
  private firstPages: Record<string, number> | null = null;
  private firstPagesDirty = false;

  constructor(private readonly database: SQLiteDatabase) {}

  async loadSurahDirectory(): Promise<QuranSurahDirectory> {
    const cached = await this.readJson<QuranSurahDirectory>(DIRECTORY_KEY);
    if (isSurahDirectory(cached)) {
      return cached;
    }
    const directory = await quranContentProvider.getSurahDirectory();
    await this.writeJson(DIRECTORY_KEY, directory);
    return directory;
  }

  /** First Mushaf page of a surah, from the local index or the source. */
  async getSurahFirstPageNumber(surahNumber: number): Promise<number> {
    assertSurahNumber(surahNumber);
    const firstPages = await this.loadFirstPages();
    const cached = firstPages[String(surahNumber)];
    if (cached !== undefined) {
      return cached;
    }
    const page = await quranContentProvider.getPageNumberForSurah(surahNumber);
    firstPages[String(surahNumber)] = page;
    await this.flushFirstPages();
    return page;
  }

  /**
   * Pages a surah occupies. Surahs follow each other on the sheets, so the
   * range runs from the surah's own first page up to the page where the next
   * surah opens — that page still carries the tail of this surah.
   */
  async getSurahPageRange(surahNumber: number): Promise<SurahPageRange> {
    assertSurahNumber(surahNumber);
    const firstPage = await this.getSurahFirstPageNumber(surahNumber);
    if (surahNumber === 114) {
      return { firstPage, lastPage: LAST_MUSHAF_PAGE };
    }
    const nextFirstPage = await this.getSurahFirstPageNumber(surahNumber + 1);
    return { firstPage, lastPage: Math.max(firstPage, nextFirstPage) };
  }

  async getPageNumberForSurah(surahNumber: number): Promise<number> {
    return (await this.getSurahPageRange(surahNumber)).firstPage;
  }

  async getPageNumberForJuz(juzNumber: number): Promise<number> {
    if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      throw new RangeError('Juz number must be between 1 and 30.');
    }
    const stored = await this.readJson<Record<string, number>>(JUZ_FIRST_PAGES_KEY) ?? {};
    const cached = stored[String(juzNumber)];
    if (cached !== undefined) {
      return cached;
    }
    const page = await quranContentProvider.getPageNumberForJuz(juzNumber);
    stored[String(juzNumber)] = page;
    await this.writeJson(JUZ_FIRST_PAGES_KEY, stored);
    return page;
  }

  /**
   * Page of an ayah. The local index answers immediately when the surah is
   * already stored; otherwise the source is asked.
   */
  async getPageNumberForAyah(surahNumber: number, ayahNumber: number): Promise<number> {
    const local = await this.findStoredAyahPage(surahNumber, ayahNumber);
    if (local !== null) {
      return local;
    }
    return quranContentProvider.getPageNumberForAyah(surahNumber, ayahNumber);
  }

  /** Snapshot of the known first pages, used to measure download state. */
  async getKnownSurahFirstPages(): Promise<Record<string, number>> {
    return { ...(await this.loadFirstPages()) };
  }

  /**
   * Records where a surah opens. Called while pages are downloaded, where the
   * page objects already carry the source's ayah-1 records.
   */
  async recordSurahOpening(surahNumber: number, pageNumber: number): Promise<void> {
    const firstPages = await this.loadFirstPages();
    const key = String(surahNumber);
    if (firstPages[key] === undefined) {
      firstPages[key] = pageNumber;
      this.firstPagesDirty = true;
    }
  }

  async flushFirstPages(): Promise<void> {
    if (!this.firstPagesDirty || !this.firstPages) {
      return;
    }
    await this.writeJson(SURAH_FIRST_PAGES_KEY, this.firstPages);
    this.firstPagesDirty = false;
  }

  private async loadFirstPages(): Promise<Record<string, number>> {
    if (this.firstPages) {
      return this.firstPages;
    }
    const stored = await this.readJson<Record<string, number>>(SURAH_FIRST_PAGES_KEY);
    this.firstPages = stored && typeof stored === 'object' ? stored : {};
    return this.firstPages;
  }

  private async findStoredAyahPage(
    surahNumber: number,
    ayahNumber: number,
  ): Promise<number | null> {
    if (
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      !Number.isInteger(ayahNumber) ||
      ayahNumber < 1
    ) {
      return null;
    }
    const firstPages = await this.loadFirstPages();
    const firstPage = firstPages[String(surahNumber)];
    if (firstPage === undefined) {
      return null;
    }
    const lastPage = surahNumber === 114
      ? LAST_MUSHAF_PAGE
      : firstPages[String(surahNumber + 1)] ?? firstPage;

    const rows = await this.database.getAllAsync<{ page_json: string }>(
      `SELECT page_json FROM mushaf_page_cache
       WHERE mushaf_id = 19 AND page_number BETWEEN ? AND ?`,
      firstPage,
      lastPage,
    );
    for (const row of rows) {
      let page: MushafPage;
      try {
        page = JSON.parse(row.page_json) as MushafPage;
      } catch {
        continue;
      }
      if (
        Array.isArray(page.ayahs) &&
        page.ayahs.some(
          (ayah) => ayah.surahNumber === surahNumber && ayah.ayahNumber === ayahNumber,
        )
      ) {
        return page.pageNumber;
      }
    }
    return null;
  }

  private async readJson<T>(key: string): Promise<T | null> {
    const row = await this.database.getFirstAsync<{ payload: string }>(
      'SELECT payload FROM quran_content_cache WHERE cache_key = ?',
      key,
    );
    if (!row) {
      return null;
    }
    try {
      return JSON.parse(row.payload) as T;
    } catch {
      return null;
    }
  }

  private async writeJson(key: string, value: unknown): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO quran_content_cache (cache_key, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
      key,
      JSON.stringify(value),
      new Date().toISOString(),
    );
  }
}

function assertSurahNumber(surahNumber: number): void {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new RangeError('Surah number must be between 1 and 114.');
  }
}

function isSurahDirectory(value: unknown): value is QuranSurahDirectory {
  return (
    typeof value === 'object' &&
    value !== null &&
    'surahs' in value &&
    Array.isArray((value as QuranSurahDirectory).surahs) &&
    (value as QuranSurahDirectory).surahs.length === 114 &&
    (value as QuranSurahDirectory).surahs.every(
      (surah) =>
        isRecord(surah) &&
        Number.isInteger(surah.surahNumber) &&
        typeof surah.nameArabic === 'string' &&
        surah.nameArabic.length > 0 &&
        Number.isInteger(surah.ayahCount) &&
        (surah.revelationPlace === 'makkah' || surah.revelationPlace === 'madinah'),
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
