/* eslint-disable react-hooks/immutability, react-hooks/refs */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { Highlight } from '@/features/annotations/types';
import type { CachedMushafPage } from '@/features/reader/services/mushaf-page-cache';
import { resolvePagePull, resolvePageTurnIntent } from '@/features/reader/services/page-turn';
import {
  MushafPageViewer,
  type ElementRect,
  type PageTurnDirection,
} from './MushafPageViewer';

export type SwipePageViewerProps = {
  currentPage: CachedMushafPage;
  prevPage: CachedMushafPage | null;
  nextPage: CachedMushafPage | null;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  /** Document ids of the selected elements: one word, or a run of ayahs. */
  selectedElementIds: string[] | null;
  /** Document id of the ayah being recited right now, if any. */
  activeAyahId: string | null;
  /** True while a recitation is running: only its frame is drawn. */
  recitationFocus: boolean;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    rect: ElementRect,
  ) => void;
  onAyahPress: (surahNumber: number, ayahNumber: number, rect: ElementRect) => void;
  /** Fired when a tap on the page misses every word and ayah. */
  onBackgroundPress: () => void;
  /**
   * Fired once the strip has finished turning. The page number is the prepared
   * page it turned to, so the host commits exactly what is already on screen
   * instead of guessing from its own still-loading data.
   */
  onPageTurn: (targetPageNumber: number) => void;
  onInteractionError: (message: string) => void;
  /** Tint of the indicator shown until the centred page has finished painting. */
  loadingColor?: string;
};

const SWIPE_DISTANCE_RATIO = 0.18;
const ANIMATION_DURATION_MS = 220;
const CANCEL_DURATION_MS = 180;
/**
 * Upper bound on the number of mounted mushaf pages. The window is always the
 * current page plus its two direct neighbours, so a swipe in either direction
 * always lands on an already prepared page.
 */
const MAX_MOUNTED_PAGES = 3;

