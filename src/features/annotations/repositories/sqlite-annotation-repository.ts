import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  AnnotationTarget,
  CreateHighlightInput,
  CreateNoteInput,
  Highlight,
  Note,
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
