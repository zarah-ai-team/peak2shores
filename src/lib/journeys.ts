import type { MediaKey } from './media';

/**
 * The journey catalog.
 *
 * The launch journeys, as Marc's flyers describe them (`flyer`). Nothing has
 * been invented: dates and rates Marc has not set yet read as "to be
 * announced". The older shapes (`detail`, a day-by-day write-up, and
 * `itinerary`, a working plan) still render for any journey that uses them.
 */

/** What a journey shows until Marc sets its departure dates. */
export const DATES_TBA = 'Dates to be announced';

/** What a journey shows until Marc sets its rate. */
export const RATES_TBA = 'Rates to be announced';

export type Season = 'Summer' | 'Autumn' | 'Winter';
export type Party = 'Couples' | 'Friends' | 'Families' | 'Solo';
export type Inspiration =
  | 'Culture'
  | 'Food & Wine'
  | 'Nature'
  | 'Wellness'
  | 'Art & Design'
  | 'Coast & Islands'
  | 'Mountains & Lakes';

export type ItineraryDay = {
  n: number;
  where: string;
  title: string;
  body: string;
  stay: string;
  free: string;
  media: MediaKey;
};

export type Hotel = {
  name: string;
  place: string;
  nights?: string;
  why: string;
  detail: string;
  nearby?: string;
  media: MediaKey;
};

/** How a leg of the route is traveled, which sets how its line is drawn. */
export type RouteMode = 'road' | 'rail' | 'boat';

/**
 * One place on a journey's route map, in the order the journey reaches it.
 * A stop that repeats an earlier name (the return to the arrival city) draws
 * its leg but adds no second marker.
 */
export type RouteStop = {
  name: string;
  /** [longitude, latitude]. */
  coords: [number, number];
  /** How the leg into this stop is traveled. Defaults to road. */
  by?: RouteMode;
  /**
   * Text that finds this stop's days in the itinerary's `where` lines, when
   * the name alone does not (e.g. 'Peninsula' for Cape Point). Defaults to
   * the name.
   */
  match?: string;
};

export type JourneyDetail = {
  heroMedia: MediaKey;
  overviewHeadline: string;
  overview: string[];
  why: {
    headline: string;
    media: MediaKey;
    highlights: { n: string; title: string; body: string }[];
  };
  itineraryHeadline: string;
  days: ItineraryDay[];
  hotelsHeadline: string;
  hotels: Hotel[];
  pacing: {
    media: MediaKey;
    headline: string;
    body: string;
    stats: { value: string; label: string }[];
  };
  included: { label: string; value: string }[];
  notIncluded: string;
  marc: { quote: string; note: string; role: string };
  gallery: { media: MediaKey; span: 'wide' | 'single'; height: 'tall' | 'short' }[];
  /**
   * Guest words. Shown only when `verified: true` — a real guest, quoted with
   * permission. None is verified yet, so the provider returns none and the
   * Guests section does not render. Default (absent) is unverified.
   */
  quotes: { text: string; who: string; verified?: boolean }[];
  spotsLeft: number;
};

/** One stay on a flyer itinerary, or a stop along the way (no nights). */
export type FlyerStay = {
  place: string;
  nights?: number;
  tagline: string;
  /** "What you'll do": three lines from the flyer. */
  doing: string[];
  /** "A Peaks2Shores moment", where the flyer has one. */
  moment?: string;
  media?: MediaKey;
};

/**
 * A journey as Marc's flyer describes it: the stays grouped into parts, the
 * hotels, and what every journey includes. Copy is Marc's own wording.
 */
export type JourneyFlyer = {
  included: string[];
  /** Shown only once Marc has approved the wording. */
  marcNote?: { quote: string; approved: boolean };
  parts: { title?: string; subtitle?: string; stays: FlyerStay[] }[];
  hotels: { place: string; name: string; url?: string; credit?: string }[];
  /** A box pointing to the journey this one continues into, or follows. */
  link?: {
    kicker: string;
    slug: string;
    title: string;
    places: string;
    text: string;
    cta: string;
  };
  /** A line under the rate, e.g. the price with the extension. */
  ratesNote?: string;
  /** Questions for this journey only, after the shared FAQ. */
  faq?: { question: string; answer: string }[];
};

