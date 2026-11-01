import { createElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View, type HostInstance } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Highlight } from '@/features/annotations/types';
import type { MushafPage } from '@/features/quran/types';
import {
  parseTajweedMarkup,
  tajweedRuleColors,
} from '@/features/quran/services/tajweed';

export type SelectionAnchor = { x: number; y: number; width: number; height: number };

type Props = {
  page: MushafPage;
  fontBase64: string;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  selectedElementId: string | null;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    position: number,
    anchor: SelectionAnchor,
  ) => void;
  onAyahPress: (surahNumber: number, ayahNumber: number, anchor: SelectionAnchor) => void;
  onInteractionError: (message: string) => void;
};

type PageMessage = {
  type: 'word' | 'ayah';
  surahNumber: number;
  ayahNumber: number;
  position?: number;
  anchor: SelectionAnchor;
};

export function MushafPageViewer({
  page,
  fontBase64,
  fontSize,
  showTajweed,
  isDark,
  highlights,
  selectedElementId,
  onWordPress,
  onAyahPress,
  onInteractionError,
}: Props) {
  const webViewRef = useRef<WebView<unknown>>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HostInstance | null>(null);
  const html = useMemo(
    () => createMushafHtml(page, fontBase64, fontSize, showTajweed, isDark, highlights),
    [fontBase64, fontSize, highlights, isDark, page, showTajweed],
  );

  const handleMessage = useCallback((
    message: PageMessage,
    origin: { x: number; y: number },
  ): void => {
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
  }, [onAyahPress, onInteractionError, onWordPress, page.ayahs]);

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
      containerRef.current?.measureInWindow((x, y) => handleMessage(message, { x, y }));
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
  fontSize: number,
  showTajweed: boolean,
  isDark: boolean,
  highlights: Highlight[],
): string {
  const pageJson = JSON.stringify(page).replace(/</g, '\\u003c');
  const basmalaSegments = page.basmalaTajweed
    ? parseTajweedMarkup(page.basmalaTajweed.replace(/<span class=end>[^<>]*<\/span>/g, ''))
    : [];
  const basmalaJson = JSON.stringify(basmalaSegments).replace(/</g, '\\u003c');
  const tajweedColorsJson = JSON.stringify(tajweedRuleColors).replace(/</g, '\\u003c');
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
@font-palette-values --QcfLight {
  font-family: "QcfTajweedPage";
  base-palette: 0;
}
* { box-sizing: border-box; }
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  background: ${isDark ? '#111a16' : '#eee9dc'};
}
.page {
  position: relative;
  display: grid;
  grid-template-rows: minmax(34px, 0.7fr) minmax(0, 1fr) minmax(34px, 0.65fr);
  gap: 5px;
  width: min(100%, calc(100vh * 0.696));
  max-height: 100%;
  aspect-ratio: 0.696;
  margin: auto;
  padding: 13px 10px;
  border: 3px double #b89758;
  outline: 1px solid #e8d8ae;
  outline-offset: -7px;
  color: #263a30;
  background:
    radial-gradient(ellipse at 10% 12%, rgba(216, 198, 155, 0.12), transparent 38%),
    radial-gradient(ellipse at 92% 85%, rgba(216, 198, 155, 0.1), transparent 42%),
    #fffaf0;
  box-shadow: 0 3px 14px rgba(37, 31, 20, 0.18);
}
.page:before {
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(88, 112, 78, 0.52);
  content: "";
  pointer-events: none;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.header-label {
  flex: 1;
  min-width: 0;
  padding: 5px 8px;
  border: 1px solid #c7a66a;
  border-radius: 22px;
  background: #fff7e8;
  color: #354d37;
  font: 600 12px sans-serif;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-label + .header-label { margin-inline-start: 5px; }
.lines {
  display: grid;
  grid-template-rows: repeat(${sourceLineCount}, minmax(0, 1fr));
  min-height: 0;
  padding: 1px 5px;
  border-inline: 1px solid rgba(169, 138, 82, 0.22);
}
.line {
  display: flex;
  direction: rtl;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  min-width: 0;
  white-space: nowrap;
}
.surah-title, .opening-basmala {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1;
  text-align: center;
}
.surah-title {
  margin: 0 12%;
  border: 1px solid #c7a66a;
  border-radius: 20px;
  background: #fff7e8;
  color: #354d37;
  font: 700 15px serif;
}
.opening-basmala {
  color: #263a30;
  font-family: "QcfTajweedPage", serif;
  font-size: min(${Math.max(fontSize - 7, 18)}px, 6vw);
  white-space: nowrap;
}
.word, .ayah-marker {
  flex: 0 0 auto;
  border: 0;
  padding: 0 1px;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.word {
  font-family: "QcfTajweedPage";
  font-palette: --QcfLight;
  font-size: min(${fontSize}px, 8vw);
  line-height: 1;
  ${showTajweed ? '' : 'filter: grayscale(1);'}
}
.ayah-marker {
  min-width: 24px;
  min-height: 24px;
  border: 1px solid #b99b63;
  border-radius: 45% 45% 50% 50%;
  color: #514327;
  font: 600 12px serif;
}
.selected {
  border-radius: 5px;
  background: rgba(86, 125, 78, 0.24);
  box-shadow: 0 0 0 1px rgba(75, 110, 67, 0.55);
}
.page-footer {
  display: flex;
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
<header class="page-header">
  <span class="header-label" id="juz-label"></span>
  <span class="header-label" id="surah-label"></span>
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
const basmalaSegments = ${basmalaJson};
const tajweedColors = ${tajweedColorsJson};
const linesElement = document.getElementById("mushaf-lines");
document.getElementById("juz-label").textContent = "الجزء " + toArabicNumber(page.juzNumber);
document.getElementById("surah-label").textContent = "سورة " + page.surahs[0].nameArabic;
document.getElementById("page-number").textContent = toArabicNumber(page.pageNumber);

for (const line of page.lines) {
  const lineElement = document.createElement("div");
  lineElement.className = "line";
  lineElement.style.gridRow = String(line.lineNumber);
  lineElement.setAttribute("aria-label", "السطر " + line.lineNumber);
  for (const word of line.words) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = word.charType === "word" ? "word" : "ayah-marker";
    button.dataset.surah = String(word.surahNumber);
    button.dataset.ayah = String(word.ayahNumber);
    if (word.charType === "word") {
      button.id = "word-" + word.surahNumber + "-" + word.ayahNumber + "-" + word.position;
      button.dataset.kind = "word";
      button.dataset.position = String(word.position);
      button.dataset.wordId = word.id;
      button.textContent = word.codeV2;
      button.setAttribute("aria-label", word.textUthmani + "، كلمة " + word.position + " من الآية " + word.ayahNumber);
      button.style.backgroundColor = highlightStyles[word.id] || "";
    } else {
      button.id = "ayah-" + word.surahNumber + "-" + word.ayahNumber;
      button.dataset.kind = "ayah";
      button.textContent = word.textUthmani;
      button.setAttribute("aria-label", "إجراءات الآية " + word.ayahNumber);
      button.style.backgroundColor = highlightStyles[button.id] || "";
    }
    lineElement.appendChild(button);
  }
  linesElement.appendChild(lineElement);
}

const sourceLineNumbers = new Set(page.lines.map((line) => line.lineNumber));
for (const ayah of page.ayahs) {
  if (ayah.ayahNumber !== 1 || ayah.surahNumber === 1) continue;
  const firstWord = page.lines
    .flatMap((line) => line.words)
    .find((word) => word.surahNumber === ayah.surahNumber && word.ayahNumber === 1 && word.charType === "word");
  if (!firstWord) continue;
  const surah = page.surahs.find((item) => item.surahNumber === ayah.surahNumber);
  const titleRow = firstWord.surahNumber === 9 ? firstWord.lineNumber - 1 : firstWord.lineNumber - 2;
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
    basmalaRow >= 1 &&
    !sourceLineNumbers.has(basmalaRow) &&
    basmalaSegments.length > 0
  ) {
    const basmala = document.createElement("div");
    basmala.className = "opening-basmala";
    basmala.style.gridRow = String(basmalaRow);
    for (const segment of basmalaSegments) {
      const span = document.createElement("span");
      span.textContent = segment.text;
      if (${showTajweed} && segment.rule && tajweedColors[segment.rule]) {
        span.style.color = tajweedColors[segment.rule];
      }
      basmala.appendChild(span);
    }
    linesElement.appendChild(basmala);
  }
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
