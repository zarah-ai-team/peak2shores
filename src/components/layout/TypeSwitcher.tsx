'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Client-review typography switcher.
 *
 * Six candidate pairings are wired through `data-type` on <html>; the
 * stylesheet swaps `--font-display` and `--font-ui` per value, so every
 * heading, label and paragraph on the site changes at once. The boot script
 * in layout.tsx applies the stored (or `?type=`) choice before first paint;
 * this component only exposes the control and keeps storage and the URL in
 * step, so a link copied from the address bar reproduces the same view.
 *
 * The panel can be dragged anywhere by its header (position is remembered)
 * and minimised to a small pill so it never has to sit over the text under
 * review.
 *
 * Temporary: remove along with the `data-type` rules once a pairing is chosen.
 */

type TypeOption = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
type Point = { x: number; y: number };

const STORAGE_KEY = 'p2s:type';
const POSITION_KEY = 'p2s:type-pos';
const MINIMISED_KEY = 'p2s:type-min';
const MARGIN = 20;

const OPTIONS: ReadonlyArray<{
  id: TypeOption;
  number: string;
  display: string;
  ui: string;
  /** Font stack used to render the option's own sample glyphs. */
  sample: string;
}> = [
  {
    id: 'a',
    number: '1',
    display: 'Fraunces',
    ui: 'Jost',
    sample: 'var(--font-fraunces), Georgia, serif',
  },
  {
    id: 'b',
    number: '2',
    display: 'GT Super Display',
    ui: 'Jost',
    sample: "'GT Super Display', Georgia, serif",
  },
  {
    id: 'c',
    number: '3',
    display: 'GT Super Display',
    ui: 'Poppins',
    sample: "'GT Super Display', Georgia, serif",
  },
  {
    id: 'd',
    number: '4',
    display: 'Instrument Serif',
    ui: 'Jost',
    sample: 'var(--font-instrument-serif), Georgia, serif',
  },
  {
    id: 'e',
    number: '5',
    display: 'Georgia',
    ui: 'Poppins',
    sample: "Georgia, 'Times New Roman', serif",
  },
  {
    id: 'f',
    number: '6',
    display: 'Cormorant Garamond',
    ui: 'Jost',
    sample: 'var(--font-cormorant), Georgia, serif',
  },
];

function current(): TypeOption {
  const t = document.documentElement.getAttribute('data-type');
  return OPTIONS.some((o) => o.id === t) ? (t as TypeOption) : 'a';
}

function clamp(p: Point, el: HTMLElement | null): Point {
  const w = el?.offsetWidth ?? 0;
  const h = el?.offsetHeight ?? 0;
  return {
    x: Math.min(Math.max(p.x, MARGIN), Math.max(MARGIN, window.innerWidth - w - MARGIN)),
    y: Math.min(Math.max(p.y, MARGIN), Math.max(MARGIN, window.innerHeight - h - MARGIN)),
  };
}

