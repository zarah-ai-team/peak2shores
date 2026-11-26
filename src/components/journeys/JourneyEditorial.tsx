import Image from 'next/image';
import Link from 'next/link';
import { AvailabilityTag } from '@/components/ui/AvailabilityTag';
import { StatusTag } from '@/components/ui/StatusTag';
import { Arrow } from '@/components/ui/Button';
import {
  availability,
  departureAvailability,
  isUpcoming,
  limitedAvailability,
  OTHER_JOURNEYS_HREF,
  type DepartureStatus,
} from '@/lib/availability';
import type { Journey, JourneyFlyer } from '@/lib/content';
import { flipbook } from '@/lib/data/flipbook';
import { ratesOf, type JourneyRates, type RateItem } from '@/lib/data/journeyRates';
import { fromPriceLabel } from '@/lib/journeyPrice';
import { DATES_TBA, journeyAvailabilityOf, RATES_TBA, type JourneyDeparture } from '@/lib/journeys';
import { PRIVATE_TRAVEL_HREF } from '@/lib/links';
import { getMedia } from '@/lib/media';
import { site } from '@/lib/site';
import { OpenJourneyForm } from './forms/JourneyForms';
import { HeroStage, type HeroPlace } from './HeroStage';
import { JourneyDepartures, type DepartureFilter, type DepartureRow } from './JourneyDepartures';
import { JourneyRatesTable, type RateRow } from './JourneyRatesTable';
import { placePhotos } from './placePhotos';
import { RateIcon, type RateIconName } from './RateIcon';
import './journey-editorial.css';
import './journey-rates.css';

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
 * and private booking requests from the dates and the rates box.
 *
 * The booking status follows Marc's review of 23 November 2026: the journey's
 * own (the best of its departures, journeyAvailabilityOf) in the hero's
 * facts, and each departure's beside its dates, with what it means and the
 * next step it offers, every one drawn by AvailabilityTag.
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
        pos: photo?.pos,
      },
    ];
  });
}

/** The three statuses in the order a departure moves through them. */
const STATUSES: DepartureStatus[] = ['booking-now', 'guaranteed', 'sold-out'];

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

