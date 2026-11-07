import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  DAILY_AYAH_TARGET_STEP,
  DEFAULT_DAILY_AYAH_TARGET,
  MAX_DAILY_AYAH_TARGET,
  type DailyReadingPlan as DailyReadingPlanData,
} from '@/features/reader/services/reading-progress';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useTheme } from '@/hooks/use-theme';

type DailyReadingPlanProps = {
  plan: DailyReadingPlanData | null;
  loading: boolean;
  error?: string | null;
  updating?: boolean;
  surahNameByNumber: Map<number, string>;
  onChangeTarget: (target: number) => void;
};

export function DailyReadingPlan({
  plan,
  loading,
  error,
  updating = false,
  surahNameByNumber,
  onChangeTarget,
}: DailyReadingPlanProps) {
  const colors = useTheme();
  const [ambientPulse] = useState(() => new Animated.Value(0));
  const targetAyahs = plan?.targetAyahs ?? DEFAULT_DAILY_AYAH_TARGET;
  const completedAyahs = plan?.completedAyahs.length ?? 0;
  const progress = targetAyahs > 0 ? Math.min(1, completedAyahs / targetAyahs) : 0;
  const recentReferences = (plan?.completedAyahs ?? []).slice(-2).reverse().map((key) => {
    const [surahNumber, ayahNumber] = key.split(':').map(Number);
    const surahName = surahNameByNumber.get(surahNumber);
    return surahName ? `${surahName} ${toArabicNumbers(ayahNumber)}` : null;
  }).filter((reference): reference is string => reference !== null);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientPulse, {
          toValue: 1,
          duration: 2200,
          isInteraction: false,
          useNativeDriver: true,
        }),
        Animated.timing(ambientPulse, {
          toValue: 0,
          duration: 2200,
          isInteraction: false,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [ambientPulse]);

  return (
    <GlassSurface
      accessibilityLabel="خطة القراءة اليومية"
      variant="emerald"
      radius={Radius.xl}
      contentStyle={styles.body}>
      <View pointerEvents="none" style={styles.cardGlow} />
      <View pointerEvents="none" style={styles.cornerOrnament} />
      <View style={[styles.topAccent, { backgroundColor: colors.accent }]} />

      <View style={styles.heading}>
        <View style={styles.iconWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.iconPulse,
              {
                opacity: ambientPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.58],
                }),
                transform: [{
                  scale: ambientPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1.28],
                  }),
                }],
              },
            ]}
          />
          <View style={styles.icon}>
            <Ionicons name="book-outline" size={21} color={colors.accent} />
          </View>
        </View>
        <View style={styles.headingCopy}>
          <View style={styles.titleLine}>
            <Text style={styles.title}>وردك اليومي</Text>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>اليوم</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {loading ? 'جارٍ تحميل التقدم…' : 'خطوة هادئة نحو وردك'}
          </Text>
        </View>
        <View style={styles.goalControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تقليل هدف الآيات اليومية"
            disabled={updating || targetAyahs <= DAILY_AYAH_TARGET_STEP}
            onPress={() => onChangeTarget(Math.max(DAILY_AYAH_TARGET_STEP, targetAyahs - DAILY_AYAH_TARGET_STEP))}
            style={({ pressed }) => [
              styles.goalButton,
              (pressed || updating) && styles.dimmed,
            ]}>
            <Ionicons name="remove" size={16} color={colors.accent} />
          </Pressable>
          <Text accessibilityLabel={`الهدف ${toArabicNumbers(targetAyahs)} آية`} style={styles.goal}>
            {toArabicNumbers(targetAyahs)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="زيادة هدف الآيات اليومية"
            disabled={updating || targetAyahs >= MAX_DAILY_AYAH_TARGET}
            onPress={() => onChangeTarget(Math.min(MAX_DAILY_AYAH_TARGET, targetAyahs + DAILY_AYAH_TARGET_STEP))}
            style={({ pressed }) => [
              styles.goalButton,
              (pressed || updating) && styles.dimmed,
            ]}>
            <Ionicons name="add" size={16} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.progressHeading}>
        <Text style={styles.progressLabel}>إنجاز اليوم</Text>
        <Text
          accessibilityRole="text"
          style={styles.progressValue}>
          {toArabicNumbers(completedAyahs)}
          <Text style={styles.progressTarget}> / {toArabicNumbers(targetAyahs)} آية</Text>
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: targetAyahs, now: Math.min(completedAyahs, targetAyahs) }}
        accessibilityLabel="تقدم خطة القراءة اليومية"
        style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: '#FFD4CB' }]}>
          {error}
        </Text>
      ) : (
        <View style={styles.footer}>
          <Ionicons
            name={progress >= 1 ? 'sparkles-outline' : 'finger-print-outline'}
            size={14}
            color={colors.accent}
          />
          <Text style={styles.footnote}>
            {progress >= 1
              ? 'ما شاء الله، أتممت وردك اليوم'
              : 'بعد القراءة، حدّد الآية واضغط «تمت القراءة»'}
          </Text>
        </View>
      )}
      {!error && recentReferences.length > 0 && (
        <View style={styles.referencesRow}>
          <Text style={styles.referencesLabel}>آيات أتممتها</Text>
          <Text style={styles.references} numberOfLines={1}>
            {recentReferences.join('، ')}
          </Text>
        </View>
      )}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  body: {
    position: 'relative',
    padding: Spacing.three,
    gap: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -90,
    right: -52,
    width: 220,
    height: 220,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(42, 133, 99, 0.2)',
  },
  cornerOrnament: {
    position: 'absolute',
    top: -35,
    left: -27,
    width: 116,
    height: 116,
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.14)',
    borderRadius: 28,
    transform: [{ rotate: '45deg' }],
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: Spacing.three,
    right: Spacing.three,
    height: 2,
    opacity: 0.76,
    borderBottomLeftRadius: Radius.pill,
    borderBottomRightRadius: Radius.pill,
  },
  heading: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    minHeight: 48,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPulse: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.pill,
    backgroundColor: '#D8B56D',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216, 181, 109, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.45)',
  },
  headingCopy: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  titleLine: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: TypeScale.label,
    fontWeight: '900',
    color: '#FFF9EA',
    letterSpacing: 0.15,
  },
  todayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(216, 181, 109, 0.15)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(216, 181, 109, 0.38)',
  },
  todayBadgeText: {
    color: '#E8C77F',
    fontSize: 9,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: TypeScale.caption,
    color: 'rgba(239, 248, 243, 0.65)',
  },
  goalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.075)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.13)',
  },
  goalButton: {
    width: 27,
    height: 27,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goal: {
    minWidth: 23,
    fontSize: TypeScale.heading,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFF9EA',
  },
  progressHeading: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 1,
  },
  progressLabel: {
    color: 'rgba(239, 248, 243, 0.76)',
    fontSize: TypeScale.caption,
    fontWeight: '700',
  },
  progressValue: {
    color: '#F3D28C',
    fontSize: TypeScale.label,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  progressTarget: {
    color: 'rgba(239, 248, 243, 0.65)',
    fontSize: TypeScale.caption,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: '#D8B56D',
    borderRightWidth: 1,
    borderRightColor: '#F8E3B2',
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  references: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
    color: 'rgba(239, 248, 243, 0.8)',
    flexShrink: 1,
  },
  referencesRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  referencesLabel: {
    fontSize: TypeScale.micro,
    color: '#E8C77F',
    fontWeight: '700',
  },
  error: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  footnote: {
    flex: 1,
    fontSize: TypeScale.micro,
    textAlign: 'right',
    color: 'rgba(239, 248, 243, 0.74)',
  },
  dimmed: {
    opacity: 0.6,
  },
});
