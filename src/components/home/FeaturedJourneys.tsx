import Link from 'next/link';
import { Frame, type FrameRatio } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { MetaItem, SectionLabel } from '@/components/ui/Editorial';
import { StatusTag } from '@/components/ui/StatusTag';
import type { JourneySummary } from '@/lib/content';
import { Section } from '@/components/ui/Section';
import { AllDepartures } from './AllDepartures';

/**
 * 4.4 — 03 Journeys (ivory). Not a card grid: one lead and two smaller,
 * unequal entries.
 *
 *   lead   — Frame 4/5, cols 1–7; its caption to the right (cols 8–12),
 *            dropped to a quarter of the image's height.
 *   second — Frame 1/1, cols 8–12, under the lead's caption.
 *   third  — Frame 3/4, cols 2–6, under the lead.
 *
 * With two featured journeys the third simply is not there; with one, the
 * lead stands alone. On a phone everything stacks in reading order.
 *
 * Under them, every departure as one slim list (`all`), so the journeys can
 * be compared on dates, length and price without opening each.
 */
export function FeaturedJourneys({
  journeys,
  all = [],
}: {
  journeys: JourneySummary[];
  all?: JourneySummary[];
}) {
  const [lead, second, third] = journeys;
  if (!lead) return null;

  return (
    <Section contained={false} id="journeys" aria-labelledby="journeys-title">
      <div className="container-site">
        <div className="grid-site mb-block gap-y-8 lg:items-end">
          <div className="col-span-4 md:col-span-6 lg:col-span-8">
            <SectionLabel className="mb-8 lg:mb-10">03 — Journeys</SectionLabel>
            <Reveal variant="mask">
              <h2 id="journeys-title" className="h2 max-w-[20ch]">
                A few journeys a year. Each one we’d take ourselves.
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.15}
            distance={10}
            className="col-span-4 md:col-span-2 md:justify-self-end lg:col-span-4 lg:pb-3"
          >
            <ButtonLink href="/journeys" variant="rule">
              All journeys
            </ButtonLink>
          </Reveal>
        </div>

        <div className="grid-site gap-y-16 lg:gap-y-0">
          {/* The lead photograph. */}
          <Reveal className="col-span-4 md:col-span-8 lg:col-span-7 lg:row-start-1 lg:self-start">
            <Link href={`/journeys/${lead.slug}`} aria-hidden tabIndex={-1} className="group block">
              <Frame
                media={lead.cardMedia}
                hover
                decorative
                sizes="(min-width: 1024px) 58vw, 100vw"
                ratio="4/5"
              />
            </Link>
          </Reveal>

          <div className="col-span-4 flex flex-col gap-16 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:gap-[clamp(64px,7vw,112px)]">
            {/* The lead's caption — dropped to ~25% of the photograph's height
                (a % margin resolves against this column's width: 0.25 × 5/4 ×
                7/5 ≈ 44%). */}
            <Reveal delay={0.1} className="lg:mt-[44%]">
              <LeadCaption journey={lead} />
            </Reveal>
            {second && <Secondary journey={second} ratio="1/1" className="md:w-3/4 lg:w-full" />}
          </div>

          {third && (
            <Secondary
              journey={third}
              ratio="3/4"
              className="col-span-4 md:col-span-5 md:col-start-2 lg:col-span-5 lg:col-start-2 lg:row-start-2 lg:mt-16"
            />
          )}
        </div>

        <AllDepartures journeys={all} />
      </div>
    </Section>
  );
}

/** What the reader should know before falling for a journey; nothing when simply open. */
function JourneyStatus({ journey }: { journey: JourneySummary }) {
  const status = journey.status ?? 'open';
  return (
    <StatusTag status={status === 'open' && journey.isNew ? 'new' : status} className="mb-6 flex" />
  );
}

function LeadCaption({ journey }: { journey: JourneySummary }) {
  const titleId = `featured-${journey.slug}`;
  return (
    <article aria-labelledby={titleId}>
      <JourneyStatus journey={journey} />
      <div className="kicker mb-5">
        {journey.n} · {journey.country}
      </div>
      <h3 id={titleId} className="h3 mb-6">
        {journey.title}
      </h3>
      <p className="lead measure-lead mb-8">{journey.lead}</p>
      <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
        <MetaItem label="Departure">{journey.departureWindow}</MetaItem>
        <MetaItem label="Days">{journey.days} days</MetaItem>
        <MetaItem label="Group">{journey.group}</MetaItem>
      </div>
      <p className="meta mb-8 font-semibold text-ink">From {journey.priceFrom} per person</p>
      <ButtonLink href={`/journeys/${journey.slug}`} variant="rule" aria-describedby={titleId}>
        View the journey
      </ButtonLink>
    </article>
  );
}

function Secondary({
  journey,
  ratio,
  className = '',
}: {
  journey: JourneySummary;
  ratio: FrameRatio;
  className?: string;
}) {
  const titleId = `featured-${journey.slug}`;
  return (
    <Reveal as="article" className={className}>
      <div>
        <Link
          href={`/journeys/${journey.slug}`}
          aria-hidden
          tabIndex={-1}
          className="group mb-7 block"
        >
          <Frame
            media={journey.cardMedia}
            hover
            decorative
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 60vw, 100vw"
            ratio={ratio}
          />
        </Link>
        <JourneyStatus journey={journey} />
        <div className="kicker mb-4">
          {journey.region} · {journey.days} days
        </div>
        <h3 id={titleId} className="h4 mb-4">
          {journey.title}
        </h3>
        <p className="prose-body measure mb-6">{journey.blurb}</p>
        <ButtonLink href={`/journeys/${journey.slug}`} variant="rule" aria-describedby={titleId}>
          View the journey
        </ButtonLink>
      </div>
    </Reveal>
  );
}
