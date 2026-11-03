import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { AnnotationTarget, Highlight, Note } from '@/features/annotations/types';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import type { AyahSearchResult } from '@/features/quran/types';
import {
  useReaderSelectionStore,
  type ReaderSelection,
} from '@/features/reader/state/selection-store';
import type { ElementRect } from '@/features/reader/components/MushafPageViewer';
import { useTheme } from '@/hooks/use-theme';

const HIGHLIGHT_COLORS = [
  '#FFD54F',
  '#AED581',
  '#4FC3F7',
  '#F48FB1',
  '#CE93D8',
  '#80CBC4',
  '#FFB74D',
  '#EF9A9A',
];

const BUTTON_SIZE = 46;
const CLOSE_SIZE = 30;
const RING_MARGIN = 8;
const LABEL_GAP = 8;

type Panel = 'toolbar' | 'notes' | 'meaning' | 'tafsir' | 'search' | 'highlight';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  surahName: string;
  anchorRect: ElementRect | null;
  /** Height of the reader navbar, which the ring has to stay clear of. */
  navbarHeight: number;
  isBookmarked: boolean;
  isWordSaved: boolean;
  isAudioPlaying: boolean;
  onHighlightsChanged: () => void;
  onToggleBookmark: (surahNumber: number, ayahNumber: number) => void;
  onToggleSaveWord: (
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    wordText: string,
  ) => void;
  onPlayAudio: (selection: ReaderSelection) => Promise<void>;
  onStopAudio: () => void;
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
};

export function SelectionToolbar(props: Props) {
  const selection = useReaderSelectionStore((state) => state.selection);
  if (!selection) {
    return null;
  }
  const selectionKey =
    selection.type === 'word'
      ? `word:${selection.surahNumber}:${selection.ayah.ayahNumber}:${selection.word.id}`
      : selection.type === 'range'
        ? `range:${selection.surahNumber}:${selection.startAyah}:${selection.endAyah}`
        : `ayah:${selection.surahNumber}:${selection.ayah.ayahNumber}`;

  return <Toolbar key={selectionKey} {...props} selection={selection} />;
}

