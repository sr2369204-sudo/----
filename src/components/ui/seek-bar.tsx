import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TypeScale } from '@/constants/theme';
import { formatRecordingDuration } from '@/features/annotations/utils/recordings-format';
import { useTheme } from '@/hooks/use-theme';

const THUMB_SIZE = 16;

type SeekBarProps = {
  /** Playback head in seconds. */
  position: number;
  /** Length of the clip in seconds. */
  duration: number;
  /** Only the clip currently loaded in the player can be scrubbed. */
  enabled: boolean;
  onSeek: (seconds: number) => void;
};

/**
 * Draggable playback bar. The fill follows the thumb while dragging and the
 * position is only committed when the finger lifts, so the audio never chases a
 * stream of seeks mid-gesture.
 */
export function SeekBar({ position, duration, enabled, onSeek }: SeekBarProps) {
  const colors = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);

  const updateScrub = (locationX: number) => {
    if (!enabled || trackWidth <= 0) {
      return;
    }
    setScrubRatio(Math.min(1, Math.max(0, locationX / trackWidth)));
  };

  const commitScrub = () => {
    if (enabled && scrubRatio !== null && duration > 0) {
      onSeek(scrubRatio * duration);
    }
    setScrubRatio(null);
  };

  const progress = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;
  const ratio = scrubRatio ?? progress;
  const thumbLeft = Math.max(
    0,
    Math.min(trackWidth - THUMB_SIZE, ratio * trackWidth - THUMB_SIZE / 2),
  );
  const shownSeconds = scrubRatio !== null ? scrubRatio * duration : position;

  return (
    <View style={styles.row}>
      <Text style={[styles.time, { color: colors.textSecondary }]}>
        {formatRecordingDuration(shownSeconds * 1000)}
      </Text>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="شريط التحكم في التسجيل"
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => enabled}
        onMoveShouldSetResponder={() => enabled}
        onResponderGrant={(event) => updateScrub(event.nativeEvent.locationX)}
        onResponderMove={(event) => updateScrub(event.nativeEvent.locationX)}
        onResponderRelease={commitScrub}
        onResponderTerminate={commitScrub}
        style={styles.hitArea}>
        <View style={[styles.track, { backgroundColor: colors.backgroundSelected }]}>
          <View
            style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: colors.primary }]}
          />
        </View>
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                left: thumbLeft,
                borderColor: colors.primary,
                backgroundColor: enabled ? colors.primary : colors.textSecondary,
              },
            ]}
          />
        )}
      </View>
      <Text style={[styles.time, { color: colors.textSecondary }]}>
        {formatRecordingDuration(duration * 1000)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  hitArea: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: (30 - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
  },
  time: {
    fontSize: TypeScale.micro,
    fontWeight: '700',
    minWidth: 34,
    textAlign: 'center',
  },
});
