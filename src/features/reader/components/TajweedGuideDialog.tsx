import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MushafPage, QuranAyah, QuranSurahSummary } from '@/features/quran/types';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import {
  getTafkhimExampleSegments,
  getWordTajweedSegments,
  tajweedRuleGuide,
  type TajweedSegment,
} from '@/features/quran/services/tajweed';
import { useTheme } from '@/hooks/use-theme';

type TajweedExample = {
  segments: TajweedSegment[];
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
};

type Props = {
  visible: boolean;
  page: MushafPage | undefined;
  colors: ReturnType<typeof useTheme>;
  showTajweed: boolean;
  canToggleTajweed: boolean;
  exampleSeed: number;
  onToggleTajweed: () => void;
  onRandomize: () => void;
  onClose: () => void;
};

export function TajweedGuideDialog({
  visible,
  page,
  colors,
  showTajweed,
  canToggleTajweed,
  exampleSeed,
  onToggleTajweed,
  onRandomize,
  onClose,
}: Props) {
  const pageExamples = useMemo(
    () => getTajweedExamples(page?.ayahs, page?.surahs, exampleSeed),
    [exampleSeed, page],
  );
  const needsFallback = tajweedRuleGuide.some((rule) => !pageExamples.has(rule.id));
  const fallbackQuery = useQuery({
    queryKey: ['quran', 'tajweed-guide-examples', 2],
    queryFn: () => quranContentProvider.getSurah(2),
    enabled: visible && exampleSeed > 0 && needsFallback,
    staleTime: Infinity,
  });
  const fallbackExamples = useMemo(
    () => getTajweedExamples(
      fallbackQuery.data?.ayahs.map((ayah) => ({
        ...ayah,
        surahNumber: fallbackQuery.data.surahNumber,
      })),
      fallbackQuery.data ? [fallbackQuery.data] : undefined,
      exampleSeed,
    ),
    [exampleSeed, fallbackQuery.data],
  );
  const examples = useMemo(() => {
    const combined = new Map(pageExamples);
    for (const [ruleId, example] of fallbackExamples) {
      if (!combined.has(ruleId)) {
        combined.set(ruleId, example);
      }
    }
    return combined;
  }, [fallbackExamples, pageExamples]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق دليل التجويد"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>دليل ألوان التجويد</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                أمثلة قرآنية من الصفحة الحالية أو من مواضع أخرى
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: showTajweed }}
            disabled={!canToggleTajweed}
            onPress={onToggleTajweed}
            style={[
              styles.toggleRow,
              {
                backgroundColor: colors.backgroundSelected,
                borderColor: showTajweed ? colors.primary : colors.border,
              },
              !canToggleTajweed && styles.disabled,
            ]}>
            <View style={styles.toggleCopy}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                ألوان أحكام التجويد
              </Text>
              <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                {showTajweed ? 'ظاهرة على صفحة المصحف' : 'مخفية على صفحة المصحف'}
              </Text>
            </View>
            <Ionicons
              name={showTajweed ? 'eye' : 'eye-off'}
              size={21}
              color={showTajweed ? colors.primary : colors.textSecondary}
            />
          </Pressable>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {tajweedRuleGuide.map((rule) => {
              const example = examples.get(rule.id);
              const coloredText = example?.segments
                .filter((segment) => segment.rule && rule.classes.includes(segment.rule))
                .map((segment) => segment.text)
                .join('');
              return (
                <View
                  key={rule.id}
                  style={[
                    styles.ruleCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}>
                  <View style={styles.ruleHeading}>
                    <View style={[styles.ruleDot, { backgroundColor: rule.color }]} />
                    <Text style={[styles.ruleLabel, { color: colors.text }]}>{rule.label}</Text>
                  </View>
                  {example ? (
                    <View style={styles.exampleRow}>
                      <View style={styles.exampleWordWrap}>
                        <Text
                          style={[styles.exampleWord, { color: colors.text }]}
                          allowFontScaling={false}
                          textBreakStrategy="simple">
                          {example.segments.map((segment) => segment.text).join('')}
                        </Text>
                        <View style={styles.exampleRuleBadge}>
                          <View style={[styles.exampleRuleBadgeDot, { backgroundColor: rule.color }]} />
                          <Text style={[styles.exampleRuleBadgeText, { color: rule.color }]}>
                            {coloredText || 'الحرف الملوّن'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.exampleReference, { color: colors.textSecondary }]}>
                        {`سورة ${example.surahName} · الآية ${toArabicDigits(example.ayahNumber)}`}
                      </Text>
                    </View>
                  ) : fallbackQuery.isFetching ? (
                    <Text style={[styles.unavailable, { color: colors.textSecondary }]}>
                      جارٍ البحث عن مثال موثق لهذا الحكم...
                    </Text>
                  ) : (
                    <Text style={[styles.unavailable, { color: colors.textSecondary }]}>
                      لا يظهر مثال لهذا الحكم في الصفحة الحالية
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={!page}
              onPress={() => {
                onRandomize();
                if (fallbackQuery.error) {
                  void fallbackQuery.refetch();
                }
              }}
              style={[
                styles.randomButton,
                { backgroundColor: colors.backgroundSelected },
                !page && styles.disabled,
              ]}>
              <Ionicons name="shuffle" size={17} color={colors.primary} />
              <Text style={[styles.randomText, { color: colors.primary }]}>
                أمثلة عشوائية أخرى
              </Text>
            </Pressable>
            <Text style={[styles.source, { color: colors.textSecondary }]}>
              {fallbackQuery.error
                ? 'تعذر تحميل أمثلة إضافية. تحقق من اتصال الإنترنت وحاول مجددًا.'
                : 'الأمثلة من نص القرآن الكريم الموثق'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getTajweedExamples(
  ayahs: (QuranAyah & { surahNumber: number })[] | undefined,
  surahs: QuranSurahSummary[] | undefined,
  seed: number,
): Map<string, TajweedExample> {
  const examples = new Map<string, TajweedExample>();
  if (!ayahs || !surahs) {
    return examples;
  }

  const matches = new Map<string, TajweedExample[]>(
    tajweedRuleGuide.map((rule) => [rule.id, []]),
  );
  for (const ayah of ayahs) {
    const wordSegments = getWordTajweedSegments(ayah);
    for (const word of ayah.words) {
      const ruleIds = new Set<string>();
      const segments = wordSegments.get(word.id) ?? [];
      for (const segment of segments) {
        const tag = segment.rule;
        if (!tag) {
          continue;
        }
        const guideRule = tajweedRuleGuide.find((rule) => rule.classes.includes(tag));
        if (guideRule) {
          ruleIds.add(guideRule.id);
        }
      }
      for (const ruleId of ruleIds) {
        const ruleMatches = matches.get(ruleId);
        if (ruleMatches) {
          ruleMatches.push({
            segments,
            surahNumber: ayah.surahNumber,
            surahName: surahs.find((surah) => surah.surahNumber === ayah.surahNumber)?.nameArabic
              ?? String(ayah.surahNumber),
            ayahNumber: ayah.ayahNumber,
          });
        }
      }

      const tafkhimMatches = matches.get('tafkhim');
        const emphasizedSegments = getTafkhimExampleSegments(word.textUthmani);
      if (tafkhimMatches && emphasizedSegments) {
        tafkhimMatches.push({
            segments: emphasizedSegments,
            surahNumber: ayah.surahNumber,
            surahName: surahs.find((surah) => surah.surahNumber === ayah.surahNumber)?.nameArabic
              ?? String(ayah.surahNumber),
            ayahNumber: ayah.ayahNumber,
        });
      }
    }
  }

  for (const rule of tajweedRuleGuide) {
    const ruleMatches = matches.get(rule.id);
    if (ruleMatches && ruleMatches.length > 0) {
      examples.set(rule.id, ruleMatches[Math.floor(seed * ruleMatches.length)]);
    }
  }
  return examples;
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'right',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  toggleCopy: {
    gap: 3,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  toggleHint: {
    fontSize: 11,
    textAlign: 'right',
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  ruleCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 11,
    gap: 8,
  },
  ruleHeading: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  ruleLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  exampleRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 5,
    minWidth: 0,
  },
  exampleWord: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
    flexShrink: 1,
  },
  exampleWordWrap: {
    alignItems: 'flex-end',
    gap: 6,
  },
  exampleRuleBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  exampleRuleBadgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  exampleRuleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  exampleReference: {
    fontSize: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  unavailable: {
    fontSize: 11,
    textAlign: 'right',
  },
  footer: {
    gap: 7,
    paddingTop: 2,
  },
  randomButton: {
    minHeight: 42,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 13,
  },
  randomText: {
    fontSize: 12,
    fontWeight: '800',
  },
  source: {
    fontSize: 10,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
