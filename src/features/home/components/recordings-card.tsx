import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, TypeScale } from '@/constants/theme';
import { formatRecordingCount } from '@/features/annotations/utils/recordings-format';

type RecordingsCardProps = {
  count: number;
  loading?: boolean;
};

/**
 * Home entry to the reader's own recordings: the same emerald glass slab as the
 * «متابعة القراءة» card, opening the full list of everything they recorded.
 */
export function RecordingsCard({ count, loading = false }: RecordingsCardProps) {
  const hasRecordings = count > 0;
  const summary = loading ? 'جارٍ التحقق…' : formatRecordingCount(count);

  return (
    <Link href="/recordings" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`تسجيلاتي، ${summary}`}
        style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
        <GlassSurface variant="emerald" radius={Radius.lg} contentStyle={styles.content}>
          <View pointerEvents="none" style={styles.ornament} />

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name={hasRecordings ? 'mic' : 'mic-outline'} size={17} color="#F3D28C" />
            </View>
            <Text style={styles.eyebrow} numberOfLines={1}>التسجيلات</Text>
            <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.75)" />
          </View>

          <View style={styles.detailRow}>
            <View style={styles.copy}>
              <Text style={styles.title} numberOfLines={1}>{summary}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {loading
                  ? 'جارٍ تحميل تسجيلاتك'
                  : hasRecordings
                    ? 'جاهزة للاستماع'
                    : 'ابدأ بأول تسجيل لك'}
              </Text>
            </View>

            <View style={styles.playBadge}>
              <Ionicons
                name={hasRecordings ? 'play' : 'mic-outline'}
                size={16}
                color="#0B382D"
              />
            </View>
          </View>
        </GlassSurface>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
  },
  content: {
    minHeight: 132,
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
ornament: {
    position: 'absolute',
    top: -36,
    left: -28,
    width: 84,
    height: 84,
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.16)',
    borderRadius: 28,
    transform: [{ rotate: '45deg' }],
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,181,109,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.3)',
  },
  eyebrow: {
    flex: 1,
    fontSize: TypeScale.label,
    fontWeight: '800',
    color: '#E8C77F',
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    gap: 3,
  },
  title: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
    color: '#FFF9EA',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: TypeScale.micro - 1,
    lineHeight: 15,
    color: 'rgba(239,248,243,0.76)',
    textAlign: 'right',
  },
  playBadge: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: '#E8C77F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
