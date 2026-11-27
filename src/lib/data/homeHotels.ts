import { getMedia, type MediaKey } from '@/lib/media';
import type { HomeVisual } from './home';

/*
 * 08 — Hotels & lodges: the homepage's cards that turn over, and the fuller
 * list on /where-we-stay (moved here from home.ts for Marc's review of
 * 23 Nov 2026). Each place has two photographs: the hotel on the front, the
 * place around it on the turned side. Every front is a landscape photograph
 * in an upright card, which shows its full height and about half its width:
 * `pos` says which part. /where-we-stay crops the front to 4:3 at the same
 * point, and where the hotel stands right of the middle, the second
 * photograph overlaps the other corner of the first.
 *
 * The review's changes: The Omnia (Zermatt) takes the homepage card of the
 * Mandarin Oriental Palace (Lucerne), which is no longer on the journeys;
 * Hotel Schweizerhof Luzern and Villa e Palazzo Aminta, which replace it and
 * Hotel La Palma on Swiss Elegance, are on /where-we-stay. Marc does not
 * need Villa e Palazzo Aminta on the homepage, and it joins the cards only
 * with excellent photographs: its website has them at 1024px, too small for
 * a card on a large screen, so the homepage shows four hotels until the
 * hotel sends larger ones. Cardamom House shows the whole of Marc's aerial
 * (zoomed out to the house with its pool).
 *
 * The notes are Marc's own words where he wrote them (9 Nov). The new
 * hotels' "Signature detail" lines are drafted from each hotel's own facts,
 * for Marc to approve; their "Nearby" lines keep his words for Lucerne and
 * Stresa. The hotels' photographs are credited on /credits.
 */

/**
 * Marc's note on the hotels (his review of 23 Nov 2026): under the Hotels &
 * Lodges subheading on the homepage, at the top of "Where you'll stay" on each
 * journey page, and under the title of /where-we-stay.
 */
export const staysNote =
  'A curated selection of hotels and lodges that capture the spirit and standard of our stays. Final properties are thoughtfully chosen for each journey and may vary by departure.';

/**
 * Marc's wording for every journey's hotels (his brief of 27 Nov 2026, for The
 * Soul of Sicily, "the same wording ... across all our journeys"): after the
 * note above, at the top of "Where you'll stay" on each journey page.
 */
export const staysIntended =
  'These are our intended hotels, subject to availability at the time of final journey confirmation; should one be unavailable, a similar alternative of the same standard is chosen.';

export type StayHotel = HomeVisual & {
  place: string;
  name: string;
  signature: string;
  nearby: string;
  /** A second view of the place, on the turned-over side. Falls back to the front. */
  back?: string;
  backAlt?: string;
  /**
   * Where the second view's crop centres (CSS object-position). The vertical
   * part places the band on the turned card; the horizontal part places the
   * upright frame on /where-we-stay.
   */
  backPos?: string;
  /** One of the homepage's cards, as well as a row on /where-we-stay. */
  home: boolean;
};

/** One of Marc's photographs, from the registry (src/lib/media.ts). */
const still = (key: MediaKey): Pick<HomeVisual, 'img' | 'alt'> => {
  const slot = getMedia(key);
  return { img: slot.src ?? '', alt: slot.alt ?? '' };
};

