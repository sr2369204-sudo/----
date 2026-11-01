import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Highlight } from '@/features/annotations/types';
import type { QuranAyah, QuranWord } from '@/features/quran/types';
import { useTheme } from '@/hooks/use-theme';
import { useReaderSelectionStore } from '@/features/reader/state/selection-store';

type Props = {
  surahNumber: number;
  ayah: QuranAyah;
  highlights: Highlight[];
};

export function QuranText({ surahNumber, ayah, highlights }: Props) {
  const colors = useTheme();
  const selection = useReaderSelectionStore((state) => state.selection);
  const selectAyah = useReaderSelectionStore((state) => state.selectAyah);

  const ayahHighlights = highlights.filter(
    (highlight) =>
      highlight.target.type === 'ayah' &&
      highlight.target.surahNumber === surahNumber &&
      highlight.target.ayahNumber === ayah.ayahNumber,
  );

  return (
    <View style={styles.ayah}>
      {ayahHighlights.map((highlight) => (
        <View
          key={highlight.id}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: highlight.color,
              opacity: highlight.opacity,
              borderRadius: 16,
            },
          ]}
        />
      ))}
      <View style={styles.ayahContent}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`إجراءات الآية ${ayah.ayahNumber}`}
          onPress={() => selectAyah(surahNumber, ayah, 'compact')}
          onLongPress={() => selectAyah(surahNumber, ayah, 'full')}
          delayLongPress={450}
          style={({ pressed }) => [styles.ayahMarker, pressed && styles.pressed]}>
          <Text style={[styles.ayahMarkerText, { color: colors.primary }]}>{ayah.ayahNumber}</Text>
        </Pressable>
        <View style={styles.words}>
          {ayah.words.map((word) => (
            <WordToken
              key={word.id}
              word={word}
              ayah={ayah}
              surahNumber={surahNumber}
              highlights={highlights}
              textColor={colors.text}
              selectionColor={colors.primary}
              selected={
                selection?.type === 'word' &&
                selection.surahNumber === surahNumber &&
                selection.ayah.ayahNumber === ayah.ayahNumber &&
                selection.word.id === word.id
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type WordTokenProps = Props & {
  word: QuranWord;
  selected: boolean;
  textColor: string;
  selectionColor: string;
};

function WordToken({
  word,
  ayah,
  surahNumber,
  highlights,
  selected,
  textColor,
  selectionColor,
}: WordTokenProps) {
  const selectWord = useReaderSelectionStore((state) => state.selectWord);
  const currentWordIndex = ayah.words.findIndex((ayahWord) => ayahWord.id === word.id);
  const wordHighlights = highlights.filter((highlight) => {
    const target = highlight.target;
    if (target.type === 'word') {
      return (
        target.surahNumber === surahNumber &&
        target.ayahNumber === ayah.ayahNumber &&
        target.wordId === word.id
      );
    }
    if (
      target.type !== 'range' ||
      target.surahNumber !== surahNumber ||
      target.ayahNumber !== ayah.ayahNumber
    ) {
      return false;
    }
    const start = ayah.words.findIndex((ayahWord) => ayahWord.id === target.startWordId);
    const end = ayah.words.findIndex((ayahWord) => ayahWord.id === target.endWordId);
    return start >= 0 && end >= start && currentWordIndex >= start && currentWordIndex <= end;
  });
  const longPressHandled = useRef(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`كلمة رقم ${word.position} من الآية ${ayah.ayahNumber}`}
      delayLongPress={450}
      onLongPress={() => {
        longPressHandled.current = true;
        selectWord(surahNumber, ayah, word, 'full');
      }}
      onPress={() => {
        if (longPressHandled.current) {
          longPressHandled.current = false;
          return;
        }
        selectWord(surahNumber, ayah, word, 'compact');
      }}
      style={({ pressed }) => [
        styles.word,
        selected && [styles.selectedWord, { borderColor: selectionColor }],
        pressed && styles.pressed,
      ]}>
      {wordHighlights.map((highlight) => (
        <View
          key={highlight.id}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: highlight.color,
              opacity: highlight.opacity,
              borderRadius: 9,
            },
          ]}
        />
      ))}
      {selected && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.selectionLayer, { borderColor: selectionColor }]}
        />
      )}
      <Text style={[styles.wordText, { color: textColor }]}>{word.textUthmani}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ayah: {
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 12,
  },
  ayahContent: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    padding: 8,
    gap: 8,
  },
  ayahMarker: {
    minWidth: 36,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(19, 104, 78, 0.10)',
  },
  ayahMarkerText: {
    color: '#13684E',
    fontSize: 13,
    fontWeight: '700',
  },
  words: {
    flex: 1,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 7,
  },
  word: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 3,
    paddingVertical: 5,
    borderRadius: 9,
    minHeight: 42,
    justifyContent: 'center',
  },
  wordText: {
    color: '#18251F',
    fontSize: 27,
    lineHeight: 48,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectedWord: {
    borderWidth: 1,
  },
  selectionLayer: {
    borderWidth: 2,
    borderRadius: 9,
  },
  pressed: {
    opacity: 0.72,
  },
});
