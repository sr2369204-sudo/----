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
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface },
          pressed && { backgroundColor: colors.backgroundSelected },
        ]}>
        <View style={[styles.numberContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.number, { color: colors.primary }]}>
            {toArabicNumbers(surah.surahNumber)}
          </Text>
        </View>

        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {surah.nameArabic}
        </Text>

        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: `${tint}15` }]}>
            <Text style={[styles.badgeText, { color: tint }]}>
              {isMeccan ? 'مكية' : 'مدنية'}
            </Text>
          </View>
          <Text style={[styles.ayahCount, { color: colors.textSecondary }]}>
            {formatAyahCount(surah.ayahCount)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  numberContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  number: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
  },
  name: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ayahCount: {
    fontSize: 10,
    fontWeight: '600',
  },
});
