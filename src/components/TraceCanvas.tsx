import { Eraser, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TraceMode = 'trace' | 'copy' | 'memory';
type Pt = [number, number]; // 0..1 of the square
export interface TraceResult {
  /** Share of the letter's ink you covered, 0..1. */
  coverage: number;
  /** Share of your ink that fell outside the letter, 0..1. */
  stray: number;
  verdict: 'good' | 'close' | 'retry';
}

const FONT = '"Noto Naskh Arabic", "Geeza Pro", serif';
const N = 160; // scoring grid

/** Draw `text` centred in a w×w box, scaled to fit. Returns nothing; mutates ctx. */
function drawGlyph(ctx: CanvasRenderingContext2D, text: string, w: number, mode: 'fill' | 'stroke', lineWidth = 0) {
  ctx.save();
  ctx.direction = 'rtl';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  let size = w * 0.62;
  ctx.font = `${size}px ${FONT}`;
  let m = ctx.measureText(text);
  let gw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  let gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const scale = Math.min((w * 0.74) / Math.max(gw, 1), (w * 0.7) / Math.max(gh, 1), 1.6);
  size *= scale;
  ctx.font = `${size}px ${FONT}`;
  m = ctx.measureText(text);
  gw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const x = (w - gw) / 2 + m.actualBoundingBoxLeft;
  const y = (w - gh) / 2 + m.actualBoundingBoxAscent;
  if (mode === 'fill') ctx.fillText(text, x, y);
  else {
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Pt[][], w: number, lineWidth: number) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lineWidth;
  for (const s of strokes) {
    if (!s.length) continue;
    ctx.beginPath();
    ctx.moveTo(s[0][0] * w, s[0][1] * w);
    if (s.length === 1) ctx.lineTo(s[0][0] * w + 0.01, s[0][1] * w + 0.01);
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i][0] * w, s[i][1] * w);
    ctx.stroke();
  }
}

const alpha = (ctx: CanvasRenderingContext2D) => {
  const d = ctx.getImageData(0, 0, N, N).data;
  const out = new Uint8Array(N * N);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] > 60 ? 1 : 0;
  return out;
};

/**
 * A loose shape check: how much of the letter did the strokes cover, and how
 * much ink landed outside it. It cannot judge stroke order or fine form, and
 * the UI says so.
 */
export function scoreTrace(text: string, strokes: Pt[][]): TraceResult {
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = c.height = N;
    return c.getContext('2d', { willReadFrequently: true })!;
  };
  const g = mk();
  drawGlyph(g, text, N, 'fill');
  const glyph = alpha(g);
  const t = mk();
  drawGlyph(t, text, N, 'stroke', N * 0.2);
  const tolerant = alpha(t);
  const thick = mk();
  drawStrokes(thick, strokes, N, N * 0.13);
  const userThick = alpha(thick);
  const thin = mk();
  drawStrokes(thin, strokes, N, N * 0.05);
  const userThin = alpha(thin);

  let gN = 0, gHit = 0, uN = 0, uOut = 0;
  for (let i = 0; i < glyph.length; i++) {
    if (glyph[i]) {
      gN++;
      if (userThick[i]) gHit++;
    }
    if (userThin[i]) {
      uN++;
      if (!tolerant[i]) uOut++;
    }
  }
  const coverage = gN ? gHit / gN : 0;
  const stray = uN ? uOut / uN : 1;
  const verdict = coverage >= 0.72 && stray <= 0.22 ? 'good' : coverage >= 0.45 && stray <= 0.45 ? 'close' : 'retry';
  return { coverage, stray, verdict };
}

/**
 * Finger-writing pad. `trace` shows the letter to write over, `copy` shows a
 * small model in the corner, `memory` shows nothing until you check.
 */
export function TraceCanvas({ text, mode, onResult }: { text: string; mode: TraceMode; onResult?: (r: TraceResult) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const guide = useRef<HTMLCanvasElement>(null);
  const ink = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);
  const drawing = useRef(false);
  const [w, setW] = useState(320);
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    document.fonts.load(`100px ${FONT}`, text).then(() => setFontReady(true), () => setFontReady(true));
  }, [text]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.round(el.clientWidth)));
    ro.observe(el);
    setW(Math.round(el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const paintGuide = useCallback(() => {
    const c = guide.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.height = w * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, w);
    // Writing line
    ctx.strokeStyle = css('--line');
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, w * 0.66);
    ctx.lineTo(w * 0.92, w * 0.66);
    ctx.stroke();
    ctx.setLineDash([]);
    const reveal = result !== null;
    if (mode === 'trace' || reveal) {
      ctx.fillStyle = mode === 'trace' && !reveal ? css('--guide') : css('--guide-strong');
      drawGlyph(ctx, text, w, 'fill');
    }
  }, [w, mode, text, result, fontReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const paintInk = useCallback(() => {
    const c = ink.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== w * dpr) c.width = c.height = w * dpr;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, w);
    ctx.strokeStyle = css('--ink');
    drawStrokes(ctx, strokes.current, w, Math.max(5, w * 0.03));
  }, [w]);

  useEffect(paintGuide, [paintGuide]);
  useEffect(paintInk, [paintInk, count]);

  // New letter or mode: start clean.
  useEffect(() => {
    strokes.current = [];
    setResult(null);
    setCount(0);
  }, [text, mode]);

  const pos = (e: React.PointerEvent): Pt => {
    const r = ink.current!.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };
  const down = (e: React.PointerEvent) => {
    if (result) return;
    e.preventDefault();
    ink.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    strokes.current.push([pos(e)]);
    paintInk();
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    strokes.current.at(-1)!.push(pos(e));
    paintInk();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setCount((c) => c + 1);
  };

  const clear = () => {
    strokes.current = [];
    setResult(null);
    setCount(0);
  };
  const undo = () => {
    strokes.current.pop();
    setResult(null);
    setCount((c) => c + 1);
  };
  const check = () => {
    const r = scoreTrace(text, strokes.current);
    setResult(r);
    onResult?.(r);
  };

  const has = strokes.current.length > 0;
  const msg = result && {
    good: 'Nice — that matches the shape well.',
    close: 'Close. Compare your strokes with the letter and try once more.',
    retry: result.coverage < 0.45 ? 'Not quite — some of the letter is missing. Look at the shape and try again.' : 'Your strokes wandered outside the letter. Try again a little slower.',
  }[result.verdict];

  return (
    <div className="trace">
      <div className="trace-pad" ref={wrap} style={{ height: w }}>
        <canvas ref={guide} style={{ width: w, height: w }} />
        <canvas ref={ink} style={{ width: w, height: w, touchAction: 'none' }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label={`Writing pad for ${text}`} />
        {mode === 'copy' && !result && <div className="trace-model ar" lang="ar" dir="rtl">{text}</div>}
        {mode === 'memory' && !result && !has && <div className="trace-hint">Write it from memory</div>}
        <div className="trace-tools">
          <button className="icon-btn" onClick={undo} disabled={!has} aria-label="Undo last stroke"><Undo2 size={18} /></button>
          <button className="icon-btn" onClick={clear} disabled={!has} aria-label="Clear"><Eraser size={18} /></button>
        </div>
      </div>
      {result ? (
        <div className={`trace-result ${result.verdict}`}>
          <div>{msg}</div>
          <button className="btn sm secondary" onClick={clear}>Try again</button>
        </div>
      ) : (
        <button className="btn secondary" onClick={check} disabled={!has}>Check my writing</button>
      )}
    </div>
  );
}
