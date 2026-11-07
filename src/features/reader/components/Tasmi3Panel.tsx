/* eslint-disable react-hooks/refs -- PanResponder callbacks read gesture offsets only during gestures. */
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RecitationScope } from '@/features/reader/services/recitation-queue';
import { useTheme } from '@/hooks/use-theme';

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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [pan] = useState(() => new Animated.ValueXY());
  const panOffset = useRef({ x: 0, y: 0 });
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          pan.setOffset(panOffset.current);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          panOffset.current = {
            x: panOffset.current.x + gesture.dx,
            y: panOffset.current.y + gesture.dy,
          };
          pan.flattenOffset();
        },
      }),
    [pan],
  );

  async function startRecording(): Promise<void> {
    setError(null);
    player.pause();
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('لم يتم منح إذن الميكروفون.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingUri(null);
      onHide();
      setExpanded(true);
    } catch (recordingError) {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
      setError(recordingError instanceof Error ? recordingError.message : 'تعذر بدء التسجيل.');
    }
  }

  async function stopRecording(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!uri) {
        throw new Error('تعذر إنشاء ملف التسجيل.');
      }

      setRecordingUri(uri);
      onReveal();
      setExpanded(true);
    } catch (recordingError) {
      setError(recordingError instanceof Error ? recordingError.message : 'تعذر حفظ التسجيل.');
    } finally {
      setBusy(false);
    }
  }

  function playRecording(): void {
    if (!recordingUri) {
      return;
    }
    if (playerStatus.playing) {
      player.pause();
      return;
    }
    player.replace({ uri: recordingUri });
    player.play();
  }

  function toggleTasmi3Button(): void {
    setExpanded((value) => !value);
  }

  async function exitTasmi3(): Promise<void> {
    if (recorderState.isRecording) {
      await recorder.stop().catch(() => undefined);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    }
    player.pause();
    onExit();
  }

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      {...panResponder.panHandlers}
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
              ? formatDuration(recorderState.durationMillis)
              : recordingUri
                ? 'تم التسجيل'
                : 'اضغط لبدء التسميع'}
          </Text>

          {recordingUri && (
            <Pressable
              accessibilityRole="button"
              onPress={playRecording}
              style={[styles.playButton, { borderColor: colors.primary }]}>
              <Ionicons name={playerStatus.playing ? 'stop' : 'play'} size={18} color={colors.primary} />
              <Text style={[styles.playLabel, { color: colors.primary }]}>
                {playerStatus.playing ? 'إيقاف التسجيل' : 'تشغيل تسجيلك للمراجعة'}
              </Text>
            </Pressable>
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

function formatDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
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
  playButton: { minHeight: 48, borderWidth: 1, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  playLabel: { fontSize: 14, fontWeight: '800' },
  exitButton: { minHeight: 40, borderRadius: 12, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  exitLabel: { fontSize: 12, fontWeight: '700' },
  error: { color: '#C62828', fontSize: 13, textAlign: 'center' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
  floatingButton: { minWidth: 58, height: 58, paddingHorizontal: 20, borderRadius: 29, borderWidth: 2, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 9 },
  floatingButtonCompact: { width: 58, paddingHorizontal: 0 },
  floatingLabel: { fontSize: 15, fontWeight: '800' },
  recordingDot: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFCDD2' },
});
