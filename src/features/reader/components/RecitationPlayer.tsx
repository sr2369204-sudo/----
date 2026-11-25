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

import { SeekBar } from '@/components/ui/seek-bar';
import { Spacing } from '@/constants/theme';
import { ReciterAvatar } from '@/features/quran/components/reciter-avatar';
import type { QuranReciter, RecitationTrack } from '@/features/quran/services/content-provider';
import type { QuranSurahSummary } from '@/features/quran/types';
import {
  getAvailableAyahRepeatCounts,
  type RecitationScope,
} from '@/features/reader/services/recitation-queue';
import { useTheme } from '@/hooks/use-theme';

import { friendlyError } from '@/features/errors/friendly-error';
type Palette = ReturnType<typeof useTheme>;

export type RecitationPlayerStatus = {
  playing: boolean;
  isBuffering: boolean;
  currentIndex: number;
  trackCount: number;
  currentTime: number;
  duration: number;
};

export type RepeatMode = 'none' | 'all';

type PlayerProps = {
  label: string;
  /** Distance from the bottom edge of the screen, below the safe area. */
  offsetBottom: number;
  colors: Palette;
  status: RecitationPlayerStatus;
  tracks: RecitationTrack[];
  ayahRepeatCount: number;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  onCycleAyahRepeat: () => void;
  playbackRate: number;
  onCycleRate: () => void;
  /** Minutes left on the sleep timer, or null when it is off. */
  sleepTimerMinutes?: number | null;
  onCycleSleepTimer?: () => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
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
/** Gold wash behind the memorisation action, matching the theme accent. */
const TASMI3_TINT = 'rgba(201,151,60,0.16)';

/** Floating recitation controller pinned to the bottom of the screen. */
export function RecitationPlayer({
  label,
  offsetBottom,
  colors,
  status,
  tracks,
  ayahRepeatCount,
  repeatMode,
  onCycleRepeat,
  onCycleAyahRepeat,
  playbackRate,
  onCycleRate,
  sleepTimerMinutes = null,
  onCycleSleepTimer,
  onTogglePlay,
  onSeek,
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
  const activeTrackIndex = Math.floor(status.currentIndex / ayahRepeatCount);
  const repetitionNumber = (status.currentIndex % ayahRepeatCount) + 1;
  const currentTrack = tracks[activeTrackIndex];
  const trackLabel = currentTrack
    ? currentTrack.ayahNumber > 0
      ? ayahRepeatCount > 1
        ? `الآية ${toArabicDigits(currentTrack.ayahNumber)} · التكرار ${toArabicDigits(repetitionNumber)}/${toArabicDigits(ayahRepeatCount)}`
        : tracks.length > 1
          ? `الآية ${toArabicDigits(currentTrack.ayahNumber)} · ${toArabicDigits(activeTrackIndex + 1)}/${toArabicDigits(tracks.length)}`
          : `الآية ${toArabicDigits(currentTrack.ayahNumber)}`
      : 'السورة كاملة'
    : 'الآية الحالية';
  const rangeLabel = getTrackRangeLabel(tracks);
  const availableAyahRepeatCounts = getAvailableAyahRepeatCounts(tracks.length);
  const canRepeatAyahs =
    tracks.length > 0 && tracks.every((track) => track.ayahNumber > 0) &&
    availableAyahRepeatCounts.length > 1;

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

  if (hidden) {
    return null;
  }

  return (
    <View style={[styles.wrap, { bottom: offsetBottom }]} pointerEvents="box-none">
      <View
        style={[
          styles.player,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        accessibilityRole="toolbar"
        accessibilityLabel="مشغل التلاوة">
        <View style={styles.topRow}>
        <View style={[styles.reciterBox, { backgroundColor: colors.backgroundSelected }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="القارئ السابق"
            hitSlop={6}
            disabled={!canCycleReciter}
            onPress={() => cycleReciter(-1)}
            style={({ pressed }) => [
              styles.reciterArrow,
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
              name={currentReciter ? getArabicReciterName(currentReciter) : 'قارئ القرآن'}
              size={24}
              backgroundColor={colors.backgroundSelected}
              iconColor={colors.primary}
            />
            <Text style={[styles.reciterLabel, { color: colors.text }]} numberOfLines={1}>
              {currentReciter ? getArabicReciterName(currentReciter) : 'جارٍ تحميل القرّاء…'}
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
              !canCycleReciter && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </Pressable>
        </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`تكرار كل آية ${formatAyahRepeatCount(ayahRepeatCount)}`}
            accessibilityHint={
              canRepeatAyahs
                ? `اضغط للتغيير بين ${availableAyahRepeatCounts.map(formatAyahRepeatCount).join('، ')}`
                : 'التكرار بعدد محدد غير متاح مع تسجيل السورة كاملة أو النطاق الطويل'
            }
            accessibilityState={{
              selected: ayahRepeatCount > 1,
              disabled: !canRepeatAyahs,
            }}
            disabled={!canRepeatAyahs}
            onPress={onCycleAyahRepeat}
            style={({ pressed }) => [
              styles.ayahRepeatButton,
              {
                backgroundColor: `${colors.accent}18`,
                borderColor: `${colors.accent}55`,
              },
              !canRepeatAyahs && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <View style={styles.ayahRepeatText}>
              <Text style={[styles.ayahRepeatTitle, { color: colors.text }]}>تكرار الآية</Text>
              <Text style={[styles.ayahRepeatValue, { color: colors.accent }]}>
                {toArabicDigits(ayahRepeatCount)}×
              </Text>
            </View>
            <Ionicons name="repeat-outline" size={16} color={colors.accent} />
          </Pressable>
        </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تغيير نطاق التلاوة"
            onPress={onOpenPicker}
            style={({ pressed }) => [styles.playerInfo, pressed && styles.pressed]}>
            <Text style={[styles.playerTitle, { color: colors.text }]} numberOfLines={1}>
              {label}
            </Text>
            <Text
              style={[styles.playerSubtitle, { color: colors.textSecondary }]}
              numberOfLines={1}>
              {status.isBuffering
                ? 'جارٍ تجهيز التلاوة…'
                : `${trackLabel} · ${rangeLabel}`}
            </Text>
          </Pressable>
        <SeekBar
          position={status.currentTime}
          duration={status.duration}
          enabled={!status.isBuffering && status.duration > 0}
          direction="rtl"
          accentColor={colors.accent}
          accessibilityLabel="شريط التقدم في التلاوة"
          onSeek={onSeek}
        />

        <View style={styles.playerControls}>
          {onCycleSleepTimer && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                sleepTimerMinutes === null
                  ? 'مؤقت النوم متوقف'
                  : `إيقاف التلاوة بعد ${sleepTimerMinutes} دقيقة`
              }
              accessibilityHint="اضغط للتبديل بين ١٥ و٣٠ و٦٠ دقيقة أو إيقاف المؤقت"
              hitSlop={6}
              onPress={onCycleSleepTimer}
              style={({ pressed }) => [
                styles.rateButton,
                {
                  backgroundColor:
                    sleepTimerMinutes === null ? colors.backgroundSelected : `${colors.primary}1A`,
                },
                pressed && styles.pressed,
              ]}>
              <View style={styles.sleepContent}>
                <Ionicons
                  name={sleepTimerMinutes === null ? 'moon-outline' : 'moon'}
                  size={15}
                  color={sleepTimerMinutes === null ? colors.textSecondary : colors.primary}
                />
                {sleepTimerMinutes !== null && (
                  <Text style={[styles.rateLabel, { color: colors.primary }]}>
                    {toArabicDigits(sleepTimerMinutes)}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="الآية السابقة"
            hitSlop={6}
            disabled={activeTrackIndex <= 0 && repeatMode !== 'all'}
            onPress={onPrevious}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.backgroundSelected },
              activeTrackIndex <= 0 && repeatMode !== 'all' && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Ionicons name="play-skip-back" size={17} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={status.playing ? 'إيقاف التلاوة مؤقتًا' : 'متابعة التلاوة'}
            onPress={onTogglePlay}
            style={({ pressed }) => [
              styles.playButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}>
            {status.isBuffering ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Ionicons
                name={status.playing ? 'pause' : 'play'}
                size={24}
                color={colors.background}
              />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="الآية التالية"
            hitSlop={6}
            disabled={activeTrackIndex >= tracks.length - 1 && repeatMode !== 'all'}
            onPress={onNext}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.backgroundSelected },
              activeTrackIndex >= tracks.length - 1 && repeatMode !== 'all' && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Ionicons name="play-skip-forward" size={17} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              repeatMode === 'none'
                ? 'تفعيل تكرار المقطع المحدد'
                : 'إيقاف تكرار المقطع المحدد'
            }
            accessibilityHint="يتكرر النطاق كاملًا بشكل مستقل عن عدد تكرار كل آية"
            accessibilityState={{ selected: repeatMode !== 'none' }}
            hitSlop={6}
            onPress={onCycleRepeat}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor:
                  repeatMode === 'none'
                    ? colors.backgroundSelected
                    : `${colors.primary}1A`,
                borderColor: repeatMode === 'none' ? 'transparent' : colors.primary,
              },
              pressed && styles.pressed,
            ]}>
            <Ionicons
              name="repeat"
              size={17}
              color={repeatMode === 'none' ? colors.textSecondary : colors.primary}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`سرعة التلاوة ${playbackRate} ضعف`}
            accessibilityHint="اضغط للتبديل بين سرعات التلاوة"
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
            accessibilityLabel="إيقاف التلاوة"
            hitSlop={6}
            onPress={onClose}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="stop-circle-outline" size={17} color={colors.text} />
          </Pressable>
        </View>
      </View>
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
  const orderedReciters = sortRecitersForDisplay(reciters);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            <View style={[styles.headerAccent, { backgroundColor: colors.accent }]} />
            <View style={styles.headerRow}>
              <View style={styles.titleGroup}>
                <View style={[styles.titleIcon, { backgroundColor: `${colors.primary}1A` }]}>
                  <Ionicons name="headset" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: colors.text }]}>اختر القارئ</Text>
                  <Text style={[styles.dialogSubtitle, { color: colors.textSecondary }]}>
                    {`${toArabicDigits(reciters.length)} قارئًا متاحًا`}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إغلاق"
                onPress={onClose}
                style={[styles.closeCircle, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="close" size={17} color={colors.text} />
              </Pressable>
            </View>
            <OrnamentDivider colors={colors} />
          </View>

          <ScrollView
            style={styles.reciterList}
            contentContainerStyle={styles.reciterListContent}
            showsVerticalScrollIndicator={false}>
            {orderedReciters.map((reciter) => {
              const selected = reciter.id === reciterId;
              return (
                <Pressable
                  key={reciter.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(reciter.id);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.reciterItem,
                    {
                      backgroundColor: selected ? `${colors.primary}14` : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <ReciterAvatar
                    reciterId={reciter.id}
                    name={getArabicReciterName(reciter)}
                    size={44}
                    backgroundColor={selected ? colors.primary : colors.backgroundSelected}
                    iconColor={selected ? colors.onPrimary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.reciterItemLabel,
                      { color: selected ? colors.primary : colors.text },
                    ]}>
                    {getArabicReciterName(reciter)}
                  </Text>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'chevron-back'}
                    size={selected ? 22 : 16}
                    color={selected ? colors.primary : colors.border}
                  />
                </Pressable>
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

function getTrackRangeLabel(tracks: RecitationTrack[]): string {
  const first = tracks[0];
  const last = tracks[tracks.length - 1];
  if (!first || !last) {
    return 'نطاق التلاوة';
  }
  if (first.ayahNumber === 0 && last.ayahNumber === 0) {
    return 'السورة كاملة';
  }
  if (first.surahNumber === last.surahNumber) {
    return first.ayahNumber === last.ayahNumber
      ? `الآية ${toArabicDigits(first.ayahNumber)}`
      : `الآيات ${toArabicDigits(first.ayahNumber)}–${toArabicDigits(last.ayahNumber)}`;
  }
  return `من ${toArabicDigits(first.surahNumber)}:${toArabicDigits(first.ayahNumber)} إلى ${toArabicDigits(last.surahNumber)}:${toArabicDigits(last.ayahNumber)}`;
}

function formatAyahRepeatCount(count: number): string {
  if (count === 1) {
    return 'مرة واحدة';
  }
  return count === 2 ? 'مرتين' : `${toArabicDigits(count)} مرات`;
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
  onTasmi3: (scope: RecitationScope) => void;
  onClose: () => void;
  chapterOnly: boolean;
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
  onTasmi3,
  onClose,
  chapterOnly,
}: ScopeDialogProps) {
  const [mode, setMode] = useState<Mode>(() => (chapterOnly ? 'surah' : 'current'));
  const [surahValue, setSurahValue] = useState(String(currentSurahNumber));
  const [juzValue, setJuzValue] = useState(String(currentJuzNumber));
  const [fromPage, setFromPage] = useState(String(currentPageNumber));
  const [toPage, setToPage] = useState(String(Math.min(604, currentPageNumber + 4)));
  const [localError, setLocalError] = useState<string | null>(null);
  const orderedReciters = sortRecitersForDisplay(reciters);

  const modes: { key: Mode; label: string }[] = chapterOnly
    ? [{ key: 'surah', label: 'سورة' }]
    : [
        { key: 'current', label: 'من هنا' },
        { key: 'surah', label: 'سورة' },
        { key: 'juz', label: 'جزء' },
        { key: 'pages', label: 'صفحات' },
      ];

  function getSelectedScope(): RecitationScope {
    if (mode === 'current') {
      return { type: 'pageRange', fromPage: currentPageNumber, toPage: currentPageNumber };
    }
    if (mode === 'surah') {
      const surahNumber = parseNumber(surahValue);
      if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        throw new RangeError('رقم السورة يجب أن يكون بين ١ و١١٤.');
      }
      return { type: 'surah', surahNumber };
    }
    if (mode === 'juz') {
      const juzNumber = parseNumber(juzValue);
      if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
        throw new RangeError('رقم الجزء يجب أن يكون بين ١ و٣٠.');
      }
      return { type: 'juz', juzNumber };
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
    return { type: 'pageRange', fromPage: start, toPage: end };
  }

  function submit(): void {
    setLocalError(null);
    try {
      onConfirm(getSelectedScope());
    } catch (validationError) {
      setLocalError(
        friendlyError(validationError, 'تحقق من القيم المدخلة.'),
      );
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            <View style={[styles.headerAccent, { backgroundColor: colors.accent }]} />
            <View style={styles.headerRow}>
              <View style={styles.titleGroup}>
                <View style={[styles.titleIcon, { backgroundColor: `${colors.primary}1A` }]}>
                  <Ionicons name="book" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: colors.text }]}>إعدادات التلاوة</Text>
                  <Text style={[styles.dialogSubtitle, { color: colors.textSecondary }]}>
                    اختر القارئ والنطاق ثم ابدأ
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="إغلاق"
                onPress={onClose}
                style={[styles.closeCircle, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="close" size={17} color={colors.text} />
              </Pressable>
            </View>
            <OrnamentDivider colors={colors} />
          </View>

          <View style={styles.dialogContent}>
            <View style={styles.sectionLabelRow}>
              <View style={[styles.sectionBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionLabel, { color: colors.text }]}>اختر القارئ</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {reciters.length === 0 ? (
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  جارٍ تحميل قائمة القرّاء…
                </Text>
              ) : (
                orderedReciters.map((reciter) => {
                  const selected = reciter.id === reciterId;
                  return (
                    <Pressable
                      key={reciter.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onSelectReciter(reciter.id)}
                      style={[
                        styles.reciterChoice,
                        {
                          backgroundColor: selected ? `${colors.primary}14` : colors.background,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}>
                      <ReciterAvatar
                        reciterId={reciter.id}
                        name={getArabicReciterName(reciter)}
                        size={48}
                        backgroundColor={selected ? colors.primary : colors.backgroundSelected}
                        iconColor={selected ? colors.onPrimary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.reciterChoiceLabel,
                          { color: selected ? colors.primary : colors.text },
                        ]}>
                        {getArabicReciterName(reciter)}
                      </Text>
                      {selected && (
                        <View style={[styles.choiceCheck, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={11} color={colors.onPrimary} />
                        </View>
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.sectionLabelRow}>
              <View style={[styles.sectionBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionLabel, { color: colors.text }]}>النطاق</Text>
            </View>
            {chapterOnly && (
              <View style={[styles.chapterOnlyNotice, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
                <Text style={[styles.chapterOnlyNoticeText, { color: colors.text }]}>
                  هذا القارئ متاح بتسجيل السورة كاملة فقط. اختر السورة من بدايتها، ولا يدعم التشغيل آية بآية أو من منتصف الصفحة.
                </Text>
              </View>
            )}
            <View style={[styles.segment, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
              {modes.map((option) => {
                const selected = mode === option.key;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMode(option.key)}
                    style={[styles.segmentItem, selected && { backgroundColor: colors.primary }]}>
                    <Text
                      style={[
                        styles.segmentLabel,
                        { color: selected ? colors.onPrimary : colors.textSecondary },
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
            <ScrollView style={styles.scopeList} contentContainerStyle={styles.scopeListContent}>
              {(surahs ?? []).map((surah) => {
                const selected = surah.surahNumber === parseNumber(surahValue);
                return (
                  <Pressable
                    key={surah.surahNumber}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setSurahValue(String(surah.surahNumber))}
                    style={[
                      styles.scopeChoice,
                      {
                        backgroundColor: selected ? `${colors.primary}14` : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <View
                      style={[
                        styles.scopeNumberBadge,
                        { backgroundColor: selected ? colors.primary : colors.backgroundSelected },
                      ]}>
                      <Text
                        style={[
                          styles.scopeChoiceNumber,
                          { color: selected ? colors.onPrimary : colors.primary },
                        ]}>
                        {toArabicDigits(surah.surahNumber)}
                      </Text>
                    </View>
                    <Text style={[styles.scopeChoiceName, { color: colors.text }]}>
                      {surah.nameArabic}
                    </Text>
                    {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {mode === 'juz' && (
            <View style={styles.juzGrid}>
              {Array.from({ length: 30 }, (_, index) => index + 1).map((juz) => {
                const selected = juz === parseNumber(juzValue);
                return (
                  <Pressable
                    key={juz}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setJuzValue(String(juz))}
                    style={[
                      styles.juzChoice,
                      {
                        backgroundColor: selected ? colors.backgroundSelected : colors.background,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[styles.juzChoiceLabel, { color: selected ? colors.primary : colors.text }]}>
                      الجزء {toArabicDigits(juz)}
                    </Text>
                  </Pressable>
                );
              })}
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

          <View style={styles.footerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="بدء التسميع"
              disabled={busy}
              onPress={() => {
                setLocalError(null);
                try {
                  onTasmi3(getSelectedScope());
                } catch (validationError) {
                  setLocalError(
                    friendlyError(validationError, 'تحقق من القيم المدخلة.'),
                  );
                }
              }}
              style={({ pressed }) => [
                styles.secondaryConfirmButton,
                { backgroundColor: TASMI3_TINT, borderColor: colors.accent },
                busy && styles.disabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons name="mic" size={17} color={colors.accent} />
              <Text style={[styles.secondaryConfirmLabel, { color: colors.accent }]}>تسميع</Text>
            </Pressable>

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
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <View style={styles.confirmContent}>
                  <Ionicons name="play" size={16} color={colors.onPrimary} />
                  <Text style={[styles.confirmLabel, { color: colors.onPrimary }]}>تشغيل</Text>
                </View>
              )}
            </Pressable>
          </View>
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

/**
 * The reciters readers reach for first. They open every reciter list, while
 * the rest keep the order the source returned so the list stays stable.
 */
const RECITER_LEADER_RANKS: { pattern: RegExp; rank: number }[] = [
  { pattern: /الحصري|الحصرى|husary|hussary|husari/i, rank: 1 },
  { pattern: /عبد ?الباسط|عبدالباسط|abdul ?basit|abdulbasit/i, rank: 2 },
  { pattern: /العفاسي|العفاسى|مشاري|mishary|afasy/i, rank: 3 },
  { pattern: /المنشاوي|المنشاوى|minshawi|minshawy/i, rank: 4 },
  { pattern: /المعيقلي|muaiqly|maher/i, rank: 5 },
  { pattern: /السديس|sudais|sudays/i, rank: 6 },
  { pattern: /الشريم|shuraim/i, rank: 7 },
];

const RECITER_UNRANKED = 99;

/**
 * Reorders the reciters so the well-known ones lead the list. Everyone else
 * keeps the source order, so rows never reshuffle between renders.
 */
export function sortRecitersForDisplay(reciters: QuranReciter[]): QuranReciter[] {
  return reciters
    .map((reciter, index) => {
      const name = getArabicReciterName(reciter);
      const leader = RECITER_LEADER_RANKS.find((entry) => entry.pattern.test(name));
      return { reciter, index, rank: leader ? leader.rank : RECITER_UNRANKED };
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.reciter);
}

/** Gold-flanked rule separating a dialog header from its content. */
function OrnamentDivider({ colors }: { colors: Palette }) {
  return (
    <View style={styles.ornamentRow}>
      <View style={[styles.ornamentLine, { backgroundColor: colors.border }]} />
      <View style={[styles.ornamentDiamond, { backgroundColor: colors.accent }]} />
      <View style={[styles.ornamentLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function getArabicReciterName(reciter: QuranReciter): string {
  const namesById: Record<number, string> = {
    1: 'عبد الباسط عبد الصمد — مجوّد',
    2: 'عبد الباسط عبد الصمد',
    3: 'عبد الرحمن السديس',
    4: 'أبو بكر الشاطري',
    5: 'هاني الرفاعي',
    6: 'محمود خليل الحصري',
    7: 'مشاري راشد العفاسي',
    9: 'محمد صديق المنشاوي',
    10: 'سعود الشريم',
    12: 'محمود خليل الحصري',
    97: 'ياسر الدوسري',
    161: 'خليفة الطنيجي',
    168: 'محمد صديق المنشاوي — أطفال',
    173: 'مشاري راشد العفاسي — بث مباشر',
    92: 'ياسر الدوسري',
    178: 'إبراهيم الدوسري',
    217: 'بندر بليلة',
    253: 'إسلام صبحي',
    102: 'ماهر المعيقلي',
  };
  if (namesById[Math.abs(reciter.id)]) {
    return namesById[Math.abs(reciter.id)];
  }
  const name = reciter.name.toLowerCase();
  if (name.includes('abdul basit') || name.includes('abdulbasit')) return 'عبد الباسط عبد الصمد';
  if (name.includes('husary') || name.includes('hussary')) return 'محمود خليل الحصري';
  if (name.includes('minshawi') || name.includes('minshawy')) return 'محمد صديق المنشاوي';
  if (name.includes('mishary')) return 'مشاري راشد العفاسي';
  if (name.includes('sudais')) return 'عبد الرحمن السديس';
  if (name.includes('shuraim')) return 'سعود الشريم';
  if (name.includes('dosari')) return 'ياسر الدوسري';
  if (name.includes('swayed') || name.includes('suwayed')) return 'أيمن سويد';
  if (name.includes('sobhi')) return 'إسلام صبحي';
  if (name.includes('massad') || name.includes('masad')) return 'عبد الرحمن مسعد';
  return reciter.name;
}

function toArabicDigits(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    maxWidth: '100%',
    zIndex: 95,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reciterBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 3,
  },
  reciterArrow: {
    width: 28,
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
    alignSelf: 'stretch',
    minWidth: 0,
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  playerHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    minHeight: 34,
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  playerInfo: {
    minWidth: 0,
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    gap: 2,
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
  playerControls: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
    gap: 0,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButton: {
    minWidth: 42,
    height: 38,
    paddingHorizontal: 7,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  rateLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  ayahRepeatButton: {
    minHeight: 38,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ayahRepeatText: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  ayahRepeatTitle: {
    fontSize: 10,
    fontWeight: '700',
  },
  ayahRepeatValue: {
    fontSize: 12,
    fontWeight: '900',
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
  /** Gold handle that tops the redesigned recitation sheets. */
  headerAccent: {
    width: 46,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  dialogSubtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ornamentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ornamentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  ornamentDiamond: {
    width: 7,
    height: 7,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleIcon: {
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
    gap: Spacing.three,
  },
  sectionLabelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  sectionBullet: {
    width: 6,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  segment: {
    flexDirection: 'row-reverse',
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderRadius: 16,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '800',
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
  reciterItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  reciterItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
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
  reciterChoice: {
    width: 106,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  choiceCheck: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterChoiceLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  chapterOnlyNotice: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 12,
  },
  chapterOnlyNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'right',
  },
  inputGroup: {
    gap: Spacing.one,
  },
  scopeList: {
    maxHeight: 220,
  },
  scopeListContent: {
    gap: 7,
    paddingVertical: 2,
  },
  scopeChoice: {
    minHeight: 46,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scopeChoiceNumber: {
    fontSize: 13,
    fontWeight: '900',
  },
  scopeNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeChoiceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  juzGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 7,
  },
  juzChoice: {
    width: '31%',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1,
  },
  juzChoiceLabel: {
    fontSize: 12,
    fontWeight: '800',
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
  footerRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  confirmButton: {
    flex: 2,
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryConfirmButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row-reverse',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryConfirmLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
});
