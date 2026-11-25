/* eslint-disable react-hooks/refs -- PanResponder callbacks read gesture offsets only during gestures. */
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SeekBar } from '@/components/ui/seek-bar';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Recording } from '@/features/annotations/types';
import {
  formatRecordingDuration,
  formatRecordingStamp,
} from '@/features/annotations/utils/recordings-format';
import type { RecitationScope } from '@/features/reader/services/recitation-queue';
import { useTheme } from '@/hooks/use-theme';

import { friendlyError } from '@/features/errors/friendly-error';
/** Folder inside the document directory that keeps the reader's own recordings. */
const RECORDINGS_DIRECTORY = 'recordings';
/** The panel lists only the newest takes it can show without crowding. */
const RECENT_RECORDINGS_LIMIT = 3;

type Props = {
  visible: boolean;
  scope: RecitationScope;
  onHide: () => void;
  onReveal: () => void;
  onExit: () => void;
};

export function Tasmi3Panel({ visible, scope, onHide, onReveal, onExit }: Props) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const repository = useMemo(() => new SqliteAnnotationRepository(database), [database]);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);
  const recordingsQuery = useQuery({
    queryKey: ['recordings', 'recent'],
    queryFn: () => repository.listRecentRecordings(RECENT_RECORDINGS_LIMIT),
  });
  const recordings = useMemo(() => recordingsQuery.data ?? [], [recordingsQuery.data]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [pan] = useState(() => new Animated.ValueXY());
  const panOffset = useRef({ x: 0, y: 0 });
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [measuredSize, setMeasuredSize] = useState({ width: 58, height: 58 });
  const currentRecording = useMemo(
    () => recordings.find((recording) => recording.id === playingId) ?? null,
    [recordings, playingId],
  );
  const isPlayingCurrent = !!currentRecording && playerStatus.playing;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        // The open panel stays anchored so it never slides while reading; only
        // the collapsed floating button is free to be dragged around.
        onMoveShouldSetPanResponder: (_, gesture) =>
          !expanded && (Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6),
        onPanResponderGrant: () => {
          pan.setOffset(panOffset.current);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          const rawX = panOffset.current.x + gesture.dx;
          const rawY = panOffset.current.y + gesture.dy;
          const { maxX, minX, maxY, minY } = computeBounds(
            screenWidth,
            screenHeight,
            measuredSize.width,
            measuredSize.height,
            insets.bottom,
          );
          const clampedX = Math.min(Math.max(rawX, minX), maxX);
          const clampedY = Math.min(Math.max(rawY, minY), maxY);
          panOffset.current = { x: clampedX, y: clampedY };
          pan.flattenOffset();
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: false,
            friction: 14,
          }).start();
        },
      }),
    [pan, expanded, screenWidth, screenHeight, measuredSize, insets.bottom],
  );

  // Keep the floating control inside the screen whenever its size changes (for
  // example when the playback bar replaces the mic button) so it never spills
  // past an edge.
  useEffect(() => {
    const { maxX, minX, maxY, minY } = computeBounds(
      screenWidth,
      screenHeight,
      measuredSize.width,
      measuredSize.height,
      insets.bottom,
    );
    const rawX = panOffset.current.x;
    const rawY = panOffset.current.y;
    const clampedX = Math.min(Math.max(rawX, minX), maxX);
    const clampedY = Math.min(Math.max(rawY, minY), maxY);
    if (clampedX !== rawX || clampedY !== rawY) {
      panOffset.current = { x: clampedX, y: clampedY };
      pan.flattenOffset();
      Animated.spring(pan, {
        toValue: { x: clampedX, y: clampedY },
        useNativeDriver: false,
        friction: 14,
      }).start();
    }
  }, [screenWidth, screenHeight, measuredSize, insets.bottom, pan]);

  async function startRecording(): Promise<void> {
    setError(null);
    player.pause();
    setPlayingId(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('لم يتم منح إذن الميكروفون.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      onHide();
      setExpanded(true);
    } catch (recordingError) {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
      setError(friendlyError(recordingError, 'تعذر بدء التسجيل.'));
    }
  }

  async function stopRecording(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const durationMs = recorderState.durationMillis;
      await recorder.stop();
      const uri = recorder.uri;
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!uri) {
        throw new Error('تعذر إنشاء ملف التسجيل.');
      }

      // The recorder writes into the cache directory, which the system is free
      // to clear, so the take is moved somewhere durable before it is stored.
      const directory = new Directory(Paths.document, RECORDINGS_DIRECTORY);
      if (!directory.exists) {
        directory.create({ intermediates: true, idempotent: true });
      }
      const extension = RecordingPresets.HIGH_QUALITY.extension ?? '.m4a';
      const destination = new File(
        directory,
        `tasmi3-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${extension}`,
      );
      await new File(uri).move(destination);

      await repository.createRecording({ fileUri: destination.uri, durationMs });
      await queryClient.invalidateQueries({ queryKey: ['recordings'] });
      onReveal();
      setExpanded(true);
    } catch (recordingError) {
      setError(friendlyError(recordingError, 'تعذر حفظ التسجيل.'));
    } finally {
      setBusy(false);
    }
  }

  function togglePlayback(recording: Recording): void {
    if (playingId === recording.id) {
      if (playerStatus.playing) {
        player.pause();
      } else {
        // A take that already played to its end has to be wound back first.
        if (playerStatus.duration > 0 && playerStatus.currentTime >= playerStatus.duration - 0.05) {
          void player.seekTo(0);
        }
        player.play();
        // Listening to the take lets the learner compare with the page, so the
        // verses are revealed whenever playback starts.
        onReveal();
      }
      return;
    }
    player.replace({ uri: recording.fileUri });
    player.play();
    setPlayingId(recording.id);
    onReveal();
  }

  function seekBy(deltaSeconds: number): void {
    if (!currentRecording) return;
    const duration = playerStatus.duration > 0 ? playerStatus.duration : currentRecording.durationMs / 1000;
    const target = Math.max(0, Math.min(playerStatus.currentTime + deltaSeconds, duration));
    void player.seekTo(target);
  }

  function toggleTasmi3Button(): void {
    setExpanded((value) => !value);
  }

  async function removeRecording(recording: Recording): Promise<void> {
    setDeletingId(recording.id);
    setError(null);
    try {
      if (playingId === recording.id) {
        player.pause();
        setPlayingId(null);
      }
      await repository.deleteRecording(recording.id);
      const file = new File(recording.fileUri);
      if (file.exists) {
        file.delete();
      }
      await queryClient.invalidateQueries({ queryKey: ['recordings'] });
    } catch (deleteError) {
      setError(
        friendlyError(deleteError, 'تعذر حذف التسجيل.'),
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function exitTasmi3(): Promise<void> {
    if (recorderState.isRecording) {
      await recorder.stop().catch(() => undefined);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    }
    player.pause();
    setPlayingId(null);
    onExit();
  }

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      {...panResponder.panHandlers}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setMeasuredSize({ width, height });
        }
      }}
      style={[
        styles.root,
        { bottom: insets.bottom + 24, transform: pan.getTranslateTransform() },
      ]}>
      {expanded && (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>التسميع</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {describeScope(scope)}
              </Text>
            </View>
            <View style={[styles.headerIcon, { backgroundColor: colors.backgroundSelected }]}>
              <Ionicons name="mic" size={20} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.notice, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="eye-off-outline" size={20} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.text }]}>
              الآيات مخفية ببلور. اقرأها من حفظك ثم أوقف التسجيل للمراجعة.
            </Text>
          </View>

          <View
            style={[
              styles.recordRing,
              {
                borderColor: recorderState.isRecording
                  ? 'rgba(198,40,40,0.32)'
                  : 'rgba(201,151,60,0.38)',
              },
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={recorderState.isRecording ? 'إيقاف التسميع' : 'بدء التسميع'}
              disabled={busy}
              onPress={() => void (recorderState.isRecording ? stopRecording() : startRecording())}
              style={({ pressed }) => [
                styles.recordButton,
                { backgroundColor: recorderState.isRecording ? '#C62828' : colors.primary },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}>
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={recorderState.isRecording ? 'stop' : 'mic'}
                  size={30}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </View>
          <Text style={[styles.timer, { color: recorderState.isRecording ? '#C62828' : colors.textSecondary }]}>
            {recorderState.isRecording
              ? formatRecordingDuration(recorderState.durationMillis)
              : 'اضغط لبدء التسميع'}
          </Text>

          {recordings.length > 0 && (
            <View style={styles.recordings}>
              <Text style={[styles.recordingsHeading, { color: colors.textSecondary }]}>
                آخر التسجيلات
              </Text>
              <ScrollView
                style={styles.recordingsList}
                contentContainerStyle={styles.recordingsListContent}
                showsVerticalScrollIndicator={false}>
                {recordings.map((recording) => {
                  const active = playingId === recording.id;
                  const playing = active && playerStatus.playing;
                  const durationSeconds =
                    active && playerStatus.duration > 0
                      ? playerStatus.duration
                      : recording.durationMs / 1000;
                  const positionSeconds = active
                    ? Math.min(playerStatus.currentTime, durationSeconds)
                    : 0;
                  return (
                    <View
                      key={recording.id}
                      style={[styles.recordingRow, { borderColor: colors.border }]}>
                      <View style={styles.recordingHead}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={playing ? 'إيقاف التسجيل مؤقتًا' : 'تشغيل التسجيل'}
                          onPress={() => togglePlayback(recording)}
                          style={({ pressed }) => [
                            styles.recordingPlay,
                            { backgroundColor: colors.primary },
                            pressed && styles.pressed,
                          ]}>
                          <Ionicons
                            name={playing ? 'pause' : 'play'}
                            size={15}
                            color={colors.onPrimary}
                          />
                        </Pressable>
                        <Text
                          numberOfLines={1}
                          style={[styles.recordingStamp, { color: colors.text }]}>
                          {formatRecordingStamp(recording.createdAt)}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="حذف التسجيل"
                          disabled={deletingId === recording.id}
                          onPress={() => void removeRecording(recording)}
                          style={({ pressed }) => [
                            styles.recordingDelete,
                            { backgroundColor: colors.backgroundSelected },
                            pressed && styles.pressed,
                          ]}>
                          <Ionicons name="trash-outline" size={14} color="#B24C4C" />
                        </Pressable>
                      </View>
                      <SeekBar
                        position={positionSeconds}
                        duration={durationSeconds}
                        enabled={active}
                        onSeek={(seconds) => void player.seekTo(Math.max(0, seconds))}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إنهاء وضع التسميع"
            onPress={() => void exitTasmi3()}
            style={[styles.exitButton, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="musical-notes-outline" size={17} color={colors.textSecondary} />
            <Text style={[styles.exitLabel, { color: colors.textSecondary }]}>
              العودة إلى التلاوة العادية
            </Text>
          </Pressable>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </View>
      )}
      {!expanded && currentRecording ? (
        <View
          style={[
            styles.collapsedBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع 5 ثوانٍ"
            hitSlop={6}
            onPress={() => seekBy(-5)}
            style={({ pressed }) => [styles.seekButton, pressed && styles.pressed]}>
            <Ionicons name="play-back" size={18} color={colors.text} />
            <Text style={[styles.seekBadge, { color: colors.textSecondary }]}>5</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlayingCurrent ? 'إيقاف التسجيل مؤقتًا' : 'تشغيل التسجيل'}
            hitSlop={6}
            onPress={() => togglePlayback(currentRecording)}
            style={({ pressed }) => [
              styles.collapsedPlay,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}>
            <Ionicons
              name={isPlayingCurrent ? 'pause' : 'play'}
              size={20}
              color={colors.onPrimary}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تقديم 5 ثوانٍ"
            hitSlop={6}
            onPress={() => seekBy(5)}
            style={({ pressed }) => [styles.seekButton, pressed && styles.pressed]}>
            <Ionicons name="play-forward" size={18} color={colors.text} />
            <Text style={[styles.seekBadge, { color: colors.textSecondary }]}>5</Text>
          </Pressable>
          <View style={[styles.collapsedDivider, { backgroundColor: colors.border }]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="فتح أدوات التسميع"
            hitSlop={6}
            onPress={toggleTasmi3Button}
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'تصغير أدوات التسميع' : 'فتح أدوات التسميع'}
          onPress={toggleTasmi3Button}
          style={({ pressed }) => [
            styles.floatingButton,
            expanded && styles.floatingButtonCompact,
            { backgroundColor: colors.primary, borderColor: colors.accent },
            pressed && styles.pressed,
          ]}>
          <Ionicons
            name={recorderState.isRecording ? 'stop' : expanded ? 'chevron-down' : 'mic'}
            size={22}
            color={colors.onPrimary}
          />
          {!expanded && !recorderState.isRecording && (
            <Text style={[styles.floatingLabel, { color: colors.onPrimary }]}>تسميع</Text>
          )}
          {recorderState.isRecording && <View style={styles.recordingDot} />}
        </Pressable>
      )}
    </Animated.View>
  );
}

function describeScope(scope: RecitationScope): string {
  if (scope.type === 'pageRange') {
    return scope.fromPage === scope.toPage
      ? `صفحة ${scope.fromPage}`
      : `صفحات ${scope.fromPage}–${scope.toPage}`;
  }
  if (scope.type === 'surah') return `سورة ${scope.surahNumber}`;
  if (scope.type === 'juz') return `الجزء ${scope.juzNumber}`;
  if (scope.type === 'ayah') return `الآية ${scope.surahNumber}:${scope.ayahNumber}`;
  return `الآيات ${scope.surahNumber}:${scope.fromAyah}–${scope.toAyah}`;
}

/**
 * Translates the floating control's measured size into translate limits so it
 * can never be dragged beyond the screen edges. The control is anchored at
 * `right: 18` and `bottom: insets.bottom + 24`, so positive translations move
 * it left/up and negative ones move it right/down.
 */
function computeBounds(
  screenWidth: number,
  screenHeight: number,
  elementWidth: number,
  elementHeight: number,
  bottomInset: number,
): { maxX: number; minX: number; maxY: number; minY: number } {
  const rightMargin = 18;
  const bottomMargin = bottomInset + 24;
  const maxX = rightMargin;
  const minX = -(screenWidth - rightMargin - elementWidth);
  const maxY = bottomMargin;
  const minY = -(screenHeight - bottomMargin - elementHeight);
  return { maxX, minX, maxY, minY };
}

const styles = StyleSheet.create({
  root: { position: 'absolute', right: 18, alignItems: 'flex-end', zIndex: 30, gap: 10 },
  panel: { width: 300, borderWidth: 1, borderRadius: 22, padding: 18, gap: 14, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerText: { flex: 1 },
  headerIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '900', textAlign: 'right' },
  subtitle: { marginTop: 4, fontSize: 13, textAlign: 'right' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 21, textAlign: 'right' },
  recordRing: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  recordButton: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' },
  timer: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  recordings: { gap: 8 },
  recordingsHeading: { fontSize: 12, fontWeight: '800', textAlign: 'right' },
  recordingsList: { maxHeight: 236 },
  recordingsListContent: { gap: 10 },
  recordingRow: { gap: 8, borderWidth: 1, borderRadius: 14, padding: 10 },
  recordingHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  recordingPlay: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  recordingStamp: { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  recordingDelete: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  exitButton: { minHeight: 40, borderRadius: 12, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  exitLabel: { fontSize: 12, fontWeight: '700' },
  error: { color: '#C62828', fontSize: 13, textAlign: 'center' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
  floatingButton: { minWidth: 58, height: 58, paddingHorizontal: 20, borderRadius: 29, borderWidth: 2, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 9 },
  floatingButtonCompact: { width: 58, paddingHorizontal: 0 },
  floatingLabel: { fontSize: 15, fontWeight: '800' },
  recordingDot: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFCDD2' },
  collapsedBar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 6, borderRadius: 999, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 9 },
  seekButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  seekBadge: { position: 'absolute', bottom: 4, fontSize: 9, fontWeight: '800' },
  collapsedPlay: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  collapsedDivider: { width: 1, height: 26, marginHorizontal: 2 },
  expandButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
