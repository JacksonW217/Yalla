import { useState } from 'react';
import { form, POSITION_LABEL, POSITIONS, type Letter, type Position } from '../data/letters';
import { record } from '../lib/db';
import { TraceCanvas, type TraceMode } from './TraceCanvas';
import { Ar, Guide, Segmented, SpeakButton } from './ui';

/** Everything about one letter: sound, shapes, an example word and writing practice. */
export function LetterCard({ letter }: { letter: Letter }) {
  const [pos, setPos] = useState<Position>('isolated');
  const [mode, setMode] = useState<TraceMode>('trace');
  const shapes = letter.nonConnector ? (['isolated', 'final'] as Position[]) : POSITIONS;
  const current = shapes.includes(pos) ? pos : 'isolated';

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
        {letter.egypt && (
          <p className="note egypt"><b>In Egypt:</b> {letter.egypt}</p>
        )}
      </div>

      <div className="card">
        <div className="eyebrow">Its shapes</div>
        <p className="sub" style={{ marginTop: 4 }}>
          {letter.nonConnector
            ? 'This letter never joins to the letter after it, so it only has two shapes.'
            : 'Arabic letters join up like handwriting. The shape depends on where the letter sits in the word.'}
        </p>
        <div className="forms" style={{ ['--n' as string]: shapes.length }}>
          {shapes.map((p) => (
            <button key={p} className={`form${p === current ? ' on' : ''}`} onClick={() => setPos(p)}>
              <Ar>{form(letter, p)}</Ar>
              <span>{POSITION_LABEL[p]}</span>
            </button>
          ))}
        </div>
        {letter.tip && <p className="note">{letter.tip}</p>}
      </div>

      <div className="card">
        <div className="row between">
          <div className="eyebrow">Write it · {POSITION_LABEL[current].toLowerCase()} shape</div>
        </div>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'trace', label: 'Trace' },
            { value: 'copy', label: 'Copy' },
            { value: 'memory', label: 'From memory' },
          ]}
        />
        <TraceCanvas text={form(letter, current)} mode={mode} onResult={(r) => void record(`write:${letter.id}`, r.verdict === 'good')} />
        <p className="foot">Write right to left, main shape first and dots last. The check compares your strokes with the letter’s shape. It can’t judge stroke order, so use it as a guide.</p>
      </div>

      <div className="card">
        <div className="eyebrow">In a word</div>
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
