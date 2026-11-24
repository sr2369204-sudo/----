import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { isNativeUpdateRequired, openAndroidUpdateDownload } from '@/constants/release';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { HeartAppearanceSheet } from '@/features/memorization/components/heart-appearance-sheet';
import { HeartSelectionSheet } from '@/features/memorization/components/heart-selection-sheet';
import { QuranHeartMap } from '@/features/memorization/components/quran-heart-map';
import { HEART_CELLS } from '@/features/memorization/data/heart-cells';
import {
  type HeartColorKey,
  resolveHeartPalette,
} from '@/features/memorization/services/heart-appearance';
import { computeHeartProgress } from '@/features/memorization/services/memorization-progress';
import { useHeartAppearanceStore } from '@/features/memorization/state/heart-appearance-store';
import { useMemorizationStore } from '@/features/memorization/state/memorization-store';
import { ReviewSheet } from '@/features/memorization/components/review-sheet';
import { dueSurahs, toDateKey } from '@/features/memorization/services/review-schedule';
import { useReviewStore } from '@/features/memorization/state/review-store';
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
  const setMemorized = useMemorizationStore((state) => state.setMemorized);
  const reset = useMemorizationStore((state) => state.reset);

  const colorOverrides = useHeartAppearanceStore((state) => state.overrides);
  const colorError = useHeartAppearanceStore((state) => state.error);
  const loadAppearance = useHeartAppearanceStore((state) => state.load);
  const setColor = useHeartAppearanceStore((state) => state.setColor);
  const resetColors = useHeartAppearanceStore((state) => state.reset);

  /** The appearance failure wins: it silently reverts the reader's colours. */
  const error = colorError ?? memorizationError;

  const reviewDates = useReviewStore((state) => state.dates);
  const syncReview = useReviewStore((state) => state.sync);
  const markReviewed = useReviewStore((state) => state.markReviewed);
  const [reviewOpen, setReviewOpen] = useState(false);
  const due = useMemo(() => dueSurahs(reviewDates, toDateKey(new Date())), [reviewDates]);
  useEffect(() => {
    if (loaded) {
      void syncReview(database, memorized);
    }
  }, [database, loaded, memorized, syncReview]);

  const [focusedSurah, setFocusedSurah] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  /**
   * Multi-select: when on, tapping cells only builds a batch and never changes
   * storage, so the reader can mark many surahs with one confirm.
   */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set<number>());
  /** Opens the list picker that fills the same batch the tiles fill. */
  const [selectionSheetOpen, setSelectionSheetOpen] = useState(false);
  const [updateDownloadFailed, setUpdateDownloadFailed] = useState(false);
  /**
   * The map is drawn with `react-native-svg`, which an older binary does not
   * contain; rendering it there throws and takes the whole app down.
   */
  const nativeUpdateRequired = isNativeUpdateRequired();

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
    if (selectionMode) {
      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(surahNumber)) {
          next.delete(surahNumber);
        } else {
          next.add(surahNumber);
        }
        return next;
      });
      return;
    }
    setFocusedSurah(surahNumber);
    void toggle(database, surahNumber);
  }, [database, selectionMode, toggle]);

  const handleToggleSelectionMode = useCallback(() => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelected(new Set<number>());
      setSelectionSheetOpen(false);
      return;
    }
    setFocusedSurah(null);
    setSelected(new Set<number>());
    setSelectionMode(true);
  }, [selectionMode]);

  /** Merges a whole juz — or any group of surahs — into the batch. */
  const handleAddSurahs = useCallback((surahNumbers: number[]) => {
    setSelected((previous) => {
      const next = new Set(previous);
      for (const surahNumber of surahNumbers) {
        next.add(surahNumber);
      }
      return next;
    });
  }, []);

  const handleToggleSelectedSurah = useCallback((surahNumber: number) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(surahNumber)) {
        next.delete(surahNumber);
      } else {
        next.add(surahNumber);
      }
      return next;
    });
  }, []);

  const allSelected = selected.size === HEART_CELLS.length;

  const handleSelectAll = useCallback(() => {
    setSelected((previous) => (previous.size === HEART_CELLS.length
      ? new Set<number>()
      : new Set(HEART_CELLS.map((cell) => cell.surahNumber))));
  }, []);

  /** Applies the batch in a single write, then leaves multi-select. */
  const handleApplySelection = useCallback((value: boolean) => {
    if (selected.size === 0) {
      return;
    }
    void setMemorized(database, [...selected], value);
    setSelectionMode(false);
    setSelected(new Set<number>());
    setSelectionSheetOpen(false);
  }, [database, selected, setMemorized]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'إعادة ضبط كل التقدم',
      `سيتم إلغاء حفظ ${toArabicNumbers(progress.memorizedCount)} سورة (${toArabicNumbers(progress.percentage)}٪ من القرآن). لا يمكن التراجع عن هذه الخطوة.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'إلغاء الكل', style: 'destructive', onPress: () => void reset(database) },
      ],
    );
  }, [database, progress.memorizedCount, progress.percentage, reset]);

  const handleSelectColor = useCallback((key: HeartColorKey, color: string) => {
    void setColor(database, key, color);
  }, [database, setColor]);

  const handleResetColors = useCallback(() => {
    void resetColors(database);
  }, [database, resetColors]);

  const handleDownloadUpdate = useCallback(async () => {
    try {
      await openAndroidUpdateDownload();
      setUpdateDownloadFailed(false);
    } catch (error) {
      console.error('تعذر فتح رابط تنزيل الإصدار الجديد.', error);
      setUpdateDownloadFailed(true);
    }
  }, []);

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
              {selectionMode
                ? 'اضغط الخلايا لتحديدها ثم طبّق دفعة واحدة'
                : 'كل خلية سورة — اضغط لتعليمها محفوظة'}
            </Text>
          </View>
        </View>

        <View style={styles.controlRow}>
          {selectionMode ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="اختيار سور أو أجزاء من قائمة"
                onPress={() => setSelectionSheetOpen(true)}
                style={StyleSheet.flatten([
                  styles.toggleButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ])}>
                <Ionicons name="list-outline" size={17} color={colors.primary} />
                <Text style={[styles.toggleText, { color: colors.primary }]}>قائمة</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={allSelected ? 'مسح التحديد' : 'تحديد كل السور'}
                onPress={handleSelectAll}
                style={StyleSheet.flatten([
                  styles.toggleButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ])}>
                <Ionicons
                  name={allSelected ? 'close-circle-outline' : 'checkmark-done-outline'}
                  size={17}
                  color={colors.primary}
                />
                <Text style={[styles.toggleText, { color: colors.primary }]}>
                  {allSelected ? 'مسح' : 'الكل'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إنهاء وضع التحديد"
                onPress={handleToggleSelectionMode}
                style={StyleSheet.flatten([
                  styles.toggleButton,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ])}>
                <Ionicons name="exit-outline" size={17} color={colors.onPrimary} />
                <Text style={[styles.toggleText, { color: colors.onPrimary }]}>إنهاء</Text>
              </Pressable>
            </>
          ) : (
            <>
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
                  size={17}
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
                accessibilityLabel="تحديد عدة سور دفعة واحدة"
                onPress={handleToggleSelectionMode}
                style={StyleSheet.flatten([
                  styles.toggleButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ])}>
                <Ionicons name="checkmark-done-outline" size={17} color={colors.primary} />
                <Text style={[styles.toggleText, { color: colors.primary }]}>تحديد متعدد</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="تخصيص ألوان القلب"
                onPress={() => setAppearanceOpen(true)}
                style={StyleSheet.flatten([
                  styles.iconButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ])}>
                <Ionicons name="color-palette-outline" size={19} color={colors.primary} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إعادة ضبط كل التقدم"
                accessibilityState={{ disabled: progress.memorizedCount === 0 }}
                disabled={progress.memorizedCount === 0}
                onPress={handleReset}
                style={StyleSheet.flatten([
                  styles.iconButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  progress.memorizedCount === 0 && styles.disabled,
                ])}>
                <Ionicons name="refresh" size={19} color={colors.textSecondary} />
              </Pressable>
            </>
          )}
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

        {due.length > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setReviewOpen(true)}
            style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.text }]}>
              {`${toArabicNumbers(due.length)} سورة تحتاج مراجعة، اضغط لعرضها`}
            </Text>
          </Pressable>
        )}

        {error && (
          <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{error}</Text>
          </View>
        )}
      </View>

      {nativeUpdateRequired ? (
        <View style={styles.updateNotice}>
          <View style={[styles.updateIconBadge, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="cloud-download-outline" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.updateTitle, { color: colors.text }]}>تحتاج إلى تحديث التطبيق</Text>
          <Text style={[styles.updateBody, { color: colors.textSecondary }]}>
            خريطة قلب القرآن تُرسم بمكوّن أُضيف في إصدار أحدث من التطبيق، ولا يمكن
            إضافته إلا بتنزيل النسخة الجديدة. نزّلها ثم عُد إلى هذه الشاشة.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تنزيل الإصدار الجديد"
            onPress={() => void handleDownloadUpdate()}
            style={({ pressed }) => [
              styles.updateAction,
              { backgroundColor: colors.primary, borderColor: colors.primary },
              pressed && styles.updateActionPressed,
            ]}>
            <Ionicons name="download-outline" size={18} color={colors.onPrimary} />
            <Text style={[styles.updateActionText, { color: colors.onPrimary }]}>
              تنزيل الإصدار الجديد
            </Text>
          </Pressable>
          {updateDownloadFailed && (
            <Text style={[styles.updateError, { color: colors.textSecondary }]}>
              تعذّر فتح رابط التنزيل. تحقّق من اتصالك وحاول مرة أخرى.
            </Text>
          )}
        </View>
      ) : loaded ? (
        <QuranHeartMap
          memorized={memorized}
          focusedSurah={focusedSurah}
          selected={selected}
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
        {selectionMode ? (
          <View style={[styles.selectionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.selectionCount, { color: colors.textSecondary }]}>
              {`محدد ${toArabicNumbers(selected.size)} سورة`}
            </Text>
            <View style={styles.selectionActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="تعليم السور المحددة محفوظة"
                accessibilityState={{ disabled: selected.size === 0 }}
                disabled={selected.size === 0}
                onPress={() => handleApplySelection(true)}
                style={StyleSheet.flatten([
                  styles.selectionAction,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                  selected.size === 0 && styles.disabled,
                ])}>
                <Ionicons name="checkmark-circle-outline" size={17} color={colors.onPrimary} />
                <Text style={[styles.selectionActionText, { color: colors.onPrimary }]}>
                  تعليم محفوظة
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إلغاء حفظ السور المحددة"
                accessibilityState={{ disabled: selected.size === 0 }}
                disabled={selected.size === 0}
                onPress={() => handleApplySelection(false)}
                style={StyleSheet.flatten([
                  styles.selectionAction,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selected.size === 0 && styles.disabled,
                ])}>
                <Ionicons name="close-circle-outline" size={17} color={colors.textSecondary} />
                <Text style={[styles.selectionActionText, { color: colors.textSecondary }]}>
                  إلغاء الحفظ
                </Text>
              </Pressable>
            </View>
          </View>
        ) : focusedCell ? (
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

      <ReviewSheet
        visible={reviewOpen}
        colors={colors}
        due={due}
        onReviewed={(surahNumber) => void markReviewed(database, surahNumber)}
        onClose={() => setReviewOpen(false)}
      />
      <HeartAppearanceSheet
        visible={appearanceOpen}
        palette={palette}
        overrides={colorOverrides}
        onSelectColor={handleSelectColor}
        onReset={handleResetColors}
        onClose={() => setAppearanceOpen(false)}
      />

      <HeartSelectionSheet
        visible={selectionSheetOpen}
        selected={selected}
        onToggleSurah={handleToggleSelectedSurah}
        onSelectJuz={handleAddSurahs}
        onApply={handleApplySelection}
        onClose={() => setSelectionSheetOpen(false)}
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
  controlRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
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
  updateNotice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  updateIconBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateTitle: {
    fontSize: TypeScale.title,
    fontWeight: '900',
    textAlign: 'center',
  },
  updateBody: {
    fontSize: TypeScale.body,
    lineHeight: 23,
    textAlign: 'center',
  },
  updateAction: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  updateActionPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  updateActionText: {
    fontSize: TypeScale.label,
    fontWeight: '900',
  },
  updateError: {
    fontSize: TypeScale.caption,
    textAlign: 'center',
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
  selectionBar: {
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  selectionCount: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  selectionActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  selectionAction: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  selectionActionText: {
    fontSize: TypeScale.label,
    fontWeight: '700',
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
