import { describe, expect, it } from 'vitest';
import { addDays, dayKey, inWords, isDue, newSchedule, review } from './srs';

const T = '2026-11-16';

describe('scheduler', () => {
  it('handles dates across month and year ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('spaces a card further out each time it is remembered', () => {
    let s = newSchedule(T);
    const gaps: number[] = [];
    let day = T;
    for (let i = 0; i < 6; i++) {
      s = review(s, 'good', day);
      gaps.push(s.interval);
      day = s.due;
    }
    expect(gaps[0]).toBe(1);
    expect(gaps[1]).toBe(3);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeGreaterThan(gaps[i - 1]);
    expect(s.reps).toBe(6);
  });

  it('brings a forgotten card back tomorrow and slows its growth', () => {
    let s = newSchedule(T);
    for (const d of [T, '2026-11-17', '2026-11-20']) s = review(s, 'good', d);
    const before = s;
    s = review(s, 'again', '2026-11-28');
    expect(s.due).toBe('2026-11-29');
    expect(s.interval).toBe(1);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeLessThan(before.ease);
  });

  it('missing a brand-new card is not counted as a lapse', () => {
    expect(review(newSchedule(T), 'again', T).lapses).toBe(0);
  });

  it('orders hard < good < easy and keeps ease in bounds', () => {
    let s = newSchedule(T);
    s = review(review(s, 'good', T), 'good', T);
    const h = review(s, 'hard', T), g = review(s, 'good', T), e = review(s, 'easy', T);
    expect(h.interval).toBeLessThan(g.interval);
    expect(g.interval).toBeLessThan(e.interval);
    let low = s;
    for (let i = 0; i < 30; i++) low = review(low, 'again', T);
    expect(low.ease).toBe(1.3);
    let high = s;
    for (let i = 0; i < 30; i++) high = review(high, 'easy', T);
    expect(high.ease).toBe(3);
    expect(high.interval).toBeLessThanOrEqual(180);
  });

  it('knows what is due', () => {
    expect(isDue(newSchedule(T), T)).toBe(true);
    expect(isDue(newSchedule('2026-11-17'), T)).toBe(false);
    expect(inWords(1)).toBe('tomorrow');
    expect(inWords(5)).toBe('in 5 days');
    expect(inWords(21)).toBe('in 3 weeks');
  });
});
