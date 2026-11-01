import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

type ReaderPreferencesState = {
  themePreference: ThemePreference;
  reciterId: number;
  error: string | null;
  setPreferences: (themePreference: ThemePreference, reciterId: number) => void;
  setError: (error: string | null) => void;
};

export const DEFAULT_RECITER_ID = 7;

export const useReaderPreferencesStore = create<ReaderPreferencesState>((set) => ({
  themePreference: 'system',
  reciterId: DEFAULT_RECITER_ID,
  error: null,
  setPreferences: (themePreference, reciterId) => set({ themePreference, reciterId }),
  setError: (error) => set({ error }),
}));
