import Image from 'next/image';
import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/destinations/destinations.css';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { PlaceStack } from '@/components/destinations/PlaceStack';
import { StatusTag } from '@/components/ui/StatusTag';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import { getDestinations, pageMetadata, type Destination } from '@/lib/content';
import { getMedia } from '@/lib/media';
import { andList } from '@/lib/site';
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
 * countries as a way in, the statement set large on paper, then each country
 * as a photograph tile with its journeys beside it as cards, and a closing invitation over a photograph. Every fact is
 * derived from the catalog — nothing here is invented.
 */
export default async function DestinationsPage() {
  const places = await getDestinations();
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

      {/* 03 — Where we go: one country to a row. */}
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

      {/* Each country full bleed: its photograph, its name set large, and its
          journeys as cards over the picture. */}
      <PlaceStack>
        {places.map((place, i) => (
          <Country key={place.slug} place={place} index={i} total={places.length} />
        ))}
      </PlaceStack>

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
 * One country, full bleed: its photograph across the screen, the number and
 * regions, the name set large, a line beneath, and the journeys that go there
 * as glass cards over the picture — each with its length, dates and price.
 */
function Country({ place, index, total }: { place: Destination; index: number; total: number }) {
  const photo = getMedia(place.media);
  const titleId = `${place.slug}-title`;
  const tagline = TAGLINE[place.slug];

  return (
    <article id={place.slug} aria-labelledby={titleId} className="dz-place">
      <div className="dz-bg" aria-hidden>
        {photo.src && <Image src={photo.src} alt="" fill sizes="100vw" className="fill" />}
      </div>
      <span className="dz-shade" aria-hidden />

      <div className="dz-in">
        <Reveal distance={24} className="dz-copy">
          <div className="lab dz-no">
            {pad(index + 1)} · {andList.format(place.regions)}
          </div>
          <h3 id={titleId}>{place.country}</h3>
          {tagline && <p className="dz-tl">{tagline}</p>}
        </Reveal>

        <RevealGroup as="ul" className="dz-journeys" stagger={0.08}>
          {place.journeys.map((journey) => {
            const tag = journeyTagStatus(journey);
            return (
              <RevealItem as="li" key={journey.slug} distance={14}>
                <Link href={`/journeys/${journey.slug}`} className="dz-j">
                  <span className="dz-j-main">
                    <span className="dz-j-title">{journey.title}</span>
                    <span className="dz-j-facts">
                      <span>{journey.days} days</span>
                      <span>{journey.departureWindow}</span>
                      <span className="dz-j-price">
                        {journey.priceFrom ? <>From {journey.priceFrom}</> : RATES_TBA}
                      </span>
                      {tag !== 'open' && (
                        <StatusTag status={tag} tone="dark" className="dz-j-tag" />
                      )}
                    </span>
                  </span>
                  <span className="dz-j-go" aria-hidden>
                    View
                    <svg
                      width="18"
                      height="10"
                      viewBox="0 0 18 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M0 5h16M12 1l4 4-4 4" />
                    </svg>
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      <span className="dz-count" aria-hidden>
        <b>{pad(index + 1)}</b> / {pad(total)}
      </span>
    </article>
  );
}
