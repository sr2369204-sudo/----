import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, TypeScale } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type RevelationFilter = 'all' | 'makkah' | 'madinah';

const FILTERS: { key: RevelationFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'makkah', label: 'مكية' },
  { key: 'madinah', label: 'مدنية' },
];

type SurahFiltersProps = {
  value: RevelationFilter;
  onChange: (value: RevelationFilter) => void;
};

/** Segmented control for the Meccan/Medinan filter. */
export function SurahFilters({ value, onChange }: SurahFiltersProps) {
  const colors = useTheme();

  return (
    <View
      style={[styles.track, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
      {FILTERS.map((filter) => {
        const active = filter.key === value;
        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter.key)}
            style={({ pressed }) => [
              styles.segment,
              active && { backgroundColor: colors.primary },
              pressed && !active && { backgroundColor: colors.surface },
            ]}>
            <Text
              style={[
                styles.segmentText,
                { color: active ? colors.background : colors.textSecondary },
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.one,
    borderWidth: 1,
    borderRadius: 14,
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentText: {
    fontSize: TypeScale.label,
    fontWeight: '700',
  },
});
