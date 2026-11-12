import { BookOpen, Check, ChevronRight, MessageCircle, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ar, Page, ProgressBar } from '../components/ui';
import { LETTER_GROUPS } from '../data/letters';
import { LESSON_MAP, PATH, unitKey, type Unit } from '../data/lessons';
import { useDone } from '../lib/hooks';

function describe(u: Unit) {
  if (u.kind === 'letters') {
    const g = LETTER_GROUPS.find((x) => x.id === u.id)!;
    return { to: `/letters/${g.id}`, title: g.title, sub: g.blurb, tag: 'Read & write', icon: <PenLine size={18} />, minutes: 10 };
  }
  if (u.kind === 'marks') return { to: '/marks', title: 'Vowel marks', sub: 'The small signs that tell you which vowel to say.', tag: 'Read', icon: <BookOpen size={18} />, minutes: 5 };
  const l = LESSON_MAP[u.id];
  return { to: `/lesson/${l.id}`, title: l.title, sub: l.blurb, tag: 'Speak · Egyptian', icon: <MessageCircle size={18} />, minutes: l.minutes };
}

export default function Learn() {
  const done = useDone();
  if (!done) return <Page><div className="spinner" /></Page>;
  const next = PATH.find((u) => !done.has(unitKey(u)));
  const count = PATH.filter((u) => done.has(unitKey(u))).length;

  return (
    <Page>
      <header className="hero">
        <div className="hero-pattern" aria-hidden />
        <Ar className="hero-ar">أهلاً</Ar>
        <h1 className="large-title">Welcome</h1>
        <p className="sub">Reading and writing in formal Arabic, speaking in Egyptian.</p>
      </header>

      <section className="card">
        <div className="row between">
          <div className="eyebrow">Your path</div>
          <div className="foot">{count} of {PATH.length} done</div>
        </div>
        <ProgressBar value={count / PATH.length} />
      </section>

      {next ? (
        <Link to={describe(next).to} className="card next">
          <div className="eyebrow on-accent">{count === 0 ? 'Start here' : 'Up next'} · about {describe(next).minutes} min</div>
          <div className="title">{describe(next).title}</div>
          <div className="sub on-accent">{describe(next).sub}</div>
          <span className="btn white">{count === 0 ? 'Begin' : 'Continue'} <ChevronRight size={18} /></span>
        </Link>
      ) : (
        <section className="card">
          <div className="title">You’ve finished every lesson so far</div>
          <p className="sub">Go back over any unit below to keep it fresh. More lessons and scheduled review are coming next.</p>
        </section>
      )}

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
