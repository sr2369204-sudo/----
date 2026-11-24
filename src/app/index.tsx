import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppUpdateBanner } from '@/components/app-update-banner';
import { IntroAnimationContext } from '@/components/brand-intro';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import { ContinueReadingCard } from '@/features/home/components/continue-reading-card';
import { HomeActionsGrid } from '@/features/home/components/home-actions-grid';
import { RecordingsCard } from '@/features/home/components/recordings-card';
import { OfflineDownloadBanner } from '@/features/home/components/offline-download-banner';
import { DailyReadingPlan } from '@/features/home/components/daily-reading-plan';
import { HomeHero } from '@/features/home/components/home-hero';
import {
  HomeSearchResults,
  type SearchAnchor,
} from '@/features/home/components/home-search-results';
import { SurahFilters, type RevelationFilter } from '@/features/home/components/surah-filters';
import { SurahGridItemModern } from '@/features/home/components/surah-list-item-modern';
import { QuranHeartCard } from '@/features/memorization/components/quran-heart-card';
import {
  HOME_SEARCH_RESULTS_LIMIT,
  resolveAyahSearchReference,
} from '@/features/home/utils/home-search';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import {
  loadDailyReadingPlan,
  loadLastReadingPosition,
  setDailyAyahTarget,
} from '@/features/reader/services/reading-progress';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import type { AyahSearchResult, QuranSurahSummary } from '@/features/quran/types';
import { useIsDarkTheme, useTheme } from '@/hooks/use-theme';
import { useAmbientLoop } from '@/hooks/use-ambient-loop';

const GRAIN_SOURCE = require('../../assets/images/glass-grain.png');

