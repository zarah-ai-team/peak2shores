import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { Journey, JourneyFlyer } from '@/lib/content';
import { flipbook, statusLabel } from '@/lib/data/flipbook';
import { RATES_TBA } from '@/lib/journeys';
import { getMedia } from '@/lib/media';
import { site } from '@/lib/site';
import './journey-editorial.css';

/*
 * A journey's page, after Ishika's notes of 3 November 2026 (Swiss Elegance
 * as the example): a full-bleed hero with the route and the facts along its
 * foot, the overview with its highlights and Marc's note, the itinerary
 * (RouteLive) ending on the extension row, the extension banner, where you'll
 * stay, and dates & rates. Scoped to `.jy`. Copy is Marc's own (the flyer and
 * flipbook) or Ishika's wording from the notes; nothing here adds facts.
 */

const titleOf = (j: { slug: string; title: string }) => flipbook[j.slug]?.title ?? j.title;

/** The countries a journey crosses, "Switzerland · Italy". */
const countriesOf = (j: Journey) => j.country.split(' & ').join(' · ');

/** Nights on the journey, from its stays, else one fewer than its days. */
const nightsOf = (j: Journey) =>
  (j.flyer?.parts.flatMap((p) => p.stays).reduce((t, s) => t + (s.nights ?? 0), 0) ?? 0) ||
  j.days - 1;

/** Where "Request details" goes: the inquiry form, this journey already named. */
export const requestHref = (j: { slug: string }) =>
  `/plan?journey=${encodeURIComponent(j.slug)}#contact`;

/** Where a journey stands, for its own page: until dates are set, "Coming soon". */
export function statusOf(journey: Journey) {
  if (journey.status && journey.status !== 'open') return statusLabel[journey.status] ?? 'Departed';
  return journey.departureISO ? 'Now booking' : 'Coming soon';
}

/* -- 1. Hero ----------------------------------------------------------------- */

