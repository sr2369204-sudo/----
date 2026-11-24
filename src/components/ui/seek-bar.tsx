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
  /** Playback direction for the progress fill and seek gesture. */
  direction?: 'ltr' | 'rtl';
  /** Optional progress and thumb color override. */
  accentColor?: string;
  /** Accessible name for the adjustable control. */
  accessibilityLabel?: string;
  onSeek: (seconds: number) => void;
};

/**
 * Draggable playback bar. The fill follows the thumb while dragging and the
 * position is only committed when the finger lifts, so the audio never chases a
 * stream of seeks mid-gesture.
 */
export function SeekBar({
  position,
  duration,
  enabled,
  direction = 'rtl',
  accentColor,
  accessibilityLabel = 'شريط التحكم في التسجيل',
  onSeek,
}: SeekBarProps) {
  const colors = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  const progressColor = accentColor ?? colors.primary;
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safePosition = Number.isFinite(position)
    ? Math.min(safeDuration, Math.max(0, position))
    : 0;

  const updateScrub = (locationX: number) => {
    if (!enabled || trackWidth <= 0) {
      return;
    }
    const positionRatio = locationX / trackWidth;
    setScrubRatio(Math.min(1, Math.max(0, direction === 'rtl' ? 1 - positionRatio : positionRatio)));
  };

  const commitScrub = () => {
    if (enabled && scrubRatio !== null && safeDuration > 0) {
      onSeek(Math.min(safeDuration, Math.max(0, scrubRatio * safeDuration)));
    }
    setScrubRatio(null);
  };

  const progress = safeDuration > 0 ? safePosition / safeDuration : 0;
  const ratio = scrubRatio ?? progress;
  const thumbLeft = Math.max(
    0,
    Math.min(
      trackWidth - THUMB_SIZE,
      (direction === 'rtl' ? 1 - ratio : ratio) * trackWidth - THUMB_SIZE / 2,
    ),
  );
  const shownSeconds =
    scrubRatio !== null ? scrubRatio * safeDuration : safePosition;

  return (
    <View style={styles.row}>
      <Text style={[styles.time, { color: colors.textSecondary }]}>
        {formatRecordingDuration(shownSeconds * 1000)}
      </Text>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: 0, max: safeDuration, now: shownSeconds }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => enabled}
        onMoveShouldSetResponder={() => enabled}
        onResponderGrant={(event) => updateScrub(event.nativeEvent.locationX)}
        onResponderMove={(event) => updateScrub(event.nativeEvent.locationX)}
        onResponderRelease={commitScrub}
        onResponderTerminate={commitScrub}
        style={styles.hitArea}>
        <View
          style={[
            styles.track,
            {
              backgroundColor: colors.backgroundSelected,
              alignItems: direction === 'rtl' ? 'flex-end' : 'flex-start',
            },
          ]}>
          <View
            style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: progressColor }]}
          />
        </View>
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                left: thumbLeft,
                borderColor: progressColor,
                backgroundColor: enabled ? progressColor : colors.textSecondary,
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
    width: '100%',
    minWidth: 0,
  },
  hitArea: {
    flex: 1,
    minWidth: 0,
    height: 36,
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
    top: (36 - THUMB_SIZE) / 2,
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
