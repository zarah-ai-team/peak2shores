import type { ReactNode } from 'react';
import type { Journey, JourneyFlyer } from '@/lib/content';
import type { RouteMode } from '@/lib/journeys';
import { getMedia } from '@/lib/media';
import { frameRoute } from './JourneyMap';
import { RouteLive, type RouteStep } from './RouteLive';
import './itinerary.css';

/**
 * The map itself is Esri's World Topographic basemap (relief, lakes, roads and
 * the towns around the route, labelled), laid as tiles under the route, so the
 * stops read against real places — Bern, Interlaken, Lake Geneva, Lake Como.
 * Tiles are fetched straight from Esri; the attribution sits on the map.
 */
const TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile';
/** A tile's size on the canvas, at most: small enough to stay sharp at the camera's zoom. */
const TILE_MAX = 230;

/** The map's canvas: a little taller than wide, as in the design sample. */
const W = 600;
const H = 640;

const modeLabel: Record<RouteMode, string> = {
  road: 'By road',
  rail: 'By rail',
  boat: 'By boat',
};

/** Does a stay ("Stresa & Lake Maggiore") name a stop on the route ("Stresa")? */
const names = (a: string, b: string) => {
  const [x, y] = [a.toLowerCase(), b.toLowerCase()];
  return x.includes(y) || y.includes(x);
};

/**
 * The itinerary, stay by stay, after the design sample "Itinerary": a dark
 * map of the region held beside the stays while they scroll, and the stays
 * themselves, each opening to what you will do there, the hotel and a
 * photograph. The map follows the stays (RouteLive).
 *
 * Drawn here, on the server: the land, the route's legs and the places, in
 * the order the journey travels. Each stay is matched to its stop on the
 * route by name, and its days counted from the nights before it: a stay of
 * three nights from day 1 is "Days 1–3", and the last stay keeps its
 * departure day. A stay with no nights is a stop "Along the way".
 */