export default function HomeScreen() {
  const introFinished = useContext(IntroAnimationContext);
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [searchAnchor, setSearchAnchor] = useState<SearchAnchor | null>(null);
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');
  const [dailyPlanSaveError, setDailyPlanSaveError] = useState<string | null>(null);
  const [dailyPlanUpdating, setDailyPlanUpdating] = useState(false);

  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  useEffect(() => {
    const timer = setTimeout(() => setSubmittedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
  });

  const ayahSearch = useQuery({
    queryKey: ['quran', 'home-search', submittedSearch],
    enabled: submittedSearch.length > 0,
    queryFn: async (): Promise<AyahSearchResult[]> => {
      const directory = await quranCache.loadSurahDirectory();
      const reference = resolveAyahSearchReference(
        submittedSearch,
        directory.surahs,
        normalizeSurahSearch,
      );
      if (reference) {
        const storedText = await quranCache.getStoredAyah(
          reference.surahNumber,
          reference.ayahNumber,
        );
        if (storedText !== null) {
          return [{
            surahNumber: reference.surahNumber,
            ayahNumber: reference.ayahNumber,
            text: storedText,
          }];
        }
        const surah = await quranContentProvider.getSurah(reference.surahNumber);
        const ayah = surah.ayahs.find((item) => item.ayahNumber === reference.ayahNumber);
        return ayah
          ? [{
              surahNumber: reference.surahNumber,
              ayahNumber: reference.ayahNumber,
              text: ayah.words.map((word) => word.textUthmani).join(' '),
            }]
          : [];
      }

      const normalized = normalizeSurahSearch(submittedSearch);
      if (/^\d+$/.test(normalized) && directory.surahs.some(
        (surah) => surah.surahNumber === Number(normalized),
      )) {
        return [];
      }
      return quranCache.searchAyahs(submittedSearch, HOME_SEARCH_RESULTS_LIMIT);
    },
  });

  const savedWords = useQuery({
    queryKey: ['annotations', 'saved-words'],
    queryFn: () => new SqliteAnnotationRepository(database).listSavedWords(),
  });

  const recordings = useQuery({
    queryKey: ['recordings', 'all'],
    queryFn: () => new SqliteAnnotationRepository(database).listRecordings(),
  });

  const dailyPlanQuery = useQuery({
    queryKey: ['reading', 'daily-plan'],
    queryFn: () => loadDailyReadingPlan(database),
  });

  const lastReadingPositionQuery = useQuery({
    queryKey: ['reading', 'last-position'],
    queryFn: () => loadLastReadingPosition(database),
  });

  const updateDailyTarget = useCallback(async (targetAyahs: number) => {
    setDailyPlanUpdating(true);
    setDailyPlanSaveError(null);
    try {
      const plan = await setDailyAyahTarget(database, targetAyahs);
      queryClient.setQueryData(['reading', 'daily-plan'], plan);
    } catch (error) {
      setDailyPlanSaveError(
        error instanceof Error ? `تعذر حفظ هدف القراءة: ${error.message}` : 'تعذر حفظ هدف القراءة.',
      );
    } finally {
      setDailyPlanUpdating(false);
    }
  }, [database, queryClient]);

  // Normalising all 114 names on every keystroke showed up as typing latency,
  // so the directory's names are normalised once when they arrive instead.
  const normalizedSurahNames = useMemo(
    () => new Map((surahDirectory.data?.surahs ?? []).map((surah) => [
      surah.surahNumber,
      normalizeSurahSearch(surah.nameArabic),
    ])),
    [surahDirectory.data],
  );

  const searchMatchedSurahs = useMemo(() => {
    const query = normalizeSurahSearch(search);
    const surahs = surahDirectory.data?.surahs ?? [];
    if (query.length === 0) {
      return surahs;
    }
    const isNumericQuery = /^\d+$/.test(query);
    return surahs.filter((surah) =>
      (normalizedSurahNames.get(surah.surahNumber) ?? '').includes(query) ||
      (isNumericQuery
        ? String(surah.surahNumber) === query
        : String(surah.surahNumber).includes(query)),
    );
  }, [search, surahDirectory.data, normalizedSurahNames]);

  const visibleSurahs = useMemo(
    () => searchMatchedSurahs.filter((surah) =>
      revelationFilter === 'all' || surah.revelationPlace === revelationFilter,
    ),
    [revelationFilter, searchMatchedSurahs],
  );
  const surahNames = useMemo(
    () => new Map((surahDirectory.data?.surahs ?? []).map((surah) => [
      surah.surahNumber,
      surah.nameArabic,
    ])),
    [surahDirectory.data],
  );

  const renderSurah = useCallback(
    ({ item }: { item: QuranSurahSummary }) => (
      <View style={styles.surahEntry}>
        <SurahGridItemModern surah={item} />
      </View>
    ),
    [],
  );

  if (!introFinished) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AmbientBackdrop />
      <FlatList
        data={visibleSurahs}
        keyExtractor={(item) => String(item.surahNumber)}
        contentContainerStyle={styles.listContent}
        renderItem={renderSurah}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <HomeHero
              searchValue={search}
              onSearchChange={setSearch}
              onSearchAnchorChange={setSearchAnchor}
            />
            <ContinueReadingCard
              position={lastReadingPositionQuery.data ?? null}
              surahNameByNumber={surahNames}
              loading={lastReadingPositionQuery.isPending}
            />
            <View style={styles.featureCardsRow}>
              <View style={styles.featureCardColumn}>
                <QuranHeartCard />
              </View>
              <View style={styles.featureCardColumn}>
                <RecordingsCard
                  count={recordings.data?.length ?? 0}
                  loading={recordings.isPending}
                />
              </View>
            </View>
            <HomeActionsGrid savedWordsCount={savedWords.data?.length} />
            <DailyReadingPlan
              plan={dailyPlanQuery.data ?? null}
              surahNameByNumber={surahNames}
              loading={dailyPlanQuery.isPending}
              error={
                dailyPlanSaveError ??
                (dailyPlanQuery.error instanceof Error
                  ? `تعذر تحميل خطة القراءة: ${dailyPlanQuery.error.message}`
                  : dailyPlanQuery.error
                    ? 'تعذر تحميل خطة القراءة اليومية.'
                    : null)
              }
              updating={dailyPlanUpdating}
              onChangeTarget={(target) => void updateDailyTarget(target)}
            />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>سور القرآن</Text>
                <PulsingDot color={colors.accent} />
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
          !surahDirectory.isPending &&
          !surahDirectory.error &&
          search.trim().length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد سورة مطابقة لهذا البحث.
            </Text>
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        initialNumToRender={12}
        windowSize={5}
      />
      {search.trim().length > 0 && searchAnchor && (
        <HomeSearchResults
          anchor={searchAnchor}
          surahResults={searchMatchedSurahs}
          surahNameByNumber={surahNames}
          ayahResults={
            search.trim() === submittedSearch && !ayahSearch.isPending && !ayahSearch.error
              ? ayahSearch.data ?? []
              : []
          }
          searchLoading={
            search.trim() !== submittedSearch || ayahSearch.isPending
          }
          searchError={Boolean(ayahSearch.error && search.trim() === submittedSearch)}
          onRetrySearch={() => void ayahSearch.refetch()}
        />
      )}
      <View
        pointerEvents="box-none"
        style={[styles.bottomStack, { paddingBottom: insets.bottom + Spacing.three }]}>
        <AppUpdateBanner />
        <OfflineDownloadBanner />
      </View>
    </View>
  );
}

