import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { confirmDelete } from '@/components/confirm-delete';
import { friendlyError } from '@/features/errors/friendly-error';
import {
  deleteWordAudio,
  downloadWordAudio,
  getWordAudioStats,
  type WordAudioProgress,
} from '@/features/reader/services/word-audio-offline';
import { formatMegabytes, toArabicNumbers } from '@/features/settings/utils/format';
import { useTheme } from '@/hooks/use-theme';

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

const CHOICES: { label: string; surahs: number[] }[] = [
  { label: 'الفاتحة', surahs: [1] },
  { label: 'جزء عمّ', surahs: range(78, 114) },
  { label: 'يس', surahs: [36] },
  { label: 'الكهف', surahs: [18] },
  { label: 'الملك', surahs: [67] },
  { label: 'البقرة', surahs: [2] },
  { label: 'المصحف كله', surahs: range(1, 114) },
];

/**
 * Downloads the word-by-word pronunciation (the audio played when a word is
 * tapped) so it works with no connection. It is stored per surah choice, and a
 * second run only fetches what is missing.
 */
export function WordAudioCard() {
  const colors = useTheme();
  const [stats, setStats] = useState(() => getWordAudioStats());
  const [running, setRunning] = useState<string | null>(null);
  const [progress, setProgress] = useState<WordAudioProgress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const cancel = useRef(false);

  const refresh = useCallback(() => setStats(getWordAudioStats()), []);

  async function start(label: string, surahs: number[]): Promise<void> {
    cancel.current = false;
    setRunning(label);
    setMessage(null);
    try {
      const result = await downloadWordAudio(surahs, {
        onProgress: setProgress,
        shouldCancel: () => cancel.current,
      });
      if (result.cancelled) {
        setMessage('تم إيقاف التحميل. ما نزل منه محفوظ على جهازك.');
      } else if (result.failed > 0) {
        setMessage(
          `تعذر تحميل ${toArabicNumbers(result.failed)} كلمة. تأكد من الإنترنت واضغط مرة أخرى لاستكمال الباقي.`,
        );
      } else {
        setMessage('تم التحميل. صوت الكلمات يعمل الآن بدون إنترنت.');
      }
    } catch (error) {
      setMessage(friendlyError(error, 'تعذر تحميل صوت الكلمات.'));
    } finally {
      setRunning(null);
      setProgress(null);
      refresh();
    }
  }

  function remove(): void {
    confirmDelete(
      'حذف صوت الكلمات المحمّل؟',
      'سيُحذف صوت الكلمات من جهازك لتوفير المساحة، ويمكنك تحميله مرة أخرى.',
      () => {
        try {
          deleteWordAudio();
          setMessage(null);
        } catch (error) {
          setMessage(friendlyError(error, 'تعذر حذف صوت الكلمات.'));
        }
        refresh();
      },
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.backgroundSelected }]}>
          <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>صوت نطق الكلمات بدون إنترنت</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {stats.files > 0
              ? `${toArabicNumbers(stats.files)} كلمة محمّلة (${formatMegabytes(stats.bytes)} ميجابايت). تُشغَّل بدون إنترنت.`
              : 'نزّل نطق الكلمات الذي يُسمع عند الضغط على كلمة، لتسمعه بدون إنترنت.'}
          </Text>
        </View>
      </View>

      {running ? (
        <>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {progress && progress.total > 0
              ? `جارٍ تحميل ${running}: ${toArabicNumbers(progress.done)} من ${toArabicNumbers(progress.total)}`
              : 'جارٍ البدء…'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              cancel.current = true;
            }}
            style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.text} />
            <Text style={[styles.buttonText, { color: colors.text }]}>إيقاف التحميل</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.chips}>
          {CHOICES.map((choice) => (
            <Pressable
              key={choice.label}
              accessibilityRole="button"
              onPress={() => void start(choice.label, choice.surahs)}
              style={[
                styles.chip,
                { backgroundColor: colors.backgroundSelected, borderColor: colors.border },
              ]}
            >
              <Ionicons name="download-outline" size={15} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.text }]}>{choice.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {message ? <Text style={[styles.body, { color: colors.primary }]}>{message}</Text> : null}

      {!running && stats.files > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={remove}
          style={[styles.button, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>حذف صوت الكلمات المحمّل</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  header: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, gap: 3 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  body: { fontSize: 14, lineHeight: 23, textAlign: 'right' },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  button: {
    minHeight: 46,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
