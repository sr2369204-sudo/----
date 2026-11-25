import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * A khatma (one full reading of the Mushaf) with a goal in days. The reader
 * marks the page they reached with the "reached here" button in the reader,
 * and everything before it counts as read. Everything stays on the phone.
 */
export const KHATMA_KEY = 'khatma.plan';
const FORMAT = 'mushaf-khatma';
export const MUSHAF_PAGES = 604;
export const KHATMA_PRESETS = [7, 10, 15, 30, 60] as const;

export type KhatmaKind = 'reading' | 'memorization' | 'review';

/** Wording for each kind of khatma. */
export const KHATMA_KIND_TEXT: Record<
  KhatmaKind,
  {
    title: string;
    chip: string;
    markLabel: string;
    reachedVerb: string;
    headline: (page: string) => string;
  }
> = {
  reading: {
    title: 'ختمة قراءة',
    chip: 'قراءة',
    markLabel: 'وصلت هنا (الختمة)',
    reachedVerb: 'وصلت',
    headline: (page) => `بارك الله فيك، وصلت صفحة ${page}`,
  },
  memorization: {
    title: 'ختمة حفظ',
    chip: 'حفظ',
    markLabel: 'حفظت لهنا (الختمة)',
    reachedVerb: 'حفظت',
    headline: (page) => `ما شاء الله، حفظت لحد صفحة ${page}`,
  },
  review: {
    title: 'ختمة مراجعة',
    chip: 'مراجعة',
    markLabel: 'راجعت لهنا (الختمة)',
    reachedVerb: 'راجعت',
    headline: (page) => `بارك الله فيك، راجعت لحد صفحة ${page}`,
  },
};

export type Khatma = {
  kind: KhatmaKind;
  startDate: string;
  targetDays: number;
  /** Mushaf page where the khatma starts, e.g. 2 for Al-Baqarah. It wraps past page 604 back to 1. */
  startPage: number;
  /** Last Mushaf page of the khatma. 604 for a full khatma. */
  endPage: number;
  /** Pages done so far counted from `startPage`, 0..total. */
  done: number;
  /** Day the `todayBase` below belongs to. */
  todayDate: string;
  /** `done` when `todayDate` began. */
  todayBase: number;
  /** Finished khatmas so far. */
  completed: number;
};

export type KhatmaStatus = {
  /** Pages in this khatma. */
  total: number;
  done: number;
  remaining: number;
  percent: number;
  daysElapsed: number;
  daysLeft: number;
  /** Pages to read each day from now to finish on time. */
  perDay: number;
  todayDone: number;
  todayLeft: number;
  /** Pages the plan expected by the end of today, minus pages done. Negative means ahead. */
  behindBy: number;
  finished: boolean;
  /** Mushaf page to continue from. */
  nextPage: number;
  /** Last Mushaf page reached, null before the first mark. */
  reachedPage: number | null;
};

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clampDone(value: number): number {
  return Math.max(0, Math.min(MUSHAF_PAGES, Math.round(value)));
}

function clampPage(value: number): number {
  return Math.max(1, Math.min(MUSHAF_PAGES, Math.round(value)));
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}

/** How many pages are done once `page` is reached, counting from `startPage` and wrapping. */
export function pageToDone(startPage: number, page: number): number {
  return ((((page - startPage) % MUSHAF_PAGES) + MUSHAF_PAGES) % MUSHAF_PAGES) + 1;
}

/** The Mushaf page that is `done` pages after the start (done >= 1). */
export function doneToPage(startPage: number, done: number): number {
  return ((startPage - 1 + done - 1) % MUSHAF_PAGES) + 1;
}

/** True when `page` is already inside the part of the khatma that is done. */
export function khatmaCoversPage(khatma: Khatma, page: number): boolean {
  const target = pageToDone(khatma.startPage, page);
  return target <= khatmaTotal(khatma) && khatma.done >= target;
}

/** Pages in the khatma. A range that ends before it starts wraps past page 604. */
export function khatmaTotal(khatma: Pick<Khatma, 'startPage' | 'endPage'>): number {
  return pageToDone(khatma.startPage, khatma.endPage);
}

/** Page where each juz (1..30) starts on the Madani Mushaf. Some juz begin mid-page (7, 11, 26); the page they begin on is listed. */
export const JUZ_START_PAGES: readonly number[] = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442,
  462, 482, 502, 522, 542, 562, 582,
];

export function juzRange(juz: number): { startPage: number; endPage: number } {
  const startPage = JUZ_START_PAGES[juz - 1] ?? 1;
  const next = JUZ_START_PAGES[juz];
  return { startPage, endPage: next === undefined ? MUSHAF_PAGES : next - 1 };
}

export function startKhatma(
  today: string,
  targetDays: number,
  options: {
    kind?: KhatmaKind;
    startPage?: number;
    endPage?: number;
    done?: number;
    completed?: number;
  } = {},
): Khatma {
  const startPage = clampPage(options.startPage ?? 1);
  const endPage = clampPage(options.endPage ?? MUSHAF_PAGES);
  const done = Math.min(clampDone(options.done ?? 0), khatmaTotal({ startPage, endPage }));
  return {
    kind: options.kind ?? 'reading',
    startDate: today,
    targetDays: Math.max(1, Math.min(365, Math.round(targetDays))),
    startPage,
    endPage,
    done,
    todayDate: today,
    todayBase: done,
    completed: options.completed ?? 0,
  };
}

