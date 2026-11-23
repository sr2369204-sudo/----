import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { getSurahTopics, SURAH_TOPICS_DATASET } from '@/features/surah-topics/services/surah-topics';
import type { TopicSection } from '@/features/surah-topics/types';
import { useTheme } from '@/hooks/use-theme';

type SurahTopicsSheetProps = {
  visible: boolean;
  /** The surah whose sections are listed; null hides the content. */
  surahNumber: number | null;
  /** Display name for the surah heading. */
  surahName: string;
  /** Applies a section: the reader jumps to it and highlights its ayahs. */
  onSelectSection: (section: TopicSection) => void;
  onClose: () => void;
};

const CONFIDENCE_LABELS: Record<string, string> = SURAH_TOPICS_DATASET.meta.confidenceLegend;

/**
 * Lists the documented thematic sections of one surah. Surahs that have no
 * source-backed division are shown as such instead of being filled with made-up
 * titles, so the reader always knows what is established and what is not.
 */
export function SurahTopicsSheet({
  visible,
  surahNumber,
  surahName,
  onSelectSection,
  onClose,
}: SurahTopicsSheetProps) {
  const colors = useTheme();
  const record = useMemo(
    () => (surahNumber === null ? null : getSurahTopics(surahNumber)),
    [surahNumber],
  );
  const sections = record?.sections ?? [];
  const isDocumented = record?.status === 'documented' && sections.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <View style={styles.titleRow}>
                <View style={[styles.titleIcon, { backgroundColor: `${colors.primary}1A` }]}>
                  <Ionicons name="layers-outline" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>التفصيل الموضوعي</Text>
              </View>
              <Text style={[styles.caption, { color: colors.textSecondary }]}>
                {`سورة ${surahName} · ${toArabicNumbers(record?.ayahCount ?? 0)} آية`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={onClose}
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.ornamentRow}>
            <View style={[styles.ornamentLine, { backgroundColor: colors.border }]} />
            <View style={[styles.ornamentDiamond, { backgroundColor: colors.accent }]} />
            <View style={[styles.ornamentLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={[styles.statusRow, { borderColor: colors.border }]}>
            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: isDocumented ? `${colors.primary}1A` : `${colors.accent}22`,
                  borderColor: isDocumented ? colors.primary : colors.accent,
                },
              ]}>
              <Ionicons
                name={isDocumented ? 'checkmark-circle-outline' : 'time-outline'}
                size={13}
                color={isDocumented ? colors.primary : colors.accent}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isDocumented ? colors.primary : colors.accent },
                ]}>
                {isDocumented
                  ? `موثّق · ${toArabicNumbers(sections.length)} مقاطع`
                  : 'قيد المراجعة'}
              </Text>
            </View>
            <Text style={[styles.statusMeta, { color: colors.textSecondary }]}>
              {`${toArabicNumbers(SURAH_TOPICS_DATASET.meta.documentedSurahs.length)} من ${toArabicNumbers(SURAH_TOPICS_DATASET.meta.totalSurahs)} سورة موثّقة`}
            </Text>
          </View>

          {isDocumented ? (
            <FlatList
              data={sections}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`المقطع ${item.title}، الآيات ${item.startAyah} إلى ${item.endAyah}`}
                  onPress={() => onSelectSection(item)}
                  style={({ pressed }) => [
                    styles.row,
                    { borderColor: colors.border, backgroundColor: colors.background },
                    pressed && styles.pressed,
                  ]}>
                  <View style={[styles.rowAccent, { backgroundColor: colors.accent }]} />
                  <View style={styles.rowBody}>
                    <View style={styles.rowHeader}>
                      <View style={[styles.rangeBadge, { backgroundColor: `${colors.accent}1F` }]}>
                        <Text style={[styles.rangeText, { color: colors.accent }]}>
                          {toArabicNumbers(item.startAyah)}
                          {' – '}
                          {toArabicNumbers(item.endAyah)}
                        </Text>
                      </View>
                      <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </View>

                    <Text style={[styles.rowSummary, { color: colors.textSecondary }]}>
                      {item.summary}
                    </Text>

                    <View style={styles.rowFooter}>
                      <View style={styles.confidenceRow}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={13}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.confidence, { color: colors.textSecondary }]}>
                          {CONFIDENCE_LABELS[item.confidence] ?? item.confidence}
                        </Text>
                      </View>
                      <View style={[styles.locateChip, { backgroundColor: `${colors.primary}14` }]}>
                        <Ionicons name="locate-outline" size={14} color={colors.primary} />
                        <Text style={[styles.locateLabel, { color: colors.primary }]}>انتقل</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          ) : (
            <View style={styles.emptyWrap}>
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  لا يوجد تقسيم موضوعي موثّق لهذه السورة بعد
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {SURAH_TOPICS_DATASET.meta.pendingReason}
                </Text>
              </View>
            </View>
          )}

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            {SURAH_TOPICS_DATASET.meta.disclaimer}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    height: '85%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  heading: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ornamentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  ornamentDiamond: {
    width: 7,
    height: 7,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: TypeScale.title,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
  },
  statusChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
  },
  statusMeta: {
    fontSize: TypeScale.micro,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  rowAccent: {
    width: 4,
  },
  rowBody: {
    flex: 1,
    gap: 6,
    padding: Spacing.two,
  },
  rowHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rangeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  rangeText: {
    fontSize: TypeScale.micro,
    fontWeight: '900',
  },
  rowTitle: {
    flex: 1,
    fontSize: TypeScale.label,
    fontWeight: '800',
    textAlign: 'right',
  },
  rowSummary: {
    fontSize: TypeScale.caption,
    lineHeight: 20,
    textAlign: 'right',
  },
  rowFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  confidenceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  confidence: {
    fontSize: TypeScale.micro,
  },
  locateChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  locateLabel: {
    fontSize: TypeScale.micro,
    fontWeight: '800',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TypeScale.label,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TypeScale.caption,
    lineHeight: 21,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: TypeScale.micro,
    lineHeight: 18,
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.85,
  },
});
