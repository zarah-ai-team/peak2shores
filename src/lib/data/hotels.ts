/*
 * The hotels of the three launch journeys, for the stay cards and the hotel
 * pop-ups on the journey pages (Ishika's notes of 9 Nov 2026, item 23, and the
 * owner's decision of 18 Nov 2026).
 *
 * Each record holds the hotel's own website, short write-ups for the tabs its
 * official information supports, and its photographs. The write-ups are our
 * own words, written from the facts the hotel publishes on its official site
 * (for the JW Marriott Venice, whose page refuses automated readers, from
 * Marriott's own Traveler magazine); nothing in them comes from anywhere else.
 * The photographs come from the hotel's official website or its group's
 * official image servers, saved under public/images/hotels/<id>/ at up to
 * 2400px wide; each carries the credit the hotel gives and the page it was
 * taken from, and each is listed on /credits.
 *
 * The Hotel Excelsior Dubrovnik is the exception: its own photographs have not
 * been saved here yet (from its page on adriaticluxuryhotels.com, or the
 * Adriatic Luxury Hotels press library, which needs an account), so it shows a
 * licensed photograph of Dubrovnik from the site's own library (`place: true`)
 * until they are.
 */

/** The tabs a hotel pop-up can have, in the order they appear. */
export type HotelTabId = 'hotel' | 'rooms' | 'dining' | 'spa' | 'nearby';

/** Each tab's label in the pop-up. */
export const hotelTabLabels: Record<HotelTabId, string> = {
  hotel: 'The Hotel',
  rooms: 'The Rooms',
  dining: 'Dining',
  spa: 'Spa & Wellness',
  nearby: 'Nearby',
};

export type HotelPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The tab the photograph belongs with; choosing that tab brings it up in the gallery. */
  tab?: HotelTabId;
  /** The credit as the hotel (or the library) gives it. */
  credit: string;
  /** The page the photograph was taken from. */
  source: string;
  /** A photograph of the town, shown until the hotel's own photographs are supplied. */
  place?: boolean;
};

export type HotelRecord = {
  id: string;
  /** The name as the journey lists it. */
  name: string;
  /** The stay it belongs to, as the journey lists it ("Lucerne"). */
  place: string;
  country: string;
  /** The hotel's official website. */
  url: string;
  /** Marc has still to confirm the hotel (from the journey data). */
  unconfirmed?: boolean;
  /** The tabs the hotel's official information supports, each one to three sentences. */
  tabs: { id: HotelTabId; text: string }[];
  /** The first photograph is the hotel's card on the journey page. */
  photos: HotelPhoto[];
};

type Shot = Omit<HotelPhoto, 'credit' | 'source'> & { source?: string };

/** A hotel's photographs, all under one credit and, unless a photograph says otherwise, from one page. */
const shots = (credit: string, source: string, list: Shot[]): HotelPhoto[] =>
  list.map((shot) => ({ ...shot, credit, source: shot.source ?? source }));

