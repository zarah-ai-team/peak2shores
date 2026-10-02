import type { MediaKey } from './media';

/**
 * The journey catalogue.
 *
 * Every fact here comes from the approved design canvas. Nothing has been
 * invented. Only "Amalfi, Slowly" has a written itinerary so far — the other
 * four carry their summary data and render a clearly-marked in-preparation
 * state on their detail page rather than filler.
 */

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
  quotes: { text: string; who: string }[];
  spotsLeft: number;
};

export type Journey = {
  slug: string;
  n: string;
  title: string;
  lead: string;
  blurb: string;
  country: string;
  region: string;
  /** Where the journey sits on the globe: [longitude, latitude]. */
  coords: [number, number];
  days: number;
  /** Short form used in list metadata. */
  departure: string;
  /** Long form used on the detail page and in structured data. */
  departureWindow: string;
  departureISO: string;
  group: string;
  groupMax: number;
  priceFrom: string;
  hostedByMarc: boolean;
  season: Season;
  who: Party[];
  inspire: Inspiration[];
  tags: string[];
  listMedia: MediaKey;
  cardMedia: MediaKey;
  featured: boolean;
  detail?: JourneyDetail;
  /**
   * The working day-by-day for a journey whose full write-up (hotels, pacing,
   * inclusions) is still being confirmed. Rendered above the enquiry form on
   * the in-preparation page.
   */
  itineraryHeadline?: string;
  itinerary?: ItineraryDay[];
};

