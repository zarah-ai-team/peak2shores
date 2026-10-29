import { getMedia, hasPhoto, type MediaKey } from '@/lib/media';

/**
 * The homepage copy and media, as laid out in Sample C ("Marc's flow",
 * October 2026) and revised in Marc's update of 23 October 2026. Copy is
 * Marc's own; film and stills are his footage and the frames chosen with him,
 * in public/video/home and public/images/home. Where the sample repeated a
 * photograph, a licensed 4K still from the registry (media.ts → credits.json)
 * stands in, so every frame on the page is shown once.
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

/**
 * Marc's own photograph for a slot once its file has landed (a still: his
 * frames replace the film), and the frame the page shows today until then.
 */
const marcs = (key: MediaKey, today: HomeVisual): HomeVisual =>
  hasPhoto(key) ? still(key) : today;

export type ReelClip = {
  place: string;
  /** What the clip's still shows. */
  alt: string;
  video: string;
  img: string;
  /** Where in the clip to begin, in seconds. */
  start?: number;
};

/**
 * 01 — The reel, in Marc's order: safari, Switzerland, Positano, Hvar.
 *
 * Positano and Hvar are licensed Shutterstock clips (4088645319 from 0:27,
 * 4150349679 from 0:02), saved as reel-positano.mp4 / reel-hvar.mp4 with a
 * poster frame beside them in public/images/home. Until a file is there the
 * page resolves the clip to `fallback` (HomePage, on the server), so the reel
 * never points at a missing file.
 */
export const reel: (ReelClip & { fallback?: ReelClip })[] = [
  {
    place: 'On safari',
    alt: 'A giraffe in open grassland on safari, seen through the bush, hills and mountains behind',
    video: '/video/home/reel-safari.mp4',
    img: '/images/home/reel-safari.jpg',
  },
  {
    place: 'Switzerland, by rail',
    alt: 'A red train curving along an alpine lake beneath low cloud in the Swiss Alps',
    video: '/video/home/reel-rail.mp4',
    img: '/images/home/reel-rail.jpg',
  },
  {
    place: 'Positano · Italy',
    alt: 'Positano on the Amalfi Coast, Italy, from the sea',
    video: '/video/home/reel-positano.mp4',
    img: '/images/home/reel-positano.jpg',
    start: 27,
    fallback: {
      place: 'Capri · Italy',
      alt: 'The harbor of Marina Grande on Capri, Italy, boats moored below white houses on the hillside',
      video: '/video/home/reel-capri.mp4',
      img: '/images/home/reel-capri.jpg',
    },
  },
  {
    place: 'Hvar · Croatia',
    alt: 'Hvar on the Dalmatian Coast, Croatia, from the sea',
    video: '/video/home/reel-hvar.mp4',
    img: '/images/home/reel-hvar.jpg',
    start: 2,
    fallback: {
      place: 'The Adriatic',
      alt: 'Sveti Stefan, a walled island village on the Adriatic coast of Montenegro, a catamaran at anchor',
      video: '/video/home/reel-adriatic.mp4',
      img: '/images/home/reel-adriatic.jpg',
    },
  },
];

/* 02 — Ways to experience. */
export const ways: (HomeVisual & { title: string; line: string; href: string; lead?: boolean })[] =
  [
    {
      title: 'Small Luxury Group Journeys',
      line: 'Intimate journeys for never more than 18 guests, bringing together exceptional places, meaningful experiences and the joy of discovering the world together.',
      href: '/journeys',
      // Marc's Kenya frame is a still; the film goes once it lands.
      ...marcs('client-way-group', {
        video: '/video/home/way-group.mp4',
        img: '/images/home/way-group.jpg',
        alt: 'A table laid for a long lunch, candles and flowers',
      }),
      lead: true,
    },
    {
      title: 'Private Travel',
      line: 'Bespoke destinations, exceptional stays and authentic experiences — exclusively designed around you and the way you love to travel.',
      href: '/plan#private',
      video: '/video/home/way-private.mp4',
      img: '/images/home/way-private.jpg',
      alt: 'Two travelers raising glasses of red wine among the trees',
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
      line: 'Discover extraordinary destinations aboard handpicked luxury yachts, intimate cruises and elegant river voyages, with exceptional experiences both onboard and ashore.',
      href: '/plan#private',
      ...marcs('client-way-cruises', {
        video: '/video/home/way-cruises.mp4',
        ...still('home-way-cruises'),
      }),
    },
    {
      title: 'Sports & Events',
      line: 'Iconic sporting events, extraordinary cultural celebrations and exceptional travel experiences — thoughtfully brought together in one unforgettable journey.',
      href: '/plan#private',
      ...marcs('client-way-events', {
        video: '/video/home/way-events.mp4',
        img: '/images/home/way-events.jpg',
        alt: 'A polo match on an English summer lawn',
      }),
    },
    {
      title: 'Private Villas',
      line: 'Handpicked villas in extraordinary settings — where privacy, personalized service and unforgettable moments come together.',
      href: '/plan#private',
      ...marcs('client-way-villas', {
        video: '/video/home/way-villas.mp4',
        ...still('home-way-villas'),
      }),
    },
  ];

