import { describe, expect, it } from 'vitest';
import { form, LETTER_GROUPS, LETTER_MAP, LETTERS, MARKS } from './letters';
import { CORE } from './core';
import { DIALOGUES } from './dialogues';
import { LESSON_MAP, LESSONS, mine, PATH, PHRASE_MAP, unitKey } from './lessons';

const ARABIC = /[؀-ۿ]/;

describe('alphabet', () => {
  it('has all 28 letters once, each in exactly one group', () => {
    expect(LETTERS).toHaveLength(28);
    expect(new Set(LETTERS.map((l) => l.char)).size).toBe(28);
    const grouped = LETTER_GROUPS.flatMap((g) => g.letters);
    expect(grouped).toHaveLength(28);
    expect(new Set(grouped).size).toBe(28);
    for (const id of grouped) expect(LETTER_MAP[id]).toBeDefined();
  });

  it('marks exactly the six non-connecting letters', () => {
    expect(LETTERS.filter((l) => l.nonConnector).map((l) => l.char).sort()).toEqual(['ا', 'د', 'ذ', 'ر', 'ز', 'و'].sort());
  });

  it('builds joined shapes without changing the letter', () => {
    const baa = LETTER_MAP.baa;
    expect(form(baa, 'isolated')).toBe('ب');
    expect(form(baa, 'medial').replace(/‍/g, '')).toBe('ب');
    expect(form(LETTER_MAP.daal, 'initial')).toBe('د'); // non-connector: no joined start shape
  });

  it('every letter has an Arabic example word that contains it', () => {
    for (const l of LETTERS) {
      expect(ARABIC.test(l.word.ar)).toBe(true);
      const bare = l.word.ar.replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا');
      expect(bare.includes(l.char), `${l.name} in ${l.word.ar}`).toBe(true);
    }
    expect(new Set(MARKS.map((m) => m.guide)).size).toBe(MARKS.length);
  });
});

describe('lessons', () => {
  it('have unique phrase ids and complete content', () => {
    const ids = LESSONS.flatMap((l) => l.phrases.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of LESSONS) {
      expect(l.phrases.length).toBeGreaterThanOrEqual(4); // quizzes need 4 options
      for (const p of l.phrases) {
        expect(ARABIC.test(p.ar)).toBe(true);
        expect(p.guide.length).toBeGreaterThan(0);
        expect(/[؀-ۿ]/.test(p.guide)).toBe(false);
        expect(p.en.length).toBeGreaterThan(0);
      }
    }
  });

  it('path points only at real units, each once', () => {
    const keys = PATH.map(unitKey);
    expect(new Set(keys).size).toBe(keys.length);
    for (const u of PATH) {
      if (u.kind === 'letters') expect(LETTER_GROUPS.some((g) => g.id === u.id)).toBe(true);
      if (u.kind === 'lesson') expect(LESSON_MAP[u.id]).toBeDefined();
    }
    expect(PATH.filter((u) => u.kind === 'letters')).toHaveLength(LETTER_GROUPS.length);
    expect(PATH.filter((u) => u.kind === 'lesson')).toHaveLength(LESSONS.length);
  });
});

describe('conversations', () => {
  it('depend only on real speaking lessons and have both parts', () => {
    expect(new Set(DIALOGUES.map((d) => d.id)).size).toBe(DIALOGUES.length);
    for (const d of DIALOGUES) {
      expect(d.requires.length).toBeGreaterThan(0);
      for (const r of d.requires) {
        expect(LESSON_MAP[r], `${d.id} requires ${r}`).toBeDefined();
        expect(LESSON_MAP[r].kind).toBeUndefined();
      }
      expect(d.lines.some((l) => l.who === 'you')).toBe(true);
      expect(d.lines.some((l) => l.who === 'them')).toBe(true);
      for (const l of d.lines) {
        expect(ARABIC.test(l.ar)).toBe(true);
        expect(ARABIC.test(l.guide)).toBe(false);
      }
    }
  });
});

describe('speaker forms', () => {
  it('gives a woman the feminine form only for phrases about herself', () => {
    expect(mine(PHRASE_MAP.kwayyis, 'f').guide).toBe('kwayyisa');
    expect(mine(PHRASE_MAP.kwayyis, 'm').guide).toBe('kwayyis');
    expect(mine(PHRASE_MAP.kwayyis, '').guide).toBe('kwayyis');
    expect(mine(PHRASE_MAP.ezzayyak, 'f').guide).toBe('ezzayyak?'); // depends on the listener, not the speaker
    expect(mine(PHRASE_MAP['3aayez'], 'f').guide).toBe('ana 3ayza ...');
  });
});

describe('core words', () => {
  it('have unique ids that never clash with lesson phrases, and an example each', () => {
    const lessonIds = new Set(LESSONS.flatMap((l) => l.phrases.map((p) => p.id)));
    expect(new Set(CORE.map((p) => p.id)).size).toBe(CORE.length);
    for (const p of CORE) {
      expect(p.id.startsWith('c-')).toBe(true);
      expect(lessonIds.has(p.id)).toBe(false);
      expect(PHRASE_MAP[p.id]).toBe(p);
      expect(ARABIC.test(p.ar)).toBe(true);
      expect(ARABIC.test(p.guide)).toBe(false);
      expect(p.ex, p.id).toBeDefined();
      expect(ARABIC.test(p.ex!.ar)).toBe(true);
      expect(ARABIC.test(p.ex!.guide)).toBe(false);
    }
  });
});
