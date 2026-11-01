'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type RouteStep = {
  /** The marker the stay is at; -1 when it is not on the route. */
  at: number;
  /** How many legs of the route lead there. */
  legs: number;
  name: string;
  /** The marker's name for it: "Stresa" for "Stresa & Lake Maggiore". */
  pin: string;
  /** "Days 1–3", "Day 6" or "Along the way". */
  days: string;
  /** "3 nights", or empty for a stop along the way. */
  nights: string;
  tagline: string;
  text: string;
  moment?: string;
  hotel?: { name: string; url?: string };
  img?: string;
  alt: string;
  /** The part of the journey this stay begins. */
  part?: { title: string; sub?: string };
};

type Leg = { d: string; mode: 'road' | 'rail' | 'boat' };
type Marker = { name: string; x: number; y: number; side: 'l' | 'r' };

/** How long the map rests on each stay while it plays, and on the whole route. */
const DWELL = 4200;
const OVERVIEW = 3000;
/** How close the camera comes to a stay. */
const ZOOM = 1.75;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The itinerary, live: the map follows the stays as you read them. Scrolling
 * down the days moves the map with you — the stay at your eye line lights in
 * the list, the camera glides and closes in on its place, the route draws the
 * leg that led there and a marker travels along it. Above the first stay the
 * map shows the whole route. Opening a stay, or a place on the map, takes you
 * there. The play button tours the stays on its own instead (the pointer over
 * the map pauses it), and any scroll hands the map back to your reading.
 *
 * The land is drawn on the server and handed in as `children`.
 */
