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
  /** Where a tight crop centres on the still and its film (CSS object-position). */
  pos?: string;
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
  /** No film: the still holds, easing slowly in, for `hold` seconds. */
  video?: string;
  img: string;
  /** Where in the clip to begin, in seconds. */
  start?: number;
  /** How long a still without a film stays on screen, in seconds. */
  hold?: number;
  /** A colour grade (a CSS filter) for a clip that reads flat. */
  grade?: string;
  /** Where a landscape screen crops the frame (CSS object-position). */
  pos?: string;
  /** Where a portrait screen (a phone, an upright tablet) crops the frame. */
  posM?: string;
  /** Mirror the clip, to turn its subject away from the headline. */
  flip?: boolean;
};

/**
 * 01 — The reel, in Marc's order: safari, Switzerland, Positano, Seville.
 *
 * Marc's selection of 9 Nov, cut from the masters he bought on Shutterstock
 * (kept in the Drive content library under website/video, never in the
 * repo): the lion at full frame (4062868427), Positano from 0:27 (4088645319)
 * and Seville from 0:13 (4107915811). The Swiss rail clip stays as it was
 * ("perfect", 9 Nov; from switzerland-hero at 0:10). Each runs seven to nine
 * calm seconds at natural speed (the lion with a light colour lift, Positano
 * and Seville as shot), 1920×1080 with a 720p `-m` cut for phones and a
 * poster frame in public/images/home. If a film or poster is missing the page
 * resolves the clip to `fallback` (HomePage, on the server), an earlier clip
 * for the same place in the reel, so the reel never points at a missing file.
 */
export const reel: (ReelClip & { fallback?: ReelClip })[] = [
  {
    place: 'On safari',
    alt: 'A male lion with a full dark mane looking out across tall grass, bush behind him',
    // Shutterstock 4062868427, the master Marc bought (his note of 9 Nov):
    // the whole frame, lion, grass and bush, from 0:05.5 to its end, once he
    // has turned to look right (facing the lens, his face sits mid-frame,
    // under the headline). Not mirrored and with no `start`: the poster is
    // the cut's first frame. His nose travels between 76% and 87% of the
    // width, so a landscape screen narrower than 16:9 trims more from the
    // left than the right, and an upright one holds ear to nose.
    video: '/video/home/reel-lion-savanna.mp4',
    img: '/images/home/reel-lion-savanna.jpg',
    pos: '60% 45%',
    posM: '80% 50%',
    fallback: {
      place: 'On safari',
      alt: 'Two giraffes on golden grassland in the afternoon sun, mountains beyond',
      video: '/video/home/reel-safari-giraffes.mp4',
      img: '/images/home/reel-safari-giraffes.jpg',
    },
  },
  {
    place: 'Switzerland, by rail',
    alt: 'A red mountain train crossing an alpine meadow above the lakes of the Bernese Oberland',
    video: '/video/home/reel-swiss-rail.mp4',
    img: '/images/home/reel-swiss-rail.jpg',
    posM: '68% 50%',
    fallback: {
      place: 'Switzerland, by rail',
      alt: 'A red train curving along an alpine lake beneath low cloud in the Swiss Alps',
      video: '/video/home/reel-rail.mp4',
      img: '/images/home/reel-rail.jpg',
    },
  },
  {
    place: 'Positano, Italy',
    alt: 'Positano from the air, pastel houses stepped up the green hillside above the beach and boats at anchor in the bay',
    // Shutterstock 4088645319, the master Marc bought (his note of 9 Nov),
    // from 0:27. Vivid as shot: no grade.
    video: '/video/home/reel-positano-bay.mp4',
    img: '/images/home/reel-positano-bay.jpg',
    posM: '55% 50%',
    // The clip it replaced: Pexels 12315324 (Boris Ivas), from 0:14.
    fallback: {
      place: 'Amalfi Coast, Italy',
      alt: 'The Amalfi Coast from the air, turquoise water below cliffside hotels and the town of Amalfi',
      video: '/video/home/reel-amalfi-coast.mp4',
      img: '/images/home/reel-amalfi-coast.jpg',
      posM: '86% 50%',
    },
  },
  {
    place: 'Seville, Spain',
    alt: 'Seville at golden hour from the air, the Giralda bell tower rising above the cathedral roofs and the white city beyond',
    // Shutterstock 4107915811, the master Marc bought (his note of 9 Nov),
    // from 0:13: in place of Hvar, for a balance of destinations and
    // experiences. Cropped from the bottom, so the Giralda keeps its top on a
    // wide screen.
    video: '/video/home/reel-seville-cathedral.mp4',
    img: '/images/home/reel-seville-cathedral.jpg',
    pos: '50% 0%',
    posM: '50% 50%',
    // The clip it replaced: Pexels 16114872, slowed a touch (8 Nov).
    fallback: {
      place: 'Hvar, Croatia',
      alt: 'Hvar harbour from the air, yachts along the palm-lined quay and the old town climbing to the fortress',
      video: '/video/home/reel-hvar-harbour.mp4',
      img: '/images/home/reel-hvar-harbour.jpg',
      posM: '41% 50%',
    },
  },
];

