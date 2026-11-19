import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { Journey, JourneyFlyer } from '@/lib/content';
import { flipbook, statusLabel } from '@/lib/data/flipbook';
import { fromPriceLabel } from '@/lib/journeyPrice';
import { DATES_TBA, RATES_TBA, type JourneyDeparture } from '@/lib/journeys';
import { getMedia } from '@/lib/media';
import { site } from '@/lib/site';
import { OpenJourneyForm } from './forms/JourneyForms';
import { HeroStage, type HeroPlace } from './HeroStage';
import { JourneyDepartures, type DepartureFilter, type DepartureRow } from './JourneyDepartures';
import { placePhotos } from './placePhotos';
import './journey-editorial.css';

/*
 * A journey's page, after Ishika's notes of 3 November 2026 (Swiss Elegance
 * as the example): a full-bleed hero with the route and the facts along its
 * foot, the overview with its highlights and Marc's note, the itinerary
 * (RouteLive) ending on the extension row, the extension banner, and dates &
 * rates. Where you'll stay, with its hotel pop-ups, is Stays.tsx. Scoped to
 * `.jy`. Copy is Marc's own (the flyer and flipbook) or Ishika's wording from
 * the notes; nothing here adds facts.
 *
 * The page's forms open as pop-ups from `OpenJourneyForm` buttons, inside the
 * page's `JourneyFormsProvider`: the inquiry from the in-page menu, the group
 * and private booking requests from the rates box.
 */

const titleOf = (j: { slug: string; title: string }) => flipbook[j.slug]?.title ?? j.title;

/** The countries a journey crosses, "Switzerland · Italy". */
const countriesOf = (j: Journey) => j.country.split(' & ').join(' · ');

/** Nights on the journey, from its stays, else one fewer than its days. */
const nightsOf = (j: Journey) =>
  (j.flyer?.parts.flatMap((p) => p.stays).reduce((t, s) => t + (s.nights ?? 0), 0) ?? 0) ||
  j.days - 1;

/** Does a stay ("Stresa & Lake Maggiore") name a stop on the route ("Stresa")? */
const names = (a: string, b: string) => {
  const [x, y] = [a.toLowerCase(), b.toLowerCase()];
  return x.includes(y) || y.includes(x);
};

/** Each place on the route once, with its nights and its photograph. */
function placesOf(j: Journey): HeroPlace[] {
  const stays = j.flyer?.parts.flatMap((p) => p.stays) ?? [];
  const seen = new Set<string>();
  return (j.route ?? []).flatMap((stop) => {
    if (seen.has(stop.name)) return [];
    seen.add(stop.name);
    const n = stays
      .filter((s) => names(s.place, stop.name))
      .reduce((t, s) => t + (s.nights ?? 0), 0);
    const photo = placePhotos[stop.name];
    return [
      {
        name: stop.name,
        stay: n ? `${n} ${n === 1 ? 'night' : 'nights'}` : 'Along the way',
        img: photo?.src,
        alt: photo?.alt ?? stop.name,
      },
    ];
  });
}

/** Where "Learn more" about taking a journey privately goes: Bespoke Private
    Travel on the Plan page, as every private-travel link on the site does. */
const PRIVATE_HREF = '/plan#private';

/** Where a journey stands for booking, in the words its card and the home
    slider use: "Now booking" while it is open, dates set or not (booking
    requests are taken before the dates are announced). */
export function statusOf(journey: Journey) {
  return statusLabel[journey.status ?? 'open'] ?? 'Departed';
}

/* -- Departures ----------------------------------------------------------------- */

/* A date's month and day ("Jun 19") and a month's name ("June"). A
   'YYYY-MM-DD' date is read as a calendar day in UTC, so it is the same day
   wherever the page is built. */
const dayLabel = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });
const calendarDay = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** A departure's dates with their months: "Jun 19 – Jul 1, 2027", or
    "Dec 28, 2027 – Jan 8, 2028" across the turn of a year. */
function datesOf(d: JourneyDeparture) {
  const [a, b] = [calendarDay(d.start), calendarDay(d.end)];
  const [ya, yb] = [a.getUTCFullYear(), b.getUTCFullYear()];
  return ya === yb
    ? `${dayLabel.format(a)} – ${dayLabel.format(b)}, ${yb}`
    : `${dayLabel.format(a)}, ${ya} – ${dayLabel.format(b)}, ${yb}`;
}

/** The journey's departures in date order. */
const departuresOf = (j: Journey) =>
  [...(j.departures ?? [])].sort((a, b) => a.start.localeCompare(b.start));

/** The departures as the booking forms offer them: the dates, and the dates' ISO interval. */
export function departureOptions(j: Journey): { value: string; label: string }[] {
  return departuresOf(j).map((d) => ({ value: `${d.start}/${d.end}`, label: datesOf(d) }));
}

/**
 * The Dates and rates table's rows, and its filter. Each departure is a row
 * with its dates, its price (its own rate, else the journey's from-price) and
 * its status (its own, else the journey's). The rows filter by the year a
 * departure starts in, or by its month when every departure starts in the
 * same year. A journey without departures has a single row, "Dates to be
 * announced", and no filter.
 */
