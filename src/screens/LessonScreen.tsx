import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Quiz } from '../components/Quiz';
import { DoneCard, UnitShell } from '../components/UnitShell';
import { Ar, Check, Guide, SpeakButton } from '../components/ui';
import { FlagButton } from '../components/FlagButton';
import { LESSON_MAP, stripMarks, type Phrase } from '../data/lessons';
import { markDone } from '../lib/cards';
import { record } from '../lib/db';
import { lessonQuestions } from '../lib/questions';
import { shuffle } from '../lib/util';

function PhraseCard({ p }: { p: Phrase }) {
  const who = p.self ? ['If you’re a man', 'If you’re a woman'] : ['To a man', 'To a woman'];
  return (
    <div className="card phrase">
      <div className="row between top">
        <div className="sub grow">{p.en}</div>
        {p.check && <Check />}
        <FlagButton id={p.id} />
      </div>
      <div className="phrase-line">
        <div className="grow">
          {p.f && <div className="foot">{who[0]}</div>}
          <Ar className="phrase-ar">{p.ar}</Ar>
          <div><Guide>{p.guide}</Guide></div>
        </div>
        <SpeakButton text={p.ar} small />
      </div>
      {p.f && (
        <div className="phrase-line">
          <div className="grow">
            <div className="foot">{who[1]}</div>
            <Ar className="phrase-ar">{p.f.ar}</Ar>
            <div><Guide>{p.f.guide}</Guide></div>
          </div>
          <SpeakButton text={p.f.ar} small />
        </div>
      )}
      {p.reply && (
        <div className="phrase-line reply">
          <div className="grow">
            <div className="foot">The reply · {p.reply.en}</div>
            <Ar className="phrase-ar">{p.reply.ar}</Ar>
            <div><Guide>{p.reply.guide}</Guide></div>
          </div>
          <SpeakButton text={p.reply.ar} small />
        </div>
      )}
      {p.note && <p className="note">{p.note}</p>}
      {p.egypt && <p className="note egypt"><b>In Egypt:</b> {p.egypt}</p>}
      {p.formal && (
        <p className="note formal"><b>Formal Arabic:</b> <Ar>{p.formal.ar}</Ar> <Guide>{p.formal.guide}</Guide></p>
      )}
    </div>
  );
}

/** Active recall: see the English, say it aloud, then reveal and grade yourself. */
function Recall({ phrases, reading, onDone }: { phrases: Phrase[]; reading?: boolean; onDone: () => void }) {
  // Reading lessons go round twice: first with vowel marks, then without.
  const [pass, setPass] = useState(1);
  const [queue, setQueue] = useState(() => shuffle(phrases));
  const [shown, setShown] = useState(false);
  const [cleared, setCleared] = useState(0);
  const p = queue[0];
  if (!p) return null;
  const grade = (ok: boolean) => {
    void record(`say:${p.id}`, ok);
    const rest = queue.slice(1);
    if (ok) {
      setCleared((c) => c + 1);
      if (!rest.length) {
        if (reading && pass === 1) {
          setPass(2);
          setCleared(0);
          setQueue(shuffle(phrases));
          setShown(false);
          return;
        }
        return onDone();
      }
      setQueue(rest);
    } else {
      const at = Math.min(rest.length, 3);
      setQueue([...rest.slice(0, at), p, ...rest.slice(at)]);
    }
    setShown(false);
  };
  return (
    <div className="recall">
      <div className="foot" style={{ textAlign: 'center' }}>{reading ? `Round ${pass} of 2 · ` : ''}{cleared} of {phrases.length}</div>
      <div className="card recall-card">
        {reading ? (
          <>
            <div className="quiz-ask">{pass === 1 ? 'Read this out loud. What does it mean?' : 'Now without the vowel marks. Read it out loud.'}</div>
            <Ar className="quiz-phrase">{pass === 1 ? p.ar : stripMarks(p.ar)}</Ar>
          </>
        ) : (
          <>
            <div className="quiz-ask">Say this out loud in Egyptian Arabic</div>
            <div className="quiz-word">{p.en}</div>
          </>
        )}
        {shown ? (
          <div className="recall-answer">
            {reading ? <div className="quiz-word">{p.en}</div> : <Ar className="phrase-ar">{p.ar}</Ar>}
            <div className="guide">{p.guide}</div>
            {p.f && <div className="foot">{p.self ? 'If you’re a woman' : 'To a woman'}: {p.f.guide}</div>}
            <SpeakButton text={p.ar} label="Hear it" />
          </div>
        ) : (
          <p className="sub">{reading ? 'Sound it out letter by letter before you look.' : 'Try to say it before you look. Trying first is what makes it stick, even when you get it wrong.'}</p>
        )}
      </div>
      {shown ? (
        <div className="btn-row">
          <button className="btn secondary" onClick={() => grade(false)}>Not yet</button>
          <button className="btn" onClick={() => grade(true)}>{reading ? 'I read it right' : 'I said it right'}</button>
        </div>
      ) : (
        <button className="btn" onClick={() => setShown(true)}>Show the answer</button>
      )}
    </div>
  );
}

export default function LessonScreen() {
  const { id } = useParams();
  const lesson = id ? LESSON_MAP[id] : undefined;
  const [stage, setStage] = useState<'learn' | 'recall' | 'quiz' | 'done'>('learn');
  const [run, setRun] = useState(0);
  const [score, setScore] = useState<{ right: number; total: number }>();
  const questions = useMemo(() => (lesson ? lessonQuestions(lesson) : []), [lesson, run]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!lesson) return <Navigate to="/" replace />;
  const top = () => window.scrollTo(0, 0);
  const reading = lesson.kind === 'reading';

  if (stage === 'done')
    return (
      <UnitShell title={lesson.title}>
        <DoneCard score={score} onAgain={() => { setRun((r) => r + 1); setStage('recall'); }}>
          <p className="sub">{reading ? 'These words now come back in your reviews. Once you know one, its vowel marks disappear.' : 'Next, try these in a real conversation: the Speak tab builds a message for your Claude tutor.'}</p>
        </DoneCard>
      </UnitShell>
    );
  if (stage === 'quiz')
    return (
      <UnitShell title="Meaning check" onBack={() => setStage('recall')}>
        <Quiz key={run} questions={questions} onDone={(s) => { setScore(s); void markDone(`lesson:${lesson.id}`); setStage('done'); }} />
      </UnitShell>
    );
  if (stage === 'recall')
    return (
      <UnitShell title={reading ? 'Read it yourself' : 'Say it yourself'} onBack={() => setStage('learn')}>
        <Recall key={run} phrases={lesson.phrases} reading={reading} onDone={() => { setStage('quiz'); top(); }} />
      </UnitShell>
    );

  return (
    <UnitShell title={lesson.title} footer={<button className="btn" onClick={() => { setStage('recall'); top(); }}>Practise these</button>}>
      <div className="stack">
        <div className="card">
          <div className="eyebrow">{reading ? 'Reading · Formal Arabic' : 'Speaking · Egyptian Arabic'}</div>
          {lesson.intro.map((t) => <p key={t} className="body">{t}</p>)}
          {reading ? (
            <p className="foot">The listen buttons use your phone’s standard Arabic voice, which suits these formal words.</p>
          ) : (
            <p className="foot">The voice is your phone’s standard Arabic voice, so it won’t have an Egyptian accent. Use the Latin-letter guide for the Egyptian sounds, and listen to Egyptian speakers when you can.</p>
          )}
        </div>
        {lesson.phrases.map((p) => <PhraseCard key={p.id} p={p} />)}
      </div>
    </UnitShell>
  );
}
