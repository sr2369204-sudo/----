import { createElement, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Highlight } from '@/features/annotations/types';
import type { MushafPage } from '@/features/quran/types';
import {
  buildHighlightElements,
  renderMushafLinesHtml,
  toArabicNumberString,
  type HighlightElementMap,
} from '@/features/reader/services/mushaf-page-markup';

export type PageTurnDirection = 'next' | 'previous';

/** Position of a tapped element inside the WebView viewport (CSS pixels). */
export type ElementRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  page: MushafPage;
  fontBase64: string;
  basmalaFontBase64: string | null;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  selectedElementId: string | null;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    rect: ElementRect,
  ) => void;
  onAyahPress: (
    surahNumber: number,
    ayahNumber: number,
    rect: ElementRect,
  ) => void;
  onPageTurn: (direction: PageTurnDirection) => void;
  onInteractionError: (message: string) => void;
  /**
   * Fired once the page has fully laid out: fonts decoded, line fitting applied
   * and the first paint committed. The parent must not reveal a page before this.
   */
  onReady?: () => void;
  onPanStart?: (x: number, y: number) => void;
  onPanUpdate?: (dx: number, dy: number) => void;
  onPanEnd?: (dx: number, vx: number) => void;
  onPanCancel?: () => void;
};

type PageMessage =
  | {
      type: 'word';
      surahNumber: number;
      ayahNumber: number;
      wordId: string;
      rect: ElementRect;
    }
  | {
      type: 'ayah';
      surahNumber: number;
      ayahNumber: number;
      rect: ElementRect;
    }
  | { type: 'turn'; direction: PageTurnDirection }
  | { type: 'ready' }
  | { type: 'pan-start'; x: number; y: number }
  | { type: 'pan-update'; dx: number; dy: number }
  | { type: 'pan-end'; dx: number; vx: number }
  | { type: 'pan-cancel' };

