import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { BrandIntro, IntroAnimationContext } from '@/components/brand-intro';
import { initializeDatabase } from '@/core/database/migrations';
import {
  DEFAULT_RECITER_ID,
  useReaderPreferencesStore,
} from '@/features/reader/state/reader-preferences-store';

if (Platform.OS !== 'web') {
  SplashScreen.setOptions({ duration: 500, fade: true });
  void SplashScreen.preventAutoHideAsync();
}

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
  const [introFinished, setIntroFinished] = useState(false);
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
  const handleIntroReady = useCallback(() => {
    if (Platform.OS !== 'web') {
      void SplashScreen.hideAsync();
    }
  }, []);
  const handleIntroFinished = useCallback(() => {
    setIntroFinished(true);
  }, []);

  useEffect(() => {
    if (!introFinished || Platform.OS === 'web' || !Updates.isEnabled) {
      return;
    }

    let active = true;
    const checkForUpdate = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (!active || !result.isAvailable) {
          return;
        }

        Alert.alert(
          'تحديث جديد متاح',
          'يتوفر إصدار جديد من التطبيق. هل تريد تنزيله وتثبيته الآن؟',
          [
            { text: 'لاحقاً', style: 'cancel' },
            {
              text: 'تحديث الآن',
              onPress: () => {
                void downloadAndReload();
              },
            },
          ],
        );
      } catch (error) {
        console.error('تعذر التحقق من تحديث التطبيق.', error);
      }
    };

    const downloadAndReload = async () => {
      try {
        const result = await Updates.fetchUpdateAsync();
        if (!result.isNew) {
          return;
        }
        await Updates.reloadAsync();
      } catch (error) {
        console.error('تعذر تنزيل تحديث التطبيق.', error);
        Alert.alert(
          'تعذر تحديث التطبيق',
          'لم نتمكن من تنزيل التحديث. تحقق من اتصال الإنترنت وحاول مجدداً عند فتح التطبيق.',
        );
      }
    };

    void checkForUpdate();
    return () => {
      active = false;
    };
  }, [introFinished]);

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
      <IntroAnimationContext.Provider value={introFinished}>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false }} />
        <BrandIntro onReady={handleIntroReady} onFinished={handleIntroFinished} />
      </IntroAnimationContext.Provider>
    </ThemeProvider>
  );
}

function isThemePreference(value: string): value is 'system' | 'light' | 'dark' {
  return value === 'system' || value === 'light' || value === 'dark';
}

export default function RootLayout() {
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    if (dbError && Platform.OS !== 'web') {
      void SplashScreen.hideAsync();
    }
  }, [dbError]);

  if (dbError) {
    const isLockError =
      dbError.message?.includes('createSyncAccessHandle') ||
      dbError.message?.includes('Access Handles cannot be created') ||
      dbError.name === 'NoModificationAllowedError';

    return (
      <View style={errorStyles.container}>
        <StatusBar hidden />
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
    backgroundColor: '#131109',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1F1A11',
    borderRadius: 16,
    padding: 28,
    maxWidth: 460,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B3220',
  },
  icon: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F4EFE2',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#B7A98B',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#D9A94A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#131109',
    fontSize: 15,
    fontWeight: '600',
  },
});
