'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Arrow } from '@/components/ui/Button';
import type { JourneySummary } from '@/lib/content';
import { JourneyGlobe } from './JourneyGlobe';
import './collection.css';

/** One journey as a card on the Journeys page — plain data, built on the server. */
export type CollectionCard = {
  slug: string;
  title: string;
  region: string;
  tagline: string;
  blurb: string;
  /** The destinations it counts under, for the tabs and the filter. */
  dest: string[];
  inspire: string[];
  days?: number;
  /** "Max. 18 guests" and, once set, the departure and the rate. */
  facts: string[];
  priceFrom?: string;
  status: string;
  soon?: boolean;
  tint: string;
  imgs: { src: string; alt: string }[];
};

type Sort = 'featured' | 'shortest' | 'longest';
type Show = 'all' | 'now' | 'soon';

const sorts: [Sort, string][] = [
  ['featured', 'Featured'],
  ['shortest', 'Shortest'],
  ['longest', 'Longest'],
];
const shows: [Show, string][] = [
  ['all', 'All'],
  ['now', 'Now booking'],
  ['soon', 'Coming soon'],
];

/**
 * The Journeys page, after the design sample "Journeys listing as products":
 *
 * 1. A full-bleed film with the page's name, its line and two ways on, and a
 *    row of destination tabs along its foot — choosing one filters the
 *    collection below and brings it into view.
 * 2. The collection, on paper: a heading that counts what is shown, a sort,
 *    a light filter panel of chips (destination, availability, inspiration),
 *    then the journeys as tall product cards — photographs to browse, the
 *    card settling into the colour of the place, the booking state, the
 *    facts as pills and a white button in. The flipbook's coming journeys sit
 *    among them, and a private-travel card closes the grid.
 * 3. Where we go: the globe, its country the same choice as the tabs.
 */
