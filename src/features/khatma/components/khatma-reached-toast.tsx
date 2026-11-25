import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { KHATMA_KIND_TEXT, MUSHAF_PAGES, type KhatmaKind } from '@/features/khatma/services/khatma';

export type KhatmaReachedEvent = {
  /** Changes on every mark so the same page can celebrate twice. */
  id: number;
  from: number;
  to: number;
  /** Mushaf page reached. */
  page: number;
  kind: KhatmaKind;
  todayDone: number;
  perDay: number;
};

const VISIBLE_MS = 3200;

/**
 * A short celebration after the reader marks the page they reached: the card
 * rises, the check pops, the bar fills from the old to the new progress, and
 * it says how much is done and how much is left. Render it with `key={event.id}`
 * so every mark plays it again.
 */
export function KhatmaReachedToast({ event, onDone }: { event: KhatmaReachedEvent; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const shown = event;
  const [rise] = useState(() => new Animated.Value(0));
  const [pop] = useState(() => new Animated.Value(0));
  const [bar] = useState(() => new Animated.Value((event.from / MUSHAF_PAGES) * 100));
  const [percentText, setPercentText] = useState(Math.round((event.from / MUSHAF_PAGES) * 100));

  useEffect(() => {
    const toPercent = (event.to / MUSHAF_PAGES) * 100;
    const listener = bar.addListener(({ value }) => setPercentText(Math.round(value)));
    const animation = Animated.sequence([
      Animated.timing(rise, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(pop, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(bar, {
          toValue: toPercent,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(VISIBLE_MS - 1500),
      Animated.timing(rise, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });
    return () => {
      animation.stop();
      bar.removeListener(listener);
    };
  }, [event.to, bar, onDone, pop, rise]);

  const remaining = MUSHAF_PAGES - shown.to;
  const finished = remaining === 0;
  const undone = shown.to < shown.from;
  const gained = shown.to - shown.from;
  const headline = finished
    ? 'ما شاء الله، ختمت المصحف'
    : undone
      ? 'تم التراجع صفحة'
      : shown.perDay > 0 && shown.todayDone >= shown.perDay
        ? 'ما شاء الله، أتممت ورد اليوم'
        : KHATMA_KIND_TEXT[shown.kind].headline(toArabicNumbers(shown.page));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + 96,
          opacity: rise,
          transform: [
            {
              translateY: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.top}>
          <Animated.View
            style={[
              styles.badge,
              {
                transform: [
                  {
                    scale: pop.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                  {
                    rotate: pop.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-25deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name={undone ? 'arrow-undo' : finished ? 'trophy' : 'checkmark'}
              size={22}
              color="#0B3B2C"
            />
          </Animated.View>
          <View style={styles.copy}>
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.sub}>
              {undone
                ? `رجعت لصفحة ${toArabicNumbers(shown.to)}`
                : gained > 0
                  ? `+${toArabicNumbers(gained)} صفحة · اليوم ${toArabicNumbers(shown.todayDone)} من ${toArabicNumbers(shown.perDay)}`
                  : ''}
            </Text>
          </View>
          <Text style={styles.percent}>{toArabicNumbers(percentText)}٪</Text>
        </View>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: bar.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.numbers}>
          <Text style={styles.number}>
            تم <Text style={styles.numberStrong}>{toArabicNumbers(shown.to)}</Text> صفحة
          </Text>
          <Text style={styles.number}>
            باقي <Text style={styles.numberStrong}>{toArabicNumbers(remaining)}</Text> صفحة
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 50,
    elevation: 12,
  },
  card: {
    backgroundColor: '#0D6048',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.55)',
    padding: Spacing.three,
    gap: 10,
  },
  top: { flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  badge: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: '#D8B56D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  headline: {
    fontSize: TypeScale.body,
    fontWeight: '900',
    color: '#FFF9EA',
    textAlign: 'right',
  },
  sub: {
    fontSize: TypeScale.caption,
    color: 'rgba(239, 248, 243, 0.75)',
    textAlign: 'right',
  },
  percent: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F3D28C',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    flexDirection: 'row-reverse',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: '#D8B56D',
  },
  numbers: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  number: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.8)' },
  numberStrong: { color: '#F3D28C', fontWeight: '900' },
});
