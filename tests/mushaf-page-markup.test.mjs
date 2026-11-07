import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildHighlightElements,
  getMushafPageCenteringOffset,
  renderMushafLinesHtml,
} from '../src/features/reader/services/mushaf-page-markup.ts';

/**
 * A page shaped like the real source payload: the API returns one record per
 * word carrying `line_number` from the printed Mushaf, and the page layout is
 * the grouping of those words by line — never a measurement-based re-wrap.
 */
const SYNTHETIC_LINE_COUNT = 15;

function buildSyntheticPage() {
  const words = [];
  for (let lineNumber = 1; lineNumber <= SYNTHETIC_LINE_COUNT; lineNumber++) {
    const ayahNumber = lineNumber;
    words.push({
      id: `1:${ayahNumber}:1`,
      surahNumber: 1,
      ayahNumber,
      position: 1,
      charType: 'word',
      codeV2: `SYNTHETIC_GLYPH_${lineNumber}`,
      textUthmani: `SYNTHETIC_TEST_TOKEN_${lineNumber}`,
      lineNumber,
    });
    words.push({
      id: `1:${ayahNumber}:2`,
      surahNumber: 1,
      ayahNumber,
      position: 2,
      charType: 'end',
      codeV2: `SYNTHETIC_END_${lineNumber}`,
      textUthmani: '',
      lineNumber,
    });
  }

  const lines = Array.from({ length: SYNTHETIC_LINE_COUNT }, (_, index) => ({
    lineNumber: index + 1,
    words: words.filter((word) => word.lineNumber === index + 1),
  }));

  const ayahs = lines.map((line) => ({
    surahNumber: 1,
    ayahNumber: line.lineNumber,
    words: line.words,
  }));

  return { pageNumber: 1, juzNumber: 1, hizbNumber: 1, surahs: [], lines, ayahs };
}

test('renders exactly one Mushaf row per source line, placed at that line', () => {
  const page = buildSyntheticPage();
  const html = renderMushafLinesHtml(page);

  const rows = [...html.matchAll(/<div class="line" style="grid-row: (\d+);"/g)].map((match) =>
    Number(match[1]),
  );

  assert.deepEqual(
    rows,
    Array.from({ length: SYNTHETIC_LINE_COUNT }, (_, index) => index + 1),
  );
  // One row per source line: the layout is never split or merged by the renderer.
  assert.equal(rows.length, page.lines.length);
});

test('centers the first page rows without changing their spacing', () => {
  const page = buildSyntheticPage();
  page.lines = page.lines.slice(0, 7);
  page.ayahs = page.ayahs.slice(0, 7);

  const offset = getMushafPageCenteringOffset(page, SYNTHETIC_LINE_COUNT);
  const html = renderMushafLinesHtml(page, offset);
  const rows = [...html.matchAll(/<div class="line" style="grid-row: (\d+);"/g)].map((match) =>
    Number(match[1]),
  );

  assert.equal(offset, 4);
  assert.deepEqual(rows, [5, 6, 7, 8, 9, 10, 11]);
});

test('keeps the source word order inside every line', () => {
  const page = buildSyntheticPage();
  const html = renderMushafLinesHtml(page);

  for (let lineNumber = 1; lineNumber <= SYNTHETIC_LINE_COUNT; lineNumber++) {
    const wordIndex = html.indexOf(`id="word-1:${lineNumber}:1"`);
    const endIndex = html.indexOf(`id="ayah-1-${lineNumber}"`);
    assert.ok(wordIndex >= 0, `line ${lineNumber} keeps its word`);
    assert.ok(endIndex > wordIndex, `line ${lineNumber} keeps the ayah marker after its word`);
  }
});

test('keeps words and their markers interactive and tagged with source references', () => {
  const page = buildSyntheticPage();
  const html = renderMushafLinesHtml(page);

  assert.match(
    html,
    /<button type="button" class="word" data-surah="1" data-ayah="3" id="word-1:3:1" data-kind="word" data-word-id="1:3:1"/,
  );
  assert.match(html, /id="ayah-1-3" data-surah="1" data-ayah="3" data-kind="ayah"/);
});

