import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useTheme } from '@/hooks/use-theme';

type SavedWordsSectionProps = {
  /** Number of saved words, or `undefined` while the list is still loading. */
  count: number | undefined;
};

/** Compact shortcut into the saved-words screen with a live word count. */
export function SavedWordsSection({ count }: SavedWordsSectionProps) {
  const colors = useTheme();
  const caption =
    count === undefined
      ? 'جارٍ التحميل…'
      : count === 0
        ? 'لم تحفظ كلمات بعد'
        : `${toArabicNumbers(count)} كلمة محفوظة`;

  return (
    <Link href="/saved-words" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="الكلمات المحفوظة"
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="bookmark" size={17} color={colors.accent} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>الكلمات المحفوظة</Text>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>{caption}</Text>
        </View>

        <View style={styles.action}>
          <Text style={[styles.actionText, { color: colors.primary }]}>عرض الكل</Text>
          <Ionicons name="chevron-back" size={14} color={colors.primary} />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 16,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: TypeScale.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  caption: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  action: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
