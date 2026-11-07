import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from '@/components/ui/optional-native-views';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useAmbientLoop } from '@/hooks/use-ambient-loop';
import type { SearchAnchor } from '@/features/home/components/home-search-results';

const GRAIN_SOURCE = require('../../../../assets/images/glass-grain.png');
const HERO_IMAGE = require('../../../../assets/images/quran-hero.png');

/** Visual height of the hero band, on top of which the status-bar inset is added. */
const HERO_HEIGHT = 210;

/** Light foreground colours that sit on the dark glass search bar. */
const SEARCH_TEXT_COLOR = '#FFF9EA';
const SEARCH_PLACEHOLDER_COLOR = 'rgba(239,248,243,0.55)';
const SEARCH_ICON_COLOR = '#E8C77F';

type HomeHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchAnchorChange: (anchor: SearchAnchor) => void;
};

/**
 * The home header: the Qur'an hero photograph in a rounded, gold-rimmed frame
 * with a grain layer, carrying the greeting, settings entry and the app-wide
 * search on a frosted glass bar.
 */
export function HomeHero({
  searchValue,
  onSearchChange,
  onSearchAnchorChange,
}: HomeHeroProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const searchContainerRef = useRef<ViewInstance>(null);
  // A very slow drift keeps the photograph alive without ever stealing focus
  // from the search bar that sits on top of it.
  const drift = useAmbientLoop(22_000);
  // A light band passes across the photograph every few seconds.
  const sheen = useAmbientLoop(7_000, 1_400, false);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(drift.value, [0, 1], [1.06, 1.16]) },
      { translateX: interpolate(drift.value, [0, 1], [-8, 8]) },
      { translateY: interpolate(drift.value, [0, 1], [5, -5]) },
    ],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sheen.value, [0, 1], [-160, screenWidth + 160]) },
      { rotate: '14deg' },
    ],
    opacity: interpolate(sheen.value, [0, 0.08, 0.62, 0.78], [0, 1, 1, 0], 'clamp'),
  }));

  const measureSearchAnchor = useCallback(() => {
    searchContainerRef.current?.measureInWindow((x, y, width, height) => {
      onSearchAnchorChange({ x, y, width, height });
    });
  }, [onSearchAnchorChange]);
  const handleSearchLayout = useCallback((_event: LayoutChangeEvent) => {
    requestAnimationFrame(measureSearchAnchor);
  }, [measureSearchAnchor]);

  return (
    <View style={[styles.shell, { height: HERO_HEIGHT + insets.top }]}>
      <View style={styles.frame}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, imageStyle]}>
          <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" transition={600} />
        </Animated.View>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.imageScrim]} />
        <Image
          source={GRAIN_SOURCE}
          resizeMode="repeat"
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.grain]}
        />
        <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.26)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <View style={[styles.content, { paddingTop: insets.top + Spacing.three }]}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <View style={styles.brandMark}>
              <Image
                source={require('../../../../assets/images/icon.png')}
                contentFit="contain"
                style={styles.brandMarkImage}
                accessibilityLabel="شعار مصحف"
              />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.title}>مصحف</Text>
              <Text style={styles.subtitle}>اقرأ القرآن وتدبّر آياته</Text>
            </View>
          </View>

          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الإعدادات"
              style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
              <Ionicons name="settings-outline" size={22} color="#FFF" />
            </Pressable>
          </Link>
        </View>

        <View style={styles.searchEntry}>
          <View
            ref={searchContainerRef}
            onLayout={handleSearchLayout}
            collapsable={false}
            style={styles.searchBar}>
            <Ionicons name="search" size={19} color={SEARCH_ICON_COLOR} style={styles.searchIcon} />
            <TextInput
              accessibilityLabel="ابحث باسم السورة أو آية أو كلمة من القرآن"
              placeholder="ابحث باسم السورة أو آية أو كلمة..."
              placeholderTextColor={SEARCH_PLACEHOLDER_COLOR}
              value={searchValue}
              onChangeText={(value) => {
                onSearchChange(value);
                measureSearchAnchor();
              }}
              onFocus={measureSearchAnchor}
              style={[styles.searchInput, { color: SEARCH_TEXT_COLOR }]}
              textAlign="right"
              returnKeyType="search"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: -Spacing.three,
    zIndex: 1000,
    elevation: 1000,
  },
  frame: {
    ...StyleSheet.absoluteFill,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.5)',
  },
  imageScrim: {
    backgroundColor: 'rgba(4,26,20,0.34)',
  },
  grain: {
    opacity: 0.22,
  },
  sheen: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    left: 0,
    width: 90,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identity: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(227,183,94,0.5)',
  },
  brandMarkImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  brandCopy: {
    flexShrink: 1,
    gap: 2,
  },
  title: {
    fontSize: TypeScale.hero + 2,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: TypeScale.caption,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'right',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  searchEntry: {
    width: '100%',
  },
  searchBar: {
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: '#0B382D',
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  searchIcon: {
    marginLeft: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '600',
  },
});
