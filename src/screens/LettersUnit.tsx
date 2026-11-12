import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { LetterCard } from '../components/LetterCard';
import { Quiz } from '../components/Quiz';
import { DoneCard, UnitShell } from '../components/UnitShell';
import { Ar } from '../components/ui';
import { LETTER_GROUPS, LETTER_MAP } from '../data/letters';
import { markDone } from '../lib/db';
import { letterQuestions } from '../lib/questions';

/** Learn each letter in a shape family, then a quiz that mixes in earlier letters. */
export default function LettersUnit() {
  const { id } = useParams();
  const group = LETTER_GROUPS.find((g) => g.id === id);
  const [step, setStep] = useState(0); // 0..n-1 letters, n = quiz, n+1 = done
  const [run, setRun] = useState(0);
  const [score, setScore] = useState<{ right: number; total: number }>();
  const questions = useMemo(() => (group ? letterQuestions(group.id) : []), [group, run]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!group) return <Navigate to="/" replace />;
  const letters = group.letters.map((x) => LETTER_MAP[x]);
  const n = letters.length;

  if (step > n) {
    return (
      <UnitShell title={group.title}>
        <DoneCard score={score} onAgain={() => { setRun((r) => r + 1); setStep(n); }}>
          <div className="done-letters">{letters.map((l) => <Ar key={l.id} size={44}>{l.char}</Ar>)}</div>
        </DoneCard>
      </UnitShell>
    );
  }

  if (step === n) {
    return (
      <UnitShell title="Quick quiz" onBack={() => setStep(n - 1)}>
        <Quiz
          key={run}
          questions={questions}
          onDone={(s) => {
            setScore(s);
            void markDone(`letters:${group.id}`);
            setStep(n + 1);
          }}
        />
      </UnitShell>
    );
  }

  const letter = letters[step];
  return (
    <UnitShell
      title={`${group.title} · ${step + 1} of ${n}`}
      progress={step / (n + 1)}
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      footer={<button className="btn" onClick={() => { setStep(step + 1); window.scrollTo(0, 0); }}>{step === n - 1 ? 'Start the quiz' : 'Next letter'}</button>}
    >
      <LetterCard key={letter.id} letter={letter} />
    </UnitShell>
  );
}
