import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  AnnotationTarget,
  AyahVoiceNote,
  Bookmark,
  CreateAyahVoiceNoteInput,
  CreateHighlightInput,
  CreateNoteInput,
  CreateSavedWordInput,
  CreateWordVoiceNoteInput,
  Highlight,
  Note,
  SavedWord,
  WordVoiceNote,
} from '../types';

type AnnotationRow = {
  id: string;
  target_type: AnnotationTarget['type'];
  surah_number: number;
  ayah_number: number;
  start_word_id: string | null;
  end_word_id: string | null;
  created_at: string;
  updated_at: string;
};

type HighlightRow = AnnotationRow & {
  color: string;
  opacity: number;
};

type NoteRow = AnnotationRow & {
  body: string;
};

type BookmarkRow = {
  id: string;
  surah_number: number;
  ayah_number: number;
  created_at: string;
};

type SavedWordRow = {
  id: string;
  surah_number: number;
  ayah_number: number;
  word_id: string;
  word_text: string;
  created_at: string;
};

type WordVoiceNoteRow = {
  id: string;
  surah_number: number;
  ayah_number: number;
  word_id: string;
  file_uri: string;
  duration_ms: number;
  created_at: string;
};

type AyahVoiceNoteRow = {
  id: string;
  surah_number: number;
  ayah_number: number;
  file_uri: string;
  duration_ms: number;
  created_at: string;
};

/** Minimal ayah locator shared by the batched page queries below. */
type AyahReference = {
  surahNumber: number;
  ayahNumber: number;
};

