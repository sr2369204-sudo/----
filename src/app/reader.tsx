import { Link, useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
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
import type { PageTurnDirection } from '@/features/reader/components/MushafPageViewer';
import { SwipePageViewer } from '@/features/reader/components/SwipePageViewer';
import { SelectionSheet } from '@/features/reader/components/SelectionSheet';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';
import {
  DEFAULT_RECITER_ID,
  useReaderPreferencesStore,
} from '@/features/reader/state/reader-preferences-store';
import {
  useReaderSelectionStore,
  type ReaderSelection,
} from '@/features/reader/state/selection-store';
import { useTheme } from '@/hooks/use-theme';

type NavigationMode = 'page' | 'surah' | 'juz';
const PAGE_QUERY_RETRY_COUNT = 2;

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
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightRevision, setHighlightRevision] = useState(0);
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
  const [navVisible, setNavVisible] = useState(false);
  const [navAnimation] = useState(() => new Animated.Value(0));

  const toggleNavbar = useCallback(() => {
    setNavVisible((prev) => {
      const next = !prev;
      Animated.timing(navAnimation, {
        toValue: next ? 1 : 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
      return next;
    });
  }, [navAnimation]);

  const hideNavbar = useCallback(() => {
    setNavVisible(false);
    Animated.timing(navAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [navAnimation]);

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
      const parsedFontSize = savedFontSize === undefined ? 36 : Number(savedFontSize);
      if (!Number.isInteger(parsedFontSize) || parsedFontSize < 20 || parsedFontSize > 60) {
        throw new Error('حجم الخط المحفوظ غير صالح.');
      }
      return {
        showTajweed: savedTajweed === undefined ? true : savedTajweed === 'true',
        fontSize: parsedFontSize,
      };
    },
    staleTime: Infinity,
  });

  const showTajweed = displayPreferencesQuery.data?.showTajweed ?? true;
  const fontSize = displayPreferencesQuery.data?.fontSize ?? 36;
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
    retry: retryPageQuery,
    retryDelay: pageQueryRetryDelay,
    queryFn: () => {
      if (activePageNumber === null) {
        throw new Error('لم يُحدد رقم صفحة المصحف.');
      }
      return new MushafPageCache(database).getPage(activePageNumber);
    },
  });

  const prevPageNumber = activePageNumber && activePageNumber > 1 ? activePageNumber - 1 : null;
  const prevPageQuery = useQuery({
    queryKey: ['quran', 'mushaf-page', 19, prevPageNumber],
    enabled: prevPageNumber !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: retryPageQuery,
    retryDelay: pageQueryRetryDelay,
    queryFn: () => new MushafPageCache(database).getPage(prevPageNumber!),
  });

  const nextPageNumber = activePageNumber && activePageNumber < 604 ? activePageNumber + 1 : null;
  const nextPageQuery = useQuery({
    queryKey: ['quran', 'mushaf-page', 19, nextPageNumber],
    enabled: nextPageNumber !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: retryPageQuery,
    retryDelay: pageQueryRetryDelay,
    queryFn: () => new MushafPageCache(database).getPage(nextPageNumber!),
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
    wordId: string,
  ) => {
    const ayah = page?.ayahs.find(
      (item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
    );
    const word = ayah?.words.find((item) => item.id === wordId);
    if (!ayah || !word) {
      setInteractionError('تعذر مطابقة الكلمة مع بيانات صفحة المصحف.');
      return;
    }
    audioRequest.current += 1;
    player.pause();
    setInteractionError(null);
    selectWord(surahNumber, ayah, word, 'compact');
  }, [page, player, selectWord]);

  const onAyahPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
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
    selectAyah(surahNumber, ayah, 'compact');
  }, [page, player, selectAyah]);

  const playSelection = useCallback(async (currentSelection: ReaderSelection) => {
    const requestId = ++audioRequest.current;
    setAudioError(null);
    let audioUrl: string | null;
    if (currentSelection.type === 'word') {
      audioUrl = currentSelection.word.audioUrl
        ? quranContentProvider.getWordAudioUrl(currentSelection.word.audioUrl)
        : null;
    } else {
      try {
        audioUrl = await quranContentProvider.getAyahAudioUrl(
          reciterId,
          currentSelection.surahNumber,
          currentSelection.ayah.ayahNumber,
        );
      } catch (error) {
        if (
          !(error instanceof ContentUnavailableError) ||
          error.reason !== 'server' ||
          error.message !== 'Quran.com API returned HTTP 404.'
        ) {
          throw error;
        }

        const reciters = await quranContentProvider.getReciters();
        if (reciters.some((reciter) => reciter.id === reciterId)) {
          throw error;
        }
        const fallbackReciter =
          reciters.find((reciter) => reciter.id === DEFAULT_RECITER_ID) ?? reciters[0];
        if (!fallbackReciter) {
          throw error;
        }
        if (requestId !== audioRequest.current) {
          return;
        }
        await saveSetting(database, 'reciterId', String(fallbackReciter.id));
        const preferences = useReaderPreferencesStore.getState();
        preferences.setPreferences(preferences.themePreference, fallbackReciter.id);
        audioUrl = await quranContentProvider.getAyahAudioUrl(
          fallbackReciter.id,
          currentSelection.surahNumber,
          currentSelection.ayah.ayahNumber,
        );
      }
    }
    if (requestId !== audioRequest.current) {
      return;
    }
    if (!audioUrl) {
      throw new Error('لا يتوفر تسجيل صوتي لهذه الكلمة من المصدر.');
    }
    player.replace(audioUrl);
    player.play();
  }, [database, player, reciterId]);

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
      ? `word-${selection.word.id}`
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
  const visibleAudioError =
    audioError ??
    (playerStatus.error ? `تعذر تشغيل التلاوة: ${playerStatus.error}` : null);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Reader controls are toggled from the page header or this explicit close button. */}
      <Animated.View
        style={[
          styles.overlayNavbar,
          {
            backgroundColor:
              colors.background === Colors.dark.background
                ? 'rgba(15, 23, 42, 0.94)'
                : 'rgba(253, 251, 247, 0.96)',
            borderBottomColor:
              colors.background === Colors.dark.background
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.06)',
            opacity: navAnimation,
            transform: [
              {
                translateY: navAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-70, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents={navVisible ? 'auto' : 'none'}
      >
        <Link href="/" replace asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="العودة للسور"
            style={({ pressed }) => [
              styles.navActionBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.navActionGlyph, { color: colors.text }]}>←</Text>
            <Text style={[styles.navActionText, { color: colors.text }]}>السور</Text>
          </Pressable>
        </Link>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="الانتقال إلى موضع آخر"
          onPress={() => setNavigationOpen(true)}
          style={({ pressed }) => [styles.navCenterInfo, pressed && { opacity: 0.75 }]}
        >
          <Text style={[styles.navSurahTitle, { color: colors.text }]}>
            سورة {currentSurahName}
          </Text>
          <Text style={[styles.navPageSubtitle, { color: colors.textSecondary }]}>
            صفحة {toArabicDigits(activePageNumber ?? 1)} · الجزء {toArabicDigits(page?.juzNumber ?? 1)}
          </Text>
        </Pressable>

        <View style={styles.navLeftActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إخفاء أدوات القراءة"
            onPress={hideNavbar}
            style={({ pressed }) => [
              styles.navIconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.navIconGlyph, { color: colors.text }]}>⌃</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="فهرس الصفحات والسور"
            onPress={() => setNavigationOpen(true)}
            style={({ pressed }) => [
              styles.navIconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.navIconGlyph, { color: colors.text }]}>☰</Text>
          </Pressable>

          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الإعدادات"
              style={({ pressed }) => [
                styles.navIconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={[styles.navIconGlyph, { color: colors.text }]}>⚙</Text>
            </Pressable>
          </Link>
        </View>
      </Animated.View>

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
          <SwipePageViewer
            currentPage={pageQuery.data}
            prevPage={prevPageQuery.data ?? null}
            nextPage={nextPageQuery.data ?? null}
            fontSize={fontSize}
            showTajweed={showTajweed}
            isDark={colors.background === Colors.dark.background}
            highlights={highlights}
            selectedElementId={selectedElementId}
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

      {page && !navVisible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إظهار أدوات القراءة"
          onPress={toggleNavbar}
          style={[
            styles.quickControlsToggle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Text style={[styles.quickControlsGlyph, { color: colors.primary }]}>۞</Text>
        </Pressable>
      )}

      {displayPreferencesError && (
        <Text accessibilityRole="alert" style={styles.error}>{displayPreferencesError}</Text>
      )}
      {highlightError && <Text accessibilityRole="alert" style={styles.error}>{highlightError}</Text>}
      {visibleAudioError && (
        <Text accessibilityRole="alert" style={styles.error}>{visibleAudioError}</Text>
      )}
      {interactionError && <Text accessibilityRole="alert" style={styles.error}>{interactionError}</Text>}
      {navigationError && !navigationOpen && (
        <Text accessibilityRole="alert" style={styles.error}>{navigationError}</Text>
      )}

      <SelectionSheet
        surahName={currentSurahName}
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

function retryPageQuery(failureCount: number, error: unknown): boolean {
  return failureCount < PAGE_QUERY_RETRY_COUNT &&
    error instanceof ContentUnavailableError &&
    (error.reason === 'network' || error.reason === 'server');
}

function pageQueryRetryDelay(attemptIndex: number): number {
  return Math.min(300 * 2 ** attemptIndex, 1_200);
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
  overlayNavbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  quickControlsToggle: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    zIndex: 110,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickControlsGlyph: {
    fontSize: 13,
  },
  navActionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  navActionGlyph: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  navActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navCenterInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navSurahTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navPageSubtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  navLeftActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconGlyph: {
    fontSize: 16,
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

function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}
