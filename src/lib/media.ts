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
  /** The colour the frame holds before and behind the photograph. */
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
    tone: '#c9bea9',
    alt: 'A narrow stone lane in an old Italian town, a few people walking towards the castle gate',
  },
  'pillar-2': {
    label: 'Curated',
    brief: 'A single set table on a stone terrace above the water.',
    tone: '#c9bea9',
    alt: 'A taverna terrace of potted plants and old roofs above a calm blue sea',
  },
  'pillar-3': {
    label: 'Connected',
    brief: 'Hands at a market stall — produce, conversation, detail.',
    tone: '#c9bea9',
    alt: 'Oranges, artichokes and greens in crates at an Italian market stall',
  },
  'pillar-4': {
    label: 'Thoughtfully paced',
    brief: 'A single chair or a terrace facing the sea, a book left on it — soft evening light.',
    tone: '#c9bea9',
    alt: 'A single chair on a Mallorcan headland, facing the sea in the last light',
  },
  'feat-1': {
    label: 'Amalfi',
    brief: 'Amalfi — a fishing boat below lemon terraces.',
    tone: '#8c8f86',
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
    tone: '#9a9587',
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
    tone: '#9a9587',
    alt: 'A long table laid for lunch beneath a pergola in the Tuscan hills',
  },
  'ex-2': {
    label: 'Meet',
    brief: 'An artisan at work in a small workshop.',
    tone: '#8a8478',
    alt: 'An artisan’s hands shaping a clay bowl on a potter’s wheel',
  },
  'ex-3': {
    label: 'Discover',
    brief: 'A quiet cloister or hillside village lane.',
    tone: '#9a9587',
    alt: 'A quiet stone lane in an old Tuscan village, lined with potted plants',
  },
  'ex-4': {
    label: 'Explore',
    brief: 'A ridge trail or a sailboat, two people, wide.',
    tone: '#7f8c85',
    alt: 'A lone sailboat on calm open sea',
  },
  'ex-5': {
    label: 'Stay',
    brief: 'A hotel room with the doors open to a view.',
    tone: '#a09a8c',
    alt: 'Tall windows open onto a balcony, pines and the Ligurian coast beyond',
  },
  'hotel-1': {
    label: 'Amalfi Coast',
    brief: 'Hotel terrace above the sea, umbrella pines, evening light.',
    tone: '#b9b1a0',
    alt: 'A hotel terrace above the sea at Positano, boats scattered on blue water',
  },
  'hotel-2': {
    label: 'Lake Lucerne',
    brief: 'Belle-époque hotel facade on a lake, mountains behind.',
    tone: '#b9b1a0',
    alt: 'Belle-époque facades along the Lucerne waterfront, reflected in the lake',
  },
  'hotel-3': {
    label: 'Mallorca',
    brief: 'Stone finca courtyard, olive trees, a long table.',
    tone: '#b9b1a0',
    alt: 'An arcaded stone courtyard with citrus trees in Palma',
  },

  /* ---- Home, redesign (client review, October 2026) -------------------- */
  // These slots carry an explicit `src` while they borrow a photograph from
  // another slot; point them at Marc's own photography as it is sorted.
  'home-video-poster': {
    label: 'Hero · reel poster',
    brief: 'The first frame of the hero reel — Marc’s own footage.',
    tone: '#1f2a26',
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
    tone: '#c9bea9',
    src: '/images/drive/switzerland-guests-lucerne-chapel-bridge.jpg',
    alt: 'Marc’s small group by the Chapel Bridge, Lucerne',
  },
  'principle-2': {
    label: 'Curated',
    brief: 'One exceptional place — a terrace, a view, nothing extra.',
    tone: '#c9bea9',
    src: '/images/drive/switzerland-pilatus-summit.jpg',
    alt: 'Pilatus summit terrace above a sea of cloud and Lake Lucerne',
  },
  'principle-3': {
    label: 'Connected',
    brief: 'A market, a cellar, a kitchen — access through people.',
    tone: '#c9bea9',
    src: '/images/drive/south-africa-winelands-barrel-cellar.jpg',
    alt: 'Oak barrels lining a Stellenbosch wine cellar',
  },
  'principle-4': {
    label: 'Thoughtfully paced',
    brief: 'A free afternoon — a pool, a lake, a book. Stillness.',
    tone: '#c9bea9',
    src: '/images/drive/south-africa-qwabi-lodge-pool.jpg',
    alt: 'A lodge plunge pool overlooking the bushveld hills, Qwabi',
  },
  'exp-taste': {
    label: 'Taste',
    brief: 'Food, wine, a table worth booking. Wide.',
    tone: '#9a9587',
    src: '/images/drive/switzerland-guests-lavaux-vineyards.jpg',
    alt: 'Two guests among the Lavaux vineyards above Lake Geneva',
  },
  'exp-meet': {
    label: 'Meet',
    brief: 'A local host, artisan or guide at work. Wide.',
    tone: '#8a8478',
    src: '/images/drive/switzerland-alpine-cheesemaker.jpg',
    alt: 'Alpine cheesemaker beside his copper cauldron',
  },
  'exp-discover': {
    label: 'Discover',
    brief: 'Architecture, history, a hidden place. Wide.',
    tone: '#9a9587',
    src: '/images/drive/switzerland-lucerne-water-tower.jpg',
    alt: 'Chapel Bridge and Water Tower on the clear Reuss, Lucerne',
  },
  'exp-move': {
    label: 'Explore',
    brief: 'On foot, on the water or on safari — the outdoors. Wide.',
    tone: '#7f8c85',
    src: '/images/drive/botswana-chobe-wild-dogs.jpg',
    alt: 'A pack of African wild dogs on the road, Chobe',
  },
  'home-hotel-1': {
    label: 'Hotel · Amalfi Coast',
    brief: 'The hotel itself, large — terrace, view, evening light.',
    tone: '#b9b1a0',
    src: '/images/hotel-1.jpg',
    alt: 'A hotel terrace above the sea at Positano, boats scattered on blue water',
  },
  'home-hotel-2': {
    label: 'Hotel · Lake Lucerne',
    brief: 'The hotel itself, large — the lake, the mountains behind.',
    tone: '#b9b1a0',
    src: '/images/drive/switzerland-lake-lucerne-grand-hotel.jpg',
    alt: 'Belle-epoque grand hotel on the green water of Lake Lucerne',
  },
  'home-hotel-3': {
    label: 'Hotel · Mallorca',
    brief: 'The hotel itself, large — stone, olive trees, a long table.',
    tone: '#b9b1a0',
    src: '/images/hotel-3.jpg',
    alt: 'An arcaded stone courtyard with citrus trees in Palma',
  },
  'svc-private': {
    label: 'Private Travel',
    brief: 'Two or a family, somewhere quiet and beautiful — their own pace.',
    tone: '#a09a8c',
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
    tone: '#8c8f86',
    src: '/images/drive/south-africa-guests-african-feast.jpg',
    alt: 'Guests sharing a long dinner table at an African feast',
  },
  'svc-villas': {
    label: 'Villas',
    brief: 'A house with a strong sense of place — terrace, garden, view.',
    tone: '#a09a8c',
    src: '/images/drive/switzerland-bettmeralp-snow-chapel.jpg',
    alt: 'Snow-covered chalets and chapel at Bettmeralp',
  },
  'home-talk': {
    label: 'Speak to a travel designer',
    brief: 'A calm, wide view at dusk — room for type over it.',
    tone: '#2f3a3e',
    src: '/images/drive/switzerland-lake-lucerne-balcony-view.jpg',
    alt: '',
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
    tone: '#a59a82',
    alt: 'A curved infinity pool and terrace chairs above wooded hills',
  },
  'home-cove': {
    label: 'Shores · a turquoise cove',
    brief: 'Clear water below pine cliffs, a boat at anchor. Wide, room for type on the right.',
    tone: '#2f7f8f',
    alt: 'A white motor yacht at anchor in a turquoise cove below pine-covered cliffs',
  },
  'home-circle': {
    label: 'The circle',
    brief: 'A bright, wide Mediterranean coastline — room for type over it.',
    tone: '#3f7f93',
    alt: '',
  },

  /* ---- Home, Marc's update of 23 October 2026 ----------------------------
     Marc's own photographs, from the shared Google Drive. Save each one as
     public/images/<slot>.jpg and run `npm run images`; until a file lands the
     homepage keeps the frame (or film) it shows today. A slot with `src`
     already has a photograph of the same place standing in. */
  'client-way-group': {
    label: 'Ways · Small luxury group journeys',
    brief: 'Drive › Destinations › Kenya — the group journeys frame Marc chose. A still, no film.',
    tone: '#8a7a5c',
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
    tone: '#6f7a63',
    alt: 'Guests at a sporting event',
  },
  'client-way-villas': {
    label: 'Ways · Private villas',
    brief: 'Drive › Private Villas — the villa frame Marc chose.',
    tone: '#a59a82',
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
    tone: '#b39e74',
    alt: 'An unhurried moment in Egypt',
  },
  'client-why-moments': {
    label: 'Why · Meaningful experiences',
    brief: 'Drive › Morocco — the frame Marc chose.',
    tone: '#a8785a',
    alt: 'An experience in Morocco',
  },
  'client-why-local': {
    label: 'Why · Local connections',
    brief: 'Drive › Kenya — the frame Marc chose.',
    tone: '#8a7a5c',
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
  'client-hotel-lucerne': {
    label: 'Stay · Mandarin Oriental Palace, Lucerne',
    brief: 'Drive — Mandarin Oriental Palace, Lucerne. Upright crop.',
    tone: '#5d7a78',
    src: '/images/drive/switzerland-lake-lucerne-grand-hotel.jpg',
    alt: 'The Belle Époque façade of the Mandarin Oriental Palace on Lake Lucerne',
  },
  'client-hotel-stresa': {
    label: 'Stay · Hotel La Palma, Stresa',
    brief: 'Drive — Hotel La Palma, Stresa. Upright crop.',
    tone: '#4f7f95',
    src: '/images/drive/italy-stresa-sky-pool.jpg',
    alt: 'The rooftop infinity pool of Hotel La Palma above Lake Maggiore',
  },
  'client-hotel-victoria-falls': {
    label: 'Stay · The Palm River Hotel, Victoria Falls',
    brief: 'Drive — The Palm River Hotel, Victoria Falls. Upright crop.',
    tone: '#6b5f4a',
    src: '/images/drive/zimbabwe-palm-river-hotel-interior.jpg',
    alt: 'The colonial dining room of The Palm River Hotel on the Zambezi',
  },
  'client-hotel-rovinj': {
    label: 'Stay · Grand Park Hotel Rovinj',
    brief: 'Drive — Grand Park Hotel Rovinj. Upright crop.',
    tone: '#4f7f95',
    src: '/images/drive/croatia-rovinj-grand-park-pool.jpg',
    alt: 'Poolside loungers at Grand Park Hotel Rovinj, the old town across the water',
  },
  'client-hotel-vipingo': {
    label: 'Stay · Cardamom House, Vipingo',
    brief: 'Drive — Cardamom House, Vipingo. Upright crop.',
    tone: '#a59a82',
    src: '/images/home/hotel-cardamom.jpg',
    alt: 'Cardamom House, a thatched white villa among trees and bougainvillea',
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
    tone: '#8c8f86',
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
    tone: '#9a9587',
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
    tone: '#5f6f6a',
    alt: 'A lakeside villa and its gardens on Lake Como, a motor launch passing',
  },
  // The Instagram links page leads with this, not a photograph from the site.
  'links-amalfi': {
    label: 'Amalfi, Slowly',
    brief: 'The Amalfi coast from the water.',
    tone: '#8c8f86',
    src: '/images/home-hero.jpg',
    alt: 'A sailing boat at anchor off the Amalfi Coast, a cliffside town and the coast fading into haze behind',
  },
  'plan-private': {
    label: 'Private & custom travel',
    brief: 'Guests on their own journey, somewhere memorable. Upright.',
    tone: '#a09a8c',
    src: '/images/drive/switzerland-guests-jungfraujoch.jpg',
    alt: 'Guests with the Swiss flag on the Jungfraujoch snowfield',
  },
  'not-found': {
    label: 'Not found',
    brief: 'A quiet path through open country. Upright.',
    tone: '#7a8a7a',
    src: '/images/drive/switzerland-gstaad-meadow.jpg',
    alt: 'Alpine meadow and footpath above Gstaad',
  },

  /* ---- Journeys index -------------------------------------------------- */
  'jl-1': {
    label: 'Amalfi, Slowly',
    brief: 'Amalfi — a fishing boat below lemon terraces.',
    tone: '#8c8f86',
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
    tone: '#9a9587',
    alt: 'Valldemossa among the wooded slopes of the Tramuntana',
  },
  'jl-4': {
    label: 'The Cape',
    brief: 'Cape winelands — vines, mountains, a farmhouse in warm light.',
    tone: '#7a6a55',
    alt: 'A Franschhoek wine farm among vineyards beneath the mountains',
  },
  'jl-5': {
    label: 'Como & the Engadin',
    brief: 'Lake Como — a villa garden meeting the water.',
    tone: '#5f6f6a',
    alt: 'A lakeside villa garden meeting the water at Varenna on Lake Como',
  },

  /* ---- Journey: Amalfi, Slowly ----------------------------------------- */
  'am-hero': {
    label: 'Hero · Amalfi from the water',
    brief: 'Amalfi coast from the water, a single boat, early light — no crowds, no landmarks.',
    tone: '#5d6a63',
    alt: 'Amalfi from the water, the town stacked against terraced cliffs, boats in the harbour',
  },
  'am-why': {
    label: 'Lemon terraces',
    brief: 'Lemon terraces above the sea, a person picking, warm light.',
    tone: '#a58f6a',
    alt: 'Terraced hillsides falling to the sea below Ravello',
  },
  'am-map': {
    label: 'Map · Sorrento peninsula',
    brief: 'Sorrento peninsula, hand-drawn or muted — Positano, Nerano, Ravello, Capri marked.',
    tone: '#dcd6c6',
    alt: 'The Sorrento coast and harbour from above, the peninsula stretching into the bay',
  },
  'am-h1': {
    label: 'Above Positano',
    brief: 'Hotel terrace above the sea, umbrella pines, evening light.',
    tone: '#b9b1a0',
    alt: 'A tiled hotel terrace above Positano, table and chairs facing the sea',
  },
  'am-h2': {
    label: 'The quiet side',
    brief: 'Cloister courtyard with citrus trees and stone arches.',
    tone: '#a9a394',
    alt: 'Cloister arches around a quiet courtyard garden',
  },
  d1: {
    label: 'Day 01',
    brief: 'Hotel terrace, first evening, glasses on a table.',
    tone: '#7f8c85',
    alt: 'Glasses of prosecco and a candle on a terrace table in Positano, first evening',
  },
  d2: {
    label: 'Day 02',
    brief: 'Steep lane in Positano, morning shade, one figure.',
    tone: '#a58f6a',
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
    tone: '#8a9a6a',
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
    tone: '#9a8a6a',
    alt: 'Hands stretching fresh mozzarella in a Campanian dairy',
  },
  d8: {
    label: 'Day 08',
    brief: 'Coastal footpath high above the sea, two walkers.',
    tone: '#7a8a7a',
    alt: 'Walkers on the Path of the Gods high above the Amalfi Coast',
  },
  d9: {
    label: 'Day 09',
    brief: 'Breakfast table on a terrace, morning light.',
    tone: '#b0a690',
    alt: 'Coffee and sugared pastries on a marble table, morning',
  },
  g1: {
    label: 'Wide',
    brief: 'The coast from the water at dusk.',
    tone: '#4d6f7a',
    alt: 'The Amalfi Coast at dusk, a town on the cliffs above the harbour',
  },
  g2: {
    label: 'Detail',
    brief: 'Lemons in a crate.',
    tone: '#a58f6a',
    alt: 'Ripe lemons, some halved, in wooden crates',
  },
  g3: {
    label: 'Human',
    brief: 'Two guests laughing at a table.',
    tone: '#7f8c85',
    alt: 'A white tablecloth laid with crystal glasses, plates and lemons in dappled light',
  },
  g4: {
    label: 'Architecture',
    brief: 'A cloister arch.',
    tone: '#8a9a6a',
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
    tone: '#5f6f63',
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
    tone: '#9a9587',
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
    tone: '#8a8a6a',
    alt: 'The Tramuntana mountains from a high pass, ridges fading towards the sea',
  },
  'ma-2': {
    label: 'Day 02',
    brief: 'Deià on its hill, the sea behind.',
    tone: '#9a9587',
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
    tone: '#8a8a6a',
    alt: 'Old olive trees in a dry field, cloud on the Mallorcan mountains',
  },
  'ma-5': {
    label: 'Day 05',
    brief: 'The wooden train to Sóller, orange groves.',
    tone: '#a58f6a',
    alt: 'Boats in the bay at Port de Sóller, the town on the hill',
  },
  'ma-6': {
    label: 'Day 06',
    brief: 'A finca pool at noon, empty.',
    tone: '#9a9587',
    alt: 'A long stone-edged pool at a Mallorcan finca, palms and mountains behind',
  },
  'ma-7': {
    label: 'Day 07',
    brief: 'Palma’s old town, morning.',
    tone: '#b0a690',
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
    tone: '#7a6a55',
    alt: 'A whitewashed Cape Dutch farmhouse at the end of a brick path under old oaks',
  },
  'cp-4': {
    label: 'Day 04',
    brief: 'Vines in rows under the mountains.',
    tone: '#7a7a55',
    alt: 'Rows of vines beneath the mountains near Stellenbosch',
  },
  'cp-5': {
    label: 'Day 05',
    brief: 'A long table laid outdoors at dusk.',
    tone: '#9a8a6a',
    alt: 'A wine estate terrace and lawn beneath the mountains, Stellenbosch',
  },
  'cp-6': {
    label: 'Day 06',
    brief: 'Sunset over the winelands.',
    tone: '#a58f6a',
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
    tone: '#7a6a55',
    alt: 'Dune grass on Noordhoek beach in warm evening light',
  },
  'cp-11': {
    label: 'Day 11',
    brief: 'Cape Town harbour, morning.',
    tone: '#7f9aa3',
    alt: 'The V&A Waterfront harbour with Table Mountain behind',
  },

  /* ---- Journey: Como & the Engadin — day by day ------------------------ */
  'ce-1': {
    label: 'Day 01',
    brief: 'A villa garden meeting Lake Como.',
    tone: '#5f6f6a',
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
    tone: '#6f7a63',
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
    tone: '#5f6f63',
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
    tone: '#a58f6a',
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
    tone: '#6f7a63',
    alt: 'Soglio at night on its ledge in Val Bregaglia',
  },
  'ce-10': {
    label: 'Day 10',
    brief: 'A train leaving the mountains.',
    tone: '#6b7a7c',
    alt: 'A Rhaetian Railway train on the Albula line in autumn colour',
  },

  /* ---- Marc ------------------------------------------------------------ */
  'marc-portrait': {
    label: 'Marc Haeni',
    brief: 'Studio portrait of Marc Haeni.',
    tone: '#d9d0bf',
    src: '/brand/marc.webp',
    alt: 'Marc Haeni, founder of Peaks2Shores',
    width: 1150,
    height: 1400,
  },

  /* ---- Journal --------------------------------------------------------- */
  'jn-1': {
    label: 'The Engadin',
    brief: 'A high valley in larch-gold light, late autumn.',
    tone: '#6f7a63',
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
    tone: '#9a8a6a',
    alt: 'A long table laid outdoors in the shade of a great tree',
  },
  'jn-4': {
    label: 'A hotel worth the trip',
    brief: 'A hotel corridor or reading room, nobody in it.',
    tone: '#a9a394',
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
