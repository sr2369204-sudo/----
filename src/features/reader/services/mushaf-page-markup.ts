import type { Highlight } from '../../annotations/types';
import type { MushafPage } from '../../quran/types';

/**
 * Builds the Mushaf line rows for one page.
 *
 * The source already carries the printed line division (`line_number` per word),
 * so every row is placed at its own source line through an explicit `grid-row`.
 * The markup never re-flows or re-wraps the text: a line keeps exactly the words
 * the printed Mushaf assigns to it, in source order, which is what keeps the
 * margins and the per-line width identical to the printed page.
 */
export function renderMushafLinesHtml(page: MushafPage): string {
  const sourceLineNumbers = new Set(page.lines.map((line) => line.lineNumber));
  const surahTitles: Record<number, string> = {};
  const basmalas: Record<number, string> = {};

  for (const ayah of page.ayahs) {
    if (ayah.ayahNumber !== 1) continue;
    const firstWord = page.lines
      .flatMap((line) => line.words)
      .find(
        (word) =>
          word.surahNumber === ayah.surahNumber &&
          word.ayahNumber === 1 &&
          word.charType === 'word',
      );
    if (!firstWord) continue;
    const surah = page.surahs.find((item) => item.surahNumber === ayah.surahNumber);
    const surahName = surah ? surah.nameArabic : '';
    const titleRow =
      firstWord.surahNumber === 1 || firstWord.surahNumber === 9
        ? firstWord.lineNumber - 1
        : firstWord.lineNumber - 2;
    const basmalaRow = firstWord.lineNumber - 1;

    if (titleRow >= 1 && !sourceLineNumbers.has(titleRow)) {
      surahTitles[titleRow] = `
        <div class="surah-title" style="grid-row: ${titleRow};" aria-label="سورة ${escapeHtml(surahName)}">
          <div class="surah-title-container">
            <div class="surah-info-circle start">
              <span class="info-label">آياتها</span>
              <span class="info-value">${toArabicNumberString(surah?.ayahCount ?? 0)}</span>
            </div>
            <div class="surah-title-box">
              <span class="surah-title-text">سورة ${escapeHtml(surahName)}</span>
            </div>
            <div class="surah-info-circle end">
              <span class="info-label">ترتيبها</span>
              <span class="info-value">${toArabicNumberString(surah?.surahNumber ?? 0)}</span>
            </div>
          </div>
        </div>`;
    }

    if (
      firstWord.surahNumber !== 9 &&
      firstWord.surahNumber !== 1 &&
      basmalaRow >= 1 &&
      !sourceLineNumbers.has(basmalaRow) &&
      Array.isArray(page.basmalaWords) &&
      page.basmalaWords.length > 0
    ) {
      const basmalaWordsHtml = page.basmalaWords
        .map(
          (word) =>
            `<span class="basmala-word" aria-label="${escapeHtml(word.textUthmani)}">${word.codeV2}</span>`,
        )
        .join(' ');
      basmalas[basmalaRow] = `
        <div class="opening-basmala" style="grid-row: ${basmalaRow};">
          <span class="line-inner">${basmalaWordsHtml}</span>
        </div>`;
    }
  }

  const renderedRows: string[] = [];
  const maxLine = Math.max(...page.lines.map((l) => l.lineNumber), 15);

  for (let r = 1; r <= maxLine; r++) {
    if (surahTitles[r]) {
      renderedRows.push(surahTitles[r]);
    }
    if (basmalas[r]) {
      renderedRows.push(basmalas[r]);
    }

    const line = page.lines.find((l) => l.lineNumber === r);
    if (!line) continue;

    const wordsHtml = line.words
      .map((word) => {
        if (word.charType === 'word') {
          const rubClass = word.textUthmani.includes('\u06de') ? ' rub-marker' : '';
          return `<button type="button" class="word${rubClass}" data-surah="${word.surahNumber}" data-ayah="${word.ayahNumber}" id="word-${word.id}" data-kind="word" data-word-id="${word.id}" aria-label="${escapeHtml(word.textUthmani)}، كلمة ${word.position} من الآية ${word.ayahNumber}">${word.codeV2}</button>`;
        } else {
          const markerId = `ayah-${word.surahNumber}-${word.ayahNumber}`;
          return `<button type="button" class="ayah-marker" id="${markerId}" data-surah="${word.surahNumber}" data-ayah="${word.ayahNumber}" data-kind="ayah" aria-label="إجراءات الآية ${word.ayahNumber}">${word.codeV2}</button>`;
        }
      })
      .join(' ');

    renderedRows.push(
      `<div class="line" style="grid-row: ${line.lineNumber};" aria-label="السطر ${line.lineNumber}"><span class="line-inner">${wordsHtml}</span></div>`,
    );
  }

  return renderedRows.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function toArabicNumberString(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

export type HighlightElement = { bg: string; marker?: string; ayahBg?: string };

/** Highlight payload for one rendered element, keyed by its document id. */
export type HighlightElementMap = Record<string, HighlightElement>;

/**
 * Resolves saved highlights to the ids of the rendered page elements.
 *
 * The result is applied to the live document at runtime instead of being baked
 * into the markup, so a page that was pre-rendered as a neighbour keeps an
 * identical document once it becomes the current page.
 */
export function buildHighlightElements(
  page: MushafPage,
  highlights: Highlight[],
): HighlightElementMap {
  const elements: HighlightElementMap = {};
  for (const ayah of page.ayahs) {
    const ayahHighlight = highlights.find(
      (highlight) =>
        highlight.target.type === 'ayah' &&
        highlight.target.surahNumber === ayah.surahNumber &&
        highlight.target.ayahNumber === ayah.ayahNumber,
    );

    for (const word of ayah.words) {
      const wordIndex = ayah.words.findIndex((item) => item.id === word.id);
      const wordHighlight = highlights.find((item) => {
        const target = item.target;
        if (
          target.surahNumber !== ayah.surahNumber ||
          target.ayahNumber !== ayah.ayahNumber
        ) {
          return false;
        }
        if (target.type === 'word') {
          return target.wordId === word.id;
        }
        if (target.type === 'range') {
          const start = ayah.words.findIndex((item) => item.id === target.startWordId);
          const end = ayah.words.findIndex((item) => item.id === target.endWordId);
          return start >= 0 && end >= start && wordIndex >= start && wordIndex <= end;
        }
        return false;
      });

      const element: HighlightElement = { bg: '' };
      if (ayahHighlight) {
        element.bg = toRgba(ayahHighlight.color, ayahHighlight.opacity * 0.55);
      }
      if (wordHighlight) {
        element.marker = toRgba(wordHighlight.color, wordHighlight.opacity);
      }
      if (element.bg || element.marker) {
        elements[`word-${word.id}`] = element;
      }
    }

    if (ayahHighlight) {
      elements[`ayah-${ayah.surahNumber}-${ayah.ayahNumber}`] = {
        bg: toRgba(ayahHighlight.color, ayahHighlight.opacity * 0.4),
        ayahBg: toRgba(ayahHighlight.color, ayahHighlight.opacity * 0.68),
      };
    }
  }
  return elements;
}

function toRgba(color: string, opacity: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    return 'transparent';
  }
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, opacity))})`;
}
