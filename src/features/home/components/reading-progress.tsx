import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useTheme } from '@/hooks/use-theme';

/** Number of sheets in the Madani Mushaf — the denominator of the progress bar. */
const TOTAL_PAGES = 604;

/** Fixed facts about the Mushaf, kept deliberately secondary to the heading. */
const mushafFacts = [
  { value: toArabicNumbers(114), label: 'سورة' },
  { value: toArabicNumbers(30), label: 'جزءًا' },
  { value: toArabicNumbers(TOTAL_PAGES), label: 'صفحة' },
];

type ReadingProgressProps = {
  /** Last page the reader saved, or `null` when no reading was recorded yet. */
  lastPage: number | null;
};

/**
 * Compact resume card. The whole block opens the reader, which continues from
 * the page stored in `app_settings`, so no separate call-to-action is required.
 */
export function ReadingProgress({ lastPage }: ReadingProgressProps) {
  const colors = useTheme();
  const reached = lastPage && lastPage > 0 ? Math.min(lastPage, TOTAL_PAGES) : 0;
  const percent = Math.round((reached / TOTAL_PAGES) * 100);
  const fillWidth: DimensionValue = `${percent}%`;

  return (
    <Link href="/reader" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          reached > 0
            ? `متابعة القراءة من الصفحة ${toArabicNumbers(reached)} من ${toArabicNumbers(TOTAL_PAGES)}`
            : 'متابعة القراءة'
        }
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}>
        <View style={styles.topRow}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.eyebrowBar, { backgroundColor: colors.accent }]} />
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
              رحلتك مع القرآن
            </Text>
          </View>
          <View style={styles.ctaRow}>
            <Text style={[styles.ctaText, { color: colors.primary }]}>متابعة القراءة</Text>
            <Ionicons name="chevron-back" size={14} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>مساحة هادئة لقراءتك</Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {reached > 0
            ? `آخر ما وصلت إليه: الصفحة ${toArabicNumbers(reached)} من ${toArabicNumbers(TOTAL_PAGES)}`
            : 'لم تُسجَّل قراءة بعد — ابدأ رحلتك من سورة الفاتحة.'}
        </Text>

        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
            <View style={[styles.progressFill, { width: fillWidth, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressValue, { color: colors.textSecondary }]}>
            {toArabicNumbers(percent)}٪
          </Text>
        </View>

        <View style={[styles.facts, { borderTopColor: colors.border }]}>
          {mushafFacts.map((fact, index) => (
            <Fragment key={fact.label}>
              {index > 0 && <View style={[styles.factDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.fact}>
                <Text style={[styles.factValue, { color: colors.text }]}>{fact.value}</Text>
                <Text style={[styles.factLabel, { color: colors.textSecondary }]}>{fact.label}</Text>
              </View>
            </Fragment>
          ))}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  eyebrowBar: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  eyebrow: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
    textAlign: 'right',
  },
  ctaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  ctaText: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
  title: {
    fontSize: TypeScale.display,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'right',
  },
  description: {
    fontSize: TypeScale.body,
    lineHeight: 22,
    textAlign: 'right',
  },
  progressRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressValue: {
    fontSize: TypeScale.micro,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'left',
  },
  facts: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: Spacing.one,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  factValue: {
    fontSize: TypeScale.body,
    fontWeight: '700',
  },
  factLabel: {
    fontSize: TypeScale.micro,
  },
  factDivider: {
    width: 1,
    height: 22,
  },
  pressed: {
    opacity: 0.8,
  },
});
