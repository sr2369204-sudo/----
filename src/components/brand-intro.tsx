import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const IntroAnimationContext = createContext(false);

const INTRO_DURATION_MS = 1_800;
const FADE_DURATION_MS = 480;
/** Same navy as the native splash, so nothing flashes at the edges. */
const BACKDROP = '#012234';

const SPLASH_SOURCE = require('../../assets/images/splash-screen.png');

/**
 * The launch stage: the mosque-skyline splash picture (name, logo, gold divider
 * and the loading line are part of the picture) filling the screen. It matches
 * the native splash, so the hand-over from the system splash is seamless, then
 * fades out once the app is ready.
 */
export function BrandIntro({
  onReady,
  onFinished,
}: {
  onReady: () => void;
  onFinished: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);
  const didReportReady = useRef(false);
  const fadeOut = useSharedValue(1);

  const handleLayout = useCallback(() => {
    if (didReportReady.current) {
      return;
    }
    didReportReady.current = true;
    onReady();
  }, [onReady]);

  useEffect(() => {
    const introTimer = setTimeout(() => setExiting(true), INTRO_DURATION_MS);
    return () => clearTimeout(introTimer);
  }, []);

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

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      onLayout={handleLayout}
      pointerEvents={exiting ? 'none' : 'auto'}
      style={[styles.overlay, overlayStyle]}>
      <Image
        source={SPLASH_SOURCE}
        contentFit="cover"
        accessibilityLabel="المصحف الشريف"
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKDROP,
    zIndex: 10_000,
    elevation: 10_000,
  },
});
