import { Link, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Highlight } from '@/features/annotations/types';
import { ContentUnavailableError, quranContentProvider } from '@/features/quran/services/content-provider';
import { useTheme } from '@/hooks/use-theme';
import { QuranText } from '@/features/reader/components/QuranText';
import { SelectionSheet } from '@/features/reader/components/SelectionSheet';

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ surahNumber?: string | string[] }>();
  const rawSurahNumber = Array.isArray(params.surahNumber)
    ? params.surahNumber[0]
    : params.surahNumber;
  const requestedSurah = Number(rawSurahNumber ?? '1');
  const colors = useTheme();
  const database = useSQLiteContext();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightRevision, setHighlightRevision] = useState(0);
  const [highlightError, setHighlightError] = useState<string | null>(null);

  const contentQuery = useQuery({
    queryKey: ['quran', 'surah', rawSurahNumber ?? '1'],
    queryFn: () => {
      if (!Number.isInteger(requestedSurah) || requestedSurah < 1 || requestedSurah > 114) {
        throw new ContentUnavailableError('invalid-data', 'Invalid surah route parameter.');
      }
      return quranContentProvider.getSurah(requestedSurah);
    },
  });

  useEffect(() => {
    if (!contentQuery.data) {
      return;
    }

    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    Promise.all(
      contentQuery.data.ayahs.map((ayah) =>
        repository.listHighlightsForAyah(contentQuery.data.surahNumber, ayah.ayahNumber),
      ),
    )
      .then((items) => {
        if (active) {
          setHighlights(items.flat());
          setHighlightError(null);
        }
      })
      .catch(() => {
        if (active) {
          setHighlightError('تعذر تحميل التمييزات المحفوظة من الجهاز.');
        }
      });

    return () => {
      active = false;
    };
  }, [contentQuery.data, database, highlightRevision]);

  const errorMessage =
    contentQuery.error instanceof ContentUnavailableError
      ? contentQuery.error.reason === 'not-configured'
        ? 'لم يُربط القارئ بعد بخادم محتوى موثوق. أضف عنوان الخادم في إعدادات التطوير؛ لا تضع مفاتيح سرية في التطبيق.'
        : contentQuery.error.reason === 'invalid-data'
          ? 'رفض التطبيق بيانات المصدر لأن بنيتها أو مرجعها غير صالح.'
          : 'تعذر جلب المحتوى من الخادم. تحقق من الاتصال وإعدادات الخادم ثم أعد المحاولة.'
      : 'تعذر فتح المحتوى القرآني.';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Link href="/" style={[styles.backLink, { color: colors.primary }]}>
          الرئيسية
        </Link>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            {contentQuery.data?.nameArabic ?? 'القارئ التفاعلي'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {contentQuery.data
              ? `المصدر ${contentQuery.data.sourceId} · الإصدار ${contentQuery.data.contentVersion}`
              : 'المحتوى غير متاح حتى تهيئة المصدر'}
          </Text>
        </View>
      </View>

      {contentQuery.isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>جارٍ التحقق من المصدر…</Text>
        </View>
      ) : contentQuery.error ? (
        <View style={[styles.unavailable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>لا يوجد نص للعرض</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{errorMessage}</Text>
          <Text style={[styles.setupHint, { color: colors.textSecondary }]}>
            يلزم خادم وسيط يستعمل Quran Foundation Content API بمصادقة خادمية، ويتحقق من النص قبل إرساله.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void contentQuery.refetch()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryText, { color: colors.background }]}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.verses}>
          {contentQuery.data?.ayahs.map((ayah) => (
            <QuranText
              key={`${contentQuery.data.surahNumber}:${ayah.ayahNumber}`}
              surahNumber={contentQuery.data.surahNumber}
              ayah={ayah}
              highlights={highlights}
            />
          ))}
        </ScrollView>
      )}

      {highlightError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {highlightError}
        </Text>
      )}
      <SelectionSheet
        surahName={contentQuery.data?.nameArabic ?? 'السورة'}
        onHighlightsChanged={() => setHighlightRevision((revision) => revision + 1)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  unavailable: {
    margin: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: 20,
    gap: Spacing.three,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  message: {
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'right',
  },
  setupHint: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
  },
  retryButton: {
    padding: Spacing.three,
    borderRadius: 13,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  verses: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  error: {
    color: '#B42318',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    textAlign: 'right',
  },
});
