import type {
  AyahSearchResult,
  MushafPage,
  MushafPageLine,
  QuranAyah,
  QuranSurah,
  QuranSurahDirectory,
  QuranWord,
} from '../types';

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
  getMushafPage(pageNumber: number): Promise<MushafPage>;
  getPageNumberForSurah(surahNumber: number): Promise<number>;
  getPageNumberForJuz(juzNumber: number): Promise<number>;
  getPageNumberForAyah(surahNumber: number, ayahNumber: number): Promise<number>;
  getAyahAudioUrl(reciterId: number, surahNumber: number, ayahNumber: number): Promise<string>;
  getReciters(): Promise<QuranReciter[]>;
  getChapterRecitation(reciterId: number, surahNumber: number): Promise<RecitationTrack[]>;
  getVerseKeysForPage(pageNumber: number): Promise<string[]>;
  getVerseKeysForJuz(juzNumber: number): Promise<string[]>;
  getAyahTafsir(surahNumber: number, ayahNumber: number): Promise<string>;
  searchAyahs(query: string, limit?: number): Promise<AyahSearchResult[]>;
}

const API_BASE_URL = 'https://api.quran.com/api/v4';
const AYAH_AUDIO_BASE_URL = 'https://verses.quran.com/';
const WORD_AUDIO_BASE_URL = 'https://audio.qurancdn.com/';
const SOURCE_ID = 'quran-com-api';
const CONTENT_VERSION = 'api-v4';
const API_REQUEST_TIMEOUT_MS = 15_000;
/**
 * Quran.com resource id for «التفسير الميسر» (Arabic). Verified against
 * GET /resources/tafsirs?language=ar.
 */
const TAFSIR_ID = 16;

export type QuranReciter = {
  id: number;
  name: string;
  style: string;
};

/** A single playable ayah recording resolved from the source reciter. */
export type RecitationTrack = {
  surahNumber: number;
  ayahNumber: number;
  url: string;
};

const VERSE_KEY_PAGE_SIZE = 300;

export class QuranComContentProvider implements QuranContentProvider {
  private surahDirectoryPromise: Promise<QuranSurahDirectory> | null = null;
  private basmalaWordsPromise: Promise<{ codeV2: string; textUthmani: string }[]> | null = null;

  async getSurahDirectory(): Promise<QuranSurahDirectory> {
    if (!this.surahDirectoryPromise) {
      this.surahDirectoryPromise = this.fetchSurahDirectory().catch((error: unknown) => {
        this.surahDirectoryPromise = null;
        throw error;
      });
    }
    return this.surahDirectoryPromise;
  }

  private async fetchSurahDirectory(): Promise<QuranSurahDirectory> {
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
        item.revelation_place !== 'makkah' && item.revelation_place !== 'madinah' ||
        seen.has(item.id)
      ) {
        throw new ContentUnavailableError(
          'invalid-data',
          'Surah directory contains an invalid or duplicate entry.',
        );
      }

