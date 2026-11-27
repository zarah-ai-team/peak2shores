'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import type { CollectionCardData } from '@/lib/journeyCards';
import { CollectionCard } from './CollectionCard';
import { preloadHeroCarousel, useIdleHeroCarousel } from './HeroCarouselLazy';
import { ShownSlugs } from './shownSlugs';
import './collection.css';
// The filters' dropdowns are styled with the rest of the Journeys page.
import './journeys-index.css';

type Show = 'all' | 'now' | 'soon';

/** The Collection's two views: the journey cards, or the journeys on the globe. */
type View = 'cards' | 'map';
const views: [View, string][] = [
  ['cards', 'Cards'],
  ['map', 'Map'],
];

/* The journeys open for reservations (booking now or guaranteed, in Marc's
   wording: lib/availability.ts), or still to come. */
const shows: [Show, string][] = [
  ['all', 'All'],
  ['now', 'Reservations open'],
  ['soon', 'Coming soon'],
];

/**
 * The filters show from this many journeys. Fewer are seen at a glance, and
 * four filters for three journeys pushed the first journey below a phone's
 * screen (Ishika's notes of 24 November 2026).
 */
const FILTER_FROM = 6;
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
};
const none: Filters = { dest: 'All', show: 'all', insp: [], len: 'All', when: 'All' };

/** What a several-choice dropdown shows as chosen. */
const chosen = (v: string[]) =>
  v.length === 0 ? 'All' : v.length === 1 ? v[0] : `${v.length} chosen`;
const toggle = (v: string[], x: string) => (v.includes(x) ? v.filter((y) => y !== x) : [...v, x]);

/**
 * The Collection: the label and heading, then one white panel of filters as
 * dropdowns in a row (Destination · Length · Month · What inspires you ·
 * Availability), each option counting its journeys and greyed when it has
 * none, a Clear link while any filter is on, and the count at the row's end.
 * Every option is read from the journeys themselves, and a filter with
 * nothing to choose is left out. Then the journeys as tall product cards
 * (CollectionCard), in the order they arrive (Marc's own). The filters stand
 * above both views and hold in both: the Map view shows only the journeys
 * they let through (ShownSlugs).
 *
 * After Ishika's notes of 9 November 2026: no Sort switch (Shortest and
 * Longest only repeated the Length filter) and no Travel style filter, and
 * Month is the filter by departure month. It lists the months the journeys
 * really leave in, earliest first, then `tba` ("Dates to be announced") for
 * the journeys without dates, and it is not shown at all until some journey
 * has a month.
 *
 * The panel of filters stays out until there are six journeys (FILTER_FROM;
 * Ishika's notes of 24 November 2026): until then every journey is shown, in
 * both views, and the cards follow the heading directly.
 */
