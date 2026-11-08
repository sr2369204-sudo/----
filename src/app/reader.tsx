/* eslint-disable react-hooks/immutability -- expo-audio exposes `loop` and
   `playbackRate` on AudioPlayer/AudioPlaylist only as mutable properties. */
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioPlayer,
  useAudioPlaylist,
  useAudioPlaylistStatus,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Highlight, SavedWord } from '@/features/annotations/types';
import {
  ContentUnavailableError,
  isFullSurahReciter,
  quranContentProvider,
  type AyahWordTiming,
  type RecitationTrack,
} from '@/features/quran/services/content-provider';
import { resolveOfflineTracks } from '@/features/reader/services/recitation-offline';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import type { MushafPage, QuranSurahDirectory } from '@/features/quran/types';
import type { ElementRect } from '@/features/reader/components/MushafPageViewer';
import {
  RecitationPlayMenu,
  RecitationPlayer,
  RecitationScopeDialog,
  ReciterPickerDialog,
  nextPlaybackRate,
  type PlayScopeChoice,
  type RepeatMode,
} from '@/features/reader/components/RecitationPlayer';
import { SwipePageViewer } from '@/features/reader/components/SwipePageViewer';
import { SelectionToolbar } from '@/features/reader/components/SelectionToolbar';
import { Tasmi3Panel } from '@/features/reader/components/Tasmi3Panel';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';
import {
  buildRecitationQueue,
  type RecitationQueue,
  type RecitationScope,
} from '@/features/reader/services/recitation-queue';
import { TajweedGuideDialog } from '@/features/reader/components/TajweedGuideDialog';
import {
  loadDailyReadingPlan,
  saveLastReadingPosition,
  toggleDailyAyahCompletion,
  type AyahReference,
} from '@/features/reader/services/reading-progress';
import {
  DEFAULT_READER_TOOLBAR_SHAPE,
  isReaderToolbarShape,
  useReaderPreferencesStore,
} from '@/features/reader/state/reader-preferences-store';
import {
  useReaderSelectionStore,
  type ReaderSelection,
} from '@/features/reader/state/selection-store';
import { useTheme } from '@/hooks/use-theme';

type NavigationMode = 'page' | 'surah' | 'juz';
type BookmarkedAyah = { surahNumber: number; ayahNumber: number };
const PAGE_QUERY_RETRY_COUNT = 2;
/** The page text is fitted to its column, so the reader always uses one natural size. */
const MUSHAF_FONT_SIZE = 44;
/** Gap between the floating recitation player and the bottom safe area. */
const RECITATION_PLAYER_BOTTOM_GAP = 10;

