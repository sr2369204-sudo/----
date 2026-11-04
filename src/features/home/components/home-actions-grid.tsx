import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActionItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: Href;
};

export function HomeActionsGrid({
  savedWordsCount,
  continueHref = '/reader',
}: {
  savedWordsCount?: number;
  continueHref?: Href;
}) {
  const colors = useTheme();

  const ACTIONS: ActionItem[] = [
    {
      id: 'saved',
      label: 'الكلمات المحفوظة',
      sublabel: savedWordsCount !== undefined ? `${savedWordsCount} كلمة` : '...',
      icon: 'bookmark',
      color: colors.accent,
      href: '/saved-words',
    },
    {
      id: 'continue',
      label: 'متابعة القراءة',
      sublabel: 'من حيث توقفت',
      icon: 'book',
      color: colors.primary,
      href: continueHref,
    },
    {
      id: 'offline',
      label: 'المحتوى المحلي',
      sublabel: 'بدون إنترنت',
      icon: 'cloud-download',
      color: '#5E72E4',
      href: '/settings',
    },
    {
      id: 'bookmarks',
      label: 'الإشارات المرجعية',
      sublabel: 'الآيات التي حفظتها',
      icon: 'bookmarks',
      color: '#C07A44',
      href: '/bookmarks',
    },
  ];

  return (
    <Animated.View
      entering={FadeInDown.duration(560).delay(120)}
      style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Link key={action.id} href={action.href} asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.item,
                { backgroundColor: colors.background, borderColor: colors.border },
              ])}>
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <View style={styles.textContainer}>
                <Text numberOfLines={1} style={[styles.label, { color: colors.text }]}>
                  {action.label}
                </Text>
                {action.sublabel && (
                  <Text numberOfLines={1} style={[styles.sublabel, { color: colors.textSecondary }]}>
                    {action.sublabel}
                  </Text>
                )}
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.four,
    marginTop: -Spacing.three,
    borderRadius: Radius.xl,
    padding: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
  },
  item: {
    width: '48%',
    height: 66,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
    textAlign: 'right',
  },
  sublabel: {
    fontSize: TypeScale.micro - 1,
    textAlign: 'right',
  },
});
