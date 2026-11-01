import { Link, useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Colors, Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Highlight } from '@/features/annotations/types';
import {
  ContentUnavailableError,
  quranContentProvider,
} from '@/features/quran/services/content-provider';
import type { QuranSurahDirectory } from '@/features/quran/types';
import {
  MushafPageViewer,
  type PageTurnDirection,
  type SelectionAnchor,
} from '@/features/reader/components/MushafPageViewer';
import { SelectionSheet } from '@/features/reader/components/SelectionSheet';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';
import { useReaderPreferencesStore } from '@/features/reader/state/reader-preferences-store';
import {
  useReaderSelectionStore,
  type ReaderSelection,
} from '@/features/reader/state/selection-store';
import { useTheme } from '@/hooks/use-theme';

type NavigationMode = 'page' | 'surah' | 'juz';

export default function ReaderScreen() {
  const params = useLocalSearchParams<{
    surahNumber?: string | string[];
    pageNumber?: string | string[];
  }>();
  const rawSurahNumber = firstParam(params.surahNumber);
  const rawPageNumber = firstParam(params.pageNumber);
  const requestedSurah = Number(rawSurahNumber ?? '1');
  const colors = useTheme();
  const database = useSQLiteContext();
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const reciterId = useReaderPreferencesStore((state) => state.reciterId);
  const selection = useReaderSelectionStore((state) => state.selection);
  const selectWord = useReaderSelectionStore((state) => state.selectWord);
  const selectAyah = useReaderSelectionStore((state) => state.selectAyah);
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  const [pageTransitionDirection, setPageTransitionDirection] =
    useState<PageTurnDirection | null>(null);
  const [selectionAnchor, setSelectionAnchor] = useState<SelectionAnchor | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightRevision, setHighlightRevision] = useState(0);
  const [displayOverrides, setDisplayOverrides] = useState<{
    showTajweed: boolean;
    fontSize: number;
  } | null>(null);
  const [displaySaveError, setDisplaySaveError] = useState<string | null>(null);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('page');
  const [navigationValue, setNavigationValue] = useState('');
  const [navigationBusy, setNavigationBusy] = useState(false);
  const audioRequest = useRef(0);
  const lastPageTurn = useRef(0);

  const startLocationQuery = useQuery({
    queryKey: ['quran', 'reader-start', rawSurahNumber ?? '1', rawPageNumber ?? ''],
    queryFn: async () => {
      if (rawPageNumber !== undefined) {
        const requestedPage = parseArabicNumber(rawPageNumber);
        if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 604) {
          throw new ContentUnavailableError('invalid-data', 'Invalid Mushaf page route parameter.');
        }
        return requestedPage;
      }
      if (!Number.isInteger(requestedSurah) || requestedSurah < 1 || requestedSurah > 114) {
        throw new ContentUnavailableError('invalid-data', 'Invalid surah route parameter.');
      }
      if (requestedSurah !== 1) {
        return quranContentProvider.getPageNumberForSurah(requestedSurah);
      }

      const saved = await database.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = 'reader.lastPage'",
      );
      if (!saved) {
        return 1;
      }
      const savedPage = Number(saved.value);
      if (!Number.isInteger(savedPage) || savedPage < 1 || savedPage > 604) {
        throw new Error('موضع القراءة المحفوظ غير صالح.');
      }
      return savedPage;
    },
    staleTime: Infinity,
  });

  const activePageNumber = pageNumber ?? startLocationQuery.data ?? null;

  const displayPreferencesQuery = useQuery({
    queryKey: ['reader', 'display-preferences'],
    queryFn: async () => {
      const rows = await database.getAllAsync<{ key: string; value: string }>(
        `SELECT key, value FROM app_settings
         WHERE key IN ('reader.showTajweed', 'reader.fontSize')`,
      );
      const preferences = new Map(rows.map((row) => [row.key, row.value]));
      const savedTajweed = preferences.get('reader.showTajweed');
      const savedFontSize = preferences.get('reader.fontSize');
      if (savedTajweed !== undefined && savedTajweed !== 'true' && savedTajweed !== 'false') {
        throw new Error('إعداد ألوان التجويد المحفوظ غير صالح.');
      }
      const parsedFontSize = savedFontSize === undefined ? 29 : Number(savedFontSize);
      if (!Number.isInteger(parsedFontSize) || parsedFontSize < 21 || parsedFontSize > 37) {
        throw new Error('حجم الخط المحفوظ غير صالح.');
      }
      return {
        showTajweed: savedTajweed === undefined ? true : savedTajweed === 'true',
        fontSize: parsedFontSize,
      };
    },
    staleTime: Infinity,
  });

  const showTajweed =
    displayOverrides?.showTajweed ?? displayPreferencesQuery.data?.showTajweed ?? true;
  const fontSize = displayOverrides?.fontSize ?? displayPreferencesQuery.data?.fontSize ?? 29;
  const displayPreferencesError =
    displaySaveError ??
    (displayPreferencesQuery.error instanceof Error
      ? `تعذر تحميل إعدادات القراءة: ${displayPreferencesQuery.error.message}`
      : displayPreferencesQuery.error
        ? 'تعذر تحميل إعدادات القراءة المحفوظة.'
        : null);

  useEffect(() => {
    if (!displayPreferencesQuery.data) {
      return;
    }
    let active = true;
    Promise.all([
      saveSetting(database, 'reader.showTajweed', String(showTajweed)),
      saveSetting(database, 'reader.fontSize', String(fontSize)),
    ]).then(() => {
      if (active) {
        setDisplaySaveError(null);
      }
    }).catch((error: unknown) => {
      if (active) {
        setDisplaySaveError(
          error instanceof Error ? `تعذر حفظ إعداد القراءة: ${error.message}` : 'تعذر حفظ إعداد القراءة.',
        );
      }
    });
    return () => {
      active = false;
    };
  }, [database, displayPreferencesQuery.data, fontSize, showTajweed]);

  const pageQuery = useQuery({
    queryKey: ['quran', 'mushaf-page', 19, activePageNumber],
    enabled: activePageNumber !== null,
    staleTime: 24 * 60 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    queryFn: () => {
      if (activePageNumber === null) {
        throw new Error('لم يُحدد رقم صفحة المصحف.');
      }
      return new MushafPageCache(database).getPage(activePageNumber);
    },
  });

  const directoryQuery = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranContentProvider.getSurahDirectory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const page = pageQuery.data?.page;

  useEffect(() => {
    if (!page || page.pageNumber !== activePageNumber) {
      return;
    }
    saveSetting(database, 'reader.lastPage', String(page.pageNumber)).catch((error: unknown) => {
      setNavigationError(
        error instanceof Error ? `تعذر حفظ موضع القراءة: ${error.message}` : 'تعذر حفظ موضع القراءة.',
      );
    });
  }, [activePageNumber, database, page]);

  useEffect(() => {
    if (!page || page.pageNumber !== activePageNumber || !pageTransitionDirection) {
      return;
    }
    const timer = setTimeout(() => setPageTransitionDirection(null), 260);
    return () => clearTimeout(timer);
  }, [activePageNumber, page, pageTransitionDirection]);

  useEffect(() => {
    if (!page) {
      return;
    }
    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    Promise.all(
      page.ayahs.map((ayah) =>
        repository.listHighlightsForAyah(ayah.surahNumber, ayah.ayahNumber),
      ),
    )
      .then((items) => {
        if (active) {
          setHighlights(items.flat());
          setHighlightError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setHighlightError(
            error instanceof Error
              ? `تعذر تحميل التمييزات المحفوظة: ${error.message}`
              : 'تعذر تحميل التمييزات المحفوظة من الجهاز.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [database, highlightRevision, page]);

  useEffect(() => {
    let active = true;
    setAudioModeAsync({ playsInSilentMode: true }).catch((error: unknown) => {
      if (active) {
        setAudioError(
          error instanceof Error ? `تعذر تهيئة الصوت: ${error.message}` : 'تعذر تهيئة الصوت.',
        );
      }
    });
    return () => {
      active = false;
      audioRequest.current += 1;
      player.pause();
    };
  }, [player]);

  const onWordPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
    position: number,
    anchor: SelectionAnchor,
  ) => {
    const ayah = page?.ayahs.find(
      (item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
    );
    const word = ayah?.words.find((item) => item.position === position);
    if (!ayah || !word) {
      setInteractionError('تعذر مطابقة الكلمة مع بيانات صفحة المصحف.');
      return;
    }
    audioRequest.current += 1;
    player.pause();
    setInteractionError(null);
    setSelectionAnchor(anchor);
    selectWord(surahNumber, ayah, word, 'compact');
  }, [page, player, selectWord]);

  const onAyahPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
    anchor: SelectionAnchor,
  ) => {
    const ayah = page?.ayahs.find(
      (item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
    );
    if (!ayah) {
      setInteractionError('تعذر مطابقة الآية مع بيانات صفحة المصحف.');
      return;
    }
    audioRequest.current += 1;
    player.pause();
    setInteractionError(null);
    setSelectionAnchor(anchor);
    selectAyah(surahNumber, ayah, 'compact');
  }, [page, player, selectAyah]);

  const playSelection = useCallback(async (currentSelection: ReaderSelection) => {
    const requestId = ++audioRequest.current;
    setAudioError(null);
    const audioUrl =
      currentSelection.type === 'word'
        ? currentSelection.word.audioUrl
          ? quranContentProvider.getWordAudioUrl(currentSelection.word.audioUrl)
          : null
        : await quranContentProvider.getAyahAudioUrl(
            reciterId,
            currentSelection.surahNumber,
            currentSelection.ayah.ayahNumber,
          );
    if (requestId !== audioRequest.current) {
      return;
    }
    if (!audioUrl) {
      throw new Error('لا يتوفر تسجيل صوتي لهذه الكلمة من المصدر.');
    }
    player.replace(audioUrl);
    player.play();
  }, [player, reciterId]);

  const stopAudio = useCallback(() => {
    audioRequest.current += 1;
    player.pause();
  }, [player]);

  const navigateToPage = useCallback((
    destination: number,
    direction?: PageTurnDirection,
  ) => {
    audioRequest.current += 1;
    player.pause();
    useReaderSelectionStore.getState().clearSelection();
    setSelectionAnchor(null);
    setPageTransitionDirection(
      direction ?? (destination >= (page?.pageNumber ?? destination) ? 'next' : 'previous'),
    );
    setPageNumber(destination);
  }, [page?.pageNumber, player]);

  const handlePageTurn = useCallback((direction: PageTurnDirection) => {
    if (
      !page ||
      page.pageNumber !== activePageNumber ||
      selection ||
      navigationOpen
    ) {
      return;
    }
    const now = Date.now();
    if (now - lastPageTurn.current < 300) {
      return;
    }
    lastPageTurn.current = now;
    const destination = page.pageNumber + (direction === 'next' ? 1 : -1);
    if (destination < 1 || destination > 604) {
      return;
    }
    navigateToPage(destination, direction);
  }, [activePageNumber, navigateToPage, navigationOpen, page, selection]);

  const selectedElementId = selection
    ? selection.type === 'word'
      ? `word-${selection.surahNumber}-${selection.ayah.ayahNumber}-${selection.word.position}`
      : `ayah-${selection.surahNumber}-${selection.ayah.ayahNumber}`
    : null;

  const currentSurahName =
    page?.surahs.find((surah) => surah.surahNumber === selection?.surahNumber)?.nameArabic ??
    page?.surahs[0]?.nameArabic ??
    'المصحف';

  const navigateTo = useCallback(async (mode: NavigationMode, rawValue: string) => {
    const value = parseArabicNumber(rawValue);
    setNavigationError(null);
    setNavigationBusy(true);
    try {
      if (!Number.isInteger(value)) {
        throw new RangeError('أدخل رقمًا صحيحًا للانتقال.');
      }
      let destination: number;
      if (mode === 'page') {
        if (value < 1 || value > 604) {
          throw new RangeError('رقم الصفحة يجب أن يكون بين ١ و٦٠٤.');
        }
        destination = value;
      } else if (mode === 'surah') {
        if (value < 1 || value > 114) {
          throw new RangeError('رقم السورة يجب أن يكون بين ١ و١١٤.');
        }
        destination = await quranContentProvider.getPageNumberForSurah(value);
      } else {
        if (value < 1 || value > 30) {
          throw new RangeError('رقم الجزء يجب أن يكون بين ١ و٣٠.');
        }
        destination = await quranContentProvider.getPageNumberForJuz(value);
      }
      navigateToPage(destination);
      setNavigationOpen(false);
      setNavigationValue('');
    } catch (error) {
      setNavigationError(
        error instanceof Error ? error.message : 'تعذر الانتقال إلى الموضع المطلوب.',
      );
    } finally {
      setNavigationBusy(false);
    }
  }, [navigateToPage]);

  const initialError = startLocationQuery.error;
  const pageError = pageQuery.error;
  const pageLoading = startLocationQuery.isPending || activePageNumber === null || pageQuery.isPending;
  const noInitialPage = initialError || pageError;
  const directory = directoryQuery.data;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Link href="/" replace asChild>
          <Pressable
            accessibilityRole="button"
            style={StyleSheet.flatten([
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ])}>
            <Text style={[styles.backGlyph, { color: colors.primary }]}>→</Text>
          </Pressable>
        </Link>
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {page?.surahs[0]?.nameArabic ?? 'المصحف'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="التنقل بين الصفحات والسور والأجزاء"
            onPress={() => setNavigationOpen(true)}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {page
                ? `الجزء ${toArabicNumbers(page.juzNumber)} · الصفحة ${toArabicNumbers(page.pageNumber)}`
                : 'مصحف المدينة · رواية حفص'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.readerTools}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showTajweed ? 'إخفاء ألوان التجويد' : 'إظهار ألوان التجويد'}
            accessibilityState={{ selected: showTajweed }}
            onPress={() => setDisplayOverrides((current) => ({
              showTajweed: !(current?.showTajweed ?? displayPreferencesQuery.data?.showTajweed ?? true),
              fontSize: current?.fontSize ?? displayPreferencesQuery.data?.fontSize ?? 29,
            }))}
            style={[
              styles.toolButton,
              {
                backgroundColor: showTajweed ? colors.backgroundSelected : colors.surface,
                borderColor: showTajweed ? colors.primary : colors.border,
              },
            ]}>
            <Text style={[styles.tajweedToolText, { color: colors.primary }]}>تج</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تكبير الخط"
            disabled={fontSize >= 37}
            onPress={() => setDisplayOverrides((current) => ({
              showTajweed: current?.showTajweed ?? displayPreferencesQuery.data?.showTajweed ?? true,
              fontSize: Math.min(37, (current?.fontSize ?? displayPreferencesQuery.data?.fontSize ?? 29) + 2),
            }))}
            style={[styles.fontButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fontButtonText, { color: colors.text }]}>A+</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تصغير الخط"
            disabled={fontSize <= 21}
            onPress={() => setDisplayOverrides((current) => ({
              showTajweed: current?.showTajweed ?? displayPreferencesQuery.data?.showTajweed ?? true,
              fontSize: Math.max(21, (current?.fontSize ?? displayPreferencesQuery.data?.fontSize ?? 29) - 2),
            }))}
            style={[styles.fontButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fontButtonText, { color: colors.text }]}>A−</Text>
          </Pressable>
        </View>
      </View>

      {pageLoading && !noInitialPage ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            جارٍ تجهيز صفحة المصحف…
          </Text>
        </View>
      ) : noInitialPage ? (
        <View style={[styles.unavailable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>تعذر فتح صفحة المصحف</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {formatContentError(initialError ?? pageError)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (initialError) {
                void startLocationQuery.refetch();
              } else {
                void pageQuery.refetch();
              }
            }}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryText, { color: colors.background }]}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : page && pageQuery.data ? (
        <>
          <MushafPageViewer
            page={page}
            fontBase64={pageQuery.data.fontBase64}
            basmalaFontBase64={pageQuery.data.basmalaFontBase64}
            fontSize={fontSize}
            showTajweed={showTajweed}
            isDark={colors.background === Colors.dark.background}
            highlights={highlights}
            selectedElementId={selectedElementId}
            transitionDirection={pageTransitionDirection}
            onWordPress={onWordPress}
            onAyahPress={onAyahPress}
            onPageTurn={handlePageTurn}
            onInteractionError={setInteractionError}
          />
          {playerStatus.playing && (
            <View style={[styles.playingBar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.playingLabel, { color: colors.background }]}>التلاوة تعمل الآن</Text>
              <Pressable accessibilityRole="button" onPress={stopAudio}>
                <Text style={[styles.stopLabel, { color: colors.background }]}>إيقاف</Text>
              </Pressable>
            </View>
          )}
        </>
      ) : null}

      {displayPreferencesError && (
        <Text accessibilityRole="alert" style={styles.error}>{displayPreferencesError}</Text>
      )}
      {highlightError && <Text accessibilityRole="alert" style={styles.error}>{highlightError}</Text>}
      {audioError && <Text accessibilityRole="alert" style={styles.error}>{audioError}</Text>}
      {interactionError && <Text accessibilityRole="alert" style={styles.error}>{interactionError}</Text>}
      {navigationError && !navigationOpen && (
        <Text accessibilityRole="alert" style={styles.error}>{navigationError}</Text>
      )}

      <SelectionSheet
        surahName={currentSurahName}
        anchor={selectionAnchor}
        onHighlightsChanged={() => setHighlightRevision((revision) => revision + 1)}
        onPlayAudio={playSelection}
        onStopAudio={stopAudio}
        isAudioPlaying={playerStatus.playing}
      />

      <NavigationDialog
        visible={navigationOpen}
        mode={navigationMode}
        value={navigationValue}
        busy={navigationBusy}
        error={navigationError}
        directory={directory}
        colors={colors}
        onModeChange={(mode) => {
          setNavigationMode(mode);
          setNavigationValue('');
          setNavigationError(null);
        }}
        onValueChange={setNavigationValue}
        onClose={() => {
          setNavigationOpen(false);
          setNavigationError(null);
        }}
        onSubmit={() => void navigateTo(navigationMode, navigationValue)}
        onChoose={(mode, value) => void navigateTo(mode, String(value))}
        onDirectoryRetry={() => void directoryQuery.refetch()}
      />
    </SafeAreaView>
  );
}

function NavigationDialog({
  visible,
  mode,
  value,
  busy,
  error,
  directory,
  colors,
  onModeChange,
  onValueChange,
  onClose,
  onSubmit,
  onChoose,
  onDirectoryRetry,
}: {
  visible: boolean;
  mode: NavigationMode;
  value: string;
  busy: boolean;
  error: string | null;
  directory: QuranSurahDirectory | undefined;
  colors: ReturnType<typeof useTheme>;
  onModeChange: (mode: NavigationMode) => void;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onChoose: (mode: NavigationMode, value: number) => void;
  onDirectoryRetry: () => void;
}) {
  const modes: { key: NavigationMode; label: string }[] = [
    { key: 'page', label: 'صفحة' },
    { key: 'surah', label: 'سورة' },
    { key: 'juz', label: 'جزء' },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.navigationOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق التنقل"
          style={styles.navigationBackdrop}
          onPress={onClose}
        />
        <View style={[styles.navigationDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.navigationHeader}>
            <Text style={[styles.navigationTitle, { color: colors.text }]}>انتقال إلى</Text>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text style={[styles.closeLabel, { color: colors.primary }]}>إغلاق</Text>
            </Pressable>
          </View>
          <View style={styles.navigationModes}>
            {modes.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === option.key }}
                onPress={() => onModeChange(option.key)}
                style={[
                  styles.navigationMode,
                  {
                    backgroundColor: mode === option.key ? colors.backgroundSelected : colors.background,
                    borderColor: mode === option.key ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.navigationModeLabel, { color: mode === option.key ? colors.primary : colors.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {mode === 'page' ? (
            <View style={styles.pageInputRow}>
              <TextInput
                accessibilityLabel="رقم الصفحة من ١ إلى ٦٠٤"
                keyboardType="number-pad"
                value={value}
                onChangeText={onValueChange}
                placeholder="رقم الصفحة (١–٦٠٤)"
                placeholderTextColor={colors.textSecondary}
                style={[styles.pageInput, { color: colors.text, borderColor: colors.border }]}
              />
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={onSubmit}
                style={[styles.goButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.goButtonText, { color: colors.background }]}>
                  {busy ? '…' : 'اذهب'}
                </Text>
              </Pressable>
            </View>
          ) : mode === 'juz' ? (
            <ScrollView contentContainerStyle={styles.destinationGrid}>
              {Array.from({ length: 30 }, (_, index) => index + 1).map((juz) => (
                <Pressable
                  key={juz}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => onChoose('juz', juz)}
                  style={[styles.destinationItem, { backgroundColor: colors.backgroundSelected }]}>
                  <Text style={[styles.destinationLabel, { color: colors.text }]}>الجزء {toArabicNumbers(juz)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : directory ? (
            <ScrollView contentContainerStyle={styles.surahList}>
              {directory.surahs.map((surah) => (
                <Pressable
                  key={surah.surahNumber}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => onChoose('surah', surah.surahNumber)}
                  style={[styles.surahItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.surahNumber, { color: colors.textSecondary }]}>
                    {toArabicNumbers(surah.surahNumber)}
                  </Text>
                  <Text style={[styles.surahName, { color: colors.text }]}>{surah.nameArabic}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Pressable accessibilityRole="button" onPress={onDirectoryRetry}>
              <Text style={[styles.directoryMessage, { color: colors.primary }]}>
                تعذر تحميل السور. اضغط لإعادة المحاولة.
              </Text>
            </Pressable>
          )}
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </View>
      </View>
    </Modal>
  );
}

async function saveSetting(
  database: ReturnType<typeof useSQLiteContext>,
  key: string,
  value: string,
): Promise<void> {
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    value,
    new Date().toISOString(),
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseArabicNumber(value: string): number {
  const normalized = value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  return Number(normalized.trim());
}

function formatContentError(error: unknown): string {
  if (error instanceof ContentUnavailableError) {
    if (error.reason === 'invalid-data') {
      return 'تعذر التحقق من بيانات الصفحة القادمة من المصدر.';
    }
    if (error.reason === 'network') {
      return 'تعذر الاتصال بـ Quran.com. تحقق من الإنترنت وحاول مجددًا.';
    }
    return 'خدمة Quran.com غير متاحة مؤقتًا. حاول مرة أخرى لاحقًا.';
  }
  return error instanceof Error ? error.message : 'تعذر فتح صفحة المصحف.';
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 68,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 13,
  },
  backGlyph: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'right',
  },
  readerTools: {
    flexDirection: 'row',
    gap: 5,
  },
  toolButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 11,
  },
  tajweedToolText: {
    fontSize: 13,
    fontWeight: '800',
  },
  fontButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 11,
  },
  fontButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  message: {
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'center',
  },
  unavailable: {
    margin: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: 20,
    gap: Spacing.three,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  retryButton: {
    padding: Spacing.three,
    borderRadius: 13,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  playingBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  playingLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  stopLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  error: {
    color: '#B42318',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    textAlign: 'right',
  },
  navigationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  navigationBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  navigationDialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '82%',
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  navigationHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  navigationModes: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
  navigationMode: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
  },
  navigationModeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  pageInputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pageInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    textAlign: 'right',
  },
  goButton: {
    minWidth: 68,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  goButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  destinationGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  destinationItem: {
    width: '31%',
    paddingVertical: Spacing.two,
    borderRadius: 10,
    alignItems: 'center',
  },
  destinationLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  surahList: {
    paddingBottom: Spacing.three,
  },
  surahItem: {
    minHeight: 42,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  surahNumber: {
    width: 28,
    fontSize: 13,
    textAlign: 'center',
  },
  surahName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  directoryMessage: {
    paddingVertical: Spacing.three,
    fontSize: 14,
    textAlign: 'center',
  },
});