function departureTable(j: Journey): { rows: DepartureRow[]; filter?: DepartureFilter } {
  const deps = departuresOf(j);
  if (deps.length === 0)
    return {
      rows: [
        { id: 'tba', dates: DATES_TBA, price: fromPriceLabel(j), status: statusOf(j), key: '' },
      ],
    };
  const by = new Set(deps.map((d) => d.start.slice(0, 4))).size > 1 ? 'year' : 'month';
  const keyOf = (d: JourneyDeparture) => d.start.slice(0, by === 'year' ? 4 : 7);
  const rows = deps.map((d) => ({
    id: `${d.start}/${d.end}`,
    dates: datesOf(d),
    price: d.price ? fromPriceLabel({ priceFrom: d.price }) : fromPriceLabel(j),
    status: d.status ? (statusLabel[d.status] ?? 'Departed') : statusOf(j),
    key: keyOf(d),
  }));
  const keys = [...new Set(rows.map((r) => r.key))];
  return {
    rows,
    filter: {
      by,
      options: keys.map((k) => ({
        value: k,
        label: by === 'year' ? k : monthLabel.format(calendarDay(`${k}-01`)),
      })),
    },
  };
}

/* -- 1. Hero ----------------------------------------------------------------- */

export function JyHero({ journey }: { journey: Journey }) {
  const media = getMedia(journey.detail?.heroMedia ?? journey.heroMedia ?? journey.listMedia);

  const facts: { k: string; v: string; live?: boolean; tba?: boolean }[] = [
    { k: 'Length', v: `${journey.days} days · ${nightsOf(journey)} nights` },
    { k: 'Departure', v: journey.departureWindow },
    { k: 'Group', v: site.groupSize },
    { k: 'Price', v: fromPriceLabel(journey), tba: !journey.priceFrom },
    { k: 'Countries', v: countriesOf(journey) },
    { k: 'Status', v: statusOf(journey), live: true },
  ];

  /* `data-header="solid-on-scroll"`: the site header turns to its solid bar as
     soon as the page moves, so it never lies over the hero's words (Ishika's
     notes of 9 November 2026, item 16). */
  return (
    <section className="jy hero" data-hero data-header="solid-on-scroll" aria-labelledby="jy-h1">
      <HeroStage media={media} places={placesOf(journey)}>
        <p className="crumb lab">
          <Link href="/journeys">Journeys</Link>
          <i aria-hidden />
          {journey.eyebrow ?? `${journey.region} · ${journey.country}`}
        </p>
        <h1 id="jy-h1">{titleOf(journey)}</h1>
        <p className="tag">{journey.lead}</p>
      </HeroStage>
      <dl className="facts" data-fab-clear>
        {facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd className={f.live ? 'live' : f.tba ? 'tba' : undefined}>
              {f.live && <i aria-hidden />}
              {f.v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -- 2. Overview: the journey in a line, its highlights and Marc's note ------- */

export function JyIntro({ journey, flyer }: { journey: Journey; flyer: JourneyFlyer }) {
  const stays = flyer.parts.flatMap((p) => p.stays);
  const tagline = flipbook[journey.slug]?.tagline ?? journey.lead;
  const highlights = flyer.highlights ?? [];
  const note = flyer.marcNote;
  const countries = journey.country.split(/\s*&\s*/).length;
  const places = stays.filter((s) => s.nights).length;
  const nums: [number, string][] = [
    [journey.days, 'Days'],
    [places, places === 1 ? 'Place' : 'Places'],
    [nightsOf(journey), 'Nights'],
    [countries, countries === 1 ? 'Country' : 'Countries'],
  ];

  return (
    <section className="jy intro" id="overview" aria-labelledby="jy-intro-h">
      <div className="ov-head">
        <p className="lab">The journey · {journey.lead}</p>
        <h2 id="jy-intro-h">{tagline}</h2>
      </div>
      <div className="ov-body">
        <p className="it">{journey.blurb}</p>
        <div className="side">
          <dl className="nums">
            {nums.map(([n, k]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{n}</dd>
              </div>
            ))}
          </dl>
          {/* Directly under the journey's figures, as A&K has it under its
              facts (Ishika's notes of 9 November 2026, item 18). The floating
              "Connect with our team" steps aside rather than cover its link
              (`data-fab-clear`). */}
          <p className="priv" data-fab-clear>
            <span>Want to take this journey privately?</span>{' '}
            <Link className="tlink" href={PRIVATE_HREF}>
              Learn more<span className="sr-only"> about taking this journey privately</span>
            </Link>
          </p>
        </div>
      </div>

      {(highlights.length > 0 || note) && (
        <div className={`ov-more${highlights.length > 0 && note ? '' : ' solo'}`}>
          {highlights.length > 0 && (
            <div className="hl">
              <p className="lab">Overview</p>
              <ul>
                {highlights.map((h) => (
                  <li key={h}>
                    <Star />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {note && (
            <figure className="note">
              <p className="lab">A note from Marc</p>
              <span className="qm" aria-hidden>
                “
              </span>
              <blockquote>{note.quote}</blockquote>
              <figcaption>
                <span className="pic">
                  <Image src="/brand/marc.webp" alt="" width={1150} height={1400} sizes="56px" />
                </span>
                <span>
                  <b>{site.founder.name}</b>
                  {site.founder.role}, {site.name}
                </span>
              </figcaption>
            </figure>
          )}
        </div>
      )}
    </section>
  );
}

/** A highlight's mark: a fine star, drawn in line like the site's other icons. */
function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3.5l2.5 5.4 5.9.7-4.4 4 1.2 5.9L12 16.6l-5.2 2.9 1.2-5.9-4.4-4 5.9-.7z" />
    </svg>
  );
}

/* -- 3. The extension: the slim last row of the itinerary, and its banner ----- */

export function JyExtensionRow({ flyer }: { flyer: JourneyFlyer }) {
  const x = flyer.extension;
  if (!x) return null;
  return (
    <a className="jy-xrow" href="#extension">
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
      <span className="t">
        <small>{x.kicker}</small>
        {x.row}
      </span>
      <span className="tg">{x.tag}</span>
      <span className="ar" aria-hidden>
        →
      </span>
    </a>
  );
}

export function JyExtension({ flyer }: { flyer: JourneyFlyer }) {
  const x = flyer.extension;
  if (!x) return null;
  const photos = x.photos.map((p) => ({ ...p, m: getMedia(p.media) })).filter((p) => p.m.src);
  return (
    <section className="jy ext" id="extension" aria-labelledby="jy-ext-h">
      <div className="ext-c">
        <p className="lab">{x.kicker}</p>
        <h2 id="jy-ext-h">{x.title}</h2>
        <p className="sub">{x.sub}</p>
        <p className="tx">{x.text}</p>
        <ol className="xroute">
          {x.route.map((r) => (
            <li key={r.place}>
              <b>{r.place}</b>
              <span>
                {r.nights} {r.nights === 1 ? 'night' : 'nights'}
              </span>
            </li>
          ))}
        </ol>
        <dl className="xfacts">
          <div>
            <dt>Adds</dt>
            <dd>{x.adds.replace(/^Adds\s*/, '')}</dd>
          </div>
          <div>
            <dt>{x.combo}</dt>
            <dd>{RATES_TBA}</dd>
          </div>
        </dl>
        <div className="xctas">
          <Link className="btn btn-blue" href={`/journeys/${x.slug}`}>
            {x.cta} <Arrow />
          </Link>
        </div>
      </div>
      {photos.length > 0 && (
        <ul className={`collage n${photos.length}`}>
          {photos.map((p) => (
            <li key={p.label}>
              <Image
                className="fill"
                src={p.m.src as string}
                alt={p.m.alt ?? p.label}
                fill
                sizes="(min-width: 1000px) 22vw, 50vw"
              />
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* -- 4. Dates & rates ---------------------------------------------------------- */

/*
 * The table lists each departure's dates, price and status (Ishika's notes of
 * 9 November 2026, item 21; the owner's decisions of 18 November). The rates
 * box books the journey: "Book this journey" opens the group booking form,
 * "Book as a private journey" the private one. Its other lines are the
 * placeholders that stay until Marc sends the section's wording (item 21e).
 */
export function JyDates({ journey }: { journey: Journey }) {
  const x = journey.flyer?.extension;
  const { rows, filter } = departureTable(journey);
  return (
    <section className="jy dep" id="dates" aria-labelledby="jy-dep-h">
      <div className="dep-main">
        <p className="lab">Dates &amp; rates</p>
        <h2 id="jy-dep-h">Dates and rates</h2>
        <JourneyDepartures rows={rows} filter={filter} />
        <div className="circle">
          <div>
            <p className="t">Be the first to hear when dates open.</p>
            <p>New journeys and departures are announced to The Circle first.</p>
          </div>
          <Link className="tlink" href="/#circle">
            Join The Circle →
          </Link>
        </div>
      </div>

      <aside className="rate" aria-label="Rates">
        <p className="lab">Price</p>
        <p className="price">{fromPriceLabel(journey)}</p>
        {journey.priceFrom && <p className="sm">Sharing a double room</p>}
        <p className="sm">Single supplement: to be announced</p>
        {x && (
          <div className="with">
            <p className="lab">With {x.title}</p>
            <p>{x.combo}: rates to be announced</p>
          </div>
        )}
        {/* `data-fab-clear`: the floating "Connect with our team" steps aside
            while these buttons pass through the foot of the screen, where it
            would otherwise lie over them. */}
        <div className="ctas" data-fab-clear>
          <OpenJourneyForm kind="group" className="btn btn-blue">
            Book this journey <Arrow />
          </OpenJourneyForm>
          <OpenJourneyForm kind="private" className="btn btn-line">
            Book as a private journey
          </OpenJourneyForm>
        </div>
        {/* It also read "Full inclusions and booking terms are listed below", but
            no list follows: each journey's inclusions are still to come from
            Marc (note of 29 October). Put the pointer back with the list. */}
        <p className="fine">International flights are not included.</p>
      </aside>
    </section>
  );
}