/**
 * Where a journey stands for booking. A journey is never deleted: once it is
 * full or has departed it keeps its page, marked, so links and search rankings
 * survive.
 */
export type JourneyStatus = 'open' | 'waitlist' | 'sold-out' | 'past';

export type Journey = {
  slug: string;
  /**
   * When the journey is released (ISO 8601 with offset, e.g.
   * '2026-11-01T09:00:00-05:00'). Until then it exists nowhere on the site —
   * not in lists, navigation, the sitemap or llms.txt, and its address is a
   * 404. Pages rebuild hourly, so it appears within the hour of this time.
   * Omit for a journey that is already live.
   */
  publishAt?: string;
  /** Booking state. Defaults to open. */
  status?: JourneyStatus;
  n: string;
  title: string;
  /** The line above the title on the journey page. Falls back to region · country. */
  eyebrow?: string;
  lead: string;
  blurb: string;
  country: string;
  region: string;
  /** Where the journey sits on the globe: [longitude, latitude]. */
  coords: [number, number];
  /**
   * The places the journey visits, in order, for the route map on its page.
   * Without one the map shows a single pin at `coords`.
   */
  route?: RouteStop[];
  days: number;
  /** Short form used in list metadata. */
  departure: string;
  /** Long form used on the detail page and in structured data. */
  departureWindow: string;
  /** First departure date. Absent until Marc sets the dates. */
  departureISO?: string;
  group: string;
  groupMax: number;
  /** e.g. '$12,400'. Absent until Marc sets the rate. */
  priceFrom?: string;
  hostedByMarc: boolean;
  season?: Season;
  who: Party[];
  inspire: Inspiration[];
  tags: string[];
  listMedia: MediaKey;
  cardMedia: MediaKey;
  /**
   * The detail page's opening photograph, when the journey has no full
   * write-up. Kept apart from `listMedia` so the page does not open on the
   * photograph the reader just clicked. Falls back to `listMedia`.
   */
  heroMedia?: MediaKey;
  /** The photograph on one-off promotions (the Instagram links page). Falls back to `cardMedia`. */
  promoMedia?: MediaKey;
  featured: boolean;
  /** Search title and description, when the page should not derive its own. */
  seo?: { title: string; description: string };
  flyer?: JourneyFlyer;
  detail?: JourneyDetail;
  /**
   * The working day-by-day for a journey whose full write-up (hotels, pacing,
   * inclusions) is still being confirmed. Rendered above the inquiry form on
   * the in-preparation page.
   */
  itineraryHeadline?: string;
  itinerary?: ItineraryDay[];
};

/** The Peaks2Shores Experience: what every journey includes (launch brief). */
const experience = [
  'Intimate groups (max. 18 guests)',
  'Private transfers',
  'Private guiding',
  'Exceptional hotels',
  'Authentic food & wine',
  'Curated experiences',
];

const combineFaq = {
  question: 'Can I combine Swiss Elegance with Italy Uncovered?',
  answer:
    'Yes. Italy Uncovered continues from Milan for 8 nights, or can be booked as a journey of its own.',
};

/*
 * The launch journeys, worded as in Marc's flyers (Oct 28) via the launch
 * brief. Departure dates and prices come from Marc and are not set yet: until
 * they are, the pages say "Dates to be announced" and "Rates to be announced"
 * rather than guess. No departure is marked "Hosted by Marc" until he confirms
 * which ones he hosts.
 */