export const MushafPageViewer = memo(function MushafPageViewer({
  page,
  fontBase64,
  basmalaFontBase64,
  fontSize,
  showTajweed,
  isDark,
  highlights,
  selectedElementId,
  onWordPress,
  onAyahPress,
  onPageTurn,
  onInteractionError,
  onReady,
  onPanStart,
  onPanUpdate,
  onPanEnd,
  onPanCancel,
}: Props) {
  const webViewRef = useRef<WebView<unknown>>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  // Highlights are applied as an overlay, never baked into the document. A page
  // that is pre-rendered as a neighbour must stay byte-identical once it becomes
  // the current page, otherwise the WebView would reload mid-transition.
  const highlightEntries = useMemo(
    () => buildHighlightElements(page, highlights),
    [highlights, page],
  );
  const html = useMemo(
    () =>
      createMushafHtml(page, fontBase64, basmalaFontBase64, fontSize, showTajweed, isDark),
    [basmalaFontBase64, fontBase64, fontSize, isDark, page, showTajweed],
  );
  // A stable source object prevents react-native-webview from reloading the
  // document on unrelated parent re-renders, which would flash and re-fit.
  const source = useMemo(() => ({ html }), [html]);

  const handleReady = useCallback((): void => {
    if (readyRef.current) {
      return;
    }
    readyRef.current = true;
    onReady?.();
  }, [onReady]);

  const handleMessage = useCallback(
    (message: PageMessage): void => {
      if (message.type === 'ready') {
        handleReady();
        return;
      }
      if (message.type === 'turn') {
        onPageTurn(message.direction);
        return;
      }
      if (message.type === 'pan-start') {
        onPanStart?.(message.x, message.y);
        return;
      }
      if (message.type === 'pan-update') {
        onPanUpdate?.(message.dx, message.dy);
        return;
      }
      if (message.type === 'pan-end') {
        onPanEnd?.(message.dx, message.vx);
        return;
      }
      if (message.type === 'pan-cancel') {
        onPanCancel?.();
        return;
      }
      const ayahExists = page.ayahs.some(
        (ayah) =>
          ayah.surahNumber === message.surahNumber &&
          ayah.ayahNumber === message.ayahNumber,
      );
      if (!ayahExists) {
        onInteractionError('تعذر مطابقة التحديد مع بيانات صفحة المصحف.');
        return;
      }

      if (message.type === 'word') {
        const wordExists = page.ayahs.some(
          (ayah) =>
            ayah.surahNumber === message.surahNumber &&
            ayah.ayahNumber === message.ayahNumber &&
            ayah.words.some((word) => word.id === message.wordId),
        );
        if (!wordExists) {
          onInteractionError('تعذر مطابقة الكلمة مع بيانات صفحة المصحف.');
          return;
        }
        onWordPress(message.surahNumber, message.ayahNumber, message.wordId, message.rect);
        return;
      }

      onAyahPress(message.surahNumber, message.ayahNumber, message.rect);
    },
    [
      handleReady,
      onAyahPress,
      onInteractionError,
      onPageTurn,
      onPanCancel,
      onPanEnd,
      onPanStart,
      onPanUpdate,
      onWordPress,
      page.ayahs,
    ],
  );

  const syncSelectedElement = useCallback(() => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', selectedElementId },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.selectMushafElement?.(${JSON.stringify(selectedElementId)}); true;`,
      );
    }
  }, [selectedElementId]);

  const syncHighlights = useCallback((entries: HighlightElementMap) => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', highlights: entries },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.applyMushafHighlights?.(${JSON.stringify(entries)}); true;`,
      );
    }
  }, []);

  const syncOverlays = useCallback(() => {
    syncSelectedElement();
    syncHighlights(highlightEntries);
  }, [highlightEntries, syncHighlights, syncSelectedElement]);

  useEffect(() => {
    syncHighlights(highlightEntries);
  }, [highlightEntries, syncHighlights]);

  const onNativeMessage = useCallback(
    (event: WebViewMessageEvent): void => {
      try {
        const message: unknown = JSON.parse(event.nativeEvent.data);
        if (!isPageMessage(message)) {
          onInteractionError('وصل تحديد غير صالح من صفحة المصحف.');
          return;
        }
        handleMessage(message);
      } catch (error) {
        onInteractionError(
          error instanceof Error
            ? `تعذر قراءة التحديد: ${error.message}`
            : 'تعذر قراءة التحديد.',
        );
      }
    },
    [handleMessage, onInteractionError],
  );

  useEffect(syncSelectedElement, [syncSelectedElement]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    function onWindowMessage(event: MessageEvent<unknown>): void {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        !isRecord(event.data) ||
        event.data.source !== 'mushaf-page' ||
        !isPageMessage(event.data.message)
      ) {
        return;
      }
      handleMessage(event.data.message);
    }

    window.addEventListener('message', onWindowMessage);
    return () => window.removeEventListener('message', onWindowMessage);
  }, [handleMessage]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {createElement('iframe', {
          ref: iframeRef,
          title: `صفحة ${page.pageNumber} من المصحف`,
          srcDoc: html,
          onLoad: syncOverlays,
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'transparent',
          },
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView<unknown>
        ref={webViewRef}
        accessibilityLabel={`صفحة ${page.pageNumber} من المصحف`}
        originWhitelist={['*']}
        source={source}
        onLoad={syncOverlays}
        onMessage={onNativeMessage}
        javaScriptEnabled
        scrollEnabled={false}
        style={styles.webView}
      />
    </View>
  );
});

