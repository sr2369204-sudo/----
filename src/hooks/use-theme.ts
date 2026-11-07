/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReaderPreferencesStore } from '@/features/reader/state/reader-preferences-store';

/** Resolves the active theme name after applying the user's preference. */
export function useThemeName() {
  const systemScheme = useColorScheme();
  const preference = useReaderPreferencesStore((state) => state.themePreference);
  return preference === 'system'
    ? systemScheme === 'dark' ? 'dark' : 'light'
    : preference;
}

export function useTheme() {
  return Colors[useThemeName()];
}

/** `true` when the dark palette is active — used to pick glass tints. */
export function useIsDarkTheme() {
  return useThemeName() === 'dark';
}