const allJourneys: Journey[] = [
  {
    slug: 'swiss-elegance',
    n: 'No. 01',
    title: 'Swiss Elegance, Italian Lakes & Milanese Flair',
    eyebrow: 'Switzerland & the Italian Lakes',
    lead: 'From Lucerne to Milan',
    blurb:
      'From storybook Swiss villages and the high Alps to the shimmering Italian Lakes, ending in stylish Milan. Fewer places, more time to truly be there.',
    country: 'Switzerland & Italy',
    region: 'Lucerne to Milan',
    coords: [8.31, 47.05],
    route: [
      { name: 'Lucerne', coords: [8.309, 47.05] },
      { name: 'Grindelwald', coords: [8.041, 46.624] },
      { name: 'Montreux', coords: [6.911, 46.431] },
      { name: 'Zermatt', coords: [7.749, 46.02] },
      { name: 'Stresa', coords: [8.538, 45.884] },
      { name: 'Milan', coords: [9.19, 45.464] },
    ],
    days: 13,
    departure: DATES_TBA,
    departureWindow: DATES_TBA,
    group: 'Max. 18 guests',
    groupMax: 18,
    hostedByMarc: false,
    who: [],
    inspire: ['Mountains & Lakes', 'Culture', 'Food & Wine'],
    tags: ['Mountains & Lakes', 'Culture'],
    listMedia: 'se-list',
    cardMedia: 'se-card',
    heroMedia: 'se-hero',
    featured: true,
    seo: {
      title: 'Swiss Elegance, Italian Lakes & Milanese Flair',
      description:
        '13 days from Lucerne to Milan for no more than 18 guests: Swiss lakes and Alps, Lake Maggiore and Milan, with an optional 8-night Italian extension.',
    },
    flyer: {
      included: experience,
      marcNote: {
        quote:
          'Switzerland is where my own journey began. Sharing its lakes and mountains, and then the effortless charm of the Italian Lakes and Milan, is one of my greatest joys.',
        approved: false,
      },
      parts: [
        {
          title: 'The magic of Switzerland',
          subtitle: 'Enchanting Lakes, Majestic Alpine Peaks',
          stays: [
            {
              place: 'Lucerne',
              nights: 3,
              tagline: 'Where lakeside elegance meets Alpine beauty.',
              doing: [
                'Wander Lucerne’s charming Old Town and cross its iconic Chapel Bridge.',
                'Cruise across Lake Lucerne, surrounded by sweeping mountain scenery.',
                'Discover the “Queen of the Mountains,” Mount Rigi, and experience Switzerland’s spectacular Alpine panoramas.',
              ],
              media: 'se-lucerne',
            },
            {
              place: 'Grindelwald',
              nights: 2,
              tagline: 'An Alpine retreat beneath the legendary Eiger.',
              doing: [
                'Discover Grindelwald’s picturesque mountain village and spectacular Alpine setting.',
                'Ascend into the Swiss Alps aboard legendary mountain railways and cable cars.',
                'Experience dramatic mountain scenery, scenic walks and unforgettable Alpine adventures.',
              ],
              media: 'se-grindelwald',
            },
            {
              place: 'Montreux',
              nights: 1,
              tagline: 'Timeless elegance along the Swiss Riviera.',
              doing: [
                'Stroll Montreux’s beautiful flower-lined promenade overlooking Lake Geneva.',
                'Discover the UNESCO-listed Lavaux vineyards and savor exceptional Swiss wines.',
                'Enjoy the relaxed charm and spectacular scenery of the Swiss Riviera.',
              ],
              media: 'se-montreux',
            },
            {
              place: 'Zermatt',
              nights: 2,
              tagline: 'Alpine luxury in the shadow of the Matterhorn.',
              doing: [
                'Discover Zermatt’s charming car-free village beneath Switzerland’s most iconic mountain.',
                'Journey into the high Alps for spectacular Matterhorn views and unforgettable panoramas.',
                'Savor exceptional Alpine dining and the timeless atmosphere of this legendary mountain resort.',
              ],
              media: 'se-zermatt',
            },
          ],
        },
        {
          title: 'The Italian Lakes & Milan',
          subtitle: 'La Dolce Vita & Stylish Milan Finale',
          stays: [
            {
              place: 'Stresa & Lake Maggiore',
              nights: 2,
              tagline: 'La dolce vita on the shores of Lake Maggiore.',
              doing: [
                'Cruise across Lake Maggiore to discover the magnificent Borromean Islands and their palace gardens.',
                'Explore charming lakeside villages, elegant villas and spectacular Alpine scenery.',
                'Embrace the Italian lakeside lifestyle, with leisurely lunches and time to unwind.',
              ],
              media: 'se-stresa',
            },
            {
              place: 'Milan',
              nights: 2,
              tagline: 'Where Italian elegance meets cosmopolitan flair.',
              doing: [
                'Discover Milan’s magnificent Duomo and the historic treasures of Italy’s fashion capital.',
                'Explore elegant boutiques, stylish neighborhoods and the city’s vibrant cultural scene.',
                'Celebrate the journey with a memorable farewell evening in the heart of Milan.',
              ],
              media: 'se-milan',
            },
          ],
        },
      ],
      // Zermatt: Marc to confirm the hotel.
      hotels: [
        { place: 'Lucerne', name: 'Mandarin Oriental Palace, Luzern' },
        { place: 'Grindelwald', name: 'Hotel Bergwelt Grindelwald' },
        { place: 'Montreux', name: 'Fairmont Le Montreux Palace' },
        { place: 'Zermatt', name: 'Grand Hotel Zermatterhof' },
        { place: 'Stresa', name: 'Hotel La Palma' },
        { place: 'Milan', name: 'Palazzo Cordusio Gran Meliá' },
      ],
      link: {
        kicker: 'Optional 8-Night Italian Extension',
        slug: 'the-italian-experience',
        title: 'Italy Uncovered: Emilia-Romagna, Lake Garda & Venice',
        places: 'Bologna, Motor Valley, Lake Garda and Venice',
        text: 'Continue from Milan into Bologna’s culinary traditions, Italy’s supercar heritage, Lake Garda and a Venetian finale. Also available as a journey on its own.',
        cta: 'Explore Italy Uncovered',
      },
      ratesNote: 'Swiss Elegance + Italy Uncovered: rates to be announced.',
      faq: [combineFaq],
    },
  },
  {
    slug: 'the-italian-experience',
    n: 'No. 02',
    title: 'Italy Uncovered: Emilia-Romagna, Lake Garda & Venice',
    eyebrow: 'Optional 8-Night Italian Extension · or a journey on its own',
    lead: 'From Bologna to Venice',
    blurb:
      'Bologna’s culinary traditions, Italy’s supercar heritage, the villages of Lake Garda and a Venetian finale. Join it after Swiss Elegance, or travel it as a journey of its own.',
    country: 'Italy',
    region: 'Bologna to Venice',
    coords: [11.34, 44.49],
    route: [
      { name: 'Bologna', coords: [11.343, 44.494] },
      { name: 'Motor Valley', coords: [10.866, 44.525] },
      { name: 'Lake Garda', coords: [10.735, 45.505] },
      { name: 'Verona', coords: [10.992, 45.438] },
      { name: 'Venice', coords: [12.316, 45.44] },
    ],
    days: 9,
    departure: DATES_TBA,
    departureWindow: DATES_TBA,
    group: 'Max. 18 guests',
    groupMax: 18,
    hostedByMarc: false,
    who: [],
    inspire: ['Food & Wine', 'Culture', 'Art & Design'],
    tags: ['Food & Wine', 'Culture'],
    listMedia: 'ie-list',
    cardMedia: 'ie-card',
    heroMedia: 'ie-hero',
    featured: true,
    seo: {
      title: 'Italy Uncovered: Emilia-Romagna, Lake Garda & Venice',
      description:
        '9 days through Bologna, Motor Valley, Lake Garda and Venice for no more than 18 guests, on its own or after Swiss Elegance.',
    },
    flyer: {
      included: experience,
      parts: [
        {
          stays: [
            {
              place: 'Bologna & Emilia-Romagna',
              nights: 3,
              tagline: 'Where Italian craftsmanship meets extraordinary culinary traditions.',
              doing: [
                'Explore Bologna’s medieval streets and a private leather workshop.',
                'Savor Parmigiano Reggiano, Parma ham and Modena’s balsamic vinegar.',
                'Enjoy Ferrari driving thrills or exclusive Pagani discoveries.',
              ],
              media: 'ie-bologna',
            },
            {
              place: 'Lake Garda',
              nights: 2,
              tagline: 'Lakeside romance, timeless villages and la dolce vita.',
              doing: [
                'Discover romantic Sirmione on a guided walk and lake cruise.',
                'Explore Lake Garda’s picturesque villages and waterfronts.',
                'Unwind amid sweeping lake views and luxurious wellness.',
              ],
              media: 'ie-garda',
            },
            {
              place: 'Venice',
              nights: 3,
              tagline: 'Venetian romance, timeless traditions and unforgettable moments.',
              doing: [
                'Arrive by private water taxi at your island retreat.',
                'Meet master gondola makers and enjoy an iconic gondola ride.',
                'Savor local wines and cicchetti on a traditional bacari tour.',
              ],
              media: 'ie-venice',
            },
          ],
        },
        {
          title: 'Along the way',
          stays: [
            {
              place: 'Motor Valley',
              tagline: 'Italy’s legendary automotive heritage, from Ferrari to Pagani.',
              doing: [
                'Discover the birthplace of Italy’s iconic supercars and the craftsmanship behind them.',
                'Explore Ferrari’s legendary heritage and racing excellence at its museum.',
                'Discover the artistry of Pagani, where innovation meets extraordinary design.',
              ],
            },
            {
              place: 'Valpolicella & Verona',
              tagline: 'Fine wines, timeless romance and Italian charm.',
              doing: [
                'Taste celebrated Amarone wines at historic Valpolicella estates.',
                'Savor an exceptional wine-paired lunch overlooking the vineyards.',
                'Explore romantic Verona, from its Roman Arena to Juliet’s home.',
              ],
            },
          ],
        },
      ],
      hotels: [
        { place: 'Bologna', name: 'Grand Hotel Majestic già Baglioni' },
        { place: 'Lake Garda', name: 'Quellenhof Luxury Resort Lazise' },
        { place: 'Venice', name: 'JW Marriott Venice Resort & Spa' },
      ],
      link: {
        kicker: 'Before this journey',
        slug: 'swiss-elegance',
        title: 'Swiss Elegance, Italian Lakes & Milanese Flair',
        places: 'Lucerne, Grindelwald, Montreux, Zermatt, Stresa and Milan',
        text: 'From storybook Swiss villages and the high Alps to the shimmering Italian Lakes, ending in stylish Milan.',
        cta: 'Begin with Swiss Elegance, Italian Lakes & Milanese Flair',
      },
      ratesNote: 'On its own, or added to Swiss Elegance: rates for both to be announced.',
      faq: [combineFaq],
    },
  },
  {
    slug: 'adriatic-collection',
    n: 'No. 03',
    title: 'The Adriatic Collection',
    eyebrow: 'Italy, Istria and the Dalmatian Coast',
    lead: 'Venice to Dubrovnik',
    blurb:
      'From Venice’s enchanting canals through Istria’s coastal charm and the sun-kissed Dalmatian Coast to the timeless beauty of Dubrovnik.',
    country: 'Italy & Croatia',
    region: 'Venice to Dubrovnik',
    coords: [15.97, 43.51],
    route: [
      { name: 'Venice', coords: [12.316, 45.44] },
      { name: 'Rovinj', coords: [13.638, 45.081] },
      { name: 'Split', coords: [16.44, 43.508] },
      { name: 'Hvar', coords: [16.441, 43.172], by: 'boat' },
      { name: 'Split', coords: [16.44, 43.508], by: 'boat' },
      { name: 'Dubrovnik', coords: [18.094, 42.65] },
    ],
    days: 11,
    departure: DATES_TBA,
    departureWindow: DATES_TBA,
    group: 'Max. 18 guests',
    groupMax: 18,
    hostedByMarc: false,
    who: [],
    inspire: ['Coast & Islands', 'Culture', 'Food & Wine'],
    tags: ['Coast & Islands', 'Culture'],
    listMedia: 'ac-list',
    cardMedia: 'ac-card',
    heroMedia: 'ac-hero',
    featured: true,
    seo: {
      title: 'The Adriatic Collection: Venice to Dubrovnik',
      description:
        'An 11-day small luxury group journey from Venice to Dubrovnik through Istria and the Dalmatian Coast, for no more than 18 guests.',
    },
    flyer: {
      included: experience,
      marcNote: {
        quote:
          'The Adriatic has a light and a rhythm unlike anywhere else. From Venice’s canals to Dubrovnik’s ancient walls, this journey is about slowing down and living the coast.',
        approved: false,
      },
      parts: [
        {
          title: 'Venice & Istria',
          subtitle: 'Venetian Romance, Istrian Coastal & Countryside Charm',
          stays: [
            {
              place: 'Venice',
              nights: 2,
              tagline: 'Discover Venice beyond the ordinary.',
              doing: [
                'Arrive in true Venetian style by private water taxi at your exclusive island retreat.',
                'Discover Venice’s iconic treasures and hidden corners with your private guide.',
                'Step inside a traditional gondola workshop and meet the artisans preserving this centuries-old craft.',
              ],
              media: 'ac-venice',
            },
            {
              place: 'Rovinj & Istria',
              nights: 2,
              tagline: 'Where Adriatic beauty meets Istrian charm.',
              doing: [
                'Wander Rovinj’s romantic cobblestone streets overlooking the Adriatic.',
                'Discover medieval Motovun, perched above Istria’s picturesque countryside.',
                'Savor exceptional Istrian wines during an intimate tasting at a local vineyard.',
              ],
              moment:
                'Join a local truffle hunter and his dog in search of Istria’s prized treasures, followed by a memorable countryside lunch.',
            },
          ],
        },
        {
          title: 'The Dalmatian Coast',
          subtitle: 'The Magic of the Dalmatian Coast',
          stays: [
            {
              place: 'Split & the Dalmatian Coast',
              nights: 3,
              tagline: 'Ancient history meets Adriatic island magic.',
              doing: [
                'Discover the spectacular waterfalls of Krka National Park on a memorable excursion from Split.',
                'Step back 1,700 years exploring Split’s remarkable Diocletian’s Palace.',
                'Set sail on a private speedboat adventure to glamorous Hvar and the stunning Pakleni Islands.',
              ],
            },
            {
              place: 'Dubrovnik',
              nights: 3,
              tagline: 'The timeless jewel of the Adriatic.',
              doing: [
                'Wander Dubrovnik’s UNESCO-listed Old Town and walk its legendary medieval walls.',
                'Raise a glass atop Mount Srđ, with spectacular views over Dubrovnik and the Adriatic.',
                'Enjoy time to explore at your leisure before a memorable farewell dinner within Dubrovnik’s ancient walls.',
              ],
            },
          ],
        },
      ],
      hotels: [
        { place: 'Venice', name: 'JW Marriott Venice Resort & Spa' },
        {
          place: 'Rovinj',
          name: 'Grand Park Hotel Rovinj',
          credit: 'Photo: Maistra Hospitality Group',
        },
        { place: 'Split', name: 'Hotel Ambasador Split' },
        { place: 'Dubrovnik', name: 'Hotel Excelsior Dubrovnik' },
      ],
    },
  },
];

