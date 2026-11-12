import { useEffect, useState } from 'react';
import { Ar, Page, Segmented, SpeakButton } from '../components/ui';
import { resetAll } from '../lib/db';
import { useSettings } from '../lib/hooks';
import { arabicVoice, speechSupported } from '../lib/speech';

const KEY: [string, string, string][] = [
  ['3', 'ع', 'a squeezed sound from deep in the throat'],
  ['7', 'ح', 'a strong breathy h'],
  ['2', 'ء', 'the catch in “uh-oh”'],
  ['kh', 'خ', 'like “loch”'],
  ['gh', 'غ', 'a gargled sound, like a French r'],
  ['sh', 'ش', 'as in “ship”'],
  ['S D T Z', 'ص ض ط ظ', 'heavy versions of s, d, t, z'],
  ['aa ii uu', 'ا ي و', 'long vowels: hold them twice as long'],
];

export default function Settings() {
  const [s, set] = useSettings();
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => bump((n) => n + 1);
    window.addEventListener('yalla-voices', f);
    const t = setTimeout(f, 600); // voices often load a moment after startup
    return () => { window.removeEventListener('yalla-voices', f); clearTimeout(t); };
  }, []);
  const voice = arabicVoice();

  return (
    <Page>
      <header className="hero plain"><h1 className="large-title">Settings</h1></header>

      <section className="section">
        <h2>Reading help</h2>
        <div className="card">
          <div className="row between">
            <div>
              <div className="li-title">Show the Latin-letter guide</div>
              <div className="foot">Turn this off once you can read a little. You can still tap a hidden guide to peek.</div>
            </div>
            <button role="switch" aria-checked={s.showGuide} aria-label="Show the Latin-letter guide" className={`toggle${s.showGuide ? ' on' : ''}`} onClick={() => set({ showGuide: !s.showGuide })} />
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Voice</h2>
        <div className="card stack">
          {!speechSupported() ? (
            <p className="body">This browser can’t read text aloud.</p>
          ) : voice ? (
            <p className="body">Using your device’s voice <b>{voice.name}</b> ({voice.lang}). It speaks standard Arabic, not an Egyptian accent.</p>
          ) : (
            <p className="body">No Arabic voice was found on this device. On iPhone, add one in <b>Settings → Accessibility → Spoken Content → Voices → Arabic</b>, then reopen the app.</p>
          )}
          <div className="row between">
            <span className="li-title">Speed</span>
            <Segmented value={String(s.rate)} onChange={(v) => set({ rate: Number(v) })} options={[{ value: '0.6', label: 'Slow' }, { value: '0.8', label: 'Normal' }, { value: '1', label: 'Fast' }]} />
          </div>
          <SpeakButton text="أهلاً وسهلاً" label="Test the voice" />
        </div>
      </section>

      <section className="section">
        <h2>Pronunciation key</h2>
        <div className="card">
          <p className="sub" style={{ marginTop: 0 }}>The guide uses the same style Egyptians text in, with numbers for sounds English has no letter for.</p>
          <div className="key">
            {KEY.map(([g, ar, d]) => (
              <div key={g} className="key-row">
                <b>{g}</b>
                <Ar size={24}>{ar}</Ar>
                <span className="sub">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>About the lessons</h2>
        <div className="card stack">
          <p className="body">Speaking lessons teach Egyptian Arabic. Reading and writing teach the formal alphabet, which every dialect shares.</p>
          <p className="body">Egyptian has no official spelling, so the Arabic spellings here are common ones. Anything marked <span className="badge check">Check this</span> is something the author wasn’t fully sure of. Verify those with a second source, such as an Egyptian Arabic learner video.</p>
          <p className="body">An app can teach you the basics. Fluency comes from listening to and talking with real people.</p>
        </div>
      </section>

      <section className="section">
        <h2>Your data</h2>
        <div className="card stack">
          <p className="sub" style={{ marginTop: 0 }}>Progress is saved on this device only.</p>
          <button className="btn danger" onClick={async () => { if (confirm('Erase all your progress on this device? This can’t be undone.')) { await resetAll(); location.href = '/'; } }}>Erase my progress</button>
        </div>
      </section>
    </Page>
  );
}
