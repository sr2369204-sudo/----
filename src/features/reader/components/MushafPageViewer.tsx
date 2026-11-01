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
  align-items: center;
  justify-content: center;
  padding: 0;
  background: ${isDark ? '#111a16' : '#eee9dc'};
}
.page {
  --quran-font-size: min(
    ${fontSize}px,
    7cqi,
    calc((100vh - 90px) / ${sourceLineCount * 1.5})
  );
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, calc(100vh * 0.696));
  max-height: 100%;
  aspect-ratio: 0.696;
  margin: auto;
  padding: 10px 12px;
  container-type: inline-size;
  border: 3px double #b89758;
  outline: 1px solid #e8d8ae;
  outline-offset: -7px;
  color: #263a30;
  background:
    radial-gradient(ellipse at 10% 12%, rgba(216, 198, 155, 0.12), transparent 38%),
    radial-gradient(ellipse at 92% 85%, rgba(216, 198, 155, 0.1), transparent 42%),
    #fffaf0;
  box-shadow: 0 3px 14px rgba(37, 31, 20, 0.18);
  ${transitionDirection ? `animation: page-${transitionDirection} 220ms ease-out both;` : ''}
}
@keyframes page-next {
  from { opacity: 0.65; transform: translateX(-3%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes page-previous {
  from { opacity: 0.65; transform: translateX(3%); }
  to { opacity: 1; transform: translateX(0); }
}
.page:before {
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(88, 112, 78, 0.52);
  content: "";
  pointer-events: none;
}
.frame-ornament {
  position: absolute;
  inset: 8px;
  z-index: 0;
  pointer-events: none;
}
.frame-ornament:before {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(176, 142, 76, 0.7);
  content: "";
}
.frame-ornament:after {
  position: absolute;
  inset: 2px;
  background:
    radial-gradient(circle, #ad8b4d 0 1px, transparent 1.5px) left top / 8px 14px repeat-y,
    radial-gradient(circle, #ad8b4d 0 1px, transparent 1.5px) right top / 8px 14px repeat-y,
    repeating-linear-gradient(90deg, transparent 0 5px, rgba(93, 122, 79, 0.55) 5px 6px, transparent 6px 11px) left top / 100% 3px repeat-x,
    repeating-linear-gradient(90deg, transparent 0 5px, rgba(93, 122, 79, 0.55) 5px 6px, transparent 6px 11px) left bottom / 100% 3px repeat-x;
  content: "";
  opacity: 0.7;
}
.page-header {
  display: flex;
  flex: 0 0 30px;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
}
.header-label {
  min-width: 0;
  padding: 2px 6px;
  color: #354d37;
  font: 600 11px sans-serif;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lines {
  display: grid;
  flex: 1 1 auto;
  grid-template-rows: repeat(${sourceLineCount}, min-content);
  align-content: start;
  width: 100%;
  min-height: 0;
  padding: 2px;
  border-inline: 1px solid rgba(169, 138, 82, 0.22);
  overflow: hidden;
}
.line {
  display: block;
  align-self: stretch;
  direction: rtl;
  font-size: var(--quran-rendered-font-size, var(--quran-font-size));
  text-align: right;
  line-height: 1.5;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  unicode-bidi: normal;
}
.surah-title, .opening-basmala {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1;
  text-align: center;
}
.surah-title {
  position: relative;
  min-height: calc(var(--quran-font-size) * 1.5);
  margin: 0 12%;
  padding: 0 12px;
  border-block: 1px solid #a8894f;
  color: #354d37;
  font-family: "Noto Naskh Arabic", "Noto Naskh Arabic UI", serif;
  font-size: min(16px, 5.4cqi);
  font-weight: 700;
  font-feature-settings: "ccmp" 1, "rlig" 1, "calt" 1;
}
.surah-title:before, .surah-title:after {
  position: absolute;
  top: 50%;
  width: 6px;
  height: 6px;
  border: 1px solid #a8894f;
  background: #fffaf0;
  content: "";
  transform: translateY(-50%) rotate(45deg);
}
.surah-title:before { inset-inline-start: -3px; }
.surah-title:after { inset-inline-end: -3px; }
.opening-basmala {
  color: #263a30;
  font-family: "QcfTajweedPage";
  font-palette: --QcfLight;
  font-size: var(--quran-rendered-font-size, var(--quran-font-size));
  min-height: calc(var(--quran-font-size) * 1.5);
  white-space: nowrap;
  ${showTajweed ? '' : 'filter: grayscale(1);'}
}
.word, .ayah-marker, .basmala-word {
  display: inline-block;
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
  color: #514327;
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
  flex: 0 0 34px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  color: #596747;
  font: 10px sans-serif;
}
.page-number {
  min-width: 40px;
  padding: 4px 9px;
  border: 1px solid #b9985d;
  border-radius: 50%;
  background: #fff7e8;
  color: #344a34;
  font: 700 14px serif;
  text-align: center;
}
.legend { display: flex; flex-wrap: wrap; gap: 3px 6px; justify-content: flex-end; }
.legend-item { display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot.madd { background: #a33db5; }
.dot.ghunnah { background: #18864b; }
.dot.ikhfa { background: #1684b8; }
.dot.iqlab { background: #c54135; }
.dot.qalqalah { background: #d87a19; }
.dot.silent { background: #8c9298; }
</style>
</head>
<body>
<main class="page" aria-label="صفحة المصحف">
<div class="frame-ornament" aria-hidden="true"></div>
<header class="page-header">
  <span class="header-label" id="juz-label"></span>
</header>
<section class="lines" id="mushaf-lines"></section>
<footer class="page-footer">
  <span>مصحف المدينة · رواية حفص</span>
  <span class="page-number" id="page-number"></span>
  <aside class="legend" style="display:${showTajweed ? 'flex' : 'none'}">
    <span class="legend-item"><i class="dot madd"></i>مد</span>
    <span class="legend-item"><i class="dot ghunnah"></i>غنة</span>
    <span class="legend-item"><i class="dot ikhfa"></i>إخفاء</span>
    <span class="legend-item"><i class="dot iqlab"></i>إقلاب</span>
    <span class="legend-item"><i class="dot qalqalah"></i>قلقلة</span>
    <span class="legend-item"><i class="dot silent"></i>صامت</span>
  </aside>
</footer>
</main>
<script>
const page = ${pageJson};
const highlightStyles = ${highlightsJson};
const linesElement = document.getElementById("mushaf-lines");
document.getElementById("juz-label").textContent =
  "الجزء " + toArabicNumber(page.juzNumber) + " · الحزب " + toArabicNumber(page.hizbNumber);
document.getElementById("page-number").textContent = toArabicNumber(page.pageNumber);

for (const line of page.lines) {
  const lineElement = document.createElement("div");
  lineElement.className = "line";
  lineElement.style.gridRow = String(line.lineNumber);
  lineElement.setAttribute("aria-label", "السطر " + line.lineNumber);
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
      lineElement.appendChild(button);
    } else {
      lineElement.appendChild(VerseMarker(word));
    }
    if (word !== line.words[line.words.length - 1]) {
      lineElement.appendChild(document.createTextNode(" "));
    }
  }
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
    title.textContent = "سورة " + (surah ? surah.nameArabic : "");
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
    for (const [index, word] of page.basmalaWords.entries()) {
      const glyph = document.createElement("span");
      glyph.className = "basmala-word";
      glyph.textContent = word.codeV2;
      glyph.setAttribute("aria-label", word.textUthmani);
      basmala.appendChild(glyph);
      if (index < page.basmalaWords.length - 1) {
        basmala.appendChild(document.createTextNode(" "));
      }
    }
    linesElement.appendChild(basmala);
  }
}

function fitMushafText() {
  linesElement.style.removeProperty("--quran-rendered-font-size");
  const lines = [...linesElement.querySelectorAll(".line")];
  if (lines.length === 0) return;

  const baseFontSize = Number.parseFloat(getComputedStyle(lines[0]).fontSize);
  let scale = 1;
  for (const line of lines) {
    if (line.scrollWidth > line.clientWidth && line.scrollWidth > 0) {
      scale = Math.min(scale, line.clientWidth / line.scrollWidth);
    }
  }
  const basmala = linesElement.querySelector(".opening-basmala");
  if (basmala && basmala.scrollWidth > basmala.clientWidth && basmala.scrollWidth > 0) {
    scale = Math.min(scale, basmala.clientWidth / basmala.scrollWidth);
  }
  if (scale < 1) {
    linesElement.style.setProperty(
      "--quran-rendered-font-size",
      Math.max(1, baseFontSize * scale) + "px",
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
