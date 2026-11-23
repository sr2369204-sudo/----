import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { HEART_CELLS } from '@/features/memorization/data/heart-cells';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import { useTheme } from '@/hooks/use-theme';

/** Every juz of the Mushaf, in reading order. */
const JUZ_NUMBERS = Array.from({ length: 30 }, (_, index) => index + 1);

/** The surah list comes straight from the map's own cells, so it needs no fetch. */
const SURAHS = HEART_CELLS.map((cell) => ({
  surahNumber: cell.surahNumber,
  surahName: cell.surahName,
}));

const TABS = [
  { key: 'surahs', label: 'سور' },
  { key: 'ajza', label: 'أجزاء' },
] as const;

type SelectionTab = (typeof TABS)[number]['key'];

type HeartSelectionSheetProps = {
  visible: boolean;
  /** Surah numbers currently gathered in the batch. */
  selected: ReadonlySet<number>;
  /** Adds or removes a single surah from the batch. */
  onToggleSurah: (surahNumber: number) => void;
  /** Adds every surah of a juz to the batch. */
  onSelectJuz: (surahNumbers: number[]) => void;
  /** Applies the batch: `true` marks memorized, `false` clears it. */
  onApply: (value: boolean) => void;
  onClose: () => void;
};

/**
 * Builds a batch for the heart map from a list instead of from the tiles: the
 * reader either picks one surah or a whole juz, and every pick is added to the
 * same selection the map taps write to.
 */
