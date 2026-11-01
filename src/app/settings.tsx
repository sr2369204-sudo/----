import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const colors = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Link href="/" style={[styles.backLink, { color: colors.primary }]}>
            الرئيسية
          </Link>
          <Text style={[styles.title, { color: colors.text }]}>الإعدادات</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>المظهر</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            يتبع التطبيق حاليًا مظهر الجهاز، مع دعم الوضعين الفاتح والداكن.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>مصدر المحتوى</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            يجلب التطبيق نص القرآن مباشرة من واجهة Quran.com العامة، من دون خادم خاص أو مفاتيح.
            {'\n'}يلزم اتصال بالإنترنت لتحميل السور؛ القراءة دون اتصال غير متاحة حاليًا.
          </Text>
          <ExternalLink
            href="https://quran.com/"
            style={[styles.externalLink, { color: colors.primary }]}>
            Quran.com
          </ExternalLink>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>الخصوصية والتخزين</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            الملاحظات والتمييزات محلية على الجهاز. لم تُفعّل الحسابات أو المزامنة السحابية بعد.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
  externalLink: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    paddingVertical: Spacing.two,
  },
});
