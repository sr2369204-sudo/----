import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
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
  getTajweedLesson,
  getTajweedSection,
} from '@/features/tajweed/data/encyclopedia';
import type { TajweedLessonContent } from '@/features/tajweed/types';
import { useTheme } from '@/hooks/use-theme';

const CONTENT_SECTIONS: {
  key: keyof TajweedLessonContent;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'definition', title: 'التعريف', icon: 'information-circle-outline' },
  { key: 'explanation', title: 'الشرح', icon: 'book-outline' },
  { key: 'letters', title: 'حروف الحكم', icon: 'text-outline' },
  { key: 'examples', title: 'أمثلة قرآنية', icon: 'document-text-outline' },
  { key: 'notes', title: 'ملاحظات وتنبيهات', icon: 'alert-circle-outline' },
];

export default function TajweedLessonScreen() {
  const { ruleId } = useLocalSearchParams<{ ruleId: string }>();
  const colors = useTheme();
  const lesson = getTajweedLesson(ruleId);
  const section = lesson ? getTajweedSection(lesson.sectionId) : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Link href="/tajweed" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="العودة إلى موسوعة التجويد"
              style={StyleSheet.flatten([
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ])}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </Pressable>
          </Link>
          <View style={styles.titleGroup}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              {section?.title ?? 'موسوعة التجويد'}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {lesson?.title ?? 'الحكم غير موجود'}
            </Text>
          </View>
        </View>

        {lesson ? (
          <View style={styles.contentSections}>
            {CONTENT_SECTIONS.map((contentSection) => {
              const value = lesson.content[contentSection.key];
              return (
                <View
                  key={contentSection.key}
                  style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.contentHeader}>
                    <View style={[styles.contentIcon, { backgroundColor: colors.backgroundSelected }]}>
                      <Ionicons name={contentSection.icon} size={19} color={colors.primary} />
                    </View>
                    <Text style={[styles.contentTitle, { color: colors.text }]}>
                      {contentSection.title}
                    </Text>
                  </View>
                  <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
                    {value ?? 'سيتم إضافة شرح هذا الحكم قريبًا'}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.notFoundCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="help-circle-outline" size={34} color={colors.textSecondary} />
            <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
              لم يتم العثور على هذا الحكم في الموسوعة.
            </Text>
            <Link href="/tajweed" asChild>
              <Pressable
                style={StyleSheet.flatten([
                  styles.returnButton,
                  { backgroundColor: colors.primary },
                ])}>
                <Text style={[styles.returnButtonText, { color: colors.onPrimary }]}>
                  العودة إلى الموسوعة
                </Text>
              </Pressable>
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    gap: Spacing.four,
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
  eyebrow: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
    textAlign: 'right',
  },
  title: {
    fontSize: TypeScale.display,
    fontWeight: '900',
    textAlign: 'right',
  },
  contentSections: {
    gap: Spacing.three,
  },
  contentCard: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  contentHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  contentIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  contentTitle: {
    fontSize: TypeScale.heading,
    fontWeight: '800',
    textAlign: 'right',
  },
  placeholder: {
    fontSize: TypeScale.body,
    lineHeight: 24,
    textAlign: 'right',
  },
  notFoundCard: {
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  notFoundText: {
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
  returnButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  returnButtonText: {
    fontSize: TypeScale.body,
    fontWeight: '800',
  },
});
