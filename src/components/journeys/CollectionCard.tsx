'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Arrow } from '@/components/ui/Button';
import type { CollectionCardData } from '@/lib/journeyCards';
import './collection-card.css';

/** A no-break space, by its code: typed as a character it cannot be seen in the source. */
const NBSP = String.fromCharCode(0xa0);

/**
 * The places in order, "Lucerne · Grindelwald · …". A name of two words
 * ("Lake Garda") is never split, and each dot stays with the place before it,
 * so the line only breaks after a dot.
 */
const itinerary = (stops: string[]) => stops.map((s) => s.replaceAll(' ', NBSP)).join(`${NBSP}· `);

/**
 * A journey as a product card: its photographs to browse at the top, the card
 * settling into the colour of the place, the region and booking state on it,
 * then the name, the tagline, the line, the itinerary (the places in order,
 * as on A&K's cards), the facts as pills, the price line and a white button,
 * "View journey".
 * The pills, after the chat notes of 9 November 2026: the days and, once Marc
 * sets it, the departure. No "Small group" pill. The price line comes from
 * fromPriceLabel(): "From $12,400 per person", or "Rates to be announced"
 * until Marc sets the rate.
 *
 * `compact` is the card of the row under a journey's page (More to discover):
 * the lead photograph, the name, the itinerary, the days, the price line and
 * "View journey", with no region or status label, tagline or line.
 */
export function CollectionCard({
  card: c,
  priority = false,
  compact = false,
}: {
  card: CollectionCardData;
  /** Load the lead photograph first: the cards seen as the page opens. */
  priority?: boolean;
  compact?: boolean;
}) {
  const [shot, setShot] = useState(0);
  const href = c.soon ? '/plan#contact' : `/journeys/${c.slug}`;
  const imgs = compact ? c.imgs.slice(0, 1) : c.imgs;
  // One label on every card, The Collection's and More to discover's alike:
  // "View journey", the words of Ishika's notes (item 26).
  const cta = c.soon ? 'Register your interest' : 'View journey';

  return (
    <article
      className={`pc${c.soon ? ' soon' : ''}${compact ? ' compact' : ''}`}
      style={{ ['--tint' as string]: c.tint }}
      aria-labelledby={`pc-${c.slug}`}
    >
      <div className="pcm">
        {imgs.map((m, i) => (
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
        <div className="pcg" aria-hidden />
      </div>
      {!compact && (
        <div className="pctop">
          <span>{c.region}</span>
          <span className={`st${c.soon ? ' soon' : ''}`}>
            <i aria-hidden />
            {c.status}
          </span>
        </div>
      )}
      <div className="pcb">
        {imgs.length > 1 && (
          <div className="dots" role="group" aria-label="Photographs">
            {imgs.map((m, i) => (
              <button
                key={m.src}
                type="button"
                className={i === shot ? 'on' : undefined}
                aria-label={`Photograph ${i + 1} of ${imgs.length}`}
                aria-pressed={i === shot}
                onClick={() => setShot(i)}
              >
                <i />
              </button>
            ))}
          </div>
        )}
        <h3 id={`pc-${c.slug}`}>{c.title}</h3>
        {!compact && <p className="tl">{c.tagline}</p>}
        {!compact && c.blurb && <p className="d">{c.blurb}</p>}
        {c.stops.length > 1 && (
          <p className="pit">
            <small>Itinerary</small> {itinerary(c.stops)}
          </p>
        )}
        <div className="ptags">
          {c.facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
        <p className="pprice">{c.price}</p>
        <Link className="pbtn" href={href}>
          {cta}
          <span className="sr-only">
            {c.soon ? ' in ' : ': '}
            {c.title}
          </span>{' '}
          <Arrow />
        </Link>
      </div>
    </article>
  );
}
