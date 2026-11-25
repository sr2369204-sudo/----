import type { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import {
  type HeartColorKey,
  type HeartColorOverrides,
  loadHeartColorOverrides,
  saveHeartColorOverrides,
} from '@/features/memorization/services/heart-appearance';

import { friendlyError } from '@/features/errors/friendly-error';
type HeartAppearanceState = {
  /** Colours the reader changed; empty means “follow the theme”. */
  overrides: HeartColorOverrides;
  loaded: boolean;
  error: string | null;
  /** Reads the stored colours; safe to call from any screen. */
  load: (database: SQLiteDatabase) => Promise<void>;
  /** Sets one element's colour and persists the result. */
  setColor: (database: SQLiteDatabase, key: HeartColorKey, color: string) => Promise<void>;
  /** Drops every override and falls back to the theme palette. */
  reset: (database: SQLiteDatabase) => Promise<void>;
};

/**
 * Colour choices for the heart map. Kept beside the memorization store so the
 * map and its legend always agree, and stored in the same `app_settings` table.
 */
export const useHeartAppearanceStore = create<HeartAppearanceState>((set, get) => ({
  overrides: {},
  loaded: false,
  error: null,

  load: async (database) => {
    try {
      const overrides = await loadHeartColorOverrides(database);
      set({ overrides, loaded: true, error: null });
    } catch (error) {
      set({
        loaded: true,
        error: friendlyError(error, 'تعذر تحميل ألوان القلب.'),
      });
    }
  },

  setColor: async (database, key, color) => {
    const previous = get().overrides;
    const next: HeartColorOverrides = { ...previous, [key]: color };
    // Optimistic so the map repaints as soon as a swatch is tapped.
    set({ overrides: next, error: null });
    try {
      await saveHeartColorOverrides(database, next);
    } catch (error) {
      set({
        overrides: previous,
        error: friendlyError(error, 'تعذر حفظ لون القلب.'),
      });
    }
  },

  reset: async (database) => {
    const previous = get().overrides;
    set({ overrides: {}, error: null });
    try {
      await saveHeartColorOverrides(database, {});
    } catch (error) {
      set({
        overrides: previous,
        error: friendlyError(error, 'تعذر إعادة ضبط ألوان القلب.'),
      });
    }
  },
}));
