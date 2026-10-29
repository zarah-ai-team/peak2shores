import type { MediaKey } from '../media';

/**
 * Editorial copy, lifted verbatim from the approved design canvas.
 * Nothing factual has been added. Where a section had no written content yet
 * (the journal), entries are marked `draft: true` and render as such.
 */

/* -- Home: philosophy ---------------------------------------------------- */

export const philosophy = {
  headline: 'Great travel isn’t about seeing everything. It’s about experiencing the right things.',
  // Trimmed to one line in the October 2026 review: the headline carries it.
  body: [
    'A remarkable hotel should be enjoyed, not slept in before an early departure. A free afternoon isn’t a gap in the plan; it is the plan.',
  ],
};

/* -- Home: the four pillars ---------------------------------------------- */

export type Pillar = {
  n: string;
  title: string;
  lead: string;
  body: string;
  media: MediaKey;
  /** Which side the photograph sits on at desktop. */
  imageFirst: boolean;
};

export const pillars: Pillar[] = [
  {
    n: '01',
    title: 'Personal',
    lead: 'Thoughtful service. Genuine attention.',
    body: 'Every journey is shaped by personal destination knowledge, genuine relationships, and a commitment to exceptional service from beginning to end.',
    media: 'pillar-1',
    imageFirst: true,
  },
  {
    n: '02',
    title: 'Curated',
    lead: 'Every detail has its purpose.',
    body: 'Handpicked destinations, exceptional hotels, and meaningful experiences — carefully selected to create journeys that feel distinctive and effortless.',
    media: 'pillar-2',
    imageFirst: false,
  },
  {
    n: '03',
    title: 'Connected',
    lead: 'Local expertise. Meaningful connections.',
    body: 'Our trusted network of local specialists and hospitality partners opens doors to authentic experiences and a deeper connection with each destination.',
    media: 'pillar-3',
    imageFirst: true,
  },
  {
    n: '04',
    title: 'Thoughtfully paced',
    lead: 'The luxury of time.',
    body: 'A considered balance of discovery and leisure, with time to enjoy exceptional hotels, embrace spontaneous moments, and truly experience each destination.',
    media: 'pillar-4',
    imageFirst: false,
  },
];

/* -- Home: why us -------------------------------------------------------- */

export const reasons = [
  {
    n: '01',
    title: 'Small by design',
    body: 'Intimate luxury group journeys with a maximum of 18 guests — or a private journey designed entirely around the way you love to travel.',
  },
  {
    n: '02',
    title: 'Personally curated',
    body: 'Journeys shaped by Marc’s own experience and recommendations — not a catalog.',
  },
  {
    n: '03',
    title: 'Local relationships',
    body: 'Trusted people on the ground who provide access beyond the guidebook.',
  },
  {
    n: '04',
    title: 'Time to enjoy',
    body: 'Thoughtful pacing and meaningful free time, built in on purpose.',
  },
  {
    n: '05',
    title: 'Exceptional stays',
    body: 'Handpicked luxury hotels that are an integral part of the journey.',
  },
  {
    n: '06',
    title: 'Seamless by nature',
    body: 'Thoughtful planning, professional coordination, and trusted local support throughout the experience.',
  },
];

/* -- Home: also designed for you ---------------------------------------- */

/** The secondary offers — smaller than the journeys, but present. */
export const services = [
  {
    n: '01',
    title: 'Private Travel',
    line: 'Designed around you alone — your dates, your pace, your people.',
    href: '/plan#private',
    media: 'svc-private' as MediaKey,
  },
  {
    n: '02',
    title: 'Cruises & Yachts',
    line: 'Small ships and private yachts, chosen the way we choose hotels.',
    href: '/plan#private',
    media: 'svc-cruises' as MediaKey,
  },
  {
    n: '03',
    title: 'Sports & Special Events',
    line: 'The event, and everything around it, arranged with the same care.',
    href: '/plan#private',
    media: 'svc-events' as MediaKey,
  },
  {
    n: '04',
    title: 'Villas',
    line: 'Houses with a strong sense of place, for families and friends.',
    href: '/plan#private',
    media: 'svc-villas' as MediaKey,
  },
];

/* -- Home: speak to a travel designer ----------------------------------- */

