import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import type { Journey, JourneyFlyer, JourneySummary } from '@/lib/content';
import { flipbook, journeyTint, statusLabel } from '@/lib/data/flipbook';
import { RATES_TBA } from '@/lib/journeys';
import { getMedia, type MediaKey } from '@/lib/media';
import { PlacePicker, type PickerPlace } from './PlacePicker';
import './journey-editorial.css';

/*
 * A journey's page after the design sample "Journey page" (Amalfi, Slowly):
 * a full-bleed hero with the facts along its foot, the journey in a line and
 * a ribbon of its places, the places one at a time, where you stay, the
 * departures on a dark table, what is included, and more journeys. Scoped to
 * `.jy`. Copy is Marc's own (the flyer and flipbook); nothing here adds facts.
 */

const titleOf = (j: { slug: string; title: string }) => flipbook[j.slug]?.title ?? j.title;

/** A title with its second half in italic: after the first comma, else its last word. */
function splitTitle(title: string): [string, string] {
  const comma = title.indexOf(',');
  if (comma > 0) return [title.slice(0, comma + 1), title.slice(comma + 1).trim()];
  const words = title.split(' ');
  if (words.length < 2) return [title, ''];
  return [words.slice(0, -1).join(' '), words[words.length - 1]];
}

function src(key?: MediaKey) {
  if (!key) return undefined;
  return getMedia(key).src ?? undefined;
}

/* -- 1. Hero ----------------------------------------------------------------- */

