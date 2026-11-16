import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LetterCard } from '../components/LetterCard';
import { Ar, Page, PageHeader, useBack } from '../components/ui';
import { LETTER_GROUPS, LETTER_MAP, LETTERS } from '../data/letters';
import { useDone } from '../lib/hooks';
import { MarksReference } from './MarksUnit';

export default function Alphabet() {
  const done = useDone();
  const learned = new Set(LETTER_GROUPS.filter((g) => done?.has(`letters:${g.id}`)).flatMap((g) => g.letters));
  return (
    <Page>
      <PageHeader title="Alphabet chart" back="/practice" sub="28 letters, read right to left. Tap any letter to hear it and practise writing it." />
      <div className="alpha-grid" dir="rtl">
        {LETTERS.map((l) => (
          <Link key={l.id} to={`/alphabet/${l.id}`} className={`alpha${learned.has(l.id) ? ' learned' : ''}`}>
            <Ar size={34}>{l.char}</Ar>
            <span dir="ltr">{l.name}</span>
          </Link>
        ))}
      </div>
      <p className="foot" style={{ margin: '10px 4px 0' }}>{learned.size} of 28 learned. Filled tiles are letters whose lesson you’ve finished.</p>
      <section className="section stack">
        <h2>Marks and extras</h2>
        <MarksReference />
      </section>
    </Page>
  );
}

export function LetterScreen() {
  const { id } = useParams();
  const back = useBack('/alphabet');
  const letter = id ? LETTER_MAP[id] : undefined;
  if (!letter) return <Navigate to="/alphabet" replace />;
  const i = LETTERS.indexOf(letter);
  return (
    <Page>
      <div className="row between" style={{ margin: '8px 0 12px' }}>
        <button className="icon-btn" onClick={back} aria-label="Back to alphabet"><ArrowLeft size={20} /></button>
        <div className="row">
          {LETTERS[i - 1] && <Link replace className="btn sm secondary" to={`/alphabet/${LETTERS[i - 1].id}`}>Previous</Link>}
          {LETTERS[i + 1] && <Link replace className="btn sm secondary" to={`/alphabet/${LETTERS[i + 1].id}`}>Next</Link>}
        </div>
      </div>
      <LetterCard key={letter.id} letter={letter} />
    </Page>
  );
}
