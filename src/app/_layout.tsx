import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  Alert,
  I18nManager,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { BrandIntro, IntroAnimationContext } from '@/components/brand-intro';
import { LinearGradient } from '@/components/ui/optional-native-views';
import { initializeDatabase } from '@/core/database/migrations';
import { OfflineLibrary } from '@/features/reader/services/offline-library';
import { useOfflineDownloadStore } from '@/features/reader/state/offline-download-store';
import {
  DEFAULT_RECITER_ID,
  useReaderPreferencesStore,
  type ThemePreference,
} from '@/features/reader/state/reader-preferences-store';

// Every screen is laid out by hand (right-to-left rows, fixed arrows), so the
// app must look the same on every phone. On a phone set to Arabic, Android
// would also flip the layout by itself and mirror those screens a second time.
// Asking the system not to flip takes effect the next time the app is opened.
if (Platform.OS !== 'web' && I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

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

/** Backdrop of the update card's header, so the top of the box is never bare. */
const UPDATE_HERO_SOURCE = require('../../assets/images/quran-hero.png');

function AppLayout() {
  const database = useSQLiteContext();
  const [introFinished, setIntroFinished] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<Updates.Manifest | null>(null);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const colorScheme = useColorScheme();
  const { downloadProgress } = Updates.useUpdates();
  const themePreference = useReaderPreferencesStore((state) => state.themePreference);
  const setPreferences = useReaderPreferencesStore((state) => state.setPreferences);
  const setPreferenceError = useReaderPreferencesStore((state) => state.setError);
  const dark = themePreference === 'system'
    ? colorScheme === 'dark'
    : themePreference === 'dark' || themePreference === 'night';
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

        setAvailableUpdate(result.manifest);
      } catch (error) {
        console.error('تعذر التحقق من تحديث التطبيق.', error);
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
        const savedTheme = settings.get('theme');
        const savedReciterValue = settings.get('reciterId');
        const parsedReciter =
          savedReciterValue === undefined ? DEFAULT_RECITER_ID : Number(savedReciterValue);
        // Each setting falls back on its own so one stale value can never
        // discard the other; a saved reciter id is valid as long as it is a
        // non-zero integer, since full-surah reciters use negative ids.
        setPreferences(
          savedTheme !== undefined && isThemePreference(savedTheme) ? savedTheme : 'system',
          Number.isInteger(parsedReciter) && parsedReciter !== 0 ? parsedReciter : DEFAULT_RECITER_ID,
        );
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

  // Storing the whole Mushaf takes tens of megabytes, so the first time the
  // reader is asked once (Wi-Fi is the better choice). "Yes" resumes the
  // download on every launch until it is complete, and "later" simply asks
  // again on the next launch. A stored "never" still stops the asking; it now
  // comes only from deleting the downloaded Mushaf in settings or from older
  // app versions. Pages already stored are skipped, which makes the resumed
  // pass cheap.
  useEffect(() => {
    if (!introFinished) {
      return;
    }
    let active = true;
    const library = new OfflineLibrary(database);
    library
      .isComplete()
      .then(async (complete) => {
        if (!active) {
          return;
        }
        const store = useOfflineDownloadStore.getState();
        if (complete) {
          // Everything is already on the device, so the banner only has to say so
          // and report how much room the library takes.
          const pages = await library.getCachedPageCount();
          if (active) {
            store.markReady(pages);
          }
          return;
        }
        const row = await database.getFirstAsync<{ value: string }>(
          "SELECT value FROM app_settings WHERE key = 'offline.autoDownload'",
        );
        if (!active) {
          return;
        }
        const choice = row?.value;
        if (choice === 'yes' || Platform.OS === 'web') {
          void store.start(database, 'all');
        } else if (choice !== 'never') {
          askToDownloadLibrary(database);
        }
      })
      .catch((error: unknown) => {
        console.error('تعذر التحقق من المحتوى المحلي.', error);
      });
    return () => {
      active = false;
    };
  }, [database, introFinished]);

  const dismissUpdate = useCallback(() => {
    if (!downloadingUpdate) {
      setAvailableUpdate(null);
      setUpdateError(false);
    }
  }, [downloadingUpdate]);

  const downloadAndReload = useCallback(async () => {
    setDownloadingUpdate(true);
    setUpdateError(false);
    try {
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        await Updates.reloadAsync();
      } else {
        setDownloadingUpdate(false);
        setAvailableUpdate(null);
      }
    } catch (error) {
      console.error('تعذر تنزيل تحديث التطبيق.', error);
      setUpdateError(true);
      setDownloadingUpdate(false);
    }
  }, []);

  return (
    <ThemeProvider value={theme}>
      <IntroAnimationContext.Provider value={introFinished}>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false }} />
        <BrandIntro onReady={handleIntroReady} onFinished={handleIntroFinished} />
        <UpdateModal
          visible={availableUpdate !== null}
          notes={availableUpdate ? getUpdateNotes(availableUpdate) : []}
          colors={palette}
          downloading={downloadingUpdate}
          progress={downloadProgress}
          failed={updateError}
          onDismiss={dismissUpdate}
          onUpdate={() => void downloadAndReload()}
        />
      </IntroAnimationContext.Provider>
    </ThemeProvider>
  );
}

