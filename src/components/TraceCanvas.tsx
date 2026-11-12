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
  /** A dot or separate stroke is missing. */
  missingPiece: boolean;
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

function bbox(mask: Uint8Array) {
  let x0 = N, y0 = N, x1 = -1, y1 = -1;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (mask[y * N + x]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return x1 < 0 ? undefined : { x0: x0 / N, y0: y0 / N, x1: (x1 + 1) / N, y1: (y1 + 1) / N };
}

/** Connected pieces of the letter (main body, each dot or dot cluster). */
function components(mask: Uint8Array): number[][] {
  const seen = new Uint8Array(mask.length);
  const out: number[][] = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || seen[i]) continue;
    const comp: number[] = [];
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop()!;
      comp.push(j);
      const x = j % N, y = (j / N) | 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
          const k = ny * N + nx;
          if (mask[k] && !seen[k]) {
            seen[k] = 1;
            stack.push(k);
          }
        }
    }
    if (comp.length >= 12) out.push(comp);
  }
  return out;
}

/** Move and scale strokes so their bounding box sits on the letter's (shape kept). */
function normalize(strokes: Pt[][], target: { x0: number; y0: number; x1: number; y1: number }): Pt[][] {
  const pts = strokes.flat();
  if (!pts.length) return strokes;
  const ux0 = Math.min(...pts.map((p) => p[0])), ux1 = Math.max(...pts.map((p) => p[0]));
  const uy0 = Math.min(...pts.map((p) => p[1])), uy1 = Math.max(...pts.map((p) => p[1]));
  const gw = target.x1 - target.x0, gh = target.y1 - target.y0;
  const uw = ux1 - ux0, uh = uy1 - uy0;
  const s = Math.hypot(gw, gh) / Math.max(Math.hypot(uw, uh), 1e-3);
  const ucx = (ux0 + ux1) / 2, ucy = (uy0 + uy1) / 2;
  const gcx = (target.x0 + target.x1) / 2, gcy = (target.y0 + target.y1) / 2;
  return strokes.map((st) => st.map(([x, y]) => [gcx + (x - ucx) * s, gcy + (y - ucy) * s] as Pt));
}

/**
 * Shape check. Measures how much of the letter your strokes cover, how much
 * of your ink falls outside it, and whether every separate piece (the body and
 * each dot) was written. When `free` is set (copy / memory), your writing is
 * first moved and scaled onto the letter, so size and position don't matter
 * but shape does. It can't judge stroke order or direction.
 */
export function scoreTrace(text: string, strokes: Pt[][], free = false): TraceResult {
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = c.height = N;
    return c.getContext('2d', { willReadFrequently: true })!;
  };
  const g = mk();
  drawGlyph(g, text, N, 'fill');
  const glyph = alpha(g);
  const t = mk();
  drawGlyph(t, text, N, 'stroke', N * 0.1);
  const tolerant = alpha(t);
  const gb = bbox(glyph);
  const user = free && gb ? normalize(strokes, gb) : strokes;
  const thick = mk();
  drawStrokes(thick, user, N, N * 0.075);
  const userThick = alpha(thick);
  const thin = mk();
  drawStrokes(thin, user, N, N * 0.035);
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
  const pieces = components(glyph).map((c) => c.filter((i) => userThick[i]).length / c.length);
  const weakest = pieces.length ? Math.min(...pieces) : 0;
  const coverage = gN ? gHit / gN : 0;
  const stray = uN ? uOut / uN : 1;
  const missingPiece = pieces.length > 1 && weakest < 0.5;
  const verdict: TraceResult['verdict'] =
    coverage >= 0.82 && stray <= 0.14 && weakest >= 0.6 ? 'good' : coverage >= 0.6 && stray <= 0.3 && !missingPiece ? 'close' : 'retry';
  return { coverage, stray, verdict, missingPiece };
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
    drawStrokes(ctx, strokes.current, w, Math.max(6, w * 0.04));
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
    const r = scoreTrace(text, strokes.current, mode !== 'trace');
    setResult(r);
    onResult?.(r);
  };

  const has = strokes.current.length > 0;
  const msg =
    result &&
    (result.verdict === 'good'
      ? 'Nice — that matches the shape.'
      : result.stray > 0.3
        ? 'Too much of your writing is outside the letter. Slow down and follow the shape.'
        : result.missingPiece
          ? 'A dot or part of the letter is missing. Check the dots: how many, and above or below?'
          : result.coverage < 0.6
            ? 'Part of the letter is missing. Compare with the shape and try again.'
            : 'Close, but not quite. Tighten it up and try again.');

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
