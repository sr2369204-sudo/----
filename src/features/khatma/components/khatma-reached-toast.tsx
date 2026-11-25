import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import {
  ConcentricRings,
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

const VISIBLE_MS = 4800;
const PARTICLES = 16;

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

const PARTICLE_COLORS = [KHATMA_GOLD, KHATMA_GOLD_LIGHT, '#FFF9EA', '#7FD1AE'];

function percentLabel(fraction: number): string {
  const percent = fraction * 100;
  if (percent > 0 && percent < 10) {
    const text = (Math.round(percent * 10) / 10).toFixed(1).replace('.', '٫');
    return `${text.replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])}٪`;
  }
  return `${toArabicNumbers(Math.round(percent))}٪`;
}

/**
 * A celebration at the top of the reader after the page reached is marked: the
 * card drops in, golden beads burst out of the ring, the ring closes from the
 * old to the new progress with the percent counting up, and it says an
 * encouraging line, any milestone passed and what is left. Render it with
 * `key={event.id}` so every mark plays it again.
 */
export function KhatmaReachedToast({ event, onDone }: { event: KhatmaReachedEvent; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const total = Math.max(1, event.total);
  const [rise] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const [burst] = useState(() => new Animated.Value(0));
  const [shine] = useState(() => new Animated.Value(0));
  const [ring] = useState(() => new Animated.Value(event.from / total));
  const [fractionText, setFractionText] = useState(event.from / total);
  const [particles] = useState(() =>
    Array.from({ length: PARTICLES }, (_, i) => {
      const angle = (i / PARTICLES) * Math.PI * 2 + (i % 2) * 0.18;
      const distance = 62 + (i % 3) * 16;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 5 + (i % 3) * 2,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        round: i % 4 !== 0,
      };
    }),
  );

  useEffect(() => {
    const listener = ring.addListener(({ value }) => setFractionText(value));
    const animation = Animated.sequence([
      Animated.timing(rise, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(ring, {
          toValue: event.to / total,
          duration: 1300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(600),
          Animated.parallel([
            Animated.spring(pulse, { toValue: 1, friction: 3, tension: 140, useNativeDriver: true }),
            Animated.timing(burst, {
              toValue: 1,
              duration: 1300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(shine, { toValue: 1, duration: 1500, useNativeDriver: true }),
          ]),
        ]),
      ]),
      Animated.delay(Math.max(0, VISIBLE_MS - 2700)),
      Animated.timing(rise, { toValue: 0, duration: 300, useNativeDriver: true }),
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
  }, [event.to, total, ring, onDone, pulse, rise, burst, shine]);

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

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + 8,
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [-90, 0] }) }],
        },
      ]}
    >
      <View style={styles.card}>
        <ConcentricRings size={190} opacity={0.1} style={styles.watermark} />
        <Animated.View
          style={[
            styles.shine,
            {
              opacity: shine.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.5, 0] }),
              transform: [
                { translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-160, 360] }) },
              ],
            },
          ]}
        />
        <View style={styles.row}>
          <View style={styles.ringBox}>
            {particles.map((particle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.round ? particle.size / 2 : 2,
                    backgroundColor: particle.color,
                    opacity: burst.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 1, 0.9, 0] }),
                    transform: [
                      { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, particle.x] }) },
                      { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, particle.y] }) },
                      { scale: burst.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.2, 0.6] }) },
                    ],
                  },
                ]}
              />
            ))}
            <Animated.View
              style={{
                transform: [
                  { scale: pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.14, 1] }) },
                ],
              }}
            >
              <KhatmaRing progress={ring} size={92} thickness={8}>
                <Animated.View
                  style={[
                    styles.glow,
                    {
                      backgroundColor: finished ? KHATMA_GOLD_LIGHT : KHATMA_GOLD,
                      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.3] }),
                    },
                  ]}
                />
                <Text style={styles.percent}>{percentLabel(fractionText)}</Text>
              </KhatmaRing>
            </Animated.View>
          </View>
          <View style={styles.copy}>
            {milestone ? (
              <View style={styles.badge}>
                <Ionicons name="ribbon" size={12} color="#0B3D2E" />
                <Text style={styles.badgeText}>وصلت {milestone.label}</Text>
              </View>
            ) : null}
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.encourage}>{encouragement}</Text>
            <View style={styles.numbers}>
              <Ionicons name="checkmark-circle" size={14} color={KHATMA_GOLD} />
              <Text style={styles.number}>
                {gained > 0 ? `+${toArabicNumbers(gained)} صفحة · ` : ''}تم{' '}
                <Text style={styles.numberStrong}>{toArabicNumbers(event.to)}</Text> · باقي{' '}
                <Text style={styles.numberStrong}>{toArabicNumbers(remaining)}</Text>
              </Text>
            </View>
          </View>
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
    borderColor: 'rgba(216, 181, 109, 0.7)',
    padding: Spacing.three,
    gap: 12,
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', left: -60, top: -70 },
  shine: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 60,
    backgroundColor: 'rgba(243, 210, 140, 0.35)',
    transform: [{ rotate: '18deg' }],
  },
  ringBox: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
  glow: { position: 'absolute', width: 64, height: 64, borderRadius: 32 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  copy: { flex: 1, alignItems: 'flex-end', gap: 4 },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: KHATMA_GOLD_LIGHT,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: { fontSize: TypeScale.micro, fontWeight: '900', color: '#0B3D2E' },
  headline: { fontSize: TypeScale.body, fontWeight: '900', color: '#FFF9EA', textAlign: 'right' },
  encourage: { fontSize: TypeScale.caption, color: KHATMA_GOLD_LIGHT, textAlign: 'right' },
  percent: { fontSize: 20, fontWeight: '900', color: '#FFF9EA', fontVariant: ['tabular-nums'] },
  numbers: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  number: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.85)', textAlign: 'right' },
  numberStrong: { color: KHATMA_GOLD_LIGHT, fontWeight: '900' },
  todayRow: { gap: 6 },
  todayText: { fontSize: TypeScale.micro, color: 'rgba(239, 248, 243, 0.8)', textAlign: 'right' },
  todayTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    flexDirection: 'row-reverse',
  },
  todayFill: { height: '100%', borderRadius: 3, backgroundColor: KHATMA_GOLD },
});
