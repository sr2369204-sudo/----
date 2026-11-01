import { Link, useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Colors, Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Highlight } from '@/features/annotations/types';
import { ContentUnavailableError, quranContentProvider } from '@/features/quran/services/content-provider';
import type { QuranAyah } from '@/features/quran/types';
import { useReaderSelectionStore, type ReaderSelection } from '@/features/reader/state/selection-store';
import { useReaderPreferencesStore } from '@/features/reader/state/reader-preferences-store';
import { useTheme } from '@/hooks/use-theme';
import { QuranText } from '@/features/reader/components/QuranText';
import { MushafPageViewer } from '@/features/reader/components/MushafPageViewer';
import { SelectionSheet } from '@/features/reader/components/SelectionSheet';
import { MushafPageCache } from '@/features/reader/services/mushaf-page-cache';

const AYAH_GROUP_SIZE = 12;

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ surahNumber?: string | string[] }>();
  const rawSurahNumber = Array.isArray(params.surahNumber)
    ? params.surahNumber[0]
    : params.surahNumber;
  const requestedSurah = Number(rawSurahNumber ?? '1');
  const colors = useTheme();
  const database = useSQLiteContext();
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const reciterId = useReaderPreferencesStore((state) => state.reciterId);
  const selection = useReaderSelectionStore((state) => state.selection);
  const selectWord = useReaderSelectionStore((state) => state.selectWord);
  const selectAyah = useReaderSelectionStore((state) => state.selectAyah);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightRevision, setHighlightRevision] = useState(0);
  const [highlightError, setHighlightError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [mushafInteractionError, setMushafInteractionError] = useState<string | null>(null);
  const [showTajweed, setShowTajweed] = useState(true);
  const [fontSize, setFontSize] = useState(29);

  const contentQuery = useQuery({
    queryKey: ['quran', 'surah', rawSurahNumber ?? '1'],
    enabled: requestedSurah !== 1,
    queryFn: () => {
      if (!Number.isInteger(requestedSurah) || requestedSurah < 1 || requestedSurah > 114) {
        throw new ContentUnavailableError('invalid-data', 'Invalid surah route parameter.');
      }
      return quranContentProvider.getSurah(requestedSurah);
    },
  });

  const mushafPageQuery = useQuery({
    queryKey: ['quran', 'mushaf-page', 1, 19],
    enabled: requestedSurah === 1,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: () => new MushafPageCache(database).getPageOne(),
  });

  const surah = requestedSurah === 1
    ? mushafPageQuery.data?.page.surah
    : contentQuery.data;
  const surahError = requestedSurah === 1 ? mushafPageQuery.error : contentQuery.error;
  const surahIsPending = requestedSurah === 1
    ? mushafPageQuery.isPending
    : contentQuery.isPending;
  const refetchSurah = requestedSurah === 1
    ? mushafPageQuery.refetch
    : contentQuery.refetch;

  const basmalaQuery = useQuery({
    queryKey: ['quran', 'basmala'],
    queryFn: () => quranContentProvider.getSurah(1),
    enabled: requestedSurah !== 1 && requestedSurah !== 9,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const ayahGroups = useMemo(() => {
    const ayahs = surah?.ayahs ?? [];
    const groups: { key: string; ayahs: QuranAyah[] }[] = [];
    for (let index = 0; index < ayahs.length; index += AYAH_GROUP_SIZE) {
      const group = ayahs.slice(index, index + AYAH_GROUP_SIZE);
      groups.push({ key: String(group[0].ayahNumber), ayahs: group });
    }
    return groups;
  }, [surah]);

  useEffect(() => {
    let active = true;
    setAudioModeAsync({ playsInSilentMode: true }).catch((error: unknown) => {
      if (active) {
        setAudioError(
          error instanceof Error ? `تعذر تهيئة الصوت: ${error.message}` : 'تعذر تهيئة الصوت.',
        );
      }
    });
    return () => {
      active = false;
      player.pause();
    };
  }, [player]);

  useEffect(() => {
    if (!surah) {
      return;
    }

    let active = true;
    const repository = new SqliteAnnotationRepository(database);
    Promise.all(
      surah.ayahs.map((ayah) =>
        repository.listHighlightsForAyah(surah.surahNumber, ayah.ayahNumber),
      ),
    )
      .then((items) => {
        if (active) {
          setHighlights(items.flat());
          setHighlightError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setHighlightError(
            error instanceof Error
              ? `تعذر تحميل التمييزات المحفوظة: ${error.message}`
              : 'تعذر تحميل التمييزات المحفوظة من الجهاز.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [database, highlightRevision, surah]);

  const selectMushafWord = useCallback((ayahNumber: number, position: number) => {
    const ayah = surah?.ayahs.find((item) => item.ayahNumber === ayahNumber);
    const word = ayah?.words.find((item) => item.position === position);
    if (!ayah || !word) {
      setMushafInteractionError('تعذر مطابقة الكلمة مع بيانات السورة.');
      return;
    }
    setMushafInteractionError(null);
    selectWord(1, ayah, word, 'compact');
  }, [selectWord, surah]);

  const selectMushafAyah = useCallback((ayahNumber: number) => {
    const ayah = surah?.ayahs.find((item) => item.ayahNumber === ayahNumber);
    if (!ayah) {
      setMushafInteractionError('تعذر مطابقة الآية مع بيانات السورة.');
      return;
    }
    setMushafInteractionError(null);
    selectAyah(1, ayah, 'compact');
  }, [selectAyah, surah]);

  const playSelection = useCallback(
    async (selection: ReaderSelection) => {
      setAudioError(null);
      const audioUrl =
        selection.type === 'word'
          ? selection.word.audioUrl
            ? quranContentProvider.getWordAudioUrl(selection.word.audioUrl)
            : null
          : await quranContentProvider.getAyahAudioUrl(
              reciterId,
              selection.surahNumber,
              selection.ayah.ayahNumber,
            );
      if (!audioUrl) {
        throw new Error('لا يتوفر تسجيل صوتي لهذه الكلمة من المصدر.');
      }
      player.replace(audioUrl);
      player.play();
    },
    [player, reciterId],
  );

  const errorMessage =
    surahError instanceof ContentUnavailableError
      ? surahError.reason === 'invalid-data'
        ? 'تعذر التحقق من نص السورة القادم من المصدر.'
        : surahError.reason === 'network'
          ? 'تعذر الاتصال بـ Quran.com. تحقق من الإنترنت وحاول مجددًا.'
          : 'خدمة Quran.com غير متاحة مؤقتًا. حاول مرة أخرى لاحقًا.'
      : requestedSurah === 1 && surahError instanceof Error
        ? `تعذر تحميل صفحة المصحف: ${surahError.message}`
        : 'تعذر فتح السورة.';

  const basmala = basmalaQuery.data?.ayahs[0]?.words.slice(0, 4)
    .map((word) => word.textUthmani)
    .join(' ');
  const selectedMushafElementId = selection?.surahNumber === 1
    ? selection.type === 'word'
      ? `word-${selection.ayah.ayahNumber}-${selection.word.position}`
      : `ayah-${selection.ayah.ayahNumber}`
    : null;

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safeArea, { backgroundColor: colors.background }])}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Link href="/" replace asChild>
          <Pressable
            accessibilityRole="button"
            style={StyleSheet.flatten([
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ])}>
            <Text style={[styles.backGlyph, { color: colors.primary }]}>→</Text>
          </Pressable>
        </Link>
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {surah?.nameArabic ?? 'المصحف'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {surah ? `${toArabicNumbers(surah.ayahCount)} آية` : 'قراءة القرآن الكريم'}
          </Text>
        </View>
        <View style={styles.readerTools}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showTajweed ? 'إخفاء ألوان التجويد' : 'إظهار ألوان التجويد'}
            accessibilityState={{ selected: showTajweed }}
            onPress={() => setShowTajweed((value) => !value)}
            style={[
              styles.toolButton,
              {
                backgroundColor: showTajweed ? colors.backgroundSelected : colors.surface,
                borderColor: showTajweed ? colors.primary : colors.border,
              },
            ]}>
            <Text style={[styles.tajweedToolText, { color: colors.primary }]}>تج</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تكبير الخط"
            disabled={fontSize >= 38}
            onPress={() => setFontSize((value) => Math.min(38, value + 2))}
            style={[styles.fontButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fontButtonText, { color: colors.text }]}>A+</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تصغير الخط"
            disabled={fontSize <= 23}
            onPress={() => setFontSize((value) => Math.max(23, value - 2))}
            style={[styles.fontButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fontButtonText, { color: colors.text }]}>A−</Text>
          </Pressable>
        </View>
      </View>

      {surahIsPending ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {requestedSurah === 1 ? 'جارٍ تجهيز صفحة المصحف…' : 'جارٍ فتح السورة…'}
          </Text>
        </View>
      ) : surahError ? (
        <View style={[styles.unavailable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.unavailableTitle, { color: colors.text }]}>تعذر فتح السورة</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetchSurah()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryText, { color: colors.background }]}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : surah ? (
        <>
          {requestedSurah === 1 && mushafPageQuery.data ? (
            <MushafPageViewer
              page={mushafPageQuery.data.page}
              fontBase64={mushafPageQuery.data.fontBase64}
              fontSize={fontSize}
              showTajweed={showTajweed}
              isDark={colors.background === Colors.dark.background}
              highlights={highlights}
              selectedElementId={selectedMushafElementId}
              onWordPress={selectMushafWord}
              onAyahPress={selectMushafAyah}
              onInteractionError={setMushafInteractionError}
            />
          ) : (
          <FlatList
            keyExtractor={(item) => item.key}
            data={ayahGroups}
            contentContainerStyle={[
              styles.passageContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            ListHeaderComponent={
              <View style={styles.surahHeading}>
                <View style={[styles.headingRule, { backgroundColor: colors.primary }]} />
                <Text style={[styles.surahHeadingNumber, { color: colors.primary }]}>
                  السورة {toArabicNumbers(surah.surahNumber)}
                </Text>
                <Text style={[styles.surahHeadingTitle, { color: colors.text }]}>
                  {surah.nameArabic}
                </Text>
                <Text style={[styles.surahHeadingDetails, { color: colors.textSecondary }]}>
                  {surah.revelationPlace === 'makkah' ? 'مكية' : 'مدنية'}
                </Text>
                {requestedSurah !== 1 && requestedSurah !== 9 && basmala && (
                  <Text style={[styles.basmala, { color: colors.text }]}>{basmala}</Text>
                )}
                {showTajweed && <TajweedLegend />}
              </View>
            }
            renderItem={({ item }) => (
              <QuranText
                surahNumber={surah.surahNumber}
                ayahs={item.ayahs}
                highlights={highlights}
                showTajweed={showTajweed}
                fontSize={fontSize}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.passageGap} />}
            ListFooterComponent={
              <Text style={[styles.endOfSurah, { color: colors.textSecondary }]}>نهاية السورة</Text>
            }
            initialNumToRender={2}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews
          />
          )}
          {playerStatus.playing && (
            <View style={[styles.playingBar, { backgroundColor: colors.primary }]}>
              <Text style={styles.playingLabel}>التلاوة تعمل الآن</Text>
              <Pressable accessibilityRole="button" onPress={() => player.pause()}>
                <Text style={styles.stopLabel}>إيقاف</Text>
              </Pressable>
            </View>
          )}
        </>
      ) : null}

      {highlightError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {highlightError}
        </Text>
      )}
      {audioError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {audioError}
        </Text>
      )}
      {mushafInteractionError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {mushafInteractionError}
        </Text>
      )}
      <SelectionSheet
        surahName={surah?.nameArabic ?? 'السورة'}
        onHighlightsChanged={() => setHighlightRevision((revision) => revision + 1)}
        onPlayAudio={playSelection}
        onStopAudio={() => player.pause()}
        isAudioPlaying={playerStatus.playing}
      />
    </SafeAreaView>
  );
}

function TajweedLegend() {
  const colors = useTheme();
  const items = [
    { label: 'مد', color: '#A33DB5' },
    { label: 'غنة', color: '#18864B' },
    { label: 'إخفاء', color: '#1684B8' },
    { label: 'قلقلة', color: '#D87A19' },
  ];
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 72,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  backGlyph: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'right',
  },
  readerTools: {
    flexDirection: 'row',
    gap: 6,
  },
  toolButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  tajweedToolText: {
    fontSize: 14,
    fontWeight: '800',
  },
  fontButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  fontButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  message: {
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'center',
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
  retryButton: {
    padding: Spacing.three,
    borderRadius: 13,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  passageContainer: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    minHeight: '100%',
    marginVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    borderWidth: 1,
    borderRadius: 22,
  },
  surahHeading: {
    alignItems: 'center',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  headingRule: {
    width: 42,
    height: 3,
    borderRadius: 2,
    marginBottom: 8,
  },
  surahHeadingNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  surahHeadingTitle: {
    fontSize: 25,
    fontWeight: '800',
  },
  surahHeadingDetails: {
    fontSize: 12,
  },
  basmala: {
    marginTop: Spacing.three,
    fontSize: 25,
    lineHeight: 46,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  legend: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: Spacing.two,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
  passageGap: {
    height: 8,
  },
  endOfSurah: {
    alignSelf: 'center',
    marginTop: Spacing.four,
    fontSize: 13,
  },
  playingBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  playingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stopLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  error: {
    color: '#B42318',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    textAlign: 'right',
  },
});
