import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { JourneySummary } from '@/lib/content';
import { getMedia, type MediaKey } from '@/lib/media';
import { JourneySlider, type JourneySlide } from './JourneySlider';
import './journeys-home.css';

/* One bright frame per journey of its own, so no photograph on the homepage
   is shown twice (the Journeys index and each journey's page open on others).
   A journey without one falls back to its list frame, then its card frame. */
const homeFrames: Record<string, MediaKey> = {
  'swiss-elegance': 'home-jr-swiss',
  'the-italian-experience': 'home-jr-italy',
  'adriatic-collection': 'dep-adriatic',
};

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

/** The promises' marks: two glasses raised to a small table, a cut gem for
    the handpicked, and the sun going down slowly over the water. */
const icons = [
  <>
    <g transform="rotate(-14 7.5 12)">
      <path d="M5 6h5v2.6a2.5 2.5 0 0 1-5 0z" />
      <path d="M5.3 7.9h4.4" />
      <path d="M7.5 11.1v7M5.5 18.1h4" />
    </g>
    <g transform="rotate(14 16.5 12)">
      <path d="M14 6h5v2.6a2.5 2.5 0 0 1-5 0z" />
      <path d="M14.3 7.9h4.4" />
      <path d="M16.5 11.1v7M14.5 18.1h4" />
    </g>
    <path d="M12 1.6v2.2M9.7 2.7l1 .9M14.3 2.7l-1 .9" />
  </>,
  <>
    <path d="M6.5 4.5h11l3.5 4.8L12 20.5 3 9.3z" />
    <path d="M3 9.3h18" />
    <path d="M9.6 4.5 8.3 9.3 12 20.5l3.7-11.2-1.3-4.8" />
    <path d="M8.3 9.3 12 4.5l3.7 4.8" />
    <path d="M20.2 1.4v2.2M19.1 2.5h2.2" />
  </>,
  <>
    <path d="M6.5 14a5.5 5.5 0 0 1 11 0" />
    <path d="M3 14h18" />
    <path d="M12 4.6v1.9M5.9 7.4l1.3 1.3M18.1 7.4l-1.3 1.3" />
    <path d="M4.5 17.4c1.25-.85 2.5-.85 3.75 0s2.5.85 3.75 0 2.5-.85 3.75 0 2.5.85 3.75 0" />
    <path d="M8 20.4c1-.7 2-.7 3 0s2 .7 3 0 2-.7 3 0" />
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
 * the three promises as soft blue tiles,
 * then every upcoming journey as a full-photograph slide, closing on a
 * "more journeys are taking shape" slide. No dates or prices here; those
 * live on each journey's page.
 */
export function FeaturedJourneys({ journeys }: { journeys: JourneySummary[] }) {
  const upcoming = journeys
    .filter((j) => j.status !== 'past')
    // Undated journeys keep catalog order, after any dated ones.
    .sort((a, b) => (a.departureISO ?? '~').localeCompare(b.departureISO ?? '~'));
  if (upcoming.length === 0) return null;

  // A different journey leads each day, so the slider never always opens on
  // the same country. The page regenerates hourly, so it turns on its own.
  const turn = Math.floor(Date.now() / 86_400_000) % upcoming.length;
  const ordered = [...upcoming.slice(turn), ...upcoming.slice(0, turn)];

  const slides: JourneySlide[] = ordered.map((j) => ({
    slug: j.slug,
    title: j.title,
    // The short name on a card: the title up to its first comma or colon.
    short: j.title.split(/[,:]/)[0],
    places: titlePlaces[j.slug] ?? j.country.split(/\s*(?:&|,|\band\b)\s*/).filter(Boolean),
    lead: j.lead,
    days: j.days,
    groupMax: j.groupMax,
    photo: slidePhoto(j),
  }));

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
              <div>
                <h3>{p.title}</h3>
                <p>{p.line}</p>
              </div>
            </li>
          ))}
        </ul>

        <JourneySlider slides={slides} horizon={getMedia('home-jr-horizon')} />
      </div>
    </section>
  );
}
