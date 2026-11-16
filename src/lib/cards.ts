/**
 * Flashcards are created from lessons you have finished, never from material
 * you haven't met. Each item gets cards that make you recall it in different
 * ways (recognise it, and produce it).
 */
import { LETTER_GROUPS, MARKS } from '../data/letters';
import { CORE } from '../data/core';
import { LESSON_MAP, PATH, unitKey, type Unit } from '../data/lessons';
import { db, setKV, type Card, type CardKind } from './db';
import { addDays, dayKey, newSchedule, review, type Grade } from './srs';

function cardsFor(u: Unit): { kind: CardKind; ref: string }[] {
  if (u.kind === 'letters') {
    const g = LETTER_GROUPS.find((x) => x.id === u.id)!;
    return g.letters.flatMap((ref) => [
      { kind: 'letter-read' as const, ref },
      { kind: 'letter-write' as const, ref },
    ]);
  }
  if (u.kind === 'marks') return MARKS.map((m) => ({ kind: 'mark-read' as const, ref: m.id }));
  return LESSON_MAP[u.id].phrases.flatMap((p) => [
    { kind: 'phrase-say' as const, ref: p.id },
    { kind: 'phrase-read' as const, ref: p.id },
  ]);
}

export const cardId = (kind: CardKind, ref: string) => `${kind}:${ref}`;

/** Add any missing cards for a finished unit, first due on `due`. */
async function addCards(u: Unit, due: string) {
  const want = cardsFor(u);
  const have = new Set((await db.cards.bulkGet(want.map((c) => cardId(c.kind, c.ref)))).filter(Boolean).map((c) => c!.id));
  const fresh: Card[] = want
    .filter((c) => !have.has(cardId(c.kind, c.ref)))
    .map((c) => ({ id: cardId(c.kind, c.ref), kind: c.kind, ref: c.ref, created: dayKey(), ...newSchedule(due) }));
  if (fresh.length) await db.cards.bulkAdd(fresh);
  return fresh.length;
}

/** How far through the core-vocabulary deck the learner is, and how many they met today. */
export async function coreStatus(): Promise<{ learned: number; today: number }> {
  const learned = Number((await db.kv.get('core:learned'))?.value ?? 0);
  const today = Number((await db.kv.get(`core:${dayKey()}`))?.value ?? 0);
  return { learned: Math.min(learned, CORE.length), today };
}

/** The next core words to teach, given a daily allowance. */
export function nextCoreWords(status: { learned: number; today: number }, perDay: number) {
  const n = Math.max(0, Math.min(perDay - status.today, CORE.length - status.learned));
  return CORE.slice(status.learned, status.learned + n);
}

/** Record that `count` more core words were learned and schedule their cards for tomorrow. */
export async function learnCoreWords(count: number) {
  const s = await coreStatus();
  const words = CORE.slice(s.learned, s.learned + count);
  if (!words.length) return;
  const due = addDays(dayKey(), 1);
  const fresh: Card[] = [];
  for (const p of words)
    for (const kind of ['phrase-say', 'phrase-read'] as const)
      if (!(await db.cards.get(cardId(kind, p.id)))) fresh.push({ id: cardId(kind, p.id), kind, ref: p.id, created: dayKey(), ...newSchedule(due) });
  if (fresh.length) await db.cards.bulkAdd(fresh);
  await setKV('core:learned', s.learned + words.length);
  await setKV(`core:${dayKey()}`, s.today + words.length);
}

/** Finish a unit: record it and schedule its cards to start tomorrow. */
export async function markDone(key: string) {
  const first = !(await db.kv.get(`done:${key}`));
  await setKV(`done:${key}`, new Date().toISOString());
  const u = PATH.find((x) => unitKey(x) === key);
  // You just practised these, so the first review is tomorrow.
  if (u && first) await addCards(u, addDays(dayKey(), 1));
}

/** Make sure every finished unit has its cards (covers lessons done before review existed). */
export async function syncCards() {
  const done = new Set((await db.kv.where('key').startsWith('done:').toArray()).map((r) => r.key.slice(5)));
  for (const u of PATH) if (done.has(unitKey(u))) await addCards(u, dayKey());
}

export async function gradeCard(card: Card, grade: Grade) {
  const today = dayKey();
  const next = review(card, grade, today);
  await db.cards.put({ ...card, ...next, last: today });
  const log = ((await db.kv.get(`day:${today}`))?.value as { reviews: number } | undefined) ?? { reviews: 0 };
  await setKV(`day:${today}`, { reviews: log.reviews + 1 });
  return next;
}

/** Roughly how long one card takes, in seconds. Writing is slowest. */
export const CARD_SECONDS: Record<CardKind, number> = { 'letter-read': 6, 'mark-read': 6, 'phrase-read': 10, 'phrase-say': 12, 'letter-write': 20 };

/** Minutes to learn one new core word. */
export const WORD_MINUTES = 0.5;

export interface Plan {
  minutes: number;
  /** Cards to review now, already ordered. */
  cards: Card[];
  reviewMinutes: number;
  dueTotal: number;
  /** New core words to learn today, if there's time. */
  words: number;
  /** A new lesson that fits in the remaining time. */
  unit?: Unit;
  unitMinutes: number;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  // Final avalanche so similar ids don't sort next to each other.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

const unitMinutes = (u: Unit) => (u.kind === 'lesson' ? LESSON_MAP[u.id].minutes : u.kind === 'marks' ? 5 : 12);

/**
 * Build today's session for a time budget. Reviews come first (forgetting is
 * the expensive thing), capped at about half the time when a new lesson is
 * waiting, so you keep moving forward too.
 */
export function buildPlan(minutes: number, due: Card[], nextUnit: Unit | undefined, today = dayKey(), newWords = 0): Plan {
  // Most overdue first, then mixed within the same day so kinds are interleaved.
  // The mix is a hash of the card and the date: stable all day (the home
  // screen and the session agree), different tomorrow.
  const ordered = [...due].map((c) => ({ c, r: hash(today + c.id) })).sort((a, b) => a.c.due.localeCompare(b.c.due) || a.r - b.r).map((x) => x.c);
  const wantsLesson = !!nextUnit && minutes >= 10;
  const budget = (wantsLesson ? minutes * 0.5 : minutes) * 60;
  const cards: Card[] = [];
  let used = 0;
  for (const c of ordered) {
    if (used + CARD_SECONDS[c.kind] > budget) break;
    cards.push(c);
    used += CARD_SECONDS[c.kind];
  }
  const reviewMinutes = Math.ceil(used / 60);
  let left = minutes - used / 60;
  // New words are quick (about half a minute each) and come before a lesson.
  const words = newWords > 0 && left >= 2 ? newWords : 0;
  left -= words * WORD_MINUTES;
  const fits = !!nextUnit && left >= unitMinutes(nextUnit) * 0.6;
  return { minutes, cards, reviewMinutes, dueTotal: due.length, words, unit: fits ? nextUnit : undefined, unitMinutes: nextUnit ? unitMinutes(nextUnit) : 0 };
}