function Toolbar({
  selection,
  surahName,
  anchorRect,
  navbarHeight,
  isBookmarked,
  isWordSaved,
  isAudioPlaying,
  onHighlightsChanged,
  onToggleBookmark,
  onToggleSaveWord,
  onPlayAudio,
  onStopAudio,
  onOpenAyah,
}: Props & { selection: ReaderSelection }) {
  const database = useSQLiteContext();
  const palette = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const clearSelection = useReaderSelectionStore((state) => state.clearSelection);
  const selectAyah = useReaderSelectionStore((state) => state.selectAyah);
  const repository = useMemo(() => new SqliteAnnotationRepository(database), [database]);

  const [panel, setPanel] = useState<Panel>('toolbar');
  const [highlightColors, setHighlightColors] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteBody, setNoteBody] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [animation] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    }).start();
  }, [animation]);

  const isWord = selection.type === 'word';
  const isRange = selection.type === 'range';
  // A range covers several ayahs at once, so it has no single target to
  // annotate: the annotation panels are only offered for one word or one ayah.
  const target = useMemo<AnnotationTarget | null>(() => {
    if (selection.type === 'range') {
      return null;
    }
    if (selection.type === 'word') {
      return {
        type: 'word',
        surahNumber: selection.surahNumber,
        ayahNumber: selection.ayah.ayahNumber,
        wordId: selection.word.id,
      };
    }
    return {
      type: 'ayah',
      surahNumber: selection.surahNumber,
      ayahNumber: selection.ayah.ayahNumber,
    };
  }, [selection]);

  useEffect(() => {
    if (!target) {
      // A range has no single annotation target. The toolbar is remounted per
      // selection key, so its panels already start empty — nothing to reset.
      return;
    }
    let active = true;
    Promise.all([
      repository.listHighlightsForTarget(target),
      repository.listNotesForTarget(target),
    ])
      .then(([savedHighlights, savedNotes]) => {
        if (active) {
          setHighlightColors(savedHighlights);
          setNotes(savedNotes);
        }
      })
      .catch(() => {
        /* non-fatal: the panel simply shows no saved items */
      });
    return () => {
      active = false;
    };
  }, [repository, target]);

  const rangeAyahs = selection.type === 'range' ? selection.ayahs : null;
  const startAyah = selection.type === 'range' ? selection.startAyah : selection.ayah.ayahNumber;
  const endAyah = selection.type === 'range' ? selection.endAyah : selection.ayah.ayahNumber;

  const selectedText = selection.type === 'word'
    ? selection.word.textUthmani
    : selection.type === 'ayah'
      ? selection.ayah.words.map((word) => word.textUthmani).join(' ')
      : (rangeAyahs ?? []).map((ayah) => ayah.words.map((word) => word.textUthmani).join(' ')).join(' ');
  const reference =
    startAyah === endAyah
      ? `${surahName} · الآية ${toArabicNumbers(startAyah)}`
      : `${surahName} · الآيات ${toArabicNumbers(startAyah)}–${toArabicNumbers(endAyah)}`;
  const wordMeaning = selection.type === 'word' ? selection.word.translationText : null;
  const searchQuery = selection.type === 'word'
    ? selection.word.textUthmani
    : selection.type === 'ayah'
      ? selection.ayah.words.slice(0, 3).map((word) => word.textUthmani).join(' ')
      : (rangeAyahs ?? [])
          .slice(0, 2)
          .flatMap((ayah) => ayah.words.slice(0, 2))
          .map((word) => word.textUthmani)
          .join(' ');

  const activeColor = highlightColors[0]?.color ?? null;

  async function refreshSavedItems(): Promise<void> {
    if (!target) {
      return;
    }
    const [savedHighlights, savedNotes] = await Promise.all([
      repository.listHighlightsForTarget(target),
      repository.listNotesForTarget(target),
    ]);
    setHighlightColors(savedHighlights);
    setNotes(savedNotes);
  }

  async function saveHighlight(color: string): Promise<void> {
    if (!target) {
      return;
    }
    const trimmed = color.trim().toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(trimmed)) {
      setError('أدخل رمز لون صحيح بالصيغة #RRGGBB');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await repository.createHighlight({ target, color: trimmed, opacity: isWord ? 0.78 : 0.52 });
      onHighlightsChanged();
      setPanel('toolbar');
      clearSelection();
    } catch (saveError) {
      setError(saveError instanceof Error ? `تعذر حفظ التمييز: ${saveError.message}` : 'تعذر حفظ التمييز.');
    } finally {
      setBusy(false);
    }
  }

  async function removeHighlight(id: string): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await repository.deleteHighlight(id);
      onHighlightsChanged();
      setPanel('toolbar');
      clearSelection();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? `تعذر حذف التمييز: ${deleteError.message}` : 'تعذر حذف التمييز.');
    } finally {
      setBusy(false);
    }
  }

  async function saveNote(): Promise<void> {
    if (!target) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await repository.createNote({ target, body: noteBody });
      setNoteBody('');
      await refreshSavedItems();
      setMessage('تم حفظ الملاحظة.');
    } catch (saveError) {
      setError(saveError instanceof Error ? `تعذر حفظ الملاحظة: ${saveError.message}` : 'تعذر حفظ الملاحظة.');
    } finally {
      setBusy(false);
    }
  }

  async function removeNote(id: string): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await repository.deleteNote(id);
      await refreshSavedItems();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? `تعذر حذف الملاحظة: ${deleteError.message}` : 'تعذر حذف الملاحظة.');
    } finally {
      setBusy(false);
    }
  }

  async function copySelectedText(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await Clipboard.setStringAsync(`${selectedText}\n${reference}`);
      setMessage('تم نسخ النص والمرجع.');
    } catch (copyError) {
      setError(copyError instanceof Error ? `تعذر نسخ النص: ${copyError.message}` : 'تعذر نسخ النص.');
    } finally {
      setBusy(false);
    }
  }

  async function shareSelectedText(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await Share.share({ message: `${selectedText}\n${reference}` });
      clearSelection();
    } catch (shareError) {
      setError(shareError instanceof Error ? `تعذرت المشاركة: ${shareError.message}` : 'تعذرت المشاركة.');
    } finally {
      setBusy(false);
    }
  }

  async function playAudio(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await onPlayAudio(selection);
    } catch (playError) {
      setError(playError instanceof Error ? `تعذر تشغيل التلاوة: ${playError.message}` : 'تعذر تشغيل التلاوة.');
    } finally {
      setBusy(false);
    }
  }

  function saveWordOrAyah(): void {
    setError(null);
    if (selection.type === 'range') {
      for (let ayahNumber = selection.startAyah; ayahNumber <= selection.endAyah; ayahNumber += 1) {
        onToggleBookmark(selection.surahNumber, ayahNumber);
      }
      setMessage(isBookmarked ? 'تمت إزالة حفظ الآيات.' : 'تم حفظ الآيات.');
      return;
    }
    if (selection.type === 'word') {
      onToggleSaveWord(
        selection.surahNumber,
        selection.ayah.ayahNumber,
        selection.word.id,
        selection.word.textUthmani,
      );
      setMessage(isWordSaved ? 'تمت إزالة الكلمة من المحفوظات.' : 'تم حفظ الكلمة.');
      return;
    }
    onToggleBookmark(selection.surahNumber, selection.ayah.ayahNumber);
    setMessage(isBookmarked ? 'تمت إزالة حفظ الآية.' : 'تم حفظ الآية.');
  }

  type Action = {
    key: string;
    icon: IconName;
    label: string;
    active?: boolean;
    onPress: () => void;
  };

  const actions: Action[] = [
    {
      key: 'play',
      icon: isAudioPlaying ? 'stop' : 'play',
      label: isAudioPlaying ? 'إيقاف' : 'استماع',
      active: isAudioPlaying,
      onPress: () => (isAudioPlaying ? onStopAudio() : void playAudio()),
    },
  ];

  if (isWord) {
    actions.push({
      key: 'meaning',
      icon: 'information-circle-outline',
      label: 'معنى الكلمة',
      onPress: () => {
        setError(null);
        setMessage(null);
        setPanel('meaning');
      },
    });
  }

  // A range has no single target, so the panels that annotate one target are
  // not offered for it: playback, saving the run and sharing are.
  if (!isRange) {
    actions.push(
      {
        key: 'tafsir',
        icon: 'reader-outline',
        label: 'تفسير الآية',
        onPress: () => {
          setError(null);
          setMessage(null);
          setPanel('tafsir');
        },
      },
      {
        key: 'highlight',
        icon: 'color-palette-outline',
        label: 'تمييز',
        active: activeColor !== null,
        onPress: () => {
          setError(null);
          setMessage(null);
          setPanel('highlight');
        },
      },
      {
        key: 'note',
        icon: 'create-outline',
        label: 'ملاحظة',
        active: notes.length > 0,
        onPress: () => {
          setError(null);
          setMessage(null);
          setPanel('notes');
        },
      },
    );
  }

  actions.push({
    key: 'save',
    icon: isWord
      ? isWordSaved
        ? 'bookmark'
        : 'bookmark-outline'
      : isBookmarked
        ? 'bookmark'
        : 'bookmark-outline',
    label: isWord
      ? isWordSaved
        ? 'إزالة الحفظ'
        : 'حفظ الكلمة'
      : isBookmarked
        ? 'إزالة الحفظ'
        : isRange
          ? 'حفظ الآيات'
          : 'حفظ الآية',
    active: isWord ? isWordSaved : isBookmarked,
    onPress: saveWordOrAyah,
  });

  if (!isRange) {
    actions.push({
      key: 'search',
      icon: 'search',
      label: 'بحث في المصحف',
      onPress: () => {
        setError(null);
        setMessage(null);
        setPanel('search');
      },
    });
  }

  actions.push(
    {
      key: 'copy',
      icon: 'copy-outline',
      label: 'نسخ',
      onPress: () => void copySelectedText(),
    },
    {
      key: 'share',
      icon: 'share-social-outline',
      label: 'مشاركة',
      onPress: () => void shareSelectedText(),
    },
  );

  if (isWord) {
    actions.push({
      key: 'ayah',
      icon: 'expand-outline',
      label: 'الآية كاملة',
      onPress: () => selectAyah(selection.surahNumber, selection.ayah, 'full'),
    });
  }

  const layout = computeRingLayout({
    anchorRect,
    count: actions.length,
    windowWidth,
    windowHeight,
    // The navbar is revealed together with the ring, so the ring has to start
    // below it: the safe-area inset alone leaves the ring under the navbar.
    insetTop: insets.top + navbarHeight,
    insetBottom: insets.bottom,
    // The rect comes from inside the page view, whose origin sits at the
    // border edge of the reader screen; this overlay is also positioned from
    // the border edge, so no offsets are needed to align them.
    offsetX: 0,
    offsetY: 0,
  });

  const panelTitle =
    panel === 'notes'
      ? 'ملاحظاتي'
      : panel === 'meaning'
        ? 'معنى الكلمة'
        : panel === 'tafsir'
          ? `تفسير الآية ${toArabicNumbers(startAyah)}`
          : panel === 'highlight'
            ? 'تمييز النص'
            : 'نتائج البحث';

  return (
    <>
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق شريط الإجراءات"
          // Stops at the navbar: the controls that were just revealed with the
          // ring have to stay reachable, so this dismiss layer must not cover
          // them.
          style={[StyleSheet.absoluteFill, { top: insets.top + navbarHeight }]}
          onPress={clearSelection}
        />

        <Animated.View
          style={[styles.ring, { opacity: animation }]}
          pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إغلاق"
            onPress={clearSelection}
            style={[
              styles.closeButton,
              {
                left: layout.close.left,
                top: layout.close.top,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <Ionicons name="close" size={17} color={palette.text} />
          </Pressable>

          {actions.map((action, index) => {
            const point = layout.points[index];
            return (
              <Animated.View
                key={action.key}
                style={[
                  styles.iconWrap,
                  {
                    left: point.left,
                    top: point.top,
                    transform: [
                      {
                        scale: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.6, 1],
                        }),
                      },
                    ],
                  },
                ]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityState={{ selected: action.active === true }}
                  disabled={busy}
                  hitSlop={6}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      backgroundColor: action.active ? palette.primary : palette.surface,
                      borderColor: action.active ? palette.primary : palette.border,
                    },
                    busy && styles.disabled,
                    pressed && !busy && styles.pressed,
                  ]}>
                  <Ionicons
                    name={action.icon}
                    size={21}
                    color={action.active ? palette.background : palette.text}
                  />
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>

        {(message || error) && (
          <View
            style={[
              styles.toast,
              {
                top: layout.toastTop,
                backgroundColor: error ? '#B42318' : palette.primary,
              },
            ]}>
            <Text style={[styles.toastText, { color: palette.background }]} numberOfLines={2}>
              {error ?? message}
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={panel !== 'toolbar'}
        transparent
        animationType="fade"
        onRequestClose={() => setPanel('toolbar')}>
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إغلاق اللوحة"
            style={styles.modalBackdrop}
            onPress={() => setPanel('toolbar')}
          />
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                maxHeight: Math.max(280, windowHeight - insets.top - insets.bottom - 48),
              },
            ]}>
            <View style={styles.dialogHeader}>
              <View style={styles.headerTextGroup}>
                <Text style={[styles.dialogTitle, { color: palette.text }]} numberOfLines={1}>
                  {panelTitle}
                </Text>
                <Text style={[styles.headerRef, { color: palette.textSecondary }]} numberOfLines={1}>
                  {reference}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="رجوع إلى الإجراءات"
                onPress={() => setPanel('toolbar')}
                style={[styles.closeBtn, { backgroundColor: palette.backgroundSelected }]}>
                <Ionicons name="close" size={15} color={palette.text} />
              </Pressable>
            </View>

            {panel === 'meaning' && (
              <ScrollView contentContainerStyle={styles.dialogBody}>
                <View style={[styles.wordCard, { backgroundColor: palette.background, borderColor: palette.border }]}>
                  <Text style={[styles.wordCardText, { color: palette.text }]}>
                    {isWord ? selection.word.textUthmani : ''}
                  </Text>
                </View>
                {wordMeaning ? (
                  <Text style={[styles.bodyText, { color: palette.text }]}>{wordMeaning}</Text>
                ) : (
                  <Text style={[styles.hintText, { color: palette.textSecondary }]}>
                    لا يتوفر معنى لهذه الكلمة من المصدر.
                  </Text>
                )}
              </ScrollView>
            )}

            {panel === 'highlight' && (
              <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
                <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>اختر لونًا</Text>
                <View style={styles.swatchRow}>
                  {HIGHLIGHT_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      accessibilityRole="button"
                      accessibilityLabel="تمييز بهذا اللون"
                      disabled={busy}
                      onPress={() => void saveHighlight(color)}
                      style={[
                        styles.swatch,
                        { backgroundColor: color },
                        activeColor === color && styles.swatchActive,
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.customRow}>
                  <TextInput
                    accessibilityLabel="رمز لون مخصص"
                    value={customColor}
                    onChangeText={setCustomColor}
                    placeholder="#RRGGBB"
                    placeholderTextColor={palette.textSecondary}
                    maxLength={7}
                    autoCapitalize="none"
                    style={[
                      styles.hexInput,
                      { color: palette.text, borderColor: palette.border, backgroundColor: palette.background },
                    ]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="تطبيق اللون المخصص"
                    disabled={busy || !/^#[0-9a-fA-F]{6}$/.test(customColor)}
                    onPress={() => void saveHighlight(customColor)}
                    style={[
                      styles.customApply,
                      {
                        backgroundColor: /^#[0-9a-fA-F]{6}$/.test(customColor)
                          ? customColor
                          : palette.backgroundSelected,
                      },
                      !/^#[0-9a-fA-F]{6}$/.test(customColor) && styles.disabled,
                    ]}>
                    <Ionicons name="checkmark" size={15} color={palette.background} />
                  </Pressable>
                </View>
                {highlightColors.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="حذف التمييز"
                    disabled={busy}
                    onPress={() => void removeHighlight(highlightColors[0].id)}
                    style={styles.deleteChip}>
                    <Text style={styles.deleteChipText}>إزالة التمييز</Text>
                  </Pressable>
                )}
                {error && <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>}
              </ScrollView>
            )}

            {panel === 'tafsir' && (
              <TafsirPanel
                surahNumber={selection.surahNumber}
                ayahNumber={startAyah}
                palette={palette}
              />
            )}

            {panel === 'search' && (
              <SearchPanel
                query={searchQuery}
                palette={palette}
                onOpenAyah={(surahNumber, ayahNumber) => {
                  setPanel('toolbar');
                  onOpenAyah(surahNumber, ayahNumber);
                }}
              />
            )}

            {panel === 'notes' && (
              <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
                <TextInput
                  accessibilityLabel="نص الملاحظة"
                  multiline
                  maxLength={4000}
                  value={noteBody}
                  onChangeText={setNoteBody}
                  placeholder="اكتب ملاحظة خاصة بك…"
                  placeholderTextColor={palette.textSecondary}
                  textAlign="right"
                  style={[
                    styles.noteInput,
                    { color: palette.text, backgroundColor: palette.background, borderColor: palette.border },
                  ]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={busy || noteBody.trim().length === 0}
                  onPress={() => void saveNote()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { backgroundColor: palette.primary },
                    (busy || noteBody.trim().length === 0) && styles.disabled,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.primaryButtonText, { color: palette.background }]}>
                    {busy ? 'جارٍ الحفظ…' : 'حفظ الملاحظة'}
                  </Text>
                </Pressable>

                {notes.length > 0 && (
                  <View style={styles.savedList}>
                    <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>ملاحظات محفوظة</Text>
                    {notes.map((note) => (
                      <View
                        key={note.id}
                        style={[
                          styles.savedCard,
                          { backgroundColor: palette.backgroundSelected, borderColor: palette.border },
                        ]}>
                        <Text style={[styles.bodyText, { color: palette.text }]}>{note.body}</Text>
                        <Pressable
                          accessibilityRole="button"
                          disabled={busy}
                          onPress={() => void removeNote(note.id)}>
                          <Text style={styles.deleteText}>حذف</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
                {error && <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

type RingLayoutInput = {
  anchorRect: ElementRect | null;
  count: number;
  windowWidth: number;
  windowHeight: number;
  insetTop: number;
  insetBottom: number;
  /** Offset from the page view's origin to this overlay's origin. */
  offsetX: number;
  offsetY: number;
};

function computeRingLayout({
  anchorRect,
  count,
  windowWidth,
  windowHeight,
  insetTop,
  insetBottom,
  offsetX,
  offsetY,
}: RingLayoutInput): {
  points: { left: number; top: number }[];
  close: { left: number; top: number };
  toastTop: number;
} {
  const half = BUTTON_SIZE / 2;
  const anchor = anchorRect ?? {
    x: windowWidth / 2 - 30,
    y: windowHeight / 2 - 14,
    width: 60,
    height: 28,
  };
  const centerX = anchor.x + (anchorRect ? offsetX : 0) + anchor.width / 2;
  const centerY = anchor.y + (anchorRect ? offsetY : 0) + anchor.height / 2;
  const wordHalf = Math.max(anchor.width, anchor.height) / 2;

  const topLimit = insetTop + 2;
  const bottomLimit = windowHeight - insetBottom - 2;

  // Radius large enough to clear the word and to keep the buttons from colliding.
  const safeCount = Math.max(count, 1);
  const desiredRadius = Math.max(
    wordHalf + BUTTON_SIZE * 0.85,
    (safeCount * (BUTTON_SIZE + 8)) / (2 * Math.PI),
    BUTTON_SIZE * 1.4,
  );

  // Shift the ring center so the whole ring fits on screen when possible.
  const cx = clampWithin(
    centerX,
    RING_MARGIN + half + desiredRadius,
    windowWidth - RING_MARGIN - half - desiredRadius,
    windowWidth / 2,
  );
  const cy = clampWithin(
    centerY,
    topLimit + half + desiredRadius,
    bottomLimit - half - desiredRadius,
    (topLimit + bottomLimit) / 2,
  );

  const radiusX = Math.max(
    BUTTON_SIZE * 0.95,
    Math.min(desiredRadius, cx - RING_MARGIN - half, windowWidth - cx - RING_MARGIN - half),
  );
  const radiusY = Math.max(
    BUTTON_SIZE * 0.95,
    Math.min(desiredRadius, cy - topLimit - half, bottomLimit - cy - half),
  );

  const points: { left: number; top: number }[] = [];
  for (let index = 0; index < safeCount; index += 1) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / safeCount;
    points.push({
      left: cx + radiusX * Math.cos(angle) - half,
      top: cy + radiusY * Math.sin(angle) - half,
    });
  }

  const closeAbove = cy - radiusY - half - LABEL_GAP - CLOSE_SIZE;
  const closeTop = clampWithin(
    closeAbove,
    topLimit,
    bottomLimit - CLOSE_SIZE,
    topLimit,
  );
  const closeLeft = clampWithin(cx - CLOSE_SIZE / 2, RING_MARGIN, windowWidth - CLOSE_SIZE - RING_MARGIN, RING_MARGIN);

  const toastTop = clampWithin(
    cy + radiusY + half + LABEL_GAP,
    topLimit,
    bottomLimit - 44,
    bottomLimit - 44,
  );

  return {
    points,
    close: { left: closeLeft, top: closeTop },
    toastTop,
  };
}

function clampWithin(value: number, low: number, high: number, fallback: number): number {
  if (high < low) {
    return fallback;
  }
  return Math.min(Math.max(value, low), high);
}

function TafsirPanel({
  surahNumber,
  ayahNumber,
  palette,
}: {
  surahNumber: number;
  ayahNumber: number;
  palette: ReturnType<typeof useTheme>;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${surahNumber}:${ayahNumber}:${reloadKey}`;
  const [state, setState] = useState<{ key: string; text: string | null; error: string | null } | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    quranContentProvider
      .getAyahTafsir(surahNumber, ayahNumber)
      .then((text) => {
        if (active) {
          setState({ key: requestKey, text, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            key: requestKey,
            text: null,
            error: error instanceof Error ? error.message : 'تعذر تحميل التفسير.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [ayahNumber, requestKey, surahNumber]);

  if (!state || state.key !== requestKey) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.primary} />
        <Text style={[styles.hintText, { color: palette.textSecondary }]}>جارٍ تحميل التفسير…</Text>
      </View>
    );
  }
  if (state.error) {
    return (
      <View style={styles.centered}>
        <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setReloadKey((key) => key + 1)}
          style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
          <Text style={[styles.primaryButtonText, { color: palette.background }]}>إعادة المحاولة</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.dialogBody}>
      <Text style={[styles.bodyText, { color: palette.text, lineHeight: 28 }]}>{state.text}</Text>
    </ScrollView>
  );
}

function SearchPanel({
  query,
  palette,
  onOpenAyah,
}: {
  query: string;
  palette: ReturnType<typeof useTheme>;
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${query}:${reloadKey}`;
  const [state, setState] = useState<{
    key: string;
    results: AyahSearchResult[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    quranContentProvider
      .searchAyahs(query, 20)
      .then((results) => {
        if (active) {
          setState({ key: requestKey, results, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            key: requestKey,
            results: [],
            error: error instanceof Error ? error.message : 'تعذر تنفيذ البحث.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [query, requestKey]);

  if (!state || state.key !== requestKey) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.primary} />
        <Text style={[styles.hintText, { color: palette.textSecondary }]}>جارٍ البحث في المصحف…</Text>
      </View>
    );
  }
  if (state.error) {
    return (
      <View style={styles.centered}>
        <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setReloadKey((key) => key + 1)}
          style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
          <Text style={[styles.primaryButtonText, { color: palette.background }]}>إعادة المحاولة</Text>
        </Pressable>
      </View>
    );
  }
  if (state.results.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hintText, { color: palette.textSecondary }]}>
          لا توجد نتائج مطابقة في المصحف.
        </Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
      {state.results.map((result) => (
        <Pressable
          key={`${result.surahNumber}:${result.ayahNumber}`}
          accessibilityRole="button"
          onPress={() => onOpenAyah(result.surahNumber, result.ayahNumber)}
          style={({ pressed }) => [
            styles.savedCard,
            { backgroundColor: palette.background, borderColor: palette.border },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.resultRef, { color: palette.primary }]}>
            سورة {toArabicNumbers(result.surahNumber)} · الآية {toArabicNumbers(result.ayahNumber)}
          </Text>
          {result.text.length > 0 && (
            <Text style={[styles.bodyText, { color: palette.text }]} numberOfLines={3}>
              {result.text}
            </Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 120,
  },
  ring: {
    ...StyleSheet.absoluteFill,
  },
  iconWrap: {
    position: 'absolute',
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: CLOSE_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '86%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 14,
  },
  toastText: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.72 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  dialog: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: 22,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  dialogHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  headerTextGroup: {
    flex: 1,
    gap: 2,
  },
  headerRef: {
    fontSize: 11,
    textAlign: 'right',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  dialogBody: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  centered: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'right',
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
  },
  wordCard: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  wordCardText: {
    fontSize: 26,
    textAlign: 'center',
  },
  swatchRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  swatchActive: {
    borderWidth: 2.5,
    borderColor: 'rgba(0,0,0,0.45)',
    transform: [{ scale: 1.1 }],
  },
  customRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.two,
  },
  hexInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  customApply: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteChip: {
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.12)',
    marginTop: Spacing.two,
  },
  deleteChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C62828',
  },
  noteInput: {
    minHeight: 96,
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  savedList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  savedCard: {
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.one,
  },
  resultRef: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  deleteText: {
    color: '#B24C4C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
