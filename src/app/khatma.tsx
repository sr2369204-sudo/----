import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmSheet } from '@/components/confirm-sheet';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Radius, Spacing, TypeScale } from '@/constants/theme';
import { toArabicNumbers } from '@/features/home/utils/format';
import {
  ConcentricRings,
  IslamicArch,
  KHATMA_GOLD,
  KHATMA_GOLD_LIGHT,
  KhatmaPercentRing,
} from '@/features/khatma/components/khatma-ring';
import { surahEndPage, surahStartPage } from '@/features/khatma/data/surah-start-pages';
import {
  juzRange,
  KHATMA_KIND_TEXT,
  KHATMA_PRESETS,
  khatmaStatus,
  khatmaTotal,
  loadKhatma,
  MUSHAF_PAGES,
  restartKhatma,
  saveKhatma,
  startKhatma,
  type Khatma,
  type KhatmaKind,
} from '@/features/khatma/services/khatma';
import {
  dayMonthLabel,
  khatmaRangeLabel,
  surahLabel,
  weekdayName,
} from '@/features/khatma/utils/khatma-labels';
import { toDateKey } from '@/features/memorization/services/review-schedule';
import { BUNDLED_SURAH_DIRECTORY } from '@/features/quran/data/bundled-surah-directory';
import { loadLastReadingPosition } from '@/features/reader/services/reading-progress';
import { useTheme } from '@/hooks/use-theme';

type RangeMode = 'full' | 'juz' | 'surah' | 'custom';

const KIND_ICONS: Record<KhatmaKind, keyof typeof Ionicons.glyphMap> = {
  reading: 'book-outline',
  memorization: 'bulb-outline',
  review: 'refresh-outline',
};

const RANGE_MODES: { key: RangeMode; label: string }[] = [
  { key: 'full', label: 'المصحف كله' },
  { key: 'juz', label: 'جزء' },
  { key: 'surah', label: 'سورة' },
  { key: 'custom', label: 'من صفحة إلى صفحة' },
];

