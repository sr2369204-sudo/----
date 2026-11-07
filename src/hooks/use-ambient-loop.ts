import { useEffect } from 'react';
import {
  Easing,
  ReduceMotion,
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * A never-ending 0 → 1 loop on the UI thread. It powers the quiet ambient
 * motion that keeps the interface feeling alive instead of frozen. The optional
 * delay staggers several instances out of phase, and `reverse` turns the loop
 * into a smooth back-and-forth breath instead of a one-way pass.
 */
export function useAmbientLoop(duration: number, delay = 0, reverse = true) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        reverse,
      ),
    );
    return () => cancelAnimation(progress);
  }, [delay, duration, progress, reverse]);

  return progress;
}
