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

/** Gap between the search bar and the results panel that hangs under it. */
const RESULTS_GAP = 26;

/** The panel reuses the search bar's dark emerald and gold so the two read as one control. */
const PANEL_BACKGROUND = '#0B382D';
const PANEL_BORDER = 'rgba(216,181,109,0.38)';
const PANEL_DIVIDER = 'rgba(216,181,109,0.22)';
const PANEL_ROW_DIVIDER = 'rgba(255,255,255,0.1)';
const PANEL_TEXT = '#FFF9EA';
const PANEL_TEXT_MUTED = 'rgba(239,248,243,0.68)';
const PANEL_ACCENT = '#E8C77F';

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
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const visibleAyahResults = ayahResults.slice(0, HOME_SEARCH_RESULTS_LIMIT);
  const visibleSurahResults = surahResults.slice(
    0,
    Math.max(0, HOME_SEARCH_RESULTS_LIMIT - visibleAyahResults.length),
  );
  const visibleResultCount = visibleSurahResults.length + visibleAyahResults.length;
  const panelTop = anchor.y + anchor.height + RESULTS_GAP;

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
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.title}>نتائج البحث</Text>
          <Text style={styles.count}>
            {searchLoading ? 'جارٍ البحث…' : toArabicNumbers(visibleResultCount)}
          </Text>
        </View>
        {searchLoading ? (
          <View style={styles.message}>
            <ActivityIndicator size="small" color={PANEL_ACCENT} />
            <Text style={styles.messageText}>جارٍ البحث في المصحف…</Text>
          </View>
        ) : searchError ? (
          <View style={styles.message}>
            <Text style={styles.messageText}>تعذر البحث في المصحف.</Text>
            <Pressable accessibilityRole="button" onPress={onRetrySearch}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : visibleResultCount > 0 ? (
          <ScrollView
            style={styles.results}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            {visibleAyahResults.length > 0 && (
              <Text style={styles.sectionTitle}>آيات مطابقة</Text>
            )}
            {visibleAyahResults.map((result) => (
              <SearchAyahResultItem
                key={`${result.surahNumber}:${result.ayahNumber}`}
                result={result}
                surahName={surahNameByNumber.get(result.surahNumber)
                  ?? `رقم ${toArabicNumbers(result.surahNumber)}`}
                onDark
              />
            ))}
            {visibleSurahResults.length > 0 && (
              <Text style={styles.sectionTitle}>السور</Text>
            )}
            {visibleSurahResults.map((surah) => (
              <Link
                key={`surah-${surah.surahNumber}`}
                href={{ pathname: '/reader', params: { surahNumber: String(surah.surahNumber) } }}
                asChild>
                <Pressable
                  accessibilityRole="button"
                  style={styles.surahResult}>
                  <View style={styles.surahNumber}>
                    <Text style={styles.surahNumberText}>
                      {toArabicNumbers(surah.surahNumber)}
                    </Text>
                  </View>
                  <Text style={styles.surahName}>
                    سورة {surah.nameArabic}
                  </Text>
                  <Ionicons name="chevron-back" size={18} color={PANEL_TEXT_MUTED} />
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.message}>
            <Text style={styles.messageText}>لا توجد نتائج مطابقة في المصحف.</Text>
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
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: PANEL_BORDER,
    backgroundColor: PANEL_BACKGROUND,
    overflow: 'hidden',
    zIndex: 2001,
    elevation: 2001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
  },
  header: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PANEL_DIVIDER,
  },
  title: {
    fontSize: TypeScale.label,
    fontWeight: '900',
    color: PANEL_TEXT,
  },
  count: {
    fontSize: TypeScale.caption,
    fontWeight: '700',
    color: PANEL_TEXT_MUTED,
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
    color: PANEL_ACCENT,
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
    color: PANEL_TEXT_MUTED,
  },
  retryText: {
    fontSize: TypeScale.caption,
    fontWeight: '800',
    color: PANEL_ACCENT,
  },
  surahResult: {
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PANEL_ROW_DIVIDER,
  },
  surahNumber: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: PANEL_DIVIDER,
  },
  surahNumberText: {
    fontSize: TypeScale.caption,
    fontWeight: '900',
    color: PANEL_ACCENT,
  },
  surahName: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '800',
    textAlign: 'right',
    color: PANEL_TEXT,
  },
});
