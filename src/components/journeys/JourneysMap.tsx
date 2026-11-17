import type { Journey } from '@/lib/content';
import { flipbook } from '@/lib/data/flipbook';
import { getMedia, type MediaKey } from '@/lib/media';
import { HeroCarousel, type HeroJourney } from './HeroCarousel';
import './journeys-index.css';

/** Does a stay ("Stresa & Lake Maggiore") name a stop on the route ("Stresa")? */
const names = (a: string, b: string) => {
  const [x, y] = [a.toLowerCase(), b.toLowerCase()];
  return x.includes(y) || y.includes(x);
};

/* Where a card's 3:2 crop centres, when the middle of the photograph is not
   its subject (CSS object-position). */
const cardPos: Record<string, string> = {
  // An upright frame: the castle and the waterfront sit in its lower half.
  'the-italian-experience': '50% 73%',
  // A wide frame: keep the harbor and the old tower, not the hillside.
  'adriatic-collection': '42% 50%',
};

/** A registry photograph as a card shows it. */
const cardPhoto = (key: MediaKey, pos?: string) => {
  const slot = getMedia(key);
  return { src: slot.src, alt: slot.alt ?? slot.label, tone: slot.tone, pos };
};

/**
 * The Journeys map: the earth as a globe with the journeys as a carousel under
 * it. Choosing a journey turns the globe to its region and draws its route,
 * with its stops and nights; "Stay tuned" draws back to the whole earth.
 *
 * It opened the page until the owner's note of 18 November 2026; it is now the
 * Map view of The Collection (JourneyCollection), which opens the page.
 */
export function JourneysMap({ journeys }: { journeys: Journey[] }) {
  const items: HeroJourney[] = journeys.map((j) => {
    const route = j.route ?? [];
    const stays = j.flyer?.parts.flatMap((p) => p.stays) ?? [];
    const seen = new Set<string>();
    const stops = route.flatMap((stop) => {
      if (seen.has(stop.name)) return [];
      seen.add(stop.name);
      const nights = stays
        .filter((s) => names(s.place, stop.name))
        .reduce((t, s) => t + (s.nights ?? 0), 0);
      return [{ name: stop.name, at: stop.coords, nights }];
    });
    return {
      slug: j.slug,
      title: flipbook[j.slug]?.title ?? j.title,
      country: j.country,
      // One line under the name: how long, and from where to where.
      facts: [`${j.days} days`, j.region],
      // The journey's own card photograph, as the menu shows it.
      photo: cardPhoto(j.cardMedia, cardPos[j.slug]),
      label: `${flipbook[j.slug]?.title.split(',')[0] ?? j.title} · ${j.region}`,
      route: route.map((s) => s.coords),
      stops,
    };
  });

  return (
    <HeroCarousel
      journeys={items}
      label="A globe showing the chosen journey’s route, its stops and nights"
      // "Stay tuned" names no place, so its photograph promises none: a boat
      // on open water, the coast fading behind it.
      soonPhoto={cardPhoto('home-hero')}
    />
  );
}
