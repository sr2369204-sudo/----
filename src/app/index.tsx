import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
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

import { Spacing } from '@/constants/theme';
import type { QuranSurahSummary } from '@/features/quran/types';
import { ContentUnavailableError, quranContentProvider } from '@/features/quran/services/content-provider';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import { useTheme } from '@/hooks/use-theme';

type RevelationFilter = 'all' | 'makkah' | 'madinah';

const filters: { key: RevelationFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'makkah', label: 'مكية' },
  { key: 'madinah', label: 'مدنية' },
];

export default function HomeScreen() {
  const colors = useTheme();
  const [search, setSearch] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all');
  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranContentProvider.getSurahDirectory(),
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
    <SafeAreaView style={StyleSheet.flatten([styles.safeArea, { backgroundColor: colors.background }])}>
      <FlatList
        data={visibleSurahs}
        keyExtractor={(item) => String(item.surahNumber)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.topBar}>
              <View style={styles.brand}>
                <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.brandMarkText}>م</Text>
                </View>
                <View>
                  <Text style={[styles.brandName, { color: colors.text }]}>مصحف</Text>
                  <Text style={[styles.brandCaption, { color: colors.textSecondary }]}>رفيق وردك اليومي</Text>
                </View>
              </View>
              <Link href="/settings" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="الإعدادات"
                  style={StyleSheet.flatten([
                    styles.settingsButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ])}>
                  <Text style={[styles.settingsGlyph, { color: colors.primary }]}>☼</Text>
                </Pressable>
              </Link>
            </View>

            <View style={[styles.hero, { backgroundColor: colors.primary }]}>
              <Text style={styles.heroEyebrow}>رحلتك مع القرآن</Text>
              <Text style={styles.heroTitle}>مساحة هادئة لقراءتك</Text>
              <Text style={styles.heroBody}>
                تابع من آخر موضع وصلت إليه، أو ابحث عن السورة التي تريدها.
              </Text>
              <Link href="/reader" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={StyleSheet.flatten([styles.startButton])}>
                  <Text style={[styles.startButtonText, { color: colors.primary }]}>متابعة القراءة</Text>
                  <Text style={[styles.startArrow, { color: colors.primary }]}>←</Text>
                </Pressable>
              </Link>
              <View pointerEvents="none" style={styles.heroDecoration}>
                <Text style={styles.heroDecorationText}>۞</Text>
              </View>
            </View>

            <Link href="/saved-words" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="الكلمات المحفوظة"
                style={StyleSheet.flatten([
                  styles.savedWordsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ])}>
                <View style={[styles.savedWordsIcon, { backgroundColor: colors.backgroundSelected }]}>
                  <Ionicons name="bookmark" size={20} color={colors.primary} />
                </View>
                <View style={styles.savedWordsInfo}>
                  <Text style={[styles.savedWordsTitle, { color: colors.text }]}>الكلمات المحفوظة</Text>
                  <Text style={[styles.savedWordsCaption, { color: colors.textSecondary }]}>
                    راجع كل الكلمات التي حفظتها من المصحف
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
              </Pressable>
            </Link>

            <View style={styles.sectionHeading}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>سور القرآن</Text>
                <Text style={[styles.sectionCaption, { color: colors.textSecondary }]}>
                  {surahDirectory.data
                    ? `${toArabicNumbers(visibleSurahs.length)} سورة`
                    : 'ابحث عن سورة أو رقمها'}
                </Text>
              </View>
              <Text style={[styles.surahTotal, { color: colors.primary }]}>١١٤</Text>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>⌕</Text>
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
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? colors.backgroundSelected : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[styles.filterText, { color: active ? colors.primary : colors.textSecondary }]}>
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
        style={StyleSheet.flatten([
          styles.surahRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ])}>
        <View style={[styles.surahNumberBadge, { backgroundColor: colors.backgroundSelected }]}>
          <Text style={[styles.surahNumber, { color: colors.primary }]}>
            {toArabicNumbers(surah.surahNumber)}
          </Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: colors.text }]}>{surah.nameArabic}</Text>
          <Text style={[styles.surahDetails, { color: colors.textSecondary }]}>
            {surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'} · {toArabicNumbers(surah.ayahCount)} آية
          </Text>
        </View>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>‹</Text>
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
    paddingTop: Spacing.two,
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
    paddingVertical: Spacing.two,
  },
  brand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  brandCaption: {
    marginTop: 2,
    fontSize: 12,
    textAlign: 'right',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGlyph: {
    fontSize: 23,
    fontWeight: '700',
  },
  hero: {
    overflow: 'hidden',
    minHeight: 224,
    borderRadius: 28,
    padding: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.two,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  heroTitle: {
    maxWidth: '80%',
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'right',
  },
  heroBody: {
    maxWidth: '82%',
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  startButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  startArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroDecoration: {
    position: 'absolute',
    left: -12,
    bottom: -42,
  },
  heroDecorationText: {
    color: 'rgba(255,255,255,0.08)',
    fontSize: 170,
  },
  savedWordsCard: {
    minHeight: 72,
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
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'right',
  },
  sectionCaption: {
    marginTop: 3,
    fontSize: 13,
    textAlign: 'right',
  },
  surahTotal: {
    fontSize: 17,
    fontWeight: '800',
  },
  searchBox: {
    minHeight: 54,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: Spacing.three,
  },
  searchIcon: {
    fontSize: 24,
    paddingLeft: Spacing.two,
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
    minHeight: 72,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 18,
  },
  surahNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: 15,
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
  surahDetails: {
    fontSize: 12,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 26,
    lineHeight: 30,
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
});