function createMushafHtml(
  page: MushafPage,
  fontBase64: string,
  basmalaFontBase64: string | null,
  fontSize: number,
  showTajweed: boolean,
  isDark: boolean,
): string {
  const sourceLineCount = Math.max(...page.lines.map((line) => line.lineNumber), 15);
  const linesHtml = renderMushafLinesHtml(page);
  const baseFontSize = Math.min(Math.round(fontSize * 1.5), 120);

  const surahName = page.surahs && page.surahs.length > 0 ? page.surahs[0].nameArabic : '';
  const surahHeaderLabel = surahName ? `سورة ${surahName}` : '';
  const juzHeaderLabel = `الجزء ${toArabicNumberString(page.juzNumber)} · الحزب ${toArabicNumberString(page.hizbNumber)}`;
  const pageNumberString = toArabicNumberString(page.pageNumber);

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
@font-face {
  font-family: "QcfTajweedPage";
  src: url(data:font/woff2;base64,${fontBase64}) format("woff2");
  font-display: block;
}
${basmalaFontBase64 ? `@font-face {
  font-family: "QcfBasmala";
  src: url(data:font/woff2;base64,${basmalaFontBase64}) format("woff2");
  font-display: block;
}` : ''}
@font-palette-values --QcfLight {
  font-family: "QcfTajweedPage";
  base-palette: 0;
}
@font-palette-values --QcfBasmalaLight {
  font-family: "QcfBasmala";
  base-palette: 0;
}
* { box-sizing: border-box; }
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body {
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  background: ${isDark ? '#0c110f' : '#ece7dc'};
}
.page {
  --quran-font-size: ${baseFontSize}px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 5px 7px;
  container-type: size;
  border: 1px solid ${isDark ? 'rgba(158, 128, 70, 0.6)' : 'rgba(197, 163, 99, 0.62)'};
  border-radius: 16px;
  color: ${isDark ? '#e4ddcf' : '#1e3026'};
  background: ${isDark
    ? 'linear-gradient(180deg, #161d1a 0%, #131917 55%, #101614 100%)'
    : 'radial-gradient(ellipse at 50% 28%, #fffefb 0%, #fffdf7 65%, #fbf5e9 100%)'};
  box-shadow: ${isDark
    ? '0 10px 34px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.45)'
    : '0 10px 30px rgba(45, 35, 18, 0.14), 0 1px 4px rgba(45, 35, 18, 0.06)'};
  isolation: isolate;
  opacity: 0;
}
.page.is-ready {
  opacity: 1;
}
.page::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 12px;
  border: 1px solid ${isDark ? 'rgba(197, 163, 99, 0.26)' : 'rgba(197, 163, 99, 0.4)'};
  pointer-events: none;
  z-index: -1;
}
@supports (width: 1cqi) {
  .page {
    --line-row-height: calc((100cqb - 24px) / ${sourceLineCount});
    --quran-font-size: min(
      ${baseFontSize}px,
      calc(var(--line-row-height) * 1.02),
      17cqi
    );
  }
}
.frame-corner {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${isDark ? 'rgba(197, 163, 99, 0.55)' : 'rgba(178, 132, 45, 0.5)'};
  box-shadow: 0 0 0 1.5px ${isDark ? 'rgba(197, 163, 99, 0.16)' : 'rgba(178, 132, 45, 0.14)'};
  pointer-events: none;
  z-index: 2;
}
.frame-corner.top-left {
  top: 9px;
  left: 9px;
}
.frame-corner.top-right {
  top: 9px;
  right: 9px;
}
.frame-corner.bottom-left {
  bottom: 9px;
  left: 9px;
}
.frame-corner.bottom-right {
  bottom: 9px;
  right: 9px;
}
.page-header {
  display: flex;
  flex: 0 0 17px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  padding: 0 4px;
  border-bottom: 1px solid ${isDark ? 'rgba(138, 112, 61, 0.22)' : 'rgba(197, 163, 99, 0.3)'};
  margin-bottom: 1px;
}
.header-label {
  min-width: 0;
  color: ${isDark ? '#c5b690' : '#6f582e'};
  font: 600 11px "Noto Naskh Arabic", "Amiri", "Traditional Arabic", sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-ornament {
  color: ${isDark ? '#8a703d' : '#bba064'};
  font-size: 11px;
  opacity: 0.8;
}
.lines {
  display: grid;
  flex: 1 1 auto;
  grid-template-rows: repeat(${sourceLineCount}, minmax(0, 1fr));
  align-content: stretch;
  width: 100%;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}
.line {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  direction: rtl;
  font-size: var(--quran-rendered-font-size, var(--quran-font-size));
  text-align: center;
  line-height: 1.12;
  min-width: 0;
  overflow: hidden;
  unicode-bidi: normal;
}
.line-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: none;
  white-space: nowrap;
  font-size: inherit;
  line-height: inherit;
}
/* A Mushaf line whose glyphs already cover the text column is spread over the
   full column, exactly like the printed page, so every full line ends on the
   same two margins and the page reads as one even block. Lines that are short
   in the print (a surah ending, a lone word) stay centred and are never
   stretched. */
