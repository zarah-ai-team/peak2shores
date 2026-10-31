import type { CSSProperties } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoCircle, geoMercator, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, MultiPoint } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { Reveal } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import type { Journey } from '@/lib/content';
import { journeyStays, type RouteMode, type RouteStop } from '@/lib/journeys';
import { RouteDraw } from './RouteDraw';

type Country = Feature<Geometry, { name: string }>;
type Side = 'right' | 'left' | 'above' | 'below' | 'ne' | 'se' | 'nw' | 'sw';
const SIDES: Side[] = ['right', 'left', 'above', 'below', 'ne', 'se', 'nw', 'sw'];

const W = 1200;
const H = 800;
/** Around a journey with no route, how much of the world the map shows, in degrees. */
const REACH = 5;
/** The least a route map spans, in degrees of latitude, so a coast still reads as a coast. */
const MIN_SPAN = 0.6;
/** When the drawing starts after the map arrives, and how long a leg may take, in seconds. */
const START = 0.35;
const LEG_S: [number, number] = [0.7, 1.5];
/**
 * Label sizes are estimated at the map's smaller widths (about 560px across),
 * where labels take the most room, so they keep apart at every size.
 */
const PX = 560 / W;

const modeLabel: Record<RouteMode, string> = {
  road: 'By road',
  rail: 'By rail',
  boat: 'By boat',
};

/* The 1:50m atlas the globe uses, read once per server process. */
let countries: Country[] | null = null;
export function atlas(): Country[] {
  if (!countries) {
    const topology = JSON.parse(
      readFileSync(join(process.cwd(), 'public', 'geo', 'countries-50m.json'), 'utf8'),
    ) as Topology<{ countries: GeometryCollection<{ name: string }> }>;
    countries = (
      feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>
    ).features;
  }
  return countries;
}

