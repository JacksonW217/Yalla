import { Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page, PageHeader, ProgressBar } from '../components/ui';
import { PATH, unitKey } from '../data/lessons';
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
    </Page>
  );
}