/** How long a newly released journey carries its "New" label. */
const NEW_FOR_DAYS = 30;

/** Released, or never scheduled. */
export function isLive(journey: Journey, now = new Date()) {
  return !journey.publishAt || new Date(journey.publishAt) <= now;
}

/**
 * Every journey visitors may see, as of now. A function rather than a list so
 * a page rebuilt after a journey's release time picks it up.
 */
export function liveJourneys(now = new Date()): Journey[] {
  return allJourneys.filter((journey) => isLive(journey, now));
}

export function featuredJourneys(now = new Date()): Journey[] {
  return liveJourneys(now).filter((journey) => journey.featured);
}

/** Released within the last NEW_FOR_DAYS days. */
export function isNew(journey: Journey, now = new Date()) {
  if (!journey.publishAt) return false;
  const age = now.getTime() - new Date(journey.publishAt).getTime();
  return age >= 0 && age < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
}

/** The short label shown before a journey's place name, if it needs one. */
export function journeyLabel(journey: Pick<Journey, 'status'> & { isNew?: boolean }) {
  switch (journey.status) {
    case 'sold-out':
      return 'Sold out';
    case 'waitlist':
      return 'Waitlist';
    case 'past':
      return 'Departed';
    default:
      return journey.isNew ? 'New' : null;
  }
}

