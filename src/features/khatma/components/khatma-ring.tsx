import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { toArabicNumbers } from '@/features/home/utils/format';

export const KHATMA_GOLD = '#D8B56D';
export const KHATMA_GOLD_LIGHT = '#F3D28C';

/**
 * A mihrab arch outline: a pointed-round top over straight sides, with a second
 * arch inside it. Used as a faint watermark. Plain views, no native module.
 */
export function IslamicArch({
  width,
  color = KHATMA_GOLD,
  opacity = 1,
  style,
}: {
  width: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const height = width * 1.45;
  const arch = (w: number, h: number, inset: number): ViewStyle => ({
    position: 'absolute',
    left: inset,
    top: inset,
    width: w,
    height: h,
    borderWidth: 1.5,
    borderColor: color,
    borderTopLeftRadius: w / 2,
    borderTopRightRadius: w / 2,
    borderBottomWidth: 0,
  });
  return (
    <View pointerEvents="none" style={[{ width, height, opacity }, style]}>
      <View style={arch(width, height, 0)} />
      <View style={arch(width - 16, height - 16, 8)} />
      <View style={arch(width - 32, height - 32, 16)} />
    </View>
  );
}

/** A ring of small beads, like a tasbih, in a box of `size`. */
export function BeadsRing({
  size,
  count = 36,
  color = KHATMA_GOLD,
  opacity = 0.5,
  bead = 3,
}: {
  size: number;
  count?: number;
  color?: string;
  opacity?: number;
  bead?: number;
}) {
  const radius = size / 2 - bead;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: bead,
              height: bead,
              borderRadius: bead / 2,
              backgroundColor: color,
              left: size / 2 + Math.cos(angle) * radius - bead / 2,
              top: size / 2 + Math.sin(angle) * radius - bead / 2,
            }}
          />
        );
      })}
    </View>
  );
}

/** A few thin concentric circles, a calm round pattern for backgrounds. */
export function ConcentricRings({
  size,
  color = KHATMA_GOLD,
  opacity = 0.12,
  style,
}: {
  size: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, opacity }, style]}>
      {[1, 0.78, 0.56, 0.34].map((scale) => (
        <View
          key={scale}
          style={{
            position: 'absolute',
            width: size * scale,
            height: size * scale,
            left: (size - size * scale) / 2,
            top: (size - size * scale) / 2,
            borderRadius: size,
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
      ))}
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

/** A ring with the percentage in its middle and a band of beads around it. */
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
  const outer = size + 18;
  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      <BeadsRing size={outer} count={Math.round(outer / 4)} />
      <KhatmaRing progress={value} size={size} thickness={thickness}>
        <View style={styles.percentBox}>
          <Text style={[styles.percent, { fontSize: size * 0.26 }]}>{toArabicNumbers(percent)}٪</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      </KhatmaRing>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontWeight: '900',
    color: KHATMA_GOLD_LIGHT,
    fontVariant: ['tabular-nums'],
  },
  percentBox: { alignItems: 'center', justifyContent: 'center' },
  caption: { fontSize: 10, color: 'rgba(239, 248, 243, 0.75)' },
});
