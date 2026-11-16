import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnitShell } from '../components/UnitShell';
import { Page } from '../components/ui';
import { CORE } from '../data/core';
import { PATH, unitKey } from '../data/lessons';
import { learnCoreWords, nextCoreWords } from '../lib/cards';
import { useCore, useDone, useSettings } from '../lib/hooks';
import { describe } from '../lib/units';
import { PhraseCard, Recall } from './LessonScreen';

/**
 * Today's new core words: meet each one in a sentence, then say them from
 * memory. They join the review schedule from tomorrow.
 */
export default function Words() {
  const nav = useNavigate();
  const core = useCore();
  const done = useDone();
  const [settings] = useSettings();
  const [extra, setExtra] = useState(0); // "learn more anyway"
  const [stage, setStage] = useState<'learn' | 'recall' | 'done'>('learn');
  const [batch, setBatch] = useState(0);
  // Freeze the batch when the screen opens so saving progress doesn't swap the words mid-lesson.
  const words = useMemo(
    () => (core ? nextCoreWords({ learned: core.learned, today: Math.max(0, core.today - extra) }, settings.newWords || 5) : []),
    [core === undefined, batch, extra], // eslint-disable-line react-hooks/exhaustive-deps
  );
  if (!core || !done) return <Page><div className="spinner" /></Page>;
  const next = PATH.find((u) => !done.has(unitKey(u)));
  const top = () => window.scrollTo(0, 0);

  if (stage === 'done')
    return (
      <UnitShell title="New words">
        <div className="done">
          <div className="done-star" aria-hidden />
          <div className="large-title">{words.length} new words learned</div>
          <p className="sub">They’ll come up in tomorrow’s review. You now know {core.learned} of {CORE.length} core words.</p>
          {next && <button className="btn" onClick={() => nav(describe(next).to, { replace: true })}>Continue to today’s lesson · about {describe(next).minutes} min</button>}
          <button className={`btn${next ? ' secondary' : ''}`} onClick={() => nav('/', { replace: true })}>Done for now</button>
        </div>
      </UnitShell>
    );

  if (!words.length) {
    const finished = core.learned >= CORE.length;
    return (
      <UnitShell title="New words">
        <div className="done">
          <div className="large-title">{finished ? 'You know every core word' : 'That’s today’s words done'}</div>
          <p className="sub">
            {finished
              ? `All ${CORE.length} core words are in your reviews now.`
              : `You’ve learned ${core.today} new word${core.today === 1 ? '' : 's'} today. A few a day sticks far better than a lot at once, and each new word adds reviews later.`}
          </p>
          {!finished && <button className="btn secondary" onClick={() => { setExtra(core.today); setBatch((b) => b + 1); }}>Learn {settings.newWords || 5} more anyway</button>}
          <button className="btn" onClick={() => nav('/', { replace: true })}>Back to Today</button>
        </div>
      </UnitShell>
    );
  }

  if (stage === 'recall')
    return (
      <UnitShell title="Say them yourself" onBack={() => setStage('learn')}>
        <Recall
          phrases={words}
          onDone={async () => {
            await learnCoreWords(words.length);
            setStage('done');
            top();
          }}
        />
      </UnitShell>
    );

  return (
    <UnitShell title={`New words · ${core.learned + 1}–${core.learned + words.length} of ${CORE.length}`} footer={<button className="btn" onClick={() => { setStage('recall'); top(); }}>Practise these</button>}>
      <div className="stack">
        <div className="card">
          <div className="eyebrow">Core words · Egyptian Arabic</div>
          <p className="body">These are some of the most-used words in everyday Egyptian. Each one comes with a short sentence, because words stick better in context.</p>
          <p className="foot">Read each word and its sentence out loud. Then you’ll say them from memory.</p>
        </div>
        {words.map((p) => <PhraseCard key={p.id} p={p} />)}
      </div>
    </UnitShell>
  );
}
