'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { filterGroups, type JourneySummary } from '@/lib/journeys';
import { andList } from '@/lib/site';
import { Reveal } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import type { GlobePin } from './Globe';

/**
 * The globe and its outlines load after the page, as their own chunk.
 *
 * That download can fail — a dropped connection, or a tab opened before the
 * latest deploy asking for a chunk that no longer exists. It is tried twice,
 * and if it still fails the plain sphere stays in its place: the list and the
 * filters keep working, and the rest of the page is untouched rather than
 * replaced by the error screen.
 */
const Globe = dynamic(
  () =>
    import('./Globe')
      .catch(() =>
        new Promise((resolve) => setTimeout(resolve, 1500)).then(() => import('./Globe')),
      )
      .then((mod) => mod.Globe)
      .catch(() => GlobeGround),
  { ssr: false, loading: () => <GlobeGround /> },
);

const destinations =
  filterGroups.find((group) => group.key === 'country')?.options ?? ([] as string[]);

/** Journeys within this many km of each other share a region button. */
const REGION_KM = 3000;

/** Great-circle distance in km — enough to group pins without loading d3. */
function km([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

/**
 * "Where we go" — the journeys index's signature band.
 *
 * Paper ground, the globe framed close on the region with the most journeys,
 * and down the left every live journey by name with its dates. Hovering or
 * focusing a name — here or in the rows below — lights its pin in brand blue and
 * flies the globe to it; pointing at a pin lights the name and labels the pin.
 * The region buttons reframe it on purpose. Choosing a country on the globe is
 * the same act as the Destination filter — the explorer owns that choice — so
 * the rows below follow either way. The canvas is hidden from assistive
 * technology; the list, the region buttons and the filters are the route.
 */
export function JourneyGlobe({
  journeys,
  selected,
  onSelect,
  hover,
  onHover,
}: {
  journeys: JourneySummary[];
  selected?: string;
  onSelect: (country: string) => void;
  /** The journey hovered anywhere on the page, so the rows can drive the globe. */
  hover: string | null;
  onHover: (slug: string | null) => void;
}) {
  const [pinHover, setPinHover] = useState<string | null>(null);
  const [framed, setFramed] = useState<string | null>(null);

  const { counts, pins, regions } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const name of destinations) {
      counts[name] = journeys.filter((j) => j.country.includes(name)).length;
    }
    // A journey across two countries is pinned in the one it starts in.
    const pins: GlobePin[] = journeys.map((j) => ({
      slug: j.slug,
      country: destinations.find((name) => j.country.startsWith(name)) ?? j.country,
      coords: j.coords,
      title: j.title,
      when: j.departure,
    }));
    const regions: GlobePin[][] = [];
    for (const pin of pins) {
      const near = regions.find((r) => km(r[0].coords, pin.coords) < REGION_KM);
      if (near) near.push(pin);
      else regions.push([pin]);
    }
    regions.sort((a, b) => b.length - a.length);
    return { counts, pins, regions };
  }, [journeys]);

  const lit = hover ?? pinHover;
  // What the globe frames: a hovered journey, else a chosen country (the globe
  // finds it), else the region chosen here.
  const frame = hover ?? (selected ? null : framed);
  const framedRegion = regions.findIndex((r) =>
    r.some((p) => p.slug === (frame ?? regions[0]?.[0]?.slug)),
  );

  return (
    <section
      aria-labelledby="globe-title"
      className="overflow-hidden border-y border-line bg-panel"
    >
      <div className="container-site grid-site items-center gap-y-8 py-section-sm lg:min-h-[min(100svh,53.75rem)] lg:py-10">
        <Reveal className="order-2 col-span-4 md:col-span-8 lg:order-1 lg:col-span-4">
          <SectionLabel as="h2" id="globe-title" className="mb-stack">
            Where we go
          </SectionLabel>
          <ul className="m-0 list-none border-t border-line p-0">
            {journeys.map((journey) => {
              const on = lit === journey.slug;
              const dim = selected && !journey.country.includes(selected);
              return (
                <li key={journey.slug} className="border-b border-line">
                  <Link
                    href={`/journeys/${journey.slug}`}
                    onPointerEnter={() => onHover(journey.slug)}
                    onPointerLeave={() => onHover(null)}
                    onFocus={() => onHover(journey.slug)}
                    onBlur={() => onHover(null)}
                    className={`group relative flex min-h-11 items-center justify-between gap-4 py-3.5 transition-[opacity,padding] duration-500 ease-[var(--ease-editorial)] ${
                      dim ? 'opacity-45' : ''
                    } ${on ? 'pl-3' : ''}`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-y-2 left-0 w-px origin-top bg-brand transition-transform duration-500 ease-[var(--ease-editorial)] ${
                        on ? 'scale-y-100' : 'scale-y-0'
                      }`}
                    />
                    <span className="min-w-0">
                      <span
                        className={`h5 block transition-colors duration-300 ${
                          on ? 'text-acqua-text' : 'text-ink'
                        }`}
                      >
                        {journey.title}
                      </span>
                      <span className="kicker-sm mt-1 block">
                        {journey.region} · {journey.days} days · {journey.departure}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`status-mark shrink-0 transition-[background-color,transform] duration-300 ${
                        on ? 'scale-150 bg-brand' : 'bg-[#ea4335]'
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="prose-body-sm mt-stack max-w-[38ch]">
            {selected
              ? `${counts[selected] ?? 0} ${counts[selected] === 1 ? 'journey' : 'journeys'} in ${selected}. `
              : 'Hover a journey to fly to it, or drag the globe. Every marked place is somewhere Marc knows well.'}
            {selected && (
              <button
                type="button"
                onClick={() => onSelect(selected)}
                className="link-rule min-h-0 py-0 align-baseline"
              >
                Show every destination
              </button>
            )}
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="order-1 col-span-4 md:col-span-8 lg:order-2 lg:col-span-8 lg:col-start-5"
        >
          {/* A window onto the globe: framed close, its edges dissolving into the paper. */}
          <div className="relative aspect-[5/4] w-full [mask-image:radial-gradient(ellipse_at_center,#000_58%,transparent_78%)] lg:aspect-[4/3]">
            <Globe
              destinations={destinations}
              counts={counts}
              pins={pins}
              selected={selected}
              onSelect={onSelect}
              highlight={hover}
              onHoverPin={setPinHover}
              frame={frame}
            />
          </div>
          {regions.length > 1 && (
            <div
              role="group"
              aria-label="Show a region on the globe"
              className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2"
            >
              {regions.map((region, i) => {
                const names = andList.format([...new Set(region.map((p) => p.country))]);
                const on = i === framedRegion;
                return (
                  <button
                    key={region[0].slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFramed(region[0].slug)}
                    className={`toggle-link kicker-sm min-h-11 border-0 bg-transparent px-0 transition-colors duration-300 hover:!text-acqua-text ${
                      on ? '!text-ink' : ''
                    }`}
                  >
                    {names} ({region.length})
                  </button>
                );
              })}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/** What stands in for the globe while its code loads: the lit sphere alone. */
function GlobeGround() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute left-1/2 top-1/2 aspect-square h-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            // The globe's road-map water (see Globe.tsx), so nothing jumps when it loads.
            'radial-gradient(circle at 38% 34%, #bbe1ff 0%, #9acbf7 100%)',
          boxShadow: 'inset 0 0 0 1px rgb(127 184 236 / 0.6)',
        }}
      />
    </div>
  );
}
