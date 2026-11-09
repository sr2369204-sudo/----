import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
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
        style={({ pressed }) => pressed && styles.pressed}>
        <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.content}>
          <View pointerEvents="none" style={styles.ornament} />
          <View pointerEvents="none" style={styles.glow} />

          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name={hasRecordings ? 'mic' : 'mic-outline'} size={24} color="#F3D28C" />
            </View>

            <View style={styles.copy}>
              <Text style={styles.eyebrow}>تسجيلاتي</Text>
              <Text style={styles.title} numberOfLines={1}>
                {summary}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {hasRecordings ? 'استمع إلى تسجيلاتك الخاصة' : 'لا توجد تسجيلات بعد'}
              </Text>
            </View>

            {hasRecordings && (
              <View style={styles.cta}>
                <Ionicons name="play" size={16} color="#0B382D" />
                <Text style={styles.ctaText}>استمع</Text>
              </View>
            )}
          </View>
        </GlassSurface>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  ornament: {
    position: 'absolute',
    top: -46,
    left: -30,
    width: 128,
    height: 128,
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.16)',
    borderRadius: 34,
    transform: [{ rotate: '45deg' }],
  },
  glow: {
    position: 'absolute',
    top: -70,
    right: -40,
    width: 190,
    height: 190,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(46,140,104,0.24)',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,181,109,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(216,181,109,0.4)',
  },
  copy: {
    flex: 1,
    gap: 1,
    alignItems: 'flex-end',
  },
  eyebrow: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
    color: '#E8C77F',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: TypeScale.display,
    fontWeight: '900',
    color: '#FFF9EA',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: TypeScale.caption,
    color: 'rgba(239,248,243,0.7)',
    textAlign: 'right',
  },
  cta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: '#E8C77F',
  },
  ctaText: {
    fontSize: TypeScale.label,
    fontWeight: '900',
    color: '#0B382D',
  },
});