export function RouteLive({
  W,
  H,
  legs,
  markers,
  steps,
  label,
  summary,
  ends,
  legend,
  children,
}: {
  W: number;
  H: number;
  legs: Leg[];
  markers: Marker[];
  steps: RouteStep[];
  label: string;
  summary: string;
  ends: string;
  legend: { mode: Leg['mode']; label: string }[];
  children: ReactNode;
}) {
  // The stay the map is on (-1: the whole route), and the one opened in the list.
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const side = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  // A chosen stay holds the map a moment, while its body opens and the page settles.
  const holdUntil = useRef(0);
  const n = steps.length;

  /* Follow the reading: the stay whose top has passed the eye line is the one
     on the map. The eye line sits 45% down a desktop screen, and just under
     the map where the map rides above the stays (tablet and phone). */
  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    let raf = 0;
    let last = Number.NaN;
    const read = () => {
      raf = 0;
      if (performance.now() < holdUntil.current) return;
      const vh = window.innerHeight;
      const stacked = window.matchMedia('(max-width: 1023px)').matches;
      const mapFoot = stacked && side.current ? side.current.getBoundingClientRect().bottom : 0;
      const line = stacked ? mapFoot + (vh - mapFoot) * 0.2 : vh * 0.45;
      const items = Array.from(ol.children) as HTMLElement[];
      let k = -1;
      for (let i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top <= line) k = i;
      }
      if (k === last) return;
      const first = Number.isNaN(last);
      last = k;
      if (first) {
        if (k >= 0) setActive(k);
        return;
      }
      setPlaying(false);
      setActive(k);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = frame.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), {
      threshold: 0.45,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The clock: each stay for DWELL, the whole route for OVERVIEW, round again.
  useEffect(() => {
    if (!playing || !inView || held || n < 2) return;
    const t = window.setTimeout(
      () => setActive((a) => (a + 1 >= n ? -1 : a + 1)),
      active === -1 ? OVERVIEW : DWELL,
    );
    return () => window.clearTimeout(t);
  }, [playing, inView, held, active, n]);

  /** A visitor's choice: the map goes there and stays; the stay opens, or closes. */
  const choose = (k: number) => {
    holdUntil.current = performance.now() + 900;
    setPlaying(false);
    setActive(k);
    setOpen((o) => (o === k ? -1 : k));
  };

  const step = active >= 0 ? steps[active] : null;
  const here = step && step.at >= 0 ? markers[step.at] : null;

  // The camera: centred on the place, never past the edge of the map.
  const s = here ? ZOOM : 1;
  const tx = here ? clamp(W / 2 - here.x * s, W - W * s, 0) : 0;
  const ty = here ? clamp(H / 2 - here.y * s, H - H * s, 0) : 0;
  const cam = {
    transform: `translate(${(tx / W) * 100}%, ${(ty / H) * 100}%) scale(${s})`,
    '--s': s,
  } as CSSProperties;

  // The route so far: up to the stay shown, or all of it.
  const drawn = step ? step.legs : legs.length;
  const reached = new Set(
    step ? steps.slice(0, active + 1).map((x) => x.at) : markers.map((_, i) => i),
  );
  // Between rounds the traveller waits, unseen, at the first place.
  const tr = here ?? markers[Math.max(0, steps[0]?.at ?? 0)];

  return (
    <section className="jy jr" id="itinerary" aria-labelledby="jr-h">
      <div className="jr-side" ref={side}>
        <div className="jr-stick">
          <div
            ref={frame}
            className="jr-frame"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            <div className="jr-cam" style={cam}>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
                {children}
                <defs>
                  {legs.map((leg, i) => (
                    <mask
                      key={i}
                      id={`jr-m-${i}`}
                      maskUnits="userSpaceOnUse"
                      x={-W}
                      y={-H}
                      width={W * 3}
                      height={H * 3}
                    >
                      <path
                        className={`jr-reveal${i < drawn ? ' on' : ''}`}
                        d={leg.d}
                        pathLength={1}
                      />
                    </mask>
                  ))}
                </defs>
                {legs.map((leg, i) => (
                  <g key={i} className={`jr-leg is-${leg.mode}`}>
                    <path
                      className="glow"
                      d={leg.d}
                      mask={`url(#jr-m-${i})`}
                      vectorEffect="non-scaling-stroke"
                    />
                    <path className="base" d={leg.d} vectorEffect="non-scaling-stroke" />
                    <path
                      className="on"
                      d={leg.d}
                      mask={`url(#jr-m-${i})`}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
              </svg>

              <div className="jr-pins">
                <span
                  className={`jr-traveller${here ? ' on' : ''}`}
                  aria-hidden
                  style={{ left: `${(tr.x / W) * 100}%`, top: `${(tr.y / H) * 100}%` }}
                />
                {markers.map((m, i) => {
                  const k = steps.findIndex((x) => x.at === i);
                  return (
                    <button
                      key={m.name}
                      type="button"
                      className={`jr-pin${here === m ? ' here' : ''}${reached.has(i) ? ' seen' : ''}`}
                      data-side={m.side}
                      style={{ left: `${(m.x / W) * 100}%`, top: `${(m.y / H) * 100}%` }}
                      onClick={k >= 0 ? () => choose(k) : undefined}
                      aria-label={k >= 0 ? `${steps[k].name}, ${steps[k].days}` : m.name}
                    >
                      <span className="dot" aria-hidden />
                      <span className="nm" aria-hidden>
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="jr-vig" aria-hidden />

            <span className="jr-pill" aria-live="polite">
              <i aria-hidden />
              {step
                ? step.nights
                  ? `${step.pin} · ${step.nights}`
                  : `${step.pin} · ${step.days}`
                : 'The whole route'}
            </span>
            <button
              type="button"
              className="jr-play"
              onClick={() => {
                if (!playing) setOpen(-1);
                setPlaying(!playing);
              }}
              aria-label={playing ? 'Pause the route' : 'Play the route'}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                {playing ? <path d="M9 6v12M15 6v12" /> : <path d="M8 5.5v13l11-6.5z" />}
              </svg>
            </button>
          </div>

          <div className="jr-foot">
            <span>{summary}</span>
            <span className="jr-key">
              {legend.map((l) => (
                <span key={l.mode}>
                  <svg aria-hidden viewBox="0 0 28 6" width="28" height="6">
                    <path className={`is-${l.mode}`} d="M1 3 H27" />
                  </svg>
                  {l.label}
                </span>
              ))}
            </span>
            <span>{ends}</span>
          </div>
        </div>
      </div>

      <div className="jr-main">
        <p className="lab">
          <span aria-hidden />
          Stay by stay
        </p>
        <h2 id="jr-h">Itinerary</h2>
        <ol className="jr-stays" ref={list}>
          {steps.map((x, k) => (
            <li key={x.name} className={k === active ? 'on' : undefined}>
              {x.part && (
                <div className="jr-part">
                  <span>{x.part.title}</span>
                  {x.part.sub && <small>{x.part.sub}</small>}
                </div>
              )}
              <div className="jr-stay">
                <span className="jr-node" aria-hidden />
                <button
                  type="button"
                  className="jr-acc"
                  aria-expanded={open === k}
                  aria-controls={`jr-b-${k}`}
                  onClick={() => choose(k)}
                >
                  <span className="hd">
                    <span className="row">
                      <span className="jr-tag">
                        <svg viewBox="0 0 24 24" aria-hidden>
                          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                        {x.name}
                      </span>
                      <span className="when">{x.nights ? `${x.days} · ${x.nights}` : x.days}</span>
                    </span>
                    <span className="tl">{x.tagline}</span>
                  </span>
                  <span className="chev" aria-hidden>
                    <svg viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`jr-b-${k}`}
                  className={`jr-body${open === k ? ' on' : ''}`}
                  inert={open !== k}
                >
                  <div>
                    <div className="in">
                      <div className="tx">
                        <p>{x.text}</p>
                        {x.moment && (
                          <p className="mo">
                            <b>A Peaks2Shores moment</b>
                            {x.moment}
                          </p>
                        )}
                        {x.hotel &&
                          (x.hotel.url ? (
                            <a
                              className="ht"
                              href={x.hotel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Bed />
                              <span>{x.hotel.name}</span>
                            </a>
                          ) : (
                            <span className="ht">
                              <Bed />
                              <span>{x.hotel.name}</span>
                            </span>
                          ))}
                      </div>
                      {x.img && (
                        <span className="ph">
                          <Image
                            src={x.img}
                            alt={x.alt}
                            fill
                            sizes="(min-width: 1100px) 15rem, 40vw"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Bed() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M3 18V7" />
      <path d="M3 13h18v5" />
      <path d="M21 13v-1.5a2.5 2.5 0 0 0-2.5-2.5H11v4" />
      <circle cx="7" cy="10.5" r="1.6" />
    </svg>
  );
}
