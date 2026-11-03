import { create } from 'zustand';

import type { QuranAyah, QuranWord } from '@/features/quran/types';

export type ReaderSelection =
  | {
      type: 'word';
      surahNumber: number;
      ayah: QuranAyah;
      word: QuranWord;
      presentation: 'compact' | 'full';
    }
  | {
      type: 'ayah';
      surahNumber: number;
      ayah: QuranAyah;
      presentation: 'compact' | 'full';
    }
  | {
      type: 'range';
      surahNumber: number;
      /** The ayahs of the run, in Mushaf order, all from the same surah. */
      ayahs: QuranAyah[];
      startAyah: number;
      endAyah: number;
      presentation: 'compact' | 'full';
    };

type ReaderSelectionStore = {
  selection: ReaderSelection | null;
  selectWord: (
    surahNumber: number,
    ayah: QuranAyah,
    word: QuranWord,
    presentation: ReaderSelection['presentation'],
  ) => void;
  selectAyah: (
    surahNumber: number,
    ayah: QuranAyah,
    presentation: ReaderSelection['presentation'],
  ) => void;
  /**
   * Selects a continuous run of ayahs. The ayah objects are carried along so
   * the toolbar can read their text without refetching the page.
   */
  selectAyahRange: (
    surahNumber: number,
    ayahs: QuranAyah[],
    presentation: ReaderSelection['presentation'],
  ) => void;
  clearSelection: () => void;
};

export const useReaderSelectionStore = create<ReaderSelectionStore>((set) => ({
  selection: null,
  selectWord: (surahNumber, ayah, word, presentation) =>
    set({ selection: { type: 'word', surahNumber, ayah, word, presentation } }),
  selectAyah: (surahNumber, ayah, presentation) =>
    set({ selection: { type: 'ayah', surahNumber, ayah, presentation } }),
  selectAyahRange: (surahNumber, ayahs, presentation) => {
    if (ayahs.length === 0) {
      return;
    }
    const numbers = ayahs.map((ayah) => ayah.ayahNumber);
    set({
      selection: {
        type: 'range',
        surahNumber,
        ayahs,
        startAyah: Math.min(...numbers),
        endAyah: Math.max(...numbers),
        presentation,
      },
    });
  },
  clearSelection: () => set({ selection: null }),
}));
