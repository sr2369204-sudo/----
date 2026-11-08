import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { LinearGradient } from '@/components/ui/optional-native-views';
import { Radius } from '@/constants/theme';

export const IntroAnimationContext = createContext(false);

const INTRO_DURATION_MS = 2_600;
const FADE_DURATION_MS = 480;
const REVEAL_DURATION_MS = 1_200;
const PROGRESS_WIDTH = 156;
/**
 * The niche is a mihrab, and a mihrab is tall and slim rather than a card: the
 * width is a share of the screen with a ceiling, and the height is a multiple of
 * that width with a ceiling of its own so it always clears the footer.
 */
const PANEL_WIDTH_RATIO = 0.56;
const PANEL_WIDTH_MAX = 232;
const NICHE_ASPECT = 2.15;
const NICHE_HEIGHT_RATIO = 0.66;
/** How far the orbit ring clears the mark on every side. */
const RING_GAP = 30;
/** How far the dim pane behind the niche reaches past it. */
const GHOST_INSET = 16;
/** Corner rounding along the foot of the niche. */
const FOOT_RADIUS = 12;
/** How far the light band overhangs the region that clips it. */
const SWEEP_BLEED = 24;
const SWEEP_WIDTH = 90;
/**
 * The light band is a row of plain strips rather than a gradient drawable: each
 * number is one step of the falloff, bright in the middle and gone at the rims,
 * which reads as a soft gleam without depending on a native gradient view.
 */
const GLEAM_STOPS = [0, 0.02, 0.05, 0.1, 0.15, 0.2, 0.15, 0.1, 0.05, 0.02, 0];
/** Where the gold dots sit on the arch, measured from the apex. */
const DOT_ANGLE = 0.66;
const DOT_SIZE = 5;
/** Radii the frame is stroked at, negative being outside the glass. */
const RECESS_INSET = -2;
const FRAME_INSET = 1;
const HAIRLINE_INSET = 9;

const GOLD = '#E5B85F';
const CREAM = '#FFF6E2';
const RECESS = 'rgba(3,20,14,0.55)';
const FRAME = 'rgba(229,184,95,0.75)';
const HAIRLINE = 'rgba(255,255,255,0.14)';
/** The arched head is lit more than the shaft, which is what gives it depth. */
const HEAD_GLASS = 'rgba(255,255,255,0.13)';
const SHAFT_GLASS = 'rgba(255,255,255,0.07)';
const GHOST_GLASS = 'rgba(255,255,255,0.045)';

const GRAIN_SOURCE = require('../../assets/images/glass-grain.png');
const MARK_SOURCE = require('../../assets/images/icon.png');

/**
 * Dust suspended inside the niche. Each mote rises and fades through its own
 * window of one shared loop, so they never travel in step.
 */
const MOTES = [
  { key: 'a', left: '17%', top: '18%', size: 3, start: 0.02, travel: 18, peak: 0.5 },
  { key: 'b', left: '78%', top: '26%', size: 2, start: 0.22, travel: 26, peak: 0.42 },
  { key: 'c', left: '26%', top: '62%', size: 2, start: 0.42, travel: 22, peak: 0.4 },
  { key: 'd', left: '72%', top: '70%', size: 3, start: 0.62, travel: 16, peak: 0.46 },
] as const;

const MOTE_WINDOW = 0.35;

/**
 * The launch stage: a mihrab — the arched niche of a mosque — carved out of the
 * emerald backdrop, holding the app mark, the name and the tagline. It is kept
 * tall and slim, the way a niche in a wall actually is, instead of a card.
 *
 * The niche is built from plain views. A half-round arch is exactly the upper
 * half of a circle, so the cap is a clipped disc and the arch is stroked by a
 * circle that only paints its top and left quarters, turned a quarter turn so
 * that arc lands on top. The shaft below is a plain rectangle carrying the same
 * strokes on its sides. Layer on layer — a dim wider arch floating behind, a
 * dark rim, the glass, the gold, a hairline, a finial at the apex — and it reads
 * as a niche set into the wall rather than a box resting on it.
 *
 * It is alive too: the pane settles in on a spring and drifts while the pane
 * behind it drifts the other way, a band of light sweeps the niche, an arc
 * orbits the mark, the diamond turns, and dust climbs through the glass.
 */