/* 02 — Ways to experience. Photographs only: the opening reel is the
   homepage's one film (client, 30 Oct). Each way leads to its own page
   (Marc's review of 23 Nov), never to the private-travel form: Safari to the
   safari page, which lists the upcoming safari journeys. */
export const ways: (HomeVisual & {
  title: string;
  line: string;
  href: string;
  lead?: boolean;
  /** Where the upright tile crops the landscape frame (CSS object-position). */
  pos?: string;
  /**
   * A landscape photograph. An upright tile or screen covers it by its
   * height, so it is drawn about one and a half times the box's height wide,
   * and asks for a file to match (WaysToTravel, WaysStage).
   */
  wide?: boolean;
})[] = [
  {
    title: 'Small Luxury Group Journeys',
    line: 'Intimate journeys shared with a small circle of fellow travelers, bringing together exceptional places, meaningful experiences and the joy of discovering the world together.',
    href: '/journeys',
    // Marc's own Lucerne frame at full resolution (30 Oct); Private Travel and
    // Safari use the design reference's photographs (29 Oct).
    img: '/images/home/way-group-lucerne-tower.jpg',
    alt: 'The Water Tower and Chapel Bridge on the clear Reuss, Lucerne',
    lead: true,
  },
  {
    title: 'Private Travel',
    line: 'Bespoke destinations, exceptional stays and authentic experiences — exclusively designed around you and the way you love to travel.',
    href: '/experiences/private',
    img: '/images/home/way-private-venice.jpg',
    alt: 'Two spritzes on a terrace above the Grand Canal in Venice, the Salute dome beyond',
    // Cropped to the right, so both glasses stand in the upright tile (5 Nov).
    pos: '84% 50%',
    wide: true,
  },
  {
    title: 'Safari',
    line: 'Extraordinary wildlife, remarkable landscapes and intimate lodges — bringing you closer to the wild in unforgettable ways.',
    href: '/experiences/safari',
    img: '/images/drive/botswana-chobe-elephant-river.jpg',
    alt: 'An elephant drinking at the water’s edge on the Chobe River, Botswana',
  },
  {
    title: 'Cruises',
    line: 'Discover extraordinary destinations aboard handpicked luxury yachts, intimate cruises and elegant river voyages, with exceptional experiences both onboard and ashore.',
    href: '/experiences/cruises',
    // Cruises, Sports & Events and Private Villas: the client's photographs (30 Oct).
    img: '/images/home/way-cruises-ship.jpg',
    alt: 'A cruise ship from above at sunset, its decks and pools over a dark sea',
  },
  {
    title: 'Sports & Events',
    line: 'Iconic sporting events, extraordinary cultural celebrations and exceptional travel experiences — thoughtfully brought together in one unforgettable journey.',
    href: '/experiences/sports-events',
    img: '/images/home/way-sports-monaco.jpg',
    alt: 'A race car rounding the Monaco circuit beneath terraces of white umbrellas',
  },
  {
    title: 'Private Villas',
    line: 'Handpicked villas in extraordinary settings — where privacy, personalized service and unforgettable moments come together.',
    href: '/experiences/villas',
    // Pexels 24807132 (8 Nov): a private infinity pool at sunset, kept until
    // Marc sends another (Le Collectionist declined the use of its photos).
    img: '/images/home/way-villas-sunset-pool.jpg',
    alt: 'Loungers beside a private infinity pool above the sea at sunset',
    pos: '70% 50%',
    wide: true,
  },
];

