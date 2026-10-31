/*
 * Marc's journey flipbook (31 Oct): the order the journeys are shown in, each
 * one's headline and tagline, and the journeys still to come. Read by the
 * homepage slider and the Journeys page, so the two always agree.
 */

/** Switzerland first, then the Adriatic, then Italy. A journey not listed follows. */
export const journeyOrder = ['swiss-elegance', 'adriatic-collection', 'the-italian-experience'];

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
  'the-italian-experience': {
    title: 'Italy Uncovered',
    tagline: 'Emilia-Romagna · Lake Garda & Venice',
  },
};

/**
 * The deep colour a journey's card settles into below its photograph, drawn
 * from the place: alpine lake, Adriatic water, Venetian brick. The coming
 * journeys carry their own.
 */
export const journeyTint: Record<string, string> = {
  'swiss-elegance': '#1d4a66',
  'adriatic-collection': '#0f5767',
  'the-italian-experience': '#6a3a2a',
};

/** Where a journey stands for booking, in words. */
export const statusLabel: Record<string, string> = {
  open: 'Now booking',
  waitlist: 'Waitlist open',
  'sold-out': 'Sold out · Join the waitlist',
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
 * a way to register interest. Their photographs are stand-ins until Marc sends
 * his own (Sicily's lemons especially).
 */
export const comingSoon: ComingJourney[] = [
  {
    slug: 'soul-of-sicily',
    title: 'The Soul of Sicily',
    short: 'The Soul of Sicily',
    places: ['Sicily'],
    region: 'Italy',
    tagline: 'A Timeless Mediterranean Love Affair',
    tint: '#6b4b1c',
    dest: ['Italy'],
    inspire: ['Coast & Islands', 'Culture', 'Food & Wine'],
    photo: {
      src: '/images/g2.jpg',
      alt: 'Ripe lemons, some halved, in wooden crates',
      tone: '#a58f6a',
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
      src: '/images/dep-amalfi.jpg',
      alt: 'Positano’s pastel houses climbing the hillside above a blue sea',
      tone: '#4f8aa0',
    },
    more: [
      {
        src: '/images/home-hero.jpg',
        alt: 'A sailing boat at anchor off the Amalfi Coast, a cliffside town behind',
      },
    ],
  },
  {
    slug: 'southern-africa',
    title: 'The Rhythm of Southern Africa',
    short: 'The Rhythm of Southern Africa',
    places: ['Southern Africa'],
    region: 'Southern Africa',
    tagline: 'Cape Town · Kruger · Victoria Falls · Botswana · Zambia',
    tint: '#5a3620',
    dest: ['Southern Africa'],
    inspire: ['Nature', 'Culture'],
    photo: {
      src: '/images/drive/south-africa-safari-game-drive-sunset.jpg',
      alt: 'A safari vehicle under an acacia at sunset',
      tone: '#a8784e',
    },
    more: [
      {
        src: '/images/drive/zimbabwe-victoria-falls-gorge.jpg',
        alt: 'The gorge below Victoria Falls in spray',
      },
      {
        src: '/images/drive/botswana-chobe-elephants-floodplain.jpg',
        alt: 'Elephants on the Chobe floodplain in Botswana',
      },
    ],
  },
];
