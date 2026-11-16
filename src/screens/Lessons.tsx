import { Check, ChevronRight, Lock, MessagesSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page, PageHeader, ProgressBar } from '../components/ui';
import { DIALOGUES } from '../data/dialogues';
import { LESSON_MAP, PATH, unitKey } from '../data/lessons';
import { useDone } from '../lib/hooks';
import { describe, type Skill } from '../lib/units';

const GROUPS: { skill: Skill; title: string; blurb: string }[] = [
  { skill: 'alphabet', title: 'The alphabet', blurb: 'Learn to read and write all 28 letters.' },
  { skill: 'speaking', title: 'Speaking · Egyptian', blurb: 'Everyday phrases for real conversations.' },
  { skill: 'reading', title: 'Reading · Formal Arabic', blurb: 'Read real words and sentences.' },
];

/** Every lesson, grouped by skill. The recommended next one is marked. */
export default function Lessons() {
  const done = useDone();
  if (!done) return <Page><div className="spinner" /></Page>;
  const next = PATH.find((u) => !done.has(unitKey(u)));
  return (
    <Page>
      <PageHeader title="Lessons" sub="Today’s session picks the next lesson for you, mixing reading and speaking. You can also open any lesson here." />
      {GROUPS.map((g) => {
        const units = PATH.filter((u) => describe(u).skill === g.skill);
        const n = units.filter((u) => done.has(unitKey(u))).length;
        return (
          <section key={g.skill} className="section">
            <div className="row between group-head">
              <h2>{g.title}</h2>
              <span className="foot">{n} of {units.length}</span>
            </div>
            <p className="sub group-sub">{g.blurb}</p>
            <ProgressBar value={n / units.length} />
            <div className="list" style={{ marginTop: 12 }}>
              {units.map((u) => {
                const d = describe(u);
                const isDone = done.has(unitKey(u));
                const isNext = !!next && unitKey(next) === unitKey(u);
                return (
                  <Link key={unitKey(u)} to={d.to} className="li">
                    <span className={`li-ic${isDone ? ' ok' : isNext ? ' next' : ''}`}>{isDone ? <Check size={18} /> : d.icon}</span>
                    <span className="grow">
                      <span className="li-title">{d.title}</span>
                      <span className="foot">{isNext ? 'Up next · ' : ''}{d.minutes} min{isDone ? ' · done' : ''}</span>
                    </span>
                    <ChevronRight size={18} className="chev" />
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      <section className="section">
        <div className="row between group-head">
          <h2>Conversations</h2>
          <span className="foot">{DIALOGUES.filter((d) => done.has(`dialogue:${d.id}`)).length} of {DIALOGUES.length}</span>
        </div>
        <p className="sub group-sub">Short scripted conversations. Read one through, then play your part from memory.</p>
        <div className="list" style={{ marginTop: 12 }}>
          {DIALOGUES.map((d) => {
            const missing = d.requires.filter((r) => !done.has(`lesson:${r}`));
            const isDone = done.has(`dialogue:${d.id}`);
            const body = (
              <>
                <span className={`li-ic${isDone ? ' ok' : ''}`}>{isDone ? <Check size={18} /> : missing.length ? <Lock size={16} /> : <MessagesSquare size={18} />}</span>
                <span className="grow">
                  <span className="li-title">{d.title}</span>
                  <span className="foot">{missing.length ? `After: ${missing.map((r) => LESSON_MAP[r].title).join(', ')}` : `${d.lines.length} lines${isDone ? ' · done' : ''}`}</span>
                </span>
                {!missing.length && <ChevronRight size={18} className="chev" />}
              </>
            );
            return missing.length ? <div key={d.id} className="li dim">{body}</div> : <Link key={d.id} to={`/dialogue/${d.id}`} className="li">{body}</Link>;
          })}
        </div>
      </section>
    </Page>
  );
}
