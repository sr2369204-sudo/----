import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  getTajweedLesson,
  getTajweedSection,
} from '@/features/tajweed/data/encyclopedia';
import type { TajweedLessonContent } from '@/features/tajweed/types';
import { useTheme } from '@/hooks/use-theme';

export default function TajweedLessonScreen() {
  const { ruleId } = useLocalSearchParams<{ ruleId: string }>();
  const colors = useTheme();
  const lesson = getTajweedLesson(ruleId);
  const section = lesson ? getTajweedSection(lesson.sectionId) : undefined;

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.notFoundText, { color: colors.text }]}>الحكم غير موجود</Text>
          <Link href="/tajweed" asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.backButtonLarge,
                { backgroundColor: colors.primary },
              ])}>
              <Text style={[styles.backButtonText, { color: colors.onPrimary }]}>
                العودة للموسوعة
              </Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Link href="/tajweed" asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ])}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </Pressable>
          </Link>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section?.title}</Text>
            <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
          </View>
        </View>

        <View style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Definition Section */}
          {lesson.content.definition && (
            <View style={styles.contentBlock}>
              <View style={styles.blockHeader}>
                <Ionicons name="information-circle" size={20} color={colors.accent} />
                <Text style={[styles.blockTitle, { color: colors.text }]}>التعريف</Text>
              </View>
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                {lesson.content.definition}
              </Text>
            </View>
          )}

          {/* Ruling Badge */}
          {lesson.content.ruling && (
            <View style={[styles.rulingBox, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.rulingLabel, { color: colors.primary }]}>الحكم:</Text>
              <Text style={[styles.rulingValue, { color: colors.text }]}>
                {lesson.content.ruling}
              </Text>
            </View>
          )}

          {/* Letters Badge */}
          {lesson.content.letters && (
            <View style={styles.contentBlock}>
              <View style={styles.blockHeader}>
                <Ionicons name="text" size={20} color={colors.primary} />
                <Text style={[styles.blockTitle, { color: colors.text }]}>حروف الحكم</Text>
              </View>
              <View style={styles.lettersContainer}>
                {lesson.content.letters.split('،').map((letter, i) => (
                  <View
                    key={i}
                    style={[styles.letterBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.letterText, { color: colors.primary }]}>{letter.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Explanation */}
          {lesson.content.explanation && (
            <View style={styles.contentBlock}>
              <View style={styles.blockHeader}>
                <Ionicons name="book" size={20} color={colors.primary} />
                <Text style={[styles.blockTitle, { color: colors.text }]}>الشرح والتفصيل</Text>
              </View>
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                {lesson.content.explanation}
              </Text>
            </View>
          )}

          {/* Cases */}
          {lesson.content.cases && (
            <View style={[styles.casesBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.blockHeader}>
                <Ionicons name="list" size={20} color={colors.accent} />
                <Text style={[styles.blockTitle, { color: colors.text }]}>الحالات والأوجه</Text>
              </View>
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                {lesson.content.cases}
              </Text>
            </View>
          )}

          {/* Examples */}
          {lesson.content.examples && (
            <View style={styles.contentBlock}>
              <View style={styles.blockHeader}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
                <Text style={[styles.blockTitle, { color: colors.text }]}>أمثلة قرآنية</Text>
              </View>
              <View style={styles.examplesList}>
                {lesson.content.examples.split('،').map((example, i) => (
                  <View
                    key={i}
                    style={[styles.exampleItem, { backgroundColor: colors.backgroundSelected }]}>
                    <Text style={[styles.exampleText, { color: colors.text }]}>{example.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {lesson.content.notes && (
            <View style={[styles.notesBox, { borderColor: colors.accent + '40' }]}>
              <View style={styles.blockHeader}>
                <Ionicons name="bulb" size={20} color={colors.accent} />
                <Text style={[styles.blockTitle, { color: colors.accent }]}>تنبيهات هامة</Text>
              </View>
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                {lesson.content.notes}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.three,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: TypeScale.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: TypeScale.display,
    fontWeight: '900',
  },
  mainCard: {
    marginHorizontal: Spacing.two,
    padding: Spacing.four,
    borderRadius: 24,
    borderWidth: 1,
    gap: Spacing.four,
  },
  contentBlock: {
    gap: Spacing.two,
  },
  blockHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  blockTitle: {
    fontSize: TypeScale.heading,
    fontWeight: '800',
  },
  contentText: {
    fontSize: TypeScale.body,
    lineHeight: 26,
    textAlign: 'right',
  },
  rulingBox: {
    flexDirection: 'row-reverse',
    padding: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  rulingLabel: {
    fontSize: TypeScale.body,
    fontWeight: '900',
  },
  rulingValue: {
    flex: 1,
    fontSize: TypeScale.body,
    textAlign: 'right',
  },
  lettersContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  letterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  letterText: {
    fontSize: TypeScale.title,
    fontWeight: '900',
  },
  casesBox: {
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  examplesList: {
    gap: 8,
    marginTop: 4,
  },
  exampleItem: {
    padding: Spacing.three,
    borderRadius: 12,
  },
  exampleText: {
    fontSize: TypeScale.title,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif',
  },
  notesBox: {
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(201, 151, 60, 0.05)',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
    gap: Spacing.three,
  },
  notFoundText: {
    fontSize: TypeScale.title,
    fontWeight: '800',
  },
  backButtonLarge: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 14,
  },
  backButtonText: {
    fontSize: TypeScale.body,
    fontWeight: '800',
  },
});