test('never bakes highlight markup into the page document', () => {
  const page = buildSyntheticPage();
  const html = renderMushafLinesHtml(page);

  // Highlights are applied as a runtime overlay so a pre-rendered neighbour page
  // keeps an identical document when it becomes the current page.
  assert.equal(html.includes('hl-bg'), false);
  assert.equal(html.includes('hl-marker'), false);
  assert.equal(html.includes('--hl-'), false);
});

test('inserts the surah heading and Basmala on the rows the source leaves free', () => {
  const word = (lineNumber) => ({
    id: `2:1:${lineNumber}`,
    surahNumber: 2,
    ayahNumber: 1,
    position: 1,
    charType: 'word',
    codeV2: `SYNTHETIC_GLYPH_${lineNumber}`,
    textUthmani: `SYNTHETIC_TEST_TOKEN_${lineNumber}`,
    lineNumber,
  });
  // The printed page reserves the two rows above the first word of the surah.
  const page = {
    pageNumber: 2,
    juzNumber: 1,
    hizbNumber: 1,
    surahs: [{ surahNumber: 2, nameArabic: 'سورة اختبارية' }],
    basmalaWords: [
      { id: '2:1:b1', textUthmani: 'SYNTHETIC_BASMALA', codeV2: 'SYNTHETIC_BASMALA_GLYPH' },
    ],
    lines: [
      { lineNumber: 3, words: [word(3)] },
      { lineNumber: 4, words: [word(4)] },
    ],
    ayahs: [{ surahNumber: 2, ayahNumber: 1, words: [word(3), word(4)] }],
  };

  const html = renderMushafLinesHtml(page);

  assert.match(html, /<div class="surah-title" style="grid-row: 1;"/);
  assert.match(html, /<div class="opening-basmala" style="grid-row: 2;"/);
  // The rows that carry source words are left untouched for the text itself.
  const lineRows = [
    ...html.matchAll(/<div class="line" style="grid-row: (\d+);"/g),
  ].map((match) => Number(match[1]));
  assert.deepEqual(lineRows, [3, 4]);

  const offset = getMushafPageCenteringOffset(page, SYNTHETIC_LINE_COUNT);
  const centeredHtml = renderMushafLinesHtml(page, offset);
  assert.equal(offset, 5);
  assert.match(centeredHtml, /<div class="surah-title" style="grid-row: 6;"/);
  assert.match(centeredHtml, /<div class="opening-basmala" style="grid-row: 7;"/);
  assert.deepEqual(
    [...centeredHtml.matchAll(/<div class="line" style="grid-row: (\d+);"/g)].map((match) =>
      Number(match[1]),
    ),
    [8, 9],
  );
});

test('keys highlights by the document ids the page actually renders', () => {
  const page = buildSyntheticPage();
  page.lines = [page.lines[0]];
  page.ayahs = [page.ayahs[0]];
  const [word, marker] = page.lines[0].words;

  const elements = buildHighlightElements(page, [
    { target: { type: 'word', surahNumber: 1, ayahNumber: 1, wordId: word.id }, color: '#112233', opacity: 0.5 },
    { target: { type: 'ayah', surahNumber: 1, ayahNumber: 1 }, color: '#445566', opacity: 0.5 },
  ]);

  // The overlay resolves elements with getElementById, so the keys must match
  // the rendered ids exactly — otherwise a saved highlight silently disappears.
  assert.deepEqual(
    Object.keys(elements).sort(),
    ['ayah-1-1', `word-${word.id}`, `word-${marker.id}`].sort(),
  );
  assert.equal(elements[`word-${word.id}`].marker, 'rgba(17, 34, 51, 0.5)');
  assert.match(elements[`word-${word.id}`].bg, /^rgba\(68, 85, 102, 0\.275/);
  assert.match(elements['ayah-1-1'].bg, /^rgba\(68, 85, 102, 0\.2/);
  assert.equal(marker.charType, 'end');
});

test('ignores highlights that belong to another ayah', () => {
  const page = buildSyntheticPage();
  page.lines = [page.lines[0]];
  page.ayahs = [page.ayahs[0]];

  const elements = buildHighlightElements(page, [
    { target: { type: 'ayah', surahNumber: 1, ayahNumber: 99 }, color: '#ffffff', opacity: 1 },
  ]);

  assert.deepEqual(elements, {});
});
