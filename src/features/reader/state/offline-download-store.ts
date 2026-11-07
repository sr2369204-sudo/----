import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';

import { OfflineLibrary } from '@/features/reader/services/offline-library';

export type OfflineDownloadTarget = number[] | 'all';

type OfflineDownloadState = {
  /** True while pages are being stored, so the screen can show progress. */
  running: boolean;
  cancelling: boolean;
  done: number;
  total: number;
  error: string | null;
  /** Bumped whenever the stored pages change, to refresh the status query. */
  revision: number;
  start: (database: SQLiteDatabase, target: OfflineDownloadTarget) => Promise<void>;
  /** Reports a library that was already stored before this launch. */
  markReady: (pages: number) => void;
  cancel: () => void;
};

/**
 * Lives outside any screen so the whole-Mushaf download that starts as soon as
 * the app is ready keeps running while the reader navigates around, and its
 * progress stays available to whatever screen shows it.
 */
export const useOfflineDownloadStore = create<OfflineDownloadState>((set, get) => ({
  running: false,
  cancelling: false,
  done: 0,
  total: 0,
  error: null,
  revision: 0,

  start: async (database, target) => {
    if (get().running) {
      return;
    }
    set({ running: true, cancelling: false, done: 0, total: 0, error: null });

    const library = new OfflineLibrary(database);
    const options = {
      onProgress: (done: number, total: number) => set({ done, total }),
      shouldCancel: () => get().cancelling,
    };

    try {
      if (target === 'all') {
        await library.downloadAll(options);
      } else {
        await library.downloadSurahs(target, options);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'تعذر إكمال التحميل.' });
    } finally {
      set((state) => ({
        running: false,
        cancelling: false,
        revision: state.revision + 1,
      }));
    }
  },

  cancel: () => {
    if (get().running) {
      set({ cancelling: true });
    }
  },

  markReady: (pages) => {
    // A running download owns `done`/`total`, so this only fills the state the
    // first time, when everything was already on the device before launch.
    if (get().running || get().total > 0) {
      return;
    }
    set({ done: pages, total: pages, error: null });
  },
}));
