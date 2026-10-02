'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { Frame } from '@/components/ui/Frame';
import { filterGroups, type JourneySummary } from '@/lib/journeys';
import { ease } from '@/lib/motion';
import type { GlobePin } from './Globe';

/** The globe and its outlines load after the page, as their own chunk. */
const Globe = dynamic(() => import('./Globe').then((mod) => mod.Globe), {
  ssr: false,
  loading: () => <GlobeGround />,
});

const destinations =
  filterGroups.find((group) => group.key === 'country')?.options ?? ([] as string[]);

/**
 * "Explore by destination": the globe, and beside it the journeys in whichever
 * country is chosen.
 *
 * The choice is the same one the Destination filter makes — the explorer owns
 * it — so turning the globe to Italy and clicking "Italy" in the filters are
 * the same act, and the list below follows either way.
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

  const inCountry = selected ? journeys.filter((j) => j.country.includes(selected)) : [];

  return (
    <section
      aria-labelledby="globe-title"
      className="gutter grid grid-cols-1 items-center gap-10 border-t border-line py-14 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16"
    >
      <div className="mx-auto w-full min-w-0 max-w-[560px]">
        <Globe
          destinations={destinations}
          counts={counts}
          pins={pins}
          selected={selected}
          onSelect={onSelect}
        />
      </div>

      <div className="min-w-0">
        <p className="kicker-sm mb-5">Explore by destination</p>
        <h2 id="globe-title" className="h3 mb-5">
          {selected ?? 'Turn the globe.'}
        </h2>
        <p className="prose-body-sm mb-7 max-w-[440px]">
          {selected
            ? `${inCountry.length} ${inCountry.length === 1 ? 'journey' : 'journeys'} in ${selected}. Choose again to see every destination.`
            : 'Drag to turn it, then choose a country. Every marked place is somewhere Marc knows well.'}
        </p>

        <div
          role="group"
          aria-label="Destinations"
          className="mb-8 flex flex-wrap gap-x-[18px] gap-y-1"
        >
          {destinations.map((name) => {
            const on = selected === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(name)}
                className="toggle-link min-h-6 border-0 bg-transparent py-1.5 font-ui text-[14px] font-light leading-[1.3] hover:text-acqua-text"
                style={{ color: on ? 'var(--color-ink)' : 'var(--color-muted)' }}
              >
                {name}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {selected && (
            <m.ul
              key={selected}
              className="m-0 list-none border-t border-line p-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: ease.editorial }}
            >
              {inCountry.map((journey) => (
                <li key={journey.slug} className="border-b border-line">
                  <Link
                    href={`/journeys/${journey.slug}`}
                    className="group grid grid-cols-[88px_minmax(0,1fr)] items-center gap-5 py-4 transition-colors duration-300 hover:bg-panel sm:grid-cols-[112px_minmax(0,1fr)]"
                  >
                    <Frame
                      media={journey.cardMedia}
                      reveal={false}
                      hover
                      decorative
                      sizes="112px"
                      className="aspect-[4/3] w-full"
                    />
                    <span className="min-w-0">
                      <span className="kicker-sm mb-2 block">
                        {journey.region} · {journey.days} days
                      </span>
                      <span className="h4 mb-1 block">{journey.title}</span>
                      <span className="block font-ui text-[12px] text-muted">
                        {journey.departure} · from {journey.priceFrom} pp
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
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
          background: 'radial-gradient(circle at 32% 28%, #6b6d66 0%, #45473f 70%, #3a3c35 100%)',
          boxShadow: '0 0 60px rgb(12 192 223 / 0.18)',
        }}
      />
    </div>
  );
}
