import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { HeartAppearanceSheet } from '@/features/memorization/components/heart-appearance-sheet';
import { QuranHeartMap } from '@/features/memorization/components/quran-heart-map';
import { HEART_CELLS } from '@/features/memorization/data/heart-cells';
import {
  type HeartColorKey,
  resolveHeartPalette,
} from '@/features/memorization/services/heart-appearance';
import { computeHeartProgress } from '@/features/memorization/services/memorization-progress';
import { useHeartAppearanceStore } from '@/features/memorization/state/heart-appearance-store';
import { useMemorizationStore } from '@/features/memorization/state/memorization-store';
import { formatAyahCount, toArabicNumbers } from '@/features/home/utils/format';
import { useIsDarkTheme, useTheme } from '@/hooks/use-theme';

export default function QuranHeartScreen() {
  const colors = useTheme();
  const isDark = useIsDarkTheme();
  const database = useSQLiteContext();

  const memorized = useMemorizationStore((state) => state.memorized);
  const loaded = useMemorizationStore((state) => state.loaded);
  const memorizationError = useMemorizationStore((state) => state.error);
  const load = useMemorizationStore((state) => state.load);
  const toggle = useMemorizationStore((state) => state.toggle);
  const reset = useMemorizationStore((state) => state.reset);

  const colorOverrides = useHeartAppearanceStore((state) => state.overrides);
  const colorError = useHeartAppearanceStore((state) => state.error);
  const loadAppearance = useHeartAppearanceStore((state) => state.load);
  const setColor = useHeartAppearanceStore((state) => state.setColor);
  const resetColors = useHeartAppearanceStore((state) => state.reset);

  /** The appearance failure wins: it silently reverts the reader's colours. */
  const error = colorError ?? memorizationError;

  const [focusedSurah, setFocusedSurah] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  useEffect(() => {
    void load(database);
    void loadAppearance(database);
  }, [database, load, loadAppearance]);

  const palette = useMemo(
    () => resolveHeartPalette(isDark ? 'dark' : 'light', colorOverrides),
    [colorOverrides, isDark],
  );

  const progress = useMemo(() => computeHeartProgress(memorized), [memorized]);

  const focusedCell = useMemo(
    () => (focusedSurah === null
      ? null
      : HEART_CELLS.find((cell) => cell.surahNumber === focusedSurah) ?? null),
    [focusedSurah],
  );

  const handlePressSurah = useCallback((surahNumber: number) => {
    setFocusedSurah(surahNumber);
    void toggle(database, surahNumber);
  }, [database, toggle]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'إعادة ضبط التقدم',
      'هل تريد حذف كل السور التي حفظتها؟ لا يمكن التراجع عن هذه الخطوة.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'إعادة الضبط', style: 'destructive', onPress: () => void reset(database) },
      ],
    );
  }, [database, reset]);

  const handleSelectColor = useCallback((key: HeartColorKey, color: string) => {
    void setColor(database, key, color);
  }, [database, setColor]);

  const handleResetColors = useCallback(() => {
    void resetColors(database);
  }, [database, resetColors]);

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safeArea, { backgroundColor: colors.background }])}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="العودة للرئيسية"
              style={StyleSheet.flatten([
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ])}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </Pressable>
          </Link>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.text }]}>قلب القرآن</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              كل خلية سورة — اضغط لتعليمها محفوظة
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إظهار أسماء السور"
            accessibilityState={{ selected: showLabels }}
            onPress={() => setShowLabels((value) => !value)}
            style={StyleSheet.flatten([
              styles.toggleButton,
              {
                backgroundColor: showLabels ? colors.primary : colors.surface,
                borderColor: showLabels ? colors.primary : colors.border,
              },
            ])}>
            <Ionicons
              name="text-outline"
              size={18}
              color={showLabels ? colors.onPrimary : colors.primary}
            />
            <Text
              style={[
                styles.toggleText,
                { color: showLabels ? colors.onPrimary : colors.primary },
              ]}>
              الأسماء
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تخصيص ألوان القلب"
            onPress={() => setAppearanceOpen(true)}
            style={StyleSheet.flatten([
              styles.colorButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ])}>
            <Ionicons name="color-palette-outline" size={19} color={colors.primary} />
          </Pressable>
        </View>

        <GlassSurface variant="ivory" radius={Radius.lg} contentStyle={styles.statsCard}>
          <View style={styles.statsRow}>
            <Stat label="تم حفظ" value={`${toArabicNumbers(progress.memorizedCount)} سورة`} color={colors.primary} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Stat label="المتبقي" value={`${toArabicNumbers(progress.remainingCount)} سورة`} color={colors.textSecondary} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Stat label="النسبة" value={`${toArabicNumbers(progress.percentage)}٪`} color={colors.accent} />
          </View>

          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: progress.percentage }}
            style={[styles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress.percentage}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>

          <View style={styles.legendRow}>
            <Legend label="محفوظة" color={palette.memorizedFill} />
            <Legend label="قيد الحفظ" color={palette.cellFill} />
            <Text style={[styles.legendNote, { color: colors.textSecondary }]}>
              {`${toArabicNumbers(progress.memorizedAyahs)} من ${toArabicNumbers(progress.totalAyahs)} آية`}
            </Text>
          </View>
        </GlassSurface>

        {error && (
          <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{error}</Text>
          </View>
        )}
      </View>

      {loaded ? (
        <QuranHeartMap
          memorized={memorized}
          focusedSurah={focusedSurah}
          showLabels={showLabels}
          palette={palette}
          onPressSurah={handlePressSurah}
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            جارٍ تحميل تقدم الحفظ…
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {focusedCell ? (
          <GlassSurface variant={memorized.has(focusedCell.surahNumber) ? 'emerald' : 'ivory'} radius={Radius.lg} contentStyle={styles.focusedCard}>
            <View style={styles.focusedIcon}>
              <Ionicons
                name={memorized.has(focusedCell.surahNumber) ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={memorized.has(focusedCell.surahNumber) ? colors.accent : colors.primary}
              />
            </View>
            <View style={styles.focusedText}>
              <Text style={[styles.focusedTitle, { color: colors.text }]}>
                سورة {focusedCell.surahName}
              </Text>
              <Text style={[styles.focusedMeta, { color: colors.textSecondary }]}>
                {`ترتيبها ${toArabicNumbers(focusedCell.surahNumber)} • ${formatAyahCount(focusedCell.ayahCount)}`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إزالة التقدم الكامل"
              onPress={handleReset}
              style={StyleSheet.flatten([styles.resetButton, { borderColor: colors.border }])}>
              <Ionicons name="refresh" size={16} color={colors.textSecondary} />
            </Pressable>
          </GlassSurface>
        ) : (
          <View style={styles.emptyFooter}>
            <Ionicons name="hand-left-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.emptyFooterText, { color: colors.textSecondary }]}>
              اضغط أي خلية لتعليم السورة محفوظة أو لإلغائها
            </Text>
          </View>
        )}
      </View>

      <HeartAppearanceSheet
        visible={appearanceOpen}
        palette={palette}
        overrides={colorOverrides}
        onSelectColor={handleSelectColor}
        onReset={handleResetColors}
        onClose={() => setAppearanceOpen(false)}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  const colors = useTheme();
  return (
    <View style={styles.legend}>
      <View style={[styles.legendSwatch, { backgroundColor: color, borderColor: colors.border }]} />
      <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  title: {
    fontSize: TypeScale.display,
    fontWeight: '900',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  toggleButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    height: 40,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: TypeScale.micro,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: Spacing.one,
  },
  progressTrack: {
    height: 9,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  legendRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
  },
  legend: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  legendLabel: {
    fontSize: TypeScale.micro,
  },
  legendNote: {
    flex: 1,
    fontSize: TypeScale.micro,
    textAlign: 'left',
  },
  notice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  noticeText: {
    flex: 1,
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: TypeScale.body,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  focusedCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  focusedIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedText: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  focusedTitle: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
    textAlign: 'right',
  },
  focusedMeta: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  resetButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyFooterText: {
    fontSize: TypeScale.caption,
  },
});
