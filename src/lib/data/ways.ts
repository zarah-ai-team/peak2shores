/**
 * The ways to travel, each with a page of its own (/experiences/<slug>): what
 * Peaks2Shores offers in that way, in three parts, each told with two or
 * three photographs. The lines build on the site's approved copy (the ways
 * on the homepage, the reasons and beliefs in copy.ts); no prices, numbers
 * or partners are added. Written 23 Nov 2026 for the owner's review.
 */

export type WayPhoto = {
  src: string;
  alt: string;
  /** Where the frame crops the photograph (CSS object-position). */
  pos?: string;
  /**
   * An upright or square photograph in a wide frame: shown whole instead of
   * cropped, over a soft, blurred fill of itself that fills the frame.
   */
  whole?: boolean;
};

export type WayPart = {
  label: string;
  title: string;
  body: string;
  points: string[];
  photos: WayPhoto[];
};

export type WayPage = {
  slug: string;
  /** As on the homepage's list of ways. */
  title: string;
  /** The few words the Experiences page shows under the title. */
  short: string;
  /** The opening line, as on the homepage. */
  line: string;
  /** The paragraph that opens the page. */
  lead: string;
  hero: WayPhoto;
  parts: WayPart[];
  /** Where the page's call to action goes. */
  cta: { label: string; href: string };
};