const amalfiDetail: JourneyDetail = {
  heroMedia: 'am-hero',
  overviewHeadline: 'One coast. Two hotels. Nine days that never feel scheduled.',
  overview: [
    'The Amalfi coast is famous for the wrong reasons — the traffic, the queues, the day-trippers. We go in September, when the light softens and the sea is still warm, and we stay put: three nights above Positano, five in a quieter village on the other side of the cape.',
    'Most days have one thing in them. A boat. A lunch. A walk. The rest is yours — a terrace, a swim, a book you have been meaning to finish.',
  ],
  why: {
    headline: 'Because the coast is best experienced from one chair, not twelve.',
    media: 'am-why',
    highlights: [
      {
        n: '01',
        title: 'A private boat day to Nerano',
        body: 'Swim off Li Galli, lunch at a family restaurant on the water.',
      },
      {
        n: '02',
        title: 'Ravello before the coaches',
        body: 'Then the old mule path down through lemon terraces.',
      },
      {
        n: '03',
        title: 'Lunch under the lemon trees',
        body: 'With a grower Marc has known for fifteen years.',
      },
      {
        n: '04',
        title: 'Capri from the water',
        body: 'The island the long way round — and the queue skipped entirely.',
      },
      {
        n: '05',
        title: 'Four free afternoons',
        body: 'Because the terrace is part of the itinerary.',
      },
    ],
  },
  itineraryHeadline: 'Nine days, one idea a day.',
  days: [
    {
      n: 1,
      where: 'Naples → Positano',
      title: 'Arrive, and stop moving.',
      body: 'Met at Naples, driven along the coast as the day cools. Check in above Positano and do not leave: a swim, a drink on the terrace, dinner at the hotel with the group — the only fixed dinner of the week.',
      stay: 'Above Positano',
      free: 'Afternoon free',
      media: 'd1',
    },
    {
      n: 2,
      where: 'Positano',
      title: 'The town before the day-trippers.',
      body: 'A walk down through Positano with a friend who grew up here — the church, the bakery, the ceramics workshop that does not have a sign. Back up by the hotel boat in time for a late lunch.',
      stay: 'Above Positano',
      free: 'Afternoon free',
      media: 'd2',
    },
    {
      n: 3,
      where: 'The bay',
      title: 'A boat, and lunch at Nerano.',
      body: 'Our own boat for the day. Swim off Li Galli, then a long lunch at a family restaurant on the water in Nerano — the spaghetti alla Nerano you will talk about for years. Back when we feel like it.',
      stay: 'Above Positano',
      free: 'Evening free',
      media: 'd3',
    },
    {
      n: 4,
      where: 'Ravello → Minori',
      title: 'Up to Ravello, down to the sea.',
      body: 'Morning in Ravello’s gardens before the coaches arrive, then the old mule path down through lemon terraces to Minori, where a lemon grower we have known for years has set a table under the trees. Transfer to the second hotel.',
      stay: 'The quiet side',
      free: 'Evening free',
      media: 'd4',
    },
    {
      n: 5,
      where: 'The quiet side',
      title: 'Nothing planned.',
      body: 'A whole day with nothing in it. The hotel has a beach club, a kitchen garden and a pool nobody uses before eleven. Marc will be around with recommendations — or not, if you would rather he was not.',
      stay: 'The quiet side',
      free: 'Entire day free',
      media: 'd5',
    },
    {
      n: 6,
      where: 'Capri',
      title: 'Capri, the long way round.',
      body: 'The island by boat, circling before landing — the grottoes and the faraglioni without the queue. Ashore, a walk to a villa garden and a lunch above the sea. Home by the evening ferry.',
      stay: 'The quiet side',
      free: 'Evening free',
      media: 'd6',
    },
    {
      n: 7,
      where: 'Sorrento hills',
      title: 'At the table with a family.',
      body: 'Inland to a farmhouse in the hills for a cooking morning — mozzarella pulled that hour, pasta made by hand — and the lunch that follows it. Slow, loud and long.',
      stay: 'The quiet side',
      free: 'Afternoon free',
      media: 'd7',
    },
    {
      n: 8,
      where: 'The path of the gods',
      title: 'Walk, swim, last dinner.',
      body: 'For those who want it, the Sentiero degli Dei in the early light, ending with a swim. For those who do not, the terrace. Everyone reconvenes for a final dinner on a friend’s rooftop.',
      stay: 'The quiet side',
      free: 'Afternoon free',
      media: 'd8',
    },
    {
      n: 9,
      where: '→ Naples',
      title: 'Depart, slowly.',
      body: 'No early departure. Breakfast until noon, then transfers to Naples timed to your flights. Most guests leave asking where we are going next.',
      stay: '—',
      free: 'Morning free',
      media: 'd9',
    },
  ],
  hotelsHeadline: 'Two hotels. Both chosen because you will want to stay in.',
  hotels: [
    {
      name: 'A clifftop hotel above Positano',
      place: 'Positano',
      nights: '3 nights',
      why: 'The terrace faces west, the kitchen garden feeds the restaurant, and the boat leaves from the hotel’s own jetty — so you never touch the coast road.',
      detail: 'Breakfast until noon, on your own terrace.',
      media: 'am-h1',
    },
    {
      name: 'A converted monastery on the quiet side',
      place: 'The other side of the cape',
      nights: '5 nights',
      why: 'Twenty rooms in a former monastery, a beach club at the bottom of the steps, and a village that empties at six. We stay five nights because leaving is hard.',
      detail: 'The cloister garden at dusk, and a swim before breakfast.',
      media: 'am-h2',
    },
  ],
  pacing: {
    media: 'am-map',
    headline: 'We plan around one thing a day. Everything else is yours.',
    body: 'Nothing before ten. Nothing that cannot be skipped. Dinners are booked, but you are welcome to disappear with a bottle to your terrace instead. Four of nine afternoons are entirely unplanned, on purpose.',
    stats: [
      { value: '2', label: 'hotels, no repacking' },
      { value: '4', label: 'free afternoons' },
      { value: '0', label: 'early departures' },
    ],
  },
  included: [
    {
      label: 'Accommodation',
      value: '8 nights in two hand-picked hotels, sea-view rooms throughout.',
    },
    {
      label: 'Meals',
      value:
        'Breakfast daily, 5 lunches and 4 dinners with wine — including the boat lunch and the farmhouse table.',
    },
    {
      label: 'Experiences',
      value:
        'Private boat day, Capri by boat, Ravello and the lemon path, cooking morning, all guided walks.',
    },
    {
      label: 'People',
      value: 'Marc as host throughout, plus our local friends and guides in each place.',
    },
    {
      label: 'Transfers',
      value: 'Naples arrival and departure, all transfers between hotels and experiences.',
    },
    {
      label: 'Details',
      value:
        'Restaurant bookings for your free evenings, luggage handling, gratuities for guides and drivers.',
    },
  ],
  notIncluded:
    'Not included: international flights, travel insurance, meals marked as free, gratuities at your discretion.',
  marc: {
    role: 'Founder · hosting this departure',
    quote:
      'I first came to this coast twenty years ago and made every mistake — too many towns, too many transfers, too little time. This is the journey I wish someone had planned for me. Stay put. Take the boat. Order the lemon pasta twice.',
    note: 'The people we will eat with, sail with and walk with are friends of many years. That is what makes the difference between visiting a place and being welcomed into it.',
  },
  gallery: [
    { media: 'g1', span: 'wide', height: 'tall' },
    { media: 'g2', span: 'single', height: 'tall' },
    { media: 'g3', span: 'single', height: 'short' },
    { media: 'g4', span: 'single', height: 'short' },
    { media: 'g5', span: 'single', height: 'short' },
  ],
  quotes: [
    {
      text: 'We have done the big-name tours. This was the first trip where I finished a book, learned a recipe and never once looked at my watch.',
      who: 'Returning guest · Coral Gables',
    },
    {
      text: 'Marc knows everyone. Not in a name-dropping way — in a “the fisherman waved at him” way.',
      who: 'First-time guest · Zürich',
    },
  ],
  spotsLeft: 6,
};

