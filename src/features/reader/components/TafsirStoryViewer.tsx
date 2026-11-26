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
import { ConcentricRings } from '@/features/khatma/components/khatma-ring';
import { getBundledTafsir } from '@/features/offline-data';
import { LocalQuranCache } from '@/features/quran/services/local-quran-cache';

export type TafsirStoryItem = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
};

const GOLD = '#D8B56D';
const GOLD_LIGHT = '#F3D28C';
const SIDE_ZONE = 0.2;

type Props = {
  items: TafsirStoryItem[];
  startIndex: number;
  onClose: () => void;
};

/**
 * Tafsir of the chosen ayat, one ayah per full page in the same story look as
 * the azkar: progress segments on top, tap the sides or swipe to move on. The
 * tafsir is bundled with the app, so every page opens with no connection.
 */
export function TafsirStoryViewer({ items, startIndex, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(() => Math.min(Math.max(0, startIndex), items.length - 1));
  const [direction, setDirection] = useState<1 | -1>(1);

  const go = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setIndex((current) => Math.min(items.length - 1, Math.max(0, current + delta)));
    },
    [items.length],
  );

  // A swipe toward the left moves to the next ayah, like the azkar pages.
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

  const item = items[index];
  if (!item) {
    return null;
  }

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.story, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ConcentricRings size={300} opacity={0.08} style={styles.rings} />
        <View style={styles.segments}>
          {items.map((entry, position) => (
            <View
              key={`${entry.surahNumber}:${entry.ayahNumber}`}
              style={[styles.segment, position === index && styles.segmentActive]}
            >
              <View style={[styles.segmentFill, { width: position <= index ? '100%' : '0%' }]} />
            </View>
          ))}
        </View>
        <View style={styles.top}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إغلاق"
            onPress={onClose}
            style={styles.close}
          >
            <Ionicons name="close" size={22} color="#FFF9EA" />
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>التفسير الميسر</Text>
            <Text style={styles.sub}>
              {item.surahName} · الآية {toArabicNumbers(item.ayahNumber)} ({toArabicNumbers(index + 1)} من{' '}
              {toArabicNumbers(items.length)})
            </Text>
          </View>
          <Ionicons name="reader-outline" size={22} color={GOLD_LIGHT} />
        </View>

        <View style={styles.stage} {...pan.panHandlers}>
          <TafsirPage key={`${item.surahNumber}:${item.ayahNumber}`} item={item} fromDirection={direction} />
          {items.length > 1 ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="الآية التالية"
                onPress={() => go(1)}
                style={[styles.zone, styles.zoneRight]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="الآية السابقة"
                onPress={() => go(-1)}
                style={[styles.zone, styles.zoneLeft]}
              />
            </>
          ) : null}
        </View>
        {items.length > 1 ? (
          <Text style={styles.hint}>اضغط على اليمين للتالي، واليسار للسابق، أو اسحب</Text>
        ) : null}
      </View>
    </Modal>
  );
}

function TafsirPage({ item, fromDirection }: { item: TafsirStoryItem; fromDirection: 1 | -1 }) {
  const database = useSQLiteContext();
  const bundled = useMemo(
    () => getBundledTafsir(item.surahNumber, item.ayahNumber),
    [item.surahNumber, item.ayahNumber],
  );
  const [loaded, setLoaded] = useState<{ text: string | null; error: string | null } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [enter] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // Only an ayah missing from the bundled tafsir ever needs the network.
  useEffect(() => {
    if (bundled !== null) {
      return;
    }
    let active = true;
    new LocalQuranCache(database)
      .getAyahTafsir(item.surahNumber, item.ayahNumber)
      .then((text) => active && setLoaded({ text, error: null }))
      .catch(
        (error: unknown) =>
          active && setLoaded({ text: null, error: friendlyError(error, 'تعذر تحميل التفسير.') }),
      );
    return () => {
      active = false;
    };
  }, [bundled, database, item.ayahNumber, item.surahNumber]);

  const tafsir = bundled ?? loaded?.text ?? null;
  const error = bundled === null ? (loaded?.error ?? null) : null;

  async function copy(): Promise<void> {
    if (!tafsir) {
      return;
    }
    try {
      await Clipboard.setStringAsync(`${item.text}\n\n${tafsir}`);
      setCopied('تم نسخ التفسير');
    } catch {
      setCopied('تعذر النسخ');
    }
  }

  return (
    <Animated.View
      style={[
        styles.page,
        {
          opacity: enter,
          transform: [
            { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [40 * fromDirection, 0] }) },
          ],
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.ayah}>{item.text}</Text>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerRing}>
            <View style={styles.dividerDot} />
          </View>
          <View style={styles.dividerLine} />
        </View>
        {tafsir !== null ? (
          <Text style={styles.tafsir}>{tafsir}</Text>
        ) : error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : (
          <Text style={styles.sub}>جارٍ تحميل التفسير…</Text>
        )}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="نسخ التفسير"
        disabled={tafsir === null}
        onPress={() => void copy()}
        style={[styles.copy, tafsir === null && styles.copyOff]}
      >
        <Ionicons name="copy-outline" size={18} color={GOLD_LIGHT} />
        <Text style={styles.copyText}>{copied ?? 'نسخ'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  story: { flex: 1, backgroundColor: '#0B3D2E' },
  rings: { position: 'absolute', left: -110, bottom: -120 },
  segments: { flexDirection: 'row', gap: 3, paddingHorizontal: 12, paddingTop: 8 },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  segmentActive: { backgroundColor: 'rgba(255,255,255,0.32)' },
  segmentFill: { height: '100%', backgroundColor: GOLD_LIGHT },
  top: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 14 },
  titleWrap: { flex: 1, alignItems: 'flex-end' },
  title: { fontSize: TypeScale.title, fontWeight: '900', color: '#FFF9EA' },
  sub: { fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.7)', textAlign: 'center' },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stage: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 22, paddingBottom: 12, gap: 10 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', gap: 16, paddingVertical: 8 },
  ayah: { fontSize: 25, lineHeight: 46, textAlign: 'center', fontWeight: '600', color: GOLD_LIGHT },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  tafsir: { fontSize: 19, lineHeight: 34, textAlign: 'center', color: '#FFF9EA' },
  error: { fontSize: TypeScale.body, textAlign: 'center', color: '#FFB4A9' },
  copy: {
    alignSelf: 'center',
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
  copyOff: { opacity: 0.4 },
  copyText: { fontSize: TypeScale.label, fontWeight: '800', color: GOLD_LIGHT },
  zone: { position: 'absolute', top: 0, bottom: 0, width: `${SIDE_ZONE * 100}%` },
  zoneRight: { right: 0 },
  zoneLeft: { left: 0 },
  hint: { textAlign: 'center', fontSize: TypeScale.micro, color: 'rgba(239,248,243,0.5)', paddingBottom: 8 },
});