/**
 * What an index card or row needs — and nothing a detail page needs. The
 * journeys list is a client component (it filters), so this is the shape that
 * crosses to the browser; the itineraries, hotel notes and quotes stay on the
 * server.
 */
export type JourneySummary = Pick<
  Journey,
  | 'slug'
  | 'n'
  | 'title'
  | 'lead'
  | 'blurb'
  | 'country'
  | 'region'
  | 'coords'
  | 'days'
  | 'departure'
  | 'departureWindow'
  | 'departureISO'
  | 'group'
  | 'groupMax'
  | 'priceFrom'
  | 'season'
  | 'who'
  | 'inspire'
  | 'tags'
  | 'listMedia'
  | 'cardMedia'
  | 'promoMedia'
  | 'status'
> & { isNew: boolean; stays: JourneyStay[] };

/** One stop of a journey: where we sleep, and for how long. */
export type JourneyStay = { name: string; nights: string };

/**
 * Where a journey sleeps, in order: the flyer's stays, or its hotels once the
 * write-up exists, else the stops of the working day by day (consecutive
 * nights in one place).
 */
export function journeyStays(journey: Journey): JourneyStay[] {
  if (journey.flyer)
    return journey.flyer.parts.flatMap((part) =>
      part.stays
        .filter((s) => s.nights)
        .map((s) => ({
          name: s.place,
          nights: `${s.nights} ${s.nights === 1 ? 'night' : 'nights'}`,
        })),
    );
  if (journey.detail)
    return journey.detail.hotels.map((h) => ({ name: h.name, nights: h.nights ?? '' }));
  const stops: { name: string; nights: number }[] = [];
  for (const day of journey.itinerary ?? []) {
    if (!day.stay || day.stay === '—') continue;
    const last = stops[stops.length - 1];
    if (last && last.name === day.stay) last.nights++;
    else stops.push({ name: day.stay, nights: 1 });
  }
  return stops.map((s) => ({
    name: s.name,
    nights: `${s.nights} ${s.nights === 1 ? 'night' : 'nights'}`,
  }));
}

