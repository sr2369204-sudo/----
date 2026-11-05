import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTafkhimExampleSegments,
  getWordTajweedSegments,
  parseTajweedMarkup,
  tajweedRuleColors,
  tajweedRuleGuide,
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
  assert.equal(tajweedRuleColors.tafkhim, '#006E9B');
  assert.equal(tajweedRuleColors.qalaqah, '#0690FD');
  assert.equal(tajweedRuleColors.ikhafa, '#019326');
  assert.equal(tajweedRuleColors.idgham_mutajanisayn, '#B6B6B6');
  assert.equal(tajweedRuleColors.madda_permissible, '#FB6F00');
  assert.equal(tajweedRuleColors.madda_normal, '#FDB700');
  assert.equal(tajweedRuleColors.madda_necessary, '#B30365');
  assert.equal(tajweedRuleColors.madda_obligatory, '#FF016F');
  assert.deepEqual(
    tajweedRuleGuide.map(({ label, color }) => [label, color]),
    [
      ['تفخيم', '#006E9B'],
      ['قلقلة', '#0690FD'],
      ['إخفاء، ومواقع الغنة (حركتان)', '#019326'],
      ['إدغام، وما لا يلفظ', '#B6B6B6'],
      ['مد ٢ أو ٤ أو ٦ جوازًا', '#FB6F00'],
      ['مد حركتان', '#FDB700'],
      ['مد ٦ حركات لزومًا', '#B30365'],
      ['مد واجب ٤ أو ٥ حركات', '#FF016F'],
    ],
  );
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

test('highlights only the emphatic letter and its diacritics in a Tajweed example', () => {
  assert.deepEqual(getTafkhimExampleSegments('بِظُلُمَاتٍ'), [
    { text: 'بِ', rule: null },
    { text: 'ظُ', rule: 'tafkhim' },
    { text: 'لُمَاتٍ', rule: null },
  ]);
  assert.equal(getTafkhimExampleSegments('كِتَابٌ'), null);
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
