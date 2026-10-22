import { getMedia } from '@/lib/media';

/**
 * The homepage copy and media, as laid out in Sample C ("Marc's flow",
 * October 2026). Copy is Marc's own; film and stills are his footage and the
 * frames chosen with him, in public/video/home and public/images/home. Where
 * the sample repeated a photograph, a licensed 4K still from the registry
 * (media.ts → credits.json) stands in, so every frame on the page is shown once.
 */

export type HomeVisual = {
  /** A still, or the poster when there is film. */
  img: string;
  alt: string;
  /** Silent clip, played muted. */
  video?: string;
};

const still = (key: Parameters<typeof getMedia>[0]): Pick<HomeVisual, 'img' | 'alt'> => {
  const slot = getMedia(key);
  return { img: slot.src ?? '', alt: slot.alt ?? '' };
};

/* 01 — The reel: Italy, the Alps, safari, the Adriatic (Marc's order). */
export const reel = [
  {
    place: 'Capri · Italy',
    video: '/video/home/reel-capri.mp4',
    img: '/images/home/reel-capri.jpg',
  },
  {
    place: 'The mountains, by rail',
    video: '/video/home/reel-rail.mp4',
    img: '/images/home/reel-rail.jpg',
  },
  { place: 'On safari', video: '/video/home/reel-safari.mp4', img: '/images/home/reel-safari.jpg' },
  {
    place: 'The Adriatic',
    video: '/video/home/reel-adriatic.mp4',
    img: '/images/home/reel-adriatic.jpg',
  },
];

/* 02 — Ways to experience. */
export const ways: (HomeVisual & { title: string; line: string; href: string; lead?: boolean })[] =
  [
    {
      title: 'Curated Group Journeys',
      line: 'Thoughtfully paced journeys that bring a small group of like-minded travellers together for extraordinary shared experiences.',
      href: '/journeys',
      video: '/video/home/way-group.mp4',
      img: '/images/home/way-group.jpg',
      alt: 'A table laid for a long lunch, candles and flowers',
      lead: true,
    },
    {
      title: 'Private Journeys',
      line: 'Journeys designed around you — personal, seamless and shaped by the way you want to experience the world.',
      href: '/plan#private',
      video: '/video/home/way-private.mp4',
      img: '/images/home/way-private.jpg',
      alt: 'Two travellers raising glasses of red wine among the trees',
    },
    {
      title: 'Safari',
      line: 'Extraordinary wildlife, remarkable landscapes and intimate lodges — bringing you closer to the wild in unforgettable ways.',
      href: '/plan#private',
      video: '/video/home/way-safari.mp4',
      img: '/images/home/way-safari.jpg',
      alt: 'Zebra crossing golden grassland',
    },
    {
      title: 'Cruises',
      line: 'Extraordinary journeys on the water — from intimate yachts to ocean and river voyages, enriched by immersive experiences ashore.',
      href: '/plan#private',
      video: '/video/home/way-cruises.mp4',
      ...still('home-way-cruises'),
    },
    {
      title: 'Sports & Events',
      line: 'Be there for the moments that matter — extraordinary sporting and cultural events transformed into unforgettable journeys.',
      href: '/plan#private',
      video: '/video/home/way-events.mp4',
      img: '/images/home/way-events.jpg',
      alt: 'A polo match on an English summer lawn',
    },
    {
      title: 'Private Villas',
      line: 'Exceptional homes in extraordinary places — where privacy, space and a true sense of place come together.',
      href: '/plan#private',
      video: '/video/home/way-villas.mp4',
      ...still('home-way-villas'),
    },
  ];

/* 05 — The founder's line. */
export const statement = {
  before: 'The journeys we remember most aren’t measured by how much we see, but by how ',
  emphasis: 'deeply',
  after: ' we experience a place.',
};

