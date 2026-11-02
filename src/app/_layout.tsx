import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { initializeDatabase } from '@/core/database/migrations';
import {
  DEFAULT_RECITER_ID,
  useReaderPreferencesStore,
} from '@/features/reader/state/reader-preferences-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 60_000,
    },
  },
});

function AppLayout() {
  const database = useSQLiteContext();
  const colorScheme = useColorScheme();
  const themePreference = useReaderPreferencesStore((state) => state.themePreference);
  const setPreferences = useReaderPreferencesStore((state) => state.setPreferences);
  const setPreferenceError = useReaderPreferencesStore((state) => state.setError);
  const dark = themePreference === 'system'
    ? colorScheme === 'dark'
    : themePreference === 'dark';
  const palette = Colors[dark ? 'dark' : 'light'];
  const baseTheme = dark ? DarkTheme : DefaultTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
    },
  };

  useEffect(() => {
    let active = true;
    database
      .getAllAsync<{ key: string; value: string }>(
        "SELECT key, value FROM app_settings WHERE key IN ('theme', 'reciterId')",
      )
      .then((rows) => {
        if (!active) {
          return;
        }
        const settings = new Map(rows.map((row) => [row.key, row.value]));
        const savedTheme = settings.get('theme') ?? 'system';
        const savedReciter = Number(settings.get('reciterId') ?? DEFAULT_RECITER_ID);
        if (!isThemePreference(savedTheme)) {
          throw new Error('إعداد المظهر المحفوظ غير صالح.');
        }
        if (!Number.isInteger(savedReciter) || savedReciter < 1) {
          throw new Error('إعداد القارئ المحفوظ غير صالح.');
        }
        setPreferences(savedTheme, savedReciter);
        setPreferenceError(null);
      })
      .catch((error: unknown) => {
        if (active) {
          setPreferenceError(error instanceof Error ? error.message : 'تعذر تحميل إعدادات التطبيق.');
        }
      });

    return () => {
      active = false;
    };
  }, [database, setPreferenceError, setPreferences]);

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

function isThemePreference(value: string): value is 'system' | 'light' | 'dark' {
  return value === 'system' || value === 'light' || value === 'dark';
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName="mushaf_v2.db" onInit={initializeDatabase}>
        <AppLayout />
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