export function JourneyCollection({
  cards,
  tba,
  map,
}: {
  cards: CollectionCardData[];
  tba: string;
  /** The Map view (the globe and its carousel), built on the server. Without it there is no switch. */
  map?: ReactNode;
}) {
  const [f, setF] = useState<Filters>(none);
  const [view, setView] = useState<View>('cards');
  /* The globe is drawn only once the Map view has been opened, then kept, so
     going back and forth does not lose the journey it was turned to. */
  const [mapOpened, setMapOpened] = useState(false);
  // The globe's code arrives once the page is idle, ready for a tap on Map.
  useIdleHeroCarousel();
  const tabs = useRef<HTMLDivElement>(null);
  const fbar = useRef<HTMLDivElement>(null);
  const show = (next: View) => {
    setView(next);
    if (next === 'map') setMapOpened(true);
  };
  /* A tab list: the arrow keys move between the two views. */
  const onTabKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next: View = view === 'cards' ? 'map' : 'cards';
    show(next);
    tabs.current?.querySelector<HTMLButtonElement>(`#jx-tab-${next}`)?.focus();
  };
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
      insps: uniq(cards.flatMap((c) => c.inspire)).sort(),
    };
  }, [cards]);

  /* Whether a card passes the filters, with some of them swapped (so each
     menu counts what choosing an option would show). */
  const pass = (c: CollectionCardData, over: Partial<Filters> = {}) => {
    const x = { ...f, ...over };
    const fits = lengths.find(([l]) => l === x.len)?.[1];
    return (
      (x.dest === 'All' || c.dest.includes(x.dest)) &&
      (x.show === 'all' || (x.show === 'soon') === Boolean(c.soon)) &&
      (x.len === 'All' || (!!c.days && !!fits?.(c.days))) &&
      (x.when === 'All' ||
        (x.when === 'tba' ? c.when.length === 0 : c.when.some((m) => m.ym === x.when))) &&
      x.insp.every((y) => c.inspire.includes(y))
    );
  };
  const count = (over: Partial<Filters>) => cards.filter((c) => pass(c, over)).length;
  const filtering = cards.length >= FILTER_FROM;

  // In the order the cards arrive: Marc's own.
  const shown = cards.filter((c) => pass(c));
  /* The same journeys for the Map view, as a list that changes only when they
     do: a new list turns the globe to the first of them. */
  const shownKey = shown.map((c) => c.slug).join(' ');
  const shownSlugs = useMemo(() => (shownKey ? shownKey.split(' ') : []), [shownKey]);

  const anyOn =
    f.dest !== 'All' ||
    f.show !== 'all' ||
    f.len !== 'All' ||
    f.when !== 'All' ||
    f.insp.length > 0;
  /* Clear (and "Clear them") goes once nothing is chosen, which would drop
     focus on it to the page: it moves to the first filter first. */
  const clearAll = () => {
    setF(none);
    fbar.current?.querySelector<HTMLButtonElement>('.fbtn')?.focus();
  };

  /** A single-choice menu: "All", then the options. */
  const one = (key: 'dest' | 'len', list: string[]) =>
    ['All', ...list].map((o) => ({
      key: o,
      label: o,
      count: count({ [key]: o }),
      on: f[key] === o,
    }));
  /** The Month menu: "All", each month, then the journeys without dates. */
  const departures: (readonly [string, string])[] = [
    ['All', 'All'],
    ...opts.whens,
    ...(opts.undated ? [['tba', tba] as const] : []),
  ];
  /** A several-choice menu: each option counted as if added to the others. */
  const many = (key: 'insp', list: string[]) =>
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
          <div>
            <p className="lab">Our journeys</p>
            <h2 id="jx-col">The Collection</h2>
          </div>
          {/* Pointed at, touched or focused, the switch starts fetching the
              globe's code, so the Map view opens as quickly as when the code
              came with the page (HeroCarouselLazy). */}
          {map && (
            <div
              ref={tabs}
              className="colview"
              role="tablist"
              aria-label="View the journeys as"
              onKeyDown={onTabKey}
              onPointerEnter={preloadHeroCarousel}
              onFocus={preloadHeroCarousel}
            >
              {views.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`jx-tab-${key}`}
                  aria-selected={view === key}
                  aria-controls={`jx-view-${key}`}
                  tabIndex={view === key ? 0 : -1}
                  className={view === key ? 'on' : undefined}
                  onClick={() => show(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* The filters stand above both views, so they hold in the Map view
            too; they show from six journeys (FILTER_FROM). */}
        {filtering && (
          <div ref={fbar} className="fbar" role="group" aria-label="Filter journeys">
            {/* `data-fab-clear`: the floating "Connect with our team" steps
                aside rather than cover the filters. The mark covers the panel
                on a short screen only (a phone held sideways,
                journeys-index.css), where the button would sit on them;
                elsewhere it is not shown, and the button stays. */}
            <span className="fbar-clear" data-fab-clear aria-hidden />
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
                label="Month"
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
        )}

        {map && (
          <div
            id="jx-view-map"
            className="colmap"
            role="tabpanel"
            aria-labelledby="jx-tab-map"
            hidden={view !== 'map'}
          >
            <p className="colmap-hint">
              <i aria-hidden />
              Choose a journey below and the globe will take you there.
            </p>
            {mapOpened && <ShownSlugs.Provider value={shownSlugs}>{map}</ShownSlugs.Provider>}
          </div>
        )}

        <div
          id="jx-view-cards"
          role={map ? 'tabpanel' : undefined}
          aria-labelledby={map ? 'jx-tab-cards' : undefined}
          hidden={view !== 'cards'}
        >
          {/* The cards start below the page's hero, so none of their
              photographs is loaded ahead of the hero's. */}
          <ul className="grid">
            {shown.map((c) => (
              <li key={c.slug}>
                <CollectionCard card={c} />
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
        </div>
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
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  /* The list hides as it closes, so focus inside it would be lost to the
     page: it goes back to the menu's own button. */
  useEffect(() => {
    if (!open) return;
    // On a touch screen a list opening past the foot of the screen (a phone
    // held sideways) is brought into view with its button: the page moves up
    // just enough to show the list's last option, and never so far that the
    // button goes under the header (the page's scroll padding at the top).
    const list = box.current?.querySelector('.flist')?.getBoundingClientRect();
    const button = trigger.current?.getBoundingClientRect();
    if (list && button && window.matchMedia('(pointer: coarse)').matches) {
      const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const room = button.top - top;
      const by =
        room < 0 ? room : Math.min(Math.max(0, list.bottom - (window.innerHeight - 8)), room);
      if (by) window.scrollBy({ top: by });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const inside = box.current?.contains(document.activeElement);
      setOpen(false);
      if (inside) trigger.current?.focus();
    };
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
        ref={trigger}
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
      {/* `data-fab-clear`: the floating "Connect with our team" steps aside
          while the open list is where it would cover the options. */}
      <ul className="flist" id={id} role="list" hidden={!open} data-fab-clear>
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
                  if (multi) return;
                  setOpen(false);
                  trigger.current?.focus();
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
