'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Arrow } from '@/components/ui/Button';
import './collection.css';

/** One journey as a card on the Journeys page — plain data, built on the server. */
export type CollectionCard = {
  slug: string;
  title: string;
  region: string;
  tagline: string;
  blurb: string;
  /** The destinations it counts under, for the filter. */
  dest: string[];
  inspire: string[];
  days?: number;
  /** The months it departs in, earliest first; empty until the dates are set. */
  when: { ym: string; label: string }[];
  /** How the journey travels: "Multi-country", "Includes boat travel"… */
  style: string[];
  /** The places on the route, in order, each once: the card’s Itinerary line. */
  stops: string[];
  /** The length and, once Marc sets them, the rate and the departure (a date or a year). */
  facts: string[];
  status: string;
  soon?: boolean;
  tint: string;
  imgs: { src: string; alt: string }[];
};

type Show = 'all' | 'now' | 'soon';

const shows: [Show, string][] = [
  ['all', 'All'],
  ['now', 'Now booking'],
  ['soon', 'Coming soon'],
];
/** Lengths, by days. Only the ones some journey falls in are offered. */
const lengths: [string, (d: number) => boolean][] = [
  ['Up to 9 days', (d) => d <= 9],
  ['10 to 12 days', (d) => d >= 10 && d <= 12],
  ['13 days or more', (d) => d >= 13],
];

type Filters = {
  dest: string;
  show: Show;
  insp: string[];
  len: string;
  /** 'All', a month ('2027-06'), or 'tba' for the journeys without dates. */
  when: string;
  style: string[];
};
const none: Filters = { dest: 'All', show: 'all', insp: [], len: 'All', when: 'All', style: [] };

/** What a several-choice dropdown shows as chosen. */
const chosen = (v: string[]) =>
  v.length === 0 ? 'All' : v.length === 1 ? v[0] : `${v.length} chosen`;
const toggle = (v: string[], x: string) => (v.includes(x) ? v.filter((y) => y !== x) : [...v, x]);

/**
 * The Collection: the label and heading, then one white panel of filters as
 * dropdowns in a row (Destination · Length · Departure · Travel style · What
 * inspires you · Availability), each option counting its journeys and greyed
 * when it has none, a Clear link while any filter is on, and the count at the
 * row's end. Every option is read from the journeys themselves, and a filter
 * with nothing to choose is left out. Then the journeys as tall product
 * cards, in the order they arrive (Marc's own).
 *
 * After the chat notes of 9 November 2026: no Sort switch (Shortest and
 * Longest only repeated the Length filter), and Departure is the filter by
 * month. It lists the months the journeys really leave in, earliest first,
 * then `tba` ("Dates to be announced") for the journeys without dates, and it
 * is not shown at all until some journey has a month.
 */