export function HeartSelectionSheet({
  visible,
  selected,
  onToggleSurah,
  onSelectJuz,
  onApply,
  onClose,
}: HeartSelectionSheetProps) {
  const colors = useTheme();
  const [tab, setTab] = useState<SelectionTab>('surahs');
  const [query, setQuery] = useState('');
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);
  const [juzError, setJuzError] = useState<string | null>(null);

  const filteredSurahs = useMemo(() => {
    const normalized = normalizeSurahSearch(query);
    if (normalized.length === 0) {
      return SURAHS;
    }
    return SURAHS.filter((surah) =>
      normalizeSurahSearch(surah.surahName).includes(normalized) ||
      String(surah.surahNumber).includes(normalized));
  }, [query]);

  const handleSelectTab = useCallback((next: SelectionTab) => {
    setTab(next);
    setJuzError(null);
  }, []);

  const handleJuzPress = useCallback(async (juzNumber: number) => {
    setLoadingJuz(juzNumber);
    setJuzError(null);
    try {
      const verseKeys = await quranContentProvider.getVerseKeysForJuz(juzNumber);
      const surahNumbers = [...new Set(verseKeys.map((key) => Number(key.split(':')[0])))]
        .filter((number) => Number.isInteger(number) && number >= 1 && number <= 114)
        .sort((a, b) => a - b);
      if (surahNumbers.length === 0) {
        setJuzError('تعذّر قراءة سور هذا الجزء. حاول مرة أخرى.');
        return;
      }
      onSelectJuz(surahNumbers);
    } catch (error) {
      console.error('تعذّر جلب سور الجزء.', error);
      setJuzError('تعذّر جلب سور هذا الجزء. تحقّق من اتصالك وحاول مرة أخرى.');
    } finally {
      setLoadingJuz(null);
    }
  }, [onSelectJuz]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.text }]}>اختيار من قائمة</Text>
              <Text style={[styles.caption, { color: colors.textSecondary }]}>
                اختر جزءًا كاملًا أو سورة واحدة، وتُضاف إلى التحديد
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={onClose}
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.tabs, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {TABS.map((item) => {
              const active = item.key === tab;
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => handleSelectTab(item.key)}
                  style={[
                    styles.tab,
                    active && { backgroundColor: colors.primary },
                  ]}>
                  <Text
                    style={[
                      styles.tabText,
                      { color: active ? colors.onPrimary : colors.textSecondary },
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'surahs' ? (
            <>
              <View style={[styles.search, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="search" size={16} color={colors.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="ابحث باسم السورة أو رقمها"
                  placeholderTextColor={colors.textSecondary}
                  textAlign="right"
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {query.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="مسح البحث"
                    hitSlop={8}
                    onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>

              <FlatList
                data={filteredSurahs}
                keyExtractor={(item) => String(item.surahNumber)}
                keyboardShouldPersistTaps="handled"
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={[styles.empty, { color: colors.textSecondary }]}>
                    لا توجد سورة مطابقة للبحث.
                  </Text>
                }
                renderItem={({ item }) => {
                  const active = selected.has(item.surahNumber);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`سورة ${item.surahName}`}
                      accessibilityState={{ selected: active }}
                      onPress={() => onToggleSurah(item.surahNumber)}
                      style={({ pressed }) => [
                        styles.row,
                        { borderColor: colors.border },
                        active && { backgroundColor: colors.backgroundSelected, borderColor: colors.primary },
                        pressed && styles.pressed,
                      ]}>
                      <View
                        style={[
                          styles.rowBadge,
                          {
                            backgroundColor: active ? colors.primary : colors.background,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.rowBadgeText,
                            { color: active ? colors.onPrimary : colors.textSecondary },
                          ]}>
                          {toArabicNumbers(item.surahNumber)}
                        </Text>
                      </View>
                      <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>
                        {item.surahName}
                      </Text>
                      <Ionicons
                        name={active ? 'checkmark-circle' : 'ellipse-outline'}
                        size={19}
                        color={active ? colors.primary : colors.border}
                      />
                    </Pressable>
                  );
                }}
              />
            </>
          ) : (
            <>
              {juzError && (
                <View style={[styles.notice, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="alert-circle-outline" size={15} color={colors.primary} />
                  <Text style={[styles.noticeText, { color: colors.textSecondary }]}>{juzError}</Text>
                </View>
              )}

              <FlatList
                data={JUZ_NUMBERS}
                keyExtractor={(item) => String(item)}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`الجزء ${toArabicNumbers(item)}`}
                    disabled={loadingJuz !== null}
                    onPress={() => void handleJuzPress(item)}
                    style={({ pressed }) => [
                      styles.row,
                      { borderColor: colors.border },
                      pressed && styles.pressed,
                    ]}>
                    <View style={[styles.rowBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.rowBadgeText, { color: colors.textSecondary }]}>
                        {toArabicNumbers(item)}
                      </Text>
                    </View>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>
                      {`الجزء ${toArabicNumbers(item)}`}
                    </Text>
                    {loadingJuz === item ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={19} color={colors.primary} />
                    )}
                  </Pressable>
                )}
              />
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.count, { color: colors.textSecondary }]}>
              {`محدد ${toArabicNumbers(selected.size)} سورة`}
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="تعليم السور المحددة محفوظة"
                accessibilityState={{ disabled: selected.size === 0 }}
                disabled={selected.size === 0}
                onPress={() => onApply(true)}
                style={({ pressed }) => [
                  styles.action,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                  selected.size === 0 && styles.disabled,
                  pressed && styles.pressed,
                ]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.onPrimary} />
                <Text style={[styles.actionText, { color: colors.onPrimary }]}>تعليم محفوظة</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إلغاء حفظ السور المحددة"
                accessibilityState={{ disabled: selected.size === 0 }}
                disabled={selected.size === 0}
                onPress={() => onApply(false)}
                style={({ pressed }) => [
                  styles.action,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  selected.size === 0 && styles.disabled,
                  pressed && styles.pressed,
                ]}>
                <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>إلغاء الحفظ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    height: '85%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: -Spacing.one,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  heading: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: TypeScale.title,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row-reverse',
    padding: 3,
    borderWidth: 1,
    borderRadius: Radius.pill,
    gap: 3,
  },
  tab: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  tabText: {
    fontSize: TypeScale.label,
    fontWeight: '800',
  },
  search: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    height: 42,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  searchInput: {
    flex: 1,
    fontSize: TypeScale.body,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    height: 48,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  rowBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  rowBadgeText: {
    fontSize: TypeScale.micro,
    fontWeight: '900',
  },
  rowLabel: {
    flex: 1,
    fontSize: TypeScale.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  empty: {
    paddingVertical: Spacing.five,
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  noticeText: {
    flex: 1,
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  footer: {
    gap: Spacing.two,
  },
  count: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 42,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  actionText: {
    fontSize: TypeScale.label,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.84,
  },
});
