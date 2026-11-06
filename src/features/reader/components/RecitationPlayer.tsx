import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Spacing } from '@/constants/theme';
import { ReciterAvatar } from '@/features/quran/components/reciter-avatar';
import { getReciterPortrait } from '@/features/quran/services/reciter-portraits';
import type { QuranReciter } from '@/features/quran/services/content-provider';
import type { QuranSurahSummary } from '@/features/quran/types';
import type { RecitationScope } from '@/features/reader/services/recitation-queue';
import { useTheme } from '@/hooks/use-theme';

type Palette = ReturnType<typeof useTheme>;

export type RecitationPlayerStatus = {
  playing: boolean;
  isBuffering: boolean;
  currentIndex: number;
  trackCount: number;
  currentTime: number;
  duration: number;
};

export type RepeatMode = 'none' | 'all' | 'single';

type PlayerProps = {
  label: string;
  /** Distance from the bottom edge of the screen, below the safe area. */
  offsetBottom: number;
  colors: Palette;
  status: RecitationPlayerStatus;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  playbackRate: number;
  onCycleRate: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onOpenPicker: () => void;
  onOpenReciterPicker?: () => void;
  reciters: QuranReciter[];
  reciterId: number;
  onSelectReciter: (reciterId: number) => void;
  hidden?: boolean;
};

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

