import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { StatusTag } from '@/components/ui/StatusTag';
import type { JourneySummary } from '@/lib/content';
import { Section } from '@/components/ui/Section';
import { AllDepartures } from './AllDepartures';

/**
 * 4.4 — 03 Journeys (ivory), as two screens.
 *
 * The first is the featured journeys side by side: one photograph each, with
 * the name, the dates, the length and the price beneath — everything needed
 * to choose, comparable at a glance. On a desktop the row takes whatever
 * height the screen leaves under the headline; on a phone the cards stack.
 *
 * The second is every departure as one slim list (`all`), so the journeys can
 * be compared on dates, length and price without opening each.
 */
export function FeaturedJourneys({
  journeys,
  all = [],
}: {
  journeys: JourneySummary[];
  all?: JourneySummary[];
}) {
  if (journeys.length === 0) return null;

  return (
    <>
      <Section contained={false} screen id="journeys" aria-labelledby="journeys-title">
        <div className="container-site lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="grid-site mb-block gap-y-6 lg:mb-[4svh] lg:items-end">
            <div className="col-span-4 md:col-span-6 lg:col-span-9">
              <SectionLabel className="mb-8 lg:mb-[2.5svh]">03 — Journeys</SectionLabel>
              <Reveal variant="mask">
                <h2 id="journeys-title" className="h2 max-w-[34ch]">
                  A few journeys a year. Each one we’d take ourselves.
                </h2>
              </Reveal>
            </div>
            <Reveal
              delay={0.15}
              distance={10}
              className="col-span-4 md:col-span-2 md:justify-self-end lg:col-span-3 lg:pb-2"
            >
              <ButtonLink href="/journeys" variant="rule">
                All journeys
              </ButtonLink>
            </Reveal>
          </div>

          <RevealGroup
            as="ul"
            stagger={0.08}
            className="m-0 grid list-none gap-x-[var(--grid-gap)] gap-y-14 p-0 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]"
          >
            {journeys.slice(0, 3).map((journey) => (
              <RevealItem as="li" key={journey.slug} distance={16} className="lg:min-h-0">
                <JourneyCard journey={journey} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <AllDepartures journeys={all} />
    </>
  );
}

/** What the reader should know before falling for a journey; nothing when simply open. */
function JourneyStatus({ journey }: { journey: JourneySummary }) {
  const status = journey.status ?? 'open';
  if (status === 'open' && !journey.isNew) return null;
  return <StatusTag status={status === 'open' ? 'new' : status} className="mb-3 flex" />;
}

function JourneyCard({ journey }: { journey: JourneySummary }) {
  const titleId = `featured-${journey.slug}`;
  return (
    <article aria-labelledby={titleId} className="flex h-full flex-col">
      <Link
        href={`/journeys/${journey.slug}`}
        aria-hidden
        tabIndex={-1}
        className="group mb-5 block lg:mb-[2.2svh] lg:min-h-0 lg:flex-1"
      >
        <Frame
          media={journey.cardMedia}
          hover
          decorative
          sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="aspect-[4/5] md:aspect-[3/4] lg:aspect-auto lg:h-full"
        />
      </Link>
      <JourneyStatus journey={journey} />
      <div className="kicker-sm mb-2 text-muted">
        {journey.n} · {journey.country}
      </div>
      <h3 id={titleId} className="h4 mb-3">
        {journey.title}
      </h3>
      <p className="meta mb-4 text-body">
        {journey.departureWindow} · {journey.days} days · Max. {journey.groupMax}
      </p>
      <div className="flex items-center justify-between gap-6 border-t border-line pt-4">
        <p className="meta m-0 font-semibold text-ink">From {journey.priceFrom}</p>
        <ButtonLink href={`/journeys/${journey.slug}`} variant="rule" aria-describedby={titleId}>
          View the journey
        </ButtonLink>
      </div>
    </article>
  );
}
