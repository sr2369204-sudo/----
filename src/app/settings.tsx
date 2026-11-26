import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { downloadRecitationSurahs } from '@/features/reader/services/recitation-offline';
import {
  deleteRecitations,
  getRecitationStoredBytes,
  getRecitationSurahStatuses,
  type RecitationDownloadProgress,
  type SurahDownloadState,
} from '@/features/reader/services/recitation-offline';
import { confirmDelete } from '@/components/confirm-delete';
import { formatMegabytes } from '@/features/settings/utils/format';
import {
  DEFAULT_READER_TOOLBAR_SHAPE,
  READER_TOOLBAR_SHAPE_OPTIONS,
  isReaderToolbarShape,
  useReaderPreferencesStore,
  type ThemePreference,
} from '@/features/reader/state/reader-preferences-store';
import { useTheme } from '@/hooks/use-theme';
import { BackupCard } from '@/features/settings/components/backup-card';
import { OfflineMushafCard } from '@/features/settings/components/offline-mushaf-card';
import { WordAudioCard } from '@/features/settings/components/word-audio-card';

import { friendlyError } from '@/features/errors/friendly-error';
const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'تلقائي' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
  { value: 'night', label: 'ليلي' },
];

/** Shipped defaults for the reader tools and verse marks. */
const DISPLAY_DEFAULT_TOOLBAR_SIZE = 44;
const DISPLAY_DEFAULT_MARKER_SCALE = 1.1;

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
  const [recitationPickerOpen, setRecitationPickerOpen] = useState(false);
  const [recitationDownloading, setRecitationDownloading] = useState(false);
  const [recitationProgress, setRecitationProgress] = useState<RecitationDownloadProgress | null>(null);
  const [recitationStatuses, setRecitationStatuses] = useState<Record<number, boolean>>({});
  const [surahStates, setSurahStates] = useState<Record<number, SurahDownloadState>>({});
  const recitationCancelRef = useRef(false);
  const [recitationRevision, setRecitationRevision] = useState(0);
  // The folder is listed again only when the reciter or the stored files change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recitationBytes = useMemo(() => getRecitationStoredBytes(reciterId), [reciterId, recitationRevision]);

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

  const readerDisplayQuery = useQuery({
    queryKey: ['settings', 'display-preferences'],
    queryFn: async () => {
      const rows = await database.getAllAsync<{ key: string; value: string }>(
        `SELECT key, value FROM app_settings WHERE key IN ('reader.toolbarSize', 'reader.toolbarShape', 'reader.markerScale', 'reader.pageScale')`,
      );
      const values = new Map(rows.map((row) => [row.key, row.value]));
      const savedShape = values.get('reader.toolbarShape') ?? DEFAULT_READER_TOOLBAR_SHAPE;
      return {
        toolbarSize: Math.min(56, Math.max(32, Number(values.get('reader.toolbarSize') ?? DISPLAY_DEFAULT_TOOLBAR_SIZE) || DISPLAY_DEFAULT_TOOLBAR_SIZE)),
        toolbarShape: isReaderToolbarShape(savedShape) ? savedShape : DEFAULT_READER_TOOLBAR_SHAPE,
        markerScale: Math.min(1.8, Math.max(0.8, Number(values.get('reader.markerScale') ?? DISPLAY_DEFAULT_MARKER_SCALE) || DISPLAY_DEFAULT_MARKER_SCALE)),
        pageScale: Math.min(1.5, Math.max(0.8, Number(values.get('reader.pageScale') ?? 1) || 1)),
      };
    },
    staleTime: Infinity,
  });

  async function writeSetting(key: string, value: string): Promise<void> {
    await database.runAsync(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      key,
      value,
      new Date().toISOString(),
    );
  }

  async function savePreference(key: 'theme' | 'reciterId' | 'reader.toolbarSize' | 'reader.toolbarShape' | 'reader.markerScale' | 'reader.pageScale', value: string): Promise<void> {
    setSaving(true);
    setPreferenceError(null);
    try {
      await writeSetting(key, value);
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
        friendlyError(error, 'تعذر حفظ الإعداد على الجهاز.'),
      );
    } finally {
      setSaving(false);
    }
  }

  /** Restores the reader tools and verse marks to their shipped defaults. */
  async function resetDisplayPreferences(): Promise<void> {
    setSaving(true);
    setPreferenceError(null);
    try {
      await writeSetting('reader.toolbarSize', String(DISPLAY_DEFAULT_TOOLBAR_SIZE));
      await writeSetting('reader.toolbarShape', DEFAULT_READER_TOOLBAR_SHAPE);
      await writeSetting('reader.markerScale', String(DISPLAY_DEFAULT_MARKER_SCALE));
      await writeSetting('reader.pageScale', '1');
      await readerDisplayQuery.refetch();
    } catch (error) {
      setPreferenceError(
        friendlyError(error, 'تعذر إعادة الضبط.'),
      );
    } finally {
      setSaving(false);
    }
  }

  async function downloadRecitations(surahNumbers: number[]): Promise<void> {
    setRecitationDownloading(true);
    recitationCancelRef.current = false;
    setPreferenceError(null);
    setSurahStates({});
    try {
      await downloadRecitationSurahs(reciterId, surahNumbers, {
        onProgress: setRecitationProgress,
        onSurahProgress: setSurahStates,
        shouldCancel: () => recitationCancelRef.current,
      });
    } catch (error) {
      setPreferenceError(
        friendlyError(error, 'تعذر تحميل التلاوة.'),
      );
    } finally {
      if (directoryQuery.data?.surahs) {
        setRecitationStatuses(
          await getRecitationSurahStatuses(reciterId, directoryQuery.data.surahs),
        );
      }
      setRecitationRevision((value) => value + 1);
      setRecitationDownloading(false);
      setRecitationProgress(null);
    }
  }

  function removeRecitations(): void {
    confirmDelete(
      'حذف التلاوات المحمّلة؟',
      'ستُحذف تلاوات القارئ الحالي من جهازك لتوفير المساحة، ويمكنك تحميلها مرة أخرى.',
      () => {
        try {
          deleteRecitations(reciterId);
          setRecitationStatuses({});
          setRecitationRevision((value) => value + 1);
        } catch (error) {
          setPreferenceError(friendlyError(error, 'تعذر حذف التلاوات المحمّلة.'));
        }
      },
    );
  }

  const refreshRecitationStatuses = useCallback(async (): Promise<void> => {
    if (!directoryQuery.data?.surahs) {
      return;
    }
    setRecitationStatuses(
      await getRecitationSurahStatuses(reciterId, directoryQuery.data.surahs),
    );
  }, [directoryQuery.data, reciterId]);

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
            اختر المظهر الذي يناسب وقت قراءتك. «داكن» يُبقي صفحات المصحف على لونها الفاتح، بينما «ليلي» يجعل المصحف نفسه داكنًا بخلفية سوداء.
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
          <Text style={[styles.body, { color: colors.textSecondary }]}>عدّل حجم أدوات التحديد وشكلها. التغيير يظهر عند الرجوع للمصحف.</Text>
          <DisplaySizeControl
            label="حجم أدوات التحديد"
            value={readerDisplayQuery.data?.toolbarSize ?? DISPLAY_DEFAULT_TOOLBAR_SIZE}
            minimum={32}
            maximum={56}
            colors={colors}
            disabled={saving}
            onChange={(value) => void savePreference('reader.toolbarSize', String(value))}
          />
          <DisplaySizeControl
            label="حجم خط المصحف"
            value={Math.round((readerDisplayQuery.data?.pageScale ?? 1) * 100)}
            minimum={80}
            maximum={150}
            step={10}
            colors={colors}
            disabled={saving}
            onChange={(value) => void savePreference('reader.pageScale', String(value / 100))}
          />
          <DisplaySizeControl
            label="حجم أرقام الآيات وعلامات الأرباع"
            value={Math.round((readerDisplayQuery.data?.markerScale ?? DISPLAY_DEFAULT_MARKER_SCALE) * 100)}
            minimum={80}
            maximum={180}
            step={10}
            colors={colors}
            disabled={saving}
            onChange={(value) => void savePreference('reader.markerScale', String(value / 100))}
          />
          <Text style={[styles.body, { color: colors.text }]}>شكل الأدوات</Text>
          <View style={styles.optionRow}>
            {READER_TOOLBAR_SHAPE_OPTIONS.map((option) => {
              const selected = (readerDisplayQuery.data?.toolbarShape ?? DEFAULT_READER_TOOLBAR_SHAPE) === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={saving}
                  onPress={() => void savePreference('reader.toolbarShape', option.value)}
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
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => void resetDisplayPreferences()}
            style={[styles.wideButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="refresh-outline" size={18} color={colors.text} />
            <Text style={[styles.primaryButtonText, { color: colors.text }]}>الوضع الافتراضي</Text>
          </Pressable>
        </View>

        <OfflineMushafCard />

        <WordAudioCard />

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
          {recitationBytes > 0 && (
            <>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                {`المحمّل للقارئ الحالي: ${formatMegabytes(recitationBytes)} ميجابايت.`}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={removeRecitations}
                style={[styles.wideButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="trash-outline" size={18} color={colors.text} />
                <Text style={[styles.primaryButtonText, { color: colors.text }]}>حذف التلاوات المحمّلة</Text>
              </Pressable>
            </>
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
                        name={ArabicReciterNames[Math.abs(reciter.id)] ?? reciter.name}
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

        <BackupCard />

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
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          زخرفة رأس السورة مأخوذة من مصحف المدينة النبوية (الطبعة العادية) الصادر عن مجمع الملك فهد
          لطباعة المصحف الشريف، ومرسومة بالمتجهات عبر مشروع quran-ws/quran-assets. أسماء السور بالخط المصحفي من مكتبة QUL (ترخيص CC BY 4.0)، وسورة الفاتحة من عمل RNRCTG على ويكيميديا كومنز (ترخيص CC BY-SA 4.0).
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          معاني الكلمات القرآنية من مركز تفسير للدراسات القرآنية (Tafsir Center for Quranic Studies, https://tafsir.net)، بترخيص CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). جرى اختيار المعنى الخاص بكل كلمة وضبط ترتيبها مع نص المصحف في التطبيق دون تغيير في نص المعنى سوى حذف علامات التنسيق غير المرئية.
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          ملفات تلاوة ياسر الدوسري وإبراهيم الدوسري وبندر بليلة وإسلام صبحي وماهر المعيقلي، وتوقيتات الآيات المستخدمة لتتبع الآية أثناء التلاوة، من موقع mp3quran.net.
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          صور القرّاء من ويكيميديا كومنز بعد قصّها مربعة: أحمد العجمي (أحمد زين، CC BY-SA 3.0)، سعد الغامدي (هيثم الدخين، CC BY-SA 4.0)، صلاح البدير (Salah Al Budair، CC BY-SA 4.0)، أحمد نعينع (NeinaaQari، CC BY-SA 4.0)، عبدالمحسن القاسم (شيخ شريف، CC BY 4.0).
        </Text>
      </ScrollView>

      <SurahDownloadPicker
        visible={recitationPickerOpen}
        colors={colors}
        surahs={directoryQuery.data?.surahs}
        loading={directoryQuery.isPending}
        failed={Boolean(directoryQuery.error)}
        onRetry={() => void directoryQuery.refetch()}
        onDownloadRecitation={(surahNumbers) => downloadRecitations(surahNumbers)}
        onCancelRecitation={() => {
          recitationCancelRef.current = true;
        }}
        recitationDownloading={recitationDownloading}
        recitationStatuses={recitationStatuses}
        recitationProgress={recitationProgress}
        surahStates={surahStates}
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
  { value: 'missing', label: 'غير المحمّلة' },
  { value: 'saved', label: 'المحمّلة' },
];

const FAILED_COLOR = '#C0392B';

type SurahRowStatus = {
  label: string;
  progress: number | null;
  icon: 'checkmark-circle' | 'cloud-download-outline' | 'alert-circle' | 'time-outline' | 'sync-outline';
  done: boolean;
  failed: boolean;
};

/** One line of text, an icon and an optional bar for a surah row. */
function describeSurahStatus(
  state: SurahDownloadState | undefined,
  downloading: boolean,
  stored: boolean,
): SurahRowStatus {
  if (state) {
    const finished = state.done + state.failed >= state.total && state.total > 0;
    if (state.failed > 0 && (finished || !downloading)) {
      return { label: `فشل التحميل (${toArabicNumbers(state.failed)} مقطع). أعد المحاولة`, progress: null, icon: 'alert-circle', done: false, failed: true };
    }
    if (state.total > 0 && state.done >= state.total) {
      return { label: 'تم التحميل', progress: null, icon: 'checkmark-circle', done: true, failed: false };
    }
    if (downloading && state.done > 0) {
      const ratio = state.done / state.total;
      return { label: `جارٍ التحميل ${toArabicNumbers(Math.round(ratio * 100))}٪`, progress: ratio, icon: 'sync-outline', done: false, failed: false };
    }
    if (downloading) {
      return { label: 'في الانتظار', progress: null, icon: 'time-outline', done: false, failed: false };
    }
  }
  return stored
    ? { label: 'التلاوة محمّلة', progress: null, icon: 'checkmark-circle', done: true, failed: false }
    : { label: 'التلاوة غير محمّلة', progress: null, icon: 'cloud-download-outline', done: false, failed: false };
}

function SurahDownloadPicker({
  visible,
  colors,
  surahs,
  loading,
  failed,
  onRetry,
  onDownloadRecitation,
  onCancelRecitation,
  recitationDownloading,
  recitationStatuses,
  recitationProgress,
  surahStates,
  onOpen,
  onClose,
}: {
  visible: boolean;
  colors: ReturnType<typeof useTheme>;
  surahs: QuranSurahSummary[] | undefined;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  onDownloadRecitation: (surahNumbers: number[]) => Promise<void>;
  onCancelRecitation: () => void;
  recitationDownloading: boolean;
  recitationStatuses: Record<number, boolean>;
  recitationProgress: RecitationDownloadProgress | null;
  surahStates: Record<number, SurahDownloadState>;
  onOpen?: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SurahFilter>('all');
  const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => {
    if (visible) {
      onOpen?.();
    }
  }, [onOpen, visible]);

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
      const downloaded = recitationStatuses[surah.surahNumber] === true;
      if (filter === 'missing' && downloaded) {
        return false;
      }
      if (filter === 'saved' && !downloaded) {
        return false;
      }
      return (
        normalizedQuery.length === 0 ||
        normalizeSurahSearch(surah.nameArabic).includes(normalizedQuery) ||
        String(surah.surahNumber).includes(normalizedQuery)
      );
    });
  }, [filter, normalizedQuery, recitationStatuses, surahs]);

  const summary = useMemo(() => {
    const entries = Object.entries(surahStates);
    if (entries.length === 0) {
      return null;
    }
    const failedNumbers = entries
      .filter(([, state]) => state.failed > 0)
      .map(([key]) => Number(key));
    return {
      failed: failedNumbers.length,
      failedNumbers,
      succeeded: entries.length - failedNumbers.length,
    };
  }, [surahStates]);

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
              {!recitationDownloading && summary && (
                <View style={[styles.pickerSummary, { backgroundColor: colors.background, borderColor: summary.failed > 0 ? FAILED_COLOR : colors.primary }]}>
                  <Ionicons
                    name={summary.failed > 0 ? 'alert-circle' : 'checkmark-circle'}
                    size={20}
                    color={summary.failed > 0 ? FAILED_COLOR : colors.primary}
                  />
                  <Text style={[styles.pickerSummaryText, { color: colors.text }]}>
                    {summary.failed > 0
                      ? `تم تحميل ${toArabicNumbers(summary.succeeded)} وفشل ${toArabicNumbers(summary.failed)}. اضغط إعادة المحاولة لاستكمال الباقي.`
                      : `تم تحميل ${toArabicNumbers(summary.succeeded)} سورة بنجاح.`}
                  </Text>
                </View>
              )}
              {recitationProgress && (
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
                  const recitationDownloaded = recitationStatuses[item.surahNumber] === true;
                  const checked = selected.includes(item.surahNumber);
                  const rowStatus = describeSurahStatus(
                    surahStates[item.surahNumber],
                    recitationDownloading,
                    recitationDownloaded,
                  );
                  return (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked, disabled: recitationDownloading }}
                      accessibilityLabel={item.nameArabic}
                      disabled={recitationDownloading}
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
                        <Text style={[styles.pickerMeta, { color: rowStatus.failed ? FAILED_COLOR : colors.textSecondary }]}>
                          {rowStatus.label}
                        </Text>
                        {rowStatus.progress !== null && (
                          <DownloadProgressBar progress={rowStatus.progress} colors={colors} />
                        )}
                      </View>
                      <Ionicons
                        name={rowStatus.icon}
                        size={20}
                        color={rowStatus.failed ? FAILED_COLOR : rowStatus.done ? colors.primary : colors.textSecondary}
                      />
                    </Pressable>
                  );
                }}
              />

              <View style={styles.pickerFooter}>
                <Pressable
                  accessibilityRole="button"
                  disabled={recitationDownloading || (selected.length === 0 && !(summary && summary.failed > 0))}
                  onPress={() => {
                    const targets =
                      selected.length > 0 ? selected : summary?.failedNumbers ?? [];
                    void onDownloadRecitation(targets).then(() => {
                      setSelected([]);
                    });
                  }}
                  style={[styles.primaryButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Ionicons name="musical-notes-outline" size={18} color={colors.background} />
                  <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                    {recitationDownloading
                      ? 'جارٍ تحميل التلاوة…'
                      : selected.length === 0 && summary && summary.failed > 0
                        ? 'إعادة المحاولة للسور الفاشلة'
                        : 'تحميل التلاوة'}
                  </Text>
                </Pressable>
                {recitationDownloading && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={onCancelRecitation}
                    style={[styles.primaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="close-circle-outline" size={18} color={colors.text} />
                    <Text style={[styles.primaryButtonText, { color: colors.text }]}>إيقاف</Text>
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
 * The bar tracks the recitation download. Its width is animated from the
 * measured track instead of a percentage string so the growth stays smooth
 * while the download reports a new track every few hundred milliseconds.
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
  if (value !== 'system' && value !== 'light' && value !== 'dark' && value !== 'night') {
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
  pickerSummary: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pickerSummaryText: {
    flex: 1,
    fontSize: 13,
    textAlign: 'right',
  },
  pickerFooter: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
});
