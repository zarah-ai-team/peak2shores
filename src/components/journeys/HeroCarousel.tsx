'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
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
import { ShownSlugs } from './shownSlugs';

type LonLat = [number, number];

/** A card's photograph: the file, its words, the tone its frame waits on. */
export type CardPhoto = {
  src?: string;
  alt: string;
  tone: string;
  /** Where the 3:2 crop centres (CSS object-position). */
  pos?: string;
};

export type HeroJourney = {
  slug: string;
  title: string;
  country: string;
  /** One line under the name, point by point: "13 days", "Lucerne to Milan". */
  facts: string[];
  photo: CardPhoto;
  /** The globe's caption: "Swiss Elegance · Lucerne to Milan". */
  label: string;
  /** The route in order, stop by stop (a stop may come twice). */
  route: LonLat[];
  /** Each place once, with the nights spent there. */
  stops: { name: string; at: LonLat; nights: number }[];
};

/** The card's photograph, 3:2 on every card, in the frame that holds its tone. */
function Photo({ photo }: { photo: CardPhoto }) {
  return (
    <div className="ph" style={{ backgroundColor: photo.tone }}>
      {photo.src && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1101px) 31vw, (min-width: 761px) 42vw, 82vw"
          style={photo.pos ? { objectPosition: photo.pos } : undefined}
        />
      )}
    </div>
  );
}

/** The fine arrow that closes a card's link. */
const arrow = (
  <svg viewBox="0 0 14 10" aria-hidden focusable="false">
    <path d="M0 5h13M9 1l4 4-4 4" />
  </svg>
);

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
  // A phone's narrow globe keeps the route closer to its middle, so the names
  // of the stops at either end still fit inside the frame.
  const across = w < 500 ? 0.22 : 0.3;
  const fit = Math.min((w * across) / (mx * r0), (h * 0.27) / (my * r0));
  // Never closer than about seven degrees across, so the region stays legible.
  const near = w / 7 / ((r0 * Math.PI) / 180);
  return { lon, lat, k: Math.max(1, Math.min(fit, near)) };
}

/* The map's colours: a clear sea, the land a cool pale grey (no sand: the
   owner's decision of 18 November 2026), the chosen journey's countries in a
   pale card blue edged in the cards' #1d4a66 (blues like the journey cards,
   19 November; it was a sage), set as far from the sea as from the land, the
   route in the brand blue. The lines between countries are the page's ink,
   faint, and the countries' names its slate blue. */
const SEA = '#aad3df';
const LAND = '#edf1f4';
const LAND_LIT = '#cfe0ec';
const BRAND = '#018fc9';
const BORDER = 'rgb(20 29 36 / 0.22)';
const BORDER_LIT = 'rgb(29 74 102 / 0.6)';
const NAME = (alpha: number) => `rgb(61 90 108 / ${alpha})`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The globe and the journeys under it. Choosing a journey turns the earth to
 * its region and closes in, then draws the route bright with its stops and
 * nights. The last card, "Stay tuned", draws back to the whole earth, turning
 * slowly. With reduced motion every change is immediate.
 *
 * Each card is its photograph, its name and one link that covers the whole of
 * it, so a click opens the journey. The globe is chosen by the dots and the
 * arrows, by resting the pointer on a card or reaching it with the keyboard,
 * and on a touch screen by the card the rail is swiped to.
 *
 * In The Collection only the journeys its filters let through are shown
 * (ShownSlugs), in their own order, with "Stay tuned" still last; when the
 * filters change them, the carousel starts again from the first.
 */