export const speak = {
  label: 'Speak to a travel designer',
  headline: 'Every journey begins with a conversation.',
  body: 'Call, message us on WhatsApp, or book a time that suits you. Most of our guests talk to us before they book — we would rather you did.',
};

/* -- The Peaks → Shores transition --------------------------------------- */

export const peaksToShores = {
  headlineParts: ['Peaks.', '2.', 'Shores.'],
  /** The two halves of the body, for the homepage drag-compare. */
  peaks: 'Peaks is where the journey began — the Alps, childhood, the outdoors.',
  shores: 'Shores is where it lives now — Miami, the ocean, a different light.',
  between: 'Between them sit the places we love most: where mountains meet water.',
  body: 'Peaks is where the journey began — the Alps, childhood, the outdoors. Shores is where it lives now — Miami, the ocean, a different light. Between them sit the places we love most: where mountains meet water. Alpine lakes. The Amalfi coast. Mallorca. The Mediterranean.',
  frames: [
    { n: 'Peaks', label: 'The Alps', media: 'tr-1' as MediaKey },
    { n: 'Then', label: 'An alpine lake', media: 'tr-2' as MediaKey },
    { n: 'Then', label: 'The Mediterranean', media: 'tr-3' as MediaKey },
    { n: 'Shores', label: 'Miami', media: 'tr-4' as MediaKey },
  ],
};

/* -- Experiences --------------------------------------------------------- */

export type Experience = {
  slug: string;
  title: string;
  body: string;
  media: MediaKey;
};

export const experiences: Experience[] = [
  {
    slug: 'taste',
    title: 'Taste',
    body: 'Food, wine, markets, chefs, private dining.',
    media: 'ex-1',
  },
  {
    slug: 'meet',
    title: 'Meet',
    body: 'Local people, artisans, historians, personalities.',
    media: 'ex-2',
  },
  {
    slug: 'discover',
    title: 'Discover',
    body: 'Culture, architecture, history, hidden places.',
    media: 'ex-3',
  },
  {
    slug: 'explore',
    title: 'Explore',
    body: 'Hiking, sailing, cycling, nature, the outdoors.',
    media: 'ex-4',
  },
  {
    slug: 'stay',
    title: 'Stay',
    body: 'Hotels, villas, retreats, remarkable properties.',
    media: 'ex-5',
  },
];

/* -- Hotels (home) ------------------------------------------------------- */

export const signatureHotels = [
  {
    name: 'A clifftop hotel above Positano',
    place: 'Amalfi Coast, Italy',
    why: 'Because the terrace faces west, the kitchen garden feeds the restaurant, and nobody will hurry you off a sunbed. We stay three nights so you can actually live here.',
    detail: 'Breakfast served until noon, on your own terrace.',
    nearby: 'A private boat to Nerano for lunch, 20 minutes across the bay.',
    media: 'hotel-1' as MediaKey,
    imageFirst: true,
  },
  {
    name: 'A lakeside grand hotel, reimagined',
    place: 'Lake Lucerne, Switzerland',
    why: 'A 19th-century hotel where the boats still stop at the front door. Marc has been coming since childhood, and the family who run it still know his order.',
    detail: 'The lake bath — a wooden jetty and a cold swim before breakfast.',
    nearby: 'The Bürgenstock ridge walk, an hour on foot from the door.',
    media: 'hotel-2' as MediaKey,
    imageFirst: false,
  },
  {
    name: 'A restored finca in the Tramuntana',
    place: 'Mallorca, Spain',
    why: 'Twelve rooms, a working olive estate, and an owner who cooks. When we said we wanted to stay for four nights, she asked what we’d like for dinner on the Tuesday.',
    detail: 'Oil pressed in November from the trees you walk past to your room.',
    nearby: 'The coastal path to a cove with no road access.',
    media: 'hotel-3' as MediaKey,
    imageFirst: true,
  },
];

/* -- The founder --------------------------------------------------------- */

