import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TypeScale } from '@/constants/theme';
import { friendlyError } from '@/features/errors/friendly-error';
import { toArabicNumbers } from '@/features/home/utils/format';
import { getTafsirCenterWordMeanings } from '@/features/offline-data';
import { ConcentricRings } from '@/features/khatma/components/khatma-ring';
import type { AyahWordMeaning } from '@/features/quran/services/content-provider';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';
import type { QuranAyah } from '@/features/quran/types';

const GOLD = '#D8B56D';
const GOLD_LIGHT = '#F3D28C';
const MAX_SEGMENTS = 24;

type Props = {
  surahNumber: number;
  ayah: QuranAyah;
  selectedWordId: string;
  normalizeWord: (value: string) => string;
  onClose: () => void;
};

/**
 * Word meaning as a small bottom sheet in the same look as the story pages:
 * one word per page, swipe or tap the arrows to move between the words of the
 * ayah. The meanings are bundled with the app, so it works with no connection.
 */
export function WordMeaningSheet({ surahNumber, ayah, selectedWordId, normalizeWord, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const database = useSQLiteContext();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      ayah.words.findIndex((word) => word.id === selectedWordId),
    ),
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [enter] = useState(() => new Animated.Value(0));
  const [state, setState] = useState<{
    key: number;
    meanings: AyahWordMeaning[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    new LocalQuranCache(database)
      .getAyahWordMeanings(surahNumber, ayah.ayahNumber)
      .then((meanings) => active && setState({ key: reloadKey, meanings, error: null }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            key: reloadKey,
            meanings: [],
            error: friendlyError(error, 'تعذر تحميل معنى الكلمة.'),
          }),
      );
    return () => {
      active = false;
    };
  }, [ayah.ayahNumber, database, reloadKey, surahNumber]);

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const total = ayah.words.length;
  const go = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setCopied(null);
      setIndex((current) => Math.min(total - 1, Math.max(0, current + delta)));
    },
    [total],
  );

  // Swipe toward the left moves to the next word, like the story pages.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderRelease: (_event, gesture) => {
          if (Math.abs(gesture.dx) > 50) {
            go(gesture.dx < 0 ? 1 : -1);
          }
        },
      }),
    [go],
  );

  const loading = !state || state.key !== reloadKey;
  const word = ayah.words[Math.min(index, total - 1)];
  const wordText = word?.textUthmani ?? '';
  const own = normalizeWord(wordText);
  // Main source: one meaning per word, matched by position. It is only used
  // when its word count equals the ayah's, so a different split never shows
  // the meaning of another word. The old source stays as the fallback.
  const centerList = useMemo(
    () => getTafsirCenterWordMeanings(surahNumber, ayah.ayahNumber),
    [ayah.ayahNumber, surahNumber],
  );
  const centerMeaning =
    centerList && centerList.length === total ? (centerList[Math.min(index, total - 1)] ?? '') : '';
  const fallback = state?.meanings.find((item) => normalizeWord(item.word) === own) ?? null;
  const matched = centerMeaning ? { word: wordText, meaning: centerMeaning } : fallback;
  const fromCenter = Boolean(centerMeaning);
  const others = (state?.meanings ?? []).filter((item) => item !== matched);

  async function copy(): Promise<void> {
    if (!matched?.meaning) {
      return;
    }
    try {
      await Clipboard.setStringAsync(`${wordText}\n${matched.meaning}`);
      setCopied('تم نسخ المعنى');
    } catch {
      setCopied('تعذر النسخ');
    }
  }

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <ConcentricRings size={190} opacity={0.08} style={styles.rings} />
          <View style={styles.handle} />
          {total <= MAX_SEGMENTS ? (
            <View style={styles.segments}>
              {ayah.words.map((entry, position) => (
                <View key={entry.id} style={styles.segment}>
                  <View style={[styles.segmentFill, { width: position <= index ? '100%' : '0%' }]} />
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.top}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              onPress={onClose}
              style={styles.close}
            >
              <Ionicons name="close" size={18} color="#FFF9EA" />
            </Pressable>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>معنى الكلمة</Text>
              <Text style={styles.sub}>
                الآية {toArabicNumbers(ayah.ayahNumber)} · كلمة {toArabicNumbers(index + 1)} من{' '}
                {toArabicNumbers(total)}
              </Text>
            </View>
          </View>

          <View style={styles.stage} {...pan.panHandlers}>
            <Animated.View
              style={[
                styles.page,
                {
                  opacity: enter,
                  transform: [
                    {
                      translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [30 * direction, 0] }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.word}>{wordText}</Text>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerRing}>
                  <View style={styles.dividerDot} />
                </View>
                <View style={styles.dividerLine} />
              </View>
              {matched ? (
                <ScrollView
                  style={styles.meaningScroll}
                  contentContainerStyle={styles.meaningContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.meaning}>{matched.meaning}</Text>
                </ScrollView>
              ) : loading ? (
                <Text style={styles.sub}>جارٍ تحميل المعنى…</Text>
              ) : state?.error ? (
                <>
                  <Text accessibilityRole="alert" style={styles.error}>
                    {state.error}
                  </Text>
                  <Pressable onPress={() => setReloadKey((key) => key + 1)} style={styles.pill}>
                    <Text style={styles.pillText}>إعادة المحاولة</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.sub}>
                  {others.length > 0
                    ? 'لا يتوفر معنى مفرد لهذه الكلمة، جرّب الكلمات القريبة.'
                    : 'لا يتوفر معنى لهذه الكلمة من المصدر.'}
                </Text>
              )}
            </Animated.View>
            {total > 1 ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="الكلمة التالية"
                  onPress={() => go(1)}
                  style={[styles.zone, styles.zoneRight]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="الكلمة السابقة"
                  onPress={() => go(-1)}
                  style={[styles.zone, styles.zoneLeft]}
                />
              </>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="نسخ المعنى"
              disabled={!matched?.meaning}
              onPress={() => void copy()}
              style={[styles.pill, !matched?.meaning && styles.off]}
            >
              <Ionicons name="copy-outline" size={17} color={GOLD_LIGHT} />
              <Text style={styles.pillText}>{copied ?? 'نسخ'}</Text>
            </Pressable>
          </View>
          {total > 1 ? (
            <Text style={styles.hint}>اضغط على اليمين للتالي، واليسار للسابق، أو اسحب</Text>
          ) : null}
          <Text style={styles.source}>
            {fromCenter ? 'المصدر: مركز تفسير للدراسات القرآنية' : 'المصدر: السراج في بيان غريب القرآن'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#0B3D2E',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderColor: 'rgba(216,181,109,0.45)',
    paddingHorizontal: 18,
    paddingTop: 8,
    overflow: 'hidden',
    maxHeight: '55%',
  },
  rings: { position: 'absolute', left: -70, bottom: -80 },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  segments: { flexDirection: 'row', gap: 3 },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segmentFill: { height: '100%', backgroundColor: GOLD_LIGHT },
  top: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 10 },
  titleWrap: { flex: 1, alignItems: 'flex-end' },
  title: { fontSize: TypeScale.title, fontWeight: '900', color: '#FFF9EA' },
  sub: { fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.7)', textAlign: 'center' },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stage: { minHeight: 110 },
  page: { alignItems: 'center', gap: 12, paddingVertical: 6 },
  word: { fontSize: 32, lineHeight: 52, textAlign: 'center', fontWeight: '700', color: GOLD_LIGHT },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(216,181,109,0.35)' },
  dividerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD },
  meaningScroll: { maxHeight: 190, alignSelf: 'stretch' },
  meaningContent: { flexGrow: 1, justifyContent: 'center' },
  meaning: { fontSize: 19, lineHeight: 32, textAlign: 'center', color: '#FFF9EA' },
  error: { fontSize: TypeScale.body, textAlign: 'center', color: '#FFB4A9' },
  actions: { alignItems: 'center', marginTop: 6 },
  pill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: GOLD,
    backgroundColor: 'rgba(216,181,109,0.14)',
  },
  pillText: { fontSize: TypeScale.label, fontWeight: '800', color: GOLD_LIGHT },
  off: { opacity: 0.4 },
  zone: { position: 'absolute', top: 0, bottom: 0, width: '25%' },
  zoneRight: { right: 0 },
  zoneLeft: { left: 0 },
  hint: { marginTop: 8, textAlign: 'center', fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.5)' },
  source: { marginTop: 10, textAlign: 'center', fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.5)' },
});
