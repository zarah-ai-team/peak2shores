import Image from 'next/image';
import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/destinations/destinations.css';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { StatusTag } from '@/components/ui/StatusTag';
import { ExpertButton } from '@/components/home/ExpertButton';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import { getDestinations, pageMetadata, type Destination } from '@/lib/content';
import { getMedia } from '@/lib/media';
import { site } from '@/lib/site';

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
 * Destinations, in the homepage's language: a full-bleed opening with the
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
      {/* 01 — The opening. */}
      <section data-hero aria-labelledby="dz-title" className="hc-hero dz-hero">
        <div className="hv fill on">
          {hero.src && (
            <Image
              src={hero.src}
              alt={hero.alt ?? ''}
              fill
              priority
              sizes="100vw"
              className="fill dz-settle"
            />
          )}
        </div>
        <div className="shade" />
        <div className="copy">
          <div className="lab eb dz-eb">
            <i />
            Where mountains meet water
          </div>
          <h1 id="dz-title">A few places, known properly.</h1>
          <p>The places Peaks2Shores returns to, and the journeys that go there.</p>
          <div className="ctas">
            <a className="btn btn-light" href="#where">
              Explore destinations
            </a>
            <Link className="btn btn-line" href="/journeys">
              View all journeys
            </Link>
          </div>
        </div>
        <nav className="dz-index" aria-label="Destinations on this page">
          {places.map((place, i) => (
            <a key={place.slug} href={`#${place.slug}`}>
              <span>{pad(i + 1)}</span>
              {place.country}
            </a>
          ))}
        </nav>
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
            <b>{site.maxGuests}</b>
            <span>Guests at most, on any of them</span>
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

        {places.map((place, i) => (
          <Country key={place.slug} place={place} index={i} />
        ))}
      </section>

      {/* 04 — The closing invitation, over a photograph. */}
      <section className="hc-circle dz-close" aria-labelledby="dz-close-title" data-fab-away>
        <div className="bg" aria-hidden>
          {closing.src && (
            <Image src={closing.src} alt={closing.alt ?? ''} fill sizes="100vw" className="fill" />
          )}
        </div>
        <div className="in">
          <div className="lab">Private travel</div>
          <h2 id="dz-close-title">Or a journey with only your names on the list.</h2>
          <p>
            Families, friends, a milestone. The same hotels, the same people on the ground, on your
            dates. Start with a conversation, not a form.
          </p>
          <div className="ctarow">
            <Link className="btn btn-light" href="/plan#private">
              Plan a private journey
            </Link>
            <Link className="tlink light" href="/plan#contact">
              Speak to a travel designer →
            </Link>
          </div>
        </div>
      </section>

      <ExpertButton />
    </div>
  );
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const numberWord = (n: number) => WORDS[n] ?? String(n);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One country: its photograph as a tall tile with the name set over it, and
 * beside it the journeys that go there, each a card with its dates, length
 * and price. Rows alternate sides so no two neighbors share a skeleton.
 */
function Country({ place, index }: { place: Destination; index: number }) {
  const photo = getMedia(place.media);
  const titleId = `${place.slug}-title`;
  const count = place.journeys.length;

  return (
    <article
      id={place.slug}
      aria-labelledby={titleId}
      className={`dz-place ${index % 2 ? 'flip' : ''}`}
    >
      <Reveal direction={index % 2 ? 'right' : 'left'} distance={20} className="dz-tile">
        {photo.src && (
          <Image
            src={photo.src}
            alt={photo.alt ?? ''}
            fill
            sizes="(max-width: 900px) 100vw, 58vw"
            className="fill"
          />
        )}
        <span className="ws" aria-hidden />
        <span className="dz-num" aria-hidden>
          {pad(index + 1)}
        </span>
        <span className="dz-tile-cap">
          <span className="lab">{place.regions.join(' · ')}</span>
          <h3 id={titleId}>{place.country}</h3>
        </span>
      </Reveal>

      <div className="dz-body">
        <div className="lab dz-count">
          {count} {count === 1 ? 'journey' : 'journeys'} in {place.country}
        </div>
        <RevealGroup as="ul" className="dz-journeys" stagger={0.08}>
          {place.journeys.map((journey) => {
            const tag = journeyTagStatus(journey);
            return (
              <RevealItem as="li" key={journey.slug} distance={14}>
                <Link href={`/journeys/${journey.slug}`} className="dz-j">
                  <span className="dz-j-main">
                    <span className="dz-j-meta">
                      {journey.days} days
                      {tag !== 'open' && <StatusTag status={tag} />}
                    </span>
                    <span className="dz-j-title">{journey.title}</span>
                    <span className="dz-j-lead">{journey.lead}</span>
                    <span className="dz-j-facts">
                      <span>{journey.departureWindow}</span>
                      <span>
                        From <b>{journey.priceFrom}</b> per person
                      </span>
                    </span>
                  </span>
                  <span className="circ dz-j-go" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </article>
  );
}
