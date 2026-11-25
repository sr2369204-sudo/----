import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { MushafPage } from '@/features/quran/types';
import {
  ContentUnavailableError,
  quranContentProvider,
} from '@/features/quran/services/content-provider';

import { friendlyError } from '@/features/errors/friendly-error';
const QCF_TAJWEED_FONT_URL =
  'https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p';
const BASMALA_FONT_PAGE_NUMBER = 1;
const FONT_REQUEST_TIMEOUT_MS = 15_000;

export type CachedMushafPage = {
  page: MushafPage;
  fontBase64: string;
  basmalaFontBase64: string | null;
};

type MushafCacheRow = {
  page_json: string;
  page_sha256: string;
  font_data: Uint8Array;
  font_sha256: string;
  basmala_font_data: Uint8Array | null;
  basmala_font_sha256: string | null;
};

/**
 * Pages already read and verified in this session. A page is hashed, parsed and
 * base64-encoded once; flipping back to it, or reopening the reader, skips that
 * work. Bounded so the fonts do not pile up in memory.
 */
const VERIFIED_PAGE_LIMIT = 24;
const verifiedPages = new Map<number, CachedMushafPage>();

function rememberVerifiedPage(entry: CachedMushafPage): void {
  verifiedPages.delete(entry.page.pageNumber);
  verifiedPages.set(entry.page.pageNumber, entry);
  while (verifiedPages.size > VERIFIED_PAGE_LIMIT) {
    const oldest = verifiedPages.keys().next();
    if (oldest.done) {
      break;
    }
    verifiedPages.delete(oldest.value);
  }
}

export class MushafPageCache {
  constructor(private readonly database: SQLiteDatabase) {}

  async getPage(pageNumber: number): Promise<CachedMushafPage> {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      throw new RangeError('Mushaf page number must be between 1 and 604.');
    }

    const remembered = verifiedPages.get(pageNumber);
    if (remembered) {
      return remembered;
    }

    let cached: CachedMushafPage | null = null;
    try {
      cached = await this.readCachedPage(pageNumber);
    } catch {
      // Corrupted or mismatched cached row: drop it and download the page again.
      await this.deleteCachedPage(pageNumber);
    }
    if (cached) {
      rememberVerifiedPage(cached);
      return cached;
    }

    const [page, fontBytes] = await Promise.all([
      quranContentProvider.getMushafPage(pageNumber),
      this.downloadPageFont(pageNumber),
    ]);
    const basmalaFontBytes = page.basmalaWords
      ? await this.downloadPageFont(BASMALA_FONT_PAGE_NUMBER)
      : null;
    const pageJson = JSON.stringify(page);
    const pageHash = await hashText(pageJson);
    const fontHash = await hashBytes(fontBytes);
    const basmalaFontHash = basmalaFontBytes ? await hashBytes(basmalaFontBytes) : null;

    await this.database.runAsync(
      `INSERT OR REPLACE INTO mushaf_page_cache
       (page_number, mushaf_id, page_json, page_sha256, font_data, font_sha256,
        basmala_font_data, basmala_font_sha256, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      page.pageNumber,
      page.mushafId,
      pageJson,
      pageHash,
      fontBytes,
      fontHash,
      basmalaFontBytes,
      basmalaFontHash,
      new Date().toISOString(),
    );

    const stored: CachedMushafPage = {
      page,
      fontBase64: bytesToBase64(fontBytes),
      basmalaFontBase64: basmalaFontBytes ? bytesToBase64(basmalaFontBytes) : null,
    };
    rememberVerifiedPage(stored);
    return stored;
  }

  private async readCachedPage(pageNumber: number): Promise<CachedMushafPage | null> {
    const row = await this.database.getFirstAsync<MushafCacheRow>(
      `SELECT page_json, page_sha256, font_data, font_sha256,
              basmala_font_data, basmala_font_sha256
       FROM mushaf_page_cache
       WHERE page_number = ? AND mushaf_id = 19`,
      pageNumber,
    );
    if (!row) {
      return null;
    }

    if (
      await hashText(row.page_json) !== row.page_sha256 ||
      await hashBytes(row.font_data) !== row.font_sha256 ||
      !isWoff2Font(row.font_data) ||
      (row.basmala_font_data === null) !== (row.basmala_font_sha256 === null) ||
      row.basmala_font_data !== null &&
        (!isWoff2Font(row.basmala_font_data) ||
          await hashBytes(row.basmala_font_data) !== row.basmala_font_sha256)
    ) {
      throw new Error('النسخة المحلية من صفحة المصحف أو خطها تالفة.');
    }

    let page: unknown;
    try {
      page = JSON.parse(row.page_json);
    } catch (error) {
      throw new Error(
        'تعذرت قراءة صفحة المصحف المحفوظة.',
        { cause: error },
      );
    }

    if (!isCachedPage(page, pageNumber)) {
      throw new Error('النسخة المحلية من صفحة المصحف لا تطابق بيانات المصدر.');
    }

    if ((page.basmalaWords !== null) !== (row.basmala_font_data !== null)) {
      throw new Error('النسخة المحلية من خط البسملة لا تطابق بيانات صفحة المصحف.');
    }

    return {
      page,
      fontBase64: bytesToBase64(row.font_data),
      basmalaFontBase64: row.basmala_font_data
        ? bytesToBase64(row.basmala_font_data)
        : null,
    };
  }

  private async deleteCachedPage(pageNumber: number): Promise<void> {
    await this.database.runAsync(
      `DELETE FROM mushaf_page_cache WHERE page_number = ? AND mushaf_id = 19`,
      pageNumber,
    );
  }

  private async downloadPageFont(pageNumber: number): Promise<Uint8Array> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FONT_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${QCF_TAJWEED_FONT_URL}${pageNumber}.woff2`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new ContentUnavailableError(
          'server',
          `تعذر تنزيل خط المصحف (HTTP ${response.status}).`,
        );
      }

