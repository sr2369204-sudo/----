import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { SavedWord } from '@/features/annotations/types';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/components/confirm-delete';

import { friendlyError } from '@/features/errors/friendly-error';
export default function SavedWordsScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const savedWordsQuery = useQuery({
    queryKey: ['annotations', 'saved-words'],
    queryFn: () => new SqliteAnnotationRepository(database).listSavedWords(),
  });

  const directoryQuery = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranContentProvider.getSurahDirectory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const surahNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const surah of directoryQuery.data?.surahs ?? []) {
      map.set(surah.surahNumber, surah.nameArabic);
    }
    return map;
  }, [directoryQuery.data]);

  const removeWord = useCallback(
    async (word: SavedWord) => {
      setBusyId(word.id);
      setError(null);
      try {
        await new SqliteAnnotationRepository(database).deleteSavedWord(
          word.surahNumber,
          word.ayahNumber,
          word.wordId,
        );
        await queryClient.invalidateQueries({ queryKey: ['annotations', 'saved-words'] });
      } catch (deleteError) {
        setError(
          friendlyError(deleteError, 'تعذر حذف الكلمة.'),
        );
      } finally {
        setBusyId(null);
      }
    },
    [database, queryClient],
  );

  const openWord = useCallback(
    async (word: SavedWord) => {
      setOpeningId(word.id);
      setError(null);
      try {
        const page = await quranContentProvider.getPageNumberForAyah(word.surahNumber, word.ayahNumber);
        router.push({ pathname: '/reader', params: { pageNumber: String(page) } });
      } catch (openError) {
        setError(
          friendlyError(openError, 'تعذر فتح موضع الكلمة.'),
        );
      } finally {
        setOpeningId(null);
      }
    },
    [],
  );

  const words = savedWordsQuery.data ?? [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextGroup}>
                <Text style={[styles.title, { color: colors.text }]}>الكلمات المحفوظة</Text>
                <Text style={[styles.caption, { color: colors.textSecondary }]}>
                  {savedWordsQuery.isPending
                    ? 'جارٍ التحميل…'
                    : `${toArabicNumbers(words.length)} كلمة محفوظة`}
                </Text>
              </View>
              <Link href="/" replace asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="رجوع"
                  style={StyleSheet.flatten([
                    styles.iconButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ])}>
                  <Ionicons name="arrow-forward" size={20} color={colors.text} />
                </Pressable>
              </Link>
            </View>

            {savedWordsQuery.error && (
              <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                  {friendlyError(savedWordsQuery.error, 'تعذر تحميل الكلمات المحفوظة.')}
                </Text>
                <Pressable accessibilityRole="button" onPress={() => void savedWordsQuery.refetch()}>
                  <Text style={[styles.retryText, { color: colors.primary }]}>إعادة المحاولة</Text>
                </Pressable>
              </View>
            )}

            {error && (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`فتح ${item.wordText}`}
              disabled={openingId !== null || busyId !== null}
              onPress={() => void openWord(item)}
              style={({ pressed }) => [styles.wordPressable, pressed && { opacity: 0.72 }]}>
              <Text style={[styles.wordText, { color: colors.text }]}>{item.wordText}</Text>
              <Text style={[styles.wordRef, { color: colors.textSecondary }]}>
                سورة {surahNames.get(item.surahNumber) ?? toArabicNumbers(item.surahNumber)} · الآية{' '}
                {toArabicNumbers(item.ayahNumber)}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="حذف الكلمة"
              disabled={busyId !== null}
              onPress={() =>
                confirmDelete('حذف الكلمة؟', 'سيتم حذف هذه الكلمة من المحفوظات.', () => void removeWord(item))
              }
              style={[styles.deleteButton, { backgroundColor: colors.backgroundSelected }]}>
              {busyId === item.id ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#B24C4C" />
              )}
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          !savedWordsQuery.isPending && !savedWordsQuery.error ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Ionicons name="bookmark-outline" size={34} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد كلمات محفوظة بعد</Text>
              <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
                اضغط مطولًا على أي كلمة في المصحف ثم اختر «حفظ» لتظهر هنا.
              </Text>
            </View>
          ) : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  headerTextGroup: {
    gap: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: 13,
    textAlign: 'right',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
  errorText: {
    color: '#B42318',
    fontSize: 13,
    textAlign: 'right',
  },
  wordCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: 18,
  },
  wordPressable: {
    flex: 1,
    gap: 4,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  wordText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
  },
  wordRef: {
    fontSize: 12,
    textAlign: 'right',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
});
