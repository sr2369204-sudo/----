import type { QuranAyah } from '../types';

export type TajweedSegment = {
  text: string;
  rule: string | null;
};

const tajweedTag = /<tajweed class=([a-z_]+)>|<\/tajweed>|<span class=end>|<\/span>/g;

export const tajweedRuleColors: Record<string, string> = {
  tafkhim: '#006E9B',
  tafkheem: '#006E9B',
  qalqalah: '#0690FD',
  qalaqah: '#0690FD',
  ikhfa: '#019326',
  ikhafa: '#019326',
  ikhfa_shafawi: '#019326',
  ghunnah: '#019326',
  iqlab: '#019326',
  idgham_ghunnah: '#019326',
  idgham_shafawi: '#019326',
  idgham_miimi: '#019326',
  ham_wasl: '#B6B6B6',
  laam_shamsiyah: '#B6B6B6',
  idgham_wo_ghunnah: '#B6B6B6',
  idgham_mutajanisayn: '#B6B6B6',
  silent: '#B6B6B6',
  slnt: '#B6B6B6',
  madda_permissible: '#FB6F00',
  madda_normal: '#FDB700',
  madda_necessary: '#B30365',
  madda_obligatory: '#FF016F',
};

export const tajweedRuleGuide: {
  id: string;
  label: string;
  color: string;
  classes: readonly string[];
}[] = [
  { id: 'tafkhim', label: 'تفخيم', color: tajweedRuleColors.tafkhim, classes: ['tafkhim', 'tafkheem'] },
  { id: 'qalqalah', label: 'قلقلة', color: tajweedRuleColors.qalqalah, classes: ['qalqalah', 'qalaqah'] },
  {
    id: 'ikhfa-ghunnah',
    label: 'إخفاء، ومواقع الغنة (حركتان)',
    color: tajweedRuleColors.ghunnah,
    classes: [
      'ikhfa',
      'ikhafa',
      'ikhfa_shafawi',
      'ghunnah',
      'iqlab',
      'idgham_ghunnah',
      'idgham_shafawi',
      'idgham_miimi',
    ],
  },
  {
    id: 'idgham-silent',
    label: 'إدغام، وما لا يلفظ',
    color: tajweedRuleColors.ham_wasl,
    classes: [
      'ham_wasl',
      'laam_shamsiyah',
      'idgham_wo_ghunnah',
      'idgham_mutajanisayn',
      'silent',
      'slnt',
    ],
  },
  {
    id: 'madda-permissible',
    label: 'مد ٢ أو ٤ أو ٦ جوازًا',
    color: tajweedRuleColors.madda_permissible,
    classes: ['madda_permissible'],
  },
  {
    id: 'madda-normal',
    label: 'مد حركتان',
    color: tajweedRuleColors.madda_normal,
    classes: ['madda_normal'],
  },
  {
    id: 'madda-necessary',
    label: 'مد ٦ حركات لزومًا',
    color: tajweedRuleColors.madda_necessary,
    classes: ['madda_necessary'],
  },
  {
    id: 'madda-obligatory',
    label: 'مد واجب ٤ أو ٥ حركات',
    color: tajweedRuleColors.madda_obligatory,
    classes: ['madda_obligatory'],
  },
];

export function getTafkhimExampleSegments(word: string): TajweedSegment[] | null {
  const characters = Array.from(word);
  const letterIndex = characters.findIndex((character) => /[صضطظخغق]/u.test(character));
  if (letterIndex === -1) {
    return null;
  }

  let endIndex = letterIndex + 1;
  while (endIndex < characters.length && /\p{M}/u.test(characters[endIndex])) {
    endIndex += 1;
  }
  return [
    ...(letterIndex > 0 ? [{ text: characters.slice(0, letterIndex).join(''), rule: null }] : []),
    { text: characters.slice(letterIndex, endIndex).join(''), rule: 'tafkhim' },
    ...(endIndex < characters.length
      ? [{ text: characters.slice(endIndex).join(''), rule: null }]
      : []),
  ];
}

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