/** Every hotel, in the order of /where-we-stay: Swiss Elegance's, then the rest. */
export const stayHotels: StayHotel[] = [
  {
    place: 'Lucerne | Switzerland',
    name: 'Hotel Schweizerhof Luzern',
    home: false,
    signature:
      'Nineteenth-century grandeur meets contemporary comfort on the shores of Lake Lucerne, where every room tells the story of a celebrated guest.',
    nearby:
      'Explore Lucerne’s charming Old Town, discover the “Queen of the Mountains,” or cruise across the lake into the heart of the Swiss Alps.',
    // The hotel's own photograph (hotels.ts, credited on /credits).
    img: '/images/hotels/schweizerhof-luzern/01-hotel-at-blue-hour.jpg',
    alt: 'Hotel Schweizerhof Luzern lit up at dusk on the Schweizerhofquai, its facade and the Swiss flag reflected in Lake Lucerne',
    // The turned side keeps the lake boat at Lucerne's quay (Marc, 23 Nov:
    // "Backside picture can be retained").
    back: '/images/home/hotel-mandarin-lake-steamer.jpg',
    backAlt:
      'A lake boat at the quay in Lucerne, flying the Swiss flag, the old town along the shore',
    backPos: '50% 56%',
  },
  {
    place: 'Zermatt | Switzerland',
    name: 'The Omnia',
    home: true,
    signature:
      'A contemporary mountain lodge perched on a rock above Zermatt, where Alpine design and warm, personal hospitality meet breathtaking views of the Matterhorn.',
    nearby:
      'Wander Zermatt’s charming car-free village, ride the mountain railways to spectacular Matterhorn panoramas, or ski and hike among the highest peaks of the Swiss Alps.',
    // The lodge's outdoor whirlpool and the Matterhorn (its own photograph).
    // The guest's head is at 27% of the width and the summit at 56%, so the
    // card holds both from a phone's 320px up; the village at night, from
    // above, on the back.
    img: '/images/hotels/the-omnia-zermatt/02-whirlpool-and-matterhorn.jpg',
    alt: 'A guest in The Omnia’s outdoor whirlpool, looking across Zermatt to the Matterhorn',
    pos: '35% 50%',
    back: '/images/hotels/the-omnia-zermatt/06-zermatt-at-night.jpg',
    backAlt:
      'Zermatt at night under falling snow, its lit church and snowy chalet roofs seen from above',
    backPos: '46% 52%',
  },
  {
    place: 'Stresa | Italy',
    name: 'Villa e Palazzo Aminta',
    home: false,
    signature:
      'Classic Italian grandeur on the shores of Lake Maggiore, with lush gardens, a lakeside pool and sweeping views across the Borromean Islands.',
    nearby:
      'Explore the enchanting Borromean Islands, stroll through Stresa’s charming lakeside streets, or venture into the surrounding mountains for spectacular panoramic views.',
    // The villa stands on the right of its photograph, Isola Bella on the left.
    img: '/images/hotels/villa-aminta-stresa/01-villa-and-isola-bella.jpg',
    alt: 'Villa e Palazzo Aminta above Lake Maggiore, Isola Bella and the mountains across the water',
    pos: '72% 50%',
    back: '/images/hotels/villa-aminta-stresa/06-isola-bella-at-night.jpg',
    backAlt: 'Isola Bella and the Borromeo palace lit up at dusk on Lake Maggiore',
    backPos: '66% 50%',
  },
  {
    place: 'Victoria Falls | Zimbabwe',
    name: 'The Palm River Hotel',
    home: true,
    signature:
      'Understated riverside luxury on the banks of the Zambezi, where lush gardens meet the wilderness and elephants occasionally wander past.',
    nearby:
      'Marvel at the thundering Victoria Falls, enjoy a sunset cruise along the Zambezi, or discover the wildlife of nearby Zambezi National Park.',
    ...still('client-hotel-victoria-falls'),
    // Two buildings with a gap between them: the card holds the lit guest wing.
    pos: '90% 50%',
    // The falls, the gorge and the bridge fill the frame: its centre suits
    // both the band and the upright frame, so no `backPos`.
    back: '/images/home/hotel-palm-river-victoria-falls.jpg',
    backAlt:
      'Victoria Falls and the Victoria Falls Bridge from the air, spray rising from the gorge',
  },
  {
    place: 'Rovinj | Croatia',
    name: 'Grand Park Hotel Rovinj',
    home: true,
    signature:
      'Contemporary Mediterranean elegance overlooking Rovinj’s picturesque Old Town, where breathtaking Adriatic views meet exceptional design and understated luxury.',
    nearby:
      'Wander Rovinj’s charming cobblestone streets, explore the beautiful Istrian countryside with its vineyards and truffle treasures, or sail along the Adriatic coast.',
    // The hotel from outside and the Old Town from the air (9 Nov), in place
    // of the room and the pool (8 Nov). The card holds the glass canopy and
    // the garden terraces; the hotel fills only the lower half of this frame.
    ...still('client-hotel-rovinj'),
    pos: '72% 50%',
    back: '/images/home/hotel-grand-park-rovinj-aerial.jpg',
    backAlt:
      'The Old Town of Rovinj and the bell tower of St. Euphemia from the air, wooded islands in the Adriatic beyond',
    backPos: '24% 75%',
  },
  {
    place: 'Vipingo | Kenya',
    name: 'Cardamom House',
    home: true,
    signature:
      'An intimate coastal hideaway overlooking the Indian Ocean, where Swahili-inspired elegance, barefoot luxury and warm Kenyan hospitality create a truly personal escape.',
    nearby:
      'Discover pristine beaches and turquoise waters, explore the vibrant Swahili culture of the Kenyan coast, or sail the Indian Ocean aboard a traditional dhow.',
    // Marc's aerial of 9 Nov uncropped (zoomed out, 23 Nov): the house under
    // its thatched roof above the pool. The card holds the house and most of
    // the pool; the estate from higher up on the back.
    ...still('client-hotel-vipingo'),
    pos: '55% 50%',
    back: '/images/home/hotel-cardamom-estate-aerial.jpg',
    backAlt:
      'Cardamom House from the air, its white roof terraces among the trees above the beach and the Indian Ocean, Vipingo',
    backPos: '50% 60%',
  },
];

/** The homepage's cards: four while Villa e Palazzo Aminta awaits larger photographs. */
export const homeHotels = stayHotels.filter((hotel) => hotel.home);
