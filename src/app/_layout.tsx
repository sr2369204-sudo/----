import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
  const [dbError, setDbError] = useState<Error | null>(null);

  if (dbError) {
    const isLockError =
      dbError.message?.includes('createSyncAccessHandle') ||
      dbError.message?.includes('Access Handles cannot be created') ||
      dbError.name === 'NoModificationAllowedError';

    return (
      <View style={errorStyles.container}>
        <StatusBar style="light" />
        <View style={errorStyles.card}>
          <Text style={errorStyles.icon}>⚠️</Text>
          <Text style={errorStyles.title}>
            {isLockError ? 'قاعدة البيانات قيد الاستخدام في تبويب آخر' : 'تعذر تحميل قاعدة البيانات'}
          </Text>
          <Text style={errorStyles.description}>
            {isLockError
              ? 'يستخدم المتصفح نظام تخزين خاص (OPFS) يمنع فتح قاعدة البيانات في أكثر من نافذة أو تبويب معاً لتفادي تعارض البيانات.\n\nيرجى إغلاق التبويبات الأخرى لصفحة التطبيق ثم الضغط على الزر أدناه.'
              : dbError.message}
          </Text>
          <Pressable
            style={({ pressed }) => [errorStyles.button, pressed && { opacity: 0.85 }]}
            onPress={() => {
              if (typeof window !== 'undefined' && window.location) {
                window.location.reload();
              } else {
                setDbError(null);
              }
            }}
          >
            <Text style={errorStyles.buttonText}>إعادة تحميل الصفحة</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider
          databaseName="mushaf_v2.db"
          onInit={initializeDatabase}
          onError={(err) => setDbError(err)}
        >
          <AppLayout />
        </SQLiteProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 28,
    maxWidth: 460,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  icon: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
