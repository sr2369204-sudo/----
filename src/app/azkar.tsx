import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  AZKAR_SETS,
  azkarItemText,
  getAzkarSet,
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
  type AzkarProgress,
} from '@/features/azkar/services/azkar-progress';
import { ConcentricRings } from '@/features/khatma/components/khatma-ring';
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
const GOLD_LIGHT = '#F3D28C';
const SIDE_ZONE = 0.28;
const ADVANCE_DELAY = 700;

/** One full-page dhikr. Pops a check when it reaches its count. */
function StoryPage({
  item,
  text,
  count,
  index,
  total,
  fromDirection,
  onCount,
}: {
  item: AzkarItem;
  text: string;
  count: number;
  index: number;
  total: number;
  fromDirection: 1 | -1;
  onCount: () => void;
}) {
  const complete = count >= item.count;
  const [enter] = useState(() => new Animated.Value(0));
  const [pop] = useState(() => new Animated.Value(complete ? 1 : 0));
  const [press] = useState(() => new Animated.Value(1));
  const wasComplete = useRef(complete);

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  useEffect(() => {
    if (complete && !wasComplete.current) {
      wasComplete.current = true;
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    }
  }, [complete, pop]);

  const handleCount = () => {
    if (complete) {
      return;
    }
    Animated.sequence([
      Animated.timing(press, { toValue: 0.94, duration: 60, useNativeDriver: true }),
      Animated.spring(press, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onCount();
  };

  return (
    <Animated.View
      style={[
        styles.page,
        {
          opacity: enter,
          transform: [
            { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [40 * fromDirection, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.pageMeta}>
        <Text style={styles.pageIndex}>
          {toArabicNumbers(index + 1)} / {toArabicNumbers(total)}
        </Text>
        {item.note ? (
          <View style={styles.noteChip}>
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        ) : null}
      </View>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.zikrText}>{text}</Text>
        {item.source ? <Text style={styles.source}>{item.source}</Text> : null}
      </ScrollView>
      <Animated.View style={{ transform: [{ scale: press }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${toArabicNumbers(count)} من ${toArabicNumbers(item.count)}`}
          onPress={handleCount}
          style={[styles.counter, complete && styles.counterDone]}
        >
          {complete ? (
            <Animated.View
              style={{
                transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
              }}
            >
              <Ionicons name="checkmark" size={38} color="#0B3D2E" />
            </Animated.View>
          ) : (
            <>
              <Text style={styles.counterNumber}>{toArabicNumbers(count)}</Text>
              <Text style={styles.counterTotal}>
                {item.count > 1 ? `من ${toArabicNumbers(item.count)}` : 'اضغط عند الانتهاء'}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function StoryViewer({
  setId,
  progress,
  update,
  onClose,
}: {
  setId: AzkarSetId;
  progress: AzkarProgress;
  update: (next: AzkarProgress) => Promise<void>;
  onClose: () => void;
}) {
  const set = getAzkarSet(setId);
  const items = set.items;
  const [index, setIndex] = useState(() => {
    const first = items.findIndex((item) => (progress.counts[azkarKey(setId, item.id)] ?? 0) < item.count);
    return first === -1 ? 0 : first;
  });
  const [direction, setDirection] = useState<1 | -1>(1);
  const finished = index >= items.length;
  const length = items.length;

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  /** Past the last dhikr, go back to the first unfinished one; finish only when none is left. */
  const forwardFrom = useCallback(
    (current: number) => {
      if (current + 1 < length) {
        return current + 1;
      }
      const counts = progressRef.current.counts;
      const open = items.findIndex((entry, position) => {
        const done = (counts[azkarKey(setId, entry.id)] ?? 0) >= entry.count;
        return !done && position !== current;
      });
      const selfOpen = (counts[azkarKey(setId, items[current]?.id ?? '')] ?? 0) < (items[current]?.count ?? 0);
      if (open !== -1) {
        return open;
      }
      return selfOpen ? current : length;
    },
    [items, length, setId],
  );

  const go = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setIndex((current) => (delta === 1 ? forwardFrom(current) : Math.max(0, current - 1)));
    },
    [forwardFrom],
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose]);

  // Right side taps move forward and a swipe toward the left moves on; the progress segments fill left to right to match.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderRelease: (_event, gesture) => {
          if (Math.abs(gesture.dx) > 50) {
            go(gesture.dx < 0 ? 1 : -1);
          }
        },
      }),
    [go],
  );

  const item = items[index];
  const doneCount = items.filter(
    (entry) => (progress.counts[azkarKey(setId, entry.id)] ?? 0) >= entry.count,
  ).length;

  return (
    <SafeAreaView style={styles.story}>
      <ConcentricRings size={300} opacity={0.08} style={styles.storyRings} />
      <View style={styles.segments}>
        {items.map((entry, position) => {
          const count = progress.counts[azkarKey(setId, entry.id)] ?? 0;
          const fill =
            count >= entry.count ? 1 : position === index ? Math.max(0.08, count / entry.count) : 0;
          return (
            <View key={entry.id} style={[styles.segment, position === index && styles.segmentActive]}>
              <View style={[styles.segmentFill, { width: `${fill * 100}%` }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.storyTop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          onPress={onClose}
          style={styles.close}
        >
          <Ionicons name="close" size={22} color="#FFF9EA" />
        </Pressable>
        <View style={styles.storyTitleWrap}>
          <Text style={styles.storyTitle}>{set.title}</Text>
          <Text style={styles.storySub}>
            {toArabicNumbers(doneCount)} من {toArabicNumbers(items.length)} مكتمل
          </Text>
        </View>
        <Ionicons name={SET_ICONS[setId]} size={22} color={GOLD_LIGHT} />
      </View>

      <View style={styles.stage} {...pan.panHandlers}>
        {finished ? (
          <View style={styles.finish}>
            <Ionicons name="checkmark-circle" size={84} color={GOLD_LIGHT} />
            <Text style={styles.finishTitle}>ما شاء الله، أتممت {set.title}</Text>
            <Text style={styles.finishSub}>تقبّل الله منك</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.finishButton}>
              <Text style={styles.finishButtonText}>رجوع للقائمة</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void update(resetAzkarSet(progress, setId));
                setDirection(-1);
                setIndex(0);
              }}
              style={styles.finishLink}
            >
              <Text style={styles.finishLinkText}>إعادة العدّ</Text>
            </Pressable>
          </View>
        ) : (
          <StoryPage
            key={`${setId}:${item.id}`}
            item={item}
            text={azkarItemText(setId, item)}
            count={progress.counts[azkarKey(setId, item.id)] ?? 0}
            index={index}
            total={items.length}
            fromDirection={direction}
            onCount={() => {
              const count = progress.counts[azkarKey(setId, item.id)] ?? 0;
              void update(tapAzkarItem(progress, setId, item));
              if (count + 1 >= item.count) {
                const from = index;
                setTimeout(() => {
                  setDirection(1);
                  setIndex((current) => (current === from ? forwardFrom(from) : current));
                }, ADVANCE_DELAY);
              }
            }}
          />
        )}
        {!finished ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="التالي"
              onPress={() => go(1)}
              style={[styles.zone, styles.zoneRight]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="السابق"
              onPress={() => go(-1)}
              style={[styles.zone, styles.zoneLeft]}
            />
          </>
        ) : null}
      </View>
      {!finished ? <Text style={styles.hint}>اضغط على اليمين للتالي، واليسار للسابق، أو اسحب</Text> : null}
    </SafeAreaView>
  );
}

export default function AzkarScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [setId, setSetId] = useState<AzkarSetId | null>(null);
  const today = toDateKey(new Date());

  const progressQuery = useQuery({
    queryKey: ['azkar', 'progress', today],
    queryFn: () => loadAzkarProgress(database, today),
    staleTime: 0,
  });
  const progress = progressQuery.data;

  const update = useCallback(
    async (next: AzkarProgress) => {
      queryClient.setQueryData(['azkar', 'progress', today], next);
      try {
        await saveAzkarProgress(database, next);
      } catch (error) {
        console.error('تعذر حفظ تقدم الأذكار.', error);
      }
    },
    [database, queryClient, today],
  );

  const close = useCallback(() => setSetId(null), []);

  if (setId !== null && progress) {
    return <StoryViewer setId={setId} progress={progress} update={update} onClose={close} />;
  }

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
        <Text style={[styles.listIntro, { color: colors.textSecondary }]}>
          اختر مجموعة، وستظهر الأذكار واحدًا واحدًا في صفحة كاملة.
        </Text>
        {AZKAR_SETS.map((entry) => {
          const summary = progress
            ? azkarSetSummary(progress, entry.id, entry.items)
            : { done: 0, total: entry.items.length };
          const complete = summary.total > 0 && summary.done === summary.total;
          const ratio = summary.total > 0 ? summary.done / summary.total : 0;
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              disabled={!progress}
              onPress={() => setSetId(entry.id)}
              style={({ pressed }) => [
                styles.setCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: complete ? colors.primary : colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View style={[styles.setIcon, { backgroundColor: complete ? colors.primary : '#0F5640' }]}>
                <Ionicons name={complete ? 'checkmark' : SET_ICONS[entry.id]} size={22} color={GOLD_LIGHT} />
              </View>
              <View style={styles.setCopy}>
                <Text style={[styles.setTitle, { color: colors.text }]}>{entry.title}</Text>
                <Text style={[styles.setSub, { color: colors.textSecondary }]}>{entry.subtitle}</Text>
                <View style={[styles.setTrack, { backgroundColor: colors.backgroundSelected }]}>
                  <View style={[styles.setFill, { width: `${ratio * 100}%` }]} />
                </View>
              </View>
              <View style={styles.setCount}>
                <Text style={[styles.setCountNumber, { color: colors.primary }]}>
                  {toArabicNumbers(summary.done)}/{toArabicNumbers(summary.total)}
                </Text>
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              </View>
            </Pressable>
          );
        })}
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
  listIntro: { fontSize: TypeScale.caption, textAlign: 'right', lineHeight: 22 },
  setCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  setIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  setCopy: { flex: 1, alignItems: 'flex-end', gap: 3 },
  setTitle: { fontSize: TypeScale.title, fontWeight: '900' },
  setSub: { fontSize: TypeScale.caption },
  setTrack: {
    height: 5,
    borderRadius: 3,
    alignSelf: 'stretch',
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  setFill: { height: '100%', borderRadius: 3, backgroundColor: GOLD },
  setCount: { alignItems: 'center', flexDirection: 'row', gap: 2 },
  setCountNumber: { fontSize: TypeScale.label, fontWeight: '900' },

  story: { flex: 1, backgroundColor: '#0B3D2E' },
  storyRings: { position: 'absolute', left: -110, bottom: -120 },
  segments: { flexDirection: 'row', gap: 3, paddingHorizontal: 12, paddingTop: 8 },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segmentActive: { backgroundColor: 'rgba(255,255,255,0.32)' },
  segmentFill: { height: '100%', backgroundColor: GOLD_LIGHT },
  storyTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 14 },
  storyTitleWrap: { flex: 1, alignItems: 'flex-end' },
  storyTitle: { fontSize: TypeScale.title, fontWeight: '900', color: '#FFF9EA' },
  storySub: { fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.7)' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stage: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 22, paddingBottom: 12, gap: 12 },
  pageMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  pageIndex: { fontSize: TypeScale.caption, color: GOLD, fontWeight: '800' },
  noteChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(216,181,109,0.18)',
  },
  noteText: { fontSize: TypeScale.micro, fontWeight: '800', color: GOLD_LIGHT },
  pageScroll: { flex: 1 },
  pageScrollContent: { flexGrow: 1, justifyContent: 'center', gap: 16, paddingVertical: 8 },
  zikrText: { fontSize: 26, lineHeight: 46, textAlign: 'center', fontWeight: '600', color: '#FFF9EA' },
  source: { fontSize: TypeScale.micro, textAlign: 'center', lineHeight: 18, color: 'rgba(239,248,243,0.62)' },
  counter: {
    alignSelf: 'center',
    minWidth: 150,
    height: 86,
    borderRadius: 43,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: GOLD,
    backgroundColor: 'rgba(216,181,109,0.14)',
  },
  counterDone: { backgroundColor: GOLD_LIGHT, borderColor: GOLD_LIGHT },
  counterNumber: { fontSize: 30, fontWeight: '900', color: GOLD_LIGHT, fontVariant: ['tabular-nums'] },
  counterTotal: { fontSize: TypeScale.caption, color: 'rgba(255,249,234,0.8)' },
  zone: { position: 'absolute', top: 0, bottom: 0, width: `${SIDE_ZONE * 100}%` },
  zoneRight: { right: 0 },
  zoneLeft: { left: 0 },
  hint: { textAlign: 'center', fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.5)', paddingBottom: 8 },
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  finishTitle: { fontSize: TypeScale.display, fontWeight: '900', color: '#FFF9EA', textAlign: 'center' },
  finishSub: { fontSize: TypeScale.body, color: GOLD_LIGHT },
  finishButton: {
    marginTop: 12,
    backgroundColor: GOLD_LIGHT,
    borderRadius: Radius.pill,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  finishButtonText: { fontWeight: '900', color: '#0B3D2E', fontSize: TypeScale.body },
  finishLink: { padding: 8 },
  finishLinkText: { color: 'rgba(239,248,243,0.7)', fontSize: TypeScale.label },
});