/* 05 — The founder's line. */
export const statement = {
  before: 'The journeys we remember most aren’t measured by how much we see, but by how ',
  emphasis: 'deeply',
  after: ' we experience the moments along the way.',
  /* Behind it, Cape Town from the air, Lion's Head above the Atlantic seaboard
     (Marc's file of 9 Nov, shutterstock_3801312873.MOV in the Drive content
     library), played muted on a loop (5 Nov: "make sure the video is
     played"). The crop holds Lion's Head on a phone and its summit on a wide
     screen. */
  film: {
    img: '/images/home/quote-capetown.jpg',
    alt: 'Lion’s Head above the Atlantic seaboard of Cape Town, houses stepping down to surf-washed rocks, the Table Mountain range beyond',
    video: '/video/home/quote-capetown.mp4',
    pos: '32% 0%',
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
  /* Two sentences: on a phone or a tablet each starts its own line
     (home-fixes.css); on a wider screen they run on as one. No-break spaces
     after each "A", so neither leaves its first word at the end of a line. */
  headline: ['A\u00a0lifetime of travel.', 'A\u00a0passion for extraordinary journeys.'],
  /** Two short paragraphs; the Our Story page carries the rest. */
  body: [
    'Born and raised in Switzerland and based in Miami for more than 25 years, Peaks2Shores founder Marc Haeni has built an international career spanning three decades in travel and hospitality, including leadership roles with some of the world’s leading travel and cruise brands.',
    'His passion for extraordinary destinations, combined with decades of trusted industry relationships, forms the foundation of Peaks2Shores — bringing together vetted and carefully selected local experts and exceptional hospitality partners to create thoughtfully curated luxury journeys.',
  ],
  /** Marc in Solothurn, his hometown: the photograph he sent on 9 Nov, a still
      in place of the Kenya film (30 Oct). The whole frame, 3:4. */
  portrait: {
    img: '/images/home/story-marc-solothurn.jpg',
    alt: 'Marc Haeni smiling in a cobbled square in the old town of Solothurn, Switzerland, his hometown, a painted clock face and flower-boxed houses behind him',
    width: 1086,
    height: 1448,
  },
};

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
    word: 'Move',
    line: 'Hiking, sailing, cycling and skiing — the outdoors, at your own pace.',
    video: '/video/home/xp-move.mp4',
    img: '/images/home/xp-move.jpg',
    alt: 'Skiers on a sunny slope above a snow-covered Alpine village',
  },
];

/* 09 — The Circle. The photograph is the client's (9 Nov): elephants at the
   Kipalo Hills waterhole, in place of the stock Positano frame. */
export const circle = {
  headline: 'A World of Inspiration, Delivered.',
  body: 'Discover extraordinary destinations, inspiring travel stories, insider perspectives, and thoughtfully curated journeys. Join The Circle for a little inspiration from the world of Peaks2Shores, delivered to your inbox.',
  img: '/images/home/circle-kipalo-waterhole.jpg',
  alt: 'A small herd of elephants gathered at a round waterhole on red earth in golden light, green bush and rocky hills beyond, at Kipalo Hills',
};
