/**
 * Spaced repetition scheduler (an SM-2 style algorithm, the family Anki uses).
 *
 * Each card has an interval in days and an "ease" multiplier. A correct answer
 * pushes the next review further out; a miss brings the card back the next day
 * and makes it grow more slowly afterwards. Everything is day-based: a card is
 * due on a calendar date, not at a time of day.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface Schedule {
  /** Local calendar day the card is next due, YYYY-MM-DD. */
  due: string;
  /** Days between the last review and `due`. 0 = not yet learned. */
  interval: number;
  /** Growth multiplier, 1.3 – 3.0. */
  ease: number;
  /** Successful reviews in a row. */
  reps: number;
  /** Times the card was forgotten after being learned. */
  lapses: number;
}

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export const newSchedule = (due: string): Schedule => ({ due, interval: 0, ease: 2.5, reps: 0, lapses: 0 });

const clampEase = (e: number) => Math.min(3, Math.max(1.3, +e.toFixed(2)));

/** The schedule after answering a card on day `today`. Pure. */
export function review(s: Schedule, grade: Grade, today = dayKey()): Schedule {
  if (grade === 'again') {
    return { due: addDays(today, 1), interval: 1, ease: clampEase(s.ease - 0.2), reps: 0, lapses: s.lapses + (s.reps > 0 ? 1 : 0) };
  }
  let interval: number;
  if (s.reps === 0) interval = grade === 'easy' ? 3 : 1;
  else if (s.reps === 1) interval = grade === 'hard' ? 2 : grade === 'easy' ? 5 : 3;
  else {
    const mult = grade === 'hard' ? 1.2 : grade === 'easy' ? s.ease * 1.3 : s.ease;
    interval = Math.max(s.interval + 1, Math.round(s.interval * mult));
  }
  interval = Math.min(interval, 180);
  const ease = clampEase(s.ease + (grade === 'hard' ? -0.15 : grade === 'easy' ? 0.15 : 0));
  return { due: addDays(today, interval), interval, ease, reps: s.reps + 1, lapses: s.lapses };
}

export const isDue = (s: Schedule, today = dayKey()) => s.due <= today;

/** "tomorrow", "in 3 days", "in 2 weeks" — for showing what a grade will do. */
export function inWords(days: number): string {
  if (days <= 1) return 'tomorrow';
  if (days < 14) return `in ${days} days`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}
