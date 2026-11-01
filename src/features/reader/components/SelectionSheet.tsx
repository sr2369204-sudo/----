import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { Colors, Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { AnnotationTarget, Highlight } from '@/features/annotations/types';
import type { ReaderSelection } from '@/features/reader/state/selection-store';
import { useTheme } from '@/hooks/use-theme';
import { useReaderSelectionStore } from '@/features/reader/state/selection-store';

const highlightColors = ['#F3D66B', '#80C99B', '#8BBCE8', '#E9A0B1'];

type Props = {
  surahName: string;
  onHighlightsChanged: () => void;
  onPlayAudio: (selection: ReaderSelection) => Promise<void>;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
};

export function SelectionSheet({
  surahName,
  onHighlightsChanged,
  onPlayAudio,
  onStopAudio,
  isAudioPlaying,
}: Props) {
  const selection = useReaderSelectionStore((state) => state.selection);
  if (!selection) {
    return null;
  }

  const selectionKey =
    selection.type === 'word'
      ? `word:${selection.surahNumber}:${selection.ayah.ayahNumber}:${selection.word.id}`
      : `ayah:${selection.surahNumber}:${selection.ayah.ayahNumber}`;

  return (
    <SelectionSheetContent
      key={selectionKey}
      selection={selection}
      surahName={surahName}
      onHighlightsChanged={onHighlightsChanged}
      onPlayAudio={onPlayAudio}
      onStopAudio={onStopAudio}
      isAudioPlaying={isAudioPlaying}
    />
  );
}

function SelectionSheetContent({
  selection,
  surahName,
  onHighlightsChanged,
  onPlayAudio,
  onStopAudio,
  isAudioPlaying,
}: Props & { selection: ReaderSelection }) {
  const database = useSQLiteContext();
  const clearSelection = useReaderSelectionStore((state) => state.clearSelection);
  const palette = useTheme();
  const repository = useMemo(() => new SqliteAnnotationRepository(database), [database]);
  const [editor, setEditor] = useState<'actions' | 'highlights' | 'notes'>('actions');
  const [noteBody, setNoteBody] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
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
    repository
      .listHighlightsForTarget(target)
      .then((items) => {
        if (active) {
          setHighlights(items);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMessage('تعذر قراءة التمييزات المحفوظة من الجهاز.');
        }
      });
    return () => {
      active = false;
    };
  }, [repository, target]);

  const activeTarget = target;
  const selectedText =
    selection.type === 'word'
      ? selection.word.textUthmani
      : selection.ayah.words.map((word) => word.textUthmani).join(' ');
  const reference = `${surahName} · الآية ${selection.ayah.ayahNumber}`;
  const isWord = selection.type === 'word';
  const title = isWord ? selection.word.textUthmani : `الآية ${selection.ayah.ayahNumber}`;
  async function saveHighlight(color: string): Promise<void> {
    setBusy(true);
    setErrorMessage(null);
    try {
      await repository.createHighlight({
        target: activeTarget,
        color,
        opacity: isWord ? 0.52 : 0.28,
      });
      setHighlights(await repository.listHighlightsForTarget(activeTarget));
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
      setHighlights(await repository.listHighlightsForTarget(activeTarget));
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
      await repository.createNote({ target: activeTarget, body: noteBody });
      setNoteBody('');
      Alert.alert('تم الحفظ', 'حُفظت الملاحظة على هذا الجهاز.');
      setEditor('actions');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `تعذر حفظ الملاحظة: ${error.message}` : 'تعذر حفظ الملاحظة.',
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
      animationType="slide"
      onRequestClose={clearSelection}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق قائمة التحديد"
          style={styles.backdrop}
          onPress={clearSelection}
        />
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
              <Text style={[styles.reference, { color: palette.textSecondary }]}>{reference}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={clearSelection}
              style={styles.closeButton}>
              <Text style={[styles.closeText, { color: palette.text }]}>إغلاق</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {editor === 'highlights' ? (
              <View style={styles.editor}>
                <Text style={[styles.editorTitle, { color: palette.text }]}>لون التمييز</Text>
                <View style={styles.palette}>
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
                  يمكن أن يتراكب تمييز الكلمة مع تمييز الآية دون استبداله.
                </Text>
                {highlights.map((highlight) => (
                  <View key={highlight.id} style={styles.savedHighlight}>
                    <View
                      style={[
                        styles.savedColor,
                        { backgroundColor: highlight.color, opacity: highlight.opacity },
                      ]}
                    />
                    <Text style={[styles.caption, { color: palette.textSecondary }]}>
                      تمييز محفوظ
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => void deleteHighlight(highlight.id)}>
                      <Text style={styles.deleteText}>حذف هذا التمييز</Text>
                    </Pressable>
                  </View>
                ))}
                <ActionButton
                  label="رجوع"
                  backgroundColor={palette.backgroundSelected}
                  textColor={palette.text}
                  onPress={() => setEditor('actions')}
                />
              </View>
            ) : editor === 'notes' ? (
              <View style={styles.editor}>
                <Text style={[styles.editorTitle, { color: palette.text }]}>ملاحظة شخصية</Text>
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
                <ActionButton
                  label="رجوع"
                  backgroundColor={palette.backgroundSelected}
                  textColor={palette.text}
                  onPress={() => setEditor('actions')}
                />
              </View>
            ) : (
              <View style={styles.actions}>
                {selection.presentation === 'compact' ? (
                  <>
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
                      label="تمييز"
                      backgroundColor={palette.primary}
                      textColor={palette.background}
                      onPress={() => setEditor('highlights')}
                    />
                    <ActionButton
                      label="ملاحظة"
                      backgroundColor={palette.backgroundSelected}
                      textColor={palette.text}
                      onPress={() => setEditor('notes')}
                    />
                    <ActionButton
                      label="المزيد من الخيارات"
                      backgroundColor={palette.backgroundSelected}
                      textColor={palette.text}
                      onPress={() =>
                        useReaderSelectionStore.setState((state) => ({
                          selection: state.selection
                            ? { ...state.selection, presentation: 'full' }
                            : null,
                        }))
                      }
                    />
                  </>
                ) : (
                  <>
                    <ActionButton
                      label="تمييز"
                      backgroundColor={palette.primary}
                      textColor={palette.background}
                      onPress={() => setEditor('highlights')}
                    />
                    <ActionButton
                      label="ملاحظة"
                      backgroundColor={palette.backgroundSelected}
                      textColor={palette.text}
                      onPress={() => setEditor('notes')}
                    />
                    <ActionButton
                      label="مشاركة النص والمرجع"
                      backgroundColor={palette.backgroundSelected}
                      textColor={palette.text}
                      onPress={() => void shareSelection()}
                    />
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
                    <UnavailableAction label="التفسير المعتمد" palette={palette} />
                    {isWord && <UnavailableAction label="قاعدة التجويد ومعلومات الكلمة" palette={palette} />}
                    <Text style={[styles.caption, { color: palette.textSecondary }]}>
                      لا تتوفر هذه الخدمة قبل ربط مصدر موثوق والتحقق من الإتاحة والترخيص.
                    </Text>
                  </>
                )}
              </View>
            )}
            {errorMessage && (
              <Text accessibilityRole="alert" style={styles.error}>
                {errorMessage}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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

function UnavailableAction({
  label,
  palette,
}: {
  label: string;
  palette: (typeof Colors)['light'] | (typeof Colors)['dark'];
}) {
  return (
    <View style={[styles.unavailable, { borderColor: palette.border }]}>
      <Text style={[styles.actionText, { color: palette.textSecondary }]}>{label}</Text>
      <Text style={[styles.caption, { color: palette.textSecondary }]}>غير متاح حاليًا</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9AA39C',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'right',
  },
  reference: {
    fontSize: 14,
    textAlign: 'right',
  },
  closeButton: {
    padding: Spacing.two,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  actions: {
    gap: Spacing.two,
  },
  editor: {
    gap: Spacing.three,
  },
  editorTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'right',
  },
  unavailable: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 3,
  },
  caption: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  palette: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    gap: 16,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  savedHighlight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  savedColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  deleteText: {
    color: '#B24C4C',
    fontSize: 13,
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 130,
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 24,
    textAlignVertical: 'top',
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
