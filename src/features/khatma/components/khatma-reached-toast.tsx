import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { KHATMA_GOLD, KHATMA_GOLD_LIGHT, KhatmaRing } from '@/features/khatma/components/khatma-ring';
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

const ENCOURAGEMENT: Record<KhatmaKind, string[]> = {
  reading: [
    'بارك الله فيك وفي وقتك',
    'الحرف بحسنة، والحسنة بعشر أمثالها',
    'ثبّتك الله على كتابه',
    'اللهم اجعل القرآن ربيع قلوبنا',
  ],
  memorization: ['ثبّت الله حفظك ويسّره عليك', 'اللهم اجعل القرآن في صدرك نورًا', 'خطوة جديدة في حفظ كتاب الله'],
  review: ['المراجعة تثبّت الحفظ، بارك الله فيك', 'ما شاء الله، حفظك يزداد رسوخًا', 'جزاك الله خيرًا على ثباتك'],
};

const MILESTONES: { at: number; label: string }[] = [
  { at: 0.25, label: 'ربع الختمة' },
  { at: 0.5, label: 'نصف الختمة' },
  { at: 0.75, label: 'ثلاثة أرباع الختمة' },
];

const BALLOONS = 30;
const BALLOON_COLORS = [KHATMA_GOLD, KHATMA_GOLD_LIGHT, '#FFF9EA', '#7FD1AE', '#2A8563', '#E8A87C'];

function percentLabel(fraction: number): string {
  const percent = fraction * 100;
  if (percent > 0 && percent < 10) {
    const text = (Math.round(percent * 10) / 10).toFixed(1).replace('.', '٫');
    return `${text.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])}٪`;
  }
  return `${toArabicNumbers(Math.round(percent))}٪`;
}

/**
 * A celebration in the middle of the reader after the page reached is marked: a
 * dim veil, a card popping in, the ring closing from the old to the new
 * progress, and balloons floating up the screen. Everything runs on the native
 * driver from two shared values, with no per-frame state updates, so it stays
 * smooth. Render it with `key={event.id}` so every mark plays it again.
 */
