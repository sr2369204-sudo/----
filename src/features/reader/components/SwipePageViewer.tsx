/* eslint-disable react-hooks/immutability, react-hooks/refs */
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Highlight } from '@/features/annotations/types';
import type { CachedMushafPage } from '@/features/reader/services/mushaf-page-cache';
import {
  MushafPageViewer,
  type PageTurnDirection,
  type SelectionAnchor,
} from './MushafPageViewer';

export type SwipePageViewerProps = {
  currentPage: CachedMushafPage;
  prevPage: CachedMushafPage | null;
  nextPage: CachedMushafPage | null;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  selectedElementId: string | null;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    position: number,
    anchor: SelectionAnchor,
  ) => void;
  onAyahPress: (surahNumber: number, ayahNumber: number, anchor: SelectionAnchor) => void;
  onPageTurn: (direction: PageTurnDirection) => void;
  onInteractionError: (message: string) => void;
};

const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_VELOCITY_THRESHOLD = 200;
const BOUNDARY_RESISTANCE = 0.15;
const ANIMATION_DURATION_MS = 220;
const CANCEL_DURATION_MS = 180;

export function SwipePageViewer({
  currentPage,
  prevPage,
  nextPage,
  fontSize,
  showTajweed,
  isDark,
  highlights,
  selectedElementId,
  onWordPress,
  onAyahPress,
  onPageTurn,
  onInteractionError,
}: SwipePageViewerProps) {
  const windowDimensions = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowDimensions.width || 380);
  const containerWidthRef = useRef(containerWidth);
  containerWidthRef.current = containerWidth;

  const translateX = useSharedValue(0);
  const isTransitioning = useSharedValue(false);
  const isGestureActive = useSharedValue(false);

  const currentPageNumber = currentPage.page.pageNumber;
  // Boundaries of the Holy Quran: Page 1 and Page 604
  const hasPrev = currentPageNumber > 1;
  const hasNext = currentPageNumber < 604;

  const hasPrevRef = useRef(hasPrev);
  hasPrevRef.current = hasPrev;
  const hasNextRef = useRef(hasNext);
  hasNextRef.current = hasNext;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - containerWidthRef.current) > 1) {
      setContainerWidth(width);
    }
  }, []);

  const finishTransition = useCallback(
    (direction: PageTurnDirection) => {
      translateX.value = 0;
      isTransitioning.value = false;
      isGestureActive.value = false;
      onPageTurn(direction);
    },
    [isGestureActive, isTransitioning, onPageTurn, translateX],
  );

  const resetPosition = useCallback(() => {
    translateX.value = withTiming(0, {
      duration: CANCEL_DURATION_MS,
      easing: Easing.out(Easing.quad),
    }, () => {
      isTransitioning.value = false;
      isGestureActive.value = false;
    });
  }, [isGestureActive, isTransitioning, translateX]);

  const completeSwipe = useCallback(
    (dx: number, vx: number) => {
      if (isTransitioning.value) return;

      const width = containerWidthRef.current;
      const distanceThreshold = Math.max(50, width * SWIPE_DISTANCE_RATIO);

      // RTL: Moving to next page is swipe from right to left (dx < 0)
      const shouldTurnNext =
        hasNextRef.current &&
        (dx < -distanceThreshold || (dx < -25 && vx < -SWIPE_VELOCITY_THRESHOLD));

      // RTL: Moving to previous page is swipe from left to right (dx > 0)
      const shouldTurnPrev =
        hasPrevRef.current &&
        (dx > distanceThreshold || (dx > 25 && vx > SWIPE_VELOCITY_THRESHOLD));

      if (shouldTurnNext) {
        isTransitioning.value = true;
        let finishedOnce = false;
        const finalize = () => {
          if (finishedOnce) return;
          finishedOnce = true;
          finishTransition('next');
        };

        // Safety fallback timer for Web / Android to ensure transition always settles
        setTimeout(finalize, ANIMATION_DURATION_MS + 40);

        translateX.value = withTiming(
          -width,
          {
            duration: ANIMATION_DURATION_MS,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(finalize)();
            }
          },
        );
      } else if (shouldTurnPrev) {
        isTransitioning.value = true;
        let finishedOnce = false;
        const finalize = () => {
          if (finishedOnce) return;
          finishedOnce = true;
          finishTransition('previous');
        };

        // Safety fallback timer for Web / Android to ensure transition always settles
        setTimeout(finalize, ANIMATION_DURATION_MS + 40);

        translateX.value = withTiming(
          width,
          {
            duration: ANIMATION_DURATION_MS,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(finalize)();
            }
          },
        );
      } else {
        resetPosition();
      }
    },
    [finishTransition, isTransitioning, resetPosition, translateX],
  );

  // Gesture Handler for Native (Android / iOS)
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-25, 25])
    .onStart(() => {
      'worklet';
      if (isTransitioning.value) return;
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      'worklet';
      if (isTransitioning.value) return;

      let dx = event.translationX;
      // Boundaries: apply resistance if swiping past page 1 or page 604
      if (dx > 0 && !hasPrev) {
        dx *= BOUNDARY_RESISTANCE;
      } else if (dx < 0 && !hasNext) {
        dx *= BOUNDARY_RESISTANCE;
      }

      translateX.value = dx;
    })
    .onEnd((event) => {
      'worklet';
      if (isTransitioning.value) return;
      runOnJS(completeSwipe)(event.translationX, event.velocityX);
    });

  // Web iframe pan bridging callbacks
  const handleWebPanStart = useCallback(() => {
    if (isTransitioning.value) return;
    isGestureActive.value = true;
  }, [isGestureActive, isTransitioning]);

  const handleWebPanUpdate = useCallback(
    (dx: number) => {
      if (isTransitioning.value) return;
      let effectiveDx = dx;
      if (effectiveDx > 0 && !hasPrev) {
        effectiveDx *= BOUNDARY_RESISTANCE;
      } else if (effectiveDx < 0 && !hasNext) {
        effectiveDx *= BOUNDARY_RESISTANCE;
      }
      translateX.value = effectiveDx;
    },
    [hasNext, hasPrev, isTransitioning, translateX],
  );

  const handleWebPanEnd = useCallback(
    (dx: number, vx: number) => {
      completeSwipe(dx, vx);
    },
    [completeSwipe],
  );

  const handleWebPanCancel = useCallback(() => {
    resetPosition();
  }, [resetPosition]);

  // Animated styles
  const foregroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const nextBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? 1 : 0,
    zIndex: translateX.value < 0 ? 1 : 0,
  }));

  const prevBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? 1 : 0,
    zIndex: translateX.value > 0 ? 1 : 0,
  }));

  const backgroundColor = isDark ? '#0f172a' : '#fcfbf7';

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Background layer: Pre-rendered underneath at position 0 */}
      <View style={[StyleSheet.absoluteFill, styles.backgroundContainer]} pointerEvents="none">
        {nextPage ? (
          <Animated.View style={[StyleSheet.absoluteFill, nextBackgroundStyle]}>
            <MushafPageViewer
              page={nextPage.page}
              fontBase64={nextPage.fontBase64}
              basmalaFontBase64={nextPage.basmalaFontBase64}
              fontSize={fontSize}
              showTajweed={showTajweed}
              isDark={isDark}
              highlights={[]}
              selectedElementId={null}
              transitionDirection={null}
              onWordPress={noop}
              onAyahPress={noop}
              onPageTurn={noop}
              onInteractionError={noop}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              nextBackgroundStyle,
              { backgroundColor, justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <ActivityIndicator color={isDark ? '#38BDF8' : '#0F766E'} />
          </Animated.View>
        )}

        {prevPage ? (
          <Animated.View style={[StyleSheet.absoluteFill, prevBackgroundStyle]}>
            <MushafPageViewer
              page={prevPage.page}
              fontBase64={prevPage.fontBase64}
              basmalaFontBase64={prevPage.basmalaFontBase64}
              fontSize={fontSize}
              showTajweed={showTajweed}
              isDark={isDark}
              highlights={[]}
              selectedElementId={null}
              transitionDirection={null}
              onWordPress={noop}
              onAyahPress={noop}
              onPageTurn={noop}
              onInteractionError={noop}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              prevBackgroundStyle,
              { backgroundColor, justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <ActivityIndicator color={isDark ? '#38BDF8' : '#0F766E'} />
          </Animated.View>
        )}
      </View>

      {/* Foreground layer: Slides horizontally with finger to reveal background */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.foregroundLayer,
            { backgroundColor },
            foregroundStyle,
          ]}
        >
          <MushafPageViewer
            page={currentPage.page}
            fontBase64={currentPage.fontBase64}
            basmalaFontBase64={currentPage.basmalaFontBase64}
            fontSize={fontSize}
            showTajweed={showTajweed}
            isDark={isDark}
            highlights={highlights}
            selectedElementId={selectedElementId}
            transitionDirection={null}
            onWordPress={onWordPress}
            onAyahPress={onAyahPress}
            onPageTurn={onPageTurn}
            onInteractionError={onInteractionError}
            onPanStart={handleWebPanStart}
            onPanUpdate={handleWebPanUpdate}
            onPanEnd={handleWebPanEnd}
            onPanCancel={handleWebPanCancel}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function noop() {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundContainer: {
    zIndex: 1,
  },
  foregroundLayer: {
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
});
