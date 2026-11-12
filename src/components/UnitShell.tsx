import { ArrowLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './ui';

/** Full-screen frame for a lesson: close button, progress, content, sticky footer. */
export function UnitShell({ title, progress, onBack, children, footer }: { title: string; progress?: number; onBack?: () => void; children: ReactNode; footer?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="unit">
      <div className="unit-top">
        {onBack ? (
          <button className="icon-btn" onClick={onBack} aria-label="Back"><ArrowLeft size={20} /></button>
        ) : (
          <button className="icon-btn" onClick={() => nav('/')} aria-label="Close lesson"><X size={20} /></button>
        )}
        <div className="grow">
          <div className="unit-title">{title}</div>
          {progress !== undefined && <ProgressBar value={progress} />}
        </div>
        {onBack && <button className="icon-btn" onClick={() => nav('/')} aria-label="Close lesson"><X size={20} /></button>}
      </div>
      <div className="unit-body">{children}</div>
      {footer && <div className="unit-foot">{footer}</div>}
    </div>
  );
}

export function DoneCard({ score, onAgain, children }: { score?: { right: number; total: number }; onAgain?: () => void; children?: ReactNode }) {
  const nav = useNavigate();
  const pct = score ? Math.round((score.right / score.total) * 100) : undefined;
  return (
    <div className="done">
      <div className="done-star" aria-hidden />
      <div className="large-title">Lesson complete</div>
      {score && <p className="sub">You got {score.right} of {score.total} right first time ({pct}%).{pct !== undefined && pct < 80 ? ' Running it again tomorrow will help it stick.' : ''}</p>}
      {children}
      <button className="btn" onClick={() => nav('/')}>Back to lessons</button>
      {onAgain && <button className="btn secondary" onClick={onAgain}>Practise again</button>}
    </div>
  );
}
