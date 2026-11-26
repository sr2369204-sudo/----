import { createElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Paths } from 'expo-file-system';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { SURAH_NAME_ART } from '@/features/reader/assets/surah-name-art';
import { SURAH_HEADER_ART_URI } from '@/features/reader/assets/surah-header-art';
import type { Highlight } from '@/features/annotations/types';
import type { MushafPage } from '@/features/quran/types';
import type { CachedMushafPage } from '@/features/reader/services/mushaf-page-cache';
import {
  buildHighlightElements,
  getMushafPageCenteringOffset,
  renderMushafLinesHtml,
  toArabicNumberString,
  type HighlightElementMap,
} from '@/features/reader/services/mushaf-page-markup';

import { friendlyError } from '@/features/errors/friendly-error';
export type PageTurnDirection = 'next' | 'previous';

/** Position of a tapped element inside the WebView viewport (CSS pixels). */
export type ElementRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * A run of ayahs on this page that belongs to one thematic section, painted as
 * a soft coloured band behind its words. Several bands — one per section on the
 * page, each a different colour — let the reader see at a glance where one
 * section ends and the next begins, without reading the section list.
 */
export type TopicBand = {
  /** Stable id of the section the band belongs to. */
  id: string;
  /** Fill of the band; a translucent colour so the words stay legible. */
  color: string;
  /** Document ids of the ayahs in the band, e.g. `ayah-2-10`. */
  ayahIds: string[];
};

type Props = {
  page: MushafPage;
  /**
   * The cached page whose fonts are used. The fonts are loaded from files in
   * the app cache; the base64 copy is only read when file loading is not
   * possible on this phone.
   */
  fonts: Pick<CachedMushafPage, 'fontUri' | 'basmalaFontUri' | 'fontBase64' | 'basmalaFontBase64'>;
  fontSize: number;
  /** Reader zoom: 1 fits the page to the screen, above 1 the page is larger than the screen and is dragged around. */
  pageScale?: number;
  markerScale?: number;
  showTajweed: boolean;
  isDark: boolean;
  highlights: Highlight[];
  /**
   * Document ids of the currently selected elements. A single word id renders a
   * word outline; one or more `ayah-*` ids draw a box around every ayah in the
   * selection, so a range of ayahs reads as one continuous frame.
   */
  selectedElementIds: string[] | null;
  /**
   * Coloured bands that group the ayahs of this page by thematic section. Drawn
   * as an overlay, so a page can be pre-rendered as a neighbour and still stay
   * byte-identical when the bands change.
   */
  topicBands?: TopicBand[];
  /** Ayah ids whose text is hidden during memorisation recording. */
  hiddenAyahIds?: string[];
  /**
   * Document id of the ayah being recited right now, drawn as its own frame so
   * the reader can follow the reciter without opening the word/ayah tools.
   */
  activeAyahId?: string | null;
  /**
   * Document id of the single word being recited right now (`word-<id>`). It is
   * painted as a filled box that glides from word to word inside the reciting
   * ayah's frame, so the reader can follow the recitation word by word.
   */
  activeWordId?: string | null;
  /**
   * True while a recitation is running. The page then draws only the frame that
   * travels with the reciting ayah: the reader's own selection is kept but left
   * unpainted, and taps no longer open the word/ayah tools.
   */
  recitationFocus?: boolean;
  onWordPress: (
    surahNumber: number,
    ayahNumber: number,
    wordId: string,
    rect: ElementRect,
    gesture: 'tap' | 'longPress',
  ) => void;
  onAyahPress: (
    surahNumber: number,
    ayahNumber: number,
    rect: ElementRect,
    gesture: 'tap' | 'longPress',
  ) => void;
  onInteractionError: (message: string) => void;
  /**
   * Fired when a tap lands on the page without hitting a word or an ayah. The
   * tools opened from the page are dismissed from here: the page itself reports
   * the tap, so a tap on another ayah is never mistaken for a dismissal.
   */
  onBackgroundPress?: () => void;
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
      gesture: 'tap' | 'longPress';
    }
  | {
      type: 'ayah';
      surahNumber: number;
      ayahNumber: number;
      rect: ElementRect;
      gesture: 'tap' | 'longPress';
    }
  | { type: 'background' }
  | { type: 'ready' }
  | { type: 'font-failed' }
  | { type: 'pan-start'; x: number; y: number }
  | { type: 'pan-update'; dx: number; dy: number }
  | { type: 'pan-end'; dx: number; vx: number }
  | { type: 'pan-cancel' };

/**
 * Set once a WebView on this phone fails to load a font from a file. From then
 * on every page is built with the font inside its HTML, as before.
 */
let fileFontsUnavailable = false;

