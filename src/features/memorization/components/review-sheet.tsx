import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HEART_CELLS } from '@/features/memorization/data/heart-cells';
import type { DueSurah } from '@/features/memorization/services/review-schedule';
import { toArabicNumbers } from '@/features/settings/utils/format';
import type { useTheme } from '@/hooks/use-theme';

const NAME_BY_SURAH = new Map(HEART_CELLS.map((cell) => [cell.surahNumber, cell.surahName]));

type Props = {
  visible: boolean;
  colors: ReturnType<typeof useTheme>;
  due: DueSurah[];
  onReviewed: (surahNumber: number) => void;
  onClose: () => void;
};

/** Lists the memorized surahs that are due for review, each with a "reviewed" button. */
export function ReviewSheet({ visible, colors, due, onReviewed, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>سور تحتاج مراجعة</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          {due.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              ما شاء الله، كل ما حفظته تمت مراجعته. 
            </Text>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {due.map((item) => (
                <View
                  key={item.surahNumber}
                  style={[styles.row, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.rowText}>
                    <Text style={[styles.name, { color: colors.text }]}>
                      {`سورة ${NAME_BY_SURAH.get(item.surahNumber) ?? toArabicNumbers(item.surahNumber)}`}
                    </Text>
                    <Text style={[styles.caption, { color: colors.textSecondary }]}>
                      {`آخر مراجعة قبل ${toArabicNumbers(item.daysSince)} يوم`}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onReviewed(item.surahNumber)}
                    style={[styles.done, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
                    <Text style={[styles.doneText, { color: colors.onPrimary }]}>راجعتها</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(4, 17, 12, 0.55)',
  },
  card: { borderRadius: 22, borderWidth: 1, padding: 16, maxHeight: '80%', gap: 12 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  empty: { fontSize: 14, lineHeight: 23, textAlign: 'right', paddingVertical: 12 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  rowText: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  caption: { fontSize: 12, textAlign: 'right' },
  done: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 38,
  },
  doneText: { fontSize: 13, fontWeight: '800' },
});
