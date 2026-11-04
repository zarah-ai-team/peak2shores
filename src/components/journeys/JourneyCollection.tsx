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
  /** The length, "Small group" and, once set, the departure. */
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
 * The Collection, after Ishika's notes of 3 November 2026: the label and
 * heading with the sort beside them, then one white panel holding the three
 * filters as dropdowns in a row (Destination · Availability · What inspires
 * you), each option counting its journeys and greyed when it has none, a
 * Clear link while any filter is on, and at the row's end the count and a
 * List / Map switch (Map comes in a later phase). Then the journeys as tall
 * product cards.
 */
export function JourneyCollection({ cards }: { cards: CollectionCard[] }) {
  const [dest, setDest] = useState('All');
  const [show, setShow] = useState<Show>('all');
  const [insp, setInsp] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('featured');

  const dests = useMemo(() => ['All', ...new Set(cards.flatMap((c) => c.dest))], [cards]);
  const inspirations = useMemo(
    () => Array.from(new Set(cards.flatMap((c) => c.inspire))).sort(),
    [cards],
  );

  /* Whether a card passes the filters, leaving one of them out (so each menu
     counts what choosing an option would show). */
  const pass = (c: CollectionCard, f: { dest?: string; show?: Show; insp?: string[] } = {}) => {
    const d = f.dest ?? dest;
    const s = f.show ?? show;
    const i = f.insp ?? insp;
    return (
      (d === 'All' || c.dest.includes(d)) &&
      (s === 'all' || (s === 'soon') === Boolean(c.soon)) &&
      i.every((x) => c.inspire.includes(x))
    );
  };

  const shown = useMemo(() => {
    const list = cards.filter((c) => pass(c));
    if (sort === 'featured') return list;
    const len = (c: CollectionCard) => c.days ?? (sort === 'shortest' ? 999 : -1);
    return [...list].sort((a, b) => (sort === 'shortest' ? len(a) - len(b) : len(b) - len(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, dest, show, insp, sort]);

  const anyOn = dest !== 'All' || show !== 'all' || insp.length > 0;
  const clearAll = () => {
    setDest('All');
    setShow('all');
    setInsp([]);
  };

  return (
    <div className="jx">
      <section className="col" id="collection" aria-labelledby="jx-col">
        <div className="colh">
          <div>
            <p className="lab">Our journeys</p>
            <h2 id="jx-col">The Collection</h2>
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

        <div className="fbar" role="group" aria-label="Filter journeys">
          <Menu
            label="Destination"
            value={dest === 'All' ? 'All' : dest}
            options={dests.map((d) => ({
              key: d,
              label: d,
              count: cards.filter((c) => pass(c, { dest: d })).length,
              on: d === dest,
            }))}
            onPick={(d) => setDest(d)}
          />
          <Menu
            label="Availability"
            value={shows.find(([k]) => k === show)?.[1] ?? 'All'}
            options={shows.map(([k, t]) => ({
              key: k,
              label: t,
              count: cards.filter((c) => pass(c, { show: k })).length,
              on: k === show,
            }))}
            onPick={(k) => setShow(k as Show)}
          />
          {inspirations.length > 0 && (
            <Menu
              label="What inspires you"
              multi
              value={
                insp.length === 0 ? 'All' : insp.length === 1 ? insp[0] : `${insp.length} chosen`
              }
              options={inspirations.map((i) => ({
                key: i,
                label: i,
                count: cards.filter((c) =>
                  pass(c, { insp: insp.includes(i) ? insp : [...insp, i] }),
                ).length,
                on: insp.includes(i),
              }))}
              onPick={(i) =>
                setInsp((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))
              }
            />
          )}
          {anyOn && (
            <button type="button" className="fclear" onClick={clearAll}>
              Clear
            </button>
          )}
          <div className="fend">
            <span role="status" aria-live="polite">
              Showing {shown.length} of {cards.length} journeys
            </span>
            <div className="seg view" role="group" aria-label="View">
              <button type="button" className="on" aria-pressed>
                List
              </button>
              <button type="button" disabled title="The map view is coming soon">
                Map
              </button>
            </div>
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

/**
 * A journey as a product card: its photographs to browse at the top, the card
 * settling into the colour of the place, the region and booking state on it,
 * then the name with the rate, the tagline, the line, the facts as pills, and
 * a white button in.
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
          {c.soon ? 'Register your interest' : 'View the journey'} <Arrow />
        </Link>
      </div>
    </article>
  );
}
