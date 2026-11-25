import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { confirmDelete } from '@/components/confirm-delete';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import {
  KHATMA_KIND_TEXT,
  KHATMA_PRESETS,
  khatmaStatus,
  loadKhatma,
  restartKhatma,
  saveKhatma,
  startKhatma,
  type Khatma,
  type KhatmaKind,
} from '@/features/khatma/services/khatma';
import { SURAH_START_PAGES, surahStartPage } from '@/features/khatma/data/surah-start-pages';
import { BUNDLED_SURAH_DIRECTORY } from '@/features/quran/data/bundled-surah-directory';
import { toDateKey } from '@/features/memorization/services/review-schedule';
import { loadLastReadingPosition } from '@/features/reader/services/reading-progress';
import { useTheme } from '@/hooks/use-theme';

export default function KhatmaScreen() {
  const colors = useTheme();
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const today = toDateKey(new Date());

  const khatmaQuery = useQuery({
    queryKey: ['khatma'],
    queryFn: () => loadKhatma(database),
    staleTime: 0,
  });
  const khatma = khatmaQuery.data ?? null;
  const [kind, setKind] = useState<KhatmaKind>('reading');
  const [startSurah, setStartSurah] = useState(1);
  const [pickingSurah, setPickingSurah] = useState(false);

  const persist = useCallback(
    async (next: Khatma | null) => {
      queryClient.setQueryData(['khatma'], next);
      try {
        await saveKhatma(database, next);
      } catch (error) {
        console.error('تعذر حفظ الختمة.', error);
      }
    },
    [database, queryClient],
  );

  const begin = useCallback(
    async (days: number, useExisting: boolean) => {
      const position = useExisting ? await loadLastReadingPosition(database) : null;
      // Start from the page before the last reading position, so that page still counts.
      const startPage = position ? position.pageNumber : surahStartPage(startSurah);
      await persist(
        startKhatma(today, days, {
          kind,
          startPage,
          completed: khatma?.completed ?? 0,
        }),
      );
    },
    [database, khatma?.completed, kind, persist, startSurah, today],
  );

  const status = khatma ? khatmaStatus(khatma, today) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.text }]}>متتبع الختمة</Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>
              {khatma && khatma.completed > 0
                ? `ختمات مكتملة: ${toArabicNumbers(khatma.completed)}`
                : 'اختم المصحف في المدة اللي تناسبك'}
            </Text>
          </View>
        </View>

        {!khatma || !status ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.heading, { color: colors.text }]}>نوع الختمة</Text>
            <View style={styles.presets}>
              {(Object.keys(KHATMA_KIND_TEXT) as KhatmaKind[]).map((key) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: kind === key }}
                  onPress={() => setKind(key)}
                  style={[
                    styles.preset,
                    {
                      borderColor: kind === key ? colors.primary : colors.border,
                    },
                    {
                      backgroundColor: kind === key ? colors.primary : colors.backgroundSelected,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetNumber,
                      {
                        fontSize: TypeScale.body,
                        color: kind === key ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {KHATMA_KIND_TEXT[key].chip}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>تبدأ من أي سورة؟</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPickingSurah((open) => !open)}
              style={[
                styles.preset,
                styles.surahButton,
                {
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name={pickingSurah ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.presetNumber, { fontSize: TypeScale.body, color: colors.text }]}>
                سورة {BUNDLED_SURAH_DIRECTORY.surahs[startSurah - 1].nameArabic} · صفحة{' '}
                {toArabicNumbers(SURAH_START_PAGES[startSurah - 1])}
              </Text>
            </Pressable>
            {pickingSurah && (
              <ScrollView nestedScrollEnabled style={styles.surahList}>
                {BUNDLED_SURAH_DIRECTORY.surahs.map((surah) => (
                  <Pressable
                    key={surah.surahNumber}
                    accessibilityRole="button"
                    onPress={() => {
                      setStartSurah(surah.surahNumber);
                      setPickingSurah(false);
                    }}
                    style={[styles.surahRow, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.note, { color: colors.textSecondary }]}>
                      صفحة {toArabicNumbers(SURAH_START_PAGES[surah.surahNumber - 1])}
                    </Text>
                    <Text
                      style={[
                        styles.note,
                        {
                          color: startSurah === surah.surahNumber ? colors.primary : colors.text,
                        },
                      ]}
                    >
                      {toArabicNumbers(surah.surahNumber)}. {surah.nameArabic}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Text style={[styles.heading, { color: colors.text }]}>في كم يوم تريد أن تختم؟</Text>
            <View style={styles.presets}>
              {KHATMA_PRESETS.map((days) => (
                <Pressable
                  key={days}
                  accessibilityRole="button"
                  accessibilityLabel={`ختمة في ${days} يوم`}
                  onPress={() => void begin(days, false)}
                  style={[
                    styles.preset,
                    {
                      backgroundColor: colors.backgroundSelected,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.presetNumber, { color: colors.primary }]}>
                    {toArabicNumbers(days)}
                  </Text>
                  <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>يوم</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.note, { color: colors.textSecondary }]}>
              بعد ما تقرأ، حدّد آية في المصحف واضغط زر الختمة عشان تسجّل وصولك. أو ابدأ من آخر موضع قراءة ليك:
            </Text>
            <View style={styles.presets}>
              {KHATMA_PRESETS.map((days) => (
                <Pressable
                  key={days}
                  accessibilityRole="button"
                  accessibilityLabel={`ختمة في ${days} يوم من آخر موضع قراءة`}
                  onPress={() => void begin(days, true)}
                  style={[styles.preset, styles.presetOutline, { borderColor: colors.border }]}
                >
                  <Text style={[styles.presetNumber, { color: colors.text }]}>{toArabicNumbers(days)}</Text>
                  <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>من آخر موضع</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <>
            <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.hero}>
              <View pointerEvents="none" style={styles.heroGlow} />
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Ionicons name="book-outline" size={22} color="#E8C77F" />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle}>{KHATMA_KIND_TEXT[khatma.kind].title}</Text>
                  <Text style={styles.heroSubtitle}>
                    {toArabicNumbers(khatma.targetDays)} يوم · اليوم {toArabicNumbers(status.daysElapsed + 1)}{' '}
                    · من سورة{' '}
                    {BUNDLED_SURAH_DIRECTORY.surahs.find(
                      (s) => SURAH_START_PAGES[s.surahNumber - 1] === khatma.startPage,
                    )?.nameArabic ?? `صفحة ${toArabicNumbers(khatma.startPage)}`}
                  </Text>
                </View>
                <Text style={styles.heroPercent}>{toArabicNumbers(status.percent)}٪</Text>
              </View>
              <View style={styles.heroTrack}>
                <View style={[styles.heroFill, { width: `${(status.done / 604) * 100}%` }]} />
              </View>
              <Text style={styles.heroFoot}>
                {toArabicNumbers(status.done)} من ٦٠٤ صفحة · باقي {toArabicNumbers(status.remaining)}
              </Text>
            </GlassSurface>

            {status.finished ? (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Text style={[styles.heading, { color: colors.text }]}>ما شاء الله، ختمت المصحف</Text>
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                  تقبّل الله منك. تحب تبدأ ختمة جديدة؟
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void persist(restartKhatma(khatma, today))}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.primaryText}>ابدأ ختمة جديدة</Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.statRow}>
                  <Stat label="ورد اليوم" value={`${toArabicNumbers(status.perDay)} صفحة`} />
                  <Stat label="قرأت اليوم" value={toArabicNumbers(status.todayDone)} />
                  <Stat label="الأيام المتبقية" value={toArabicNumbers(status.daysLeft)} />
                </View>
                <Text
                  style={[
                    styles.note,
                    {
                      color: status.behindBy > 0 ? '#B24C4C' : colors.textSecondary,
                    },
                  ]}
                >
                  {status.behindBy > 0
                    ? `متأخر ${toArabicNumbers(status.behindBy)} صفحة عن الخطة. زيد شوية في وردك.`
                    : status.behindBy < 0
                      ? `متقدم ${toArabicNumbers(-status.behindBy)} صفحة عن الخطة. ثبّتك الله.`
                      : 'ماشي على الخطة بالظبط.'}
                </Text>
                {status.nextPage !== null && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/reader',
                        params: { pageNumber: String(status.nextPage) },
                      })
                    }
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.primaryText}>كمّل من صفحة {toArabicNumbers(status.nextPage)}</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                confirmDelete(
                  'إلغاء الختمة؟',
                  'سيتم مسح تقدم هذه الختمة. سجل قراءتك العام يبقى كما هو.',
                  () => void persist(null),
                )
              }
              style={styles.reset}
            >
              <Text style={[styles.note, { color: colors.textSecondary }]}>إلغاء الختمة والبدء من جديد</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleGroup: { flex: 1, alignItems: 'flex-end', gap: 2 },
  title: { fontSize: TypeScale.display, fontWeight: '900' },
  caption: { fontSize: TypeScale.caption },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { padding: Spacing.three, gap: 12 },
  heroGlow: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(216, 181, 109, 0.16)',
  },
  heroTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216, 181, 109, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(216, 181, 109, 0.45)',
  },
  heroCopy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  heroTitle: { fontSize: TypeScale.title, fontWeight: '900', color: '#FFF9EA' },
  heroSubtitle: {
    fontSize: TypeScale.caption,
    color: 'rgba(239, 248, 243, 0.7)',
  },
  heroPercent: { fontSize: 30, fontWeight: '900', color: '#F3D28C' },
  heroTrack: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row-reverse',
  },
  heroFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: '#D8B56D',
  },
  heroFoot: {
    fontSize: TypeScale.caption,
    color: 'rgba(239, 248, 243, 0.8)',
    textAlign: 'right',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: 12,
  },
  heading: { fontSize: TypeScale.title, fontWeight: '800', textAlign: 'right' },
  note: { fontSize: TypeScale.label, textAlign: 'right', lineHeight: 22 },
  presets: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing.two },
  preset: {
    minWidth: 62,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  presetOutline: { backgroundColor: 'transparent' },
  presetNumber: { fontSize: TypeScale.title, fontWeight: '900' },
  presetLabel: { fontSize: TypeScale.micro },
  bigPercent: { fontSize: 44, fontWeight: '900', textAlign: 'center' },
  track: { height: 10, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  statRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: TypeScale.heading, fontWeight: '900' },
  statLabel: { fontSize: TypeScale.micro },
  primaryButton: {
    paddingVertical: 13,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: TypeScale.body,
  },
  surahButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surahList: { maxHeight: 220 },
  surahRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  reset: { alignSelf: 'center', padding: 8 },
});