function parsePage(text: string): number | null {
  const value = Number.parseInt(
    text.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))),
    10,
  );
  return Number.isInteger(value) && value >= 1 && value <= MUSHAF_PAGES ? value : null;
}

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
  const [mode, setMode] = useState<RangeMode>('full');
  const [fullFromSurah, setFullFromSurah] = useState(1);
  const [juz, setJuz] = useState(1);
  const [singleSurah, setSingleSurah] = useState(2);
  const [startText, setStartText] = useState('1');
  const [endText, setEndText] = useState(String(MUSHAF_PAGES));
  const [days, setDays] = useState(30);
  const [daysText, setDaysText] = useState('30');
  const [picker, setPicker] = useState<null | 'full' | 'surah' | 'customStart' | 'customEnd'>(null);

  const range = useMemo<{ startPage: number; endPage: number } | null>(() => {
    if (mode === 'full') {
      const startPage = surahStartPage(fullFromSurah);
      return { startPage, endPage: startPage === 1 ? MUSHAF_PAGES : startPage - 1 };
    }
    if (mode === 'juz') {
      return juzRange(juz);
    }
    if (mode === 'surah') {
      return { startPage: surahStartPage(singleSurah), endPage: surahEndPage(singleSurah) };
    }
    const startPage = parsePage(startText);
    const endPage = parsePage(endText);
    return startPage !== null && endPage !== null && endPage >= startPage ? { startPage, endPage } : null;
  }, [endText, fullFromSurah, juz, mode, singleSurah, startText]);

  const plannedTotal = range ? khatmaTotal(range) : 0;
  const plannedPerDay = range ? Math.ceil(plannedTotal / days) : 0;

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

  const begin = useCallback(async () => {
    if (!range) {
      return;
    }
    await persist(
      startKhatma(today, days, {
        kind,
        startPage: range.startPage,
        endPage: range.endPage,
        completed: khatma?.completed ?? 0,
      }),
    );
  }, [days, khatma?.completed, kind, persist, range, today]);

  /** Starts the range from the page where the reader last stopped. */
  const startFromLastPosition = useCallback(async () => {
    const position = await loadLastReadingPosition(database);
    if (position) {
      setMode('custom');
      setStartText(String(position.pageNumber));
      setEndText(String(MUSHAF_PAGES));
    }
  }, [database]);

  const setDaysValue = (value: number) => {
    const next = Math.max(1, Math.min(365, value));
    setDays(next);
    setDaysText(String(next));
  };

  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = khatma ? khatmaStatus(khatma, today) : null;

  const surahList = (onPick: (surah: number) => void, selected: number) => (
    <ScrollView nestedScrollEnabled style={styles.surahList}>
      {BUNDLED_SURAH_DIRECTORY.surahs.map((surah) => (
        <Pressable
          key={surah.surahNumber}
          accessibilityRole="button"
          onPress={() => {
            onPick(surah.surahNumber);
            setPicker(null);
          }}
          style={[styles.surahRow, { borderColor: colors.border }]}
        >
          <Text style={[styles.note, { color: colors.textSecondary }]}>
            ص {toArabicNumbers(surahStartPage(surah.surahNumber))}
          </Text>
          <Text
            style={[
              styles.note,
              {
                color: selected === surah.surahNumber ? colors.primary : colors.text,
                fontWeight: selected === surah.surahNumber ? '900' : '400',
              },
            ]}
          >
            {toArabicNumbers(surah.surahNumber)}. {surah.nameArabic}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const surahButton = (label: string, target: 'full' | 'surah' | 'customStart' | 'customEnd') => (
    <Pressable
      accessibilityRole="button"
      onPress={() => setPicker(picker === target ? null : target)}
      style={[
        styles.selectField,
        styles.surahButton,
        { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
      ]}
    >
      <Ionicons
        name={picker === target ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={colors.textSecondary}
      />
      <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );

  const tile = (
    label: string,
    active: boolean,
    onPress: () => void,
    sizeStyle: object,
    icon?: keyof typeof Ionicons.glyphMap,
    key?: string | number,
  ) => (
    <Pressable
      key={key ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.choiceTile,
        sizeStyle,
        {
          borderColor: active ? KHATMA_GOLD : colors.border,
          backgroundColor: active ? colors.primary : colors.backgroundSelected,
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={active ? KHATMA_GOLD_LIGHT : colors.textSecondary} />
      ) : null}
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tileText, { color: active ? '#FFFFFF' : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );

  const sectionHead = (n: number, title: string) => (
    <View style={styles.cardHead}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{toArabicNumbers(n)}</Text>
      </View>
      <Text style={[styles.heading, { color: colors.text }]}>{title}</Text>
    </View>
  );

  const pageInput = (value: string, onChange: (text: string) => void, label: string) => (
    <View style={styles.pageField}>
      <Text style={[styles.note, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={3}
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSelected },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
                : 'اجعل لك وردًا ثابتًا مع كتاب الله'}
            </Text>
          </View>
        </View>

        {!khatma || !status ? (
          <>
            <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.setupHero}>
              <ConcentricRings size={200} opacity={0.1} style={styles.heroRings} />
              <IslamicArch width={56} opacity={0.16} style={styles.heroArch} />
              <Text style={styles.bismillah}>بسم الله الرحمن الرحيم</Text>
              <Text style={styles.setupTitle}>ابدأ ختمة جديدة</Text>
              <Text style={styles.setupSub}>اختر النوع والنطاق والمدة، وسنحسب لك ورد كل يوم.</Text>
            </GlassSurface>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {sectionHead(1, 'نوع الختمة')}
              <View style={styles.kindRow}>
                {(Object.keys(KHATMA_KIND_TEXT) as KhatmaKind[]).map((key) =>
                  tile(
                    KHATMA_KIND_TEXT[key].chip,
                    kind === key,
                    () => setKind(key),
                    styles.kindTile,
                    KIND_ICONS[key],
                  ),
                )}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {sectionHead(2, 'النطاق')}
              <View style={styles.tileRow}>
                {RANGE_MODES.map((item) =>
                  tile(
                    item.label,
                    mode === item.key,
                    () => {
                      setMode(item.key);
                      setPicker(null);
                    },
                    styles.tileHalf,
                  ),
                )}
              </View>

              {mode === 'full' && (
                <>
                  <Text style={[styles.note, { color: colors.textSecondary }]}>
                    تقدر تبدأ من أي سورة، وتكمل لحد ما ترجع لنقطة البداية.
                  </Text>
                  {surahButton(
                    `تبدأ من سورة ${BUNDLED_SURAH_DIRECTORY.surahs[fullFromSurah - 1].nameArabic}`,
                    'full',
                  )}
                  {picker === 'full' && surahList(setFullFromSurah, fullFromSurah)}
                </>
              )}
              {mode === 'juz' && (
                <View style={styles.juzGrid}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((n) =>
                    tile(toArabicNumbers(n), juz === n, () => setJuz(n), styles.juzTile, undefined, n),
                  )}
                </View>
              )}
              {mode === 'surah' && (
                <>
                  {surahButton(`سورة ${BUNDLED_SURAH_DIRECTORY.surahs[singleSurah - 1].nameArabic}`, 'surah')}
                  {picker === 'surah' && surahList(setSingleSurah, singleSurah)}
                </>
              )}
              {mode === 'custom' && (
                <>
                  <View style={styles.pagesRow}>
                    {pageInput(startText, setStartText, 'من صفحة')}
                    {pageInput(endText, setEndText, 'إلى صفحة')}
                  </View>
                  <View style={styles.pagesRow}>
                    {surahButton('من أول سورة…', 'customStart')}
                    {surahButton('إلى آخر سورة…', 'customEnd')}
                  </View>
                  {picker === 'customStart' && surahList((n) => setStartText(String(surahStartPage(n))), 0)}
                  {picker === 'customEnd' && surahList((n) => setEndText(String(surahEndPage(n))), 0)}
                  {range === null && (
                    <Text style={[styles.note, { color: '#B24C4C' }]}>
                      اكتب أرقام صفحات من ١ إلى ٦٠٤، ورقم النهاية لا يقل عن رقم البداية.
                    </Text>
                  )}
                </>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => void startFromLastPosition()}
                style={styles.lastPosition}
              >
                <Ionicons name="bookmark-outline" size={16} color={colors.primary} />
                <Text style={[styles.link, { color: colors.primary }]}>ابدأ من آخر موضع قراءة ليك</Text>
              </Pressable>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {sectionHead(3, 'في كم يوم؟')}
              <View style={styles.daysRow}>
                {KHATMA_PRESETS.map((value) =>
                  tile(
                    toArabicNumbers(value),
                    days === value,
                    () => setDaysValue(value),
                    styles.dayTile,
                    undefined,
                    value,
                  ),
                )}
              </View>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="زيادة يوم"
                  onPress={() => setDaysValue(days + 1)}
                  style={[styles.stepButton, { borderColor: colors.border }]}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
                <View style={styles.daysField}>
                  <TextInput
                    value={daysText}
                    keyboardType="number-pad"
                    maxLength={3}
                    onChangeText={(text) => {
                      setDaysText(text);
                      const parsed = Number.parseInt(text, 10);
                      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 365) {
                        setDays(parsed);
                      }
                    }}
                    style={[
                      styles.input,
                      styles.daysInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundSelected,
                      },
                    ]}
                  />
                  <Text style={[styles.note, { color: colors.textSecondary }]}>يوم</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="إنقاص يوم"
                  onPress={() => setDaysValue(days - 1)}
                  style={[styles.stepButton, { borderColor: colors.border }]}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <GlassSurface variant="emerald" radius={Radius.lg} contentStyle={styles.summary}>
              <Text style={styles.summaryTitle}>
                {KHATMA_KIND_TEXT[kind].title}
                {range ? ` · ${khatmaRangeLabel(range)}` : ''}
              </Text>
              {range ? (
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryNumber}>{toArabicNumbers(plannedTotal)}</Text>
                    <Text style={styles.summaryLabel}>صفحة</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryNumber}>{toArabicNumbers(days)}</Text>
                    <Text style={styles.summaryLabel}>يوم</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryNumber}>{toArabicNumbers(plannedPerDay)}</Text>
                    <Text style={styles.summaryLabel}>صفحة كل يوم</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.summaryText}>حدّد النطاق أولاً</Text>
              )}
            </GlassSurface>
            <Pressable
              accessibilityRole="button"
              disabled={range === null}
              onPress={() => void begin()}
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: range ? 1 : 0.4 }]}
            >
              <Ionicons name="book-outline" size={20} color={KHATMA_GOLD_LIGHT} />
              <Text style={styles.primaryText}>ابدأ الختمة</Text>
            </Pressable>
          </>
        ) : (
          <>
            <GlassSurface variant="emerald" radius={Radius.xl} contentStyle={styles.hero}>
              <View pointerEvents="none" style={styles.heroGlow} />
              <ConcentricRings size={230} opacity={0.1} style={styles.heroRings} />
              <IslamicArch width={64} opacity={0.14} style={styles.heroArch} />
              <Text style={styles.bismillah}>بسم الله الرحمن الرحيم</Text>
              <View style={styles.heroMain}>
                <KhatmaPercentRing fraction={status.done / status.total} size={132} thickness={11} />
                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle}>{KHATMA_KIND_TEXT[khatma.kind].title}</Text>
                  <Text style={styles.heroSubtitle}>{khatmaRangeLabel(khatma)}</Text>
                  <Text style={styles.heroSubtitle}>
                    {toArabicNumbers(khatma.targetDays)} يوم · اليوم {toArabicNumbers(status.daysElapsed + 1)}
                  </Text>
                  <Text style={styles.heroFoot}>
                    {toArabicNumbers(status.done)} من {toArabicNumbers(status.total)} صفحة · باقي{' '}
                    {toArabicNumbers(status.remaining)}
                  </Text>
                </View>
              </View>
            </GlassSurface>

            {!status.finished && (
            <View style={styles.tiles}>
              <Tile
                icon="today-outline"
                label="ورد اليوم"
                value={`${toArabicNumbers(status.perDay)} صفحة`}
              />
              <Tile
                icon="checkmark-done-outline"
                label="أنجزت اليوم"
                value={toArabicNumbers(status.todayDone)}
              />
              <Tile
                icon="calendar-outline"
                label="الأيام المتبقية"
                value={toArabicNumbers(status.daysLeft)}
              />
            </View>
            )}

            {status.reachedPage !== null && (
              <View
                style={[
                  styles.card,
                  styles.stopCard,
                  { backgroundColor: colors.surface, borderColor: KHATMA_GOLD },
                ]}
              >
                <View style={styles.cardHead}>
                  <Ionicons name="bookmark" size={18} color={KHATMA_GOLD} />
                  <Text style={[styles.heading, { color: colors.text }]}>وقفت عند</Text>
                </View>
                <Text style={[styles.stopText, { color: colors.text }]}>
                  {khatma.lastAyah
                    ? `${surahLabel(khatma.lastAyah.surahNumber)}، آية ${toArabicNumbers(khatma.lastAyah.ayahNumber)}`
                    : `صفحة ${toArabicNumbers(status.reachedPage)}`}
                </Text>
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                  صفحة {toArabicNumbers(status.reachedPage)}
                  {status.juz ? ` · الجزء ${toArabicNumbers(status.juz)}` : ''}
                </Text>
              </View>
            )}

            {status.finished ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
                <Text style={[styles.heading, { color: colors.text }]}>ما شاء الله، أتممت الختمة</Text>
                <Text style={[styles.note, { color: colors.textSecondary }]}>
                  تقبّل الله منك. تحب تبدأ ختمة جديدة بنفس النطاق؟
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
              <>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.cardHead}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.heading, { color: colors.text }]}>آخر ٧ أيام</Text>
                  </View>
                  <View style={styles.chart}>
                    {status.last7.map((day) => {
                      const max = Math.max(status.perDay, ...status.last7.map((d) => d.pages), 1);
                      return (
                        <View key={day.date} style={styles.chartCol}>
                          <Text style={[styles.chartValue, { color: colors.textSecondary }]}>
                            {day.pages > 0 ? toArabicNumbers(day.pages) : ''}
                          </Text>
                          <View style={[styles.chartTrack, { backgroundColor: colors.backgroundSelected }]}>
                            <View
                              style={[
                                styles.chartBar,
                                {
                                  height: `${(day.pages / max) * 100}%`,
                                  backgroundColor: day.date === today ? KHATMA_GOLD : colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.chartDay, { color: colors.textSecondary }]}>
                            {weekdayName(day.date)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text
                    style={[styles.note, { color: status.behindBy > 0 ? '#B24C4C' : colors.textSecondary }]}
                  >
                    {status.behindBy > 0
                      ? `متأخر ${toArabicNumbers(status.behindBy)} صفحة عن الخطة. زيد شوية في وردك.`
                      : status.behindBy < 0
                        ? `متقدم ${toArabicNumbers(-status.behindBy)} صفحة عن الخطة. ثبّتك الله.`
                        : 'ماشي على الخطة.'}
                  </Text>
                  {status.projectedFinish ? (
                    <Text
                      style={[styles.note, { color: status.onPace ? colors.primary : colors.textSecondary }]}
                    >
                      بالمعدل الحالي هتختم حوالي {dayMonthLabel(status.projectedFinish)}
                      {status.onPace ? '، في الميعاد.' : '.'}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/reader',
                      params: khatma.lastAyah
                        ? {
                            pageNumber: String(status.reachedPage ?? status.nextPage),
                            surahNumber: String(khatma.lastAyah.surahNumber),
                            ayahNumber: String(khatma.lastAyah.ayahNumber),
                          }
                        : { pageNumber: String(status.nextPage) },
                    })
                  }
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.primaryText}>
                    {khatma.lastAyah
                      ? 'كمّل من آخر آية وقفت عندها'
                      : `ابدأ من صفحة ${toArabicNumbers(status.nextPage)}`}
                  </Text>
                </Pressable>
              </>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => setConfirmCancel(true)}
              style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.dangerText}>إلغاء الختمة والبدء من جديد</Text>
            </Pressable>
            <ConfirmSheet
              visible={confirmCancel}
              title="إلغاء الختمة؟"
              message="سيتم مسح تقدم هذه الختمة وتبدأ من جديد. سجل قراءتك العام يبقى كما هو."
              confirmLabel="نعم، إلغاء الختمة"
              icon="refresh"
              onCancel={() => setConfirmCancel(false)}
              onConfirm={() => {
                setConfirmCancel(false);
                void persist(null);
              }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={KHATMA_GOLD} />
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
  selectField: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
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
  cardHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  chipText: { fontSize: TypeScale.label, fontWeight: '800' },
  link: { fontSize: TypeScale.label, fontWeight: '800', textAlign: 'right' },
  pagesRow: { flexDirection: 'row-reverse', gap: Spacing.two },
  pageField: { flex: 1, gap: 4 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: TypeScale.body,
    textAlign: 'center',
  },
  daysInput: { minWidth: 80 },
  stepper: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 12 },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { padding: Spacing.three, gap: 4 },
  summaryTitle: { fontSize: TypeScale.label, fontWeight: '900', color: '#FFF9EA', textAlign: 'right' },
  summaryText: { fontSize: TypeScale.caption, color: 'rgba(239, 248, 243, 0.85)', textAlign: 'right' },
  heroRings: { position: 'absolute', left: -90, bottom: -110 },
  heroArch: { position: 'absolute', right: 10, top: -34 },
  bullet: { width: 8, height: 8, borderRadius: 4 },
  setupHero: { padding: Spacing.three, gap: 6, alignItems: 'center' },
  setupTitle: { fontSize: TypeScale.display, fontWeight: '900', color: '#FFF9EA' },
  setupSub: { fontSize: TypeScale.caption, color: 'rgba(239,248,243,0.75)', textAlign: 'center' },
  section: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.three, gap: 12 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: KHATMA_GOLD,
  },
  stepBadgeText: { fontSize: TypeScale.caption, fontWeight: '900', color: '#0B3D2E' },
  tileRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  choiceTile: {
    minHeight: 48,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: 6,
    paddingHorizontal: 6,
  },
  tileText: { fontSize: TypeScale.label, fontWeight: '800', textAlign: 'center' },
  tileThird: { width: '31.8%' },
  kindRow: { flexDirection: 'row-reverse', gap: 8 },
  kindTile: { flex: 1, minWidth: 0 },
  tileHalf: { width: '48.5%' },
  juzGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  juzTile: { width: '15.4%', minHeight: 42 },
  daysRow: { flexDirection: 'row-reverse', gap: 6 },
  dayTile: { flex: 1, minHeight: 48 },
  daysField: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  lastPosition: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, alignSelf: 'flex-end' },
  summaryStats: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  summaryStat: { alignItems: 'center', gap: 2 },
  summaryNumber: { fontSize: TypeScale.display, fontWeight: '900', color: '#F3D28C' },
  summaryLabel: { fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.8)' },
  summaryDivider: { width: 1, height: 34, backgroundColor: 'rgba(216,181,109,0.35)' },
  stopCard: { borderWidth: 1.5, alignItems: 'flex-end' },
  stopText: { fontSize: TypeScale.title, fontWeight: '900', textAlign: 'right' },
  tiles: { flexDirection: 'row-reverse', gap: Spacing.two },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  chart: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 6, height: 120 },
  chartCol: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  chartTrack: { flex: 1, width: '70%', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  chartBar: { width: '100%', borderRadius: 8 },
  chartValue: { fontSize: 10, height: 14 },
  chartDay: { fontSize: 10 },
  bismillah: { fontSize: TypeScale.caption, color: KHATMA_GOLD, textAlign: 'center' },
  heroMain: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  surahRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dangerButton: {
    height: 52,
    borderRadius: Radius.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C0392B',
  },
  dangerText: { color: '#FFF', fontSize: TypeScale.body, fontWeight: '900' },
});
