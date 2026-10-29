'use client';

import { useMemo, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { ButtonLink } from '@/components/ui/Button';
import { filterGroups, type FilterKey, type JourneySummary } from '@/lib/journeys';
import { ease } from '@/lib/motion';
import { JourneyListing } from './JourneyCard';
import { JourneyGlobe } from './JourneyGlobe';

type Selection = Partial<Record<FilterKey, string>>;

/**
 * The journeys index, below the page title.
 *
 * 1. The globe band — choosing a country there is the same choice as the
 *    Destination filter, and hovering a journey anywhere on the page (the
 *    band's list or a row below) flies the globe to it.
 * 2. A slim sticky filter bar: one dropdown per group in a single row, the
 *    count and Clear beside them. One option per group; "Any" clears it.
 * 3. The journeys as horizontal listings, A&K-style: photograph left, then
 *    overview, stays, dates and price, one standard row each. A filter change
 *    fades the list in (no layout animation).
 *
 * Takes summaries, not whole journeys: itineraries and hotel notes never
 * reach the browser for this page.
 */
export function JourneyExplorer({ journeys }: { journeys: JourneySummary[] }) {
  const [selection, setSelection] = useState<Selection>({});
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const listRef = useRef<HTMLElement>(null);

  const { visible, activeCount } = useMemo(() => {
    const active = filterGroups
      .map((group) => ({ group, value: selection[group.key] }))
      .filter((pair): pair is { group: (typeof filterGroups)[number]; value: string } =>
        Boolean(pair.value),
      );
    return {
      activeCount: active.length,
      visible: journeys.filter((journey) =>
        active.every(({ group, value }) => group.match(journey, value)),
      ),
    };
  }, [journeys, selection]);

  function toggle(key: FilterKey, value: string) {
    setTouched(true);
    setSelection((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  }

  function setFilter(key: FilterKey, value: string) {
    setTouched(true);
    setSelection((current) => ({ ...current, [key]: value || undefined }));
  }

  function clear() {
    setTouched(true);
    setSelection({});
    // Both Clear buttons disappear once nothing is selected; hand focus to the
    // list so a keyboard reader is not dropped back at the top of the page.
    listRef.current?.focus({ preventScroll: true });
  }

  const hasFilters = activeCount > 0;
  const signature = filterGroups.map((g) => selection[g.key] ?? '').join('|');
  const countText = hasFilters
    ? `${visible.length} of ${journeys.length} journeys`
    : `All ${journeys.length} journeys`;

  return (
    <>
      <JourneyGlobe
        journeys={journeys}
        selected={selection.country}
        onSelect={(country) => toggle('country', country)}
        hover={hover}
        onHover={setHover}
      />

      {/* `data-pin-header` keeps the header in place above this bar, so the
          two stay stacked at the top of the page however far it scrolls. */}
      <section
        aria-label="Filter journeys"
        data-pin-header
        className="sticky top-[var(--nav-h-compact)] z-20 border-b border-line bg-panel/95 backdrop-blur-[0.875rem]"
      >
        <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5 lg:flex-nowrap">
          {/* One compact row of dropdowns — a single line on a desktop, two
              short rows on a phone — so the bar never crowds the list. */}
          <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:items-center">
            {filterGroups.map((group) => {
              const value = selection[group.key] ?? '';
              return (
                <label key={group.key} className="relative block min-w-0">
                  <span className="sr-only">{group.label}</span>
                  <select
                    value={value}
                    onChange={(e) => setFilter(group.key, e.target.value)}
                    className={`meta h-10 w-full cursor-pointer appearance-none truncate rounded-full border bg-ivory pl-4 pr-9 transition-colors duration-300 hover:border-ink md:w-auto ${
                      value ? 'border-ink text-ink' : 'border-line text-body'
                    }`}
                  >
                    <option value="">{group.label}: Any</option>
                    {group.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden
                    width="10"
                    height="7"
                    viewBox="0 0 12 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
                  >
                    <path d="M1 1.5l5 5 5-5" />
                  </svg>
                </label>
              );
            })}
          </div>
          <div className="flex items-center gap-5">
            <span role="status" aria-live="polite" className="meta whitespace-nowrap text-muted">
              {countText}
            </span>
            <button
              type="button"
              onClick={clear}
              className="meta min-h-10 border-0 bg-transparent px-0 !text-acqua-text underline-offset-4 transition-colors duration-300 hover:!text-ink hover:underline"
              style={{ visibility: hasFilters ? 'visible' : 'hidden' }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <section
        ref={listRef}
        tabIndex={-1}
        aria-labelledby="journeys-list-title"
        className="pb-section-sm outline-none"
      >
        <h2 id="journeys-list-title" className="sr-only">
          Journeys
        </h2>
        <m.div
          key={signature}
          initial={touched ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: ease.editorial }}
          className="container-site"
        >
          {visible.length > 0 ? (
            <ol className="m-0 list-none p-0 pt-block">
              {visible.map((journey, i) => (
                // Pointing at a card flies the globe to it.
                <li
                  key={journey.slug}
                  className="border-b border-line pb-block [&+li]:pt-block last:border-b-0"
                  onPointerEnter={() => setHover(journey.slug)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(journey.slug)}
                  onBlur={() => setHover(null)}
                >
                  <JourneyListing journey={journey} priority={i === 0} />
                </li>
              ))}
            </ol>
          ) : (
            <div className="editorial-grid--wide py-section-sm">
              <div aria-hidden />
              <div>
                <h3 className="h4 mb-stack">Nothing on the list fits that combination — yet.</h3>
                <p className="prose-body measure mb-7">
                  Most of our journeys began as a request like this. Tell us where you’d like to go
                  and who you’re traveling with.
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-2">
                  <button
                    type="button"
                    onClick={clear}
                    className="link-rule border-0 bg-transparent"
                  >
                    Clear filters
                  </button>
                  <ButtonLink href="/plan#private" variant="rule" arrow>
                    Ask about private travel
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}
        </m.div>
      </section>
    </>
  );
}
