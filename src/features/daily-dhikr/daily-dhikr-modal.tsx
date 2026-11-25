import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  markDailyDhikrShown,
  pickDailyDhikr,
  wasDailyDhikrShown,
} from '@/features/daily-dhikr/daily-dhikr';
import { toDateKey } from '@/features/memorization/services/review-schedule';
import { useTheme } from '@/hooks/use-theme';

/** A short dhikr or dua, shown once a day the first time the app opens. */
export function DailyDhikrModal({ enabled }: { enabled: boolean }) {
  const colors = useTheme();
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
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
          <Ionicons name="sparkles-outline" size={26} color={colors.accent} />
          <Text style={[styles.label, { color: colors.accent }]}>
            {dhikr.kind === 'dua' ? 'دعاء اليوم' : 'ذكر اليوم'}
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>{dhikr.text}</Text>
          <Text style={[styles.source, { color: colors.textSecondary }]}>{dhikr.source}</Text>
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                close();
                router.push('/azkar');
              }}
              style={[styles.secondary, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryText, { color: colors.text }]}>الأذكار</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={[styles.primary, { backgroundColor: colors.primary }]}>
              <Text style={styles.primaryText}>آمين</Text>
            </Pressable>
          </View>
        </View>
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
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
    gap: 12,
  },
  label: { fontSize: TypeScale.label, fontWeight: '800' },
  text: { fontSize: TypeScale.display, lineHeight: 38, textAlign: 'center', fontWeight: '600' },
  source: { fontSize: TypeScale.caption, textAlign: 'center' },
  buttons: { flexDirection: 'row-reverse', gap: Spacing.two, marginTop: 6 },
  primary: { paddingVertical: 11, paddingHorizontal: 30, borderRadius: Radius.pill },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: TypeScale.body },
  secondary: { paddingVertical: 11, paddingHorizontal: 22, borderRadius: Radius.pill, borderWidth: 1 },
  secondaryText: { fontWeight: '700', fontSize: TypeScale.body },
});