      seen.add(item.id);
      const revelationPlace: QuranSurahDirectory['surahs'][number]['revelationPlace'] =
        item.revelation_place;
      return {
        surahNumber: item.id,
        nameArabic: item.name_arabic,
        ayahCount: item.verses_count,
        revelationPlace,
      };
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
        `/verses/by_chapter/${surahNumber}?language=ar&words=true&word_fields=text_uthmani%2Ctranslation&fields=text_uthmani_tajweed&per_page=300`,
      ),
    ]);

    return parseSurah(chapterPayload, versesPayload, surahNumber);
  }

  async getMushafPage(pageNumber: number): Promise<MushafPage> {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      throw new RangeError('Mushaf page number must be between 1 and 604.');
    }

    const [directory, versesPayload] = await Promise.all([
      this.getSurahDirectory(),
      this.requestJson(
        `/verses/by_page/${pageNumber}?language=ar&mushaf=19&words=true&word_fields=code_v2%2Ctext_uthmani%2Caudio_url%2Ctranslation&fields=text_uthmani_tajweed&per_page=300`,
      ),
    ]);

    const page = parseMushafPage(versesPayload, pageNumber, directory);
    const hasBasmalaOpening = page.ayahs.some(
      (ayah) => ayah.ayahNumber === 1 && ayah.surahNumber !== 1 && ayah.surahNumber !== 9,
    );
    if (!hasBasmalaOpening) {
      return page;
    }
    return { ...page, basmalaWords: await this.getBasmalaWords() };
  }

  private async getBasmalaWords(): Promise<{ codeV2: string; textUthmani: string }[]> {
    if (!this.basmalaWordsPromise) {
      this.basmalaWordsPromise = this.getMushafPage(1)
        .then((page) => page.lines
          .flatMap((line) => line.words)
          .filter((word) =>
            word.surahNumber === 1 &&
            word.ayahNumber === 1 &&
            word.charType === 'word',
          )
          .map(({ codeV2, textUthmani }) => ({ codeV2, textUthmani })))
        .then((words) => {
          if (words.length === 0) {
            throw new ContentUnavailableError(
              'invalid-data',
              'The source Mushaf page does not contain Basmala glyphs.',
            );
          }
          return words;
        })
        .catch((error: unknown) => {
          this.basmalaWordsPromise = null;
          throw error;
        });
    }
    return this.basmalaWordsPromise;
  }

  async getPageNumberForSurah(surahNumber: number): Promise<number> {
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      throw new RangeError('Surah number must be between 1 and 114.');
    }
    return this.getFirstPageNumber(`/verses/by_chapter/${surahNumber}?fields=page_number&per_page=1`, `${surahNumber}:1`);
  }

  async getPageNumberForJuz(juzNumber: number): Promise<number> {
    if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      throw new RangeError('Juz number must be between 1 and 30.');
    }
    return this.getFirstPageNumber(`/verses/by_juz/${juzNumber}?fields=page_number&per_page=1`, null);
  }

  private async getFirstPageNumber(path: string, expectedVerseKey: string | null): Promise<number> {
    const payload = await this.requestJson(path);
    if (
      !isRecord(payload) ||
      !Array.isArray(payload.verses) ||
      payload.verses.length !== 1 ||
      !isRecord(payload.verses[0]) ||
      typeof payload.verses[0].page_number !== 'number' ||
      !Number.isInteger(payload.verses[0].page_number) ||
      payload.verses[0].page_number < 1 ||
      payload.verses[0].page_number > 604 ||
      expectedVerseKey !== null && payload.verses[0].verse_key !== expectedVerseKey
    ) {
      throw new ContentUnavailableError('invalid-data', 'The requested Mushaf location is invalid.');
    }
    return payload.verses[0].page_number;
  }

  async getPageNumberForAyah(surahNumber: number, ayahNumber: number): Promise<number> {
    assertAyahReference(surahNumber, ayahNumber);
    const payload = await this.requestJson(
      `/verses/by_key/${surahNumber}:${ayahNumber}?fields=page_number`,
    );
    if (
      !isRecord(payload) ||
      !isRecord(payload.verse) ||
      typeof payload.verse.page_number !== 'number' ||
      !Number.isInteger(payload.verse.page_number) ||
      payload.verse.page_number < 1 ||
      payload.verse.page_number > 604
    ) {
      throw new ContentUnavailableError('invalid-data', 'The requested Mushaf location is invalid.');
    }
    return payload.verse.page_number;
  }

  async getAyahTafsir(surahNumber: number, ayahNumber: number): Promise<string> {
    assertAyahReference(surahNumber, ayahNumber);
    const payload = await this.requestJson(
      `/tafsirs/${TAFSIR_ID}/by_ayah/${surahNumber}:${ayahNumber}`,
    );
    if (!isRecord(payload) || !isRecord(payload.tafsir) || typeof payload.tafsir.text !== 'string') {
      throw new ContentUnavailableError('invalid-data', 'Tafsir response is invalid.');
    }
    const text = stripMarkup(payload.tafsir.text);
    if (text.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'Tafsir response is empty.');
    }
    return text;
  }

  async searchAyahs(query: string, limit = 20): Promise<AyahSearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      throw new RangeError('بحث فارغ.');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new RangeError('Search limit must be an integer between 1 and 50.');
    }
    const payload = await this.requestJson(
      `/search?q=${encodeURIComponent(trimmed)}&size=${limit}&page=1&language=ar`,
    );
    if (!isRecord(payload) || !isRecord(payload.search) || !Array.isArray(payload.search.results)) {
      throw new ContentUnavailableError('invalid-data', 'Search response is invalid.');
    }
    const results: AyahSearchResult[] = [];
    for (const item of payload.search.results) {
      if (!isRecord(item) || typeof item.verse_key !== 'string') {
        continue;
      }
      const match = /^(\d{1,3}):(\d{1,3})$/.exec(item.verse_key);
      if (!match) {
        continue;
      }
      results.push({
        surahNumber: Number(match[1]),
        ayahNumber: Number(match[2]),
        text: typeof item.text === 'string' ? stripMarkup(item.text) : '',
      });
    }
    return results;
  }

  async getAyahAudioUrl(
    reciterId: number,
    surahNumber: number,
    ayahNumber: number,
  ): Promise<string> {
    if (
      !Number.isInteger(reciterId) ||
      reciterId < 1 ||
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      !Number.isInteger(ayahNumber) ||
      ayahNumber < 1
    ) {
      throw new RangeError('Reciter, surah, and ayah must be valid positive integers.');
    }

    const payload = await this.requestJson(
      `/recitations/${reciterId}/by_ayah/${surahNumber}:${ayahNumber}`,
    );
    if (
      !isRecord(payload) ||
      !Array.isArray(payload.audio_files) ||
      payload.audio_files.length !== 1 ||
      !isRecord(payload.audio_files[0]) ||
      payload.audio_files[0].verse_key !== `${surahNumber}:${ayahNumber}` ||
      typeof payload.audio_files[0].url !== 'string' ||
      !isSafeAudioPath(payload.audio_files[0].url)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Ayah audio response is invalid.');
    }

    return new URL(payload.audio_files[0].url, AYAH_AUDIO_BASE_URL).toString();
  }

  async getReciters(): Promise<QuranReciter[]> {
    const payload = await this.requestJson('/resources/chapter_reciters?language=ar');
    if (!isRecord(payload) || !Array.isArray(payload.reciters) || payload.reciters.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'Reciter list has an invalid shape.');
    }

    const seen = new Set<number>();
    const reciters = payload.reciters.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'number' ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        seen.has(item.id) ||
        typeof item.name !== 'string' ||
        item.name.trim().length === 0 ||
        !isRecord(item.style) ||
        typeof item.style.name !== 'string'
      ) {
        throw new ContentUnavailableError('invalid-data', 'Reciter list contains an invalid entry.');
      }

      seen.add(item.id);
      return { id: item.id, name: item.name, style: item.style.name };
    });

    const playableReciters: QuranReciter[] = [];
    for (const reciter of reciters) {
      try {
        await this.getAyahAudioUrl(reciter.id, 1, 1);
        playableReciters.push(reciter);
      } catch (error) {
        if (
          error instanceof ContentUnavailableError &&
          error.reason === 'server' &&
          error.message === 'Quran.com API returned HTTP 404.'
        ) {
          continue;
        }
        throw error;
      }
    }

    if (playableReciters.length === 0) {
      throw new ContentUnavailableError(
        'invalid-data',
        'Quran.com did not provide a playable reciter.',
      );
    }
    return playableReciters;
  }

  async getChapterRecitation(reciterId: number, surahNumber: number): Promise<RecitationTrack[]> {
    if (!Number.isInteger(reciterId) || reciterId < 1) {
      throw new RangeError('Reciter id must be a positive integer.');
    }
    if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      throw new RangeError('Surah number must be between 1 and 114.');
    }

    const payload = await this.requestJson(
      `/recitations/${reciterId}/by_chapter/${surahNumber}?per_page=${VERSE_KEY_PAGE_SIZE}`,
    );
    if (!isRecord(payload) || !Array.isArray(payload.audio_files)) {
      throw new ContentUnavailableError('invalid-data', 'Chapter recitation response is invalid.');
    }

    const seen = new Set<number>();
    const tracks: RecitationTrack[] = [];
    for (const item of payload.audio_files) {
      if (
        !isRecord(item) ||
        typeof item.verse_key !== 'string' ||
        typeof item.url !== 'string' ||
        !isSafeAudioPath(item.url)
      ) {
        throw new ContentUnavailableError(
          'invalid-data',
          'Chapter recitation contains an invalid entry.',
        );
      }
      const match = /^(\d{1,3}):(\d{1,3})$/.exec(item.verse_key);
      if (!match || Number(match[1]) !== surahNumber || seen.has(Number(match[2]))) {
        throw new ContentUnavailableError(
          'invalid-data',
          'Chapter recitation references an invalid verse.',
        );
      }
      seen.add(Number(match[2]));
      tracks.push({
        surahNumber,
        ayahNumber: Number(match[2]),
        url: new URL(item.url, AYAH_AUDIO_BASE_URL).toString(),
      });
    }

    if (tracks.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'Chapter recitation is empty.');
    }
    return tracks.sort((left, right) => left.ayahNumber - right.ayahNumber);
  }

  async getVerseKeysForPage(pageNumber: number): Promise<string[]> {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      throw new RangeError('Mushaf page number must be between 1 and 604.');
    }
    return this.collectVerseKeys(
      `/verses/by_page/${pageNumber}?language=ar&mushaf=19&fields=verse_key`,
    );
  }

  async getVerseKeysForJuz(juzNumber: number): Promise<string[]> {
    if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      throw new RangeError('Juz number must be between 1 and 30.');
    }
    return this.collectVerseKeys(`/verses/by_juz/${juzNumber}?language=ar&fields=verse_key`);
  }

  private async collectVerseKeys(path: string): Promise<string[]> {
    const verseKeys: string[] = [];
    let totalRecords: number | null = null;
    let pageNumber = 1;
    for (;;) {
      const payload = await this.requestJson(
        `${path}&per_page=${VERSE_KEY_PAGE_SIZE}&page=${pageNumber}`,
      );
      if (
        !isRecord(payload) ||
        !Array.isArray(payload.verses) ||
        !isRecord(payload.pagination) ||
        typeof payload.pagination.total_records !== 'number' ||
        !Number.isInteger(payload.pagination.total_records) ||
        payload.pagination.total_records < 1
      ) {
        throw new ContentUnavailableError('invalid-data', 'Verse key response is invalid.');
      }
      totalRecords = payload.pagination.total_records;

      for (const verse of payload.verses) {
        if (
          !isRecord(verse) ||
          typeof verse.verse_key !== 'string' ||
          !/^\d{1,3}:\d{1,3}$/.test(verse.verse_key)
        ) {
          throw new ContentUnavailableError(
            'invalid-data',
            'Verse key response contains an invalid entry.',
          );
        }
        verseKeys.push(verse.verse_key);
      }

      if (verseKeys.length >= totalRecords || payload.verses.length === 0) {
        break;
      }
      pageNumber += 1;
    }

    if (totalRecords === null || verseKeys.length < totalRecords) {
      throw new ContentUnavailableError('invalid-data', 'Verse key response is incomplete.');
    }
    return verseKeys;
  }

  getWordAudioUrl(audioPath: string): string {
    if (!isSafeWordAudioPath(audioPath)) {
      throw new ContentUnavailableError('invalid-data', 'Word audio path is invalid.');
    }
    return new URL(audioPath, WORD_AUDIO_BASE_URL).toString();
  }

  private async requestJson(path: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new ContentUnavailableError(
          'server',
          `Quran.com API returned HTTP ${response.status}.`,
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof ContentUnavailableError) {
        throw error;
      }
      if (controller.signal.aborted) {
        throw new ContentUnavailableError('network', 'انتهت مهلة الاتصال بمصدر القرآن.');
      }
      if (error instanceof SyntaxError) {
        throw new ContentUnavailableError('invalid-data', 'Quran.com API returned invalid JSON.');
      }
      throw new ContentUnavailableError(
        'network',
        error instanceof Error ? error.message : 'Quran.com could not be reached.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseMushafPage(
  versesPayload: unknown,
  pageNumber: number,
  directory: QuranSurahDirectory,
): MushafPage {
  if (
    !isRecord(versesPayload) ||
    !Array.isArray(versesPayload.verses) ||
    !isRecord(versesPayload.pagination) ||
    versesPayload.pagination.total_records !== versesPayload.verses.length ||
    versesPayload.verses.length === 0
  ) {
    throw new ContentUnavailableError('invalid-data', 'Mushaf page response is invalid.');
  }

  const lines = new Map<number, MushafPageLine['words']>();
  const seenWordIds = new Set<number>();
  const surahByNumber = new Map(directory.surahs.map((surah) => [surah.surahNumber, surah]));
  const surahs = new Map<number, QuranSurahDirectory['surahs'][number]>();
  const ayahs: MushafPage['ayahs'] = [];
  let juzNumber: number | null = null;
  let hizbNumber: number | null = null;
  let previousSurahNumber = 0;
  let previousAyahNumber = 0;
  for (const verse of versesPayload.verses) {
    if (
      !isRecord(verse) ||
      typeof verse.verse_key !== 'string' ||
      !/^\d{1,3}:\d{1,3}$/.test(verse.verse_key) ||
      typeof verse.verse_number !== 'number' ||
      !Number.isInteger(verse.verse_number) ||
      typeof verse.page_number !== 'number' ||
      verse.page_number !== pageNumber ||
      typeof verse.juz_number !== 'number' ||
      !Number.isInteger(verse.juz_number) ||
      verse.juz_number < 1 ||
      verse.juz_number > 30 ||
      typeof verse.hizb_number !== 'number' ||
      !Number.isInteger(verse.hizb_number) ||
      verse.hizb_number < 1 ||
      verse.hizb_number > 60 ||
      !Array.isArray(verse.words)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Mushaf page contains an invalid verse.');
    }

    const [rawSurahNumber] = verse.verse_key.split(':');
    const surahNumber = Number(rawSurahNumber);
    const surah = surahByNumber.get(surahNumber);
    if (
      !surah ||
      verse.verse_number < 1 ||
      verse.verse_number > surah.ayahCount ||
      verse.verse_key !== `${surahNumber}:${verse.verse_number}` ||
      !Array.isArray(verse.words)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Mushaf page references an unknown verse.');
    }
    if (
      previousSurahNumber > 0 &&
      !(
        surahNumber === previousSurahNumber &&
        verse.verse_number === previousAyahNumber + 1
      ) &&
      !(surahNumber === previousSurahNumber + 1 && verse.verse_number === 1)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Mushaf page verses are out of sequence.');
    }

    let previousPosition = 0;
    const ayahWords: QuranAyah['words'] = [];
    for (const item of verse.words) {
      if (
        !isRecord(item) ||
        item.char_type_name !== 'word' && item.char_type_name !== 'end' ||
        typeof item.id !== 'number' ||
        !Number.isInteger(item.id) ||
        item.id < 1 ||
        seenWordIds.has(item.id) ||
        typeof item.position !== 'number' ||
        !Number.isInteger(item.position) ||
        item.position <= previousPosition ||
        item.page_number !== pageNumber ||
        typeof item.line_number !== 'number' ||
        !Number.isInteger(item.line_number) ||
        item.line_number < 1 ||
        item.line_number > 16 ||
        typeof item.code_v2 !== 'string' ||
        item.code_v2.length === 0 ||
        typeof item.text_uthmani !== 'string' ||
        item.text_uthmani.length === 0 ||
        item.audio_url !== null &&
          (typeof item.audio_url !== 'string' || !isSafeWordAudioPath(item.audio_url))
      ) {
        throw new ContentUnavailableError('invalid-data', 'Mushaf page contains an invalid word.');
      }

      previousPosition = item.position;
      seenWordIds.add(item.id);
      const wordId = String(item.id);
      const lineWords = lines.get(item.line_number) ?? [];
      lineWords.push({
        id: wordId,
        surahNumber,
        ayahNumber: verse.verse_number,
        position: item.position,
        pageNumber,
        lineNumber: item.line_number,
        charType: item.char_type_name,
        codeV2: item.code_v2,
        textUthmani: item.text_uthmani,
        audioUrl: item.audio_url,
      });
      lines.set(item.line_number, lineWords);
      if (item.char_type_name === 'word') {
        ayahWords.push({
          id: wordId,
          position: item.position,
          textUthmani: item.text_uthmani,
          audioUrl: item.audio_url,
          translationText: parseWordTranslation(item.translation),
        });
      }
    }

    if (
      ayahWords.length === 0 ||
      typeof verse.text_uthmani_tajweed !== 'string' ||
      !isValidTajweedText(verse.text_uthmani_tajweed, ayahWords, verse.verse_number)
    ) {
      throw new ContentUnavailableError('invalid-data', 'Mushaf page has incomplete Tajweed text.');
    }

    if (!surahs.has(surahNumber)) {
      surahs.set(surahNumber, surah);
    }
    juzNumber ??= verse.juz_number;
    hizbNumber ??= verse.hizb_number;
    previousSurahNumber = surahNumber;
    previousAyahNumber = verse.verse_number;
    ayahs.push({
      surahNumber,
      ayahNumber: verse.verse_number,
      words: ayahWords,
      tajweedText: verse.text_uthmani_tajweed,
    });
  }

  const pageLines: MushafPageLine[] = [...lines.entries()]
    .sort(([left], [right]) => left - right)
    .map(([lineNumber, words]) => ({ lineNumber, words }));

  if (pageLines.length === 0 || juzNumber === null || hizbNumber === null) {
    throw new ContentUnavailableError('invalid-data', 'Mushaf page is missing source metadata.');
  }

  return {
    pageNumber,
    mushafId: 19,
    juzNumber,
    hizbNumber,
    basmalaWords: null,
    surahs: [...surahs.values()],
    ayahs,
    lines: pageLines,
  };
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
    chapterPayload.chapter.revelation_place !== 'makkah' &&
      chapterPayload.chapter.revelation_place !== 'madinah' ||
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
          typeof word.position !== 'number' ||
          !Number.isInteger(word.position) ||
          word.position !== expectedWordPosition ||
          typeof word.text_uthmani !== 'string' ||
          word.text_uthmani.length === 0 ||
          word.audio_url !== null &&
            (typeof word.audio_url !== 'string' || !isSafeWordAudioPath(word.audio_url))
        ) {
          throw new ContentUnavailableError('invalid-data', 'A word has an invalid response shape.');
        }

        seenWordIds.add(word.id);
        expectedWordPosition += 1;
        return {
          id: String(word.id),
          position: word.position,
          textUthmani: word.text_uthmani,
          audioUrl: word.audio_url,
          translationText: parseWordTranslation(word.translation),
        };
      });

    if (words.length === 0) {
      throw new ContentUnavailableError('invalid-data', 'An ayah contains no source words.');
    }

    if (
      typeof verse.text_uthmani_tajweed !== 'string' ||
      !isValidTajweedText(verse.text_uthmani_tajweed, words, verse.verse_number)
    ) {
      throw new ContentUnavailableError('invalid-data', 'An ayah has invalid Tajweed text.');
    }

    return {
      ayahNumber: verse.verse_number,
      words,
      tajweedText: verse.text_uthmani_tajweed,
    };
  });

  return {
    surahNumber: requestedSurah,
    nameArabic: chapterPayload.chapter.name_arabic,
    revelationPlace: chapterPayload.chapter.revelation_place,
    sourceId: SOURCE_ID,
    contentVersion: CONTENT_VERSION,
    ayahCount: ayahs.length,
    ayahs,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseWordTranslation(value: unknown): QuranWord['translationText'] {
  if (!isRecord(value) || typeof value.text !== 'string') {
    return null;
  }
  const text = value.text.trim();
  return text.length === 0 ? null : text;
}

function stripMarkup(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function assertAyahReference(surahNumber: number, ayahNumber: number): void {
  if (
    !Number.isInteger(surahNumber) ||
    surahNumber < 1 ||
    surahNumber > 114 ||
    !Number.isInteger(ayahNumber) ||
    ayahNumber < 1
  ) {
    throw new RangeError('Surah and ayah numbers must be valid positive integers.');
  }
}

function isSafeWordAudioPath(value: string): boolean {
  return /^wbw\/\d{3}_\d{3}_\d{3}\.mp3$/.test(value);
}

function isSafeAudioPath(value: string): boolean {
  if (/^(?:[A-Za-z0-9_-]+\/){2,3}\d{6}\.mp3$/.test(value)) {
    return true;
  }
  return /^\/\/mirrors\.quranicaudio\.com\/everyayah\/Husary_(?:64kbps|Muallim_128kbps)\/\d{6}\.mp3$/.test(
    value,
  );
}

function isValidTajweedText(
  value: string,
  words: QuranSurah['ayahs'][number]['words'],
  ayahNumber: number,
): boolean {
  const endMarker = value.match(/<span class=end>([^<>]+)<\/span>\s*$/)?.[1];
  const arabicNumber = String(ayahNumber).replace(/[0-9]/g, (digit) =>
    String.fromCharCode(0x0660 + Number(digit)),
  );
  const markup = value.match(/<[^>]*>/g) ?? [];
  const tajweedWordCount = value
    .replace(/<span class=end>[^<>]*<\/span>/g, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !(token.length === 1 && token.charCodeAt(0) === 0x06de))
    .length;
  let tajweedDepth = 0;
  let endDepth = 0;
  for (const tag of markup) {
    if (/^<tajweed class=[a-z_]+>$/.test(tag)) {
      if (endDepth !== 0) {
        return false;
      }
      tajweedDepth += 1;
    } else if (tag === '</tajweed>') {
      if (tajweedDepth === 0) {
        return false;
      }
      tajweedDepth -= 1;
    } else if (tag === '<span class=end>') {
      if (tajweedDepth !== 0 || endDepth !== 0) {
        return false;
      }
      endDepth = 1;
    } else if (tag === '</span>') {
      if (endDepth !== 1) {
        return false;
      }
      endDepth = 0;
    } else {
      return false;
    }
  }
  return (
    tajweedDepth === 0 &&
    endDepth === 0 &&
    endMarker === arabicNumber &&
    tajweedWordCount === words.length &&
    value.replace(/<[^>]*>/g, '').trim().length > 0
  );
}

export const quranContentProvider = new QuranComContentProvider();
