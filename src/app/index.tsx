import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import type { QuranSurahSummary } from '@/features/quran/types';
import { ContentUnavailableError } from '@/features/quran/services/content-provider';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import { useTheme } from '@/hooks/use-theme';

type RevelationFilter = 'all' | 'makkah' | 'madinah';

const filters: { key: RevelationFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'makkah', label: 'مكية' },
  { key: 'madinah', label: 'مدنية' },
];

/** Fixed facts about the Mushaf the reader opens, shown as a quick summary. */
const mushafFacts = [
  { value: '١١٤', label: 'سورة' },
  { value: '٣٠', label: 'جزءًا' },
  { value: '٦٠٤', label: 'صفحة' },
];

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

  const visibleSurahs = useMemo(() => {
    const query = normalizeSurahSearch(search);
    return (surahDirectory.data?.surahs ?? []).filter((surah) => {
      const matchesSearch =
        query.length === 0 ||
        normalizeSurahSearch(surah.nameArabic).includes(query) ||
        normalizeSurahSearch(String(surah.surahNumber)).includes(query);
      return matchesSearch &&
        (revelationFilter === 'all' || surah.revelationPlace === revelationFilter);
    });
  }, [revelationFilter, search, surahDirectory.data]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleSurahs}
        keyExtractor={(item) => String(item.surahNumber)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.topBar}>
              <View style={styles.brand}>
                <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.brandMarkText, { color: colors.background }]}>م</Text>
                </View>
                <View style={styles.brandText}>
                  <Text style={[styles.brandName, { color: colors.text }]}>مصحف</Text>
                  <Text style={[styles.brandCaption, { color: colors.textSecondary }]}>
                    رفيق وردك اليومي
                  </Text>
                </View>
              </View>
              <Link href="/settings" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="الإعدادات"
                  style={({ pressed }) => [
                    styles.iconButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary} />
                </Pressable>
              </Link>
            </View>

            <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text pointerEvents="none" style={[styles.heroWatermark, { color: `${colors.primary}14` }]}>
                ۞
              </Text>

              <View style={styles.heroEyebrowRow}>
                <View style={[styles.heroAccent, { backgroundColor: colors.primary }]} />
                <Text style={[styles.heroEyebrow, { color: colors.textSecondary }]}>
                  رحلتك مع القرآن
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>مساحة هادئة لقراءتك</Text>
              <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
                تابع من آخر موضع وصلت إليه، أو ابحث عن السورة التي تريدها.
              </Text>

              <Link href="/reader" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.startButton,
                    { backgroundColor: colors.primary },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.startButtonText, { color: colors.background }]}>
                    متابعة القراءة
                  </Text>
                  <Ionicons name="chevron-back" size={16} color={colors.background} />
                </Pressable>
              </Link>

              <View style={[styles.heroStats, { borderTopColor: colors.border }]}>
                {mushafFacts.map((fact, index) => (
                  <Fragment key={fact.label}>
                    {index > 0 && (
                      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    )}
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{fact.value}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        {fact.label}
                      </Text>
                    </View>
                  </Fragment>
                ))}
              </View>
            </View>

            <Link href="/saved-words" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="الكلمات المحفوظة"
                style={({ pressed }) => [
                  styles.savedWordsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.savedWordsIcon, { backgroundColor: colors.backgroundSelected }]}>
                  <Ionicons name="bookmark" size={19} color={colors.primary} />
                </View>
                <View style={styles.savedWordsInfo}>
                  <Text style={[styles.savedWordsTitle, { color: colors.text }]}>الكلمات المحفوظة</Text>
                  <Text style={[styles.savedWordsCaption, { color: colors.textSecondary }]}>
                    راجع كل الكلمات التي حفظتها من المصحف
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              </Pressable>
            </Link>

            <View style={styles.sectionHeading}>
              <View style={styles.sectionHeadingText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>سور القرآن</Text>
                <Text style={[styles.sectionCaption, { color: colors.textSecondary }]}>
                  {surahDirectory.data
                    ? `${toArabicNumbers(visibleSurahs.length)} سورة`
                    : 'ابحث عن سورة أو رقمها'}
                </Text>
              </View>
              <View style={[styles.sectionPill, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="book-outline" size={13} color={colors.primary} />
                <Text style={[styles.sectionPillText, { color: colors.primary }]}>١١٤</Text>
              </View>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                accessibilityLabel="ابحث عن سورة"
                placeholder="ابحث باسم السورة أو رقمها"
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
                textAlign="right"
                returnKeyType="search"
                style={[styles.searchInput, { color: colors.text }]}
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="مسح البحث"
                  onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            <View style={styles.filterRow}>
              {filters.map((filter) => {
                const active = revelationFilter === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setRevelationFilter(filter.key)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        styles.filterText,
                        { color: active ? colors.background : colors.textSecondary },
                      ]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {surahDirectory.isPending && (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>جارٍ تحميل السور…</Text>
              </View>
            )}
            {surahDirectory.error && (
              <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        renderItem={({ item }) => <SurahRow surah={item} />}
        ListEmptyComponent={
          !surahDirectory.isPending && !surahDirectory.error ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>لا توجد سورة بهذا الاسم.</Text>
          ) : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

function SurahRow({ surah }: { surah: QuranSurahSummary }) {
  const colors = useTheme();
  return (
    <Link
      href={{ pathname: '/reader', params: { surahNumber: String(surah.surahNumber) } }}
      asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.surahRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}>
        <View style={[styles.surahNumberBadge, { backgroundColor: colors.backgroundSelected }]}>
          <Text style={[styles.surahNumber, { color: colors.primary }]}>
            {toArabicNumbers(surah.surahNumber)}
          </Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: colors.text }]}>{surah.nameArabic}</Text>
          <View style={styles.surahMeta}>
            <Ionicons
              name={surah.revelationPlace === 'makkah' ? 'location-outline' : 'business-outline'}
              size={12}
              color={colors.textSecondary}
            />
            <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
              {surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'} ·{' '}
              {toArabicNumbers(surah.ayahCount)} آية
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
      </Pressable>
    </Link>
  );
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
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
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  topBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    gap: 2,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontSize: 23,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  brandCaption: {
    fontSize: 12,
    textAlign: 'right',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 26,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  heroWatermark: {
    position: 'absolute',
    top: -26,
    left: -14,
    fontSize: 150,
  },
  heroEyebrowRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  heroAccent: {
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  startButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    borderRadius: 14,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  heroStats: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 26,
  },
  savedWordsCard: {
    minHeight: 70,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 18,
  },
  savedWordsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedWordsInfo: {
    flex: 1,
    gap: 3,
  },
  savedWordsTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  savedWordsCaption: {
    fontSize: 12,
    textAlign: 'right',
  },
  sectionHeading: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  sectionHeadingText: {
    gap: 3,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'right',
  },
  sectionCaption: {
    fontSize: 13,
    textAlign: 'right',
  },
  sectionPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  searchBox: {
    minHeight: 52,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
  filterChip: {
    minWidth: 64,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  surahRow: {
    minHeight: 70,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 18,
  },
  surahNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  surahInfo: {
    flex: 1,
    gap: 4,
  },
  surahName: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },
  surahMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  surahDetails: {
    fontSize: 12,
    textAlign: 'right',
  },
  rowSeparator: {
    height: Spacing.two,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  statusText: {
    fontSize: 13,
    textAlign: 'right',
  },
  notice: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  emptyText: {
    paddingVertical: Spacing.four,
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
