import { createElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View, type HostInstance } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Highlight } from '@/features/annotations/types';
import type { MushafPage } from '@/features/quran/types';
export type SelectionAnchor = { x: number; y: number; width: number; height: number };
export type PageTurnDirection = 'next' | 'previous';

type Props = {
  page: MushafPage;
  fontBase64: string;
  basmalaFontBase64: string | null;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  selectedElementId: string | null;
  transitionDirection: PageTurnDirection | null;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    position: number,
    anchor: SelectionAnchor,
  ) => void;
  onAyahPress: (surahNumber: number, ayahNumber: number, anchor: SelectionAnchor) => void;
  onPageTurn: (direction: PageTurnDirection) => void;
  onInteractionError: (message: string) => void;
};

type PageMessage =
  | {
      type: 'word';
      surahNumber: number;
      ayahNumber: number;
      position: number;
      anchor: SelectionAnchor;
    }
  | {
      type: 'ayah';
      surahNumber: number;
      ayahNumber: number;
      anchor: SelectionAnchor;
    }
  | { type: 'turn'; direction: PageTurnDirection };

export function MushafPageViewer({
  page,
  fontBase64,
  basmalaFontBase64,
  fontSize,
  showTajweed,
  isDark,
  highlights,
  selectedElementId,
  transitionDirection,
  onWordPress,
  onAyahPress,
  onPageTurn,
  onInteractionError,
}: Props) {
  const webViewRef = useRef<WebView<unknown>>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HostInstance | null>(null);
  const html = useMemo(
    () => createMushafHtml(
      page,
      fontBase64,
      basmalaFontBase64,
      fontSize,
      showTajweed,
      isDark,
      highlights,
      transitionDirection,
    ),
    [basmalaFontBase64, fontBase64, fontSize, highlights, isDark, page, showTajweed, transitionDirection],
  );

  const handleMessage = useCallback((
    message: PageMessage,
    origin: { x: number; y: number },
  ): void => {
    if (message.type === 'turn') {
      onPageTurn(message.direction);
      return;
    }
    const anchor = {
      ...message.anchor,
      x: origin.x + message.anchor.x,
      y: origin.y + message.anchor.y,
    };
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
          ayah.words.some(
            (word) => word.position === message.position,
          ),
      );
      if (!wordExists || message.position === undefined) {
        onInteractionError('تعذر مطابقة الكلمة مع بيانات صفحة المصحف.');
        return;
      }
      onWordPress(message.surahNumber, message.ayahNumber, message.position, anchor);
      return;
    }

    onAyahPress(message.surahNumber, message.ayahNumber, anchor);
  }, [onAyahPress, onInteractionError, onPageTurn, onWordPress, page.ayahs]);

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

  const onNativeMessage = useCallback((event: WebViewMessageEvent): void => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      if (!isPageMessage(message)) {
        onInteractionError('وصل تحديد غير صالح من صفحة المصحف.');
        return;
      }
      if (message.type === 'turn') {
        handleMessage(message, { x: 0, y: 0 });
      } else {
        containerRef.current?.measureInWindow((x, y) => handleMessage(message, { x, y }));
      }
    } catch (error) {
      onInteractionError(
        error instanceof Error ? `تعذر قراءة التحديد: ${error.message}` : 'تعذر قراءة التحديد.',
      );
    }
  }, [handleMessage, onInteractionError]);

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
      const bounds = iframeRef.current?.getBoundingClientRect();
      handleMessage(event.data.message, { x: bounds?.left ?? 0, y: bounds?.top ?? 0 });
    }

    window.addEventListener('message', onWindowMessage);
    return () => window.removeEventListener('message', onWindowMessage);
  }, [handleMessage]);

  if (Platform.OS === 'web') {
    return (
      <View ref={containerRef} style={styles.container}>
        {createElement('iframe', {
          ref: iframeRef,
          title: `صفحة ${page.pageNumber} من المصحف`,
          srcDoc: html,
          onLoad: syncSelectedElement,
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
    <View ref={containerRef} style={styles.container}>
      <WebView<unknown>
        ref={webViewRef}
        accessibilityLabel={`صفحة ${page.pageNumber} من المصحف`}
        originWhitelist={['*']}
        source={{ html }}
        onLoad={syncSelectedElement}
        onMessage={onNativeMessage}
        javaScriptEnabled
        scrollEnabled={false}
        style={styles.webView}
      />
    </View>
  );
}

function createMushafHtml(
  page: MushafPage,
  fontBase64: string,
  basmalaFontBase64: string | null,
  fontSize: number,
  showTajweed: boolean,
  isDark: boolean,
  highlights: Highlight[],
  transitionDirection: PageTurnDirection | null,
): string {
  const pageJson = JSON.stringify(page).replace(/</g, '\\u003c');
  const sourceLineCount = Math.max(...page.lines.map((line) => line.lineNumber));
  const highlightsJson = JSON.stringify(buildHighlightStyles(page, highlights)).replace(
    /</g,
    '\\u003c',
  );
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
  padding: 8px 10px 10px;
  background: ${isDark ? '#0c110f' : '#ece7dc'};
}
.page {
  --quran-font-size: ${fontSize}px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 8px 12px 6px;
  container-type: size;
  border: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
  border-radius: 6px;
  outline: 1px solid ${isDark ? 'rgba(138, 112, 61, 0.45)' : 'rgba(197, 163, 99, 0.5)'};
  outline-offset: -5px;
  color: ${isDark ? '#e4ddcf' : '#1e3026'};
  background: ${isDark
    ? '#131917'
    : 'radial-gradient(ellipse at 50% 30%, #fffefb 0%, #fffdf7 70%, #fbf6ec 100%)'};
  box-shadow: ${isDark
    ? '0 6px 24px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.4)'
    : '0 6px 22px rgba(45, 35, 18, 0.12), 0 1px 4px rgba(45, 35, 18, 0.05)'};
  ${transitionDirection ? `animation: page-${transitionDirection} 220ms ease-out both;` : ''}
}
@supports (width: 1cqi) {
  .page {
    --quran-font-size: min(
      ${fontSize}px,
      7.4cqi,
      calc((100cqb - 72px) / ${sourceLineCount} / 1.42)
    );
  }
}
@keyframes page-next {
  from { opacity: 0.65; transform: translateX(-3%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes page-previous {
  from { opacity: 0.65; transform: translateX(3%); }
  to { opacity: 1; transform: translateX(0); }
}
.frame-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  pointer-events: none;
  z-index: 2;
}
.frame-corner.top-left {
  top: 7px;
  left: 7px;
  border-top: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
  border-left: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
}
.frame-corner.top-right {
  top: 7px;
  right: 7px;
  border-top: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
  border-right: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
}
.frame-corner.bottom-left {
  bottom: 7px;
  left: 7px;
  border-bottom: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
  border-left: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
}
.frame-corner.bottom-right {
  bottom: 7px;
  right: 7px;
  border-bottom: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
  border-right: 1.5px solid ${isDark ? '#8a703d' : '#c5a363'};
}
.page-header {
  display: flex;
  flex: 0 0 26px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  padding: 0 8px 2px;
  border-bottom: 1px solid ${isDark ? 'rgba(138, 112, 61, 0.22)' : 'rgba(197, 163, 99, 0.3)'};
  margin-bottom: 2px;
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
  padding: 2px 4px;
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
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  unicode-bidi: normal;
}
.line-inner {
  display: inline-block;
  max-width: none;
  white-space: nowrap;
  font-size: inherit;
  line-height: inherit;
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
  margin: 1px 0;
  min-height: 0;
  color: ${isDark ? '#faeed7' : '#3c2c12'};
  font-family: "Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif;
}
.surah-title-rule {
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, ${isDark ? 'rgba(158, 128, 70, 0.6)' : 'rgba(197, 163, 99, 0.7)'} 30%, ${isDark ? 'rgba(158, 128, 70, 0.6)' : 'rgba(197, 163, 99, 0.7)'} 70%, transparent);
  pointer-events: none;
}
.surah-title-box {
  flex: 0 0 auto;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: min(210px, 72%);
  padding: 4px 18px 5px;
  border-radius: 20px;
  border: 1.5px solid ${isDark ? '#9e8046' : '#c5a363'};
  outline: 1px solid ${isDark ? 'rgba(158, 128, 70, 0.4)' : 'rgba(197, 163, 99, 0.45)'};
  outline-offset: -3.5px;
  background: ${isDark
    ? 'linear-gradient(180deg, #241d13 0%, #382d1c 50%, #241d13 100%)'
    : 'linear-gradient(180deg, #fdfbf7 0%, #faeed7 48%, #f2dfba 52%, #faeed7 100%)'};
  box-shadow: ${isDark
    ? 'inset 0 1px 0 rgba(255, 235, 180, 0.1), 0 2px 6px rgba(0, 0, 0, 0.4)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 6px rgba(120, 95, 45, 0.12)'};
  white-space: nowrap;
}
.surah-ornament {
  font-size: min(13px, 3.8cqi);
  color: ${isDark ? '#c5a363' : '#b38d45'};
  line-height: 1;
}
.surah-title-text {
  font-size: min(17px, 5.2cqi);
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.25;
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
  line-height: 1.25;
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
  line-height: 1.25;
}
.selected {
  border-radius: 5px;
  background: rgba(86, 125, 78, 0.24);
  box-shadow: 0 0 0 1px rgba(75, 110, 67, 0.55);
}
.page-footer {
  display: flex;
  flex: 0 0 26px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding-top: 2px;
  border-top: 1px solid ${isDark ? 'rgba(138, 112, 61, 0.22)' : 'rgba(197, 163, 99, 0.3)'};
  margin-top: 2px;
}
.page-number-ornament {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.page-num-bracket {
  color: ${isDark ? '#8a703d' : '#b8934d'};
  font-size: 11px;
  opacity: 0.85;
}
.page-number {
  min-width: 28px;
  color: ${isDark ? '#e4dac0' : '#382b13'};
  font-family: "Noto Naskh Arabic", "Amiri", serif;
  font-weight: 700;
  font-size: 13.5px;
  text-align: center;
  letter-spacing: 0.5px;
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
    <span class="header-label" id="header-surah-label"></span>
    <span class="header-ornament">۞</span>
    <span class="header-label" id="header-juz-label"></span>
  </header>
  <section class="lines" id="mushaf-lines"></section>
  <footer class="page-footer">
    <div class="page-number-ornament">
      <span class="page-num-bracket">۞</span>
      <span class="page-number" id="page-number"></span>
      <span class="page-num-bracket">۞</span>
    </div>
  </footer>
</main>
<script>
const page = ${pageJson};
const highlightStyles = ${highlightsJson};
const linesElement = document.getElementById("mushaf-lines");
const surahName = page.surahs && page.surahs.length > 0 ? page.surahs[0].nameArabic : "";
document.getElementById("header-surah-label").textContent = surahName ? "سورة " + surahName : "";
document.getElementById("header-juz-label").textContent =
  "الجزء " + toArabicNumber(page.juzNumber) + " · الحزب " + toArabicNumber(page.hizbNumber);
document.getElementById("page-number").textContent = toArabicNumber(page.pageNumber);

for (const line of page.lines) {
  const lineElement = document.createElement("div");
  lineElement.className = "line";
  lineElement.style.gridRow = String(line.lineNumber);
  lineElement.setAttribute("aria-label", "السطر " + line.lineNumber);
  const inner = document.createElement("span");
  inner.className = "line-inner";
  for (const word of line.words) {
    if (word.charType === "word") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "word";
      button.dataset.surah = String(word.surahNumber);
      button.dataset.ayah = String(word.ayahNumber);
      button.id = "word-" + word.surahNumber + "-" + word.ayahNumber + "-" + word.position;
      button.dataset.kind = "word";
      button.dataset.position = String(word.position);
      button.dataset.wordId = word.id;
      button.textContent = word.codeV2;
      button.setAttribute("aria-label", word.textUthmani + "، كلمة " + word.position + " من الآية " + word.ayahNumber);
      button.style.backgroundColor = highlightStyles[word.id] || "";
      inner.appendChild(button);
    } else {
      inner.appendChild(VerseMarker(word));
    }
    if (word !== line.words[line.words.length - 1]) {
      inner.appendChild(document.createTextNode(" "));
    }
  }
  lineElement.appendChild(inner);
  linesElement.appendChild(lineElement);
}

function VerseMarker(word) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = "ayah-marker";
  marker.id = "ayah-" + word.surahNumber + "-" + word.ayahNumber;
  marker.dataset.surah = String(word.surahNumber);
  marker.dataset.ayah = String(word.ayahNumber);
  marker.dataset.kind = "ayah";
  marker.textContent = word.codeV2;
  marker.setAttribute("aria-label", "إجراءات الآية " + word.ayahNumber);
  marker.style.backgroundColor = highlightStyles[marker.id] || "";
  return marker;
}

const sourceLineNumbers = new Set(page.lines.map((line) => line.lineNumber));
for (const ayah of page.ayahs) {
  if (ayah.ayahNumber !== 1) continue;
  const firstWord = page.lines
    .flatMap((line) => line.words)
    .find((word) => word.surahNumber === ayah.surahNumber && word.ayahNumber === 1 && word.charType === "word");
  if (!firstWord) continue;
  const surah = page.surahs.find((item) => item.surahNumber === ayah.surahNumber);
  const titleRow = firstWord.surahNumber === 1 || firstWord.surahNumber === 9
    ? firstWord.lineNumber - 1
    : firstWord.lineNumber - 2;
  const basmalaRow = firstWord.lineNumber - 1;
  if (titleRow >= 1 && !sourceLineNumbers.has(titleRow)) {
    const title = document.createElement("div");
    title.className = "surah-title";
    title.style.gridRow = String(titleRow);
    title.setAttribute("aria-label", "سورة " + (surah ? surah.nameArabic : ""));
    const startRule = document.createElement("span");
    startRule.className = "surah-title-rule";
    startRule.setAttribute("aria-hidden", "true");
    const box = document.createElement("span");
    box.className = "surah-title-box";
    const startOrn = document.createElement("span");
    startOrn.className = "surah-ornament start";
    startOrn.textContent = "۞";
    startOrn.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "surah-title-text";
    text.textContent = "سورة " + (surah ? surah.nameArabic : "");
    const endOrn = document.createElement("span");
    endOrn.className = "surah-ornament end";
    endOrn.textContent = "۞";
    endOrn.setAttribute("aria-hidden", "true");
    box.append(startOrn, text, endOrn);
    const endRule = document.createElement("span");
    endRule.className = "surah-title-rule";
    endRule.setAttribute("aria-hidden", "true");
    title.append(startRule, box, endRule);
    linesElement.appendChild(title);
  }
  if (
    firstWord.surahNumber !== 9 &&
    firstWord.surahNumber !== 1 &&
    basmalaRow >= 1 &&
    !sourceLineNumbers.has(basmalaRow) &&
    Array.isArray(page.basmalaWords) &&
    page.basmalaWords.length > 0
  ) {
    const basmala = document.createElement("div");
    basmala.className = "opening-basmala";
    basmala.style.gridRow = String(basmalaRow);
    const basmalaInner = document.createElement("span");
    basmalaInner.className = "line-inner";
    for (const [index, word] of page.basmalaWords.entries()) {
      const glyph = document.createElement("span");
      glyph.className = "basmala-word";
      glyph.textContent = word.codeV2;
      glyph.setAttribute("aria-label", word.textUthmani);
      basmalaInner.appendChild(glyph);
      if (index < page.basmalaWords.length - 1) {
        basmalaInner.appendChild(document.createTextNode(" "));
      }
    }
    basmala.appendChild(basmalaInner);
    linesElement.appendChild(basmala);
  }
}

function fitMushafText() {
  linesElement.style.removeProperty("--quran-rendered-font-size");
  const inners = [...linesElement.querySelectorAll(".line-inner")];
  if (inners.length === 0) return;

  const baseFontSize = Number.parseFloat(getComputedStyle(inners[0]).fontSize);
  if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) return;

  let scale = 1;
  for (const inner of inners) {
    const available = inner.parentElement ? inner.parentElement.clientWidth : inner.clientWidth;
    if (inner.scrollWidth > available && inner.scrollWidth > 0 && available > 0) {
      scale = Math.min(scale, (available - 2) / inner.scrollWidth);
    }
  }
  if (scale < 0.995) {
    linesElement.style.setProperty(
      "--quran-rendered-font-size",
      Math.max(10, baseFontSize * scale * 0.985) + "px",
    );
  }
}

if (document.fonts) {
  document.fonts.ready.then(() => {
    fitMushafText();
    window.addEventListener("resize", fitMushafText);
  });
} else {
  fitMushafText();
  window.addEventListener("resize", fitMushafText);
}

function selectMushafElement(id) {
  document.querySelectorAll(".selected").forEach((element) => element.classList.remove("selected"));
  if (!id) return;
  const element = document.getElementById(id);
  if (element) element.classList.add("selected");
}
function toArabicNumber(value) {
  return String(value).replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}
window.selectMushafElement = selectMushafElement;

function postPageTurn(direction) {
  const message = { type: "turn", direction };
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    window.parent.postMessage({ source: "mushaf-page", message }, "*");
  }
}

let pointerStart = null;
const pageElement = document.querySelector(".page");
const turnThreshold = 55;
const edgeZone = 26;
pageElement.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button[data-kind]")) {
    pointerStart = null;
    return;
  }
  pointerStart = { x: event.clientX, y: event.clientY };
});
pageElement.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  const start = pointerStart;
  pointerStart = null;
  if (Math.abs(deltaX) >= turnThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
    postPageTurn(deltaX < 0 ? "next" : "previous");
    return;
  }
  if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) return;
  const bounds = pageElement.getBoundingClientRect();
  if (start.x - bounds.left <= edgeZone) {
    postPageTurn("next");
  } else if (bounds.right - start.x <= edgeZone) {
    postPageTurn("previous");
  }
});
pageElement.addEventListener("pointercancel", () => { pointerStart = null; });

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-kind]");
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const message = {
    type: button.dataset.kind,
    surahNumber: Number(button.dataset.surah),
    ayahNumber: Number(button.dataset.ayah),
    position: Number(button.dataset.position),
    anchor: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  };
  selectMushafElement(button.id);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    window.parent.postMessage({ source: "mushaf-page", message }, "*");
  }
});

