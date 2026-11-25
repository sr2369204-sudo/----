import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  AZKAR_SETS,
  azkarItemText,
  getAzkarSet,
  suggestedAzkarSet,
  type AzkarSetId,
} from '@/features/azkar/data/azkar';
import {
  azkarKey,
  azkarSetSummary,
  loadAzkarProgress,
  resetAzkarSet,
  saveAzkarProgress,
  tapAzkarItem,
} from '@/features/azkar/services/azkar-progress';
import { toArabicNumbers } from '@/features/home/utils/format';
import { toDateKey } from '@/features/memorization/services/review-schedule';
import { useTheme } from '@/hooks/use-theme';

export default function AzkarScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [setId, setSetId] = useState<AzkarSetId>(() => suggestedAzkarSet(new Date()));
  const today = toDateKey(new Date());
  const set = getAzkarSet(setId);

  const progressQuery = useQuery({
    queryKey: ['azkar', 'progress', today],
    queryFn: () => loadAzkarProgress(database, today),
    staleTime: 0,
  });
  const progress = progressQuery.data;

  const update = useCallback(
    async (next: NonNullable<typeof progress>) => {
      queryClient.setQueryData(['azkar', 'progress', today], next);
      try {
        await saveAzkarProgress(database, next);
      } catch (error) {
        console.error('تعذر حفظ تقدم الأذكار.', error);
      }
    },
    [database, queryClient, today],
  );

  const summary = progress ? azkarSetSummary(progress, setId, set.items) : { done: 0, total: set.items.length };

  const icons: Record<AzkarSetId, keyof typeof Ionicons.glyphMap> = {
    morning: 'sunny-outline',
    evening: 'moon-outline',
    afterPrayer: 'checkmark-done-outline',
  };
  const progressRatio = summary.total > 0 ? summary.done / summary.total : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.screenTitle, { color: colors.text }]}>الأذكار</Text>
        </View>

        <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.hero}>
          <View pointerEvents="none" style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name={icons[setId]} size={22} color="#E8C77F" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{set.title}</Text>
              <Text style={styles.heroSubtitle}>{set.subtitle}</Text>
            </View>
            <Text style={styles.heroCount}>
              {toArabicNumbers(summary.done)}
              <Text style={styles.heroCountTotal}> / {toArabicNumbers(summary.total)}</Text>
            </Text>
          </View>
          <View style={styles.heroTrack}>
            <View style={[styles.heroFill, { width: `${progressRatio * 100}%` }]} />
          </View>
          <Text style={styles.heroFoot}>
            {summary.done === summary.total && summary.total > 0
              ? 'ما شاء الله، أتممت أذكارك. تقبّل الله منك'
              : 'اضغط على الذكر لتعدّه'}
          </Text>
        </GlassSurface>

        <View style={[styles.tabs, { backgroundColor: colors.backgroundSelected }]}>
          {AZKAR_SETS.map((entry) => {
            const selected = entry.id === setId;
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setSetId(entry.id)}
                style={[styles.tab, selected && { backgroundColor: colors.primary }]}>
                <Ionicons
                  name={icons[entry.id]}
                  size={15}
                  color={selected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.tabText, { color: selected ? '#FFFFFF' : colors.textSecondary }]}>
                  {entry.title.replace('أذكار ', '')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {set.items.map((item, index) => {
          const count = progress?.counts[azkarKey(setId, item.id)] ?? 0;
          const complete = count >= item.count;
          const ratio = Math.min(1, count / item.count);
          return (
            <Pressable
              key={`${setId}:${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${complete ? 'اكتمل' : 'اضغط للعد'}، ${toArabicNumbers(count)} من ${toArabicNumbers(item.count)}`}
              disabled={!progress || complete}
              onPress={() => progress && void update(tapAzkarItem(progress, setId, item))}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: complete ? colors.primary : colors.border,
                  opacity: complete ? 0.72 : pressed ? 0.92 : 1,
                  transform: [{ scale: pressed && !complete ? 0.985 : 1 }],
                },
              ]}>
              <View style={styles.cardHeader}>
                <View style={[styles.indexBadge, { backgroundColor: colors.backgroundSelected }]}>
                  <Text style={[styles.indexText, { color: colors.primary }]}>
                    {toArabicNumbers(index + 1)}
                  </Text>
                </View>
                {item.note ? (
                  <View style={[styles.noteChip, { backgroundColor: `${colors.accent}22` }]}>
                    <Text style={[styles.noteText, { color: colors.accent }]}>{item.note}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.zikrText, { color: colors.text }]}>{azkarItemText(setId, item)}</Text>
              {item.source ? (
                <Text style={[styles.source, { color: colors.textSecondary }]}>{item.source}</Text>
              ) : null}
              <View style={styles.counterWrap}>
                <View style={[styles.counterTrack, { backgroundColor: colors.backgroundSelected }]}>
                  <View
                    style={[
                      styles.counterFill,
                      {
                        width: `${ratio * 100}%`,
                        backgroundColor: complete ? colors.primary : colors.accent,
                      },
                    ]}
                  />
                </View>
                <View style={styles.counterLabelRow}>
                  {complete ? (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      <Text style={[styles.counterText, { color: colors.primary }]}>تم</Text>
                    </>
                  ) : (
                    <Text style={[styles.counterText, { color: colors.text }]}>
                      {toArabicNumbers(count)} / {toArabicNumbers(item.count)}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => progress && void update(resetAzkarSet(progress, setId))}
          style={styles.reset}>
          <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>إعادة العدّ</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, gap: 12, paddingBottom: Spacing.six },
  topRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.two },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: { fontSize: TypeScale.display, fontWeight: '900' },
  hero: { padding: Spacing.three, gap: 12 },
  heroGlow: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(216, 181, 109, 0.16)',
  },
  heroTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216, 181, 109, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.45)',
  },
  heroCopy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  heroTitle: { fontSize: TypeScale.title, fontWeight: '900', color: '#FFF9EA' },
  heroSubtitle: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.7)' },
  heroCount: { fontSize: TypeScale.display, fontWeight: '900', color: '#F3D28C' },
  heroCountTotal: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.65)', fontWeight: '600' },
  heroTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row-reverse',
  },
  heroFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: '#D8B56D' },
  heroFoot: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.78)', textAlign: 'right' },
  tabs: { flexDirection: 'row-reverse', padding: 4, borderRadius: Radius.pill, gap: 4 },
  tab: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  tabText: { fontSize: TypeScale.label, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.three, gap: 10 },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.two },
  indexBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  indexText: { fontSize: TypeScale.caption, fontWeight: '900' },
  noteChip: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  noteText: { fontSize: TypeScale.micro, fontWeight: '800' },
  zikrText: { fontSize: TypeScale.title, lineHeight: 36, textAlign: 'center', fontWeight: '600' },
  source: { fontSize: TypeScale.micro, textAlign: 'center', lineHeight: 18 },
  counterWrap: { gap: 6, marginTop: 2 },
  counterTrack: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  counterFill: { height: '100%', borderRadius: Radius.pill },
  counterLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  counterText: { fontSize: TypeScale.body, fontWeight: '900', fontVariant: ['tabular-nums'] },
  reset: { flexDirection: 'row-reverse', alignSelf: 'center', alignItems: 'center', gap: 6, padding: 8 },
  resetText: { fontSize: TypeScale.label },
});
