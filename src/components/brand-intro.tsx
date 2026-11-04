import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const INTRO_DURATION_MS = 2_800;
const FADE_DURATION_MS = 360;
const GOLD = '#E5B85F';
const CREAM = '#FFF4DC';
const SILHOUETTE = '#073747';

export function BrandIntro() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);
  const reveal = useSharedValue(0);
  const fadeOut = useSharedValue(1);
  const rotation = useSharedValue(0);
  const markSize = Math.min(width * 0.39, 174);

  useEffect(() => {
    reveal.value = withTiming(1, {
      duration: 850,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1_500,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );

    const introTimer = setTimeout(() => setExiting(true), INTRO_DURATION_MS);
    return () => {
      clearTimeout(introTimer);
      cancelAnimation(reveal);
      cancelAnimation(rotation);
    };
  }, [reveal, rotation]);

  useEffect(() => {
    if (!exiting) {
      return;
    }

    fadeOut.value = withTiming(0, {
      duration: FADE_DURATION_MS,
      easing: Easing.in(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
    const exitTimer = setTimeout(() => setVisible(false), FADE_DURATION_MS);
    return () => {
      clearTimeout(exitTimer);
      cancelAnimation(fadeOut);
    };
  }, [exiting, fadeOut]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: reveal.value * fadeOut.value,
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [
      { scale: interpolate(reveal.value, [0, 1], [0.82, 1]) },
      { translateY: interpolate(reveal.value, [0, 1], [16, 0]) },
    ],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0.25, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [12, 0]) }],
  }));
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      accessibilityViewIsModal
      accessibilityLabel="شاشة بدء المصحف الشريف"
      style={[styles.container, overlayStyle]}>
      <View pointerEvents="none" style={styles.background}>
        <View style={[styles.topGlow, { width: width * 1.28, height: width * 1.28 }]} />
        <View style={[styles.topArc, { width: width * 1.38, height: width * 1.28 }]} />
        <View style={[styles.sideGlow, { width: width * 0.8, height: width * 0.8 }]} />
        <View style={styles.bottomWaveBack} />
        <View style={styles.bottomWaveFront} />
        <MosqueSkyline width={width} height={height} />
      </View>

      <Animated.View
        style={[
          styles.emblem,
          {
            width: markSize,
            height: markSize * 1.08,
            top: height * 0.155,
          },
          markStyle,
        ]}>
        <View style={[styles.arch, { borderTopLeftRadius: markSize, borderTopRightRadius: markSize }]} />
        <View style={[styles.innerArch, { borderTopLeftRadius: markSize, borderTopRightRadius: markSize }]} />
        <View style={styles.crescent}>
          <View style={styles.crescentCutout} />
        </View>
        <Ionicons
          name="book-outline"
          size={markSize * 0.58}
          color={CREAM}
          style={styles.emblemBook}
        />
      </Animated.View>

      <Animated.View style={[styles.titleBlock, { top: height * 0.438 }, titleStyle]}>
        <Text style={[styles.title, { fontSize: width < 370 ? 31 : 37 }]}>المصحف الشريف</Text>
        <View style={styles.titleDivider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.loadingBlock, { top: height * 0.575 }, titleStyle]}>
        <View style={styles.loadingRing}>
          <Animated.View style={[styles.spinner, spinnerStyle]} />
          <Ionicons name="book-outline" size={35} color={CREAM} />
        </View>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dotDim]} />
          <View style={[styles.dot, styles.dotMid]} />
          <View style={[styles.dot, styles.dotBright]} />
        </View>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تخطي المقدمة"
        onPress={() => setExiting(true)}
        style={[styles.skipButton, { top: insets.top + 10 }]}>
        <Text style={styles.skipText}>تخطي</Text>
      </Pressable>
    </Animated.View>
  );
}

function MosqueSkyline({ width, height }: { width: number; height: number }) {
  return (
    <View pointerEvents="none" style={[styles.skyline, { height: height * 0.235 }]}>
      <View style={styles.skyGlow} />
      <Minaret left="8%" height={height * 0.15} />
      <Minaret left="47%" height={height * 0.19} />
      <Minaret left="82%" height={height * 0.23} />
      <Dome left="15%" width={width * 0.16} />
      <Dome left="27%" width={width * 0.13} />
      <Dome left="39%" width={width * 0.18} />
      <Dome left="50%" width={width * 0.31} />
      <Dome left="73%" width={width * 0.15} />
      <Dome left="87%" width={width * 0.18} />
      <View style={styles.skylineBase} />
    </View>
  );
}

function Dome({ left, width }: { left: string; width: number }) {
  return (
    <View style={[styles.domeGroup, { left, width, height: width * 0.82 }]}>
      <View style={[styles.domeRoof, { borderTopLeftRadius: width, borderTopRightRadius: width }]} />
      <View style={styles.domeBase} />
      <View style={styles.domeFinial} />
    </View>
  );
}

