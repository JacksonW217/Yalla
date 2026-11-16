import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReviewCard } from '../components/ReviewCard';
import { UnitShell } from '../components/UnitShell';
import { Page } from '../components/ui';
import { LETTER_GROUPS, LETTER_MAP } from '../data/letters';
import { PATH, unitKey } from '../data/lessons';
import { buildPlan, gradeCard, type Plan } from '../lib/cards';
import { db, type Card } from '../lib/db';
import { useDone } from '../lib/hooks';
import { dayKey } from '../lib/srs';
import { unitLink } from './Learn';

/** A review session: the due cards for today's time budget, one at a time. */
export default function Review() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const minutes = Number(params.get('m')) || 10;
  const done = useDone();
  const [plan, setPlan] = useState<Plan>();
  const [queue, setQueue] = useState<Card[]>([]);
  /** Cards missed this session, shown once more at the end for practice (not re-graded). */
  const [retry, setRetry] = useState<Set<string>>(new Set());
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!done || plan) return;
    void (async () => {
      const due = await db.cards.where('due').belowOrEqual(dayKey()).toArray();
      const next = PATH.find((u) => !done.has(unitKey(u)));
      const p = buildPlan(minutes, due, next);
      setPlan(p);
      setQueue(p.cards);
    })();
  }, [done, plan, minutes]);

  const known = useMemo(() => LETTER_GROUPS.filter((g) => done?.has(`letters:${g.id}`)).flatMap((g) => g.letters.map((id) => LETTER_MAP[id])), [done]);

  if (!plan) return <Page><div className="spinner" /></Page>;
  const total = plan.cards.length;
  const card = queue[0];

  if (!card) {
    const more = plan.dueTotal - total;
    return (
      <UnitShell title="Review">
        <div className="done">
          <div className="done-star" aria-hidden />
          <div className="large-title">{total ? 'Reviews done' : 'Nothing to review'}</div>
          {total > 0 ? (
            <p className="sub">{total} card{total === 1 ? '' : 's'} reviewed{missed ? `, ${missed} to see again tomorrow` : ''}.{more > 0 ? ` ${more} more are due if you have time.` : ''}</p>
          ) : (
            <p className="sub">Cards appear here the day after you finish a lesson, then come back at growing intervals.</p>
          )}
          {plan.unit && (
            <button className="btn" onClick={() => nav(unitLink(plan.unit!))}>Continue to today’s lesson · about {plan.unitMinutes} min</button>
          )}
          {more > 0 && <button className="btn secondary" onClick={() => { setPlan(undefined); setCleared(0); setMissed(0); setRetry(new Set()); }}>Review more</button>}
          <button className={`btn${plan.unit ? ' secondary' : ''}`} onClick={() => nav('/')}>Done for now</button>
        </div>
      </UnitShell>
    );
  }

  const again = retry.has(card.id);
  const grade = async (g: Parameters<typeof gradeCard>[1]) => {
    if (again) {
      // Second look: practice only, the schedule was already set.
      setQueue((q) => q.slice(1));
      setN((x) => x + 1);
      window.scrollTo(0, 0);
      return;
    }
    await gradeCard(card, g);
    setCleared((c) => c + 1);
    if (g === 'again') {
      setMissed((m) => m + 1);
      setRetry((r) => new Set(r).add(card.id));
      setQueue((q) => [...q.slice(1), card]);
    } else setQueue((q) => q.slice(1));
    setN((x) => x + 1);
    window.scrollTo(0, 0);
  };

  return (
    <UnitShell title={again ? `One more look · ${queue.length} left` : `Review · ${cleared + 1} of ${total}`} progress={cleared / total}>
      {again && <p className="note" style={{ marginTop: 0, marginBottom: 12 }}>You missed this one earlier. Try it once more now. It’s still scheduled for tomorrow.</p>}
      <ReviewCard key={`${card.id}-${n}`} card={card} known={known} onGrade={grade} />
    </UnitShell>
  );
}
