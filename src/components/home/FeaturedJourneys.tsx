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
  'swiss-elegance': 'dep-swiss-lakes',
  'the-italian-experience': 'dep-italian-experience',
  'adriatic-collection': 'dep-adriatic',
};

/** What sets a Peaks2Shores group apart, said once above the journeys. */
const promises = [
  { title: 'Never more than 18 guests', line: 'Small enough for every table, boat and doorway.' },
  {
    title: 'Personally curated',
    line: 'Places Marc knows well, and people he has known for years.',
  },
  { title: 'Thoughtfully paced', line: 'Fewer moves, longer stays, and free time on purpose.' },
];

/** The promises' gold marks: a small group, a compass, an hourglass. */
const icons = [
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M15.5 14.3c2.3-.3 4.3 1.2 5 4.2" />
  </>,
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.5 8.5l-2 5-5 2 2-5z" />
  </>,
  <>
    <path d="M7 3.5h10M7 20.5h10" />
    <path d="M8 3.5c0 4.5 8 4.5 8 8.5s-8 4-8 8.5" />
    <path d="M16 3.5c0 4.5-8 4.5-8 8.5s8 4 8 8.5" />
  </>,
];

/** The journey's photograph: the first of its frames that has a file. */
function slidePhoto(journey: JourneySummary): JourneySlide['photo'] {
  const keys = [homeFrames[journey.slug], journey.listMedia, journey.cardMedia].filter(
    (k): k is MediaKey => Boolean(k),
  );
  const slot = getMedia(keys.find((k) => getMedia(k).src) ?? keys[0]);
  return { src: slot.src, alt: slot.alt ?? slot.label, tone: slot.tone };
}

/**
 * 04 — Small Luxury Group Journeys, as a deep-blue panel risen over the
 * paper: the section's name and line, the three promises as glass cards,
 * then every upcoming journey as a full-photograph slide, closing on a drawn
 * "more journeys are taking shape" slide. No dates or prices here; those
 * live on each journey's page.
 */
export function FeaturedJourneys({ journeys }: { journeys: JourneySummary[] }) {
  const upcoming = journeys
    .filter((j) => j.status !== 'past')
    // Undated journeys keep catalog order, after any dated ones.
    .sort((a, b) => (a.departureISO ?? '~').localeCompare(b.departureISO ?? '~'));
  if (upcoming.length === 0) return null;

  const slides: JourneySlide[] = upcoming.map((j) => ({
    slug: j.slug,
    title: j.title,
    // The short name on a card: the title up to its first comma.
    short: j.title.split(',')[0],
    country: j.country,
    lead: j.lead,
    days: j.days,
    groupMax: j.groupMax,
    photo: slidePhoto(j),
  }));

  return (
    <section className="hc-jr" id="journeys" aria-labelledby="journeys-title">
      <div className="panel">
        {/* Peaks to shores: a gold ridge over drifting water. */}
        <svg className="motif" viewBox="0 0 640 300" fill="none" aria-hidden focusable="false">
          <path
            d="M0 210 L120 120 L170 160 L270 40 L360 150 L410 110 L520 200 L640 150"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <g className="drift">
            <path
              d="M0 240 C40 228 80 228 120 240 S200 252 240 240 S320 228 360 240 S440 252 480 240 S560 228 600 240 S660 252 700 240"
              stroke="var(--sky)"
              strokeWidth="1.2"
            />
            <path
              d="M0 266 C40 254 80 254 120 266 S200 278 240 266 S320 254 360 266 S440 278 480 266 S560 254 600 266 S660 278 700 266"
              stroke="var(--sky)"
              strokeWidth="1.2"
              opacity="0.6"
            />
          </g>
        </svg>

        <div className="head">
          <div>
            <span className="gl" aria-hidden />
            <h2 id="journeys-title">Small Luxury Group Journeys</h2>
            <p className="sub-h">A few journeys a year. Each one we’d take ourselves.</p>
          </div>
          <Link className="btn btn-light" href="/journeys">
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
                  strokeWidth="1.4"
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

        <JourneySlider slides={slides} />
      </div>
    </section>
  );
}
