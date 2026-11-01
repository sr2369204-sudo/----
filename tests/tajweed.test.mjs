import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getWordTajweedSegments,
  parseTajweedMarkup,
  tajweedRuleColors,
} from '../src/features/quran/services/tajweed.ts';

test('parses Quran.com Tajweed tags without rendering HTML', () => {
  assert.deepEqual(
    parseTajweedMarkup('بِسْمِ <tajweed class=ham_wasl>ٱ</tajweed>للَّهِ <span class=end>١</span>'),
    [
      { text: 'بِسْمِ ', rule: null },
      { text: 'ٱ', rule: 'ham_wasl' },
      { text: 'للَّهِ ', rule: null },
      { text: '١', rule: null },
    ],
  );
  assert.equal(tajweedRuleColors.ham_wasl, '#8C9298');
  assert.equal(tajweedRuleColors.qalaqah, '#D87A19');
  assert.equal(tajweedRuleColors.ikhafa, '#1684B8');
  assert.equal(tajweedRuleColors.idgham_mutajanisayn, '#18864B');
});

test('matches Tajweed color segments to source word identifiers', () => {
  const ayah = {
    ayahNumber: 1,
    tajweedText: 'بِسْمِ <tajweed class=ham_wasl>ٱ</tajweed>للَّهِ <span class=end>١</span>',
    words: [
      { id: '1', position: 1, textUthmani: 'بِسْمِ', audioUrl: null },
      { id: '2', position: 2, textUthmani: 'ٱللَّهِ', audioUrl: null },
    ],
  };
  const words = getWordTajweedSegments(ayah);

  assert.deepEqual(words.get('1'), [{ text: 'بِسْمِ', rule: null }]);
  assert.deepEqual(words.get('2'), [
    { text: 'ٱ', rule: 'ham_wasl' },
    { text: 'للَّهِ', rule: null },
  ]);
});

test('preserves nested source rules and ignores a separate hizb marker when mapping words', () => {
  const ayah = {
    ayahNumber: 1,
    tajweedText: `${String.fromCharCode(0x06de)} <tajweed class=madda_obligatory>قُوٓ<tajweed class=slnt>اْ</tajweed></tajweed> إِنَّ <span class=end>١</span>`,
    words: [
      { id: '1', position: 1, textUthmani: 'قُوٓاْ', audioUrl: null },
      { id: '2', position: 2, textUthmani: 'إِنَّ', audioUrl: null },
    ],
  };
  const words = getWordTajweedSegments(ayah);

  assert.deepEqual(words.get('1'), [
    { text: 'قُوٓ', rule: 'madda_obligatory' },
    { text: 'اْ', rule: 'slnt' },
  ]);
  assert.deepEqual(words.get('2'), [{ text: 'إِنَّ', rule: null }]);
});
