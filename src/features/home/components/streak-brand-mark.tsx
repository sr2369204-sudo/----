import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { toArabicNumbers } from '@/features/home/utils/format';

const FIRST_DELAY_MS = 1400;
const EVERY_MS = 45_000;
const SHOWN_MS = 4200;

/** The streak in correct Arabic: one, the dual, 3 to 10 as plural, 11 and up as a singular noun. */
export function streakPhrase(streak: number): string {
  if (streak === 1) {
    return 'يوم متتالٍ';
  }
  if (streak === 2) {
    return 'يومان متتاليان';
  }
  if (streak <= 10) {
    return `${toArabicNumbers(streak)} أيام متتالية`;
  }
  return `${toArabicNumbers(streak)} يومًا متتاليًا`;
}

/**
 * Drives the streak moment in the home header. Returns a 0..1 value that is 1
 * while the flame badge is showing. It plays shortly after opening and then
 * now and then, and never when there is no streak.
 */
export function useStreakMoment(streak: number): Animated.Value {
  const [show] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (streak <= 0) {
      return undefined;
    }
    let animation: Animated.CompositeAnimation | null = null;
    const play = () => {
      animation = Animated.sequence([
        Animated.spring(show, { toValue: 1, friction: 5, tension: 110, useNativeDriver: true }),
        Animated.delay(SHOWN_MS),
        Animated.timing(show, {
          toValue: 0,
          duration: 360,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      animation.start();
    };
    const first = setTimeout(play, FIRST_DELAY_MS);
    const repeat = setInterval(play, EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(repeat);
      animation?.stop();
    };
  }, [streak, show]);

  return show;
}

/**
 * The header mark: the app icon normally, and a flame badge with the streak
 * number while `show` is 1. Only transforms and opacity animate, on the native
 * driver, so it adds no layout work.
 */
export function StreakBrandMark({
  streak,
  show,
  children,
}: {
  streak: number;
  show: Animated.Value;
  children: ReactNode;
}) {
  const [flicker] = useState(() => new Animated.Value(0));
  const [glow] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (streak <= 0) {
      return undefined;
    }
    const loops = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(flicker, {
            toValue: 1,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(flicker, {
            toValue: 0,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.timing(glow, {
          toValue: 1,
          duration: 1300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ]);
    loops.start();
    return () => loops.stop();
  }, [streak, flicker, glow]);

  const shown = show.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.box}>
      <Animated.View
        style={[
          styles.layer,
          {
            opacity: show.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }),
            transform: [{ scale: show.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) }],
          },
        ]}
      >
        {children}
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.layer,
          styles.badge,
          {
            opacity: show.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0, 0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              { scale: show.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
              { rotate: show.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] }) },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] }) }],
            },
          ]}
        />
        <Animated.View
          style={{
            opacity: shown,
            transform: [
              { scaleY: flicker.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
              { scaleX: flicker.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) },
              { translateY: flicker.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
            ],
          }}
        >
          <Ionicons name="flame" size={36} color="#F3D28C" />
        </Animated.View>
        <Text style={styles.number}>{toArabicNumbers(streak)}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 48, height: 48 },
  layer: { ...(StyleSheet.absoluteFill as object), alignItems: 'center', justifyContent: 'center' },
  badge: {
    borderRadius: 16,
    backgroundColor: '#0F5640',
    borderWidth: 1.5,
    borderColor: '#F3D28C',
  },
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D8B56D',
  },
  number: {
    position: 'absolute',
    bottom: 5,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF9EA',
    textShadowColor: 'rgba(4,26,20,0.95)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
});
