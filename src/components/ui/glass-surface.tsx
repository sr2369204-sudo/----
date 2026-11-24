import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useIsDarkTheme } from '@/hooks/use-theme';

export type GlassVariant = 'ivory' | 'emerald';

type GlassPalette = {
  background: string;
  border: string;
  highlight: string;
  shadowColor: string;
  shadowOpacity: number;
};

/**
 * Opaque surfaces keep text and controls legible on Android builds without the
 * native gradient module.
 */
const PALETTES: Record<'light' | 'dark', Record<GlassVariant, GlassPalette>> = {
  light: {
    ivory: {
      background: '#FFFDF8',
      border: '#E7E5D9',
      highlight: '#E5C77F',
      shadowColor: '#0B3B2C',
      shadowOpacity: 0.1,
    },
    emerald: {
      background: '#0D6048',
      border: '#28745B',
      highlight: '#D8B56D',
      shadowColor: '#03150F',
      shadowOpacity: 0.2,
    },
  },
  dark: {
    ivory: {
      background: '#0E2D20',
      border: '#1E3D2E',
      highlight: '#806B3C',
      shadowColor: '#000000',
      shadowOpacity: 0.35,
    },
    emerald: {
      background: '#0B4030',
      border: '#23634D',
      highlight: '#806B3C',
      shadowColor: '#000000',
      shadowOpacity: 0.4,
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
          // The shadow follows the shell, so it needs the same rounded corners
          // as the card or it shows as a square halo behind it.
          borderRadius: radius,
        },
        style,
      ]}>
      <View style={[styles.clip, { backgroundColor: palette.background, borderRadius: radius }]}>
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