export function JyItinerary({
  journey,
  flyer,
  after,
}: {
  journey: Journey;
  flyer: JourneyFlyer;
  /** The last row under the stays: the optional extension. */
  after?: ReactNode;
}) {
  const route = journey.route ?? [];
  if (route.length < 2) return null;

  const projection = frameRoute(route, W, H).clipExtent([
    [-2, -2],
    [W + 2, H + 2],
  ]);
  const at = (c: [number, number]) => projection(c) ?? [W / 2, H / 2];

  const legs = route.slice(1).map((stop, i) => {
    const [x0, y0] = at(route[i].coords);
    const [x1, y1] = at(stop.coords);
    const bend = (i % 2 ? -1 : 1) * 0.16;
    const cx = (x0 + x1) / 2 - (y1 - y0) * bend;
    const cy = (y0 + y1) / 2 + (x1 - x0) * bend;
    return {
      d: `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      mode: stop.by ?? 'road',
    };
  });

  /* One marker per place; a place visited twice (Split) keeps one. Its name
     sits on the side with more room. */
  const markers: { name: string; x: number; y: number; side: 'l' | 'r' }[] = [];
  const markerOf = route.map((stop) => {
    const k = markers.findIndex((m) => m.name === stop.name);
    if (k >= 0) return k;
    const [x, y] = at(stop.coords);
    markers.push({ name: stop.name, x, y, side: 'r' });
    return markers.length - 1;
  });
  for (const m of markers) {
    const crowded = markers.some(
      (o) => o !== m && o.x > m.x && o.x - m.x < 150 && Math.abs(o.y - m.y) < 30,
    );
    m.side = m.x > W * 0.64 || crowded ? 'l' : 'r';
  }

  /* The stays, in the order the route takes them. */
  const used = new Set<number>();
  const stays = flyer.parts
    .flatMap((part, p) => part.stays.map((stay) => ({ stay, p })))
    .map(({ stay, p }) => {
      const i = route.findIndex((stop, k) => !used.has(k) && names(stay.place, stop.name));
      if (i >= 0) used.add(i);
      return { stay, p, i };
    })
    .sort((a, b) => (a.i < 0 ? 1 : b.i < 0 ? -1 : a.i - b.i));

  // Parts are headings only while the route takes them in turn.
  const inTurn = stays.every((s, k) => k === 0 || s.p >= stays[k - 1].p);
  const last = stays.findLastIndex((s) => s.stay.nights);
  let day = 1;
  const steps: RouteStep[] = stays.map(({ stay, p, i }, k) => {
    const n = stay.nights ?? 0;
    let days = 'Along the way';
    if (n) {
      const end = day + n - 1 + (k === last ? 1 : 0);
      days = end > day ? `Days ${day}–${end}` : `Day ${day}`;
      day += n;
    }
    const m = stay.media ? getMedia(stay.media) : undefined;
    const hotel = flyer.hotels.find((h) => names(stay.place, h.place));
    const part = flyer.parts[p];
    return {
      at: i >= 0 ? markerOf[i] : -1,
      legs: i >= 0 ? i : legs.length,
      name: stay.place,
      pin: i >= 0 ? route[i].name : stay.place,
      days,
      nights: n ? `${n} ${n === 1 ? 'night' : 'nights'}` : '',
      tagline: stay.tagline,
      text: stay.doing.join(' '),
      moment: stay.moment,
      hotel: hotel && { name: hotel.name, url: hotel.url },
      img: m?.src ?? undefined,
      alt: m?.alt ?? stay.place,
      part:
        inTurn && part.title && (k === 0 || stays[k - 1].p !== p)
          ? { title: part.title, sub: part.subtitle }
          : undefined,
    };
  });

  /* The basemap tiles that cover the canvas. d3's Mercator and the web's
     tiles share a projection: at zoom z a tile spans T = 2π·scale / 2^z
     canvas units, and tile (i, j) starts at T·i − π·scale + tx (and ty). */
  const scale = projection.scale();
  const [tx, ty] = projection.translate();
  const z = Math.min(16, Math.ceil(Math.log2((2 * Math.PI * scale) / TILE_MAX)));
  const T = (2 * Math.PI * scale) / 2 ** z;
  const x0 = tx - Math.PI * scale;
  const y0 = ty - Math.PI * scale;
  const tiles: { key: string; href: string; x: number; y: number }[] = [];
  for (let j = Math.floor(-y0 / T); j * T + y0 < H; j++) {
    for (let i = Math.floor(-x0 / T); i * T + x0 < W; i++) {
      tiles.push({
        key: `${z}/${j}/${i}`,
        href: `${TILE_URL}/${z}/${j}/${i}`,
        x: x0 + i * T,
        y: y0 + j * T,
      });
    }
  }
  const nights = flyer.parts.flatMap((p) => p.stays).reduce((t, s) => t + (s.nights ?? 0), 0);
  const slept = stays.filter((s) => s.stay.nights).length;
  const modes = [...new Set(legs.map((l) => l.mode))];

  return (
    <RouteLive
      W={W}
      H={H}
      legs={legs}
      markers={markers}
      steps={steps}
      label={`Map of ${journey.region}, ${journey.country}: the route from ${route[0].name} to ${route[route.length - 1].name}`}
      summary={`${slept} stays · ${nights} nights`}
      ends={`${route[0].name} → ${route[route.length - 1].name}`}
      legend={modes.map((mode) => ({ mode, label: modeLabel[mode] }))}
      after={after}
    >
      <rect x={0} y={0} width={W} height={H} fill="#dfe7e0" />
      {tiles.map((t) => (
        <image
          key={t.key}
          href={t.href}
          x={t.x}
          y={t.y}
          width={T + 0.5}
          height={T + 0.5}
          preserveAspectRatio="none"
        />
      ))}
    </RouteLive>
  );
}
