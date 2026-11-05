import type { Journey } from '@/lib/content';
import { flipbook } from '@/lib/data/flipbook';
import { site } from '@/lib/site';
import { HeroCarousel, type HeroJourney } from './HeroCarousel';
import './journeys-index.css';

/** Does a stay ("Stresa & Lake Maggiore") name a stop on the route ("Stresa")? */
const names = (a: string, b: string) => {
  const [x, y] = [a.toLowerCase(), b.toLowerCase()];
  return x.includes(y) || y.includes(x);
};

/**
 * The Journeys page's opening, after Ishika's notes of 3 November 2026: no
 * full-bleed photograph (only the homepage has one) but the page's name and
 * Marc's line, then the earth as a globe with the journeys as a carousel under
 * it. Choosing a journey turns the globe to its region and draws its route,
 * with its stops and nights; "Stay tuned" draws back to the whole earth.
 */
export function JourneysHero({ journeys }: { journeys: Journey[] }) {
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
    const nights = stays.reduce((t, s) => t + (s.nights ?? 0), 0) || j.days - 1;
    return {
      slug: j.slug,
      title: flipbook[j.slug]?.title ?? j.title,
      country: j.country,
      lead: j.lead,
      facts: `${j.days} days · ${nights} nights · ${site.groupSize}`,
      label: `${flipbook[j.slug]?.title.split(',')[0] ?? j.title} · ${j.region}`,
      route: route.map((s) => s.coords),
      stops,
    };
  });

  return (
    <section className="jxh" aria-labelledby="jxh-h1">
      <div className="jxh-head">
        <p className="jxh-lab">Journeys</p>
        <h1 id="jxh-h1">Small Luxury Group Journeys</h1>
        <p className="jxh-line">
          Extraordinary destinations. Intimate groups. Thoughtfully curated experiences.
        </p>
        <div className="jxh-say">
          <p>
            Intimate journeys shared with a small circle of fellow travelers, bringing together
            exceptional places, meaningful experiences and the joy of discovering the world
            together.
          </p>
          <p className="hint">
            <i aria-hidden />
            Choose a journey below and the globe will take you there.
          </p>
        </div>
      </div>

      <HeroCarousel
        journeys={items}
        label="A globe showing the chosen journey’s route, its stops and nights"
      />
    </section>
  );
}
