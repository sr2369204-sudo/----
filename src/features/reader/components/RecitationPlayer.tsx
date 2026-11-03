import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
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
  reciters: QuranReciter[];
  reciterId: number;
  onSelectReciter: (reciterId: number) => void;
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
  reciters,
  reciterId,
  onSelectReciter,
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
          onPress={onOpenPicker}
          style={({ pressed }) => [styles.reciterName, pressed && styles.pressed]}>
          <Ionicons name="mic-outline" size={13} color={colors.primary} />
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
    </View>
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
            <Text style={[styles.dialogTitle, { color: colors.text }]}>تشغيل التلاوة</Text>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

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
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  reciterArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    paddingVertical: 4,
  },
  reciterLabel: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  player: {
    flexDirection: 'column',
    gap: 4,
    paddingTop: 6,
    paddingBottom: 9,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  playerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 42,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  playerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'right',
  },
  playerSubtitle: {
    fontSize: 11,
    marginTop: 1,
    textAlign: 'right',
  },
  playerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButton: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 3,
    height: 2.5,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },

  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  dialog: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: 22,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  dialogHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: Spacing.one,
  },
  chipRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.two,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
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
