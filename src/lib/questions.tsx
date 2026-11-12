import type { Question } from '../components/Quiz';
import { Ar, Guide, SpeakButton } from '../components/ui';
import { form, LETTER_GROUPS, LETTER_MAP, LETTERS, MARKS, type Letter, type Position } from '../data/letters';
import type { Lesson } from '../data/lessons';
import { sample, shuffle } from './util';

/** Distractors: prefer look-alikes from the same shape family, then anything else. */
function distractors(l: Letter, n: number, pool: Letter[]): Letter[] {
  const family = LETTER_GROUPS.find((g) => g.letters.includes(l.id))?.letters ?? [];
  const near = sample(pool.filter((x) => family.includes(x.id)), n, (x) => x.id === l.id);
  const far = sample(pool, n - near.length, (x) => x.id === l.id || near.includes(x));
  return [...near, ...far];
}

const nameOpt = (l: Letter) => ({ key: l.id, label: <span><b>{l.name}</b> <span className="sub">· {l.guide}</span></span> });
const charOpt = (l: Letter, text = l.char) => ({ key: l.id, label: <Ar size={34}>{text}</Ar> });

/** Three kinds of question per letter, plus a few review questions from earlier groups. */
export function letterQuestions(groupId: string): Question[] {
  const gi = LETTER_GROUPS.findIndex((g) => g.id === groupId);
  const group = LETTER_GROUPS[gi].letters.map((id) => LETTER_MAP[id]);
  const known = LETTER_GROUPS.slice(0, gi + 1).flatMap((g) => g.letters.map((id) => LETTER_MAP[id]));
  const pool = known.length >= 4 ? known : LETTERS.slice(0, 7);
  const earlier = sample(known.filter((l) => !group.includes(l)), 3);
  const qs: Question[] = [];

  for (const l of [...group, ...earlier]) {
    const review = earlier.includes(l);
    const explain = <span><Ar>{l.char}</Ar> is <b>{l.name}</b>, sounds like “{l.guide}”.</span>;
    qs.push({
      itemId: `letter:${l.id}`,
      prompt: (<><div className="quiz-ask">Which letter is this?</div><Ar className="quiz-glyph">{l.char}</Ar></>),
      options: shuffle([l, ...distractors(l, 3, pool)]).map(nameOpt),
      answer: l.id,
      explain,
    });
    if (review) continue;
    qs.push({
      itemId: `letter:${l.id}`,
      prompt: (<><div className="quiz-ask">Pick the letter</div><div className="quiz-word">{l.name} <span className="sub">· “{l.guide}”</span></div><SpeakButton text={l.nameAr} label="Hear it" /></>),
      options: shuffle([l, ...distractors(l, 3, pool)]).map((x) => charOpt(x)),
      answer: l.id,
      explain,
    });
    const positions: Position[] = l.nonConnector ? ['final'] : ['initial', 'medial', 'final'];
    const p = positions[Math.floor(Math.random() * positions.length)];
    qs.push({
      itemId: `letter:${l.id}`,
      prompt: (<><div className="quiz-ask">This is a letter joined inside a word. Which one?</div><Ar className="quiz-glyph">{form(l, p)}</Ar></>),
      options: shuffle([l, ...distractors(l, 3, pool)]).map(nameOpt),
      answer: l.id,
      explain: <span>That’s <b>{l.name}</b> in its {p === 'initial' ? 'start' : p === 'medial' ? 'middle' : 'end'} shape: <Ar>{form(l, p)}</Ar></span>,
    });
  }
  return shuffle(qs);
}

export function markQuestions(): Question[] {
  const qs: Question[] = [];
  for (const m of MARKS) {
    const others = sample(MARKS, 3, (x) => x.id === m.id);
    qs.push({
      itemId: `mark:${m.id}`,
      prompt: (<><div className="quiz-ask">How is this read?</div><Ar className="quiz-glyph">{m.sample}</Ar></>),
      options: shuffle([m, ...others]).map((x) => ({ key: x.id, label: <b>{x.guide}</b> })),
      answer: m.id,
      explain: <span><Ar>{m.sample}</Ar> is “{m.guide}”. {m.explain}</span>,
    });
    qs.push({
      itemId: `mark:${m.id}`,
      prompt: (<><div className="quiz-ask">Which one says</div><div className="quiz-word">“{m.guide}”</div></>),
      options: shuffle([m, ...others]).map((x) => ({ key: x.id, label: <Ar size={34}>{x.sample}</Ar> })),
      answer: m.id,
      explain: <span><Ar>{m.sample}</Ar> is “{m.guide}”. {m.explain}</span>,
    });
  }
  return shuffle(qs);
}

/** Meaning questions in both directions for a speaking lesson. */
export function lessonQuestions(lesson: Lesson): Question[] {
  const qs: Question[] = [];
  for (const p of lesson.phrases) {
    const others = sample(lesson.phrases, 3, (x) => x.id === p.id);
    const explain = <span><Ar>{p.ar}</Ar> · {p.guide} · {p.en}</span>;
    qs.push({
      itemId: `phrase:${p.id}`,
      prompt: (<><div className="quiz-ask">What does this mean?</div><Ar className="quiz-phrase">{p.ar}</Ar><div><Guide>{p.guide}</Guide></div><SpeakButton text={p.ar} label="Hear it" /></>),
      options: shuffle([p, ...others]).map((x) => ({ key: x.id, label: x.en })),
      answer: p.id,
      explain,
    });
    qs.push({
      itemId: `phrase:${p.id}`,
      prompt: (<><div className="quiz-ask">How do you say</div><div className="quiz-word">{p.en}</div></>),
      options: shuffle([p, ...others]).map((x) => ({ key: x.id, label: <span className="opt-ar"><Ar size={24}>{x.ar}</Ar><Guide>{x.guide}</Guide></span> })),
      answer: p.id,
      explain,
    });
  }
  return shuffle(qs);
}