export function KhatmaReachedToast({ event, onDone }: { event: KhatmaReachedEvent; onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const total = Math.max(1, event.total);
  const [pop] = useState(() => new Animated.Value(0));
  const [float] = useState(() => new Animated.Value(0));
  const [ring] = useState(() => new Animated.Value(event.from / total));
  const [swap] = useState(() => new Animated.Value(0));
  const [balloons] = useState(() =>
    Array.from({ length: BALLOONS }, (_, i) => {
      const lane = (i * 0.618034) % 1;
      return {
        x: (lane - 0.5) * (width - 40),
        sway: 8 + (i % 4) * 4,
        start: ((i % 10) / 10) * 0.42,
        width: 22 + (i % 3) * 6,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      };
    }),
  );

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.spring(pop, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(ring, {
          toValue: event.to / total,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(swap, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.timing(float, {
          toValue: 1,
          duration: 3400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(3300),
          Animated.timing(pop, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });
    return () => animation.stop();
  }, [event.to, total, ring, onDone, pop, float, swap]);

  const remaining = total - event.to;
  const finished = remaining === 0;
  const gained = event.to - event.from;
  const milestone = [...MILESTONES]
    .reverse()
    .find((entry) => event.from / total < entry.at && event.to / total >= entry.at);
  const lines = ENCOURAGEMENT[event.kind];
  const encouragement = lines[Math.abs(event.id) % lines.length];
  const headline = finished
    ? 'ما شاء الله، ختمت'
    : event.perDay > 0 && event.todayDone >= event.perDay
      ? 'ما شاء الله، أتممت ورد اليوم'
      : KHATMA_KIND_TEXT[event.kind].headline(toArabicNumbers(event.page));
  const todayRatio = event.perDay > 0 ? Math.min(1, event.todayDone / event.perDay) : 0;
  const travel = height / 2 + 90;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[styles.veil, { opacity: pop.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]}
      />
      <View style={styles.balloonLayer} renderToHardwareTextureAndroid>
        {balloons.map((balloon, index) => {
          const t0 = balloon.start;
          return (
            <Animated.View
              key={index}
              style={[
                styles.balloon,
                {
                  width: balloon.width,
                  height: balloon.width * 1.25,
                  borderRadius: balloon.width / 2,
                  backgroundColor: balloon.color,
                  transform: [
                    {
                      translateY: float.interpolate({
                        inputRange: [0, t0, Math.min(1, t0 + 0.58)],
                        outputRange: [travel, travel, -travel],
                      }),
                    },
                    {
                      translateX: float.interpolate({
                        inputRange: [0, t0, t0 + 0.15, t0 + 0.3, Math.min(1, t0 + 0.58)],
                        outputRange: [
                          balloon.x,
                          balloon.x,
                          balloon.x + balloon.sway,
                          balloon.x - balloon.sway,
                          balloon.x,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
      <Animated.View
        renderToHardwareTextureAndroid
        style={[
          styles.card,
          {
            opacity: pop,
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          },
        ]}
      >
        {milestone ? (
          <View style={styles.badge}>
            <Ionicons name="ribbon" size={14} color="#0B3D2E" />
            <Text style={styles.badgeText}>وصلت {milestone.label}</Text>
          </View>
        ) : null}
        <KhatmaRing progress={ring} size={132} thickness={11}>
          <Animated.Text
            style={[
              styles.percent,
              styles.percentOld,
              { opacity: swap.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
            ]}
          >
            {percentLabel(event.from / total)}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.percent,
              styles.percentNew,
              {
                opacity: swap,
                transform: [{ scale: swap.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
              },
            ]}
          >
            {percentLabel(event.to / total)}
          </Animated.Text>
        </KhatmaRing>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.encourage}>{encouragement}</Text>
        <View style={styles.numbers}>
          <Ionicons name="checkmark-circle" size={16} color={KHATMA_GOLD} />
          <Text style={styles.number}>
            {gained > 0 ? `+${toArabicNumbers(gained)} صفحة · ` : ''}تم{' '}
            <Text style={styles.numberStrong}>{toArabicNumbers(event.to)}</Text> · باقي{' '}
            <Text style={styles.numberStrong}>{toArabicNumbers(remaining)}</Text>
          </Text>
        </View>
        {event.perDay > 0 ? (
          <View style={styles.todayRow}>
            <Text style={styles.todayText}>
              ورد اليوم {toArabicNumbers(Math.min(event.todayDone, event.perDay))} من{' '}
              {toArabicNumbers(event.perDay)}
            </Text>
            <View style={styles.todayTrack}>
              <View style={[styles.todayFill, { width: `${todayRatio * 100}%` }]} />
            </View>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    elevation: 24,
  },
  veil: { ...(StyleSheet.absoluteFill as object), backgroundColor: 'rgba(3, 20, 15, 0.45)' },
  balloonLayer: { ...(StyleSheet.absoluteFill as object), alignItems: 'center', justifyContent: 'center' },
  balloon: { position: 'absolute', opacity: 0.92 },
  card: {
    width: '86%',
    maxWidth: 380,
    backgroundColor: '#0B4F3B',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(216, 181, 109, 0.75)',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: 10,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    backgroundColor: KHATMA_GOLD_LIGHT,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  badgeText: { fontSize: TypeScale.caption, fontWeight: '900', color: '#0B3D2E' },
  percent: { fontSize: 28, fontWeight: '900', color: '#FFF9EA', textAlign: 'center' },
  percentOld: { position: 'absolute' },
  percentNew: { position: 'absolute' },
  headline: { fontSize: 22, fontWeight: '900', color: '#FFF9EA', textAlign: 'center' },
  encourage: { fontSize: TypeScale.body, color: KHATMA_GOLD_LIGHT, textAlign: 'center', lineHeight: 24 },
  numbers: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  number: { fontSize: TypeScale.label, color: 'rgba(239, 248, 243, 0.88)', textAlign: 'center' },
  numberStrong: { color: KHATMA_GOLD_LIGHT, fontWeight: '900' },
  todayRow: { gap: 6, alignSelf: 'stretch' },
  todayText: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.8)', textAlign: 'center' },
  todayTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  todayFill: { height: '100%', borderRadius: 4, backgroundColor: KHATMA_GOLD },
});
