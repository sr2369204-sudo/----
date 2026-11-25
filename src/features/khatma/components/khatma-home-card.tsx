import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { KHATMA_KIND_TEXT, khatmaStatus, type Khatma } from '@/features/khatma/services/khatma';

type Props = {
  khatma: Khatma | null;
  loading: boolean;
  today: string;
};

/** The home card for the khatma. It takes the place of the old daily wird card. */
export function KhatmaHomeCard({ khatma, loading, today }: Props) {
  const status = khatma ? khatmaStatus(khatma, today) : null;
  const progress = status ? status.done / 604 : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="الختمة"
      onPress={() => router.push('/khatma')}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.body}>
        <View pointerEvents="none" style={styles.glow} />
        <View style={styles.heading}>
          <View style={styles.icon}>
            <Ionicons name="book-outline" size={21} color="#E8C77F" />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{khatma ? KHATMA_KIND_TEXT[khatma.kind].title : 'ختمتك'}</Text>
            <Text style={styles.subtitle}>
              {loading
                ? 'جارٍ التحميل…'
                : !status
                  ? 'لسه ما بدأتش ختمة'
                  : `${toArabicNumbers(khatma!.targetDays)} يوم · اليوم ${toArabicNumbers(status.daysElapsed + 1)}`}
            </Text>
          </View>
          {status && <Text style={styles.percent}>{toArabicNumbers(status.percent)}٪</Text>}
        </View>

        {status ? (
          <>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>
                {khatma ? KHATMA_KIND_TEXT[khatma.kind].reachedVerb : 'وصلت'} صفحة{' '}
                <Text style={styles.statStrong}>{toArabicNumbers(status.reachedPage ?? 0)}</Text>
              </Text>
              <Text style={styles.stat}>
                باقي <Text style={styles.statStrong}>{toArabicNumbers(status.remaining)}</Text> صفحة
              </Text>
            </View>
            <View style={styles.footer}>
              <Ionicons
                name={status.finished || status.todayLeft === 0 ? 'sparkles-outline' : 'flag-outline'}
                size={14}
                color="#D8B56D"
              />
              <Text style={styles.footnote}>
                {status.finished
                  ? 'ما شاء الله، ختمت المصحف'
                  : status.todayLeft === 0
                    ? 'ما شاء الله، أتممت ورد اليوم'
                    : `ورد اليوم: باقي ${toArabicNumbers(status.todayLeft)} من ${toArabicNumbers(status.perDay)} صفحة`}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.footer}>
            <Ionicons name="add-circle-outline" size={16} color="#D8B56D" />
            <Text style={styles.footnote}>اختار نوع الختمة ونقطة البدء والمدة، وابدأ.</Text>
          </View>
        )}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  body: { position: 'relative', padding: Spacing.three, gap: 12 },
  glow: {
    position: 'absolute',
    top: -90,
    right: -52,
    width: 220,
    height: 220,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(42, 133, 99, 0.2)',
  },
  heading: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    minHeight: 48,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216, 181, 109, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.45)',
  },
  copy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  title: { fontSize: TypeScale.label, fontWeight: '900', color: '#FFF9EA' },
  subtitle: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.65)' },
  percent: { fontSize: 28, fontWeight: '900', color: '#F3D28C' },
  track: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    flexDirection: 'row-reverse',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: '#D8B56D',
  },
  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  stat: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.76)' },
  statStrong: { color: '#F3D28C', fontWeight: '900' },
  footer: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  footnote: {
    flex: 1,
    fontSize: TypeScale.micro,
    textAlign: 'right',
    color: 'rgba(239, 248, 243, 0.78)',
  },
});
