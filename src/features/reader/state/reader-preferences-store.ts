import { create } from 'zustand';

/**
 * `dark` paints the app dark but keeps the Mushaf page light, while `night`
 * paints the whole app — including the Mushaf page itself — on a black
 * surface with light text.
 */
export type ThemePreference = 'system' | 'light' | 'dark' | 'night';

/**
 * Shape of the word/ayah tools that ring the selection. `round` and `rounded`
 * keep the button square, while `slim` stretches it lengthwise so the tools
 * read as a vertical pill instead of a circle.
 */
export type ReaderToolbarShape = 'round' | 'rounded' | 'slim';

export const READER_TOOLBAR_SHAPE_OPTIONS: { value: ReaderToolbarShape; label: string }[] = [
  { value: 'round', label: 'دائري' },
  { value: 'rounded', label: 'مربّع ناعم' },
  { value: 'slim', label: 'عمودي رفيع' },
];

/** Default to a compact rounded-square shape instead of the vertical pill. */
export const DEFAULT_READER_TOOLBAR_SHAPE: ReaderToolbarShape = 'rounded';

export function isReaderToolbarShape(value: string): value is ReaderToolbarShape {
  return value === 'round' || value === 'rounded' || value === 'slim';
}

type ReaderPreferencesState = {
  themePreference: ThemePreference;
  reciterId: number;
  error: string | null;
  setPreferences: (themePreference: ThemePreference, reciterId: number) => void;
  setError: (error: string | null) => void;
};

export const DEFAULT_RECITER_ID = 7;

export const useReaderPreferencesStore = create<ReaderPreferencesState>((set) => ({
  themePreference: 'light',
  reciterId: DEFAULT_RECITER_ID,
  error: null,
  setPreferences: (themePreference, reciterId) => set({ themePreference, reciterId }),
  setError: (error) => set({ error }),
}));