export function JyHero({ journey }: { journey: Journey }) {
  const media = getMedia(journey.detail?.heroMedia ?? journey.heroMedia ?? journey.listMedia);
  const stops = Array.from(new Set((journey.route ?? []).map((s) => s.name)));

  const facts: { k: string; v: string; live?: boolean; tba?: boolean }[] = [
    { k: 'Length', v: `${journey.days} days · ${nightsOf(journey)} nights` },
    { k: 'Departure', v: journey.departureWindow },
    { k: 'Group', v: site.groupSize },
    {
      k: 'From',
      v: journey.priceFrom ? `${journey.priceFrom} per person` : RATES_TBA,
      tba: !journey.priceFrom,
    },
    { k: 'Countries', v: countriesOf(journey) },
    { k: 'Status', v: statusOf(journey), live: true },
  ];

  return (
    <section className="jy hero" data-hero aria-labelledby="jy-h1">
      {media.src && (
        <Image
          className="fill"
          src={media.src}
          alt={media.alt ?? ''}
          fill
          priority
          sizes="100vw"
          quality={85}
        />
      )}
      <div className="hero-shade" aria-hidden />
      <div className="hero-c">
        <p className="crumb lab">
          <Link href="/journeys">Journeys</Link>
          <i aria-hidden />
          {journey.eyebrow ?? `${journey.region} · ${journey.country}`}
        </p>
        <h1 id="jy-h1">{titleOf(journey)}</h1>
        <p className="tag">{journey.lead}</p>
        {stops.length > 1 && (
          <ol className="hroute" aria-label="The route">
            {stops.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        )}
      </div>
      <dl className="facts">
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

  return (
    <section className="jy intro" id="overview" aria-labelledby="jy-intro-h">
      <p className="lab">The journey · {journey.lead}</p>
      <h2 id="jy-intro-h">{tagline}</h2>
      <p className="it">{journey.blurb}</p>
      <div className="side">
        <ul className="nums">
          <li>
            <b>{journey.days}</b>
            <span>Days</span>
          </li>
          <li>
            <b>{stays.filter((s) => s.nights).length}</b>
            <span>Places</span>
          </li>
          <li>
            <b>{nightsOf(journey)}</b>
            <span>Nights</span>
          </li>
          <li>
            <b>{journey.country.split(/\s*&\s*/).length}</b>
            <span>Countries</span>
          </li>
        </ul>
        <div className="row">
          <a className="btn btn-ink" href="#itinerary">
            The places <Arrow />
          </a>
          <a className="tlink" href={requestHref(journey)}>
            Request details →
          </a>
        </div>
      </div>

      {(highlights.length > 0 || note) && (
        <div className="ov-more">
          {highlights.length > 0 && (
            <div className="hl">
              <p className="lab">Overview</p>
              <ul>
                {highlights.map((h) => (
                  <li key={h}>
                    <Star />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {note && (
            <figure className="note">
              <span className="pic">
                <Image src="/brand/marc.webp" alt="" width={1150} height={1400} sizes="64px" />
              </span>
              <div>
                <p className="lab">A note from Marc</p>
                <blockquote>“{note.quote}”</blockquote>
                <figcaption>
                  {site.founder.name} · {site.founder.role}, {site.name}
                </figcaption>
              </div>
            </figure>
          )}
        </div>
      )}
    </section>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
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

export function JyExtension({ journey, flyer }: { journey: Journey; flyer: JourneyFlyer }) {
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
          <a className="btn btn-line" href={requestHref(journey)}>
            Request details
          </a>
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

/* -- 4. Where you'll stay --------------------------------------------------------- */

export function JyStays({ flyer }: { flyer: JourneyFlyer }) {
  const stays = flyer.parts.flatMap((p) => p.stays);
  // Each hotel shows the photograph of the place it is in.
  const hotels = flyer.hotels.map((h) => {
    const stay = stays.find((s) => s.place.toLowerCase().includes(h.place.toLowerCase()));
    const m = stay?.media ? getMedia(stay.media) : undefined;
    return { ...h, img: m?.src ?? undefined, alt: m?.alt ?? h.place, nights: stay?.nights };
  });
  if (hotels.length === 0) return null;

  return (
    <section className="jy stay" id="stays" aria-labelledby="jy-stay-h">
      <div className="head">
        <div>
          <p className="lab">Stays</p>
          <h2 id="jy-stay-h">Where you’ll stay</h2>
        </div>
        <p className="say">
          Handpicked luxury properties, selected for their character, outstanding hospitality, and
          sense of place.
        </p>
      </div>
      <ul className="hgrid">
        {hotels.map((h) => (
          <li key={h.name} className="hcard">
            <div className="ph">
              {h.img && (
                <Image
                  className="fill"
                  src={h.img}
                  alt={h.alt}
                  fill
                  sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
                />
              )}
              <span className="pill">
                {h.place}
                {h.nights ? ` · ${h.nights} ${h.nights === 1 ? 'night' : 'nights'}` : ''}
              </span>
            </div>
            <div className="hb">
              <h3>{h.name}</h3>
              {h.unconfirmed && <p className="tbc">[Marc to confirm]</p>}
              {h.url && (
                <a href={h.url} target="_blank" rel="noopener noreferrer">
                  Visit hotel website <span aria-hidden>↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -- 5. Dates & rates ---------------------------------------------------------- */

export function JyDates({ journey }: { journey: Journey }) {
  const x = journey.flyer?.extension;
  return (
    <section className="jy dep" id="dates" aria-labelledby="jy-dep-h">
      <div className="dep-main">
        <p className="lab">Dates &amp; rates</p>
        <h2 id="jy-dep-h">Dates and rates</h2>
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">Departure</th>
              <th scope="col">Length</th>
              <th scope="col">Group</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Request details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="big" data-k="Departure">
                {journey.departureWindow}
              </td>
              <td data-k="Length">
                {journey.days} days · {nightsOf(journey)} nights
              </td>
              <td data-k="Group">{site.groupSize}</td>
              <td data-k="Status">
                <span className="status">
                  <i />
                  {statusOf(journey)}
                </span>
              </td>
              <td className="act">
                <a className="btn btn-outline" href={requestHref(journey)}>
                  Request details
                </a>
              </td>
            </tr>
          </tbody>
        </table>
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
        <p className="lab">From</p>
        <p className="price">{journey.priceFrom ?? RATES_TBA}</p>
        {journey.priceFrom && <p className="sm">per person, sharing a double room</p>}
        <p className="sm">Single supplement: to be announced</p>
        {x && (
          <div className="with">
            <p className="lab">With {x.title}</p>
            <p>{x.combo}: rates to be announced</p>
          </div>
        )}
        <a className="btn btn-blue" href={requestHref(journey)}>
          Request details <Arrow />
        </a>
        <a className="btn btn-line" href={`mailto:${site.email}`}>
          Connect with our team
        </a>
        <p className="fine">
          International flights are not included. Full inclusions and booking terms are listed
          below.
        </p>
      </aside>
    </section>
  );
}
