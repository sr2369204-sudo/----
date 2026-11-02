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
  onPanStart?: (x: number, y: number) => void;
  onPanUpdate?: (dx: number, dy: number) => void;
  onPanEnd?: (dx: number, vx: number) => void;
  onPanCancel?: () => void;
  onPageTap?: () => void;
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
  | { type: 'turn'; direction: PageTurnDirection }
  | { type: 'pan-start'; x: number; y: number }
  | { type: 'pan-update'; dx: number; dy: number }
  | { type: 'pan-end'; dx: number; vx: number }
  | { type: 'pan-cancel' }
  | { type: 'page-tap' };

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
  onPanStart,
  onPanUpdate,
  onPanEnd,
  onPanCancel,
  onPageTap,
}: Props) {
  const webViewRef = useRef<WebView<unknown>>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HostInstance | null>(null);
  const html = useMemo(
    () =>
      createMushafHtml(
        page,
        fontBase64,
        basmalaFontBase64,
        fontSize,
        showTajweed,
        isDark,
        highlights,
        transitionDirection,
      ),
    [
      basmalaFontBase64,
      fontBase64,
      fontSize,
      highlights,
      isDark,
      page,
      showTajweed,
      transitionDirection,
    ],
  );

  const handleMessage = useCallback(
    (message: PageMessage, origin: { x: number; y: number }): void => {
      if (message.type === 'page-tap') {
        onPageTap?.();
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
            ayah.words.some((word) => word.position === message.position),
        );
        if (!wordExists || message.position === undefined) {
          onInteractionError('تعذر مطابقة الكلمة مع بيانات صفحة المصحف.');
          return;
        }
        onWordPress(message.surahNumber, message.ayahNumber, message.position, anchor);
        return;
      }

      onAyahPress(message.surahNumber, message.ayahNumber, anchor);
    },
    [
      onAyahPress,
      onInteractionError,
      onPageTap,
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

  const onNativeMessage = useCallback(
    (event: WebViewMessageEvent): void => {
      try {
        const message: unknown = JSON.parse(event.nativeEvent.data);
        if (!isPageMessage(message)) {
          onInteractionError('وصل تحديد غير صالح من صفحة المصحف.');
          return;
        }
        if (
          message.type === 'turn' ||
          message.type === 'page-tap' ||
          message.type === 'pan-start' ||
          message.type === 'pan-update' ||
          message.type === 'pan-end' ||
          message.type === 'pan-cancel'
        ) {
          handleMessage(message, { x: 0, y: 0 });
        } else {
          containerRef.current?.measureInWindow((x, y) => handleMessage(message, { x, y }));
        }
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
  const sourceLineCount = Math.max(...page.lines.map((line) => line.lineNumber), 15);
  const highlightStyles = buildHighlightStyles(page, highlights);
  const linesHtml = renderMushafLinesHtml(page, highlightStyles);

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
  padding: 2px 4px 4px;
  background: ${isDark ? '#0c110f' : '#ece7dc'};
}
.page {
  --quran-font-size: ${fontSize}px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 4px 8px 4px;
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
    --line-row-height: calc((100cqb - 50px) / ${sourceLineCount});
    --quran-font-size: min(
      ${fontSize}px,
      calc(var(--line-row-height) * 0.94),
      10.5cqi
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
  flex: 0 0 24px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  padding: 0 6px 1px;
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
  padding: 1px 2px;
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
  line-height: 1.15;
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
  gap: 8px;
  min-width: min(210px, 72%);
  padding: 3px 16px 4px;
  border-radius: 18px;
  border: 1.5px solid ${isDark ? '#9e8046' : '#c5a363'};
  outline: 1px solid ${isDark ? 'rgba(158, 128, 70, 0.4)' : 'rgba(197, 163, 99, 0.45)'};
  outline-offset: -3px;
  background: ${isDark
    ? 'linear-gradient(180deg, #241d13 0%, #382d1c 50%, #241d13 100%)'
    : 'linear-gradient(180deg, #fdfbf7 0%, #faeed7 48%, #f2dfba 52%, #faeed7 100%)'};
  box-shadow: ${isDark
    ? 'inset 0 1px 0 rgba(255, 235, 180, 0.1), 0 2px 6px rgba(0, 0, 0, 0.4)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 6px rgba(120, 95, 45, 0.12)'};
  white-space: nowrap;
}
.surah-ornament {
  font-size: min(12px, 3.8cqi);
  color: ${isDark ? '#c5a363' : '#b38d45'};
  line-height: 1;
}
.surah-title-text {
  font-size: min(16px, 5cqi);
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
  line-height: 1.2;
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
  flex: 0 0 22px;
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

function postPageMessage(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    window.parent.postMessage({ source: "mushaf-page", message: message }, "*");
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
  if (scale < 0.99) {
    linesElement.style.setProperty(
      "--quran-rendered-font-size",
      Math.max(12, baseFontSize * scale * 0.985) + "px",
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

let pointerStart = null;
let isPanning = false;

pageElement.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button[data-kind]")) {
    pointerStart = null;
    isPanning = false;
    return;
  }
  pageElement.setPointerCapture(event.pointerId);
  pointerStart = { x: event.clientX, y: event.clientY, time: Date.now() };
  isPanning = false;
});

pageElement.addEventListener("pointermove", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  if (!isPanning && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.1) {
    isPanning = true;
    postPageMessage({ type: "pan-start", x: event.clientX, y: event.clientY });
  }
  if (isPanning) {
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
  if (!button) {
    postPageMessage({ type: "page-tap" });
    return;
  }
  const rect = button.getBoundingClientRect();
  const message = {
    type: button.dataset.kind,
    surahNumber: Number(button.dataset.surah),
    ayahNumber: Number(button.dataset.ayah),
    position: Number(button.dataset.position),
    anchor: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  };
  selectMushafElement(button.id);
  postPageMessage(message);
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

function renderMushafLinesHtml(
  page: MushafPage,
  highlightStyles: Record<string, HighlightEntry>,
): string {
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
          <span class="surah-title-rule" aria-hidden="true"></span>
          <span class="surah-title-box">
            <span class="surah-ornament start" aria-hidden="true">۞</span>
            <span class="surah-title-text">سورة ${escapeHtml(surahName)}</span>
            <span class="surah-ornament end" aria-hidden="true">۞</span>
          </span>
          <span class="surah-title-rule" aria-hidden="true"></span>
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
          const entry = highlightStyles[word.id];
          const hlBg = entry && entry.bg ? ' hl-bg' : '';
          const hlMarker = entry && entry.marker ? ' hl-marker' : '';
          const customStyle = [
            entry && entry.bg ? `--hl-bg: ${entry.bg};` : '',
            entry && entry.marker ? `--hl-marker-color: ${entry.marker};` : '',
          ]
            .filter(Boolean)
            .join(' ');
          const styleAttr = customStyle ? ` style="${customStyle}"` : '';

          return `<button type="button" class="word${hlBg}${hlMarker}" data-surah="${word.surahNumber}" data-ayah="${word.ayahNumber}" id="word-${word.surahNumber}-${word.ayahNumber}-${word.position}" data-kind="word" data-position="${word.position}" data-word-id="${word.id}" aria-label="${escapeHtml(word.textUthmani)}، كلمة ${word.position} من الآية ${word.ayahNumber}"${styleAttr}>${word.codeV2}</button>`;
        } else {
          const markerId = `ayah-${word.surahNumber}-${word.ayahNumber}`;
          const entry = highlightStyles[markerId];
          const hlBg = entry && entry.bg ? ' hl-bg' : '';
          const styleAttr = entry && entry.bg ? ` style="--hl-bg: ${entry.bg};"` : '';
          return `<button type="button" class="ayah-marker${hlBg}" id="${markerId}" data-surah="${word.surahNumber}" data-ayah="${word.ayahNumber}" data-kind="ayah" aria-label="إجراءات الآية ${word.ayahNumber}"${styleAttr}>${word.codeV2}</button>`;
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

function toArabicNumberString(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

function isPageMessage(value: unknown): value is PageMessage {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }
  if (value.type === 'page-tap') {
    return true;
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
  return (
    value.surahNumber > 0 &&
    value.ayahNumber > 0 &&
    value.anchor.width >= 0 &&
    value.anchor.height >= 0 &&
    (value.type === 'ayah' ||
      (typeof value.position === 'number' &&
        Number.isInteger(value.position) &&
        value.position > 0))
  );
}

type HighlightEntry = { bg: string; marker?: string };

function buildHighlightStyles(
  page: MushafPage,
  highlights: Highlight[],
): Record<string, HighlightEntry> {
  const styles: Record<string, HighlightEntry> = {};
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

      const entry: HighlightEntry = { bg: '' };
      if (ayahHighlight) {
        entry.bg = toRgba(ayahHighlight.color, ayahHighlight.opacity * 0.55);
      }
      if (wordHighlight) {
        entry.marker = toRgba(wordHighlight.color, wordHighlight.opacity);
      }
      if (entry.bg || entry.marker) {
        styles[word.id] = entry;
      }
    }

    if (ayahHighlight) {
      styles[`ayah-${ayah.surahNumber}-${ayah.ayahNumber}`] = {
        bg: toRgba(ayahHighlight.color, ayahHighlight.opacity * 0.4),
      };
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
