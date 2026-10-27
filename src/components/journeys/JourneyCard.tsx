import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Arrow } from '@/components/ui/Button';
import { StatusTag } from '@/components/ui/StatusTag';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import type { JourneySummary } from '@/lib/content';
import type { MediaKey } from '@/lib/media';
import { site } from '@/lib/site';

/**
 * A small luxury group journey as a card, after A&K's journey finder: a
 * landscape photograph with the booking state on it, the country and length,
 * the title, one line, then the facts a reader compares on — dates and group
 * size — and the price beside the way in. Cards sit in a 1 / 2 / 3 column grid
 * and line up row by row, so the dates and prices read across.
 *
 * The title is the link; its hit area stretches over the whole card.
 */
export function JourneyCard({
  journey,
  media,
  priority = false,
  wide = false,
  as: Heading = 'h3',
}: {
  journey: JourneySummary;
  /** The photograph, when the page needs one other than the list frame. */
  media?: MediaKey;
  priority?: boolean;
  /** A card set half the row wide, which takes a longer, lower frame. */
  wide?: boolean;
  as?: 'h2' | 'h3';
}) {
  const titleId = `card-${journey.slug}-title`;

  return (
    <article aria-labelledby={titleId} className="group relative flex h-full flex-col">
      <div className="relative">
        <Frame
          ratio={wide ? '16/10' : '4/3'}
          media={media ?? journey.listMedia}
          hover
          decorative
          priority={priority}
          sizes={
            wide
              ? '(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw'
              : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
          }
        />
        <Badges journey={journey} />
      </div>

      <div className="flex grow flex-col pt-6">
        <p className="kicker-sm m-0 mb-3">
          {journey.country} · {journey.days} days
        </p>
        <Heading id={titleId} className="h4 m-0 mb-3">
          <Link
            href={`/journeys/${journey.slug}`}
            className="transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:text-acqua-text"
          >
            {journey.title}
          </Link>
        </Heading>
        <p className="prose-body-sm m-0 mb-6">{journey.lead}</p>

        <dl className="m-0 mt-auto grid grid-cols-2 gap-x-6 border-t border-line pt-4">
          <div>
            <dt className="kicker-sm mb-1.5">Dates</dt>
            {/* Where cards sit side by side, two lines are held for the dates so
                the rules line up across the row. */}
            <dd className="meta m-0 text-body sm:min-h-[3.2em]">{journey.departureWindow}</dd>
          </div>
          <div>
            <dt className="kicker-sm mb-1.5">Group</dt>
            <dd className="meta m-0 text-body">Max. {journey.groupMax} guests</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <p className="meta m-0 text-body">
            From <span className="font-semibold text-ink">{journey.priceFrom}</span> per person
          </p>
          <span
            aria-hidden
            className="kicker-sm inline-flex items-center gap-2 whitespace-nowrap text-ink"
          >
            View journey
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

/**
 * The same journey laid out across the page, for the Journeys index: the
 * photograph on the left, and on the right everything the reader decides on,
 * in the agreed order — the overview, where you stay, the dates and the
 * price. One standard row per journey, so every journey reads the same way.
 */
export function JourneyListing({
  journey,
  priority = false,
}: {
  journey: JourneySummary;
  priority?: boolean;
}) {
  const titleId = `listing-${journey.slug}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="group relative grid gap-x-10 gap-y-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-14"
    >
      <div className="relative self-start">
        <Frame
          ratio="4/3"
          media={journey.listMedia}
          hover
          decorative
          priority={priority}
          sizes="(min-width: 768px) 42vw, 100vw"
        />
        <Badges journey={journey} />
      </div>

      <div className="flex flex-col">
        <p className="kicker-sm m-0 mb-3">
          {journey.country} · {journey.region} · {journey.days} days
        </p>
        <h2 id={titleId} className="h3 m-0 mb-4">
          <Link
            href={`/journeys/${journey.slug}`}
            className="transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:text-acqua-text"
          >
            {journey.title}
          </Link>
        </h2>

        <dl className="m-0 grid gap-x-8 gap-y-5 border-t border-line pt-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="kicker-sm mb-1.5">Overview</dt>
            <dd className="prose-body-sm m-0">
              {journey.lead} {journey.blurb}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="kicker-sm mb-1.5">Stays</dt>
            <dd className="meta m-0 text-body">
              {journey.stays.length > 0
                ? journey.stays
                    .map((s) => (s.nights ? `${s.name} · ${s.nights}` : s.name))
                    .join('  ·  ')
                : 'Being confirmed'}
            </dd>
          </div>
          <div>
            <dt className="kicker-sm mb-1.5">Dates</dt>
            <dd className="meta m-0 text-body">{journey.departureWindow}</dd>
          </div>
          <div>
            <dt className="kicker-sm mb-1.5">Group</dt>
            <dd className="meta m-0 text-body">Max. {journey.groupMax} guests</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-5">
          <p className="m-0">
            <span className="kicker-sm mr-3">Price</span>
            <span className="meta text-body">
              From <span className="font-semibold text-ink">{journey.priceFrom}</span> per person
            </span>
          </p>
          <span
            aria-hidden
            className="kicker-sm inline-flex items-center gap-2 whitespace-nowrap text-ink"
          >
            View journey
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

/** The booking state and "Hosted by Marc", set on the photograph. */
function Badges({ journey }: { journey: JourneySummary }) {
  const tag = journeyTagStatus(journey);
  const hosted = journey.tags.includes('Hosted by Marc');
  if (tag === 'open' && !hosted) return null;
  return (
    <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
      {tag !== 'open' && (
        <span className="bg-ivory/95 px-3 py-2">
          <StatusTag status={tag} />
        </span>
      )}
      {hosted && (
        <span className="kicker-sm bg-ivory/95 px-3 py-2 text-ink">
          Hosted by {site.founder.name.split(' ')[0]}
        </span>
      )}
    </div>
  );
}
