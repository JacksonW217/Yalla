import { LESSONS, type Phrase } from '../data/lessons';
import { LETTER_GROUPS, LETTER_MAP } from '../data/letters';
import type { Scenario } from '../data/tutor';
import type { Card } from './db';

export interface PromptInput {
  scenario: Scenario;
  minutes: number;
  /** Completed unit keys. */
  done: Set<string>;
  cards: Card[];
  date?: Date;
}

const line = (p: Phrase) => `- ${p.guide} (${p.ar}) = ${p.en}${p.f ? ` [to/for a woman: ${p.f.guide}]` : ''}`;

/** Phrases the learner keeps missing: forgotten at least once, or missed and not yet recovered. */
export function weakPhraseIds(cards: Card[]): string[] {
  const score = new Map<string, number>();
  for (const c of cards) {
    if (c.kind !== 'phrase-say' && c.kind !== 'phrase-read') continue;
    const missedRecently = !!c.last && c.reps === 0;
    const s = c.lapses * 2 + (missedRecently ? 2 : 0) + (c.ease < 2.3 ? 1 : 0);
    if (s > 0) score.set(c.ref, (score.get(c.ref) ?? 0) + s);
  }
  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/**
 * The message to paste into the Claude tutor chat. It lists only what the
 * learner has actually finished in the app, so the tutor stays at their level.
 */
export function buildSessionMessage({ scenario, minutes, done, cards, date = new Date() }: PromptInput): string {
  const learned = LESSONS.filter((l) => done.has(`lesson:${l.id}`));
  const spoken = learned.filter((l) => l.kind !== 'reading');
  const formal = learned.filter((l) => l.kind === 'reading');
  const all = new Map(learned.flatMap((l) => l.phrases.map((p) => [p.id, p] as const)));
  const weak = weakPhraseIds(cards).map((id) => all.get(id)).filter((p): p is Phrase => !!p).slice(0, 8);
  const letters = LETTER_GROUPS.filter((g) => done.has(`letters:${g.id}`)).flatMap((g) => g.letters.map((id) => LETTER_MAP[id].char));

  const out: string[] = [];
  out.push(`Arabic practice — ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`);
  out.push('');
  out.push(`Today, for about ${minutes} minutes: ${scenario.ask}`);
  out.push('');
  if (spoken.length) {
    out.push('EGYPTIAN PHRASES I’VE LEARNED (stay within these; add at most 2-3 new words):');
    for (const l of spoken) {
      out.push(`${l.title}:`);
      for (const p of l.phrases) out.push(line(p));
    }
  } else {
    out.push('I haven’t finished any speaking lessons yet, so start from zero: teach me how to say hello and reply, one phrase at a time.');
  }
  if (weak.length) {
    out.push('');
    out.push('WORDS I KEEP MISSING (work these in more than once):');
    for (const p of weak) out.push(line(p));
  }
  out.push('');
  out.push(letters.length ? `READING: I know ${letters.length} of 28 letters so far: ${letters.join(' ')}${done.has('marks:marks') ? ', and the short vowel marks.' : '.'}` : 'READING: I haven’t learned any letters yet, so always include the Latin-letter guide.');
  if (formal.length) out.push(`Formal words I can read: ${formal.flatMap((l) => l.phrases.map((p) => p.ar)).join('، ')}`);
  out.push('');
  out.push('Keep your turns short, make me try before you give an answer, and fix one mistake at a time. When I say "wrap up", give me the summary.');
  return out.join('\n');
}
