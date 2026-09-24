import type { MediaKey } from './media';

/**
 * Editorial copy, lifted verbatim from the approved design canvas.
 * Nothing factual has been added. Where a section had no written content yet
 * (the journal), entries are marked `draft: true` and render as such.
 */

/* -- Home: philosophy ---------------------------------------------------- */

export const philosophy = {
  headline: 'Great travel isn’t about seeing everything. It’s about experiencing the right things.',
  body: [
    'Luxury rarely means doing more. More often it means doing less — and doing it exceptionally well. A remarkable hotel should be enjoyed, not slept in before an early departure. A free afternoon isn’t a gap in the plan; it is the plan.',
    'Peaks2Shores journeys are built around quality, time, space and access — with a small group of good company and people on the ground we’ve known for years.',
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
    lead: 'There is a real person behind every journey.',
    body: 'Founder-led and relationship-driven. Marc has been where you are going, knows who to call, and hosts select departures himself.',
    media: 'pillar-1',
    imageFirst: true,
  },
  {
    n: '02',
    title: 'Curated',
    lead: 'Fewer, better. Never more.',
    body: 'Hand-picked destinations and exceptional hotels. Every stop has earned its place, and everything mediocre has already been filtered out.',
    media: 'pillar-2',
    imageFirst: false,
  },
  {
    n: '03',
    title: 'Connected',
    lead: 'Access comes from people, not passes.',
    body: 'Local friends, artisans, chefs and historians built up over decades. The kind of access no guidebook and no concierge can arrange.',
    media: 'pillar-3',
    imageFirst: true,
  },
  {
    n: '04',
    title: 'Thoughtfully paced',
    lead: 'Free time is one of the luxuries.',
    body: 'Enough time to explore, to enjoy the hotel, to be spontaneous — and simply to be present. We never plan a day to the minute.',
    media: 'pillar-4',
    imageFirst: false,
  },
];

/* -- Home: why us -------------------------------------------------------- */

export const reasons = [
  {
    n: '01',
    title: 'Small by design',
    body: 'Never more than approximately 18 guests. Small enough for one table at dinner.',
  },
  {
    n: '02',
    title: 'Personally curated',
    body: 'Journeys shaped by Marc’s own experience and recommendations — not a catalogue.',
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
    body: 'Hotels are part of the journey, not just places to sleep.',
  },
  {
    n: '06',
    title: 'Seamless by nature',
    body: 'The complexity happens behind the scenes so you can stay present.',
  },
];

/* -- The Peaks → Shores transition --------------------------------------- */

export const peaksToShores = {
  headlineParts: ['Peaks.', '2.', 'Shores.'],
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
    slug: 'move',
    title: 'Move',
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
    'Marc Haeni was born and raised in Switzerland and has called Miami home for more than 25 years. In between, decades of international travel — and the relationships that come from returning to the same places, tables and people again and again.',
    'Peaks2Shores began in 2022 as the natural extension of that life. It isn’t a personal brand. It’s a promise: there is a real person behind every journey, and he has already been where you’re going.',
  ],
  quote: 'Fewer, better journeys. Personally curated.',
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
