import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { JourneySummary } from '@/lib/content';
import { DATES_TBA } from '@/lib/journeys';
import { comingSoon, flipbook, journeyRank, statusLabel } from '@/lib/data/flipbook';
import { getMedia, type MediaKey } from '@/lib/media';
import { JourneySlider, type JourneySlide } from './JourneySlider';
import { PromiseCards } from './PromiseCards';
import './journeys-home.css';

/* One bright frame per journey of its own, so no photograph on the homepage
   is shown twice (the Journeys index and each journey's page open on others).
   A journey without one falls back to its list frame, then its card frame. */
const homeFrames: Record<string, MediaKey> = {
  'swiss-elegance': 'home-jr-swiss',
  'the-italian-experience': 'home-jr-italy',
  // Dubrovnik, the journey's finale, in golden light (8 Nov).
  'adriatic-collection': 'home-jr-adriatic',
};

/* The flipbook's journeys still to come, as slides. */
const comingSlides: JourneySlide[] = comingSoon.map((c) => ({
  slug: c.slug,
  title: c.title,
  short: c.short,
  places: c.places,
  lead: c.tagline,
  facts: [],
  soon: true,
  photo: c.photo,
}));

/**
 * What every group journey shares, said once above the journeys. Marc's
 * wording, word for word (feedback of 29 Oct, Small Luxury Group Journeys).
 */
const promises = [
  {
    title: 'Intimate by Design',
    line: 'Small groups of like-minded travelers, creating a more personal and connected travel experience.',
    icon: 'group',
  },
  {
    title: 'Expertly Curated',
    line: 'Exceptional destinations, handpicked hotels, and authentic experiences shaped by local expertise.',
    icon: 'compass',
  },
  {
    title: 'Thoughtfully Paced',
    line: 'A beautiful balance of discovery, memorable experiences, and time to enjoy each destination.',
    icon: 'time',
  },
] as const;

/** A fine line icon for each promise, drawn in the brand blue. */
function PromiseIcon({ kind }: { kind: (typeof promises)[number]['icon'] }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {kind === 'group' && (
        <>
          <circle cx="11" cy="11.5" r="3.5" />
          <circle cx="21.5" cy="12.5" r="3" />
          <path d="M4.5 25c.6-4.2 3.2-6.5 6.5-6.5s5.9 2.3 6.5 6.5" />
          <path d="M18.6 19.3c.9-.5 1.9-.8 2.9-.8 2.9 0 5.1 2 5.6 5.8" />
        </>
      )}
      {kind === 'compass' && (
        <>
          <circle cx="16" cy="16" r="11" />
          <path d="M20.5 11.5l-2.6 6.4-6.4 2.6 2.6-6.4z" />
          <path d="M16 5v2M16 25v2M5 16h2M25 16h2" />
        </>
      )}
      {kind === 'time' && (
        <>
          <path d="M10 5h12M10 27h12" />
          <path d="M11 5c0 5.5 5 7.5 5 11s-5 5.5-5 11M21 5c0 5.5-5 7.5-5 11s5 5.5 5 11" />
          <path d="M13.5 24.5c.8-1.6 1.6-2.3 2.5-2.3s1.7.7 2.5 2.3" />
        </>
      )}
    </svg>
  );
}

/* The words in each title that name where it goes, set in blue on the slider
   in place of a separate country label. A journey not listed here falls back
   to its countries, where they appear in its title. */
const titlePlaces: Record<string, string[]> = {
  'swiss-elegance': ['Swiss', 'Italian'],
  'the-italian-experience': ['Italy'],
  'adriatic-collection': ['Adriatic'],
};

/** The journey's photograph: the first of its frames that has a file. */
function slidePhoto(journey: JourneySummary): JourneySlide['photo'] {
  const keys = [homeFrames[journey.slug], journey.listMedia, journey.cardMedia].filter(
    (k): k is MediaKey => Boolean(k),
  );
  const slot = getMedia(keys.find((k) => getMedia(k).src) ?? keys[0]);
  return { src: slot.src, alt: slot.alt ?? slot.label, tone: slot.tone };
}

/**
 * 04 — Small Luxury Group Journeys, on white: the section's name and line,
 * the three promises hung on a line drawn like the logo, then every upcoming journey as a
 * full-photograph slide in Marc's order — each plainly bookable, with its
 * status and a way to reserve — with a switch to the flipbook's journeys
 * still to come; each view closes on a "more journeys are taking shape" slide.
 */
export function FeaturedJourneys({ journeys }: { journeys: JourneySummary[] }) {
  const upcoming = journeys
    .filter((j) => j.status !== 'past')
    // Undated journeys keep catalog order, after any dated ones.
    .sort((a, b) => (a.departureISO ?? '~').localeCompare(b.departureISO ?? '~'))
    // Then Marc's order, for the journeys he has placed.
    .sort((a, b) => journeyRank(a.slug) - journeyRank(b.slug));
  if (upcoming.length === 0) return null;

  const slides: JourneySlide[] = upcoming.map((j) => {
    const book = flipbook[j.slug];
    const title = book?.title ?? j.title;
    return {
      slug: j.slug,
      title,
      // The short name on a card: the title up to its first comma or colon.
      short: book?.short ?? title.split(/[,:]/)[0],
      places: titlePlaces[j.slug] ?? j.country.split(/\s*(?:&|,|\band\b)\s*/).filter(Boolean),
      lead: book?.tagline ?? j.lead,
      facts: [
        ...(j.departure && j.departure !== DATES_TBA ? [j.departure] : []),
        ...(j.priceFrom ? [`From ${j.priceFrom}`] : []),
      ],
      status: statusLabel[j.status ?? 'open'],
      photo: slidePhoto(j),
    };
  });

  return (
    <section className="hc-jr" id="journeys" aria-labelledby="journeys-title">
      <div className="panel">
        <div className="head">
          <div>
            <h2 id="journeys-title">Our Signature Journeys</h2>
            <p className="sub-h">
              Extraordinary destinations. Intimate groups. Thoughtfully curated experiences.
            </p>
          </div>
          <Link className="btn btn-ink" href="/journeys">
            View all journeys <Arrow />
          </Link>
        </div>

        {/* The three promises as white cards with a blue accent (8 Nov). */}
        <div className="pts-wrap">
          <PromiseCards
            items={promises.map((p) => ({
              title: p.title,
              line: p.line,
              icon: <PromiseIcon kind={p.icon} />,
            }))}
          />
        </div>

        <JourneySlider slides={slides} soon={comingSlides} horizon={getMedia('home-jr-horizon')} />
      </div>
    </section>
  );
}