export function JourneyCollection({
  cards,
  journeys,
  film,
}: {
  cards: CollectionCard[];
  /** For the globe. */
  journeys: JourneySummary[];
  film: { src: string; poster: string; label: string };
}) {
  const [dest, setDest] = useState('All');
  const [show, setShow] = useState<Show>('all');
  const [insp, setInsp] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('featured');
  const [hover, setHover] = useState<string | null>(null);
  const colRef = useRef<HTMLElement>(null);

  const dests = useMemo(() => {
    const all = Array.from(new Set(cards.flatMap((c) => c.dest)));
    return ['All', ...all];
  }, [cards]);
  const inspirations = useMemo(
    () => Array.from(new Set(cards.flatMap((c) => c.inspire))).sort(),
    [cards],
  );
  const countDest = (d: string) =>
    d === 'All' ? cards.length : cards.filter((c) => c.dest.includes(d)).length;

  const shown = useMemo(() => {
    const list = cards.filter(
      (c) =>
        (dest === 'All' || c.dest.includes(dest)) &&
        (show === 'all' || (show === 'soon') === Boolean(c.soon)) &&
        insp.every((i) => c.inspire.includes(i)),
    );
    if (sort === 'featured') return list;
    // Journeys without a length (the coming ones) sort last either way.
    const len = (c: CollectionCard) => c.days ?? (sort === 'shortest' ? 999 : -1);
    return [...list].sort((a, b) => (sort === 'shortest' ? len(a) - len(b) : len(b) - len(a)));
  }, [cards, dest, show, insp, sort]);

  const anyOn = dest !== 'All' || show !== 'all' || insp.length > 0;
  const clearAll = () => {
    setDest('All');
    setShow('all');
    setInsp([]);
  };
  const pickDest = (d: string, scroll = false) => {
    setDest(d);
    if (scroll) colRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const bookable = cards.filter((c) => !c.soon).length;
  const title =
    dest === 'All'
      ? `${cards.length} journeys, ${bookable} now booking.`
      : `${dest}, ${countDest(dest)} ${countDest(dest) === 1 ? 'journey' : 'journeys'}.`;
  const tabIndex = Math.max(0, dests.indexOf(dest));

  // The globe knows only countries with a journey page.
  const globeCountries = new Set(journeys.flatMap((j) => j.country.split(' & ')));

  return (
    <div className="jx">
      {/* 1 — The film, the name, and the destinations along its foot. */}
      <section className="hero" data-hero aria-labelledby="jx-h1">
        <video
          className="fill"
          src={film.src}
          poster={film.poster}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="hshade" aria-hidden />
        <div className="hc">
          <p className="lab">Small Luxury Group Journeys</p>
          <h1 id="jx-h1">
            A short list, <em>on purpose.</em>
          </h1>
          <p className="lede">
            Intimate journeys for never more than 18 guests — exceptional places, meaningful
            experiences and the joy of discovering the world together, each one somewhere Marc knows
            well.
          </p>
          <div className="hctas">
            <a className="btn btn-light" href="#collection">
              Browse the journeys <Arrow />
            </a>
            <Link className="btn btn-line" href="/plan#private">
              Design a private journey
            </Link>
          </div>
        </div>
        <p className="hclip" aria-hidden>
          <i />
          {film.label}
        </p>
        <div
          className="dtabs"
          role="group"
          aria-label="Choose a destination"
          style={{ ['--n' as string]: dests.length }}
        >
          <span
            className="dhi"
            aria-hidden
            style={{ transform: `translateX(${tabIndex * 100}%)` }}
          />
          {dests.map((d) => (
            <button
              key={d}
              type="button"
              className={d === dest ? 'on' : undefined}
              aria-pressed={d === dest}
              onClick={() => pickDest(d, true)}
            >
              {d}
              <b>{countDest(d)}</b>
            </button>
          ))}
        </div>
      </section>

      {/* 2 — The collection. */}
      <section className="col" id="collection" ref={colRef} aria-labelledby="jx-col">
        <div className="colh">
          <div>
            <p className="lab">The collection</p>
            <h2 id="jx-col">{title}</h2>
          </div>
          <div className="sort">
            Sort
            <div className="seg" role="group" aria-label="Sort journeys">
              {sorts.map(([k, t]) => (
                <button
                  key={k}
                  type="button"
                  className={sort === k ? 'on' : undefined}
                  aria-pressed={sort === k}
                  onClick={() => setSort(k)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fpanel" role="group" aria-label="Filter journeys">
          <p className="fl">Destination</p>
          <div className="chips">
            {dests.map((d) => (
              <button
                key={d}
                type="button"
                className={`chip${d === dest ? ' on' : ''}`}
                aria-pressed={d === dest}
                onClick={() => pickDest(d)}
              >
                {d}
                <b>{countDest(d)}</b>
              </button>
            ))}
          </div>
          <p className="fl">Availability</p>
          <div className="chips">
            {shows.map(([k, t]) => (
              <button
                key={k}
                type="button"
                className={`chip${show === k ? ' on' : ''}`}
                aria-pressed={show === k}
                onClick={() => setShow(k)}
              >
                {k !== 'all' && <i className={`dot ${k}`} aria-hidden />}
                {t}
              </button>
            ))}
          </div>
          {inspirations.length > 0 && (
            <>
              <p className="fl">What inspires you</p>
              <div className="chips">
                {inspirations.map((i) => {
                  const on = insp.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`chip${on ? ' on' : ''}`}
                      aria-pressed={on}
                      onClick={() =>
                        setInsp((cur) => (on ? cur.filter((x) => x !== i) : [...cur, i]))
                      }
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="fsum">
          <span role="status" aria-live="polite">
            Showing {shown.length} of {cards.length} journeys
          </span>
          {anyOn && (
            <button type="button" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        <ul className="grid">
          {shown.map((c, i) => (
            <li
              key={c.slug}
              onPointerEnter={() => setHover(c.soon ? null : c.slug)}
              onPointerLeave={() => setHover(null)}
            >
              <ProductCard card={c} priority={i < 3} />
            </li>
          ))}
          {shown.length === 0 && (
            <li className="empty">
              No journeys match those filters.{' '}
              <button type="button" onClick={clearAll}>
                Clear them
              </button>
            </li>
          )}
          <li className="priv">
            <Image
              className="fill"
              src="/images/home/way-private-venice.jpg"
              alt=""
              fill
              sizes="(min-width: 900px) 33vw, 100vw"
            />
            <div className="in">
              <p className="lab">Private travel</p>
              <h3>Or a journey with only your names on the list.</h3>
              <p>
                Families, friends, a milestone. The same hotels, the same people on the ground, on
                your dates. Start with a conversation, not a form.
              </p>
              <Link className="pbtn" href="/plan#private">
                Plan your journey <Arrow />
              </Link>
            </div>
          </li>
        </ul>
      </section>

      {/* 3 — Where we go: the globe, its country the same choice as the tabs. */}
      <JourneyGlobe
        journeys={journeys}
        selected={globeCountries.has(dest) ? dest : undefined}
        onSelect={(country) => pickDest(dest === country ? 'All' : country)}
        hover={hover}
        onHover={setHover}
      />
    </div>
  );
}

/**
 * A journey as a product card: its photographs to browse at the top, the card
 * settling into the colour of the place, the region and booking state on it,
 * then the name with the rate, the tagline, the line, the facts as pills, and
 * a white button in. A coming journey says so, and asks for interest instead.
 */
function ProductCard({ card: c, priority }: { card: CollectionCard; priority: boolean }) {
  const [shot, setShot] = useState(0);
  const href = c.soon ? '/plan#contact' : `/journeys/${c.slug}`;

  return (
    <article
      className={`pc${c.soon ? ' soon' : ''}`}
      style={{ ['--tint' as string]: c.tint }}
      aria-labelledby={`pc-${c.slug}`}
    >
      <div className="pcm">
        {c.imgs.map((m, i) => (
          <Image
            key={m.src}
            className={i === shot ? 'on' : undefined}
            src={m.src}
            alt={i === shot ? m.alt : ''}
            fill
            sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
            priority={priority && i === 0}
          />
        ))}
      </div>
      <div className="pcg" aria-hidden />
      <div className="pctop">
        <span>{c.region}</span>
        <span className={`st${c.soon ? ' soon' : ''}`}>
          <i aria-hidden />
          {c.status}
        </span>
      </div>
      <div className="pcb">
        {c.imgs.length > 1 && (
          <div className="dots" role="group" aria-label="Photographs">
            {c.imgs.map((m, i) => (
              <button
                key={m.src}
                type="button"
                className={i === shot ? 'on' : undefined}
                aria-label={`Photograph ${i + 1} of ${c.imgs.length}`}
                aria-pressed={i === shot}
                onClick={() => setShot(i)}
              >
                <i />
              </button>
            ))}
          </div>
        )}
        <div className="pct">
          <h3 id={`pc-${c.slug}`}>{c.title}</h3>
          {c.priceFrom && (
            <span className="price">
              <small>From</small>
              {c.priceFrom}
            </span>
          )}
        </div>
        <p className="tl">{c.tagline}</p>
        {c.blurb && <p className="d">{c.blurb}</p>}
        <div className="ptags">
          {c.facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
        <Link
          className="pbtn"
          href={href}
          aria-label={`${c.soon ? 'Register your interest in' : 'View the journey'} ${c.title}`}
        >
          {c.soon ? 'Register your interest' : 'View the journey & reserve'} <Arrow />
        </Link>
      </div>
    </article>
  );
}
