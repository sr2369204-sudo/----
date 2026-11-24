import type { AudioMode } from 'expo-audio';

/**
 * Plain playback: plays with the silent switch on, keeps playing when the
 * screen locks or the app goes to the background, and owns the lock screen
 * controls (they need `doNotMix`).
 */
export const PLAYBACK_AUDIO_MODE: Partial<AudioMode> = {
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'doNotMix',
  allowsRecording: false,
};
