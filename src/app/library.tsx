import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { SurahGridItemModern } from '@/features/home/components/surah-list-item-modern';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import type { QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

export default function QuranLibraryScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const [search, setSearch] = useState('');
  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
  });

  // See the home screen: normalising all 114 names per keystroke costs typing
  // responsiveness, so they are normalised once when the directory arrives.
  const normalizedSurahNames = useMemo(
    () => new Map((surahDirectory.data?.surahs ?? []).map((surah) => [
      surah.surahNumber,
      normalizeSurahSearch(surah.nameArabic),
    ])),
    [surahDirectory.data],
  );

  const visibleSurahs = useMemo(() => {
    const query = normalizeSurahSearch(search);
    const surahs = surahDirectory.data?.surahs ?? [];
    if (query.length === 0) {
      return surahs;
    }
    return surahs.filter((surah) =>
      (normalizedSurahNames.get(surah.surahNumber) ?? '').includes(query) ||
      String(surah.surahNumber).includes(query),
    );
  }, [search, surahDirectory.data, normalizedSurahNames]);

  const renderSurah = useCallback(
    ({ item }: { item: QuranSurahSummary }) => <SurahGridItemModern surah={item} />,
    [],
  );

  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.safeArea, { backgroundColor: colors.background }])}>
      <FlatList
        data={visibleSurahs}
        keyExtractor={(item) => String(item.surahNumber)}
        renderItem={renderSurah}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
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
                <Text style={[styles.title, { color: colors.text }]}>المكتبة القرآنية</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  اختر سورة لفتحها في المصحف
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="book-outline" size={21} color={colors.primary} />
              </View>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                بعد فتح السورة، اختر آية من المصحف لعرض تفسيرها والاستماع إلى تلاوتها.
              </Text>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={19} color={colors.textSecondary} />
              <TextInput
                accessibilityLabel="ابحث عن سورة"
                value={search}
                onChangeText={setSearch}
                placeholder="ابحث باسم السورة أو رقمها"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                textAlign="right"
                style={[styles.searchInput, { color: colors.text }]}
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="مسح البحث"
                  onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={19} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>السور</Text>
              {surahDirectory.data && (
                <Text style={[styles.surahCount, { color: colors.textSecondary }]}>
                  {`${visibleSurahs.length} من ١١٤`}
                </Text>
              )}
            </View>

            {surahDirectory.isPending && (
              <View style={styles.message}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                  جارٍ تحميل السور…
                </Text>
              </View>
            )}
            {surahDirectory.error && (
              <View style={styles.message}>
                <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                  تعذر تحميل السور.
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
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              لا توجد سورة مطابقة للبحث.
            </Text>
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
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
  infoCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: TypeScale.caption,
    lineHeight: 20,
    textAlign: 'right',
  },
  searchBox: {
    minHeight: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: TypeScale.body,
    paddingVertical: Spacing.two,
  },
  sectionHeading: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: TypeScale.title,
    fontWeight: '900',
  },
  surahCount: {
    fontSize: TypeScale.caption,
  },
  message: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  messageText: {
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
  retryText: {
    fontSize: TypeScale.body,
    fontWeight: '800',
  },
});
