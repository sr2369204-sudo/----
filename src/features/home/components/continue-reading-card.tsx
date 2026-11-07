import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';

type ContinueReadingCardProps = {
  position: { surahNumber: number; ayahNumber: number } | null;
  surahNameByNumber: Map<number, string>;
  loading?: boolean;
};

/**
 * The home focal point: a deep emerald glass slab that takes the reader back to
 * exactly where they stopped, or invites a first start when nothing is saved.
 */
export function ContinueReadingCard({
  position,
  surahNameByNumber,
  loading = false,
}: ContinueReadingCardProps) {
  const surahName = position ? surahNameByNumber.get(position.surahNumber) : undefined;
  const hasPosition = Boolean(position && surahName);

  return (
    <Animated.View entering={FadeInDown.duration(560).delay(120)}>
      <Link
        href={
          position
            ? {
                pathname: '/reader',
                params: {
                  surahNumber: String(position.surahNumber),
                  ayahNumber: String(position.ayahNumber),
                },
              }
            : '/reader'
        }
        asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            hasPosition && position && surahName
              ? `متابعة القراءة من سورة ${surahName} الآية ${toArabicNumbers(position.ayahNumber)}`
              : 'ابدأ القراءة من سورة الفاتحة'
          }
          style={({ pressed }) => pressed && styles.pressed}>
          <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.content}>
            <View pointerEvents="none" style={styles.ornament} />
            <View pointerEvents="none" style={styles.glow} />

            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={hasPosition ? 'book' : 'book-outline'}
                  size={24}
                  color="#F3D28C"
                />
              </View>

              <View style={styles.copy}>
                <Text style={styles.eyebrow}>
                  {hasPosition ? 'متابعة القراءة' : 'ابدأ رحلتك'}
                </Text>
                <Text style={styles.title} numberOfLines={1}>
                  {loading
                    ? 'جارٍ التحقق…'
                    : hasPosition && position && surahName
                      ? `سورة ${surahName}`
                      : 'سورة الفاتحة'}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {loading
                    ? 'نستعيد موضعك الأخير'
                    : hasPosition && position
                      ? `الآية ${toArabicNumbers(position.ayahNumber)} · من حيث توقفت`
                      : 'ابدأ قراءتك الأولى اليوم'}
                </Text>
              </View>

              <View style={styles.cta}>
                <Ionicons name={hasPosition ? 'play' : 'arrow-back'} size={16} color="#0B382D" />
                <Text style={styles.ctaText}>{hasPosition ? 'متابعة' : 'ابدأ'}</Text>
              </View>
            </View>
          </GlassSurface>
        </Pressable>
      </Link>
    </Animated.View>
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
