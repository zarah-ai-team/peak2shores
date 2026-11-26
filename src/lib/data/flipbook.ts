/*
 * Marc's journey flipbook (31 Oct): the order the journeys are shown in, each
 * one's headline and tagline, and the journeys still to come. Read by the
 * homepage slider and the Journeys page, so the two always agree.
 */

/** Switzerland first, then the Adriatic, then Italy. A journey not listed follows. */
export const journeyOrder = ['swiss-elegance', 'adriatic-collection', 'italy-uncovered'];

/** A journey's place in Marc's order; unplaced journeys after. */
export const journeyRank = (slug: string) => {
  const i = journeyOrder.indexOf(slug);
  return i < 0 ? journeyOrder.length : i;
};

/** Each journey's headline and tagline as in the flipbook. */
export const flipbook: Record<string, { title: string; short?: string; tagline: string }> = {
  'swiss-elegance': {
    title: 'Swiss Elegance, Italian Lakes & Milanese Flair',
    tagline: 'Where Storybook Villages Meet Italy’s Stunning Contrasts',
  },
  'adriatic-collection': {
    title: 'The Adriatic Collection',
    tagline: 'From Venice to Dubrovnik',
  },
  'italy-uncovered': {
    title: 'Italy Uncovered',
    tagline: 'Emilia-Romagna · Lake Garda & Venice',
  },
};

/**
 * The deep colour a journey's card settles into below its photograph: alpine
 * lake for Swiss Elegance, Adriatic water for The Adriatic Collection and the
 * house navy (#0e2f42) for Italy Uncovered. No brown anywhere (the owner's
 * decision of 18 November 2026). Each holds every line on the card: white
 * from 8.1:1 and the water-blue "Itinerary" label from 4.6:1 (on the navy,
 * 14:1 and 7.9:1), and the navy stays apart from the other two side by side.
 * The coming journeys carry their own.
 */
export const journeyTint: Record<string, string> = {
  'swiss-elegance': '#1d4a66',
  'adriatic-collection': '#0f5767',
  'italy-uncovered': '#0e2f42',
};

export type ComingJourney = {
  slug: string;
  title: string;
  /** The name on a small card. */
  short: string;
  /** The place words in the title, set in blue. */
  places: string[];
  region: string;
  tagline: string;
  tint: string;
  /** The destinations it counts under on the Journeys page. */
  dest: string[];
  inspire: string[];
  photo: { src: string; alt: string; tone: string };
  /** More photographs to browse on its card. */
  more?: { src: string; alt: string }[];
};

/**
 * The flipbook's journeys that have no page yet: shown as "coming soon", with
 * a way to register interest. Each with its photograph in the Journey Book
 * ("Journeys on the horizon", pages 21-25; Ishika's notes of 24 November
 * 2026), in place of the old draft photographs (the lemons, Amalfi): the
 * Journey Book's own files (public/journey-book/img), or the same photograph
 * at full size where the client's Drive has it (public/images/drive).
 */
export const comingSoon: ComingJourney[] = [
  {
    slug: 'soul-of-sicily',
    title: 'The Soul of Sicily',
    short: 'The Soul of Sicily',
    places: ['Sicily'],
    region: 'Italy',
    tagline: 'A Timeless Mediterranean Love Affair',
    // The house charcoal, dark as Etna's stone.
    tint: '#232422',
    dest: ['Italy'],
    inspire: ['Coast & Islands', 'Culture', 'Food & Wine'],
    photo: {
      src: '/journey-book/img/sicily.jpg',
      alt: 'Cefalù and its cathedral below La Rocca on the Sicilian coast',
      tone: '#5f7a80',
    },
  },
  {
    slug: 'southern-italy',
    title: 'Experience La Dolce Vita in Southern Italy',
    short: 'La Dolce Vita in Southern Italy',
    places: ['Southern Italy'],
    region: 'Italy',
    tagline: 'From Puglia to the Amalfi Coast and the Allure of Capri',
    tint: '#16526a',
    dest: ['Italy'],
    inspire: ['Coast & Islands', 'Food & Wine'],
    photo: {
      src: '/journey-book/img/positano.jpg',
      alt: 'Positano on the cliffs of the Amalfi Coast above a sea dotted with boats',
      tone: '#4f8aa0',
    },
  },
  {
    slug: 'southern-africa',
    title: 'The Rhythm of Southern Africa',
    short: 'The Rhythm of Southern Africa',
    places: ['Southern Africa'],
    region: 'Southern Africa',
    tagline: 'Cape Town · Kruger · Victoria Falls · Botswana · Zambia',
    // The house navy-deep, the night over the bush.
    tint: '#0a2232',
    dest: ['Southern Africa'],
    inspire: ['Nature', 'Culture'],
    // The Journey Book's game drive, Zambezi sunset and Chobe elephant, at
    // full size from the client's Drive.
    photo: {
      src: '/images/drive/south-africa-safari-game-drive-sunset.jpg',
      alt: 'A safari vehicle under an acacia at sunset',
      tone: '#5d6b70',
    },
    more: [
      {
        src: '/images/drive/zimbabwe-zambezi-sunset-cruise.jpg',
        alt: 'A river boat on the Zambezi at sunset',
      },
      {
        src: '/images/drive/botswana-chobe-elephant-river.jpg',
        alt: 'An elephant drinking in the Chobe River in Botswana',
      },
    ],
  },
];