export function TypeSwitcher() {
  const [type, setType] = useState<TypeOption>('a');
  const [minimised, setMinimised] = useState(false);
  // null = default corner (bottom-left) until the user drags it.
  const [pos, setPos] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);
  // null = not checked yet; false = the @font-face exists but no file answered.
  const [gtSuperLoaded, setGtSuperLoaded] = useState<boolean | null>(null);

  const panel = useRef<HTMLDivElement>(null);
  const grab = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    setType(current());
    try {
      const saved = localStorage.getItem(POSITION_KEY);
      if (saved) {
        const p = JSON.parse(saved) as Point;
        if (Number.isFinite(p.x) && Number.isFinite(p.y)) setPos(clamp(p, panel.current));
      }
      setMinimised(localStorage.getItem(MINIMISED_KEY) === '1');
    } catch {
      /* ignore */
    }
    if (!('fonts' in document)) return;
    document.fonts
      .load('1em "GT Super Display"')
      .then((faces) => setGtSuperLoaded(faces.length > 0))
      .catch(() => setGtSuperLoaded(false));
  }, []);

  // Keep a dragged panel on screen if the window shrinks.
  useEffect(() => {
    if (!pos) return;
    const onResize = () => setPos((p) => (p ? clamp(p, panel.current) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos]);

  const select = (next: TypeOption) => {
    setType(next);
    document.documentElement.setAttribute('data-type', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the attribute alone carries the choice for this view */
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('type', next);
      window.history.replaceState(null, '', url);
    } catch {
      /* ignore */
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Buttons inside the header keep their own click behaviour.
    if ((e.target as HTMLElement).closest('button')) return;
    const el = panel.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    grab.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPos({ x: rect.left, y: rect.top });
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setPos(clamp({ x: e.clientX - grab.current.x, y: e.clientY - grab.current.y }, panel.current));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    try {
      if (pos) localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
    } catch {
      /* ignore */
    }
  };

  const placement: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { left: MARGIN, bottom: MARGIN };

  const active = OPTIONS.find((o) => o.id === type) ?? OPTIONS[0];

  return (
    <div
      ref={panel}
      role="group"
      aria-label="Typography preview"
      style={placement}
      className={[
        'fixed z-[90] rounded-lg bg-ink text-ivory shadow-2xl',
        minimised ? 'w-auto' : 'w-[min(300px,calc(100vw-40px))]',
        dragging ? 'select-none' : '',
      ].join(' ')}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="Drag to move"
        className={[
          'flex items-center gap-3 touch-none',
          minimised ? 'px-3 py-2' : 'px-4 pt-3 pb-2',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
      >
        <svg
          width="10"
          height="14"
          viewBox="0 0 10 14"
          fill="currentColor"
          aria-hidden
          className="shrink-0 text-on-dark-muted"
        >
          <circle cx="2.5" cy="2" r="1.3" />
          <circle cx="7.5" cy="2" r="1.3" />
          <circle cx="2.5" cy="7" r="1.3" />
          <circle cx="7.5" cy="7" r="1.3" />
          <circle cx="2.5" cy="12" r="1.3" />
          <circle cx="7.5" cy="12" r="1.3" />
        </svg>

        {minimised ? (
          <span className="flex items-center gap-2 pr-1">
            <span
              aria-hidden
              className="text-[18px] leading-none"
              style={{ fontFamily: active.sample }}
            >
              Aa
            </span>
            <span className="font-ui text-[10px] uppercase leading-none tracking-[0.18em] text-on-dark-muted">
              Option {active.number}
            </span>
          </span>
        ) : (
          <span className="font-ui text-[10px] font-normal uppercase leading-none tracking-[0.18em] text-on-dark-muted">
            Typography · preview
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            const next = !minimised;
            setMinimised(next);
            try {
              localStorage.setItem(MINIMISED_KEY, next ? '1' : '0');
            } catch {
              /* ignore */
            }
          }}
          aria-expanded={!minimised}
          aria-label={minimised ? 'Show typography options' : 'Hide typography options'}
          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-dark-muted transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-acqua"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className={minimised ? 'rotate-180' : ''}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>
      </div>

      {!minimised && (
        <div
          role="radiogroup"
          aria-label="Typography option"
          className="flex max-h-[calc(100vh-120px)] flex-col gap-2 overflow-y-auto px-4 pb-4 pt-1"
        >
          {OPTIONS.map((o) => {
            const checked = type === o.id;
            const pending = o.display === 'GT Super Display' && gtSuperLoaded === false;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => select(o.id)}
                className={[
                  'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acqua',
                  checked
                    ? 'border-ivory/70 bg-ivory/10'
                    : 'border-ivory/15 hover:border-ivory/40 hover:bg-ivory/5',
                ].join(' ')}
              >
                <span
                  aria-hidden
                  className="w-9 shrink-0 text-[26px] leading-none"
                  style={{ fontFamily: o.sample }}
                >
                  Aa
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-ui text-[10px] uppercase leading-none tracking-[0.18em] text-on-dark-muted">
                    Option {o.number}
                  </span>
                  <span className="font-ui text-[13px] font-normal leading-tight">
                    {o.display} <span className="text-on-dark-muted">+</span> {o.ui}
                  </span>
                  {pending && (
                    <span className="font-ui text-[10px] leading-tight text-gorse">
                      GT Super font files pending — showing Georgia
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className={[
                    'ml-auto h-2 w-2 shrink-0 rounded-full',
                    checked ? 'bg-acqua' : 'bg-ivory/20',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