function Minaret({ left, height }: { left: string; height: number }) {
  return (
    <View style={[styles.minaret, { left, height }]}>
      <View style={styles.minaretNeedle} />
      <View style={styles.minaretCap} />
      <View style={styles.minaretUpper} />
      <View style={styles.minaretBalcony} />
      <View style={styles.minaretShaft} />
      <View style={styles.minaretBase} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    overflow: 'hidden',
    backgroundColor: '#012234',
  },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: '-42%',
    right: '-45%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,116,132,0.2)',
  },
  topArc: {
    position: 'absolute',
    top: '-43%',
    right: '-62%',
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopColor: 'rgba(238,193,111,0.85)',
    borderRadius: 999,
    transform: [{ rotate: '29deg' }],
  },
  sideGlow: {
    position: 'absolute',
    left: '-55%',
    bottom: '21%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,105,121,0.12)',
  },
  bottomWaveBack: {
    position: 'absolute',
    left: '-38%',
    bottom: '4%',
    width: '155%',
    height: '22%',
    borderRadius: 999,
    borderTopWidth: 1,
    borderTopColor: 'rgba(235,185,92,0.65)',
    backgroundColor: 'rgba(7,55,71,0.54)',
    transform: [{ rotate: '-9deg' }],
  },
  bottomWaveFront: {
    position: 'absolute',
    left: '-24%',
    bottom: '-8%',
    width: '150%',
    height: '20%',
    borderRadius: 999,
    backgroundColor: '#062B3A',
    transform: [{ rotate: '4deg' }],
  },
  emblem: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
  },
  arch: {
    position: 'absolute',
    top: 0,
    width: '72%',
    height: '73%',
    borderWidth: 4,
    borderBottomWidth: 0,
    borderColor: GOLD,
  },
  innerArch: {
    position: 'absolute',
    top: '15%',
    width: '58%',
    height: '61%',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,221,157,0.72)',
  },
  crescent: {
    position: 'absolute',
    top: '19%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GOLD,
  },
  crescentCutout: {
    position: 'absolute',
    top: -4,
    right: -7,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#012234',
  },
  emblemBook: {
    position: 'absolute',
    bottom: -3,
    alignSelf: 'center',
  },
  titleBlock: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    color: CREAM,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  titleDivider: {
    width: '62%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(229,184,95,0.82)',
  },
  dividerDiamond: {
    width: 11,
    height: 11,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  loadingBlock: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 16,
  },
  loadingRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(207,227,221,0.2)',
  },
  spinner: {
    ...StyleSheet.absoluteFill,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#FFD77F',
    borderRightColor: '#FFD77F',
    borderRadius: 53,
  },
  loadingText: {
    color: CREAM,
    fontSize: 22,
    fontWeight: '600',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotDim: {
    backgroundColor: 'rgba(215,232,224,0.34)',
  },
  dotMid: {
    backgroundColor: 'rgba(255,241,207,0.7)',
  },
  dotBright: {
    backgroundColor: '#FFD77F',
    shadowColor: '#FFD77F',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  skyline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  skyGlow: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    bottom: 0,
    height: '45%',
    borderRadius: 999,
    backgroundColor: 'rgba(209,157,70,0.12)',
  },
  skylineBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '10%',
    backgroundColor: '#062B3A',
  },
  domeGroup: {
    position: 'absolute',
    bottom: '7%',
  },
  domeRoof: {
    position: 'absolute',
    bottom: '25%',
    width: '100%',
    height: '75%',
    backgroundColor: SILHOUETTE,
  },
  domeBase: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '43%',
    backgroundColor: SILHOUETTE,
  },
  domeFinial: {
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    width: 3,
    height: 9,
    borderRadius: 2,
    backgroundColor: SILHOUETTE,
  },
  minaret: {
    position: 'absolute',
    bottom: '7%',
    width: 32,
  },
  minaretNeedle: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 2,
    height: '13%',
    backgroundColor: SILHOUETTE,
  },
  minaretCap: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 15,
    height: 18,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: SILHOUETTE,
  },
  minaretUpper: {
    position: 'absolute',
    top: '19%',
    alignSelf: 'center',
    width: 8,
    height: '36%',
    backgroundColor: SILHOUETTE,
  },
  minaretBalcony: {
    position: 'absolute',
    top: '51%',
    alignSelf: 'center',
    width: 29,
    height: 6,
    borderRadius: 3,
    backgroundColor: SILHOUETTE,
  },
  minaretShaft: {
    position: 'absolute',
    top: '55%',
    alignSelf: 'center',
    width: 11,
    height: '36%',
    backgroundColor: SILHOUETTE,
  },
  minaretBase: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 24,
    height: 7,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: SILHOUETTE,
  },
  skipButton: {
    position: 'absolute',
    left: 20,
    minWidth: 56,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  skipText: {
    color: 'rgba(255,244,220,0.72)',
    fontSize: 13,
    fontWeight: '600',
  },
});