/** Floating recitation controller pinned to the bottom of the screen. */
export function RecitationPlayer({
  label,
  offsetBottom,
  colors,
  status,
  repeatMode,
  onCycleRepeat,
  playbackRate,
  onCycleRate,
  onTogglePlay,
  onNext,
  onPrevious,
  onClose,
  onOpenPicker,
  onOpenReciterPicker,
  reciters,
  reciterId,
  onSelectReciter,
  hidden,
}: PlayerProps) {
  const progress =
    status.duration > 0 ? Math.min(1, Math.max(0, status.currentTime / status.duration)) : 0;
  const trackLabel =
    status.trackCount > 1
      ? `الآية ${toArabicDigits(status.currentIndex + 1)} / ${toArabicDigits(status.trackCount)}`
      : 'الآية الحالية';

  const reciterIndex = reciters.findIndex((reciter) => reciter.id === reciterId);
  const currentReciter = reciterIndex >= 0 ? reciters[reciterIndex] : null;
  const canCycleReciter = reciters.length > 1 && reciterIndex >= 0;

  /** Steps to the neighbouring reciter, wrapping around the list. */
  function cycleReciter(step: number): void {
    if (!canCycleReciter) {
      return;
    }
    const next = (reciterIndex + step + reciters.length) % reciters.length;
    onSelectReciter(reciters[next].id);
  }

  return (
    <View style={[styles.wrap, { bottom: offsetBottom }]} pointerEvents="box-none">
      {!hidden && (
        <>
          <View
            style={[
              styles.reciterBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="القارئ السابق"
              hitSlop={6}
              disabled={!canCycleReciter}
              onPress={() => cycleReciter(-1)}
              style={({ pressed }) => [
                styles.reciterArrow,
                { backgroundColor: colors.backgroundSelected },
                !canCycleReciter && styles.disabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="تغيير القارئ"
              onPress={onOpenReciterPicker ?? onOpenPicker}
              style={({ pressed }) => [styles.reciterName, pressed && styles.pressed]}>
              <ReciterAvatar
                reciterId={currentReciter?.id ?? reciterId}
                size={24}
                backgroundColor={colors.backgroundSelected}
                iconColor={colors.primary}
              />
              <Text style={[styles.reciterLabel, { color: colors.text }]} numberOfLines={1}>
                {currentReciter ? currentReciter.name : 'جارٍ تحميل القرّاء…'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="القارئ التالي"
              hitSlop={6}
              disabled={!canCycleReciter}
              onPress={() => cycleReciter(1)}
              style={({ pressed }) => [
                styles.reciterArrow,
                { backgroundColor: colors.backgroundSelected },
                !canCycleReciter && styles.disabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons name="chevron-back" size={16} color={colors.text} />
            </Pressable>
          </View>

          <View
            style={[
              styles.player,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            accessibilityRole="toolbar"
            accessibilityLabel="مشغل التلاوة"
          >
            <View style={styles.playerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={status.playing ? 'إيقاف التلاوة مؤقتًا' : 'متابعة التلاوة'}
                onPress={onTogglePlay}
                style={({ pressed }) => [
                  styles.playButton,
                  { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                {status.isBuffering ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Ionicons
                    name={status.playing ? 'pause' : 'play'}
                    size={20}
                    color={colors.background}
                  />
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="تغيير نطاق التلاوة"
                onPress={onOpenPicker}
                style={styles.playerInfo}>
                <Text style={[styles.playerTitle, { color: colors.text }]} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={[styles.playerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {trackLabel}
                </Text>
              </Pressable>

              <View style={styles.playerActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="الآية السابقة"
                  hitSlop={6}
                  disabled={status.currentIndex <= 0}
                  onPress={onPrevious}
                  style={({ pressed }) => [
                    styles.iconButton,
                    status.currentIndex <= 0 && styles.disabled,
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="play-skip-back" size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="الآية التالية"
                  hitSlop={6}
                  disabled={status.currentIndex >= status.trackCount - 1}
                  onPress={onNext}
                  style={({ pressed }) => [
                    styles.iconButton,
                    status.currentIndex >= status.trackCount - 1 && styles.disabled,
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="play-skip-forward" size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    repeatMode === 'none'
                      ? 'تشغيل متكرر'
                      : repeatMode === 'all'
                        ? 'تكرار المقطع كاملًا'
                        : 'تكرار الآية الحالية'
                  }
                  accessibilityState={{ selected: repeatMode !== 'none' }}
                  hitSlop={6}
                  onPress={onCycleRepeat}
                  style={({ pressed }) => [
                    styles.iconButton,
                    repeatMode !== 'none' && { backgroundColor: colors.backgroundSelected },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons
                    name={repeatMode === 'single' ? 'repeat-outline' : 'repeat'}
                    size={18}
                    color={repeatMode === 'none' ? colors.textSecondary : colors.primary}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`سرعة التلاوة ${playbackRate} ضعف`}
                  hitSlop={6}
                  onPress={onCycleRate}
                  style={({ pressed }) => [
                    styles.rateButton,
                    { backgroundColor: colors.backgroundSelected },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.rateLabel, { color: colors.text }]}>
                    {formatRate(playbackRate)}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق المشغل"
                  hitSlop={6}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.iconButton,
                    { backgroundColor: colors.backgroundSelected },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="close" size={17} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </>
      )}

    </View>
  );
}

type ReciterPickerProps = {
  visible: boolean;
  colors: Palette;
  reciters: QuranReciter[];
  reciterId: number;
  onSelect: (reciterId: number) => void;
  onClose: () => void;
};

export function ReciterPickerDialog({
  visible,
  colors,
  reciters,
  reciterId,
  onSelect,
  onClose,
}: ReciterPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق قائمة القراء"
          style={styles.dialogBackdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={styles.dialogHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.headerRow}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>اختر القارئ</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" onPress={onClose} hitSlop={12}>
                <View style={[styles.closeCircle, { backgroundColor: colors.backgroundSelected }]}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </View>
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.reciterList}
            contentContainerStyle={styles.reciterListContent}
            showsVerticalScrollIndicator={false}>
            {reciters.map((reciter) => {
              const selected = reciter.id === reciterId;
              const portrait = getReciterPortrait(reciter.id);
              return (
                <View key={reciter.id} style={styles.reciterItemGroup}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onSelect(reciter.id);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.reciterItem,
                      { backgroundColor: selected ? colors.primary + '10' : colors.background },
                      selected && { borderColor: colors.primary },
                      pressed && styles.pressed,
                    ]}>
                    <ReciterAvatar
                      reciterId={reciter.id}
                      size={46}
                      backgroundColor={selected ? colors.primary : colors.backgroundSelected}
                      iconColor={selected ? colors.background : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.reciterItemLabel,
                        { color: selected ? colors.primary : colors.text },
                        selected && { fontWeight: '900' },
                      ]}>
                      {reciter.name}
                    </Text>
                    {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </Pressable>
                  {portrait && (
                    <ExternalLink href={portrait.sourceUrl} style={styles.photoCredit}>
                      <Text style={styles.photoCreditText}>
                        {`مصدر الصورة: ${portrait.credit} · ${portrait.license}`}
                      </Text>
                    </ExternalLink>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** Steps the speed through the supported rates and wraps back to normal. */
export function nextPlaybackRate(current: number): number {
  const index = PLAYBACK_RATES.indexOf(current);
  if (index === -1) {
    return 1;
  }
  return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
}

function formatRate(rate: number): string {
  return `${Number.isInteger(rate) ? rate : rate.toFixed(2).replace(/0$/, '')}×`;
}

type Mode = 'current' | 'surah' | 'juz' | 'pages';

type ScopeDialogProps = {
  visible: boolean;
  colors: Palette;
  reciters: QuranReciter[];
  reciterId: number;
  surahs: QuranSurahSummary[] | undefined;
  currentSurahNumber: number;
  currentJuzNumber: number;
  currentPageNumber: number;
  currentAyahNumber: number;
  busy: boolean;
  error: string | null;
  onSelectReciter: (reciterId: number) => void;
  onConfirm: (scope: RecitationScope) => void;
  onClose: () => void;
};

export function RecitationScopeDialog({
  visible,
  colors,
  reciters,
  reciterId,
  surahs,
  currentSurahNumber,
  currentJuzNumber,
  currentPageNumber,
  currentAyahNumber,
  busy,
  error,
  onSelectReciter,
  onConfirm,
  onClose,
}: ScopeDialogProps) {
  const [mode, setMode] = useState<Mode>('current');
  const [surahValue, setSurahValue] = useState(String(currentSurahNumber));
  const [juzValue, setJuzValue] = useState(String(currentJuzNumber));
  const [fromPage, setFromPage] = useState(String(currentPageNumber));
  const [toPage, setToPage] = useState(String(Math.min(604, currentPageNumber + 4)));
  const [localError, setLocalError] = useState<string | null>(null);

  const modes: { key: Mode; label: string }[] = [
    { key: 'current', label: 'من هنا' },
    { key: 'surah', label: 'سورة' },
    { key: 'juz', label: 'جزء' },
    { key: 'pages', label: 'صفحات' },
  ];

  const surahName = surahs?.find((surah) => surah.surahNumber === parseNumber(surahValue));

  function submit(): void {
    setLocalError(null);
    try {
      if (mode === 'current') {
        onConfirm({
          type: 'pageRange',
          fromPage: currentPageNumber,
          toPage: currentPageNumber,
        });
        return;
      }
      if (mode === 'surah') {
        const surahNumber = parseNumber(surahValue);
        if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
          throw new RangeError('رقم السورة يجب أن يكون بين ١ و١١٤.');
        }
        onConfirm({ type: 'surah', surahNumber });
        return;
      }
      if (mode === 'juz') {
        const juzNumber = parseNumber(juzValue);
        if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
          throw new RangeError('رقم الجزء يجب أن يكون بين ١ و٣٠.');
        }
        onConfirm({ type: 'juz', juzNumber });
        return;
      }
      const start = parseNumber(fromPage);
      const end = parseNumber(toPage);
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end > 604 ||
        start > end
      ) {
        throw new RangeError('نطاق الصفحات يجب أن يكون بين ١ و٦٠٤.');
      }
      onConfirm({ type: 'pageRange', fromPage: start, toPage: end });
    } catch (validationError) {
      setLocalError(
        validationError instanceof Error ? validationError.message : 'تحقق من القيم المدخلة.',
      );
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق اختيار التلاوة"
          style={styles.dialogBackdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={styles.dialogHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.headerRow}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>إعدادات التلاوة</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" onPress={onClose} hitSlop={12}>
                <View style={[styles.closeCircle, { backgroundColor: colors.backgroundSelected }]}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.dialogContent}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>القارئ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {reciters.length === 0 ? (
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  جارٍ تحميل قائمة القرّاء…
                </Text>
              ) : (
                reciters.map((reciter) => {
                  const selected = reciter.id === reciterId;
                  return (
                    <Pressable
                      key={reciter.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onSelectReciter(reciter.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? colors.primary : colors.backgroundSelected,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.chipLabel,
                          { color: selected ? colors.background : colors.text },
                        ]}>
                        {reciter.name}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>النطاق</Text>
            <View style={styles.modeRow}>
              {modes.map((option) => {
                const selected = mode === option.key;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMode(option.key)}
                    style={[
                      styles.modeChip,
                      {
                        backgroundColor: selected ? colors.backgroundSelected : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.modeLabel,
                        { color: selected ? colors.primary : colors.text },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {mode === 'current' && (
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              سيتم تشغيل الصفحة الحالية ({toArabicDigits(currentPageNumber)}) بدءًا من الآية{' '}
              {toArabicDigits(currentAyahNumber)}.
            </Text>
          )}

          {mode === 'surah' && (
            <View style={styles.inputGroup}>
              <TextInput
                accessibilityLabel="رقم السورة"
                keyboardType="number-pad"
                value={surahValue}
                onChangeText={setSurahValue}
                placeholder="رقم السورة (١–١١٤)"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
              />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                {surahName ? `سورة ${surahName.nameArabic}` : 'أدخل رقم السورة من ١ إلى ١١٤.'}
              </Text>
            </View>
          )}

          {mode === 'juz' && (
            <View style={styles.inputGroup}>
              <TextInput
                accessibilityLabel="رقم الجزء"
                keyboardType="number-pad"
                value={juzValue}
                onChangeText={setJuzValue}
                placeholder="رقم الجزء (١–٣٠)"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
              />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                سيتم تشغيل كل آيات الجزء بالترتيب.
              </Text>
            </View>
          )}

          {mode === 'pages' && (
            <View style={styles.pageRow}>
              <TextInput
                accessibilityLabel="من صفحة"
                keyboardType="number-pad"
                value={fromPage}
                onChangeText={setFromPage}
                placeholder="من صفحة"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  styles.pageInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
              />
              <Text style={[styles.rangeDash, { color: colors.textSecondary }]}>إلى</Text>
              <TextInput
                accessibilityLabel="إلى صفحة"
                keyboardType="number-pad"
                value={toPage}
                onChangeText={setToPage}
                placeholder="إلى صفحة"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  styles.pageInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
              />
            </View>
          )}

          {(localError || error) && (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {localError ?? error}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={submit}
            style={({ pressed }) => [
              styles.confirmButton,
              { backgroundColor: colors.primary },
              busy && styles.disabled,
              pressed && styles.pressed,
            ]}>
            {busy ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={[styles.confirmLabel, { color: colors.background }]}>
                <Ionicons name="play" size={15} color={colors.background} /> تشغيل
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** The three starting points offered by the long-press play menu. */
export type PlayScopeChoice = 'rest-of-surah' | 'from-page-start' | 'from-surah-start';

type IconName = ComponentProps<typeof Ionicons>['name'];

type PlayMenuProps = {
  visible: boolean;
  colors: Palette;
  /** Surah of the ayah the menu was opened on, shown as the reference. */
  surahName: string;
  ayahNumber: number;
  busy: boolean;
  error: string | null;
  onChoose: (choice: PlayScopeChoice) => void;
  onClose: () => void;
};

/**
 * Small sheet opened by long-pressing the play control. It offers the three
 * starting points for a recitation instead of the full scope dialog, so a
 * reader can start listening from where they are without leaving the page.
 */
export function RecitationPlayMenu({
  visible,
  colors,
  surahName,
  ayahNumber,
  busy,
  error,
  onChoose,
  onClose,
}: PlayMenuProps) {
  const options: { key: PlayScopeChoice; icon: IconName; label: string; hint: string }[] = [
    {
      key: 'rest-of-surah',
      icon: 'play-skip-forward',
      label: 'باقي السورة من هنا',
      hint: 'يبدأ من هذه الآية حتى نهاية السورة',
    },
    {
      key: 'from-page-start',
      icon: 'documents-outline',
      label: 'من أول الصفحة',
      hint: 'يبدأ من أول آية في الصفحة الحالية',
    },
    {
      key: 'from-surah-start',
      icon: 'book-outline',
      label: 'من أول السورة',
      hint: 'يبدأ من الآية الأولى في السورة',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق قائمة التشغيل"
          style={styles.dialogBackdrop}
          onPress={onClose}
        />
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={styles.dialogHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.headerRow}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>تشغيل التلاوة</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="إغلاق" onPress={onClose} hitSlop={12}>
                <View style={[styles.closeCircle, { backgroundColor: colors.backgroundSelected }]}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.ayahReference, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="book-outline" size={14} color={colors.primary} />
            <Text style={[styles.ayahReferenceText, { color: colors.textSecondary }]}>
              {`${surahName} · الآية ${toArabicDigits(ayahNumber)}`}
            </Text>
          </View>

          <View style={styles.optionsList}>
            {options.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                disabled={busy}
                onPress={() => onChoose(option.key)}
                style={({ pressed }) => [
                  styles.playOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  busy && styles.disabled,
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.playOptionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={option.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.playOptionText}>
                  <Text style={[styles.playOptionLabel, { color: colors.text }]}>{option.label}</Text>
                  <Text style={[styles.playOptionHint, { color: colors.textSecondary }]}>
                    {option.hint}
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={16} color={colors.border} />
              </Pressable>
            ))}
          </View>

          {error && <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>}
        </View>
      </View>
    </Modal>
  );
}

function parseNumber(value: string): number {
  const normalized = value.replace(/[٠-٩]/g, (digit) =>
    String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
  );
  return Number(normalized.trim());
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 95,
    gap: 8,
  },
  reciterBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  reciterArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterName: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  reciterLabel: {
    fontSize: 13.5,
    fontWeight: '900',
    textAlign: 'center',
  },
  player: {
    flexDirection: 'column',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  playerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 46,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: 1,
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  playerSubtitle: {
    fontSize: 11.5,
    textAlign: 'right',
    opacity: 0.7,
  },
  playerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButton: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateLabel: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  progressTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 4,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  visibilityToggle: {
    alignSelf: 'flex-start',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },

  dialogOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialog: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  dialogHeader: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  dialogContent: {
    gap: Spacing.two,
  },
  ayahReference: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  ayahReferenceText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  reciterList: {
    maxHeight: 400,
  },
  reciterListContent: {
    gap: 8,
    paddingBottom: Spacing.two,
  },
  reciterItemGroup: {
    gap: 3,
  },
  reciterItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  reciterItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  photoCredit: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  photoCreditText: {
    color: '#777',
    fontSize: 10,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  optionsList: {
    gap: 10,
    marginTop: Spacing.one,
  },
  playOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  playOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOptionText: {
    flex: 1,
    gap: 2,
  },
  playOptionLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    textAlign: 'right',
  },
  playOptionHint: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.8,
  },
  chipRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
    paddingBottom: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
  },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
  },
  modeLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  inputGroup: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    textAlign: 'right',
    fontSize: 15,
  },
  pageRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pageInput: {
    flex: 1,
  },
  rangeDash: {
    fontSize: 13,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'right',
  },
  errorText: {
    color: '#B42318',
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'right',
  },
  confirmButton: {
    marginTop: Spacing.two,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
});
