import { BookOpen, ChevronRight, Languages, MessageCircle, PenLine, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Page, PageHeader } from '../components/ui';
import type { CardKind } from '../lib/db';
import { useCards } from '../lib/hooks';
import { isDue } from '../lib/srs';

export const DRILLS: Record<string, { title: string; desc: string; kinds: CardKind[] }> = {
  write: { title: 'Write letters', desc: 'Write letters from memory, in a random shape.', kinds: ['letter-write'] },
  read: { title: 'Read letters and words', desc: 'Recognise letters, vowel marks and words.', kinds: ['letter-read', 'mark-read', 'phrase-read'] },
  say: { title: 'Say phrases', desc: 'See the English, say it in Arabic.', kinds: ['phrase-say'] },
};
const ICON = { write: <PenLine size={18} />, read: <BookOpen size={18} />, say: <MessageCircle size={18} /> };

/** Extra practice on top of the daily session, plus the alphabet chart. */
export default function Practice() {
  const cards = useCards();
  if (!cards) return <Page><div className="spinner" /></Page>;
  const due = cards.filter((c) => isDue(c)).length;
  return (
    <Page>
      <PageHeader title="Practice" sub="Extra practice whenever you want it. Only material from lessons you’ve finished shows up here." />

      <section className="section">
        <h2>Scheduled review</h2>
        <div className="list">
          {due > 0 ? (
            <Link to="/review?m=30" className="li">
              <span className="li-ic next"><Repeat size={18} /></span>
              <span className="grow"><span className="li-title">Review what’s due</span><span className="foot">{due} card{due === 1 ? '' : 's'} due now</span></span>
              <ChevronRight size={18} className="chev" />
            </Link>
          ) : (
            <div className="li">
              <span className="li-ic"><Repeat size={18} /></span>
              <span className="grow"><span className="li-title">Nothing due right now</span><span className="foot">{cards.length ? 'Cards come back on their own schedule.' : 'Finish a lesson and its cards appear the next day.'}</span></span>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Free practice</h2>
        <div className="list">
          {(Object.keys(DRILLS) as (keyof typeof ICON)[]).map((id) => {
            const d = DRILLS[id];
            const n = cards.filter((c) => d.kinds.includes(c.kind)).length;
            const row = (
              <>
                <span className="li-ic">{ICON[id]}</span>
                <span className="grow"><span className="li-title">{d.title}</span><span className="foot">{n ? d.desc : 'Unlocks after your first lesson of this kind.'}</span></span>
                {n > 0 && <ChevronRight size={18} className="chev" />}
              </>
            );
            return n ? <Link key={id} to={`/review?practice=${id}`} className="li">{row}</Link> : <div key={id} className="li dim">{row}</div>;
          })}
        </div>
        <p className="foot" style={{ margin: '10px 4px 0' }}>Free practice doesn’t change when your cards are next due.</p>
      </section>

      <section className="section">
        <h2>Reference</h2>
        <div className="list">
          <Link to="/alphabet" className="li">
            <span className="li-ic"><Languages size={18} /></span>
            <span className="grow"><span className="li-title">Alphabet chart</span><span className="foot">All 28 letters, vowel marks, and writing practice for any letter.</span></span>
            <ChevronRight size={18} className="chev" />
          </Link>
        </div>
      </section>
    </Page>
  );
}
