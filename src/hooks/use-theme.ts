/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReaderPreferencesStore } from '@/features/reader/state/reader-preferences-store';

/**
 * Resolves the active palette name after applying the user's preference. Both
 * the regular dark appearance and the fully dark `night` appearance use the
 * dark palette; they differ only in how the Mushaf page is rendered, which
 * `useIsNightTheme` reports.
 */
export function useThemeName(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const preference = useReaderPreferencesStore((state) => state.themePreference);
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference === 'night' ? 'dark' : preference;
}

export function useTheme() {
  return Colors[useThemeName()];
}

/** `true` when the dark palette is active — used to pick glass tints. */
export function useIsDarkTheme() {
  return useThemeName() === 'dark';
}

/**
 * `true` only for the fully dark appearance, where the Mushaf page itself is
 * drawn on black with light text and the dark Tajweed palette. The regular
 * dark appearance keeps the Mushaf page on its light parchment.
 */
export function useIsNightTheme() {
  return useReaderPreferencesStore((state) => state.themePreference) === 'night';
}