/** A projection framed on the route, with room around it for the labels. */
export function frameRoute(stops: RouteStop[], w = W, h = H): GeoProjection {
  const lons = stops.map((s) => s.coords[0]);
  const lats = stops.map((s) => s.coords[1]);
  const [cx, cy] = [
    (Math.min(...lons) + Math.max(...lons)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
  const halfLat = Math.max(Math.max(...lats) - Math.min(...lats), MIN_SPAN) / 2;
  const halfLon =
    Math.max(Math.max(...lons) - Math.min(...lons), MIN_SPAN / Math.cos((cy * Math.PI) / 180)) / 2;
  const box: MultiPoint = {
    type: 'MultiPoint',
    coordinates: [
      [cx - halfLon, cy - halfLat],
      [cx + halfLon, cy + halfLat],
    ],
  };
  return geoMercator().fitExtent(
    [
      [w * 0.16, h * 0.14],
      [w * 0.84, h * 0.86],
    ],
    box,
  );
}

/** "Day 3", "Days 1–2, 4": where a place falls in the day by day. */
function dayRange(days: number[]) {
  if (!days.length) return '';
  const runs: string[] = [];
  for (let i = 0; i < days.length; i++) {
    let j = i;
    while (j + 1 < days.length && days[j + 1] === days[j] + 1) j++;
    runs.push(i === j ? `${days[i]}` : `${days[i]}–${days[j]}`);
    i = j;
  }
  return `${days.length > 1 ? 'Days' : 'Day'} ${runs.join(', ')}`;
}

type Box = [number, number, number, number];
const overlaps = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

/**
 * Which side of its marker each label sits: the first of right, left, above,
 * below, then the four diagonals, that stays on the map and clear of the labels and markers placed so
 * far — else the side with the fewest collisions.
 */
function placeLabels(points: { x: number; y: number; name: string }[]): Side[] {
  const gap = 14 / PX;
  const h = 30 / PX;
  const dot = 12 / PX;
  const d = 8 / PX;
  const taken: Box[] = points.map(({ x, y }) => [x - dot, y - dot, x + dot, y + dot]);
  return points.map(({ x, y, name }, i) => {
    const w = (46 + name.length * 7.4) / PX;
    const boxes: Record<Side, Box> = {
      right: [x + gap, y - h / 2, x + gap + w, y + h / 2],
      left: [x - gap - w, y - h / 2, x - gap, y + h / 2],
      above: [x - w / 2, y - gap - h, x + w / 2, y - gap],
      below: [x - w / 2, y + gap, x + w / 2, y + gap + h],
      ne: [x + d, y - d - h, x + d + w, y - d],
      se: [x + d, y + d, x + d + w, y + d + h],
      nw: [x - d - w, y - d - h, x - d, y - d],
      sw: [x - d - w, y + d, x - d, y + d + h],
    };
    let best: Side = 'right';
    let fewest = Infinity;
    for (const side of SIDES) {
      const b = boxes[side];
      const off = b[0] < 0 || b[1] < 0 || b[2] > W || b[3] > H ? 2 : 0;
      const hits = taken.filter((t, k) => k !== i && overlaps(b, t)).length + off;
      if (hits < fewest) [best, fewest] = [side, hits];
      if (hits === 0) break;
    }
    taken.push(boxes[best]);
    return best;
  });
}

/**
 * Where the journey goes — a map of the region drawn on the server as SVG,
 * with the route between the journey's places laid over it, leg by leg, in
 * the order the journey travels (road solid, rail long-dashed, boat dashed).
 * Each place is a numbered marker, named on the map and listed beside it
 * with its days. When the map scrolls into view the route draws itself and
 * each place lights as the line reaches it (RouteDraw); until then, and for
 * anyone who prefers less motion, the finished route shows.
 *
 * Every journey with a `route` gets its own; one without shows a single pin
 * at the journey's coordinates.
 */
export function JourneyMap({ journey }: { journey: Journey }) {
  const route: RouteStop[] = journey.route?.length
    ? journey.route
    : [{ name: journey.region, coords: journey.coords }];
  const names = new Set(journey.country.split(' & '));
  const projection =
    route.length > 1
      ? frameRoute(route)
      : geoMercator().fitExtent(
          [
            [0, 0],
            [W, H],
          ],
          geoCircle().center(journey.coords).radius(REACH)(),
        );
  projection.clipExtent([
    [-2, -2],
    [W + 2, H + 2],
  ]);
  const path = geoPath(projection);
  const at = (c: [number, number]) => projection(c) ?? [W / 2, H / 2];

  /* Legs: a gentle curve between consecutive places, alternating sides, each
     timed by its length so the line travels at an even pace. */
  let clock = START;
  const legs = route.slice(1).map((stop, i) => {
    const [x0, y0] = at(route[i].coords);
    const [x1, y1] = at(stop.coords);
    const len = Math.hypot(x1 - x0, y1 - y0);
    const bend = (i % 2 ? -1 : 1) * 0.16;
    const cx = (x0 + x1) / 2 - (y1 - y0) * bend;
    const cy = (y0 + y1) / 2 + (x1 - x0) * bend;
    const t = Math.min(LEG_S[1], Math.max(LEG_S[0], (len / W) * 2.4));
    const leg = {
      d: `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      mode: stop.by ?? 'road',
      delay: clock,
      t,
    };
    clock += t;
    return leg;
  });

  /* Places: one marker per name, lit when the line first reaches it. */
  const days = journey.detail?.days ?? journey.itinerary ?? [];
  const seen = new Set<string>();
  const places = route.flatMap((stop, i) => {
    if (seen.has(stop.name)) return [];
    seen.add(stop.name);
    const needle = (stop.match ?? stop.name).toLowerCase();
    const [x, y] = at(stop.coords);
    return [
      {
        name: stop.name,
        x,
        y,
        reach: i === 0 ? START - 0.15 : legs[i - 1].delay + legs[i - 1].t - 0.1,
        days: dayRange(days.filter((d) => d.where.toLowerCase().includes(needle)).map((d) => d.n)),
      },
    ];
  });
  const sides = placeLabels(places);
  const modes = [...new Set(legs.map((l) => l.mode))];
  const stays = route.length > 1 ? [] : journeyStays(journey);
  const id = `route-${journey.slug}`;

  return (
    <section aria-labelledby="map-title" className="py-section-sm">
      <div className="container-site grid-site items-center gap-y-block">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <SectionLabel className="mb-stack">The route</SectionLabel>
          <Reveal variant="mask">
            <h2 id="map-title" className="h2 mb-stack max-w-[16ch]">
              {journey.region}, {journey.country}.
            </h2>
          </Reveal>
          {route.length > 1 ? (
            <ol className="m-0 list-none border-t border-line p-0">
              {places.map((place, i) => (
                <li
                  key={place.name}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                >
                  <span className="meta text-ink">
                    <span className="kicker-sm mr-3 text-acqua-text">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {place.name}
                  </span>
                  {place.days && (
                    <span className="meta whitespace-nowrap text-muted">{place.days}</span>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            stays.length > 0 && (
              <ol className="m-0 list-none border-t border-line p-0">
                {stays.map((stay, i) => (
                  <li
                    key={stay.name}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                  >
                    <span className="meta text-ink">
                      <span className="kicker-sm mr-3 text-acqua-text">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {stay.name}
                    </span>
                    {stay.nights && (
                      <span className="meta whitespace-nowrap text-muted">{stay.nights}</span>
                    )}
                  </li>
                ))}
              </ol>
            )
          )}
        </div>

        <figure className="col-span-4 m-0 md:col-span-8 lg:col-span-8">
          <RouteDraw className="route-map relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Map of ${journey.region}, ${journey.country}${
                places.length > 1
                  ? `: the route from ${places.map((p) => p.name).join(' to ')}`
                  : ''
              }`}
              className="block h-auto w-full"
            >
              <defs>
                {legs.map((leg, i) => (
                  <mask
                    key={i}
                    id={`${id}-${i}`}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width={W}
                    height={H}
                  >
                    <path
                      className="route-reveal"
                      d={leg.d}
                      pathLength={1}
                      style={{ '--d': `${leg.delay}s`, '--t': `${leg.t}s` } as CSSProperties}
                    />
                  </mask>
                ))}
              </defs>
              <rect width={W} height={H} className="route-sea" />
              {atlas().map((country) => {
                // Only the countries the map actually shows reach the page.
                const [[x0, y0], [x1, y1]] = path.bounds(country);
                if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) return null;
                const d = path(country);
                if (!d) return null;
                return (
                  <path
                    key={country.properties.name + (country.id ?? '')}
                    d={d}
                    className={
                      names.has(country.properties.name) ? 'route-land is-ours' : 'route-land'
                    }
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {legs.map((leg, i) => (
                <g key={i} className={`route-leg is-${leg.mode}`}>
                  <path className="route-leg-base" d={leg.d} />
                  <path className="route-leg-on" d={leg.d} mask={`url(#${id}-${i})`} />
                </g>
              ))}
            </svg>
            {/* The markers and their names, in px so they read at any size. The
                list beside the map carries the same places for screen readers. */}
            <ol aria-hidden className="route-places">
              {places.map((place, i) => (
                <li
                  key={place.name}
                  className="route-place"
                  data-side={sides[i]}
                  style={
                    {
                      left: `${(place.x / W) * 100}%`,
                      top: `${(place.y / H) * 100}%`,
                      '--d': `${Math.max(0, place.reach)}s`,
                    } as CSSProperties
                  }
                >
                  <span className="route-dot" />
                  <span className="route-label">
                    {places.length > 1 && <span className="route-num">{i + 1}</span>}
                    {place.name}
                  </span>
                </li>
              ))}
            </ol>
          </RouteDraw>
          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <span className="kicker-sm">
              {journey.days} days · {journey.departureWindow}
            </span>
            {legs.length > 0 && (
              <span className="route-legend">
                {modes.map((mode) => (
                  <span key={mode}>
                    <svg aria-hidden viewBox="0 0 28 6" width="28" height="6">
                      <path className={`route-key is-${mode}`} d="M1 3 H27" />
                    </svg>
                    {modeLabel[mode]}
                  </span>
                ))}
              </span>
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
