'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { filterGroups, type JourneySummary } from '@/lib/journeys';
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

/**
 * "Where we go" — the journeys index's signature band.
 *
 * Night ground, the globe weighted right, and down the left every live
 * journey by name. Hovering or focusing a name lights its pin in brass;
 * pointing at a pin lights the name. Choosing a country on the globe is the
 * same act as the Destination filter — the explorer owns that choice — so the
 * rows below follow either way. The canvas is hidden from assistive
 * technology; the list and the filters are the accessible route.
 */
export function JourneyGlobe({
  journeys,
  selected,
  onSelect,
}: {
  journeys: JourneySummary[];
  selected?: string;
  onSelect: (country: string) => void;
}) {
  const [listHover, setListHover] = useState<string | null>(null);
  const [pinHover, setPinHover] = useState<string | null>(null);

  const { counts, pins } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const name of destinations) {
      counts[name] = journeys.filter((j) => j.country.includes(name)).length;
    }
    // A journey across two countries is pinned in the one it starts in.
    const pins: GlobePin[] = journeys.map((j) => ({
      slug: j.slug,
      country: destinations.find((name) => j.country.startsWith(name)) ?? j.country,
      coords: j.coords,
    }));
    return { counts, pins };
  }, [journeys]);

  const lit = listHover ?? pinHover;

  return (
    <section
      aria-labelledby="globe-title"
      data-tone="dark"
      className="overflow-hidden bg-forest-deep text-on-dark"
    >
      <div className="container-site grid-site items-center gap-y-10 py-section-sm lg:min-h-[clamp(420px,56vw,720px)] lg:py-12">
        <div className="order-2 col-span-4 md:col-span-8 lg:order-1 lg:col-span-4">
          <h2 id="globe-title" className="kicker mb-stack">
            Where we go
          </h2>
          <ul className="m-0 list-none border-t border-line-dark p-0">
            {journeys.map((journey) => {
              const on = lit === journey.slug;
              const dim = selected && !journey.country.includes(selected);
              return (
                <li key={journey.slug} className="border-b border-line-dark">
                  <Link
                    href={`/journeys/${journey.slug}`}
                    onPointerEnter={() => setListHover(journey.slug)}
                    onPointerLeave={() => setListHover(null)}
                    onFocus={() => setListHover(journey.slug)}
                    onBlur={() => setListHover(null)}
                    className={`group flex min-h-11 items-baseline justify-between gap-4 py-4 transition-opacity duration-300 ${
                      dim ? 'opacity-45' : ''
                    }`}
                  >
                    <span className="min-w-0">
                      <span
                        className={`h5 block transition-colors duration-300 ${
                          on ? 'text-acqua' : 'text-on-dark'
                        }`}
                      >
                        {journey.title}
                      </span>
                      <span className="kicker-sm mt-1.5 block">
                        {journey.region} · {journey.days} days
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`status-mark transition-colors duration-300 ${
                        on ? 'bg-gorse' : 'bg-acqua/60'
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="prose-body-sm mt-stack max-w-[36ch]">
            {selected
              ? `${counts[selected] ?? 0} ${counts[selected] === 1 ? 'journey' : 'journeys'} in ${selected}. `
              : 'Drag to turn the globe, then choose a country. Every marked place is somewhere Marc knows well.'}
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
        </div>

        <div className="order-1 col-span-4 md:col-span-6 md:col-start-2 lg:order-2 lg:col-span-7 lg:col-start-6">
          <div className="mx-auto w-full max-w-[min(100%,680px)] lg:mr-0">
            <Globe
              tone="dark"
              destinations={destinations}
              counts={counts}
              pins={pins}
              selected={selected}
              onSelect={onSelect}
              highlight={listHover}
              onHoverPin={setPinHover}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** What stands in for the globe while its code loads: the lit sphere alone. */
function GlobeGround() {
  return (
    <div className="relative aspect-square w-full" aria-hidden>
      <div
        className="absolute inset-[7%] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 40% 36%, var(--color-forest) 0%, var(--color-forest-deep) 100%)',
          boxShadow: 'inset 0 0 0 1px rgb(244 241 234 / 0.18)',
        }}
      />
    </div>
  );
}
