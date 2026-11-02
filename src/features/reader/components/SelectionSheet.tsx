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
  const toolbarWidth = editor === 'highlights' ? 220 : 180;
  const toolbarHeight = 44;
  const anchorCenterX = anchor ? anchor.x + anchor.width / 2 : width / 2;
  const left = Math.max(
    12,
    Math.min(
      width - toolbarWidth - 12,
      anchorCenterX - toolbarWidth / 2,
    ),
  );
  const isAbove = (anchor ? anchor.y : height / 2) >= insets.top + toolbarHeight + 14;
  const top = isAbove
    ? Math.max(insets.top + 8, (anchor ? anchor.y : height / 2) - toolbarHeight - 8)
    : Math.min(height - insets.bottom - toolbarHeight - 8, (anchor ? anchor.y + anchor.height : height / 2) + 8);
  const arrowLeft = Math.max(12, Math.min(toolbarWidth - 22, anchorCenterX - left - 5));

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
      clearSelection();
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
      clearSelection();
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

  async function copyOrShare(): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${selectedText}\n${reference}`);
      }
      await Share.share({ message: `${selectedText}\n${reference}` });
      clearSelection();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذرت المشاركة: ${error.message}` : 'تعذرت المشاركة.',
      );
    } finally {
      setBusy(false);
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
              styles.floatingToolbar,
              {
                left,
                top,
                width: toolbarWidth,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <FloatingIcon
              icon={isAudioPlaying ? '❚❚' : '▶'}
              label={isAudioPlaying ? 'إيقاف التلاوة' : 'استماع'}
              primary={isAudioPlaying}
              disabled={busy}
              onPress={() => {
                if (isAudioPlaying) {
                  onStopAudio();
                } else {
                  void playAudio();
                }
              }}
            />
            <FloatingIcon
              icon="🎨"
              label="تلوين الكلمة"
              onPress={() => setEditor('highlights')}
            />
            <FloatingIcon
              icon="✍️"
              label="ملاحظة"
              onPress={() => setEditor('notes')}
            />
            <FloatingIcon
              icon="📋"
              label="مشاركة أو نسخ"
              onPress={() => void copyOrShare()}
            />
            <View
              style={[
                styles.arrowCaret,
                isAbove ? styles.arrowDown : styles.arrowUp,
                {
                  left: arrowLeft,
                  borderTopColor: isAbove ? palette.surface : 'transparent',
                  borderBottomColor: !isAbove ? palette.surface : 'transparent',
                },
              ]}
            />
          </View>
        ) : editor === 'highlights' ? (
          <View
            style={[
              styles.floatingToolbar,
              {
                left,
                top,
                width: toolbarWidth,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="رجوع"
              onPress={() => setEditor('actions')}
              style={styles.pillBackBtn}>
              <Text style={[styles.pillBackGlyph, { color: palette.primary }]}>→</Text>
            </Pressable>
            {highlightColors.map((color) => (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityLabel="تمييز بهذا اللون"
                disabled={busy}
                onPress={() => void saveHighlight(color)}
                style={[styles.quickColorDot, { backgroundColor: color }]}
              />
            ))}
            {highlights.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="حذف التمييز"
                disabled={busy}
                onPress={() => void deleteHighlight(highlights[0].id)}
                style={styles.pillDeleteBtn}>
                <Text style={styles.pillDeleteGlyph}>✕</Text>
              </Pressable>
            )}
            <View
              style={[
                styles.arrowCaret,
                isAbove ? styles.arrowDown : styles.arrowUp,
                {
                  left: arrowLeft,
                  borderTopColor: isAbove ? palette.surface : 'transparent',
                  borderBottomColor: !isAbove ? palette.surface : 'transparent',
                },
              ]}
            />
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

function FloatingIcon({
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
      style={({ pressed }) => [
        styles.floatingIconBtn,
        { backgroundColor: primary ? palette.primary : palette.backgroundSelected },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text
        style={[
          styles.floatingIconGlyph,
          { color: primary ? palette.background : palette.primary },
        ]}>
        {icon}
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
  floatingToolbar: {
    position: 'absolute',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 44,
    paddingHorizontal: 8,
    borderWidth: 1.2,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  floatingIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingIconGlyph: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  arrowCaret: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowDown: {
    bottom: -6,
    borderTopWidth: 6,
  },
  arrowUp: {
    top: -6,
    borderBottomWidth: 6,
  },
  pillBackBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBackGlyph: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  pillDeleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEAEA',
  },
  pillDeleteGlyph: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D32F2F',
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
