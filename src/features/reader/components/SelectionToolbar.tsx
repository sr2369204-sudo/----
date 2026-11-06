import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import {
  ActivityIndicator,
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
import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type {
  AnnotationTarget,
  AyahVoiceNote,
  Highlight,
  Note,
  WordVoiceNote,
} from '@/features/annotations/types';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import type { AyahWordMeaning } from '@/features/quran/services/content-provider';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import { normalizeSurahSearch } from '@/features/quran/services/surah-search';
import type { AyahSearchResult } from '@/features/quran/types';
import {
  useReaderSelectionStore,
  type ReaderSelection,
} from '@/features/reader/state/selection-store';
import type { AyahReference } from '@/features/reader/services/reading-progress';
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
/** Folder inside the document directory that keeps the recorded voice notes. */
const VOICE_NOTES_DIRECTORY = 'voice-notes';

type Panel = 'toolbar' | 'notes' | 'meaning' | 'tafsir' | 'search' | 'highlight';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  surahName: string;
  anchorRect: ElementRect | null;
  /** Height of the reader navbar, which the ring has to stay clear of. */
  navbarHeight: number;
  isBookmarked: boolean;
  isWordSaved: boolean;
  isDailyReadingReady: boolean;
  isDailyReadingComplete: boolean;
  isAudioPlaying: boolean;
  onHighlightsChanged: () => void;
  onToggleBookmark: (surahNumber: number, ayahNumber: number) => void;
  onToggleSaveWord: (
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    wordText: string,
  ) => void;
  onToggleDailyReading: (references: AyahReference[]) => Promise<void>;
  onPlayAudio: (selection: ReaderSelection) => Promise<void>;
  onStopAudio: () => void;
  /** Opens the long-press play menu (rest of surah / page start / surah start). */
  onOpenPlayMenu: () => void;
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
  isDailyReadingReady,
  isDailyReadingComplete,
  isAudioPlaying,
  onHighlightsChanged,
  onToggleBookmark,
  onToggleSaveWord,
  onToggleDailyReading,
  onPlayAudio,
  onStopAudio,
  onOpenPlayMenu,
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
  const [voiceNotes, setVoiceNotes] = useState<(WordVoiceNote | AyahVoiceNote)[]>([]);
  const [playingVoiceUri, setPlayingVoiceUri] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const voicePlayer = useAudioPlayer();
  const voiceStatus = useAudioPlayerStatus(voicePlayer);

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

  const wordTarget = target?.type === 'word' ? target : null;
  const voiceNoteTarget = target?.type === 'word' || target?.type === 'ayah' ? target : null;

  useEffect(() => {
    if (!voiceNoteTarget) {
      return;
    }
    let active = true;
    const savedNotes = voiceNoteTarget.type === 'word'
      ? repository.listVoiceNotesForWord(
          voiceNoteTarget.surahNumber,
          voiceNoteTarget.ayahNumber,
          voiceNoteTarget.wordId,
        )
      : repository.listVoiceNotesForAyah(
          voiceNoteTarget.surahNumber,
          voiceNoteTarget.ayahNumber,
        );
    savedNotes
      .then((saved) => {
        if (active) {
          setVoiceNotes(saved);
        }
      })
      .catch(() => {
        /* non-fatal: the panel simply shows no recordings */
      });
    return () => {
      active = false;
    };
  }, [repository, voiceNoteTarget]);

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
  const searchQuery = selection.type === 'word'
    ? selection.word.textUthmani
    : selection.type === 'ayah'
      ? selection.ayah.words.slice(0, 3).map((word) => word.textUthmani).join(' ')
      : (rangeAyahs ?? [])
          .slice(0, 2)
          .flatMap((ayah) => ayah.words.slice(0, 2))
          .map((word) => word.textUthmani)
          .join(' ');
  const selectedAyahReferences: AyahReference[] =
    selection.type === 'range'
      ? selection.ayahs.map((ayah) => ({
          surahNumber: selection.surahNumber,
          ayahNumber: ayah.ayahNumber,
        }))
      : [{
          surahNumber: selection.surahNumber,
          ayahNumber: selection.ayah.ayahNumber,
        }];

  const activeColor = highlightColors[0]?.color ?? null;

  async function toggleSelectedAyahsReadStatus(): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await onToggleDailyReading(selectedAyahReferences);
      setMessage(
        isDailyReadingComplete
          ? 'تم إلغاء احتساب القراءة.'
          : selectedAyahReferences.length === 1
            ? 'تم احتساب الآية ضمن خطة اليوم.'
            : 'تم احتساب الآيات ضمن خطة اليوم.',
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? `تعذر تحديث خطة القراءة: ${toggleError.message}`
          : 'تعذر تحديث خطة القراءة.',
      );
    } finally {
      setBusy(false);
    }
  }

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
    if (voiceNoteTarget?.type === 'word') {
      setVoiceNotes(await repository.listVoiceNotesForWord(
        voiceNoteTarget.surahNumber,
        voiceNoteTarget.ayahNumber,
        voiceNoteTarget.wordId,
      ));
    } else if (voiceNoteTarget?.type === 'ayah') {
      setVoiceNotes(await repository.listVoiceNotesForAyah(
        voiceNoteTarget.surahNumber,
        voiceNoteTarget.ayahNumber,
      ));
    }
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

  async function startVoiceNote(): Promise<void> {
    setError(null);
    setMessage(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('لم يتم منح إذن الميكروفون، ولا يمكن تسجيل الملاحظة.');
        return;
      }
      // The session has to allow recording before the recorder is prepared,
      // otherwise the first frames of the note are lost.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (recordError) {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {
        /* the session keeps working; only the recording failed */
      });
      setError(
        recordError instanceof Error ? `تعذر بدء التسجيل: ${recordError.message}` : 'تعذر بدء التسجيل.',
      );
    }
  }

  async function stopVoiceNote(): Promise<void> {
    if (!voiceNoteTarget) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const durationMs = recorderState.durationMillis;
      await recorder.stop();
      const recordedUri = recorder.uri;
      // Recording routes audio to the earpiece on iOS, so the session has to be
      // handed back to plain playback as soon as the microphone is released.
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!recordedUri) {
        setError('تعذر إنشاء ملف التسجيل.');
        return;
      }

      const voiceNotesDirectory = new Directory(Paths.document, VOICE_NOTES_DIRECTORY);
      if (!voiceNotesDirectory.exists) {
        voiceNotesDirectory.create({ intermediates: true, idempotent: true });
      }
      const destination = new File(
        voiceNotesDirectory,
        `voice-note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${
          RecordingPresets.HIGH_QUALITY.extension ?? '.m4a'
        }`,
      );
      // Recordings live in the cache directory, which the system is free to
      // clear; moving the file keeps the note for as long as the app is installed.
      await new File(recordedUri).move(destination);

      if (voiceNoteTarget.type === 'word') {
        await repository.createVoiceNote({
          surahNumber: voiceNoteTarget.surahNumber,
          ayahNumber: voiceNoteTarget.ayahNumber,
          wordId: voiceNoteTarget.wordId,
          fileUri: destination.uri,
          durationMs,
        });
      } else {
        await repository.createAyahVoiceNote({
          surahNumber: voiceNoteTarget.surahNumber,
          ayahNumber: voiceNoteTarget.ayahNumber,
          fileUri: destination.uri,
          durationMs,
        });
      }
      await refreshSavedItems();
      setMessage('تم حفظ الملاحظة الصوتية.');
    } catch (recordError) {
      setError(
        recordError instanceof Error ? `تعذر حفظ التسجيل: ${recordError.message}` : 'تعذر حفظ التسجيل.',
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleVoiceNote(note: WordVoiceNote | AyahVoiceNote): void {
    setError(null);
    if (playingVoiceUri === note.fileUri && voiceStatus.playing) {
      voicePlayer.pause();
      setPlayingVoiceUri(null);
      return;
    }
    voicePlayer.replace({ uri: note.fileUri });
    voicePlayer.play();
    setPlayingVoiceUri(note.fileUri);
  }

  async function removeVoiceNote(note: WordVoiceNote | AyahVoiceNote): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      if (playingVoiceUri === note.fileUri) {
        voicePlayer.pause();
        setPlayingVoiceUri(null);
      }
      if ('wordId' in note) {
        await repository.deleteVoiceNote(note.id);
      } else {
        await repository.deleteAyahVoiceNote(note.id);
      }
      const file = new File(note.fileUri);
      if (file.exists) {
        file.delete();
      }
      await refreshSavedItems();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? `تعذر حذف التسجيل: ${deleteError.message}` : 'تعذر حذف التسجيل.',
      );
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
    disabled?: boolean;
    onPress: () => void;
    onLongPress?: () => void;
  };

  const actions: Action[] = [
    {
      key: 'play',
      icon: isAudioPlaying ? 'stop' : 'play',
      label: isAudioPlaying ? 'إيقاف' : 'استماع',
      active: isAudioPlaying,
      onPress: () => (isAudioPlaying ? onStopAudio() : void playAudio()),
      // Long press swaps the single-item playback for the broader scope menu.
      onLongPress: onOpenPlayMenu,
    },
  ];

  actions.push({
    key: 'daily-reading',
    icon: isDailyReadingComplete ? 'checkmark-circle' : 'checkmark-circle-outline',
    label: isDailyReadingComplete
      ? isRange
        ? 'إلغاء إتمام الآيات'
        : 'إلغاء إتمام الآية'
      : isRange
        ? 'تمت قراءة الآيات'
        : 'تمت قراءة الآية',
    active: isDailyReadingComplete,
    disabled: !isDailyReadingReady,
    onPress: () => void toggleSelectedAyahsReadStatus(),
  });

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
        <View
          style={styles.ring}
          pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إغلاق التحديد"
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
              <View
                key={action.key}
                style={[
                  styles.iconWrap,
                  {
                    left: point.left,
                    top: point.top,
                  },
                ]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityState={{ selected: action.active === true }}
                  disabled={busy || action.disabled}
                  hitSlop={6}
                  onPress={action.onPress}
                  onLongPress={action.onLongPress}
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      backgroundColor: action.active ? palette.primary : palette.surface,
                      borderColor: action.active ? palette.primary : palette.border,
                    },
                    (busy || action.disabled) && styles.disabled,
                    pressed && !busy && !action.disabled && styles.pressed,
                  ]}>
                  <Ionicons
                    name={action.icon}
                    size={21}
                    color={action.active ? palette.background : palette.text}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>

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

            {panel === 'meaning' && isWord && (
              <MeaningPanel
                surahNumber={selection.surahNumber}
                ayahNumber={selection.ayah.ayahNumber}
                wordText={selection.word.textUthmani}
                palette={palette}
              />
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
                initialQuery={searchQuery}
                palette={palette}
                onOpenAyah={(surahNumber, ayahNumber) => {
                  setPanel('toolbar');
                  onOpenAyah(surahNumber, ayahNumber);
                }}
              />
            )}

            {panel === 'notes' && (
              <ScrollView contentContainerStyle={styles.dialogBody} keyboardShouldPersistTaps="handled">
                {selection.type !== 'range' && (
                  <View
                    style={[
                      styles.ayahContextCard,
                      { backgroundColor: palette.backgroundSelected, borderColor: palette.border },
                    ]}>
                    <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
                      نص الآية
                    </Text>
                    <Text style={[styles.ayahText, { color: palette.text }]}>
                      {selection.ayah.words.map((word, index) => (
                        <Text
                          key={word.id}
                          style={[
                            selection.type === 'word' && word.id === selection.word.id
                              ? styles.noteTargetWord
                              : undefined,
                            selection.type === 'word' && word.id === selection.word.id
                              ? {
                                  color: palette.background,
                                  backgroundColor: palette.primary,
                                }
                              : undefined,
                          ]}>
                          {word.textUthmani}{index < selection.ayah.words.length - 1 ? ' ' : ''}
                        </Text>
                      ))}
                    </Text>
                  </View>
                )}

                {voiceNoteTarget && (
                  <View
                    style={[
                      styles.recorderCard,
                      { backgroundColor: palette.backgroundSelected, borderColor: palette.border },
                    ]}>
                    <View style={styles.recorderHead}>
                      <View
                        style={[
                          styles.recorderBadge,
                          {
                            backgroundColor: recorderState.isRecording
                              ? 'rgba(198, 40, 40, 0.14)'
                              : palette.surface,
                          },
                        ]}>
                        <Ionicons
                          name="mic"
                          size={17}
                          color={recorderState.isRecording ? '#C62828' : palette.primary}
                        />
                      </View>
                      <View style={styles.recorderText}>
                        <Text style={[styles.recorderTitle, { color: palette.text }]}>
                          {wordTarget ? 'ملاحظة صوتية على الكلمة' : 'ملاحظة صوتية على الآية'}
                        </Text>
                        <Text style={[styles.recorderHint, { color: palette.textSecondary }]}>
                          {recorderState.isRecording
                            ? 'جارٍ التسجيل الآن…'
                            : 'سجّل تلاوتك أو تعليقك ثم احفظه'}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={recorderState.isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل'}
                      disabled={busy}
                      onPress={() =>
                        recorderState.isRecording ? void stopVoiceNote() : void startVoiceNote()
                      }
                      style={({ pressed }) => [
                        styles.recordOrb,
                        {
                          backgroundColor: recorderState.isRecording ? '#C62828' : palette.primary,
                        },
                        busy && styles.disabled,
                        pressed && styles.pressed,
                      ]}>
                      <Ionicons
                        name={recorderState.isRecording ? 'stop' : 'mic'}
                        size={30}
                        color={palette.background}
                      />
                    </Pressable>
                    <Text
                      style={[
                        styles.recordTimer,
                        { color: recorderState.isRecording ? '#C62828' : palette.textSecondary },
                      ]}>
                      {recorderState.isRecording
                        ? formatDuration(recorderState.durationMillis)
                        : 'اضغط للتسجيل'}
                    </Text>
                  </View>
                )}

                {voiceNotes.length > 0 && (
                  <View style={styles.savedList}>
                    <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
                      {wordTarget ? 'تسجيلاتي على هذه الكلمة' : 'تسجيلاتي على هذه الآية'}
                    </Text>
                    {voiceNotes.map((voiceNote) => {
                      const playing = playingVoiceUri === voiceNote.fileUri && voiceStatus.playing;
                      return (
                        <View
                          key={voiceNote.id}
                          style={[
                            styles.voiceRow,
                            { backgroundColor: palette.backgroundSelected, borderColor: palette.border },
                          ]}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={playing ? 'إيقاف التسجيل مؤقتًا' : 'تشغيل التسجيل'}
                            onPress={() => toggleVoiceNote(voiceNote)}
                            style={({ pressed }) => [
                              styles.voicePlay,
                              { backgroundColor: palette.primary },
                              pressed && styles.pressed,
                            ]}>
                            <Ionicons
                              name={playing ? 'pause' : 'play'}
                              size={16}
                              color={palette.background}
                            />
                          </Pressable>
                          <View style={styles.voiceInfo}>
                            <Text style={[styles.voiceDuration, { color: palette.text }]}>
                              {formatDuration(voiceNote.durationMs)}
                            </Text>
                            <Text style={[styles.voiceMeta, { color: palette.textSecondary }]}>
                              {playing ? 'قيد التشغيل…' : 'تسجيل صوتي'}
                            </Text>
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="حذف التسجيل"
                            disabled={busy}
                            onPress={() => void removeVoiceNote(voiceNote)}
                            style={({ pressed }) => [styles.voiceDelete, pressed && styles.pressed]}>
                            <Ionicons name="trash-outline" size={16} color="#B24C4C" />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}

                <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>ملاحظة مكتوبة</Text>
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
                  <Ionicons name="checkmark-circle-outline" size={17} color={palette.background} />
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
                          styles.noteCard,
                          { backgroundColor: palette.backgroundSelected, borderColor: palette.border },
                        ]}>
                        <Text style={[styles.bodyText, { color: palette.text }]}>{note.body}</Text>
                        <View style={styles.noteFooter}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="حذف الملاحظة"
                            disabled={busy}
                            onPress={() => void removeNote(note.id)}
                            style={({ pressed }) => [styles.noteDelete, pressed && styles.pressed]}>
                            <Ionicons name="trash-outline" size={13} color="#B24C4C" />
                            <Text style={styles.noteDeleteText}>حذف</Text>
                          </Pressable>
                        </View>
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
  const footerSpace = LABEL_GAP + CLOSE_SIZE + LABEL_GAP + 44;

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
    bottomLimit - half - desiredRadius - footerSpace,
    (topLimit + bottomLimit) / 2,
  );

  const radiusX = Math.max(
    BUTTON_SIZE * 0.95,
    Math.min(desiredRadius, cx - RING_MARGIN - half, windowWidth - cx - RING_MARGIN - half),
  );
  const radiusY = Math.max(
    BUTTON_SIZE * 0.95,
    Math.min(desiredRadius, cy - topLimit - half, bottomLimit - cy - half - footerSpace),
  );

  const points: { left: number; top: number }[] = [];
  for (let index = 0; index < safeCount; index += 1) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / safeCount;
    points.push({
      left: cx + radiusX * Math.cos(angle) - half,
      top: cy + radiusY * Math.sin(angle) - half,
    });
  }

  const closeTop = clampWithin(
    cy - CLOSE_SIZE / 2,
    topLimit,
    bottomLimit - CLOSE_SIZE,
    cy - CLOSE_SIZE / 2,
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

function MeaningPanel({
  surahNumber,
  ayahNumber,
  wordText,
  palette,
}: {
  surahNumber: number;
  ayahNumber: number;
  wordText: string;
  palette: ReturnType<typeof useTheme>;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${surahNumber}:${ayahNumber}:${reloadKey}`;
  const [state, setState] = useState<{
    key: string;
    meanings: AyahWordMeaning[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    quranContentProvider
      .getAyahWordMeanings(surahNumber, ayahNumber)
      .then((meanings) => {
        if (active) {
          setState({ key: requestKey, meanings, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            key: requestKey,
            meanings: [],
            error: error instanceof Error ? error.message : 'تعذر تحميل معنى الكلمة.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [ayahNumber, requestKey, surahNumber]);

  const loading = !state || state.key !== requestKey;
  const own = normalizeWord(wordText);
  const matched = state?.meanings.find((item) => normalizeWord(item.word) === own) ?? null;
  const others = (state?.meanings ?? []).filter((item) => item !== matched);

  return (
    <View style={styles.panelColumn}>
      <View style={[styles.wordCard, { backgroundColor: palette.background, borderColor: palette.border }]}>
        <Text style={[styles.wordCardText, { color: palette.text }]}>{wordText}</Text>
      </View>
      <ScrollView style={styles.panelScroll} contentContainerStyle={styles.dialogBody}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={palette.primary} />
            <Text style={[styles.hintText, { color: palette.textSecondary }]}>جارٍ تحميل المعنى…</Text>
          </View>
        ) : state?.error ? (
          <View style={styles.centered}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setReloadKey((key) => key + 1)}
              style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
              <Text style={[styles.primaryButtonText, { color: palette.background }]}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {matched ? (
              <View
                style={[
                  styles.meaningCard,
                  { backgroundColor: palette.backgroundSelected, borderColor: palette.primary },
                ]}>
                <Text style={[styles.meaningText, { color: palette.text }]}>{matched.meaning}</Text>
              </View>
            ) : (
              <Text style={[styles.hintText, { color: palette.textSecondary }]}>
                لا يتوفر معنى مفرد لهذه الكلمة؛ الكلمات التي بينها المصدر في هذه الآية:
              </Text>
            )}

            {others.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
                  معاني كلمات هذه الآية
                </Text>
                {others.map((item) => (
                  <View
                    key={item.word}
                    style={[
                      styles.meaningRow,
                      { backgroundColor: palette.background, borderColor: palette.border },
                    ]}>
                    <Text style={[styles.meaningRowWord, { color: palette.primary }]}>{item.word}</Text>
                    <Text style={[styles.meaningRowText, { color: palette.text }]}>{item.meaning}</Text>
                  </View>
                ))}
              </>
            )}

            {state && state.meanings.length === 0 && (
              <Text style={[styles.hintText, { color: palette.textSecondary }]}>
                لا يتوفر معنى لهذه الكلمة من المصدر.
              </Text>
            )}

            <Text style={[styles.sourceNote, { color: palette.textSecondary }]}>
              المصدر: السراج في بيان غريب القرآن
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SearchPanel({
  initialQuery,
  palette,
  onOpenAyah,
}: {
  initialQuery: string;
  palette: ReturnType<typeof useTheme>;
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
}) {
  const database = useSQLiteContext();
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery.trim());
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<{
    key: string;
    results: AyahSearchResult[];
    error: string | null;
  } | null>(null);

  // The directory is shared with the home screen query, and like there it is
  // read from the on-device index so surah names resolve without the network.
  const quranCache = useMemo(() => new LocalQuranCache(database), [database]);
  const surahDirectory = useQuery({
    queryKey: ['quran', 'surah-directory'],
    queryFn: () => quranCache.loadSurahDirectory(),
  });
  const surahNames = useMemo(() => {
    const names = new Map<number, string>();
    for (const surah of surahDirectory.data?.surahs ?? []) {
      names.set(surah.surahNumber, surah.nameArabic);
    }
    return names;
  }, [surahDirectory.data]);

  // The field stays editable, so typing settles before it hits the source.
  useEffect(() => {
    const next = query.trim();
    if (next === submitted) {
      return;
    }
    const timer = setTimeout(() => setSubmitted(next), 400);
    return () => clearTimeout(timer);
  }, [query, submitted]);

  const requestKey = `${submitted}:${reloadKey}`;
  useEffect(() => {
    if (submitted.length === 0) {
      return;
    }
    let active = true;
    quranContentProvider
      .searchAyahs(submitted, 30)
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
  }, [reloadKey, requestKey, submitted]);

  const searching = submitted.length > 0 && (!state || state.key !== requestKey);

  return (
    <View style={styles.panelColumn}>
      <View
        style={[
          styles.searchField,
          { backgroundColor: palette.background, borderColor: palette.border },
        ]}>
        <Ionicons name="search" size={16} color={palette.textSecondary} />
        <TextInput
          accessibilityLabel="كلمة البحث"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmitted(query.trim())}
          placeholder="ابحث عن كلمة أو آية"
          placeholderTextColor={palette.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          style={[styles.searchInput, { color: palette.text }]}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="مسح البحث"
            onPress={() => {
              setQuery('');
              setSubmitted('');
            }}>
            <Ionicons name="close-circle" size={17} color={palette.textSecondary} />
          </Pressable>
        )}
      </View>

      {submitted.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.hintText, { color: palette.textSecondary }]}>
            اكتب كلمة للبحث عنها في المصحف.
          </Text>
        </View>
      ) : searching ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={[styles.hintText, { color: palette.textSecondary }]}>جارٍ البحث في المصحف…</Text>
        </View>
      ) : state?.error ? (
        <View style={styles.centered}>
          <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setReloadKey((key) => key + 1)}
            style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
            <Text style={[styles.primaryButtonText, { color: palette.background }]}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (state?.results.length ?? 0) === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.hintText, { color: palette.textSecondary }]}>
            لا توجد نتائج مطابقة في المصحف.
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.resultCount, { color: palette.textSecondary }]}>
            {`${toArabicNumbers(state?.results.length ?? 0)} نتيجة`}
          </Text>
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.dialogBody}
            keyboardShouldPersistTaps="handled">
            {state?.results.map((result) => (
              <Pressable
                key={`${result.surahNumber}:${result.ayahNumber}`}
                accessibilityRole="button"
                onPress={() => onOpenAyah(result.surahNumber, result.ayahNumber)}
                style={({ pressed }) => [
                  styles.resultCard,
                  { backgroundColor: palette.background, borderColor: palette.border },
                  pressed && styles.pressed,
                ]}>
                <View style={styles.resultHead}>
                  <Text style={[styles.resultSurah, { color: palette.text }]} numberOfLines={1}>
                    {surahNames.get(result.surahNumber) ?? `سورة ${toArabicNumbers(result.surahNumber)}`}
                  </Text>
                  <View style={[styles.refChip, { backgroundColor: palette.backgroundSelected }]}>
                    <Text style={[styles.refChipText, { color: palette.primary }]}>
                      {`آية ${toArabicNumbers(result.ayahNumber)}`}
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={15} color={palette.textSecondary} />
                </View>
                {result.text.length > 0 && (
                  <Text style={[styles.ayahText, { color: palette.text }]} numberOfLines={3}>
                    {result.text}
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

/** Recording length as `م:ثث`, written with Arabic-Indic digits like the dates above. */
function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const seconds = toArabicNumbers(totalSeconds % 60).padStart(2, '٠');
  return `${toArabicNumbers(Math.floor(totalSeconds / 60))}:${seconds}`;
}

/**
 * The source keys its glosses with a plain word, while the page prints the
 * fully vocalised Uthmani form, so both sides are reduced to letters.
 */
function normalizeWord(value: string): string {
  return normalizeSurahSearch(value).replace(/^ال/, '');
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
  panelColumn: {
    gap: Spacing.two,
    flexShrink: 1,
  },
  panelScroll: {
    flexShrink: 1,
  },
  searchField: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    paddingVertical: 0,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.two,
    gap: 6,
  },
  resultHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  resultSurah: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  refChip: {
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  refChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  ayahText: {
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'right',
  },
  noteTargetWord: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  ayahContextCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  meaningCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.three,
  },
  meaningText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
  },
  meaningRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.two,
    gap: 3,
  },
  meaningRowWord: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  meaningRowText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
  sourceNote: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: Spacing.one,
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
  recorderCard: {
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
  },
  recorderHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  recorderBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recorderText: {
    flex: 1,
    gap: 1,
  },
  recorderTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  recorderHint: {
    fontSize: 12,
    textAlign: 'right',
  },
  recordOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  recordTimer: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  voiceRow: {
    minHeight: 56,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.two,
  },
  voicePlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInfo: {
    flex: 1,
    gap: 1,
  },
  voiceDuration: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  voiceMeta: {
    fontSize: 11,
    textAlign: 'right',
  },
  voiceDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(178, 76, 76, 0.1)',
  },
  primaryButton: {
    minHeight: 44,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
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
    fontWeight: '700',
    textAlign: 'right',
  },
  noteCard: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
  },
  noteFooter: {
    flexDirection: 'row-reverse',
  },
  noteDelete: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: 'rgba(178, 76, 76, 0.1)',
  },
  noteDeleteText: {
    color: '#B24C4C',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
