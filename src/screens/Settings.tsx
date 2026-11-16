import { useEffect, useRef, useState } from 'react';
import { Ar, Page, PageHeader, Segmented, SpeakButton } from '../components/ui';
import { PHRASE_MAP } from '../data/lessons';
import { syncCards } from '../lib/cards';
import { copyText } from '../lib/clipboard';
import { db, exportAll, importAll, resetAll } from '../lib/db';
import { useFlags, useSettings } from '../lib/hooks';
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
  const flags = useFlags();
  const flagged = Object.entries(flags).filter(([id]) => PHRASE_MAP[id]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const flagReport = () =>
    ['Yalla: things I flagged as possibly wrong', ...flagged.map(([id, note]) => `- ${PHRASE_MAP[id].ar} | ${PHRASE_MAP[id].guide} | ${PHRASE_MAP[id].en}${note ? ` — ${note}` : ''} (id: ${id})`)].join('\n');

  const backup = async () => {
    const blob = new Blob([JSON.stringify(await exportAll())], { type: 'application/json' });
    const name = `yalla-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    // On iPhone the share sheet is the reliable way to save a file from a Home Screen app.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (f: File | undefined) => {
    if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      if (!confirm('Replace everything on this device with this backup? Your current progress here will be overwritten.')) return;
      await importAll(json);
      await syncCards();
      setMsg('Backup restored.');
    } catch (e) {
      setMsg(e instanceof Error && e.message.includes('Yalla') ? e.message : 'That file couldn’t be read as a Yalla backup.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Page>
      <PageHeader title="Settings" back="/" gear={false} />

      <section className="section">
        <h2>About you</h2>
        <div className="card">
          <div className="row between">
            <div>
              <div className="li-title">I am a</div>
              <div className="foot">Some Arabic words change with who is speaking. This shows you the right form.</div>
            </div>
            <Segmented value={s.gender || 'none'} onChange={(v) => set({ gender: v === 'none' ? '' : (v as 'm' | 'f') })} options={[{ value: 'm', label: 'Man' }, { value: 'f', label: 'Woman' }, { value: 'none', label: 'Not set' }]} />
          </div>
        </div>
      </section>

      <section className="section">
        <h2>New words</h2>
        <div className="card">
          <div className="row between">
            <div>
              <div className="li-title">New core words per day</div>
              <div className="foot">Every new word adds reviews for weeks afterwards, so a few a day is the sustainable pace.</div>
            </div>
            <Segmented value={String(s.newWords)} onChange={(v) => set({ newWords: Number(v) })} options={[{ value: '0', label: 'Off' }, { value: '5', label: '5' }, { value: '10', label: '10' }]} />
          </div>
        </div>
      </section>

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
        <h2>Flagged as possibly wrong</h2>
        <div className="card">
          {flagged.length === 0 ? (
            <p className="sub" style={{ marginTop: 0 }}>Nothing flagged. Tap the small flag on any word or phrase that looks wrong, and it will be listed here.</p>
          ) : (
            <>
              {flagged.map(([id, note]) => (
                <div key={id} className="flag-row">
                  <div className="grow">
                    <div><Ar>{PHRASE_MAP[id].ar}</Ar> <span className="guide">{PHRASE_MAP[id].guide}</span></div>
                    <div className="sub">{PHRASE_MAP[id].en}</div>
                    {note && <div className="foot">Your note: {note}</div>}
                  </div>
                  <button className="btn sm secondary" onClick={() => db.kv.delete(`flag:${id}`)}>Clear</button>
                </div>
              ))}
              <button className="btn secondary" style={{ marginTop: 12 }} onClick={async () => setMsg((await copyText(flagReport())) ? 'List copied. Paste it to Claude to get these checked and fixed.' : 'Couldn’t copy the list.')}>Copy list to send for fixing</button>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Your data</h2>
        <div className="card stack">
          <p className="sub" style={{ marginTop: 0 }}>Progress is saved on this device only. Save a backup now and then, especially before getting a new phone.</p>
          <button className="btn secondary" onClick={backup}>Save a backup file</button>
          <button className="btn secondary" onClick={() => fileRef.current?.click()}>Restore from a backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void restore(e.target.files?.[0])} />
          {msg && <p className="note" role="status">{msg}</p>}
          <button className="btn danger" onClick={async () => { if (confirm('Erase all your progress on this device? This can’t be undone.')) { await resetAll(); location.href = '/'; } }}>Erase my progress</button>
        </div>
      </section>
    </Page>
  );
}