.line.is-justified .line-inner {
  width: 100%;
  justify-content: space-between;
}
.surah-title, .opening-basmala {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1;
  min-width: 0;
  text-align: center;
}
.surah-title {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 2px 0;
  min-height: 0;
  color: ${isDark ? '#faeed7' : '#3c2c12'};
  font-family: "Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif;
}
.surah-title-rule {
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, ${isDark ? 'rgba(158, 128, 70, 0.55)' : 'rgba(197, 163, 99, 0.65)'} 35%, ${isDark ? 'rgba(158, 128, 70, 0.55)' : 'rgba(197, 163, 99, 0.65)'} 65%, transparent);
  pointer-events: none;
}
.surah-title-box {
  flex: 0 0 auto;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: min(230px, 76%);
  padding: 3px 20px 4px;
  border-radius: 999px;
  border: 1.5px solid ${isDark ? '#a8874a' : '#c8a765'};
  background: ${isDark
    ? 'linear-gradient(180deg, #2a2216 0%, #3d3120 48%, #2a2216 100%)'
    : 'linear-gradient(180deg, #fefcf8 0%, #f9ecd2 47%, #f0dcb4 53%, #f9ecd2 100%)'};
  box-shadow: ${isDark
    ? 'inset 0 1px 0 rgba(255, 235, 180, 0.14), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.45)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(178, 132, 45, 0.18), 0 2px 8px rgba(120, 95, 45, 0.16)'};
  white-space: nowrap;
}
.surah-title-box::before {
  content: '';
  position: absolute;
  inset: 2.5px;
  border-radius: 999px;
  border: 1px solid ${isDark ? 'rgba(197, 163, 99, 0.32)' : 'rgba(178, 132, 45, 0.3)'};
  pointer-events: none;
}
.surah-ornament {
  font-size: min(13px, 3.9cqi);
  color: ${isDark ? '#d6b46a' : '#b38d45'};
  line-height: 1;
  text-shadow: 0 1px 0 ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)'};
}
.surah-title-text {
  position: relative;
  font-size: min(16px, 5cqi);
  font-weight: 700;
  letter-spacing: 0.6px;
  line-height: 1.25;
  text-shadow: 0 1px 0 ${isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.85)'};
}
.opening-basmala {
  color: ${isDark ? '#e4ddcf' : '#263a30'};
  font-family: "QcfTajweedPage";
  font-palette: --QcfLight;
  font-size: var(--quran-rendered-font-size, var(--quran-font-size));
  min-height: 0;
  white-space: nowrap;
  overflow: hidden;
  ${showTajweed ? '' : 'filter: grayscale(1);'}
}
.word, .ayah-marker, .basmala-word {
  display: inline-block;
  flex: 0 0 auto;
  border: 0;
  padding: 0;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
  vertical-align: middle;
}
.word {
  font-family: "QcfTajweedPage";
  font-palette: --QcfLight;
  font-size: var(--quran-rendered-font-size, var(--quran-font-size));
  line-height: 1.15;
  direction: rtl;
  ${showTajweed ? '' : 'filter: grayscale(1);'}
}
.ayah-marker {
  min-width: 1em;
  min-height: 1em;
  color: ${isDark ? '#c5b690' : '#514327'};
  font-family: "QcfTajweedPage";
  font-palette: --QcfLight;
  font-size: 0.88em;
  line-height: inherit;
  vertical-align: baseline;
}
.basmala-word {
  font-family: "QcfBasmala";
  font-palette: --QcfBasmalaLight;
  font-size: inherit;
  line-height: 1.2;
}
.selected {
  border-radius: 4px;
  background: rgba(86, 125, 78, 0.25);
  box-shadow: 0 0 0 1.5px rgba(75, 110, 67, 0.65);
  outline: none;
}
.hl-bg {
  border-radius: 4px;
  background-color: var(--hl-bg);
}
.hl-marker {
  position: relative;
  isolation: isolate;
}
.hl-marker::before {
  content: '';
  position: absolute;
  inset: -1px -2px;
  border-radius: 3px;
  background: var(--hl-marker-color);
  z-index: -1;
  opacity: 0.92;
  filter: blur(0.5px);
}
.page-footer {
  display: flex;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding-top: 1px;
  border-top: 1px solid ${isDark ? 'rgba(138, 112, 61, 0.22)' : 'rgba(197, 163, 99, 0.3)'};
  margin-top: 1px;
}
.page-number-ornament {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.page-num-bracket {
  color: ${isDark ? '#8a703d' : '#c5a363'};
  font-size: 10px;
}
.page-number {
  color: ${isDark ? '#c5b690' : '#6f582e'};
  font: 600 12px "Noto Naskh Arabic", "Amiri", "Traditional Arabic", sans-serif;
  min-width: 20px;
  text-align: center;
}
</style>
</head>
<body>
<main class="page" aria-label="صفحة المصحف">
  <div class="frame-corner top-left" aria-hidden="true"></div>
  <div class="frame-corner top-right" aria-hidden="true"></div>
  <div class="frame-corner bottom-left" aria-hidden="true"></div>
  <div class="frame-corner bottom-right" aria-hidden="true"></div>
  <header class="page-header">
    <span class="header-label" id="header-surah-label">${surahHeaderLabel}</span>
    <span class="header-ornament">۞</span>
    <span class="header-label" id="header-juz-label">${juzHeaderLabel}</span>
  </header>
  <section class="lines" id="mushaf-lines">${linesHtml}</section>
  <footer class="page-footer">
    <div class="page-number-ornament">
      <span class="page-num-bracket">۞</span>
      <span class="page-number" id="page-number">${pageNumberString}</span>
      <span class="page-num-bracket">۞</span>
    </div>
  </footer>
</main>
<script>
const linesElement = document.getElementById("mushaf-lines");
const pageElement = document.querySelector(".page");

function selectMushafElement(id) {
  document.querySelectorAll(".selected").forEach((element) => element.classList.remove("selected"));
  if (!id) return;
  const element = document.getElementById(id);
  if (element) element.classList.add("selected");
}
window.selectMushafElement = selectMushafElement;

/**
 * Applies saved highlights without touching the document markup.
 *
 * Highlights live outside the generated HTML so that a pre-rendered neighbour
 * page keeps the exact same document when it becomes the current page. Baking
 * them into the HTML forced a WebView reload on every transition and on every
 * highlight change, which is what caused the visible flash.
 */
function applyMushafHighlights(entries) {
  document.querySelectorAll(".hl-bg, .hl-marker").forEach((element) => {
    element.classList.remove("hl-bg", "hl-marker");
    element.style.removeProperty("--hl-bg");
    element.style.removeProperty("--hl-marker-color");
  });
  if (!entries || typeof entries !== "object") return;
  for (const id of Object.keys(entries)) {
    const element = document.getElementById(id);
    if (!element) continue;
    const entry = entries[id];
    if (!entry) continue;
    if (entry.bg) {
      element.classList.add("hl-bg");
      element.style.setProperty("--hl-bg", entry.bg);
    }
    if (entry.marker) {
      element.classList.add("hl-marker");
      element.style.setProperty("--hl-marker-color", entry.marker);
    }
  }
}
window.applyMushafHighlights = applyMushafHighlights;

function postPageMessage(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    window.parent.postMessage({ source: "mushaf-page", message: message }, "*");
  }
}