/**
 * The page wallpaper: soft emerald and gold blooms under a fine grain layer, so
 * the glass panels above have real textured colour to sit on.
 */
function AmbientBackdrop() {
  const isDark = useIsDarkTheme();
  const drift = useAmbientLoop(17_000);
  const breathe = useAmbientLoop(7_000, 600);

  // The two blooms wander and swell very slowly so the page never looks flat.
  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-16, 20]) },
      { translateY: interpolate(drift.value, [0, 1], [-12, 16]) },
      { scale: interpolate(breathe.value, [0, 1], [0.93, 1.09]) },
    ],
    opacity: interpolate(breathe.value, [0, 1], [0.72, 1]),
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [18, -14]) },
      { translateY: interpolate(drift.value, [0, 1], [14, -12]) },
      { scale: interpolate(breathe.value, [0, 1], [1.07, 0.94]) },
    ],
    opacity: interpolate(breathe.value, [0, 1], [1, 0.7]),
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.glowTop, topStyle]}>
        <SoftGlow rgb="14,122,87" size={340} alpha={isDark ? 0.07 : 0.05} />
      </Animated.View>
      <Animated.View style={[styles.glowBottom, bottomStyle]}>
        <SoftGlow rgb="201,151,60" size={280} alpha={isDark ? 0.06 : 0.06} />
      </Animated.View>
      <Image
        source={GRAIN_SOURCE}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.5 : 0.42 }]}
      />
    </View>
  );
}

/** A quietly pulsing accent dot that keeps the section header alive. */
function PulsingDot({ color }: { color: string }) {
  const pulse = useAmbientLoop(2_200);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.7, 2.4]) }],
  }));

  return (
    <View style={styles.dotWrap}>
      <Animated.View style={[styles.dotHalo, { backgroundColor: color }, haloStyle]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

/** Concentric low-alpha circles read as a single soft radial bloom. */
function SoftGlow({
  rgb,
  size,
  alpha,
}: {
  rgb: string;
  size: number;
  alpha: number;
}) {
  const rings = [0.34, 0.5, 0.68, 0.84, 1];
  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
      {rings.map((ring) => {
        const diameter = size * ring;
        return (
          <View
            key={ring}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: -diameter / 2,
              marginTop: -diameter / 2,
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: `rgba(${rgb},${alpha})`,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -60,
    right: -80,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -70,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  bottomStack: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  surahEntry: {
    width: '100%',
  },
  headerContent: {
    gap: Spacing.three,
    marginBottom: Spacing.two,
    zIndex: 1000,
    elevation: 1000,
  },
  featureCardsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    gap: Spacing.two,
  },
  featureCardColumn: {
    flex: 1,
    minWidth: 0,
  },
  sectionHeader: {
    gap: Spacing.three,
    marginTop: Spacing.one,
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
  dotWrap: {
    width: 6,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
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
