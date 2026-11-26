/**
 * The photography registry.
 *
 * Nothing has been shot for Peaks2Shores yet. Every slot carries the art
 * direction written for the photographer plus the tonal ground the frame sits
 * on; until a commission lands, each is filled with licensed stock chosen
 * against that brief (`scripts/source-photography.mjs`, provenance in
 * `public/images/credits.json`). `alt` describes the photograph actually in
 * the slot — update it when the file changes.
 *
 * TO ADD A PHOTOGRAPH — name the file after the slot key, drop it in, sync:
 *
 *     public/images/home-hero.jpg      →  the `home-hero` slot
 *     npm run images
 *
 * That writes `media.generated.ts`, which `getMedia()` merges over this file,
 * and refreshes `PHOTOGRAPHY-BRIEF.md` with what is still outstanding. Nothing
 * here needs hand-editing, and <Frame> switches from the placeholder to
 * next/image on its own.
 */

import { discovered } from './media.generated';

export type MediaSlot = {
  /** Art direction for the photographer. Rendered on the placeholder. */
  brief: string;
  /** Short caps label shown on the placeholder. */
  label: string;
  /**
   * The color the frame holds before and behind the photograph: a calm blue-grey
   * in the journey cards' family (navy #0e2f42, #1d4a66, teal-blue #0f5767), at
   * the lightness of the picture it waits for. Never a sand, beige, brown, olive
   * or green (the owner's decision of 19 Nov 2026: blues like the journey cards).
   */
  tone: string;
  /** Set this once a real photograph exists. */
  src?: string;
  /** Alt text for the real photograph. Falls back to the brief. */
  alt?: string;
  /** Intrinsic size, for images that are not laid out with `fill`. */
  width?: number;
  height?: number;
};