/**
 * Share of the text column a line has to cover before it is spread over the
 * full column. Lines below it are genuinely short in the print.
 */
const LINE_JUSTIFY_MIN_RATIO = 0.6;

/**
 * Fits the page text to the width it was laid out for.
 *
 * The per-page QCF font is calibrated so that a Mushaf line fills the text
 * column at one specific size, so the page is scaled by the ratio between the
 * widest line and its column instead of only being shrunk when it overflows.
 * Only the text rows are measured: the surah title and the basmala are their
 * own rows with their own fonts, and letting one of them drive the ratio would
 * shrink every text line below the column for the whole page.
 */
function fitMushafText() {
  if (!linesElement || !pageElement) return;
  linesElement.style.removeProperty("--quran-rendered-font-size");
  const rows = [...linesElement.querySelectorAll(".line")];
  for (const row of rows) row.classList.remove("is-justified");
  const inners = rows.map((row) => row.querySelector(".line-inner")).filter(Boolean);
  if (inners.length === 0) return;

  const firstRow = inners[0].parentElement;
  if (!firstRow) return;
  const baseFontSize = Number.parseFloat(getComputedStyle(inners[0]).fontSize);
  if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) return;

  let widest = 0;
  let available = 0;
  for (const inner of inners) {
    const row = inner.parentElement;
    if (!row) continue;
    const rowWidth = row.clientWidth;
    if (rowWidth <= 0) continue;
    if (inner.scrollWidth > widest) {
      widest = inner.scrollWidth;
      available = rowWidth;
    }
  }
  if (widest <= 0 || available <= 0) return;

  const pageWidth = pageElement.clientWidth;
  const target = Math.min(
    baseFontSize * ((available - 1) / widest),
    firstRow.clientHeight * 1.02,
    pageWidth > 0 ? pageWidth * 0.17 : Number.POSITIVE_INFINITY,
  );
  if (Number.isFinite(target) && target > 0 && Math.abs(target - baseFontSize) >= baseFontSize * 0.01) {
    linesElement.style.setProperty(
      "--quran-rendered-font-size",
      Math.max(12, target) + "px",
    );
  }

  // Runs last: the line widths are read back at the size the page finally uses.
  justifyMushafLines(rows);
  fitOpeningBasmala();
}