export function JyHero({ journey }: { journey: Journey }) {
  const media = getMedia(journey.detail?.heroMedia ?? journey.heroMedia ?? journey.listMedia);
  const [first, second] = splitTitle(titleOf(journey));
  const tagline = flipbook[journey.slug]?.tagline ?? journey.lead;
  const status = statusLabel[journey.status ?? 'open'] ?? 'Departed';

  const facts: { k: string; v: string; live?: boolean }[] = [
    { k: 'Days', v: `${journey.days} days · ${journey.days - 1} nights` },
    { k: 'Departure', v: journey.departureWindow },
    { k: 'Group', v: `Max. ${journey.groupMax} guests` },
    { k: 'From', v: journey.priceFrom ? `${journey.priceFrom} per person` : RATES_TBA },
    { k: 'Status', v: status, live: true },
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
        <h1 id="jy-h1">
          {first}
          {second && <em>{second}</em>}
        </h1>
        <p className="tag">{tagline}</p>
        <div className="hero-ctas">
          <a className="btn btn-blue" href="#enquire">
            Reserve your place <Arrow />
          </a>
          <a className="btn btn-line" href="#itinerary">
            The places
          </a>
          <a className="btn btn-line" href="#dates">
            Dates &amp; rates
          </a>
        </div>
      </div>
      <dl className="facts">
        {facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd className={f.live ? 'live' : undefined}>
              {f.live && <i aria-hidden />}
              {f.v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -- 2. The journey, in a line, and the ribbon of its places ----------------- */

export function JyIntro({ journey, flyer }: { journey: Journey; flyer: JourneyFlyer }) {
  const stays = flyer.parts.flatMap((p) => p.stays);
  const nights = stays.reduce((sum, s) => sum + (s.nights ?? 0), 0);
  const tagline = flipbook[journey.slug]?.tagline ?? journey.lead;
  const places = stays.map((s) => s.place);

  return (
    <>
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
              <b>{stays.length}</b>
              <span>Places</span>
            </li>
            <li>
              <b>{nights || journey.days - 1}</b>
              <span>Nights</span>
            </li>
            <li>
              <b>{journey.groupMax}</b>
              <span>Guests at most</span>
            </li>
          </ul>
          <div className="row">
            <a className="btn btn-ink" href="#itinerary">
              The places <Arrow />
            </a>
            <a className="tlink" href="#enquire">
              Reserve your place →
            </a>
          </div>
        </div>
      </section>
      <div className="jy marq" aria-hidden>
        <div className="mtrack">
          {[...places, ...places, ...places].map((p, i) => (
            <span key={i}>
              {p}
              <b>·</b>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* -- 3. The places, one at a time --------------------------------------------- */

export function JyPlaces({ flyer }: { flyer: JourneyFlyer }) {
  const places: PickerPlace[] = flyer.parts.flatMap((part) =>
    part.stays.map((s) => {
      const m = s.media ? getMedia(s.media) : undefined;
      return {
        name: s.place,
        nights: s.nights,
        part: part.title,
        tagline: s.tagline,
        doing: s.doing,
        img: m?.src ?? undefined,
        alt: m?.alt ?? s.place,
      };
    }),
  );
  const title =
    places.length === 1 ? 'One place, slowly.' : `${places.length} places, one journey.`;
  return <PlacePicker places={places} title={title} />;
}

/* -- 4. Where you stay ---------------------------------------------------------- */

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
          <p className="lab">Where you stay</p>
          <h2 id="jy-stay-h">
            Hotels chosen because you will want to stay in.
          </h2>
        </div>
        <a className="tlink" href="#enquire">
          Ask about the rooms →
        </a>
      </div>
      <ul className="hgrid">
        {hotels.map((h) => (
          <li key={h.name} className="hc" tabIndex={0}>
            {h.img && (
              <Image
                className="fill"
                src={h.img}
                alt={h.alt}
                fill
                sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
              />
            )}
            <span className="hs" aria-hidden />
            <div className="hb">
              <p className="lab">{h.place}</p>
              <h3>{h.name}</h3>
            </div>
            <div className="sheet">
              <p className="lab">{h.place}</p>
              <h3>{h.name}</h3>
              {h.nights ? (
                <p>
                  {h.nights} {h.nights === 1 ? 'night' : 'nights'} in {h.place}.
                </p>
              ) : null}
              {h.url && (
                <a className="tlink" href={h.url} target="_blank" rel="noopener noreferrer">
                  See the hotel →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="hint">Hover or tap a hotel to read more</p>
    </section>
  );
}

/* -- 5. Departures & rates, on the dark ------------------------------------------ */

export function JyDates({ journey, cta }: { journey: Journey; cta: string }) {
  const status = statusLabel[journey.status ?? 'open'] ?? 'Departed';
  return (
    <section className="jy dep" id="dates" aria-labelledby="jy-dep-h">
      <div className="head">
        <div>
          <p className="lab">Departures &amp; rates</p>
          <h2 id="jy-dep-h">Choose your dates.</h2>
        </div>
        <Link className="tlink" href="/plan#private">
          Prefer your own dates? →
        </Link>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th scope="col">Dates</th>
            <th scope="col">Length</th>
            <th scope="col">Price per person</th>
            <th scope="col">Group</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Reserve</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="big" data-k="Dates">
              {journey.departureWindow}
            </td>
            <td data-k="Length">
              {journey.days} days · {journey.days - 1} nights
            </td>
            <td className="big" data-k="Price per person">
              {journey.priceFrom ?? RATES_TBA}
              {journey.flyer?.ratesNote && <small>{journey.flyer.ratesNote}</small>}
            </td>
            <td data-k="Group">Max. {journey.groupMax} guests</td>
            <td data-k="Status">
              <span className="status">
                <i />
                {status}
              </span>
            </td>
            <td className="act">
              <a className="btn btn-blue" href="#enquire">
                {cta}
              </a>
            </td>
          </tr>
          <tr>
            <td className="big" data-k="Dates">
              Your own dates
            </td>
            <td data-k="Length">As you wish</td>
            <td data-k="Price per person">On request</td>
            <td data-k="Group">Private journey</td>
            <td data-k="Status">
              <span className="status priv">
                <i />
                Designed for you
              </span>
            </td>
            <td className="act">
              <Link className="btn btn-line" href="/plan#private">
                Speak to us
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        Rates are per person, in US dollars. The same journey can be arranged privately on your own dates.
      </p>
    </section>
  );
}

/* -- 6. What's included ----------------------------------------------------------- */

/** A mark for each line of the Peaks2Shores Experience, by its first word. */
const incIcons: [RegExp, React.ReactNode][] = [
  [
    /group/i,
    <>
      <circle cx="12" cy="7.4" r="2.7" />
      <path d="M7 19.5a5 5 0 0 1 10 0" />
      <circle cx="5" cy="9.7" r="2.1" />
      <path d="M1.5 18.3a3.7 3.7 0 0 1 5.2-3.4" />
      <circle cx="19" cy="9.7" r="2.1" />
      <path d="M22.5 18.3a3.7 3.7 0 0 0-5.2-3.4" />
    </>,
  ],
  [
    /transfer/i,
    <>
      <path d="M3 15.5V12l2-5h14l2 5v3.5" />
      <path d="M3 15.5h18v2.5H3z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
      <path d="M5.5 12h13" />
    </>,
  ],
  [
    /guid/i,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.6 8.4l-2.3 4.9-4.9 2.3 2.3-4.9z" />
    </>,
  ],
  [
    /hotel/i,
    <>
      <path d="M3 20V6h11v14M14 10h7v10" />
      <path d="M6 9.5h2M10 9.5h1M6 13h2M10 13h1M17 13.5h1M17 16.5h1M7.5 20v-3h3v3" />
    </>,
  ],
  [
    /food|wine/i,
    <>
      <path d="M8 3h8l-.6 5.2A3.4 3.4 0 0 1 12 11.2a3.4 3.4 0 0 1-3.4-3L8 3z" />
      <path d="M12 11.2V20M8.5 20.5h7" />
    </>,
  ],
  [
    /experience|curated/i,
    <>
      <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
    </>,
  ],
];

export function JyIncluded({ flyer }: { flyer: JourneyFlyer }) {
  return (
    <section className="jy inc" aria-labelledby="jy-inc-h">
      <p className="lab">The Peaks2Shores Experience</p>
      <h2 id="jy-inc-h">What’s included</h2>
      <ul className="icards">
        {flyer.included.map((item) => {
          const icon = incIcons.find(([re]) => re.test(item))?.[1] ?? incIcons[5][1];
          return (
            <li key={item} className="icard">
              <span className="ico" aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icon}
                </svg>
              </span>
              <h3>{item}</h3>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* -- 7. More journeys --------------------------------------------------------------- */

export function JyMore({ journeys }: { journeys: JourneySummary[] }) {
  if (journeys.length === 0) return null;
  return (
    <section className="jy more" aria-labelledby="jy-more-h">
      <div className="head">
        <div>
          <p className="lab">Also on the list</p>
          <h2 id="jy-more-h">More small-group journeys.</h2>
        </div>
        <Link className="tlink" href="/journeys">
          All journeys →
        </Link>
      </div>
      <ul className="mgrid">
        {journeys.map((j) => {
          const img = src(j.listMedia) ?? src(j.cardMedia);
          return (
            <li key={j.slug}>
              <Link
                className="mc"
                href={`/journeys/${j.slug}`}
                style={{ ['--tint' as string]: journeyTint[j.slug] ?? '#1d4a66' }}
              >
                {img && (
                  <Image
                    className="fill"
                    src={img}
                    alt=""
                    fill
                    sizes="(min-width: 900px) 33vw, 100vw"
                  />
                )}
                <span className="ms" aria-hidden />
                <span className="mb">
                  <span className="lab">{j.country}</span>
                  <h3>{titleOf(j)}</h3>
                  <span className="mm">
                    {j.days} days · Small group · Max. {j.groupMax} guests
                  </span>
                  <span className="go">
                    View the journey <Arrow />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