export default function ReaderScreen() {
  const params = useLocalSearchParams<{
    surahNumber?: string | string[];
    pageNumber?: string | string[];
    ayahNumber?: string | string[];
  }>();
  const rawSurahNumber = firstParam(params.surahNumber);
  const rawPageNumber = firstParam(params.pageNumber);
  const rawAyahNumber = firstParam(params.ayahNumber);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  // Resolves surah, juz, and ayah references from the on-device index so the
  // reader can navigate without a connection once the pages are saved.
  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  // A tighter interval than the 500ms default: the word being recited has to be
  // followed word by word, and a word only lasts a few hundred milliseconds.
  const recitationPlaylist = useAudioPlaylist({ loop: 'none', updateInterval: 150 });
  const recitationStatus = useAudioPlaylistStatus(recitationPlaylist);
  const reciterId = useReaderPreferencesStore((state) => state.reciterId);
  const selection = useReaderSelectionStore((state) => state.selection);
  const selectWord = useReaderSelectionStore((state) => state.selectWord);
  const selectAyah = useReaderSelectionStore((state) => state.selectAyah);
  const selectAyahRange = useReaderSelectionStore((state) => state.selectAyahRange);
  const [pageNumber, setPageNumber] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedAyah[]>([]);
  const [bookmarkRevision, setBookmarkRevision] = useState(0);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [savedWordRevision, setSavedWordRevision] = useState(0);
  const [recitationQueue, setRecitationQueue] = useState<RecitationQueue | null>(null);
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [recitationBusy, setRecitationBusy] = useState(false);
  const [recitationError, setRecitationError] = useState<string | null>(null);
  const [tasmi3Session, setTasmi3Session] = useState<RecitationScope | null>(null);
  const [tasmi3Revealed, setTasmi3Revealed] = useState(false);
  const [selectionAnchor, setSelectionAnchor] = useState<ElementRect | null>(null);
  const [highlightRevision, setHighlightRevision] = useState(0);
  const [displaySaveError, setDisplaySaveError] = useState<string | null>(null);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [tajweedGuideOpen, setTajweedGuideOpen] = useState(false);
  const [tajweedExampleSeed, setTajweedExampleSeed] = useState(0);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('surah');
  const [navigationValue, setNavigationValue] = useState('');
  const [navigationBusy, setNavigationBusy] = useState(false);
  const audioRequest = useRef(0);
  const [navVisible, setNavVisible] = useState(false);
  const [reciterPickerOpen, setReciterPickerOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [navAnimation] = useState(() => new Animated.Value(0));
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [playbackRate, setPlaybackRate] = useState(1);
  // True while the reader has tucked the floating player away by tapping the
  // page, so the verse it covers can be read while the recitation keeps going.
  const [playerHidden, setPlayerHidden] = useState(false);
  // True while the long-press play menu is open.
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [recitationFabPan] = useState(() => new Animated.ValueXY());
  const recitationFabOffset = useRef({ x: 0, y: 0 });
  const recitationFabResponder = useMemo(
    () =>
      // PanResponder reads these values only from gesture callbacks.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
        onPanResponderGrant: () => {
          recitationFabPan.setOffset(recitationFabOffset.current);
          recitationFabPan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: recitationFabPan.x, dy: recitationFabPan.y }],
          { useNativeDriver: false },
        ),
        onPanResponderRelease: (_, gesture) => {
          recitationFabOffset.current = {
            x: recitationFabOffset.current.x + gesture.dx,
            y: recitationFabOffset.current.y + gesture.dy,
          };
          recitationFabPan.flattenOffset();
        },
      }),
    [recitationFabPan],
  );
  // Snapshot of the playback state read from inside the page's background-tap
  // callback, which must keep a stable identity while the status ticks.
  const playbackRef = useRef<{ hasPlaylist: boolean }>({ hasPlaylist: false });

  // The reader controls are no longer opened from a floating button: they come
  // up together with the word tools, so revealing the ring always reveals the
  // navbar too.
  const showNavbar = useCallback(() => {
    setNavVisible(true);
    Animated.timing(navAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
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
    queryKey: [
      'quran',
      'reader-start',
      rawSurahNumber ?? '',
      rawAyahNumber ?? '',
      rawPageNumber ?? '',
    ],
    queryFn: async () => {
      if (rawPageNumber !== undefined) {
        const requestedPage = parseArabicNumber(rawPageNumber);
        if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 604) {
          throw new ContentUnavailableError('invalid-data', 'Invalid Mushaf page route parameter.');
        }
        return requestedPage;
      }
      if (rawAyahNumber !== undefined) {
        const requestedSurah = parseArabicNumber(rawSurahNumber ?? '');
        const requestedAyah = parseArabicNumber(rawAyahNumber);
        if (
          !Number.isInteger(requestedSurah) ||
          requestedSurah < 1 ||
          requestedSurah > 114 ||
          !Number.isInteger(requestedAyah) ||
          requestedAyah < 1 ||
          requestedAyah > 286
        ) {
          throw new ContentUnavailableError('invalid-data', 'Invalid ayah route parameter.');
        }
        return quranCache.getPageNumberForAyah(requestedSurah, requestedAyah);
      }
      // An explicit surah always wins, Al-Fatiha included. Resuming the saved
      // position is the request that carries no route parameter at all, so the
      // two cases can no longer collapse into the same value.
      if (rawSurahNumber !== undefined) {
        const requestedSurah = parseArabicNumber(rawSurahNumber);
        if (!Number.isInteger(requestedSurah) || requestedSurah < 1 || requestedSurah > 114) {
          throw new ContentUnavailableError('invalid-data', 'Invalid surah route parameter.');
        }
        return quranCache.getPageNumberForSurah(requestedSurah);
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
         WHERE key IN ('reader.showTajweed', 'reader.toolbarSize', 'reader.toolbarShape', 'reader.markerScale')`,
      );
      const preferences = new Map(rows.map((row) => [row.key, row.value]));
      const savedTajweed = preferences.get('reader.showTajweed');
      const savedToolbarSize = Number(preferences.get('reader.toolbarSize') ?? 44);
      const savedToolbarShape = preferences.get('reader.toolbarShape') ?? DEFAULT_READER_TOOLBAR_SHAPE;
      const savedMarkerScale = Number(preferences.get('reader.markerScale') ?? 1.1);
      if (savedTajweed !== undefined && savedTajweed !== 'true' && savedTajweed !== 'false') {
        throw new Error('إعداد ألوان التجويد المحفوظ غير صالح.');
      }
      if (!Number.isInteger(savedToolbarSize) || savedToolbarSize < 32 || savedToolbarSize > 56) {
        throw new Error('حجم أدوات التحديد المحفوظ غير صالح.');
      }
      // A shape stored by an older build may no longer exist, so an unknown
      // value falls back to the shipped shape instead of breaking the reader.
      const toolbarShape = isReaderToolbarShape(savedToolbarShape)
        ? savedToolbarShape
        : DEFAULT_READER_TOOLBAR_SHAPE;
      if (!Number.isFinite(savedMarkerScale) || savedMarkerScale < 0.8 || savedMarkerScale > 1.8) {
        throw new Error('حجم علامات الآيات والأرباع المحفوظ غير صالح.');
      }
      return {
        showTajweed: savedTajweed === undefined ? true : savedTajweed === 'true',
        toolbarSize: savedToolbarSize,
        toolbarShape,
        markerScale: savedMarkerScale,
      };
    },
    staleTime: Infinity,
  });

  // Display settings are edited on the settings screen, which writes straight
  // to the database. The reader therefore re-reads them every time it comes back
  // on screen instead of keeping whatever was cached when it first opened.
  useFocusEffect(
    useCallback(() => {
      void queryClient.refetchQueries({ queryKey: ['reader', 'display-preferences'] });
    }, [queryClient]),
  );

  const showTajweed = displayPreferencesQuery.data?.showTajweed ?? true;
  const toggleTajweed = useCallback(() => {
    const preferences = displayPreferencesQuery.data;
    if (!preferences) {
      return;
    }
    queryClient.setQueryData(['reader', 'display-preferences'], {
      ...preferences,
      showTajweed: !preferences.showTajweed,
    });
  }, [displayPreferencesQuery.data, queryClient]);
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
    saveSetting(database, 'reader.showTajweed', String(showTajweed))
      .then(() => {
        if (active) {
          setDisplaySaveError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setDisplaySaveError(
            error instanceof Error ? `تعذر حفظ إعداد القراءة: ${error.message}` : 'تعذر حفظ إعداد القراءة.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [database, displayPreferencesQuery.data, showTajweed]);

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

  // The page the strip can actually show. While a newly requested page is still
  // loading `pageQuery` keeps the previous one, so this is the only number that
  // describes what is on screen.
  const renderedPageNumber = pageQuery.data?.page.pageNumber ?? null;
  // Neighbours are resolved around the page on screen, never around the page
  // still loading. A turn is only accepted once its target is already mounted
  // and painted, so the strip always has a prepared page in each direction and
  // never has to fall back to a half-rendered one.
  const neighbourBaseNumber = renderedPageNumber ?? activePageNumber;
  const prevPageNumber =
    neighbourBaseNumber && neighbourBaseNumber > 1 ? neighbourBaseNumber - 1 : null;
  const prevPageQuery = useQuery({
    queryKey: ['quran', 'mushaf-page', 19, prevPageNumber],
    enabled: prevPageNumber !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: retryPageQuery,
    retryDelay: pageQueryRetryDelay,
    queryFn: () => new MushafPageCache(database).getPage(prevPageNumber!),
  });

  const nextPageNumber =
    neighbourBaseNumber && neighbourBaseNumber < 604 ? neighbourBaseNumber + 1 : null;
  const nextPageQuery = useQuery({
    queryKey: ['quran', 'mushaf-page', 19, nextPageNumber],
    enabled: nextPageNumber !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: retryPageQuery,
    retryDelay: pageQueryRetryDelay,
    queryFn: () => new MushafPageCache(database).getPage(nextPageNumber!),
  });

  // The page after the next one is fetched but never mounted: its mushaf font
  // is the slow part, and without this a reader who turns two pages in a row
  // reaches a page whose download had not even started, so the strip has to
  // refuse that turn and holds the reader on the same page.
  const warmNextPageNumber =
    neighbourBaseNumber && neighbourBaseNumber <= 602 ? neighbourBaseNumber + 2 : null;
  useQuery({
    queryKey: ['quran', 'mushaf-page', 19, warmNextPageNumber],
    enabled: warmNextPageNumber !== null,
    staleTime: 24 * 60 * 60 * 1000,
    retry: retryPageQuery,
    retryDelay: pageQueryRetryDelay,
    queryFn: () => new MushafPageCache(database).getPage(warmNextPageNumber!),
  });

  const directoryQuery = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const dailyPlanQuery = useQuery({
    queryKey: ['reading', 'daily-plan'],
    queryFn: () => loadDailyReadingPlan(database),
  });

  const recitersQuery = useQuery({
    queryKey: ['quran', 'reciters'],
    queryFn: () => quranContentProvider.getReciters(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const page = pageQuery.data?.page;

  // The ayah the reciter is on right now. It drives the frame drawn around the
  // ayah on the page as well as the automatic page turn that keeps the reader
  // in step with the recitation.
  const activeTrack = recitationQueue?.tracks[recitationStatus.currentIndex] ?? null;
  const activeAyahId = activeTrack
    ? `ayah-${activeTrack.surahNumber}-${activeTrack.ayahNumber}`
    : null;
  const tasmi3HiddenAyahIds = useMemo(() => {
    if (!tasmi3Session || tasmi3Revealed) {
      return [];
    }
    // The learner should not see any ayah while memorisation mode is active,
    // including pages reached by swiping beyond the selected range.
    return ['*'];
  }, [tasmi3Revealed, tasmi3Session]);

  // Focus mode: while the recitation is actually playing, the reader keeps the
  // chrome out of the way and follows the reciting ayah alone.
  const isReciting = recitationStatus.playing;

  // Word spans of the reciting surah, used to mark the word being read. They
  // are asked for as soon as a queue is loaded, so the spans are already there
  // by the time the first word sounds, and only the verse-by-verse reciters
  // carry them: a whole-surah reciter streams one file with no per-word timings
  // at all.
  const wordTimingsQuery = useQuery({
    queryKey: ['quran', 'word-timings', reciterId, activeTrack?.surahNumber ?? 0],
    enabled:
      recitationQueue !== null &&
      activeTrack !== null &&
      reciterId > 0 &&
      !isFullSurahReciter(reciterId),
    staleTime: Infinity,
    queryFn: () => {
      if (!activeTrack) {
        throw new Error('لا توجد سورة جارية.');
      }
      return quranContentProvider.getChapterWordTimings(reciterId, activeTrack.surahNumber);
    },
  });

  // The single word being recited right now, resolved from the player position
  // against the spans of the current ayah, then matched to the word on the page.
  const activeWordId = useMemo(() => {
    if (!isReciting || !activeTrack || !page) {
      return null;
    }
    const timings = wordTimingsQuery.data?.get(
      `${activeTrack.surahNumber}:${activeTrack.ayahNumber}`,
    );
    if (!timings || timings.length === 0) {
      return null;
    }
    const positionMs = recitationStatus.currentTime * 1000;
    // The source leaves a few words without a span of their own, so the reader
    // holds the last word that has actually started rather than dropping the
    // mark for a moment and blinking back on at the word after the gap.
    let timing: AyahWordTiming | null = null;
    for (const candidate of timings) {
      if (candidate.startMs <= positionMs && (timing === null || candidate.startMs >= timing.startMs)) {
        timing = candidate;
      }
    }
    if (!timing) {
      return null;
    }
    const ayah = page.ayahs.find(
      (item) =>
        item.surahNumber === activeTrack.surahNumber &&
        item.ayahNumber === activeTrack.ayahNumber,
    );
    const word = ayah?.words.find((candidate) => candidate.position === timing.position);
    return word ? `word-${word.id}` : null;
  }, [activeTrack, isReciting, page, recitationStatus.currentTime, wordTimingsQuery.data]);

  // True whenever any audio is running — a single word/ayah file or a full
  // recitation queue. Both take the word tools and the navbar off screen so the
  // page stays clear while the reader listens.
  const isPlayingAudio = playerStatus.playing || recitationStatus.playing;

  // The page of the recited ayah is almost always already mounted (the reader
  // follows one ayah at a time through the current page and its two preloaded
  // neighbours), so it is resolved locally and the source is only asked when
  // the reader has browsed somewhere further away.
  const localAyahPage = useMemo(() => {
    if (!activeTrack) {
      return null;
    }
    return findAyahPage(
      [page, prevPageQuery.data?.page, nextPageQuery.data?.page],
      activeTrack.surahNumber,
      activeTrack.ayahNumber,
    );
  }, [activeTrack, nextPageQuery.data, page, prevPageQuery.data]);

  const localAyahPageQuery = useQuery({
    queryKey: [
      'quran',
      'ayah-page',
      activeTrack?.surahNumber ?? 0,
      activeTrack?.ayahNumber ?? 0,
    ],
    enabled: activeTrack !== null && localAyahPage === null,
    staleTime: Infinity,
    queryFn: () => {
      if (!activeTrack) {
        throw new Error('لا توجد آية جارية.');
      }
      return quranCache.getPageNumberForAyah(
        activeTrack.surahNumber,
        activeTrack.ayahNumber,
      );
    },
  });

  const recitationFollowPage = localAyahPage ?? localAyahPageQuery.data ?? null;

  // The reader is pulled to the recited ayah's page only when the ayah itself
  // changes, never when the page changes, so turning away by hand is allowed
  // until the reciter moves on.
  const activePageRef = useRef<number | null>(activePageNumber);
  useEffect(() => {
    activePageRef.current = activePageNumber;
  }, [activePageNumber]);
  useEffect(() => {
    if (recitationFollowPage === null || activePageRef.current === recitationFollowPage) {
      return;
    }
    setPageNumber(recitationFollowPage);
  }, [recitationFollowPage]);

  const rememberReadingPosition = useCallback((
    surahNumber: number,
    ayahNumber: number,
    currentPageNumber: number,
  ) => {
    const position = { surahNumber, ayahNumber, pageNumber: currentPageNumber };
    saveLastReadingPosition(database, position)
      .then(() => queryClient.setQueryData(['reading', 'last-position'], position))
      .catch((error: unknown) => {
        setNavigationError(
          error instanceof Error
            ? `تعذر حفظ موضع القراءة: ${error.message}`
            : 'تعذر حفظ موضع القراءة.',
        );
      });
  }, [database, queryClient]);

  const toggleDailyReading = useCallback(async (references: AyahReference[]) => {
    const plan = await toggleDailyAyahCompletion(database, references);
    queryClient.setQueryData(['reading', 'daily-plan'], plan);
  }, [database, queryClient]);

  useEffect(() => {
    if (!page || page.pageNumber !== activePageNumber) {
      return;
    }
    saveSetting(database, 'reader.lastPage', String(page.pageNumber)).catch((error: unknown) => {
      setNavigationError(
        error instanceof Error ? `تعذر حفظ موضع القراءة: ${error.message}` : 'تعذر حفظ موضع القراءة.',
      );
    });
    const firstAyah = page.ayahs[0];
    const isRequestedAyahPage =
      rawAyahNumber !== undefined &&
      startLocationQuery.data === page.pageNumber &&
      rawSurahNumber !== undefined;
    if (isRequestedAyahPage) {
      rememberReadingPosition(
        parseArabicNumber(rawSurahNumber),
        parseArabicNumber(rawAyahNumber),
        page.pageNumber,
      );
    } else if (firstAyah) {
      rememberReadingPosition(firstAyah.surahNumber, firstAyah.ayahNumber, page.pageNumber);
    }
  }, [
    activePageNumber,
    database,
    page,
    rawAyahNumber,
    rawSurahNumber,
    rememberReadingPosition,
    startLocationQuery.data,
  ]);

  useEffect(() => {
    if (activeTrack && recitationFollowPage !== null) {
      rememberReadingPosition(
        activeTrack.surahNumber,
        activeTrack.ayahNumber,
        recitationFollowPage,
      );
    }
  }, [activeTrack, recitationFollowPage, rememberReadingPosition]);

  useEffect(() => {
    if (!page) {
      return;
    }
    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    repository
      .listHighlightsForAyahs(page.ayahs)
      .then((items) => {
        if (active) {
          setHighlights(items);
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
    if (!page) {
      return;
    }
    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    repository
      .listBookmarksForAyahs(page.ayahs)
      .then((items) => {
        if (active) {
          setBookmarks(
            items.map((bookmark) => ({
              surahNumber: bookmark.surahNumber,
              ayahNumber: bookmark.ayahNumber,
            })),
          );
        }
      })
      .catch(() => {
        /* non-fatal: the page still renders without bookmark markers */
      });

    return () => {
      active = false;
    };
  }, [bookmarkRevision, database, page]);

  useEffect(() => {
    if (!page) {
      return;
    }
    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    repository
      .listSavedWordsForAyahs(page.ayahs)
      .then((items) => {
        if (active) {
          setSavedWords(items);
        }
      })
      .catch(() => {
        /* non-fatal: saved word markers simply stay hidden for this page */
      });

    return () => {
      active = false;
    };
  }, [database, page, savedWordRevision]);

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
      recitationPlaylist.pause();
    };
  }, [player, recitationPlaylist]);

  // Repeat and speed are properties of the native players, applied whenever the
  // reader changes them so the next track inherits the current setting.
  useEffect(() => {
    recitationPlaylist.loop = repeatMode;
    player.loop = repeatMode === 'single';
  }, [player, recitationPlaylist, repeatMode]);

  useEffect(() => {
    recitationPlaylist.playbackRate = playbackRate;
    player.setPlaybackRate(playbackRate);
  }, [playbackRate, player, recitationPlaylist]);

  // Kept in a ref because the page's background-tap callback has to stay stable
  // while the playback status ticks every second.
  useEffect(() => {
    playbackRef.current.hasPlaylist = recitationQueue !== null;
  }, [recitationQueue]);

  const onAyahPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
    rect: ElementRect,
    gesture: 'tap' | 'longPress',
  ) => {
    if (recitationQueue) {
      setPlayerHidden((hidden) => !hidden);
      return;
    }
    const ayah = page?.ayahs.find(
      (item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
    );
    if (!ayah) {
      setInteractionError('تعذر مطابقة الآية مع بيانات صفحة المصحف.');
      return;
    }
    const current = useReaderSelectionStore.getState().selection;
    if (gesture === 'tap') {
      if (
        !current ||
        current.surahNumber !== surahNumber ||
        (current.type !== 'ayah' && current.type !== 'range')
      ) {
        return;
      }
    }
    if (gesture === 'longPress' && current?.type === 'range') {
      return;
    }
    if (page) {
      rememberReadingPosition(surahNumber, ayahNumber, page.pageNumber);
    }
    audioRequest.current += 1;
    player.pause();
    setInteractionError(null);
    setSelectionAnchor(rect);

    // A second tap on another ayah of the same surah stretches the selection
    // into a range, so ayah 3 followed by ayah 5 selects 3–5 as one frame.
    const anchorAyah =
      current && current.surahNumber === surahNumber && current.type !== 'word'
        ? current.type === 'ayah'
          ? current.ayah.ayahNumber
          : current.startAyah
        : null;
    if (anchorAyah !== null && anchorAyah !== ayahNumber && page) {
      const start = Math.min(anchorAyah, ayahNumber);
      const end = Math.max(anchorAyah, ayahNumber);
      const rangeAyahs = page.ayahs
        .filter(
          (item) =>
            item.surahNumber === surahNumber &&
            item.ayahNumber >= start &&
            item.ayahNumber <= end,
        )
        .sort((first, second) => first.ayahNumber - second.ayahNumber);
      if (rangeAyahs.length > 1) {
        selectAyahRange(surahNumber, rangeAyahs, 'compact');
        showNavbar();
        return;
      }
    }

    selectAyah(surahNumber, ayah, 'compact');
    showNavbar();
  }, [page, player, recitationQueue, rememberReadingPosition, selectAyah, selectAyahRange, showNavbar]);

  const onWordPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    rect: ElementRect,
    gesture: 'tap' | 'longPress',
  ) => {
    if (recitationQueue) {
      setPlayerHidden((hidden) => !hidden);
      return;
    }
    // While an ayah or a run of ayahs is already selected, a press on a word
    // means the ayah that word sits in rather than the word itself: the reader
    // is pointing at a verse, not at one of its words. Handing it to the ayah
    // handler lets the press close the run, exactly as tapping any other ayah
    // would, so a word never needs the reader to aim at the ayah head instead.
    const current = useReaderSelectionStore.getState().selection;
    if (
      current &&
      current.surahNumber === surahNumber &&
      (current.type === 'ayah' || current.type === 'range')
    ) {
      onAyahPress(surahNumber, ayahNumber, rect, 'tap');
      return;
    }
    if (gesture !== 'longPress') {
      return;
    }
    const ayah = page?.ayahs.find(
      (item) => item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
    );
    const word = ayah?.words.find((item) => item.id === wordId);
    if (!ayah || !word) {
      setInteractionError('تعذر مطابقة الكلمة مع بيانات صفحة المصحف.');
      return;
    }
    if (page) {
      rememberReadingPosition(surahNumber, ayahNumber, page.pageNumber);
    }
    audioRequest.current += 1;
    player.pause();
    setInteractionError(null);
    setSelectionAnchor(rect);
    selectWord(surahNumber, ayah, word, 'compact');
    showNavbar();
  }, [
    onAyahPress,
    page,
    player,
    recitationQueue,
    rememberReadingPosition,
    selectWord,
    showNavbar,
  ]);

  /**
   * Swaps the playlist contents for a freshly built queue and starts it. When
   * `resumeTrack` is given playback picks up from that same ayah, which is how
   * a mid-recitation reciter change keeps the reader on the same verse.
   */
  const loadRecitationQueue = useCallback((
    queue: RecitationQueue,
    resumeTrack: RecitationTrack | null,
  ) => {
    recitationPlaylist.pause();
    recitationPlaylist.clear();
    for (const track of queue.tracks) {
      // The playlist bridge expects a source object; a bare URL string reaches
      // the native side as a raw value and is rejected.
      recitationPlaylist.add({ uri: track.url });
    }
    recitationPlaylist.loop = repeatMode;
    recitationPlaylist.playbackRate = playbackRate;
    setRecitationQueue(queue);
    // A fresh queue always brings the floating player back into view, even if
    // the reader had tucked the previous one away.
    setPlayerHidden(false);
    const resumeIndex = resumeTrack
      ? queue.tracks.findIndex(
          (track) =>
            track.surahNumber === resumeTrack.surahNumber &&
            track.ayahNumber === resumeTrack.ayahNumber,
        )
      : -1;
    if (resumeIndex > 0) {
      recitationPlaylist.skipTo(resumeIndex);
    }
    recitationPlaylist.play();
  }, [playbackRate, recitationPlaylist, repeatMode]);

  /**
   * Loads a scope into the recitation playlist and starts it. Shared by the
   * duration picker and by playing a selected run of ayahs straight from the
   * word/ayah tools.
   */
  const runRecitation = useCallback(async (scope: RecitationScope) => {
    audioRequest.current += 1;
    player.pause();
    const queue = await buildRecitationQueue(reciterId, scope);
    queue.tracks = resolveOfflineTracks(reciterId, queue.tracks);
    loadRecitationQueue(queue, null);
  }, [loadRecitationQueue, player, reciterId]);

  const startTasmi3 = useCallback((requestedScope: RecitationScope) => {
    const selectedScope =
      requestedScope.type === 'pageRange' &&
      requestedScope.fromPage === requestedScope.toPage &&
      selection?.type === 'ayah'
        ? {
            type: 'ayah',
            surahNumber: selection.surahNumber,
            ayahNumber: selection.ayah.ayahNumber,
          } as RecitationScope
        : requestedScope.type === 'pageRange' &&
            requestedScope.fromPage === requestedScope.toPage &&
            selection?.type === 'range'
          ? {
              type: 'ayahRange',
              surahNumber: selection.surahNumber,
              fromAyah: selection.startAyah,
              toAyah: selection.endAyah,
            } as RecitationScope
          : requestedScope;
    // Memorisation mode reads the page already on screen, so it never fetches
    // audio and therefore works with no connection.
    audioRequest.current += 1;
    player.pause();
    recitationPlaylist.pause();
    setTasmi3Session(selectedScope);
    setTasmi3Revealed(false);
    setScopeDialogOpen(false);
    useReaderSelectionStore.getState().clearSelection();
  }, [player, recitationPlaylist, selection]);

  const playSelection = useCallback(async (currentSelection: ReaderSelection) => {
    if (currentSelection.type === 'range') {
      // A run of ayahs is a playlist, not a single file: it is loaded into the
      // recitation player so it can be browsed, repeated and sped up.
      useReaderSelectionStore.getState().clearSelection();
      await runRecitation({
        type: 'ayahRange',
        surahNumber: currentSelection.surahNumber,
        fromAyah: currentSelection.startAyah,
        toAyah: currentSelection.endAyah,
      });
      return;
    }

    if (currentSelection.type === 'ayah') {
      // A single ayah is also loaded into the recitation player to provide
      // consistent controls (repeat, speed, reciter info).
      useReaderSelectionStore.getState().clearSelection();
      await runRecitation({
        type: 'ayah',
        surahNumber: currentSelection.surahNumber,
        ayahNumber: currentSelection.ayah.ayahNumber,
      });
      return;
    }

    const requestId = ++audioRequest.current;
    setAudioError(null);
    recitationPlaylist.pause();
    let audioUrl: string | null;
    if (currentSelection.type === 'word') {
      // Rebuilt from the word's position: the `audio_url` carried by the API
      // drifts one word ahead after every pause mark.
      audioUrl = quranContentProvider.getWordAudioUrlForPosition(
        currentSelection.surahNumber,
        currentSelection.ayah.ayahNumber,
        currentSelection.word.position,
      );
    } else {
      // This branch is now only for words or other types if added; ayah is handled above.
      audioUrl = null;
    }

    if (requestId !== audioRequest.current) {
      return;
    }

    if (!audioUrl) {
      throw new Error('لا يتوفر تسجيل صوتي لهذه الكلمة من المصدر.');
    }
    player.replace({ uri: audioUrl });
    player.play();
  }, [player, recitationPlaylist, runRecitation]);

  const stopAudio = useCallback(() => {
    audioRequest.current += 1;
    player.pause();
  }, [player]);

  const navigateToPage = useCallback((destination: number) => {
    // The page and the selection are committed before playback is touched:
    // stopping the player reaches the native side, and a turn whose page was
    // never set is exactly what left the strip showing a page the rest of the
    // screen did not know about.
    setPageNumber(destination);
    useReaderSelectionStore.getState().clearSelection();
    audioRequest.current += 1;
    player.pause();
  }, [player]);

  const toggleBookmark = useCallback((surahNumber: number, ayahNumber: number) => {
    const repository = new SqliteAnnotationRepository(database);
    const exists = bookmarks.some(
      (bookmark) => bookmark.surahNumber === surahNumber && bookmark.ayahNumber === ayahNumber,
    );
    const action: Promise<unknown> = exists
      ? repository.deleteBookmark(surahNumber, ayahNumber)
      : repository.createBookmark(surahNumber, ayahNumber);
    action
      .then(() => setBookmarkRevision((revision) => revision + 1))
      .catch((error: unknown) => {
        setInteractionError(
          error instanceof Error
            ? `تعذر تحديث العلامة المرجعية: ${error.message}`
            : 'تعذر تحديث العلامة المرجعية.',
        );
      });
  }, [bookmarks, database]);

  const openAyah = useCallback((surahNumber: number, ayahNumber: number) => {
    quranCache
      .getPageNumberForAyah(surahNumber, ayahNumber)
      .then((destination) => navigateToPage(destination))
      .catch((error: unknown) => {
        setInteractionError(
          error instanceof Error
            ? `تعذر الانتقال إلى الآية: ${error.message}`
            : 'تعذر الانتقال إلى الآية.',
        );
      });
  }, [navigateToPage, quranCache]);

  const toggleSaveWord = useCallback((
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    wordText: string,
  ) => {
    const repository = new SqliteAnnotationRepository(database);
    const exists = savedWords.some(
      (word) =>
        word.surahNumber === surahNumber &&
        word.ayahNumber === ayahNumber &&
        word.wordId === wordId,
    );
    const action: Promise<unknown> = exists
      ? repository.deleteSavedWord(surahNumber, ayahNumber, wordId)
      : repository.createSavedWord({ surahNumber, ayahNumber, wordId, wordText });
    action
      .then(() => {
        setSavedWordRevision((revision) => revision + 1);
        // The saved-words screen reads the same table through React Query; it
        // has to be told the list changed or it keeps serving its cached copy.
        return queryClient.invalidateQueries({ queryKey: ['annotations', 'saved-words'] });
      })
      .catch((error: unknown) => {
        setInteractionError(
          error instanceof Error
            ? `تعذر تحديث الكلمات المحفوظة: ${error.message}`
            : 'تعذر تحديث الكلمات المحفوظة.',
        );
      });
  }, [database, queryClient, savedWords]);

  const selectReciter = useCallback((nextReciterId: number) => {
    const preferences = useReaderPreferencesStore.getState();
    preferences.setPreferences(preferences.themePreference, nextReciterId);
    saveSetting(database, 'reciterId', String(nextReciterId)).catch((error: unknown) => {
      setRecitationError(
        error instanceof Error ? `تعذر حفظ القارئ المختار: ${error.message}` : 'تعذر حفظ القارئ المختار.',
      );
    });
    // A recitation that is already running is rebuilt with the new reciter and
    // picks up from the same ayah, so choosing another voice does not restart
    // the passage from its beginning.
    if (!recitationQueue) {
      return;
    }
    const resumeTrack = recitationQueue.tracks[recitationStatus.currentIndex] ?? null;
    setRecitationBusy(true);
    buildRecitationQueue(nextReciterId, recitationQueue.scope)
      .then((queue) => {
        queue.tracks = resolveOfflineTracks(nextReciterId, queue.tracks);
        loadRecitationQueue(queue, resumeTrack);
        setRecitationError(null);
      })
      .catch((error: unknown) => {
        setRecitationError(
          error instanceof Error ? `تعذر تغيير القارئ: ${error.message}` : 'تعذر تغيير القارئ.',
        );
      })
      .finally(() => {
        setRecitationBusy(false);
      });
  }, [
    database,
    loadRecitationQueue,
    recitationQueue,
    recitationStatus.currentIndex,
  ]);

  const startRecitation = useCallback(async (scope: RecitationScope) => {
    setRecitationBusy(true);
    setRecitationError(null);
    try {
      if (isFullSurahReciter(reciterId) && scope.type !== 'surah') {
        setRecitationError(
          'هذا القارئ يدعم تشغيل السورة كاملة من بدايتها فقط، ولا يدعم التشغيل آية بآية.',
        );
        return;
      }
      // Focus mode: the word tools and the navbar go away as soon as a
      // recitation starts, leaving the page and the floating player alone.
      useReaderSelectionStore.getState().clearSelection();
      await runRecitation(scope);
      setScopeDialogOpen(false);
    } catch (error) {
      setRecitationError(
        error instanceof Error ? `تعذر تشغيل التلاوة: ${error.message}` : 'تعذر تشغيل التلاوة.',
      );
    } finally {
      setRecitationBusy(false);
    }
  }, [reciterId, runRecitation]);

  const closeRecitation = useCallback(() => {
    recitationPlaylist.pause();
    recitationPlaylist.clear();
    setRecitationQueue(null);
    setRecitationError(null);
  }, [recitationPlaylist]);

  // The floating player belongs to a recitation that is actually running, so it
  // leaves the page on its own once the last selected ayah has been read
  // instead of staying docked with nothing to play. `didJustFinish` is the
  // player's end-of-queue signal and only ever fires with no loop set, so it is
  // watched as an edge: reading it as a steady flag would tear down a freshly
  // loaded queue while the previous flag was still set.
  const recitationEndedRef = useRef(false);
  useEffect(() => {
    if (!recitationStatus.didJustFinish) {
      recitationEndedRef.current = false;
      return;
    }
    if (recitationEndedRef.current) {
      return;
    }
    recitationEndedRef.current = true;
    closeRecitation();
  }, [closeRecitation, recitationStatus.didJustFinish]);

  // Reported by the page itself when a tap misses every word and ayah. With a
  // recitation queue loaded the tap tucks the floating player away — or brings
  // it back — so the verse underneath can be read while the reciter goes on.
  // Otherwise it simply dismisses the word/ayah tools. Because the report comes
  // from inside the page, a tap on another ayah is never read as a dismissal
  // and can still stretch the selection into a range.
  const handleBackgroundPress = useCallback(() => {
    if (!useReaderSelectionStore.getState().selection && playbackRef.current.hasPlaylist) {
      setPlayerHidden((hidden) => !hidden);
      return;
    }
    useReaderSelectionStore.getState().clearSelection();
  }, []);

  const handlePageTurn = useCallback((targetPageNumber: number) => {
    // The strip only turns to a page that is mounted and painted, and it has
    // already finished the animation by the time this runs, so the turn is
    // committed as-is. Refusing it here — an open word selection, a page whose
    // data was still loading — is what used to make the page slide back on its
    // own a moment after the reader had turned it.
    if (navigationOpen) {
      return;
    }
    if (!Number.isInteger(targetPageNumber) || targetPageNumber < 1 || targetPageNumber > 604) {
      return;
    }
    navigateToPage(targetPageNumber);
  }, [navigateToPage, navigationOpen]);

  const selectedElementIds = useMemo<string[] | null>(() => {
    if (!selection) {
      return null;
    }
    if (selection.type === 'word') {
      return [`word-${selection.word.id}`];
    }
    if (selection.type === 'ayah') {
      return [`ayah-${selection.surahNumber}-${selection.ayah.ayahNumber}`];
    }
    return selection.ayahs.map((ayah) => `ayah-${selection.surahNumber}-${ayah.ayahNumber}`);
  }, [selection]);

  const selectedAyahReferences = useMemo<AyahReference[]>(() => {
    if (!selection) {
      return [];
    }
    const ayahs = selection.type === 'range' ? selection.ayahs : [selection.ayah];
    return ayahs.map((ayah) => ({
      surahNumber: selection.surahNumber,
      ayahNumber: ayah.ayahNumber,
    }));
  }, [selection]);
  const completedAyahKeys = new Set(dailyPlanQuery.data?.completedAyahs ?? []);
  const isDailyReadingComplete =
    selectedAyahReferences.length > 0 &&
    selectedAyahReferences.every((ayah) =>
      completedAyahKeys.has(`${ayah.surahNumber}:${ayah.ayahNumber}`),
    );

  const isBookmarked = selection
    ? selection.type === 'range'
      ? bookmarks.some(
          (bookmark) =>
            bookmark.surahNumber === selection.surahNumber &&
            bookmark.ayahNumber >= selection.startAyah &&
            bookmark.ayahNumber <= selection.endAyah,
        )
      : bookmarks.some(
          (bookmark) =>
            bookmark.surahNumber === selection.surahNumber &&
            bookmark.ayahNumber === selection.ayah.ayahNumber,
        )
    : false;

  const isWordSaved =
    selection && selection.type === 'word'
      ? savedWords.some(
          (word) =>
            word.surahNumber === selection.surahNumber &&
            word.ayahNumber === selection.ayah.ayahNumber &&
            word.wordId === selection.word.id,
        )
      : false;

  const currentSurahName =
    page?.surahs.find((surah) => surah.surahNumber === selection?.surahNumber)?.nameArabic ??
    page?.surahs[0]?.nameArabic ??
    'المصحف';

  const currentAyahNumber = selection
    ? selection.type === 'range'
      ? selection.startAyah
      : selection.ayah.ayahNumber
    : page?.ayahs[0]?.ayahNumber ?? 1;

  // The verse the long-press play menu is opened on: the selected one when
  // there is a selection, otherwise the first verse of the page on screen.
  const playMenuSurahNumber =
    selection?.surahNumber ?? page?.surahs[0]?.surahNumber ?? 1;
  const playMenuAyahNumber = selection
    ? selection.type === 'range'
      ? selection.startAyah
      : selection.ayah.ayahNumber
    : page?.ayahs[0]?.ayahNumber ?? 1;
  const playMenuSurahName =
    page?.surahs.find((surah) => surah.surahNumber === playMenuSurahNumber)?.nameArabic ??
    currentSurahName;

  const openPlayMenu = useCallback(() => {
    setRecitationError(null);
    setPlayMenuOpen(true);
  }, []);

  /** Turns one of the long-press menu options into the recitation it starts. */
  const handlePlayScope = useCallback(
    (choice: PlayScopeChoice) => {
      setPlayMenuOpen(false);
      const surahNumber = playMenuSurahNumber;
      const lastAyah =
        directoryQuery.data?.surahs.find((surah) => surah.surahNumber === surahNumber)?.ayahCount ??
        playMenuAyahNumber;
      if (choice === 'from-surah-start') {
        void startRecitation({ type: 'surah', surahNumber });
        return;
      }
      if (choice === 'from-page-start') {
        const pageAyahNumbers = (page?.ayahs ?? [])
          .filter((ayah) => ayah.surahNumber === surahNumber)
          .map((ayah) => ayah.ayahNumber);
        const fromAyah =
          pageAyahNumbers.length > 0 ? Math.min(...pageAyahNumbers) : playMenuAyahNumber;
        void startRecitation({ type: 'ayahRange', surahNumber, fromAyah, toAyah: lastAyah });
        return;
      }
      void startRecitation({
        type: 'ayahRange',
        surahNumber,
        fromAyah: playMenuAyahNumber,
        toAyah: lastAyah,
      });
    },
    [directoryQuery.data, page, playMenuAyahNumber, playMenuSurahNumber, startRecitation],
  );

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
        destination = await quranCache.getPageNumberForSurah(value);
      } else {
        if (value < 1 || value > 30) {
          throw new RangeError('رقم الجزء يجب أن يكون بين ١ و٣٠.');
        }
        destination = await quranCache.getPageNumberForJuz(value);
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
  }, [navigateToPage, quranCache]);

  useEffect(() => {
    if ((!selection || isPlayingAudio) && navVisible) {
      // Avoid calling setState synchronously during render/effect to satisfy
      // strict lint rules, especially since hideNavbar starts an animation.
      const task = requestAnimationFrame(() => {
        hideNavbar();
      });
      return () => cancelAnimationFrame(task);
    }
  }, [selection, isPlayingAudio, navVisible, hideNavbar]);

  const initialError = startLocationQuery.error;
  const pageError = pageQuery.error;
  const pageLoading = startLocationQuery.isPending || activePageNumber === null || pageQuery.isPending;
  const noInitialPage = initialError || pageError;
  const directory = directoryQuery.data;
  const visibleAudioError =
    audioError ??
    (playerStatus.error ? `تعذر تشغيل التلاوة: ${playerStatus.error}` : null);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* The reader controls come up together with the word tools, never from a
          floating button of their own. */}
      <Animated.View
        onLayout={(event) => setNavbarHeight(event.nativeEvent.layout.height)}
        style={[
          styles.overlayNavbar,
          {
            // The bar starts at the top of the window and pads past the safe
            // area, so it paints the status bar region too: the system status
            // bar then reads as the same colour and shade as the navbar.
            top: 0,
            paddingTop: insets.top + 10,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            opacity: navAnimation,
            transform: [
              {
                translateY: navAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-220, 0],
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
            style={({ pressed }) =>
              StyleSheet.flatten([
                styles.navActionBtn,
                { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                pressed && { opacity: 0.75 },
              ])
            }
          >
            <Ionicons name="chevron-forward" size={15} color={colors.primary} />
            <Text style={[styles.navActionText, { color: colors.primary }]}>السور</Text>
          </Pressable>
        </Link>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="الانتقال إلى موضع آخر"
          onPress={() => setNavigationOpen(true)}
          style={({ pressed }) => [
            styles.navCenterInfo,
            { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
            pressed && { opacity: 0.75 },
          ]}
        >
          <View style={styles.navTitleRow}>
            <Ionicons name="navigate-outline" size={14} color={colors.primary} />
            <Text style={[styles.navSurahTitle, { color: colors.text }]} numberOfLines={1}>
              سورة {currentSurahName}
            </Text>
            <Ionicons name="chevron-down" size={13} color={colors.textSecondary} />
          </View>
          <Text style={[styles.navPageSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            صفحة {toArabicDigits(activePageNumber ?? 1)} · الجزء {toArabicDigits(page?.juzNumber ?? 1)}
          </Text>
        </Pressable>

        <View style={styles.navLeftActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="دليل أحكام التجويد"
            onPress={() => {
              setTajweedExampleSeed(Math.random());
              setTajweedGuideOpen(true);
            }}
            style={({ pressed }) => [
              styles.navIconBtn,
              { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name="color-palette-outline" size={18} color={colors.text} />
          </Pressable>

          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الإعدادات"
              style={({ pressed }) =>
                StyleSheet.flatten([
                  styles.navIconBtn,
                  { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                  pressed && { opacity: 0.75 },
                ])
              }
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
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
        <SwipePageViewer
          currentPage={pageQuery.data}
          prevPage={prevPageQuery.data ?? null}
          nextPage={nextPageQuery.data ?? null}
          fontSize={MUSHAF_FONT_SIZE}
          markerScale={displayPreferencesQuery.data?.markerScale ?? 1.1}
          showTajweed={showTajweed}
          isDark={false}
          highlights={highlights}
          hiddenAyahIds={tasmi3HiddenAyahIds}
          selectedElementIds={selectedElementIds}
          activeAyahId={activeAyahId}
          activeWordId={activeWordId}
          recitationFocus={isReciting}
          onWordPress={onWordPress}
          onAyahPress={onAyahPress}
          onBackgroundPress={handleBackgroundPress}
          onPageTurn={handlePageTurn}
          onInteractionError={setInteractionError}
          loadingColor={colors.primary}
        />
      ) : null}

      {!recitationQueue && !tasmi3Session && (
        <Animated.View
          {...recitationFabResponder.panHandlers}
          style={[
            styles.recitationFab,
            {
              backgroundColor: colors.primary,
              borderColor: colors.surface,
              bottom: insets.bottom + 24,
              transform: recitationFabPan.getTranslateTransform(),
            },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="فتح مشغل التلاوة"
            onPress={() => setScopeDialogOpen(true)}
            style={({ pressed }) => [styles.recitationFabButton, pressed && styles.recitationFabPressed]}>
            <Ionicons name="musical-notes" size={22} color={colors.background} />
          </Pressable>
        </Animated.View>
      )}

      {recitationQueue && (
        <RecitationPlayer
          label={recitationQueue.label}
          offsetBottom={insets.bottom + RECITATION_PLAYER_BOTTOM_GAP}
          colors={colors}
          status={{
            playing: recitationStatus.playing,
            isBuffering: recitationStatus.isBuffering,
            currentIndex: recitationStatus.currentIndex,
            trackCount: recitationStatus.trackCount,
            currentTime: recitationStatus.currentTime,
            duration: recitationStatus.duration,
          }}
          repeatMode={repeatMode}
          onCycleRepeat={() =>
            setRepeatMode((mode) =>
              mode === 'none' ? 'all' : mode === 'all' ? 'single' : 'none',
            )
          }
          playbackRate={playbackRate}
          onCycleRate={() => setPlaybackRate((rate) => nextPlaybackRate(rate))}
          onTogglePlay={() =>
            recitationStatus.playing ? recitationPlaylist.pause() : recitationPlaylist.play()
          }
          onNext={() => recitationPlaylist.next()}
          onPrevious={() => recitationPlaylist.previous()}
          onClose={closeRecitation}
          onOpenPicker={() => setScopeDialogOpen(true)}
          onOpenReciterPicker={() => setReciterPickerOpen(true)}
          reciters={recitersQuery.data ?? []}
          reciterId={reciterId}
          onSelectReciter={selectReciter}
          hidden={playerHidden}
        />
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
      {dailyPlanQuery.error && dailyPlanQuery.data === undefined && (
        <Text accessibilityRole="alert" style={styles.error}>
          {dailyPlanQuery.error instanceof Error
            ? `تعذر تحميل خطة القراءة اليومية: ${dailyPlanQuery.error.message}`
            : 'تعذر تحميل خطة القراءة اليومية.'}
        </Text>
      )}

      {!isPlayingAudio && (
        <SelectionToolbar
          surahName={currentSurahName}
          anchorRect={selectionAnchor}
          navbarHeight={navbarHeight}
          buttonSize={displayPreferencesQuery.data?.toolbarSize ?? 40}
          buttonShape={displayPreferencesQuery.data?.toolbarShape ?? DEFAULT_READER_TOOLBAR_SHAPE}
          isBookmarked={isBookmarked}
          isWordSaved={isWordSaved}
          isDailyReadingReady={dailyPlanQuery.data !== undefined}
          isDailyReadingComplete={isDailyReadingComplete}
          isAudioPlaying={isPlayingAudio}
          onHighlightsChanged={() => setHighlightRevision((revision) => revision + 1)}
          onToggleBookmark={toggleBookmark}
          onToggleSaveWord={toggleSaveWord}
          onToggleDailyReading={toggleDailyReading}
          onPlayAudio={playSelection}
          onStopAudio={stopAudio}
          onOpenPlayMenu={openPlayMenu}
          onOpenAyah={openAyah}
        />
      )}

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

      <TajweedGuideDialog
        visible={tajweedGuideOpen}
        page={page}
        colors={colors}
        showTajweed={showTajweed}
        canToggleTajweed={Boolean(displayPreferencesQuery.data)}
        exampleSeed={tajweedExampleSeed}
        onToggleTajweed={toggleTajweed}
        onRandomize={() => setTajweedExampleSeed(Math.random())}
        onClose={() => setTajweedGuideOpen(false)}
      />

      {scopeDialogOpen && (
        <RecitationScopeDialog
           key={reciterId}
          visible
          colors={colors}
          reciters={recitersQuery.data ?? []}
          reciterId={reciterId}
          surahs={directory?.surahs}
          currentSurahNumber={selection?.surahNumber ?? page?.surahs[0]?.surahNumber ?? 1}
          currentJuzNumber={page?.juzNumber ?? 1}
          currentPageNumber={activePageNumber ?? 1}
          currentAyahNumber={currentAyahNumber}
          busy={recitationBusy}
          error={recitationError}
          onSelectReciter={selectReciter}
          onConfirm={(scope) => void startRecitation(scope)}
          onTasmi3={startTasmi3}
          chapterOnly={isFullSurahReciter(reciterId)}
          onClose={() => {
            setScopeDialogOpen(false);
            setRecitationError(null);
          }}
        />
      )}

      {playMenuOpen && (
        <RecitationPlayMenu
          visible
          colors={colors}
          surahName={playMenuSurahName}
          ayahNumber={playMenuAyahNumber}
          busy={recitationBusy}
          error={recitationError}
          onChoose={handlePlayScope}
          onClose={() => {
            setPlayMenuOpen(false);
            setRecitationError(null);
          }}
        />
      )}

      {reciterPickerOpen && (
        <ReciterPickerDialog
          visible
          colors={colors}
          reciters={recitersQuery.data ?? []}
          reciterId={reciterId}
          onSelect={selectReciter}
          onClose={() => setReciterPickerOpen(false)}
        />
      )}
      {tasmi3Session && (
        <Tasmi3Panel
          visible
          scope={tasmi3Session}
          onHide={() => setTasmi3Revealed(false)}
          onReveal={() => setTasmi3Revealed(true)}
          onExit={() => {
            setTasmi3Session(null);
            setTasmi3Revealed(false);
          }}
        />
      )}
    </View>
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

/** Page number of an ayah among the pages already loaded, or null if absent. */
function findAyahPage(
  pages: (MushafPage | undefined)[],
  surahNumber: number,
  ayahNumber: number,
): number | null {
  for (const entry of pages) {
    if (
      entry?.ayahs.some(
        (ayah) => ayah.surahNumber === surahNumber && ayah.ayahNumber === ayahNumber,
      )
    ) {
      return entry.pageNumber;
    }
  }
  return null;
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
  navActionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  navActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navCenterInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  navTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  navSurahTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  navPageSubtitle: {
    fontSize: 11,
    marginTop: 1,
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
  recitationFab: {
    position: 'absolute',
    left: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 30,
  },
  recitationFabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recitationFabPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.95 }],
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
