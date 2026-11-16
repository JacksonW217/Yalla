import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { UnitShell } from '../components/UnitShell';
import { Ar, Check, Guide, SpeakButton } from '../components/ui';
import { DIALOGUE_MAP, type Line } from '../data/dialogues';
import { setKV } from '../lib/db';
import { useSettings } from '../lib/hooks';

function Bubble({ line, name, hidden, onReveal }: { line: Line; name: string; hidden?: boolean; onReveal?: () => void }) {
  const mine = line.who === 'you';
  return (
    <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>
      <div className="bubble-who">{mine ? 'You' : name}</div>
      {hidden ? (
        <>
          <div className="bubble-en">Say: “{line.en}”</div>
          <button className="btn sm secondary" onClick={onReveal}>Show the Arabic</button>
        </>
      ) : (
        <>
          <div className="row top">
            <div className="grow">
              <Ar className="bubble-ar">{line.ar}</Ar>
              <div><Guide>{line.guide}</Guide></div>
            </div>
            <SpeakButton text={line.ar} small />
          </div>
          <div className="bubble-en">{line.en}</div>
          {line.fresh && <div className="bubble-new">New: {line.fresh}</div>}
        </>
      )}
    </div>
  );
}

/** Read a conversation through, then play your part from memory, line by line. */
export default function DialogueScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const d = id ? DIALOGUE_MAP[id] : undefined;
  const [settings] = useSettings();
  const [stage, setStage] = useState<'read' | 'play' | 'done'>('read');
  const [at, setAt] = useState(0); // lines revealed so far in role-play
  const [shown, setShown] = useState(false);
  if (!d) return <Navigate to="/lessons" replace />;

  if (stage === 'done')
    return (
      <UnitShell title={d.title}>
        <div className="done">
          <div className="done-star" aria-hidden />
          <div className="large-title">Conversation done</div>
          <p className="sub">Now try it for real: the Speak tab can set up this kind of role-play with your Claude tutor, where the replies aren’t scripted.</p>
          <button className="btn" onClick={() => nav('/speak')}>Go to Speak</button>
          <button className="btn secondary" onClick={() => { setAt(0); setShown(false); setStage('play'); }}>Play it again</button>
          <button className="btn secondary" onClick={() => nav('/lessons', { replace: true })}>Back to lessons</button>
        </div>
      </UnitShell>
    );

  if (stage === 'play') {
    const line = d.lines[at];
    const mine = line?.who === 'you';
    const advance = () => {
      if (at + 1 >= d.lines.length) {
        void setKV(`done:dialogue:${d.id}`, new Date().toISOString());
        return setStage('done');
      }
      setAt(at + 1);
      setShown(false);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
    };
    return (
      <UnitShell
        title={`${d.title} · your turn to speak`}
        progress={at / d.lines.length}
        onBack={() => setStage('read')}
        footer={
          mine && !shown
            ? <p className="foot" style={{ textAlign: 'center', margin: 0 }}>Say your line out loud, then check it.</p>
            : <button className="btn" onClick={advance}>{at + 1 >= d.lines.length ? 'Finish' : mine ? 'I said it — next' : 'Next'}</button>
        }
      >
        <div className="chat">
          {d.lines.slice(0, at + 1).map((l, i) => (
            <Bubble key={i} line={l} name={d.them} hidden={i === at && l.who === 'you' && !shown} onReveal={() => setShown(true)} />
          ))}
        </div>
      </UnitShell>
    );
  }

  return (
    <UnitShell title={d.title} footer={<button className="btn" onClick={() => { setAt(0); setShown(false); setStage('play'); window.scrollTo(0, 0); }}>Play my part</button>}>
      <div className="stack">
        <div className="card">
          <div className="row between top">
            <div className="eyebrow">Conversation · Egyptian Arabic</div>
            {d.check && <Check />}
          </div>
          <p className="body">{d.setting}</p>
          <p className="sub">Read it through and listen. Then you’ll play your part: you’ll see the other person’s line and say yours from memory.</p>
          {settings.gender === 'f' ? (
            <p className="note">This is written for a man speaking to a man. As a woman, change the words about yourself (for example 3aayez becomes 3ayza, Taalib becomes Taaliba), and expect people to say “enti” and “-ik” to you.</p>
          ) : (
            <p className="foot">Written for a man speaking to a man. Talking to a woman, “enta” becomes “enti” and “-ak” endings become “-ik”.</p>
          )}
        </div>
        <div className="chat">
          {d.lines.map((l, i) => <Bubble key={i} line={l} name={d.them} />)}
        </div>
      </div>
    </UnitShell>
  );
}