/* 06 — Why Peaks2Shores. */
export const principles: (HomeVisual & { title: string; line: string })[] = [
  {
    title: 'Personally curated',
    line: 'Every journey selected and designed by Marc — never simply added to a catalogue.',
    ...still('home-curated'),
  },
  {
    title: 'Thoughtfully paced',
    line: 'Enough time to genuinely experience a place, with free time built in on purpose.',
    img: '/images/home/why-paced.jpg',
    alt: 'An empty chair at the end of a jetty on a misty lake',
  },
  {
    title: 'Meaningful experiences',
    line: 'The moments that bring a journey to life, rather than a checklist of sights.',
    img: '/images/home/why-moments.jpg',
    alt: 'A dhow under sail off a palm-fringed coast at dusk',
  },
  {
    title: 'Local connections',
    line: 'People we have known for years, who open doors no guidebook can.',
    video: '/video/home/why-local.mp4',
    img: '/images/home/why-local.jpg',
    alt: 'Guests in a wine cellar',
  },
];

/* 07 — The name. */
export const peaksShores = {
  between: 'Between them sit the places we love most: where mountains, lakes and oceans meet.',
  peaks: {
    line: 'Peaks is where the journey began — the Alps, childhood, the outdoors.',
    video: '/video/home/peaks.mp4',
    img: '/images/home/peaks.jpg',
  },
  shores: {
    line: 'Shores is where it lives now — Miami, the ocean, a different light.',
    ...still('home-cove'),
  },
};

/* 07b — The founder. */
export const founderStory = {
  headline: 'From the peaks of Switzerland to the shores of Miami.',
  body: 'Marc Haeni was born and raised in Switzerland and lives in Miami. More than 25 years in international travel have given him the destination knowledge and trusted relationships behind every journey — and the reason each one is selected and designed, never simply added to a catalogue.',
  portrait: still('marc-portrait'),
};

/* 08 — Hotels, lodges & camps. A bracketed value is still to come from Marc. */
export const hotels: (HomeVisual & {
  place: string;
  name: string;
  signature: string;
  nearby: string;
})[] = [
  {
    place: 'Lake Lucerne, Switzerland',
    name: 'A lakeside grand hotel',
    signature: 'The lake bath — a wooden jetty and a cold swim before breakfast.',
    nearby: 'The Bürgenstock ridge walk, an hour on foot from the door.',
    img: '/images/home/hotel-lakeside.jpg',
    alt: 'A grand hotel terrace above a misty lake at dawn',
  },
  {
    place: 'Southern Africa',
    name: 'A safari lodge',
    signature: '[Signature detail — from Marc]',
    nearby: '[Nearby — from Marc]',
    video: '/video/home/hotel-lodge.mp4',
    img: '/images/home/hotel-lodge.jpg',
    alt: 'An elephant drinking at a lodge pool',
  },
  {
    place: 'Vipingo, Kenyan coast',
    name: 'Cardamom House',
    signature: '[Signature detail — from Marc]',
    nearby: '[Nearby — from Marc]',
    img: '/images/home/hotel-cardamom.jpg',
    alt: 'A thatched white villa among trees and bougainvillea',
  },
];

/* 08b — Experiences & connections. */
export const experiences: (HomeVisual & { word: string; line: string })[] = [
  {
    word: 'Taste',
    line: 'Food, wine, markets and chefs — and tables worth booking.',
    img: '/images/home/xp-taste.jpg',
    alt: '',
  },
  {
    word: 'Meet',
    line: 'Local people, artisans and historians — the people who make a place.',
    video: '/video/home/xp-meet.mp4',
    img: '/images/home/xp-meet.jpg',
    alt: '',
  },
  {
    word: 'Discover',
    line: 'Culture, architecture, history and the places between the sights.',
    img: '/images/home/xp-discover.jpg',
    alt: '',
  },
  {
    word: 'Move',
    line: 'Hiking, sailing, cycling and skiing — the outdoors, at your own pace.',
    video: '/video/home/xp-move.mp4',
    img: '/images/home/xp-move.jpg',
    alt: '',
  },
];

/* 09 — The circle. */
export const circle = {
  headline: 'Where are we going next?',
  body: 'New journeys are announced to the circle first, in a short letter from Marc — a place we love, a hotel worth the trip, a table worth booking.',
  ...still('home-circle'),
};