export const media = {
  /* ---- Home ------------------------------------------------------------ */
  'home-hero': {
    label: 'Hero · coastline at first light',
    brief:
      'A boat approaching a Mediterranean coastline at first light — wide, natural light, no landmarks.',
    tone: '#2a2c2b',
    alt: 'A sailing boat at anchor off the Amalfi Coast, a cliffside town and the coast fading into haze behind',
  },
  // The hero rotates peaks → shores, so the name is the first thing the page says.
  'home-hero-2': {
    label: 'Hero · the peaks',
    brief: 'Alpine peaks above a lake — cool light, wide, no landmarks.',
    tone: '#31383c',
    alt: 'An alpine lake at dusk, forest and peaks mirrored in still water under pink-lit cloud',
  },
  'home-hero-3': {
    label: 'Hero · the shores',
    brief: 'Open water at the end of the day — warm light, wide, no landmarks.',
    tone: '#2f3a3e',
    alt: 'Open sea at dusk, a dark headland and a small island against an orange horizon',
  },
  'pillar-1': {
    label: 'Personal',
    brief: 'Marc greeting a local host — two people, natural light.',
    tone: '#aec3ce',
    alt: 'A narrow stone lane in an old Italian town, a few people walking towards the castle gate',
  },
  'pillar-2': {
    label: 'Curated',
    brief: 'A single set table on a stone terrace above the water.',
    tone: '#aec3ce',
    alt: 'A taverna terrace of potted plants and old roofs above a calm blue sea',
  },
  'pillar-3': {
    label: 'Connected',
    brief: 'Hands at a market stall — produce, conversation, detail.',
    tone: '#aec3ce',
    alt: 'Oranges, artichokes and greens in crates at an Italian market stall',
  },
  'pillar-4': {
    label: 'Thoughtfully paced',
    brief: 'A single chair or a terrace facing the sea, a book left on it — soft evening light.',
    tone: '#aec3ce',
    alt: 'A single chair on a Mallorcan headland, facing the sea in the last light',
  },
  'feat-1': {
    label: 'Amalfi',
    brief: 'Amalfi — a fishing boat below lemon terraces.',
    tone: '#819098',
    alt: 'Amalfi from the water, the town at the foot of green mountains',
  },
  'feat-2': {
    label: 'The Swiss Lakes',
    brief: 'Swiss lake — still water, larches, first snow on the peaks.',
    tone: '#4d5c5e',
    alt: 'A weathered wooden jetty on Lake Lucerne, the Alps beyond under soft cloud',
  },
  'feat-3': {
    label: 'Mallorca',
    brief: 'Mallorca — a stone finca, olive trees, the Tramuntana behind.',
    tone: '#8798a1',
    alt: 'A stone house among olive trees in Mallorca, the Tramuntana in evening haze',
  },
  'tr-1': {
    label: 'The Alps',
    brief: 'Swiss peaks — cool light, snow, rock.',
    tone: '#3b4241',
    alt: 'Swiss peaks in cool light, the summit catching the first sun above snow and rock',
  },
  'tr-2': {
    label: 'An alpine lake',
    brief: 'Alpine lake — glassy water, mountains reflected.',
    tone: '#4d5c5e',
    alt: 'Snow-capped mountains reflected in a still alpine lake at low light',
  },
  'tr-3': {
    label: 'The Mediterranean',
    brief: 'Mediterranean coast — warm stone, blue water, late afternoon.',
    tone: '#6c7f86',
    alt: 'Limestone cliffs above a Mediterranean bay in warm late-afternoon light',
  },
  'tr-4': {
    label: 'Miami',
    brief: 'Miami — ocean light, palms, pastel sky.',
    tone: '#7f9aa3',
    alt: 'Palms silhouetted against the Miami skyline across the bay at dusk',
  },
  'ex-1': {
    label: 'Taste',
    brief: 'A long lunch table, half-eaten, sun through vines.',
    tone: '#8798a1',
    alt: 'A long table laid for lunch beneath a pergola in the Tuscan hills',
  },
  'ex-2': {
    label: 'Meet',
    brief: 'An artisan at work in a small workshop.',
    tone: '#778890',
    alt: 'An artisan’s hands shaping a clay bowl on a potter’s wheel',
  },
  'ex-3': {
    label: 'Discover',
    brief: 'A quiet cloister or hillside village lane.',
    tone: '#8798a1',
    alt: 'A quiet stone lane in an old Tuscan village, lined with potted plants',
  },
  'ex-4': {
    label: 'Move',
    brief: 'A ridge trail or a sailboat, two people, wide.',
    tone: '#7b8b93',
    // Marc's own photograph (Drive), in place of the stock sailboat.
    src: '/images/drive/switzerland-alpine-suspension-bridge.jpg',
    alt: 'A suspension bridge strung across a forested alpine valley above Zermatt',
  },
  'ex-5': {
    label: 'Stay',
    brief: 'A hotel room with the doors open to a view.',
    tone: '#8c9ea6',
    // Marc's own photograph (Drive) of a lodge the journeys use, in place of stock.
    src: '/images/drive/south-africa-qwabi-lodge-suite.jpg',
    alt: 'A thatched safari suite at Qwabi, its glass doors open onto a pool deck and the bush',
  },
  'hotel-1': {
    label: 'Amalfi Coast',
    brief: 'Hotel terrace above the sea, umbrella pines, evening light.',
    tone: '#a2b5bf',
    alt: 'A hotel terrace above the sea at Positano, boats scattered on blue water',
  },
  'hotel-2': {
    label: 'Lake Lucerne',
    brief: 'Belle-époque hotel facade on a lake, mountains behind.',
    tone: '#a2b5bf',
    alt: 'Belle-époque facades along the Lucerne waterfront, reflected in the lake',
  },
  'hotel-3': {
    label: 'Mallorca',
    brief: 'Stone finca courtyard, olive trees, a long table.',
    tone: '#a2b5bf',
    alt: 'An arcaded stone courtyard with citrus trees in Palma',
  },

  /* ---- Home, redesign (client review, October 2026) -------------------- */
  // These slots carry an explicit `src` while they borrow a photograph from
  // another slot; point them at Marc's own photography as it is sorted.
  'home-video-poster': {
    label: 'Hero · reel poster',
    brief: 'The first frame of the hero reel — Marc’s own footage.',
    tone: '#1c2930',
    src: '/video/hero-poster.jpg',
    alt: '',
  },
  'home-peaks': {
    label: 'Peaks',
    brief: 'The Alps — snow, rock, cool light. Wide, room for type on the left.',
    tone: '#3b4241',
    src: '/images/drive/switzerland-gornergrat-matterhorn.jpg',
    alt: 'Gornergrat observatory with the Matterhorn and glaciers',
  },
  'home-shores': {
    label: 'Shores',
    brief: 'Open water and a coastline in warm light. Wide, room for type on the right.',
    tone: '#6c7f86',
    src: '/images/drive/zimbabwe-zambezi-sunset-cruise.jpg',
    alt: 'Boats on the Zambezi as the sun sets',
  },
  'principle-1': {
    label: 'Personal',
    brief: 'Marc with guests or a local host — real people, natural light.',
    tone: '#aec3ce',
    src: '/images/drive/switzerland-guests-lucerne-chapel-bridge.jpg',
    alt: 'Marc’s small group by the Chapel Bridge, Lucerne',
  },
  'principle-2': {
    label: 'Curated',
    brief: 'One exceptional place — a terrace, a view, nothing extra.',
    tone: '#aec3ce',
    src: '/images/drive/switzerland-pilatus-summit.jpg',
    alt: 'Pilatus summit terrace above a sea of cloud and Lake Lucerne',
  },
  'principle-3': {
    label: 'Connected',
    brief: 'A market, a cellar, a kitchen — access through people.',
    tone: '#aec3ce',
    src: '/images/drive/south-africa-winelands-barrel-cellar.jpg',
    alt: 'Oak barrels lining a Stellenbosch wine cellar',
  },
  'principle-4': {
    label: 'Thoughtfully paced',
    brief: 'A free afternoon — a pool, a lake, a book. Stillness.',
    tone: '#aec3ce',
    src: '/images/drive/south-africa-qwabi-lodge-pool.jpg',
    alt: 'A lodge plunge pool overlooking the bushveld hills, Qwabi',
  },
  'exp-taste': {
    label: 'Taste',
    brief: 'Food, wine, a table worth booking. Wide.',
    tone: '#8798a1',
    src: '/images/drive/switzerland-guests-lavaux-vineyards.jpg',
    alt: 'Two guests among the Lavaux vineyards above Lake Geneva',
  },
  'exp-meet': {
    label: 'Meet',
    brief: 'A local host, artisan or guide at work. Wide.',
    tone: '#778890',
    src: '/images/drive/switzerland-alpine-cheesemaker.jpg',
    alt: 'Alpine cheesemaker beside his copper cauldron',
  },
  'exp-discover': {
    label: 'Discover',
    brief: 'Architecture, history, a hidden place. Wide.',
    tone: '#8798a1',
    src: '/images/drive/switzerland-lucerne-water-tower.jpg',
    alt: 'Chapel Bridge and Water Tower on the clear Reuss, Lucerne',
  },
  'exp-move': {
    label: 'Move',
    brief: 'On foot, on the water or on safari — the outdoors. Wide.',
    tone: '#7b8b93',
    src: '/images/drive/botswana-chobe-wild-dogs.jpg',
    alt: 'A pack of African wild dogs on the road, Chobe',
  },
  'home-hotel-1': {
    label: 'Hotel · Amalfi Coast',
    brief: 'The hotel itself, large — terrace, view, evening light.',
    tone: '#a2b5bf',
    src: '/images/hotel-1.jpg',
    alt: 'A hotel terrace above the sea at Positano, boats scattered on blue water',
  },
  'home-hotel-2': {
    label: 'Hotel · Lake Lucerne',
    brief: 'The hotel itself, large — the lake, the mountains behind.',
    tone: '#a2b5bf',
    src: '/images/drive/switzerland-lake-lucerne-grand-hotel.jpg',
    alt: 'Belle-epoque grand hotel on the green water of Lake Lucerne',
  },
  'home-hotel-3': {
    label: 'Hotel · Mallorca',
    brief: 'The hotel itself, large — stone, olive trees, a long table.',
    tone: '#a2b5bf',
    src: '/images/hotel-3.jpg',
    alt: 'An arcaded stone courtyard with citrus trees in Palma',
  },
  'svc-private': {
    label: 'Private Travel',
    brief: 'Two or a family, somewhere quiet and beautiful — their own pace.',
    tone: '#8c9ea6',
    src: '/images/drive/switzerland-guests-grindelwald-bench.jpg',
    alt: 'Guests on a bench facing the Grindelwald peaks',
  },
  'svc-cruises': {
    label: 'Cruises & Yachts',
    brief: 'A small ship or private yacht on clear water.',
    tone: '#7f9aa3',
    src: '/images/drive/switzerland-lugano-lake-steamer.jpg',
    alt: 'A paddle steamer and wooden jetty on Lake Lugano',
  },
  'svc-events': {
    label: 'Sports & Special Events',
    brief: 'The atmosphere of a great event — no logos, no identifiable venue.',
    tone: '#819098',
    src: '/images/drive/south-africa-guests-african-feast.jpg',
    alt: 'Guests sharing a long dinner table at an African feast',
  },
  'svc-villas': {
    label: 'Villas',
    brief: 'A house with a strong sense of place — terrace, garden, view.',
    tone: '#8c9ea6',
    src: '/images/drive/switzerland-bettmeralp-snow-chapel.jpg',
    alt: 'Snow-covered chalets and chapel at Bettmeralp',
  },
  'home-talk': {
    label: 'Speak to a travel designer',
    brief: 'A calm, wide view at dusk — room for type over it.',
    tone: '#2f3a3e',
    alt: 'Lake Lucerne and Mount Pilatus from a hotel balcony above the lakeside promenade, Switzerland',
    src: '/images/drive/switzerland-lake-lucerne-balcony-view.jpg',
  },

  /* ---- Home, Sample C (bright stills where the sample repeated a frame) - */
  'home-curated': {
    label: 'Principle · Personally curated',
    brief: 'One exceptional place in full sun — a lakeside villa, a garden, still water.',
    tone: '#7f9aa3',
    alt: 'Villa del Balbianello on its wooded point above the still water of Lake Como',
  },
  'home-way-cruises': {
    label: 'Ways · Cruises',
    brief: 'A yacht on clear, bright water, from above. Upright crop.',
    tone: '#3f8da0',
    alt: 'A motor yacht crossing turquoise water, seen from above',
  },
  'home-way-villas': {
    label: 'Ways · Private villas',
    brief: 'A private pool and terrace in warm light, the landscape beyond. Upright crop.',
    tone: '#8a9faa',
    alt: 'A curved infinity pool and terrace chairs above wooded hills',
  },
  'home-cove': {
    label: 'Shores · a turquoise cove',
    brief: 'Clear water below pine cliffs, a boat at anchor. Wide, room for type on the right.',
    tone: '#2f7f8f',
    alt: 'A white motor yacht at anchor in a turquoise cove below pine-covered cliffs',
  },

  /* ---- Home, Marc's update of 23 October 2026 ----------------------------
     Marc's own photographs, from the shared Google Drive. Save each one as
     public/images/<slot>.jpg and run `npm run images`; until a file lands the
     homepage keeps the frame (or film) it shows today. A slot with `src`
     already has a photograph of the same place standing in. */
  'client-way-group': {
    label: 'Ways · Small luxury group journeys',
    brief: 'Drive › Destinations › Kenya — the group journeys frame Marc chose. A still, no film.',
    tone: '#69808c',
    alt: 'Guests together on a small-group journey in Kenya',
  },
  'client-way-cruises': {
    label: 'Ways · Cruises',
    brief: 'Drive › Cruises — the cruise frame Marc chose.',
    tone: '#3f8da0',
    alt: 'A luxury yacht on open water',
  },
  'client-way-events': {
    label: 'Ways · Sports & events',
    brief: 'Drive › Sport & Event — the events frame Marc chose.',
    tone: '#657983',
    alt: 'Guests at a sporting event',
  },
  'client-way-villas': {
    label: 'Ways · Private villas',
    brief: 'Drive › Private Villas — the villa frame Marc chose.',
    tone: '#8a9faa',
    alt: 'A private villa in an extraordinary setting',
  },
  'client-why-curated': {
    label: 'Why · Personally curated',
    brief: 'Drive › Marc — Marc on the road.',
    tone: '#7f9aa3',
    alt: 'Marc Haeni on one of his journeys',
  },
  'client-why-paced': {
    label: 'Why · Thoughtfully paced',
    brief: 'Drive › Egypt — the frame Marc chose.',
    tone: '#89a6b4',
    alt: 'An unhurried moment in Egypt',
  },
  'client-why-moments': {
    label: 'Why · Meaningful experiences',
    brief: 'Drive › Morocco — the frame Marc chose.',
    tone: '#6b8a99',
    alt: 'An experience in Morocco',
  },
  'client-why-local': {
    label: 'Why · Local connections',
    brief: 'Drive › Kenya — the frame Marc chose.',
    tone: '#69808c',
    alt: 'Guests with local friends in Kenya',
  },
  'client-peaks': {
    label: 'Name · Peaks',
    brief: 'Drive › Marc — the "Peaks" photograph of Marc in the Alps. Wide, subject on the left.',
    tone: '#31383c',
    alt: 'Marc Haeni in the Swiss Alps',
  },
  'client-shores': {
    label: 'Name · Shores',
    brief:
      'Drive › Marc — the "Shores" photograph of Marc on the coast. Wide, subject on the right.',
    tone: '#2f7f8f',
    alt: 'Marc Haeni on the shore in Miami',
  },
  'client-hotel-victoria-falls': {
    label: 'Stay · The Palm River Hotel, Victoria Falls',
    brief:
      'Drive — "Palm River Pool" (Marc, 9 Nov): the hotel at dusk across its pool. Upright crop holds the guest wing on the right. The hotel’s HD pictures (Dropbox) may replace it later.',
    tone: '#2a2f45',
    src: '/images/home/hotel-palm-river-pool.jpg',
    alt: 'The Palm River Hotel at dusk, its lit balconies and terraces behind the pool, Victoria Falls',
  },
  'client-hotel-rovinj': {
    label: 'Stay · Grand Park Hotel Rovinj',
    brief:
      'Drive — "Grand Park exterior" (Marc, 9 Nov): the hotel and its garden terraces above the marina at sunset. Upright crop holds the terraces.',
    tone: '#4f7f95',
    src: '/images/home/hotel-grand-park-exterior.jpg',
    alt: 'Grand Park Hotel Rovinj at sunset, its garden terraces stepping down to the marina, the Old Town across the harbor',
  },
  'client-hotel-vipingo': {
    label: 'Stay · Cardamom House, Vipingo',
    brief:
      'Drive — "Cardamom_House_2023_Area_View_Manda_Toto_with_pool" (Marc, 9 Nov), the whole frame: zoomed out to the house with its pool (Marc’s review of 23 Nov; the crop to the pool and the bougainvillea, hotel-cardamom-pool.jpg, was shown until then). Upright crop holds the house and the pool.',
    tone: '#8a9faa',
    src: '/images/home/hotel-cardamom-pool-aerial.jpg',
    alt: 'Cardamom House, Vipingo, from the air: the house under its thatched roof above a long pool, pink bougainvillea and two guests at the water’s edge',
  },

  /* ---- Home, the journeys slider: the client's photographs (30 Oct) ---- */
  'home-jr-swiss': {
    label: 'Home slider · Swiss Elegance',
    brief: 'Oeschinensee from above, peaks all round. Wide.',
    tone: '#3f8fb0',
    src: '/images/home/jr-swiss-oeschinensee.jpg',
    alt: 'The turquoise Oeschinensee below rock walls and snowy peaks in the Bernese Oberland',
  },
  'home-jr-italy': {
    label: 'Home slider · Italy Uncovered',
    brief:
      'The salumeria frame again (8 Nov), from the client: a traveler with a board of prosciutto and an aperitivo in an Italian food hall. Wide.',
    tone: '#537484',
    src: '/images/home/italian-experience.jpg',
    alt: 'A smiling traveler holding a board of prosciutto and an aperitivo in an Italian food hall',
  },
  'home-jr-adriatic': {
    label: 'Home slider · The Adriatic Collection',
    brief:
      'Pexels 16908309 (8 Nov): Dubrovnik’s walls and Lovrijenac above the sea, golden light. Wide.',
    tone: '#3f6f80',
    src: '/images/home/jr-adriatic-dubrovnik-walls.jpg',
    alt: 'Dubrovnik’s old town walls and the Lovrijenac fortress above the Adriatic in golden light',
  },
  'home-xp-photo': {
    label: 'Home · The Peaks2Shores Experience',
    brief: 'One aspirational photograph beside the six signature touches. Upright.',
    tone: '#2f8f9d',
    src: '/images/drive/croatia-hvar-sailing.jpg',
    alt: 'A sailing yacht at anchor in clear turquoise water off the Croatian coast',
  },
  'home-jr-horizon': {
    label: 'Home slider · More journeys coming',
    // The Journey Book's own opener of "Journeys on the horizon" (page 18), in
    // place of the old draft photograph of Karnak (Ishika's notes of 24 Nov).
    brief: 'Sydney Harbour at sunset, the Journey Book’s “Journeys on the horizon”. Wide.',
    tone: '#525869',
    src: '/journey-book/img/sydney.jpg',
    alt: 'Sydney Harbour at sunset, with the Opera House, the city skyline and the Harbour Bridge',
  },

  /* ---- Home, all departures (one small bright frame per journey) ------- */
  'dep-swiss-lakes': {
    label: 'Departures · The Swiss Lakes',
    brief: 'A paddle steamer on Lake Lucerne under a clear sky. Small landscape crop.',
    tone: '#5f8fae',
    alt: 'A white paddle steamer on Lake Lucerne below Mount Pilatus',
  },
  'dep-amalfi': {
    label: 'Departures · Amalfi, Slowly',
    brief: 'Positano in full sun above the sea. Small landscape crop.',
    tone: '#4f8aa0',
    alt: 'Positano’s pastel houses climbing the hillside above a blue sea',
  },
  'dep-como': {
    label: 'Departures · Como & the Engadin',
    brief: 'A villa balcony with flowers, the lake and mountains beyond. Small landscape crop.',
    tone: '#6f8f9f',
    alt: 'A stone balcony with flowers above the lake and mountains',
  },
  'dep-mallorca': {
    label: 'Departures · Mallorca, Beyond the Coast',
    brief: 'A bright bay with boats at anchor and palms. Small landscape crop.',
    tone: '#4f97a3',
    alt: 'Boats at anchor in a turquoise bay below a hillside town, palms in the foreground',
  },
  'dep-cape': {
    label: 'Departures · The Cape, Unhurried',
    brief: 'The Twelve Apostles above the Atlantic shore. Small landscape crop.',
    tone: '#4a7f99',
    alt: 'The Twelve Apostles above the Atlantic coast near Cape Town',
  },

  /* ---- One photograph, one place --------------------------------------- */
  // Each of these gives a page its own frame where it used to borrow one that
  // already appears elsewhere on the site.
  'destinations-hero': {
    label: 'Destinations · where mountains meet water',
    brief: 'A lake below the Alps, wide — mountains and water in one frame.',
    tone: '#4d5c5e',
    src: '/images/drive/switzerland-lugano-bell-tower.jpg',
    alt: 'A bell tower among pines above Lake Lugano, mountains beyond',
  },
  'dest-italy': {
    label: 'Destination · Italy',
    brief: 'An Italian town, its lanes and its people. Wide.',
    tone: '#819098',
    src: '/images/pillar-1.jpg',
    alt: 'A narrow stone lane in an old Italian town, a few people walking towards the castle gate',
  },
  'dest-switzerland': {
    label: 'Destination · Switzerland',
    brief: 'A Swiss lake beneath cliffs. Upright.',
    tone: '#4d5c5e',
    src: '/images/drive/switzerland-lake-lucerne-cliffs.jpg',
    alt: 'Still lake water beneath green cliffs on Lake Lucerne',
  },
  'dest-spain': {
    label: 'Destination · Spain',
    brief: 'The Mallorcan coast at the end of the day. Wide.',
    tone: '#8798a1',
    src: '/images/pillar-4.jpg',
    alt: 'A single chair on a Mallorcan headland, facing the sea in the last light',
  },
  'dest-south-africa': {
    label: 'Destination · South Africa',
    brief: 'The Cape from Table Mountain. Upright.',
    tone: '#6c7f86',
    src: '/images/drive/south-africa-lions-head-table-mountain.jpg',
    alt: 'Lion’s Head and the Atlantic seaboard from Table Mountain',
  },
  'dest-private': {
    label: 'Destinations · private travel',
    brief: 'A wide, quiet view with room for type over it — mountains, meadow, sky.',
    tone: '#4d5c5e',
    alt: 'The Eiger above Grindelwald, Switzerland, a gondola crossing green meadows and chalets',
    src: '/images/drive/switzerland-grindelwald-eiger.jpg',
  },
  /* ---- Launch journeys --------------------------------------------------
     Each journey: hero (its page), list (Journeys index, upright), card
     (related journeys), a homepage frame, and a photograph per stay where
     one exists. The client's own where we have the place: the journey
     flyers' and the Journey Book's photographs (Ishika's notes of 24 Nov
     2026; web copies in public/images/journeys, recorded in
     reports/image-asset-plan.md) and Marc's Drive; Unsplash for the rest
     (provenance in public/images/credits.json). A `-flyer` slot holds the
     flyer's photograph of a stay whose older slot keeps its own file. */
  'se-hero': {
    label: 'Hero · Swiss Elegance',
    brief: 'Lake Lucerne and the Alps. Wide.',
    tone: '#5f7580',
    src: '/images/drive/switzerland-lake-lucerne-balcony-view.jpg',
    alt: 'Lake Lucerne, the town’s waterfront and boats, with Mount Pilatus beyond',
  },
  'se-list': {
    label: 'Swiss Elegance',
    brief: 'A Lucerne grand hotel. Upright.',
    tone: '#4d5c5e',
    src: '/images/drive/switzerland-grand-hotel-facade.jpg',
    alt: 'The entrance of a belle-époque grand hotel in Lucerne, under its glass canopy',
  },
  // The journey's photograph in the Map view, the menu and the Plan page: the
  // Swiss Elegance flyer's cover, in place of a steamer under low cloud
  // (Marc's review of 23 Nov: "replace the current Switzerland pictures").
  'se-card': {
    label: 'Card · Swiss Elegance',
    brief:
      'The Swiss Elegance flyer’s cover (28 Oct): Lucerne from above, its lake steamers and the Alps. Wide.',
    tone: '#56707c',
    src: '/images/journeys/jy-lucerne-from-above.jpg',
    alt: 'Lucerne from above, its old town roofs and towers, paddle steamers at the quay and the lake reaching to the Alps',
  },
  'se-lucerne': {
    label: 'Swiss Elegance · Lucerne',
    brief: 'The Chapel Bridge and old town.',
    tone: '#5f7580',
    src: '/images/sl-1.jpg',
    alt: 'The Chapel Bridge and old town of Lucerne reflected in the still river',
  },
  'se-grindelwald': {
    label: 'Swiss Elegance · Grindelwald',
    brief:
      'The flyer’s Grindelwald photograph (the Journey Book’s f_train.jpg): a mountain train below the Jungfrau peaks.',
    tone: '#56707c',
    src: '/images/journeys/jy-grindelwald-train.jpg',
    alt: 'A red mountain train climbing through wildflower meadows below the snowy peaks and glaciers of the Jungfrau region',
  },
  'se-montreux': {
    label: 'Swiss Elegance · Montreux',
    brief: 'The Lavaux vineyards above Lake Geneva.',
    tone: '#506874',
    src: '/images/drive/switzerland-guests-lavaux-vineyards.jpg',
    alt: 'Two travelers among the Lavaux vineyards above Lake Geneva',
  },
  'se-zermatt': {
    label: 'Swiss Elegance · Zermatt',
    brief: 'Zermatt village.',
    tone: '#3f5059',
    src: '/images/drive/switzerland-zermatt-chalets.jpg',
    alt: 'Old larch chalets with geraniums on a lane in Zermatt',
  },
  'se-stresa': {
    label: 'Swiss Elegance · Stresa',
    brief: 'The flyer’s Stresa & Lake Maggiore photograph: Isola Bella from the air.',
    tone: '#5f8394',
    src: '/images/journeys/jy-stresa-isola-bella-aerial.jpg',
    alt: 'Isola Bella from the air, the Borromeo palace and its terraced gardens on Lake Maggiore, the Stresa shore and the Alps beyond',
  },
  'se-milan': {
    label: 'Swiss Elegance · Milan',
    brief: 'The Duomo.',
    tone: '#62737b',
    alt: 'The marble facade of Milan’s Duomo on the cathedral square under an evening sky',
  },
  'se-milan-flyer': {
    label: 'Swiss Elegance · Milan (flyer)',
    brief:
      'The flyer’s Milan photograph, cut 4:3 around the Duomo clear of its printed label (949x712: the flyer holds it no larger).',
    tone: '#4f6573',
    src: '/images/journeys/jy-milan-duomo.jpg',
    alt: 'Milan’s Duomo at sunset across an empty Piazza del Duomo',
  },
  'ie-hero': {
    label: 'Hero · The Italian Experience',
    brief: 'Lake Garda. Wide.',
    tone: '#4f7380',
    alt: 'The Scaliger Castle at Sirmione rising from the clear water of Lake Garda',
  },
  'ie-list': {
    label: 'The Italian Experience',
    brief: 'Bologna’s arcades. Upright.',
    tone: '#537484',
    alt: 'Ocher arcades along a busy street in Bologna in the sun',
  },
  'ie-card': {
    label: 'Card · The Italian Experience',
    brief: 'Sirmione on Lake Garda.',
    tone: '#5d7884',
    alt: 'Sirmione’s waterfront and castle towers on Lake Garda, a snow-capped mountain beyond',
  },
  'ie-bologna': {
    label: 'The Italian Experience · Bologna',
    brief: 'Bologna’s porticoes.',
    tone: '#537484',
    alt: 'Looking along the vaulted ocher porticoes of a street in Bologna',
  },
  'ie-bologna-flyer': {
    label: 'Italy Uncovered · Bologna & Emilia-Romagna (flyer)',
    brief:
      'The flyer’s Bologna & Emilia-Romagna photograph, the homepage’s Italy Uncovered frame: a traveler with prosciutto and an aperitivo.',
    tone: '#537484',
    src: '/images/home/italian-experience.jpg',
    alt: 'A smiling traveler holding a board of prosciutto and an aperitivo in an Italian salumeria',
  },
  'ie-motor-valley': {
    label: 'Italy Uncovered · Motor Valley',
    brief: 'A Ferrari at the Ferrari Museum, Maranello (Wikimedia Commons, credited).',
    tone: '#5d7682',
    src: '/images/journeys/jy-motor-valley-ferrari.jpg',
    alt: 'A Ferrari race car on display at the Ferrari Museum in Maranello',
  },
  'ie-verona': {
    label: 'Italy Uncovered · Valpolicella & Verona',
    brief: 'The flyer’s Verona photograph (Marc’s Drive, 25 Oct): the Arena on Piazza Bra.',
    tone: '#6a8390',
    src: '/images/home/jr-italy-verona-arena.jpg',
    alt: 'The Roman Arena on Piazza Bra in Verona at dawn, the pastel houses of the square beside it',
  },
  'ie-garda': {
    label: 'The Italian Experience · Lake Garda',
    brief: 'Lake Garda from above.',
    tone: '#3f7c86',
    alt: 'The Sirmione peninsula reaching into turquoise water on Lake Garda, seen from above',
  },
  'ie-venice': {
    label: 'The Italian Experience · Venice',
    brief: 'A Venetian canal.',
    tone: '#4e6a7c',
    alt: 'Colorful palazzi along the Grand Canal in Venice, boats on the water',
  },
  'dep-italian-experience': {
    label: 'Departures · The Italian Experience',
    brief: 'A gondola in Venice. Small landscape crop.',
    tone: '#4e616a',
    alt: 'A gondolier steering a gondola with passengers along a Venice canal',
  },
  'ac-hero': {
    label: 'Hero · The Adriatic Collection',
    brief: 'Dubrovnik’s walls above the sea. Wide.',
    tone: '#3f6f80',
    src: '/images/drive/croatia-dubrovnik-old-town-walls.jpg',
    alt: 'Dubrovnik’s walls and the Lovrijenac fortress above clear Adriatic water',
  },
  'ac-list': {
    label: 'The Adriatic Collection',
    brief: 'Hvar harbor. Upright.',
    tone: '#3f6f80',
    src: '/images/drive/croatia-hvar-harbour.jpg',
    alt: 'Hvar town harbor and the Pakleni Islands beyond',
  },
  'ac-card': {
    label: 'Card · The Adriatic Collection',
    brief: 'Split from above.',
    tone: '#4b6b78',
    src: '/images/drive/croatia-split-waterfront.jpg',
    alt: 'Split’s old town and harbor from above',
  },
  'ac-venice': {
    label: 'The Adriatic Collection · Venice',
    brief: 'The Grand Canal.',
    tone: '#6c7c88',
    alt: 'The Grand Canal in Venice, the domes of Santa Maria della Salute beyond',
  },
  'ac-venice-flyer': {
    label: 'The Adriatic Collection · Venice (flyer)',
    brief: 'The Adriatic flyer’s Venice photograph: two spritzes above the Grand Canal.',
    tone: '#66808c',
    src: '/images/home/way-private-venice.jpg',
    alt: 'Two Aperol spritzes and cicchetti on a ledge above the Grand Canal at golden hour, Santa Maria della Salute beyond',
  },
  'ac-istria': {
    label: 'The Adriatic Collection · Rovinj & Istria',
    brief:
      'The flyer’s “A Peaks2Shores moment”: a truffle hunter and his dog in an Istrian wood (1180x676, the size the flyer holds).',
    tone: '#4a616c',
    src: '/images/journeys/jy-istria-truffle-hunter.jpg',
    alt: 'A truffle hunter in a hat greeting his white truffle dog in a green spring wood',
  },
  'ac-split': {
    label: 'The Adriatic Collection · Split',
    brief:
      'The flyer’s Diocletian’s Palace photograph (625x535, the size the flyer holds): the cathedral’s bell tower above the harbor.',
    tone: '#5b7d8c',
    src: '/images/journeys/jy-split-diocletians-palace.jpg',
    alt: 'The bell tower of St Domnius Cathedral above Diocletian’s Palace in Split, the harbor and the sea beyond',
  },
  'ac-dubrovnik': {
    label: 'The Adriatic Collection · Dubrovnik',
    brief:
      'The flyer’s Mount Srđ photograph (the Journey Book’s f_dubrovnik_hd.jpg): the Panorama Restaurant above the old town.',
    tone: '#465e6a',
    src: '/images/journeys/jy-dubrovnik-mount-srd.jpg',
    alt: 'Tables set on the terrace of the Panorama Restaurant on Mount Srđ, Dubrovnik’s old town and harbor far below',
  },
  'dep-adriatic': {
    label: 'Departures · The Adriatic Collection',
    brief: 'Sailing off Hvar. Small landscape crop.',
    tone: '#2f7a8a',
    src: '/images/drive/croatia-hvar-sailing.jpg',
    alt: 'A yacht at anchor over turquoise water off Hvar',
  },
  'dest-croatia': {
    label: 'Destination · Croatia',
    brief: 'A Dalmatian old town by the sea.',
    tone: '#5b6f78',
    src: '/images/drive/croatia-korcula-old-town.jpg',
    alt: 'The old town of Korčula on its peninsula in the Adriatic',
  },
  'sl-hero': {
    label: 'Hero · The Swiss Lakes',
    brief: 'Lucerne’s old town on the water. Wide.',
    tone: '#5f7580',
    src: '/images/drive/switzerland-lucerne-old-town-river.jpg',
    alt: 'Lucerne old town facades across the turquoise Reuss',
  },
  // List photographs for the Journeys index: upright, 4K, and nowhere else.
  'sl-list': {
    label: 'The Swiss Lakes',
    brief: 'Lake Lucerne country from above. Upright.',
    tone: '#4d5c5e',
    src: '/images/drive/switzerland-pilatus-cable-car.jpg',
    alt: 'A red cable car descending over forest from Pilatus',
  },
  'ma-list': {
    label: 'Mallorca',
    brief: 'The Tramuntana coast — cliffs, pines, clear water. Upright.',
    tone: '#4d6f7a',
    alt: 'Pine-covered cliffs falling to a cove of clear turquoise water on the Mallorcan coast',
  },
  'cp-list': {
    label: 'The Cape',
    brief: 'The Cape Peninsula from the cliffs. Upright.',
    tone: '#6c7f86',
    src: '/images/drive/south-africa-cape-point-cliffs.jpg',
    alt: 'The Cape Point headland and the Atlantic from the cliff path',
  },
  'ce-list': {
    label: 'Como & the Engadin',
    brief: 'A villa on Lake Como, the mountains behind. Upright.',
    tone: '#5e6e76',
    alt: 'A lakeside villa and its gardens on Lake Como, a motor launch passing',
  },
  // The Instagram links page leads with this, not a photograph from the site.
  'links-amalfi': {
    label: 'Amalfi, Slowly',
    brief: 'The Amalfi coast from the water.',
    tone: '#819098',
    src: '/images/home-hero.jpg',
    alt: 'A sailing boat at anchor off the Amalfi Coast, a cliffside town and the coast fading into haze behind',
  },
  'plan-private': {
    label: 'Bespoke private travel',
    brief: 'Guests on their own journey, somewhere memorable. Upright.',
    tone: '#8c9ea6',
    src: '/images/drive/switzerland-guests-jungfraujoch.jpg',
    alt: 'Guests with the Swiss flag on the Jungfraujoch snowfield',
  },
  'not-found': {
    label: 'Not found',
    brief: 'A quiet path through open country. Upright.',
    tone: '#758892',
    src: '/images/drive/switzerland-gstaad-meadow.jpg',
    alt: 'Alpine meadow and footpath above Gstaad',
  },

  /* ---- Journeys index -------------------------------------------------- */
  'jl-1': {
    label: 'Amalfi, Slowly',
    brief: 'Amalfi — a fishing boat below lemon terraces.',
    tone: '#819098',
    alt: 'Positano rising from the sea beneath steep mountains, seen from a boat',
  },
  'jl-2': {
    label: 'The Swiss Lakes',
    brief: 'Swiss lake — still water, larches, first snow on the peaks.',
    tone: '#4d5c5e',
    alt: 'A belle-époque grand hotel on the green water of Lake Lucerne, wooded slopes behind',
  },
  'jl-3': {
    label: 'Mallorca',
    brief: 'Mallorca — a stone finca, olive trees, the Tramuntana behind.',
    tone: '#8798a1',
    alt: 'Valldemossa among the wooded slopes of the Tramuntana',
  },
  'jl-4': {
    label: 'The Cape',
    brief: 'Cape winelands — vines, mountains, a farmhouse in warm light.',
    tone: '#5c707b',
    alt: 'A Franschhoek wine farm among vineyards beneath the mountains',
  },
  'jl-5': {
    label: 'Como & the Engadin',
    brief: 'Lake Como — a villa garden meeting the water.',
    tone: '#5e6e76',
    alt: 'A lakeside villa garden meeting the water at Varenna on Lake Como',
  },

  /* ---- Journey: Amalfi, Slowly ----------------------------------------- */
  'am-hero': {
    label: 'Hero · Amalfi from the water',
    brief: 'Amalfi coast from the water, a single boat, early light — no crowds, no landmarks.',
    tone: '#5a6971',
    alt: 'Amalfi from the water, the town stacked against terraced cliffs, boats in the harbor',
  },
  'am-why': {
    label: 'Lemon terraces',
    brief: 'Lemon terraces above the sea, a person picking, warm light.',
    tone: '#7c97a5',
    alt: 'Terraced hillsides falling to the sea below Ravello',
  },
  'am-map': {
    label: 'Map · Sorrento peninsula',
    brief: 'Sorrento peninsula, hand-drawn or muted — Positano, Nerano, Ravello, Capri marked.',
    tone: '#c7dae3',
    alt: 'The Sorrento coast and harbor from above, the peninsula stretching into the bay',
  },
  'am-h1': {
    label: 'Above Positano',
    brief: 'Hotel terrace above the sea, umbrella pines, evening light.',
    tone: '#a2b5bf',
    alt: 'A tiled hotel terrace above Positano, table and chairs facing the sea',
  },
  'am-h2': {
    label: 'The quiet side',
    brief: 'Cloister courtyard with citrus trees and stone arches.',
    tone: '#95a7b0',
    alt: 'Cloister arches around a quiet courtyard garden',
  },
  d1: {
    label: 'Day 01',
    brief: 'Hotel terrace, first evening, glasses on a table.',
    tone: '#7b8b93',
    alt: 'Glasses of prosecco and a candle on a terrace table in Positano, first evening',
  },
  d2: {
    label: 'Day 02',
    brief: 'Steep lane in Positano, morning shade, one figure.',
    tone: '#7c97a5',
    alt: 'A steep stepped lane in Positano, a glimpse of blue sea at its end',
  },
  d3: {
    label: 'Day 03',
    brief: 'Wooden boat at anchor, turquoise water, people swimming.',
    tone: '#4d6f7a',
    alt: 'Small boats on clear water beside a rocky islet off the Amalfi Coast',
  },
  d4: {
    label: 'Day 04',
    brief: 'Lemon grove path, dappled light, a set table below.',
    tone: '#7a98a7',
    alt: 'A historic villa garden in Ravello under umbrella pines',
  },
  d5: {
    label: 'Day 05',
    brief: 'Empty sunbeds at a beach club, late morning.',
    tone: '#6c7f86',
    alt: 'A beach club from above at Positano, blue umbrellas lined up by the water',
  },
  d6: {
    label: 'Day 06',
    brief: 'Capri cliffs from the water, a small boat.',
    tone: '#5a6d78',
    alt: 'Capri’s sea stacks from the water, a small boat passing beneath the arch',
  },
  d7: {
    label: 'Day 07',
    brief: 'Hands stretching fresh mozzarella, farmhouse kitchen.',
    tone: '#78909d',
    alt: 'Hands stretching fresh mozzarella in a Campanian dairy',
  },
  d8: {
    label: 'Day 08',
    brief: 'Coastal footpath high above the sea, two walkers.',
    tone: '#758892',
    alt: 'Walkers on the Path of the Gods high above the Amalfi Coast',
  },
  d9: {
    label: 'Day 09',
    brief: 'Breakfast table on a terrace, morning light.',
    tone: '#96abb5',
    alt: 'Coffee and sugared pastries on a marble table, morning',
  },
  g1: {
    label: 'Wide',
    brief: 'The coast from the water at dusk.',
    tone: '#4d6f7a',
    alt: 'The Amalfi Coast at dusk, a town on the cliffs above the harbor',
  },
  g2: {
    label: 'Detail',
    brief: 'Lemons in a crate.',
    tone: '#7c97a5',
    alt: 'Ripe lemons, some halved, in wooden crates',
  },
  g3: {
    label: 'Human',
    brief: 'Two guests laughing at a table.',
    tone: '#7b8b93',
    alt: 'A white tablecloth laid with crystal glasses, plates and lemons in dappled light',
  },
  g4: {
    label: 'Architecture',
    brief: 'A cloister arch.',
    tone: '#7a98a7',
    alt: 'A cloister arcade of stone columns and greenery',
  },
  g5: {
    label: 'Quiet',
    brief: 'An empty terrace at noon.',
    tone: '#6c7f86',
    alt: 'An empty whitewashed terrace above Positano at noon',
  },

  /* ---- Journey: The Swiss Lakes — day by day --------------------------- */
  'sl-1': {
    label: 'Day 01',
    brief: 'Lucerne’s lakefront, a steamer at the jetty.',
    tone: '#6f8088',
    alt: 'The Chapel Bridge and old town of Lucerne reflected in the still river',
  },
  'sl-2': {
    label: 'Day 02',
    brief: 'A paddle steamer on Lake Lucerne, mountains behind.',
    tone: '#5f7580',
    alt: 'A paddle steamer on Lake Lucerne under low cloud',
  },
  'sl-3': {
    label: 'Day 03',
    brief: 'Pilatus above the cloud, cogwheel rail.',
    tone: '#6b7a7c',
    alt: 'The view from Pilatus at sunrise, ridges falling to Lake Lucerne below the cloud',
  },
  'sl-4': {
    label: 'Day 04',
    brief: 'The Albula line — a viaduct in the forest.',
    tone: '#5c6d76',
    alt: 'A red Rhaetian Railway train crossing the Landwasser Viaduct in the forest',
  },
  'sl-5': {
    label: 'Day 05',
    brief: 'Lake Sils, still water, larches.',
    tone: '#4d5c5e',
    alt: 'Golden larches above Lake Sils, peaks and a clear autumn sky',
  },
  'sl-6': {
    label: 'Day 06',
    brief: 'An Engadin village lane, sgraffito houses.',
    tone: '#8798a1',
    alt: 'Sgraffito walls and flower boxes on an Engadin house in Guarda',
  },
  'sl-7': {
    label: 'Day 07',
    brief: 'A rowing boat on an Engadin lake, nobody hurrying.',
    tone: '#5d6f78',
    alt: 'A wooden jetty on Lej da Staz, larch forest and peaks mirrored in the lake',
  },
  'sl-8': {
    label: 'Day 08',
    brief: 'Zürich’s lake shore in morning light.',
    tone: '#8a949a',
    alt: 'Sailboats at anchor on Lake Zurich at sunrise',
  },

  /* ---- Journey: Mallorca — day by day ---------------------------------- */
  'ma-1': {
    label: 'Day 01',
    brief: 'The Tramuntana from the road, olives below.',
    tone: '#748c97',
    alt: 'The Tramuntana mountains from a high pass, ridges fading towards the sea',
  },
  'ma-2': {
    label: 'Day 02',
    brief: 'Deià on its hill, the sea behind.',
    tone: '#8798a1',
    alt: 'Deià on its hill beneath the Tramuntana, terracotta roofs in the foreground',
  },
  'ma-3': {
    label: 'Day 03',
    brief: 'A cove on the west coast, clear water.',
    tone: '#4d6f7a',
    alt: 'A turquoise cove on the Mallorcan coast framed by pines',
  },
  'ma-4': {
    label: 'Day 04',
    brief: 'Old olive trees on a terrace.',
    tone: '#748c97',
    alt: 'Old olive trees in a dry field, cloud on the Mallorcan mountains',
  },
  'ma-5': {
    label: 'Day 05',
    brief: 'The wooden train to Sóller, orange groves.',
    tone: '#7c97a5',
    alt: 'Boats in the bay at Port de Sóller, the town on the hill',
  },
  'ma-6': {
    label: 'Day 06',
    brief: 'A finca pool at noon, empty.',
    tone: '#8798a1',
    alt: 'A long stone-edged pool at a Mallorcan finca, palms and mountains behind',
  },
  'ma-7': {
    label: 'Day 07',
    brief: 'Palma’s old town, morning.',
    tone: '#96abb5',
    alt: 'Palma Cathedral reflected in calm water',
  },

  /* ---- Journey: The Cape — day by day ---------------------------------- */
  'cp-1': {
    label: 'Day 01',
    brief: 'Table Mountain from the city, late light.',
    tone: '#6c7f86',
    alt: 'Table Mountain across the bay from Bloubergstrand at sunset',
  },
  'cp-2': {
    label: 'Day 02',
    brief: 'The city from the mountain top.',
    tone: '#7f9aa3',
    alt: 'Camps Bay and the Twelve Apostles from above',
  },
  'cp-3': {
    label: 'Day 03',
    brief: 'Vineyards and a Cape Dutch farmhouse.',
    tone: '#5c707b',
    alt: 'A whitewashed Cape Dutch farmhouse at the end of a brick path under old oaks',
  },
  'cp-4': {
    label: 'Day 04',
    brief: 'Vines in rows under the mountains.',
    tone: '#637c88',
    alt: 'Rows of vines beneath the mountains near Stellenbosch',
  },
  'cp-5': {
    label: 'Day 05',
    brief: 'A long table laid outdoors at dusk.',
    tone: '#78909d',
    alt: 'A wine estate terrace and lawn beneath the mountains, Stellenbosch',
  },
  'cp-6': {
    label: 'Day 06',
    brief: 'Sunset over the winelands.',
    tone: '#7c97a5',
    alt: 'Vineyards climbing towards a mountain in the Stellenbosch winelands',
  },
  'cp-7': {
    label: 'Day 07',
    brief: 'Chapman’s Peak, the coast road above the Atlantic.',
    tone: '#5a6d78',
    alt: 'Chapman’s Peak Drive cut into the cliffs above the Atlantic, late light',
  },
  'cp-8': {
    label: 'Day 08',
    brief: 'Cape Point cliffs, or the penguins at Boulders.',
    tone: '#6c7f86',
    alt: 'The lighthouse on the cliffs at Cape Point above a deep blue sea',
  },
  'cp-9': {
    label: 'Day 09',
    brief: 'A long empty Atlantic beach.',
    tone: '#8a949a',
    alt: 'The long white beach at Noordhoek from the hillside',
  },
  'cp-10': {
    label: 'Day 10',
    brief: 'A fire on the beach, evening.',
    tone: '#5c707b',
    alt: 'Dune grass on Noordhoek beach in warm evening light',
  },
  'cp-11': {
    label: 'Day 11',
    brief: 'Cape Town harbor, morning.',
    tone: '#7f9aa3',
    alt: 'The V&A Waterfront harbor with Table Mountain behind',
  },

  /* ---- Journey: Como & the Engadin — day by day ------------------------ */
  'ce-1': {
    label: 'Day 01',
    brief: 'A villa garden meeting Lake Como.',
    tone: '#5e6e76',
    alt: 'Stone arches and potted plants on a villa balcony above Lake Como',
  },
  'ce-2': {
    label: 'Day 02',
    brief: 'A boat on Lake Como, villas along the shore.',
    tone: '#5a6d78',
    alt: 'Lake Como from the bow of a wooden motorboat',
  },
  'ce-3': {
    label: 'Day 03',
    brief: 'Bellagio’s point and its gardens.',
    tone: '#657983',
    alt: 'Bellagio on its point between the arms of Lake Como',
  },
  'ce-4': {
    label: 'Day 04',
    brief: 'A jetty on the lake, empty chairs.',
    tone: '#6c7f86',
    alt: 'A jetty with a classic wooden boat on Lake Como',
  },
  'ce-5': {
    label: 'Day 05',
    brief: 'The Bernina line crossing a viaduct.',
    tone: '#5c6d76',
    alt: 'A red Bernina train crossing a stone viaduct in Valposchiavo',
  },
  'ce-6': {
    label: 'Day 06',
    brief: 'St. Moritz and its lake, first snow.',
    tone: '#8a949a',
    alt: 'St. Moritz lake in early snow, autumn larches on the shore',
  },
  'ce-7': {
    label: 'Day 07',
    brief: 'Val Roseg larches in October gold.',
    tone: '#7c97a5',
    alt: 'Engadin larch needles turned gold in October',
  },
  'ce-8': {
    label: 'Day 08',
    brief: 'A still Engadin lake at dawn.',
    tone: '#4d5c5e',
    alt: 'Lake Sils at dusk, trees silhouetted on the shore beneath the mountains',
  },
  'ce-9': {
    label: 'Day 09',
    brief: 'Soglio on its ledge, granite behind.',
    tone: '#657983',
    alt: 'Soglio at night on its ledge in Val Bregaglia',
  },
  'ce-10': {
    label: 'Day 10',
    brief: 'A train leaving the mountains.',
    tone: '#6b7a7c',
    alt: 'A Rhaetian Railway train on the Albula line in autumn color',
  },

  /* ---- Marc ------------------------------------------------------------ */
  'marc-portrait': {
    label: 'Marc Haeni',
    brief: 'Studio portrait of Marc Haeni.',
    tone: '#dfecf5', // the stone ground he is cut out against (--color-stone)
    src: '/brand/marc.webp',
    alt: 'Marc Haeni, founder of Peaks2Shores',
    width: 1150,
    height: 1400,
  },
  // Chosen by Marc for Our Story (October 2026).
  'story-hero': {
    label: 'Our story · the opening',
    brief: 'The Bachalpsee trail above Grindelwald: a path, an alpine lake, the peaks beyond.',
    tone: '#527283',
    src: '/images/story-hero.jpg',
    alt: 'A gravel trail through green alpine meadows to the Bachalpsee above Grindelwald, Switzerland, snow-capped peaks beyond',
  },
  'marc-eiger': {
    label: 'Marc Haeni',
    brief: 'Marc in the VIP lounge of the Eiger Express, Grindelwald.',
    tone: '#2f3b45',
    src: '/images/marc-eiger.jpg',
    alt: 'Marc Haeni, founder of Peaks2Shores, in the VIP lounge of the Eiger Express in Grindelwald, a gondola passing the window behind him',
  },

  /* ---- Journal --------------------------------------------------------- */
  'jn-1': {
    label: 'The Engadin',
    brief: 'A high valley in larch-gold light, late autumn.',
    tone: '#657983',
    alt: 'Golden larches framing Lake Sils in the Engadin, late autumn',
  },
  'jn-2': {
    label: 'September on the coast',
    brief: 'An empty Amalfi beach in soft September light.',
    tone: '#6c7f86',
    alt: 'The Amalfi Coast in soft light, boats moored below the town',
  },
  'jn-3': {
    label: 'At the table',
    brief: 'A family table mid-meal, plates and hands, no faces.',
    tone: '#78909d',
    alt: 'A long table laid outdoors in the shade of a great tree',
  },
  'jn-4': {
    label: 'A hotel worth the trip',
    brief: 'A hotel corridor or reading room, nobody in it.',
    tone: '#95a7b0',
    alt: 'Two wooden chairs on a whitewashed terrace above the sea',
  },
} as const satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;

export function getMedia(key: MediaKey): MediaSlot {
  const slot: MediaSlot = media[key];
  // A file dropped into public/images/ wins over anything declared here.
  const found = discovered[key];
  return found ? { ...slot, ...found } : slot;
}

/** Whether a photograph has been dropped into public/images/ for this slot. */
export function hasPhoto(key: MediaKey): boolean {
  return key in discovered;
}