export class SqliteAnnotationRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async listHighlightsForAyah(surahNumber: number, ayahNumber: number): Promise<Highlight[]> {
    const rows = await this.database.getAllAsync<HighlightRow>(
      `SELECT * FROM highlights
       WHERE surah_number = ? AND ayah_number = ?
       ORDER BY created_at ASC, id ASC`,
      surahNumber,
      ayahNumber,
    );
    return rows.map(toHighlight);
  }

  /**
   * Highlights for every reference in one round trip. The reader resolves a
   * whole page at a time, so querying each ayah separately turned a single page
   * turn into dozens of statements; this collapses them into one per surah the
   * page touches.
   */
  async listHighlightsForAyahs(references: readonly AyahReference[]): Promise<Highlight[]> {
    const { sql, parameters, wanted } = ayahRangeQuery('highlights', references);
    if (sql === '') {
      return [];
    }
    const rows = await this.database.getAllAsync<HighlightRow>(sql, ...parameters);
    return rows
      .filter((row) => wanted.has(`${row.surah_number}:${row.ayah_number}`))
      .map(toHighlight);
  }

  async listHighlightsForTarget(target: AnnotationTarget): Promise<Highlight[]> {
    const { sql, parameters } = exactTargetQuery('highlights', target);
    const rows = await this.database.getAllAsync<HighlightRow>(sql, ...parameters);
    return rows.map(toHighlight);
  }

  async createHighlight(input: CreateHighlightInput): Promise<Highlight> {
    validateHighlight(input);
    validateTarget(input.target);
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const target = flattenTarget(input.target);

    await this.database.runAsync(
      `INSERT INTO highlights (
        id, target_type, surah_number, ayah_number, start_word_id, end_word_id,
        color, opacity, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      target.type,
      target.surahNumber,
      target.ayahNumber,
      target.startWordId,
      target.endWordId,
      input.color,
      input.opacity,
      now,
      now,
    );

    return {
      id,
      target: input.target,
      color: input.color,
      opacity: input.opacity,
      createdAt: now,
      updatedAt: now,
    };
  }

  async deleteHighlight(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM highlights WHERE id = ?', id);
  }

  async listNotesForTarget(target: AnnotationTarget): Promise<Note[]> {
    const { sql, parameters } = exactTargetQuery('notes', target);
    const rows = await this.database.getAllAsync<NoteRow>(sql, ...parameters);
    return rows.map(toNote);
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    const body = input.body.trim();
    if (body.length === 0) {
      throw new Error('A note must contain at least one non-whitespace character.');
    }
    validateTarget(input.target);

    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const target = flattenTarget(input.target);

    await this.database.runAsync(
      `INSERT INTO notes (
        id, target_type, surah_number, ayah_number, start_word_id, end_word_id,
        body, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      target.type,
      target.surahNumber,
      target.ayahNumber,
      target.startWordId,
      target.endWordId,
      body,
      now,
      now,
    );

    return { id, target: input.target, body, createdAt: now, updatedAt: now };
  }

  async deleteNote(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM notes WHERE id = ?', id);
  }

  async listBookmarksForAyah(surahNumber: number, ayahNumber: number): Promise<Bookmark[]> {
    const rows = await this.database.getAllAsync<BookmarkRow>(
      `SELECT * FROM bookmarks
       WHERE surah_number = ? AND ayah_number = ?
       ORDER BY created_at ASC, id ASC`,
      surahNumber,
      ayahNumber,
    );
    return rows.map(toBookmark);
  }

  async listBookmarks(): Promise<Bookmark[]> {
    const rows = await this.database.getAllAsync<BookmarkRow>(
      `SELECT * FROM bookmarks
       ORDER BY created_at DESC, id DESC`,
    );
    return rows.map(toBookmark);
  }

  /** Bookmarks for every reference in one round trip (see `listHighlightsForAyahs`). */
  async listBookmarksForAyahs(references: readonly AyahReference[]): Promise<Bookmark[]> {
    const { sql, parameters, wanted } = ayahRangeQuery('bookmarks', references);
    if (sql === '') {
      return [];
    }
    const rows = await this.database.getAllAsync<BookmarkRow>(sql, ...parameters);
    return rows
      .filter((row) => wanted.has(`${row.surah_number}:${row.ayah_number}`))
      .map(toBookmark);
  }

  async createBookmark(surahNumber: number, ayahNumber: number): Promise<Bookmark> {
    if (
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      !Number.isInteger(ayahNumber) ||
      ayahNumber < 1
    ) {
      throw new Error('Bookmarks require a valid surah and ayah reference.');
    }

    const existing = await this.listBookmarksForAyah(surahNumber, ayahNumber);
    if (existing.length > 0) {
      return existing[0];
    }

    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.database.runAsync(
      `INSERT OR IGNORE INTO bookmarks (id, surah_number, ayah_number, created_at)
       VALUES (?, ?, ?, ?)`,
      id,
      surahNumber,
      ayahNumber,
      now,
    );
    const saved = await this.listBookmarksForAyah(surahNumber, ayahNumber);
    if (saved.length === 0) {
      throw new Error('تعذر حفظ العلامة المرجعية.');
    }
    return saved[0];
  }

  async deleteBookmark(surahNumber: number, ayahNumber: number): Promise<void> {
    await this.database.runAsync(
      'DELETE FROM bookmarks WHERE surah_number = ? AND ayah_number = ?',
      surahNumber,
      ayahNumber,
    );
  }

  async listSavedWords(): Promise<SavedWord[]> {
    const rows = await this.database.getAllAsync<SavedWordRow>(
      `SELECT * FROM saved_words
       ORDER BY created_at DESC, id DESC`,
    );
    return rows.map(toSavedWord);
  }

  async listSavedWordsForAyah(surahNumber: number, ayahNumber: number): Promise<SavedWord[]> {
    const rows = await this.database.getAllAsync<SavedWordRow>(
      `SELECT * FROM saved_words
       WHERE surah_number = ? AND ayah_number = ?
       ORDER BY created_at ASC, id ASC`,
      surahNumber,
      ayahNumber,
    );
    return rows.map(toSavedWord);
  }

  /** Saved words for every reference in one round trip (see `listHighlightsForAyahs`). */
  async listSavedWordsForAyahs(references: readonly AyahReference[]): Promise<SavedWord[]> {
    const { sql, parameters, wanted } = ayahRangeQuery('saved_words', references);
    if (sql === '') {
      return [];
    }
    const rows = await this.database.getAllAsync<SavedWordRow>(sql, ...parameters);
    return rows
      .filter((row) => wanted.has(`${row.surah_number}:${row.ayah_number}`))
      .map(toSavedWord);
  }

  async createSavedWord(input: CreateSavedWordInput): Promise<SavedWord> {
    if (
      !Number.isInteger(input.surahNumber) ||
      input.surahNumber < 1 ||
      input.surahNumber > 114 ||
      !Number.isInteger(input.ayahNumber) ||
      input.ayahNumber < 1 ||
      input.wordId.trim().length === 0
    ) {
      throw new Error('Saved words require a valid surah, ayah, and word reference.');
    }

    const wordText = input.wordText.trim();
    if (wordText.length === 0) {
      throw new Error('Saved words require the word text.');
    }

    const existing = (await this.listSavedWordsForAyah(input.surahNumber, input.ayahNumber)).find(
      (word) => word.wordId === input.wordId,
    );
    if (existing) {
      return existing;
    }

    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.database.runAsync(
      `INSERT OR IGNORE INTO saved_words (
        id, surah_number, ayah_number, word_id, word_text, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      input.surahNumber,
      input.ayahNumber,
      input.wordId,
      wordText,
      now,
    );
    const saved = (await this.listSavedWordsForAyah(input.surahNumber, input.ayahNumber)).find(
      (word) => word.wordId === input.wordId,
    );
    if (!saved) {
      throw new Error('تعذر حفظ الكلمة.');
    }
    return saved;
  }

  async deleteSavedWord(
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
  ): Promise<void> {
    await this.database.runAsync(
      'DELETE FROM saved_words WHERE surah_number = ? AND ayah_number = ? AND word_id = ?',
      surahNumber,
      ayahNumber,
      wordId,
    );
  }

  async listVoiceNotesForWord(
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
  ): Promise<WordVoiceNote[]> {
    const rows = await this.database.getAllAsync<WordVoiceNoteRow>(
      `SELECT * FROM word_voice_notes
       WHERE surah_number = ? AND ayah_number = ? AND word_id = ?
       ORDER BY created_at ASC, id ASC`,
      surahNumber,
      ayahNumber,
      wordId,
    );
    return rows.map(toWordVoiceNote);
  }

  async listVoiceNotesForAyah(
    surahNumber: number,
    ayahNumber: number,
  ): Promise<AyahVoiceNote[]> {
    const rows = await this.database.getAllAsync<AyahVoiceNoteRow>(
      `SELECT * FROM ayah_voice_notes
       WHERE surah_number = ? AND ayah_number = ?
       ORDER BY created_at ASC, id ASC`,
      surahNumber,
      ayahNumber,
    );
    return rows.map(toAyahVoiceNote);
  }

  async createVoiceNote(input: CreateWordVoiceNoteInput): Promise<WordVoiceNote> {
    if (
      !Number.isInteger(input.surahNumber) ||
      input.surahNumber < 1 ||
      input.surahNumber > 114 ||
      !Number.isInteger(input.ayahNumber) ||
      input.ayahNumber < 1 ||
      input.wordId.trim().length === 0
    ) {
      throw new Error('Voice notes require a valid surah, ayah, and word reference.');
    }
    const fileUri = input.fileUri.trim();
    if (fileUri.length === 0) {
      throw new Error('Voice notes require the recorded file.');
    }
    if (!Number.isFinite(input.durationMs) || input.durationMs < 0) {
      throw new Error('Voice notes require a non-negative duration.');
    }

    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const durationMs = Math.round(input.durationMs);
    await this.database.runAsync(
      `INSERT INTO word_voice_notes (
        id, surah_number, ayah_number, word_id, file_uri, duration_ms, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.surahNumber,
      input.ayahNumber,
      input.wordId.trim(),
      fileUri,
      durationMs,
      now,
    );

    return {
      id,
      surahNumber: input.surahNumber,
      ayahNumber: input.ayahNumber,
      wordId: input.wordId.trim(),
      fileUri,
      durationMs,
      createdAt: now,
    };
  }

  async createAyahVoiceNote(input: CreateAyahVoiceNoteInput): Promise<AyahVoiceNote> {
    if (
      !Number.isInteger(input.surahNumber) ||
      input.surahNumber < 1 ||
      input.surahNumber > 114 ||
      !Number.isInteger(input.ayahNumber) ||
      input.ayahNumber < 1
    ) {
      throw new Error('Voice notes require a valid surah and ayah reference.');
    }
    const fileUri = input.fileUri.trim();
    if (fileUri.length === 0) {
      throw new Error('Voice notes require the recorded file.');
    }
    if (!Number.isFinite(input.durationMs) || input.durationMs < 0) {
      throw new Error('Voice notes require a non-negative duration.');
    }

    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const durationMs = Math.round(input.durationMs);
    await this.database.runAsync(
      `INSERT INTO ayah_voice_notes (
        id, surah_number, ayah_number, file_uri, duration_ms, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      input.surahNumber,
      input.ayahNumber,
      fileUri,
      durationMs,
      now,
    );

    return {
      id,
      surahNumber: input.surahNumber,
      ayahNumber: input.ayahNumber,
      fileUri,
      durationMs,
      createdAt: now,
    };
  }

  async deleteVoiceNote(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM word_voice_notes WHERE id = ?', id);
  }

  async deleteAyahVoiceNote(id: string): Promise<void> {
    await this.database.runAsync('DELETE FROM ayah_voice_notes WHERE id = ?', id);
  }
}

function validateHighlight(input: CreateHighlightInput): void {
  if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) {
    throw new Error('Highlight colors must be six-digit hexadecimal values.');
  }
  if (!Number.isFinite(input.opacity) || input.opacity < 0 || input.opacity > 1) {
    throw new Error('Highlight opacity must be a number between 0 and 1.');
  }
}

function validateTarget(target: AnnotationTarget): void {
  if (
    !Number.isInteger(target.surahNumber) ||
    target.surahNumber < 1 ||
    target.surahNumber > 114 ||
    !Number.isInteger(target.ayahNumber) ||
    target.ayahNumber < 1
  ) {
    throw new Error('Annotation target must include a valid surah and ayah reference.');
  }

  if (
    (target.type === 'word' && target.wordId.trim().length === 0) ||
    (target.type === 'range' &&
      (target.startWordId.trim().length === 0 || target.endWordId.trim().length === 0))
  ) {
    throw new Error('Word annotations require stable, non-empty word IDs.');
  }
}

function flattenTarget(target: AnnotationTarget): {
  type: AnnotationTarget['type'];
  surahNumber: number;
  ayahNumber: number;
  startWordId: string | null;
  endWordId: string | null;
} {
  switch (target.type) {
    case 'word':
      return {
        type: target.type,
        surahNumber: target.surahNumber,
        ayahNumber: target.ayahNumber,
        startWordId: target.wordId,
        endWordId: null,
      };
    case 'ayah':
      return {
        type: target.type,
        surahNumber: target.surahNumber,
        ayahNumber: target.ayahNumber,
        startWordId: null,
        endWordId: null,
      };
    case 'range':
      return {
        type: target.type,
        surahNumber: target.surahNumber,
        ayahNumber: target.ayahNumber,
        startWordId: target.startWordId,
        endWordId: target.endWordId,
      };
  }
}

function exactTargetQuery(table: 'highlights' | 'notes', target: AnnotationTarget): {
  sql: string;
  parameters: (string | number | null)[];
} {
  const flat = flattenTarget(target);
  return {
    sql: `SELECT * FROM ${table}
          WHERE target_type = ? AND surah_number = ? AND ayah_number = ?
            AND start_word_id IS ? AND end_word_id IS ?
          ORDER BY created_at ASC, id ASC`,
    parameters: [
      flat.type,
      flat.surahNumber,
      flat.ayahNumber,
      flat.startWordId,
      flat.endWordId,
    ],
  };
}

/**
 * Collapses a page's ayah references into one contiguous range per surah. A
 * page turn used to issue one statement per ayah; this keeps it to a single
 * statement per surah the page touches. `wanted` lets the caller discard the
 * rows a range over-selects when the page skips ayahs inside that surah.
 */
function ayahRangeQuery(
  table: 'highlights' | 'bookmarks' | 'saved_words',
  references: readonly AyahReference[],
): { sql: string; parameters: (string | number)[]; wanted: Set<string> } {
  const wanted = new Set<string>();
  const ranges = new Map<number, { from: number; to: number }>();
  for (const reference of references) {
    const key = `${reference.surahNumber}:${reference.ayahNumber}`;
    if (wanted.has(key)) {
      continue;
    }
    wanted.add(key);
    const range = ranges.get(reference.surahNumber);
    if (range === undefined) {
      ranges.set(reference.surahNumber, { from: reference.ayahNumber, to: reference.ayahNumber });
      continue;
    }
    range.from = Math.min(range.from, reference.ayahNumber);
    range.to = Math.max(range.to, reference.ayahNumber);
  }

  if (ranges.size === 0) {
    return { sql: '', parameters: [], wanted };
  }

  const clauses: string[] = [];
  const parameters: (string | number)[] = [];
  for (const [surahNumber, range] of ranges) {
    clauses.push('(surah_number = ? AND ayah_number BETWEEN ? AND ?)');
    parameters.push(surahNumber, range.from, range.to);
  }

  return {
    sql: `SELECT * FROM ${table}
          WHERE ${clauses.join(' OR ')}
          ORDER BY created_at ASC, id ASC`,
    parameters,
    wanted,
  };
}

function toTarget(row: AnnotationRow): AnnotationTarget {
  switch (row.target_type) {
    case 'word':
      if (row.start_word_id === null) {
        throw new Error(`Stored word annotation ${row.id} has no stable word ID.`);
      }
      return {
        type: 'word',
        surahNumber: row.surah_number,
        ayahNumber: row.ayah_number,
        wordId: row.start_word_id,
      };
    case 'ayah':
      return { type: 'ayah', surahNumber: row.surah_number, ayahNumber: row.ayah_number };
    case 'range':
      if (row.start_word_id === null || row.end_word_id === null) {
        throw new Error(`Stored range annotation ${row.id} has incomplete word IDs.`);
      }
      return {
        type: 'range',
        surahNumber: row.surah_number,
        ayahNumber: row.ayah_number,
        startWordId: row.start_word_id,
        endWordId: row.end_word_id,
      };
  }
}

function toHighlight(row: HighlightRow): Highlight {
  return {
    id: row.id,
    target: toTarget(row),
    color: row.color,
    opacity: row.opacity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    target: toTarget(row),
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
    createdAt: row.created_at,
  };
}

function toSavedWord(row: SavedWordRow): SavedWord {
  return {
    id: row.id,
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
    wordId: row.word_id,
    wordText: row.word_text,
    createdAt: row.created_at,
  };
}

function toWordVoiceNote(row: WordVoiceNoteRow): WordVoiceNote {
  return {
    id: row.id,
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
    wordId: row.word_id,
    fileUri: row.file_uri,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  };
}

function toAyahVoiceNote(row: AyahVoiceNoteRow): AyahVoiceNote {
  return {
    id: row.id,
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
    fileUri: row.file_uri,
    durationMs: row.duration_ms,
    createdAt: row.created_at,
  };
}
