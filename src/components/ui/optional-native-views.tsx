import { requireNativeModule } from 'expo';
import { BlurView as NativeBlurView } from 'expo-blur';
import { LinearGradient as NativeLinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ComponentType } from 'react';
import { processColor, View } from 'react-native';

type LinearGradientProps = ComponentProps<typeof NativeLinearGradient>;
type BlurViewProps = ComponentProps<typeof NativeBlurView>;

type ExpoGlobal = {
  getViewConfig?: (moduleName: string, viewName?: string) => unknown;
};

/**
 * `expo-updates` ships JavaScript only, so a device running a build made before a
 * native module was introduced can still receive code that renders that module's
 * view. Rendering it throws and kills the app, so ask the native side whether the
 * view exists before using it.
 */
function hasNativeView(moduleName: string, viewName?: string): boolean {
  try {
    requireNativeModule(moduleName);
    return true;
  } catch {
    // View-only modules are not always exposed through the module registry.
  }

  try {
    const expo = (globalThis as { expo?: ExpoGlobal }).expo;
    return expo?.getViewConfig?.(moduleName, viewName) != null;
  } catch {
    return false;
  }
}

/**
 * Picks the most transparent stop as the flat tint, so a scrim stays light and a
 * sheen that fades to nothing disappears instead of turning into a solid block.
 */
function pickFlatTint(colors: LinearGradientProps['colors']) {
  let tint: number | null = null;
  let lowestAlpha = 256;

  for (const color of colors) {
    const processed = processColor(color);
    if (typeof processed !== 'number') {
      continue;
    }
    const alpha = (processed >>> 24) & 0xff;
    if (alpha < lowestAlpha) {
      lowestAlpha = alpha;
      tint = processed;
    }
  }

  return tint;
}

function FlatTintGradient({ colors, style, children }: LinearGradientProps) {
  return <View style={[style, { backgroundColor: pickFlatTint(colors) ?? undefined }]}>{children}</View>;
}

function Nothing() {
  return null;
}

/** `LinearGradient` that degrades to a flat tint when the native view is unavailable. */
export const LinearGradient: ComponentType<LinearGradientProps> = hasNativeView(
  'ExpoLinearGradient',
)
  ? NativeLinearGradient
  : FlatTintGradient;

/** `BlurView` that renders nothing when the native view is unavailable. */
export const BlurView: ComponentType<BlurViewProps> = hasNativeView('ExpoBlur', 'ExpoBlurView')
  ? NativeBlurView
  : Nothing;
