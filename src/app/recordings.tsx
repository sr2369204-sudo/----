import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeekBar } from '@/components/ui/seek-bar';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { SqliteAnnotationRepository } from '@/features/annotations/repositories/sqlite-annotation-repository';
import type { Recording } from '@/features/annotations/types';
import {
  formatRecordingCount,
  formatRecordingStamp,
} from '@/features/annotations/utils/recordings-format';
import { useTheme } from '@/hooks/use-theme';

/**
 * Every take the reader has kept for themselves, recorded from the «التسميع»
 * panel. Each row plays back and can be scrubbed with the seek bar.
 */
export default function RecordingsScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const repository = useMemo(() => new SqliteAnnotationRepository(database), [database]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const recordingsQuery = useQuery({
    queryKey: ['recordings', 'all'],
    queryFn: () => repository.listRecordings(),
  });
  const recordings = recordingsQuery.data ?? [];

  function togglePlayback(recording: Recording): void {
    setError(null);
    if (playingId === recording.id) {
      if (status.playing) {
        player.pause();
      } else {
        // A take that already played to its end has to be wound back first.
        if (status.duration > 0 && status.currentTime >= status.duration - 0.05) {
          void player.seekTo(0);
        }
        player.play();
      }
      return;
    }
    player.replace({ uri: recording.fileUri });
    player.play();
    setPlayingId(recording.id);
  }

  const seekActive = useCallback(
    (seconds: number) => {
      void player.seekTo(Math.max(0, seconds));
    },
    [player],
  );

  async function removeRecording(recording: Recording): Promise<void> {
    setBusy(true);
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
        deleteError instanceof Error ? `تعذر حذف التسجيل: ${deleteError.message}` : 'تعذر حذف التسجيل.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.title, { color: colors.text }]}>تسجيلاتي</Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>
              {recordingsQuery.isPending ? 'جارٍ التحميل…' : formatRecordingCount(recordings.length)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={() => router.back()}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </Pressable>
        </View>

        {error && (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error}
          </Text>
        )}

        {recordingsQuery.error && (
          <View style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              {recordingsQuery.error instanceof Error
                ? `تعذر تحميل التسجيلات: ${recordingsQuery.error.message}`
                : 'تعذر تحميل التسجيلات.'}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => void recordingsQuery.refetch()}>
              <Text style={[styles.retryText, { color: colors.primary }]}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        )}

        {recordingsQuery.isFetching && !recordingsQuery.isPending && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}

        {recordings.map((recording) => {
          const active = playingId === recording.id;
          const playing = active && status.playing;
          const durationSeconds =
            active && status.duration > 0 ? status.duration : recording.durationMs / 1000;
          const positionSeconds = active ? Math.min(status.currentTime, durationSeconds) : 0;
          return (
            <View
              key={recording.id}
              style={[styles.recordingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.recordingHead}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={playing ? 'إيقاف مؤقت' : 'تشغيل التسجيل'}
                  onPress={() => togglePlayback(recording)}
                  style={({ pressed }) => [
                    styles.playButton,
                    { backgroundColor: colors.primary },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name={playing ? 'pause' : 'play'} size={18} color={colors.onPrimary} />
                </Pressable>
                <View style={styles.recordingInfo}>
                  <Text style={[styles.recordingTitle, { color: colors.text }]}>
                    {formatRecordingStamp(recording.createdAt)}
                  </Text>
                  <Text style={[styles.recordingMeta, { color: colors.textSecondary }]}>
                    {playing ? 'قيد التشغيل…' : 'تسجيل خاص'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="حذف التسجيل"
                  disabled={busy}
                  onPress={() => void removeRecording(recording)}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    { backgroundColor: colors.backgroundSelected },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="trash-outline" size={18} color="#B24C4C" />
                </Pressable>
              </View>

              <SeekBar
                position={positionSeconds}
                duration={durationSeconds}
                enabled={active}
                onSeek={seekActive}
              />
            </View>
          );
        })}

        {!recordingsQuery.isPending && !recordingsQuery.error && recordings.length === 0 && (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Ionicons name="mic-outline" size={34} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد تسجيلات بعد</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              افتح المصحف ثم اضغط زر «تسميع» لتسجيل تلاوتك، وسيظهر تسجيلك هنا.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  headerTextGroup: {
    gap: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: 13,
    textAlign: 'right',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingCard: {
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  recordingHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    flex: 1,
    gap: 2,
  },
  recordingTitle: {
    fontSize: TypeScale.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  recordingMeta: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  noticeText: {
    fontSize: TypeScale.body,
    lineHeight: 22,
    textAlign: 'right',
  },
  retryText: {
    fontSize: TypeScale.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  errorText: {
    color: '#B42318',
    fontSize: TypeScale.label,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.xl,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: TypeScale.heading,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: TypeScale.label,
    lineHeight: 21,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
