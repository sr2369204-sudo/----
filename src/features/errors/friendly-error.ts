/**
 * Turns any thrown value into a plain Arabic sentence a normal user can read.
 * Technical text such as "fetch failed" or "Network request failed" is never
 * shown: network problems get one clear message, messages the app wrote itself
 * (Arabic) pass through, and everything else uses the caller's fallback.
 */
export const NETWORK_ERROR_MESSAGE = 'تعذر الاتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى.';

const NETWORK_PATTERN =
  /fetch failed|network request failed|network error|failed to fetch|timed? ?out|timeout|aborted|ENOTFOUND|ECONN|EAI_AGAIN|offline|unable to resolve host|could not be reached|socket|SSL|certificate/i;

const SERVER_PATTERN = /HTTP \d{3}|quran\.com|mp3quran|status code|invalid|server/i;
export const SERVER_ERROR_MESSAGE = 'المصدر لا يستجيب الآن. حاول مرة أخرى بعد قليل.';

const ARABIC_LETTER = /[\u0621-\u064A]/;
const LATIN_LETTER = /[A-Za-z]/;

export function friendlyError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (
    (error instanceof Error && 'reason' in error && (error as { reason?: unknown }).reason === 'network') ||
    NETWORK_PATTERN.test(message)
  ) {
    return ARABIC_LETTER.test(message) && !LATIN_LETTER.test(message) ? message : NETWORK_ERROR_MESSAGE;
  }
  if (SERVER_PATTERN.test(message) && !ARABIC_LETTER.test(message)) {
    return SERVER_ERROR_MESSAGE;
  }
  // Messages the app wrote itself are Arabic with no English technical words.
  if (ARABIC_LETTER.test(message) && !LATIN_LETTER.test(message)) {
    return message;
  }
  return fallback;
}
