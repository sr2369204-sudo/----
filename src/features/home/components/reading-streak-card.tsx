import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { toArabicNumbers } from '@/features/home/utils/format';
import type { ReadingHistory } from '@/features/reader/services/reading-history';
import { currentStreak } from '@/features/reader/services/reading-history';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  history: ReadingHistory | null;
  today: string;
};

/** Days in a row and how much of the Mushaf has been read, kept on the phone. */
export function ReadingStreakCard({ history, today }: Props) {
  const colors = useTheme();
  if (!history || (history.pages.length === 0 && history.days.length === 0)) {
    return null;
  }
  const streak = currentStreak(history.days, today);
  const pages = history.pages.length;
  const percent = Math.round((pages / 604) * 100);

  return (
    <View
      accessibilityLabel="أيام القراءة المتتالية وختمتك"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="flame-outline" size={18} color={colors.accent} />
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.text }]}>
            {streak > 0 ? `${toArabicNumbers(streak)} يوم متتالي من القراءة` : 'ابدأ سلسلة أيامك اليوم'}
          </Text>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            {`ختمتك: ${toArabicNumbers(pages)} من ٦٠٤ صفحة (${toArabicNumbers(percent)}٪)`}
          </Text>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: colors.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  badge: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  caption: { fontSize: 12, textAlign: 'right' },
  track: { height: 8, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});
