import type { QuranSurah, QuranSurahDirectory } from '../types';

export type ContentUnavailableReason = 'not-configured' | 'network' | 'invalid-data' | 'server';

export class ContentUnavailableError extends Error {
  readonly reason: ContentUnavailableReason;

  constructor(
    reason: ContentUnavailableReason,
    message: string,
  ) {
    super(message);
    this.name = 'ContentUnavailableError';
    this.reason = reason;
  }
}

export interface QuranContentProvider {
  getSurahDirectory(): Promise<QuranSurahDirectory>;
  getSurah(surahNumber: number): Promise<QuranSurah>;
}

export class BackendQuranContentProvider implements QuranContentProvider {
  private readonly baseUrl: string | undefined;

  constructor(baseUrl: string | undefined) {
    this.baseUrl = baseUrl;
  }

  async getSurahDirectory(): Promise<QuranSurahDirectory> {
    const payload = await this.requestJson('/quran/surahs');
    if (!isRecord(payload) || !Array.isArray(payload.surahs) || payload.surahs.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'Surah directory has an invalid shape.');
    }

    const source = parseSource(payload);
    const seen = new Set<number>();
    const surahs = payload.surahs.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.surahNumber !== 'number' ||
        !Number.isInteger(item.surahNumber) ||
        item.surahNumber < 1 ||
        item.surahNumber > 114 ||
        typeof item.nameArabic !== 'string' ||
        item.nameArabic.length === 0 ||
        seen.has(item.surahNumber)
      ) {
        throw new ContentUnavailableError(
          'invalid-data',
          'Surah directory contains an invalid or duplicate entry.',
        );
      }
      seen.add(item.surahNumber);
      return { surahNumber: item.surahNumber, nameArabic: item.nameArabic };
    });

    return { ...source, surahs: surahs.sort((a, b) => a.surahNumber - b.surahNumber) };
  }

  async getSurah(surahNumber: number): Promise<QuranSurah> {
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      throw new RangeError('Surah number must be between 1 and 114.');
    }
    const payload = await this.requestJson(`/quran/surahs/${surahNumber}`);
    return parseSurah(payload, surahNumber);
  }

  private async requestJson(path: string): Promise<unknown> {
    if (!this.baseUrl) {
      throw new ContentUnavailableError(
        'not-configured',
        'Set EXPO_PUBLIC_QURAN_CONTENT_BASE_URL to the trusted content backend.',
      );
    }

    let response: Response;
    try {
      const baseUrl = this.baseUrl.replace(/\/+$/, '');
      response = await fetch(`${baseUrl}${path}`);
    } catch (error) {
      throw new ContentUnavailableError(
        'network',
        error instanceof Error ? error.message : 'The content backend could not be reached.',
      );
    }

    if (!response.ok) {
      throw new ContentUnavailableError(
        'server',
        `Content backend returned HTTP ${response.status}.`,
      );
    }

    try {
      return await response.json();
    } catch {
      throw new ContentUnavailableError('invalid-data', 'Content backend returned invalid JSON.');
    }
  }
}

function parseSurah(payload: unknown, requestedSurah: number): QuranSurah {
  if (
    !isRecord(payload) ||
    !Array.isArray(payload.ayahs) ||
    payload.ayahs.length === 0 ||
    typeof payload.ayahCount !== 'number' ||
    payload.ayahCount !== payload.ayahs.length
  ) {
    throw new ContentUnavailableError('invalid-data', 'Surah response has an invalid shape.');
  }
  if (
    payload.surahNumber !== requestedSurah ||
    typeof payload.nameArabic !== 'string' ||
    payload.nameArabic.length === 0
  ) {
    throw new ContentUnavailableError('invalid-data', 'Surah identity is missing or mismatched.');
  }
  const source = parseSource(payload);
  if (payload.textScript !== 'uthmani' || payload.narration !== 'hafs-an-asim') {
    throw new ContentUnavailableError(
      'invalid-data',
      'Surah response must identify Uthmani text and Hafs narration.',
    );
  }

  const seenAyahNumbers = new Set<number>();
  const seenWordIds = new Set<string>();
  let previousAyahNumber = 0;
  const ayahs: QuranSurah['ayahs'] = payload.ayahs.map((ayah: unknown) => {
    if (
      !isRecord(ayah) ||
      typeof ayah.ayahNumber !== 'number' ||
      !Number.isInteger(ayah.ayahNumber) ||
      ayah.ayahNumber < 1 ||
      ayah.ayahNumber !== previousAyahNumber + 1 ||
      seenAyahNumbers.has(ayah.ayahNumber) ||
      !Array.isArray(ayah.words)
    ) {
      throw new ContentUnavailableError('invalid-data', 'An ayah has an invalid response shape.');
    }
    previousAyahNumber = ayah.ayahNumber;
    seenAyahNumbers.add(ayah.ayahNumber);
    let previousWordPosition = 0;
    const words = ayah.words.map((word: unknown) => {
      if (
        !isRecord(word) ||
        typeof word.id !== 'string' ||
        word.id.length === 0 ||
        seenWordIds.has(word.id) ||
        typeof word.position !== 'number' ||
        !Number.isInteger(word.position) ||
        word.position < 1 ||
        word.position !== previousWordPosition + 1 ||
        typeof word.textUthmani !== 'string' ||
        word.textUthmani.length === 0
      ) {
        throw new ContentUnavailableError('invalid-data', 'A word has an invalid response shape.');
      }
      seenWordIds.add(word.id);
      previousWordPosition = word.position;
      return {
        id: word.id,
        position: word.position,
        textUthmani: word.textUthmani,
      };
    });

    if (words.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'An ayah contains no source words.');
    }

    return { ayahNumber: ayah.ayahNumber, words };
  });

  return {
    surahNumber: requestedSurah,
    nameArabic: payload.nameArabic,
    ...source,
    ayahCount: payload.ayahCount,
    ayahs,
  };
}

function parseSource(payload: Record<string, unknown>): {
  sourceId: string;
  contentVersion: string;
} {
  if (
    typeof payload.sourceId !== 'string' ||
    payload.sourceId.trim().length === 0 ||
    typeof payload.contentVersion !== 'string' ||
    payload.contentVersion.trim().length === 0
  ) {
    throw new ContentUnavailableError(
      'invalid-data',
      'Content response is missing its source or content version.',
    );
  }
  return { sourceId: payload.sourceId, contentVersion: payload.contentVersion };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const quranContentProvider = new BackendQuranContentProvider(
  process.env.EXPO_PUBLIC_QURAN_CONTENT_BASE_URL,
);
