import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useIsDarkTheme } from '@/hooks/use-theme';

/** Fine grain tile that gives every glass layer its frosted, textured feel. */
const GRAIN_SOURCE = require('../../../assets/images/glass-grain.png');

export type GlassVariant = 'ivory' | 'emerald';

type GlassPalette = {
  tint: readonly [string, string, ...string[]];
  border: string;
  highlight: string;
  sheen: string;
  grainOpacity: number;
  shadowColor: string;
  shadowOpacity: number;
};

/**
 * Two deliberately separate glass recipes: warm ivory panels for content that
 * sits on the page, and a deep emerald slab for the focused, ceremonial cards.
 */
const PALETTES: Record<'light' | 'dark', Record<GlassVariant, GlassPalette>> = {
  light: {
    ivory: {
      tint: ['rgba(255,253,247,0.88)', 'rgba(244,239,227,0.76)'],
      border: 'rgba(255,255,255,0.9)',
      highlight: 'rgba(201,151,60,0.32)',
      sheen: 'rgba(255,255,255,0.95)',
      grainOpacity: 0.5,
      shadowColor: '#0B3B2C',
      shadowOpacity: 0.14,
    },
    emerald: {
      tint: ['rgba(20,94,72,0.96)', 'rgba(8,49,38,0.97)'],
      border: 'rgba(216,181,109,0.34)',
      highlight: 'rgba(232,199,127,0.55)',
      sheen: 'rgba(255,255,255,0.2)',
      grainOpacity: 0.5,
      shadowColor: '#03150F',
      shadowOpacity: 0.3,
    },
  },
  dark: {
    ivory: {
      tint: ['rgba(26,41,34,0.88)', 'rgba(13,23,19,0.86)'],
      border: 'rgba(255,255,255,0.1)',
      highlight: 'rgba(227,183,94,0.26)',
      sheen: 'rgba(255,255,255,0.14)',
      grainOpacity: 0.6,
      shadowColor: '#000000',
      shadowOpacity: 0.5,
    },
    emerald: {
      tint: ['rgba(17,82,62,0.94)', 'rgba(6,40,31,0.96)'],
      border: 'rgba(216,181,109,0.28)',
      highlight: 'rgba(232,199,127,0.45)',
      sheen: 'rgba(255,255,255,0.16)',
      grainOpacity: 0.55,
      shadowColor: '#000000',
      shadowOpacity: 0.55,
    },
  },
};

type GlassSurfaceProps = {
  children?: ReactNode;
  /** Applied to the outer shell so callers control margins, flex and size. */
  style?: StyleProp<ViewStyle>;
  /** Applied to the clipped inner layer so callers control padding. */
  contentStyle?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  radius?: number;
  /** Blur strength on platforms that support a real backdrop blur. */
  intensity?: number;
  sheen?: boolean;
  grain?: boolean;
  borderColor?: string;
  highlightColor?: string;
  shadow?: boolean;
  accessibilityLabel?: string;
};

/**
 * Premium textured liquid-glass surface: a blurred backdrop, a graded tint, a
 * light sheen, a hairline rim and a fine grain overlay. Everything visual lives
 * here so screens only describe layout.
 */
export function GlassSurface({
  children,
  style,
  contentStyle,
  variant = 'ivory',
  radius = Radius.xl,
  intensity = 40,
  sheen = true,
  grain = true,
  borderColor,
  highlightColor,
  shadow = true,
  accessibilityLabel,
}: GlassSurfaceProps) {
  const isDark = useIsDarkTheme();
  const palette = PALETTES[isDark ? 'dark' : 'light'][variant];

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        shadow && {
          shadowColor: palette.shadowColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: palette.shadowOpacity,
          shadowRadius: 20,
          elevation: 8,
        },
        style,
      ]}>
      <View style={[styles.clip, { borderRadius: radius }]}>
        {Platform.OS !== 'android' && (
          <BlurView
            intensity={intensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        <LinearGradient
          colors={palette.tint}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {sheen && (
          <LinearGradient
            colors={[palette.sheen, 'rgba(255,255,255,0)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.4, y: 1 }}
            style={styles.sheen}
          />
        )}

        {grain && (
          <Image
            source={GRAIN_SOURCE}
            resizeMode="repeat"
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: palette.grainOpacity }]}
          />
        )}

        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.rim,
            { borderRadius: radius, borderColor: borderColor ?? palette.border },
          ]}
        />

        <View style={[styles.topEdge, { backgroundColor: highlightColor ?? palette.highlight }]} />

        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
  },
  rim: {
    borderWidth: 1,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth * 3,
    opacity: 0.9,
  },
});
