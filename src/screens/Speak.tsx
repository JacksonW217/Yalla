import { Check, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Page, PageHeader, Segmented } from '../components/ui';
import { SCENARIOS, TUTOR_INSTRUCTIONS } from '../data/tutor';
import { copyText } from '../lib/clipboard';
import { db, setKV } from '../lib/db';
import { useCards, useDone } from '../lib/hooks';
import { buildSessionMessage, weakPhraseIds } from '../lib/prompt';
import { useLiveQuery } from 'dexie-react-hooks';

function CopyButton({ text, label, className = 'btn' }: { text: string; label: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  return (
    <button
      className={className}
      onClick={async () => {
        setState((await copyText(text)) ? 'ok' : 'fail');
        setTimeout(() => setState('idle'), 2500);
      }}
    >
      {state === 'ok' ? <Check size={18} /> : <Copy size={18} />}
      {state === 'ok' ? 'Copied' : state === 'fail' ? 'Couldn’t copy — select the text below' : label}
    </button>
  );
}

export default function Speak() {
  const done = useDone();
  const cards = useCards();
  const setup = useLiveQuery(async () => !!(await db.kv.get('tutorSetup'))?.value, []);
  const [scenario, setScenario] = useState(SCENARIOS[0].id);
  const [minutes, setMinutes] = useState('10');
  const [showSetup, setShowSetup] = useState(false);
  const [preview, setPreview] = useState(false);

  const message = useMemo(
    () => (done && cards ? buildSessionMessage({ scenario: SCENARIOS.find((s) => s.id === scenario)!, minutes: Number(minutes), done, cards }) : ''),
    [done, cards, scenario, minutes],
  );
  if (!done || !cards || setup === undefined) return <Page><div className="spinner" /></Page>;
  const weak = weakPhraseIds(cards).length;
  const open = showSetup || !setup;

  return (
    <Page>
      <PageHeader title="Speak" sub="Practise real conversation with your Claude tutor. This builds a message from what you’ve learned, so the tutor stays at your level." />

      <section className="card">
        <button className="row between plain-row" onClick={() => setShowSetup(!open)} aria-expanded={open}>
          <div>
            <div className="eyebrow">{setup ? 'Tutor is set up' : 'Step 1 · once only'}</div>
            <div className="headline">Set up your tutor in Claude</div>
          </div>
          {setup && <ChevronDown size={20} className="chev" style={{ transform: open ? 'rotate(180deg)' : undefined }} />}
        </button>
        {open && (
          <div className="stack" style={{ marginTop: 12 }}>
            <ol className="steps">
              <li>Copy the tutor instructions below.</li>
              <li>In the Claude app, create a new <b>Project</b> (call it “Arabic”).</li>
              <li>Paste the instructions into the project’s <b>instructions</b> and save.</li>
              <li>Start every practice chat inside that project.</li>
            </ol>
            <CopyButton text={TUTOR_INSTRUCTIONS} label="Copy tutor instructions" className="btn secondary" />
            <button className="btn plain-link" onClick={async () => { await setKV('tutorSetup', !setup); setShowSetup(false); }}>
              {setup ? 'Mark as not set up' : 'I’ve done this'}
            </button>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Today’s practice</h2>
        <div className="options">
          {SCENARIOS.map((s) => (
            <button key={s.id} className={`option${s.id === scenario ? ' on' : ''}`} onClick={() => setScenario(s.id)}>
              <span className="radio">{s.id === scenario && <Check size={13} strokeWidth={3} />}</span>
              <span>
                <span className="li-title">{s.title}{s.id === 'drill' && weak > 0 ? ` · ${weak}` : ''}</span>
                <span className="foot">{s.id === 'drill' && weak === 0 ? 'Nothing missed yet. This fills in as you review.' : s.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="row between" style={{ margin: '14px 4px 0' }}>
          <span className="li-title">How long</span>
          <Segmented value={minutes} onChange={setMinutes} options={[{ value: '5', label: '5 min' }, { value: '10', label: '10 min' }, { value: '15', label: '15 min' }]} />
        </div>
      </section>

      <section className="section stack">
        <CopyButton text={message} label="Copy message for Claude" />
        <a className="btn secondary" href="https://claude.ai/projects" target="_blank" rel="noreferrer">Open Claude <ExternalLink size={16} /></a>
        <p className="foot" style={{ margin: '0 4px' }}>Paste the message into a new chat in your Arabic project. If your Claude app has voice mode, use it and talk out loud. Say “wrap up” at the end for a summary.</p>
        <button className="btn plain-link" onClick={() => setPreview(!preview)}>{preview ? 'Hide the message' : 'See what will be sent'}</button>
        {preview && <textarea className="input mono" readOnly value={message} rows={16} onFocus={(e) => e.currentTarget.select()} />}
      </section>

      <section className="section">
        <div className="card">
          <div className="eyebrow">Keep in mind</div>
          <p className="body">Claude can’t hear your accent. It only sees what you type or what voice mode transcribes, and it can make mistakes in Egyptian dialect. Treat it as practice, verify anything it marks “CHECK THIS”, and listen to real Egyptian speakers alongside it.</p>
        </div>
      </section>
    </Page>
  );
}