/* 05 — The founder's line. */
export const statement = {
  before: 'The journeys we remember most aren’t measured by how much we see, but by how ',
  emphasis: 'deeply',
  after: ' we experience the moments along the way.',
  /* Behind it, a slow flight along a sandstone headland above the sea: the sea
     stack offshore, then the walkers at the lookout. Not shown anywhere else
     on the page. The poster is the film's first frame, so play starts clean. */
  film: {
    img: '/images/home/pause-dune.jpg',
    alt: 'A sandstone headland above the sea, a sea stack offshore',
    video: '/video/home/pause-dune.mp4',
  } satisfies HomeVisual,
};

/* 06 — Why Peaks2Shores. */
export const principles: (HomeVisual & { title: string; line: string })[] = [
  {
    title: 'Personally curated',
    line: 'Every journey begins with a personal passion for travel, shaped by decades of experience and personal connections to the places we explore.',
    ...marcs('client-why-curated', still('home-curated')),
  },
  {
    title: 'Thoughtfully paced',
    line: 'Beautifully balanced journeys, allowing time to explore, unwind and truly immerse yourself in each destination.',
    ...marcs('client-why-paced', {
      img: '/images/home/why-paced.jpg',
      alt: 'An empty chair at the end of a jetty on a misty lake',
    }),
  },
  {
    title: 'Meaningful experiences',
    line: 'Immersive experiences, authentic encounters and exceptional stays that create unforgettable memories long after the journey ends.',
    ...marcs('client-why-moments', {
      img: '/images/home/why-moments.jpg',
      alt: 'A dhow under sail off a palm-fringed coast at dusk',
    }),
  },
  {
    title: 'Local connections',
    line: 'People we’ve known and trusted for years, opening doors to experiences no guidebook can offer.',
    ...marcs('client-why-local', {
      video: '/video/home/why-local.mp4',
      img: '/images/home/why-local.jpg',
      alt: 'Guests in a wine cellar',
    }),
  },
];

/* 07 — The name. */
export const peaksShores = {
  between:
    'Inspired by a journey from the Swiss Alps to the shores of Miami, and a lifelong passion for the extraordinary places in between.',
  peaks: {
    line: 'Rooted in Switzerland, where a childhood surrounded by the Alps inspired a lifelong passion for mountains, nature and discovery.',
    ...marcs('client-peaks', {
      video: '/video/home/peaks.mp4',
      img: '/images/home/peaks.jpg',
      alt: 'Snow-covered Alpine peaks rising above a line of fir trees in winter light',
    }),
  },
  shores: {
    line: 'Where the journey continued — Miami, my second home for over 25 years, inspiring a lifelong love for oceans, beautiful coastlines and diverse cultures.',
    ...marcs('client-shores', still('home-cove')),
  },
};

/* 07b — The founder. */
export const founderStory = {
  headline: 'A lifetime of travel. A passion for extraordinary journeys.',
  body: 'Born and raised in Switzerland and based in Miami for over 25 years, founder Marc Haeni brings decades of international travel experience, trusted relationships and a genuine passion for discovering extraordinary destinations. Every Peaks2Shores journey reflects that experience — thoughtfully designed, personally curated and created to inspire lasting memories.',
  portrait: still('marc-portrait'),
};

