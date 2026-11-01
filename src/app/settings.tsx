import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import { useReaderPreferencesStore, type ThemePreference } from '@/features/reader/state/reader-preferences-store';
import { useTheme } from '@/hooks/use-theme';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'تلقائي' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
];

const ArabicReciterNames: Record<number, string> = {
  1: 'عبد الباسط عبد الصمد · مجوّد',
  2: 'عبد الباسط عبد الصمد',
  3: 'عبد الرحمن السديس',
  4: 'أبو بكر الشاطري',
  5: 'هاني الرفاعي',
  6: 'محمود خليل الحصري',
  7: 'مشاري راشد العفاسي',
  9: 'محمد صديق المنشاوي',
  10: 'سعود الشريم',
  97: 'ياسر الدوسري',
  161: 'خليفة الطنيجي',
  168: 'محمد صديق المنشاوي · ترديد',
  173: 'مشاري العفاسي · بث',
};

export default function SettingsScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const themePreference = useReaderPreferencesStore((state) => state.themePreference);
  const reciterId = useReaderPreferencesStore((state) => state.reciterId);
  const savedError = useReaderPreferencesStore((state) => state.error);
  const setPreferences = useReaderPreferencesStore((state) => state.setPreferences);
  const setPreferenceError = useReaderPreferencesStore((state) => state.setError);
  const [saving, setSaving] = useState(false);
  const recitersQuery = useQuery({
    queryKey: ['quran', 'reciters'],
    queryFn: () => quranContentProvider.getReciters(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  async function savePreference(key: 'theme' | 'reciterId', value: string): Promise<void> {
    setSaving(true);
    setPreferenceError(null);
    try {
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        key,
        value,
        new Date().toISOString(),
      );
      const nextTheme = key === 'theme' ? parseThemePreference(value) : themePreference;
      setPreferences(
        nextTheme,
        key === 'reciterId' ? Number(value) : reciterId,
      );
    } catch (error) {
      setPreferenceError(
        error instanceof Error ? `تعذر حفظ الإعداد: ${error.message}` : 'تعذر حفظ الإعداد على الجهاز.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.safeArea, { backgroundColor: colors.background }])}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Link href="/" replace asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ])}>
              <Text style={[styles.backText, { color: colors.primary }]}>الرئيسية</Text>
            </Pressable>
          </Link>
          <Text style={[styles.title, { color: colors.text }]}>الإعدادات</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>المظهر</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            اختر المظهر الذي يناسب وقت قراءتك.
          </Text>
          <View style={styles.optionRow}>
            {themeOptions.map((option) => {
              const selected = themePreference === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={saving}
                  onPress={() => void savePreference('theme', option.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? colors.backgroundSelected : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text style={[styles.optionText, { color: selected ? colors.primary : colors.text }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>القارئ المفضّل</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            يُستخدم هذا القارئ لتشغيل الآيات. تسجيل الكلمة متاح من المقاطع التي يوفرها المصدر.
          </Text>
          {recitersQuery.isPending ? (
            <Text style={[styles.body, { color: colors.textSecondary }]}>جارٍ تحميل القرّاء…</Text>
          ) : recitersQuery.error ? (
            <Pressable accessibilityRole="button" onPress={() => void recitersQuery.refetch()}>
              <Text style={[styles.error, { color: colors.primary }]}>
                تعذر تحميل قائمة القرّاء. اضغط لإعادة المحاولة.
              </Text>
            </Pressable>
          ) : (
            <View style={styles.reciterList}>
              {recitersQuery.data?.map((reciter) => {
                const selected = reciterId === reciter.id;
                return (
                  <Pressable
                    key={reciter.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    disabled={saving}
                    onPress={() => void savePreference('reciterId', String(reciter.id))}
                    style={[
                      styles.reciterOption,
                      {
                        backgroundColor: selected ? colors.backgroundSelected : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <View style={styles.reciterInfo}>
                      <Text style={[styles.reciterName, { color: colors.text }]}>
                        {ArabicReciterNames[reciter.id] ?? reciter.name}
                      </Text>
                      <Text style={[styles.reciterStyle, { color: colors.textSecondary }]}>
                        {reciter.style}
                      </Text>
                    </View>
                    <Text style={[styles.radio, { color: colors.primary }]}>
                      {selected ? '●' : '○'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>مصدر المحتوى</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            صفحات المصحف وخطوطها تُحمّل عند فتحها من Quran.com وتُحفظ على الجهاز. الصفحات غير المفتوحة والتلاوات تحتاج إلى الإنترنت.
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            الألوان مستمدة من علامات التجويد التي يرفقها مصدر النص.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>الخصوصية والتخزين</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            المظهر والقارئ والملاحظات محفوظة محليًا على الجهاز. لا يوجد حساب أو مزامنة سحابية.
          </Text>
        </View>

        {(savedError || !recitersQuery.data?.some((reciter) => reciter.id === reciterId)) && (
          <Text accessibilityRole="alert" style={styles.error}>
            {savedError ?? 'القارئ المحفوظ غير موجود في قائمة المصدر. اختر قارئًا آخر.'}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function parseThemePreference(value: string): ThemePreference {
  if (value !== 'system' && value !== 'light' && value !== 'dark') {
    throw new Error('إعداد المظهر غير صالح.');
  }
  return value;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  body: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  optionRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  option: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 13,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reciterList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  reciterOption: {
    minHeight: 58,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  reciterInfo: {
    gap: 3,
  },
  reciterName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  reciterStyle: {
    fontSize: 12,
    textAlign: 'right',
  },
  radio: {
    fontSize: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
});
