import { BookOpen, MessageCircle, PenLine } from 'lucide-react';
import type { ReactNode } from 'react';
import { LETTER_GROUPS } from '../data/letters';
import { LESSON_MAP, type Unit } from '../data/lessons';

export type Skill = 'alphabet' | 'reading' | 'speaking';

export interface UnitInfo {
  to: string;
  title: string;
  sub: string;
  tag: string;
  icon: ReactNode;
  minutes: number;
  skill: Skill;
}

/** Display details for a unit on the learning path. */
export function describe(u: Unit): UnitInfo {
  if (u.kind === 'letters') {
    const g = LETTER_GROUPS.find((x) => x.id === u.id)!;
    return { to: `/letters/${g.id}`, title: g.title, sub: g.blurb, tag: 'Read & write', icon: <PenLine size={18} />, minutes: 12, skill: 'alphabet' };
  }
  if (u.kind === 'marks') return { to: '/marks', title: 'Vowel marks', sub: 'The small signs that tell you which vowel to say.', tag: 'Read', icon: <BookOpen size={18} />, minutes: 5, skill: 'alphabet' };
  const l = LESSON_MAP[u.id];
  if (l.kind === 'reading') return { to: `/lesson/${l.id}`, title: l.title, sub: l.blurb, tag: 'Read · Formal', icon: <BookOpen size={18} />, minutes: l.minutes, skill: 'reading' };
  return { to: `/lesson/${l.id}`, title: l.title, sub: l.blurb, tag: 'Speak · Egyptian', icon: <MessageCircle size={18} />, minutes: l.minutes, skill: 'speaking' };
}

export const unitLink = (u: Unit) => describe(u).to;