/**
 * Spreads every line that already covers most of the column over the full
 * column width.
 *
 * The glyphs of a printed Mushaf line are calibrated to end exactly on the
 * column edge, so a line is only justified when its own width is close to the
 * column: the extra space stays inside the word gaps and no line is stretched
 * into a shape the print never had.
 */
function justifyMushafLines(rows) {
  for (const row of rows) {
    const inner = row.querySelector(".line-inner");
    if (!inner) continue;
    const columnWidth = row.clientWidth;
    if (columnWidth <= 0) continue;
    if (inner.scrollWidth >= columnWidth * LINE_JUSTIFY_MIN_RATIO) {
      row.classList.add("is-justified");
    }
  }
}

/**
 * Keeps the opening basmala inside the column on its own.
 *
 * It is drawn with a different font than the page text and is not a Mushaf
 * line, so it is fitted separately instead of being allowed to shrink the whole
 * page.
 */
function fitOpeningBasmala() {
  const basmala = linesElement.querySelector(".opening-basmala");
  if (!basmala) return;
  basmala.style.removeProperty("font-size");
  const inner = basmala.querySelector(".line-inner");
  if (!inner) return;
  const columnWidth = basmala.clientWidth;
  const naturalWidth = inner.scrollWidth;
  const size = Number.parseFloat(getComputedStyle(basmala).fontSize);
  if (columnWidth <= 0 || naturalWidth <= columnWidth) return;
  if (!Number.isFinite(size) || size <= 0) return;
  basmala.style.setProperty(
    "font-size",
    Math.max(12, size * ((columnWidth - 1) / naturalWidth)) + "px",
  );
}

let pageReadySignalled = false;

/** Reveals the page and tells the host that no further layout work is pending. */
function signalPageReady() {
  if (pageReadySignalled) return;
  pageReadySignalled = true;
  if (pageElement) pageElement.classList.add("is-ready");
  postPageMessage({ type: "ready" });
}

// The fit runs once, while the page is still hidden, so the first visible paint
// already carries the final metrics. Re-fitting after paint is what produced
// the visible font-size jump during page turns.
function preparePage() {
  fitMushafText();
  signalPageReady();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(preparePage);
  // Font loading can stall; the page must never stay hidden.
  setTimeout(() => {
    if (!pageReadySignalled) preparePage();
  }, 1200);
} else {
  preparePage();
}

// A viewport change (rotation, split screen) invalidates the fit. The page is
// hidden for the recalculation so the new metrics are never painted as a jump.
let refitScheduled = false;
window.addEventListener("resize", () => {
  if (refitScheduled) return;
  refitScheduled = true;
  requestAnimationFrame(() => {
    refitScheduled = false;
    if (pageElement) pageElement.classList.remove("is-ready");
    fitMushafText();
    if (pageElement) pageElement.classList.add("is-ready");
  });
});

