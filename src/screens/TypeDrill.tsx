import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnitShell } from '../components/UnitShell';
import { Ar, Page } from '../components/ui';
import { LESSONS, stripMarks } from '../data/lessons';
import { LETTER_GROUPS, LETTER_MAP } from '../data/letters';
import { record } from '../lib/db';
import { useDone } from '../lib/hooks';
import { hasArabic, sameArabic } from '../lib/typing';
import { shuffle } from '../lib/util';

interface Item {
  id: string;
  ask: string;
  hint: string;
  answer: string;
}

/** Build a short mixed set from finished lessons: single letters and short words. */
function buildItems(done: Set<string>): Item[] {
  const letters: Item[] = LETTER_GROUPS.filter((g) => done.has(`letters:${g.id}`)).flatMap((g) =>
    g.letters.map((id) => ({ id: `type:letter:${id}`, ask: LETTER_MAP[id].name, hint: `the letter that sounds like “${LETTER_MAP[id].guide}”`, answer: LETTER_MAP[id].char })),
  );
  const words: Item[] = LESSONS.filter((l) => done.has(`lesson:${l.id}`)).flatMap((l) =>
    l.phrases
      .filter((p) => !p.ar.includes('...') && stripMarks(p.ar).length <= 14)
      .map((p) => ({ id: `type:phrase:${p.id}`, ask: p.en, hint: p.guide, answer: stripMarks(p.ar) })),
  );
  return [...shuffle(letters).slice(0, words.length ? 4 : 10), ...shuffle(words).slice(0, 8)];
}

/** Type letters and words on the Arabic keyboard. Free practice: no schedule involved. */
export default function TypeDrill() {
  const nav = useNavigate();
  const done = useDone();
  const [run, setRun] = useState(0);
  const items = useMemo(() => (done ? shuffle(buildItems(done)) : []), [done, run]); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Item[] | null>(null);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  if (!done) return <Page><div className="spinner" /></Page>;
  const q = queue ?? items;
  const item = q[0];
  const total = items.length;

  const again = () => {
    setRun((r) => r + 1);
    setQueue(null);
    setCleared(0);
    setMissed(0);
    setValue('');
    setResult(null);
  };

  if (!total)
    return (
      <UnitShell title="Type in Arabic">
        <div className="done">
          <div className="large-title">Nothing to type yet</div>
          <p className="sub">Finish your first letter lesson and typing practice opens up.</p>
          <button className="btn" onClick={() => nav('/practice', { replace: true })}>Back to Practice</button>
        </div>
      </UnitShell>
    );

  if (!item)
    return (
      <UnitShell title="Type in Arabic">
        <div className="done">
          <div className="done-star" aria-hidden />
          <div className="large-title">Typing done</div>
          <p className="sub">{total} typed{missed ? `, ${missed} needed a second try` : ', all right first time'}.</p>
          <button className="btn" onClick={again}>Go again</button>
          <button className="btn secondary" onClick={() => nav('/practice', { replace: true })}>Done for now</button>
        </div>
      </UnitShell>
    );

  const check = () => {
    if (!value.trim()) return;
    const ok = sameArabic(value, item.answer);
    void record(item.id, ok);
    setResult(ok);
    if (!ok && !q.slice(1).includes(item)) setMissed((m) => m + 1);
  };
  const next = () => {
    const rest = q.slice(1);
    if (result) {
      setCleared((c) => c + 1);
      setQueue(rest);
    } else setQueue([...rest.slice(0, 2), item, ...rest.slice(2)]);
    setValue('');
    setResult(null);
    setTimeout(() => input.current?.focus(), 30);
  };
  const latin = result === false && !hasArabic(value);

  return (
    <UnitShell title={`Type in Arabic · ${Math.min(cleared + 1, total)} of ${total}`} progress={cleared / total}>
      <div className="quiz">
        <div className="quiz-prompt">
          <div className="quiz-ask">Type this in Arabic letters</div>
          <div className="quiz-word">{item.ask}</div>
          <div className="guide">{item.hint}</div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (result === null) check(); else next(); }}>
          <input
            ref={input}
            className={`type-input${result === null ? '' : result ? ' right' : ' wrong'}`}
            lang="ar"
            dir="rtl"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label="Your answer in Arabic"
            value={value}
            readOnly={result !== null}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          {result === null ? (
            <button className="btn" style={{ marginTop: 12 }} disabled={!value.trim()}>Check</button>
          ) : (
            <div className={`quiz-feedback ${result ? 'right' : 'wrong'}`} style={{ marginTop: 12 }}>
              <div className="headline">{result ? 'Correct' : 'Not quite — you’ll get this one again'}</div>
              {!result && <div className="sub">It’s written <Ar size={28}>{item.answer}</Ar></div>}
              {latin && <div className="sub">That was typed in English letters. Switch to the Arabic keyboard with the globe key.</div>}
              <button className="btn" autoFocus>Continue</button>
            </div>
          )}
        </form>
        <p className="foot">Vowel marks aren’t needed. To add the Arabic keyboard on iPhone: Settings → General → Keyboard → Keyboards → Add New Keyboard → Arabic. Then tap the globe key to switch.</p>
      </div>
    </UnitShell>
  );
}