export function JourneyCollection({ cards, tba }: { cards: CollectionCard[]; tba: string }) {
  const [f, setF] = useState<Filters>(none);
  const set = (patch: Partial<Filters>) => setF((cur) => ({ ...cur, ...patch }));

  const opts = useMemo(() => {
    const uniq = (xs: string[]) => Array.from(new Set(xs));
    // Each departure month once, as [ym, label].
    const months = new Map(cards.flatMap((c) => c.when.map((m) => [m.ym, m.label] as const)));
    return {
      dests: uniq(cards.flatMap((c) => c.dest)),
      lens: lengths.filter(([, fits]) => cards.some((c) => c.days && fits(c.days))).map(([l]) => l),
      whens: [...months].sort(([a], [b]) => a.localeCompare(b)),
      undated: cards.some((c) => c.when.length === 0),
      styles: uniq(cards.flatMap((c) => c.style)),
      insps: uniq(cards.flatMap((c) => c.inspire)).sort(),
    };
  }, [cards]);

  /* Whether a card passes the filters, with some of them swapped (so each
     menu counts what choosing an option would show). */
  const pass = (c: CollectionCard, over: Partial<Filters> = {}) => {
    const x = { ...f, ...over };
    const fits = lengths.find(([l]) => l === x.len)?.[1];
    return (
      (x.dest === 'All' || c.dest.includes(x.dest)) &&
      (x.show === 'all' || (x.show === 'soon') === Boolean(c.soon)) &&
      (x.len === 'All' || (!!c.days && !!fits?.(c.days))) &&
      (x.when === 'All' ||
        (x.when === 'tba' ? c.when.length === 0 : c.when.some((m) => m.ym === x.when))) &&
      x.style.every((y) => c.style.includes(y)) &&
      x.insp.every((y) => c.inspire.includes(y))
    );
  };
  const count = (over: Partial<Filters>) => cards.filter((c) => pass(c, over)).length;

  // In the order the cards arrive: Marc's own.
  const shown = cards.filter((c) => pass(c));

  const anyOn =
    f.dest !== 'All' ||
    f.show !== 'all' ||
    f.len !== 'All' ||
    f.when !== 'All' ||
    f.insp.length > 0 ||
    f.style.length > 0;
  const clearAll = () => setF(none);

  /** A single-choice menu: "All", then the options. */
  const one = (key: 'dest' | 'len', list: string[]) =>
    ['All', ...list].map((o) => ({
      key: o,
      label: o,
      count: count({ [key]: o }),
      on: f[key] === o,
    }));
  /** The Departure menu: "All", each month, then the journeys without dates. */
  const departures: (readonly [string, string])[] = [
    ['All', 'All'],
    ...opts.whens,
    ...(opts.undated ? [['tba', tba] as const] : []),
  ];
  /** A several-choice menu: each option counted as if added to the others. */
  const many = (key: 'insp' | 'style', list: string[]) =>
    list.map((o) => ({
      key: o,
      label: o,
      count: count({ [key]: f[key].includes(o) ? f[key] : [...f[key], o] }),
      on: f[key].includes(o),
    }));

  return (
    <div className="jx">
      <section className="col" id="collection" aria-labelledby="jx-col">
        <div className="colh">
          <p className="lab">Our journeys</p>
          <h2 id="jx-col">The Collection</h2>
        </div>

        <div className="fbar" role="group" aria-label="Filter journeys">
          <Menu
            label="Destination"
            value={f.dest}
            options={one('dest', opts.dests)}
            onPick={(dest) => set({ dest })}
          />
          {opts.lens.length > 0 && (
            <Menu
              label="Length"
              value={f.len}
              options={one('len', opts.lens)}
              onPick={(len) => set({ len })}
            />
          )}
          {opts.whens.length > 0 && (
            <Menu
              label="Departure"
              value={departures.find(([key]) => key === f.when)?.[1] ?? 'All'}
              options={departures.map(([key, label]) => ({
                key,
                label,
                count: count({ when: key }),
                on: key === f.when,
              }))}
              onPick={(when) => set({ when })}
            />
          )}
          {opts.styles.length > 0 && (
            <Menu
              label="Travel style"
              multi
              value={chosen(f.style)}
              options={many('style', opts.styles)}
              onPick={(x) => set({ style: toggle(f.style, x) })}
            />
          )}
          {opts.insps.length > 0 && (
            <Menu
              label="What inspires you"
              multi
              value={chosen(f.insp)}
              options={many('insp', opts.insps)}
              onPick={(x) => set({ insp: toggle(f.insp, x) })}
            />
          )}
          <Menu
            label="Availability"
            value={shows.find(([k]) => k === f.show)?.[1] ?? 'All'}
            options={shows.map(([k, t]) => ({
              key: k,
              label: t,
              count: count({ show: k }),
              on: k === f.show,
            }))}
            onPick={(k) => set({ show: k as Show })}
          />
          {anyOn && (
            <button type="button" className="fclear" onClick={clearAll}>
              Clear
            </button>
          )}
          <div className="fend">
            <span role="status" aria-live="polite">
              Showing {shown.length} of {cards.length} journeys
            </span>
          </div>
        </div>

        <ul className="grid">
          {shown.map((c, i) => (
            <li key={c.slug}>
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
        </ul>
      </section>
    </div>
  );
}

type Option = { key: string; label: string; count: number; on: boolean };

/** A filter as a dropdown: its name, what is chosen, and the options with their counts. */
function Menu({
  label,
  value,
  options,
  onPick,
  multi = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onPick: (key: string) => void;
  multi?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div className={`fmenu${open ? ' open' : ''}`} ref={box}>
      <button
        type="button"
        className="fbtn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <small>{label}</small>
        <span>{value}</span>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <ul className="flist" id={id} role="list" hidden={!open}>
        {options.map((o) => {
          const empty = o.count === 0 && !o.on;
          return (
            <li key={o.key}>
              <button
                type="button"
                className={o.on ? 'on' : undefined}
                aria-pressed={o.on}
                disabled={empty}
                onClick={() => {
                  onPick(o.key);
                  if (!multi) setOpen(false);
                }}
              >
                {multi && <i className="box" aria-hidden />}
                {o.label}
                <b>{o.count}</b>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
 * as on A&K's cards), the facts as pills and a white button in. The pills,
 * after the chat notes of 9 November 2026: the days, the rate and the
 * departure, the last two only once Marc sets them. No "Small group" pill.
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
        <div className="pcg" aria-hidden />
      </div>
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
        <h3 id={`pc-${c.slug}`}>{c.title}</h3>
        <p className="tl">{c.tagline}</p>
        {c.blurb && <p className="d">{c.blurb}</p>}
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
        <Link
          className="pbtn"
          href={href}
          aria-label={`${c.soon ? 'Register your interest in' : 'View the journey'} ${c.title}`}
        >
          {c.soon ? 'Register your interest' : 'View the journey'} <Arrow />
        </Link>
      </div>
    </article>
  );
}
