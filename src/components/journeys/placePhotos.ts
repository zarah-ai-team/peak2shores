/**
 * A real photograph of each place on the launch journeys' routes, for the
 * journey page's hero (pointing at a place on the route shows it) and the
 * Journeys page's cards (journeyCards.ts). The client's own photographs where
 * they show the place: the journey flyers' and the Journey Book's (Ishika's
 * notes of 24 November 2026; web copies in public/images/journeys) and Marc's
 * Drive (public/images/drive). Otherwise licensed frames already in the
 * registry, or Wikimedia Commons photographs in public/images/journeys
 * (author and licence in public/images/credits.json, shown on /credits). The
 * hero shows these full screen, so a flyer photograph printed too small for
 * that (Milan, Split) is shown only in its stay on the itinerary (media.ts).
 */
export const placePhotos: Record<string, { src: string; alt: string; pos?: string }> = {
  // The Soul of Sicily: Marc's Drive (Shutterstock photographs he licensed).
  Palermo: {
    src: '/images/drive/italy-palermo-cathedral.jpg',
    alt: 'Palermo Cathedral and its domes behind the palms of its square, under a summer sky',
  },
  Cefalù: {
    src: '/images/drive/italy-cefalu-aerial.jpg',
    alt: 'Cefalù on its headland below the cliffs of La Rocca, the turquoise sea around it',
  },
  Agrigento: {
    src: '/images/drive/italy-agrigento-valley-of-the-temples.jpg',
    alt: 'The Temple of Concordia among olive and almond trees in the Valley of the Temples, Agrigento',
    pos: '22% 50%',
  },
  Taormina: {
    src: '/images/drive/italy-taormina-piazza-ix-aprile.jpg',
    alt: 'Piazza IX Aprile in Taormina, the clock tower and the church of San Giuseppe below the hill',
  },
  Lucerne: {
    src: '/images/drive/switzerland-lucerne-water-tower.jpg',
    alt: 'The Water Tower and Chapel Bridge on the Reuss in Lucerne, the old town behind',
  },
  // The Swiss Elegance flyer's Grindelwald photograph (the Journey Book's
  // f_train.jpg). `pos` (CSS object-position) keeps the train, right of the
  // middle, in a narrow crop: the hero on a phone or an upright tablet.
  Grindelwald: {
    src: '/images/journeys/jy-grindelwald-train.jpg',
    alt: 'A red mountain train climbing through wildflower meadows below the snowy peaks and glaciers of the Jungfrau region',
    pos: '70% 50%',
  },
  Montreux: {
    src: '/images/journeys/jy-montreux-chillon.jpg',
    alt: 'Chillon Castle on the shore of Lake Geneva near Montreux, the Alps beyond',
  },
  Zermatt: {
    src: '/images/drive/switzerland-gornergrat-matterhorn.jpg',
    alt: 'The Matterhorn and the glaciers above Zermatt, seen from the Gornergrat',
  },
  // The flyer's Stresa & Lake Maggiore photograph, in place of the palace seen
  // from Isola Bella's own landing stage ("is this Stresa?", Marc's review).
  Stresa: {
    src: '/images/journeys/jy-stresa-isola-bella-aerial.jpg',
    alt: 'Isola Bella from the air, the Borromeo palace and its terraced gardens on Lake Maggiore, the Stresa shore and the Alps beyond',
  },
  Milan: {
    src: '/images/se-milan.jpg',
    alt: 'The marble facade of Milan’s Duomo on the cathedral square',
  },
  // The flyer's Bologna & Emilia-Romagna photograph (Marc's review, para 206).
  Bologna: {
    src: '/images/home/italian-experience.jpg',
    alt: 'A smiling traveler holding a board of prosciutto and an aperitivo in an Italian salumeria',
  },
  'Motor Valley': {
    src: '/images/journeys/jy-motor-valley-ferrari.jpg',
    alt: 'A Ferrari race car on display at the Ferrari Museum in Maranello',
  },
  'Lake Garda': {
    src: '/images/ie-garda.jpg',
    alt: 'The Sirmione peninsula reaching into turquoise water on Lake Garda, seen from above',
  },
  // The flyer's Valpolicella & Verona photograph (Marc's Drive, 25 Oct).
  Verona: {
    src: '/images/home/jr-italy-verona-arena.jpg',
    alt: 'The Roman Arena on Piazza Bra in Verona at dawn, the pastel houses of the square beside it',
  },
  // The flyers' Venice photograph (two spritzes above the Grand Canal) is
  // only 1400px wide: too small to fill a hero, so it stands in the Venice
  // stays and the extension's collage (media 'ac-venice-flyer'), and the
  // hero and the cards keep this one.
  Venice: {
    src: '/images/ac-venice.jpg',
    alt: 'The Grand Canal in Venice, the domes of Santa Maria della Salute beyond',
  },
  Rovinj: {
    src: '/images/journeys/jy-rovinj.jpg',
    alt: 'Rovinj’s old town on its peninsula, the bell tower of St Euphemia above the Adriatic',
  },
  Split: {
    src: '/images/drive/croatia-split-waterfront.jpg',
    alt: 'Split’s old town and harbor from above',
  },
  Hvar: {
    src: '/images/drive/croatia-hvar-harbour.jpg',
    alt: 'Hvar town harbor and the Pakleni Islands beyond',
  },
  // The Adriatic flyer's Mount Srđ photograph (the Journey Book's
  // f_dubrovnik_hd.jpg). The page's own hero is the walls, so pointing at
  // Dubrovnik now shows something new.
  Dubrovnik: {
    src: '/images/journeys/jy-dubrovnik-mount-srd.jpg',
    alt: 'Tables set on the terrace of the Panorama Restaurant on Mount Srđ, Dubrovnik’s old town and harbor far below',
  },
};
