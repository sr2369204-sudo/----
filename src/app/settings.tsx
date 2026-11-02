import { Link } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { Spacing } from '@/constants/theme';
import { quranContentProvider } from '@/features/quran/services/content-provider';
import {
  useReaderPreferencesStore,
  type ThemePreference,
} from '@/features/reader/state/reader-preferences-store';
import { useTheme } from '@/hooks/use-theme';

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'تلقائي' },
  { value: 'light', label: 'فاتح' },
  { value: 'dark', label: 'داكن' },
];

const fontSizePresets: { value: number; label: string }[] = [
  { value: 32, label: 'صغير' },
  { value: 44, label: 'عادي' },
  { value: 56, label: 'كبير' },
  { value: 68, label: 'كبير جداً' },
  { value: 80, label: 'أقصى ملء' },
];

const FONT_SIZE_MIN = 20;
const FONT_SIZE_MAX = 80;

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
  const queryClient = useQueryClient();
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

  const fontSizeQuery = useQuery({
    queryKey: ['settings', 'font-size'],
    queryFn: async () => {
      const row = await database.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_settings WHERE key = 'reader.fontSize'",
      );
      const parsed = row ? Number(row.value) : 44;
      return Number.isInteger(parsed) && parsed >= FONT_SIZE_MIN && parsed <= FONT_SIZE_MAX
        ? parsed
        : 44;
    },
  });

  const currentFontSize = fontSizeQuery.data ?? 44;

  async function saveFontSize(size: number): Promise<void> {
    const clamped = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, size));
    setSaving(true);
    try {
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ('reader.fontSize', ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        String(clamped),
        new Date().toISOString(),
      );
      await queryClient.invalidateQueries({ queryKey: ['reader', 'display-preferences'] });
      await queryClient.invalidateQueries({ queryKey: ['settings', 'font-size'] });
    } catch (error) {
      setPreferenceError(
        error instanceof Error ? `تعذر حفظ حجم الخط: ${error.message}` : 'تعذر حفظ حجم الخط.',
      );
    } finally {
      setSaving(false);
    }
  }

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
          <Text style={[styles.cardTitle, { color: colors.text }]}>حجم خط المصحف واستغلال المساحة</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            اضبط حجم الخط لملء مساحة الشاشة أفقياً ورأسياً وتقليل الفراغات البيضاء.
          </Text>

          <View style={styles.fontSizeStepperRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="تقليل حجم الخط"
              disabled={saving || currentFontSize <= FONT_SIZE_MIN}
              onPress={() => void saveFontSize(currentFontSize - 2)}
              style={[
                styles.stepperButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                currentFontSize <= FONT_SIZE_MIN && { opacity: 0.4 },
              ]}
            >
              <Text style={[styles.stepperGlyph, { color: colors.text }]}>−</Text>
            </Pressable>

            <View style={styles.fontSizeValueBox}>
              <Text style={[styles.fontSizeValueText, { color: colors.primary }]}>
                {toArabicSettingDigits(currentFontSize)}
              </Text>
              <Text style={[styles.fontSizeUnitText, { color: colors.textSecondary }]}>مستوى</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="زيادة حجم الخط"
              disabled={saving || currentFontSize >= FONT_SIZE_MAX}
              onPress={() => void saveFontSize(currentFontSize + 2)}
              style={[
                styles.stepperButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                currentFontSize >= FONT_SIZE_MAX && { opacity: 0.4 },
              ]}
            >
              <Text style={[styles.stepperGlyph, { color: colors.text }]}>+</Text>
            </Pressable>
          </View>

          <View style={styles.optionRow}>
            {fontSizePresets.map((preset) => {
              const selected = Math.abs(currentFontSize - preset.value) <= 1;
              return (
                <Pressable
                  key={preset.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={saving}
                  onPress={() => void saveFontSize(preset.value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? colors.backgroundSelected : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: selected ? colors.primary : colors.text }]}>
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.fontPreviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text
              style={[
                styles.fontPreviewText,
                {
                  color: colors.text,
                  fontSize: Math.min(28, Math.max(16, currentFontSize * 0.76)),
                },
              ]}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>القارئ المفضّل</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            تظهر هنا أسماء القرّاء الذين تتوفر لهم تسجيلات آيات من المصدر. تسجيل الكلمة متاح من المقاطع التي يوفرها المصدر.
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
  fontSizeStepperRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperGlyph: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  fontSizeValueBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  fontSizeValueText: {
    fontSize: 24,
    fontWeight: '800',
  },
  fontSizeUnitText: {
    fontSize: 12,
  },
  fontPreviewCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  fontPreviewText: {
    fontFamily: 'Noto Naskh Arabic',
    textAlign: 'center',
  },
});

function toArabicSettingDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}