let pointerStart = null;
let isPanning = false;
let lastPostedDx = 0;

// Every message crosses the native bridge, so sub-pixel pointer noise is
// dropped: only a meaningful horizontal change is relayed to the host.
const PAN_UPDATE_THRESHOLD_PX = 2;

pageElement.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button[data-kind]")) {
    pointerStart = null;
    isPanning = false;
    return;
  }
  pageElement.setPointerCapture(event.pointerId);
  pointerStart = { x: event.clientX, y: event.clientY, time: Date.now() };
  isPanning = false;
  lastPostedDx = 0;
});

pageElement.addEventListener("pointermove", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  if (!isPanning && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.1) {
    isPanning = true;
    lastPostedDx = dx;
    postPageMessage({ type: "pan-start", x: event.clientX, y: event.clientY });
    postPageMessage({ type: "pan-update", dx: dx, dy: dy });
    return;
  }
  if (isPanning && Math.abs(dx - lastPostedDx) >= PAN_UPDATE_THRESHOLD_PX) {
    lastPostedDx = dx;
    postPageMessage({ type: "pan-update", dx: dx, dy: dy });
  }
});

pageElement.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  const dt = Math.max(1, Date.now() - pointerStart.time);
  const vx = (dx / dt) * 1000;
  const wasPanning = isPanning;
  pointerStart = null;
  isPanning = false;
  if (wasPanning) {
    postPageMessage({ type: "pan-end", dx: dx, vx: vx });
  }
});

pageElement.addEventListener("pointercancel", () => {
  if (isPanning) {
    postPageMessage({ type: "pan-cancel" });
  }
  pointerStart = null;
  isPanning = false;
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-kind]");
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const message = {
    type: button.dataset.kind,
    surahNumber: Number(button.dataset.surah),
    ayahNumber: Number(button.dataset.ayah),
    wordId: button.dataset.wordId,
    rect: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  };
  selectMushafElement(button.id);
  postPageMessage(message);
});

window.addEventListener("message", (event) => {
  if (event.data && event.data.source === "mushaf-page-parent") {
    if (event.data.selectedElementId !== undefined) {
      selectMushafElement(event.data.selectedElementId);
    }
    if (event.data.highlights !== undefined) {
      applyMushafHighlights(event.data.highlights);
    }
  }
});
</script>
</body>
</html>`;
}

function isPageMessage(value: unknown): value is PageMessage {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }
  if (value.type === 'turn') {
    return value.direction === 'next' || value.direction === 'previous';
  }
  if (value.type === 'pan-start') {
    return typeof value.x === 'number' && typeof value.y === 'number';
  }
  if (value.type === 'pan-update') {
    return typeof value.dx === 'number' && typeof value.dy === 'number';
  }
  if (value.type === 'pan-end') {
    return typeof value.dx === 'number' && typeof value.vx === 'number';
  }
  if (value.type === 'pan-cancel') {
    return true;
  }
  if (value.type === 'ready') {
    return true;
  }
  if (
    (value.type !== 'word' && value.type !== 'ayah') ||
    typeof value.surahNumber !== 'number' ||
    !Number.isInteger(value.surahNumber) ||
    typeof value.ayahNumber !== 'number' ||
    !Number.isInteger(value.ayahNumber) ||
    !isElementRect(value.rect)
  ) {
    return false;
  }
  return (
    value.surahNumber > 0 &&
    value.ayahNumber > 0 &&
    (value.type === 'ayah' ||
      (typeof value.wordId === 'string' &&
        value.wordId.length > 0))
  );
}

function isElementRect(value: unknown): value is ElementRect {
  return (
    isRecord(value) &&
    typeof value.x === 'number' &&
    Number.isFinite(value.x) &&
    typeof value.y === 'number' &&
    Number.isFinite(value.y) &&
    typeof value.width === 'number' &&
    Number.isFinite(value.width) &&
    typeof value.height === 'number' &&
    Number.isFinite(value.height)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    alignSelf: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
