/**
 * Small timing log for the reader. It only measures: how long the reader takes
 * to show its first page and how long a page turn takes to land. Entries go to
 * the console (`[reader-perf]`) and the last ones are kept in memory so they can
 * be read back while debugging.
 */
export type ReaderPerfEntry = { label: string; ms: number; detail?: string; at: number };

const MAX_ENTRIES = 60;
const entries: ReaderPerfEntry[] = [];
const marks = new Map<string, number>();

function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export function perfStart(key: string): void {
  marks.set(key, now());
}

/** Records the time since `perfStart(key)` once; later calls for the same start are ignored. */
export function perfEnd(key: string, label: string, detail?: string): number | null {
  const start = marks.get(key);
  if (start === undefined) {
    return null;
  }
  marks.delete(key);
  const ms = Math.round(now() - start);
  entries.push({ label, ms, detail, at: Date.now() });
  if (entries.length > MAX_ENTRIES) {
    entries.shift();
  }
  console.log(`[reader-perf] ${label}: ${ms} ms${detail ? ` (${detail})` : ''}`);
  return ms;
}

export function getReaderPerfLog(): readonly ReaderPerfEntry[] {
  return entries;
}
