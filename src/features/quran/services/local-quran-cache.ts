import type { SQLiteDatabase } from 'expo-sqlite';

import { BUNDLED_SURAH_DIRECTORY } from '@/features/quran/data/bundled-surah-directory';
import { ContentUnavailableError, quranContentProvider, type AyahWordMeaning } from '@/features/quran/services/content-provider';
import {
  getBundledAyahText,
  getBundledTafsir,
  getBundledWordMeanings,
  searchBundled,
} from '@/features/offline-data';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import type { AyahSearchResult, MushafPage, QuranSurahDirectory } from '@/features/quran/types';

const DIRECTORY_KEY = 'surah-directory';
const SURAH_FIRST_PAGES_KEY = 'surah-first-pages';
const JUZ_FIRST_PAGES_KEY = 'juz-first-pages';
const LAST_MUSHAF_PAGE = 604;

/** Inclusive page range covered by one surah. */
export type SurahPageRange = { firstPage: number; lastPage: number };

/** One searchable ayah pulled from the pages stored on the device. */
type StoredAyahEntry = { surahNumber: number; ayahNumber: number; text: string };

/**
 * Source-backed index kept on the device so the reader can resolve a surah,
 * juz, or ayah to its Mushaf page without a round trip. The directory and the
 * indexes are read from SQLite first and only rebuilt from the API when they
 * are still missing, which is what lets browsing work with no connection.
 */
export class LocalQuranCache {
  private firstPages: Record<string, number> | null = null;
  private firstPagesDirty = false;
  /** Ayah index built from the stored pages, rebuilt when their count changes. */
  private storedAyahIndex: { pageCount: number; entries: StoredAyahEntry[] } | null = null;

  constructor(private readonly database: SQLiteDatabase) {}

