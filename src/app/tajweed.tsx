import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  tajweedEncyclopediaLessons,
  tajweedEncyclopediaSections,
} from '@/features/tajweed/data/encyclopedia';
import type { TajweedSectionId } from '@/features/tajweed/types';
import { useTheme } from '@/hooks/use-theme';

export default function TajweedEncyclopediaScreen() {
  const colors = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<TajweedSectionId>>(
    () => new Set([tajweedEncyclopediaSections[0].id]),
  );

  const toggleSection = (sectionId: TajweedSectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="العودة للرئيسية"
              style={StyleSheet.flatten([
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ])}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </Pressable>
          </Link>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.text }]}>موسوعة التجويد</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              أبواب وأحكام مرتبة للقراءة والتعلّم
            </Text>
          </View>
        </View>

        <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.introIcon, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="library-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.introCopy}>
            <Text style={[styles.introTitle, { color: colors.text }]}>مرجعك لأبواب التجويد</Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              اختر بابًا لعرض أحكامه، ثم افتح الحكم لقراءة محتواه.
            </Text>
          </View>
        </View>

        <View style={styles.sectionList}>
          {tajweedEncyclopediaSections.map((section, index) => {
            const expanded = expandedSections.has(section.id);
            const lessons = tajweedEncyclopediaLessons.filter(
              (lesson) => lesson.sectionId === section.id,
            );
            return (
              <View
                key={section.id}
                style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${section.title}، ${expanded ? 'مفتوح' : 'مغلق'}`}
                  accessibilityState={{ expanded }}
                  onPress={() => toggleSection(section.id)}
                  style={styles.sectionHeader}>
                  <View style={styles.sectionHeading}>
                    <View style={[styles.sectionNumber, { backgroundColor: colors.backgroundSelected }]}>
                      <Text style={[styles.sectionNumberText, { color: colors.primary }]}>
                        {toArabicDigits(index + 1)}
                      </Text>
                    </View>
                    <View style={styles.sectionTitleGroup}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                      <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                        {`${toArabicDigits(lessons.length)} أحكام`}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={21}
                    color={colors.textSecondary}
                  />
                </Pressable>

                {expanded && (
                  <View style={styles.lessonGrid}>
                    {lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={{ pathname: '/tajweed/[ruleId]', params: { ruleId: lesson.id } }}
                        asChild>
                        <Pressable
                          accessibilityRole="link"
                          style={({ pressed }) => StyleSheet.flatten([
                            styles.lessonItem,
                            {
                              backgroundColor: colors.background,
                              borderColor: colors.border,
                              opacity: pressed ? 0.75 : 1,
                            },
                          ])}>
                          <Text style={[styles.lessonTitle, { color: colors.text }]}>
                            {lesson.title}
                          </Text>
                          <Ionicons name="arrow-back" size={16} color={colors.primary} />
                        </Pressable>
                      </Link>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  title: {
    fontSize: TypeScale.display,
    fontWeight: '900',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  introCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  introIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  introCopy: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  introTitle: {
    fontSize: TypeScale.heading,
    fontWeight: '800',
    textAlign: 'right',
  },
  introText: {
    fontSize: TypeScale.caption,
    lineHeight: 20,
    textAlign: 'right',
  },
  sectionList: {
    gap: Spacing.three,
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  sectionHeader: {
    minHeight: 76,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sectionHeading: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionNumber: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  sectionNumberText: {
    fontSize: TypeScale.body,
    fontWeight: '900',
  },
  sectionTitleGroup: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: TypeScale.heading,
    fontWeight: '900',
    textAlign: 'right',
  },
  sectionCount: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  lessonGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.three,
  },
  lessonItem: {
    width: '48%',
    minHeight: 62,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  lessonTitle: {
    flex: 1,
    fontSize: TypeScale.caption,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'right',
  },
});
