import { placePhotos } from '@/components/journeys/placePhotos';
import { flipbook, journeyTint, statusLabel } from '@/lib/data/flipbook';
import { fromPriceLabel } from '@/lib/journeyPrice';
import { DATES_TBA, type Journey } from '@/lib/journeys';

/**
 * One journey as a card, the same on the Journeys page (The Collection) and
 * under a journey's own page (More to discover). Plain data, built on the
 * server from the full journey, so the itineraries never reach the browser.
 */
export type CollectionCardData = {
  slug: string;
  title: string;
  /** The countries, as the card's corner label reads them: "Switzerland & Italy". */
  region: string;
  tagline: string;
  blurb: string;
  /** The destinations it counts under, for the filter. */
  dest: string[];
  inspire: string[];
  days?: number;
  /** The months it departs in, earliest first; empty until the dates are set. */
  when: { ym: string; label: string }[];
  /** The places on the route, in order, each once: the card’s Itinerary line. */
  stops: string[];
  /** The pills: the length and, once Marc sets it, the departure (a date or a year). */
  facts: string[];
  /** The price line, from fromPriceLabel(): "From $12,400 per person" or "Rates to be announced". */
  price: string;
  status: string;
  soon?: boolean;
  tint: string;
  /** The photographs to browse on the card, the lead one first. */
  imgs: { src: string; alt: string }[];
};

/* Each card's photographs (notes of 5 November 2026): real photographs of
   places the journey visits, the client's own first where we have them. */
const cardPhotos: Record<string, { src: string; alt: string }[]> = {
  'swiss-elegance': ['Lucerne', 'Zermatt', 'Grindelwald', 'Montreux', 'Stresa'].map(
    (p) => placePhotos[p],
  ),
  'the-italian-experience': [
    {
      src: '/images/ie-hero.jpg',
      alt: 'The Scaliger Castle at Sirmione rising from the clear water of Lake Garda',
    },
    ...['Venice', 'Bologna', 'Verona', 'Motor Valley'].map((p) => placePhotos[p]),
  ],
  'adriatic-collection': ['Dubrovnik', 'Hvar', 'Rovinj', 'Split', 'Venice'].map(
    (p) => placePhotos[p],
  ),
};

/** A departure month, '2027-06', as the Month filter names it: "June 2027". */
const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * The months a journey departs in: the starts of its dated departures, the
 * months Marc lists, and the month of its first departure, each once and
 * earliest first.
 */
function departureMonths(j: Journey) {
  const months = [
    ...(j.departures ?? []).map((d) => d.start.slice(0, 7)),
    ...(j.departureMonths ?? []),
    ...(j.departureISO ? [j.departureISO.slice(0, 7)] : []),
  ];
  return Array.from(new Set(months))
    .filter((ym) => /^\d{4}-(0[1-9]|1[0-2])$/.test(ym))
    .sort()
    .map((ym) => ({ ym, label: monthLabel(ym) }));
}

/** A journey as its card shows it. */
export function toCollectionCard(j: Journey): CollectionCardData {
  const book = flipbook[j.slug];
  return {
    slug: j.slug,
    title: book?.title ?? j.title,
    region: j.country,
    tagline: book?.tagline ?? j.lead,
    blurb: j.blurb,
    dest: j.country.split(' & '),
    inspire: j.inspire,
    days: j.days,
    when: departureMonths(j),
    // Each place on the route once, in the order the journey reaches it.
    stops: Array.from(new Set((j.route ?? []).map((s) => s.name))),
    // The pills (chat notes of 9 November 2026): the days, then the departure
    // (a date or just a year) once Marc sets it. The price has its own line.
    facts: [`${j.days} days`, ...(j.departure && j.departure !== DATES_TBA ? [j.departure] : [])],
    price: fromPriceLabel(j),
    status: statusLabel[j.status ?? 'open'] ?? 'Now booking',
    tint: journeyTint[j.slug] ?? '#1d4a66',
    imgs: (cardPhotos[j.slug] ?? []).filter(Boolean),
  };
}