export function SwipePageViewer({
  currentPage,
  prevPage,
  nextPage,
  fontSize,
  showTajweed,
  isDark,
  highlights,
  selectedElementIds,
  activeAyahId,
  recitationFocus,
  onWordPress,
  onAyahPress,
  onBackgroundPress,
  onPageTurn,
  onInteractionError,
  loadingColor,
}: SwipePageViewerProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);
  const [readyPages, setReadyPages] = useState<ReadonlySet<number>>(() => new Set<number>());

  const currentPageNumber = currentPage.page.pageNumber;
  const hasPrevNeighbour = prevPage !== null && prevPage.page.pageNumber === currentPageNumber - 1;
  const hasNextNeighbour = nextPage !== null && nextPage.page.pageNumber === currentPageNumber + 1;
  const canGoPrev = hasPrevNeighbour && readyPages.has(currentPageNumber - 1);
  const canGoNext = hasNextNeighbour && readyPages.has(currentPageNumber + 1);

  // Horizontal offset of the whole strip, in pixels. Zero at rest.
  const pull = useSharedValue(0);
  // Page number currently centred in the strip, kept on the UI thread so a
  // committed turn can re-centre the strip in the same frame (no visible jump).
  const rowIndex = useSharedValue(currentPageNumber);
  const isTransitioning = useSharedValue(false);
  const canGoPrevOnUi = useSharedValue(false);
  const canGoNextOnUi = useSharedValue(false);

  useEffect(() => {
    canGoPrevOnUi.value = canGoPrev;
  }, [canGoPrev, canGoPrevOnUi]);
  useEffect(() => {
    canGoNextOnUi.value = canGoNext;
  }, [canGoNext, canGoNextOnUi]);

  const committedPageRef = useRef(currentPageNumber);
  // The page the strip rests on right now, updated the moment a turn is
  // committed and whenever the host moves the reader somewhere else.
  const restingPageRef = useRef(currentPageNumber);
  const onPageTurnRef = useRef(onPageTurn);
  onPageTurnRef.current = onPageTurn;

  const commitTurn = useCallback((pageNumber: number) => {
    restingPageRef.current = pageNumber;
    onPageTurnRef.current(pageNumber);
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width <= 0 || Math.abs(width - containerWidthRef.current) <= 1) {
      return;
    }
    containerWidthRef.current = width;
    setContainerWidth(width);
  }, []);

  const markPageReady = useCallback((pageNumber: number) => {
    setReadyPages((previous) => {
      if (previous.has(pageNumber)) {
        return previous;
      }
      const next = new Set(previous);
      next.add(pageNumber);
      return next;
    });
  }, []);

  const resetPosition = useCallback(() => {
    pull.value = withTiming(0, {
      duration: CANCEL_DURATION_MS,
      easing: Easing.out(Easing.quad),
    });
  }, [pull]);

  const completeSwipe = useCallback(
    (dx: number, vx: number) => {
      if (isTransitioning.value) {
        return;
      }
      const width = containerWidthRef.current;
      if (width <= 0) {
        return;
      }
      if (!Number.isFinite(dx) || !Number.isFinite(vx)) {
        resetPosition();
        return;
      }
      const distanceThreshold = Math.max(50, width * SWIPE_DISTANCE_RATIO);
      const intent = resolvePageTurnIntent(dx, vx, distanceThreshold);

      // The destination is the neighbour that is currently mounted and painted,
      // never a page number computed from data that may still be loading. A
      // swipe can therefore only ever land on a page that is already there.
      const target: { direction: PageTurnDirection; pageNumber: number } | null =
        intent === 'next' && canGoNextOnUi.value && nextPage !== null
          ? { direction: 'next', pageNumber: nextPage.page.pageNumber }
          : intent === 'previous' && canGoPrevOnUi.value && prevPage !== null
            ? { direction: 'previous', pageNumber: prevPage.page.pageNumber }
            : null;

      if (!target) {
        resetPosition();
        return;
      }
      // A repeat of a turn the host has not adopted yet would slide the strip
      // against itself, so the page it already rests on is a hard edge.
      if (target.pageNumber === restingPageRef.current) {
        resetPosition();
        return;
      }

      isTransitioning.value = true;
      pull.value = withTiming(
        target.direction === 'next' ? width : -width,
        { duration: ANIMATION_DURATION_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          'worklet';
          if (!finished) {
            isTransitioning.value = false;
            return;
          }
          // The turn belongs to the strip from the moment the gesture is
          // accepted, so it re-centres on the destination in the same frame the
          // animation ends. The destination is already laid out, and every slot
          // moves by exactly one width, so this is invisible: it only stops the
          // strip from depending on the host confirming the turn in time.
          rowIndex.value = target.pageNumber;
          pull.value = 0;
          isTransitioning.value = false;
          runOnJS(commitTurn)(target.pageNumber);
        },
      );
    },
    [
      canGoNextOnUi,
      canGoPrevOnUi,
      commitTurn,
      isTransitioning,
      nextPage,
      prevPage,
      pull,
      resetPosition,
      rowIndex,
    ],
  );

  // A page the strip did not turn to itself (opening the reader, the page index,
  // a bookmark) is adopted here. Its layout is pinned on the UI thread so the
  // incoming page is already in place on the first visible frame.
  useEffect(() => {
    if (committedPageRef.current === currentPageNumber) {
      return;
    }
    committedPageRef.current = currentPageNumber;
    restingPageRef.current = currentPageNumber;
    runOnUI((target: number) => {
      'worklet';
      cancelAnimation(pull);
      rowIndex.value = target;
      pull.value = 0;
      isTransitioning.value = false;
    })(currentPageNumber);
    // Keep the readiness window bounded to the mounted neighbours.
    setReadyPages((previous) => {
      const window = new Set([currentPageNumber - 1, currentPageNumber, currentPageNumber + 1]);
      const next = new Set<number>();
      for (const pageNumber of previous) {
        if (window.has(pageNumber)) {
          next.add(pageNumber);
        }
      }
      return next.size === previous.size ? previous : next;
    });
  }, [currentPageNumber, isTransitioning, pull, rowIndex]);

  const pages = useMemo(() => {
    const window: CachedMushafPage[] = [];
    if (hasPrevNeighbour && prevPage) {
      window.push(prevPage);
    }
    window.push(currentPage);
    if (hasNextNeighbour && nextPage) {
      window.push(nextPage);
    }
    return window.slice(-MAX_MOUNTED_PAGES);
  }, [currentPage, hasNextNeighbour, hasPrevNeighbour, nextPage, prevPage]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-25, 25])
    .onStart(() => {
      'worklet';
      if (isTransitioning.value) return;
    })
    .onUpdate((event) => {
      'worklet';
      if (isTransitioning.value) return;

      pull.value = resolvePagePull(
        event.translationX,
        canGoNextOnUi.value,
        canGoPrevOnUi.value,
      );
    })
    .onEnd((event) => {
      'worklet';
      if (isTransitioning.value) return;
      runOnJS(completeSwipe)(event.translationX, event.velocityX);
    });

  const handleWebPanStart = useCallback(() => {
    // Reserved for parity with the native gesture; state is handled in onEnd.
  }, []);

  const handleWebPanUpdate = useCallback(
    (dx: number) => {
      if (isTransitioning.value) {
        return;
      }
      pull.value = resolvePagePull(dx, canGoNextOnUi.value, canGoPrevOnUi.value);
    },
    [canGoNextOnUi, canGoPrevOnUi, isTransitioning, pull],
  );

  const handleWebPanEnd = useCallback(
    (dx: number, vx: number) => {
      completeSwipe(dx, vx);
    },
    [completeSwipe],
  );

  const handleWebPanCancel = useCallback(() => {
    if (isTransitioning.value) {
      return;
    }
    resetPosition();
  }, [isTransitioning, resetPosition]);

  const currentPageReady = readyPages.has(currentPageNumber);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.strip}>
          {containerWidth > 0
            ? pages.map((entry) => {
                const pageNumber = entry.page.pageNumber;
                const isCurrent = pageNumber === currentPageNumber;
                return (
                  <PageSlot
                    key={pageNumber}
                    data={entry}
                    width={containerWidth}
                    rowIndex={rowIndex}
                    pull={pull}
                    fontSize={fontSize}
                    showTajweed={showTajweed}
                    isDark={isDark}
                    highlights={isCurrent ? highlights : NO_HIGHLIGHTS}
                    selectedElementIds={isCurrent ? selectedElementIds : null}
                    activeAyahId={isCurrent ? activeAyahId : null}
                    recitationFocus={isCurrent ? recitationFocus : false}
                    isInteractive={isCurrent}
                    onWordPress={onWordPress}
                    onAyahPress={onAyahPress}
                    onBackgroundPress={isCurrent ? onBackgroundPress : undefined}
                    onInteractionError={onInteractionError}
                    onReady={markPageReady}
                    onPanStart={isCurrent ? handleWebPanStart : undefined}
                    onPanUpdate={isCurrent ? handleWebPanUpdate : undefined}
                    onPanEnd={isCurrent ? handleWebPanEnd : undefined}
                    onPanCancel={isCurrent ? handleWebPanCancel : undefined}
                  />
                );
              })
            : null}
        </Animated.View>
      </GestureDetector>
      {containerWidth > 0 && !currentPageReady ? (
        // The strip keeps loading underneath, so the page is already laid out by
        // the time this disappears. Without it an external jump to an unprepared
        // page would leave an empty box on screen.
        <View style={styles.pending} pointerEvents="none">
          <ActivityIndicator color={loadingColor} />
        </View>
      ) : null}
    </View>
  );
}

