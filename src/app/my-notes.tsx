import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import { toArabicNumbers } from '@/features/settings/utils/format';
import { useTheme } from '@/hooks/use-theme';

type Entry = {
  id: string;
  kind: 'note' | 'highlight';
  surahNumber: number;
  ayahNumber: number;
  text: string;
  color?: string;
  date: string;
};

/** One place for every written note and highlight, newest first, with search. */
export default function MyNotesScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const [search, setSearch] = useState('');
  const [openError, setOpenError] = useState<string | null>(null);
  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);

  const entriesQuery = useQuery({
    queryKey: ['annotations', 'my-notes'],
    staleTime: 0,
    queryFn: async (): Promise<Entry[]> => {
      const repository = new SqliteAnnotationRepository(database);
      const [notes, highlights] = await Promise.all([
        repository.listAllNotes(),
        repository.listAllHighlights(),
      ]);
      const entries: Entry[] = [
        ...notes.map((note): Entry => ({
          id: `n-${note.id}`,
          kind: 'note',
          surahNumber: note.target.surahNumber,
          ayahNumber: note.target.ayahNumber,
          text: note.body,
          date: note.updatedAt,
        })),
        ...highlights.map((highlight): Entry => ({
          id: `h-${highlight.id}`,
          kind: 'highlight',
          surahNumber: highlight.target.surahNumber,
          ayahNumber: highlight.target.ayahNumber,
          text: '',
          color: highlight.color,
          date: highlight.updatedAt,
        })),
      ];
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    },
  });

  const directoryQuery = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const surahNames = useMemo(
    () => new Map((directoryQuery.data?.surahs ?? []).map((surah) => [surah.surahNumber, surah.nameArabic])),
    [directoryQuery.data],
  );

  const entries = useMemo(() => {
    const all = entriesQuery.data ?? [];
    const query = normalizeSurahSearch(search);
    if (query.length === 0) {
      return all;
    }
    return all.filter((entry) =>
      normalizeSurahSearch(`${entry.text} ${surahNames.get(entry.surahNumber) ?? ''}`).includes(query),
    );
  }, [entriesQuery.data, search, surahNames]);

  async function openEntry(entry: Entry): Promise<void> {
    setOpenError(null);
    try {
      const page = await quranCache.getPageNumberForAyah(entry.surahNumber, entry.ayahNumber);
      router.push({ pathname: '/reader', params: { pageNumber: String(page) } });
    } catch {
      setOpenError('تعذر فتح موضع الآية.');
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>ملاحظاتي</Text>
                <Text style={[styles.caption, { color: colors.textSecondary }]}>
                  {entriesQuery.isPending
                    ? 'جارٍ التحميل…'
                    : `${toArabicNumbers(entries.length)} عنصر من ملاحظاتك وتمييزاتك`}
                </Text>
              </View>
              <Link href="/" replace asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="العودة للرئيسية"
                  style={[styles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="arrow-forward" size={20} color={colors.text} />
                </Pressable>
              </Link>
            </View>
            <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={16} color={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="ابحث في ملاحظاتك أو باسم السورة"
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            {entriesQuery.isPending && <ActivityIndicator size="small" color={colors.primary} />}
            {entriesQuery.error && (
              <Pressable accessibilityRole="button" onPress={() => void entriesQuery.refetch()}>
                <Text style={[styles.caption, { color: colors.primary }]}>
                  تعذر تحميل الملاحظات. اضغط لإعادة المحاولة.
                </Text>
              </Pressable>
            )}
            {openError && <Text style={[styles.caption, { color: colors.primary }]}>{openError}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => void openEntry(item)}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.marker,
                { backgroundColor: item.kind === 'highlight' ? (item.color ?? colors.accent) : colors.backgroundSelected },
              ]}>
              <Ionicons
                name={item.kind === 'note' ? 'document-text-outline' : 'color-fill-outline'}
                size={16}
                color={item.kind === 'note' ? colors.primary : '#1B1B1B'}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {`${surahNames.get(item.surahNumber) ?? `سورة ${toArabicNumbers(item.surahNumber)}`} · الآية ${toArabicNumbers(item.ayahNumber)}`}
              </Text>
              <Text style={[styles.caption, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.kind === 'note' ? item.text : 'تمييز'}
              </Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          !entriesQuery.isPending && !entriesQuery.error ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              لا توجد ملاحظات أو تمييزات بعد. حدّد آية في المصحف لتضيف ملاحظة أو تمييزاً.
            </Text>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  list: { padding: Spacing.three, paddingBottom: Spacing.five ?? 48 },
  header: { gap: 12, marginBottom: 12 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'right' },
  caption: { fontSize: 13, lineHeight: 21, textAlign: 'right' },
  back: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 14, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, padding: 12 },
  marker: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  separator: { height: 8 },
  empty: { fontSize: 14, lineHeight: 23, textAlign: 'right', paddingTop: 24 },
});
