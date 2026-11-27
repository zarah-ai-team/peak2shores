'use client';

import Image from 'next/image';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

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
  /** The stay's days in Marc's words, listed in place of `text` where he has written them. */
  program?: { n: number; title: string; text: string }[];
  moment?: string;
  img?: string;
  alt: string;
  /** The part of the journey this stay begins. */
  part?: { title: string; sub?: string };
};

type Leg = { d: string; mode: 'road' | 'rail' | 'boat' };
type Marker = { name: string; x: number; y: number; side: 'l' | 'r' };
/** Where a place's name sits: right or left of its dot (chosen on the server), or above or below it. */
type Side = Marker['side'] | 't' | 'b';
/** A name's side, and how far a name above or below its dot is slid along to stay on the map (px). */
type Name = { side: Side; nx: number };
/** A box on the map, in px from the frame's top left corner. */
type Box = { l: number; t: number; r: number; b: number };

/** How long the map rests on each stay while it plays, and on the whole route. */
const DWELL = 4200;
const OVERVIEW = 3000;
/** How close the camera comes to a stay. */
const ZOOM = 1.75;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const overlap = (a: Box, c: Box) =>
  Math.max(0, Math.min(a.r, c.r) - Math.max(a.l, c.l)) *
  Math.max(0, Math.min(a.b, c.b) - Math.max(a.t, c.t));

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
  after,
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
  /** A row under the stays (the optional extension). */
  after?: ReactNode;
  children: ReactNode;
}) {
  // The stay the map is on (-1: the whole route), and the one opened in the list.
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);
  // The map's tiles are fetched once the reader comes near the map.
  const [near, setNear] = useState(false);
  // Where each place's name sits, once measured against the frame.
  const [names, setNames] = useState<Name[]>([]);
  // How far the whole route's view is lifted on a phone (canvas units).
  const [lift, setLift] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const side = useRef<HTMLDivElement>(null);
  const pins = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  // A chosen stay holds the map a moment, while its body opens and the page settles.
  const holdUntil = useRef(0);
  /* Opening a stay below the open one closes that one at once (`snap`), and the
     page moves by what it lost, so the stay just chosen stays where it was
     pressed rather than leaping off the top of the screen (a stay with its
     days is long: The Soul of Sicily). `anchor` is where its button was. */
  const [snap, setSnap] = useState(-1);
  const anchor = useRef<{ k: number; top: number } | null>(null);
  const n = steps.length;

  /* Follow the reading: the stay whose top has passed the eye line is the one
     on the map. The eye line sits just under the map where the map rides
     pinned above the stays (tablet and phone), and 45% down the screen where
     it does not (beside the stays on a laptop; scrolled away on a short
     screen). */
  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    let raf = 0;
    let last = Number.NaN;
    const read = () => {
      raf = 0;
      if (performance.now() < holdUntil.current) return;
      const vh = window.innerHeight;
      const el = side.current;
      const mapFoot =
        el && getComputedStyle(el).position === 'sticky' ? el.getBoundingClientRect().bottom : null;
      const line = mapFoot !== null ? mapFoot + (vh - mapFoot) * 0.2 : vh * 0.45;
      const items = Array.from(ol.children) as HTMLElement[];
      let k = -1;
      for (let i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top <= line) k = i;
      }
      // Once the foot of the list is well up the screen, the map is on the
      // last stay (Milan), while the whole itinerary is still in view.
      const foot = ol.getBoundingClientRect().bottom;
      if (items.length && foot <= vh * 0.88 && items[0].getBoundingClientRect().top < vh * 0.5)
        k = items.length - 1;
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

  /* The tiles (the children) are 30 images, nearly 1 MB: they are asked for
     as the reader comes within 600px of the map, not with the page (the map
     is 1.5 to 8 screens down). Until then the frame shows the same blue-grey
     ground they load over. */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* On a phone held upright the map shows a band across the middle of the
     canvas. For the whole route that band is taken a little lower (7% of the
     canvas, as far as the canvas reaches), so the route sits higher, clear of
     the play button and the credit at the frame's foot (the owner's decision
     of 19 November 2026); never so far that the route's first place north
     comes within 1rem of the frame's top. In canvas units; nothing where the
     frame shows the whole canvas. */
  useEffect(() => {
    const el = frame.current;
    const camEl = pins.current?.parentElement;
    if (!el || !camEl) return;
    const phone = window.matchMedia('(max-width: 640px)');
    const north = Math.min(...markers.map((m) => m.y));
    const measure = () => {
      const ch = camEl.offsetHeight;
      const spare = (ch - el.clientHeight) / 2 - 1;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const room = (north / H) * ch - spare - 1 - rem;
      const px = Math.min(spare, room);
      setLift(phone.matches && px > 0 ? Math.min(0.07 * H, (px / ch) * H) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    phone.addEventListener('change', measure);
    return () => {
      ro.disconnect();
      phone.removeEventListener('change', measure);
    };
  }, [H, markers]);

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
    if (open >= 0 && open < k) {
      const button = list.current?.children[k]?.querySelector('.jr-acc');
      if (button) anchor.current = { k, top: button.getBoundingClientRect().top };
      setSnap(open);
    }
    setOpen((o) => (o === k ? -1 : k));
  };

  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    const button = list.current?.children[a.k]?.querySelector('.jr-acc');
    if (button) {
      const by = button.getBoundingClientRect().top - a.top;
      if (Math.abs(by) > 1) window.scrollBy({ top: by, behavior: 'instant' });
    }
    // The next stay closed is closed slowly again.
    const t = window.setTimeout(() => setSnap(-1), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const step = active >= 0 ? steps[active] : null;
  const here = step && step.at >= 0 ? markers[step.at] : null;

  // The camera: centred on the place, never past the edge of the map; for the
  // whole route, lifted on a phone (above).
  const s = here ? ZOOM : 1;
  const tx = here ? clamp(W / 2 - here.x * s, W - W * s, 0) : 0;
  const ty = here ? clamp(H / 2 - here.y * s, H - H * s, 0) : -lift;
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
  const hereAt = here ? markers.indexOf(here) : -1;

  /* Each place's name sits on the side of its dot chosen on the server. Where
     the map is drawn smaller than on a laptop, a place near its edge could
     have its name run out of the frame ("or Valley"), and on a small map the
     names crowd: for the view the camera is moving to, a name that would be
     cut, or lie over another place or under what sits on the map (the pill,
     the play button, the credit), goes to the other side, or above or below
     its dot (slid along to stay on the map), wherever it is most whole and
     clear. A place just off the map turns its name away from it, so that no
     name, or part of one ("ontreux"), shows without its dot. */
  useEffect(() => {
    const el = frame.current;
    const layer = pins.current;
    const camEl = layer?.parentElement;
    if (!el || !layer || !camEl) return;
    const small = window.matchMedia('(max-width: 1279.98px), (pointer: coarse)');
    let live = true;
    const place = () => {
      if (!live) return;
      const next: Name[] = markers.map((m) => ({ side: m.side, nx: 0 }));
      if (small.matches) {
        const fw = el.clientWidth;
        const fh = el.clientHeight;
        // The camera's box is centred in the frame (on a laptop it is the frame).
        const cw = camEl.offsetWidth;
        const ch = camEl.offsetHeight;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const fr = el.getBoundingClientRect();
        const over = Array.from(el.querySelectorAll('.jr-pill, .jr-play, .jr-attr'), (c) => {
          const r = c.getBoundingClientRect();
          return {
            l: r.left - fr.left,
            t: r.top - fr.top,
            r: r.right - fr.left,
            b: r.bottom - fr.top,
          };
        });
        const tags = Array.from(layer.querySelectorAll<HTMLElement>('.jr-pin .nm'));
        const at = markers.map((m) => ({
          x: (fw - cw) / 2 + ((m.x * s + tx) / W) * cw,
          y: (fh - ch) / 2 + ((m.y * s + ty) / H) * ch,
        }));
        const dot = ({ x, y }: { x: number; y: number }): Box => ({
          l: x - rem / 2,
          t: y - rem / 2,
          r: x + rem / 2,
          b: y + rem / 2,
        });
        // A name's box on a side, with the offsets of itinerary.css; the
        // current place's name is drawn 1.15 times larger. Above or below the
        // dot, it slides along (nx) to stay on the map, as far as the dot's edge.
        const label = (i: number, to: Side): Name & Box => {
          const k = i === hereAt ? 1.15 : 1;
          const w = (tags[i]?.offsetWidth ?? 0) * k;
          const h = tags[i]?.offsetHeight ?? 0;
          const { x, y } = at[i];
          if (to === 'l' || to === 'r') {
            const mid = y - 0.875 * rem + h / 2;
            const l = to === 'r' ? x + rem : x - rem - w;
            return { side: to, nx: 0, l, r: l + w, t: mid - (h * k) / 2, b: mid + (h * k) / 2 };
          }
          const t = to === 't' ? y - 2.25 * rem + h - h * k : y + rem;
          const reach = Math.max(0, w / 2 - rem / 2);
          const nx = Math.round(
            clamp(clamp(0, 2 - (x - w / 2), fw - 2 - (x + w / 2)), -reach, reach),
          );
          return { side: to, nx, l: x - w / 2 + nx, r: x + w / 2 + nx, t, b: t + h * k };
        };
        // How much of a box falls outside the frame, in px².
        const outside = (b: Box) =>
          (Math.max(0, -b.l) + Math.max(0, b.r - fw)) * (b.b - b.t) +
          (Math.max(0, -b.t) + Math.max(0, b.b - fh)) * (b.r - b.l);
        const map: Box = { l: 0, t: 0, r: fw, b: fh };
        for (let i = 0; i < markers.length; i++) {
          const { x, y } = at[i];
          const mine = label(i, next[i].side);
          if (x < 0 || x > fw || y < 0 || y > fh) {
            // A place off the map keeps its name off it too: no name without its dot.
            if (overlap(mine, map) < 1) continue;
            const away: Side = x < 0 ? 'l' : x > fw ? 'r' : y < 0 ? 't' : 'b';
            next[i] = { side: away, nx: 0 };
            continue;
          }
          const others: Box[] = [...over];
          for (let j = 0; j < markers.length; j++) {
            if (j !== i) others.push(dot(at[j]), label(j, next[j].side));
          }
          // What a box loses, in px²: cut off by the frame, or under something.
          const cost = (b: Box) => outside(b) + others.reduce((sum, o) => sum + overlap(b, o), 0);
          // A name touched by no more than a sliver (40px², 2px along it) stays as it is.
          let low = cost(mine);
          if (low <= 40) continue;
          for (const to of [mine.side === 'l' ? 'r' : 'l', 't', 'b'] as const) {
            const b = label(i, to);
            const c = cost(b);
            if (c < low - 0.5) {
              next[i] = { side: b.side, nx: b.nx };
              low = c;
            }
          }
        }
      }
      const key = (a: Name[]) => a.map((x) => x.side + x.nx).join();
      setNames((was) => (key(was) === key(next) ? was : next));
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    small.addEventListener('change', place);
    // Once the names' font has come in, they are measured again.
    void document.fonts?.ready.then(place);
    return () => {
      live = false;
      ro.disconnect();
      small.removeEventListener('change', place);
    };
  }, [markers, W, H, s, tx, ty, hereAt, active]);

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
                {near ? children : null}
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

              <div className="jr-pins" ref={pins}>
                <span
                  className={`jr-traveller${here ? ' on' : ''}`}
                  aria-hidden
                  style={{ left: `${(tr.x / W) * 100}%`, top: `${(tr.y / H) * 100}%` }}
                />
                {markers.map((m, i) => {
                  const k = steps.findIndex((x) => x.at === i);
                  const nx = names[i]?.nx;
                  /* Out of the Tab order: a place can be outside the part of
                     the map shown, and each has its row in the stays below,
                     which does the same. A tap or a click still takes it. */
                  return (
                    <button
                      key={m.name}
                      type="button"
                      tabIndex={-1}
                      className={`jr-pin${here === m ? ' here' : ''}${reached.has(i) ? ' seen' : ''}`}
                      data-side={names[i]?.side ?? m.side}
                      style={
                        {
                          left: `${(m.x / W) * 100}%`,
                          top: `${(m.y / H) * 100}%`,
                          '--nx': nx ? `${nx}px` : undefined,
                        } as CSSProperties
                      }
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
            <span className="jr-attr">Map: Esri, HERE, Garmin, USGS</span>

            <span className="jr-pill" aria-live="polite" data-whole={step ? undefined : ''}>
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
                  className={`jr-body${open === k ? ' on' : ''}${snap === k ? ' snap' : ''}`}
                  inert={open !== k}
                >
                  <div>
                    <div className="in">
                      <div className="tx">
                        {x.program?.length ? (
                          <ol className="jr-days">
                            {x.program.map((d) => (
                              <li key={d.n}>
                                <span className="dn">Day {d.n}</span>
                                <span className="dh">{d.title}</span>
                                <p>{d.text}</p>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p>{x.text}</p>
                        )}
                        {x.moment && (
                          <p className="mo">
                            <b>A Peaks2Shores moment</b>
                            {x.moment}
                          </p>
                        )}
                      </div>
                      {x.img && (
                        <span className="ph">
                          <Image
                            src={x.img}
                            alt={x.alt}
                            fill
                            sizes="(max-width: 599.98px) and (orientation: portrait) 110vw, (max-width: 1279.98px) 56vw, 21rem"
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
        {after}
      </div>
    </section>
  );
}
