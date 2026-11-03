import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { formatAyahCount, toArabicNumbers } from '@/features/home/utils/format';
import type { QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

export const SurahListItemModern = memo(function SurahListItemModern({
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
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{surah.nameArabic}</Text>
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
          </View>
          
          <View style={[styles.numberContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.number, { color: colors.primary }]}>
              {toArabicNumbers(surah.surahNumber)}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-back" size={20} color={colors.border} />
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
  },
  numberContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: TypeScale.heading,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  name: {
    fontSize: TypeScale.title,
    fontWeight: '800',
  },
  meta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: TypeScale.micro,
    fontWeight: '700',
  },
  ayahCount: {
    fontSize: TypeScale.caption,
  },
});
