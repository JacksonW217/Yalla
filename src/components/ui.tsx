import { ArrowLeft, Settings as SettingsIcon, Volume2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSettings } from '../lib/hooks';
import { speak } from '../lib/speech';

/** Arabic text: right-to-left, in the Arabic typeface. */
export function Ar({ children, className = '', size }: { children: ReactNode; className?: string; size?: number }) {
  return (
    <span className={`ar ${className}`} lang="ar" dir="rtl" style={size ? { fontSize: size } : undefined}>
      {children}
    </span>
  );
}

export function SpeakButton({ text, label = 'Listen', small }: { text: string; label?: string; small?: boolean }) {
  const [s] = useSettings();
  return (
    <button type="button" className={`speak${small ? ' sm' : ''}`} onClick={(e) => { e.stopPropagation(); speak(text, s.rate); }} aria-label={label}>
      <Volume2 size={small ? 16 : 18} />
      {!small && <span>{label}</span>}
    </button>
  );
}

/** The Latin-letter pronunciation guide. Hidden (tap to peek) when the setting is off. */
export function Guide({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [s] = useSettings();
  if (s.showGuide) return <span className={`guide ${className}`}>{children}</span>;
  return (
    <span className={`guide hidden ${className}`} tabIndex={0} title="Tap to peek">
      <span className="peek">{children}</span>
    </span>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main className="page">{children}</main>;
}

export function Check() {
  return <span className="badge check" title="The author is not fully sure of this one. Verify it with a second source.">Check this</span>;
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }} />
    </div>
  );
}

/** Go back if there is somewhere to go back to, otherwise to `fallback`. */
export function useBack(fallback = '/') {
  const nav = useNavigate();
  return () => ((window.history.state as { idx?: number } | null)?.idx ? nav(-1) : nav(fallback, { replace: true }));
}

/** Title bar for the main screens. Settings lives behind the gear. */
export function PageHeader({ title, sub, eyebrow, back, gear = true, children }: { title: string; sub?: string; eyebrow?: ReactNode; back?: string; gear?: boolean; children?: ReactNode }) {
  const goBack = useBack(back);
  return (
    <header className="page-head">
      <div className="page-head-row">
        {back && <button className="icon-btn" onClick={goBack} aria-label="Back"><ArrowLeft size={20} /></button>}
        <div className="grow">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1 className={back ? 'title' : 'large-title'}>{title}</h1>
        </div>
        {children}
        {gear && <Link to="/settings" className="icon-btn" aria-label="Settings"><SettingsIcon size={20} /></Link>}
      </div>
      {sub && <p className="sub">{sub}</p>}
    </header>
  );
}
