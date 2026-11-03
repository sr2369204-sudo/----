import type { SQLiteDatabase } from 'expo-sqlite';

import type { MushafPage } from '@/features/quran/types';
import { ContentUnavailableError } from '@/features/quran/services/content-provider';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';

const LAST_MUSHAF_PAGE = 604;
const TOTAL_SURAHS = 114;
/**
 * Page and font downloads are independent, so a small pool keeps the network
 * busy without opening a flood of connections against the source.
 */
const DOWNLOAD_CONCURRENCY = 4;
/** The in-memory index is written back every this many pages, not on each one. */
const INDEX_FLUSH_INTERVAL = 25;
/**
 * A whole-library download is long enough that a single dropped connection
 * would otherwise throw away everything already fetched, so a page is retried
 * a couple of times before it is reported as a failure.
 */
const PAGE_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;

export type DownloadOptions = {
  onProgress?: (done: number, total: number) => void;
  shouldCancel?: () => boolean;
};

export type SurahCacheStatus = 'complete' | 'partial' | 'none';

export type OfflineStatus = {
  cachedPages: number;
  totalPages: number;
  completeSurahs: number;
  surahStatuses: Record<number, SurahCacheStatus>;
};

/**
 * Stores Quran pages on the device for offline reading. A page is complete
 * once both its source text and its page font are in the local cache, which is
 * exactly what `MushafPageCache` writes, so this service drives that cache and
 * never re-implements it.
 */
export class OfflineLibrary {
  private readonly pageCache: MushafPageCache;

  constructor(
    private readonly database: SQLiteDatabase,
    private readonly cache: LocalQuranCache = new LocalQuranCache(database),
  ) {
    this.pageCache = new MushafPageCache(database);
  }

  /** Number of pages currently readable with no connection. */
  async getCachedPageCount(): Promise<number> {
    const row = await this.database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM mushaf_page_cache WHERE mushaf_id = 19',
    );
    return row?.count ?? 0;
  }

  async getStatus(): Promise<OfflineStatus> {
    const rows = await this.database.getAllAsync<{ page_number: number }>(
      'SELECT page_number FROM mushaf_page_cache WHERE mushaf_id = 19',
    );
    const cachedPages = new Set(rows.map((row) => row.page_number));
    const firstPages = await this.cache.getKnownSurahFirstPages();

    const surahStatuses: Record<number, SurahCacheStatus> = {};
    let completeSurahs = 0;
    for (let surahNumber = 1; surahNumber <= TOTAL_SURAHS; surahNumber += 1) {
      const status = surahCacheStatus(surahNumber, firstPages, cachedPages);
      surahStatuses[surahNumber] = status;
      if (status === 'complete') {
        completeSurahs += 1;
      }
    }

    return {
      cachedPages: cachedPages.size,
      totalPages: LAST_MUSHAF_PAGE,
      completeSurahs,
      surahStatuses,
    };
  }

  async downloadAll(options: DownloadOptions = {}): Promise<void> {
    const pageNumbers = Array.from({ length: LAST_MUSHAF_PAGE }, (_, index) => index + 1);
    await this.downloadPageNumbers(pageNumbers, options);
  }

  async downloadSurahs(
    surahNumbers: number[],
    options: DownloadOptions = {},
  ): Promise<void> {
    const pageNumbers = new Set<number>();
    for (const surahNumber of surahNumbers) {
      if (options.shouldCancel?.()) {
        return;
      }
      const range = await this.cache.getSurahPageRange(surahNumber);
      for (let page = range.firstPage; page <= range.lastPage; page += 1) {
        pageNumbers.add(page);
      }
    }
    await this.cache.flushFirstPages();
    await this.downloadPageNumbers(
      [...pageNumbers].sort((left, right) => left - right),
      options,
    );
  }

  /** Removes the stored pages. Nothing else is affected. */
  async deleteAll(): Promise<void> {
    await this.database.runAsync('DELETE FROM mushaf_page_cache WHERE mushaf_id = 19');
  }

  private async downloadPageNumbers(
    pageNumbers: number[],
    options: DownloadOptions,
  ): Promise<void> {
    const total = pageNumbers.length;
    let done = 0;
    let cursor = 0;
    let failure: unknown = null;

    const worker = async (): Promise<void> => {
      for (;;) {
        if (failure !== null || options.shouldCancel?.()) {
          return;
        }
        const index = cursor;
        cursor += 1;
        if (index >= pageNumbers.length) {
          return;
        }

        const pageNumber = pageNumbers[index];
        try {
          const { page } = await this.loadPage(pageNumber);
          // The source marks the first ayah of a surah only on the page where
          // that surah opens, so this is the surah's real first page.
          for (const ayah of page.ayahs) {
            if (ayah.ayahNumber === 1) {
              await this.cache.recordSurahOpening(ayah.surahNumber, page.pageNumber);
            }
          }
        } catch (error) {
          failure ??= error;
          return;
        }

        done += 1;
        options.onProgress?.(done, total);
        if (done % INDEX_FLUSH_INTERVAL === 0) {
          await this.cache.flushFirstPages();
        }
      }
    };

    await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker));
    await this.cache.flushFirstPages();

    if (failure !== null) {
      throw failure;
    }
  }

  /** Reads one page from the source, retrying a dropped connection. */
  private async loadPage(pageNumber: number): Promise<{ page: MushafPage }> {
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await this.pageCache.getPage(pageNumber);
      } catch (error) {
        if (attempt >= PAGE_ATTEMPTS || !isRetryable(error)) {
          throw error;
        }
        await delay(RETRY_BACKOFF_MS * attempt);
      }
    }
  }
}

function isRetryable(error: unknown): boolean {
  return (
    error instanceof ContentUnavailableError &&
    (error.reason === 'network' || error.reason === 'server')
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function surahCacheStatus(
  surahNumber: number,
  firstPages: Record<string, number>,
  cachedPages: Set<number>,
): SurahCacheStatus {
  const firstPage = firstPages[String(surahNumber)];
  if (firstPage === undefined) {
    return 'none';
  }
  const lastPage = surahNumber === TOTAL_SURAHS
    ? LAST_MUSHAF_PAGE
    : firstPages[String(surahNumber + 1)];
  if (lastPage === undefined) {
    return cachedPages.has(firstPage) ? 'partial' : 'none';
  }

  let complete = true;
  let any = false;
  for (let page = firstPage; page <= lastPage; page += 1) {
    if (cachedPages.has(page)) {
      any = true;
    } else {
      complete = false;
    }
  }
  return complete ? 'complete' : any ? 'partial' : 'none';
}
