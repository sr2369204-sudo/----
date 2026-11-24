import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

export const IntroAnimationContext = createContext(false);

const INTRO_DURATION_MS = 2_200;
const FADE_DURATION_MS = 480;
/** Same navy as the native splash, so nothing flashes at the edges. */
const BACKDROP = '#012234';
const GOLD = '#E5B85F';
const CREAM = '#FFF6E2';

/** Logo geometry (a mihrab-shaped dome, crescent and an open book) in its own 388 x 332 box. */
const LOGO_VIEWBOX = '190 238 388 332';
const LOGO_ASPECT = 388 / 332;

/**
 * The launch stage, drawn entirely in code: a night-teal backdrop with gold
 * light curves, a mosque skyline glowing on the horizon, the logo, the name in
 * real text, a gold divider and a small loading ring. No picture is used, so it
 * stays sharp on every screen and the colours follow this file.
 */
export function BrandIntro({
  onReady,
  onFinished,
}: {
  onReady: () => void;
  onFinished: () => void;
}) {
  const dimensions = useWindowDimensions();
  // Some web previews report 0 until the first resize, so fall back to a phone size.
  const width = dimensions.width || 390;
  const height = dimensions.height || 800;
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);
  const didReportReady = useRef(false);
  const fadeOut = useSharedValue(1);
  const reveal = useSharedValue(0);
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);

  const handleLayout = useCallback(() => {
    if (didReportReady.current) {
      return;
    }
    didReportReady.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    reveal.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
    spin.value = withRepeat(
      withTiming(1, { duration: 1_300, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 1_200, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
      false,
    );
    const introTimer = setTimeout(() => setExiting(true), INTRO_DURATION_MS);
    return () => {
      clearTimeout(introTimer);
      cancelAnimation(reveal);
      cancelAnimation(spin);
      cancelAnimation(pulse);
    };
  }, [pulse, reveal, spin]);

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

  const overlayStyle = useAnimatedStyle(() => ({ opacity: fadeOut.value }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 1], [0, 1]),
    transform: [{ translateY: interpolate(reveal.value, [0, 1], [14, 0]) }],
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(spin.value, [0, 1], [0, 360])}deg` }],
  }));

  if (!visible) {
    return null;
  }

  const logoWidth = Math.min(width * 0.6, height * 0.3, 280);
  const titleSize = Math.round(Math.min(width * 0.1, height * 0.06, 44));

  return (
    <Animated.View
      onLayout={handleLayout}
      pointerEvents={exiting ? 'none' : 'auto'}
      accessibilityLabel="المصحف الشريف"
      style={[styles.overlay, overlayStyle]}>
      <Backdrop />

      <Animated.View
        style={[styles.content, { paddingTop: Math.max(height * 0.12, 40) }, contentStyle]}>
        <Svg width={logoWidth} height={logoWidth / LOGO_ASPECT} viewBox={LOGO_VIEWBOX}>
          <Logo />
        </Svg>

        <Text style={[styles.title, { fontSize: titleSize, marginTop: 14 }]}>المصحف الشريف</Text>

        <Svg width={Math.min(width * 0.7, 300)} height={14} viewBox="0 0 330 14" style={styles.divider}>
          <Defs>
            <LinearGradient id="lineL" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GOLD} stopOpacity="0" />
              <Stop offset="1" stopColor={GOLD} stopOpacity="0.9" />
            </LinearGradient>
            <LinearGradient id="lineR" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GOLD} stopOpacity="0.9" />
              <Stop offset="1" stopColor={GOLD} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="6.5" width="148" height="1.2" fill="url(#lineL)" />
          <Rect x="182" y="6.5" width="148" height="1.2" fill="url(#lineR)" />
          <Polygon points="165,0 174,7 165,14 156,7" fill={GOLD} />
        </Svg>

        <View style={styles.ring}>
          <Svg width={64} height={64} viewBox="0 0 64 64" style={StyleSheet.absoluteFill}>
            <Circle cx="32" cy="32" r="29" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" fill="rgba(255,255,255,0.03)" />
          </Svg>
          <Animated.View style={[StyleSheet.absoluteFill, spinStyle]}>
            <Svg width={64} height={64} viewBox="0 0 64 64">
              <Circle
                cx="32"
                cy="32"
                r="29"
                stroke={GOLD}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="46 200"
              />
            </Svg>
          </Animated.View>
          <Ionicons name="book-outline" size={22} color={CREAM} />
        </View>

        <Text style={styles.loading}>جارٍ التحميل…</Text>

        <View style={styles.dots}>
          <Dot pulse={pulse} offset={0} />
          <Dot pulse={pulse} offset={0.33} />
          <Dot pulse={pulse} offset={0.66} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function Dot({ pulse, offset }: { pulse: SharedValue<number>; offset: number }) {
  const style = useAnimatedStyle(() => {
    const phase = (pulse.value + offset) % 1;
    return { opacity: interpolate(phase, [0, 0.5, 1], [0.35, 1, 0.35]) };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

/** The mihrab dome, crescent, open book and ribbon, in gold and cream. */
function Logo() {
  return (
    <>
      <Defs>
        <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F6DA9A" />
          <Stop offset="0.55" stopColor="#E3B25A" />
          <Stop offset="1" stopColor="#B9812E" />
        </LinearGradient>
        <LinearGradient id="page" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFBF0" />
          <Stop offset="1" stopColor="#E9DCC0" />
        </LinearGradient>
      </Defs>
      <Path
        d="M 262 428 L 262 374 C 262 320 322 288 384 252 C 446 288 506 320 506 374 L 506 428"
        stroke="url(#gold)"
        strokeWidth="16"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="381" cy="362" r="35" fill="url(#gold)" />
      <Circle cx="396" cy="355" r="31" fill="#02222F" />
      <Polygon points="192,496 240,424 384,504 528,424 576,496 384,566" fill="url(#gold)" />
      <Polygon points="234,474 384,542 534,474 534,492 384,558 234,492" fill="#03222E" />
      <Path d="M 246 434 Q 318 410 384 488 L 384 534 Q 316 470 240 468 Z" fill="url(#page)" />
      <Path d="M 522 434 Q 450 410 384 488 L 384 534 Q 452 470 528 468 Z" fill="url(#page)" />
      <Path d="M 448 524 L 474 512 L 474 570 L 461 557 L 448 570 Z" fill="url(#gold)" />
    </>
  );
}

/** Night sky, gold light curves and a glowing skyline, in a 768 x 1365 space that is cropped to fit any screen. */
function Backdrop() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 768 1365"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#02202F" />
          <Stop offset="0.6" stopColor="#06303F" />
          <Stop offset="0.85" stopColor="#0E4A59" />
          <Stop offset="1" stopColor="#0A3A48" />
        </LinearGradient>
        <RadialGradient
          id="horizon"
          cx="500"
          cy="1235"
          r="430"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(500 1235) scale(1 0.7) translate(-500 -1235)">
          <Stop offset="0" stopColor="#F4B648" stopOpacity="0.75" />
          <Stop offset="0.45" stopColor="#E09A3A" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#E09A3A" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="topCurve" x1="380" y1="0" x2="768" y2="330" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#4FB7C9" stopOpacity="0" />
          <Stop offset="0.55" stopColor="#E8B65A" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#FFE2A0" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="leftCurve" x1="0" y1="925" x2="400" y2="1180" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE2A0" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#E8B65A" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="leftCurve2" x1="0" y1="1035" x2="470" y2="1262" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE2A0" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#E8B65A" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width="768" height="1365" fill="url(#sky)" />

      <Path d="M 300 0 C 520 30 700 150 768 330 L 768 0 Z" fill="#0B4A5C" fillOpacity="0.55" />
      <Path d="M 300 0 C 520 30 700 150 768 330" stroke="url(#topCurve)" strokeWidth="14" strokeOpacity="0.25" fill="none" />
      <Path d="M 300 0 C 520 30 700 150 768 330" stroke="url(#topCurve)" strokeWidth="3.5" fill="none" />

      <Path d="M 0 925 C 80 1010 200 1090 340 1130 L 0 1130 Z" fill="#0A3F4F" fillOpacity="0.5" />
      <Path d="M 0 925 C 80 1010 200 1090 340 1130" stroke="url(#leftCurve)" strokeWidth="3.5" fill="none" />
      <Path d="M 0 1035 C 150 1050 330 1170 470 1262" stroke="url(#leftCurve2)" strokeWidth="3" fill="none" />

      <Rect x="0" y="0" width="768" height="1365" fill="url(#horizon)" />

      <Path d="M 652 975 Q 665 940 678 975 Z" fill="#06303E" />
      <Circle cx="665" cy="955" r="9" fill="none" stroke="#0A3F50" strokeWidth="3" />
      <Rect x="654" y="975" width="22" height="56" fill="#06303E" />
      <Rect x="640" y="1030" width="50" height="16" rx="4" fill="#06303E" />
      <Rect x="647" y="1046" width="36" height="210" fill="#06303E" />

      <Path d="M 505 1215 Q 505 1112 570 1106 Q 635 1112 635 1215 Z" fill="#06303E" />
      <Rect x="568" y="1086" width="4" height="22" fill="#06303E" />
      <Circle cx="570" cy="1080" r="8" fill="none" stroke="#0A3F50" strokeWidth="3" />
      <Rect x="498" y="1205" width="144" height="60" fill="#06303E" />

      <Path d="M 700 1255 Q 700 1172 726 1168 Q 752 1172 752 1255 Z" fill="#06303E" />
      <Path d="M 445 1245 Q 445 1178 473 1174 Q 501 1178 501 1245 Z" fill="#06303E" />
      <Path d="M 420 1250 Q 420 1205 436 1203 Q 452 1205 452 1250 Z" fill="#06303E" />
      <Path d="M 330 1250 Q 330 1198 348 1196 Q 366 1198 366 1250 Z" fill="#06303E" />
      <Path d="M 380 1105 Q 393 1078 406 1105 Z" fill="#06303E" />
      <Rect x="382" y="1105" width="22" height="150" fill="#06303E" />
      <Rect x="376" y="1170" width="34" height="10" rx="3" fill="#06303E" />

      <Path d="M 0 1218 Q 190 1178 400 1238 Q 600 1276 768 1208 L 768 1365 L 0 1365 Z" fill="#042430" />
      <Path d="M 0 1218 Q 190 1178 400 1238 Q 600 1276 768 1208" stroke="#E8B65A" strokeOpacity="0.25" strokeWidth="2" fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKDROP,
    zIndex: 10_000,
    elevation: 10_000,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: CREAM,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  divider: {
    marginTop: 14,
  },
  ring: {
    width: 64,
    height: 64,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    marginTop: 16,
    fontSize: 15,
    color: 'rgba(255,246,226,0.85)',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CREAM,
  },
});
