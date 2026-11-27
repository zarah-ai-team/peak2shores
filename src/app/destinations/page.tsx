import Image from 'next/image';
import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/destinations/destinations.css';
import { PlaceStory } from '@/components/destinations/PlaceStory';
import {
  SCENES,
  type StoryPhoto,
  type StoryPlace,
  type StoryScene,
} from '@/components/destinations/story';
import { placePhotos } from '@/components/journeys/placePhotos';
import { journeyBookingTag } from '@/components/pages/journeyStatus';
import {
  getDestinations,
  getJourneys,
  pageMetadata,
  type Destination,
  type Journey,
} from '@/lib/content';
import { horizon } from '@/lib/data/copy';
import { PRIVATE_TRAVEL_HREF } from '@/lib/links';
import { getMedia, type MediaKey } from '@/lib/media';
import { journeyAvailabilityOf, RATES_TBA } from '@/lib/journeys';

export const metadata = pageMetadata({
  title: 'Destinations',
  description:
    'Where mountains meet water: the Alps, alpine lakes, the Mediterranean and the Atlantic. The places Peaks2Shores returns to, and the journeys that go there.',
  path: '/destinations',
  image: 'destinations-hero',
});

/* Lists journeys, so it is rebuilt hourly with them. */
export const revalidate = 3600;

/**
 * Destinations, in the homepage's language: the countries as one story told
 * by scrolling, starting with the first country on the first screen
 * (PlaceStory: each country's photograph with its name standing in it, then
 * its journeys and places), the destinations of the journeys in the making
 * (coming soon, after the Journey Book) and a closing invitation over a
 * photograph. Every fact is derived from the catalog or the Journey Book —
 * nothing here is invented.
 */
