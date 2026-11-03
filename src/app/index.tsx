import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import { HomeActionsGrid } from '@/features/home/components/home-actions-grid';
import { HomeHero } from '@/features/home/components/home-hero';
import { SurahFilters, type RevelationFilter } from '@/features/home/components/surah-filters';
import { SurahListItemModern } from '@/features/home/components/surah-list-item-modern';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import type { QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const [search, setSearch] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');

  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
  });

  const savedWords = useQuery({
    queryKey: ['annotations', 'saved-words'],
    queryFn: () => new SqliteAnnotationRepository(database).listSavedWords(),
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
    ({ item }: { item: QuranSurahSummary }) => <SurahListItemModern surah={item} />,
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleSurahs}
        keyExtractor={(item) => String(item.surahNumber)}
        contentContainerStyle={styles.listContent}
        renderItem={renderSurah}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <HomeHero searchValue={search} onSearchChange={setSearch} />
            <HomeActionsGrid savedWordsCount={savedWords.data?.length} />
            
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>سور القرآن</Text>
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              </View>
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
              <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                  تعذر تحميل السور. تحقق من اتصال الإنترنت وحاول مجددًا.
                </Text>
                <Pressable onPress={() => void surahDirectory.refetch()}>
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
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.six,
  },
  headerContent: {
    gap: Spacing.four,
    marginBottom: Spacing.two,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: TypeScale.title,
    fontWeight: '900',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  statusText: {
    fontSize: TypeScale.label,
  },
  notice: {
    marginHorizontal: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
  retryText: {
    fontSize: TypeScale.body,
    fontWeight: '800',
  },
  emptyText: {
    paddingVertical: Spacing.six,
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
});
