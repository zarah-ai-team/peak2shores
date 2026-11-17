import Image from 'next/image';
import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/destinations/destinations.css';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { PlaceStory } from '@/components/destinations/PlaceStory';
import {
  SCENES,
  type StoryPhoto,
  type StoryPlace,
  type StoryScene,
} from '@/components/destinations/story';
import { placePhotos } from '@/components/journeys/placePhotos';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import {
  getDestinations,
  getJourneys,
  pageMetadata,
  type Destination,
  type Journey,
} from '@/lib/content';
import { getMedia, type MediaKey } from '@/lib/media';
import { RATES_TBA } from '@/lib/journeys';

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
 * Destinations, in the homepage's language: an opening on paper with the
 * countries as a way in, the statement set large on paper, then the countries
 * as one story told by scrolling (PlaceStory: each country's photograph with
 * its name standing in it, then its journeys and places), and a closing
 * invitation over a photograph. Every fact is derived from the catalog —
 * nothing here is invented.
 */
export default async function DestinationsPage() {
  const [places, journeys] = await Promise.all([getDestinations(), getJourneys()]);
  const story = places.map((place) => storyPlace(place, journeys));
  const hero = getMedia('destinations-hero');
  const closing = getMedia('dest-private');
  // A journey that crosses a border (Como & the Engadin) is counted once.
  const journeyCount = new Set(places.flatMap((p) => p.journeys.map((j) => j.slug))).size;
  const countries = numberWord(places.length);

  return (
    <div className="hc dz">
      {/* 01 — The opening, as on the Journeys page: the name and the line on
          paper (only the homepage opens on a full-bleed photograph), then the
          photograph in a frame with the countries along its foot. */}
      <section aria-labelledby="dz-title" className="dz-open">
        <div className="dz-open-head">
          <div>
            <p className="dz-open-lab">Destinations</p>
            <h1 id="dz-title">A few places, known properly.</h1>
            <p className="dz-open-line">Where mountains meet water.</p>
          </div>
          <div className="dz-open-say">
            <p>The places Peaks2Shores returns to, and the journeys that go there.</p>
            <div className="ctas">
              <a className="btn btn-ink" href="#where">
                Explore destinations
              </a>
              <Link className="dz-open-link" href="/journeys">
                View all journeys <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="dz-frame">
          {hero.src && (
            <Image
              src={hero.src}
              alt={hero.alt ?? ''}
              fill
              priority
              sizes="(min-width: 1600px) 1600px, 100vw"
              className="fill"
            />
          )}
          <span className="dz-frame-shade" aria-hidden />
          <nav className="dz-index" aria-label="Destinations on this page">
            {places.map((place, i) => (
              <a key={place.slug} href={`#${place.slug}`}>
                <span>{pad(i + 1)}</span>
                {place.country}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* 02 — The statement, and what it adds up to. */}
      <section className="hc-intro dz-intro" aria-labelledby="dz-map">
        <div className="lab" id="dz-map">
          The map
        </div>
        <p>
          We would rather return to <em>{countries} countries</em> than pass through forty.
        </p>
        <RevealGroup as="ul" className="dz-facts" stagger={0.08}>
          <RevealItem as="li" distance={12}>
            <b>{pad(places.length)}</b>
            <span>Countries we return to</span>
          </RevealItem>
          <RevealItem as="li" distance={12}>
            <b>{pad(journeyCount)}</b>
            <span>Small group journeys</span>
          </RevealItem>
          <RevealItem as="li" distance={12}>
            <b>Small</b>
            <span>Groups, on every journey</span>
          </RevealItem>
        </RevealGroup>
      </section>

      {/* 03 — Where we go: the heading, then the countries. */}
      <section className="dz-where" id="where" aria-labelledby="dz-where-title">
        <div className="dz-head">
          <div>
            <div className="lab">Where we go</div>
            <Reveal variant="mask">
              <h2 id="dz-where-title">
                {capitalize(countries)} countries, and the journeys that know them.
              </h2>
            </Reveal>
          </div>
          <p>
            Every destination below is somewhere we have been repeatedly, in different seasons, with
            the same people waiting at the other end. That is what makes an itinerary worth writing.
          </p>
        </div>
      </section>

      {/* The countries as one story: each photograph slides up with the last,
          the country's name rising from behind its land; then its journeys
          and the places they stay. */}
      <PlaceStory places={story} />

      {/* 04 — The closing invitation, over a photograph. */}
      <section className="hc-circle dz-close" aria-labelledby="dz-close-title" data-fab-away>
        <div className="bg" aria-hidden>
          {closing.src && (
            <Image src={closing.src} alt={closing.alt ?? ''} fill sizes="100vw" className="fill" />
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
            <Link className="btn btn-light" href="/plan#private">
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

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const numberWord = (n: number) => WORDS[n] ?? String(n);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n: number) => String(n).padStart(2, '0');

/** A line under each country's name, in the journeys' own voice. */
const TAGLINE: Record<string, string> = {
  italy: 'Lakes, kitchens and the lagoon, unhurried.',
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
    tag: journeyTagStatus(journey),
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
