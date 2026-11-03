import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing, TypeScale } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import { HomeHeader } from '@/features/home/components/home-header';
import { ReadingProgress } from '@/features/home/components/reading-progress';
import { SavedWordsSection } from '@/features/home/components/saved-words-section';
import { SurahExplorerHeader } from '@/features/home/components/surah-explorer-header';
import { SurahFilters, type RevelationFilter } from '@/features/home/components/surah-filters';
import { SurahListItem } from '@/features/home/components/surah-list-item';
import { SurahSearchBar } from '@/features/home/components/surah-search-bar';
import { ContentUnavailableError } from '@/features/quran/services/content-provider';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import type { QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

/** Last sheet of the Madani Mushaf; also the ceiling for a stored reading position. */
const TOTAL_PAGES = 604;

export default function HomeScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const [search, setSearch] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');

  // The directory is served from the on-device index first so the surah list
  // keeps working offline; the source is only reached when nothing is stored.
  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
  });

  // Same key the reader invalidates after saving a word, so the count on the
  // home screen stays in step with the saved-words screen.
  const savedWords = useQuery({
    queryKey: ['annotations', 'saved-words'],
    queryFn: () => new SqliteAnnotationRepository(database).listSavedWords(),
  });

  const lastPage = useQuery({
    queryKey: ['reader', 'last-page'],
    queryFn: async () => {
      const row = await database.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = 'reader.lastPage'",
      );
      const page = Number(row?.value);
      return Number.isInteger(page) && page >= 1 && page <= TOTAL_PAGES ? page : null;
    },
  });

  const visibleSurahs = useMemo(() => {
    const query = normalizeSurahSearch(search);
    return (surahDirectory.data?.surahs ?? []).filter((surah) => {
      const matchesSearch =
        query.length === 0 ||
        normalizeSurahSearch(surah.nameArabic).includes(query) ||
        normalizeSurahSearch(String(surah.surahNumber)).includes(query);
      return (
        matchesSearch && (revelationFilter === 'all' || surah.revelationPlace === revelationFilter)
      );
    });
  }, [revelationFilter, search, surahDirectory.data]);

  const renderSurah = useCallback(
    ({ item }: { item: QuranSurahSummary }) => <SurahListItem surah={item} />,
    [],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleSurahs}
        keyExtractor={(item) => String(item.surahNumber)}
        contentContainerStyle={styles.listContent}
        renderItem={renderSurah}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <HomeHeader />

            <ReadingProgress lastPage={lastPage.data ?? null} />

            <SavedWordsSection count={savedWords.data?.length} />

            <View style={styles.explorer}>
              <SurahExplorerHeader count={visibleSurahs.length} />
              <SurahSearchBar value={search} onChangeText={setSearch} />
              <SurahFilters value={revelationFilter} onChange={setRevelationFilter} />
            </View>

            {surahDirectory.isPending && (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  جارٍ تحميل السور…
                </Text>
              </View>
            )}
            {surahDirectory.error && (
              <View
                style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                  {surahDirectory.error instanceof ContentUnavailableError &&
                  surahDirectory.error.reason === 'invalid-data'
                    ? 'تعذر التحقق من قائمة السور القادمة من المصدر.'
                    : 'تعذر تحميل السور. تحقق من اتصال الإنترنت وحاول مجددًا.'}
                </Text>
                <Pressable accessibilityRole="button" onPress={() => void surahDirectory.refetch()}>
                  <Text style={[styles.retryText, { color: colors.primary }]}>إعادة المحاولة</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !surahDirectory.isPending && !surahDirectory.error ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد سورة بهذا الاسم.
            </Text>
          ) : undefined
        }
        ItemSeparatorComponent={SurahSeparator}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={14}
        maxToRenderPerBatch={14}
        updateCellsBatchingPeriod={30}
        windowSize={9}
      />
    </SafeAreaView>
  );
}

function SurahSeparator() {
  const colors = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  headerContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
    gap: 20,
    paddingBottom: Spacing.three,
  },
  explorer: {
    gap: 12,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.one,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  statusText: {
    fontSize: TypeScale.label,
    textAlign: 'right',
  },
  notice: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
  },
  noticeText: {
    fontSize: TypeScale.body,
    lineHeight: 22,
    textAlign: 'right',
  },
  retryText: {
    fontSize: TypeScale.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  emptyText: {
    paddingVertical: Spacing.four,
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
});