/* 08 — Hotels, lodges & camps: five places Marc names, each in his words. */
export const hotels: (HomeVisual & {
  place: string;
  name: string;
  signature: string;
  nearby: string;
  /** A second view of the place, on the turned-over side. Falls back to the front. */
  back?: string;
  backAlt?: string;
})[] = [
  {
    place: 'Lucerne | Switzerland',
    name: 'Mandarin Oriental Palace',
    signature:
      'Belle Époque elegance meets contemporary luxury, with spectacular views across Lake Lucerne and the Swiss Alps.',
    nearby:
      'Explore Lucerne’s charming Old Town, discover the “Queen of the Mountains,” or cruise across the lake into the heart of the Swiss Alps.',
    ...still('client-hotel-lucerne'),
    back: '/images/drive/switzerland-lake-lucerne-balcony-view.jpg',
    backAlt: 'Lake Lucerne and Mount Pilatus from a balcony above the lakeside promenade, Lucerne',
  },
  {
    place: 'Stresa | Italy',
    name: 'Hotel La Palma',
    signature:
      'Contemporary lakeside elegance on the shores of Lake Maggiore, featuring a spectacular rooftop Sky Bar and infinity pool with breathtaking Alpine views.',
    nearby:
      'Explore the enchanting Borromean Islands, stroll through Stresa’s charming lakeside streets, or venture into the surrounding mountains for spectacular panoramic views.',
    ...still('client-hotel-stresa'),
    back: '/images/drive/italy-stresa-sky-bar.jpg',
    backAlt:
      'The rooftop terrace at Hotel La Palma, Stresa, looking across Lake Maggiore to the mountains',
  },
  {
    place: 'Victoria Falls | Zimbabwe',
    name: 'The Palm River Hotel',
    signature:
      'Understated riverside luxury on the banks of the Zambezi, where lush gardens meet the wilderness and elephants occasionally wander past.',
    nearby:
      'Marvel at the thundering Victoria Falls, enjoy a sunset cruise along the Zambezi, or discover the wildlife of nearby Zambezi National Park.',
    ...still('client-hotel-victoria-falls'),
    back: '/images/drive/zimbabwe-zambezi-sunset-cruise.jpg',
    backAlt: 'Boats on the Zambezi River at sunset near Victoria Falls, Zimbabwe',
  },
  {
    place: 'Rovinj | Croatia',
    name: 'Grand Park Hotel Rovinj',
    signature:
      'Contemporary Mediterranean elegance overlooking Rovinj’s picturesque Old Town, where breathtaking Adriatic views meet exceptional design and understated luxury.',
    nearby:
      'Wander Rovinj’s charming cobblestone streets, explore the beautiful Istrian countryside with its vineyards and truffle treasures, or sail along the Adriatic coast.',
    ...still('client-hotel-rovinj'),
    back: '/images/drive/croatia-rovinj-grand-park-room.jpg',
    backAlt:
      'A guest room at Grand Park Hotel Rovinj, Croatia, with a view of the Old Town and its bell tower',
  },
  {
    place: 'Vipingo | Kenya',
    name: 'Cardamom House',
    signature:
      'An intimate coastal hideaway overlooking the Indian Ocean, where Swahili-inspired elegance, barefoot luxury and warm Kenyan hospitality create a truly personal escape.',
    nearby:
      'Discover pristine beaches and turquoise waters, explore the vibrant Swahili culture of the Kenyan coast, or sail the Indian Ocean aboard a traditional dhow.',
    ...still('client-hotel-vipingo'),
  },
];

/* 08b — Experiences & connections. */
export const experiences: (HomeVisual & { word: string; line: string })[] = [
  {
    word: 'Taste',
    line: 'Food, wine, markets and chefs — and tables worth booking.',
    img: '/images/home/xp-taste.jpg',
    alt: 'Friends dining by candlelight on a lakeside terrace at dusk, the lights of a village across the water',
  },
  {
    word: 'Meet',
    line: 'Local people, artisans and historians — the people who make a place.',
    video: '/video/home/xp-meet.mp4',
    img: '/images/home/xp-meet.jpg',
    alt: 'A musician playing a street piano beside the Chapel Bridge in Lucerne, Switzerland',
  },
  {
    word: 'Discover',
    line: 'Culture, architecture, history and the places between the sights.',
    img: '/images/home/xp-discover.jpg',
    alt: 'A fisherman rowing a wooden boat off Positano, Italy, at sunset',
  },
  {
    word: 'Explore',
    line: 'Hiking, sailing, cycling and skiing — the outdoors, at your own pace.',
    video: '/video/home/xp-move.mp4',
    img: '/images/home/xp-move.jpg',
    alt: 'Skiers on a sunny slope above a snow-covered Alpine village',
  },
];

/* 09 — The circle. */
export const circle = {
  headline: 'Where are we going next?',
  body: 'New journeys are announced to the circle first, in a short letter from Marc — a place we love, a hotel worth the trip, a table worth booking.',
  ...still('home-circle'),
};
