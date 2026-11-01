/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReaderPreferencesStore } from '@/features/reader/state/reader-preferences-store';

export function useTheme() {
  const systemScheme = useColorScheme();
  const preference = useReaderPreferencesStore((state) => state.themePreference);
  const theme = preference === 'system'
    ? systemScheme === 'dark' ? 'dark' : 'light'
    : preference;

  return Colors[theme];
}
