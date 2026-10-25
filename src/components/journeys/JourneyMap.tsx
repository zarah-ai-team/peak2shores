import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoCircle, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { Reveal } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import type { Journey } from '@/lib/content';
import { journeyStays } from '@/lib/journeys';

type Country = Feature<Geometry, { name: string }>;

const W = 1200;
const H = 800;
/** How much of the world around the journey the map shows, in degrees. */
const REACH = 5;

/* The 1:50m atlas the globe uses, read once per server process. */
let countries: Country[] | null = null;
function atlas(): Country[] {
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

/**
 * Where the journey is — a quiet map of the region drawn on the server as
 * SVG: the land, the journey's country (or countries) picked out in sea-glass,
 * and a brass pin at the journey with its region named. Beside it, the stays
 * in order, so the reader sees the shape of the trip on the ground.
 */
export function JourneyMap({ journey }: { journey: Journey }) {
  const [lon, lat] = journey.coords;
  const names = new Set(journey.country.split(' & '));
  const area = geoCircle().center(journey.coords).radius(REACH)();
  const projection = geoMercator().fitExtent(
    [
      [0, 0],
      [W, H],
    ],
    area,
  );
  const path = geoPath(projection);
  const [x, y] = projection([lon, lat]) ?? [W / 2, H / 2];
  const stays = journeyStays(journey);

  return (
    <section aria-labelledby="map-title" className="py-section-sm">
      <div className="container-site grid-site items-center gap-y-block">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <SectionLabel className="mb-stack">On the map</SectionLabel>
          <Reveal variant="mask">
            <h2 id="map-title" className="h3 mb-stack max-w-[16ch]">
              {journey.region}, {journey.country}.
            </h2>
          </Reveal>
          {stays.length > 0 && (
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
          )}
        </div>

        <figure className="col-span-4 m-0 md:col-span-8 lg:col-span-8">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Map of ${journey.region}, ${journey.country}, where the journey takes place`}
            className="block h-auto w-full bg-panel"
          >
            {atlas().map((country) => {
              // Only the countries the map actually shows reach the page.
              const [[x0, y0], [x1, y1]] = path.bounds(country);
              if (x1 < 0 || y1 < 0 || x0 > W || y0 > H) return null;
              const d = path(country);
              if (!d) return null;
              const ours = names.has(country.properties.name);
              return (
                <path
                  key={country.properties.name + (country.id ?? '')}
                  d={d}
                  className={
                    ours ? 'fill-acqua-deep/35 stroke-acqua-deep' : 'fill-stone stroke-ivory'
                  }
                  strokeWidth={ours ? 1.5 : 1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            <circle cx={x} cy={y} r={34} className="fill-gorse/25" />
            <circle cx={x} cy={y} r={13} className="fill-gorse stroke-ivory" strokeWidth={4} />
            <text
              x={x + 22}
              y={y - 22}
              className="fill-ink font-ui text-[26px] font-medium uppercase tracking-[0.16em]"
            >
              {journey.region}
            </text>
          </svg>
          <figcaption className="kicker-sm mt-3">
            {journey.days} days · {journey.departureWindow}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
