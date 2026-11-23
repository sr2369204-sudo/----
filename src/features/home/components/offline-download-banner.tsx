import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Radius, Spacing } from '@/constants/theme';
import { OfflineLibrary } from '@/features/reader/services/offline-library';
import { useOfflineDownloadStore } from '@/features/reader/state/offline-download-store';
import { useTheme } from '@/hooks/use-theme';

/**
 * How many more pages must be stored before the space estimate is refreshed.
 * Re-reading the cache total on every single page would be wasteful, and the
 * average page size barely moves once a handful of pages are in.
 */
const SIZE_SAMPLE_STEP = 25;

/**
 * How long the "ready" state lingers before it bows out. It is an update, not a
 * call to action, so it withdraws on its own instead of waiting to be closed.
 */
const READY_AUTO_HIDE_MS = 8_000;

/**
 * Peeks while every Mushaf page is stored on the device for the first time, so
 * the reader works with no connection without the user asking for anything. It
 * reports how much room the library takes, then stays out of the way.
 */
export function OfflineDownloadBanner() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const running = useOfflineDownloadStore((state) => state.running);
  const done = useOfflineDownloadStore((state) => state.done);
  const total = useOfflineDownloadStore((state) => state.total);
  const error = useOfflineDownloadStore((state) => state.error);
  const start = useOfflineDownloadStore((state) => state.start);
  const [dismissed, setDismissed] = useState(false);
  const [sample, setSample] = useState<{ pages: number; bytes: number } | null>(null);
  const lastSampleRef = useRef(0);

  const finished = !running && !error && total > 0 && done >= total;

  useEffect(() => {
    if (done === 0) {
      return;
    }
    const due = done >= total || done - lastSampleRef.current >= SIZE_SAMPLE_STEP;
    if (!due) {
      return;
    }
    lastSampleRef.current = done;
    let active = true;
    void new OfflineLibrary(database)
      .getStoredBytes()
      .then((bytes) => {
        if (active) {
          setSample({ pages: done, bytes });
        }
      })
      .catch((sampleError: unknown) => {
        console.error('تعذر حساب المساحة التي يشغلها المحتوى المحلي.', sampleError);
      });
    return () => {
      active = false;
    };
  }, [database, done, total]);

  useEffect(() => {
    if (!finished) {
      return;
    }
    const timer = setTimeout(() => setDismissed(true), READY_AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [finished]);

  if (dismissed || (!running && !error && !finished)) {
    return null;
  }

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const estimatedBytes = sample && sample.pages > 0 && total > 0
    ? Math.round((sample.bytes / sample.pages) * total)
    : 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(340)}
      exiting={FadeOutDown.duration(340)}
      style={[
        styles.banner,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSelected }]}>
        <Ionicons
          name={error ? 'cloud-offline-outline' : finished ? 'cloud-done-outline' : 'cloud-download-outline'}
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: colors.text }]}>
          {error
            ? 'تعذّر تجهيز المحتوى المحلي'
            : finished
              ? 'المصحف جاهز للقراءة بدون إنترنت'
              : 'نجهّز المصحف للقراءة بدون إنترنت'}
        </Text>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          {error
            ? 'تحقّق من اتصالك، وسيُستأنف التحميل من حيث توقّف.'
            : total === 0
              ? 'جارٍ البدء…'
              : finished
                ? `${toArabicNumbers(total)} صفحة محفوظة على جهازك`
                : `${toArabicNumbers(done)} من ${toArabicNumbers(total)} صفحة · ${toArabicNumbers(percent)}٪`}
        </Text>
        {!error && total > 0 && (
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            {finished
              ? sample
                ? `المساحة المستخدَمة: ${formatMegabytes(sample.bytes)} ميجابايت`
                : 'جارٍ حساب المساحة المستخدَمة…'
              : estimatedBytes > 0
                ? `المتوقَّعة عند الاكتمال: ≈ ${formatMegabytes(estimatedBytes)} ميجابايت`
                : 'جارٍ حساب المساحة المطلوبة…'}
          </Text>
        )}
        {running && !error && (
          <ProgressBar
            progress={total > 0 ? done / total : 0}
            backgroundColor={colors.background}
            borderColor={colors.border}
            fillColor={colors.primary}
          />
        )}
      </View>

      {error ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إعادة المحاولة"
          onPress={() => void start(database, 'all')}
          style={[styles.action, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Ionicons name="refresh" size={16} color={colors.onPrimary} />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إخفاء"
          hitSlop={8}
          onPress={() => setDismissed(true)}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

/** Fill grows from the measured track so it stays smooth as pages come in. */
function ProgressBar({
  progress,
  backgroundColor,
  borderColor,
  fillColor,
}: {
  progress: number;
  backgroundColor: string;
  borderColor: string;
  fillColor: string;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const width = useSharedValue(0);

  useEffect(() => {
    const ratio = Math.min(Math.max(progress, 0), 1);
    width.value = withTiming(trackWidth * ratio, { duration: 300 });
  }, [progress, trackWidth, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor, borderColor }]}>
      <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
    </View>
  );
}

function toArabicNumbers(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

/** Size in megabytes with one decimal, written with Arabic-Indic digits. */
function formatMegabytes(bytes: number): string {
  return toArabicNumbers((bytes / (1024 * 1024)).toFixed(1)).replace('.', '٫');
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: 11,
    textAlign: 'right',
  },
  track: {
    height: 6,
    marginTop: 2,
    borderWidth: 1,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  action: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
});