export function parseKhatma(value: string | null): Khatma | null {
  if (value === null) {
    return null;
  }
  try {
    const p = JSON.parse(value) as Partial<Khatma> & { reachedPage?: number };
    if (!isDateKey(p.startDate) || !Number.isInteger(p.targetDays) || (p.targetDays as number) < 1) {
      return null;
    }
    // Version 2 stored the page reached; with the start at page 1 that is the same number.
    const rawDone = Number.isInteger(p.done) ? p.done : p.reachedPage;
    const kind: KhatmaKind = p.kind === 'memorization' || p.kind === 'review' ? p.kind : 'reading';
    const startPage = Number.isInteger(p.startPage) ? clampPage(p.startPage as number) : 1;
    const endPage = Number.isInteger(p.endPage) ? clampPage(p.endPage as number) : MUSHAF_PAGES;
    const total = khatmaTotal({ startPage, endPage });
    const done = Math.min(Number.isInteger(rawDone) ? clampDone(rawDone as number) : 0, total);
    return {
      kind,
      startDate: p.startDate,
      targetDays: p.targetDays as number,
      startPage,
      endPage,
      done,
      todayDate: isDateKey(p.todayDate) ? p.todayDate : p.startDate,
      todayBase: Number.isInteger(p.todayBase) ? Math.min(clampDone(p.todayBase as number), done) : 0,
      completed: Number.isInteger(p.completed) && (p.completed as number) >= 0 ? (p.completed as number) : 0,
    };
  } catch {
    return null;
  }
}

export function serializeKhatma(khatma: Khatma): string {
  return JSON.stringify({ format: FORMAT, version: 4, ...khatma });
}

/** Rolls the "start of today" marker forward when a new day began. */
function rollDay(khatma: Khatma, today: string): Khatma {
  return khatma.todayDate === today ? khatma : { ...khatma, todayDate: today, todayBase: khatma.done };
}

export type ReachResult =
  | { kind: 'advanced'; khatma: Khatma; from: number; to: number; page: number }
  | { kind: 'unchanged'; khatma: Khatma; reason: 'same' | 'earlier' | 'outside' };

/**
 * The reader taps "reached here" on a Mushaf page. Everything from the start
 * up to that page counts as done. A later page moves the mark forward. The
 * same page or an earlier one changes nothing, so progress is never lost by
 * accident, and neither does a page outside the khatma's range. `from` and
 * `to` are page counts, `page` is the Mushaf page now reached.
 */
export function markReached(khatma: Khatma, pageNumber: number, today: string): ReachResult {
  const rolled = rollDay(khatma, today);
  const target = pageToDone(rolled.startPage, clampPage(pageNumber));
  if (target > khatmaTotal(rolled)) {
    return { kind: 'unchanged', khatma: rolled, reason: 'outside' };
  }
  if (target > rolled.done) {
    return {
      kind: 'advanced',
      khatma: { ...rolled, done: target },
      from: rolled.done,
      to: target,
      page: clampPage(pageNumber),
    };
  }
  return { kind: 'unchanged', khatma: rolled, reason: target === rolled.done ? 'same' : 'earlier' };
}

export function khatmaStatus(khatma: Khatma, today: string): KhatmaStatus {
  const rolled = rollDay(khatma, today);
  const done = rolled.done;
  const total = khatmaTotal(rolled);
  const remaining = total - done;
  const daysElapsed = Math.max(0, daysBetween(khatma.startDate, today));
  // Day 1 is the start day: with a 30-day goal the last day is day 30.
  const daysLeft = Math.max(1, khatma.targetDays - daysElapsed);
  const todayDone = Math.max(0, done - rolled.todayBase);
  // Today's share: what was left this morning spread over the days left.
  const perDay = Math.ceil((remaining + todayDone) / daysLeft);
  const expectedByToday = Math.min(
    total,
    Math.ceil((total * Math.min(khatma.targetDays, daysElapsed + 1)) / khatma.targetDays),
  );
  return {
    total,
    done,
    remaining,
    percent: Math.round((done / total) * 100),
    daysElapsed,
    daysLeft,
    perDay,
    todayDone,
    todayLeft: Math.max(0, perDay - todayDone),
    behindBy: expectedByToday - done,
    finished: remaining === 0,
    nextPage: doneToPage(rolled.startPage, Math.min(total, done + 1)),
    reachedPage: done > 0 ? doneToPage(rolled.startPage, done) : null,
  };
}

export async function loadKhatma(database: SQLiteDatabase): Promise<Khatma | null> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    KHATMA_KEY,
  );
  return parseKhatma(row?.value ?? null);
}

export async function saveKhatma(database: SQLiteDatabase, khatma: Khatma | null): Promise<void> {
  if (khatma === null) {
    await database.runAsync('DELETE FROM app_settings WHERE key = ?', KHATMA_KEY);
    return;
  }
  await database.runAsync(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    KHATMA_KEY,
    serializeKhatma(khatma),
    new Date().toISOString(),
  );
}

/** Marks the page reached in the saved khatma. Returns null when none is running. */
export async function markKhatmaReached(
  database: SQLiteDatabase,
  pageNumber: number,
  today: string,
): Promise<ReachResult | null> {
  const current = await loadKhatma(database);
  if (current === null) {
    return null;
  }
  const result = markReached(current, pageNumber, today);
  await saveKhatma(database, result.khatma);
  return result;
}

/** After a finished khatma: count it and start a new one with the same goal. */
export function restartKhatma(khatma: Khatma, today: string): Khatma {
  const finished = khatma.done >= khatmaTotal(khatma) ? 1 : 0;
  return startKhatma(today, khatma.targetDays, {
    kind: khatma.kind,
    startPage: khatma.startPage,
    endPage: khatma.endPage,
    completed: khatma.completed + finished,
  });
}
