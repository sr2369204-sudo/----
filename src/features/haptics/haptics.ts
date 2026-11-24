import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Settings key that stores the on/off choice. Missing means on. */
export const HAPTICS_SETTING_KEY = 'haptics.enabled';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

export function parseHapticsSetting(value: string | undefined | null): boolean {
  return value !== 'off';
}

function run(action: () => Promise<void>): void {
  if (!enabled || Platform.OS === 'web') {
    return;
  }
  action().catch(() => undefined);
}

/** Light tap for buttons: play, pause, next, previous, save. */
export function tapHaptic(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Tiny tick when something gets selected, like an ayah or a word. */
export function selectionHaptic(): void {
  run(() => Haptics.selectionAsync());
}

/** Soft confirmation when something was saved. */
export function successHaptic(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
