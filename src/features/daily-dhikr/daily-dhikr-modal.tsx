import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  markDailyDhikrShown,
  pickDailyDhikr,
  wasDailyDhikrShown,
} from '@/features/daily-dhikr/daily-dhikr';
import { toDateKey } from '@/features/memorization/services/review-schedule';

/** A short dhikr or dua, shown once a day the first time the app opens. */
export function DailyDhikrModal({ enabled }: { enabled: boolean }) {
  const database = useSQLiteContext();
  const [visible, setVisible] = useState(false);
  const today = toDateKey(new Date());
  const dhikr = pickDailyDhikr(today);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let active = true;
    void wasDailyDhikrShown(database, today)
      .then((shown) => {
        if (active && !shown) {
          setVisible(true);
          return markDailyDhikrShown(database, today);
        }
        return undefined;
      })
      .catch((error) => console.error('تعذر تحميل ذكر اليوم.', error));
    return () => {
      active = false;
    };
  }, [database, enabled, today]);

  const close = () => setVisible(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <GlassSurface variant="emerald" radius={Radius.xl} style={styles.cardShell} contentStyle={styles.card}>
          <View pointerEvents="none" style={styles.glow} />
          <View style={styles.iconRing}>
            <Ionicons name="sparkles-outline" size={22} color="#E8C77F" />
          </View>
          <Text style={styles.label}>{dhikr.kind === 'dua' ? 'دعاء اليوم' : 'ذكر اليوم'}</Text>
          <View style={styles.divider} />
          <Text style={styles.text}>{dhikr.text}</Text>
          <Text style={styles.source}>{dhikr.source}</Text>
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                close();
                router.push('/azkar');
              }}
              style={styles.secondary}>
              <Text style={styles.secondaryText}>الأذكار</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={styles.primary}>
              <Text style={styles.primaryText}>آمين</Text>
            </Pressable>
          </View>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  cardShell: { width: '100%', maxWidth: 420 },
  card: { padding: Spacing.four, alignItems: 'center', gap: 12 },
  glow: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(216, 181, 109, 0.16)',
  },
  iconRing: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216, 181, 109, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.5)',
  },
  label: { fontSize: TypeScale.label, fontWeight: '800', color: '#E8C77F' },
  divider: { width: 48, height: 2, borderRadius: 2, backgroundColor: 'rgba(216, 181, 109, 0.6)' },
  text: { fontSize: TypeScale.display, lineHeight: 40, textAlign: 'center', fontWeight: '600', color: '#FFF9EA' },
  source: { fontSize: TypeScale.caption, textAlign: 'center', color: 'rgba(239, 248, 243, 0.7)' },
  buttons: { flexDirection: 'row-reverse', gap: Spacing.two, marginTop: 6 },
  primary: { paddingVertical: 11, paddingHorizontal: 30, borderRadius: Radius.pill, backgroundColor: '#D8B56D' },
  primaryText: { color: '#0B3B2C', fontWeight: '800', fontSize: TypeScale.body },
  secondary: { paddingVertical: 11, paddingHorizontal: 22, borderRadius: Radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  secondaryText: { color: '#FFF9EA', fontWeight: '700', fontSize: TypeScale.body },
});
