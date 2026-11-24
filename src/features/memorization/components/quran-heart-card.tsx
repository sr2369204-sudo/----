import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo } from 'react';
import { Circle, Svg } from 'react-native-svg';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, TypeScale } from '@/constants/theme';
import { HEART_CELLS } from '@/features/memorization/data/heart-cells';
import { computeHeartProgress } from '@/features/memorization/services/memorization-progress';
import { useMemorizationStore } from '@/features/memorization/state/memorization-store';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useTheme } from '@/hooks/use-theme';

/** Compact home shortcut with the same ayah-weighted progress as the map. */
export function QuranHeartCard() {
  const colors = useTheme();
  const database = useSQLiteContext();

  const memorized = useMemorizationStore((state) => state.memorized);
  const loaded = useMemorizationStore((state) => state.loaded);
  const load = useMemorizationStore((state) => state.load);

  useEffect(() => {
    void load(database);
  }, [database, load]);

  const progress = useMemo(() => computeHeartProgress(memorized), [memorized]);
  return (
    <Link href="/heart" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`قلب القرآن، نسبة الحفظ ${toArabicNumbers(progress.percentage)}٪`}
        style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
        <GlassSurface variant="emerald" radius={Radius.lg} contentStyle={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name="heart" size={18} color={colors.accent} />
            </View>
            <Text style={styles.title} numberOfLines={1}>قلب القرآن</Text>
            <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.75)" />
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressCopy}>
              <Text style={styles.progressCaption}>نسبة الحفظ</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {loaded
                  ? `${toArabicNumbers(progress.memorizedCount)} من ${toArabicNumbers(HEART_CELLS.length)} سورة`
                  : 'جارٍ استعادة التقدم…'}
              </Text>
            </View>
            <ProgressRing
              percentage={progress.percentage}
              trackColor="rgba(255,255,255,0.2)"
              progressColor={colors.accent}
            />
          </View>
        </GlassSurface>
      </Pressable>
    </Link>
  );
}

function ProgressRing({
  percentage,
  trackColor,
  progressColor,
}: {
  percentage: number;
  trackColor: string;
  progressColor: string;
}) {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="نسبة حفظ القرآن"
      accessibilityValue={{ min: 0, max: 100, now: clampedPercentage }}
      style={styles.ring}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clampedPercentage / 100)}
        />
      </Svg>
      <Text style={styles.ringValue}>{`${toArabicNumbers(clampedPercentage)}٪`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  card: {
    minHeight: 132,
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  title: {
    flex: 1,
    fontSize: TypeScale.label,
    fontWeight: '900',
    textAlign: 'right',
    color: '#FFFFFF',
  },
  progressRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  progressCaption: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
    textAlign: 'right',
    color: 'rgba(255,255,255,0.88)',
  },
  subtitle: {
    fontSize: TypeScale.micro - 1,
    lineHeight: 15,
    textAlign: 'right',
    color: 'rgba(255,255,255,0.7)',
  },
  ring: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
