import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, TypeScale } from '@/constants/theme';
import { formatAyahCount, toArabicNumbers } from '@/features/home/utils/format';
import type { QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

/** One row of the surah index. Memoised so filtering does not re-render the list. */
export const SurahListItem = memo(function SurahListItem({ surah }: { surah: QuranSurahSummary }) {
  const colors = useTheme();
  const revelation = surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية';

  return (
    <Link
      href={{ pathname: '/reader', params: { surahNumber: String(surah.surahNumber) } }}
      asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`سورة ${surah.nameArabic}، ${formatAyahCount(surah.ayahCount)}، ${revelation}`}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: colors.backgroundSelected },
        ]}>
        <View style={[styles.numberBadge, { backgroundColor: colors.backgroundSelected }]}>
          <Text style={[styles.numberText, { color: colors.primary }]}>
            {toArabicNumbers(surah.surahNumber)}
          </Text>
        </View>

        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
            {surah.nameArabic}
          </Text>
          <Text numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>
            {formatAyahCount(surah.ayahCount)} · {revelation}
          </Text>
        </View>

        <Ionicons name="chevron-back" size={15} color={colors.textSecondary} />
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
    paddingVertical: 8,
    borderRadius: 12,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: TypeScale.label,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: TypeScale.heading,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'right',
  },
  meta: {
    fontSize: TypeScale.micro,
    lineHeight: 16,
    textAlign: 'right',
  },
});
