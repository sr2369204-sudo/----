import { createElement, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { Highlight } from '@/features/annotations/types';
import type { MushafPage } from '@/features/quran/types';

type Props = {
  page: MushafPage;
  fontBase64: string;
  fontSize: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  selectedElementId: string | null;
  onWordPress: (ayahNumber: number, position: number) => void;
  onAyahPress: (ayahNumber: number) => void;
  onInteractionError: (message: string) => void;
};

type PageMessage =
  | { type: 'word'; ayahNumber: number; position: number }
  | { type: 'ayah'; ayahNumber: number };

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
  const html = useMemo(
    () => createMushafHtml(page, fontBase64, fontSize, showTajweed, isDark, highlights),
    [fontBase64, fontSize, highlights, isDark, page, showTajweed],
  );

  const handleMessage = useCallback((message: PageMessage): void => {
    if (message.type === 'word') {
      if (
        Number.isInteger(message.ayahNumber) &&
        message.ayahNumber >= 1 &&
        message.ayahNumber <= page.surah.ayahCount &&
        Number.isInteger(message.position) &&
        message.position >= 1
      ) {
        onWordPress(message.ayahNumber, message.position);
      }
      return;
    }

    if (
      Number.isInteger(message.ayahNumber) &&
      message.ayahNumber >= 1 &&
      message.ayahNumber <= page.surah.ayahCount
    ) {
      onAyahPress(message.ayahNumber);
    }
  }, [onAyahPress, onWordPress, page.surah.ayahCount]);

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
      handleMessage(message);
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
    <View style={styles.container}>
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
@font-palette-values --QcfDark {
  font-family: "QcfTajweedPage";
  base-palette: 1;
}
* { box-sizing: border-box; }
html, body { width: 100%; height: 100%; margin: 0; }
body { padding: 8px; background: ${isDark ? '#111a16' : '#f1eee4'}; }
.page {
  width: 100%;
  max-width: 720px;
  min-height: 100%;
  margin: 0 auto;
  padding: 12px 10px;
  border: 2px solid #c7a66a;
  outline: 1px solid #e6d4a9;
  outline-offset: -6px;
  background: #fffef9;
  display: grid;
  grid-template-rows: minmax(42px, 0.8fr) repeat(7, minmax(0, 1fr)) minmax(38px, 0.7fr);
  gap: 2px;
  color: ${isDark ? '#f1f4f0' : '#263a30'};
  background: ${isDark ? '#1a2620' : '#fffef9'};
  border-color: ${isDark ? '#64715d' : '#c7a66a'};
  outline-color: ${isDark ? '#314138' : '#e6d4a9'};
}
.surah-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${isDark ? '#64715d' : '#c7a66a'};
  border-radius: 8px;
  color: ${isDark ? '#f1f4f0' : '#263a30'};
  font-family: serif;
  font-size: 19px;
  font-weight: 700;
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
.word, .ayah-marker {
  flex: 0 0 auto;
  border: 0;
  padding: 0 1px;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.word {
  font-family: "QcfTajweedPage";
  font-palette: ${isDark ? '--QcfDark' : '--QcfLight'};
  font-size: min(${fontSize}px, 6.2vw);
  line-height: 1;
  ${showTajweed ? '' : 'filter: grayscale(1);'}
}
.ayah-marker {
  min-width: 30px;
  height: 30px;
  border: 1px solid ${isDark ? '#a8b5ac' : '#7d765d'};
  border-radius: 45% 45% 50% 50%;
  color: ${isDark ? '#f1f4f0' : '#202820'};
  font-family: serif;
  font-size: 15px;
}
.selected {
  border-radius: 7px;
  background: rgba(199, 166, 106, 0.3);
  box-shadow: 0 0 0 1px rgba(153, 117, 49, 0.55);
}
.legend {
  width: 100%;
  max-width: 720px;
  display: ${showTajweed ? 'block' : 'none'};
  margin: 0 auto;
  padding: 4px;
  border: 1px solid ${isDark ? '#64715d' : 'rgba(199, 166, 106, 0.7)'};
  border-radius: 10px;
  background: ${isDark ? '#1a2620' : '#fffef9'};
  color: ${isDark ? '#f1f4f0' : '#263a30'};
  font: 12px sans-serif;
  text-align: center;
}
.legend-colors { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 3px; }
.legend-item { display: inline-flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
</style>
</head>
<body>
<main class="page" aria-label="صفحة المصحف">
<div class="surah-heading" id="surah-heading"></div>
<div id="mushaf-lines" style="display:contents"></div>
<aside class="legend">
  ألوان التجويد من خط QCF Tajweed V4
  <div class="legend-colors">
    <span class="legend-item"><i class="dot" style="background:#a33db5"></i>مد</span>
    <span class="legend-item"><i class="dot" style="background:#18864b"></i>غنة وإدغام</span>
    <span class="legend-item"><i class="dot" style="background:#1684b8"></i>إخفاء</span>
    <span class="legend-item"><i class="dot" style="background:#d87a19"></i>قلقلة</span>
  </div>
</aside>
</main>
<script>
const page = ${pageJson};
const highlightStyles = ${highlightsJson};
const linesElement = document.getElementById("mushaf-lines");
document.getElementById("surah-heading").textContent = "سورة " + page.surah.nameArabic;

for (const line of page.lines) {
  const lineElement = document.createElement("div");
  lineElement.className = "line";
  lineElement.setAttribute("aria-label", "السطر " + line.lineNumber);
  for (const word of line.words) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = word.charType === "word" ? "word" : "ayah-marker";
    button.dataset.ayah = String(word.ayahNumber);
    if (word.charType === "word") {
      button.id = "word-" + word.ayahNumber + "-" + word.position;
      button.dataset.kind = "word";
      button.dataset.position = String(word.position);
      button.textContent = word.codeV2;
      button.setAttribute("aria-label", word.textUthmani + "، كلمة " + word.position + " من الآية " + word.ayahNumber);
      button.style.backgroundColor = highlightStyles[word.id] || "";
    } else {
      button.id = "ayah-" + word.ayahNumber;
      button.dataset.kind = "ayah";
      button.textContent = word.textUthmani;
      button.setAttribute("aria-label", "إجراءات الآية " + word.ayahNumber);
      button.style.backgroundColor = highlightStyles["ayah-" + word.ayahNumber] || "";
    }
    lineElement.appendChild(button);
  }
  linesElement.appendChild(lineElement);
}

function selectMushafElement(id) {
  document.querySelectorAll(".selected").forEach((element) => element.classList.remove("selected"));
  if (!id) return;
  const element = document.getElementById(id);
  if (element) element.classList.add("selected");
}
window.selectMushafElement = selectMushafElement;

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-kind]");
  if (!button) return;
  const ayahNumber = Number(button.dataset.ayah);
  const message = button.dataset.kind === "word"
    ? { type: "word", ayahNumber, position: Number(button.dataset.position) }
    : { type: "ayah", ayahNumber };
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
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }
  return value.type === 'word'
    ? typeof value.ayahNumber === 'number' &&
      Number.isInteger(value.ayahNumber) &&
      value.ayahNumber > 0 &&
      typeof value.position === 'number' &&
      Number.isInteger(value.position) &&
      value.position > 0
    : value.type === 'ayah' &&
      typeof value.ayahNumber === 'number' &&
      Number.isInteger(value.ayahNumber) &&
      value.ayahNumber > 0;
}

function buildHighlightStyles(page: MushafPage, highlights: Highlight[]): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const ayah of page.surah.ayahs) {
    const ayahHighlight = highlights.find((highlight) =>
      highlight.target.type === 'ayah' &&
      highlight.target.surahNumber === page.surah.surahNumber &&
      highlight.target.ayahNumber === ayah.ayahNumber,
    );
    if (ayahHighlight) {
      styles[`ayah-${ayah.ayahNumber}`] = toRgba(ayahHighlight.color, ayahHighlight.opacity);
    }

    for (const word of ayah.words) {
      const wordIndex = ayah.words.findIndex((item) => item.id === word.id);
      const highlight = highlights.find((item) => {
        const target = item.target;
        if (
          target.surahNumber !== page.surah.surahNumber ||
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
  return "rgba(" + red + ", " + green + ", " + blue + ", " + Math.max(0, Math.min(1, opacity)) + ")";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
