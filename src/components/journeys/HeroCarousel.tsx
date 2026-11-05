'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  geoBounds,
  geoDistance,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';

type LonLat = [number, number];

export type HeroJourney = {
  slug: string;
  title: string;
  country: string;
  lead: string;
  /** "13 days · 12 nights · Small group" */
  facts: string;
  /** The globe's caption: "Swiss Elegance · Lucerne to Milan". */
  label: string;
  /** The route in order, stop by stop (a stop may come twice). */
  route: LonLat[];
  /** Each place once, with the nights spent there. */
  stops: { name: string; at: LonLat; nights: number }[];
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Where the globe is looking: its centre and its zoom (1 = the whole earth). */
type View = { lon: number; lat: number; k: number };

/** Country names, placed by hand where each reads best once the globe closes in. */
const NAMES: { name: string; at: LonLat }[] = [
  { name: 'Switzerland', at: [7.9, 46.95] },
  { name: 'France', at: [6.3, 45.2] },
  { name: 'Austria', at: [13.6, 47.45] },
  { name: 'Italy', at: [12.4, 43.3] },
  { name: 'Slovenia', at: [14.8, 46.25] },
  { name: 'Croatia', at: [16.4, 45.35] },
  { name: 'Germany', at: [10.4, 48.6] },
];

/** The whole earth, tilted toward Europe — where the page opens and "Stay tuned" returns. */
const EARTH: View = { lon: -18, lat: 24, k: 0.92 };

type Country = Feature<Geometry, { name: string }>;
const atlas: { lo: Country[] | null; hi: Country[] | null } = { lo: null, hi: null };
const load = (file: string) =>
  fetch(file)
    .then((r) => r.json())
    .then(
      (t: Topology<{ countries: GeometryCollection<{ name: string }> }>) =>
        (feature(t, t.objects.countries) as FeatureCollection<Geometry, { name: string }>).features,
    );

/* Each country's extent, worked out once, so a close view paints only what it shows. */
const extent = new WeakMap<Country, [[number, number], [number, number]]>();
const boundsOf = (c: Country) => {
  let b = extent.get(c);
  if (!b) extent.set(c, (b = geoBounds(c)));
  return b;
};

const radius = (w: number, h: number) => Math.min(w, h) * 0.44;
const project = (v: View, w: number, h: number): GeoProjection =>
  geoOrthographic()
    .rotate([-v.lon, -v.lat])
    .translate([w / 2, h / 2])
    .scale(radius(w, h) * v.k)
    .clipAngle(90)
    .precision(0.4);

/** The view that frames a route, with room left around it for the names. */
function frame(route: LonLat[], w: number, h: number): View {
  const lons = route.map((c) => c[0]);
  const lats = route.map((c) => c[1]);
  const lon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const unit = geoOrthographic().rotate([-lon, -lat]).scale(1).translate([0, 0]);
  let mx = 1e-4;
  let my = 1e-4;
  for (const c of route) {
    const [x, y] = unit(c) ?? [0, 0];
    mx = Math.max(mx, Math.abs(x));
    my = Math.max(my, Math.abs(y));
  }
  const r0 = radius(w, h);
  const fit = Math.min((w * 0.3) / (mx * r0), (h * 0.27) / (my * r0));
  // Never closer than about seven degrees across, so the region stays legible.
  const near = w / 7 / ((r0 * Math.PI) / 180);
  return { lon, lat, k: Math.max(1, Math.min(fit, near)) };
}

/* Natural map colours: sea, land, the chosen journey's countries, the route. */
const SEA = '#aad3df';
const LAND = '#ece8d8';
const LAND_LIT = '#d3e0b9';
const BRAND = '#1190cb';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The globe and the journeys under it. Choosing a journey turns the earth to
 * its region and closes in, then draws the route bright with its stops and
 * nights. The last card, "Stay tuned", draws back to the whole earth, turning
 * slowly. With reduced motion every change is immediate.
 */
export function HeroCarousel({ journeys, label }: { journeys: HeroJourney[]; label: string }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const track = useRef<HTMLUListElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const goTo = useRef<(k: number) => void>(() => {});

  const n = journeys.length + 1; // + "Stay tuned"
  const soon = active === journeys.length;
  const j = soon ? null : journeys[active];

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const base = document.createElement('canvas');
    const bctx = base.getContext('2d')!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(el);
    const serif = css.getPropertyValue('--font-display').trim() || 'Georgia, serif';
    const sans = css.getPropertyValue('--font-ui').trim() || 'system-ui, sans-serif';

    let w = 0;
    let h = 0;
    let dpr = 1;
    let view: View = { ...EARTH };
    let target: View = { ...EARTH };
    let tween: { from: View; to: View; t0: number; dur: number; dip: number } | null = null;
    let journey: HeroJourney | null = null;
    let progress = 1;
    let drawFrom = 0;
    let spin = false;
    let stale = true;
    let visible = true;
    let raf = 0;
    let last = 0;

    /* The earth itself, in natural map colours (notes of 5 November 2026): a
       clear sea blue, land in soft sage and sand, the countries of the chosen
       journey a little greener, fine borders, and their names once close
       enough to read. No glow, no dark ground. */
    const paintBase = (hi: boolean) => {
      // The fine coastlines only once close in; the whole earth needs no more than the coarse ones.
      const land = (hi && view.k > 2 && atlas.hi) || atlas.lo;
      const p = project(view, w, h);
      const path = geoPath(p, bctx);
      const r = p.scale();
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, w, h);
      // What part of the earth the frame shows, in degrees, with a margin.
      const reach = Math.min(90, (((Math.hypot(w, h) / 2 / p.scale()) * 180) / Math.PI) * 1.3 + 2);
      const inView = (c: Country) => {
        if (reach >= 90) return true;
        const [[x0, y0], [x1, y1]] = boundsOf(c);
        if (x1 < x0) return true; // crosses the date line
        const dLon = reach / Math.max(0.2, Math.cos((view.lat * Math.PI) / 180));
        return !(
          y1 < view.lat - reach ||
          y0 > view.lat + reach ||
          x1 < view.lon - dLon ||
          x0 > view.lon + dLon
        );
      };

      bctx.beginPath();
      path({ type: 'Sphere' });
      bctx.fillStyle = SEA;
      bctx.fill();

      if (land) {
        const lit = new Set(journey?.country.split(/\s*&\s*/) ?? []);
        const layer = (pick: (c: Country) => boolean, fill: string, stroke: string) => {
          bctx.beginPath();
          for (const c of land) if (inView(c) && pick(c)) path(c);
          bctx.fillStyle = fill;
          bctx.fill();
          bctx.strokeStyle = stroke;
          bctx.lineWidth = 0.7;
          bctx.stroke();
        };
        layer((c) => !lit.has(c.properties.name), LAND, 'rgb(122 112 92 / 0.45)');
        if (lit.size) layer((c) => lit.has(c.properties.name), LAND_LIT, 'rgb(86 104 66 / 0.75)');
      }

      // The earth's edge, as a fine line, while the whole of it is in view.
      if (r < Math.hypot(w, h) / 2) {
        bctx.beginPath();
        path({ type: 'Sphere' });
        bctx.strokeStyle = 'rgb(20 29 36 / 0.18)';
        bctx.lineWidth = 1;
        bctx.stroke();
      }

      const show = Math.min(1, Math.max(0, (view.k - 6) / 6));
      if (show > 0) {
        bctx.font = `500 12px ${sans}`;
        bctx.textAlign = 'center';
        if ('letterSpacing' in bctx) (bctx as { letterSpacing: string }).letterSpacing = '5px';
        bctx.fillStyle = `rgb(92 84 66 / ${0.75 * show})`;
        const centre: LonLat = [view.lon, view.lat];
        // Names give way to the route: none where a stop and its label would be.
        const taken = (journey?.stops ?? []).map((s) => p(s.at) ?? [-999, -999]);
        for (const l of NAMES) {
          if (geoDistance(l.at, centre) > Math.PI / 2.2) continue;
          const [x, y] = p(l.at) ?? [-99, -99];
          if (taken.some(([sx, sy]) => Math.abs(sx - x) < 150 && Math.abs(sy - y) < 40)) continue;
          if (x > 40 && x < w - 40 && y > 20 && y < h - 20)
            bctx.fillText(l.name.toUpperCase(), x, y);
        }
        if ('letterSpacing' in bctx) (bctx as { letterSpacing: string }).letterSpacing = '0px';
      }
    };

    /* The route over the earth, drawn leg by leg as `progress` runs to 1: a
       brand-blue line on a white casing, as on a printed map, a small head
       while it travels, and each stop as it is reached. */
    const paintRoute = () => {
      if (!journey || progress <= 0) return;
      const p = project(view, w, h);
      const pts = journey.route.map((c): [number, number] => p(c) ?? [0, 0]);
      const line: [number, number][] = [pts[0]];
      pts.slice(1).forEach(([x1, y1], i) => {
        const [x0, y0] = pts[i];
        const bend = (i % 2 ? -1 : 1) * 0.14;
        const qx = (x0 + x1) / 2 - (y1 - y0) * bend;
        const qy = (y0 + y1) / 2 + (x1 - x0) * bend;
        for (let s = 1; s <= 24; s++) {
          const t = s / 24;
          const u = 1 - t;
          line.push([
            u * u * x0 + 2 * u * t * qx + t * t * x1,
            u * u * y0 + 2 * u * t * qy + t * t * y1,
          ]);
        }
      });
      const lens = [0];
      for (let i = 1; i < line.length; i++)
        lens.push(
          lens[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]),
        );
      const upto = lens[lens.length - 1] * progress;

      const trace = () => {
        ctx.beginPath();
        ctx.moveTo(line[0][0], line[0][1]);
        let head = line[0];
        for (let i = 1; i < line.length; i++) {
          if (lens[i] <= upto) {
            ctx.lineTo(line[i][0], line[i][1]);
            head = line[i];
          } else {
            const f = (upto - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
            head = [
              line[i - 1][0] + (line[i][0] - line[i - 1][0]) * f,
              line[i - 1][1] + (line[i][1] - line[i - 1][1]) * f,
            ];
            ctx.lineTo(head[0], head[1]);
            break;
          }
        }
        return head;
      };
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 6;
      trace();
      ctx.stroke();
      ctx.strokeStyle = BRAND;
      ctx.lineWidth = 3;
      const head = trace();
      ctx.stroke();
      if (progress < 1) {
        ctx.fillStyle = BRAND;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(head[0], head[1], 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Stops: each appears once the line has reached it.
      const reached = (at: LonLat) => {
        const k = journey!.route.findIndex((c) => c[0] === at[0] && c[1] === at[1]);
        const at24 = Math.max(0, k) * 24;
        return lens[Math.min(at24, lens.length - 1)] <= upto + 0.5;
      };
      const spots = journey.stops.map((s) => ({ s, xy: p(s.at) ?? [0, 0] }));
      type Box = [number, number, number, number];
      const labels: Box[] = [];
      // Every stop's dot is kept clear too.
      for (const { xy } of spots) labels.push([xy[0] - 9, xy[1] - 9, xy[0] + 9, xy[1] + 9]);
      for (const { s, xy } of spots) {
        if (!reached(s.at)) continue;
        const [x, y] = xy;
        const left =
          spots.some(
            (o) => o.s !== s && o.xy[0] > x && o.xy[0] - x < 170 && Math.abs(o.xy[1] - y) < 34,
          ) || x > w * 0.86;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = BRAND;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Labels never sit on one another: a label tries its side, then the
        // other, then drops its nights, and on a crowded small map is left
        // off (the dot stays; the card below names every stop).
        const nameFont = `400 ${w < 700 ? 15 : 19}px ${serif}`;
        const nightsFont = `600 ${w < 700 ? 9.5 : 11}px ${sans}`;
        const nt = `${s.nights} ${s.nights === 1 ? 'NIGHT' : 'NIGHTS'}`;
        ctx.font = nameFont;
        const nameW = ctx.measureText(s.name).width;
        ctx.font = nightsFont;
        const nightsW = s.nights > 0 ? ctx.measureText(nt).width + nt.length * 2 : 0;
        const boxFor = (onLeft: boolean, nights: boolean): Box => {
          const bw = nights ? Math.max(nameW, nightsW) : nameW;
          const x0 = onLeft ? x - 17 - bw : x + 17;
          return [x0, y - 18, x0 + bw, y + (nights ? 20 : 4)];
        };
        const clashes = (b: Box) =>
          b[0] < 4 ||
          b[2] > w - 4 ||
          labels.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
        const tries: [boolean, boolean][] = [
          [left, s.nights > 0],
          [!left, s.nights > 0],
          [left, false],
          [!left, false],
        ];
        const fit = tries.find(([l, n]) => !clashes(boxFor(l, n)));
        if (!fit) continue;
        const [onLeft, withNights] = fit;
        labels.push(boxFor(onLeft, withNights));

        const tx = x + (onLeft ? -17 : 17);
        ctx.textAlign = onLeft ? 'right' : 'left';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgb(255 255 255 / 0.92)';
        ctx.font = nameFont;
        ctx.lineWidth = 4;
        ctx.strokeText(s.name, tx, y - 2);
        ctx.fillStyle = '#141d24';
        ctx.fillText(s.name, tx, y - 2);
        if (withNights) {
          ctx.font = nightsFont;
          if ('letterSpacing' in ctx) (ctx as { letterSpacing: string }).letterSpacing = '2px';
          ctx.lineWidth = 3;
          ctx.strokeText(nt, tx, y + 15);
          ctx.fillStyle = '#0b5c85';
          ctx.fillText(nt, tx, y + 15);
          if ('letterSpacing' in ctx) (ctx as { letterSpacing: string }).letterSpacing = '0px';
        }
      }
    };

    const compose = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintRoute();
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      let moving = false;
      if (tween) {
        const t = Math.min(1, (now - tween.t0) / tween.dur);
        const e = ease(t);
        const [lon, lat] = geoInterpolate(
          [tween.from.lon, tween.from.lat],
          [tween.to.lon, tween.to.lat],
        )(e);
        const lk =
          Math.log(tween.from.k) +
          (Math.log(tween.to.k) - Math.log(tween.from.k)) * e -
          tween.dip * Math.sin(Math.PI * t);
        view = { lon, lat, k: Math.exp(lk) };
        moving = true;
        if (t >= 1) {
          view = { ...tween.to };
          tween = null;
          stale = true;
          drawFrom = now;
        }
      } else if (spin && visible) {
        view = { ...view, lon: view.lon + dt * 0.004 };
        moving = true;
      }
      if (!tween && journey && progress < 1) progress = Math.min(1, (now - drawFrom) / 1500);
      if (moving) paintBase(false);
      else if (stale) {
        paintBase(true);
        stale = false;
      }
      compose();
      if (tween || (spin && visible) || (journey && progress < 1))
        raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    goTo.current = (k: number) => {
      journey = journeys[k] ?? null;
      target = journey ? frame(journey.route, w, h) : { ...EARTH, lon: view.lon + 8 };
      spin = !journey && !still;
      progress = 0;
      if (still) {
        view = { ...target };
        tween = null;
        progress = 1;
        stale = true;
      } else {
        const far = geoDistance([view.lon, view.lat], [target.lon, target.lat]) * (180 / Math.PI);
        const dip = Math.max(0, Math.min(Math.log(Math.min(view.k, target.k)), far / 4) * 0.9);
        tween = {
          from: { ...view },
          to: target,
          t0: performance.now(),
          dur: 1500 + Math.min(900, far * 18),
          dip,
        };
      }
      kick();
    };

    const size = () => {
      const box = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = box.width;
      h = box.height;
      el.width = base.width = Math.round(w * dpr);
      el.height = base.height = Math.round(h * dpr);
      if (journey && !tween) view = frame(journey.route, w, h);
      stale = true;
      kick();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);

    let live = true;
    (atlas.lo ? Promise.resolve(atlas.lo) : load('/geo/countries-110m.json'))
      .then((lo) => {
        atlas.lo = lo;
        if (!live) return;
        stale = true;
        kick();
        setReady(true);
        return atlas.hi ?? load('/geo/countries-50m.json');
      })
      .then((hi) => {
        if (!hi || !live) return;
        atlas.hi = hi;
        stale = true;
        kick();
      })
      .catch(() => {});

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [journeys]);

  useEffect(() => {
    if (ready) goTo.current(active);
  }, [active, ready]);

  const go = (k: number) => {
    const next = (k + n) % n;
    setActive(next);
    const el = track.current?.children[next] as HTMLElement | undefined;
    const box = track.current;
    if (el && box) {
      const left = el.offsetLeft - box.offsetLeft;
      if (left < box.scrollLeft || left + el.offsetWidth > box.scrollLeft + box.clientWidth) {
        box.scrollTo({ left: Math.max(0, left - 4), behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <div className={`jxh-map${soon ? ' is-soon' : ''}`}>
        <canvas ref={canvas} className="jxh-canvas" role="img" aria-label={label} />
        <span className="jxh-pill" aria-live="polite">
          <i aria-hidden />
          {j ? j.label : 'More journeys are taking shape'}
        </span>
        {j && (
          <p className="sr-only">
            {j.stops.map((s) => (s.nights ? `${s.name}, ${s.nights} nights` : s.name)).join('; ')}
          </p>
        )}
        <p className="jxh-soon" aria-hidden={!soon}>
          More journeys are taking shape. <em>Stay tuned.</em>
        </p>
      </div>

      <div className="jxh-bar">
        <p className="jxh-count">{journeys.length} journeys · more coming</p>
        <div className="jxh-nav">
          <div className="jxh-dots" role="group" aria-label="Choose a journey">
            {Array.from({ length: n }, (_, k) => (
              <button
                key={k}
                type="button"
                className={k === active ? 'on' : undefined}
                aria-label={k < journeys.length ? journeys[k].title : 'Stay tuned'}
                aria-pressed={k === active}
                onClick={() => go(k)}
              >
                <i aria-hidden />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="jxh-arrow"
            aria-label="Previous journey"
            onClick={() => go(active - 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="jxh-arrow"
            aria-label="Next journey"
            onClick={() => go(active + 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <ul className="jxh-cards" ref={track} data-rail>
        {journeys.map((x, k) => (
          <li key={x.slug}>
            <article
              className={`jxh-card${k === active ? ' on' : ''}`}
              onClick={() => setActive(k)}
              aria-labelledby={`jxh-c-${x.slug}`}
            >
              <p className="top">
                <b>{pad(k + 1)}</b>
                {x.country}
              </p>
              <h2 id={`jxh-c-${x.slug}`}>{x.title}</h2>
              <p className="lead">{x.lead}</p>
              <p className="foot">
                <span>{x.facts}</span>
                <Link href={`/journeys/${x.slug}`} onFocus={() => setActive(k)}>
                  Explore <span aria-hidden>→</span>
                  <span className="sr-only"> {x.title}</span>
                </Link>
              </p>
            </article>
          </li>
        ))}
        <li>
          <article
            className={`jxh-card soon${soon ? ' on' : ''}`}
            onClick={() => setActive(journeys.length)}
          >
            <p className="top">
              <b>{pad(n)}</b>
              Stay tuned
            </p>
            <h2>More journeys are on the way</h2>
            <p className="lead">New destinations are being prepared now.</p>
            <p className="foot">
              <span>Be the first to hear</span>
              <Link href="/#circle">
                Join The Circle <span aria-hidden>→</span>
              </Link>
            </p>
          </article>
        </li>
      </ul>
    </>
  );
}
