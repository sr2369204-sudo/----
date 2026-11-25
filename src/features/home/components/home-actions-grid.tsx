import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useAmbientLoop } from '@/hooks/use-ambient-loop';
import { useTheme } from '@/hooks/use-theme';

type ActionItem = {
  id: string;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: Href;
};

/**
 * A single row of quick destinations. Reading itself lives in the hero card
 * above, so these stay as compact, always-visible shortcuts.
 */
export function HomeActionsGrid({ savedWordsCount }: { savedWordsCount?: number }) {
  const colors = useTheme();

  const actions: ActionItem[] = [
    {
      id: 'saved',
      label: 'المحفوظات',
      sublabel: savedWordsCount !== undefined ? `${toArabicNumbers(savedWordsCount)} كلمة` : 'كلماتك',
      icon: 'bookmark',
      color: colors.accent,
      href: '/saved-words',
    },
    {
      id: 'bookmarks',
      label: 'الإشارات',
      sublabel: 'الآيات',
      icon: 'bookmarks',
      color: '#C07A44',
      href: '/bookmarks',
    },
    {
      id: 'tajweed',
      label: 'التجويد',
      sublabel: 'أحكام',
      icon: 'library',
      color: colors.primary,
      href: '/tajweed',
    },
    {
      id: 'azkar',
      label: 'الأذكار',
      sublabel: 'صباح ومساء',
      icon: 'sunny',
      color: '#C9A24B',
      href: '/azkar',
    },
    {
      id: 'khatma',
      label: 'الختمة',
      sublabel: 'متتبع',
      icon: 'trophy',
      color: '#2A8563',
      href: '/khatma',
    },
    {
      id: 'library',
      label: 'المكتبة',
      sublabel: 'السور',
      icon: 'grid',
      color: '#9A762F',
      href: '/library',
    },
  ];

  return (
    <View style={styles.grid}>
      {[actions.slice(0, 3), actions.slice(3)].map((rowActions, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {rowActions.map((action, index) => (
            <ActionTile key={action.id} action={action} index={rowIndex * 3 + index} />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * One shortcut card. Only the icon is animated: a soft halo breathes out from
 * behind the glyph while the glyph itself lifts and settles. The card, its text
 * and its layout stay perfectly still.
 */
function ActionTile({ action, index }: { action: ActionItem; index: number }) {
  const colors = useTheme();
  const halo = useAmbientLoop(2_900 + index * 240, index * 300);
  const icon = useAmbientLoop(3_600 + index * 260, index * 240);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(halo.value, [0, 1], [0.34, 0]),
    transform: [{ scale: interpolate(halo.value, [0, 1], [0.72, 1.65]) }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(icon.value, [0, 1], [1, 1.1]) },
      { translateY: interpolate(icon.value, [0, 1], [0, -1.5]) },
    ],
  }));

  return (
    <View style={styles.cell}>
      <Link href={action.href} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
          <GlassSurface radius={Radius.lg} contentStyle={styles.tile}>
            <View style={styles.iconSlot}>
              <Animated.View
                style={[styles.iconHalo, { backgroundColor: action.color }, haloStyle]}
              />
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: `${action.color}1F`, borderColor: `${action.color}3D` },
                ]}>
                <Animated.View style={iconStyle}>
                  <Ionicons name={action.icon} size={19} color={action.color} />
                </Animated.View>
              </View>
            </View>
            <Text numberOfLines={1} style={[styles.label, { color: colors.text }]}>
              {action.label}
            </Text>
            <Text numberOfLines={1} style={[styles.sublabel, { color: colors.textSecondary }]}>
              {action.sublabel}
            </Text>
          </GlassSurface>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  cell: {
    flex: 1,
  },
  press: {
    width: '100%',
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  iconSlot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
    textAlign: 'center',
  },
  sublabel: {
    fontSize: TypeScale.micro - 1,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