window.addEventListener("message", (event) => {
  if (event.data && event.data.source === "mushaf-page-parent") {
    selectMushafElement(event.data.selectedElementId);
  }
});
</script>
</body>
</html>`;
}

function isPageMessage(value: unknown): value is PageMessage {
  if (
    !isRecord(value) ||
    typeof value.type !== 'string'
  ) {
    return false;
  }
  if (value.type === 'turn') {
    return value.direction === 'next' || value.direction === 'previous';
  }
  if (
    (value.type !== 'word' && value.type !== 'ayah') ||
    typeof value.surahNumber !== 'number' ||
    !Number.isInteger(value.surahNumber) ||
    typeof value.ayahNumber !== 'number' ||
    !Number.isInteger(value.ayahNumber) ||
    !isRecord(value.anchor) ||
    typeof value.anchor.x !== 'number' ||
    !Number.isFinite(value.anchor.x) ||
    typeof value.anchor.y !== 'number' ||
    !Number.isFinite(value.anchor.y) ||
    typeof value.anchor.width !== 'number' ||
    !Number.isFinite(value.anchor.width) ||
    typeof value.anchor.height !== 'number' ||
    !Number.isFinite(value.anchor.height)
  ) {
    return false;
  }
  return value.surahNumber > 0 &&
    value.ayahNumber > 0 &&
    value.anchor.width >= 0 &&
    value.anchor.height >= 0 &&
    (value.type === 'ayah' ||
      typeof value.position === 'number' &&
      Number.isInteger(value.position) &&
      value.position > 0);
}

function buildHighlightStyles(page: MushafPage, highlights: Highlight[]): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const ayah of page.ayahs) {
    const ayahHighlight = highlights.find((highlight) =>
      highlight.target.type === 'ayah' &&
      highlight.target.surahNumber === ayah.surahNumber &&
      highlight.target.ayahNumber === ayah.ayahNumber,
    );
    if (ayahHighlight) {
      styles[`ayah-${ayah.surahNumber}-${ayah.ayahNumber}`] =
        toRgba(ayahHighlight.color, ayahHighlight.opacity);
    }

    for (const word of ayah.words) {
      const wordIndex = ayah.words.findIndex((item) => item.id === word.id);
      const highlight = highlights.find((item) => {
        const target = item.target;
        if (
          target.surahNumber !== ayah.surahNumber ||
          target.ayahNumber !== ayah.ayahNumber
        ) {
          return false;
        }
        if (target.type === 'ayah') {
          return true;
        }
        if (target.type === 'word') {
          return target.wordId === word.id;
        }
        const start = ayah.words.findIndex((item) => item.id === target.startWordId);
        const end = ayah.words.findIndex((item) => item.id === target.endWordId);
        return start >= 0 && end >= start && wordIndex >= start && wordIndex <= end;
      });
      if (highlight) {
        styles[word.id] = toRgba(highlight.color, highlight.opacity);
      }
    }
  }
  return styles;
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
