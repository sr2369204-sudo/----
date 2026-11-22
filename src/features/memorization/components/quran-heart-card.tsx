import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { HEART_CELLS } from '@/features/memorization/data/heart-cells';
import { computeHeartProgress } from '@/features/memorization/services/memorization-progress';
import { useMemorizationStore } from '@/features/memorization/state/memorization-store';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useTheme } from '@/hooks/use-theme';

/**
 * Full-width shortcut into the Quran Heart. Reads the shared memorization
 * store so the headline progress matches the map exactly.
 */
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
  const started = loaded && progress.memorizedCount > 0;

  return (
    <Link href="/heart" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="قلب القرآن"
        style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
        <GlassSurface variant="emerald" radius={Radius.lg} contentStyle={styles.card}>
          <View style={styles.iconBadge}>
            <Ionicons name="heart" size={22} color={colors.accent} />
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.title}>قلب القرآن</Text>
            <Text style={styles.subtitle}>
              {started
                ? `حفظت ${toArabicNumbers(progress.memorizedCount)} من ${toArabicNumbers(HEART_CELLS.length)} سورة`
                : 'تابع حفظك عبر ١١٤ سورة'}
            </Text>
          </View>
          <View style={styles.tail}>
            {started && (
              <View style={styles.percentPill}>
                <Text style={styles.percentText}>{`${toArabicNumbers(progress.percentage)}٪`}</Text>
              </View>
            )}
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.85)" />
          </View>
        </GlassSurface>
      </Pressable>
    </Link>
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  textGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  title: {
    fontSize: TypeScale.title,
    fontWeight: '900',
    textAlign: 'right',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
    color: 'rgba(255,255,255,0.86)',
  },
  tail: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  percentPill: {
    minWidth: 44,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
  },
  percentText: {
    fontSize: TypeScale.caption,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