export const journeys: Journey[] = [
  {
    slug: 'amalfi-slowly',
    n: 'No. 01',
    title: 'Amalfi, Slowly',
    lead: 'One coast, two hotels, no rush.',
    blurb:
      'Lemon groves and a private boat day. Dinners that start when the light goes soft. Long enough in each hotel to actually live there.',
    country: 'Italy',
    region: 'Amalfi Coast',
    coords: [14.48, 40.63],
    days: 9,
    departure: '12 Sept 2027',
    departureWindow: '12 – 20 September 2027',
    departureISO: '2027-09-12',
    group: 'Max. 18 · hosted by Marc',
    groupMax: 18,
    priceFrom: '$13,800',
    hostedByMarc: true,
    season: 'Autumn',
    who: ['Couples', 'Friends'],
    inspire: ['Food & Wine', 'Coast & Islands', 'Culture'],
    tags: ['Coast & Islands', 'Food & Wine', 'Hosted by Marc'],
    listMedia: 'jl-1',
    cardMedia: 'feat-1',
    featured: true,
    detail: amalfiDetail,
  },
  {
    slug: 'the-swiss-lakes',
    n: 'No. 02',
    title: 'The Swiss Lakes',
    lead: 'Marc’s home country, shown to a friend.',
    blurb:
      'By train and boat from Lucerne to the Engadin. A grand hotel where the steamers still stop, a cold swim before breakfast, and a village Marc has known since he was a boy.',
    country: 'Switzerland',
    region: 'Lucerne to the Engadin',
    coords: [8.31, 47.05],
    days: 8,
    departure: '19 June 2027',
    departureWindow: '19 – 26 June 2027',
    departureISO: '2027-06-19',
    group: 'Max. 18 · hosted by Marc',
    groupMax: 18,
    priceFrom: '$12,400',
    hostedByMarc: true,
    season: 'Summer',
    who: ['Couples', 'Solo', 'Friends'],
    inspire: ['Mountains & Lakes', 'Nature', 'Wellness'],
    tags: ['Mountains & Lakes', 'Nature', 'Hosted by Marc'],
    listMedia: 'jl-2',
    cardMedia: 'feat-2',
    featured: true,
    itineraryHeadline: 'Eight days, by train and boat.',
    itinerary: [
      {
        n: 1,
        where: 'Zürich → Lucerne',
        title: 'Arrive by the lake.',
        body: 'Met at Zürich and on the train within the hour, along the water to Lucerne. Check in at a grand hotel where the steamers still tie up at the jetty, and do nothing more ambitious than a drink on the terrace.',
        stay: 'Lucerne, lakeside',
        free: 'Afternoon free',
        media: 'sl-1',
      },
      {
        n: 2,
        where: 'Lake Lucerne',
        title: 'The lake by paddle steamer.',
        body: 'The morning boat to a village on the far shore, lunch at a table on the water, and the slow way back along the lake path for anyone who would rather walk than sail.',
        stay: 'Lucerne, lakeside',
        free: 'Evening free',
        media: 'sl-2',
      },
      {
        n: 3,
        where: 'Pilatus',
        title: 'A cold swim before breakfast.',
        body: 'Off the hotel jetty for those who dare; coffee on the terrace for those who do not. Then the cogwheel railway up Pilatus for lunch above the cloud and the easy way down by cable car.',
        stay: 'Lucerne, lakeside',
        free: 'Afternoon free',
        media: 'sl-3',
      },
      {
        n: 4,
        where: 'Lucerne → the Engadin',
        title: 'The slow train over the Albula.',
        body: 'A day given entirely to the journey: Chur, then the Albula line’s spirals and viaducts up into the high valley. Arrive in the Engadin in time for the last light on the lakes.',
        stay: 'The Engadin',
        free: 'Evening free',
        media: 'sl-4',
      },
      {
        n: 5,
        where: 'Sils',
        title: 'The lakes, on foot.',
        body: 'The path along Lake Sils to the peninsula and back through the larches, with a picnic where Marc always stops. Nothing steep, nothing timed.',
        stay: 'The Engadin',
        free: 'Afternoon free',
        media: 'sl-5',
      },
      {
        n: 6,
        where: 'Marc’s village',
        title: 'The village he has known since he was a boy.',
        body: 'A morning in the village Marc grew up returning to — the bakery, the sgraffito houses, the family who will cook lunch for us and not let us leave before four.',
        stay: 'The Engadin',
        free: 'Afternoon free',
        media: 'sl-6',
      },
      {
        n: 7,
        where: 'The Engadin',
        title: 'Nothing planned.',
        body: 'A whole day with nothing in it. The spa, a rowing boat, a book on the balcony, or one of the walks Marc will happily draw on a napkin.',
        stay: 'The Engadin',
        free: 'Entire day free',
        media: 'sl-7',
      },
      {
        n: 8,
        where: '→ Zürich',
        title: 'Depart, late.',
        body: 'A long breakfast, then the train down to Zürich timed to your flights. Nobody leaves before eleven.',
        stay: '—',
        free: 'Morning free',
        media: 'sl-8',
      },
    ],
  },
  {
    slug: 'mallorca-beyond-the-coast',
    n: 'No. 03',
    title: 'Mallorca, Beyond the Coast',
    lead: 'The island after the season leaves.',
    blurb:
      'Tramuntana villages, a finca lunch cooked by the owner, and a sea you will have to yourself in October.',
    country: 'Spain',
    region: 'Mallorca',
    coords: [2.95, 39.62],
    days: 7,
    departure: '3 Oct 2027',
    departureWindow: '3 – 9 October 2027',
    departureISO: '2027-10-03',
    group: 'Max. 16',
    groupMax: 16,
    priceFrom: '$10,900',
    hostedByMarc: false,
    season: 'Autumn',
    who: ['Couples', 'Friends'],
    inspire: ['Coast & Islands', 'Food & Wine', 'Nature'],
    tags: ['Coast & Islands', 'Food & Wine'],
    listMedia: 'jl-3',
    cardMedia: 'feat-3',
    featured: true,
    itineraryHeadline: 'Seven days, after the season leaves.',
    itinerary: [
      {
        n: 1,
        where: 'Palma → the Tramuntana',
        title: 'Into the mountains.',
        body: 'Met at Palma and driven up into the Serra de Tramuntana as the afternoon cools. A stone finca among the olives, a swim, and the first dinner on the terrace.',
        stay: 'A finca in the Tramuntana',
        free: 'Afternoon free',
        media: 'ma-1',
      },
      {
        n: 2,
        where: 'Valldemossa → Deià',
        title: 'Two villages, one lunch.',
        body: 'Valldemossa early, before the coaches, then the coast road to Deià for a long lunch above the sea and an afternoon in the village that never quite closes for the season.',
        stay: 'A finca in the Tramuntana',
        free: 'Evening free',
        media: 'ma-2',
      },
      {
        n: 3,
        where: 'The west coast',
        title: 'A sea you will have to yourself.',
        body: 'Our own boat along the cliffs, a swim in a cove no road reaches, and lunch on board. In October the water is still warm and the anchorages are empty.',
        stay: 'A finca in the Tramuntana',
        free: 'Evening free',
        media: 'ma-3',
      },
      {
        n: 4,
        where: 'The finca',
        title: 'Lunch cooked by the owner.',
        body: 'A morning among the olives as the harvest begins, then the meal the owner has been planning all week — everything from the land you can see from the table.',
        stay: 'A finca in the Tramuntana',
        free: 'Afternoon free',
        media: 'ma-4',
      },
      {
        n: 5,
        where: 'Sóller',
        title: 'The orange valley by the old train.',
        body: 'The wooden train through the mountains to Sóller, the tram down to the port, and a walk back through the orange groves with someone who grows them.',
        stay: 'A finca in the Tramuntana',
        free: 'Afternoon free',
        media: 'ma-5',
      },
      {
        n: 6,
        where: 'The Tramuntana',
        title: 'Nothing planned.',
        body: 'A whole day with nothing in it. The pool, a walk to the next village, a table booked in case you want it.',
        stay: 'A finca in the Tramuntana',
        free: 'Entire day free',
        media: 'ma-6',
      },
      {
        n: 7,
        where: '→ Palma',
        title: 'Depart, slowly.',
        body: 'Breakfast until you are ready, then the drive down to Palma timed to your flights — with an hour in the old town for anyone who wants it.',
        stay: '—',
        free: 'Morning free',
        media: 'ma-7',
      },
    ],
  },
  {
    slug: 'the-cape-unhurried',
    n: 'No. 04',
    title: 'The Cape, Unhurried',
    lead: 'Wine, sea and long tables.',
    blurb:
      'Four nights in the winelands and four on the Atlantic. Winemakers we have known for years, a private table at a chef’s home, and mornings with nothing planned.',
    country: 'South Africa',
    region: 'Cape & Winelands',
    coords: [18.9, -33.9],
    days: 11,
    departure: '14 Feb 2028',
    departureWindow: '14 – 24 February 2028',
    departureISO: '2028-02-14',
    group: 'Max. 18 · hosted by Marc',
    groupMax: 18,
    priceFrom: '$15,600',
    hostedByMarc: true,
    season: 'Winter',
    who: ['Couples', 'Friends', 'Families'],
    inspire: ['Food & Wine', 'Nature', 'Culture'],
    tags: ['Food & Wine', 'Nature', 'Hosted by Marc'],
    listMedia: 'jl-4',
    cardMedia: 'jl-4',
    featured: false,
    itineraryHeadline: 'Eleven days. Two nights in town, four in the vines, four on the water.',
    itinerary: [
      {
        n: 1,
        where: 'Cape Town',
        title: 'Arrive under the mountain.',
        body: 'Met at the airport and driven to a small hotel at the foot of Table Mountain. A late lunch, a swim, and the first dinner with the group.',
        stay: 'Cape Town',
        free: 'Afternoon free',
        media: 'cp-1',
      },
      {
        n: 2,
        where: 'Cape Town',
        title: 'The mountain and the market.',
        body: 'Up Table Mountain early, before the wind, then a morning in the city with a friend who knows which market stalls matter. The afternoon is yours.',
        stay: 'Cape Town',
        free: 'Afternoon free',
        media: 'cp-2',
      },
      {
        n: 3,
        where: 'Cape Town → the Winelands',
        title: 'Into the vines.',
        body: 'An hour inland to a farmhouse among the vineyards, mountains on every side. Lunch on arrival, and the first of many long tables.',
        stay: 'The Winelands',
        free: 'Afternoon free',
        media: 'cp-3',
      },
      {
        n: 4,
        where: 'Franschhoek',
        title: 'Winemakers we have known for years.',
        body: 'Two cellars, both family-run, both friends — a morning in the vines with one, lunch with the other. Nobody spits, nobody hurries.',
        stay: 'The Winelands',
        free: 'Evening free',
        media: 'cp-4',
      },
      {
        n: 5,
        where: 'The Winelands',
        title: 'A private table at a chef’s home.',
        body: 'Free until the evening. Then dinner at a chef’s own house — one table, one menu, the garden it came from just outside the window.',
        stay: 'The Winelands',
        free: 'Morning free',
        media: 'cp-5',
      },
      {
        n: 6,
        where: 'The Winelands',
        title: 'A morning with nothing planned.',
        body: 'Nothing before lunch. In the afternoon, a walk through the vines to a neighbour’s farm for the last tasting, and the last of the winelands sunsets.',
        stay: 'The Winelands',
        free: 'Morning free',
        media: 'cp-6',
      },
      {
        n: 7,
        where: 'The Winelands → the Atlantic',
        title: 'Over the mountains to the sea.',
        body: 'The scenic way to the peninsula’s Atlantic side — over the pass, along the coast road, to a house above a long empty beach where we stay four nights.',
        stay: 'The Atlantic',
        free: 'Evening free',
        media: 'cp-7',
      },
      {
        n: 8,
        where: 'The Cape Peninsula',
        title: 'Cape Point, and the penguins.',
        body: 'The tip of the continent before the coaches, the penguin beach on the way back, and a long lunch of fish landed that morning.',
        stay: 'The Atlantic',
        free: 'Afternoon free',
        media: 'cp-8',
      },
      {
        n: 9,
        where: 'The Atlantic',
        title: 'Nothing planned.',
        body: 'A whole day with nothing in it. The beach at low tide, a horse ride along it for anyone who wants one, a fire in the evening.',
        stay: 'The Atlantic',
        free: 'Entire day free',
        media: 'cp-9',
      },
      {
        n: 10,
        where: 'The Atlantic',
        title: 'The last long table.',
        body: 'A morning on the water in a boat with a friend, then the final dinner — outdoors, over a fire, with the winemakers driving down to join us.',
        stay: 'The Atlantic',
        free: 'Afternoon free',
        media: 'cp-10',
      },
      {
        n: 11,
        where: '→ Cape Town',
        title: 'Depart, unhurried.',
        body: 'No early departure. Breakfast on the terrace, then transfers to the airport timed to your flights.',
        stay: '—',
        free: 'Morning free',
        media: 'cp-11',
      },
    ],
  },
  {
    slug: 'como-and-the-engadin',
    n: 'No. 05',
    title: 'Como & the Engadin',
    lead: 'Where the lakes meet the peaks.',
    blurb:
      'The journey that gave the company its name in one week: a villa on Como, the Bernina line over the pass, and the high valley in larch-gold light.',
    country: 'Italy & Switzerland',
    region: 'Como to the Engadin',
    coords: [9.26, 45.99],
    days: 10,
    departure: '26 Sept 2027',
    departureWindow: '26 September – 5 October 2027',
    departureISO: '2027-09-26',
    group: 'Max. 18',
    groupMax: 18,
    priceFrom: '$14,200',
    hostedByMarc: false,
    season: 'Autumn',
    who: ['Couples', 'Solo'],
    inspire: ['Mountains & Lakes', 'Art & Design', 'Culture'],
    tags: ['Mountains & Lakes', 'Art & Design'],
    listMedia: 'jl-5',
    cardMedia: 'jl-5',
    featured: false,
    itineraryHeadline: 'Ten days, from the lake to the peaks.',
    itinerary: [
      {
        n: 1,
        where: 'Milan → Como',
        title: 'Arrive at the villa.',
        body: 'Met at Milan and on the lake within the hour. A villa with its own jetty and garden, a swim, and dinner as the lights come on across the water.',
        stay: 'A villa on Como',
        free: 'Afternoon free',
        media: 'ce-1',
      },
      {
        n: 2,
        where: 'Lake Como',
        title: 'The lake from the water.',
        body: 'A private boat for the day — the villas seen as they were meant to be seen, a swim off the boat, and lunch in a village with no road to it.',
        stay: 'A villa on Como',
        free: 'Evening free',
        media: 'ce-2',
      },
      {
        n: 3,
        where: 'Bellagio',
        title: 'Gardens, and a house full of art.',
        body: 'A villa garden opened for us before hours, then a collector’s house that is never open at all. Lunch on a terrace above the point where the lake divides.',
        stay: 'A villa on Como',
        free: 'Afternoon free',
        media: 'ce-3',
      },
      {
        n: 4,
        where: 'Lake Como',
        title: 'Nothing planned.',
        body: 'A whole day with nothing in it. The garden, the jetty, a rowing boat, the town across the water if you want it.',
        stay: 'A villa on Como',
        free: 'Entire day free',
        media: 'ce-4',
      },
      {
        n: 5,
        where: 'Como → Tirano → the Engadin',
        title: 'The Bernina line over the pass.',
        body: 'The day the company is named for: from the lake up the Bernina railway, past the glacier and the highest station, and down into the high valley in larch-gold light.',
        stay: 'The Engadin',
        free: 'Evening free',
        media: 'ce-5',
      },
      {
        n: 6,
        where: 'St. Moritz',
        title: 'Painters of the light.',
        body: 'A morning with the Engadin painters — Segantini, Giacometti — in the museums built for them, then lunch in a village restaurant that has not changed its menu in decades.',
        stay: 'The Engadin',
        free: 'Afternoon free',
        media: 'ce-6',
      },
      {
        n: 7,
        where: 'Val Roseg',
        title: 'The larches at their gold.',
        body: 'A horse-drawn carriage up the valley to the glacier hut, and the walk back down through the larch forest at the one week of the year it is entirely gold.',
        stay: 'The Engadin',
        free: 'Afternoon free',
        media: 'ce-7',
      },
      {
        n: 8,
        where: 'The Engadin',
        title: 'Nothing planned.',
        body: 'A whole day with nothing in it. The spa, the lakes, a walk from the door, or nothing at all.',
        stay: 'The Engadin',
        free: 'Entire day free',
        media: 'ce-8',
      },
      {
        n: 9,
        where: 'Bregaglia',
        title: 'The village on the ledge.',
        body: 'Down the Maloja pass to Soglio, a village on a ledge above the valley with the granite peaks behind it, for a last long lunch and the last dinner back at the hotel.',
        stay: 'The Engadin',
        free: 'Evening free',
        media: 'ce-9',
      },
      {
        n: 10,
        where: '→ Zürich',
        title: 'Depart, late.',
        body: 'A long breakfast, then the train down to Zürich timed to your flights.',
        stay: '—',
        free: 'Morning free',
        media: 'ce-10',
      },
    ],
  },
];

