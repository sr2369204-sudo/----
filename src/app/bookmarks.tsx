import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Bookmark } from '@/features/annotations/types';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { useTheme } from '@/hooks/use-theme';

export default function BookmarksScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);

  const bookmarksQuery = useQuery({
    queryKey: ['annotations', 'bookmarks'],
    queryFn: () => new SqliteAnnotationRepository(database).listBookmarks(),
    staleTime: 0,
  });

  const directoryQuery = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const surahNames = useMemo(
    () => new Map((directoryQuery.data?.surahs ?? []).map((surah) => [
      surah.surahNumber,
      surah.nameArabic,
    ])),
    [directoryQuery.data],
  );

  const openBookmark = useCallback(async (bookmark: Bookmark) => {
    setBusyId(bookmark.id);
    setError(null);
    try {
      const page = await quranCache.getPageNumberForAyah(
        bookmark.surahNumber,
        bookmark.ayahNumber,
      );
      router.push({ pathname: '/reader', params: { pageNumber: String(page) } });
    } catch (openError) {
      setError(
        openError instanceof Error
          ? `تعذر فتح موضع الآية: ${openError.message}`
          : 'تعذر فتح موضع الآية.',
      );
    } finally {
      setBusyId(null);
    }
  }, [quranCache]);

  const removeBookmark = useCallback(async (bookmark: Bookmark) => {
    setBusyId(bookmark.id);
    setError(null);
    try {
      await new SqliteAnnotationRepository(database).deleteBookmark(
        bookmark.surahNumber,
        bookmark.ayahNumber,
      );
      await queryClient.invalidateQueries({ queryKey: ['annotations', 'bookmarks'] });
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? `تعذر حذف العلامة: ${deleteError.message}`
          : 'تعذر حذف العلامة المرجعية.',
      );
    } finally {
      setBusyId(null);
    }
  }, [database, queryClient]);

  const bookmarks = bookmarksQuery.data ?? [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextGroup}>
                <Text style={[styles.title, { color: colors.text }]}>الإشارات المرجعية</Text>
                <Text style={[styles.caption, { color: colors.textSecondary }]}>
                  {bookmarksQuery.isPending
                    ? 'جارٍ التحميل…'
                    : `${toArabicNumbers(bookmarks.length)} آية محفوظة`}
                </Text>
              </View>
              <Link href="/" replace asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="العودة للرئيسية"
                  style={StyleSheet.flatten([
                    styles.iconButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ])}>
                  <Ionicons name="arrow-forward" size={20} color={colors.text} />
                </Pressable>
              </Link>
            </View>

            {bookmarksQuery.isPending && (
              <View style={styles.status}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.caption, { color: colors.textSecondary }]}>جارٍ تحميل الآيات…</Text>
              </View>
            )}

            {bookmarksQuery.error && (
              <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                  تعذر تحميل الإشارات المرجعية.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void bookmarksQuery.refetch()}>
                  <Text style={[styles.retryText, { color: colors.primary }]}>إعادة المحاولة</Text>
                </Pressable>
              </View>
            )}

            {error && <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>}
          </View>
        }
        renderItem={({ item }) => {
          const surahName = surahNames.get(item.surahNumber);
          const label = `سورة ${surahName ?? toArabicNumbers(item.surahNumber)}، الآية ${toArabicNumbers(item.ayahNumber)}`;
          return (
            <View style={[styles.bookmarkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`فتح ${label}`}
                disabled={busyId !== null}
                onPress={() => void openBookmark(item)}
                style={({ pressed }) => [styles.bookmarkPressable, pressed && { opacity: 0.72 }]}>
                <Ionicons name="bookmark" size={20} color={colors.primary} />
                <Text style={[styles.reference, { color: colors.text }]}>{label}</Text>
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`حذف ${label} من الإشارات المرجعية`}
                disabled={busyId !== null}
                onPress={() => void removeBookmark(item)}
                style={[styles.deleteButton, { backgroundColor: colors.backgroundSelected }]}>
                {busyId === item.id ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#B24C4C" />
                )}
              </Pressable>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !bookmarksQuery.isPending && !bookmarksQuery.error ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Ionicons name="bookmark-outline" size={34} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد آيات محفوظة بعد</Text>
              <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
                اختر آية من المصحف ثم اضغط على علامة الإشارة المرجعية لحفظها هنا.
              </Text>
            </View>
          ) : undefined
        }
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
    alignItems: 'flex-end',
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
  status: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  notice: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'flex-end',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    textAlign: 'right',
  },
  bookmarkCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: 18,
  },
  bookmarkPressable: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
  },
  reference: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
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
