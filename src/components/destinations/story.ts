import type { JourneyBookingTag } from '@/components/pages/journeyStatus';

/**
 * The destination story's data (PlaceStory): what the Destinations page
 * derives from the catalog for each country, as plain data the browser can
 * take, and the photograph each country is drawn with.
 */

export type StoryPhoto = { src: string; alt: string };

/** A place the journeys sleep in, in this country, as the flyers name it. */
export type StoryStay = {
  /** 'Stresa & Lake Maggiore' */
  name: string;
  /** '2 nights' */
  nights: string;
  /** The journey's short name: 'Swiss Elegance'. */
  journey: string;
  /** The flyer's line for the stay: 'Where lakeside elegance meets Alpine beauty.' */
  tagline: string;
  photo: StoryPhoto;
};

export type StoryJourney = {
  slug: string;
  title: string;
  /** 'Lucerne to Milan' */
  region: string;
  days: number;
  departureWindow: string;
  /** 'From $12,400', or 'Rates to be announced'. */
  price: string;
  /** Its booking status, as the Journeys page's cards show it (journeyBookingTag). */
  tag: JourneyBookingTag;
  photo: StoryPhoto | null;
};

/**
 * The photograph a country is drawn with, the cut-out of its foreground (the
 * same picture with the sky made transparent, `scripts/destination-cutouts.py`)
 * and where the country's name stands in it.
 */
export type StoryScene = {
  src: string;
  /** Null for a country without a cut-out: its name then simply rises in front. */
  cutout: string | null;
  width: number;
  height: number;
  /** object-position, as fractions: across on a landscape screen, across on a portrait one, and down. */
  x: number;
  xNarrow: number;
  y: number;
  /** The height in the photograph (a fraction of it) the name's foot is set against: the skyline under it. */
  skyline: number;
  /** How much of the name's height the foreground covers at that line. */
  sink: number;
};

export type StoryPlace = {
  slug: string;
  country: string;
  tagline?: string;
  scene: StoryScene;
  stays: StoryStay[];
  journeys: StoryJourney[];
};

/*
 * The photographs, chosen from the library for a sky that separates cleanly
 * from the land below it, so the land can stand in front of the name:
 *
 * - Switzerland: the meadow above Gstaad (Marc's own photograph), the
 *   mountain line low across a deep blue sky.
 * - Italy: the Grand Canal from the Accademia bridge, the domes of the Salute
 *   rising into the name.
 * - Croatia: Rovinj from the air (the client's photograph): the name stands
 *   out at sea, behind the wooded island's tree line.
 *
 * `width` and `height` are the photograph's own; `skyline` is read from the
 * skyline the cut-out script prints for it (where its land first rises, across
 * the frame), set where the name's foot should meet the land. If a photograph
 * is replaced, run the script again and set these afresh.
 */
export const SCENES: Record<string, StoryScene> = {
  switzerland: {
    src: '/images/drive/switzerland-gstaad-meadow.jpg',
    cutout: '/images/destinations/switzerland-fg.webp',
    width: 2880,
    height: 3840,
    x: 0.5,
    xNarrow: 0.5,
    y: 0.39,
    // The mountain line runs from 0.49 (left) through 0.44 to 0.40 (the
    // peak on the right); the name is set against the higher, right-hand
    // part so the peaks cut into it without hiding its end.
    skyline: 0.425,
    sink: 0.3,
  },
  italy: {
    src: '/images/ac-venice.jpg',
    cutout: '/images/destinations/italy-fg.webp',
    width: 3840,
    height: 2560,
    x: 0.5,
    xNarrow: 0.46,
    y: 0.42,
    skyline: 0.4,
    sink: 0.28,
  },
  croatia: {
    src: '/images/home/hotel-grand-park-rovinj-aerial.jpg',
    cutout: '/images/destinations/croatia-fg.webp',
    width: 2400,
    height: 1594,
    x: 0.5,
    xNarrow: 0.42,
    y: 0.45,
    skyline: 0.473,
    sink: 0.28,
  },
};