export const founder = {
  headline: 'From the peaks of Switzerland to the shores of Miami.',
  body: [
    'Born and raised in Switzerland and based in Miami for more than 25 years, Peaks2Shores founder Marc Haeni has built an international career spanning three decades in travel and hospitality, including leadership roles with some of the world’s leading travel and cruise brands.',
    'His passion for extraordinary destinations, combined with decades of trusted industry relationships, forms the foundation of Peaks2Shores — bringing together vetted and carefully selected local experts and exceptional hospitality partners to create thoughtfully curated luxury journeys.',
  ],
  /** Our story, "Why it exists" (Marc, October 2026). */
  why: {
    headline: 'Inspired by a lifetime of travel. Created to share the extraordinary.',
    body: [
      'Peaks2Shores was born from a simple belief: the most memorable journeys aren’t about how many destinations we visit or places we check off a list. They’re about thoughtfully designed, beautifully paced experiences, exceptional hospitality, authentic discoveries, and the meaningful connections we make along the way.',
      'From iconic destinations to hidden gems, every journey brings together extraordinary places, local expertise, and carefully curated experiences that create lasting memories.',
    ],
  },
  /** Our story, the name: four ideas rather than a route (Marc, October 2026). */
  name: {
    stops: [
      { label: 'The Peaks', media: 'tr-1' as MediaKey },
      { label: 'The Shores', media: 'tr-4' as MediaKey },
      { label: 'The Places', media: 'tr-3' as MediaKey },
      {
        label: 'The Connections',
        img: '/images/home/xp-meet.jpg',
        alt: 'A musician playing a street piano beside the Chapel Bridge in Lucerne, Switzerland',
      },
    ],
    body: [
      'The name Peaks2Shores reflects both a personal journey and a lifelong passion for travel. From the Swiss Alps to the shores of Miami, it represents the places that shaped our beginnings — and the extraordinary destinations we’ve come to know and love along the way.',
      'From majestic mountains and alpine lakes to spectacular coastlines and vibrant cultures, Peaks2Shores celebrates the beauty of discovery and the connections that make every journey memorable.',
    ],
  },
  quote: 'Iconic places. Extraordinary experiences. Lifelong connections.',
};

/* -- The circle ---------------------------------------------------------- */

export const circle = {
  headline: 'Where are we going with Peaks2Shores next?',
  body: 'Most guests travel with us again. New journeys are announced to them first, in a short letter from Marc — a place we love, a hotel worth the trip, a table worth booking. A small circle of people who travel the same way.',
  notes: [
    {
      label: 'Next letter',
      value: 'Autumn 2026 — the Engadin, and a lake we keep returning to.',
    },
    {
      label: 'First access',
      value: 'New departures open to the circle two weeks before anyone else.',
    },
  ],
};

/* -- Journal ------------------------------------------------------------- */

export const journalCategories = [
  'Places we love',
  'Hotels worth staying in',
  'At the table',
  'Behind the journey',
  'Marc’s notes',
  'Travel slowly',
  'People we know',
] as const;

export type JournalEntry = {
  slug: string;
  category: (typeof journalCategories)[number];
  title: string;
  standfirst: string;
  date: string;
  media: MediaKey;
  /**
   * True until the piece is actually written. Draft entries render with a
   * visible "in preparation" marker rather than pretending to be published.
   */
  draft: boolean;
};

export const journal: JournalEntry[] = [
  {
    slug: 'the-engadin-in-autumn',
    category: 'Places we love',
    title: 'The Engadin, and a lake we keep returning to',
    standfirst:
      'The subject of the next letter to the circle: a high valley in larch-gold light, and why late autumn is the moment to be in it.',
    date: 'Autumn 2026',
    media: 'jn-1',
    draft: true,
  },
  {
    slug: 'the-coast-in-september',
    category: 'Travel slowly',
    title: 'A note on the coast in September',
    standfirst:
      'Why we take the Amalfi coast at the end of the season: softer light, warm water, and the towns back in the hands of the people who live in them.',
    date: 'September',
    media: 'jn-2',
    draft: true,
  },
  {
    slug: 'at-the-table',
    category: 'At the table',
    title: 'The lunch that runs until four',
    standfirst:
      'A farmhouse in the Sorrento hills, mozzarella pulled that hour, and the case for one long meal instead of three short ones.',
    date: 'In preparation',
    media: 'jn-3',
    draft: true,
  },
  {
    slug: 'hotels-worth-the-trip',
    category: 'Hotels worth staying in',
    title: 'What makes a hotel worth the trip',
    standfirst:
      'Not the thread count. The terrace that faces west, the kitchen garden that feeds the restaurant, and breakfast served until noon.',
    date: 'In preparation',
    media: 'jn-4',
    draft: true,
  },
];
