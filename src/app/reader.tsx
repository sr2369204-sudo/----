/* eslint-disable react-hooks/immutability -- expo-audio exposes `loop` and
   `playbackRate` on AudioPlayer/AudioPlaylist only as mutable properties. */
import { Link, useLocalSearchParams } from 'expo-router';
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

import { Colors, Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Highlight, SavedWord } from '@/features/annotations/types';
import {
  ContentUnavailableError,
  quranContentProvider,
  type RecitationTrack,
} from '@/features/quran/services/content-provider';
import type { MushafPage, QuranSurahDirectory } from '@/features/quran/types';
import type { ElementRect } from '@/features/reader/components/MushafPageViewer';
import {
  RecitationPlayer,
  RecitationScopeDialog,
  nextPlaybackRate,
  type RepeatMode,
} from '@/features/reader/components/RecitationPlayer';
import { SwipePageViewer } from '@/features/reader/components/SwipePageViewer';
import { SelectionToolbar } from '@/features/reader/components/SelectionToolbar';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';
import {
  buildRecitationQueue,
  type RecitationQueue,
  type RecitationScope,
} from '@/features/reader/services/recitation-queue';
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
type BookmarkedAyah = { surahNumber: number; ayahNumber: number };
const PAGE_QUERY_RETRY_COUNT = 2;
/** Gap between the floating recitation player and the bottom safe area. */
const RECITATION_PLAYER_BOTTOM_GAP = 10;

