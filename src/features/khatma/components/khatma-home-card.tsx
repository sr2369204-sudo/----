import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import {
  IslamicStar,
  KHATMA_GOLD,
  KHATMA_GOLD_LIGHT,
  KhatmaPercentRing,
} from '@/features/khatma/components/khatma-ring';
import { KHATMA_KIND_TEXT, khatmaStatus, type Khatma } from '@/features/khatma/services/khatma';
import { khatmaRangeLabel } from '@/features/khatma/utils/khatma-labels';

type Props = {
  khatma: Khatma | null;
  loading: boolean;
  today: string;
};

export function KhatmaHomeCard({ khatma, loading, today }: Props) {
  const status = khatma ? khatmaStatus(khatma, today) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="الختمة"
      onPress={() => router.push('/khatma')}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.body}>
        <View pointerEvents="none" style={styles.glow} />
        <IslamicStar size={150} opacity={0.1} style={styles.watermark} />
        <IslamicStar size={96} opacity={0.08} style={styles.watermarkSmall} />

        {status && khatma ? (
          <>
            <View style={styles.main}>
              <KhatmaPercentRing fraction={status.done / status.total} size={112} />
              <View style={styles.copy}>
                <Text style={styles.kicker}>بسم الله الرحمن الرحيم</Text>
                <Text style={styles.title}>{KHATMA_KIND_TEXT[khatma.kind].title}</Text>
                <Text style={styles.subtitle}>{khatmaRangeLabel(khatma)}</Text>
                <Text style={styles.stat}>
                  {KHATMA_KIND_TEXT[khatma.kind].reachedVerb} صفحة{' '}
                  <Text style={styles.statStrong}>{toArabicNumbers(status.done)}</Text>
                  {' من '}
                  <Text style={styles.statStrong}>{toArabicNumbers(status.total)}</Text>
                </Text>
                <Text style={styles.subtitle}>
                  اليوم {toArabicNumbers(status.daysElapsed + 1)} من {toArabicNumbers(khatma.targetDays)}
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <Ionicons
                name={status.finished || status.todayLeft === 0 ? 'sparkles-outline' : 'flag-outline'}
                size={14}
                color={KHATMA_GOLD}
              />
              <Text style={styles.footnote}>
                {status.finished
                  ? 'ما شاء الله، ختمت'
                  : status.todayLeft === 0
                    ? 'ما شاء الله، أتممت ورد اليوم'
                    : `ورد اليوم: باقي ${toArabicNumbers(status.todayLeft)} من ${toArabicNumbers(status.perDay)} صفحة`}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.main}>
            <View style={styles.emptyStar}>
              <IslamicStar size={64} color={KHATMA_GOLD_LIGHT} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.kicker}>بسم الله الرحمن الرحيم</Text>
              <Text style={styles.title}>ختمتك</Text>
              <Text style={styles.subtitle}>
                {loading ? 'جارٍ التحميل…' : 'ابدأ ختمة: اختر النوع والنطاق والمدة'}
              </Text>
            </View>
          </View>
        )}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  body: { position: 'relative', padding: Spacing.three, gap: 12, overflow: 'hidden' },
  glow: {
    position: 'absolute',
    top: -90,
    right: -52,
    width: 220,
    height: 220,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(42, 133, 99, 0.2)',
  },
  watermark: { position: 'absolute', left: -34, bottom: -40 },
  watermarkSmall: { position: 'absolute', right: -20, top: -24 },
  main: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  copy: { flex: 1, alignItems: 'flex-end', gap: 3 },
  kicker: { fontSize: TypeScale.micro, color: KHATMA_GOLD, letterSpacing: 0.3 },
  title: { fontSize: TypeScale.title, fontWeight: '900', color: '#FFF9EA' },
  subtitle: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.7)', textAlign: 'right' },
  stat: { fontSize: TypeScale.label, color: 'rgba(239, 248, 243, 0.9)', textAlign: 'right' },
  statStrong: { fontWeight: '900', color: KHATMA_GOLD_LIGHT },
  emptyStar: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.5)',
    backgroundColor: 'rgba(216, 181, 109, 0.08)',
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216, 181, 109, 0.28)',
    paddingTop: 10,
  },
  footnote: { fontSize: TypeScale.caption, color: 'rgba(255, 249, 234, 0.9)', textAlign: 'right' },
});
