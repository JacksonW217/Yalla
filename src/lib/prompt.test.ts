import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../data/tutor';
import type { Card } from './db';
import { buildSessionMessage, weakPhraseIds } from './prompt';
import { newSchedule } from './srs';

const card = (ref: string, patch: Partial<Card> = {}): Card => ({ id: `phrase-say:${ref}`, kind: 'phrase-say', ref, created: '2026-11-16', ...newSchedule('2026-11-16'), ...patch });
const date = new Date(2026, 10, 16);

describe('tutor message', () => {
  it('starts from zero when nothing is finished', () => {
    const m = buildSessionMessage({ scenario: SCENARIOS[0], minutes: 10, done: new Set(), cards: [], date });
    expect(m).toContain('start from zero');
    expect(m).toContain('haven’t learned any letters');
    expect(m).not.toContain('ezzayyak');
  });

  it('lists only finished lessons and letters', () => {
    const m = buildSessionMessage({ scenario: SCENARIOS[1], minutes: 15, done: new Set(['lesson:greetings', 'letters:g1', 'marks:marks']), cards: [], date });
    expect(m).toContain('ezzayyak');
    expect(m).toContain('to/for a woman: ezzayyik');
    expect(m).not.toContain('shukran'); // polite lesson not done
    expect(m).toContain('I know 4 of 28 letters so far: ا ب ت ث, and the short vowel marks.');
    expect(m).toContain('about 15 minutes');
    expect(m).toContain('Monday, November 16');
  });

  it('surfaces the words the learner keeps missing, worst first', () => {
    const cards = [card('ahlan'), card('tamaam', { lapses: 1, reps: 1 }), card('ezzayyak', { lapses: 3, reps: 1 }), card('salaam', { last: '2026-11-15', reps: 0 })];
    expect(weakPhraseIds(cards)).toEqual(['ezzayyak', 'tamaam', 'salaam']);
    const m = buildSessionMessage({ scenario: SCENARIOS[2], minutes: 10, done: new Set(['lesson:greetings']), cards, date });
    const weak = m.slice(m.indexOf('WORDS I KEEP MISSING'));
    expect(weak.indexOf('ezzayyak')).toBeLessThan(weak.indexOf('tamaam'));
    expect(weak).not.toContain('ahlan (');
  });

  it('lists core words learned so far, and only those', () => {
    const m = buildSessionMessage({ scenario: SCENARIOS[0], minutes: 10, done: new Set(), cards: [], date, coreLearned: 3 });
    expect(m).toContain('CORE WORDS I KNOW (3): wi = and; fi = in / at; fiih = there is / there are');
    expect(m).not.toContain('mafiish');
    expect(m).not.toContain('start from zero');
  });

  it('includes formal words once a reading lesson is done', () => {
    const m = buildSessionMessage({ scenario: SCENARIOS[4], minutes: 10, done: new Set(['lesson:read1']), cards: [], date });
    expect(m).toContain('Formal words I can read: بَاب');
    expect(m).not.toContain('EGYPTIAN PHRASES I’VE LEARNED');
  });
});