export default function ReaderScreen() {
  const params = useLocalSearchParams<{
    surahNumber?: string | string[];
    pageNumber?: string | string[];
  }>();
  const rawSurahNumber = firstParam(params.surahNumber);
  const rawPageNumber = firstParam(params.pageNumber);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const recitationPlaylist = useAudioPlaylist({ loop: 'none' });
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
  const [selectionAnchor, setSelectionAnchor] = useState<ElementRect | null>(null);
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
  const [navVisible, setNavVisible] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [navAnimation] = useState(() => new Animated.Value(0));
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [playbackRate, setPlaybackRate] = useState(1);
  // True when the floating player was started from a word/ayah selection, so
  // it is dismissed together with the selection exactly like the navbar. A
  // recitation started from the navbar scope dialog keeps playing instead.
  const [selectionBoundPlayer, setSelectionBoundPlayer] = useState(false);

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
    queryKey: ['quran', 'reader-start', rawSurahNumber ?? '', rawPageNumber ?? ''],
    queryFn: async () => {
      if (rawPageNumber !== undefined) {
        const requestedPage = parseArabicNumber(rawPageNumber);
        if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 604) {
          throw new ContentUnavailableError('invalid-data', 'Invalid Mushaf page route parameter.');
        }
        return requestedPage;
      }
      // An explicit surah always wins, Al-Fatiha included. Resuming the saved
      // position is the request that carries no route parameter at all, so the
      // two cases can no longer collapse into the same value.
      if (rawSurahNumber !== undefined) {
        const requestedSurah = parseArabicNumber(rawSurahNumber);
        if (!Number.isInteger(requestedSurah) || requestedSurah < 1 || requestedSurah > 114) {
          throw new ContentUnavailableError('invalid-data', 'Invalid surah route parameter.');
        }
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
      const parsedFontSize = savedFontSize === undefined ? 44 : Number(savedFontSize);
      if (!Number.isInteger(parsedFontSize) || parsedFontSize < 20 || parsedFontSize > 80) {
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
  const fontSize = displayPreferencesQuery.data?.fontSize ?? 44;
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
    queryFn: () => quranContentProvider.getSurahDirectory(),
    staleTime: 24 * 60 * 60 * 1000,
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

  // Focus mode: while the recitation is actually playing, the reader keeps the
  // chrome out of the way and follows the reciting ayah alone.
  const isReciting = recitationStatus.playing;

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
      return quranContentProvider.getPageNumberForAyah(
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
    if (!page) {
      return;
    }
    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    Promise.all(
      page.ayahs.map((ayah) =>
        repository.listBookmarksForAyah(ayah.surahNumber, ayah.ayahNumber),
      ),
    )
      .then((items) => {
        if (active) {
          setBookmarks(
            items.flat().map((bookmark) => ({
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
    Promise.all(
      page.ayahs.map((ayah) =>
        repository.listSavedWordsForAyah(ayah.surahNumber, ayah.ayahNumber),
      ),
    )
      .then((items) => {
        if (active) {
          setSavedWords(items.flat());
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

  const onWordPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    rect: ElementRect,
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
    setSelectionAnchor(rect);
    selectWord(surahNumber, ayah, word, 'compact');
    showNavbar();
  }, [page, player, selectWord, showNavbar]);

  const onAyahPress = useCallback((
    surahNumber: number,
    ayahNumber: number,
    rect: ElementRect,
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
    setSelectionAnchor(rect);

    // A second tap on another ayah of the same surah stretches the selection
    // into a range, so ayah 3 followed by ayah 5 selects 3–5 as one frame.
    const current = useReaderSelectionStore.getState().selection;
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
  }, [page, player, selectAyah, selectAyahRange, showNavbar]);

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
    loadRecitationQueue(queue, null);
  }, [loadRecitationQueue, player, reciterId]);

  const playSelection = useCallback(async (currentSelection: ReaderSelection) => {
    if (currentSelection.type === 'range') {
      // A run of ayahs is a playlist, not a single file: it is loaded into the
      // recitation player so it can be browsed, repeated and sped up.
      setSelectionBoundPlayer(true);
      await runRecitation({
        type: 'ayahRange',
        surahNumber: currentSelection.surahNumber,
        fromAyah: currentSelection.startAyah,
        toAyah: currentSelection.endAyah,
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
    player.replace({ uri: audioUrl });
    player.play();
  }, [database, player, recitationPlaylist, reciterId, runRecitation]);

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
    quranContentProvider
      .getPageNumberForAyah(surahNumber, ayahNumber)
      .then((destination) => navigateToPage(destination))
      .catch((error: unknown) => {
        setInteractionError(
          error instanceof Error
            ? `تعذر الانتقال إلى الآية: ${error.message}`
            : 'تعذر الانتقال إلى الآية.',
        );
      });
  }, [navigateToPage]);

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
      // A recitation picked from the navbar is not tied to a selection, so it
      // keeps its player after the selection is dismissed.
      setSelectionBoundPlayer(false);
      await runRecitation(scope);
      setScopeDialogOpen(false);
    } catch (error) {
      setRecitationError(
        error instanceof Error ? `تعذر تشغيل التلاوة: ${error.message}` : 'تعذر تشغيل التلاوة.',
      );
    } finally {
      setRecitationBusy(false);
    }
  }, [runRecitation]);

  const closeRecitation = useCallback(() => {
    recitationPlaylist.pause();
    recitationPlaylist.clear();
    setRecitationQueue(null);
    setRecitationError(null);
    setSelectionBoundPlayer(false);
  }, [recitationPlaylist]);

  // Reported by the page itself when a tap misses every word and ayah. The
  // tools opened from the page are dismissed here; because the report comes
  // from inside the page, a tap on another ayah is never read as a dismissal
  // and can still stretch the selection into a range.
  const handleBackgroundPress = useCallback(() => {
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

  useEffect(() => {
    if ((!selection || isReciting) && navVisible) {
      // Avoid calling setState synchronously during render/effect to satisfy
      // strict lint rules, especially since hideNavbar starts an animation.
      const task = requestAnimationFrame(() => {
        hideNavbar();
      });
      return () => cancelAnimationFrame(task);
    }
  }, [selection, isReciting, navVisible, hideNavbar]);

  useEffect(() => {
    // The player opened from the word/ayah tools belongs to the selection, so
    // clearing the selection takes it away with the ring and the navbar.
    if (selection || !selectionBoundPlayer || !recitationQueue) {
      return;
    }
    const task = requestAnimationFrame(() => {
      closeRecitation();
    });
    return () => cancelAnimationFrame(task);
  }, [closeRecitation, recitationQueue, selection, selectionBoundPlayer]);

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
            style={({ pressed }) => [
              styles.navActionBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
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
            accessibilityLabel="تشغيل التلاوة"
            onPress={() => setScopeDialogOpen(true)}
            style={({ pressed }) => [
              styles.navIconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Ionicons name="headset-outline" size={18} color={colors.text} />
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
            <Ionicons name="list-outline" size={18} color={colors.text} />
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
          fontSize={fontSize}
          showTajweed={showTajweed}
          isDark={colors.background === Colors.dark.background}
          highlights={highlights}
          selectedElementIds={selectedElementIds}
          activeAyahId={activeAyahId}
          recitationFocus={isReciting}
          onWordPress={onWordPress}
          onAyahPress={onAyahPress}
          onBackgroundPress={handleBackgroundPress}
          onPageTurn={handlePageTurn}
          onInteractionError={setInteractionError}
          loadingColor={colors.primary}
        />
      ) : null}

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
          reciters={recitersQuery.data ?? []}
          reciterId={reciterId}
          onSelectReciter={selectReciter}
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

      {!isReciting && (
        <SelectionToolbar
          surahName={currentSurahName}
          anchorRect={selectionAnchor}
          navbarHeight={navbarHeight}
          isBookmarked={isBookmarked}
          isWordSaved={isWordSaved}
          isAudioPlaying={playerStatus.playing}
          onHighlightsChanged={() => setHighlightRevision((revision) => revision + 1)}
          onToggleBookmark={toggleBookmark}
          onToggleSaveWord={toggleSaveWord}
          onPlayAudio={playSelection}
          onStopAudio={stopAudio}
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

      {scopeDialogOpen && (
        <RecitationScopeDialog
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
          onClose={() => {
            setScopeDialogOpen(false);
            setRecitationError(null);
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
