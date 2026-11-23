import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isNativeUpdateRequired, openAndroidUpdateDownload } from '@/constants/release';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Announces the native build that carries the Quran Heart. The Heart needs
 * `react-native-svg`, an over-the-air update can never add native code, and a
 * binary without it is left with no way in — so the download is offered here,
 * inside the app, instead of asking the reader to find the file themselves.
 */
export function AppUpdateBanner() {
  const colors = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleDownload = useCallback(async () => {
    try {
      await openAndroidUpdateDownload();
      setFailed(false);
    } catch (error) {
      console.error('تعذر فتح رابط تنزيل الإصدار الجديد.', error);
      setFailed(true);
    }
  }, []);

  if (dismissed || !isNativeUpdateRequired()) {
    return null;
  }

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSelected }]}>
        <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
      </View>

      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: colors.text }]}>يوجد إصدار جديد من التطبيق</Text>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          {failed
            ? 'تعذّر فتح رابط التنزيل. تحقّق من اتصالك وحاول مرة أخرى.'
            : 'نزّل النسخة الأحدث لتفتح خريطة قلب القرآن.'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="تنزيل الإصدار الجديد"
        onPress={() => void handleDownload()}
        style={({ pressed }) => [
          styles.action,
          { backgroundColor: colors.primary, borderColor: colors.primary },
          pressed && styles.pressed,
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