export default async function DestinationsPage() {
  const [places, journeys] = await Promise.all([getDestinations(), getJourneys()]);
  const story = [...places]
    .sort((a, b) => order(a.slug) - order(b.slug))
    .map((place) => storyPlace(place, journeys));
  const closing = getMedia('dest-private');

  return (
    <div className="hc dz">
      {/* The page's name, for search and screen readers: the first thing seen
          is the first country itself (owner's note of 18 Nov 2026). */}
      <h1 className="sr-only">Destinations: where mountains meet water</h1>

      {/* The countries as one story, opening the page on the first of them:
          each photograph slides up with the last, the country's name rising
          from behind its land; then its journeys and the places they stay. */}
      <PlaceStory places={story} lead />

      {/* On the horizon: the destinations of the journeys in the making
          (Ishika's notes of 24 Nov 2026), each with its Journey Book
          photograph and marked coming soon. They have no page yet, so
          nothing here is a link but the last place: the way to hear first. */}
      <section className="dz-soon" aria-labelledby="dz-soon-title">
        <div className="dz-soon-head">
          <div>
            <p className="lab">On the horizon</p>
            <h2 id="dz-soon-title">Journeys in the making.</h2>
          </div>
          <p>The places our next journeys will take you. Each one is coming soon.</p>
        </div>
        <ul className="dz-soon-list">
          {horizon.map((journey) => (
            <li key={journey.slug} className="dz-soon-card">
              <span className="dz-soon-pic">
                <Image
                  src={journey.photo.src}
                  alt={journey.photo.alt}
                  fill
                  // An upright 4:5 crop of a landscape photograph is drawn
                  // by its height, nearly twice the card's width: the file is
                  // chosen at about 1.4 times the card (four to a row from
                  // 900px; two below, 4:3 on a tablet, 4:5 on a phone).
                  sizes="(min-width: 900px) 34vw, (min-width: 641px) 50vw, 64vw"
                  className="fill photo-grade"
                  style={journey.photo.pos ? { objectPosition: journey.photo.pos } : undefined}
                />
              </span>
              <span className="dz-soon-k">Coming soon</span>
              <h3 className="dz-soon-t">{journey.place}</h3>
              <span className="dz-soon-f">{journey.title}</span>
            </li>
          ))}
          <li className="dz-soon-more">
            <p className="lab">And more</p>
            <p className="dz-soon-more-t">More journeys are taking shape.</p>
            {/* `data-fab-clear`: the floating "Connect with our team" steps
                aside rather than sit over the link at the foot of the screen. */}
            <Link className="tlink light" href="/#circle" data-fab-clear>
              Hear first in The Circle →
            </Link>
          </li>
        </ul>
      </section>

      {/* The closing invitation, over a photograph. Up to 700px wide the band
          is narrower than the photograph's shape, so the photograph is drawn
          by the band's height, about 52rem across: its file is chosen for
          four-fifths of that, as the countries' photographs are (two-thirds
          of it again on a screen of three device pixels to the CSS pixel). */}
      <section className="hc-circle dz-close" aria-labelledby="dz-close-title" data-fab-away>
        <div className="bg" aria-hidden>
          {closing.src && (
            <Image
              src={closing.src}
              alt={closing.alt ?? ''}
              fill
              sizes="(max-width: 700px) and (min-resolution: 2.5dppx) 28rem, (max-width: 700px) 42rem, 100vw"
              className="fill"
            />
          )}
        </div>
        <div className="in">
          <div className="lab">Bespoke Private Travel</div>
          <h2 id="dz-close-title">Or a journey with only your names on the list.</h2>
          <p>
            Families, friends, a milestone. The same hotels, the same people on the ground, on your
            dates. Start with a conversation, not a form.
          </p>
          <div className="ctarow">
            <Link className="btn btn-light" href={PRIVATE_TRAVEL_HREF}>
              Bespoke Private Travel
            </Link>
            <Link className="tlink light" href="/plan#contact">
              Connect with our team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** The countries in the story's order (owner's note of 23 Nov 2026); any other after them. */
const ORDER = ['switzerland', 'italy', 'croatia'];
const order = (slug: string) => {
  const i = ORDER.indexOf(slug);
  return i < 0 ? ORDER.length : i;
};

/** A line under each country's name, in the journeys' own voice. */
const TAGLINE: Record<string, string> = {
  italy: 'Lakes, kitchens, the lagoon and Sicily’s temples, unhurried.',
  switzerland: 'Marc’s home country, shown to a friend.',
  spain: 'The island after the season leaves.',
  'south-africa': 'Wine, sea and long tables.',
  croatia: 'The Adriatic, from Venice down to Dubrovnik.',
};

/**
 * Which country each stop of a journey that crosses a border lies in. A
 * journey within one country (Italy Uncovered) needs no entry: all its stops
 * are there. This only decides under which country a place is shown; its
 * name, nights and photograph come from the catalog.
 */
const STOP_COUNTRY: Record<string, string> = {
  Lucerne: 'Switzerland',
  Grindelwald: 'Switzerland',
  Montreux: 'Switzerland',
  Zermatt: 'Switzerland',
  Stresa: 'Italy',
  Milan: 'Italy',
  Venice: 'Italy',
  Rovinj: 'Croatia',
  Split: 'Croatia',
  Hvar: 'Croatia',
  Dubrovnik: 'Croatia',
};

/** A journey's short name, as in the site menu: its title up to the first comma or colon. */
const shortName = (title: string) => title.split(/[,:]/)[0].trim();

/** A registry photograph that has a file. */
function photoOf(key: MediaKey | undefined): StoryPhoto | null {
  if (!key) return null;
  const slot = getMedia(key);
  return slot.src ? { src: slot.src, alt: slot.alt ?? slot.label } : null;
}

/** A country with no scene of its own (none today): its photograph, no cut-out. */
function sceneFor(place: Destination): StoryScene {
  return (
    SCENES[place.slug] ?? {
      src: getMedia(place.media).src ?? '',
      cutout: null,
      width: 3,
      height: 2,
      x: 0.5,
      xNarrow: 0.5,
      y: 0.5,
      skyline: 0.55,
      sink: 0,
    }
  );
}

/**
 * One country for the story, from the catalog: the journeys that go there,
 * and the places they sleep in that lie there (in route order, with their
 * nights and the stay's own photograph, or the route's photograph of the
 * place), each photograph shown once in the country's view.
 */
function storyPlace(place: Destination, catalog: Journey[]): StoryPlace {
  const scene = sceneFor(place);
  const used = new Set([scene.src]);
  const fresh = (...photos: (StoryPhoto | null | undefined)[]) => {
    const photo = photos.find((p): p is StoryPhoto => Boolean(p && !used.has(p.src))) ?? null;
    if (photo) used.add(photo.src);
    return photo;
  };

  const stays: StoryPlace['stays'] = [];
  const seen = new Set<string>();
  for (const summary of place.journeys) {
    const journey = catalog.find((j) => j.slug === summary.slug);
    if (!journey) continue;
    const within = !journey.country.includes(' & ');
    for (const stay of (journey.flyer?.parts ?? []).flatMap((part) => part.stays)) {
      if (!stay.nights) continue;
      const stop = journey.route?.find(
        (s) => stay.place === s.name || stay.place.startsWith(`${s.name} `),
      )?.name;
      const country = within ? journey.country : stop ? STOP_COUNTRY[stop] : undefined;
      const key = stop ?? stay.place;
      if (country !== place.country || seen.has(key)) continue;
      const photo = fresh(photoOf(stay.media), stop ? placePhotos[stop] : undefined);
      if (!photo) continue;
      seen.add(key);
      stays.push({
        name: stay.place,
        nights: `${stay.nights} ${stay.nights === 1 ? 'night' : 'nights'}`,
        journey: shortName(journey.title),
        tagline: stay.tagline,
        photo,
      });
    }
  }

  const journeys = place.journeys.map((journey) => ({
    slug: journey.slug,
    title: journey.title,
    region: journey.region,
    days: journey.days,
    departureWindow: journey.departureWindow,
    price: journey.priceFrom ? `From ${journey.priceFrom}` : RATES_TBA,
    tag: journeyBookingTag(journey.status, journeyAvailabilityOf(journey)),
    photo: fresh(
      photoOf(journey.cardMedia),
      photoOf(journey.listMedia),
      photoOf(journey.promoMedia),
    ),
  }));

  return {
    slug: place.slug,
    country: place.country,
    tagline: TAGLINE[place.slug],
    scene,
    stays,
    journeys,
  };
}
