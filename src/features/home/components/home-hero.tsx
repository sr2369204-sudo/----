import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { SearchAyahResultItem } from '@/features/home/components/search-ayah-result-item';
import { toArabicNumbers } from '@/features/home/utils/format';
import type { AyahSearchResult, QuranSurahSummary } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';

type HomeHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  surahResults: QuranSurahSummary[];
  surahNameByNumber: Map<number, string>;
  ayahResults: AyahSearchResult[];
  searchLoading: boolean;
  searchError: boolean;
  onRetrySearch: () => void;
};

export function HomeHero({
  searchValue,
  onSearchChange,
  surahResults,
  surahNameByNumber,
  ayahResults,
  searchLoading,
  searchError,
  onRetrySearch,
}: HomeHeroProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const showResults = searchValue.trim().length > 0;
  const hasResults = surahResults.length > 0 || ayahResults.length > 0;
  const isDark = colors.text === '#F3F8F5';

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Image
          source={require('../../../../assets/images/quran-hero.png')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={1000}
        />
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.topRow}>
          <View style={styles.welcomeGroup}>
            <Text style={styles.welcomeTitle}>مرحباً بك في مصحف</Text>
            <Text style={styles.welcomeSubtitle}>ابحث في كتاب الله عز وجل</Text>
          </View>
          
          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الإعدادات"
              style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </Pressable>
          </Link>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            accessibilityLabel="ابحث باسم السورة أو آية أو كلمة من القرآن"
            placeholder="ابحث باسم السورة أو آية أو كلمة من القرآن..."
            placeholderTextColor={colors.textSecondary}
            value={searchValue}
            onChangeText={onSearchChange}
            style={[styles.searchInput, { color: colors.text }]}
            textAlign="right"
            returnKeyType="search"
          />
        </View>
      </View>

      {showResults && (
        <View
          accessibilityLabel="نتائج البحث"
          style={[
            styles.resultsDropdown,
            {
              backgroundColor: colors.glassOverlaySurface,
              borderColor: colors.glassBorder,
            },
          ]}>
          <BlurView
            intensity={75}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>نتائج البحث</Text>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {searchLoading
                ? 'جارٍ البحث…'
                : toArabicNumbers(surahResults.length + ayahResults.length)}
            </Text>
          </View>
          {searchLoading ? (
            <View style={styles.resultsMessage}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                جارٍ البحث في المصحف…
              </Text>
            </View>
          ) : searchError ? (
            <View style={styles.resultsMessage}>
              <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                تعذر البحث في المصحف.
              </Text>
              <Pressable accessibilityRole="button" onPress={onRetrySearch}>
                <Text style={[styles.retryText, { color: colors.primary }]}>إعادة المحاولة</Text>
              </Pressable>
            </View>
          ) : hasResults ? (
            <ScrollView
              style={styles.resultsScroll}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled>
              {surahResults.slice(0, 3).map((surah) => (
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
                    <View style={[styles.surahResultNumber, { backgroundColor: colors.backgroundSelected }]}>
                      <Text style={[styles.surahResultNumberText, { color: colors.primary }]}>
                        {toArabicNumbers(surah.surahNumber)}
                      </Text>
                    </View>
                    <Text style={[styles.surahResultName, { color: colors.text }]}>
                      سورة {surah.nameArabic}
                    </Text>
                    <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
                  </Pressable>
                </Link>
              ))}
              {ayahResults.slice(0, 4).map((result) => (
                <SearchAyahResultItem
                  key={`${result.surahNumber}:${result.ayahNumber}`}
                  result={result}
                  surahName={surahNameByNumber.get(result.surahNumber)
                    ?? `رقم ${toArabicNumbers(result.surahNumber)}`}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.resultsMessage}>
              <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                لا توجد نتائج مطابقة في المصحف.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: '100%',
    overflow: 'visible',
    zIndex: 20,
    elevation: 20,
  },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
    paddingBottom: Spacing.four,
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeGroup: {
    gap: 4,
  },
  welcomeTitle: {
    fontSize: TypeScale.hero,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
  },
  welcomeSubtitle: {
    fontSize: TypeScale.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    height: 56,
    borderRadius: Radius.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginLeft: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '600',
  },
  resultsDropdown: {
    position: 'absolute',
    top: '100%',
    left: Spacing.four,
    right: Spacing.four,
    marginTop: -16,
    maxHeight: 340,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 50,
    elevation: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  resultsHeader: {
    minHeight: 42,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.25)',
  },
  resultsTitle: {
    fontSize: TypeScale.label,
    fontWeight: '900',
  },
  resultsCount: {
    fontSize: TypeScale.caption,
  },
  resultsScroll: {
    flexGrow: 0,
  },
  resultsMessage: {
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
  surahResultNumber: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahResultNumberText: {
    fontSize: TypeScale.caption,
    fontWeight: '900',
  },
  surahResultName: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '800',
    textAlign: 'right',
  },
});