async function rememberDownloadChoice(database: SQLiteDatabase, choice: 'yes'): Promise<void> {
  try {
    await database.runAsync(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      'offline.autoDownload',
      choice,
      new Date().toISOString(),
    );
  } catch (error) {
    console.error('تعذر حفظ اختيار تحميل المصحف.', error);
  }
}

function askToDownloadLibrary(database: SQLiteDatabase): void {
  Alert.alert(
    'تحميل المصحف للقراءة بدون إنترنت؟',
    'تحميل المصحف كله يحتاج نحو ٥٠ إلى ١٠٠ ميجابايت من الإنترنت (تقدير تقريبي). الأفضل أن يكون الاتصال عبر الواي فاي.',
    [
      {
        text: 'حمّل الآن',
        onPress: () => {
          void rememberDownloadChoice(database, 'yes');
          void useOfflineDownloadStore.getState().start(database, 'all');
        },
      },
      { text: 'لاحقاً', style: 'cancel' },
    ],
    { cancelable: true },
  );
}

function isThemePreference(value: string): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark' || value === 'night';
}

function getUpdateNotes(manifest: Updates.Manifest): string[] {
  if (!('extra' in manifest)) {
    return [];
  }
  const clientExtra = manifest.extra?.expoClient?.extra;
  if (!clientExtra || typeof clientExtra !== 'object' || !('updateNotes' in clientExtra)) {
    return [];
  }
  const notes = clientExtra.updateNotes;
  return Array.isArray(notes)
    ? notes.filter((note): note is string => typeof note === 'string' && note.trim().length > 0)
    : [];
}

