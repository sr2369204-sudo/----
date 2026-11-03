import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { formatAyahCount, toArabicNumbers } from '@/features/home/utils/format';
import type { QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

export const SurahGridItemModern = memo(function SurahGridItemModern({
  surah,
}: {
  surah: QuranSurahSummary;
}) {
  const colors = useTheme();
  const isMeccan = surah.revelationPlace === 'makkah';
  const tint = isMeccan ? colors.accent : colors.primary;

  return (
    <Link
      href={{ pathname: '/reader', params: { surahNumber: String(surah.surahNumber) } }}
      asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`سورة ${surah.nameArabic}، ${formatAyahCount(surah.ayahCount)}، ${isMeccan ? 'مكية' : 'مدنية'}`}
        style={StyleSheet.flatten([
          styles.card,
          {
            backgroundColor: colors.glassSurface,
            borderColor: colors.glassBorder,
            borderRightColor: `${tint}55`,
          },
        ])}>
        <View style={[styles.numberContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.number, { color: colors.primary }]}>
            {toArabicNumbers(surah.surahNumber)}
          </Text>
        </View>

        <View style={styles.details}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
            {surah.nameArabic}
          </Text>
          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: `${tint}15` }]}>
              <Text style={[styles.badgeText, { color: tint }]}>
                {isMeccan ? 'مكية' : 'مدنية'}
              </Text>
            </View>
            <View style={styles.ayahInfo}>
              <Ionicons name="book-outline" size={13} color={colors.textSecondary} />
              <Text numberOfLines={1} style={[styles.ayahCount, { color: colors.textSecondary }]}>
                {formatAyahCount(surah.ayahCount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.navigationHint, { backgroundColor: `${tint}10` }]}>
          <Ionicons name="chevron-back" size={16} color={tint} />
        </View>
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 80,
    marginHorizontal: 3,
    marginBottom: 9,
    borderWidth: 1,
    borderRightWidth: 3,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  number: {
    fontSize: TypeScale.label,
    fontWeight: '900',
  },
  details: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
    gap: 6,
  },
  name: {
    width: '100%',
    fontSize: TypeScale.body,
    fontWeight: '900',
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  ayahCount: {
    flexShrink: 1,
    fontSize: TypeScale.micro,
    fontWeight: '600',
  },
  ayahInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.one,
  },
  navigationHint: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
