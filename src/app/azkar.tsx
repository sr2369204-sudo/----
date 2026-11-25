import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  AZKAR_SETS,
  azkarItemText,
  getAzkarSet,
  suggestedAzkarSet,
  type AzkarItem,
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
import { ConcentricRings, KhatmaPercentRing } from '@/features/khatma/components/khatma-ring';
import { toArabicNumbers } from '@/features/home/utils/format';
import { toDateKey } from '@/features/memorization/services/review-schedule';
import { useTheme } from '@/hooks/use-theme';

const SET_ICONS: Record<AzkarSetId, keyof typeof Ionicons.glyphMap> = {
  morning: 'sunny-outline',
  evening: 'moon-outline',
  afterPrayer: 'checkmark-done-outline',
  sleep: 'bed-outline',
  wakeUp: 'alarm-outline',
  daily: 'home-outline',
  hardship: 'heart-outline',
  beforeSalam: 'hand-left-outline',
  virtue: 'sparkles-outline',
};

const GOLD = '#D8B56D';

/**
 * One zikr card. When it becomes complete while on screen it pops a check,
 * then fades, shrinks and collapses out of the list before calling `onGone`.
 */
function AzkarCard({
  index,
  item,
  text,
  count,
  complete,
  disabled,
  onPress,
  onGone,
}: {
  index: number;
  item: AzkarItem;
  text: string;
  count: number;
  complete: boolean;
  disabled: boolean;
  onPress: () => void;
  onGone: () => void;
}) {
  const colors = useTheme();
  const [height, setHeight] = useState(0);
  const [progress] = useState(() => new Animated.Value(count / item.count));
  const [pop] = useState(() => new Animated.Value(0));
  const [leave] = useState(() => new Animated.Value(0));
  const [tapScale] = useState(() => new Animated.Value(1));
  const leaving = complete;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.min(1, count / item.count),
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [count, item.count, progress]);

  useEffect(() => {
    if (!complete) {
      return;
    }
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: false }),
      Animated.delay(380),
      Animated.timing(leave, {
        toValue: 1,
        duration: 460,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onGone();
      }
    });
  }, [complete, leave, onGone, pop]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(tapScale, { toValue: 0.97, duration: 70, useNativeDriver: false }),
      Animated.spring(tapScale, { toValue: 1, friction: 5, useNativeDriver: false }),
    ]).start();
    onPress();
  };

  const collapse =
    leaving && height > 0
      ? { height: leave.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }
      : null;

  return (
    <Animated.View
      onLayout={(event) => {
        if (!leaving) {
          setHeight(event.nativeEvent.layout.height);
        }
      }}
      style={[
        collapse,
        {
          opacity: leave.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.2, 0] }),
          marginBottom: leave.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }),
          transform: [
            {
              scale: Animated.multiply(
                tapScale,
                leave.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }),
              ),
            },
            { translateX: leave.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
          ],
          overflow: 'hidden',
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${complete ? 'اكتمل' : 'اضغط للعد'}، ${toArabicNumbers(count)} من ${toArabicNumbers(item.count)}`}
        disabled={disabled || complete}
        onPress={handlePress}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: complete ? colors.primary : colors.border },
        ]}
      >
        <View style={[styles.cardRail, { backgroundColor: complete ? colors.primary : GOLD }]} />
        <View style={styles.cardHeader}>
          <View style={[styles.indexBadge, { backgroundColor: colors.backgroundSelected }]}>
            <Text style={[styles.indexText, { color: colors.primary }]}>{toArabicNumbers(index + 1)}</Text>
          </View>
          {item.note ? (
            <View style={[styles.noteChip, { backgroundColor: `${colors.accent}22` }]}>
              <Text style={[styles.noteText, { color: colors.accent }]}>{item.note}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.zikrText, { color: colors.text }]}>{text}</Text>
        {item.source ? (
          <Text style={[styles.source, { color: colors.textSecondary }]}>{item.source}</Text>
        ) : null}
        <View style={styles.counterWrap}>
          <View style={[styles.counterTrack, { backgroundColor: colors.backgroundSelected }]}>
            <Animated.View
              style={[
                styles.counterFill,
                {
                  width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  backgroundColor: complete ? colors.primary : GOLD,
                },
              ]}
            />
          </View>
          <View style={styles.counterLabelRow}>
            {item.count > 1 ? (
              <View style={[styles.counterPill, { backgroundColor: colors.backgroundSelected }]}>
                <Text style={[styles.counterText, { color: colors.text }]}>
                  {toArabicNumbers(count)} / {toArabicNumbers(item.count)}
                </Text>
              </View>
            ) : (
              <Text style={[styles.tapHint, { color: colors.textSecondary }]}>اضغط عند الانتهاء</Text>
            )}
            <Animated.View
              style={{
                opacity: pop,
                transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
                position: 'absolute',
                end: 0,
              }}
            >
              <Ionicons name="checkmark-circle" size={30} color={colors.primary} />
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AzkarScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [setId, setSetId] = useState<AzkarSetId>(() => suggestedAzkarSet(new Date()));
  const [leaving, setLeaving] = useState<Record<string, true>>({});
  const [showDone, setShowDone] = useState(false);
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

  const summary = progress
    ? azkarSetSummary(progress, setId, set.items)
    : { done: 0, total: set.items.length };
  const ratio = summary.total > 0 ? summary.done / summary.total : 0;
  const allDone = summary.total > 0 && summary.done === summary.total;

  const rows = set.items.map((item, index) => {
    const key = azkarKey(setId, item.id);
    const count = progress?.counts[key] ?? 0;
    return { item, index, key, count, complete: count >= item.count };
  });
  const open = rows.filter((row) => !row.complete || leaving[row.key]);
  const finished = rows.filter((row) => row.complete && !leaving[row.key]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.screenTitle, { color: colors.text }]}>الأذكار</Text>
        </View>

        <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.hero}>
          <View pointerEvents="none" style={styles.heroGlow} />
          <ConcentricRings size={220} opacity={0.09} style={styles.heroRings} />
          <View style={styles.heroRow}>
            <KhatmaPercentRing fraction={ratio} size={104} thickness={9} />
            <View style={styles.heroCopy}>
              <View style={styles.heroTitleRow}>
                <Ionicons name={SET_ICONS[setId]} size={18} color="#E8C77F" />
                <Text style={styles.heroTitle}>{set.title}</Text>
              </View>
              <Text style={styles.heroSubtitle}>{set.subtitle}</Text>
              <Text style={styles.heroCount}>
                {toArabicNumbers(summary.done)}
                <Text style={styles.heroCountTotal}> من {toArabicNumbers(summary.total)} ذكر</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.heroFoot}>
            {allDone
              ? 'ما شاء الله، أتممت أذكارك. تقبّل الله منك'
              : 'اضغط على الذكر لتعدّه، وسيختفي عند اكتماله'}
          </Text>
        </GlassSurface>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {AZKAR_SETS.map((entry) => {
            const selected = entry.id === setId;
            const entrySummary = progress
              ? azkarSetSummary(progress, entry.id, entry.items)
              : { done: 0, total: entry.items.length };
            const complete = entrySummary.total > 0 && entrySummary.done === entrySummary.total;
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => {
                  setSetId(entry.id);
                  setShowDone(false);
                }}
                style={[
                  styles.chip,
                  selected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name={complete ? 'checkmark-circle' : SET_ICONS[entry.id]}
                  size={15}
                  color={selected ? '#FFFFFF' : complete ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                  {entry.title.replace('أذكار ', '')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {open.map((row) => (
          <AzkarCard
            key={`${setId}:${row.item.id}`}
            index={row.index}
            item={row.item}
            text={azkarItemText(setId, row.item)}
            count={row.count}
            complete={row.complete}
            disabled={!progress}
            onPress={() => {
              if (!progress) {
                return;
              }
              if (row.count + 1 >= row.item.count) {
                setLeaving((current) => ({ ...current, [row.key]: true }));
              }
              void update(tapAzkarItem(progress, setId, row.item));
            }}
            onGone={() =>
              setLeaving((current) => {
                const next = { ...current };
                delete next[row.key];
                return next;
              })
            }
          />
        ))}

        {finished.length > 0 ? (
          <View style={[styles.doneBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowDone((value) => !value)}
              style={styles.doneHeader}
            >
              <Ionicons
                name={showDone ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.doneTitle, { color: colors.text }]}>
                المكتملة ({toArabicNumbers(finished.length)})
              </Text>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </Pressable>
            {showDone
              ? finished.map((row) => (
                  <View key={row.key} style={[styles.doneRow, { borderTopColor: colors.border }]}>
                    <Text numberOfLines={1} style={[styles.doneText, { color: colors.textSecondary }]}>
                      {toArabicNumbers(row.index + 1)}. {azkarItemText(setId, row.item).slice(0, 60)}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (progress) {
              setLeaving({});
              void update(resetAzkarSet(progress, setId));
            }
          }}
          style={styles.reset}
        >
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
  heroRings: { position: 'absolute', left: -80, bottom: -100 },
  heroRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  heroTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  chipsScroll: { flexGrow: 0 },
  chips: { flexDirection: 'row-reverse', gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: TypeScale.label, fontWeight: '800' },
  cardRail: { position: 'absolute', top: 14, bottom: 14, end: 0, width: 4, borderRadius: 2 },
  counterPill: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 4 },
  tapHint: { fontSize: TypeScale.micro },
  doneBox: { borderWidth: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  doneHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: Spacing.three },
  doneTitle: { flex: 1, fontSize: TypeScale.body, fontWeight: '800', textAlign: 'right' },
  doneRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  doneText: { fontSize: TypeScale.caption, textAlign: 'right' },
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
  heroCount: { marginTop: 4, fontSize: TypeScale.heading, fontWeight: '900', color: '#F3D28C' },
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
