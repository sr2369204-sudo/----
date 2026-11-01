import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
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
import type { SelectionAnchor } from '@/features/reader/components/MushafPageViewer';
import type { ReaderSelection } from '@/features/reader/state/selection-store';
import { useTheme } from '@/hooks/use-theme';
import { useReaderSelectionStore } from '@/features/reader/state/selection-store';

const highlightColors = ['#F3D66B', '#80C99B', '#8BBCE8', '#E9A0B1'];

type Props = {
  surahName: string;
  anchor: SelectionAnchor | null;
  onHighlightsChanged: () => void;
  onPlayAudio: (selection: ReaderSelection) => Promise<void>;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
};

type Editor = 'actions' | 'highlights' | 'notes' | 'more';

export function SelectionSheet(props: Props) {
  const selection = useReaderSelectionStore((state) => state.selection);
  if (!selection) {
    return null;
  }

  const selectionKey =
    selection.type === 'word'
      ? `word:${selection.surahNumber}:${selection.ayah.ayahNumber}:${selection.word.id}`
      : `ayah:${selection.surahNumber}:${selection.ayah.ayahNumber}`;

  return <SelectionMenu key={selectionKey} {...props} selection={selection} />;
}

function SelectionMenu({
  selection,
  surahName,
  anchor,
  onHighlightsChanged,
  onPlayAudio,
  onStopAudio,
  isAudioPlaying,
}: Props & { selection: ReaderSelection }) {
  const database = useSQLiteContext();
  const clearSelection = useReaderSelectionStore((state) => state.clearSelection);
  const palette = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const repository = useMemo(() => new SqliteAnnotationRepository(database), [database]);
  const [editor, setEditor] = useState<Editor>('actions');
  const [noteBody, setNoteBody] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const target = useMemo<AnnotationTarget>(() => {
    if (selection.type === 'ayah') {
      return {
        type: 'ayah',
        surahNumber: selection.surahNumber,
        ayahNumber: selection.ayah.ayahNumber,
      };
    }
    return {
      type: 'word',
      surahNumber: selection.surahNumber,
      ayahNumber: selection.ayah.ayahNumber,
      wordId: selection.word.id,
    };
  }, [selection]);

  useEffect(() => {
    let active = true;
    Promise.all([
      repository.listHighlightsForTarget(target),
      repository.listNotesForTarget(target),
    ])
      .then(([savedHighlights, savedNotes]) => {
        if (active) {
          setHighlights(savedHighlights);
          setNotes(savedNotes);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? `تعذر تحميل الملاحظات والتمييزات المحفوظة: ${error.message}`
              : 'تعذر تحميل البيانات المحفوظة من الجهاز.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [repository, target]);

  const selectedText =
    selection.type === 'word'
      ? selection.word.textUthmani
      : selection.ayah.words.map((word) => word.textUthmani).join(' ');
  const reference = `${surahName} · الآية ${toArabicNumbers(selection.ayah.ayahNumber)}`;
  const isWord = selection.type === 'word';
  const title = isWord ? selection.word.textUthmani : `الآية ${toArabicNumbers(selection.ayah.ayahNumber)}`;
  const menuWidth = Math.min(320, width - 24);
  const menuHeight = 82;
  const left = Math.max(
    12,
    Math.min(
      width - menuWidth - 12,
      (anchor ? anchor.x + anchor.width / 2 : width / 2) - menuWidth / 2,
    ),
  );
  const belowTop = anchor ? anchor.y + anchor.height + 10 : height / 2 - menuHeight / 2;
  const top = Math.min(
    Math.max(insets.top + 8, belowTop),
    height - insets.bottom - menuHeight - 8,
  );

  async function refreshSavedItems(): Promise<void> {
    const [savedHighlights, savedNotes] = await Promise.all([
      repository.listHighlightsForTarget(target),
      repository.listNotesForTarget(target),
    ]);
    setHighlights(savedHighlights);
    setNotes(savedNotes);
  }

  async function saveHighlight(color: string): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await repository.createHighlight({
        target,
        color,
        opacity: isWord ? 0.52 : 0.28,
      });
      await refreshSavedItems();
      onHighlightsChanged();
      setEditor('actions');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذر حفظ التمييز: ${error.message}` : 'تعذر حفظ التمييز.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteHighlight(id: string): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await repository.deleteHighlight(id);
      await refreshSavedItems();
      onHighlightsChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذر حذف التمييز: ${error.message}` : 'تعذر حذف التمييز.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveNote(): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await repository.createNote({ target, body: noteBody });
      setNoteBody('');
      await refreshSavedItems();
      setEditor('notes');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذر حفظ الملاحظة: ${error.message}` : 'تعذر حفظ الملاحظة.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteNote(id: string): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await repository.deleteNote(id);
      await refreshSavedItems();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذر حذف الملاحظة: ${error.message}` : 'تعذر حذف الملاحظة.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function shareSelection(): Promise<void> {
    try {
      await Share.share({ message: `${selectedText}\n${reference}` });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذرت مشاركة التحديد: ${error.message}` : 'تعذرت المشاركة.',
      );
    }
  }

  async function playAudio(): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await onPlayAudio(selection);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذر تشغيل التلاوة: ${error.message}` : 'تعذر تشغيل التلاوة.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => (editor === 'actions' ? clearSelection() : setEditor('actions'))}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق قائمة التحديد"
          style={styles.backdrop}
          onPress={clearSelection}
        />
        {editor === 'actions' ? (
          <View
            style={[
              styles.menu,
              {
                left,
                top,
                width: menuWidth,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <Text style={[styles.menuTitle, { color: palette.text }]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.menuActions}>
              <MenuAction
                icon={isAudioPlaying ? 'Ⅱ' : '♫'}
                label={isAudioPlaying ? 'إيقاف' : 'استماع'}
                primary
                disabled={busy}
                onPress={() => {
                  if (isAudioPlaying) {
                    onStopAudio();
                  } else {
                    void playAudio();
                  }
                }}
              />
              <MenuAction icon="✦" label="تمييز" onPress={() => setEditor('highlights')} />
              <MenuAction icon="▤" label="ملاحظة" onPress={() => setEditor('notes')} />
              <MenuAction icon="•••" label="المزيد" onPress={() => setEditor('more')} />
            </View>
            {busy && <Text style={[styles.caption, { color: palette.textSecondary }]}>جارٍ التشغيل…</Text>}
            {errorMessage && (
              <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>
            )}
          </View>
        ) : (
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                maxHeight: Math.max(280, height - insets.top - insets.bottom - 48),
                width: Math.min(width - 32, 440),
              },
            ]}>
            <View style={styles.dialogHeader}>
              <View style={styles.dialogTitleGroup}>
                <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>{title}</Text>
                <Text style={[styles.reference, { color: palette.textSecondary }]}>{reference}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="العودة إلى قائمة الكلمة"
                onPress={() => setEditor('actions')}
                style={styles.closeButton}>
                <Text style={[styles.closeText, { color: palette.primary }]}>رجوع</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
              {editor === 'highlights' ? (
                <View style={styles.editor}>
                  <Text style={[styles.editorTitle, { color: palette.text }]}>لون التمييز</Text>
                  <View style={styles.paletteRow}>
                    {highlightColors.map((color) => (
                      <Pressable
                        key={color}
                        accessibilityRole="button"
                        accessibilityLabel={`حفظ تمييز باللون ${color}`}
                        disabled={busy}
                        onPress={() => void saveHighlight(color)}
                        style={[styles.colorSwatch, { backgroundColor: color }]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.caption, { color: palette.textSecondary }]}>
                    يمكن أن يتراكب تمييز الكلمة مع تمييز الآية.
                  </Text>
                  {highlights.map((highlight) => (
                    <View key={highlight.id} style={styles.savedItem}>
                      <View
                        style={[styles.savedColor, {
                          backgroundColor: highlight.color,
                          opacity: highlight.opacity,
                        }]}
                      />
                      <Text style={[styles.caption, { color: palette.textSecondary }]}>تمييز محفوظ</Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => void deleteHighlight(highlight.id)}>
                        <Text style={styles.deleteText}>حذف</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : editor === 'notes' ? (
                <View style={styles.editor}>
                  <Text style={[styles.editorTitle, { color: palette.text }]}>ملاحظات شخصية</Text>
                  <TextInput
                    accessibilityLabel="نص الملاحظة"
                    multiline
                    maxLength={4000}
                    value={noteBody}
                    onChangeText={setNoteBody}
                    placeholder="اكتب ملاحظة خاصة بك"
                    placeholderTextColor={palette.textSecondary}
                    textAlign="right"
                    style={[
                      styles.noteInput,
                      {
                        color: palette.text,
                        backgroundColor: palette.background,
                        borderColor: palette.border,
                      },
                    ]}
                  />
                  <ActionButton
                    label={busy ? 'جارٍ الحفظ…' : 'حفظ على هذا الجهاز'}
                    backgroundColor={palette.primary}
                    textColor={palette.background}
                    disabled={busy || noteBody.trim().length === 0}
                    onPress={() => void saveNote()}
                  />
                  {notes.map((note) => (
                    <View key={note.id} style={styles.noteItem}>
                      <Text style={[styles.noteBody, { color: palette.text }]}>{note.body}</Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => void deleteNote(note.id)}>
                        <Text style={styles.deleteText}>حذف الملاحظة</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.editor}>
                  <Text style={[styles.caption, { color: palette.textSecondary }]}>{reference}</Text>
                  <ActionButton
                    label={isAudioPlaying ? 'إيقاف التلاوة' : isWord ? 'استماع إلى الكلمة' : 'استماع إلى الآية'}
                    backgroundColor={palette.primary}
                    textColor={palette.background}
                    disabled={busy}
                    onPress={() => {
                      if (isAudioPlaying) {
                        onStopAudio();
                      } else {
                        void playAudio();
                      }
                    }}
                  />
                  <ActionButton
                    label="مشاركة النص والمرجع"
                    backgroundColor={palette.backgroundSelected}
                    textColor={palette.text}
                    onPress={() => void shareSelection()}
                  />
                </View>
              )}
              {errorMessage && (
                <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

function MenuAction({
  icon,
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  const palette = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.menuAction,
        { backgroundColor: primary ? palette.primary : palette.backgroundSelected },
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.menuIcon, { color: primary ? palette.background : palette.primary }]}>
        {icon}
      </Text>
      <Text
        style={[styles.menuActionLabel, { color: primary ? palette.background : palette.text }]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  backgroundColor,
  textColor,
  onPress,
  disabled = false,
}: {
  label: string;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.actionText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  menu: {
    position: 'absolute',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: 7,
    borderWidth: 1,
    borderRadius: 18,
    elevation: 8,
    shadowColor: '#18251F',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  menuTitle: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  menuActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 5,
  },
  menuAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 1,
  },
  menuIcon: {
    fontSize: 17,
    fontWeight: '700',
  },
  menuActionLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  dialog: {
    alignSelf: 'center',
    marginVertical: 'auto',
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  dialogTitleGroup: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  reference: {
    fontSize: 13,
    textAlign: 'right',
  },
  closeButton: {
    padding: Spacing.one,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dialogBody: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  editor: {
    gap: Spacing.three,
  },
  editorTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  paletteRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    gap: 14,
  },
  colorSwatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  savedItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
  },
  savedColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  deleteText: {
    color: '#B24C4C',
    fontSize: 13,
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 110,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  noteItem: {
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 153, 133, 0.12)',
  },
  noteBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'right',
  },
  caption: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'right',
  },
  error: {
    color: '#B42318',
    marginTop: Spacing.two,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.74,
  },
});