export const featuredJourneys = journeys.filter((j) => j.featured);

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
  | 'group'
  | 'groupMax'
  | 'priceFrom'
  | 'season'
  | 'who'
  | 'inspire'
  | 'tags'
  | 'listMedia'
  | 'cardMedia'
>;

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
    group,
    groupMax,
    priceFrom,
    season,
    who,
    inspire,
    tags,
    listMedia,
    cardMedia,
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
    group,
    groupMax,
    priceFrom,
    season,
    who,
    inspire,
    tags,
    listMedia,
    cardMedia,
  };
}

export function getJourney(slug: string): Journey | undefined {
  return journeys.find((j) => j.slug === slug);
}

/* -- Filters ------------------------------------------------------------- */

export type FilterKey = 'country' | 'season' | 'who' | 'inspire';

export const filterGroups: {
  key: FilterKey;
  label: string;
  options: string[];
  match: (j: JourneySummary, value: string) => boolean;
}[] = [
  {
    key: 'country',
    label: 'Destination',
    options: ['Italy', 'Switzerland', 'Spain', 'South Africa'],
    match: (j, v) => j.country.includes(v),
  },
  {
    key: 'season',
    label: 'When',
    options: ['Summer', 'Autumn', 'Winter'],
    match: (j, v) => j.season === v,
  },
  {
    key: 'who',
    label: 'Travelling with',
    options: ['Couples', 'Friends', 'Families', 'Solo'],
    match: (j, v) => j.who.some((w) => w === v),
  },
  {
    key: 'inspire',
    label: 'What inspires you',
    options: [
      'Culture',
      'Food & Wine',
      'Nature',
      'Wellness',
      'Art & Design',
      'Coast & Islands',
      'Mountains & Lakes',
    ],
    match: (j, v) => j.inspire.some((i) => i === v),
  },
];