export const wayPages: WayPage[] = [
  {
    slug: 'small-group',
    title: 'Small Luxury Group Journeys',
    short: 'A small circle of travelers, exceptional places, discovery shared.',
    line: 'Intimate journeys shared with a small circle of fellow travelers, bringing together exceptional places, meaningful experiences and the joy of discovering the world together.',
    lead: 'Our signature journeys, traveled with a small circle of like-minded guests: personally curated by Marc, thoughtfully paced, and looked after from the first evening to the last.',
    hero: {
      src: '/images/home/way-group-lucerne-tower.jpg',
      alt: 'The Water Tower and Chapel Bridge on the clear Reuss, Lucerne',
    },
    parts: [
      {
        label: 'The journeys',
        title: 'Curated, not catalogued.',
        body: 'Every journey is shaped by Marc’s own experience and recommendations: the hotels he would choose, the people he would want you to meet, the afternoons he would leave free.',
        points: [
          'Handpicked luxury hotels, an integral part of the journey',
          'Expert local guides who bring each destination to life',
          'Private transfers, carefully coordinated throughout',
        ],
        photos: [
          {
            src: '/images/drive/switzerland-guests-lucerne-chapel-bridge.jpg',
            alt: 'A group of guests by the Chapel Bridge and Water Tower in Lucerne',
          },
          {
            src: '/images/drive/switzerland-guests-matterhorn-selfie.jpg',
            alt: 'Four guests smiling in front of the Matterhorn above Zermatt',
            pos: '50% 40%',
          },
          {
            src: '/images/home/xp-taste.jpg',
            alt: 'Friends dining by candlelight on a lakeside terrace at dusk',
          },
        ],
      },
      {
        label: 'Shared moments',
        title: 'A small circle, and a long table.',
        body: 'Small by design, so the journey feels personal: meals worth lingering over, conversations that carry on into the evening, and the joy of discovering a place together.',
        points: [
          'Culinary discoveries, from regional specialties to celebrated wines',
          'Authentic encounters with the people who bring each place to life',
          'Time together, and time of your own',
        ],
        photos: [
          {
            src: '/images/home/rh-pause-valpolicella.jpg',
            alt: 'Guests at a long candlelit table under a pergola over the Valpolicella vineyards',
            whole: true,
          },
          {
            src: '/images/hotels/majestic-bologna/05-majestic-terraces.jpg',
            alt: 'Candlelit tables under chandeliers on a garden terrace in Bologna at night',
          },
        ],
      },
      {
        label: 'Thoughtfully paced',
        title: 'The luxury of time.',
        body: 'Thoughtfully balanced itineraries combine extraordinary discoveries, memorable experiences, and time to truly enjoy each destination. A free afternoon isn’t a gap in the plan; it is the plan.',
        points: [
          'Meaningful free time, built in on purpose',
          'Trusted local support throughout the experience',
        ],
        photos: [
          {
            src: '/images/drive/switzerland-guests-grindelwald-bench.jpg',
            alt: 'Guests resting on a bench facing the peaks above Grindelwald',
          },
          {
            src: '/images/drive/switzerland-guests-lavaux-vineyards.jpg',
            alt: 'Two guests with glasses of wine above the Lavaux vineyards and Lake Geneva',
          },
        ],
      },
    ],
    cta: { label: 'See the journeys', href: '/journeys' },
  },
  {
    slug: 'private',
    title: 'Private Travel',
    short: 'Bespoke destinations and stays, designed around you.',
    line: 'Bespoke destinations, exceptional stays and authentic experiences — exclusively designed around you and the way you love to travel.',
    lead: 'Your dates, your pace, your people. Families, friends, a milestone: a journey designed for you alone, with the same hotels, the same people on the ground and the same care behind each day.',
    hero: {
      src: '/images/home/way-private-venice.jpg',
      alt: 'Two spritzes on a terrace above the Grand Canal in Venice, the Salute dome beyond',
      pos: '84% 50%',
    },
    parts: [
      {
        label: 'Designed around you',
        title: 'It begins with a conversation.',
        body: 'Tell us how you love to travel: where, when, with whom, and what makes a day worth remembering. Your travel designer shapes the journey from there, and refines it with you until it feels right.',
        points: [
          'A bespoke itinerary, built around you from the first day',
          'Destinations we know personally, and the people who know them best',
          'Thoughtful planning and professional coordination',
        ],
        photos: [
          {
            src: '/images/home/way-private.jpg',
            alt: 'A couple raising glasses of red wine among the pines',
            pos: '50% 42%',
          },
          {
            src: '/images/home/hw-personal-zambia.jpg',
            alt: 'Marc Haeni with two local experts on safari in Zambia',
          },
        ],
      },
      {
        label: 'Exceptional stays',
        title: 'Hotels chosen for their sense of place.',
        body: 'Handpicked luxury properties, selected for their character, outstanding hospitality, and sense of place: a suite terrace above Lake Lucerne, an arrival by boat in Venice.',
        points: [
          'Rooms and suites chosen for the view, not the category',
          'Private transfers between every stay',
        ],
        photos: [
          {
            src: '/images/hotels/mandarin-oriental-luzern/03-lake-view-suite-terrace.jpg',
            alt: 'A suite terrace set for the evening above Lake Lucerne at dusk',
          },
          {
            src: '/images/hotels/jw-marriott-venice/02-arrival-by-boat.jpg',
            alt: 'Arriving by wooden water taxi along a green canal to a hotel in Venice',
          },
        ],
      },
      {
        label: 'Local connections',
        title: 'Access comes from people, not passes.',
        body: 'Our trusted network of carefully selected local experts and hospitality partners opens doors to authentic experiences and a deeper connection with each destination.',
        points: [
          'Private guides and local specialists',
          'Private dining, tastings and celebrations',
          'Extraordinary experiences beyond the expected',
        ],
        photos: [
          {
            src: '/images/home/hw-local-desert-tea.jpg',
            alt: 'A host in an orange turban pouring a drink beside a fire at a desert camp at dusk',
            whole: true,
          },
          {
            src: '/images/hotels/majestic-bologna/01-terrace-over-bologna.jpg',
            alt: 'A planted hotel terrace set for lunch above the rooftops of Bologna',
          },
        ],
      },
    ],
    cta: { label: 'Start a private journey', href: '/plan#private' },
  },
  {
    slug: 'safari',
    title: 'Safari',
    short: 'Wildlife, remarkable landscapes, intimate lodges.',
    line: 'Extraordinary wildlife, remarkable landscapes and intimate lodges — bringing you closer to the wild in unforgettable ways.',
    lead: 'Southern Africa as we know it ourselves: game drives in the golden hour, lodges open to the landscape, and sundowners above the bush, planned with the same care as every journey.',
    hero: {
      src: '/images/drive/botswana-chobe-elephant-river.jpg',
      alt: 'An elephant drinking at the water’s edge on the Chobe River, Botswana',
    },
    parts: [
      {
        label: 'In the wild',
        title: 'Closer to the wild.',
        body: 'Game drives at first light and in the golden hour with experienced guides and trackers, on land and on the river: elephants at the water’s edge, lions in the acacias, wild dogs on the move.',
        points: [
          'Experienced guides and trackers',
          'Game drives by vehicle and by boat',
          'Time to watch, not only to see',
        ],
        photos: [
          {
            src: '/images/drive/south-africa-safari-game-drive-sunset.jpg',
            alt: 'An open game-drive vehicle under an acacia at golden sunrise, South Africa',
          },
          {
            src: '/images/drive/south-africa-safari-lions-tree.jpg',
            alt: 'A lioness resting in the fork of a tree, another below it, in the evening light',
            pos: '50% 32%',
          },
          {
            src: '/images/drive/botswana-chobe-wild-dogs.jpg',
            alt: 'A pack of wild dogs on a sandy track in Chobe, Botswana',
          },
        ],
      },
      {
        label: 'Intimate lodges',
        title: 'Where the day comes to rest.',
        body: 'Lodges chosen for their setting and their hospitality: a pool looking out over the bush, a suite open to the landscape, dinner under the stars.',
        points: [
          'Handpicked lodges and camps in exceptional settings',
          'Warm, personal hospitality',
        ],
        photos: [
          {
            src: '/images/drive/south-africa-qwabi-lodge-pool.jpg',
            alt: 'A lodge’s plunge pool on a deck looking out over the bush',
            pos: '50% 62%',
          },
          {
            src: '/images/drive/south-africa-qwabi-lodge-suite.jpg',
            alt: 'A lodge suite under a high thatched roof, open to the deck and the bush',
            pos: '50% 55%',
          },
          {
            src: '/images/drive/zimbabwe-palm-river-hotel-night.jpg',
            alt: 'A riverside hotel lit up at dusk behind its long pool, Zimbabwe',
          },
        ],
      },
      {
        label: 'Beyond the game drive',
        title: 'Sundowners, feasts and the Zambezi.',
        body: 'A safari is also the moments in between: a sundowner on the rocks, a braai cooked over the fire in the bush, a sunset cruise on the Zambezi.',
        points: ['Sundowners in the bush', 'Bush dinners and braais', 'River cruises at sunset'],
        photos: [
          {
            src: '/images/home/hw-seamless-sundowner-rock.jpg',
            alt: 'A guest with a glass of wine on a red rug at a sundowner rock above the bush',
            pos: '50% 60%',
          },
          {
            src: '/images/drive/botswana-chobe-bush-braai-chef.jpg',
            alt: 'A chef smiling beside a braai under a canvas shelter in the bush',
            pos: '50% 38%',
          },
          {
            src: '/images/drive/zimbabwe-zambezi-sunset-cruise.jpg',
            alt: 'Boats on the Zambezi as the sun sets red over the river',
          },
        ],
      },
    ],
    cta: { label: 'Plan a safari', href: '/plan#private' },
  },
  {
    slug: 'cruises',
    title: 'Cruises',
    short: 'Luxury yachts, intimate cruises, river voyages.',
    line: 'Discover extraordinary destinations aboard handpicked luxury yachts, intimate cruises and elegant river voyages, with exceptional experiences both onboard and ashore.',
    lead: 'Small ships and private yachts, chosen the way we choose hotels, and time ashore planned with the same care as everything else.',
    hero: {
      src: '/images/home/way-cruises-ship.jpg',
      alt: 'A cruise ship from above at sunset, its decks and pools over a dark sea',
    },
    parts: [
      {
        label: 'Private yachts',
        title: 'A yacht of your own.',
        body: 'A crewed motor yacht or a sailing boat along the coastlines we know best, from the islands of the Dalmatian coast onwards, anchoring in the coves and harbors the larger ships pass by.',
        points: [
          'Handpicked yachts with experienced crews',
          'Routes shaped around you, day by day',
        ],
        photos: [
          {
            src: '/images/home-way-cruises.jpg',
            alt: 'A white motor yacht crossing turquoise water, seen from above',
          },
          {
            src: '/images/drive/croatia-hvar-sailing.jpg',
            alt: 'A sailing yacht anchored in a clear turquoise cove off Hvar',
          },
          {
            src: '/images/drive/croatia-hvar-harbour.jpg',
            alt: 'Hvar town and its harbor on the Dalmatian coast, the Pakleni Islands beyond',
          },
        ],
      },
      {
        label: 'Ships and rivers',
        title: 'Intimate cruises and river voyages.',
        body: 'Smaller ships and river vessels, chosen for their service and their itineraries: unhurried days on great rivers and lakes, the landscape passing by the window.',
        points: [
          'Intimate ships, never the largest',
          'Elegant river voyages',
          'Exceptional experiences onboard',
        ],
        photos: [
          {
            src: '/images/drive/marc-river-cruise-deck.jpg',
            alt: 'Marc on the deck of a river cruise ship, a wooded riverbank behind',
            pos: '50% 22%',
          },
          {
            src: '/images/drive/switzerland-lugano-lake-steamer.jpg',
            alt: 'A paddle steamer and wooden jetty on Lake Lugano',
          },
        ],
      },
      {
        label: 'Ashore',
        title: 'Every port, properly.',
        body: 'Time ashore is planned with the same care as time onboard: private guides, tables worth reserving, and a hotel stay before or after the voyage.',
        points: [
          'Private guides in port',
          'Hotel stays before and after',
          'Private transfers to and from the ship',
        ],
        photos: [
          {
            src: '/images/hotels/grand-park-rovinj/01-terraces-and-marina.jpg',
            alt: 'A terraced hotel above the marina in Rovinj at dusk',
          },
          {
            src: '/images/hotels/jw-marriott-venice/02-arrival-by-boat.jpg',
            alt: 'Arriving by wooden water taxi along a green canal to a hotel in Venice',
          },
        ],
      },
    ],
    cta: { label: 'Plan a voyage', href: '/plan#private' },
  },
  {
    slug: 'sports-events',
    title: 'Sports & Events',
    short: 'Iconic sporting events and cultural celebrations.',
    line: 'Iconic sporting events, extraordinary cultural celebrations and exceptional travel experiences — thoughtfully brought together in one unforgettable journey.',
    lead: 'The event, and everything around it, arranged with the same care: the moment you came for, the hotel you return to each evening, and the days either side.',
    hero: {
      src: '/images/home/way-sports-monaco.jpg',
      alt: 'A race car rounding the Monaco circuit beneath terraces of white umbrellas',
      pos: '50% 70%',
    },
    parts: [
      {
        label: 'The event',
        title: 'Be there for the moment.',
        body: 'From a Grand Prix weekend to the great races and tournaments of the season, we arrange tickets and hospitality around what you most want to see.',
        points: [
          'Tickets and hospitality, arranged for you',
          'Iconic sporting events around the world',
        ],
        photos: [
          {
            src: '/images/home/way-sports-monaco.jpg',
            alt: 'A race car on the Monaco circuit beneath terraces of white umbrellas',
            pos: '50% 72%',
          },
          {
            src: '/images/home/way-events.jpg',
            alt: 'A rider galloping across a green field as spectators look on',
          },
        ],
      },
      {
        label: 'Around it',
        title: 'Everything around the event.',
        body: 'A hotel worth coming back to each evening, private transfers on the busiest days, and dinners booked long before the crowds arrive.',
        points: [
          'Exceptional hotels near the action',
          'Private transfers on event days',
          'Dining and experiences either side of the event',
        ],
        photos: [
          {
            src: '/images/hotels/palazzo-cordusio-milan/04-rooftop-terrace.jpg',
            alt: 'A hotel rooftop terrace above the rooftops of Milan',
          },
          {
            src: '/images/hotels/grand-park-rovinj/03-restaurant-terrace.jpg',
            alt: 'A restaurant terrace above the harbor of Rovinj at sunset, the old town across the water',
          },
        ],
      },
      {
        label: 'Celebrations',
        title: 'Cultural celebrations, as a guest.',
        body: 'Festivals and celebrations rooted in a place and its traditions, joined as a guest rather than a spectator, with the people who keep them alive.',
        points: ['Extraordinary cultural celebrations', 'Authentic encounters with local hosts'],
        photos: [
          {
            src: '/images/drive/south-africa-guests-african-feast.jpg',
            alt: 'Guests in colorful shirts sharing a long dinner table at an African feast',
          },
          {
            src: '/images/drive/south-africa-guests-bo-kaap.jpg',
            alt: 'A group of guests before a pink wall painted with BO-KAAP in rainbow letters, Cape Town',
            pos: '50% 70%',
          },
        ],
      },
    ],
    cta: { label: 'Plan around an event', href: '/plan#private' },
  },
  {
    slug: 'villas',
    title: 'Private Villas',
    short: 'Handpicked villas, privacy, personal service.',
    line: 'Handpicked villas in extraordinary settings — where privacy, personalized service and unforgettable moments come together.',
    lead: 'Houses with a strong sense of place, for families and friends: chosen for their setting and their character, and looked after so the time is entirely yours.',
    hero: {
      src: '/images/home/way-villas-sunset-pool.jpg',
      alt: 'Loungers beside a private infinity pool above the sea at sunset',
      pos: '70% 50%',
    },
    parts: [
      {
        label: 'The house',
        title: 'A strong sense of place.',
        body: 'Lakeside villas, coastal houses and hideaways in the hills, each chosen for its setting, its character and how it feels to live in, not only to stay in.',
        points: [
          'Handpicked villas in extraordinary settings',
          'Terraces, gardens and views worth staying home for',
        ],
        photos: [
          {
            src: '/images/home/way-villas-como.jpg',
            alt: 'A lakeside villa among the trees on Lake Como, mountains behind',
          },
          {
            src: '/images/home-way-villas.jpg',
            alt: 'An infinity pool on a villa terrace among olive trees and hills',
          },
          {
            src: '/images/home/way-villas-pool.jpg',
            alt: 'A modern beach villa behind a long pool, palms and the sea beside it',
          },
        ],
      },
      {
        label: 'Personalized service',
        title: 'Looked after, privately.',
        body: 'Service arranged around you, from a private chef to the help that keeps the house running, so the days are yours to spend as you like.',
        points: [
          'Private chefs and in-villa dining on request',
          'Personal service, arranged around your stay',
          'Private transfers on arrival and departure',
        ],
        photos: [
          {
            src: '/images/home/hotel-cardamom-pool-aerial.jpg',
            alt: 'A garden pool beneath bougainvillea and a thatched house, seen from above',
          },
          {
            src: '/images/home/xp-taste.jpg',
            alt: 'Friends dining by candlelight on a lakeside terrace at dusk',
          },
        ],
      },
      {
        label: 'Beyond the gate',
        title: 'The region, at your door.',
        body: 'Days out planned around the house: a guide for the old town, a tasting in the hills, a boat for the day, and tables in the village worth the walk.',
        points: ['Local guides and specialists', 'Tastings, boat days and excursions'],
        photos: [
          {
            src: '/images/home/rh-pause-valpolicella.jpg',
            alt: 'Guests at a long candlelit table under a pergola over the Valpolicella vineyards',
            whole: true,
          },
          {
            src: '/images/drive/croatia-hvar-sailing.jpg',
            alt: 'A sailing yacht anchored in a clear turquoise cove off Hvar',
          },
        ],
      },
    ],
    cta: { label: 'Find a villa', href: '/plan#private' },
  },
];

export const wayBySlug = (slug: string) => wayPages.find((w) => w.slug === slug);