type PageSlotProps = {
  data: CachedMushafPage;
  width: number;
  rowIndex: SharedValue<number>;
  pull: SharedValue<number>;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  /** Document ids of the selected elements: one word, or a run of ayahs. */
  selectedElementIds: string[] | null;
  /** Document id of the ayah being recited right now, if any. */
  activeAyahId: string | null;
  /** True while a recitation is running: only its frame is drawn. */
  recitationFocus: boolean;
  isInteractive: boolean;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    rect: ElementRect,
  ) => void;
  onAyahPress: (surahNumber: number, ayahNumber: number, rect: ElementRect) => void;
  onBackgroundPress?: () => void;
  onInteractionError: (message: string) => void;
  onReady: (pageNumber: number) => void;
  onPanStart?: (x: number, y: number) => void;
  onPanUpdate?: (dx: number, dy: number) => void;
  onPanEnd?: (dx: number, vx: number) => void;
  onPanCancel?: () => void;
};

/**
 * A single pre-rendered mushaf page. The component is keyed by page number for
 * its whole lifetime, so sliding the strip never reloads a WebView.
 */
const PageSlot = memo(function PageSlot({
  data,
  width,
  rowIndex,
  pull,
  fontSize,
  showTajweed,
  isDark,
  highlights,
  selectedElementIds,
  activeAyahId,
  recitationFocus,
  isInteractive,
  onWordPress,
  onAyahPress,
  onBackgroundPress,
  onInteractionError,
  onReady,
  onPanStart,
  onPanUpdate,
  onPanEnd,
  onPanCancel,
}: PageSlotProps) {
  const pageNumber = data.page.pageNumber;
  const slotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (rowIndex.value - pageNumber) * width + pull.value }],
  }));
  const handleReady = useCallback(() => {
    onReady(pageNumber);
  }, [onReady, pageNumber]);

  return (
    <Animated.View
      style={[styles.slot, { width }, slotStyle]}
      pointerEvents={isInteractive ? 'auto' : 'none'}>
      <MushafPageViewer
        page={data.page}
        fontBase64={data.fontBase64}
        basmalaFontBase64={data.basmalaFontBase64}
        fontSize={fontSize}
        showTajweed={showTajweed}
        isDark={isDark}
        highlights={highlights}
        selectedElementIds={selectedElementIds}
        activeAyahId={activeAyahId}
        recitationFocus={recitationFocus}
        onWordPress={onWordPress}
        onAyahPress={onAyahPress}
        onBackgroundPress={onBackgroundPress}
        onInteractionError={onInteractionError}
        onReady={handleReady}
        onPanStart={onPanStart}
        onPanUpdate={onPanUpdate}
        onPanEnd={onPanEnd}
        onPanCancel={onPanCancel}
      />
    </Animated.View>
  );
});

const NO_HIGHLIGHTS: Highlight[] = [];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  strip: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  slot: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  pending: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
