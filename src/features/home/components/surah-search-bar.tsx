import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SurahSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

/** Search field for the surah list. RTL: icon and text anchored to the right. */
export function SurahSearchBar({ value, onChangeText }: SurahSearchBarProps) {
  const colors = useTheme();
  const [focused, setFocused] = useState(false);
  const accent = focused ? colors.primary : colors.textSecondary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          // Colour-only focus state: changing the border width would shift layout.
          borderColor: focused ? colors.primary : colors.border,
        },
      ]}>
      <Ionicons name="search" size={17} color={accent} />
      <TextInput
        accessibilityLabel="ابحث عن سورة"
        placeholder="ابحث باسم السورة أو رقمها"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlign="right"
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="مسح البحث"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
          <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: TypeScale.body,
  },
  pressed: {
    opacity: 0.7,
  },
});
