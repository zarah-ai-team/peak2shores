'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { MetaItem } from '@/components/ui/Editorial';
import { Arrow, ButtonLink } from '@/components/ui/Button';
import { StatusTag } from '@/components/ui/StatusTag';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import { filterGroups, type FilterKey, type JourneySummary } from '@/lib/journeys';
import { ease } from '@/lib/motion';
import { site } from '@/lib/site';
import { JourneyGlobe } from './JourneyGlobe';

type Selection = Partial<Record<FilterKey, string>>;

/**
 * The journeys index, below the page title.
 *
 * 1. The globe band — choosing a country there is the same choice as the
 *    Destination filter, and hovering a journey anywhere on the page (the
 *    band's list or a row below) flies the globe to it.
 * 2. A sticky filter bar: four word lists in one row on a desktop; behind a
 *    "Refine" disclosure on a phone. One option per group, tapped again to
 *    clear — the same semantics the page has always had.
 * 3. Editorial rows, photograph alternating sides, a rule between each.
 *    A filter change fades the list in (no layout animation).
 *
 * Takes summaries, not whole journeys: itineraries and hotel notes never
 * reach the browser for this page.
 */
export function JourneyExplorer({ journeys }: { journeys: JourneySummary[] }) {
  const [selection, setSelection] = useState<Selection>({});
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const panelId = useId();
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
        className="sticky top-[var(--nav-h-compact)] z-20 border-b border-line bg-panel/95 backdrop-blur-[14px]"
      >
        <div className="container-site">
          {/* Phone: one line — Refine, the count, Clear. */}
          <div className="flex min-h-14 items-center justify-between gap-4 lg:hidden">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="kicker inline-flex min-h-11 items-center gap-3 border-0 bg-transparent p-0 !text-ink"
            >
              Refine{activeCount > 0 && ` (${activeCount})`}
              <svg
                aria-hidden
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              >
                <path d="M1 1.5l5 5 5-5" />
              </svg>
            </button>
            <span className="kicker-sm" aria-hidden>
              {countText}
            </span>
          </div>

          <div
            id={panelId}
            className={`${open ? 'grid' : 'hidden'} max-h-[65svh] overflow-y-auto border-t border-line pb-4 sm:grid-cols-2 lg:grid lg:max-h-none lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-x-10 lg:overflow-visible lg:border-0 lg:pb-0 xl:gap-x-14`}
          >
            {filterGroups.map((group) => (
              <fieldset key={group.key} className="m-0 min-w-0 border-0 p-0 py-4 lg:py-5">
                <legend className="kicker-sm float-left mb-2.5 p-0">{group.label}</legend>
                <div className="clear-left flex flex-wrap gap-x-[18px]">
                  {group.options.map((option) => {
                    const on = selection[group.key] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(group.key, option)}
                        className={`toggle-link meta min-h-11 border-0 bg-transparent px-0 py-2 hover:text-acqua-text lg:min-h-8 lg:py-1 ${
                          on ? 'text-ink' : 'text-muted'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <div className="flex items-center justify-between gap-4 pt-2 sm:col-span-2 lg:col-span-4 lg:border-t lg:border-line lg:py-1">
              <span role="status" aria-live="polite" className="kicker-sm whitespace-nowrap">
                {countText}
              </span>
              <button
                type="button"
                onClick={clear}
                className="kicker-sm min-h-11 border-0 bg-transparent px-0 !text-acqua-text transition-colors duration-300 hover:!text-ink lg:min-h-8"
                style={{ visibility: hasFilters ? 'visible' : 'hidden' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={listRef}
        tabIndex={-1}
        aria-label="Journeys"
        className="pb-section-sm outline-none"
      >
        <m.div
          key={signature}
          initial={touched ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: ease.editorial }}
          className="container-site"
        >
          {visible.length > 0 ? (
            <ol className="m-0 list-none p-0">
              {visible.map((journey, i) => (
                <li key={journey.slug} className="border-b border-line last:border-b-0">
                  <JourneyRow
                    journey={journey}
                    flip={i % 2 === 1}
                    first={journey.slug === journeys[0]?.slug}
                    onHover={setHover}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <div className="editorial-grid--wide py-section-sm">
              <div aria-hidden />
              <div>
                <h2 className="h4 mb-stack">Nothing on the list fits that combination — yet.</h2>
                <p className="prose-body measure mb-7">
                  Most of our journeys began as a request like this. Tell us where you’d like to go
                  and who you’re travelling with.
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

function JourneyRow({
  journey,
  flip,
  first,
  onHover,
}: {
  journey: JourneySummary;
  flip: boolean;
  /** The top row of the full list is the page's largest paint, so it loads eagerly. */
  first: boolean;
  /** Tells the globe which journey the reader is looking at. */
  onHover: (slug: string | null) => void;
}) {
  const titleId = `journey-${journey.slug}-title`;
  const tag = journeyTagStatus(journey);
  const hosted = journey.tags.includes('Hosted by Marc');

  return (
    <Link
      href={`/journeys/${journey.slug}`}
      aria-labelledby={titleId}
      onPointerEnter={() => onHover(journey.slug)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(journey.slug)}
      onBlur={() => onHover(null)}
      className="group grid-site items-center gap-y-8 py-block"
    >
      {/* The photograph eases in closer on hover or focus; a caption rises over it. */}
      <div
        className={`relative isolate col-span-4 overflow-hidden md:col-span-6 lg:col-span-6 ${
          flip ? 'md:col-start-3 lg:order-2 lg:col-start-7' : ''
        }`}
      >
        <Frame
          ratio="4/5"
          media={journey.listMedia}
          hover
          decorative
          priority={first}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-forest-deep/70 via-forest-deep/25 to-transparent px-6 pb-6 pt-24 text-on-dark opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-editorial)] motion-safe:translate-y-3 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <span className="kicker-sm !text-on-dark">
            {journey.region} · {journey.departure}
          </span>
          <span className="kicker-sm inline-flex items-center gap-2 !text-on-dark">
            View the journey
            <Arrow />
          </span>
        </div>
      </div>

      <Reveal
        distance={16}
        delay={0.08}
        className={`col-span-4 flex flex-col md:col-span-8 lg:col-span-5 ${
          flip ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-8'
        }`}
      >
        {tag !== 'open' && <StatusTag status={tag} className="mb-4" />}
        <p className="kicker mb-5">
          {journey.country} · {journey.days} days · {journey.departure}
        </p>
        <h2
          id={titleId}
          className="h3 mb-5 max-w-[16ch] transition-colors duration-300 group-hover:text-acqua-text"
        >
          {journey.title}
        </h2>
        <p className="lead measure-lead mb-4">{journey.lead}</p>
        <p className="prose-body measure mb-7">{journey.blurb}</p>

        <div className="mb-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5">
          <MetaItem label="Group">Max. {journey.groupMax} guests</MetaItem>
          {hosted && <MetaItem label="Hosted by">{site.founder.name}</MetaItem>}
          <MetaItem label="From">
            <span className="font-semibold text-ink">{journey.priceFrom}</span> per person
          </MetaItem>
        </div>

        <span className="link-rule self-start">
          View the journey
          <Arrow />
        </span>
      </Reveal>
    </Link>
  );
}
