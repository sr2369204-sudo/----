/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Main text: deep green-tinted charcoal. */
    text: '#172B24',
    /** Warm ivory page background. */
    background: '#F8F7F2',
    backgroundElement: '#FFFFFF',
    /** Subtle surface: barely-there emerald wash used behind small badges. */
    backgroundSelected: '#EDF3EE',
    /** Secondary text. */
    textSecondary: '#858B84',
    /** Deep emerald. */
    primary: '#126B50',
    /** Pressed/darker emerald. */
    primaryDark: '#0C4939',
    /** Gold accent, used sparingly. */
    accent: '#B68A3A',
    /** Raised surface. */
    surface: '#FFFFFF',
    /** Hairline dividers. */
    border: '#E9E8E1',
  },
  dark: {
    text: '#F4EFE2',
    background: '#131109',
    backgroundElement: '#1F1A11',
    backgroundSelected: '#2F2717',
    textSecondary: '#B7A98B',
    primary: '#D9A94A',
    primaryDark: '#B4883C',
    accent: '#C9803F',
    surface: '#1F1A11',
    border: '#3B3220',
  },
} as const;

/**
 * Arabic UI type scale. Sizes are deliberately few so the interface keeps a
 * single, consistent typographic voice across screens.
 */
export const TypeScale = {
  /** Screen-defining headings. */
  display: 22,
  /** Section titles. */
  title: 19,
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
