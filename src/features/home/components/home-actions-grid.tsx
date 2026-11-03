import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActionItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: any;
};

export function HomeActionsGrid({ savedWordsCount }: { savedWordsCount?: number }) {
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
      href: '/reader',
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
      id: 'search',
      label: 'بحث متقدم',
      sublabel: 'في الآيات',
      icon: 'search',
      color: '#2DCE89',
      href: '/',
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Link key={action.id} href={action.href} asChild>
            <Pressable style={styles.item}>
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.label, { color: colors.text }]}>{action.label}</Text>
                {action.sublabel && (
                  <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
                    {action.sublabel}
                  </Text>
                )}
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.four,
    marginTop: -Spacing.five, // Pull up to overlap hero slightly
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
  },
  item: {
    width: '50%', // 2 columns
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: 10,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: TypeScale.label,
    fontWeight: '800',
    textAlign: 'right',
  },
  sublabel: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
});
