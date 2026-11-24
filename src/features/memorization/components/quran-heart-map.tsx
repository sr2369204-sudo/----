import { useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { HEART_CELLS, HEART_VIEWBOX } from '@/features/memorization/data/heart-cells';
import type { HeartPalette } from '@/features/memorization/services/heart-appearance';
import { findHeartCellAt } from '@/features/memorization/utils/heart-hit-test';
import { useTheme } from '@/hooks/use-theme';

const MIN_SCALE = 0.6;
const MAX_SCALE = 5;
/**
 * Opening zoom. `fit` already makes the heart exactly as wide as the viewport,
 * which reads as overflowing on a phone, so it starts pulled back and the reader
 * zooms in when they want to read the tiles.
 */
const INITIAL_SCALE = 0.8;
const ZOOM_FACTOR = 1.4;
const ZOOM_DURATION = 220;

/**
 * Keeps the (center-origin) translation inside the viewport so the heart can
 * never be dragged completely off-screen. Shared values are passed in because
 * this runs on the UI thread.
 */
function clampTranslation(
  scale: number,
  viewW: number,
  viewH: number,
  drawW: number,
  drawH: number,
  tx: number,
  ty: number,
): { x: number; y: number } {
  'worklet';
  const limitX = Math.max(0, (drawW * scale - viewW) / 2);
  const limitY = Math.max(0, (drawH * scale - viewH) / 2);
  return {
    x: Math.min(limitX, Math.max(-limitX, tx)),
    y: Math.min(limitY, Math.max(-limitY, ty)),
  };
}

type QuranHeartMapProps = {
  /** Surah numbers currently marked as memorized. */
  memorized: ReadonlySet<number>;
  /** Fired when a cell is tapped. */
  onPressSurah: (surahNumber: number) => void;
  /** Highlights the cell that was tapped last. */
  focusedSurah: number | null;
  /** Extra cells to outline, used by the multi-select mode. */
  selected: ReadonlySet<number>;
  /** Draws every surah name over its cell. */
  showLabels: boolean;
  /** Colours for the backdrop, the two cell states and both label states. */
  palette: HeartPalette;
};

/**
 * The Quran Heart: the 114 hand-drawn cells of the upstream `heart.svg`, drawn
 * with react-native-svg and coloured by memorization state. Pinch zooms around
 * the focal point, one finger pans, and the round buttons zoom in steps.
 */
export function QuranHeartMap({
  memorized,
  onPressSurah,
  focusedSurah,
  selected,
  showLabels,
  palette,
}: QuranHeartMapProps) {
  const colors = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Fit the cropped heart box into whatever space the screen gives us, so the
  // map scales cleanly from small Android phones to tablets.
  const fit = size.width > 0 && size.height > 0
    ? Math.min(size.width / HEART_VIEWBOX.width, size.height / HEART_VIEWBOX.height)
    : 0;
  const drawWidth = HEART_VIEWBOX.width * fit;
  const drawHeight = HEART_VIEWBOX.height * fit;

  const scale = useSharedValue(INITIAL_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const startScale = useSharedValue(INITIAL_SCALE);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startFocalX = useSharedValue(0);
  const startFocalY = useSharedValue(0);

  const viewW = useSharedValue(0);
  const viewH = useSharedValue(0);
  const drawW = useSharedValue(0);
  const drawH = useSharedValue(0);

  useEffect(() => {
    viewW.value = size.width;
    viewH.value = size.height;
    drawW.value = drawWidth;
    drawH.value = drawHeight;
  }, [size.height, size.width, drawHeight, drawWidth, viewW, viewH, drawW, drawH]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((previous) =>
      previous.width === width && previous.height === height ? previous : { width, height });
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      const clamped = clampTranslation(
        scale.value, viewW.value, viewH.value, drawW.value, drawH.value,
        translateX.value, translateY.value,
      );
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    });

  const pinch = Gesture.Pinch()
    .onStart((event) => {
      startScale.value = scale.value;
      startX.value = translateX.value;
      startY.value = translateY.value;
      startFocalX.value = event.focalX - viewW.value / 2;
      startFocalY.value = event.focalY - viewH.value / 2;
    })
    .onUpdate((event) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale.value * event.scale));
      const factor = next / startScale.value;
      const focalX = event.focalX - viewW.value / 2;
      const focalY = event.focalY - viewH.value / 2;
      translateX.value = focalX - factor * (startFocalX.value - startX.value);
      translateY.value = focalY - factor * (startFocalY.value - startY.value);
      scale.value = next;
    })
    .onEnd(() => {
      const clamped = clampTranslation(
        scale.value, viewW.value, viewH.value, drawW.value, drawH.value,
        translateX.value, translateY.value,
      );
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    });

  // A tap resolves to a surah by mapping the finger back through the current
  // pan/zoom into viewBox space, then hit-testing the cell paths. This keeps
  // the shapes handler-free (no web responder warnings, no gesture clashes).
  const tap = Gesture.Tap()
    .maxDuration(280)
    .maxDistance(16)
    .runOnJS(true)
    .onEnd((event, success) => {
      if (!success || drawWidth <= 0 || drawHeight <= 0) {
        return;
      }
      const localX = (event.x - size.width / 2 - translateX.get()) / scale.get();
      const localY = (event.y - size.height / 2 - translateY.get()) / scale.get();
      const viewBoxX = HEART_VIEWBOX.x + ((localX + drawWidth / 2) * HEART_VIEWBOX.width) / drawWidth;
      const viewBoxY = HEART_VIEWBOX.y + ((localY + drawHeight / 2) * HEART_VIEWBOX.height) / drawHeight;
      const surah = findHeartCellAt(viewBoxX, viewBoxY);
      if (surah !== null) {
        onPressSurah(surah);
      }
    });

  const gesture = Gesture.Simultaneous(pan, pinch, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const zoomBy = useCallback((factor: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.get() * factor));
    const limitX = Math.max(0, (drawWidth * next - size.width) / 2);
    const limitY = Math.max(0, (drawHeight * next - size.height) / 2);
    const x = translateX.get();
    const y = translateY.get();
    scale.set(withTiming(next, { duration: ZOOM_DURATION }));
    translateX.set(withTiming(Math.min(limitX, Math.max(-limitX, x)), { duration: ZOOM_DURATION }));
    translateY.set(withTiming(Math.min(limitY, Math.max(-limitY, y)), { duration: ZOOM_DURATION }));
  }, [drawHeight, drawWidth, size.height, size.width, scale, translateX, translateY]);

  const resetView = useCallback(() => {
    scale.set(withTiming(INITIAL_SCALE, { duration: ZOOM_DURATION }));
    translateX.set(withTiming(0, { duration: ZOOM_DURATION }));
    translateY.set(withTiming(0, { duration: ZOOM_DURATION }));
  }, [scale, translateX, translateY]);

  // The paths never change; only the fills do, so the static list is built once.
  const cells = useMemo(() => HEART_CELLS, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} onLayout={onLayout}>
      <View pointerEvents="none" style={styles.hint}>
        <Ionicons name="move-outline" size={13} color={colors.textSecondary} />
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          اسحب للتنقل • كبّر بإصبعين
        </Text>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.viewport}>
          <Animated.View style={[styles.canvas, animatedStyle]}>
            {drawWidth > 0 && (
              <Svg
                width={drawWidth}
                height={drawHeight}
                viewBox={`${HEART_VIEWBOX.x} ${HEART_VIEWBOX.y} ${HEART_VIEWBOX.width} ${HEART_VIEWBOX.height}`}>
                {cells.map((cell) => {
                  const active = memorized.has(cell.surahNumber);
                  const highlighted =
                    focusedSurah === cell.surahNumber || selected.has(cell.surahNumber);
                  return cell.paths.map((d, index) => (
                    <Path
                      key={`${cell.surahNumber}-${index}`}
                      d={d}
                      fill={active ? palette.memorizedFill : palette.cellFill}
                      stroke={highlighted ? palette.focusStroke : palette.background}
                      strokeWidth={highlighted ? 3 : 1}
                      strokeLinejoin="round"
                    />
                  ));
                })}
              </Svg>
            )}

            {/*
             * The names are real `Text` nodes, not SVG `<Text>`: react-native-svg
             * draws each glyph on its own and never runs Arabic shaping, so the
             * letters came out disconnected. They sit in the same zoomed view as
             * the paths, positioned from the label's viewBox anchor scaled by the
             * same `fit` factor the SVG uses, and centred on it.
             */}
            {drawWidth > 0 && showLabels && cells.map((cell) => (
              <Text
                key={`label-${cell.surahNumber}`}
                pointerEvents="none"
                style={[
                  styles.cellLabel,
                  {
                    left: (cell.labelX - HEART_VIEWBOX.x) * fit,
                    top: (cell.labelY - HEART_VIEWBOX.y) * fit,
                    fontSize: cell.labelFontSize * fit,
                    color: memorized.has(cell.surahNumber)
                      ? palette.memorizedLabelColor
                      : palette.labelColor,
                  },
                ]}>
                {cell.surahName}
              </Text>
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.controls}>
        <ZoomButton
          icon="add"
          label="تكبير"
          onPress={() => zoomBy(ZOOM_FACTOR)}
          colors={colors}
        />
        <ZoomButton
          icon="remove"
          label="تصغير"
          onPress={() => zoomBy(1 / ZOOM_FACTOR)}
          colors={colors}
        />
        <ZoomButton
          icon="expand-outline"
          label="إعادة ضبط العرض"
          onPress={resetView}
          colors={colors}
        />
      </View>
    </View>
  );
}

function ZoomButton({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.zoomButton,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={19} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /**
   * The heart is a drawing, not text flow. Left/right must stay physical even
   * when the phone language is Arabic, otherwise the absolutely positioned
   * names are mirrored away from their cells.
   */
  canvas: {
    direction: 'ltr',
  },
  hint: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    zIndex: 2,
  },
  hintText: {
    fontSize: TypeScale.micro,
  },
  controls: {
    position: 'absolute',
    left: Spacing.three,
    bottom: Spacing.three,
    gap: Spacing.two,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  cellLabel: {
    position: 'absolute',
    textAlign: 'center',
    fontWeight: '600',
    /**
     * The anchor point is the cell's inmost point, so the name is centred on it
     * rather than baseline-aligned as the SVG version was.
     */
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
});
