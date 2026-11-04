import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { SearchAyahResultItem } from '@/features/home/components/search-ayah-result-item';
import { HOME_SEARCH_RESULTS_LIMIT } from '@/features/home/utils/home-search';
import { toArabicNumbers } from '@/features/home/utils/format';
import type { AyahSearchResult, QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

export type SearchAnchor = { x: number; y: number; width: number; height: number };

type HomeSearchResultsProps = {
  anchor: SearchAnchor;
  surahResults: QuranSurahSummary[];
  surahNameByNumber: Map<number, string>;
  ayahResults: AyahSearchResult[];
  searchLoading: boolean;
  searchError: boolean;
  onRetrySearch: () => void;
};

export function HomeSearchResults({
  anchor,
  surahResults,
  surahNameByNumber,
  ayahResults,
  searchLoading,
  searchError,
  onRetrySearch,
}: HomeSearchResultsProps) {
  const colors = useTheme();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const visibleAyahResults = ayahResults.slice(0, HOME_SEARCH_RESULTS_LIMIT);
  const visibleSurahResults = surahResults.slice(
    0,
    Math.max(0, HOME_SEARCH_RESULTS_LIMIT - visibleAyahResults.length),
  );
  const visibleResultCount = visibleSurahResults.length + visibleAyahResults.length;
  const panelTop = anchor.y + anchor.height + Spacing.two;

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View
        accessibilityLabel="نتائج البحث"
        style={[
          styles.panel,
          {
            top: panelTop,
            left: Math.max(Spacing.two, anchor.x - Spacing.two),
            right: Math.max(Spacing.two, width - anchor.x - anchor.width - Spacing.two),
            maxHeight: Math.max(160, height - panelTop - insets.bottom - Spacing.two),
            backgroundColor: colors.surface,
            borderColor: colors.glassBorder,
          },
        ]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>نتائج البحث</Text>
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {searchLoading ? 'جارٍ البحث…' : toArabicNumbers(visibleResultCount)}
          </Text>
        </View>
        {searchLoading ? (
          <View style={styles.message}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              جارٍ البحث في المصحف…
            </Text>
          </View>
        ) : searchError ? (
          <View style={styles.message}>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              تعذر البحث في المصحف.
            </Text>
            <Pressable accessibilityRole="button" onPress={onRetrySearch}>
              <Text style={[styles.retryText, { color: colors.primary }]}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : visibleResultCount > 0 ? (
          <ScrollView
            style={styles.results}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            {visibleAyahResults.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>آيات مطابقة</Text>
            )}
            {visibleAyahResults.map((result) => (
              <SearchAyahResultItem
                key={`${result.surahNumber}:${result.ayahNumber}`}
                result={result}
                surahName={surahNameByNumber.get(result.surahNumber)
                  ?? `رقم ${toArabicNumbers(result.surahNumber)}`}
              />
            ))}
            {visibleSurahResults.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>السور</Text>
            )}
            {visibleSurahResults.map((surah) => (
              <Link
                key={`surah-${surah.surahNumber}`}
                href={{ pathname: '/reader', params: { surahNumber: String(surah.surahNumber) } }}
                asChild>
                <Pressable
                  accessibilityRole="button"
                  style={StyleSheet.flatten([
                    styles.surahResult,
                    { borderBottomColor: colors.glassBorder },
                  ])}>
                  <View style={[styles.surahNumber, { backgroundColor: colors.backgroundSelected }]}>
                    <Text style={[styles.surahNumberText, { color: colors.primary }]}>
                      {toArabicNumbers(surah.surahNumber)}
                    </Text>
                  </View>
                  <Text style={[styles.surahName, { color: colors.text }]}>
                    سورة {surah.nameArabic}
                  </Text>
                  <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.message}>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              لا توجد نتائج مطابقة في المصحف.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 2000,
    elevation: 2000,
  },
  panel: {
    position: 'absolute',
    maxHeight: 340,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 2001,
    elevation: 2001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  header: {
    minHeight: 42,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  title: {
    fontSize: TypeScale.label,
    fontWeight: '900',
  },
  count: {
    fontSize: TypeScale.caption,
  },
  results: {
    flexGrow: 0,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    fontSize: TypeScale.caption,
    fontWeight: '900',
    textAlign: 'right',
  },
  message: {
    minHeight: 76,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  messageText: {
    fontSize: TypeScale.caption,
    textAlign: 'center',
  },
  retryText: {
    fontSize: TypeScale.caption,
    fontWeight: '800',
  },
  surahResult: {
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  surahNumber: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumberText: {
    fontSize: TypeScale.caption,
    fontWeight: '900',
  },
  surahName: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '800',
    textAlign: 'right',
  },
});
