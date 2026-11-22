import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, TypeScale } from '@/constants/theme';
import {
  HEART_COLOR_FIELDS,
  HEART_COLOR_SWATCHES,
  type HeartColorKey,
  type HeartColorOverrides,
  type HeartPalette,
} from '@/features/memorization/services/heart-appearance';
import { useTheme } from '@/hooks/use-theme';

type HeartAppearanceSheetProps = {
  visible: boolean;
  /** Fully resolved colours — the theme defaults plus the reader's choices. */
  palette: HeartPalette;
  /** The keys the reader actually changed, used to flag custom rows. */
  overrides: HeartColorOverrides;
  onSelectColor: (key: HeartColorKey, color: string) => void;
  onReset: () => void;
  onClose: () => void;
};

/** `true` when a swatch is light enough to need a dark tick on it. */
function isLightColor(hex: string): boolean {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 0xff;
  const green = (value >> 8) & 0xff;
  const blue = value & 0xff;
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150;
}

/**
 * Lets the reader recolour every layer of the heart map — the backdrop, the two
 * cell states, both label states and the focus outline. Choices are kept as
 * overrides on top of the theme palette, so switching light/dark still works for
 * anything left untouched.
 */
export function HeartAppearanceSheet({
  visible,
  palette,
  overrides,
  onSelectColor,
  onReset,
  onClose,
}: HeartAppearanceSheetProps) {
  const colors = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.text }]}>ألوان القلب</Text>
              <Text style={[styles.caption, { color: colors.textSecondary }]}>
                اختر لون كل عنصر من اللمسات أدناه
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={onClose}
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
            {HEART_COLOR_FIELDS.map((field) => (
              <View key={field.key} style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
                  {overrides[field.key] !== undefined && (
                    <View style={[styles.customTag, { backgroundColor: colors.backgroundSelected }]}>
                      <Text style={[styles.customTagText, { color: colors.primary }]}>مخصّص</Text>
                    </View>
                  )}
                </View>

                <View style={styles.swatches}>
                  {HEART_COLOR_SWATCHES.map((color) => {
                    const selected = palette[field.key].toLowerCase() === color.toLowerCase();
                    return (
                      <Pressable
                        key={`${field.key}-${color}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${field.label} ${color}`}
                        accessibilityState={{ selected }}
                        onPress={() => onSelectColor(field.key, color)}
                        style={({ pressed }) => [
                          styles.swatch,
                          {
                            backgroundColor: color,
                            borderColor: selected ? colors.text : colors.border,
                            borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                          },
                          pressed && styles.pressed,
                        ]}>
                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={isLightColor(color) ? '#12211C' : '#FFFFFF'}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="استعادة الألوان الافتراضية"
              onPress={onReset}
              style={({ pressed }) => [
                styles.secondaryButton,
                { borderColor: colors.border, backgroundColor: colors.background },
                pressed && styles.pressed,
              ]}>
              <Ionicons name="refresh" size={16} color={colors.textSecondary} />
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                الافتراضية
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="تم"
              onPress={onClose}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>تم</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: -Spacing.one,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  heading: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: TypeScale.title,
    fontWeight: '800',
    textAlign: 'right',
  },
  caption: {
    fontSize: TypeScale.micro,
    textAlign: 'right',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  field: {
    gap: Spacing.two,
  },
  fieldHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  fieldLabel: {
    fontSize: TypeScale.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  customTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  customTagText: {
    fontSize: TypeScale.micro,
    fontWeight: '700',
  },
  swatches: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: TypeScale.label,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  primaryButtonText: {
    fontSize: TypeScale.label,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
});
