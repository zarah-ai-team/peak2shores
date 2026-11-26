'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Arrow } from '@/components/ui/Button';
import { useSwipe } from '@/components/ui/useDrag';
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

/* A touch screen, where a finger swipes a card's photographs; with a mouse
   the dots alone change them, as before. Read on the client only: the server
   renders the card without the swipe. */
const TOUCH = '(pointer: coarse)';
const onTouchChange = (change: () => void) => {
  const query = window.matchMedia(TOUCH);
  query.addEventListener('change', change);
  return () => query.removeEventListener('change', change);
};
const isTouch = () => window.matchMedia(TOUCH).matches;
const onServer = () => false;

/** The photographs' sizes: the grid's columns (three from 1101px, two from 761px, one below). */
const SIZES = '(min-width: 1101px) 33vw, (min-width: 761px) 50vw';

/** The smallest a card's photograph is made to fit the screen, in rem (collection-card.css). */
const PHOTO_MIN = 9;

/**
 * Each card fits within one screen (the owner's decision of 25 November
 * 2026), the room its page gives it (`--pc-room`, a registered length:
 * collection-card.css). The words are measured, and the photograph gives way
 * to them. The cards of one row share a height, so the tallest words of the
 * list (a card's height less its photograph's) are set on the list itself as
 * `--pc-words`, and every photograph of the list keeps the same height, each
 * name starting in line with the next. Where even the smallest photograph
 * would leave a card taller than the room (a small phone), or a card set out
 * side by side is taller than the room (a small phone held sideways), the
 * list is marked `data-tight` and a line of words gives way.
 */
function fitWords(list: HTMLElement) {
  // Not on show (the Map view): nothing to fit, and nothing is undone, so the
  // cards keep their fit for when they come back.
  if (!list.clientWidth) return;
  const room = parseFloat(window.getComputedStyle(list).getPropertyValue('--pc-room'));
  if (!(room > 0)) return;
  // Already fitted to this width, this room and these type faces: the
  // observers' round that follows the fit's own change of size (and each
  // card's observer in the same frame) changes nothing, and nothing is undone
  // to measure again, so a page the browser has put back keeps its place.
  const fit = fitKey(list, room);
  if (list.dataset.fit === fit) return;
  const cards = [...list.querySelectorAll<HTMLElement>('.pc')];
  // Measured with every line in, and the photographs held to the room alone.
  list.removeAttribute('data-tight');
  list.style.setProperty('--pc-words', '0px');
  const measure = () => {
    let words = 0;
    let tallest = 0;
    let side = false;
    for (const card of cards) {
      const photo = card.querySelector<HTMLElement>('.pcm');
      if (!photo || !card.offsetHeight) continue;
      tallest = Math.max(tallest, card.offsetHeight);
      // Side by side, the photograph is as tall as the card.
      if (photo.offsetHeight < card.offsetHeight)
        words = Math.max(words, card.offsetHeight - photo.offsetHeight);
      else side = true;
    }
    return { words, tallest, side };
  };
  let m = measure();
  // No card on show after all: fitted afresh the next time.
  if (!m.tallest) {
    delete list.dataset.fit;
    return;
  }
  const rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
  if (m.side ? m.tallest > room : room - m.words < PHOTO_MIN * rem) {
    list.setAttribute('data-tight', '');
    m = measure();
  }
  const words = m.side ? null : `${m.words}px`;
  if (words) list.style.setProperty('--pc-words', words);
  list.dataset.fit = fit;
  fits.set(listKey(list), { fit, words, tight: list.hasAttribute('data-tight') });
}

/** The state a list's fit was made for: its width, its room, its type faces. */
const fitKey = (list: HTMLElement, room: number) =>
  `${list.clientWidth}|${room}|${document.fonts?.status ?? ''}`;

/** A list of cards by its kind and its journeys, in order. */
const listKey = (list: HTMLElement) =>
  `${list.className}|${[...list.querySelectorAll('.pc')]
    .map((card) => card.getAttribute('aria-labelledby'))
    .join(',')}`;

/**
 * The last fit of each list, kept for the visit: the same list drawn again
 * (Back to the page) on the same screen takes it as it is drawn, before the
 * browser puts the page back where the reader left it, so the page is the
 * height it was and they land where they were.
 */
const fits = new Map<string, { fit: string; words: string | null; tight: boolean }>();

function refit(list: HTMLElement) {
  if (list.dataset.fit || !list.clientWidth) return;
  const room = parseFloat(window.getComputedStyle(list).getPropertyValue('--pc-room'));
  if (!(room > 0)) return;
  const kept = fits.get(listKey(list));
  if (!kept || kept.fit !== fitKey(list, room)) return;
  list.toggleAttribute('data-tight', kept.tight);
  if (kept.words) list.style.setProperty('--pc-words', kept.words);
  list.dataset.fit = kept.fit;
}

