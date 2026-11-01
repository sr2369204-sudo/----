import type { QuranAyah } from '../types';

export type TajweedSegment = {
  text: string;
  rule: string | null;
};

const tajweedTag = /<tajweed class=([a-z_]+)>|<\/tajweed>|<span class=end>|<\/span>/g;

export const tajweedRuleColors: Record<string, string> = {
  ham_wasl: '#8C9298',
  laam_shamsiyah: '#8C9298',
  madda_normal: '#A33DB5',
  madda_permissible: '#A33DB5',
  madda_necessary: '#8E2CA7',
  madda_obligatory: '#8E2CA7',
  ghunnah: '#18864B',
  idgham_ghunnah: '#18864B',
  idgham_wo_ghunnah: '#18864B',
  idgham_mutajanisayn: '#18864B',
  idgham_shafawi: '#18864B',
  idgham_miimi: '#18864B',
  ikhfa: '#1684B8',
  ikhafa: '#1684B8',
  ikhfa_shafawi: '#1684B8',
  iqlab: '#C54135',
  qalqalah: '#D87A19',
  qalaqah: '#D87A19',
  silent: '#8C9298',
  slnt: '#8C9298',
};

export function parseTajweedMarkup(value: string): TajweedSegment[] {
  const segments: TajweedSegment[] = [];
  const ruleStack: string[] = [];
  let inEndMarker = false;
  let previousIndex = 0;

  for (const match of value.matchAll(tajweedTag)) {
    const index = match.index ?? 0;
    if (index > previousIndex) {
      segments.push({
        text: value.slice(previousIndex, index),
        rule: inEndMarker ? null : ruleStack.at(-1) ?? null,
      });
    }

    if (match[1]) {
      ruleStack.push(match[1]);
    } else if (match[0] === '</tajweed>') {
      ruleStack.pop();
    } else if (match[0] === '<span class=end>') {
      inEndMarker = true;
    } else {
      inEndMarker = false;
    }
    previousIndex = index + match[0].length;
  }

  if (previousIndex < value.length) {
    segments.push({
      text: value.slice(previousIndex),
      rule: inEndMarker ? null : ruleStack.at(-1) ?? null,
    });
  }

  return segments;
}

export function getWordTajweedSegments(ayah: QuranAyah): Map<string, TajweedSegment[]> {
  const tajweedText = ayah.tajweedText.replace(/<span class=end>[^<>]*<\/span>/g, '');
  const segments = parseTajweedMarkup(tajweedText);
  const groupedWords: TajweedSegment[][] = [];
  let currentWord: TajweedSegment[] = [];

  for (const segment of segments) {
    for (const part of segment.text.split(/(\s+)/)) {
      if (part.length === 0) {
        continue;
      }
      if (/^\s+$/.test(part)) {
        if (currentWord.length > 0) {
          groupedWords.push(currentWord);
          currentWord = [];
        }
      } else if (part.length === 1 && part.charCodeAt(0) === 0x06de) {
        if (currentWord.length > 0) {
          groupedWords.push(currentWord);
          currentWord = [];
        }
      } else {
        currentWord.push({ text: part, rule: segment.rule });
      }
    }
  }
  if (currentWord.length > 0) {
    groupedWords.push(currentWord);
  }

  const result = new Map<string, TajweedSegment[]>();
  if (groupedWords.length !== ayah.words.length) {
    return new Map(
      ayah.words.map((word) => [word.id, [{ text: word.textUthmani, rule: null }]]),
    );
  }

  ayah.words.forEach((word, index) => {
    result.set(word.id, groupedWords[index]);
  });
  return result;
}
