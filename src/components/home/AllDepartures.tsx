import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { Frame } from '@/components/ui/Frame';
import { StatusTag } from '@/components/ui/StatusTag';
import type { JourneySummary } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

/* One bright frame per journey — its own, so no photograph on the homepage is
   shown twice. A journey without one falls back to its list frame. */
const thumbs: Record<string, MediaKey> = {
  'the-swiss-lakes': 'dep-swiss-lakes',
  'amalfi-slowly': 'dep-amalfi',
  'como-and-the-engadin': 'dep-como',
  'mallorca-beyond-the-coast': 'dep-mallorca',
  'the-cape-unhurried': 'dep-cape',
};

/**
 * All departures, in date order, as simple cards: the photograph, then the
 * dates, the name, a line on the journey and the way through to it. Three
 * across on a desktop, two on a tablet, one on a phone. Each card is a single
 * link (the title's, stretched over the whole card), so a screen reader hears
 * each journey once.
 */
export function AllDepartures({ journeys }: { journeys: JourneySummary[] }) {
  const cards = journeys
    .filter((j) => j.status !== 'past')
    .sort((a, b) => a.departureISO.localeCompare(b.departureISO));
  if (cards.length === 0) return null;

  return (
    <Reveal className="mt-section-sm">
      <h3 id="departures-title" className="kicker mb-6">
        All departures
      </h3>
      <ul
        aria-labelledby="departures-title"
        className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        {cards.map((j) => (
          <li
            key={j.slug}
            className="group relative flex flex-col border border-line bg-white p-4 transition-colors duration-500 hover:border-ink/30 sm:p-5"
          >
            <Frame
              media={thumbs[j.slug] ?? j.listMedia}
              ratio="4/3"
              hover
              decorative
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
            />
            <div className="flex flex-1 flex-col pt-6">
              <p className="kicker-sm mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span>
                  {j.departureWindow} · {j.days} days
                </span>
                {j.status && j.status !== 'open' && <StatusTag status={j.status} />}
              </p>
              <h4 className="h4 mb-3">
                <Link
                  href={`/journeys/${j.slug}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {j.title}
                </Link>
              </h4>
              <p className="prose-body-sm mb-7">{j.blurb}</p>
              <div className="mt-auto flex items-end justify-between gap-4">
                <span
                  aria-hidden
                  className="kicker-sm inline-flex items-center gap-2 border-b border-current pb-1.5 text-ink transition-colors duration-300 group-hover:text-brand"
                >
                  View details
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 9 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    <path d="M1 8l7-7M2.5 1H8v5.5" />
                  </svg>
                </span>
                <span className="meta text-muted">From {j.priceFrom}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
