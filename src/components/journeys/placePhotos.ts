/**
 * A real photograph of each place on the launch journeys' routes, for the
 * journey page's hero (pointing at a place on the route shows it) and the
 * Journeys page's cards. The client's own photographs (public/images/drive)
 * where they show the place; otherwise licensed frames already in the
 * registry, or Wikimedia Commons photographs in public/images/journeys
 * (author and licence in public/images/credits.json, shown on /credits).
 */
export const placePhotos: Record<string, { src: string; alt: string }> = {
  Lucerne: {
    src: '/images/drive/switzerland-lucerne-water-tower.jpg',
    alt: 'The Water Tower and Chapel Bridge on the Reuss in Lucerne, the old town behind',
  },
  Grindelwald: {
    src: '/images/drive/switzerland-grindelwald-eiger.jpg',
    alt: 'The Eiger above Grindelwald, a gondola crossing green meadows and chalets',
  },
  Montreux: {
    src: '/images/journeys/jy-montreux-chillon.jpg',
    alt: 'Chillon Castle on the shore of Lake Geneva near Montreux, the Alps beyond',
  },
  Zermatt: {
    src: '/images/drive/switzerland-gornergrat-matterhorn.jpg',
    alt: 'The Matterhorn and the glaciers above Zermatt, seen from the Gornergrat',
  },
  Stresa: {
    src: '/images/journeys/jy-stresa-isola-bella.jpg',
    alt: 'The Borromeo palace on Isola Bella, off Stresa on Lake Maggiore',
  },
  Milan: {
    src: '/images/se-milan.jpg',
    alt: 'The marble facade of Milan’s Duomo on the cathedral square',
  },
  Bologna: {
    src: '/images/ie-bologna.jpg',
    alt: 'Looking along the vaulted ocher porticoes of a street in Bologna',
  },
  'Motor Valley': {
    src: '/images/journeys/jy-motor-valley-ferrari.jpg',
    alt: 'A Ferrari race car on display at the Ferrari Museum in Maranello',
  },
  'Lake Garda': {
    src: '/images/ie-garda.jpg',
    alt: 'The Sirmione peninsula reaching into turquoise water on Lake Garda, seen from above',
  },
  Verona: {
    src: '/images/journeys/jy-verona-arena.jpg',
    alt: 'The Roman Arena on Piazza Bra in Verona',
  },
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
  Dubrovnik: {
    src: '/images/drive/croatia-dubrovnik-old-town-walls.jpg',
    alt: 'Dubrovnik’s walls and the Lovrijenac fortress above clear Adriatic water',
  },
};
