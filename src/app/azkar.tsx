import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="رجوع" onPress={() => router.back()}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.text }]}>الأذكار</Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>
              {set.subtitle} · {toArabicNumbers(summary.done)} من {toArabicNumbers(summary.total)}
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {AZKAR_SETS.map((entry) => {
            const selected = entry.id === setId;
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setSetId(entry.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                <Text style={[styles.tabText, { color: selected ? '#FFFFFF' : colors.text }]}>
                  {entry.title.replace('أذكار ', '')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {set.items.map((item) => {
          const count = progress?.counts[azkarKey(setId, item.id)] ?? 0;
          const complete = count >= item.count;
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
                  borderColor: complete ? colors.accent : colors.border,
                  opacity: complete ? 0.7 : pressed ? 0.9 : 1,
                },
              ]}>
              <Text style={[styles.zikrText, { color: colors.text }]}>{azkarItemText(setId, item)}</Text>
              {item.source ? (
                <Text style={[styles.source, { color: colors.textSecondary }]}>{item.source}</Text>
              ) : null}
              <View style={styles.counterRow}>
                <View style={[styles.counter, { backgroundColor: complete ? colors.accent : colors.backgroundSelected }]}>
                  {complete ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
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
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  topRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing.two },
  titleGroup: { flex: 1, alignItems: 'flex-end', gap: 2 },
  title: { fontSize: TypeScale.display, fontWeight: '900' },
  caption: { fontSize: TypeScale.caption },
  tabs: { flexDirection: 'row-reverse', gap: Spacing.two },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  tabText: { fontSize: TypeScale.label, fontWeight: '800' },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: 10,
  },
  zikrText: { fontSize: TypeScale.title, lineHeight: 34, textAlign: 'center', fontWeight: '600' },
  source: { fontSize: TypeScale.caption, textAlign: 'center' },
  counterRow: { alignItems: 'center' },
  counter: {
    minWidth: 84,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  counterText: { fontSize: TypeScale.label, fontWeight: '800', fontVariant: ['tabular-nums'] },
  reset: { flexDirection: 'row-reverse', alignSelf: 'center', alignItems: 'center', gap: 6, padding: 8 },
  resetText: { fontSize: TypeScale.label },
});
