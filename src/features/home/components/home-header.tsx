import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Compact app header: brand and tagline on the right, settings on the left. */
export function HomeHeader() {
  const colors = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
          <Text style={[styles.brandMarkText, { color: colors.background }]}>م</Text>
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.brandName, { color: colors.text }]}>مصحف</Text>
          <Text style={[styles.brandCaption, { color: colors.textSecondary }]}>
            رفيق وردك اليومي
          </Text>
        </View>
      </View>

      <Link href="/settings" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="الإعدادات"
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="settings-outline" size={19} color={colors.primary} />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontSize: TypeScale.display,
    fontWeight: '700',
  },
  brandText: {
    gap: 1,
  },
  brandName: {
    fontSize: TypeScale.heading,
    fontWeight: '700',
    textAlign: 'right',
  },
  brandCaption: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