export function HeroCarousel({
  journeys,
  label,
  soonPhoto,
}: {
  journeys: HeroJourney[];
  label: string;
  /** The photograph on the last card, "Stay tuned". */
  soonPhoto: CardPhoto;
}) {
  const only = useContext(ShownSlugs);
  const list = useMemo(
    () => (only ? journeys.filter((x) => only.includes(x.slug)) : journeys),
    [journeys, only],
  );
  /* The chosen card, with the set of journeys it was chosen in: the moment
     the filters leave a new set, its first card is the chosen one, so the
     choice never points past the new set. */
  const ids = list.map((x) => x.slug).join(' ');
  const [pick, setPick] = useState({ ids, k: 0 });
  const active = pick.ids === ids ? pick.k : 0;
  const setActive = useCallback((k: number) => setPick({ ids, k }), [ids]);
  const [ready, setReady] = useState(false);
  const track = useRef<HTMLUListElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const goTo = useRef<(next: HeroJourney | null) => void>(() => {});
  /* The card in view, for the swipe to read without re-binding its listener. */
  const shown = useRef(0);
  /* True while the rail is being scrolled by the arrows or the dots. */
  const led = useRef(false);
  const rest = useRef(0);

  const n = list.length + 1; // + "Stay tuned"
  const soon = active === list.length;
  const j = soon ? null : (list[active] ?? null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const base = document.createElement('canvas');
    const bctx = base.getContext('2d')!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(el);
    const serif = css.getPropertyValue('--font-display').trim() || 'Newsreader, Georgia, serif';
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

    type Box = [number, number, number, number];
    /* The caption over the map, where it shows (1024px and wider; below, it
       is for screen readers only), as a box in the canvas's own pixels with
       a little air: no name the canvas draws goes under it. */
    const pill = el.parentElement?.querySelector<HTMLElement>('.jxh-pill');
    const keepOut = (): Box | null => {
      const pb = pill?.getBoundingClientRect();
      if (!pb || pb.width <= 1) return null;
      const cb = el.getBoundingClientRect();
      return [
        pb.left - cb.left - 6,
        pb.top - cb.top - 6,
        pb.right - cb.left + 6,
        pb.bottom - cb.top + 6,
      ];
    };
    const meets = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

    /* The earth itself, in map colours (notes of 5 November 2026, cooled on
       18 and 19 November): a clear sea blue, the land a pale cool grey, the
       countries of the chosen journey in a pale card blue, fine borders, and
       their names once close enough to read. No glow, no dark ground. */
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
        layer((c) => !lit.has(c.properties.name), LAND, BORDER);
        if (lit.size) layer((c) => lit.has(c.properties.name), LAND_LIT, BORDER_LIT);
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
        // Once fully shown, 6.4:1 on the land, 5.4:1 on the chosen
        // countries and 4.6:1 on the sea.
        bctx.fillStyle = NAME(show);
        const centre: LonLat = [view.lon, view.lat];
        // Names give way to the route: none where a stop and its label would be.
        const taken = (journey?.stops ?? []).map((s) => p(s.at) ?? [-999, -999]);
        const caption = keepOut();
        for (const l of NAMES) {
          if (geoDistance(l.at, centre) > Math.PI / 2.2) continue;
          const [x, y] = p(l.at) ?? [-99, -99];
          if (taken.some(([sx, sy]) => Math.abs(sx - x) < 150 && Math.abs(sy - y) < 40)) continue;
          // A name is drawn whole or not at all: all of it inside the frame
          // (the measure includes the letter spacing), none of it under the
          // caption.
          const name = l.name.toUpperCase();
          const half = bctx.measureText(name).width / 2;
          if (x - half < 8 || x + half > w - 8 || y <= 20 || y >= h - 20) continue;
          if (caption && meets([x - half, y - 12, x + half, y + 4], caption)) continue;
          bctx.fillText(name, x, y);
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
      // Labels never sit on one another, on the caption over the map, or
      // close over or under another stop's dot, where a name would read as
      // that stop's: each dot is kept clear 9px to either side and 13px above
      // and below.
      const labels: Box[] = [];
      const caption = keepOut();
      if (caption) labels.push(caption);
      const dots = spots.map(({ xy }): Box => [xy[0] - 9, xy[1] - 13, xy[0] + 9, xy[1] + 13]);
      labels.push(...dots);
      const fs = w < 700 ? 15 : 19;
      const nfs = w < 700 ? 9.5 : 11;
      const nameFont = `400 ${fs}px ${serif}`;
      const nightsFont = `600 ${nfs}px ${sans}`;
      const nightsOf = (s: (typeof spots)[number]['s']) =>
        `${s.nights} ${s.nights === 1 ? 'NIGHT' : 'NIGHTS'}`;
      // A label tries its side, then the other, then drops its nights, and on
      // a crowded small map is left off (the dot stays; the card below names
      // every stop). The first and last stops are placed first, so the ends
      // of the route keep their names, and where neither side has room an
      // end's name goes under its dot, or over it. The places are set for the
      // whole route at once, so no name moves as the line arrives.
      type Side = 'left' | 'right' | 'below' | 'above';
      const placed = new Map<number, { side: Side; withNights: boolean }>();
      const order = spots.length > 1 ? [0, spots.length - 1] : [0];
      for (let i = 1; i < spots.length - 1; i++) order.push(i);
      for (const i of order) {
        const { s, xy } = spots[i];
        const [x, y] = xy;
        const left =
          spots.some(
            (o) => o.s !== s && o.xy[0] > x && o.xy[0] - x < 170 && Math.abs(o.xy[1] - y) < 34,
          ) || x > w * 0.86;
        const nt = nightsOf(s);
        ctx.font = nameFont;
        const nameW = ctx.measureText(s.name).width;
        ctx.font = nightsFont;
        const nightsW = s.nights > 0 ? ctx.measureText(nt).width + nt.length * 2 : 0;
        const boxFor = (side: Side, nights: boolean): Box => {
          if (side === 'below') return [x - nameW / 2, y + 10, x + nameW / 2, y + 10 + fs * 1.1];
          if (side === 'above') return [x - nameW / 2, y - 10 - fs * 1.1, x + nameW / 2, y - 10];
          const bw = nights ? Math.max(nameW, nightsW) : nameW;
          const x0 = side === 'left' ? x - 17 - bw : x + 17;
          return [x0, y - 18, x0 + bw, y + (nights ? 20 : 4)];
        };
        // Beside its dot, each line of a label (the name, the nights) starts
        // nearer its own dot than any other stop's, or it would read as that
        // stop's: a dot stacked just over or under this one, say.
        const nearest = (ax: number, ay: number) =>
          spots.every(
            (o, j) =>
              j === i || Math.hypot(o.xy[0] - ax, o.xy[1] - ay) > Math.hypot(x - ax, y - ay),
          );
        const ownLines = (side: Side, nights: boolean) => {
          const ax = side === 'left' ? x - 17 : x + 17;
          return nearest(ax, y - 2 - fs / 4) && (!nights || nearest(ax, y + 15 - nfs * 0.36));
        };
        const clashes = (side: Side, nights: boolean) => {
          const b = boxFor(side, nights);
          return (
            b[0] < 4 ||
            b[2] > w - 4 ||
            (side === 'left' || side === 'right'
              ? !ownLines(side, nights)
              : b[1] < 4 || b[3] > h - 4) ||
            labels.some((q) => q !== dots[i] && meets(b, q))
          );
        };
        const one: Side = left ? 'left' : 'right';
        const other: Side = left ? 'right' : 'left';
        const tries: [Side, boolean][] = [
          [one, s.nights > 0],
          [other, s.nights > 0],
          [one, false],
          [other, false],
        ];
        if (i === 0 || i === spots.length - 1) tries.push(['below', false], ['above', false]);
        const fit = tries.find(([side, n]) => !clashes(side, n));
        if (!fit) continue;
        const [side, withNights] = fit;
        labels.push(boxFor(side, withNights));
        placed.set(i, { side, withNights });
      }

      spots.forEach(({ s, xy }, i) => {
        if (!reached(s.at)) return;
        const [x, y] = xy;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = BRAND;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const place = placed.get(i);
        if (!place) return;
        const { side, withNights } = place;
        const nt = nightsOf(s);
        const tx = side === 'left' ? x - 17 : side === 'right' ? x + 17 : x;
        const ty =
          side === 'below' ? y + 10 + fs * 0.8 : side === 'above' ? y - 10 - fs * 0.3 : y - 2;
        ctx.textAlign = side === 'left' ? 'right' : side === 'right' ? 'left' : 'center';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgb(255 255 255 / 0.92)';
        ctx.font = nameFont;
        ctx.lineWidth = 4;
        ctx.strokeText(s.name, tx, ty);
        ctx.fillStyle = '#141d24';
        ctx.fillText(s.name, tx, ty);
        if (withNights) {
          ctx.font = nightsFont;
          if ('letterSpacing' in ctx) (ctx as { letterSpacing: string }).letterSpacing = '2px';
          ctx.lineWidth = 3;
          ctx.strokeText(nt, tx, y + 15);
          ctx.fillStyle = '#0b5c85';
          ctx.fillText(nt, tx, y + 15);
          if ('letterSpacing' in ctx) (ctx as { letterSpacing: string }).letterSpacing = '0px';
        }
      });
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

    goTo.current = (next) => {
      journey = next;
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
      // While Cards is chosen the Map view is hidden and the canvas measures
      // nothing: it keeps its last size, so there is never an empty canvas to draw from.
      if (!box.width || !box.height) return;
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
  }, []);

  /* The globe turns to the chosen journey whenever it changes: by a dot, an
     arrow or a card, or by the filters leaving a new set of journeys. Set up
     once, it keeps the canvas's last size while the Map view is hidden, so a
     change made from the Cards view is framed as well. */
  useEffect(() => {
    if (ready) goTo.current(j);
  }, [j, ready]);

  useEffect(() => {
    shown.current = active;
  }, [active]);

  /* A new set of journeys shows from its first card, the one now chosen; the
     choice is kept with the new set, so a return to an earlier set starts
     from its first card too. The rail goes back to its start with it: at
     once while it shows, or, when the filters changed from the Cards view,
     as the Map view opens again. Hidden, the rail reads 0, and on showing
     the browser gives it back the offset it had, where the swipe would
     choose another card. */
  useEffect(() => {
    setPick((p) => (p.ids === ids ? p : { ids, k: 0 }));
    const box = track.current;
    if (!box) return;
    const home = () => {
      if (box.scrollLeft > 1) box.scrollTo({ left: 0 });
    };
    if (box.clientWidth) {
      home();
      return;
    }
    const shows = new ResizeObserver(() => {
      if (!box.clientWidth) return;
      shows.disconnect();
      home();
    });
    shows.observe(box);
    return () => shows.disconnect();
  }, [ids]);

  /* On a touch screen there is no pointer to rest on a card and a tap opens
     the journey, so the globe follows the rail: once a swipe settles, the
     first card wholly in view is the chosen one (unless the chosen one still
     is). The rail is the cards' offset parent, so offsetLeft is a card's
     place in it. Bound again for each new set of journeys, whose card the
     swipe chooses. */
  useEffect(() => {
    const box = track.current;
    if (!box) return;
    let timer = 0;
    const settle = () => {
      if (led.current) {
        led.current = false;
        return;
      }
      if (!window.matchMedia('(hover: none)').matches) return;
      const edge = parseFloat(getComputedStyle(box).paddingLeft) || 0;
      const from = box.scrollLeft + edge - 2;
      const to = box.scrollLeft + box.clientWidth - edge + 2;
      const whole = Array.from(box.children).flatMap((c, k) => {
        const el = c as HTMLElement;
        return el.offsetLeft >= from && el.offsetLeft + el.offsetWidth <= to ? [k] : [];
      });
      if (whole.length && !whole.includes(shown.current)) setActive(whole[0]);
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 140);
    };
    box.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      box.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      window.clearTimeout(rest.current);
    };
  }, [setActive]);

  /* A pointer that comes to rest on a card chooses it; one only passing over
     on its way down the page does not. */
  const point = (e: PointerEvent, k: number) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(rest.current);
    rest.current = window.setTimeout(() => setActive(k), 160);
  };
  const unpoint = () => window.clearTimeout(rest.current);

  const go = (k: number) => {
    const next = (k + n) % n;
    setActive(next);
    const el = track.current?.children[next] as HTMLElement | undefined;
    const box = track.current;
    if (el && box) {
      const edge = parseFloat(getComputedStyle(box).paddingLeft) || 0;
      const left = el.offsetLeft;
      if (
        left < box.scrollLeft + edge - 1 ||
        left + el.offsetWidth > box.scrollLeft + box.clientWidth - edge + 1
      ) {
        const to = Math.max(0, Math.min(left - edge, box.scrollWidth - box.clientWidth));
        if (Math.abs(to - box.scrollLeft) > 1) {
          // The swipe listener leaves this scroll alone: the choice is made.
          led.current = true;
          const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          box.scrollTo({ left: to, behavior: still ? 'auto' : 'smooth' });
        }
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
            {j.stops
              .map((s) =>
                s.nights ? `${s.name}, ${s.nights} ${s.nights === 1 ? 'night' : 'nights'}` : s.name,
              )
              .join('; ')}
          </p>
        )}
        <p className="jxh-soon" aria-hidden={!soon}>
          More journeys are taking shape. <em>Stay tuned.</em>
        </p>
      </div>

      {/* `data-fab-clear`: the floating "Connect with our team" steps aside
          rather than cover the journey arrows, the only way to change the
          journey on a phone. */}
      <div className="jxh-bar" data-fab-clear>
        <p className="jxh-count">
          {list.length} {list.length === 1 ? 'journey' : 'journeys'} · more coming
        </p>
        <div className="jxh-nav">
          <div className="jxh-dots" role="group" aria-label="Choose a journey">
            {Array.from({ length: n }, (_, k) => (
              <button
                key={k}
                type="button"
                className={k === active ? 'on' : undefined}
                aria-label={k < list.length ? list[k].title : 'Stay tuned'}
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
        {list.map((x, k) => (
          <li key={x.slug}>
            <article
              className={`jxh-card${k === active ? ' on' : ''}`}
              onPointerEnter={(e) => point(e, k)}
              onPointerLeave={unpoint}
              aria-labelledby={`jxh-c-${x.slug}`}
            >
              <Photo photo={x.photo} />
              <p className="top">{x.country}</p>
              <h3 id={`jxh-c-${x.slug}`}>{x.title}</h3>
              <p className="facts">
                {x.facts.map((fact, i) => (
                  <Fragment key={fact}>
                    {i > 0 && <span className="dot"> · </span>}
                    {fact}
                  </Fragment>
                ))}
              </p>
              <p className="foot">
                <Link href={`/journeys/${x.slug}`} onFocus={() => setActive(k)}>
                  View journey
                  <span className="sr-only">: {x.title}</span>
                  {arrow}
                </Link>
              </p>
            </article>
          </li>
        ))}
        <li>
          <article
            className={`jxh-card${soon ? ' on' : ''}`}
            onPointerEnter={(e) => point(e, list.length)}
            onPointerLeave={unpoint}
            aria-labelledby="jxh-c-soon"
          >
            <Photo photo={soonPhoto} />
            <p className="top">Stay tuned</p>
            <h3 id="jxh-c-soon">More journeys are on the way</h3>
            <p className="facts">New destinations are being prepared now.</p>
            <p className="foot">
              <Link href="/#circle" onFocus={() => setActive(list.length)}>
                Join The Circle
                {arrow}
              </Link>
            </p>
          </article>
        </li>
      </ul>
    </>
  );
}
