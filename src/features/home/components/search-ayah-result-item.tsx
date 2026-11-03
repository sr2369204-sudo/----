import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import type { AyahSearchResult } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

export const SearchAyahResultItem = memo(function SearchAyahResultItem({
  result,
  surahName,
}: {
  result: AyahSearchResult;
  surahName: string;
}) {
  const colors = useTheme();

  return (
    <Link
      href={{
        pathname: '/reader',
        params: {
          surahNumber: String(result.surahNumber),
          ayahNumber: String(result.ayahNumber),
        },
      }}
      asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface },
          pressed && { backgroundColor: colors.backgroundSelected },
        ]}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {toArabicNumbers(result.ayahNumber)}
            </Text>
          </View>
          <Text style={[styles.surahName, { color: colors.text }]}>سورة {surahName}</Text>
        </View>

        <Text numberOfLines={3} style={[styles.text, { color: colors.textSecondary }]}>
          {result.text}
        </Text>

        <View style={styles.footer}>
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.primary }]}>انتقل إلى الآية</Text>
        </View>
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: TypeScale.label,
    fontWeight: '800',
  },
  surahName: {
    fontSize: TypeScale.heading,
    fontWeight: '800',
  },
  text: {
    fontSize: TypeScale.body,
    lineHeight: 24,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  footerText: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
});