/** The journey's departures still to come, in date order. */
const departuresOf = (j: Journey) =>
  (j.departures ?? []).filter((d) => isUpcoming(d)).sort((a, b) => a.start.localeCompare(b.start));

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
        {
          id: 'tba',
          dates: DATES_TBA,
          price: fromPriceLabel(j),
          availability: journeyAvailabilityOf(j),
          key: '',
        },
      ],
    };
  const by = new Set(deps.map((d) => d.start.slice(0, 4))).size > 1 ? 'year' : 'month';
  const keyOf = (d: JourneyDeparture) => d.start.slice(0, by === 'year' ? 4 : 7);
  const rows = deps.map((d) => ({
    id: `${d.start}/${d.end}`,
    dates: datesOf(d),
    price: d.price ? fromPriceLabel({ priceFrom: d.price }) : fromPriceLabel(j),
    availability: departureAvailability(d),
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

  // The status: the best of the journey's departures, as on its card; a
  // journey that has run keeps its page, marked as departed.
  const status = journeyAvailabilityOf(journey);
  const past = journey.status === 'past';
  const facts: { k: string; v: string; live?: boolean; tba?: boolean }[] = [
    { k: 'Length', v: `${journey.days} days · ${nightsOf(journey)} nights` },
    { k: 'Departure', v: journey.departureWindow },
    { k: 'Group', v: site.groupSize },
    { k: 'Price', v: fromPriceLabel(journey), tba: !journey.priceFrom },
    { k: 'Countries', v: countriesOf(journey) },
    past
      ? { k: 'Status', v: 'Departed' }
      : { k: 'Status', v: availability[status.status].label, live: true },
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
              {f.live ? (
                <AvailabilityTag
                  status={status.status}
                  limited={status.limited}
                  tone="dark"
                  className="jy-avl"
                />
              ) : (
                f.v
              )}
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
            <Link className="tlink" href={PRIVATE_TRAVEL_HREF}>
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

export function JyExtension({ flyer, slug }: { flyer: JourneyFlyer; slug?: string }) {
  const x = flyer.extension;
  if (!x) return null;
  /* The lowest price for both journeys together, from the Dates & Prices
     data when the journey has it (the same figure as its table). */
  const rates = slug ? ratesOf(slug) : undefined;
  const combo = rates?.departures
    .filter((d) => isUpcoming(d))
    .map((d) => d.withExtension)
    .filter((p): p is string => !!p)
    .sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')))[0];
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
            <dd>
              {combo ? `From ${combo} per person${rates?.sample ? ' (sample)' : ''}` : RATES_TBA}
            </dd>
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
          {photos.map((p, i) => (
            <li key={p.label}>
              {/* The first photograph fills the collage's height, so a
                  landscape one is cropped to it and drawn about one and a
                  half times as wide as the collage is tall (480px on a
                  phone); the others share the second column. */}
              <Image
                className="fill"
                src={p.m.src as string}
                alt={p.m.alt ?? p.label}
                fill
                sizes={
                  i === 0
                    ? '(min-width: 1101px) 54vw, (min-width: 601px) 65vw, 30rem'
                    : '(min-width: 1101px) 22vw, (min-width: 601px) 42vw, 50vw'
                }
              />
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* -- 4. Dates & prices -------------------------------------------------------- */

/* Each departure's status from its confirmed guests (Marc's review of 23
   November 2026), in place of the old Available / Limited / Waitlist / Sold
   out and the separate "Guaranteed departure" note. */
function rateRows(rates: JourneyRates): RateRow[] {
  return rates.departures
    .filter((d) => isUpcoming(d))
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((d) => ({
      id: `${d.start}/${d.end}`,
      dates: datesOf(d),
      starts: dayOf(d.start),
      ends: dayOf(d.end),
      year: d.start.slice(0, 4),
      price: d.price,
      single: d.single,
      withExtension: d.withExtension,
      availability: departureAvailability(d),
      notes: d.notes ?? [],
    }));
}

/**
 * What the statuses mean, in brief, under the table: each status with its
 * secondary words, and Limited Availability beside Guaranteed, with a way on
 * to the full explanation on the Journeys page.
 */
function StatusKey() {
  return (
    <div className="dp-key">
      <ul aria-label="What the availability means">
        {STATUSES.map((s) => (
          <li key={s}>
            <AvailabilityTag status={s} />
            <span>{availability[s].secondary}</span>
          </li>
        ))}
        <li>
          <AvailabilityTag status="guaranteed" limited />
          <span>{limitedAvailability.wording}</span>
        </li>
      </ul>
      <Link className="tlink" href="/journeys#availability">
        Understanding journey availability
      </Link>
    </div>
  );
}

const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' });
const dayOf = (iso: string) => ({
  date: longDate.format(calendarDay(iso)),
  day: weekday.format(calendarDay(iso)),
});

/*
 * Dates & Prices, after A&K's (Ishika's notes of 9 November 2026, item 21;
 * the owner's requests of 24 November). A journey with rates in
 * data/journeyRates.ts has two sections: the departures as a ruled table,
 * then the additional information (what is
 * included and not, price notes, deposit and payment), every part shown in
 * full with an icon on each line. A journey without rates keeps the plain
 * table, its rates box and its "to be announced" lines.
 */
export function JyDates({ journey }: { journey: Journey }) {
  const rates = ratesOf(journey.slug);
  return rates ? <JyRates journey={journey} rates={rates} /> : <JyDatesTba journey={journey} />;
}

function JyRates({ journey, rates }: { journey: Journey; rates: JourneyRates }) {
  const x = journey.flyer?.extension;
  // A journey that has run offers no departure, whatever rows remain.
  const past = journey.status === 'past';
  const rows = past ? [] : rateRows(rates);
  /* The extension's short name: "Swiss Elegance", "Italy Uncovered". */
  const xName = x?.title.split(/[,:]/)[0];
  const parts: { id: string; t: string; icon: RateIconName; tone: string; items: RateItem[] }[] = [
    { id: 'in', t: 'What’s included', icon: 'check', tone: 'in', items: rates.included },
    { id: 'out', t: 'Not included', icon: 'cross', tone: 'out', items: rates.excluded },
    { id: 'notes', t: 'Price notes', icon: 'tag', tone: 'note', items: rates.priceNotes },
    { id: 'pay', t: 'Deposit & payment', icon: 'card', tone: 'note', items: rates.payment },
  ];
  return (
    <>
      <section className="jy dp" id="dates" aria-labelledby="jy-dp-h">
        <header className="dp-h">
          <div>
            <p className="lab">Dates &amp; prices</p>
            <h2 id="jy-dp-h">Dates and prices</h2>
          </div>
          <p className="dp-lede">
            Each departure travels with no more than 18 guests. Prices are per person in US dollars,
            sharing a double room.
          </p>
        </header>
        {rates.sample && rows.length > 0 && (
          <p className="dp-sample" role="note">
            <RateIcon name="info" />
            <span>
              <b>Sample dates, prices and availability.</b> Shown for review only; the confirmed
              departures, rates and availability will replace them.
            </span>
          </p>
        )}
        {/* Every departure in the data has run (or the journey has): a line
            in place of an empty table, until new dates are entered; a
            journey that has run says so and leads on, as a sold-out one. */}
        {rows.length > 0 ? (
          <>
            <JourneyRatesTable
              rows={rows}
              extensionLabel={xName ? `With ${xName}` : undefined}
              deposit={rates.payment
                .filter((p) => p.icon === 'card' || p.icon === 'clock')
                .map((p) => p.text)}
            />
            <StatusKey />
          </>
        ) : past ? (
          <div className="dp-done">
            <StatusTag status="past" />
            <p className="dp-foot">This journey has departed.</p>
            <p className="dp-foot">
              <Link className="tlink" href={OTHER_JOURNEYS_HREF}>
                {availability['sold-out'].cta} →
              </Link>{' '}
              <Link className="tlink" href={PRIVATE_TRAVEL_HREF}>
                {availability['sold-out'].altCta} →
              </Link>
            </p>
          </div>
        ) : (
          <p className="dp-foot">{`${DATES_TBA}.`}</p>
        )}
        <p className="dp-foot">
          International flights are not included.
          {rows.length > 0 && xName && ` The price with ${xName} is in each departure’s details.`}
        </p>
      </section>

      <section className="jy dpi" id="information" aria-labelledby="jy-dpi-h">
        <header className="dp-h">
          <div>
            <p className="lab">Before you book</p>
            <h2 id="jy-dpi-h">Additional information</h2>
          </div>
          <p className="dp-lede">
            What your journey includes, what it leaves to you, and how booking works.
          </p>
        </header>
        <div className="dpi-g">
          {parts
            .filter((p) => p.items.length > 0)
            .map((p) => (
              <article
                key={p.id}
                className={`dpi-c dpi-${p.tone}`}
                aria-labelledby={`jy-dpi-${p.id}`}
              >
                <h3 id={`jy-dpi-${p.id}`}>
                  <span className="dpi-hi">
                    <RateIcon name={p.icon} />
                  </span>
                  {p.t}
                </h3>
                <ul>
                  {p.items.map((it) => (
                    <li key={it.text}>
                      <RateIcon name={it.icon} className="dpi-i" />
                      <span>{it.text}</span>
                    </li>
                  ))}
                </ul>
                {p.id === 'pay' && (
                  <Link className="tlink" href="/terms">
                    Read the Booking Terms →
                  </Link>
                )}
              </article>
            ))}
        </div>
      </section>
    </>
  );
}

/* The plain table, for a journey whose dates and rates are still to come. */
function JyDatesTba({ journey }: { journey: Journey }) {
  const x = journey.flyer?.extension;
  const { rows, filter } = departureTable(journey);
  const status = journeyAvailabilityOf(journey);
  const words = availability[status.status];
  const past = journey.status === 'past';
  return (
    <section className="jy dep" id="dates" aria-labelledby="jy-dep-h">
      <div className="dep-main">
        <p className="lab">Dates &amp; prices</p>
        <h2 id="jy-dep-h">Dates and prices</h2>
        {/* A journey that has run lists no departure (its status, with the
            ways on, is in the aside). */}
        {past ? (
          <p className="dp-foot">This journey has departed.</p>
        ) : (
          <JourneyDepartures rows={rows} filter={filter} />
        )}
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

      <aside className="rate" aria-label="Prices">
        <p className="lab">Price</p>
        <p className="price">{fromPriceLabel(journey)}</p>
        {journey.priceFrom && <p className="sm">Per person, sharing a double room</p>}
        <p className="sm">Single supplement: to be announced</p>
        {x && (
          <div className="with">
            <p className="lab">With {x.title}</p>
            <p>{x.combo}: rates to be announced</p>
          </div>
        )}
        {/* The journey's status, what it means and the step it offers
            (Marc's review of 23 November 2026); a journey that has run says
            so and leads to the others, as a sold-out one does. */}
        <div className="rate-st">
          {past ? (
            <StatusTag status="past" tone="dark" />
          ) : (
            <>
              <AvailabilityTag status={status.status} limited={status.limited} tone="dark" />
              <p>
                {words.wording}
                {status.limited && ` ${limitedAvailability.wording}`}
              </p>
            </>
          )}
        </div>
        {/* `data-fab-clear`: the floating "Connect with our team" steps aside
            while these buttons pass through the foot of the screen. */}
        <div className="ctas" data-fab-clear>
          {past || status.status === 'sold-out' ? (
            <Link className="btn btn-blue" href={OTHER_JOURNEYS_HREF}>
              {availability['sold-out'].cta} <Arrow />
            </Link>
          ) : (
            <OpenJourneyForm
              kind="group"
              dialogTitle={words.cta}
              dialogNote={`${words.wording}${status.limited ? ` ${limitedAvailability.wording}` : ''}`}
              className="btn btn-blue"
            >
              {words.cta} <Arrow />
            </OpenJourneyForm>
          )}
          {past ? (
            <Link className="btn btn-line" href={PRIVATE_TRAVEL_HREF}>
              {availability['sold-out'].altCta}
            </Link>
          ) : (
            <OpenJourneyForm kind="private" className="btn btn-line">
              Book as a private journey
            </OpenJourneyForm>
          )}
        </div>
        <p className="fine">International flights are not included.</p>
      </aside>
    </section>
  );
}
