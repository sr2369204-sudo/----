import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import type { AyahSearchResult } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

/** Light-on-dark colours used while the card sits inside the search panel. */
const DARK_TEXT = '#FFF9EA';
const DARK_TEXT_MUTED = 'rgba(239,248,243,0.78)';
const DARK_ACCENT = '#E8C77F';

export const SearchAyahResultItem = memo(function SearchAyahResultItem({
  result,
  surahName,
  onDark = false,
}: {
  result: AyahSearchResult;
  surahName: string;
  /** Renders the card for the dark search panel that hangs under the search bar. */
  onDark?: boolean;
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
        style={StyleSheet.flatten([
          styles.card,
          onDark
            ? styles.cardOnDark
            : { backgroundColor: colors.glassSurface },
        ])}>
        <View style={styles.header}>
          <View
            style={[
              styles.badge,
              onDark
                ? styles.badgeOnDark
                : { backgroundColor: colors.background },
            ]}>
            <Text style={[styles.badgeText, { color: onDark ? DARK_ACCENT : colors.primary }]}>
              {toArabicNumbers(result.ayahNumber)}
            </Text>
          </View>
          <Text style={[styles.surahName, { color: onDark ? DARK_TEXT : colors.text }]}>
            سورة {surahName}
          </Text>
        </View>

        <Text
          numberOfLines={3}
          style={[styles.text, { color: onDark ? DARK_TEXT_MUTED : colors.textSecondary }]}>
          {result.text}
        </Text>

        <View style={styles.footer}>
          <Ionicons name="arrow-back" size={16} color={onDark ? DARK_ACCENT : colors.primary} />
          <Text
            style={[styles.footerText, { color: onDark ? DARK_ACCENT : colors.primary }]}>
            انتقل إلى الآية
          </Text>
        </View>
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.two,
    marginVertical: Spacing.one,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  cardOnDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOnDark: {
    backgroundColor: 'rgba(216,181,109,0.2)',
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
    fontSize: TypeScale.caption,
    lineHeight: 19,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  footerText: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
});
