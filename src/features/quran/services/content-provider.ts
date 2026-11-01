import type { QuranSurah, QuranSurahDirectory } from '../types';

export type ContentUnavailableReason = 'network' | 'invalid-data' | 'server';

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

const API_BASE_URL = 'https://api.quran.com/api/v4';
const SOURCE_ID = 'quran-com-api';
const CONTENT_VERSION = 'api-v4';

export class QuranComContentProvider implements QuranContentProvider {
  async getSurahDirectory(): Promise<QuranSurahDirectory> {
    const payload = await this.requestJson('/chapters?language=ar');
    if (!isRecord(payload) || !Array.isArray(payload.chapters) || payload.chapters.length !== 114) {
      throw new ContentUnavailableError('invalid-data', 'Surah directory has an invalid shape.');
    }

    const seen = new Set<number>();
    const surahs = payload.chapters.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'number' ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        item.id > 114 ||
        typeof item.name_arabic !== 'string' ||
        item.name_arabic.trim().length === 0 ||
        typeof item.verses_count !== 'number' ||
        !Number.isInteger(item.verses_count) ||
        item.verses_count < 1 ||
        seen.has(item.id)
      ) {
        throw new ContentUnavailableError(
          'invalid-data',
          'Surah directory contains an invalid or duplicate entry.',
        );
      }

      seen.add(item.id);
      return { surahNumber: item.id, nameArabic: item.name_arabic };
    });

    if (seen.size !== 114) {
      throw new ContentUnavailableError('invalid-data', 'Surah directory is incomplete.');
    }

    return {
      sourceId: SOURCE_ID,
      contentVersion: CONTENT_VERSION,
      surahs: surahs.sort((a, b) => a.surahNumber - b.surahNumber),
    };
  }

  async getSurah(surahNumber: number): Promise<QuranSurah> {
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      throw new RangeError('Surah number must be between 1 and 114.');
    }

    const [chapterPayload, versesPayload] = await Promise.all([
      this.requestJson(`/chapters/${surahNumber}?language=ar`),
      this.requestJson(
        `/verses/by_chapter/${surahNumber}?language=ar&words=true&word_fields=text_uthmani&per_page=300`,
      ),
    ]);

    return parseSurah(chapterPayload, versesPayload, surahNumber);
  }

  private async requestJson(path: string): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`);
    } catch (error) {
      throw new ContentUnavailableError(
        'network',
        error instanceof Error ? error.message : 'Quran.com could not be reached.',
      );
    }

    if (!response.ok) {
      throw new ContentUnavailableError(
        'server',
        `Quran.com API returned HTTP ${response.status}.`,
      );
    }

    try {
      return await response.json();
    } catch {
      throw new ContentUnavailableError('invalid-data', 'Quran.com API returned invalid JSON.');
    }
  }
}

function parseSurah(
  chapterPayload: unknown,
  versesPayload: unknown,
  requestedSurah: number,
): QuranSurah {
  if (
    !isRecord(chapterPayload) ||
    !isRecord(chapterPayload.chapter) ||
    chapterPayload.chapter.id !== requestedSurah ||
    typeof chapterPayload.chapter.name_arabic !== 'string' ||
    chapterPayload.chapter.name_arabic.trim().length === 0 ||
    typeof chapterPayload.chapter.verses_count !== 'number' ||
    !Number.isInteger(chapterPayload.chapter.verses_count) ||
    chapterPayload.chapter.verses_count < 1 ||
    !isRecord(versesPayload) ||
    !Array.isArray(versesPayload.verses) ||
    !isRecord(versesPayload.pagination) ||
    versesPayload.pagination.total_records !== chapterPayload.chapter.verses_count ||
    versesPayload.verses.length !== chapterPayload.chapter.verses_count
  ) {
    throw new ContentUnavailableError(
      'invalid-data',
      'Surah response is incomplete or has an invalid shape.',
    );
  }

  const seenWordIds = new Set<number>();
  let expectedAyahNumber = 1;
  const ayahs: QuranSurah['ayahs'] = versesPayload.verses.map((verse: unknown) => {
    if (
      !isRecord(verse) ||
      typeof verse.verse_number !== 'number' ||
      !Number.isInteger(verse.verse_number) ||
      verse.verse_number !== expectedAyahNumber ||
      !Array.isArray(verse.words)
    ) {
      throw new ContentUnavailableError('invalid-data', 'An ayah has an invalid response shape.');
    }
    expectedAyahNumber += 1;

    let expectedWordPosition = 1;
    const words = verse.words
      .filter((word: unknown) => isRecord(word) && word.char_type_name === 'word')
      .map((word: unknown) => {
        if (
          !isRecord(word) ||
          typeof word.id !== 'number' ||
          !Number.isInteger(word.id) ||
          word.id < 1 ||
          seenWordIds.has(word.id) ||
          word.position !== expectedWordPosition ||
          typeof word.text_uthmani !== 'string' ||
          word.text_uthmani.length === 0
        ) {
          throw new ContentUnavailableError('invalid-data', 'A word has an invalid response shape.');
        }

        seenWordIds.add(word.id);
        expectedWordPosition += 1;
        return {
          id: String(word.id),
          position: word.position,
          textUthmani: word.text_uthmani,
        };
      });

    if (words.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'An ayah contains no source words.');
    }

    return { ayahNumber: verse.verse_number, words };
  });

  return {
    surahNumber: requestedSurah,
    nameArabic: chapterPayload.chapter.name_arabic,
    sourceId: SOURCE_ID,
    contentVersion: CONTENT_VERSION,
    ayahCount: ayahs.length,
    ayahs,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const quranContentProvider = new QuranComContentProvider();
