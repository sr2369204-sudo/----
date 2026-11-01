import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { Highlight } from '@/features/annotations/types';
import type { QuranAyah, QuranWord } from '@/features/quran/types';
import { getWordTajweedSegments, tajweedRuleColors } from '@/features/quran/services/tajweed';
import { useTheme } from '@/hooks/use-theme';
import { useReaderSelectionStore } from '@/features/reader/state/selection-store';

type Props = {
  surahNumber: number;
  ayahs: QuranAyah[];
  highlights: Highlight[];
  showTajweed: boolean;
  fontSize: number;
};

export function QuranText({ surahNumber, ayahs, highlights, showTajweed, fontSize }: Props) {
  const colors = useTheme();
  const selection = useReaderSelectionStore((state) => state.selection);
  const selectAyah = useReaderSelectionStore((state) => state.selectAyah);
  const selectWord = useReaderSelectionStore((state) => state.selectWord);

  const content: ReactNode[] = [];

  for (const ayah of ayahs) {
    const ayahHighlights = highlights.filter(
      (highlight) =>
        highlight.target.type === 'ayah' &&
        highlight.target.surahNumber === surahNumber &&
        highlight.target.ayahNumber === ayah.ayahNumber,
    );
    const ayahHighlight = ayahHighlights[0];
    const wordSegments = getWordTajweedSegments(ayah);
    const ayahContent: ReactNode[] = [];
    if (ayah.tajweedText.replace(/<[^>]*>/g, '').trimStart().startsWith(String.fromCharCode(0x06de))) {
      ayahContent.push(
        <Text key={`rub-marker:${ayah.ayahNumber}`} style={[styles.ayahMarker, { color: colors.primary }]}>
          {`${String.fromCharCode(0x06de)} `}
        </Text>,
      );
    }

    ayah.words.forEach((word, index) => {
      if (index > 0) {
        ayahContent.push(' ');
      }

      const wordHighlight = findWordHighlight(ayah, word, surahNumber, highlights);
      const isSelected =
        selection?.type === 'word' &&
        selection.surahNumber === surahNumber &&
        selection.ayah.ayahNumber === ayah.ayahNumber &&
        selection.word.id === word.id;
      const wordStyle = [
        styles.word,
        wordHighlight && { backgroundColor: withOpacity(wordHighlight.color, wordHighlight.opacity) },
        isSelected && { backgroundColor: colors.backgroundSelected, borderBottomColor: colors.primary },
      ];

      ayahContent.push(
        <Text
          key={word.id}
          accessibilityRole="button"
          accessibilityLabel={`${word.textUthmani}، كلمة ${word.position} من الآية ${ayah.ayahNumber}`}
          onPress={() => selectWord(surahNumber, ayah, word, 'compact')}
          onLongPress={() => selectWord(surahNumber, ayah, word, 'full')}
          style={wordStyle}>
          {(wordSegments.get(word.id) ?? [{ text: word.textUthmani, rule: null }]).map(
            (segment, segmentIndex) => (
              <Text
                key={`${word.id}:${segmentIndex}`}
                style={{
                  color: showTajweed && segment.rule
                    ? tajweedRuleColors[segment.rule] ?? colors.text
                    : colors.text,
                }}>
                {segment.text}
              </Text>
            ),
          )}
        </Text>,
      );
    });

    ayahContent.push(
      <Text
        key={`marker:${ayah.ayahNumber}`}
        accessibilityRole="button"
        accessibilityLabel={`إجراءات الآية ${ayah.ayahNumber}`}
        onPress={() => selectAyah(surahNumber, ayah, 'compact')}
        onLongPress={() => selectAyah(surahNumber, ayah, 'full')}
        style={[styles.ayahMarker, { color: colors.primary }]}>
        {' ۝'}
        {toArabicNumbers(ayah.ayahNumber)}
        {'۝ '}
      </Text>,
    );

    content.push(
      <Text
        key={`ayah:${ayah.ayahNumber}`}
        style={[
          ayahHighlight && {
            backgroundColor: withOpacity(ayahHighlight.color, ayahHighlight.opacity),
          },
        ]}>
        {ayahContent}
      </Text>,
    );
  }

  return (
    <Text
      style={[
        styles.passage,
        { color: colors.text, fontSize, lineHeight: Math.round(fontSize * 2.05) },
      ]}>
      {content}
    </Text>
  );
}

const styles = StyleSheet.create({
  passage: {
    textAlign: 'justify',
    writingDirection: 'rtl',
    includeFontPadding: false,
  },
  word: {
    borderRadius: 5,
  },
  ayahMarker: {
    fontSize: 19,
    fontWeight: '700',
  },
});

function findWordHighlight(
  ayah: QuranAyah,
  word: QuranWord,
  surahNumber: number,
  highlights: Highlight[],
): Highlight | null {
  const currentWordIndex = ayah.words.findIndex((ayahWord) => ayahWord.id === word.id);
  return highlights.find((highlight) => {
    const target = highlight.target;
    if (
      target.surahNumber !== surahNumber ||
      target.ayahNumber !== ayah.ayahNumber
    ) {
      return false;
    }
    if (target.type === 'word') {
      return target.wordId === word.id;
    }
    if (target.type !== 'range') {
      return false;
    }
    const start = ayah.words.findIndex((ayahWord) => ayahWord.id === target.startWordId);
    const end = ayah.words.findIndex((ayahWord) => ayahWord.id === target.endWordId);
    return start >= 0 && end >= start && currentWordIndex >= start && currentWordIndex <= end;
  }) ?? null;
}

function withOpacity(color: string, opacity: number): string {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function toArabicNumbers(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}