export function toSummary(journey: Journey): JourneySummary {
  const {
    slug,
    n,
    title,
    lead,
    blurb,
    country,
    region,
    coords,
    days,
    departure,
    departureWindow,
    departureISO,
    group,
    groupMax,
    priceFrom,
    season,
    who,
    inspire,
    tags,
    listMedia,
    cardMedia,
    promoMedia,
    status,
  } = journey;
  return {
    slug,
    n,
    title,
    lead,
    blurb,
    country,
    region,
    coords,
    days,
    departure,
    departureWindow,
    departureISO,
    group,
    groupMax,
    priceFrom,
    season,
    who,
    inspire,
    tags,
    listMedia,
    cardMedia,
    promoMedia,
    status,
    isNew: isNew(journey),
    stays: journeyStays(journey),
  };
}

/** A live journey by its address; unreleased ones do not exist yet. */
export function getJourney(slug: string): Journey | undefined {
  const journey = allJourneys.find((j) => j.slug === slug);
  return journey && isLive(journey) ? journey : undefined;
}

/* -- Filters ------------------------------------------------------------- */

export type FilterKey = 'country' | 'season' | 'who' | 'inspire';

/*
 * With a handful of journeys, destination alone is enough (launch brief).
 * Add 'season' and 'who' groups back once there are more journeys to sort.
 */