export function BrandIntro({
  onReady,
  onFinished,
}: {
  onReady: () => void;
  onFinished: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);
  const didReportReady = useRef(false);

  /** Drives every fade, on its own staggered range per element. */
  const reveal = useSharedValue(0);
  /** Drives every slide and scale, so the whole stage shares one spring. */
  const enter = useSharedValue(0);
  /** Slow drift that keeps the pane from ever looking parked. */
  const float = useSharedValue(0);
  /** Progress of the band of light crossing the niche. */
  const sweep = useSharedValue(0);
  /** Turn of the arc orbiting the mark. */
  const spin = useSharedValue(0);
  /** Breathe of the gold ornaments. */
  const gem = useSharedValue(0);
  /** One loop shared by every mote of dust. */
  const drift = useSharedValue(0);
  const progress = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  const panelWidth = Math.min(width * PANEL_WIDTH_RATIO, PANEL_WIDTH_MAX);
  const nicheHeight = Math.min(
    Math.round(panelWidth * NICHE_ASPECT),
    Math.round(height * NICHE_HEIGHT_RATIO),
  );
  const markSize = Math.min(panelWidth * 0.4, 96);
  const ringSize = markSize + RING_GAP;
  const titleSize = Math.max(19, Math.round(panelWidth * 0.11));
  // Half-round arch: the head is a semicircle whose centre is the spring line,
  // so its span is the pane's full width and its height is half of it.
  const archRadius = panelWidth / 2;
  const springY = archRadius;
  const ghostRadius = archRadius + GHOST_INSET;
  const dotRadius = archRadius - 14;
  const dotLeft = panelWidth / 2 - dotRadius * Math.sin(DOT_ANGLE) - DOT_SIZE / 2;
  const dotTop = springY - dotRadius * Math.cos(DOT_ANGLE) - DOT_SIZE / 2;

  const handleLayout = useCallback(() => {
    if (didReportReady.current) {
      return;
    }
    didReportReady.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    // Linear, so the per-element ranges below read as real delays instead of
    // collapsing into one fade once the easing curve has already run ahead.
    reveal.value = withTiming(1, {
      duration: REVEAL_DURATION_MS,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.System,
    });
    enter.value = withSpring(1, {
      damping: 14,
      stiffness: 110,
      mass: 0.9,
      reduceMotion: ReduceMotion.System,
    });
    float.value = withRepeat(
      withTiming(1, {
        duration: 3_600,
        easing: Easing.inOut(Easing.sin),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );
    // One crossing during the intro: the band leaves on the far side, waits out
    // of sight, then resets instantly so the next pass starts from the edge.
    sweep.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1_700,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.System,
        }),
        withTiming(1, { duration: 2_100, reduceMotion: ReduceMotion.System }),
        withTiming(0, { duration: 0, reduceMotion: ReduceMotion.System }),
      ),
      -1,
      false,
    );
    spin.value = withRepeat(
      withTiming(1, {
        duration: 11_000,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );
    gem.value = withRepeat(
      withTiming(1, {
        duration: 1_900,
        easing: Easing.inOut(Easing.sin),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );
    drift.value = withRepeat(
      withTiming(1, {
        duration: 5_200,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );
    progress.value = withTiming(1, {
      duration: INTRO_DURATION_MS + FADE_DURATION_MS,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.System,
    });

    const introTimer = setTimeout(() => setExiting(true), INTRO_DURATION_MS);
    return () => {
      clearTimeout(introTimer);
      cancelAnimation(reveal);
      cancelAnimation(enter);
      cancelAnimation(float);
      cancelAnimation(sweep);
      cancelAnimation(spin);
      cancelAnimation(gem);
      cancelAnimation(drift);
      cancelAnimation(progress);
    };
  }, [drift, enter, float, gem, progress, reveal, spin, sweep]);

  useEffect(() => {
    if (!exiting) {
      return;
    }

    fadeOut.value = withTiming(0, {
      duration: FADE_DURATION_MS,
      easing: Easing.in(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
    const exitTimer = setTimeout(() => {
      setVisible(false);
      onFinished();
    }, FADE_DURATION_MS);
    return () => {
      clearTimeout(exitTimer);
      cancelAnimation(fadeOut);
    };
  }, [exiting, fadeOut, onFinished]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.3], [0, 1], 'clamp'),
    transform: [
      {
        translateY:
          interpolate(enter.value, [0, 1], [26, 0]) +
          interpolate(float.value, [0, 1], [0, -6]),
      },
      { scale: interpolate(enter.value, [0, 1], [0.94, 1]) },
    ],
  }));
  // Drifts the opposite way to the niche, so the two layers read as depth.
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.42], [0, 0.85], 'clamp'),
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, 7]) },
      { scale: interpolate(enter.value, [0, 1], [0.92, 1]) },
    ],
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.16, 0.5], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(enter.value, [0, 1], [0.86, 1]) }],
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(spin.value, [0, 1], [0, 360])}deg` }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.34, 0.68], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(enter.value, [0, 1], [16, 0]) }],
  }));
  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.5, 0.8], [0, 1], 'clamp'),
    // The row grows out of its own centre, which is where the diamond sits.
    transform: [{ scaleX: interpolate(enter.value, [0, 1], [0, 1]) }],
  }));
  const gemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gem.value, [0, 1], [0.82, 1]),
    transform: [
      { rotate: `${interpolate(gem.value, [0, 1], [45, 63])}deg` },
      { scale: interpolate(gem.value, [0, 1], [1, 1.16]) },
    ],
  }));
  const finialStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gem.value, [0, 1], [0.7, 1]),
    transform: [{ rotate: '45deg' }, { scale: interpolate(gem.value, [0, 1], [0.9, 1.1]) }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.6, 0.92], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(enter.value, [0, 1], [12, 0]) }],
  }));
  const motesStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.24, 0.72], [0, 1], 'clamp'),
  }));
  const frameStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.45], [0, 1], 'clamp'),
  }));
  const footerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.55, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(enter.value, [0, 1], [16, 0]) }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, PROGRESS_WIDTH]),
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      accessibilityViewIsModal
      accessibilityLabel="شاشة بدء المصحف الشريف"
      onLayout={handleLayout}
      style={[styles.container, overlayStyle]}>
      <LinearGradient
        colors={['#06271C', '#0C4F38', '#062018']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={GRAIN_SOURCE}
        resizeMode="repeat"
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.grain]}
      />

      <View style={[styles.stage, { paddingTop: insets.top }]}>
        <Animated.View
          style={[styles.niche, { width: panelWidth, minHeight: nicheHeight }, panelStyle]}>
          {/* The dimmer arch standing behind the niche. */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, ghostStyle]}>
            <View
              style={[
                styles.ghostHead,
                { left: -GHOST_INSET, top: springY - ghostRadius, width: ghostRadius * 2 },
              ]}>
              <View
                style={{
                  width: ghostRadius * 2,
                  height: ghostRadius * 2,
                  borderRadius: ghostRadius,
                  backgroundColor: GHOST_GLASS,
                }}
              />
            </View>
            <View
              style={[
                styles.ghostShaft,
                {
                  top: springY,
                  left: -GHOST_INSET,
                  right: -GHOST_INSET,
                  bottom: -GHOST_INSET,
                  backgroundColor: GHOST_GLASS,
                  borderBottomLeftRadius: FOOT_RADIUS + GHOST_INSET,
                  borderBottomRightRadius: FOOT_RADIUS + GHOST_INSET,
                },
              ]}
            />
          </Animated.View>

          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, frameStyle]}>
            {/* The dark lip that makes the niche read as cut into the wall. */}
            <ArchFrame
              panelWidth={panelWidth}
              springY={springY}
              inset={RECESS_INSET}
              strokeWidth={3}
              color={RECESS}
            />

            {/* Head: the upper half of a disc, and the light crossing it. */}
            <View
              style={[
                styles.headClip,
                { width: panelWidth, height: springY },
              ]}>
              <View
                style={{
                  width: panelWidth,
                  height: panelWidth,
                  borderRadius: archRadius,
                  backgroundColor: HEAD_GLASS,
                  overflow: 'hidden',
                }}>
                <SweepBand sweep={sweep} travel={panelWidth} />
              </View>
            </View>

            {/* Shaft: the straight body, with its own share of the light. */}
            <View style={[styles.shaft, { top: springY }]}>
              <SweepBand sweep={sweep} travel={panelWidth} />
              <Animated.View style={[StyleSheet.absoluteFill, motesStyle]}>
                {MOTES.map((mote) => (
                  <Mote key={mote.key} mote={mote} drift={drift} />
                ))}
              </Animated.View>
            </View>

            <ArchFrame
              panelWidth={panelWidth}
              springY={springY}
              inset={FRAME_INSET}
              strokeWidth={1.5}
              color={FRAME}
            />
            <ArchFrame
              panelWidth={panelWidth}
              springY={springY}
              inset={HAIRLINE_INSET}
              strokeWidth={1}
              color={HAIRLINE}
            />

            {/* Finial on the apex, with a dot on each shoulder of the arch. */}
            <Animated.View
              pointerEvents="none"
              style={[styles.finial, { left: panelWidth / 2 - 5 }, finialStyle]}
            />
            <View pointerEvents="none" style={[styles.dot, { left: dotLeft, top: dotTop }]} />
            <View
              pointerEvents="none"
              style={[
                styles.dot,
                { left: panelWidth - dotLeft - DOT_SIZE, top: dotTop },
              ]}
            />
          </Animated.View>

          <View
            style={[
              styles.content,
              {
                paddingTop: Math.round(archRadius * 0.45),
                paddingBottom: Math.round(archRadius * 0.95),
              },
            ]}>
            <Animated.View
              style={[styles.markWrap, { width: ringSize, height: ringSize }, markStyle]}>
              <View pointerEvents="none" style={styles.ringBase} />
              <Animated.View pointerEvents="none" style={[styles.ringSpin, spinStyle]}>
                <View style={styles.ringArc} />
                <View style={styles.ringDot} />
              </Animated.View>
              <Image
                source={MARK_SOURCE}
                resizeMode="contain"
                accessibilityLabel="شعار مصحف"
                style={{
                  width: markSize,
                  height: markSize,
                  borderRadius: Math.round(markSize * 0.24),
                }}
              />
            </Animated.View>

            <Animated.Text
              numberOfLines={1}
              style={[styles.title, { fontSize: titleSize }, titleStyle]}>
              المصحف الشريف
            </Animated.Text>
            <Animated.View style={[styles.divider, dividerStyle]}>
              <View style={styles.dividerLine} />
              <Animated.View style={[styles.dividerDiamond, gemStyle]} />
              <View style={styles.dividerLine} />
            </Animated.View>
            <Animated.Text style={[styles.tagline, taglineStyle]}>
              رفيقك في رحاب القرآن
            </Animated.Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 52 }, footerStyle]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.loadingText}>جارٍ التحضير…</Text>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تخطي المقدمة"
        onPress={() => setExiting(true)}
        style={[styles.skipButton, { top: insets.top + 10 }]}>
        <Ionicons name="play-skip-forward" size={13} color={CREAM} />
        <Text style={styles.skipText}>تخطي</Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Strokes the niche outline: an arc over the head and plain sides down the shaft.
 *
 * The arc is a circle that paints only its top and left borders, which together
 * cover the upper-left half of the circle — from the lower-left diagonal, round
 * through the west, to the upper-right diagonal. Turned a quarter turn clockwise
 * that half swings onto the top half exactly, its ends landing on the spring
 * line where the shaft's sides begin. Because each view only ever paints the edge
 * it owns, the strokes meet at the spring line instead of crossing each other.
 */
function ArchFrame({
  panelWidth,
  springY,
  inset,
  strokeWidth,
  color,
}: {
  panelWidth: number;
  springY: number;
  inset: number;
  strokeWidth: number;
  color: string;
}) {
  const size = panelWidth - inset * 2;
  const footRadius = Math.max(FOOT_RADIUS - inset, 0);

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: inset,
          top: springY - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: color,
          borderLeftColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: inset,
          right: inset,
          top: springY,
          bottom: inset,
          borderWidth: strokeWidth,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: footRadius,
          borderBottomRightRadius: footRadius,
        }}
      />
    </>
  );
}

/** Band of light crossing whatever clips it; it overhangs so no edge shows. */
function SweepBand({ sweep, travel }: { sweep: SharedValue<number>; travel: number }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sweep.value, [0, 1], [-travel * 1.2, travel * 1.2]) },
      { rotate: '14deg' },
    ],
  }));
  const stripWidth = SWEEP_WIDTH / GLEAM_STOPS.length;

  return (
    <Animated.View pointerEvents="none" style={[styles.sweep, style]}>
      {GLEAM_STOPS.map((opacity, index) => (
        <View
          key={index}
          style={[
            styles.gleamStrip,
            {
              // Each strip overlaps its neighbour by a pixel, so rounding the
              // fractional width can never leave a seam between them.
              left: index * stripWidth,
              width: stripWidth + 1,
              backgroundColor: `rgba(255,255,255,${opacity})`,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

/** One grain of dust: rises and fades inside its own slice of the shared loop. */
function Mote({
  mote,
  drift,
}: {
  mote: (typeof MOTES)[number];
  drift: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const { start } = mote;
    const end = start + MOTE_WINDOW;
    return {
      opacity: interpolate(
        drift.value,
        [start, start + 0.12, start + 0.22, end],
        [0, mote.peak, mote.peak, 0],
        'clamp',
      ),
      transform: [
        { translateY: interpolate(drift.value, [start, end], [mote.travel, -mote.travel], 'clamp') },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.mote,
        {
          left: mote.left,
          top: mote.top,
          width: mote.size,
          height: mote.size,
          borderRadius: mote.size / 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    overflow: 'hidden',
    backgroundColor: '#06271C',
  },
  grain: {
    opacity: 0.14,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** The niche itself: its height is set by the copy standing inside it. */
  niche: {
    alignItems: 'stretch',
  },
  ghostHead: {
    position: 'absolute',
    height: undefined,
    overflow: 'hidden',
    aspectRatio: 2,
  },
  ghostShaft: {
    position: 'absolute',
  },
  /** Rect that clips the head disc down to its upper half. */
  headClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  shaft: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: SHAFT_GLASS,
    borderBottomLeftRadius: FOOT_RADIUS,
    borderBottomRightRadius: FOOT_RADIUS,
  },
  sweep: {
    position: 'absolute',
    top: -SWEEP_BLEED,
    bottom: -SWEEP_BLEED,
    width: SWEEP_WIDTH,
  },
  gleamStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  mote: {
    position: 'absolute',
    backgroundColor: 'rgba(255,246,226,0.9)',
  },
  finial: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    backgroundColor: GOLD,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: GOLD,
  },
  /** Stretches the full height of the niche so the copy can be seated in it. */
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  /** Rotated as a whole, which is what sends the arc and its head around. */
  ringSpin: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
  },
  ringArc: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.pill,
    borderWidth: 1.4,
    borderColor: 'transparent',
    borderTopColor: GOLD,
    borderRightColor: 'rgba(229,184,95,0.32)',
  },
  ringDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  title: {
    color: CREAM,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  divider: {
    width: '58%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: -4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(229,184,95,0.7)',
  },
  dividerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: GOLD,
  },
  tagline: {
    color: 'rgba(255,246,226,0.76)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: 14,
  },
  progressTrack: {
    width: PROGRESS_WIDTH,
    height: 4,
    overflow: 'hidden',
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: GOLD,
  },
  loadingText: {
    color: 'rgba(255,246,226,0.72)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  skipButton: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },
  skipText: {
    color: 'rgba(255,246,226,0.9)',
    fontSize: 13,
    fontWeight: '700',
  },
});
