import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ar, Page, PageHeader } from '../components/ui';
import { LETTER_GROUPS } from '../data/letters';
import { LESSON_MAP, PATH, unitKey } from '../data/lessons';
import { CORE } from '../data/core';
import { buildPlan, nextCoreWords } from '../lib/cards';
import { useCards, useCore, useDone, useSettings, useToday } from '../lib/hooks';
import { addDays, dayKey, isDue } from '../lib/srs';
import { describe } from '../lib/units';

/** The one screen you need each day: what to do now, and how far you've come. */
export default function Today() {
  const nav = useNavigate();
  const done = useDone();
  const cards = useCards();
  const today = useToday();
  const [settings, setSettings] = useSettings();
  const minutes = settings.minutes;
  const next = done && PATH.find((u) => !done.has(unitKey(u)));
  const due = useMemo(() => (cards ?? []).filter((c) => isDue(c)), [cards]);
  const core = useCore();
  const newWords = core ? nextCoreWords(core, settings.newWords).length : 0;
  const plan = useMemo(() => buildPlan(minutes, due, next || undefined, undefined, newWords), [minutes, due, next, newWords]);
  if (!done || !cards || !core) return <Page><div className="spinner" /></Page>;

  const lessonsDone = PATH.filter((u) => done.has(unitKey(u))).length;
  const letters = LETTER_GROUPS.filter((g) => done.has(`letters:${g.id}`)).reduce((n, g) => n + g.letters.length, 0);
  const words = PATH.filter((u) => u.kind === 'lesson' && done.has(unitKey(u))).reduce((n, u) => n + LESSON_MAP[u.id].phrases.length, 0) + Math.min(core.learned, CORE.length);
  const tomorrow = cards.filter((c) => c.due === addDays(dayKey(), 1)).length;
  const fresh = lessonsDone === 0 && !cards.length;
  const start = () => nav(plan.cards.length ? `/review?m=${minutes}` : plan.words ? '/words' : next ? describe(next).to : '/');
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Page>
      <div className="hero-pattern" aria-hidden />
      <PageHeader title={fresh ? 'Welcome' : 'Today'} eyebrow={date}>
        <Ar className="head-ar">أهلاً</Ar>
      </PageHeader>

      <section className="card next">
        <div className="row between">
          <div className="eyebrow on-accent">{fresh ? 'Start here' : 'Today’s session'}</div>
          {today && today.reviews > 0 && <div className="foot on-accent">{today.reviews} reviewed today</div>}
        </div>
        <div className="seg on-dark" role="tablist" aria-label="Session length">
          {[5, 10, 20, 30].map((m) => (
            <button key={m} role="tab" aria-selected={m === minutes} className={m === minutes ? 'on' : ''} onClick={() => setSettings({ minutes: m })}>{m} min</button>
          ))}
        </div>
        <ol className="plan">
          {plan.cards.length > 0 && (
            <li><b>Review {plan.cards.length} card{plan.cards.length === 1 ? '' : 's'}</b><span>about {plan.reviewMinutes} min{plan.dueTotal > plan.cards.length ? ` · ${plan.dueTotal - plan.cards.length} more due` : ''}</span></li>
          )}
          {plan.words > 0 && (
            <li><b>Learn {plan.words} new word{plan.words === 1 ? '' : 's'}</b><span>Core vocabulary · about {Math.max(1, Math.round(plan.words * 0.5))} min</span></li>
          )}
          {plan.unit && (
            <li><b>New: {describe(plan.unit).title}</b><span>{describe(plan.unit).tag} · about {plan.unitMinutes} min</span></li>
          )}
          {!plan.cards.length && !plan.unit && !plan.words && (
            <li><b>{next ? 'Nothing fits at this length' : 'You’re all caught up'}</b><span>{next ? `Nothing is due for review. Pick a longer session for the next lesson (about ${describe(next).minutes} min).` : tomorrow ? `${tomorrow} cards are due tomorrow.` : 'No cards are due.'}</span></li>
          )}
        </ol>
        {(plan.cards.length > 0 || plan.unit || plan.words > 0) && (
          <button className="btn white" onClick={start}>{fresh ? 'Begin' : 'Start'} <ChevronRight size={18} /></button>
        )}
      </section>

      <section className="stats" aria-label="Your progress">
        <div className="stat"><b>{letters}<small>/28</small></b><span>letters</span></div>
        <div className="stat"><b>{words}</b><span>words</span></div>
        <div className="stat"><b>{lessonsDone}<small>/{PATH.length}</small></b><span>lessons</span></div>
      </section>

      {!fresh && (
        <section className="list">
          {next && !plan.unit && (
            <Link to={describe(next).to} className="li">
              <span className="li-ic">{describe(next).icon}</span>
              <span className="grow"><span className="li-title">Next lesson: {describe(next).title}</span><span className="foot">{describe(next).tag} · {describe(next).minutes} min</span></span>
              <ChevronRight size={18} className="chev" />
            </Link>
          )}
          <div className="li">
            <span className="grow"><span className="li-title">Coming up</span><span className="foot">{tomorrow ? `${tomorrow} card${tomorrow === 1 ? '' : 's'} due tomorrow` : 'No cards due tomorrow yet'}{due.length ? ` · ${due.length} due now` : ''}</span></span>
          </div>
        </section>
      )}

      {fresh && (
        <section className="card">
          <div className="eyebrow">How it works</div>
          <p className="body">Each day, open this screen, pick how long you have, and tap Start. You’ll review what’s due, then learn something new.</p>
          <p className="sub">Reading and writing use the formal alphabet. Speaking is Egyptian Arabic.</p>
        </section>
      )}
    </Page>
  );
}