function UpdateModal({
  visible,
  notes,
  colors,
  downloading,
  progress,
  failed,
  onDismiss,
  onUpdate,
}: {
  visible: boolean;
  notes: string[];
  colors: (typeof Colors)[keyof typeof Colors];
  downloading: boolean;
  progress?: number;
  failed: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
}) {
  const normalizedProgress = typeof progress === 'number'
    ? Math.max(0, Math.min(1, progress))
    : 0;
  const progressPercent = Math.round(normalizedProgress * 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent>
      <View style={updateStyles.overlay}>
        <View style={[updateStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[updateStyles.hero, { borderBottomColor: `${colors.accent}33` }]}>
            <Image
              source={UPDATE_HERO_SOURCE}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={280}
              pointerEvents="none"
            />
            {/*
              Two scrims, and deliberately not one: the flat wash guarantees the
              white heading stays readable even where the gradient degrades to a
              single tint on builds whose native gradient view is missing, which
              is exactly the state this card is shown in.
            */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <View style={[StyleSheet.absoluteFill, updateStyles.heroWash]} />
              <LinearGradient
                colors={['rgba(4,26,20,0.02)', 'rgba(4,26,20,0.38)', 'rgba(4,26,20,0.78)']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={updateStyles.closeSlot}>
              {!downloading && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="لاحقاً"
                  onPress={onDismiss}
                  hitSlop={10}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
            <View
              style={[
                updateStyles.iconBadge,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}>
              <Ionicons name="sparkles" size={28} color={colors.onPrimary} />
            </View>
            <View style={updateStyles.updateBadge}>
              <View style={[updateStyles.badgeDot, { backgroundColor: colors.accent }]} />
              <Text style={updateStyles.badgeText}>
                {downloading ? 'تحديث قيد التحميل' : 'تحديث جديد'}
              </Text>
            </View>
            <Text style={updateStyles.title}>
              {downloading ? 'نجهّز لك نسخة أجمل' : 'تجربة جديدة للمصحف'}
            </Text>
            <Text style={updateStyles.subtitle}>
              {downloading
                ? 'يتم تنزيل التحسينات بأمان، وسيُعاد تشغيل التطبيق بعد اكتمالها.'
                : 'وصلت إضافات وتحسينات جديدة لتجعل قراءتك أيسر.'}
            </Text>
          </View>

          <ScrollView
            style={updateStyles.notesScroll}
            contentContainerStyle={updateStyles.notesContent}
            showsVerticalScrollIndicator={false}>
            <Text style={[updateStyles.notesTitle, { color: colors.text }]}>أبرز الإضافات</Text>
            {notes.length > 0 ? notes.map((note, index) => (
              <View
                key={`${index}-${note}`}
                style={[
                  updateStyles.noteRow,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <View style={[updateStyles.noteIcon, { backgroundColor: `${colors.accent}22` }]}>
                  <Ionicons name="checkmark" size={14} color={colors.accent} />
                </View>
                <Text style={[updateStyles.noteText, { color: colors.text }]}>{note}</Text>
              </View>
            )) : (
              <Text style={[updateStyles.noteText, { color: colors.textSecondary }]}>
                تحسينات عامة وإصلاحات لتجربة أكثر سلاسة.
              </Text>
            )}
          </ScrollView>

          {downloading && (
            <View style={updateStyles.progressSection}>
              <View style={updateStyles.progressLabels}>
                <Text style={[updateStyles.progressCaption, { color: colors.textSecondary }]}>
                  جارٍ تحميل التحديث
                </Text>
                <Text style={[updateStyles.progressPercent, { color: colors.accent }]}>
                  {toArabicDigits(progressPercent)}٪
                </Text>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
                style={[updateStyles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
                <View
                  style={[
                    updateStyles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: colors.accent,
                      shadowColor: colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[updateStyles.progressHint, { color: colors.textSecondary }]}>
                لا تغلق التطبيق أثناء التحميل
              </Text>
            </View>
          )}

          {failed && (
            <View style={[updateStyles.errorBox, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="cloud-offline-outline" size={18} color={colors.primary} />
              <Text style={[updateStyles.errorText, { color: colors.text }]}>
                تعذر تنزيل التحديث. تحقق من اتصالك وحاول مرة أخرى.
              </Text>
            </View>
          )}

          <View style={updateStyles.actions}>
            {!downloading && (
              <Pressable
                accessibilityRole="button"
                onPress={onDismiss}
                style={[updateStyles.laterButton, { borderColor: colors.border }]}>
                <Text style={[updateStyles.laterText, { color: colors.textSecondary }]}>لاحقاً</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={downloading}
              onPress={onUpdate}
              style={({ pressed }) => [
                updateStyles.updateButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                pressed && !downloading && updateStyles.pressed,
              ]}>
              <Ionicons
                name={downloading ? 'cloud-download-outline' : failed ? 'refresh' : 'download-outline'}
                size={19}
                color={colors.onPrimary}
              />
              <Text style={[updateStyles.updateButtonText, { color: colors.onPrimary }]}>
                {downloading ? 'جاري التحميل' : failed ? 'إعادة المحاولة' : 'حدّث الآن'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const updateStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(4, 17, 12, 0.62)',
  },
  card: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '90%',
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
    elevation: 24,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    overflow: 'hidden',
    /** Stands in for the photograph until it has decoded. */
    backgroundColor: '#04241A',
  },
  /** Flat wash under the gradient, so the heading reads on any photograph. */
  heroWash: {
    backgroundColor: 'rgba(4,26,20,0.34)',
  },
  closeSlot: {
    width: 34,
    height: 34,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(3,20,15,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  iconBadge: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.42)',
    marginTop: 2,
    marginBottom: 13,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  updateBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  title: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.86)',
  },
  notesScroll: {
    flexShrink: 1,
  },
  notesContent: {
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 2,
  },
  noteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  noteIcon: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },
  progressSection: {
    gap: 9,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 6,
  },
  progressLabels: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCaption: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 99,
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  progressHint: {
    fontSize: 11,
    textAlign: 'right',
  },
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
    marginHorizontal: 22,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  laterButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 17,
  },
  laterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  updateButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 15,
    paddingHorizontal: 16,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});

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
