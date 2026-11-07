import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { ReciterAvatar } from '@/features/quran/components/reciter-avatar';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import type { QuranSurahSummary } from '@/features/quran/types';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import {
  OfflineLibrary,
  type OfflineStatus,
} from '@/features/reader/services/offline-library';
import { downloadRecitationSurahs } from '@/features/reader/services/recitation-offline';
import {
  getRecitationSurahStatuses,
  type RecitationDownloadProgress,
} from '@/features/reader/services/recitation-offline';
import { useOfflineDownloadStore } from '@/features/reader/state/offline-download-store';
import {
  useReaderPreferencesStore,
  type ThemePreference,
} from '@/features/reader/state/reader-preferences-store';
import { useTheme } from '@/hooks/use-theme';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'تلقائي' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
];

const ArabicReciterNames: Record<number, string> = {
  1: 'عبد الباسط عبد الصمد — مجوّد',
  2: 'عبد الباسط عبد الصمد',
  3: 'عبد الرحمن السديس',
  4: 'أبو بكر الشاطري',
  5: 'هاني الرفاعي',
  6: 'محمود خليل الحصري',
  7: 'مشاري راشد العفاسي',
  9: 'محمد صديق المنشاوي',
  10: 'سعود الشريم',
  12: 'محمود خليل الحصري',
  97: 'ياسر الدوسري',
  161: 'خليفة الطنيجي',
  168: 'محمد صديق المنشاوي — أطفال',
  173: 'مشاري راشد العفاسي — بث مباشر',
  92: 'ياسر الدوسري',
  178: 'إبراهيم الدوسري',
  217: 'بندر بليلة',
  253: 'إسلام صبحي',
  102: 'ماهر المعيقلي',
};

