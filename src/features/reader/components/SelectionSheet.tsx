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

// Rich palette of 8 highlight colours
const HIGHLIGHT_COLORS = [
  '#FFD54F', // Warm amber
  '#AED581', // Soft lime
  '#4FC3F7', // Sky blue
  '#F48FB1', // Pink rose
  '#CE93D8', // Lavender
  '#80CBC4', // Teal mint
  '#FFB74D', // Peach orange
  '#EF9A9A', // Coral red
];

type Props = {
  surahName: string;
  anchor: SelectionAnchor | null;
  onHighlightsChanged: () => void;
  onPlayAudio: (selection: ReaderSelection) => Promise<void>;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
};

type Editor = 'actions' | 'highlights' | 'notes';

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
  const [customColor, setCustomColor] = useState('');

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

  // Toolbar layout computation
  const TOOLBAR_WIDTH = editor === 'actions' ? 252 : editor === 'highlights' ? 300 : 340;
  const TOOLBAR_HEIGHT = 52;
  const anchorCenterX = anchor ? anchor.x + anchor.width / 2 : width / 2;
  const left = Math.max(12, Math.min(width - TOOLBAR_WIDTH - 12, anchorCenterX - TOOLBAR_WIDTH / 2));
  const isAbove = (anchor ? anchor.y : height / 2) >= insets.top + TOOLBAR_HEIGHT + 16;
  const top = isAbove
    ? Math.max(insets.top + 8, (anchor ? anchor.y : height / 2) - TOOLBAR_HEIGHT - 10)
    : Math.min(
        height - insets.bottom - TOOLBAR_HEIGHT - 8,
        (anchor ? anchor.y + anchor.height : height / 2) + 10,
      );
  const arrowLeft = Math.max(14, Math.min(TOOLBAR_WIDTH - 24, anchorCenterX - left - 6));

  async function refreshSavedItems(): Promise<void> {
    const [savedHighlights, savedNotes] = await Promise.all([
      repository.listHighlightsForTarget(target),
      repository.listNotesForTarget(target),
    ]);
    setHighlights(savedHighlights);
    setNotes(savedNotes);
  }

  async function saveHighlight(color: string): Promise<void> {
    const trimmed = color.trim().toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(trimmed)) {
      setErrorMessage('أدخل رمز لون صحيح بالصيغة #RRGGBB');
      return;
    }
    setBusy(true);
    setErrorMessage(null);
    try {
      await repository.createHighlight({
        target,
        color: trimmed,
        opacity: isWord ? 0.78 : 0.52,
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

  const activeHighlightColor = highlights[0]?.color ?? null;

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

        {/* ── Main Action Toolbar ── */}
        {editor === 'actions' && (
          <View
            style={[
              styles.pill,
              {
                left,
                top,
                width: TOOLBAR_WIDTH,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            {/* Audio */}
            <ActionIcon
              icon={isAudioPlaying ? '⏹' : '▶'}
              label={isAudioPlaying ? 'إيقاف' : 'استماع'}
              accent={isAudioPlaying ? palette.primary : undefined}
              disabled={busy}
              onPress={() => { if (isAudioPlaying) { onStopAudio(); } else { void playAudio(); } }}
              palette={palette}
            />
            {/* Divider */}
            <View style={[styles.pillDivider, { backgroundColor: palette.border }]} />
            {/* Highlight */}
            <ActionIcon
              icon="◈"
              label="تمييز"
              dot={activeHighlightColor ?? undefined}
              disabled={busy}
              onPress={() => setEditor('highlights')}
              palette={palette}
            />
            {/* Note */}
            <ActionIcon
              icon="✎"
              label="ملاحظة"
              badge={notes.length > 0 ? String(notes.length) : undefined}
              disabled={busy}
              onPress={() => setEditor('notes')}
              palette={palette}
            />
            {/* Copy/Share */}
            <ActionIcon
              icon="⎘"
              label="نسخ"
              disabled={busy}
              onPress={() => void copyOrShare()}
              palette={palette}
            />
            {/* Divider */}
            <View style={[styles.pillDivider, { backgroundColor: palette.border }]} />
            {/* Close */}
            <ActionIcon
              icon="✕"
              label="إغلاق"
              disabled={false}
              onPress={clearSelection}
              palette={palette}
            />
            <ArrowCaret isAbove={isAbove} arrowLeft={arrowLeft} color={palette.surface} />
          </View>
        )}

        {/* ── Highlight / Color Picker ── */}
        {editor === 'highlights' && (
          <View
            style={[
              styles.pill,
              styles.pillWide,
              {
                left,
                top,
                width: TOOLBAR_WIDTH,
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            {/* Back */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="رجوع"
              onPress={() => setEditor('actions')}
              style={styles.backBtn}>
              <Text style={[styles.backGlyph, { color: palette.primary }]}>←</Text>
            </Pressable>
            <View style={[styles.pillDivider, { backgroundColor: palette.border }]} />

            {/* Preset swatches */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.swatchRow}
              style={styles.swatchScroll}>
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
                    activeHighlightColor === color && styles.swatchActive,
                  ]}
                />
              ))}
            </ScrollView>

            {/* Custom hex input */}
            <View style={[styles.pillDivider, { backgroundColor: palette.border }]} />
            <TextInput
              accessibilityLabel="أدخل رمز اللون"
              value={customColor}
              onChangeText={setCustomColor}
              placeholder="#RRGGBB"
              placeholderTextColor={palette.textSecondary}
              maxLength={7}
              autoCapitalize="none"
              style={[styles.hexInput, { color: palette.text, borderColor: palette.border }]}
            />
            <Pressable
              accessibilityRole="button"
              disabled={busy || customColor.length < 4}
              onPress={() => void saveHighlight(customColor)}
              style={[
                styles.hexApply,
                { backgroundColor: /^#[0-9a-fA-F]{6}$/.test(customColor) ? customColor : palette.primary },
              ]}>
              <Text style={[styles.hexApplyText, { color: '#fff' }]}>✔</Text>
            </Pressable>

            {/* Delete existing */}
            {highlights.length > 0 && (
              <>
                <View style={[styles.pillDivider, { backgroundColor: palette.border }]} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="حذف التمييز"
                  disabled={busy}
                  onPress={() => void deleteHighlight(highlights[0].id)}
                  style={styles.deleteBtn}>
                  <Text style={styles.deleteGlyph}>✕</Text>
                </Pressable>
              </>
            )}
            <ArrowCaret isAbove={isAbove} arrowLeft={arrowLeft} color={palette.surface} />
          </View>
        )}

        {/* ── Notes ── */}
        {editor === 'notes' && (
          <View
            style={[
              styles.dialog,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                maxHeight: Math.max(300, height - insets.top - insets.bottom - 48),
                width: Math.min(width - 32, 420),
              },
            ]}>
            <View style={styles.dialogHeader}>
              <View style={styles.dialogTitleGroup}>
                <Text style={[styles.dialogTitle, { color: palette.text }]} numberOfLines={1}>{title}</Text>
                <Text style={[styles.dialogRef, { color: palette.textSecondary }]}>{reference}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="رجوع"
                onPress={() => setEditor('actions')}
                style={styles.dialogBack}>
                <Text style={[styles.dialogBackText, { color: palette.primary }]}>رجوع</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
              <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>ملاحظة جديدة</Text>
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
                  {
                    color: palette.text,
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                disabled={busy || noteBody.trim().length === 0}
                onPress={() => void saveNote()}
                style={({ pressed }) => [
                  styles.saveBtn,
                  { backgroundColor: palette.primary },
                  (busy || noteBody.trim().length === 0) && styles.disabled,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.saveBtnText, { color: palette.background }]}>
                  {busy ? 'جارٍ الحفظ…' : 'حفظ'}
                </Text>
              </Pressable>

              {notes.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>ملاحظاتي</Text>
                  {notes.map((note) => (
                    <View key={note.id} style={[styles.noteCard, { backgroundColor: palette.backgroundSelected, borderColor: palette.border }]}>
                      <Text style={[styles.noteText, { color: palette.text }]}>{note.body}</Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => void deleteNote(note.id)}>
                        <Text style={styles.deleteText}>حذف</Text>
                      </Pressable>
                    </View>
                  ))}
                </>
              )}

              {errorMessage && (
                <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* Error for inline editors */}
        {errorMessage && editor !== 'notes' && (
          <View style={[styles.errorToast, { left, top: top + TOOLBAR_HEIGHT + 8, backgroundColor: palette.surface, borderColor: '#D32F2F' }]}>
            <Text style={styles.error}>{errorMessage}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionIcon({
  icon,
  label,
  accent,
  dot,
  badge,
  onPress,
  disabled,
  palette,
}: {
  icon: string;
  label: string;
  accent?: string;
  dot?: string;
  badge?: string;
  onPress: () => void;
  disabled: boolean;
  palette: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.iconGlyph, { color: accent ?? palette.primary }]}>{icon}</Text>
      {dot && <View style={[styles.iconDot, { backgroundColor: dot }]} />}
      {badge && (
        <View style={[styles.iconBadge, { backgroundColor: palette.primary }]}>
          <Text style={[styles.iconBadgeText, { color: palette.background }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

function ArrowCaret({ isAbove, arrowLeft, color }: { isAbove: boolean; arrowLeft: number; color: string }) {
  return (
    <View
      style={[
        styles.caret,
        isAbove ? styles.caretDown : styles.caretUp,
        {
          left: arrowLeft,
          borderTopColor: isAbove ? color : 'transparent',
          borderBottomColor: !isAbove ? color : 'transparent',
        },
      ]}
    />
  );
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },

  // Floating pill toolbar
  pill: {
    position: 'absolute',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 6,
    gap: 2,
    borderWidth: 1,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  pillWide: {
    paddingHorizontal: 8,
  },
  pillDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 2,
    opacity: 0.5,
  },

  // Icons inside the pill
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  iconDot: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  iconBadge: {
    position: 'absolute',
    top: 6,
    right: 5,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  iconBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },

  // Back button
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },

  // Color swatches
  swatchScroll: {
    flexGrow: 0,
    maxWidth: 180,
  },
  swatchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  swatchActive: {
    borderWidth: 2.5,
    borderColor: 'rgba(0,0,0,0.45)',
    transform: [{ scale: 1.15 }],
  },

  // Custom colour hex input
  hexInput: {
    width: 72,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  hexApply: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  hexApplyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteGlyph: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D32F2F',
    lineHeight: 16,
  },

  // Caret / arrow
  caret: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  caretDown: {
    bottom: -7,
    borderTopWidth: 7,
  },
  caretUp: {
    top: -7,
    borderBottomWidth: 7,
  },

  // Full dialog (notes)
  dialog: {
    alignSelf: 'center',
    marginVertical: 'auto',
    borderWidth: 1,
    borderRadius: 24,
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
    gap: 3,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  dialogRef: {
    fontSize: 12,
    textAlign: 'right',
  },
  dialogBack: {
    paddingTop: 2,
  },
  dialogBackText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dialogBody: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteInput: {
    minHeight: 100,
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 15,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  saveBtn: {
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  noteCard: {
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.one,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  deleteText: {
    color: '#B24C4C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Error toast
  errorToast: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 280,
  },
  error: {
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },

  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.72 },
});
