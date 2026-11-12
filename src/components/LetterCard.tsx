import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { form, POSITION_LABEL, POSITIONS, type Letter, type Position } from '../data/letters';
import { record } from '../lib/db';
import { TraceCanvas, type TraceMode } from './TraceCanvas';
import { Ar, Guide, Segmented, SpeakButton } from './ui';

/** What each shape is and when you use it. */
function explain(letter: Letter, pos: Position): string {
  if (letter.nonConnector) {
    return pos === 'isolated'
      ? `Used at the start of a word, after another letter that doesn’t join forward, or on its own. ${letter.name} never joins to the letter after it, so this is also how it looks in those spots.`
      : `Used when the letter before it joins on to it. ${letter.name} only connects on its right side, to the letter before it, so a gap always follows it.`;
  }
  switch (pos) {
    case 'isolated':
      return 'Used when the letter stands by itself: on its own, or at the end of a word right after a letter that doesn’t join forward (ا د ذ ر ز و).';
    case 'initial':
      return 'Used at the start of a word, or after a letter that doesn’t join forward. It reaches out to the left to join the next letter.';
    case 'medial':
      return 'Used in the middle of a word, joined on both sides: to the letter before it (right) and the letter after it (left).';
    case 'final':
      return 'Used as the last letter of a word, joined to the letter before it. Final shapes often have a longer tail or bowl.';
  }
}

/** The shape inside a short joined string, so you can see the connection. Not a real word. */
function inContext(letter: Letter, pos: Position): string {
  const c = letter.char;
  const join = letter.id === 'baa' ? 'ت' : 'ب';
  if (pos === 'isolated') return letter.nonConnector ? c + join : c;
  if (pos === 'initial') return c + join;
  if (pos === 'medial') return join + c + join;
  return join + c;
}

/**
 * Everything about one letter. With `gated`, you must write every shape
 * correctly (and so read each explanation) before `onComplete` fires.
 */
export function LetterCard({ letter, gated, onComplete }: { letter: Letter; gated?: boolean; onComplete?: () => void }) {
  const shapes: Position[] = letter.nonConnector ? ['isolated', 'final'] : POSITIONS;
  const [pos, setPos] = useState<Position>('isolated');
  const [mode, setMode] = useState<TraceMode>('trace');
  const [passed, setPassed] = useState<Set<Position>>(new Set());
  const [tries, setTries] = useState(0);
  const current = shapes.includes(pos) ? pos : 'isolated';
  const allDone = shapes.every((p) => passed.has(p));

  useEffect(() => {
    if (gated && allDone) onComplete?.();
  }, [gated, allDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (p: Position) => {
    setPos(p);
    setTries(0);
  };

  const onResult = (ok: boolean, skipped = false) => {
    void record(`write:${letter.id}:${current}`, ok && !skipped);
    if (!ok) return setTries((t) => t + 1);
    const next = new Set(passed).add(current);
    setPassed(next);
    setTries(0);
    const todo = shapes.find((p) => !next.has(p));
    if (gated && todo) setTimeout(() => setPos(todo), 900);
  };

  const ctx = inContext(letter, current);

  return (
    <div className="stack">
      <div className="card letter-hero">
        <Ar className="letter-big">{letter.char}</Ar>
        <div className="letter-meta">
          <div className="title">{letter.name}</div>
          <div className="sub">Sounds like: <b>{letter.guide}</b></div>
          <SpeakButton text={letter.nameAr} label="Hear its name" />
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">The sound</div>
        <p className="body">{letter.sound}</p>
        {letter.egypt && <p className="note egypt"><b>In Egypt:</b> {letter.egypt}</p>}
      </div>

      <div className="card">
        <div className="row between">
          <div className="eyebrow">Its shapes</div>
          {gated && <div className="foot">{passed.size} of {shapes.length} written</div>}
        </div>
        <p className="sub" style={{ marginTop: 4 }}>
          {letter.nonConnector
            ? 'This letter never joins to the letter after it, so it only has two shapes.'
            : 'Arabic letters join up like handwriting, so each letter has up to four shapes depending on where it sits in a word.'}
          {gated && ' Write each shape correctly to move on.'}
        </p>
        <div className="forms" style={{ ['--n' as string]: shapes.length }}>
          {shapes.map((p) => (
            <button key={p} className={`form${p === current ? ' on' : ''}${passed.has(p) ? ' passed' : ''}`} onClick={() => choose(p)}>
              {passed.has(p) && <span className="form-check"><Check size={12} strokeWidth={3} /></span>}
              <Ar>{form(letter, p)}</Ar>
              <span>{POSITION_LABEL[p]}</span>
            </button>
          ))}
        </div>

        <div className="shape-detail">
          <div className="headline">{POSITION_LABEL[current]} shape</div>
          <p className="body">{explain(letter, current)}</p>
          <div className="context">
            <Ar size={52}>{ctx}</Ar>
            <div className="foot">
              Here {letter.name} is {current === 'isolated' ? (letter.nonConnector ? 'first, so it stands alone' : 'on its own') : `in its ${POSITION_LABEL[current].toLowerCase()} shape`}, joined with {letter.id === 'baa' ? 'ت' : 'ب'} to show the connection. This isn’t a real word.
            </div>
          </div>
        </div>
        {letter.tip && current === 'isolated' && <p className="note">{letter.tip}</p>}
      </div>

      <div className="card">
        <div className="eyebrow">Write the {POSITION_LABEL[current].toLowerCase()} shape</div>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'trace', label: 'Trace' },
            { value: 'copy', label: 'Copy' },
            { value: 'memory', label: 'From memory' },
          ]}
        />
        <TraceCanvas key={`${letter.id}-${current}`} text={form(letter, current)} mode={mode} onResult={(r) => onResult(r.verdict === 'good')} />
        <p className="foot">Write right to left, main shape first and dots last. Copy and From-memory judge your shape at any size or position. The check can’t see stroke order.</p>
        {gated && !passed.has(current) && tries >= 4 && (
          <button className="btn plain-link" onClick={() => onResult(true, true)}>
            Still stuck? Skip this shape for now
          </button>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">In a real word</div>
        <div className="word">
          <Ar size={40}>{letter.word.ar}</Ar>
          <div>
            <div><Guide>{letter.word.guide}</Guide></div>
            <div className="sub">{letter.word.en}</div>
          </div>
          <SpeakButton text={letter.word.ar} small />
        </div>
        {letter.word.egypt && <p className="note egypt"><b>In Egypt:</b> {letter.word.egypt}</p>}
      </div>
    </div>
  );
}