export default function SettingsScreen() {
  const colors = useTheme();
  const appVersion = Constants.expoConfig?.version;
  const database = useSQLiteContext();
  const themePreference = useReaderPreferencesStore((state) => state.themePreference);
  const reciterId = useReaderPreferencesStore((state) => state.reciterId);
  const savedError = useReaderPreferencesStore((state) => state.error);
  const setPreferences = useReaderPreferencesStore((state) => state.setPreferences);
  const setPreferenceError = useReaderPreferencesStore((state) => state.setError);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recitationPickerOpen, setRecitationPickerOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [statusRevision, setStatusRevision] = useState(0);
  const [recitationDownloading, setRecitationDownloading] = useState(false);
  const [recitationProgress, setRecitationProgress] = useState<RecitationDownloadProgress | null>(null);
  const [recitationStatuses, setRecitationStatuses] = useState<Record<number, boolean>>({});

  const offlineRevision = useOfflineDownloadStore((state) => state.revision);
  const offlineRunning = useOfflineDownloadStore((state) => state.running);
  const offlineCancelling = useOfflineDownloadStore((state) => state.cancelling);
  const offlineDone = useOfflineDownloadStore((state) => state.done);
  const offlineTotal = useOfflineDownloadStore((state) => state.total);
  const offlineError = useOfflineDownloadStore((state) => state.error);
  const startDownload = useOfflineDownloadStore((state) => state.start);
  const cancelDownload = useOfflineDownloadStore((state) => state.cancel);

  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  const recitersQuery = useQuery({
    queryKey: ['quran', 'reciters'],
    queryFn: () => quranContentProvider.getReciters(),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const directoryQuery = useQuery({
    queryKey: ['quran', 'offline-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
    staleTime: Infinity,
  });
  const offlineStatusQuery = useQuery({
    queryKey: ['offline', 'status', offlineRevision, statusRevision],
    queryFn: () => new OfflineLibrary(database).getStatus(),
    staleTime: 0,
  });

  const readerDisplayQuery = useQuery({
    queryKey: ['reader', 'display-preferences'],
    queryFn: async () => {
      const rows = await database.getAllAsync<{ key: string; value: string }>(
        `SELECT key, value FROM app_settings WHERE key IN ('reader.fontSize', 'reader.toolbarSize', 'reader.toolbarShape', 'reader.markerScale')`,
      );
      const values = new Map(rows.map((row) => [row.key, row.value]));
      return {
        fontSize: Math.min(80, Math.max(20, Number(values.get('reader.fontSize') ?? 44))),
        toolbarSize: Math.min(56, Math.max(32, Number(values.get('reader.toolbarSize') ?? 40))),
        toolbarShape: values.get('reader.toolbarShape') === 'rounded' ? 'rounded' as const : 'round' as const,
        markerScale: Math.min(1.8, Math.max(0.8, Number(values.get('reader.markerScale') ?? 1))),
      };
    },
    staleTime: Infinity,
  });

  async function savePreference(key: 'theme' | 'reciterId' | 'reader.fontSize' | 'reader.toolbarSize' | 'reader.toolbarShape' | 'reader.markerScale', value: string): Promise<void> {
    setSaving(true);
    setPreferenceError(null);
    try {
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        key,
        value,
        new Date().toISOString(),
      );
      if (key.startsWith('reader.')) {
        await readerDisplayQuery.refetch();
        return;
      }
      const nextTheme = key === 'theme' ? parseThemePreference(value) : themePreference;
      setPreferences(
        nextTheme,
        key === 'reciterId' ? Number(value) : reciterId,
      );
    } catch (error) {
      setPreferenceError(
        error instanceof Error ? `تعذر حفظ الإعداد: ${error.message}` : 'تعذر حفظ الإعداد على الجهاز.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStoredPages(): Promise<void> {
    setConfirmingDelete(false);
    try {
      await new OfflineLibrary(database).deleteAll();
      setStatusRevision((revision) => revision + 1);
    } catch (error) {
      setPreferenceError(
        error instanceof Error ? `تعذر حذف الصفحات المحفوظة: ${error.message}` : 'تعذر حذف الصفحات المحفوظة.',
      );
    }

  }

  async function downloadRecitations(surahNumbers: number[]): Promise<void> {
    setRecitationDownloading(true);
    setPreferenceError(null);
    try {
      await downloadRecitationSurahs(reciterId, surahNumbers, setRecitationProgress);
      if (directoryQuery.data?.surahs) {
        setRecitationStatuses(
          await getRecitationSurahStatuses(reciterId, directoryQuery.data.surahs),
        );
      }
    } catch (error) {
      setPreferenceError(
        error instanceof Error ? `تعذر تحميل التلاوة: ${error.message}` : 'تعذر تحميل التلاوة.',
      );
    } finally {
      setRecitationDownloading(false);
      setRecitationProgress(null);
    }
  }

  const refreshRecitationStatuses = useCallback(async (): Promise<void> => {
    if (!directoryQuery.data?.surahs) {
      return;
    }
    setRecitationStatuses(
      await getRecitationSurahStatuses(reciterId, directoryQuery.data.surahs),
    );
  }, [directoryQuery.data, reciterId]);

  const status = offlineStatusQuery.data;
  const progress = offlineTotal > 0 ? offlineDone / offlineTotal : 0;

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safeArea, { backgroundColor: colors.background }])}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Link href="/" replace asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ])}>
              <Text style={[styles.backText, { color: colors.primary }]}>الرئيسية</Text>
            </Pressable>
          </Link>
          <Text style={[styles.title, { color: colors.text }]}>الإعدادات</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>المظهر</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            اختر المظهر الذي يناسب وقت قراءتك.
          </Text>
          <View style={styles.optionRow}>
            {themeOptions.map((option) => {
              const selected = themePreference === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={saving}
                  onPress={() => void savePreference('theme', option.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? colors.backgroundSelected : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text style={[styles.optionText, { color: selected ? colors.primary : colors.text }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>عرض المصحف</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>عدّل حجم خط المصحف وأدوات التحديد. التغيير يظهر عند الرجوع للمصحف.</Text>
          <DisplaySizeControl
            label="حجم خط الآيات"
            value={readerDisplayQuery.data?.fontSize ?? 44}
            minimum={20}
            maximum={80}
            colors={colors}
            disabled={saving}
            onChange={(value) => void savePreference('reader.fontSize', String(value))}
          />
          <DisplaySizeControl
            label="حجم أدوات التحديد"
            value={readerDisplayQuery.data?.toolbarSize ?? 40}
            minimum={32}
            maximum={56}
            colors={colors}
            disabled={saving}
            onChange={(value) => void savePreference('reader.toolbarSize', String(value))}
          />
          <DisplaySizeControl
            label="حجم أرقام الآيات وعلامات الأرباع"
            value={Math.round((readerDisplayQuery.data?.markerScale ?? 1) * 100)}
            minimum={80}
            maximum={180}
            step={10}
            colors={colors}
            disabled={saving}
            onChange={(value) => void savePreference('reader.markerScale', String(value / 100))}
          />
          <View style={styles.optionRow}>
            {(['round', 'rounded'] as const).map((shape) => {
              const selected = (readerDisplayQuery.data?.toolbarShape ?? 'round') === shape;
              return <Pressable key={shape} accessibilityRole="button" accessibilityState={{ selected }} disabled={saving} onPress={() => void savePreference('reader.toolbarShape', shape)} style={[styles.option, { backgroundColor: selected ? colors.backgroundSelected : colors.background, borderColor: selected ? colors.primary : colors.border }]}><Text style={[styles.optionText, { color: selected ? colors.primary : colors.text }]}>{shape === 'round' ? 'دائري' : 'مربّع ناعم'}</Text></Pressable>;
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="musical-notes-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.sectionHeading}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>تلاوات بلا إنترنت</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                حمّل تلاوات السور للقارئ الحالي واستمع إليها دون اتصال.
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setRecitationPickerOpen(true)}
            style={[styles.wideButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Ionicons name="download-outline" size={18} color={colors.background} />
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>اختيار السور للتلاوة</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.sectionHeading}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>القراءة بلا إنترنت</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                احفظ السور التي تريدها على الجهاز لتقرأها لاحقًا دون اتصال بالإنترنت.
              </Text>
            </View>
          </View>

          {offlineStatusQuery.isPending ? (
            <View style={styles.inlineStatus}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.body, { color: colors.textSecondary }]}>جارٍ حساب المحفوظ…</Text>
            </View>
          ) : offlineStatusQuery.error ? (
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              تعذر حساب الصفحات المحفوظة.
            </Text>
          ) : status ? (
            <View style={styles.statRow}>
              <View
                style={[
                  styles.statTile,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {toArabicNumbers(status.cachedPages)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {`من ${toArabicNumbers(status.totalPages)} صفحة`}
                </Text>
              </View>
              <View
                style={[
                  styles.statTile,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {toArabicNumbers(status.completeSurahs)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>سورة كاملة</Text>
              </View>
            </View>
          ) : null}

          {offlineRunning ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.progressTitle, { color: colors.text }]}>
                    {`تحميل ${toArabicNumbers(offlineDone)} من ${toArabicNumbers(offlineTotal)} صفحة`}
                  </Text>
                </View>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>
                  {`${toArabicNumbers(Math.round(progress * 100))}٪`}
                </Text>
              </View>
              <DownloadProgressBar progress={progress} colors={colors} />
              <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
                {`متبقٍ ${toArabicNumbers(Math.max(offlineTotal - offlineDone, 0))} صفحة · يمكنك التنقل في التطبيق أثناء التحميل`}
              </Text>
            </View>
          ) : null}

          {offlineRunning ? (
            <Pressable
              accessibilityRole="button"
              disabled={offlineCancelling}
              onPress={cancelDownload}
              style={[styles.wideButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="stop-circle-outline" size={18} color={colors.text} />
              <Text style={[styles.primaryButtonText, { color: colors.text }]}>
                {offlineCancelling ? 'جارٍ الإيقاف…' : 'إيقاف التحميل'}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.offlineActions}>
              {status?.cachedPages !== status?.totalPages && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void startDownload(database, 'all')}
                  style={[styles.primaryButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Ionicons name="cloud-download" size={18} color={colors.background} />
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>تحميل الكل</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => setPickerOpen(true)}
                style={[styles.outlineButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="options-outline" size={18} color={colors.text} />
                <Text style={[styles.primaryButtonText, { color: colors.text }]}>اختيار السور</Text>
              </Pressable>
            </View>
          )}

          {!offlineRunning && confirmingDelete ? (
            <View style={styles.confirmRow}>
              <Text style={[styles.body, { color: colors.textSecondary, flex: 1 }]}>
                حذف كل الصفحات المحفوظة؟
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setConfirmingDelete(false)}>
                <Text style={[styles.linkText, { color: colors.primary }]}>إلغاء</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void deleteStoredPages()}>
                <Text style={[styles.linkText, { color: colors.primary }]}>حذف</Text>
              </Pressable>
            </View>
          ) : !offlineRunning && status && status.cachedPages > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setConfirmingDelete(true)}
              style={styles.deleteRow}>
              <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                حذف الصفحات المحفوظة
              </Text>
            </Pressable>
          ) : null}

          {offlineError && (
            <Text accessibilityRole="alert" style={styles.error}>{offlineError}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>القارئ المفضّل</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            تظهر هنا أسماء القرّاء الذين تتوفر لهم تسجيلات آيات من المصدر. تسجيل الكلمة متاح من المقاطع التي يوفرها المصدر.
          </Text>
          {recitersQuery.isPending ? (
            <Text style={[styles.body, { color: colors.textSecondary }]}>جارٍ تحميل القرّاء…</Text>
          ) : recitersQuery.error ? (
            <Pressable accessibilityRole="button" onPress={() => void recitersQuery.refetch()}>
              <Text style={[styles.error, { color: colors.primary }]}>
                تعذر تحميل قائمة القرّاء. اضغط لإعادة المحاولة.
              </Text>
            </Pressable>
          ) : (
            <View style={styles.reciterList}>
              {recitersQuery.data?.map((reciter) => {
                const selected = reciterId === reciter.id;
                return (
                  <View key={reciter.id} style={styles.reciterOptionGroup}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      disabled={saving}
                      onPress={() => void savePreference('reciterId', String(reciter.id))}
                      style={[
                        styles.reciterOption,
                        {
                          backgroundColor: selected ? colors.backgroundSelected : colors.background,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}>
                      <ReciterAvatar
                        reciterId={reciter.id}
                        size={44}
                        backgroundColor={colors.backgroundSelected}
                        iconColor={colors.textSecondary}
                      />
                      <View style={styles.reciterInfo}>
                        <Text style={[styles.reciterName, { color: colors.text }]}>
                          {ArabicReciterNames[Math.abs(reciter.id)] ?? reciter.name}
                        </Text>
                        <Text style={[styles.reciterStyle, { color: colors.textSecondary }]}>
                          {reciter.style}
                        </Text>
                      </View>
                      <Text style={[styles.radio, { color: colors.primary }]}>
                        {selected ? '●' : '○'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {(savedError || !recitersQuery.data?.some((reciter) => reciter.id === reciterId)) && (
          <Text accessibilityRole="alert" style={styles.error}>
            {savedError ?? 'القارئ المحفوظ غير موجود في قائمة المصدر. اختر قارئًا آخر.'}
          </Text>
        )}
        {appVersion && (
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            إصدار التطبيق {appVersion}
          </Text>
        )}
      </ScrollView>

      <SurahDownloadPicker
        visible={pickerOpen}
        colors={colors}
        surahs={directoryQuery.data?.surahs}
        loading={directoryQuery.isPending}
        failed={Boolean(directoryQuery.error)}
        statuses={status?.surahStatuses}
        running={offlineRunning}
        onRetry={() => void directoryQuery.refetch()}
        onDownload={(surahNumbers) => void startDownload(database, surahNumbers)}
        onDownloadAll={() => void startDownload(database, 'all')}
        onDownloadRecitation={(surahNumbers) => downloadRecitations(surahNumbers)}
        recitationDownloading={recitationDownloading}
        recitationStatuses={recitationStatuses}
        recitationProgress={recitationProgress}
        mode="pages"
        onClose={() => setPickerOpen(false)}
      />
      <SurahDownloadPicker
        visible={recitationPickerOpen}
        colors={colors}
        surahs={directoryQuery.data?.surahs}
        loading={directoryQuery.isPending}
        failed={Boolean(directoryQuery.error)}
        statuses={undefined}
        running={false}
        onRetry={() => void directoryQuery.refetch()}
        onDownload={() => undefined}
        onDownloadAll={() => undefined}
        onDownloadRecitation={(surahNumbers) => downloadRecitations(surahNumbers)}
        recitationDownloading={recitationDownloading}
        recitationStatuses={recitationStatuses}
        recitationProgress={recitationProgress}
        mode="recitation"
        onOpen={refreshRecitationStatuses}
        onClose={() => setRecitationPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

type SurahFilter = 'all' | 'missing' | 'saved';

function DisplaySizeControl({
  label,
  value,
  minimum,
  maximum,
  step = 2,
  colors,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step?: number;
  colors: ReturnType<typeof useTheme>;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.displayControl}>
      <Text style={[styles.body, { color: colors.text }]}>{label}</Text>
      <View style={styles.displayControlActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`تصغير ${label}`} disabled={disabled || value <= minimum} onPress={() => onChange(value - step)} style={[styles.sizeButton, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.sizeButtonText, { color: colors.text }]}>−</Text></Pressable>
        <Text style={[styles.sizeValue, { color: colors.primary }]}>{toArabicNumbers(value)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`تكبير ${label}`} disabled={disabled || value >= maximum} onPress={() => onChange(value + step)} style={[styles.sizeButton, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={[styles.sizeButtonText, { color: colors.text }]}>+</Text></Pressable>
      </View>
    </View>
  );
}

const surahFilters: { value: SurahFilter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'missing', label: 'غير المحفوظة' },
  { value: 'saved', label: 'المحفوظة' },
];

function SurahDownloadPicker({
  visible,
  colors,
  surahs,
  loading,
  failed,
  statuses,
  running,
  onRetry,
  onDownload,
  onDownloadAll,
  onDownloadRecitation,
  recitationDownloading,
  recitationStatuses,
  recitationProgress,
  mode,
  onOpen,
  onClose,
}: {
  visible: boolean;
  colors: ReturnType<typeof useTheme>;
  surahs: QuranSurahSummary[] | undefined;
  loading: boolean;
  failed: boolean;
  statuses: OfflineStatus['surahStatuses'] | undefined;
  running: boolean;
  onRetry: () => void;
  onDownload: (surahNumbers: number[]) => void;
  onDownloadAll: () => void;
  onDownloadRecitation: (surahNumbers: number[]) => Promise<void>;
  recitationDownloading: boolean;
  recitationStatuses: Record<number, boolean>;
  recitationProgress: RecitationDownloadProgress | null;
  mode: 'pages' | 'recitation';
  onOpen?: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SurahFilter>('all');
  const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => {
    if (visible && mode === 'recitation') {
      onOpen?.();
    }
  }, [mode, onOpen, visible]);
  const allComplete =
    surahs !== undefined &&
    surahs.length > 0 &&
    surahs.every((surah) => statuses?.[surah.surahNumber] === 'complete');

  /** Clears the selection so the sheet always opens fresh. */
  function closePicker(): void {
    setQuery('');
    setFilter('all');
    setSelected([]);
    onClose();
  }

  const normalizedQuery = normalizeSurahSearch(query);
  const visibleSurahs = useMemo(() => {
    if (!surahs) {
      return [];
    }
    return surahs.filter((surah) => {
      const surahStatus = statuses?.[surah.surahNumber] ?? 'none';
      if (filter === 'missing' && surahStatus === 'complete') {
        return false;
      }
      if (filter === 'saved' && surahStatus !== 'complete') {
        return false;
      }
      return (
        normalizedQuery.length === 0 ||
        normalizeSurahSearch(surah.nameArabic).includes(normalizedQuery) ||
        String(surah.surahNumber).includes(normalizedQuery)
      );
    });
  }, [filter, normalizedQuery, statuses, surahs]);

  const allVisibleSelected =
    visibleSurahs.length > 0 &&
    visibleSurahs.every((surah) => selected.includes(surah.surahNumber));

  function toggle(surahNumber: number): void {
    setSelected((current) =>
      current.includes(surahNumber)
        ? current.filter((item) => item !== surahNumber)
        : [...current, surahNumber],
    );
  }

  function toggleAllVisible(): void {
    setSelected((current) => {
      if (allVisibleSelected) {
        return current.filter(
          (item) => !visibleSurahs.some((surah) => surah.surahNumber === item),
        );
      }
      return [
        ...new Set([...current, ...visibleSurahs.map((surah) => surah.surahNumber)]),
      ];
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={closePicker}>
      <View style={styles.pickerOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          style={StyleSheet.absoluteFill}
          onPress={closePicker}
        />
        <View style={[styles.pickerDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />

          <View style={styles.pickerHeader}>
            <View style={styles.sectionHeading}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>اختيار السور</Text>
              <Text style={[styles.pickerCaption, { color: colors.textSecondary }]}>
                {`المحدد ${toArabicNumbers(selected.length)} · اضغط السورة لتحديدها`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={closePicker}
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.pickerStatus}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.body, { color: colors.textSecondary }]}>جارٍ تحميل السور…</Text>
            </View>
          ) : failed || !surahs ? (
            <Pressable accessibilityRole="button" onPress={onRetry} style={styles.pickerStatus}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                تعذر تحميل السور. اضغط لإعادة المحاولة.
              </Text>
            </Pressable>
          ) : (
            <>
              {mode === 'recitation' && recitationProgress && (
                <View style={styles.pickerProgress}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressTitle, { color: colors.text }]}>
                      {`تحميل التلاوة: ${toArabicNumbers(recitationProgress.done)} من ${toArabicNumbers(recitationProgress.total)}`}
                    </Text>
                    <Text style={[styles.progressPercent, { color: colors.primary }]}>
                      {`${toArabicNumbers(
                        recitationProgress.total > 0
                          ? Math.round((recitationProgress.done / recitationProgress.total) * 100)
                          : 0,
                      )}٪`}
                    </Text>
                  </View>
                  <DownloadProgressBar
                    progress={
                      recitationProgress.total > 0
                        ? recitationProgress.done / recitationProgress.total
                        : 0
                    }
                    colors={colors}
                  />
                </View>
              )}
              <View style={[styles.searchField, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="search" size={16} color={colors.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="ابحث باسم السورة أو رقمها"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="search"
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {query.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="مسح البحث"
                    onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>

              <View style={styles.filterRow}>
                {surahFilters.map((option) => {
                  const active = filter === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setFilter(option.value)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? colors.backgroundSelected : colors.background,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? colors.primary : colors.textSecondary },
                        ]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  onPress={toggleAllVisible}
                  style={styles.selectAllButton}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>
                    {allVisibleSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
                  </Text>
                </Pressable>
              </View>

              <FlatList
                data={visibleSurahs}
                keyExtractor={(item) => String(item.surahNumber)}
                style={styles.pickerListViewport}
                contentContainerStyle={styles.pickerList}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={7}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={[styles.emptyList, { color: colors.textSecondary }]}>
                    لا توجد سورة مطابقة.
                  </Text>
                }
                renderItem={({ item }) => {
                  const surahStatus = statuses?.[item.surahNumber] ?? 'none';
                  const recitationDownloaded = recitationStatuses[item.surahNumber] === true;
                  const checked = selected.includes(item.surahNumber);
                  return (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked, disabled: running }}
                      accessibilityLabel={item.nameArabic}
                      disabled={running}
                      onPress={() => toggle(item.surahNumber)}
                      style={[
                        styles.pickerRow,
                        {
                          backgroundColor: checked ? colors.backgroundSelected : 'transparent',
                          borderColor: colors.border,
                        },
                      ]}>
                      <View
                        style={[
                          styles.checkBox,
                          {
                            borderColor: checked ? colors.primary : colors.border,
                            backgroundColor: checked ? colors.primary : 'transparent',
                          },
                        ]}>
                        {checked && (
                          <Ionicons name="checkmark" size={14} color={colors.background} />
                        )}
                      </View>
                      <View
                        style={[
                          styles.surahBadge,
                          { backgroundColor: colors.background, borderColor: colors.border },
                        ]}>
                        <Text style={[styles.surahBadgeText, { color: colors.primary }]}>
                          {toArabicNumbers(item.surahNumber)}
                        </Text>
                      </View>
                      <View style={styles.pickerInfo}>
                        <Text style={[styles.pickerName, { color: colors.text }]}>
                          {item.nameArabic}
                        </Text>
                        <Text style={[styles.pickerMeta, { color: colors.textSecondary }]}>
                          {mode === 'recitation'
                            ? recitationDownloaded
                              ? 'التلاوة محمّلة'
                              : 'التلاوة غير محمّلة'
                            : `${toArabicNumbers(item.ayahCount)} آية`}
                        </Text>
                      </View>
                      {mode === 'recitation' && (
                        <Ionicons
                          name={recitationDownloaded ? 'checkmark-circle' : 'cloud-download-outline'}
                          size={20}
                          color={recitationDownloaded ? colors.primary : colors.textSecondary}
                        />
                      )}
                      {mode === 'pages' && surahStatus === 'complete' && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                      {surahStatus === 'partial' && (
                        <Ionicons name="contrast-outline" size={20} color={colors.textSecondary} />
                      )}
                    </Pressable>
                  );
                }}
              />

              <View style={styles.pickerFooter}>
                {mode === 'pages' && (
                  <Pressable
                  accessibilityRole="button"
                  disabled={running || selected.length === 0}
                  onPress={() => {
                    onDownload(selected);
                    closePicker();
                  }}
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: selected.length === 0 ? colors.background : colors.primary,
                      borderColor: selected.length === 0 ? colors.border : colors.primary,
                    },
                  ]}>
                  <Ionicons
                    name="download-outline"
                    size={18}
                    color={selected.length === 0 ? colors.textSecondary : colors.background}
                  />
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: selected.length === 0 ? colors.textSecondary : colors.background },
                    ]}>
                    {selected.length === 0
                      ? 'اختر سورًا'
                      : `تحميل المحدد (${toArabicNumbers(selected.length)})`}
                  </Text>
                  </Pressable>
                )}
                {mode === 'recitation' && (
                  <Pressable
                  accessibilityRole="button"
                  disabled={recitationDownloading || selected.length === 0}
                  onPress={() => {
                    void onDownloadRecitation(selected).then(closePicker);
                  }}
                  style={[styles.primaryButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Ionicons name="musical-notes-outline" size={18} color={colors.background} />
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                    {recitationDownloading ? 'جارٍ تحميل التلاوة…' : 'تحميل التلاوة'}
                  </Text>
                  </Pressable>
                )}
                {mode === 'pages' && !allComplete && (
                  <Pressable
                    accessibilityRole="button"
                    disabled={running || recitationDownloading}
                    onPress={() => {
                      onDownloadAll();
                      closePicker();
                    }}
                    style={[styles.outlineButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.primaryButtonText, { color: colors.text }]}>تحميل الكل</Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * The bar tracks the stored pages. Its width is animated from the measured
 * track instead of a percentage string so the growth stays smooth while the
 * download store reports a new page every few hundred milliseconds.
 */
function DownloadProgressBar({
  progress,
  colors,
}: {
  progress: number;
  colors: ReturnType<typeof useTheme>;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const width = useSharedValue(0);

  useEffect(() => {
    const ratio = Math.min(Math.max(progress, 0), 1);
    width.value = withTiming(trackWidth * ratio, { duration: 350 });
  }, [progress, trackWidth, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.progressTrack, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Animated.View
        style={[styles.progressFill, { backgroundColor: colors.primary }, fillStyle]}
      />
    </View>
  );
}

function parseThemePreference(value: string): ThemePreference {
  if (value !== 'system' && value !== 'light' && value !== 'dark') {
    throw new Error('إعداد المظهر غير صالح.');
  }
  return value;
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  body: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    flex: 1,
    gap: 3,
  },
  inlineStatus: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  statRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressBlock: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  progressTrack: {
    height: 10,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitleRow: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressHint: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'right',
  },
  wideButton: {
    minHeight: 46,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  outlineButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  deleteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: Spacing.two,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'right',
  },
  offlineActions: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  optionRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 13,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  displayControl: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  displayControlActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sizeButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonText: { fontSize: 22, fontWeight: '700' },
  sizeValue: { minWidth: 28, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  reciterList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  reciterOptionGroup: {
    gap: 3,
  },
  reciterOption: {
    minHeight: 58,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  reciterInfo: {
    gap: 3,
  },
  reciterName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  reciterStyle: {
    fontSize: 12,
    textAlign: 'right',
  },
  photoCredit: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  photoCreditText: {
    fontSize: 10,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  radio: {
    fontSize: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  pickerDialog: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pickerHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  pickerHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: -Spacing.one,
  },
  pickerCaption: {
    fontSize: 12,
    textAlign: 'right',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchField: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectAllButton: {
    marginStart: 'auto',
    paddingVertical: 6,
  },
  pickerStatus: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  pickerProgress: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  pickerListViewport: {
    flexGrow: 1,
  },
  pickerList: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  emptyList: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  pickerRow: {
    minHeight: 56,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahBadge: {
    minWidth: 34,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  surahBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pickerInfo: {
    flex: 1,
    gap: 3,
  },
  pickerName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  pickerMeta: {
    fontSize: 12,
    textAlign: 'right',
  },
  pickerFooter: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
});
