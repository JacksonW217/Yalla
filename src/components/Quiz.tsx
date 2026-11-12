import { Check as CheckIcon, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { record } from '../lib/db';
import { ProgressBar } from './ui';

export interface Question {
  /** Stats key, e.g. "letter:baa". */
  itemId: string;
  prompt: ReactNode;
  options: { key: string; label: ReactNode }[];
  answer: string;
  /** Shown after answering. */
  explain?: ReactNode;
}

/**
 * Multiple-choice quiz. A missed question comes back later in the same quiz
 * until it is answered correctly; the score counts first attempts only.
 */
export function Quiz({ questions, onDone }: { questions: Question[]; onDone: (score: { right: number; total: number }) => void }) {
  const total = questions.length;
  const [queue, setQueue] = useState(() => questions.map((q, i) => ({ q, first: true, n: i })));
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [cleared, setCleared] = useState(0);
  const cur = queue[0];
  const correct = picked !== null && picked === cur?.q.answer;

  const pick = (key: string) => {
    if (picked !== null || !cur) return;
    setPicked(key);
    const ok = key === cur.q.answer;
    void record(cur.q.itemId, ok);
    if (ok && cur.first) setRight((r) => r + 1);
  };

  const next = () => {
    if (!cur) return;
    const rest = queue.slice(1);
    if (correct) {
      setCleared((c) => c + 1);
      if (!rest.length) return onDone({ right, total });
      setQueue(rest);
    } else {
      // Bring it back a few questions later.
      const at = Math.min(rest.length, 3);
      setQueue([...rest.slice(0, at), { ...cur, first: false }, ...rest.slice(at)]);
    }
    setPicked(null);
  };

  const options = useMemo(() => cur?.q.options ?? [], [cur]);
  if (!cur) return null;

  return (
    <div className="quiz">
      <ProgressBar value={cleared / total} />
      <div className="quiz-prompt">{cur.q.prompt}</div>
      <div className="quiz-options">
        {options.map((o) => {
          const state = picked === null ? '' : o.key === cur.q.answer ? ' right' : o.key === picked ? ' wrong' : ' dim';
          return (
            <button key={o.key} className={`quiz-option${state}`} onClick={() => pick(o.key)} disabled={picked !== null}>
              <span className="grow">{o.label}</span>
              {picked !== null && o.key === cur.q.answer && <CheckIcon size={20} />}
              {picked !== null && o.key === picked && o.key !== cur.q.answer && <X size={20} />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`quiz-feedback ${correct ? 'right' : 'wrong'}`}>
          <div className="headline">{correct ? 'Correct' : 'Not quite — you’ll see this one again'}</div>
          {cur.q.explain && <div className="sub">{cur.q.explain}</div>}
          <button className="btn" onClick={next} autoFocus>Continue</button>
        </div>
      )}
    </div>
  );
}