      const fontBytes = new Uint8Array(await response.arrayBuffer());
      if (!isWoff2Font(fontBytes)) {
        throw new ContentUnavailableError('invalid-data', 'ملف الخط الذي أعاده المصدر غير صالح.');
      }
      return fontBytes;
    } catch (error) {
      if (error instanceof ContentUnavailableError) {
        throw error;
      }
      throw new ContentUnavailableError(
        'network',
        friendlyError(error, 'تعذر الاتصال بمصدر خط المصحف.'),
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function hashText(value: string): Promise<string> {
  return toHex(await digest(CryptoDigestAlgorithm.SHA256, new TextEncoder().encode(value)));
}

async function hashBytes(value: Uint8Array): Promise<string> {
  const buffer = new ArrayBuffer(value.byteLength);
  new Uint8Array(buffer).set(value);
  return toHex(await digest(CryptoDigestAlgorithm.SHA256, buffer));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isWoff2Font(bytes: Uint8Array): boolean {
  return bytes.length > 4 &&
    bytes[0] === 0x77 &&
    bytes[1] === 0x4f &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x32;
}

function bytesToBase64(bytes: Uint8Array): string {
  // The engine's own encoder is far quicker than building the string a
  // character at a time; the loop below is the fallback where it is missing.
  if (typeof btoa === 'function') {
    const chunk = 0x8000;
    let binary = '';
    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(index, index + chunk) as unknown as number[],
      );
    }
    return btoa(binary);
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const triplet = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

    base64 += alphabet[(triplet >> 18) & 0x3f];
    base64 += alphabet[(triplet >> 12) & 0x3f];
    base64 += second === undefined ? '=' : alphabet[(triplet >> 6) & 0x3f];
    base64 += third === undefined ? '=' : alphabet[triplet & 0x3f];
  }
  return base64;
}

function isCachedPage(page: unknown, pageNumber: number): page is MushafPage {
  if (
    typeof page !== 'object' ||
    page === null ||
    !('pageNumber' in page) ||
    !('mushafId' in page) ||
    !('juzNumber' in page) ||
    !('hizbNumber' in page) ||
    !('basmalaWords' in page) ||
    !('surahs' in page) ||
    !('ayahs' in page) ||
    !('lines' in page) ||
    !Array.isArray(page.surahs) ||
    !Array.isArray(page.ayahs)
  ) {
    return false;
  }

  return page.pageNumber === pageNumber &&
    page.mushafId === 19 &&
    (page.basmalaWords === null ||
      Array.isArray(page.basmalaWords) &&
      page.basmalaWords.length > 0 &&
      page.basmalaWords.every((word) =>
        isRecord(word) &&
        typeof word.codeV2 === 'string' &&
        word.codeV2.length > 0 &&
        typeof word.textUthmani === 'string' &&
        word.textUthmani.length > 0,
      )) &&
    Array.isArray(page.lines) &&
    page.lines.length > 0 &&
    page.surahs.length > 0 &&
    page.ayahs.length > 0 &&
    page.lines.every((line) =>
      isRecord(line) &&
      Number.isInteger(line.lineNumber) &&
      Array.isArray(line.words) &&
      line.words.length > 0 &&
      line.words.every((word) =>
        isRecord(word) &&
        typeof word.id === 'string' &&
        Number.isInteger(word.surahNumber) &&
        Number.isInteger(word.ayahNumber) &&
        Number.isInteger(word.position) &&
        word.pageNumber === pageNumber &&
        word.lineNumber === line.lineNumber &&
        (word.charType === 'word' || word.charType === 'end') &&
        typeof word.textUthmani === 'string' &&
        typeof word.codeV2 === 'string',
      ),
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
