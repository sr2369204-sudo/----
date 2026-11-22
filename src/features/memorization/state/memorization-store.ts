import type { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import {
  loadMemorizedSurahs,
  saveMemorizedSurahs,
} from '@/features/memorization/services/memorization-progress';

type MemorizationState = {
  /** Surah numbers the reader has marked as memorized. */
  memorized: Set<number>;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  /** Reads the stored progress; safe to call from any screen. */
  load: (database: SQLiteDatabase) => Promise<void>;
  /** Flips one surah and persists the result. */
  toggle: (database: SQLiteDatabase, surahNumber: number) => Promise<void>;
  /** Marks several surahs memorized (`true`) or not (`false`) in one save. */
  setMemorized: (
    database: SQLiteDatabase,
    surahNumbers: number[],
    value: boolean,
  ) => Promise<void>;
  /** Clears every memorized surah. */
  reset: (database: SQLiteDatabase) => Promise<void>;
  setError: (error: string | null) => void;
};

/**
 * Shared memorization state. Lives outside the screens so the home shortcut
 * and the heart screen always show the same numbers without re-reading SQLite.
 */
export const useMemorizationStore = create<MemorizationState>((set, get) => ({
  memorized: new Set<number>(),
  loaded: false,
  loading: false,
  error: null,

  load: async (database) => {
    if (get().loading) {
      return;
    }
    set({ loading: true });
    try {
      const surahs = await loadMemorizedSurahs(database);
      set({ memorized: new Set(surahs), loaded: true, loading: false, error: null });
    } catch (error) {
      set({
        loaded: true,
        loading: false,
        error: error instanceof Error ? error.message : 'تعذر تحميل تقدم الحفظ.',
      });
    }
  },

  toggle: async (database, surahNumber) => {
    const previous = get().memorized;
    const next = new Set(previous);
    if (next.has(surahNumber)) {
      next.delete(surahNumber);
    } else {
      next.add(surahNumber);
    }
    // Optimistic so the cell lights up the instant it is tapped.
    set({ memorized: next, error: null });
    try {
      await saveMemorizedSurahs(database, [...next]);
    } catch (error) {
      set({
        memorized: previous,
        error: error instanceof Error ? error.message : 'تعذر حفظ تقدم الحفظ.',
      });
    }
  },

  setMemorized: async (database, surahNumbers, value) => {
    const previous = get().memorized;
    const next = new Set(previous);
    let changed = false;
    for (const surahNumber of surahNumbers) {
      if (value && !next.has(surahNumber)) {
        next.add(surahNumber);
        changed = true;
      } else if (!value && next.delete(surahNumber)) {
        changed = true;
      }
    }
    if (!changed) {
      return;
    }
    // One write for the whole batch keeps multi-select fast.
    set({ memorized: next, error: null });
    try {
      await saveMemorizedSurahs(database, [...next]);
    } catch (error) {
      set({
        memorized: previous,
        error: error instanceof Error ? error.message : 'تعذر حفظ تقدم الحفظ.',
      });
    }
  },

  reset: async (database) => {
    const previous = get().memorized;
    set({ memorized: new Set<number>(), error: null });
    try {
      await saveMemorizedSurahs(database, []);
    } catch (error) {
      set({
        memorized: previous,
        error: error instanceof Error ? error.message : 'تعذر إعادة ضبط التقدم.',
      });
    }
  },

  setError: (error) => set({ error }),
}));
