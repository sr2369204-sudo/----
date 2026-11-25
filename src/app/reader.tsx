/* eslint-disable react-hooks/immutability -- expo-audio exposes `loop` and
   `playbackRate` on AudioPlayer/AudioPlaylist only as mutable properties. */
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toDateKey } from '@/features/memorization/services/review-schedule';
import { recordKhatmaPage } from '@/features/khatma/services/khatma';
import { recordPageRead } from '@/features/reader/services/reading-history';
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
import type { ElementRect, TopicBand } from '@/features/reader/components/MushafPageViewer';
import {
  RecitationPlayMenu,
  RecitationPlayer,
  RecitationScopeDialog,
  ReciterPickerDialog,
  nextPlaybackRate,
  sortRecitersForDisplay,
  type PlayScopeChoice,
  type RepeatMode,
} from '@/features/reader/components/RecitationPlayer';
import { SwipePageViewer } from '@/features/reader/components/SwipePageViewer';
import { SelectionToolbar } from '@/features/reader/components/SelectionToolbar';
import { Tasmi3Panel } from '@/features/reader/components/Tasmi3Panel';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';
import {
  buildRecitationQueue,
  getAvailableAyahRepeatCounts,
  resolveAyahRepeatCount,
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
import {
  getSectionContainingAyah,
  getTopicSections,
} from '@/features/surah-topics/services/surah-topics';
import { SurahTopicsSheet } from '@/features/surah-topics/components/SurahTopicsSheet';
import type { TopicSection } from '@/features/surah-topics/types';
import { useIsNightTheme, useTheme, useThemeName } from '@/hooks/use-theme';

type NavigationMode = 'page' | 'surah' | 'juz';
type BookmarkedAyah = { surahNumber: number; ayahNumber: number };
const PAGE_QUERY_RETRY_COUNT = 2;
/** The page text is fitted to its column, so the reader always uses one natural size. */
const MUSHAF_FONT_SIZE = 44;
/** Gap between the floating recitation player and the bottom safe area. */
const RECITATION_PLAYER_BOTTOM_GAP = 10;
/**
 * Fills for the thematic-section bands, cycled in order so two neighbouring
 * sections on the same page never share a colour. Translucent, so the words
 * under a band stay as legible as they are without it.
 */
const TOPIC_BAND_COLORS = [
  'rgba(214, 158, 46, 0.34)',
  'rgba(76, 155, 104, 0.32)',
  'rgba(74, 132, 196, 0.30)',
  'rgba(186, 104, 148, 0.30)',
  'rgba(138, 112, 196, 0.30)',
  'rgba(206, 122, 72, 0.32)',
  'rgba(60, 168, 166, 0.30)',
  'rgba(160, 140, 70, 0.32)',
];
/** Stable empty list so the viewer never re-renders on a fresh array. */
const EMPTY_TOPIC_BANDS: TopicBand[] = [];

/**
 * The palette slot of a section: its ordinal among its surah's sections. Tying
 * the colour to the section itself — rather than to its order on the page —
 * keeps a section that runs over a page break the same colour on every page.
 */
function topicSectionColorIndex(section: TopicSection): number {
  const ordinal = getTopicSections(section.surahNumber).findIndex(
    (candidate) => candidate.id === section.id,
  );
  return (ordinal < 0 ? 0 : ordinal) % TOPIC_BAND_COLORS.length;
}

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
  // The Mushaf page goes fully dark (black page, light text) only in the night
  // appearance; the regular dark appearance keeps it on the light parchment.
  const isNightTheme = useIsNightTheme();
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
  const [topicsOpen, setTopicsOpen] = useState(false);
  // True while the thematic-section overlay is on: every section on the current
  // page is tinted in its own colour so the reader sees the grouping at a
  // glance. Kept apart from the sheet, so the bands stay on after the list is
  // closed and the reader can study the page without any chrome.
  const [topicOverlayOn, setTopicOverlayOn] = useState(false);
  // The thematic section the reader chose: jumped to and highlighted once its
  // page is the one actually on screen. A ref, not state, so applying the jump
  // never adds a second render pass.
  const pendingTopicSection = useRef<{ section: TopicSection; pageNumber: number } | null>(null);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('surah');
  const [navigationValue, setNavigationValue] = useState('');
  const [navigationBusy, setNavigationBusy] = useState(false);
  const audioRequest = useRef(0);
  const [navVisible, setNavVisible] = useState(false);
  const [reciterPickerOpen, setReciterPickerOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [navAnimation] = useState(() => new Animated.Value(0));
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [ayahRepeatCount, setAyahRepeatCount] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  // Stops the recitation after this many minutes (null = off), for listening before sleep.
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
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
  // Mirrors `navVisible` so the page's background-tap callback can read the
  // current state without depending on render state.
  const navVisibleRef = useRef(false);

  // The navbar and the floating recitation button are one piece of chrome: a
  // single tap anywhere on the page brings both up, so the reader never has to
  // aim at a specific control to reach the recitation settings.
  const showNavbar = useCallback(() => {
    navVisibleRef.current = true;
    setNavVisible(true);
    Animated.timing(navAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [navAnimation]);

  const hideNavbar = useCallback(() => {
    navVisibleRef.current = false;
    setNavVisible(false);
    Animated.timing(navAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [navAnimation]);

  // A tap toggles the chrome: the first one brings the navbar and the recitation
  // button up, the next puts them — and any word/ayah tools — away again.
  const toggleChrome = useCallback(() => {
    if (navVisibleRef.current) {
      useReaderSelectionStore.getState().clearSelection();
      hideNavbar();
      return;
    }
    showNavbar();
  }, [hideNavbar, showNavbar]);

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
      // A damaged saved position must never block reading: start at page 1.
      if (!Number.isInteger(savedPage) || savedPage < 1 || savedPage > 604) {
        return 1;
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
      const rawToolbarSize = Number(preferences.get('reader.toolbarSize') ?? 44);
      const savedToolbarShape = preferences.get('reader.toolbarShape') ?? DEFAULT_READER_TOOLBAR_SHAPE;
      const rawMarkerScale = Number(preferences.get('reader.markerScale') ?? 1.1);
      // Any saved value that is damaged or out of range quietly falls back to
      // its default instead of putting an error on the reader.
      const savedToolbarSize =
        Number.isInteger(rawToolbarSize) && rawToolbarSize >= 32 && rawToolbarSize <= 56 ? rawToolbarSize : 44;
      const savedMarkerScale =
        Number.isFinite(rawMarkerScale) && rawMarkerScale >= 0.8 && rawMarkerScale <= 1.8 ? rawMarkerScale : 1.1;
      const toolbarShape = isReaderToolbarShape(savedToolbarShape)
        ? savedToolbarShape
        : DEFAULT_READER_TOOLBAR_SHAPE;
      return {
        showTajweed: savedTajweed === 'false' ? false : true,
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

  // The reciters readers look for first lead every list; the rest keep source order.
  const reciters = useMemo(
    () => sortRecitersForDisplay(recitersQuery.data ?? []),
    [recitersQuery.data],
  );

  const page = pageQuery.data?.page;

  // The ayah the reciter is on right now. It drives the frame drawn around the
  // ayah on the page as well as the automatic page turn that keeps the reader
  // in step with the recitation.
  const activeTrack = recitationQueue?.tracks[
    Math.floor(recitationStatus.currentIndex / ayahRepeatCount)
  ] ?? null;
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

  // A page counts as read once it has stayed open for a few seconds, so
  // flipping quickly through pages does not fill the khatma bar.
  const shownPageNumber = page && page.pageNumber === activePageNumber ? page.pageNumber : null;
  useEffect(() => {
    if (shownPageNumber === null) {
      return;
    }
    const timer = setTimeout(() => {
      const today = toDateKey(new Date());
      // A running khatma counts the same page; it does nothing without one.
      recordKhatmaPage(database, shownPageNumber, today)
        .then(() => queryClient.invalidateQueries({ queryKey: ['khatma'] }))
        .catch((error: unknown) => console.error('تعذر تسجيل صفحة الختمة.', error));
      recordPageRead(database, shownPageNumber, today)
        .then((history) => queryClient.setQueryData(['reading', 'history'], history))
        .catch((error: unknown) => console.error('تعذر تسجيل الصفحة المقروءة.', error));
    }, 8_000);
    return () => clearTimeout(timer);
  }, [database, queryClient, shownPageNumber]);

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

  // Highlights the part of a thematic section that lies on the page in hand:
  // the run is selected so the very ayahs on screen light up.
  const highlightTopicSection = useCallback(
    (section: TopicSection, target: MushafPage) => {
      const sectionAyahs = target.ayahs
        .filter(
          (item) =>
            item.surahNumber === section.surahNumber &&
            item.ayahNumber >= section.startAyah &&
            item.ayahNumber <= section.endAyah,
        )
        .sort((first, second) => first.ayahNumber - second.ayahNumber);
      if (sectionAyahs.length > 0) {
        selectAyahRange(section.surahNumber, sectionAyahs, 'compact');
      }
    },
    [selectAyahRange],
  );

  // Applies the section the reader picked once its page is on screen: the part
  // of the section that falls on that page is selected as a run, which is what
  // lights it up. The page is matched by number so the run is never built from
  // ayahs the reader is not actually looking at.
  useEffect(() => {
    const pending = pendingTopicSection.current;
    if (!pending || !page) {
      return;
    }
    if (page.pageNumber !== pending.pageNumber || page.pageNumber !== activePageNumber) {
      return;
    }
    highlightTopicSection(pending.section, page);
    pendingTopicSection.current = null;
  }, [activePageNumber, highlightTopicSection, page]);

  const hasRecitationQueue = recitationQueue !== null;
  useEffect(() => {
    if (sleepTimerMinutes === null || !hasRecitationQueue) {
      return;
    }
    const timer = setTimeout(() => {
      recitationPlaylist.pause();
      player.pause();
      setSleepTimerMinutes(null);
    }, sleepTimerMinutes * 60_000);
    return () => clearTimeout(timer);
  }, [sleepTimerMinutes, hasRecitationQueue, player, recitationPlaylist]);

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
    player.loop = false;
  }, [player, recitationPlaylist, repeatMode]);

  useEffect(() => {
    recitationPlaylist.playbackRate = playbackRate;
    player.setPlaybackRate(playbackRate);
  }, [playbackRate, player, recitationPlaylist]);

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
        // A lone tap that does not extend an existing ayah selection toggles
        // the chrome: picking a verse stays on the long press.
        toggleChrome();
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
  }, [page, player, recitationQueue, rememberReadingPosition, selectAyah, selectAyahRange, showNavbar, toggleChrome]);

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
      // Same as the ayah head: a single tap toggles the chrome, while the long
      // press picks the word itself.
      toggleChrome();
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
    toggleChrome,
  ]);

  /**
   * Swaps the playlist contents for a freshly built queue and starts it. When
   * `resumeTrack` is given playback picks up from that same ayah, which is how
   * a mid-recitation reciter change keeps the reader on the same verse.
   */
  const loadRecitationQueue = useCallback((
    queue: RecitationQueue,
    resumeTrack: RecitationTrack | null,
    requestedRepeatCount = ayahRepeatCount,
    shouldPlay = true,
  ) => {
    const repeatCount = resolveAyahRepeatCount(queue.tracks, requestedRepeatCount);
    if (repeatCount !== ayahRepeatCount) {
      setAyahRepeatCount(repeatCount);
    }
    recitationPlaylist.pause();
    recitationPlaylist.clear();
    for (const track of queue.tracks) {
      for (let repetition = 0; repetition < repeatCount; repetition += 1) {
        // The playlist bridge expects a source object; a bare URL string reaches
        // the native side as a raw value and is rejected.
        recitationPlaylist.add({ uri: track.url });
      }
    }
    recitationPlaylist.loop = repeatMode;
    recitationPlaylist.playbackRate = playbackRate;
    setRecitationQueue(queue);
    // A fresh queue always brings the floating player back into view, even if
    // the reader had tucked the previous one away.
    setPlayerHidden(false);
    const resumeTrackIndex = resumeTrack
      ? queue.tracks.findIndex(
          (track) =>
            track.surahNumber === resumeTrack.surahNumber &&
            track.ayahNumber === resumeTrack.ayahNumber,
        )
      : -1;
    if (resumeTrackIndex >= 0) {
      recitationPlaylist.skipTo(resumeTrackIndex * repeatCount);
    }
    if (shouldPlay) {
      recitationPlaylist.play();
    }
  }, [ayahRepeatCount, playbackRate, recitationPlaylist, repeatMode]);

  const cycleAyahRepeatCount = useCallback(() => {
    if (
      !recitationQueue ||
      recitationQueue.tracks.some((track) => track.ayahNumber <= 0)
    ) {
      return;
    }
    const repeatOptions = getAvailableAyahRepeatCounts(recitationQueue.tracks.length);
    if (repeatOptions.length < 2) {
      return;
    }
    const currentOptionIndex = repeatOptions.indexOf(ayahRepeatCount);
    const nextRepeatCount = repeatOptions[(currentOptionIndex + 1) % repeatOptions.length];
    const currentTrackIndex = Math.floor(recitationStatus.currentIndex / ayahRepeatCount);
    const currentTrack = recitationQueue.tracks[currentTrackIndex] ?? null;
    setAyahRepeatCount(nextRepeatCount);
    loadRecitationQueue(
      recitationQueue,
      currentTrack,
      nextRepeatCount,
      recitationStatus.playing || recitationStatus.isBuffering,
    );
  }, [
    ayahRepeatCount,
    loadRecitationQueue,
    recitationQueue,
    recitationStatus.currentIndex,
    recitationStatus.isBuffering,
    recitationStatus.playing,
  ]);

  const skipRecitationAyah = useCallback((step: -1 | 1) => {
    if (!recitationQueue || recitationQueue.tracks.length === 0) {
      return;
    }
    const currentTrackIndex = Math.floor(recitationStatus.currentIndex / ayahRepeatCount);
    let nextTrackIndex = currentTrackIndex + step;
    if (nextTrackIndex < 0 || nextTrackIndex >= recitationQueue.tracks.length) {
      if (repeatMode !== 'all') {
        return;
      }
      nextTrackIndex = (nextTrackIndex + recitationQueue.tracks.length) % recitationQueue.tracks.length;
    }
    recitationPlaylist.skipTo(nextTrackIndex * ayahRepeatCount);
  }, [
    ayahRepeatCount,
    recitationPlaylist,
    recitationQueue,
    recitationStatus.currentIndex,
    repeatMode,
  ]);

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
    // Memorisation mode hides its ayahs, so the chrome goes away with them.
    hideNavbar();
  }, [hideNavbar, player, recitationPlaylist, selection]);

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
    hideNavbar();
    audioRequest.current += 1;
    player.pause();
  }, [hideNavbar, player]);

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

  // The layers button: opens the section list and turns the thematic overlay on
  // at the same time, so the very ayahs on the page are tinted — one colour per
  // section — the moment the button is pressed. The colours are turned off by
  // the dismiss chip that floats over the page (see `styles.topicDismiss`).
  const openTopics = useCallback(() => {
    setTopicsOpen(true);
    setTopicOverlayOn(true);
  }, []);

  // Opens a documented thematic section: the reader is sent to the page that
  // holds the section's first ayah, and the run is highlighted — right away if
  // that page is already on screen, otherwise once it renders (see the pending
  // section effect above). The overlay stays on, so the section shows on the
  // page after the jump.
  const openTopicSection = useCallback(
    (section: TopicSection) => {
      setTopicsOpen(false);
      quranCache
        .getPageNumberForAyah(section.surahNumber, section.startAyah)
        .then((destination) => {
          if (page && page.pageNumber === destination) {
            highlightTopicSection(section, page);
            return;
          }
          pendingTopicSection.current = { section, pageNumber: destination };
          navigateToPage(destination);
        })
        .catch((error: unknown) => {
          setInteractionError(
            error instanceof Error
              ? `تعذر الانتقال إلى المقطع: ${error.message}`
              : 'تعذر الانتقال إلى المقطع.',
          );
        });
    },
    [highlightTopicSection, navigateToPage, page, quranCache],
  );

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
    const resumeTrack =
      recitationQueue.tracks[Math.floor(recitationStatus.currentIndex / ayahRepeatCount)] ?? null;
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
    ayahRepeatCount,
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
  // Otherwise it toggles the chrome. Because the report comes from inside the
  // page, a tap on another ayah is never read as a dismissal and can still
  // stretch the selection into a range.
  const handleBackgroundPress = useCallback(() => {
    if (!useReaderSelectionStore.getState().selection && recitationQueue) {
      setPlayerHidden((hidden) => !hidden);
      return;
    }
    toggleChrome();
  }, [recitationQueue, toggleChrome]);

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

  // The thematic sections that fall on the page in hand, each with its own
  // colour, so pressing the layers button tints the very ayahs on screen and
  // the reader can see at a glance which ayahs belong together. Only the part
  // of a section printed on this page is banded; the rest shows on its page.
  const topicBands = useMemo<TopicBand[]>(() => {
    if (!topicOverlayOn || !page) {
      return EMPTY_TOPIC_BANDS;
    }
    const grouped = new Map<string, { section: TopicSection; ayahIds: string[] }>();
    for (const ayah of page.ayahs) {
      const section = getSectionContainingAyah(ayah.surahNumber, ayah.ayahNumber);
      if (!section) {
        continue;
      }
      const ayahId = `ayah-${ayah.surahNumber}-${ayah.ayahNumber}`;
      const existing = grouped.get(section.id);
      if (existing) {
        existing.ayahIds.push(ayahId);
      } else {
        grouped.set(section.id, { section, ayahIds: [ayahId] });
      }
    }
    return [...grouped.values()].map(({ section, ayahIds }) => ({
      id: section.id,
      color: TOPIC_BAND_COLORS[topicSectionColorIndex(section)],
      ayahIds,
    }));
  }, [page, topicOverlayOn]);

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
    // Playback takes the page over: the chrome slides away on its own so the
    // reciting ayah and the floating player stand alone. Everything else is
    // driven by the tap handlers, which now toggle the chrome directly.
    if (isPlayingAudio && navVisible) {
      // Avoid calling setState synchronously during render/effect to satisfy
      // strict lint rules, especially since hideNavbar starts an animation.
      const task = requestAnimationFrame(() => {
        hideNavbar();
      });
      return () => cancelAnimationFrame(task);
    }
  }, [isPlayingAudio, navVisible, hideNavbar]);

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
      {/* The navbar and the floating recitation button share one visibility
          state: the first tap anywhere on the page brings both up. */}
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
            accessibilityLabel="التفصيل الموضوعي للسورة"
            onPress={openTopics}
            style={({ pressed }) => [
              styles.navIconBtn,
              styles.navTopicsBtn,
              { backgroundColor: colors.primary, borderColor: colors.primaryDark },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="layers-outline" size={18} color={colors.onPrimary} />
          </Pressable>

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
          isDark={isNightTheme}
          highlights={highlights}
          hiddenAyahIds={tasmi3HiddenAyahIds}
          selectedElementIds={selectedElementIds}
          topicBands={topicBands}
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

      {/* Turns the thematic-section colours back off. It floats over the page —
          it is not tied to the navbar, which hides on a tap — so the reader can
          always clear the bands and get back to a plain page. */}
      {topicOverlayOn && !recitationQueue && !tasmi3Session && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إخفاء ألوان التفصيل الموضوعي"
          onPress={() => setTopicOverlayOn(false)}
          style={({ pressed }) => [
            styles.topicDismiss,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              bottom: insets.bottom + 24,
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="close-circle" size={18} color={colors.primary} />
          <Text style={[styles.topicDismissText, { color: colors.primary }]}>
            إخفاء ألوان التفصيل
          </Text>
        </Pressable>
      )}

      {navVisible && !recitationQueue && !tasmi3Session && (
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
          tracks={recitationQueue.tracks}
          ayahRepeatCount={ayahRepeatCount}
          repeatMode={repeatMode}
          onCycleRepeat={() =>
            setRepeatMode((mode) => (mode === 'none' ? 'all' : 'none'))
          }
          onCycleAyahRepeat={cycleAyahRepeatCount}
          playbackRate={playbackRate}
          onCycleRate={() => setPlaybackRate((rate) => nextPlaybackRate(rate))}
          sleepTimerMinutes={sleepTimerMinutes}
          onCycleSleepTimer={() => setSleepTimerMinutes((minutes) => nextSleepTimer(minutes))}
          onTogglePlay={() =>
            recitationStatus.playing ? recitationPlaylist.pause() : recitationPlaylist.play()
          }
          onSeek={(seconds) => void recitationPlaylist.seekTo(seconds)}
          onNext={() => skipRecitationAyah(1)}
          onPrevious={() => skipRecitationAyah(-1)}
          onClose={closeRecitation}
          onOpenPicker={() => setScopeDialogOpen(true)}
          onOpenReciterPicker={() => setReciterPickerOpen(true)}
          reciters={reciters}
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

      <SurahTopicsSheet
        visible={topicsOpen}
        surahNumber={selection?.surahNumber ?? page?.surahs[0]?.surahNumber ?? null}
        surahName={currentSurahName}
        onSelectSection={openTopicSection}
        onClose={() => setTopicsOpen(false)}
      />

      {scopeDialogOpen && (
        <RecitationScopeDialog
           key={reciterId}
          visible
          colors={colors}
          reciters={reciters}
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
          reciters={reciters}
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
  const sheet = GOTO_SHEETS[useThemeName()];
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
        <View style={[styles.navigationDialog, { backgroundColor: sheet.panel, borderColor: sheet.gold }]}>
          <View style={styles.navigationHeader}>
            <View style={styles.navigationTitleRow}>
              <View style={styles.navigationTitleGroup}>
                <View style={[styles.navigationTitleIcon, { backgroundColor: `${sheet.gold}26` }]}>
                  <Ionicons name="navigate-outline" size={15} color={sheet.gold} />
                </View>
                <Text style={[styles.navigationTitle, { color: sheet.cream }]}>انتقال إلى</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إغلاق التنقل"
                onPress={onClose}
                style={[styles.navigationClose, { backgroundColor: sheet.panelLight }]}>
                <Ionicons name="close" size={17} color={sheet.cream} />
              </Pressable>
            </View>
            <View style={styles.navigationOrnament}>
              <View style={[styles.ornamentLine, { backgroundColor: sheet.gold }]} />
              <View style={[styles.ornamentDiamond, { backgroundColor: sheet.gold }]} />
              <View style={[styles.ornamentLine, { backgroundColor: sheet.gold }]} />
            </View>
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
                    backgroundColor: mode === option.key ? sheet.gold : 'transparent',
                    borderColor: sheet.gold,
                  },
                ]}>
                <Text style={[styles.navigationModeLabel, { color: mode === option.key ? sheet.onGold : sheet.cream }]}>
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
                placeholderTextColor={`${sheet.cream}80`}
                style={[styles.pageInput, { color: sheet.cream, borderColor: sheet.gold, backgroundColor: sheet.panelLight }]}
              />
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={onSubmit}
                style={[styles.goButton, { backgroundColor: sheet.gold }]}>
                <Text style={[styles.goButtonText, { color: sheet.onGold }]}>
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
                  style={[styles.destinationItem, { backgroundColor: sheet.panelLight, borderColor: sheet.gold }]}>
                  <Text style={[styles.destinationLabel, { color: sheet.name }]}>الجزء {toArabicNumbers(juz)}</Text>
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
                  style={({ pressed }) => [
                    styles.surahItem,
                    { borderColor: sheet.gold, backgroundColor: sheet.panelLight },
                    pressed && styles.surahItemPressed,
                  ]}>
                  <View style={[styles.surahNumberBadge, { backgroundColor: sheet.gold }]}>
                    <Text style={[styles.surahNumber, { color: sheet.onGold }]}>
                      {toArabicNumbers(surah.surahNumber)}
                    </Text>
                  </View>
                  <View style={styles.surahTextBlock}>
                    <Text style={[styles.surahName, { color: sheet.name }]}>{surah.nameArabic}</Text>
                    <Text style={[styles.surahMeta, { color: `${sheet.cream}B3` }]}>
                      {surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'} · {toArabicNumbers(surah.ayahCount)} {surah.ayahCount >= 3 && surah.ayahCount <= 10 ? 'آيات' : 'آية'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-back" size={15} color={sheet.gold} />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Pressable accessibilityRole="button" onPress={onDirectoryRetry}>
              <Text style={[styles.directoryMessage, { color: sheet.name }]}>
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

const SLEEP_TIMER_STEPS = [15, 30, 60];

function nextSleepTimer(current: number | null): number | null {
  if (current === null) {
    return SLEEP_TIMER_STEPS[0];
  }
  const index = SLEEP_TIMER_STEPS.indexOf(current);
  return index < 0 || index === SLEEP_TIMER_STEPS.length - 1 ? null : SLEEP_TIMER_STEPS[index + 1];
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
  /** The thematic-detail entry point: a filled chip so it stands out in the bar. */
  navTopicsBtn: {
    shadowColor: '#0E7A57',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
  /** Floating chip that clears the thematic-section colours from the page. */
  topicDismiss: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 31,
  },
  topicDismissText: {
    fontSize: 13,
    fontWeight: '600',
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
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  navigationHeader: {
    gap: 10,
  },
  navigationTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigationTitleGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  navigationTitleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ornamentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  ornamentDiamond: {
    width: 7,
    height: 7,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: '800',
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
    borderWidth: 1.5,
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
    minHeight: 58,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: 8,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  surahTextBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  surahMeta: {
    fontSize: 11,
  },
  surahItemPressed: {
    opacity: 0.6,
  },
  surahNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumber: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  surahName: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  directoryMessage: {
    paddingVertical: Spacing.three,
    fontSize: 14,
    textAlign: 'center',
  },
});

const GOTO_SHEETS = {
  dark: {
    panel: '#0F3B2E',
    panelLight: '#16503E',
    gold: '#D4AF5A',
    cream: '#F4EBD3',
    name: '#D4AF5A',
    onGold: '#0F3B2E',
  },
  light: {
    panel: '#FFFFFF',
    panelLight: '#F7F6F2',
    gold: '#B8923A',
    cream: '#17463A',
    name: '#17463A',
    onGold: '#FFFFFF',
  },
};

function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}
