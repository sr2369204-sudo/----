import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
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
      id: 'library',
      label: 'المكتبة',
      sublabel: 'السور',
      icon: 'grid',
      color: '#9A762F',
      href: '/library',
    },
  ];

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <View key={action.id} style={styles.cell}>
          <Link href={action.href} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
              <GlassSurface radius={Radius.lg} contentStyle={styles.tile} style={styles.surface}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: `${action.color}1F`, borderColor: `${action.color}3D` },
                  ]}>
                  <Ionicons name={action.icon} size={19} color={action.color} />
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  surface: {},
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
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
