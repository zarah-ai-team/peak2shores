import { geoGraticule10, geoPath } from 'd3-geo';
import type { Journey, JourneyFlyer } from '@/lib/content';
import type { RouteMode } from '@/lib/journeys';
import { getMedia } from '@/lib/media';
import { atlas, frameRoute } from './JourneyMap';
import { RouteLive, type RouteStep } from './RouteLive';
import './itinerary.css';

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
export function JyItinerary({ journey, flyer }: { journey: Journey; flyer: JourneyFlyer }) {
  const route = journey.route ?? [];
  if (route.length < 2) return null;

  const projection = frameRoute(route, W, H).clipExtent([
    [-2, -2],
    [W + 2, H + 2],
  ]);
  const path = geoPath(projection);
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

  const ours = new Set(journey.country.split(' & '));
  const land = atlas().flatMap((country) => {
    const [[x0, y0], [x1, y1]] = path.bounds(country);
    if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) return [];
    const d = path(country);
    if (!d) return [];
    const [lx, ly] = path.centroid(country);
    // Named on the map when its middle is on it and it is big enough to hold a name.
    const named = lx > 50 && lx < W - 50 && ly > 30 && ly < H - 30 && path.area(country) > 9000;
    return [
      {
        key: country.properties.name + (country.id ?? ''),
        name: country.properties.name,
        d,
        ours: ours.has(country.properties.name),
        label: named ? ([lx, ly] as const) : null,
      },
    ];
  });
  const nights = flyer.parts.flatMap((p) => p.stays).reduce((t, s) => t + (s.nights ?? 0), 0);
  const slept = stays.filter((s) => s.stay.nights).length;
  const modes = [...new Set(legs.map((l) => l.mode))];
  const id = `jr-${journey.slug}`;

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
    >
      <defs>
        <radialGradient id={`${id}-sea`} cx="0.5" cy="0.45" r="0.85">
          <stop offset="0" stopColor="#14506f" />
          <stop offset="0.6" stopColor="#0d3550" />
          <stop offset="1" stopColor="#071622" />
        </radialGradient>
        <linearGradient id={`${id}-land`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#243f33" />
          <stop offset="1" stopColor="#33503f" />
        </linearGradient>
        <linearGradient id={`${id}-ours`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#47705a" />
          <stop offset="1" stopColor="#6b9274" />
        </linearGradient>
      </defs>
      <rect x={-W} y={-H} width={W * 3} height={H * 3} fill={`url(#${id}-sea)`} />
      <path
        className="jr-grid"
        d={path(geoGraticule10()) ?? ''}
        vectorEffect="non-scaling-stroke"
      />
      {land.map((c) => (
        <path
          key={c.key}
          d={c.d}
          className={c.ours ? 'jr-land is-ours' : 'jr-land'}
          fill={`url(#${id}-${c.ours ? 'ours' : 'land'})`}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <g className="jr-countries">
        {land.map(
          (c) =>
            c.label && (
              <text key={c.key} x={c.label[0]} y={c.label[1]} textAnchor="middle">
                {c.name.toUpperCase()}
              </text>
            ),
        )}
      </g>
    </RouteLive>
  );
}