/** A layout effect in the browser, nothing on the server. */
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
 *
 * A photograph after the first loads once a reader reaches for its dot (a
 * press or the keyboard's focus) or swipes to it. The one asked for shows
 * once it has arrived, and the one before it stays until then, so the frame
 * is never left empty on a slow connection. Every photograph carries its
 * words (Ishika's notes of 24 November 2026: 12 of 15 were empty); the ones
 * not on show are hidden from a screen reader, which hears the one shown.
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
  /** The photograph shown. */
  const [shot, setShot] = useState(0);
  /** The photograph asked for (the dots show it at once); shown once loaded. */
  const [want, setWant] = useState(0);
  const wanted = useRef(0);
  const loaded = useRef(new Set<number>());
  /** The photographs that may load now, the first aside (it loads as the card comes near). */
  const [warm, setWarm] = useState<ReadonlySet<number>>(() => new Set());
  const heat = (...ks: number[]) =>
    setWarm((w) => (ks.every((k) => w.has(k)) ? w : new Set([...w, ...ks])));
  const touch = useSyncExternalStore(onTouchChange, isTouch, onServer);
  const self = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const noFrame = useRef<HTMLDivElement>(null);
  const href = c.soon ? '/plan#contact' : `/journeys/${c.slug}`;
  const imgs = compact ? c.imgs.slice(0, 1) : c.imgs;
  // One label on every card, The Collection's and More to discover's alike:
  // "View journey", the words of Ishika's notes (item 26).
  const cta = c.soon ? 'Register your interest' : 'View journey';
  // The Collection shows two cards to a row on a phone held sideways
  // (collection.css). The compact row is laid out by More to discover's own
  // stylesheet (more-to-discover.css): below 761px one card and the edge of
  // the next, but two and the edge of a third on a phone held sideways, so
  // there half the screen's width bounds its photographs.
  const sizes = compact
    ? `${SIZES}, (orientation: landscape) and (max-height: 500px) 50vw, 100vw`
    : `${SIZES}, (min-width: 540px) and (orientation: landscape) 50vw, 100vw`;

  const pick = (i: number) => {
    wanted.current = i;
    setWant(i);
    if (loaded.current.has(i)) setShot(i);
    else heat(i);
  };
  const arrived = (i: number) => {
    loaded.current.add(i);
    if (wanted.current === i) setShot(i);
  };
  /* A sideways swipe across the photograph on a touch screen, where the card
     has more than one: leftward for the next, rightward for the one before. */
  const swipes = touch && imgs.length > 1;
  useSwipe(swipes ? frame : noFrame, (dir) =>
    pick((wanted.current + dir + imgs.length) % imgs.length),
  );

  // A list drawn again (Back to the page) takes the fit it had at once, as it
  // is drawn (refit, above).
  useBrowserLayoutEffect(() => {
    const list = self.current?.closest('ul');
    if (list) refit(list);
  }, []);

  // The card fits within one screen: its list is measured again whenever a
  // card of it changes size (a new width rewraps the words, a turned phone
  // has a new height), on the next frame, so the fit's own change of size is
  // seen as a new size rather than within the observer's round.
  useEffect(() => {
    const card = self.current;
    const list = card?.closest('ul');
    if (!card || !list) return;
    let frame = 0;
    const watch = new ResizeObserver(() => {
      if (!frame)
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          fitWords(list);
        });
    });
    watch.observe(card);
    return () => {
      watch.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <article
      ref={self}
      className={`pc${c.soon ? ' soon' : ''}${compact ? ' compact' : ''}`}
      style={{ ['--tint' as string]: c.tint }}
      aria-labelledby={`pc-${c.slug}`}
    >
      <div
        className="pcm"
        ref={swipes ? frame : undefined}
        // A photograph that cannot load is shown as it is, rather than keep
        // the reader waiting on the last one. (React passes an image's error
        // up to here; given to next/image itself, an onError that changes on
        // every render would load every photograph again.)
        onError={(e) => {
          const i = [...e.currentTarget.children].indexOf(e.target as Element);
          if (i >= 0 && i < imgs.length) arrived(i);
        }}
      >
        {imgs.map((m, i) => (
          <Image
            key={m.src}
            className={i === shot ? 'on' : undefined}
            src={m.src}
            // Every photograph is described. One not on show is see-through
            // (collection-card.css), so a photograph still loading draws no
            // words over the frame, and a screen reader hears the one shown.
            alt={m.alt}
            aria-hidden={i === shot ? undefined : true}
            fill
            // Where the crop centres, for a photograph whose subject is not
            // in its middle (journeyCards.ts).
            style={m.pos ? { objectPosition: m.pos } : undefined}
            sizes={sizes}
            priority={priority && i === 0}
            loading={i > 0 && warm.has(i) ? 'eager' : undefined}
            onLoad={() => arrived(i)}
          />
        ))}
        <div className="pcg" aria-hidden />
      </div>
      {!compact && (
        <div className="pctop">
          <span>{c.region}</span>
          {/* The dot drawn by the status, as on the journey pages
              (AvailabilityTag): ringed once guaranteed, muted once sold out. */}
          <span
            className={`st${c.soon ? ' soon' : ''}`}
            data-status={c.soon ? undefined : c.availability.status}
          >
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
                className={i === want ? 'on' : undefined}
                aria-label={`Photograph ${i + 1} of ${imgs.length}`}
                aria-pressed={i === want}
                onPointerDown={() => heat(i)}
                onFocus={() => heat(i)}
                onClick={() => pick(i)}
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
        {/* The foot: the price over the button, or beside it where the card
            is set out side by side (a phone held sideways). */}
        <div className="pfoot">
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
      </div>
    </article>
  );
}
