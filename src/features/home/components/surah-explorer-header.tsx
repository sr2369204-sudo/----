import { StyleSheet, Text, View } from 'react-native';

import { TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import { useTheme } from '@/hooks/use-theme';

type SurahExplorerHeaderProps = {
  /** Surahs currently listed, so the subtitle follows the active search/filter. */
  count: number;
};

/** Title block that opens the surah explorer, with a small Islamic ornament. */
export function SurahExplorerHeader({ count }: SurahExplorerHeaderProps) {
  const colors = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.textGroup}>
        <Text style={[styles.title, { color: colors.text }]}>سور القرآن</Text>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          {toArabicNumbers(count)} سورة
        </Text>
      </View>

      <View
        pointerEvents="none"
        style={[styles.ornament, { borderColor: colors.border }]}>
        <Text style={[styles.ornamentGlyph, { color: colors.accent }]}>۞</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    gap: 2,
  },
  title: {
    fontSize: TypeScale.title,
    fontWeight: '700',
    textAlign: 'right',
  },
  caption: {
    fontSize: TypeScale.caption,
    textAlign: 'right',
  },
  ornament: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ornamentGlyph: {
    fontSize: 17,
    lineHeight: 22,
  },
});
