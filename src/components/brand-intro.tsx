import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
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
  withSpring,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { LinearGradient } from '@/components/ui/optional-native-views';
import { Radius } from '@/constants/theme';

export const IntroAnimationContext = createContext(false);

const INTRO_DURATION_MS = 2_700;
const FADE_DURATION_MS = 480;
const REVEAL_DURATION_MS = 1_100;
const PROGRESS_WIDTH = 156;
const GOLD = '#E5B85F';
const GOLD_SOFT = '#F3D28C';
const CREAM = '#FFF6E2';

const GRAIN_SOURCE = require('../../assets/images/glass-grain.png');

/** Angles for the ring of small gold beads around the medallion rim. */
const BEAD_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/**
 * The launch stage. Its centrepiece is a hand-built medallion: a beaded gold
 * rim around concentric rings and a small emerald core holding an open-book
 * glyph. A gold arc counter-rotates around it against a breathing halo; the
 * inner rings and glyph settle into place with a light spring on load.
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

  const reveal = useSharedValue(0);
  const assemble = useSharedValue(0);
  const fadeOut = useSharedValue(1);
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);

  const seal = Math.min(width * 0.5, 208);
  const glowSize = Math.min(width * 1.3, height * 0.72);

  const handleLayout = useCallback(() => {
    if (didReportReady.current) {
      return;
    }
    didReportReady.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    reveal.value = withTiming(1, {
      duration: REVEAL_DURATION_MS,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      reduceMotion: ReduceMotion.System,
    });
    // A soft spring lets the seal settle into place with a light overshoot.
    assemble.value = withSpring(1, {
      damping: 13,
      stiffness: 110,
      mass: 0.9,
      reduceMotion: ReduceMotion.System,
    });
    progress.value = withTiming(1, {
      duration: INTRO_DURATION_MS + FADE_DURATION_MS,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.System,
    });
    spin.value = withRepeat(
      withTiming(1, {
        duration: 18_000,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );
    // The halo breathes so the gold light never feels static.
    breathe.value = withRepeat(
      withTiming(1, {
        duration: 2_800,
        easing: Easing.inOut(Easing.quad),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true,
    );

    const introTimer = setTimeout(() => setExiting(true), INTRO_DURATION_MS);
    return () => {
      clearTimeout(introTimer);
      cancelAnimation(reveal);
      cancelAnimation(assemble);
      cancelAnimation(progress);
      cancelAnimation(spin);
      cancelAnimation(breathe);
    };
  }, [assemble, breathe, progress, reveal, spin]);

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
  const emblemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.5], [0, 1], 'clamp'),
    transform: [
      { translateY: interpolate(assemble.value, [0, 1], [34, 0]) },
      { scale: interpolate(assemble.value, [0, 1], [0.7, 1]) },
    ],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.6], [0, 1], 'clamp'),
    transform: [
      { rotate: `${interpolate(assemble.value, [0, 1], [100, 0])}deg` },
      { scale: interpolate(assemble.value, [0, 1], [0.5, 1]) },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breathe.value, [0, 1], [0.26, 0.48]) *
      interpolate(reveal.value, [0, 1], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(breathe.value, [0, 1], [0.95, 1.05]) }],
  }));
  const ringForwardStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const ringBackwardStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-spin.value * 360 - 40}deg` }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.32, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(assemble.value, [0, 1], [22, 0]) }],
  }));
  const footerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.5, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(assemble.value, [0, 1], [16, 0]) }],
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
        colors={['#05251A', '#0E5A3E', '#072418']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.backdrop}>
        <View style={[styles.emeraldBloom, { width: width * 1.1, height: width * 1.1 }]} />
        <View style={[styles.goldBloom, { width: width * 0.95, height: width * 0.95 }]} />
        <CornerFlourish style={styles.cornerTopRight} />
        <CornerFlourish style={styles.cornerBottomLeft} />
        <Image
          source={GRAIN_SOURCE}
          resizeMode="repeat"
          style={[StyleSheet.absoluteFill, styles.grain]}
        />
      </View>

      <View style={[styles.stage, { paddingTop: insets.top }]}>
        <Animated.View
          style={[
            styles.emblemWrap,
            { width: seal, height: seal, marginBottom: seal * 0.4 },
            emblemStyle,
          ]}>
          <SoftGlow
            rgb="229,184,95"
            size={glowSize}
            style={[styles.haloCenter, { width: glowSize, height: glowSize }, haloStyle]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                width: seal * 1.38,
                height: seal * 1.38,
                borderRadius: seal * 0.69,
              },
              ringForwardStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ringOuter,
              {
                width: seal * 1.18,
                height: seal * 1.18,
                borderRadius: seal * 0.59,
              },
              ringBackwardStyle,
            ]}
          />

          <View style={[styles.seal, { width: seal, height: seal, borderRadius: seal / 2 }]}>
            {BEAD_ANGLES.map((angle) => {
              const radians = (angle * Math.PI) / 180;
              const radius = seal * 0.43;
              const bead = seal * 0.042;
              return (
                <View
                  key={angle}
                  style={[
                    styles.bead,
                    {
                      width: bead,
                      height: bead,
                      borderRadius: bead / 2,
                      left: seal / 2 + radius * Math.cos(radians) - bead / 2,
                      top: seal / 2 + radius * Math.sin(radians) - bead / 2,
                    },
                  ]}
                />
              );
            })}
            <Animated.View style={[styles.innerGroup, innerStyle]}>
              <View
                style={[
                  styles.innerRing,
                  { width: seal * 0.72, height: seal * 0.72, borderRadius: seal * 0.36 },
                ]}>
                <View
                  style={[
                    styles.core,
                    { width: seal * 0.42, height: seal * 0.42, borderRadius: seal * 0.21 },
                  ]}>
                  <Ionicons name="book" size={seal * 0.2} color={CREAM} />
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.titleBlock, titleStyle]}>
          <Text style={[styles.title, { fontSize: width < 370 ? 30 : 35 }]}>
            المصحف الشريف
          </Text>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.tagline}>رفيقك في رحاب القرآن</Text>
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
        <Ionicons name="play-skip-forward" size={13} color="rgba(255,246,226,0.86)" />
        <Text style={styles.skipText}>تخطي</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Concentric low-alpha circles read as a single soft radial bloom. */
