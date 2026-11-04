import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type ViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import type { SearchAnchor } from '@/features/home/components/home-search-results';
import { useTheme } from '@/hooks/use-theme';

type HomeHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchAnchorChange: (anchor: SearchAnchor) => void;
};

export function HomeHero({
  searchValue,
  onSearchChange,
  onSearchAnchorChange,
}: HomeHeroProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const searchContainerRef = useRef<ViewInstance>(null);
  const measureSearchAnchor = useCallback(() => {
    searchContainerRef.current?.measureInWindow((x, y, width, height) => {
      onSearchAnchorChange({ x, y, width, height });
    });
  }, [onSearchAnchorChange]);
  const handleSearchLayout = useCallback((_event: LayoutChangeEvent) => {
    requestAnimationFrame(measureSearchAnchor);
  }, [measureSearchAnchor]);

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Image
          source={require('../../../../assets/images/quran-hero.png')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={1000}
        />
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + Spacing.two }]}>
        <Animated.View entering={FadeInDown.duration(560).delay(100)} style={styles.topRow}>
          <View style={styles.welcomeGroup}>
            <View style={styles.brandMark}>
              <Image
                source={require('../../../../assets/images/icon.png')}
                contentFit="contain"
                style={styles.brandMarkImage}
                accessibilityLabel="شعار مصحف"
              />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.welcomeTitle}>مصحف</Text>
              <Text style={styles.welcomeSubtitle}>اقرأ القرآن وتصفّح سوره</Text>
            </View>
          </View>

          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الإعدادات"
              style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </Pressable>
          </Link>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(520).delay(220)} style={styles.searchEntry}>
          <View
            ref={searchContainerRef}
            onLayout={handleSearchLayout}
            style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              accessibilityLabel="ابحث باسم السورة أو آية أو كلمة من القرآن"
              placeholder="ابحث باسم السورة أو آية أو كلمة من القرآن..."
              placeholderTextColor={colors.textSecondary}
              value={searchValue}
              onChangeText={(value) => {
                onSearchChange(value);
                measureSearchAnchor();
              }}
              onFocus={measureSearchAnchor}
              style={[styles.searchInput, { color: colors.text }]}
              textAlign="right"
              returnKeyType="search"
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 236,
    width: '100%',
    overflow: 'visible',
    zIndex: 1000,
    elevation: 1000,
  },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
    paddingBottom: Spacing.three,
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(227,183,94,0.5)',
  },
  brandMarkImage: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
  },
  brandCopy: {
    gap: 3,
  },
  welcomeTitle: {
    fontSize: TypeScale.hero + 2,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
  },
  welcomeSubtitle: {
    fontSize: TypeScale.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  searchEntry: {
    width: '100%',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    height: 50,
    borderRadius: Radius.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
