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
 * 2400px wide (2560px for the three added on 25 Nov); each carries the credit
 * the hotel gives and the page it was taken from, and each is listed on
 * /credits.
 *
 * Marc's review of 23 Nov 2026: on Swiss Elegance, Hotel Schweizerhof Luzern
 * replaces the Mandarin Oriental Palace in Lucerne, The Omnia replaces the
 * Grand Hotel Zermatterhof in Zermatt, and Villa e Palazzo Aminta replaces
 * Hotel La Palma in Stresa. Their photographs are from their own websites
 * (the owner's approval of 25 Nov; the hotels' own approval is pending
 * through Ishika). Villa e Palazzo Aminta's site offers its photographs at
 * 1024px (its view of the villa at 1600px), so they are shown at that size
 * until the hotel sends larger ones.
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
    id: 'schweizerhof-luzern',
    name: 'Hotel Schweizerhof Luzern',
    place: 'Lucerne',
    country: 'Switzerland',
    url: 'https://www.schweizerhof-luzern.ch/en',
    tabs: [
      {
        id: 'hotel',
        text: 'A five-star hotel on the shore of Lake Lucerne, opened in 1845 and run by the Hauser family for more than 180 years. Mark Twain, Leo Tolstoy and Richard Wagner all stayed here, and the hotel is host and partner to many of Lucerne’s festivals.',
      },
      {
        id: 'rooms',
        text: '101 rooms and suites of 25 to 65 m², each telling the story of someone who stayed here. The Lucerne Luxury Suites look straight out over the lake to the mountains, some from a balcony.',
      },
      {
        id: 'dining',
        text: 'Brasserie VICO brings French brasserie classics and Swiss and international dishes to the hotel’s historic rooms, and the Schweizerhof Bar has piano music every day and a sun terrace in summer. VILLA Schweizerhof, the hotel’s restaurant in a lakeside park, holds 13 Gault&Millau points.',
      },
      {
        id: 'spa',
        text: 'A wellness area on the fifth floor with a Finnish sauna, a bio sauna and experience showers looking out over Lake Lucerne, massages by appointment and a Technogym fitness room.',
      },
      {
        id: 'nearby',
        text: 'The hotel stands on the Schweizerhofquai: the car-free Old Town, the Chapel Bridge, the KKL and the lake steamers toward Mount Rigi and Mount Pilatus are all a walk away.',
      },
    ],
    photos: shots('© Hotel Schweizerhof Luzern', 'https://www.schweizerhof-luzern.ch/en', [
      {
        src: '/images/hotels/schweizerhof-luzern/01-hotel-at-blue-hour.jpg',
        alt: 'Hotel Schweizerhof Luzern lit up at dusk on the Schweizerhofquai, its facade and the Swiss flag reflected in Lake Lucerne',
        width: 2560,
        height: 1702,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/schweizerhof-luzern/02-lucerne-luxury-suite.jpg',
        alt: 'A Lucerne Luxury Suite: a chandelier, a chaise longue and balcony doors open to the lake',
        width: 2560,
        height: 1706,
        tab: 'rooms',
        source: 'https://www.schweizerhof-luzern.ch/en/rooms/lucerne-luxury-suite',
      },
      {
        src: '/images/hotels/schweizerhof-luzern/03-lifestyle-junior-suite.jpg',
        alt: 'A Lifestyle Junior Suite, a line about music written on the wall above the bed, an arched window onto the lake',
        width: 2560,
        height: 1706,
        source: 'https://www.schweizerhof-luzern.ch/en/rooms/lifestyle-junior-suite',
      },
      {
        src: '/images/hotels/schweizerhof-luzern/04-brasserie-vico.jpg',
        alt: 'Brasserie VICO beneath stucco ceilings and chandeliers, velvet banquettes along the laid tables',
        width: 2560,
        height: 1707,
        tab: 'dining',
        source: 'https://www.schweizerhof-luzern.ch/en/restaurants-bar',
      },
      {
        src: '/images/hotels/schweizerhof-luzern/05-staircase.jpg',
        alt: 'The hotel’s historic staircase from above, a red runner winding down beside a wrought-iron balustrade',
        width: 2560,
        height: 1612,
      },
      {
        src: '/images/hotels/schweizerhof-luzern/06-chapel-bridge.jpg',
        alt: 'Lucerne’s Chapel Bridge and Water Tower on the Reuss at dusk, the old town behind',
        width: 2560,
        height: 1612,
        tab: 'nearby',
        source: 'https://www.schweizerhof-luzern.ch/en/luzern',
      },
    ]),
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
    id: 'the-omnia-zermatt',
    name: 'The Omnia',
    place: 'Zermatt',
    country: 'Switzerland',
    url: 'https://the-omnia.com/en',
    tabs: [
      {
        id: 'hotel',
        text: 'A mountain lodge perched on a rock in the center of car-free Zermatt, where the service is personal and informal. It has been named Switzerland’s Leading Boutique Hotel ten years running.',
      },
      {
        id: 'rooms',
        text: 'Light-filled rooms and suites, each with a balcony facing the village, the Matterhorn or the rock, furnished with 20th-century design classics and pieces made in the Valais. Some have an open fireplace, a cedar tub, a bay-window bath or a private sauna.',
      },
      {
        id: 'dining',
        text: 'Dinner in the restaurant feels like an evening at a friend’s home, with seasonal Alpine cooking by chef Markian Barmettler (three forks from Falstaff). The sun terrace has the Matterhorn for a neighbor, and the lounge has art books and an open fire.',
      },
      {
        id: 'spa',
        text: 'A spa kept for hotel guests: an indoor-outdoor pool, saunas, floral and herbal steam rooms and an outdoor whirlpool facing the village and the Matterhorn, with treatments using Aesop and Farfalla products.',
      },
      {
        id: 'nearby',
        text: 'The lodge stands on its rock high above Zermatt’s rooftops, and its own taxi brings guests up from the railway station, the taxi terminal or the heliport.',
      },
    ],
    photos: shots('© THE OMNIA AG', 'https://the-omnia.com/en/gallery', [
      {
        src: '/images/hotels/the-omnia-zermatt/01-lodge-above-zermatt.jpg',
        alt: 'The Omnia on its rock above the old timber chalets of Zermatt, a sheer cliff and larch forest behind',
        width: 2560,
        height: 1807,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/the-omnia-zermatt/02-whirlpool-and-matterhorn.jpg',
        alt: 'A guest in the lodge’s outdoor whirlpool, looking across Zermatt to the Matterhorn',
        width: 2560,
        height: 1707,
        source: 'https://the-omnia.com/en/relax',
      },
      {
        src: '/images/hotels/the-omnia-zermatt/03-suite-living-room.jpg',
        alt: 'A suite’s living room, a curved sofa in the sunlight and tall windows onto the snowy roofs of Zermatt',
        width: 2560,
        height: 1715,
        tab: 'rooms',
      },
      {
        src: '/images/hotels/the-omnia-zermatt/04-restaurant.jpg',
        alt: 'The restaurant’s wooden tables beneath a timber ceiling, a fire burning in a stone wall',
        width: 2560,
        height: 1707,
        tab: 'dining',
        source: 'https://the-omnia.com/en/dine',
      },
      {
        src: '/images/hotels/the-omnia-zermatt/05-indoor-pool.jpg',
        alt: 'The indoor pool lit turquoise at night, glass walls looking out to the lights of the village',
        width: 2560,
        height: 1707,
        tab: 'spa',
        source: 'https://the-omnia.com/en/relax',
      },
      {
        src: '/images/hotels/the-omnia-zermatt/06-zermatt-at-night.jpg',
        alt: 'Zermatt at night under falling snow, its lit church and snowy chalet roofs seen from above',
        width: 2560,
        height: 1715,
        tab: 'nearby',
      },
    ]),
  },
  {
    id: 'villa-aminta-stresa',
    name: 'Villa e Palazzo Aminta',
    place: 'Stresa',
    country: 'Italy',
    url: 'https://www.villa-aminta.it/',
    tabs: [
      {
        id: 'hotel',
        text: 'A five-star member of The Leading Hotels of the World on the shore of Lake Maggiore, looking across the Gulf of the Borromean Islands. Beatrice, Roberto and Daniela Zanetta welcome guests to the villa and its park of palms, azaleas, camellias and rhododendrons.',
      },
      {
        id: 'rooms',
        text: 'Rooms and suites look out over the centuries-old park or, from a balcony or a terrace, over the lake to the Borromean Islands. The Liz Taylor Suites remember the actress, a guest of the villa in the 1960s.',
      },
      {
        id: 'dining',
        text: 'Two restaurants cook the regional dishes of Lake Maggiore: I Mori, an Italian bistro of tradition and invention, and the gourmet Le Isole, for breakfast and dinner, with a terrace over the lake.',
      },
      {
        id: 'spa',
        text: 'A pool above the lake with a sun terrace facing the Borromean Islands, and the Grotta Aminta spa, with a steam bath, sensory showers, a whirlpool, massages and beauty treatments.',
      },
      {
        id: 'nearby',
        text: 'Private boat trips to the Borromean Islands leave from the hotel’s own pier, and the concierge books Palazzo Borromeo on Isola Bella and Isola Madre and the gardens of Villa Taranto. Mount Mottarone and the Val Grande National Park are close by for walks.',
      },
    ],
    photos: shots(
      '© Villa e Palazzo Aminta',
      'https://www.villa-aminta.it/en/gallery-lake-maggiore-luxury-resorts',
      [
        {
          src: '/images/hotels/villa-aminta-stresa/01-villa-and-isola-bella.jpg',
          alt: 'Villa e Palazzo Aminta above Lake Maggiore, Isola Bella and the mountains across the water',
          width: 1600,
          height: 824,
          tab: 'hotel',
          source: 'https://www.villa-aminta.it/',
        },
        {
          src: '/images/hotels/villa-aminta-stresa/02-junior-suite-lake-view.jpg',
          alt: 'A Junior Suite with painted walls, a balcony door open to the lake and the islands',
          width: 1024,
          height: 768,
          tab: 'rooms',
          source:
            'https://www.villa-aminta.it/en/luxury-hotel-rooms-lake-maggiore-view/junior-suite-lake-view',
        },
        {
          src: '/images/hotels/villa-aminta-stresa/03-veranda.jpg',
          alt: 'A salon beneath a crystal chandelier, pink velvet sofas and floral curtains framing the lake',
          width: 1023,
          height: 768,
        },
        {
          src: '/images/hotels/villa-aminta-stresa/04-i-mori-restaurant.jpg',
          alt: 'The I Mori restaurant, its tables laid inside a wrought-iron glass veranda above the lake',
          width: 1024,
          height: 682,
          tab: 'dining',
        },
        {
          src: '/images/hotels/villa-aminta-stresa/05-pool.jpg',
          alt: 'The pool among palms and flowering terraces below the villa’s balconies',
          width: 1024,
          height: 768,
          tab: 'spa',
        },
        {
          src: '/images/hotels/villa-aminta-stresa/06-isola-bella-at-night.jpg',
          alt: 'Isola Bella and the Borromeo palace lit up at dusk on Lake Maggiore',
          width: 1024,
          height: 768,
          tab: 'nearby',
          source: 'https://www.villa-aminta.it/',
        },
      ],
    ),
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
  /* -- The Soul of Sicily (Marc’s brief of 27 Nov 2026) ----------------------------
     Photographs from each hotel’s official website; NH Collection Taormina’s from
     the official media kit of its group, Minor Hotels (nh-hotels.com refuses
     automated downloads). */
  {
    id: 'grand-hotel-des-palmes-palermo',
    name: 'Grand Hotel et des Palmes',
    place: 'Palermo',
    country: 'Italy',
    url: 'https://despalmes.mangias.com/en',
    tabs: [
      {
        id: 'hotel',
        text: 'A historic five-star address in the heart of Palermo, where magnificent interiors, frescoed ceilings, Art Nouveau details and contemporary refinement reflect the city’s rich cultural heritage. Its central location allows guests to step outside and discover Palermo independently. Richard Wagner finished Parsifal under its roof.',
      },
      {
        id: 'rooms',
        text: '100 rooms and suites in the spirit of the Belle Époque, with velvet, inlaid wood and marble, some with a private terrace above the old streets. The 156 m² Richard Wagner Suite has stucco and gold leaf, a crystal chandelier and a grand piano that once belonged to the composer.',
      },
      {
        id: 'dining',
        text: 'In winter the Des Palmes Neobistrot and the Sensus Mixology Bar bring Sicilian cooking and signature cocktails to the Salone degli Specchi, the Ingham family’s old ballroom. The Ouverture Terrace above Palermo’s rooftops, where chef Giuseppe Sole cooks with the seasons and the bar moves in summer, opens for summer 2027.',
      },
      {
        id: 'nearby',
        text: 'The hotel is a starting point for Palermo’s historic center: the Cathedral, the gold mosaics of the Palatine Chapel, Teatro Massimo, the Quattro Canti and the Ballarò, Vucciria and Capo markets. The concierge arranges private transfers, guided tours and tailor-made itineraries.',
      },
    ],
    photos: shots('© Grand Hotel et Des Palmes', 'https://despalmes.mangias.com/en', [
      {
        src: '/images/hotels/grand-hotel-des-palmes-palermo/01-marble-hall.jpg',
        alt: 'The hotel’s entrance hall: stone columns, curving marble steps, a small fountain and a white marble statue before a gilded mirror',
        width: 2560,
        height: 1707,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/grand-hotel-des-palmes-palermo/02-richard-wagner-suite.jpg',
        alt: 'The Richard Wagner Suite beneath a crystal chandelier and gilded stucco, a grand piano by the windows and the bed beyond the sitting area',
        width: 2560,
        height: 1707,
        tab: 'rooms',
        source: 'https://despalmes.mangias.com/en/rooms-and-suites',
      },
      {
        src: '/images/hotels/grand-hotel-des-palmes-palermo/03-junior-suite.jpg',
        alt: 'A Junior Suite in soft gray, a velvet sofa and black-and-gold furniture beside the king-size bed',
        width: 2560,
        height: 1707,
        source: 'https://despalmes.mangias.com/en/rooms-and-suites',
      },
      {
        src: '/images/hotels/grand-hotel-des-palmes-palermo/04-salone-degli-specchi-bar.jpg',
        alt: 'The bar of the Salone degli Specchi framed by drawn curtains and gilded mirror panels, bottles lit on glass shelves',
        width: 2560,
        height: 1707,
        tab: 'dining',
        source: 'https://despalmes.mangias.com/en/restaurants',
      },
      {
        src: '/images/hotels/grand-hotel-des-palmes-palermo/05-piano-salon.jpg',
        alt: 'A long salon beneath a coffered wooden ceiling, a grand piano among plum velvet armchairs and tall windows onto green plants',
        width: 2560,
        height: 1707,
      },
      {
        src: '/images/hotels/grand-hotel-des-palmes-palermo/06-ouverture-terrace.jpg',
        alt: 'The Ouverture Terrace laid under an awning, Palermo’s rooftops, domes and bell towers and the mountains beyond',
        width: 2560,
        height: 1707,
        tab: 'nearby',
        source: 'https://despalmes.mangias.com/en/restaurants',
      },
    ]),
  },
  {
    id: 'villa-athena-agrigento',
    name: 'Villa Athena',
    place: 'Agrigento',
    country: 'Italy',
    url: 'https://www.hotelvillaathena.it/en',
    tabs: [
      {
        id: 'hotel',
        text: 'An exceptional five-star retreat situated within the UNESCO-listed Valley of the Temples. Set in an elegant historic residence near the magnificent Temple of Concordia, Villa Athena offers an extraordinary connection to Sicily’s ancient history in a setting of tranquility and natural beauty. It is the only hotel inside the archaeological park, with 27 rooms and suites among centuries-old olive trees.',
      },
      {
        id: 'rooms',
        text: 'Rooms keep the villa’s original 18th-century majolica floors, and the Temple View Rooms face the Temple of Concordia from both bedroom and bathroom. The 60 m² Villa Suite adds a living room with a bar, a private Jacuzzi and a panoramic terrace over the whole archaeological site.',
      },
      {
        id: 'dining',
        text: 'The Terrazza degli Dei, the signature restaurant, serves Sicilian fine dining by chef Massimiliano Ballarò to live piano, with the Temples of Concordia and Juno beyond the terrace. From June to October, Federico II serves an à la carte breakfast, lunch and sunset drinks on its terrace facing the temples and by the pool.',
      },
      {
        id: 'spa',
        text: 'Villa Athena SPA, set in an old storeroom around an ancient Greek cistern, is booked privately for up to two guests: a Jacuzzi, a sensory shower and a steam bath among 18th-century majolica. The outdoor pool is for resort guests only, and the gym is in a former barn.',
      },
      {
        id: 'nearby',
        text: 'Guests enter the Valley of the Temples through their own private entrance, and a ten-minute walk leads to the foot of the Temple of Concordia; the hotel arranges private guides. Agrigento’s medieval old town is five minutes from the hotel, and private boat trips run along the coast toward the Scala dei Turchi.',
      },
    ],
    photos: shots(
      '© Villa Athena Resort',
      'https://www.hotelvillaathena.it/en/location-in-agrigento',
      [
        {
          src: '/images/hotels/villa-athena-agrigento/01-villa-and-temple-of-concordia.jpg',
          alt: 'Villa Athena’s honey-colored facade among palms and pines, the Temple of Concordia on the ridge behind',
          width: 1920,
          height: 1080,
          tab: 'hotel',
        },
        {
          src: '/images/hotels/villa-athena-agrigento/02-villa-suite.jpg',
          alt: 'The Villa Suite: a blue-and-white majolica floor, a four-poster bed and glass doors onto a balustraded terrace facing the Temple of Concordia',
          width: 1920,
          height: 1280,
          tab: 'rooms',
          source:
            'https://www.hotelvillaathena.it/en/rooms-suites-temple-view-agrigento/villa-suite',
        },
        {
          src: '/images/hotels/villa-athena-agrigento/03-terrazza-degli-dei.jpg',
          alt: 'A table laid on the Terrazza degli Dei, a palm and the Temple of Concordia in the evening sun beyond the olive trees',
          width: 1920,
          height: 1080,
          tab: 'dining',
          source: 'https://www.hotelvillaathena.it/en/terrazza-degli-dei-restaurant-agrigento',
        },
        {
          src: '/images/hotels/villa-athena-agrigento/04-pool.jpg',
          alt: 'The pool lined with loungers and white parasols in the garden, the villa’s balustraded terrace and tall palms above',
          width: 1920,
          height: 1280,
          source: 'https://www.hotelvillaathena.it/en',
        },
        {
          src: '/images/hotels/villa-athena-agrigento/05-spa.jpg',
          alt: 'The spa’s Jacuzzi beneath a waterfall spout, a glass sensory shower and blue-and-white majolica tiles',
          width: 1920,
          height: 1280,
          tab: 'spa',
          source: 'https://www.hotelvillaathena.it/en/private-spa-agrigento-valley-of-temples',
        },
        {
          src: '/images/hotels/villa-athena-agrigento/06-temple-of-concordia.jpg',
          alt: 'The Temple of Concordia from the front, its Doric columns and pediment against a clear sky',
          width: 1920,
          height: 1280,
          tab: 'nearby',
          source: 'https://www.hotelvillaathena.it/en/private-access-valley-of-temples-agrigento',
        },
      ],
    ),
  },
  {
    id: 'nh-collection-taormina',
    name: 'NH Collection Taormina',
    place: 'Taormina',
    country: 'Italy',
    url: 'https://www.nh-hotels.com/en/hotel/nh-collection-taormina',
    tabs: [
      {
        id: 'hotel',
        text: 'Combining contemporary elegance with the timeless charm of Taormina, this five-star property offers a superb central location, stylish accommodations and a panoramic infinity pool, providing a beautiful retreat from which to discover one of Sicily’s most enchanting destinations. Its early-20th-century building looks over the town and the coast to Mount Etna.',
      },
      {
        id: 'rooms',
        text: '58 rooms and suites in colors drawn from the Sicilian landscape, with handmade ceramics and volcanic stone; some have a private balcony or terrace over the town, the mountains and the coast. The Presidential Suite adds a living area, a Jacuzzi and a large terrace.',
      },
      {
        id: 'dining',
        text: 'Zefiro cooks contemporary Sicilian food from island produce such as Mazara del Vallo red prawns, Avola almonds and Cinisara beef, and in summer moves up to the seventh-floor rooftop terrace, with views over Taormina and the coast to Etna. Lu Souli, by the pool, serves Sicilian street food, granita, ice cream and cocktails.',
      },
      {
        id: 'spa',
        text: 'The 260 m² Fusion Spa has a Turkish bath, a Finnish sauna, thalasso and a Jacuzzi, with massages, facials, yoga and meditation classes; the panoramic infinity pool has wide views over the town.',
      },
      {
        id: 'nearby',
        text: 'Corso Umberto, Taormina’s finest shopping street, is a few steps away, and the Teatro Antico and the medieval Palazzo Corvaja are a few minutes’ walk. Isola Bella, the nearest beach, is about 1.2 km away.',
      },
    ],
    photos: shots('© Minor Hotels', 'https://media.minorhotels.com/en-GLO/assets/242047/', [
      {
        src: '/images/hotels/nh-collection-taormina/01-infinity-pool.jpg',
        alt: 'The infinity pool on a terrace above Taormina’s rooftops, the wooded hillside and the sea beyond',
        width: 2560,
        height: 1709,
        tab: 'spa',
      },
      {
        src: '/images/hotels/nh-collection-taormina/02-entrance.jpg',
        alt: 'The hotel’s glass-canopied entrance lit at dusk, a revolving door between potted topiary',
        width: 2560,
        height: 1709,
        tab: 'hotel',
      },
      {
        src: '/images/hotels/nh-collection-taormina/03-presidential-suite.jpg',
        alt: 'The Presidential Suite: a bed with a palm-patterned throw and glass doors onto a balcony above the rooftops and the sea',
        width: 2560,
        height: 1709,
        tab: 'rooms',
      },
      {
        src: '/images/hotels/nh-collection-taormina/04-zefiro-restaurant.jpg',
        alt: 'Zefiro’s dining room under rattan pendant lights, mustard armchairs and ceramic prickly-pear branches on the walls',
        width: 2560,
        height: 1709,
        tab: 'dining',
      },
      {
        src: '/images/hotels/nh-collection-taormina/05-lobby-lounge.jpg',
        alt: 'The lobby lounge: curved terracotta sofas, woven armchairs and arching floor lamps between tall curtains',
        width: 2560,
        height: 1709,
      },
      {
        src: '/images/hotels/nh-collection-taormina/06-terrace-over-taormina.jpg',
        alt: 'The Presidential Suite’s terrace, daybeds and cobalt urns before Taormina’s rocky hillside and the sea',
        width: 2560,
        height: 1709,
        tab: 'nearby',
      },
    ]),
  },
];

const normal = (name: string) => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** The record for a hotel as a journey lists it, by its name. */
export const hotelByName = (name: string): HotelRecord | undefined =>
  hotels.find((hotel) => normal(hotel.name) === normal(name));
