'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { Frame } from '@/components/ui/Frame';
import { JourneyGlobe } from './JourneyGlobe';
import { Reveal } from '@/components/motion/Reveal';
import { MetaItem } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { filterGroups, journeyLabel, type FilterKey, type JourneySummary } from '@/lib/journeys';
import { ease } from '@/lib/motion';

type Selection = Partial<Record<FilterKey, string>>;

/**
 * The journeys index.
 *
 * Filtering is a set of flush-left word lists under a rule — no dropdowns, no
 * pills, no chrome. Selecting an option draws an acqua hairline under it. The
 * list itself is a stack of full-width editorial rows that alternate sides.
 *
 * Takes summaries, not whole journeys: the itineraries and hotel notes never
 * need to reach the client for this page.
 */
export function JourneyExplorer({ journeys }: { journeys: JourneySummary[] }) {
  const [selection, setSelection] = useState<Selection>({});

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
    setSelection((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  }

  const hasFilters = activeCount > 0;

  return (
    <>
      <JourneyGlobe
        journeys={journeys}
        selected={selection.country}
        onSelect={(country) => toggle('country', country)}
      />

      <section
        aria-label="Filter journeys"
        className="gutter grid border-y border-line sm:grid-cols-2 lg:grid-cols-4"
      >
        {filterGroups.map((group) => (
          <fieldset
            key={group.key}
            className="m-0 border-0 border-line py-6 pr-7 sm:border-r sm:pr-7 lg:mr-7"
          >
            <legend className="kicker-sm mb-4 p-0">{group.label}</legend>
            <div className="flex flex-wrap gap-x-[18px] gap-y-1">
              {group.options.map((option) => {
                const on = selection[group.key] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(group.key, option)}
                    className="toggle-link min-h-6 border-0 bg-transparent py-1.5 font-ui text-[14px] font-light leading-[1.3] hover:text-acqua-text"
                    style={{ color: on ? 'var(--color-ink)' : 'var(--color-muted)' }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </section>

      <div className="gutter flex items-center justify-between py-3 font-ui text-[11px] uppercase leading-none tracking-[0.16em] text-muted">
        <span role="status" aria-live="polite">
          {hasFilters
            ? `${visible.length} of ${journeys.length} journeys`
            : `All ${journeys.length} journeys`}
        </span>
        <button
          type="button"
          onClick={() => setSelection({})}
          className="min-h-6 border-0 bg-transparent px-0 py-1 uppercase tracking-[0.16em] text-acqua-text transition-colors duration-300 hover:text-ink"
          style={{ visibility: hasFilters ? 'visible' : 'hidden' }}
        >
          Clear
        </button>
      </div>

      <section className="gutter flex flex-col pb-24 md:pb-[104px]">
        <AnimatePresence initial={false}>
          {visible.map((journey, i) => (
            <m.article
              key={journey.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: ease.editorial }}
            >
              <JourneyRow
                journey={journey}
                flip={i % 2 === 1}
                first={journey.slug === journeys[0]?.slug}
              />
            </m.article>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="editorial-grid--wide border-t border-line py-24 md:py-[120px]">
            <div />
            <div>
              <h2 className="h4 mb-5">Nothing on the list fits that combination — yet.</h2>
              <p className="prose-body mb-7 max-w-[460px] text-[15px]">
                Most of our journeys began as a request like this. Tell us where you’d like to go
                and who you’re travelling with.
              </p>
              <ButtonLink href="/plan" variant="rule">
                Plan a private journey
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function JourneyRow({
  journey,
  flip,
  first,
}: {
  journey: JourneySummary;
  flip: boolean;
  /** The top row of the full list is the page's largest paint, so it loads eagerly. */
  first: boolean;
}) {
  const titleId = `journey-${journey.slug}-title`;

  return (
    <Link
      href={`/journeys/${journey.slug}`}
      aria-labelledby={titleId}
      className={`group grid items-stretch gap-8 border-t border-line py-12 transition-colors duration-300 hover:bg-panel lg:gap-14 lg:py-14 ${
        flip
          ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
          : 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]'
      }`}
    >
      <Frame
        media={journey.listMedia}
        hover
        decorative
        priority={first}
        sizes="(min-width: 1024px) 55vw, 100vw"
        className={`h-[300px] sm:h-[420px] lg:h-auto lg:min-h-[520px] ${
          flip ? 'lg:order-2' : 'lg:order-1'
        }`}
      />

      <Reveal
        direction={flip ? 'right' : 'left'}
        distance={24}
        className={`flex flex-col justify-between gap-7 py-2 ${flip ? 'lg:order-1' : 'lg:order-2'}`}
      >
        <div className="kicker-sm flex justify-between gap-4">
          <span>
            {journeyLabel(journey) && (
              <span className="text-acqua-text">{journeyLabel(journey)} · </span>
            )}
            {journey.country} · {journey.region}
          </span>
          <span>{journey.n}</span>
        </div>

        <div>
          <h2 id={titleId} className="h3 mb-5 max-w-[520px]">
            {journey.title}
          </h2>
          <p className="lead mb-4 max-w-[520px] text-[20px]">{journey.lead}</p>
          <p className="prose-body-sm max-w-[480px] leading-[1.75]">{journey.blurb}</p>
        </div>

        <div className="grid grid-cols-2 gap-5 border-t border-line pt-4 sm:grid-cols-4">
          <MetaItem label="Duration">{journey.days} days</MetaItem>
          <MetaItem label="Departure">{journey.departure}</MetaItem>
          <MetaItem label="Group">{journey.group}</MetaItem>
          <MetaItem label="From">{journey.priceFrom} pp</MetaItem>
        </div>

        <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
          {journey.tags.map((tag) => (
            <li
              key={tag}
              className="border border-line px-2.5 py-1.5 font-ui text-[10px] uppercase leading-none tracking-[0.16em] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </Reveal>
    </Link>
  );
}