function SoftGlow({
  rgb,
  size,
  style,
}: {
  rgb: string;
  size: number;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}) {
  const rings = [0.34, 0.5, 0.68, 0.84, 1];
  return (
    <Animated.View pointerEvents="none" style={style}>
      {rings.map((ring) => {
        const diameter = size * ring;
        return (
          <View
            key={ring}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: -diameter / 2,
              marginTop: -diameter / 2,
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: `rgba(${rgb},0.06)`,
            }}
          />
        );
      })}
    </Animated.View>
  );
}

/** A hairline gold bracket that frames a corner of the stage. */
function CornerFlourish({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[styles.flourish, style]}>
      <View style={styles.flourishH} />
      <View style={styles.flourishV} />
      <View style={styles.flourishNode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    overflow: 'hidden',
    backgroundColor: '#05251A',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  emeraldBloom: {
    position: 'absolute',
    top: '-52%',
    left: '-38%',
    borderRadius: 999,
    backgroundColor: 'rgba(14,122,87,0.28)',
  },
  goldBloom: {
    position: 'absolute',
    bottom: '-46%',
    right: '-34%',
    borderRadius: 999,
    backgroundColor: 'rgba(201,151,60,0.09)',
  },
  grain: {
    opacity: 0.16,
  },
  flourish: {
    position: 'absolute',
    width: 74,
    height: 74,
  },
  cornerTopRight: {
    top: 70,
    right: 24,
    transform: [{ scaleX: -1 }],
  },
  cornerBottomLeft: {
    bottom: 96,
    left: 24,
    transform: [{ rotate: '180deg' }],
  },
  flourishH: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(229,184,95,0.4)',
  },
  flourishV: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(229,184,95,0.4)',
  },
  flourishNode: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloCenter: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopColor: 'rgba(229,184,95,0.85)',
    borderRightColor: 'rgba(229,184,95,0.22)',
  },
  ringOuter: {
    borderTopColor: 'rgba(243,210,140,0.32)',
    borderLeftColor: 'rgba(243,210,140,0.72)',
  },
  seal: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(229,184,95,0.4)',
    shadowColor: GOLD,
    shadowOpacity: 0.35,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  bead: {
    position: 'absolute',
    backgroundColor: 'rgba(229,184,95,0.9)',
  },
  innerGroup: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,184,95,0.45)',
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,52,36,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(229,184,95,0.55)',
  },
  titleBlock: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    color: CREAM,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(229,184,95,0.45)',
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  divider: {
    width: '58%',
    maxWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(229,184,95,0.7)',
  },
  dividerDiamond: {
    width: 9,
    height: 9,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  tagline: {
    color: 'rgba(255,246,226,0.74)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(255,246,226,0.14)',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: GOLD_SOFT,
    shadowColor: GOLD,
    shadowOpacity: 0.95,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
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
    borderColor: 'rgba(229,184,95,0.3)',
    backgroundColor: 'rgba(255,246,226,0.08)',
    zIndex: 2,
  },
  skipText: {
    color: 'rgba(255,246,226,0.9)',
    fontSize: 13,
    fontWeight: '700',
  },
});
