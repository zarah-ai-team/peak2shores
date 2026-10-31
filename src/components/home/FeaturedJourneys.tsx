import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { JourneySummary } from '@/lib/content';
import { DATES_TBA } from '@/lib/journeys';
import { comingSoon, flipbook, journeyRank, statusLabel } from '@/lib/data/flipbook';
import { getMedia, type MediaKey } from '@/lib/media';
import { JourneySlider, type JourneySlide } from './JourneySlider';
import './journeys-home.css';

/* One bright frame per journey of its own, so no photograph on the homepage
   is shown twice (the Journeys index and each journey's page open on others).
   A journey without one falls back to its list frame, then its card frame. */
const homeFrames: Record<string, MediaKey> = {
  'swiss-elegance': 'home-jr-swiss',
  'the-italian-experience': 'home-jr-italy',
  // Dubrovnik, the journey's finale (client, 31 Oct).
  'adriatic-collection': 'ac-hero',
};

/* The flipbook's journeys still to come, as slides. */
const comingSlides: JourneySlide[] = comingSoon.map((c) => ({
  slug: c.slug,
  title: c.title,
  short: c.short,
  places: c.places,
  lead: c.tagline,
  facts: ['Small group', 'Max. 18 guests'],
  soon: true,
  photo: c.photo,
}));

/** What sets a Peaks2Shores group apart, said once above the journeys. */
const promises = [
  {
    title: 'Intimate by Design',
    line: 'No more than 18 guests, creating a more personal and connected travel experience.',
  },
  {
    title: 'Expertly Curated',
    line: 'Exceptional destinations, handpicked hotels, and authentic experiences shaped by local expertise.',
  },
  {
    title: 'Thoughtfully Paced',
    line: 'A beautiful balance of discovery, memorable experiences, and time to enjoy each destination.',
  },
];

/** The promises' marks, drawn fine: a small party of three for the intimate
    group, a compass for the expert hand, an hourglass for the unhurried pace. */
const icons = [
  <>
    <circle cx="12" cy="7.4" r="2.7" />
    <path d="M7 19.5a5 5 0 0 1 10 0" />
    <circle cx="5" cy="9.7" r="2.1" />
    <path d="M1.5 18.3a3.7 3.7 0 0 1 5.2-3.4" />
    <circle cx="19" cy="9.7" r="2.1" />
    <path d="M22.5 18.3a3.7 3.7 0 0 0-5.2-3.4" />
  </>,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3" />
    <path d="M15.6 8.4l-2.3 4.9-4.9 2.3 2.3-4.9z" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </>,
  <>
    <path d="M6 2.75h12M6 21.25h12" />
    <path d="M7.5 2.75c0 4.6 4.5 6.3 4.5 9.25s-4.5 4.65-4.5 9.25" />
    <path d="M16.5 2.75c0 4.6-4.5 6.3-4.5 9.25s4.5 4.65 4.5 9.25" />
    <path d="M9 19.6c1.2-1.3 4.8-1.3 6 0" />
    <path d="M10.2 7.4h3.6" />
  </>,
];

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
 * the three promises as bright cards in the house blues, then every upcoming journey as a
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
        `${j.days} days`,
        `Max. ${j.groupMax} guests`,
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

        <ul className="pts" aria-label="What every journey shares">
          {promises.map((p, i) => (
            <li key={p.title}>
              <span className="ico" aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                >
                  {icons[i]}
                </svg>
              </span>
              <span className="no" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.line}</p>
              </div>
            </li>
          ))}
        </ul>

        <JourneySlider slides={slides} soon={comingSlides} horizon={getMedia('home-jr-horizon')} />
      </div>
    </section>
  );
}
