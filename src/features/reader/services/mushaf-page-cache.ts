import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { MushafPage } from '@/features/quran/types';
import { quranContentProvider } from '@/features/quran/services/content-provider';

const QCF_TAJWEED_FONT_URL =
  'https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p';

export type CachedMushafPage = {
  page: MushafPage;
  fontBase64: string;
};

type MushafCacheRow = {
  page_json: string;
  page_sha256: string;
  font_data: Uint8Array;
  font_sha256: string;
};

export class MushafPageCache {
  constructor(private readonly database: SQLiteDatabase) {}

  async getPage(pageNumber: number): Promise<CachedMushafPage> {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      throw new RangeError('Mushaf page number must be between 1 and 604.');
    }

    const cached = await this.readCachedPage(pageNumber);
    if (cached) {
      return cached;
    }

    const [page, fontBytes] = await Promise.all([
      quranContentProvider.getMushafPage(pageNumber),
      this.downloadPageFont(pageNumber),
    ]);
    const pageJson = JSON.stringify(page);
    const pageHash = await hashText(pageJson);
    const fontHash = await hashBytes(fontBytes);

    await this.database.runAsync(
      `INSERT OR REPLACE INTO mushaf_page_cache
       (page_number, mushaf_id, page_json, page_sha256, font_data, font_sha256, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      page.pageNumber,
      page.mushafId,
      pageJson,
      pageHash,
      fontBytes,
      fontHash,
      new Date().toISOString(),
    );

    return { page, fontBase64: bytesToBase64(fontBytes) };
  }

  private async readCachedPage(pageNumber: number): Promise<CachedMushafPage | null> {
    const row = await this.database.getFirstAsync<MushafCacheRow>(
      `SELECT page_json, page_sha256, font_data, font_sha256
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
      !isWoff2Font(row.font_data)
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

    return { page, fontBase64: bytesToBase64(row.font_data) };
  }

  private async downloadPageFont(pageNumber: number): Promise<Uint8Array> {
    let response: Response;
    try {
      response = await fetch(`${QCF_TAJWEED_FONT_URL}${pageNumber}.woff2`);
    } catch (error) {
      throw new Error('تعذر الاتصال بمصدر خط المصحف.', { cause: error });
    }
    if (!response.ok) {
      throw new Error(`تعذر تنزيل خط المصحف (HTTP ${response.status}).`);
    }

    const fontBytes = new Uint8Array(await response.arrayBuffer());
    if (!isWoff2Font(fontBytes)) {
      throw new Error('ملف الخط الذي أعاده المصدر غير صالح.');
    }
    return fontBytes;
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
    !('basmalaTajweed' in page) ||
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
    (page.basmalaTajweed === null || typeof page.basmalaTajweed === 'string') &&
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