export const MushafPageViewer = memo(function MushafPageViewer({
  page,
  fonts,
  fontSize,
  pageScale = 1,
  markerScale = 1,
  showTajweed,
  isDark,
  highlights,
  selectedElementIds,
  topicBands = NO_TOPIC_BANDS,
  hiddenAyahIds = [],
  activeAyahId,
  activeWordId = null,
  recitationFocus = false,
  onWordPress,
  onAyahPress,
  onInteractionError,
  onBackgroundPress,
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
  const [fontFilesFailed, setFontFilesFailed] = useState(fileFontsUnavailable);
  const fontsFromFile =
    !fontFilesFailed && Platform.OS !== 'web' && fonts.fontUri !== null &&
    (fonts.basmalaFontUri !== null || page.basmalaWords === null);
  const html = useMemo(() => {
    const fontUrl = fontsFromFile && fonts.fontUri ? fonts.fontUri : null;
    const basmalaUrl = fontsFromFile ? fonts.basmalaFontUri : null;
    return createMushafHtml(
      page,
      fontUrl ?? `data:font/woff2;base64,${fonts.fontBase64}`,
      page.basmalaWords === null
        ? null
        : basmalaUrl ?? `data:font/woff2;base64,${fonts.basmalaFontBase64 ?? ''}`,
      fontsFromFile,
      fontSize,
      pageScale,
      markerScale,
      showTajweed,
      isDark,
    );
  }, [fonts, fontsFromFile, fontSize, isDark, markerScale, page, pageScale, showTajweed]);
  // A stable source object prevents react-native-webview from reloading the
  // document on unrelated parent re-renders, which would flash and re-fit.
  const source = useMemo(
    () => (fontsFromFile ? { html, baseUrl: Paths.cache.uri } : { html }),
    [fontsFromFile, html],
  );

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
      if (message.type === 'font-failed') {
        // The phone's WebView would not read the font file: rebuild this page
        // (and every later one) with the font inside the HTML.
        fileFontsUnavailable = true;
        setFontFilesFailed(true);
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
      if (message.type === 'background') {
        onBackgroundPress?.();
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
        onWordPress(
          message.surahNumber,
          message.ayahNumber,
          message.wordId,
          message.rect,
          message.gesture,
        );
        return;
      }

      onAyahPress(message.surahNumber, message.ayahNumber, message.rect, message.gesture);
    },
    [
      handleReady,
      onAyahPress,
      onBackgroundPress,
      onInteractionError,
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
        { source: 'mushaf-page-parent', selectedElementIds },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.selectMushafElements?.(${JSON.stringify(selectedElementIds)}); true;`,
      );
    }
  }, [selectedElementIds]);

  const syncRecitationAyah = useCallback(() => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', activeAyahId },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.selectRecitationAyah?.(${JSON.stringify(activeAyahId)}); true;`,
      );
    }
  }, [activeAyahId]);

  const syncRecitationWord = useCallback(() => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', activeWordId },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.selectRecitationWord?.(${JSON.stringify(activeWordId)}); true;`,
      );
    }
  }, [activeWordId]);

  const syncRecitationFocus = useCallback(() => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', recitationFocus },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.setRecitationFocus?.(${JSON.stringify(recitationFocus)}); true;`,
      );
    }
  }, [recitationFocus]);

  const syncHiddenAyahs = useCallback(() => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', hiddenAyahIds },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.setTasmi3Hidden?.(${JSON.stringify(hiddenAyahIds)}); true;`,
      );
    }
  }, [hiddenAyahIds]);

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

  const syncTopicBands = useCallback(() => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'mushaf-page-parent', topicBands },
        '*',
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.applyTopicBands?.(${JSON.stringify(topicBands)}); true;`,
      );
    }
  }, [topicBands]);

  const syncOverlays = useCallback(() => {
    syncSelectedElement();
    syncRecitationAyah();
    syncRecitationWord();
    syncRecitationFocus();
    syncHiddenAyahs();
    syncHighlights(highlightEntries);
    syncTopicBands();
  }, [
    highlightEntries,
    syncHighlights,
    syncRecitationAyah,
    syncRecitationFocus,
    syncRecitationWord,
    syncHiddenAyahs,
    syncSelectedElement,
    syncTopicBands,
  ]);

  useEffect(() => {
    syncHighlights(highlightEntries);
  }, [highlightEntries, syncHighlights]);

  useEffect(syncTopicBands, [syncTopicBands]);

  useEffect(() => {
    syncHiddenAyahs();
  }, [hiddenAyahIds, syncHiddenAyahs]);

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
          friendlyError(error, 'تعذر قراءة التحديد.'),
        );
      }
    },
    [handleMessage, onInteractionError],
  );

  useEffect(syncSelectedElement, [syncSelectedElement]);

  useEffect(syncRecitationAyah, [syncRecitationAyah]);

  useEffect(syncRecitationWord, [syncRecitationWord]);

  useEffect(syncRecitationFocus, [syncRecitationFocus]);

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
        // The font files live in the app cache. The page is given a file base
        // address so the WebView may read them; nothing else is exposed.
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        allowingReadAccessToURL={Paths.cache.uri}
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
  fontSrc: string,
  basmalaFontSrc: string | null,
  fontsFromFile: boolean,
  fontSize: number,
  pageScale: number,
  markerScale: number,
  showTajweed: boolean,
  isDark: boolean,
): string {
  const sourceLineCount = Math.max(...page.lines.map((line) => line.lineNumber), 15);
  const rowOffset =
    page.pageNumber <= 2 ? getMushafPageCenteringOffset(page, sourceLineCount) : 0;
  const nameArtSurahs = new Set(
    (page.surahs ?? []).map((item) => item.surahNumber).filter((number) => SURAH_NAME_ART[number]),
  );
  const nameArtSymbols = [...nameArtSurahs]
    .map((number) => `<symbol id="sn-${number}" viewBox="${SURAH_NAME_ART[number][0]}">${SURAH_NAME_ART[number][1]}</symbol>`)
    .join('');
  const linesHtml = renderMushafLinesHtml(page, rowOffset, nameArtSurahs);
  const baseFontSize = Math.min(Math.round(fontSize * 1.5), 120);
  const zoom = Number.isFinite(pageScale) ? Math.min(1.6, Math.max(0.7, pageScale)) : 1;

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
  src: url("${fontSrc}") format("woff2");
  font-display: block;
}
${basmalaFontSrc ? `@font-face {
  font-family: "QcfBasmala";
  src: url("${basmalaFontSrc}") format("woff2");
  font-display: block;
}` : ''}
@font-palette-values --QcfLight {
  font-family: "QcfTajweedPage";
  base-palette: 0;
}
@font-palette-values --QcfDark {
  font-family: "QcfTajweedPage";
  base-palette: 1;
}
@font-palette-values --QcfBasmalaLight {
  font-family: "QcfBasmala";
  base-palette: 0;
}
@font-palette-values --QcfBasmalaDark {
  font-family: "QcfBasmala";
  base-palette: 1;
}
* {
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body {
  position: relative;
  touch-action: manipulation;
  background: ${isDark ? '#191309' : '#fffdf7'};
}
/* The gold mushaf frame is drawn by the app around this page. The page itself
   only carries the text; --zoom makes it smaller or larger than the screen
   and --pan-x/--pan-y move it when it is larger. */
.page {
  --zoom: ${zoom};
  --quran-font-size: ${baseFontSize}px;
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  width: calc(100% * var(--zoom));
  height: calc(100% * var(--zoom));
  max-width: calc(640px * var(--zoom));
  margin: 0;
  padding: 4px 6px;
  transform: translate(calc(-50% + var(--pan-x, 0px)), calc(-50% + var(--pan-y, 0px)));
  container-type: size;
  color: ${isDark ? '#f2ead8' : '#1e3026'};
  background: ${isDark ? '#191309' : '#fffdf7'};
  isolation: isolate;
  opacity: 0;
  touch-action: manipulation;
}
.page.is-ready {
  opacity: 1;
}
@supports (width: 1cqi) {
  .page {
    --line-row-height: calc((100cqb - 24px) / ${sourceLineCount});
    --quran-font-size: min(
      ${Math.round(baseFontSize * zoom)}px,
      calc(var(--line-row-height) * 1.02),
      17cqi
    );
  }
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
  opacity: 0.85;
}
/* A small ringed dot, drawn in CSS, replaces the old star-like glyph. */
.header-ornament, .page-num-bracket {
  position: relative;
  display: inline-block;
  flex: none;
  width: 9px;
  height: 9px;
  border: 1px solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
}
.header-ornament::after, .page-num-bracket::after {
  content: '';
  position: absolute;
  inset: 1.5px;
  border-radius: 50%;
  background: currentColor;
}
.lines {
  display: grid;
  position: relative;
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
  margin: 6px 0;
  min-height: 0;
}
.surah-title-container {
  display: block;
  width: 100%;
  position: relative;
  aspect-ratio: 8.7267 / 1;
  container-type: inline-size;
}
.st-art {
  position: absolute;
  inset: 0;
  background: url("${SURAH_HEADER_ART_URI}") center / 100% 100% no-repeat;
}
.st-name {
  position: absolute;
  left: 27.5%;
  width: 45%;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Naskh Arabic", serif;
  font-weight: 700;
  font-size: 6.6cqi;
  color: #1c1a10;
  white-space: nowrap;
  padding-bottom: 0.4cqi;
}
.st-glyph {
  width: 100%;
  height: 86%;
  fill: #1c1a10;
}
.st-med {
  position: absolute;
  top: 50%;
  width: 8.4cqi;
  height: 8.4cqi;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #1f8a45;
  box-shadow: 0 0 0 0.45cqi #fbf8ee, 0 0 0 0.65cqi #2a2a1e, 0 0 0 1cqi #c8a45c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: "Noto Naskh Arabic", serif;
  line-height: 1;
  z-index: 2;
}
.st-start { left: 21%; }
.st-end { left: 79%; }
.st-label { font-size: 2.3cqi; font-weight: 600; margin-bottom: 0.3cqi; }
.st-value { font-size: 3.2cqi; font-weight: 700; }
.opening-basmala {
  color: ${isDark ? '#f2ead8' : '#263a30'};
  font-family: "QcfTajweedPage";
  font-palette: ${isDark ? '--QcfDark' : '--QcfLight'};
  font-size: calc(var(--quran-rendered-font-size, var(--quran-font-size)) * 1.05);
  min-height: 0;
  padding: 14px 0 10px;
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
  font-palette: ${isDark ? '--QcfDark' : '--QcfLight'};
  font-size: var(--quran-rendered-font-size, var(--quran-font-size));
  line-height: 1.15;
  direction: rtl;
  white-space: nowrap;
  letter-spacing: 0;
  font-kerning: normal;
  font-variant-ligatures: contextual;
  text-rendering: geometricPrecision;
  unicode-bidi: isolate;
  ${showTajweed ? '' : 'filter: grayscale(1);'}
}
.ayah-marker {
  min-width: 1em;
  min-height: 1em;
  color: ${isDark ? '#e3d5ab' : '#514327'};
  font-family: "QcfTajweedPage";
  font-palette: ${isDark ? '--QcfDark' : '--QcfLight'};
  font-size: ${0.88 * markerScale}em;
  line-height: inherit;
  vertical-align: baseline;
}
.basmala-word {
  font-family: "QcfBasmala";
  font-palette: ${isDark ? '--QcfBasmalaDark' : '--QcfBasmalaLight'};
  font-size: inherit;
  line-height: 1.2;
}
.rub-marker { font-size: ${markerScale}em; }
.selected {
  border-radius: 4px;
  background: ${isDark ? 'rgba(217, 169, 74, 0.22)' : 'rgba(86, 125, 78, 0.2)'};
  box-shadow: 0 0 0 1.5px ${isDark ? 'rgba(217, 169, 74, 0.9)' : 'rgba(75, 110, 67, 0.7)'};
  outline: none;
}
.tasmi3-hidden {
  filter: blur(9px);
  user-select: none;
}
body.tasmi3-hidden-page .word,
body.tasmi3-hidden-page .ayah-marker,
body.tasmi3-hidden-page .basmala-word,
body.tasmi3-hidden-page .st-name {
  filter: blur(9px);
  user-select: none;
}
/* The ayah selection is drawn as an overlay box, never as a class on the
   words themselves: the frame then reads as one continuous rectangle around a
   whole ayah (or a run of ayahs) instead of a per-word highlight. */
#selection-layer,
#recitation-layer,
#recitation-word-layer,
#highlight-layer,
#topic-band-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
}
.selection-box,
.recitation-box {
  position: absolute;
  border-radius: 10px;
}
.selection-box {
  border: 1.5px solid ${isDark ? 'rgba(122, 180, 235, 0.82)' : 'rgba(41, 98, 158, 0.62)'};
  background: ${isDark ? 'rgba(122, 180, 235, 0.10)' : 'rgba(41, 98, 158, 0.06)'};
}
#topic-band-layer { z-index: 0; }
#highlight-layer { z-index: 0; }
.ayah-highlight-box {
  position: absolute;
  border-radius: 3px;
  background: var(--ayah-highlight-color);
}
/* One band per thematic section on the page, each its own colour, so the run of
   ayahs that belong together reads as one block at a glance. */
.topic-band-box {
  position: absolute;
  border-radius: 4px;
  background: var(--topic-band-color);
}
/* The reciting ayah is only tinted, never framed: a second outline around it
   competed with the box travelling over the word, so the reader now just sees
   which ayah is sounding through a very light wash behind its words. */
.recitation-box {
  border: 0;
  background: ${isDark ? 'rgba(122, 180, 235, 0.10)' : 'rgba(41, 98, 158, 0.06)'};
}
/* The word being recited. It is one persistent box whose geometry is updated
   in place, so the browser can ease it from word to word instead of showing a
   box that blinks on and off at each new word. */
.recitation-word-box {
  position: absolute;
  /* A soft capsule with no outline: the mark reads as light falling on the
     word rather than a rectangle drawn around it. */
  border-radius: 999px;
  background: ${isDark ? 'rgba(122, 180, 235, 0.5)' : 'rgba(41, 98, 158, 0.32)'};
  box-shadow: 0 2px 12px ${isDark ? 'rgba(122, 180, 235, 0.36)' : 'rgba(41, 98, 158, 0.3)'};
  opacity: 0;
  transition:
    left 130ms ease,
    top 130ms ease,
    width 130ms ease,
    height 130ms ease,
    opacity 170ms ease;
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
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${nameArtSymbols}</svg>
<main class="page" aria-label="صفحة المصحف">
  <header class="page-header">
    <span class="header-label" id="header-surah-label">${surahHeaderLabel}</span>
    <span class="header-ornament" aria-hidden="true"></span>
    <span class="header-label" id="header-juz-label">${juzHeaderLabel}</span>
  </header>
  <section class="lines" id="mushaf-lines">${linesHtml}<div id="topic-band-layer"></div><div id="highlight-layer"></div><div id="selection-layer"></div><div id="recitation-layer"></div><div id="recitation-word-layer"></div></section>
  <footer class="page-footer">
    <div class="page-number-ornament">
      <span class="page-num-bracket" aria-hidden="true"></span>
      <span class="page-number" id="page-number">${pageNumberString}</span>
      <span class="page-num-bracket" aria-hidden="true"></span>
    </div>
  </footer>
</main>
<script>
const linesElement = document.getElementById("mushaf-lines");
const pageElement = document.querySelector(".page");

document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("selectstart", (event) => event.preventDefault());

const SELECTION_BOX_PADDING = 2;

/** Smallest rectangle that contains every given element, in viewport pixels. */
function unionRect(elements) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return;
    if (rect.left < left) left = rect.left;
    if (rect.top < top) top = rect.top;
    if (rect.right > right) right = rect.right;
    if (rect.bottom > bottom) bottom = rect.bottom;
  });
  if (!Number.isFinite(left) || right <= left || bottom <= top) return null;
  return { left: left, top: top, width: right - left, height: bottom - top };
}

/**
 * Ids of the elements currently selected, kept so the frames can be redrawn
 * whenever the page is re-fitted (font load, rotation, split screen).
 */
let selectedIds = [];

/**
 * True while a recitation is running. The reader's own frames are then held
 * back so the only box on the page is the one travelling with the reciting
 * ayah, which is what makes the recitation readable without any chrome.
 */
let recitationFocus = false;

/**
 * Frames to draw for a set of ayah ids, one rectangle per printed line.
 *
 * The words of one ayah are grouped by the line they were printed on, so an
 * ayah that runs over more than one line is boxed line by line. A single
 * rectangle around the whole ayah would be tall enough to swallow the ayahs
 * printed beside it on the lines it crosses.
 */
function ayahFrameRects(ids) {
  const byLine = new Map();
  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element || !element.classList.contains("ayah-marker")) continue;
    const members = document.querySelectorAll(
      '[data-surah="' + element.dataset.surah + '"][data-ayah="' + element.dataset.ayah + '"]',
    );
    members.forEach((member) => {
      const line = member.closest(".line");
      if (!line) return;
      if (!byLine.has(line)) byLine.set(line, []);
      byLine.get(line).push(member);
    });
  }
  const rects = [];
  for (const members of byLine.values()) {
    const rect = unionRect(members);
    if (rect) rects.push(rect);
  }
  return rects;
}

/** Paints the given rectangles onto an overlay layer, replacing its content. */
function renderFrameBoxes(layer, rects, className) {
  if (!layer) return;
  layer.innerHTML = "";
  if (rects.length === 0) return;
  const layerRect = layer.getBoundingClientRect();
  for (const rect of rects) {
    const box = document.createElement("div");
    box.className = className;
    box.style.left = rect.left - layerRect.left - SELECTION_BOX_PADDING + "px";
    box.style.top = rect.top - layerRect.top - SELECTION_BOX_PADDING + "px";
    box.style.width = rect.width + SELECTION_BOX_PADDING * 2 + "px";
    box.style.height = rect.height + SELECTION_BOX_PADDING * 2 + "px";
    layer.appendChild(box);
  }
}

function renderAyahHighlightBoxes(entries) {
  const layer = document.getElementById("highlight-layer");
  if (!layer) return;
  layer.innerHTML = "";
  const layerRect = layer.getBoundingClientRect();
  for (const entry of entries) {
    for (const rect of ayahFrameRects([entry.id])) {
      const box = document.createElement("div");
      box.className = "ayah-highlight-box";
      box.style.setProperty("--ayah-highlight-color", entry.color);
      box.style.left = rect.left - layerRect.left + "px";
      box.style.top = rect.top - layerRect.top + "px";
      box.style.width = rect.width + "px";
      box.style.height = rect.height + "px";
      layer.appendChild(box);
    }
  }
}

/**
 * Applies the current selection to the page.
 *
 * A word keeps an inline outline. An ayah — or a run of ayahs — is drawn as a
 * frame on the overlay layer instead of outlining every word, so the selection
 * reads as a box around the ayah rather than a highlight smeared over its text.
 */
function selectMushafElements(ids) {
  selectedIds = Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  document.querySelectorAll(".selected").forEach((element) => {
    element.classList.remove("selected");
  });
  const ayahIds = [];
  // While the recitation runs the selection is kept but never painted: the
  // page shows the reciting ayah's frame alone, so nothing competes with it.
  if (!recitationFocus) {
    for (const id of selectedIds) {
      const element = document.getElementById(id);
      if (!element) continue;
      if (element.classList.contains("ayah-marker")) {
        ayahIds.push(id);
      } else {
        element.classList.add("selected");
      }
    }
  }
  renderFrameBoxes(
    document.getElementById("selection-layer"),
    recitationFocus ? [] : ayahFrameRects(ayahIds),
    "selection-box",
  );
}
window.selectMushafElements = selectMushafElements;

/** Turns the recitation focus on or off and repaints the frames accordingly. */
function setRecitationFocus(value) {
  recitationFocus = value === true;
  selectMushafElements(selectedIds);
}
window.setRecitationFocus = setRecitationFocus;

/**
 * Frame for the ayah being recited right now, drawn on its own layer so it is
 * kept apart from the reader's selection and never opens the word/ayah tools.
 */
let recitationAyahId = null;

function selectRecitationAyah(id) {
  recitationAyahId = typeof id === "string" ? id : null;
  renderFrameBoxes(
    document.getElementById("recitation-layer"),
    recitationAyahId ? ayahFrameRects([recitationAyahId]) : [],
    "recitation-box",
  );
}
window.selectRecitationAyah = selectRecitationAyah;

/**
 * Word being recited right now, painted as one persistent box.
 *
 * The box is created once and then moved by updating its geometry, so its CSS
 * transition can carry it from one word to the next instead of drawing a fresh
 * element that would appear already in place.
 */
let recitationWordId = null;

function selectRecitationWord(id) {
  recitationWordId = typeof id === "string" ? id : null;
  const layer = document.getElementById("recitation-word-layer");
  if (!layer) return;
  let box = layer.firstElementChild;
  if (!box) {
    box = document.createElement("div");
    box.className = "recitation-word-box";
    layer.appendChild(box);
  }
  const element = recitationWordId ? document.getElementById(recitationWordId) : null;
  if (!element) {
    box.style.opacity = "0";
    return;
  }
  const rect = element.getBoundingClientRect();
  const layerRect = layer.getBoundingClientRect();
  box.style.left = rect.left - layerRect.left - SELECTION_BOX_PADDING + "px";
  box.style.top = rect.top - layerRect.top - SELECTION_BOX_PADDING + "px";
  box.style.width = rect.width + SELECTION_BOX_PADDING * 2 + "px";
  box.style.height = rect.height + SELECTION_BOX_PADDING * 2 + "px";
  box.style.opacity = "1";
}
window.selectRecitationWord = selectRecitationWord;

function setTasmi3Hidden(ids) {
  const hidden = new Set(Array.isArray(ids) ? ids : []);
  document.body.classList.toggle("tasmi3-hidden-page", hidden.has("*"));
  document.querySelectorAll("[data-surah][data-ayah]").forEach((element) => {
    const id = "ayah-" + element.dataset.surah + "-" + element.dataset.ayah;
    element.classList.toggle("tasmi3-hidden", hidden.has(id));
  });
}
window.setTasmi3Hidden = setTasmi3Hidden;

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
  if (!entries || typeof entries !== "object") {
    renderAyahHighlightBoxes([]);
    return;
  }
  const ayahHighlights = [];
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
    if (entry.ayahBg && element.classList.contains("ayah-marker")) {
      ayahHighlights.push({ id: id, color: entry.ayahBg });
    }
  }
  renderAyahHighlightBoxes(ayahHighlights);
}
window.applyMushafHighlights = applyMushafHighlights;

/**
 * Coloured bands grouping the ayahs of the page by thematic section.
 *
 * Kept on their own layer and applied as an overlay, exactly like the saved
 * highlights: the page document never changes, so a neighbour page stays
 * byte-identical when the bands are turned on or off.
 */
let topicBands = [];

function renderTopicBandBoxes(bands) {
  const layer = document.getElementById("topic-band-layer");
  if (!layer) return;
  layer.innerHTML = "";
  const layerRect = layer.getBoundingClientRect();
  for (const band of bands) {
    if (!band || !Array.isArray(band.ayahIds)) continue;
    for (const rect of ayahFrameRects(band.ayahIds)) {
      const box = document.createElement("div");
      box.className = "topic-band-box";
      box.style.setProperty("--topic-band-color", band.color);
      box.style.left = rect.left - layerRect.left + "px";
      box.style.top = rect.top - layerRect.top + "px";
      box.style.width = rect.width + "px";
      box.style.height = rect.height + "px";
      layer.appendChild(box);
    }
  }
}

function applyTopicBands(bands) {
  topicBands = Array.isArray(bands) ? bands : [];
  renderTopicBandBoxes(topicBands);
}
window.applyTopicBands = applyTopicBands;

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
  // The frames are measured against the final metrics of the page, so they are
  // redrawn once the fit has settled instead of tracking the intermediate ones.
  selectMushafElements(selectedIds);
  selectRecitationAyah(recitationAyahId);
  selectRecitationWord(recitationWordId);
  renderTopicBandBoxes(topicBands);
  signalPageReady();
}

const FONTS_FROM_FILE = ${fontsFromFile ? 'true' : 'false'};

/** True when a font face of this page could not be loaded. */
function fontFaceFailed() {
  let failed = false;
  if (document.fonts && document.fonts.forEach) {
    document.fonts.forEach((face) => {
      if (face.status === "error") failed = true;
    });
  }
  return failed;
}

/**
 * Fonts are read from files in the app cache. If this phone's WebView refuses
 * that, the host rebuilds the page with the font inside the HTML instead.
 */
function reportFontFileFailure() {
  if (FONTS_FROM_FILE) postPageMessage({ type: "font-failed" });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (fontFaceFailed()) reportFontFileFailure();
    preparePage();
  });
  // Font loading can stall; the page must never stay hidden.
  setTimeout(() => {
    if (!pageReadySignalled) {
      reportFontFileFailure();
      preparePage();
    }
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
    selectMushafElements(selectedIds);
    selectRecitationAyah(recitationAyahId);
    selectRecitationWord(recitationWordId);
    renderTopicBandBoxes(topicBands);
    if (pageElement) pageElement.classList.add("is-ready");
  });
});

let pointerStart = null;
let isPanning = false;
let lastPostedDx = 0;
let longPressTimer = null;
let longPressTriggered = false;
// A pointer that travelled across the page must not be reported as a tap: a
// swipe that ends on a word would otherwise open the word toolbar a moment
// after the page had already been turned, which the reader never asked for.
const TAP_SLOP_PX = 8;
let gestureTravel = 0;
let swallowClick = false;

// Every message crosses the native bridge, so sub-pixel pointer noise is
// dropped: only a meaningful horizontal change is relayed to the host.
const PAN_UPDATE_THRESHOLD_PX = 2;

// Reader zoom above 1 makes the page larger than the screen. One finger then
// drags the page around, and only a drag that pushes past its edge turns the
// page, so zooming never takes the swipe away.
const ZOOM = ${zoom};
let panX = 0;
let panY = 0;
let lastPointerX = 0;
let lastPointerY = 0;
let edgeOverflowX = 0;

function panLimits() {
  if (ZOOM <= 1.001) return { x: 0, y: 0 };
  return {
    x: Math.max(0, (pageElement.offsetWidth - window.innerWidth) / 2),
    y: Math.max(0, (pageElement.offsetHeight - window.innerHeight) / 2),
  };
}

function applyPan() {
  pageElement.style.setProperty("--pan-x", panX + "px");
  pageElement.style.setProperty("--pan-y", panY + "px");
}

/** Moves the zoomed page by one pointer step and returns the horizontal part that went past the edge. */
function dragZoomedPage(stepX, stepY) {
  const limits = panLimits();
  const nextX = Math.min(limits.x, Math.max(-limits.x, panX + stepX));
  const nextY = Math.min(limits.y, Math.max(-limits.y, panY + stepY));
  const overflow = stepX - (nextX - panX);
  panX = nextX;
  panY = nextY;
  applyPan();
  return overflow;
}

document.body.addEventListener("pointerdown", (event) => {
  swallowClick = false;
  gestureTravel = 0;
  const button = event.target.closest("button[data-kind]");
  if (event.button !== 0) {
    pointerStart = null;
    isPanning = false;
    return;
  }
  if (button && !recitationFocus) {
    longPressTriggered = false;
    longPressTimer = window.setTimeout(() => {
      longPressTriggered = true;
      emitSelection(button, "longPress");
    }, 500);
  }
  document.body.setPointerCapture(event.pointerId);
  pointerStart = { x: event.clientX, y: event.clientY, time: Date.now() };
  isPanning = false;
  lastPostedDx = 0;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  edgeOverflowX = 0;
});

document.body.addEventListener("pointermove", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  gestureTravel = Math.max(gestureTravel, Math.abs(dx), Math.abs(dy));
  if (gestureTravel > TAP_SLOP_PX && longPressTimer !== null) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  const stepX = event.clientX - lastPointerX;
  const stepY = event.clientY - lastPointerY;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  const limits = panLimits();
  if (!isPanning && (limits.x > 0 || limits.y > 0)) {
    if (gestureTravel <= TAP_SLOP_PX) return;
    const overflow = dragZoomedPage(stepX, stepY);
    edgeOverflowX = overflow === 0 && stepX !== 0 ? 0 : edgeOverflowX + overflow;
    if (Math.abs(edgeOverflowX) > 14 && Math.abs(edgeOverflowX) > Math.abs(dy) * 0.6) {
      // Past the edge of the zoomed page: from here the drag turns the page.
      isPanning = true;
      pointerStart.x = event.clientX - edgeOverflowX;
      lastPostedDx = edgeOverflowX;
      postPageMessage({ type: "pan-start", x: event.clientX, y: event.clientY });
      postPageMessage({ type: "pan-update", dx: edgeOverflowX, dy: 0 });
    }
    return;
  }
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

document.body.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  const dt = Math.max(1, Date.now() - pointerStart.time);
  const vx = (dx / dt) * 1000;
  const wasPanning = isPanning;
  if (longPressTimer !== null) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  pointerStart = null;
  isPanning = false;
  swallowClick = gestureTravel > TAP_SLOP_PX || longPressTriggered;
  if (wasPanning) {
    postPageMessage({ type: "pan-end", dx: dx, vx: vx });
  }
});

document.body.addEventListener("pointercancel", () => {
  if (longPressTimer !== null) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  if (isPanning) {
    postPageMessage({ type: "pan-cancel" });
  }
  swallowClick = gestureTravel > TAP_SLOP_PX;
  pointerStart = null;
  isPanning = false;
});

document.addEventListener("click", (event) => {
  if (swallowClick) {
    swallowClick = false;
    return;
  }
  // While the recitation runs the page is in focus mode: a tap never changes
  // the selection, so the only frame in view stays the one following the
  // reciter. The tap is still reported as a background tap, which the host uses
  // to hide or reveal the mini player so the reader can see the verse beneath it.
  if (recitationFocus) {
    postPageMessage({ type: "background" });
    return;
  }
  const button = event.target.closest("button[data-kind]");
  if (!button) {
    // Nothing on the page was hit: the reader is dismissing the open tools. It
    // has to be reported from inside the page, because a dismiss layer drawn
    // over the page in the host would swallow the taps meant for other ayahs.
    postPageMessage({ type: "background" });
    return;
  }
  emitSelection(button, "tap");
});

function emitSelection(button, gesture) {
  const rect = button.getBoundingClientRect();
  postPageMessage({
    type: button.dataset.kind,
    surahNumber: Number(button.dataset.surah),
    ayahNumber: Number(button.dataset.ayah),
    wordId: button.dataset.wordId,
    gesture: gesture,
    rect: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  });
}

window.addEventListener("message", (event) => {
  if (event.data && event.data.source === "mushaf-page-parent") {
    if (event.data.selectedElementIds !== undefined) {
      selectMushafElements(event.data.selectedElementIds);
    }
    if (event.data.activeAyahId !== undefined) {
      selectRecitationAyah(event.data.activeAyahId);
    }
    if (event.data.activeWordId !== undefined) {
      selectRecitationWord(event.data.activeWordId);
    }
    if (event.data.recitationFocus !== undefined) {
      setRecitationFocus(event.data.recitationFocus);
    }
    if (event.data.hiddenAyahIds !== undefined) {
      setTasmi3Hidden(event.data.hiddenAyahIds);
    }
    if (event.data.highlights !== undefined) {
      applyMushafHighlights(event.data.highlights);
    }
    if (event.data.topicBands !== undefined) {
      applyTopicBands(event.data.topicBands);
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
  if (value.type === 'ready' || value.type === 'font-failed') {
    return true;
  }
  if (value.type === 'background') {
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

/** Stable empty list so a page with no bands never re-renders on a new array. */
const NO_TOPIC_BANDS: TopicBand[] = [];

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
