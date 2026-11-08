/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Main text. */
    text: '#12211C',
    /** Page background: cool, light, so white cards read as raised. */
    background: '#EFF4F1',
    backgroundElement: '#FFFFFF',
    /** Tinted wash used behind icon chips and selected surfaces. */
    backgroundSelected: '#DCEDE5',
    /** Secondary text. */
    textSecondary: '#6C7D76',
    /** Brand emerald. */
    primary: '#0E7A57',
    /** Pressed/darker emerald. */
    primaryDark: '#0A5C42',
    /** Content that sits on top of `primary`. */
    onPrimary: '#FFFFFF',
    /** Gold accent for highlights and premium touches. */
    accent: '#C9973C',
    /** Raised surface (cards). */
    surface: '#FFFFFF',
    /** Translucent surface for frosted-glass cards. */
    glassSurface: 'rgba(255,255,255,0.84)',
    glassOverlaySurface: 'rgba(255,255,255,0.96)',
    glassBorder: 'rgba(255,255,255,0.9)',
    /** Hairline dividers and card outlines. */
    border: '#E1E9E5',
  },
  dark: {
    text: '#F3F8F5',
    background: '#0A2419',
    backgroundElement: '#0F3324',
    backgroundSelected: '#1E332B',
    textSecondary: '#98ABA3',
    primary: '#2FBF90',
    primaryDark: '#1E8E69',
    onPrimary: '#06120D',
    accent: '#E3B75E',
    surface: '#0E2D20',
    glassSurface: 'rgba(14,45,32,0.86)',
    glassOverlaySurface: 'rgba(14,45,32,0.96)',
    glassBorder: 'rgba(255,255,255,0.12)',
    border: '#1E3D2E',
  },
} as const;

/**
 * Arabic UI type scale. Sizes are deliberately few so the interface keeps a
 * single, consistent typographic voice across screens.
 */
export const TypeScale = {
  /** Hero figures and screen-defining headings. */
  hero: 23,
  /** Section titles. */
  display: 20,
  /** Sub-section titles. */
  title: 18,
  /** Item headings such as a surah name. */
  heading: 16,
  /** Default reading size. */
  body: 14,
  /** Labels and controls. */
  label: 13,
  /** Supporting captions and meta lines. */
  caption: 12,
  /** Smallest supporting text. */
  micro: 11,
} as const;

/** Corner radii. Cards sit between `lg` and `xl`, inner elements use `sm`/`md`. */
export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