export const hotels: HotelRecord[] = [
  /* -- Swiss Elegance, Italian Lakes & Milanese Flair --------------------------- */
  {
    id: 'mandarin-oriental-luzern',
    name: 'Mandarin Oriental Palace, Luzern',
    place: 'Lucerne',
    country: 'Switzerland',
    url: 'https://www.mandarinoriental.com/en/luzern/palace',
    tabs: [
      {
        id: 'hotel',
        text: 'A Belle Époque palace on the shore of Lake Lucerne, its historic architecture paired with contemporary interiors. Afternoon tea is served in the Belle Époque veranda, which looks across the lake to the mountains.',
      },
      {
        id: 'rooms',
        text: 'Rooms and suites in calm Swiss and Mediterranean colors, the suites with bespoke artworks of their own. Many lake-side rooms have a balcony or a terrace, and the duplex rooftop terrace suites look out over the water to the peaks.',
      },
      {
        id: 'dining',
        text: 'Four restaurants and the Palace bar, led by executive chef Gilad Peled. Colonnade (modern French) and Minamo (an eight-seat Japanese omakase) both hold a Michelin star, and Mediterranean cooking is served through the day, including on a terrace by the lake.',
      },
      {
        id: 'spa',
        text: 'Tailored face and body treatments at the hotel’s Ambassade Biologique Recherche, with a gym, a sauna and a steam bath.',
      },
      {
        id: 'nearby',
        text: 'The hotel stands on Haldenstrasse by the lake, five minutes by taxi from Lucerne station; Zurich is about an hour away by direct train.',
      },
    ],
    photos: shots(
      '© Mandarin Oriental Hotel Group',
      'https://www.mandarinoriental.com/en/luzern/palace/gallery',
      [
        {
          src: '/images/hotels/mandarin-oriental-luzern/01-lakeside-palace.jpg',
          alt: 'Mandarin Oriental Palace, Luzern, its domed corner tower above the lakeside promenade, Lake Lucerne and the mountains beyond',
          width: 1985,
          height: 1486,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/mandarin-oriental-luzern/02-lake-view-junior-suite.jpg',
          alt: 'A Lake View Junior Suite: a wide bed, a parquet floor and doors open to a balcony over the lake',
          width: 2400,
          height: 1601,
          tab: 'rooms',
        },
        {
          src: '/images/hotels/mandarin-oriental-luzern/03-lake-view-suite-terrace.jpg',
          alt: 'A suite terrace laid for dinner at dusk, Lake Lucerne and the mountains beyond',
          width: 2400,
          height: 1601,
        },
        {
          src: '/images/hotels/mandarin-oriental-luzern/04-colonnade-restaurant.jpg',
          alt: 'The Colonnade restaurant: marble columns, a checkered floor and tables set beneath chandeliers',
          width: 2400,
          height: 1601,
          tab: 'dining',
        },
        {
          src: '/images/hotels/mandarin-oriental-luzern/05-spa-treatment-room.jpg',
          alt: 'A treatment room for two in the spa, its massage beds in soft daylight',
          width: 2400,
          height: 1601,
          tab: 'spa',
        },
        {
          src: '/images/hotels/mandarin-oriental-luzern/06-lucerne-at-dusk.jpg',
          alt: 'Lucerne’s lakefront lit up at dusk, swans on the still water',
          width: 2400,
          height: 1601,
          tab: 'nearby',
        },
      ],
    ),
  },
  {
    id: 'bergwelt-grindelwald',
    name: 'Hotel Bergwelt Grindelwald',
    place: 'Grindelwald',
    country: 'Switzerland',
    url: 'https://bergwelt-grindelwald.com/en/',
    tabs: [
      {
        id: 'hotel',
        text: 'An alpine design resort in Grindelwald, facing the Eiger, Mönch and Jungfrau and built with Swiss wood and designer furniture. It is part of The Living Circle hotel group.',
      },
      {
        id: 'rooms',
        text: '90 rooms, suites and residences, each with a private balcony facing the mountains. The Eiger View rooms and suites look straight at the Eiger.',
      },
      {
        id: 'dining',
        text: 'BG’s Grill cooks over a wood fire, Almer’s serves fondue in honor of the mountain guide Christian Almer, and the Seven Spirits Bar mixes its own signature cocktails. The Other Club is a fireside lounge for cigars.',
      },
      {
        id: 'spa',
        text: 'The Fire & Ice Spa is for adults (16 and over): four saunas, a steam bath, indoor and outdoor pools, an ice fountain and a rest room with mountain views. Guests reserve a 90-minute visit on arrival.',
      },
      {
        id: 'nearby',
        text: 'Grindelwald lies at the foot of the Eiger, with mountain railways and cable cars climbing from the village into the Jungfrau region.',
      },
    ],
    photos: shots('© Bergwelt Grindelwald', 'https://bergwelt-grindelwald.com/en/', [
      {
        src: '/images/hotels/bergwelt-grindelwald/01-chalets-and-pool.jpg',
        alt: 'Bergwelt Grindelwald’s timber chalet buildings above a steaming outdoor pool, snowy peaks behind',
        width: 2400,
        height: 2355,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/bergwelt-grindelwald/02-lounge.jpg',
        alt: 'The lounge: orange armchairs and a long sofa beneath a timber ceiling and globe lights',
        width: 2400,
        height: 1601,
      },
      {
        src: '/images/hotels/bergwelt-grindelwald/03-grill-restaurant.jpg',
        alt: 'A restaurant table laid with glasses and folded napkins, red banquettes and checked chairs around it',
        width: 2400,
        height: 1600,
        tab: 'dining',
      },
      {
        src: '/images/hotels/bergwelt-grindelwald/04-pinte.jpg',
        alt: 'A wood-paneled dining corner, a table for four laid beside the window',
        width: 2400,
        height: 1601,
      },
      {
        src: '/images/hotels/bergwelt-grindelwald/05-spa-fireplace.jpg',
        alt: 'A spa rest room lined in pale wood, a round hanging fireplace in the middle',
        width: 2400,
        height: 1601,
        tab: 'spa',
      },
      {
        src: '/images/hotels/bergwelt-grindelwald/06-eiger-view.jpg',
        alt: 'The Eiger framed by a window, chalet roofs in the foreground',
        width: 2400,
        height: 1601,
        tab: 'nearby',
      },
    ]),
  },
  {
    id: 'fairmont-montreux',
    name: 'Fairmont Le Montreux Palace',
    place: 'Montreux',
    country: 'Switzerland',
    url: 'https://www.fairmont.com/en/hotels/montreux/fairmont-le-montreux-palace.html',
    tabs: [
      {
        id: 'hotel',
        text: 'A Belle Époque grand hotel on Lake Geneva, opened in 1906, with the Alps across the water. Its historic salons host a Sunday brunch.',
      },
      {
        id: 'rooms',
        text: '236 rooms and suites, many with a balcony over the lake and the Alps. Renovated rooms borrow their soft colors from the lake, and the bathrooms carry Le Labo products.',
      },
      {
        id: 'dining',
        text: 'The Montreux Jazz Café takes its spirit from the festival, Funky Claude’s Bar has live music from Thursday to Saturday, and in summer La Terrasse du Petit Palais serves Mediterranean dishes above the lake. Breakfast is at La Palmeraie, looking over the water.',
      },
      {
        id: 'spa',
        text: 'A 2,000 m² Fairmont Spa with indoor and outdoor pools and treatments by Swiss Perfection.',
      },
      {
        id: 'nearby',
        text: 'The hotel looks over Lake Geneva from the heart of Montreux; Chillon Castle and the Lavaux vineyard terraces are a short trip along the shore.',
      },
    ],
    photos: shots(
      '© Fairmont Hotels & Resorts, part of Accor',
      'https://www.fairmont.com/en/hotels/montreux/fairmont-le-montreux-palace.html',
      [
        {
          src: '/images/hotels/fairmont-montreux/01-belle-epoque-facade.jpg',
          alt: 'The Belle Époque facade of Fairmont Le Montreux Palace, the Swiss flag on its roof',
          width: 2400,
          height: 1601,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/fairmont-montreux/02-grand-hall.jpg',
          alt: 'A high Belle Époque hall with chandeliers, arched windows and a grand piano',
          width: 2400,
          height: 1601,
        },
        {
          src: '/images/hotels/fairmont-montreux/03-lake-view-room.jpg',
          alt: 'A light guest room in soft blues, a balcony door open to Lake Geneva',
          width: 2400,
          height: 1601,
          tab: 'rooms',
          source:
            'https://www.fairmont.com/en/hotels/montreux/fairmont-le-montreux-palace/rooms.html',
        },
        {
          src: '/images/hotels/fairmont-montreux/04-glass-roofed-restaurant.jpg',
          alt: 'A restaurant under a glass roof, tables laid beside tall windows on the lake',
          width: 2400,
          height: 1601,
          tab: 'dining',
        },
        {
          src: '/images/hotels/fairmont-montreux/05-indoor-pool.jpg',
          alt: 'The indoor pool, guests in the water and daylight through the windows',
          width: 2400,
          height: 1601,
          tab: 'spa',
          source:
            'https://www.fairmont.com/en/hotels/montreux/fairmont-le-montreux-palace/wellness.html',
        },
        {
          src: '/images/hotels/fairmont-montreux/06-balcony-lake-view.jpg',
          alt: 'A wrought-iron balcony above the gardens, Lake Geneva and the Alps beyond',
          width: 2400,
          height: 1601,
          tab: 'nearby',
        },
      ],
    ),
  },
  {
    id: 'zermatterhof',
    name: 'Grand Hotel Zermatterhof',
    place: 'Zermatt',
    country: 'Switzerland',
    // The English version of the hotel's site; its plain address opens in German.
    url: 'https://www.zermatterhof.ch/?lang=en',
    unconfirmed: true,
    tabs: [
      {
        id: 'hotel',
        text: 'A historic grand hotel in the heart of car-free Zermatt, built as a community project by the village’s own families and run by the local burgher community since 1920.',
      },
      {
        id: 'rooms',
        text: 'Rooms and suites in a classic alpine style, the suites paneled in Swiss pine, many with a view of the Matterhorn and some with a balcony or a fireplace. Each room has its own locker in the ski room.',
      },
      {
        id: 'dining',
        text: 'Alpine Gourmet Prato Borni, under chef Stefan Lünse, pairs Valais produce with international technique. Lusi is a French-style brasserie, saycheese! serves fondue and raclette, and the Stars Bar has live piano music in the winter season.',
      },
      {
        id: 'spa',
        text: 'The Vita Borni spa has a 15-meter indoor pool, two whirlpools with Matterhorn views, saunas, a steam bath, experience showers and an ice fountain.',
      },
      {
        id: 'nearby',
        text: 'Zermatt is free of cars, and the Gornergrat railway and the cable cars toward the Matterhorn leave from the village.',
      },
    ],
    photos: shots('© Grand Hotel Zermatterhof', 'https://www.zermatterhof.ch/', [
      {
        src: '/images/hotels/zermatterhof/01-carriage-and-hotel.jpg',
        alt: 'A horse-drawn carriage in front of the Grand Hotel Zermatterhof, the village church beside it',
        width: 1920,
        height: 1372,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/zermatterhof/02-guest-room.jpg',
        alt: 'A guest room in warm tones, a double bed and a tall window onto a balcony',
        width: 1920,
        height: 1299,
        tab: 'rooms',
        source: 'https://www.zermatterhof.ch/sleep/',
      },
      {
        src: '/images/hotels/zermatterhof/03-matterhorn-window.jpg',
        alt: 'The Matterhorn seen through the window of a guest room',
        width: 1920,
        height: 1276,
        source: 'https://www.zermatterhof.ch/sleep/',
      },
      {
        src: '/images/hotels/zermatterhof/04-prato-borni.jpg',
        alt: 'A round table laid with white linen in the Prato Borni restaurant, arched windows on the garden',
        width: 1920,
        height: 1295,
        tab: 'dining',
        source: 'https://www.zermatterhof.ch/restaurants-and-bars/',
      },
      {
        src: '/images/hotels/zermatterhof/05-spa-pool.jpg',
        alt: 'The spa’s indoor pool, loungers along a wall of warm stone and timber',
        width: 2400,
        height: 1600,
        tab: 'spa',
        source: 'https://www.zermatterhof.ch/spa/',
      },
      {
        src: '/images/hotels/zermatterhof/06-matterhorn.jpg',
        alt: 'The Matterhorn under a blue sky, a green alpine meadow below',
        width: 1920,
        height: 1080,
        tab: 'nearby',
      },
    ]),
  },
  {
    id: 'la-palma-stresa',
    name: 'Hotel La Palma',
    place: 'Stresa',
    country: 'Italy',
    url: 'https://www.hlapalma.it/en/',
    tabs: [
      {
        id: 'hotel',
        text: 'A contemporary, family-run hotel on the shore of Lake Maggiore, a few minutes’ walk from the center of Stresa. A flower garden lies between the hotel and the water.',
      },
      {
        id: 'rooms',
        text: 'All rooms and suites open through French windows onto a balcony or a terrace. The Junior Suites, the hotel’s signature rooms, look over the lake toward the Borromean Islands.',
      },
      {
        id: 'dining',
        text: 'The restaurant looks onto the garden and the lake and cooks seasonal dishes with Piedmontese roots. From April to October the rooftop Sky Bar serves aperitifs and cocktails with a view across the lake.',
      },
      {
        id: 'spa',
        text: 'A lakefront infinity pool of about 22 meters with whirlpools, and a rooftop Sky Pool joined to the spa, which has a jacuzzi, a sauna, a salt room and treatments. The gym is equipped by Technogym.',
      },
      {
        id: 'nearby',
        text: 'Boats from Stresa reach the three Borromean Islands: Isola Bella, Isola dei Pescatori and Isola Madre. The Mottarone and Orta San Giulio are close by.',
      },
    ],
    photos: shots('© Hotel La Palma', 'https://www.hlapalma.it/en/', [
      {
        src: '/images/hotels/la-palma-stresa/01-garden-and-hotel.jpg',
        alt: 'The garden of Hotel La Palma: lawn, flower beds and armchairs under a spreading tree',
        width: 1600,
        height: 1067,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/la-palma-stresa/02-lake-view-room.jpg',
        alt: 'A guest room opening onto a balcony over Lake Maggiore',
        width: 1400,
        height: 934,
        tab: 'rooms',
        source: 'https://www.hlapalma.it/en/rooms/',
      },
      {
        src: '/images/hotels/la-palma-stresa/03-restaurant.jpg',
        alt: 'The restaurant’s glass wall onto the garden, tables laid for lunch',
        width: 2000,
        height: 1333,
        tab: 'dining',
        source: 'https://www.hlapalma.it/en/concept/',
      },
      {
        src: '/images/hotels/la-palma-stresa/04-sky-bar.jpg',
        alt: 'The rooftop Sky Bar terrace, sofas and low tables above Lake Maggiore',
        width: 2109,
        height: 1406,
        tab: 'nearby',
        source: 'https://www.hlapalma.it/en/sky-bar/',
      },
      {
        src: '/images/hotels/la-palma-stresa/05-lakeside-pool.jpg',
        alt: 'An infinity pool at the water’s edge, a row of parasols along Lake Maggiore',
        width: 2000,
        height: 1333,
        tab: 'spa',
        source: 'https://www.hlapalma.it/en/concept/',
      },
      {
        src: '/images/hotels/la-palma-stresa/06-sky-pool.jpg',
        alt: 'The rooftop pool and sun loungers looking over the lake and the hills',
        width: 2000,
        height: 1334,
        source: 'https://www.hlapalma.it/en/concept/',
      },
    ]),
  },
  {
    id: 'palazzo-cordusio-milan',
    name: 'Palazzo Cordusio Gran Meliá',
    place: 'Milan',
    country: 'Italy',
    url: 'https://www.melia.com/en/hotels/italy/milan/palazzo-cordusio-gran-melia',
    tabs: [
      {
        id: 'hotel',
        text: 'The first Gran Meliá in Milan, in a 19th-century palazzo on Piazza Cordusio designed by Luca Beltrami and once the headquarters of Assicurazioni Generali. Two rooftop terraces look toward the Duomo.',
      },
      {
        id: 'rooms',
        text: 'Rooms and suites furnished with Rubelli fabrics, the suites also with Molteni pieces. Some suites look onto the Castello Sforzesco or have a balcony facing the Duomo.',
      },
      {
        id: 'dining',
        text: 'Giardino Cordusio is a cocktail bar and restaurant styled as a garden beneath chandeliers, Sachi serves Japanese cuisine and Café Kitsuné specialty coffee and matcha. Isola, on the roof, is the place for an aperitif with a view.',
      },
      {
        id: 'spa',
        text: 'An adults-only spa (18 and over) with a large indoor pool, a water circuit, a sauna, a steam room and a gym.',
      },
      {
        id: 'nearby',
        text: 'The Duomo and the Galleria Vittorio Emanuele II are a few minutes away on foot, with La Scala, the Castello Sforzesco and the fashion district close by.',
      },
    ],
    photos: shots(
      '© Meliá Hotels International',
      'https://www.melia.com/en/hotels/italy/milan/palazzo-cordusio-gran-melia',
      [
        {
          src: '/images/hotels/palazzo-cordusio-milan/01-palazzo-facade.jpg',
          alt: 'The ornate stone facade of the Palazzo Cordusio, its mosaic and clock tower above the street',
          width: 2400,
          height: 1600,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/palazzo-cordusio-milan/02-junior-suite.jpg',
          alt: 'A Junior Suite with a king bed, a chaise longue and a small dining table by the window',
          width: 2400,
          height: 1600,
          tab: 'rooms',
        },
        {
          src: '/images/hotels/palazzo-cordusio-milan/03-giardino-cordusio.jpg',
          alt: 'The Giardino Cordusio restaurant beneath crystal chandeliers, palms and plants between the tables',
          width: 2400,
          height: 1681,
          tab: 'dining',
        },
        {
          src: '/images/hotels/palazzo-cordusio-milan/04-rooftop-terrace.jpg',
          alt: 'The rooftop terrace with armchairs and parasols, Milan’s rooftops and towers beyond',
          width: 2400,
          height: 1602,
        },
        {
          src: '/images/hotels/palazzo-cordusio-milan/05-spa-pool.jpg',
          alt: 'The spa’s indoor pool with a waterfall spout and lounge chairs beneath chandeliers',
          width: 2400,
          height: 1600,
          tab: 'spa',
        },
        {
          src: '/images/hotels/palazzo-cordusio-milan/06-piazza-cordusio.jpg',
          alt: 'Piazza Cordusio and the center of Milan from above, the spires of the Duomo on the skyline',
          width: 2400,
          height: 1350,
          tab: 'nearby',
        },
      ],
    ),
  },

  /* -- Italy Uncovered ------------------------------------------------------------ */
  {
    id: 'majestic-bologna',
    name: 'Grand Hotel Majestic già Baglioni',
    place: 'Bologna',
    country: 'Italy',
    url: 'https://grandhotelmajestic.duetorrihotels.com/en',
    tabs: [
      {
        id: 'hotel',
        text: 'Set in an 18th-century palazzo in central Bologna, the hotel has received guests for more than a century, from royalty and politicians to Nobel laureates and film stars.',
      },
      {
        id: 'rooms',
        text: '106 rooms furnished in Venetian and 19th-century French style with antique pieces. Suites are named after artists such as Giambologna and Guido Reni, and the Giuseppe Verdi Royal Suite after the composer.',
      },
      {
        id: 'dining',
        text: 'I Carracci serves Emilian cooking beneath a 16th-century vaulted ceiling frescoed by the school of the Carracci brothers. Café Marinetti has a pianist, and the hotel keeps a historic wine cellar.',
      },
      {
        id: 'nearby',
        text: 'Bologna’s cathedral, museums, theaters and galleries are a short walk away.',
      },
    ],
    photos: shots(
      '© Grand Hotel Majestic già Baglioni',
      'https://grandhotelmajestic.duetorrihotels.com/en/luxury-hotel-italy-5-stars-bologna/rooms-suites',
      [
        {
          src: '/images/hotels/majestic-bologna/01-terrace-over-bologna.jpg',
          alt: 'A suite’s private terrace among plants, Bologna’s red rooftops and towers beyond',
          width: 1440,
          height: 800,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/majestic-bologna/02-junior-suite.jpg',
          alt: 'A Junior Suite with a canopied bed, silk drapes and antique furniture',
          width: 1440,
          height: 800,
          tab: 'rooms',
        },
        {
          src: '/images/hotels/majestic-bologna/03-frescoed-ceiling.jpg',
          alt: 'A painted Renaissance ceiling with mythological figures in an ornate frame',
          width: 1440,
          height: 800,
          source:
            'https://grandhotelmajestic.duetorrihotels.com/en/luxury-hotel-italy-5-stars-bologna/hotel',
        },
        {
          src: '/images/hotels/majestic-bologna/04-i-carracci.jpg',
          alt: 'The I Carracci restaurant, round tables laid beneath a frescoed vaulted ceiling',
          width: 1440,
          height: 800,
          tab: 'dining',
          source:
            'https://grandhotelmajestic.duetorrihotels.com/en/luxury-hotel-italy-5-stars-bologna/i-carracci-restaurant',
        },
        {
          src: '/images/hotels/majestic-bologna/05-majestic-terraces.jpg',
          alt: 'Diners at candlelit tables on a garden terrace at night, chandeliers hanging among the greenery',
          width: 1440,
          height: 800,
          source:
            'https://grandhotelmajestic.duetorrihotels.com/en/luxury-hotel-italy-5-stars-bologna/majestic-terraces',
        },
        {
          src: '/images/hotels/majestic-bologna/06-bologna-from-above.jpg',
          alt: 'Looking straight down from a tower onto Bologna’s streets and red-brick rooftops',
          width: 1440,
          height: 800,
          tab: 'nearby',
          source:
            'https://grandhotelmajestic.duetorrihotels.com/en/luxury-hotel-italy-5-stars-bologna/hotel',
        },
      ],
    ),
  },
  {
    id: 'quellenhof-lazise',
    name: 'Quellenhof Luxury Resort Lazise',
    place: 'Lake Garda',
    country: 'Italy',
    url: 'https://www.quellenhof-lazise.it/en',
    tabs: [
      {
        id: 'hotel',
        text: 'A five-star resort at Lazise, on the south-eastern shore of Lake Garda, with olive trees, palms and cypresses all around. Children are welcome from the age of four.',
      },
      {
        id: 'rooms',
        text: 'Suites and villas with views of Lake Garda, among them pool villas, and suites whose terraces step straight into the resort’s natural bathing lake.',
      },
      {
        id: 'dining',
        text: 'Gourmet half board with Mediterranean cooking and an international touch, served in the glass-walled Panorama Restaurant. Bistro La Piazza is the casual alternative.',
      },
      {
        id: 'spa',
        text: 'Four pools (one for children, one for adults only, a sports pool and a natural bathing lake), several saunas with daily infusions in a Finnish event sauna, and treatments at the Onda Spa.',
      },
      {
        id: 'nearby',
        text: 'Lazise’s old town, with its Scaliger castle, medieval walls and small harbor, sits on the lake, and the waterfront promenade and boat trips start there.',
      },
    ],
    photos: shots(
      '© Quellenhof Luxury Resort Lazise',
      'https://www.quellenhof-lazise.it/en/quellenhof-lazise/impressions',
      [
        {
          src: '/images/hotels/quellenhof-lazise/01-resort-pool.jpg',
          alt: 'A long outdoor pool reflecting the sky at sunset, the resort’s glass pavilion beside it',
          width: 2400,
          height: 1549,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/quellenhof-lazise/02-suite-oliva.jpg',
          alt: 'A suite in gray and olive tones, a sofa, armchairs and the bed beyond',
          width: 2400,
          height: 1501,
          tab: 'rooms',
        },
        {
          src: '/images/hotels/quellenhof-lazise/03-suite-terrace-bathing-lake.jpg',
          alt: 'A suite terrace with a whirlpool, stepping straight down to the resort’s bathing lake',
          width: 2400,
          height: 1394,
        },
        {
          src: '/images/hotels/quellenhof-lazise/04-panorama-restaurant.jpg',
          alt: 'The glass-walled Panorama Restaurant, white-laid tables and the evening sky outside',
          width: 2400,
          height: 1493,
          tab: 'dining',
        },
        {
          src: '/images/hotels/quellenhof-lazise/05-onda-spa.jpg',
          alt: 'A dim rest room in the Onda Spa, deep loungers either side of a lit walkway',
          width: 2400,
          height: 1545,
          tab: 'spa',
        },
        {
          src: '/images/hotels/quellenhof-lazise/06-bathing-lake.jpg',
          alt: 'The natural bathing lake with a sandy shore and day beds, the resort’s suites behind',
          width: 2400,
          height: 2237,
        },
      ],
    ),
  },

  /* -- Italy Uncovered and The Adriatic Collection --------------------------------- */
  {
    id: 'jw-marriott-venice',
    name: 'JW Marriott Venice Resort & Spa',
    place: 'Venice',
    country: 'Italy',
    url: 'https://www.marriott.com/en-us/hotels/vcejw-jw-marriott-venice-resort-and-spa/overview/',
    tabs: [
      {
        id: 'hotel',
        text: 'A resort that fills its own island, Isola delle Rose, in the southern Venetian lagoon. Its historic buildings, once a hospital, were redesigned by Matteo Thun, and a park with old olive trees surrounds them.',
      },
      {
        id: 'rooms',
        text: 'Rooms, suites and villas that Matteo Thun designed to be spacious and full of light, as part of the resort’s focus on wellness.',
      },
      {
        id: 'dining',
        text: 'Several restaurants and bars, among them a rooftop restaurant overlooking the lagoon, and a cooking school on the island.',
      },
      {
        id: 'spa',
        text: 'A large spa with a pool facing the lagoon, a Finnish sauna and a bio-sauna, a hammam and treatment rooms.',
      },
      {
        id: 'nearby',
        text: 'The resort’s boat crosses the lagoon to St Mark’s Square in about 20 minutes.',
      },
    ],
    photos: shots(
      '© Marriott International',
      'https://traveler.marriott.com/venice/jw-venice-design/',
      [
        {
          src: '/images/hotels/jw-marriott-venice/01-isola-delle-rose.jpg',
          alt: 'The resort’s island in the Venetian lagoon from the air, its buildings among the trees',
          width: 2048,
          height: 1365,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/jw-marriott-venice/02-arrival-by-boat.jpg',
          alt: 'Arriving by boat along a canal lined with willows to the resort’s water entrance',
          width: 1920,
          height: 1080,
        },
        {
          src: '/images/hotels/jw-marriott-venice/03-rooftop-dining.jpg',
          alt: 'A rooftop terrace with tables and parasols, the lagoon on the horizon',
          width: 1920,
          height: 1080,
          tab: 'dining',
        },
        {
          src: '/images/hotels/jw-marriott-venice/04-spa-pool.jpg',
          alt: 'An indoor pool behind tall windows, trees and the lagoon outside',
          width: 1920,
          height: 1080,
          tab: 'spa',
        },
        {
          src: '/images/hotels/jw-marriott-venice/05-olive-grove.jpg',
          alt: 'Paths through an olive grove on the island, a brick church beyond',
          width: 1920,
          height: 1080,
        },
        {
          src: '/images/hotels/jw-marriott-venice/06-venice-across-the-lagoon.jpg',
          alt: 'Venice’s domes and bell tower across the lagoon, framed by the island’s trees',
          width: 1920,
          height: 1080,
          tab: 'nearby',
        },
      ],
    ),
  },

  /* -- The Adriatic Collection ------------------------------------------------------ */
  {
    id: 'grand-park-rovinj',
    name: 'Grand Park Hotel Rovinj',
    place: 'Rovinj',
    country: 'Croatia',
    url: 'https://www.maistra.com/properties/grand-park-hotel-rovinj/',
    tabs: [
      {
        id: 'hotel',
        text: 'A Maistra Collection hotel on Rovinj’s eastern shore, its planted terraces stepping down to the marina across from the old town. It is listed on The World’s 50 Best Hotels 2025.',
      },
      {
        id: 'rooms',
        text: '209 rooms and suites in earth tones and natural materials, with Mediterranean plants on the balconies; many look across the sea to the old town or down to the marina.',
      },
      {
        id: 'dining',
        text: 'Seven restaurants and bars, two of them with Michelin stars: Cap Aureo, with Istrian cooking by chef Jeffrey Vella, and Agli Amici Rovinj by Emanuele Scarello. Primi Terreni grills over wood charcoal and has an Istrian deli.',
      },
      {
        id: 'spa',
        text: 'The Albaro Wellness & Spa spreads over two floors, indoors and out, with pools that look toward the old town and the open sea.',
      },
      {
        id: 'nearby',
        text: 'The Lungomare promenade runs along the ground floor of the hotel, and the old town is about 800 meters away around the harbor.',
      },
    ],
    photos: shots(
      '© Maistra Hospitality Group',
      'https://www.maistra.com/properties/grand-park-hotel-rovinj/',
      [
        {
          src: '/images/hotels/grand-park-rovinj/01-terraces-and-marina.jpg',
          alt: 'The hotel’s planted terraces stepping down to the marina at sunset, Rovinj’s old town across the water',
          width: 2400,
          height: 1348,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/grand-park-rovinj/02-sea-view-room.jpg',
          alt: 'A guest room with a wide bed and floor-to-ceiling glass onto a balcony and the sea',
          width: 2400,
          height: 1600,
          tab: 'rooms',
        },
        {
          src: '/images/hotels/grand-park-rovinj/03-restaurant-terrace.jpg',
          alt: 'A restaurant terrace at dusk, the lit harbor and the bell tower of Rovinj beyond',
          width: 1800,
          height: 1200,
          tab: 'dining',
        },
        {
          src: '/images/hotels/grand-park-rovinj/04-indoor-pool.jpg',
          alt: 'An indoor pool with loungers, glass walls looking out to the old town',
          width: 2400,
          height: 1535,
          tab: 'spa',
        },
        {
          src: '/images/hotels/grand-park-rovinj/05-infinity-pool.jpg',
          alt: 'An infinity pool and sun loungers facing the open sea and the low sun',
          width: 2400,
          height: 1332,
        },
        {
          src: '/images/hotels/grand-park-rovinj/06-rovinj-bay.jpg',
          alt: 'The bay and marina below the hotel from the air at sunset, wooded islands offshore',
          width: 2400,
          height: 1797,
          tab: 'nearby',
        },
      ],
    ),
  },
  {
    id: 'ambasador-split',
    name: 'Hotel Ambasador Split',
    place: 'Split',
    country: 'Croatia',
    url: 'https://ambasadorsplit.com/en',
    tabs: [
      {
        id: 'hotel',
        text: 'Split’s West Coast promenade is the hotel’s address: the Adriatic in front, Marjan hill rising behind and the Riva a short stroll away. An outdoor pool is kept for hotel guests.',
      },
      {
        id: 'rooms',
        text: 'Rooms from 25 m² with king-size or twin beds; on the first to third floors many have a balcony over the marina or the city. A 110 m² suite looks out to the islands and the Adriatic.',
      },
      {
        id: 'dining',
        text: 'Restaurant Méditerranée gives Dalmatian cooking a modern touch, Bar Split opens onto the promenade, and the rooftop terrace serves dinner above the Riva and Diocletian’s Palace when the weather allows.',
      },
      {
        id: 'spa',
        text: 'The Hacelia Spa has a Finnish sauna, a steam sauna, cold showers and treatments, with a fitness center open from 7 am to 9 pm.',
      },
      {
        id: 'nearby',
        text: 'Diocletian’s Palace and the old town are a walk along the Riva.',
      },
    ],
    photos: shots('© Ambasador Split', 'https://ambasadorsplit.com/en', [
      {
        src: '/images/hotels/ambasador-split/01-rooftop-pool.jpg',
        alt: 'The hotel’s pool terrace and parasols, Split’s old town and the mountains across the harbor',
        width: 1101,
        height: 732,
        tab: 'hotel',
        source: 'https://ambasadorsplit.com/en/dining',
      },
      {
        src: '/images/hotels/ambasador-split/02-sea-view-suite.jpg',
        alt: 'A suite’s sitting room with a corner of windows onto the harbor and the old town',
        width: 1500,
        height: 998,
        tab: 'rooms',
        source: 'https://ambasadorsplit.com/en/rooms-and-suites',
      },
      {
        src: '/images/hotels/ambasador-split/03-room-at-dusk.jpg',
        alt: 'A guest room at dusk, a wide window onto the lights of the harbor',
        width: 1500,
        height: 998,
        source: 'https://ambasadorsplit.com/en/rooms-and-suites',
      },
      {
        src: '/images/hotels/ambasador-split/04-waterfront-dining.jpg',
        alt: 'A table laid on the waterfront among red flowers, Split’s cathedral tower beyond',
        width: 1200,
        height: 800,
        tab: 'dining',
      },
      {
        src: '/images/hotels/ambasador-split/05-hacelia-spa.jpg',
        alt: 'The Hacelia Spa’s sauna and showers, lit in pink and blue',
        width: 1920,
        height: 1278,
        tab: 'spa',
        source: 'https://ambasadorsplit.com/en/hacelia-spa',
      },
      {
        src: '/images/hotels/ambasador-split/06-split-from-above.jpg',
        alt: 'Split from above: the harbor, the old town’s rooftops and the wooded Marjan hill',
        width: 1920,
        height: 1011,
        tab: 'nearby',
        source: 'https://ambasadorsplit.com/en/our-story',
      },
    ]),
  },
  {
    id: 'excelsior-dubrovnik',
    name: 'Hotel Excelsior Dubrovnik',
    place: 'Dubrovnik',
    country: 'Croatia',
    url: 'https://www.adriaticluxuryhotels.com/hotel-excelsior-dubrovnik/',
    tabs: [
      {
        id: 'hotel',
        text: 'A five-star hotel on the sea, part of Adriatic Luxury Hotels, whose oldest wing, Villa Odak, dates from 1913. Its guests have ranged from Queen Elizabeth II to Elizabeth Taylor.',
      },
      {
        id: 'rooms',
        text: 'Rooms and suites in the main building and in Villa Odak, many with sea-view balconies facing Lokrum Island; from the bathtubs of the Excelsior Signature Suites you see the walled city.',
      },
      {
        id: 'dining',
        text: 'Sensus serves contemporary cooking with Croatian wines from the hotel’s cellar, Prora is the beach restaurant from June to October, Salin serves breakfast on the terrace, and the Abakus Piano Bar has live music and sea views.',
      },
      {
        id: 'spa',
        text: 'A spa and fitness center with an indoor pool, and a beach on the hotel’s shore.',
      },
      {
        id: 'nearby',
        text: 'The Old Town is about 600 meters away, a five-minute walk to its walls, and Lokrum Island lies just offshore.',
      },
    ],
    // Until the hotel's own photographs are saved here, a licensed photograph
    // of Dubrovnik already on the site (credits.json, home-jr-adriatic) stands in.
    photos: [
      {
        src: '/images/home/jr-adriatic-dubrovnik-walls.jpg',
        alt: 'Dubrovnik’s defensive walls and old town above the Adriatic',
        width: 2400,
        height: 1602,
        credit: 'Photo of Dubrovnik: Diego F. Parra, Pexels',
        source:
          'https://www.pexels.com/photo/defensive-walls-and-the-old-town-of-dubrovnik-16908309/',
        place: true,
      },
    ],
  },
];

const normal = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** The record for a hotel as a journey lists it, by its name. */
export const hotelByName = (name: string): HotelRecord | undefined =>
  hotels.find((hotel) => normal(hotel.name) === normal(name));
