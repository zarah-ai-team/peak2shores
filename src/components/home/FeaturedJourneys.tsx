import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { JourneySummary } from '@/lib/content';
import { DATES_TBA } from '@/lib/journeys';
import { comingSoon, flipbook, journeyRank, statusLabel } from '@/lib/data/flipbook';
import { getMedia, type MediaKey } from '@/lib/media';
import { site } from '@/lib/site';
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

/**
 * What every group journey shares, said once above the journeys, in plain
 * words and only what the site already stands behind: the 18-guest cap, the
 * hotels, and the free afternoons the itineraries keep.
 */
const promises = [
  {
    label: 'Group size',
    title: `${site.maxGuests} guests, never more.`,
    line: 'Few enough to share one table at dinner, and to go where a coach full of people can’t.',
  },
  {
    label: 'Where you stay',
    title: 'Hotels we would book for ourselves.',
    line: 'Each is chosen for where it sits and how it looks after you, not for its star count.',
  },
  {
    label: 'Pace',
    title: 'Afternoons left open.',
    line: 'Free time is built into every itinerary on purpose, for a long lunch, a swim, or a second look at a town you liked.',
  },
];

/* The logo's own line, drawn once across the three: peaks at the left, a
   lake's easy curve between, and waves at the right. It sits on y = 40 at
   x = 0, 400 and 800, where each point's dot is pinned. */
const RIDGE =
  'M0 40 L52 16 L84 30 L132 6 L186 32 L224 20 L272 40 L400 40 ' +
  'C470 40 520 28 600 28 S730 40 800 40 ' +
  'Q825 30 850 40 T900 40 T950 40 T1000 40 T1050 40 T1100 40 T1150 40 T1200 40';

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
              Small-group journeys, planned around the places and people we know best.
            </p>
          </div>
          <Link className="btn btn-ink" href="/journeys">
            View all journeys <Arrow />
          </Link>
        </div>

        <div className="pts-wrap">
          <svg
            className="ridge"
            viewBox="0 0 1200 64"
            preserveAspectRatio="none"
            aria-hidden
            focusable="false"
          >
            <path d={RIDGE} />
          </svg>
          <ol className="pts" aria-label="What every journey shares">
            {promises.map((p, i) => (
              <li key={p.label}>
                <span className="dot" aria-hidden />
                <span className="lab">
                  {String(i + 1).padStart(2, '0')} · {p.label}
                </span>
                <h3>{p.title}</h3>
                <p>{p.line}</p>
              </li>
            ))}
          </ol>
        </div>

        <JourneySlider slides={slides} soon={comingSlides} horizon={getMedia('home-jr-horizon')} />
      </div>
    </section>
  );
}
