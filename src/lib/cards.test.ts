import { describe, expect, it } from 'vitest';
import type { Unit } from '../data/lessons';
import { buildPlan, CARD_SECONDS } from './cards';
import type { Card, CardKind } from './db';
import { newSchedule } from './srs';

const card = (i: number, kind: CardKind = 'letter-read', due = '2026-11-16'): Card => ({ id: `${kind}:${i}`, kind, ref: String(i), created: due, ...newSchedule(due) });
const lesson: Unit = { kind: 'lesson', id: 'polite' }; // 5 min
const letters: Unit = { kind: 'letters', id: 'g2' }; // ~12 min

describe('daily plan', () => {
  it('never schedules more review than the time allows', () => {
    const due = Array.from({ length: 200 }, (_, i) => card(i, 'letter-write'));
    for (const m of [5, 10, 20, 30]) {
      const p = buildPlan(m, due, undefined);
      const secs = p.cards.reduce((a, c) => a + CARD_SECONDS[c.kind], 0);
      expect(secs).toBeLessThanOrEqual(m * 60);
      expect(p.cards.length).toBeGreaterThan(0);
      expect(p.dueTotal).toBe(200);
    }
  });

  it('a 5-minute session is reviews only; longer ones leave room for a lesson', () => {
    const due = Array.from({ length: 100 }, (_, i) => card(i));
    expect(buildPlan(5, due, lesson).unit).toBeUndefined();
    const p20 = buildPlan(20, due, letters);
    expect(p20.unit).toEqual(letters);
    expect(p20.reviewMinutes).toBeLessThanOrEqual(10);
  });

  it('offers the lesson when nothing is due, if it fits', () => {
    expect(buildPlan(10, [], lesson).unit).toEqual(lesson);
    expect(buildPlan(5, [], lesson).unit).toEqual(lesson);
    expect(buildPlan(5, [], letters).unit).toBeUndefined();
    expect(buildPlan(20, [], undefined).unit).toBeUndefined();
  });

  it('gives the same order all day and mixes card kinds', () => {
    const due = [...Array.from({ length: 10 }, (_, i) => card(i, 'letter-read')), ...Array.from({ length: 10 }, (_, i) => card(i, 'phrase-say'))];
    const a = buildPlan(30, due, undefined, '2026-11-16').cards.map((c) => c.id);
    expect(buildPlan(30, [...due].reverse(), undefined, '2026-11-16').cards.map((c) => c.id)).toEqual(a);
    expect(buildPlan(30, due, undefined, '2026-11-17').cards.map((c) => c.id)).not.toEqual(a);
    expect(new Set(a.slice(0, 10).map((id) => id.split(':')[0])).size).toBe(2);
  });

  it('puts the most overdue cards first', () => {
    const due = [card(1, 'letter-read', '2026-11-16'), card(2, 'letter-read', '2026-11-10'), card(3, 'letter-read', '2026-11-14')];
    expect(buildPlan(10, due, undefined).cards.map((c) => c.ref)).toEqual(['2', '3', '1']);
  });
});
