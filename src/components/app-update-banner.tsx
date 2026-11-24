import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApkInstall, useNewerRelease } from '@/constants/release';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Announces a newer APK (from latest-release.json) and installs it from inside
 * the app: downloads the file, then opens Android's installer. An over-the-air
 * update can never add native code, so a new binary is the only way to get it.
 */
export function AppUpdateBanner() {
  const colors = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const release = useNewerRelease();
  const { state, start } = useApkInstall(release);

  if (dismissed || release === null) {
    return null;
  }

  const downloading = state.status === 'downloading';
  let caption = `نزّل النسخة ${release.version} وثبّتها فوق النسخة الحالية.`;
  if (downloading) {
    caption =
      state.progress === null
        ? 'جاري التنزيل...'
        : `جاري التنزيل ${Math.round(state.progress * 100)}٪`;
  } else if (state.status === 'opened-page') {
    caption = 'تعذّر التنزيل داخل التطبيق، فتحنا لك صفحة التنزيل في المتصفح.';
  }

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSelected }]}>
        <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
      </View>

      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: colors.text }]}>يوجد إصدار جديد من التطبيق</Text>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          {caption}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تنزيل الإصدار الجديد"
        disabled={downloading}
        onPress={() => void start()}
        style={({ pressed }) => [
          styles.action,
          { backgroundColor: colors.primary, borderColor: colors.primary },
          (pressed || downloading) && styles.pressed,
        ]}>
        <Ionicons name="download-outline" size={16} color={colors.onPrimary} />
        <Text style={[styles.actionText, { color: colors.onPrimary }]}>تنزيل</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="إخفاء"
        hitSlop={8}
        onPress={() => setDismissed(true)}>
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
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
    elevation: 8,
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
    gap: 3,
  },
  title: {
    fontSize: TypeScale.label,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  action: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  actionText: {
    fontSize: TypeScale.micro,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
