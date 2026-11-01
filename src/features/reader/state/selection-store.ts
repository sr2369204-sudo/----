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
  clearSelection: () => void;
};

export const useReaderSelectionStore = create<ReaderSelectionStore>((set) => ({
  selection: null,
  selectWord: (surahNumber, ayah, word, presentation) =>
    set({ selection: { type: 'word', surahNumber, ayah, word, presentation } }),
  selectAyah: (surahNumber, ayah, presentation) =>
    set({ selection: { type: 'ayah', surahNumber, ayah, presentation } }),
  clearSelection: () => set({ selection: null }),
}));
