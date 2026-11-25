import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import {
  IslamicStar,
  KHATMA_GOLD,
  KHATMA_GOLD_LIGHT,
  KhatmaRing,
} from '@/features/khatma/components/khatma-ring';
import { KHATMA_KIND_TEXT, type KhatmaKind } from '@/features/khatma/services/khatma';

export type KhatmaReachedEvent = {
  /** Changes on every mark so the same page can celebrate twice. */
  id: number;
  /** Pages done before and after the mark. */
  from: number;
  to: number;
  /** Pages in the whole khatma. */
  total: number;
  /** Mushaf page reached. */
  page: number;
  kind: KhatmaKind;
  todayDone: number;
  perDay: number;
};

const VISIBLE_MS = 3600;

/**
 * A short celebration after the reader marks the page they reached: the card
 * rises, the ring closes from the old to the new progress with the number
 * counting up, the star pulses, and it says how much is done and left. Render
 * it with `key={event.id}` so every mark plays it again.
 */
export function KhatmaReachedToast({ event, onDone }: { event: KhatmaReachedEvent; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const total = Math.max(1, event.total);
  const [rise] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const [ring] = useState(() => new Animated.Value(event.from / total));
  const [percentText, setPercentText] = useState(Math.round((event.from / total) * 100));

  useEffect(() => {
    const listener = ring.addListener(({ value }) => setPercentText(Math.round(value * 100)));
    const animation = Animated.sequence([
      Animated.timing(rise, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(ring, {
          toValue: event.to / total,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(700),
          Animated.spring(pulse, { toValue: 1, friction: 3, tension: 140, useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(VISIBLE_MS - 2100),
      Animated.timing(rise, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });
    return () => {
      animation.stop();
      ring.removeListener(listener);
    };
  }, [event.to, total, ring, onDone, pulse, rise]);

  const remaining = total - event.to;
  const finished = remaining === 0;
  const gained = event.to - event.from;
  const headline = finished
    ? 'ما شاء الله، ختمت'
    : event.perDay > 0 && event.todayDone >= event.perDay
      ? 'ما شاء الله، أتممت ورد اليوم'
      : KHATMA_KIND_TEXT[event.kind].headline(toArabicNumbers(event.page));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + 96,
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}
    >
      <View style={styles.card}>
        <IslamicStar size={130} opacity={0.09} style={styles.watermark} />
        <View style={styles.row}>
          <Animated.View
            style={{
              transform: [
                { scale: pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] }) },
              ],
            }}
          >
            <KhatmaRing progress={ring} size={92} thickness={8}>
              <Animated.View
                style={{
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.45] }),
                  position: 'absolute',
                }}
              >
                <IslamicStar size={62} filled color={finished ? KHATMA_GOLD_LIGHT : KHATMA_GOLD} />
              </Animated.View>
              <Text style={styles.percent}>{toArabicNumbers(percentText)}٪</Text>
            </KhatmaRing>
          </Animated.View>
          <View style={styles.copy}>
            <Text style={styles.headline}>{headline}</Text>
            {gained > 0 ? (
              <Text style={styles.sub}>
                +{toArabicNumbers(gained)} صفحة · اليوم {toArabicNumbers(event.todayDone)} من{' '}
                {toArabicNumbers(event.perDay)}
              </Text>
            ) : null}
            <View style={styles.numbers}>
              <Ionicons name="checkmark-circle" size={14} color={KHATMA_GOLD} />
              <Text style={styles.number}>
                تم <Text style={styles.numberStrong}>{toArabicNumbers(event.to)}</Text>
              </Text>
              <Text style={styles.number}>·</Text>
              <Text style={styles.number}>
                باقي <Text style={styles.numberStrong}>{toArabicNumbers(remaining)}</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: Spacing.three, right: Spacing.three, zIndex: 50, elevation: 12 },
  card: {
    backgroundColor: '#0B4F3B',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(216, 181, 109, 0.6)',
    padding: Spacing.three,
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', left: -30, top: -30 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  copy: { flex: 1, alignItems: 'flex-end', gap: 4 },
  headline: { fontSize: TypeScale.body, fontWeight: '900', color: '#FFF9EA', textAlign: 'right' },
  sub: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.78)', textAlign: 'right' },
  percent: { fontSize: 22, fontWeight: '900', color: '#FFF9EA', fontVariant: ['tabular-nums'] },
  numbers: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  number: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.85)' },
  numberStrong: { color: KHATMA_GOLD_LIGHT, fontWeight: '900' },
});
