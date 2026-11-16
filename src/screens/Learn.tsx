import { BookOpen, Check, ChevronRight, MessageCircle, PenLine } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ar, Page, ProgressBar } from '../components/ui';
import { LETTER_GROUPS } from '../data/letters';
import { LESSON_MAP, PATH, unitKey, type Unit } from '../data/lessons';
import { buildPlan } from '../lib/cards';
import { useCards, useDone, useSettings, useToday } from '../lib/hooks';
import { addDays, dayKey, isDue } from '../lib/srs';

function describe(u: Unit) {
  if (u.kind === 'letters') {
    const g = LETTER_GROUPS.find((x) => x.id === u.id)!;
    return { to: `/letters/${g.id}`, title: g.title, sub: g.blurb, tag: 'Read & write', icon: <PenLine size={18} />, minutes: 10 };
  }
  if (u.kind === 'marks') return { to: '/marks', title: 'Vowel marks', sub: 'The small signs that tell you which vowel to say.', tag: 'Read', icon: <BookOpen size={18} />, minutes: 5 };
  const l = LESSON_MAP[u.id];
  if (l.kind === 'reading') return { to: `/lesson/${l.id}`, title: l.title, sub: l.blurb, tag: 'Read · Formal', icon: <BookOpen size={18} />, minutes: l.minutes };
  return { to: `/lesson/${l.id}`, title: l.title, sub: l.blurb, tag: 'Speak · Egyptian', icon: <MessageCircle size={18} />, minutes: l.minutes };
}

export const unitLink = (u: Unit) => describe(u).to;

export default function Learn() {
  const nav = useNavigate();
  const done = useDone();
  const cards = useCards();
  const today = useToday();
  const [settings, setSettings] = useSettings();
  const minutes = settings.minutes;
  const next = done && PATH.find((u) => !done.has(unitKey(u)));
  const due = useMemo(() => (cards ?? []).filter((c) => isDue(c)), [cards]);
  const plan = useMemo(() => buildPlan(minutes, due, next || undefined), [minutes, due, next]);
  if (!done || !cards) return <Page><div className="spinner" /></Page>;
  const count = PATH.filter((u) => done.has(unitKey(u))).length;
  const tomorrow = cards.filter((c) => c.due === addDays(dayKey(), 1)).length;
  const start = () => nav(plan.cards.length ? `/review?m=${minutes}` : next ? describe(next).to : '/');

  return (
    <Page>
      <header className="hero">
        <div className="hero-pattern" aria-hidden />
        <Ar className="hero-ar">أهلاً</Ar>
        <h1 className="large-title">Welcome</h1>
        <p className="sub">Reading and writing in formal Arabic, speaking in Egyptian.</p>
      </header>

      <section className="card next">
        <div className="row between">
          <div className="eyebrow on-accent">Today’s session</div>
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
          {plan.unit && (
            <li><b>New: {describe(plan.unit).title}</b><span>{describe(plan.unit).tag} · about {plan.unitMinutes} min</span></li>
          )}
          {!plan.cards.length && !plan.unit && (
            <li><b>{next ? 'Reviews only at this length' : 'You’re all caught up'}</b><span>{next ? (due.length ? 'Pick a longer session to add a new lesson.' : `Nothing is due. Pick 10 minutes or more for the next lesson${tomorrow ? `; ${tomorrow} cards are due tomorrow` : ''}.`) : tomorrow ? `${tomorrow} cards are due tomorrow.` : 'No cards are due.'}</span></li>
          )}
        </ol>
        {(plan.cards.length > 0 || plan.unit) && (
          <button className="btn white" onClick={start}>{count === 0 && !plan.cards.length ? 'Begin' : 'Start'} <ChevronRight size={18} /></button>
        )}
      </section>

      <section className="card">
        <div className="row between">
          <div className="eyebrow">Your path</div>
          <div className="foot">{count} of {PATH.length} lessons · {cards.length} cards</div>
        </div>
        <ProgressBar value={count / PATH.length} />
      </section>

      <section className="section">
        <h2>All lessons</h2>
        <div className="list">
          {PATH.map((u) => {
            const d = describe(u);
            const isDone = done.has(unitKey(u));
            return (
              <Link key={unitKey(u)} to={d.to} className="li">
                <span className={`li-ic${isDone ? ' done' : ''}`}>{isDone ? <Check size={18} /> : d.icon}</span>
                <span className="grow">
                  <span className="li-title">{d.title}</span>
                  <span className="foot">{d.tag} · {d.minutes} min</span>
                </span>
                <ChevronRight size={18} className="chev" />
              </Link>
            );
          })}
        </div>
        <p className="foot" style={{ margin: '10px 4px 0' }}>The order mixes reading and speaking on purpose, but you can open any lesson.</p>
      </section>
    </Page>
  );
}
