import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { toArabicNumbers } from '@/features/home/utils/format';

export const KHATMA_GOLD = '#D8B56D';
export const KHATMA_GOLD_LIGHT = '#F3D28C';

/**
 * An eight-pointed star (two squares turned against each other), the shape of
 * the rub el hizb sign. Plain views, so it needs no native module.
 */
export function IslamicStar({
  size,
  color = KHATMA_GOLD,
  opacity = 1,
  filled = false,
  style,
}: {
  size: number;
  color?: string;
  opacity?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  // Both squares have their corners at half the box size from the centre, so the tips line up.
  const side = size / Math.SQRT2;
  const square: ViewStyle = {
    position: 'absolute',
    width: side,
    height: side,
    left: (size - side) / 2,
    top: (size - side) / 2,
    borderWidth: 1.5,
    borderColor: color,
    backgroundColor: filled ? color : 'transparent',
  };
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, opacity }, style]}>
      <View style={square} />
      <View style={[square, { transform: [{ rotate: '45deg' }] }]} />
    </View>
  );
}

/**
 * A ring that fills as the khatma moves on. `progress` runs from 0 to 1 and is
 * an Animated.Value so the caller decides how it moves. The two clipped halves
 * are turned by the native driver, no SVG is needed.
 */
export function KhatmaRing({
  progress,
  size = 120,
  thickness = 10,
  trackColor = 'rgba(255, 255, 255, 0.16)',
  color = KHATMA_GOLD,
  children,
}: {
  progress: Animated.Value;
  size?: number;
  thickness?: number;
  trackColor?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  const half = size / 2;
  const circle: ViewStyle = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: thickness,
    borderColor: 'transparent',
    borderTopColor: color,
    borderRightColor: color,
  };
  const rightTurn = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-135deg', '45deg', '45deg'],
  });
  const leftTurn = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['45deg', '45deg', '225deg'],
  });
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: thickness,
          borderColor: trackColor,
        }}
      />
      <View
        style={{ position: 'absolute', left: half, top: 0, width: half, height: size, overflow: 'hidden' }}
      >
        <Animated.View style={[circle, { left: -half, transform: [{ rotate: rightTurn }] }]} />
      </View>
      <View style={{ position: 'absolute', left: 0, top: 0, width: half, height: size, overflow: 'hidden' }}>
        <Animated.View style={[circle, { left: 0, transform: [{ rotate: leftTurn }] }]} />
      </View>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

/** Animates `fraction` (0..1) on mount and whenever it changes. */
export function useAnimatedFraction(fraction: number, from?: number, duration = 1100) {
  const [value] = useState(() => new Animated.Value(from ?? 0));
  const [text, setText] = useState(Math.round((from ?? 0) * 100));
  useEffect(() => {
    const id = value.addListener(({ value: v }) => setText(Math.round(v * 100)));
    const animation = Animated.timing(value, {
      toValue: fraction,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
      value.removeListener(id);
    };
  }, [duration, fraction, value]);
  return { value, percent: text };
}

/** A ring with the percentage and a faint star behind it. */
export function KhatmaPercentRing({
  fraction,
  from,
  size = 112,
  thickness = 9,
  caption,
}: {
  fraction: number;
  from?: number;
  size?: number;
  thickness?: number;
  caption?: string;
}) {
  const { value, percent } = useAnimatedFraction(fraction, from);
  return (
    <KhatmaRing progress={value} size={size} thickness={thickness}>
      <IslamicStar size={size - thickness * 2 - 10} opacity={0.22} />
      <Text style={[styles.percent, { fontSize: size * 0.26 }]}>{toArabicNumbers(percent)}٪</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </KhatmaRing>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill as object,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontWeight: '900',
    color: KHATMA_GOLD_LIGHT,
    fontVariant: ['tabular-nums'],
  },
  caption: { fontSize: 10, color: 'rgba(239, 248, 243, 0.75)' },
});
