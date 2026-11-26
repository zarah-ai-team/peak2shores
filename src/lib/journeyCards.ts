import { placePhotos } from '@/components/journeys/placePhotos';
import { availabilityText, type DepartureAvailability } from '@/lib/availability';
import { flipbook, journeyTint } from '@/lib/data/flipbook';
import { fromPriceLabel } from '@/lib/journeyPrice';
import { DATES_TBA, journeyAvailabilityOf, type Journey } from '@/lib/journeys';

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
  /**
   * Where it stands for booking, in Marc's words: the best of its departures
   * ("Booking Now", "Guaranteed · Limited Availability", "Sold Out").
   */
  status: string;
  /** The same as data, for a label drawn by its status. */
  availability: DepartureAvailability;
  soon?: boolean;
  tint: string;
  /** The photographs to browse on the card, the lead one first. */
  imgs: CardPhoto[];
};

/**
 * A card's photograph. `pos` is where its crop centres (CSS object-position),
 * for a photograph whose subject is not in its middle.
 */
export type CardPhoto = { src: string; alt: string; pos?: string };

/* Each card's photographs, in the order of Marc's review of 23 November
   2026: real photographs of places the journey visits, the client's own where
   we have them (the journey flyers, the Journey Book, Marc's Drive). Most are
   the place's own (placePhotos); a card that shows another names it here. */
const cardPhotos: Record<string, CardPhoto[]> = {
  // Lucerne, Zermatt's lake and the Matterhorn, the Jungfrau region's train,
  // Montreux, and Isola Bella off Stresa. Montreux keeps Chillon until a Lake
  // Geneva photograph large enough for a card is supplied (the flyer prints
  // its own, the Lavaux vineyards, at 946x458 under its label).
  'swiss-elegance': [
    placePhotos.Lucerne,
    {
      src: '/images/journeys/jy-zermatt-matterhorn-lake.jpg',
      alt: 'The Matterhorn mirrored in a still alpine lake above Zermatt',
    },
    placePhotos.Grindelwald,
    placePhotos.Montreux,
    placePhotos.Stresa,
  ],
  // The route in order. The first photograph was Sirmione's castle on Lake
  // Garda, not Emilia-Romagna: the flyer's Bologna photograph opens the card
  // instead, with the traveler's face kept in the crop.
  'italy-uncovered': [
    {
      src: '/images/home/italian-experience.jpg',
      alt: 'A smiling traveler holding a board of prosciutto and an aperitivo in an Italian salumeria',
      pos: '50% 20%',
    },
    placePhotos['Motor Valley'],
    placePhotos['Lake Garda'],
    placePhotos.Verona,
    placePhotos.Venice,
  ],
  // The route in order, Venice to Dubrovnik. Dubrovnik keeps its walls (its
  // page points at the view from Mount Srđ).
  'adriatic-collection': [
    placePhotos.Venice,
    placePhotos.Rovinj,
    placePhotos.Split,
    placePhotos.Hvar,
    {
      src: '/images/drive/croatia-dubrovnik-old-town-walls.jpg',
      alt: 'Dubrovnik’s walls and the Lovrijenac fortress above clear Adriatic water',
    },
  ],
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
  const availability = journeyAvailabilityOf(j);
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
    status: availabilityText(availability),
    availability,
    tint: journeyTint[j.slug] ?? '#1d4a66',
    imgs: (cardPhotos[j.slug] ?? []).filter(Boolean),
  };
}
