import { Check as CheckIcon, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { mine, PHRASE_LESSON, PHRASE_MAP, stripMarks } from '../data/lessons';
import { useSettings } from '../lib/hooks';
import { FlagButton } from './FlagButton';
import { form, LETTER_GROUPS, LETTER_MAP, MARKS, POSITION_LABEL, POSITIONS, type Letter, type Position } from '../data/letters';
import type { Card } from '../lib/db';
import { inWords, review, type Grade } from '../lib/srs';
import { sample, shuffle } from '../lib/util';
import { TraceCanvas } from './TraceCanvas';
import { Ar, Check, SpeakButton } from './ui';

type Props = { card: Card; known: Letter[]; onGrade: (g: Grade) => void };

/** Multiple choice: right = good, wrong = again. */
function Choice({ prompt, options, answer, explain, onGrade }: { prompt: React.ReactNode; options: { key: string; label: React.ReactNode }[]; answer: string; explain: React.ReactNode; onGrade: (g: Grade) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const ok = picked === answer;
  return (
    <div className="quiz">
      <div className="quiz-prompt">{prompt}</div>
      <div className="quiz-options">
        {options.map((o) => {
          const state = picked === null ? '' : o.key === answer ? ' right' : o.key === picked ? ' wrong' : ' dim';
          return (
            <button key={o.key} className={`quiz-option${state}`} disabled={picked !== null} onClick={() => setPicked(o.key)}>
              <span className="grow">{o.label}</span>
              {picked !== null && o.key === answer && <CheckIcon size={20} />}
              {picked !== null && o.key === picked && o.key !== answer && <X size={20} />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`quiz-feedback ${ok ? 'right' : 'wrong'}`}>
          <div className="headline">{ok ? 'Correct' : 'Not quite — it will come back tomorrow'}</div>
          <div className="sub">{explain}</div>
          <button className="btn" autoFocus onClick={() => onGrade(ok ? 'good' : 'again')}>Continue</button>
        </div>
      )}
    </div>
  );
}

/** Reveal, then say how well you knew it. Shows when each answer brings the card back. */
function SelfGrade({ card, onGrade }: { card: Card; onGrade: (g: Grade) => void }) {
  const opts: { g: Grade; label: string; cls: string }[] = [
    { g: 'again', label: 'Missed it', cls: 'again' },
    { g: 'hard', label: 'Got it, slowly', cls: 'hard' },
    { g: 'good', label: 'Got it', cls: 'good' },
  ];
  return (
    <div className="grades">
      {opts.map((o) => (
        <button key={o.g} className={`grade ${o.cls}`} onClick={() => onGrade(o.g)}>
          <b>{o.label}</b>
          <span>{inWords(review(card, o.g).interval)}</span>
        </button>
      ))}
    </div>
  );
}

function LetterRead({ card, known, onGrade }: Props) {
  const l = LETTER_MAP[card.ref];
  const q = useMemo(() => {
    const positions: Position[] = l.nonConnector ? ['isolated', 'final'] : POSITIONS;
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const family = LETTER_GROUPS.find((g) => g.letters.includes(l.id))!.letters;
    const pool = known.length >= 4 ? known : Object.values(LETTER_MAP).slice(0, 7);
    const near = sample(pool.filter((x) => family.includes(x.id)), 3, (x) => x.id === l.id);
    const far = sample(pool, 3 - near.length, (x) => x.id === l.id || near.includes(x));
    return { pos, options: shuffle([l, ...near, ...far]) };
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Choice
      prompt={<><div className="quiz-ask">Which letter is this?{q.pos !== 'isolated' && ` (${POSITION_LABEL[q.pos].toLowerCase()} shape)`}</div><Ar className="quiz-glyph">{form(l, q.pos)}</Ar></>}
      options={q.options.map((x) => ({ key: x.id, label: <span><b>{x.name}</b> <span className="sub">· {x.guide}</span></span> }))}
      answer={l.id}
      explain={<span><Ar>{l.char}</Ar> is <b>{l.name}</b>, sounds like “{l.guide}”.</span>}
      onGrade={onGrade}
    />
  );
}

function LetterWrite({ card, onGrade }: Props) {
  const l = LETTER_MAP[card.ref];
  const pos = useMemo<Position>(() => {
    const positions: Position[] = l.nonConnector ? ['isolated', 'final'] : POSITIONS;
    return positions[Math.floor(Math.random() * positions.length)];
  }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [first, setFirst] = useState<boolean | null>(null);
  return (
    <div className="quiz">
      <div className="quiz-prompt">
        <div className="quiz-ask">Write this letter from memory</div>
        <div className="quiz-word">{l.name} <span className="sub">· “{l.guide}”</span></div>
        <div className="badge shape">{POSITION_LABEL[pos]} shape</div>
      </div>
      <TraceCanvas key={card.id} text={form(l, pos)} mode="memory" onResult={(r) => setFirst((f) => f ?? r.verdict === 'good')} />
      {first !== null && (
        <div className={`quiz-feedback ${first ? 'right' : 'wrong'}`}>
          <div className="headline">{first ? 'Correct' : 'Not quite — it will come back tomorrow'}</div>
          <div className="sub">{first ? 'Your first try counts.' : 'Your first try counts. The correct shape is shown on the pad; write over it once before you continue.'}</div>
          <button className="btn" onClick={() => onGrade(first ? 'good' : 'again')}>Continue</button>
        </div>
      )}
    </div>
  );
}

function MarkRead({ card, onGrade }: Props) {
  const m = MARKS.find((x) => x.id === card.ref)!;
  const options = useMemo(() => shuffle([m, ...sample(MARKS, 3, (x) => x.id === m.id)]), [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Choice
      prompt={<><div className="quiz-ask">How is this read?</div><Ar className="quiz-glyph">{m.sample}</Ar></>}
      options={options.map((x) => ({ key: x.id, label: <b>{x.guide}</b> }))}
      answer={m.id}
      explain={<span><Ar>{m.sample}</Ar> is “{m.guide}”. {m.explain}</span>}
      onGrade={onGrade}
    />
  );
}

function PhraseCard({ card, onGrade, say }: Props & { say: boolean }) {
  const p = PHRASE_MAP[card.ref];
  const formal = PHRASE_LESSON[card.ref]?.kind === 'reading';
  // Formal words lose their vowel marks once you've got them right twice.
  const ar = formal && card.reps >= 2 ? stripMarks(p.ar) : p.ar;
  const [shown, setShown] = useState(false);
  const [settings] = useSettings();
  const me = mine(p, settings.gender);
  return (
    <div className="recall">
      <div className="card recall-card">
        {say ? (
          <>
            <div className="quiz-ask">Say this out loud in {formal ? 'formal' : 'Egyptian'} Arabic</div>
            <div className="quiz-word">{p.en}</div>
          </>
        ) : (
          <>
            <div className="quiz-ask">Read this out loud. What does it mean?{formal && ar !== p.ar ? ' (no vowel marks)' : ''}</div>
            <Ar className="quiz-phrase">{ar}</Ar>
          </>
        )}
        {shown && (
          <div className="recall-answer">
            {say ? <Ar className="phrase-ar">{me.ar}</Ar> : <div className="quiz-word">{p.en}</div>}
            <div className="guide">{say ? me.guide : p.guide}</div>
            {p.f && !(p.self && settings.gender) && <div className="foot">{p.self ? 'If you’re a woman' : 'To a woman'}: {p.f.guide}</div>}
            {p.ex && <div className="foot">e.g. {p.ex.guide} — {p.ex.en}</div>}
            {formal && p.egypt && <div className="foot">In Egypt: {p.egypt}</div>}
            <div className="row" style={{ justifyContent: 'center' }}>{p.check && <Check />}<FlagButton id={p.id} /></div>
            <SpeakButton text={p.ar} label="Hear it" />
          </div>
        )}
        {!shown && <p className="sub">{say ? 'Say it before you look.' : 'Sound it out letter by letter, then decide what it means.'}</p>}
      </div>
      {shown ? <SelfGrade card={card} onGrade={onGrade} /> : <button className="btn" onClick={() => setShown(true)}>Show the answer</button>}
    </div>
  );
}

export function ReviewCard(props: Props) {
  switch (props.card.kind) {
    case 'letter-read': return <LetterRead {...props} />;
    case 'letter-write': return <LetterWrite {...props} />;
    case 'mark-read': return <MarkRead {...props} />;
    case 'phrase-say': return <PhraseCard {...props} say />;
    case 'phrase-read': return <PhraseCard {...props} say={false} />;
  }
}
