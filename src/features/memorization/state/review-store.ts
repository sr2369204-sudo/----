import type { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import {
  loadReviewDates,
  reconcileReviewDates,
  saveReviewDates,
  toDateKey,
  type ReviewDates,
} from '@/features/memorization/services/review-schedule';

type ReviewState = {
  dates: ReviewDates;
  /** Reads the saved dates and aligns them with the memorized surahs. */
  sync: (database: SQLiteDatabase, memorized: Iterable<number>) => Promise<void>;
  /** Records that the reader reviewed a surah today. */
  markReviewed: (database: SQLiteDatabase, surahNumber: number) => Promise<void>;
};

export const useReviewStore = create<ReviewState>((set, get) => ({
  dates: {},

  sync: async (database, memorized) => {
    try {
      const saved = await loadReviewDates(database);
      const next = reconcileReviewDates(memorized, saved, toDateKey(new Date()));
      set({ dates: next });
      if (JSON.stringify(next) !== JSON.stringify(saved)) {
        await saveReviewDates(database, next);
      }
    } catch (error) {
      console.error('تعذر تحديث مواعيد المراجعة.', error);
    }
  },

  markReviewed: async (database, surahNumber) => {
    const next = { ...get().dates, [surahNumber]: toDateKey(new Date()) };
    set({ dates: next });
    try {
      await saveReviewDates(database, next);
    } catch (error) {
      console.error('تعذر حفظ موعد المراجعة.', error);
    }
  },
}));