  async loadSurahDirectory(): Promise<QuranSurahDirectory> {
    const cached = await this.readJson<QuranSurahDirectory>(DIRECTORY_KEY);
    if (isSurahDirectory(cached)) {
      return cached;
    }
    try {
      const directory = await quranContentProvider.getSurahDirectory();
      await this.writeJson(DIRECTORY_KEY, directory);
      return directory;
    } catch (error) {
      // First launch with no connection: the list of surahs is fixed text, so
      // the copy shipped inside the app is used instead of showing an error.
      if (error instanceof ContentUnavailableError) {
        return BUNDLED_SURAH_DIRECTORY;
      }
      throw error;
    }
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

  /**
   * Ayah search that keeps working with no connection. The pages saved on the
   * device are searched first; the source is only asked while the device still
   * holds no page, so a fresh install behaves exactly as before.
   */
  async searchAyahs(query: string, limit: number): Promise<AyahSearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      throw new RangeError('بحث فارغ.');
    }
    // The text and tafsir are bundled with the app, so search never waits for
    // the network or for pages to be downloaded.
    return searchBundled(trimmed, limit);
  }

  /** Previous search that used the stored pages and the network. Kept as a fallback. */
  async searchAyahsFromStoredPages(query: string, limit: number): Promise<AyahSearchResult[]> {
    const trimmed = query.trim();
    const index = await this.loadStoredAyahIndex();
    if (index.pageCount === 0) {
      return quranContentProvider.searchAyahs(trimmed, limit);
    }
    if (index.pageCount < 604) {
      // Only part of the Mushaf is stored, so searching the saved pages alone
      // could say "not found" for an ayah that exists. Ask the source first and
      // use the saved pages only when there is no connection.
      try {
        return await quranContentProvider.searchAyahs(trimmed, limit);
      } catch {
        // Offline: fall through to the partial local search below.
      }
    }

    const normalizedQuery = normalizeSurahSearch(trimmed);
    if (normalizedQuery.length === 0) {
      return [];
    }

    // The index is in Mushaf order, so the matches come out by surah then ayah
    // exactly like the source search does.
    const results: AyahSearchResult[] = [];
    for (const entry of index.entries) {
      if (!normalizeSurahSearch(entry.text).includes(normalizedQuery)) {
        continue;
      }
      results.push({
        surahNumber: entry.surahNumber,
        ayahNumber: entry.ayahNumber,
        text: entry.text,
      });
      if (results.length >= limit) {
        break;
      }
    }
    return results;
  }

  /** Snapshot of the known first pages, used to measure download state. */
  async getKnownSurahFirstPages(): Promise<Record<string, number>> {
    return { ...(await this.loadFirstPages()) };
  }

  /** Text of one ayah taken from the stored pages, or null while unsaved. */
  async getStoredAyah(surahNumber: number, ayahNumber: number): Promise<string | null> {
    const bundled = getBundledAyahText(surahNumber, ayahNumber);
    if (bundled !== null) {
      return bundled;
    }
    const index = await this.loadStoredAyahIndex();
    const entry = index.entries.find(
      (item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
    );
    return entry ? entry.text : null;
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

  /**
   * Reads every stored page once and keeps the ayahs in memory, so repeated
   * searches do not re-parse the whole cache. The count is the cache key: the
   * index is rebuilt only after more pages have been stored.
   */
  private async loadStoredAyahIndex(): Promise<{
    pageCount: number;
    entries: StoredAyahEntry[];
  }> {
    const countRow = await this.database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM mushaf_page_cache WHERE mushaf_id = 19',
    );
    const pageCount = countRow?.count ?? 0;
    if (this.storedAyahIndex && this.storedAyahIndex.pageCount === pageCount) {
      return this.storedAyahIndex;
    }

    const rows = await this.database.getAllAsync<{ page_json: string }>(
      'SELECT page_json FROM mushaf_page_cache WHERE mushaf_id = 19 ORDER BY page_number',
    );
    const entries: StoredAyahEntry[] = [];
    for (const row of rows) {
      let page: MushafPage;
      try {
        page = JSON.parse(row.page_json) as MushafPage;
      } catch {
        continue;
      }
      if (!Array.isArray(page.ayahs)) {
        continue;
      }
      for (const ayah of page.ayahs) {
        if (!Array.isArray(ayah.words)) {
          continue;
        }
        entries.push({
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber,
          text: ayah.words.map((word) => word.textUthmani).join(' '),
        });
      }
    }

    this.storedAyahIndex = { pageCount, entries };
    return this.storedAyahIndex;
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

  /**
   * Tafsir of one ayah. Once read it is kept on the phone, so it opens with no
   * connection the next time. Only the reader's own source is called when it
   * has not been stored yet.
   */
  async getAyahTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    const bundled = getBundledTafsir(surahNumber, ayahNumber);
    if (bundled !== null) {
      return bundled;
    }
    const key = `tafsir:${surahNumber}:${ayahNumber}`;
    const stored = await this.readJson<string>(key);
    if (typeof stored === 'string' && stored.length > 0) {
      return stored;
    }
    const text = await quranContentProvider.getAyahTafsir(surahNumber, ayahNumber);
    if (text.trim().length > 0) {
      await this.writeJson(key, text).catch(() => undefined);
    }
    return text;
  }

  /** Meanings of the words of one ayah, stored after the first successful read. */
  async getAyahWordMeanings(surahNumber: number, ayahNumber: number): Promise<AyahWordMeaning[]> {
    const bundled = getBundledWordMeanings(surahNumber, ayahNumber);
    if (bundled !== null) {
      return bundled;
    }
    const key = `word-meanings:${surahNumber}:${ayahNumber}`;
    const stored = await this.readJson<AyahWordMeaning[]>(key);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    const meanings = await quranContentProvider.getAyahWordMeanings(surahNumber, ayahNumber);
    if (meanings.length > 0) {
      await this.writeJson(key, meanings).catch(() => undefined);
    }
    return meanings;
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
