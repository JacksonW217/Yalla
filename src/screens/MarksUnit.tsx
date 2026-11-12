import { useMemo, useState } from 'react';
import { Quiz } from '../components/Quiz';
import { DoneCard, UnitShell } from '../components/UnitShell';
import { Ar, SpeakButton } from '../components/ui';
import { EXTRAS, MARKS } from '../data/letters';
import { markDone } from '../lib/db';
import { markQuestions } from '../lib/questions';

export function MarksReference() {
  return (
    <>
      <div className="card">
        <div className="eyebrow">Short vowels and signs</div>
        <p className="sub" style={{ marginTop: 4 }}>Arabic letters are mostly consonants. Short vowels are small marks above or below the letter. Here they are on the letter ب (b).</p>
        <div className="marks">
          {MARKS.map((m) => (
            <div key={m.id} className="mark">
              <Ar size={44}>{m.sample}</Ar>
              <div className="grow">
                <div><b>{m.guide}</b> <span className="sub">· {m.name}</span></div>
                <div className="foot">{m.explain}</div>
              </div>
              <SpeakButton text={m.sample} small />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="eyebrow">Good to know</div>
        <p className="body">Books for learners, children’s books and the Quran print these marks. <b>Everyday Arabic leaves the short vowels out</b>, and readers fill them in from knowing the word. This app shows them at first and removes them gradually later on.</p>
      </div>
      <div className="card">
        <div className="eyebrow">Four more shapes you’ll meet</div>
        <div className="marks">
          {EXTRAS.map((m) => (
            <div key={m.id} className="mark">
              <Ar size={44}>{m.char}</Ar>
              <div className="grow">
                <div><b>{m.name}</b> <span className="sub">· “{m.guide}”</span></div>
                <div className="foot">{m.explain}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function MarksUnit() {
  const [stage, setStage] = useState<'learn' | 'quiz' | 'done'>('learn');
  const [run, setRun] = useState(0);
  const [score, setScore] = useState<{ right: number; total: number }>();
  const questions = useMemo(() => markQuestions(), [run]); // eslint-disable-line react-hooks/exhaustive-deps

  if (stage === 'done') return <UnitShell title="Vowel marks"><DoneCard score={score} onAgain={() => { setRun((r) => r + 1); setStage('quiz'); }} /></UnitShell>;
  if (stage === 'quiz')
    return (
      <UnitShell title="Quick quiz" onBack={() => setStage('learn')}>
        <Quiz key={run} questions={questions} onDone={(s) => { setScore(s); void markDone('marks:marks'); setStage('done'); }} />
      </UnitShell>
    );
  return (
    <UnitShell title="Vowel marks" footer={<button className="btn" onClick={() => { setStage('quiz'); window.scrollTo(0, 0); }}>Start the quiz</button>}>
      <div className="stack"><MarksReference /></div>
    </UnitShell>
  );
}