export const filterGroups: {
  key: FilterKey;
  label: string;
  options: string[];
  match: (j: JourneySummary, value: string) => boolean;
}[] = [
  {
    key: 'country',
    label: 'Destination',
    options: ['Switzerland', 'Italy', 'Croatia'],
    match: (j, v) => j.country.includes(v),
  },
];

/* -- Content source ------------------------------------------------------ */

/**
 * The whole catalog, unfiltered — scheduled journeys included.
 *
 * Read only by the local content source (`src/lib/content/sources/local.ts`),
 * which hands it to the provider, where the publishing rules are applied in
 * one place. Pages never import this: they call `getJourneys()` and friends
 * from `@/lib/content`.
 */
export const journeyCatalog: readonly Journey[] = allJourneys;

/* -- Related journeys ---------------------------------------------------- */

/**
 * Up to `limit` journeys from `all` most like the one at `slug`: a shared
 * country counts most, then shared inspirations, then the same season. Ties
 * keep catalog order. Departed journeys are left out. Pure — the caller
 * decides which journeys are visible.
 */
export function rankRelated<T extends Journey>(all: readonly T[], slug: string, limit = 3): T[] {
  const self = all.find((j) => j.slug === slug);
  if (!self) return [];
  const countries = new Set(self.country.split(' & '));
  return all
    .filter((j) => j.slug !== slug && j.status !== 'past')
    .map((j, index) => {
      let score = 0;
      if (j.country.split(' & ').some((c) => countries.has(c))) score += 3;
      score += j.inspire.filter((i) => self.inspire.includes(i)).length;
      if (j.season === self.season) score += 1;
      return { j, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(0, limit))
    .map(({ j }) => j);
}

/** Synchronous form for legacy callers. Prefer `getRelatedJourneys` from `@/lib/content`. */
export function relatedJourneys(slug: string, limit = 3, now = new Date()): JourneySummary[] {
  return rankRelated(liveJourneys(now), slug, limit).map(toSummary);
}
