import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { Spacing } from '@/constants/theme';
import { ContentUnavailableError, quranContentProvider } from '@/features/quran/services/content-provider';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const colors = useTheme();
  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranContentProvider.getSurahDirectory(),
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>مصحف</Text>
            <Text style={[styles.title, { color: colors.text }]}>قراءتك، بهدوء</Text>
          </View>
          <Link href="/settings" style={[styles.settingsLink, { color: colors.primary }]}>
            الإعدادات
          </Link>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.noticeTitle, { color: colors.text }]}>نبدأ بمصدر موثوق</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {surahDirectory.data
              ? `قائمة السور متاحة من Quran Foundation · إصدار الواجهة ${surahDirectory.data.contentVersion}.`
              : 'يعرض التطبيق السور من Quran Foundation بعد إعداد الخادم وإضافة بيانات الاعتماد فيه. لن نعرض نصًا تجريبيًا بدلًا من المصدر.'}
          </Text>
          {surahDirectory.data?.surahs[0] ? (
            <Link
              href={{
                pathname: '/reader',
                params: { surahNumber: String(surahDirectory.data.surahs[0].surahNumber) },
              }}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
              فتح القارئ
            </Link>
          ) : (
            <Link href="/reader" style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
              فتح القارئ
            </Link>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>السور المتاحة من المصدر</Text>
        {surahDirectory.isPending ? (
          <Text style={[styles.body, { color: colors.textSecondary }]}>جارٍ التحقق من مصدر المحتوى…</Text>
        ) : surahDirectory.data ? (
          <View style={styles.surahList}>
            {surahDirectory.data.surahs.map((surah) => (
              <Link
                key={surah.surahNumber}
                href={{ pathname: '/reader', params: { surahNumber: String(surah.surahNumber) } }}
                asChild>
                <Pressable
                  style={StyleSheet.flatten([
                    styles.surahCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ])}>
                  <Text style={[styles.surahNumber, { color: colors.primary }]}>
                    {surah.surahNumber}
                  </Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{surah.nameArabic}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        ) : (
          <View style={[styles.unavailable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              {surahDirectory.error instanceof ContentUnavailableError &&
              surahDirectory.error.reason === 'not-configured'
                ? 'لم يُضبط عنوان خادم المحتوى بعد. اتبع خطوات الإعداد أدناه.'
                : 'تعذر الاتصال بخادم المحتوى أو التحقق من استجابته. شغّل الخادم وتأكد من إعداد بيانات الوصول.'}
            </Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              ١. أنشئ Backend/server app في Quran Foundation Developer Console.
              {'\n'}٢. ضع Client ID والسر في backend/.env فقط.
              {'\n'}٣. شغّل npm run backend وأعد تشغيل Expo.
              {'\n'}بيئة pre-live تعرض الفاتحة والبقرة فقط.
            </Text>
            <ExternalLink
              href="https://dev-console.quran.foundation/projects/new"
              style={[styles.externalLink, { color: colors.primary }]}>
              إنشاء تطبيق المصدر
            </ExternalLink>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>مساحة قراءتك</Text>
        <View style={styles.cardRow}>
          <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>ملاحظاتي</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>
              تحفظ الملاحظات والتمييزات محليًا عندما يتوفر محتوى موثوق.
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          القراءة دون حساب؛ المزامنة السحابية ستضاف لاحقًا باختيارك.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  eyebrow: {
    fontSize: 14,
    textAlign: 'right',
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'right',
  },
  settingsLink: {
    fontSize: 15,
    fontWeight: '600',
    padding: Spacing.two,
  },
  notice: {
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  noticeTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: {
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'right',
  },
  primaryButton: {
    color: '#FFFFFF',
    overflow: 'hidden',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    alignSelf: 'flex-end',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
  unavailable: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  externalLink: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    paddingVertical: Spacing.two,
  },
  surahList: {
    gap: Spacing.two,
  },
  surahCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    textAlign: 'right',
    textDecorationLine: 'none',
  },
  surahNumber: {
    minWidth: 28,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  footer: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },
});
