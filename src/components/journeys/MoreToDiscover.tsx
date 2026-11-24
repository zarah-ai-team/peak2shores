import { getJourneys, type Journey } from '@/lib/content';
import { journeyRank } from '@/lib/data/flipbook';
import { toCollectionCard } from '@/lib/journeyCards';
import { CollectionCard } from './CollectionCard';
import './more-to-discover.css';

/** The journeys a row shows at most. */
const LIMIT = 3;

/** A journey's countries, in the order its name gives them: 'Switzerland & Italy'. */
const countriesOf = (j: Pick<Journey, 'country'>) => j.country.split(/\s*&\s*/);

/** A journey's own country: its `mainCountry`, else the first of its countries. */
const ownCountry = (j: Pick<Journey, 'country' | 'mainCountry'>) =>
  j.mainCountry ?? countriesOf(j)[0];

/**
 * The row under a journey's page, in place of the questions (Ishika's notes
 * of 9 November 2026, items 25 and 26, after A&K's "More South Africa
 * Adventures"): the other journeys as The Collection's cards, in their
 * compact form (the lead photograph, the name, the itinerary, the days, the
 * price line and "View journey"; no status label).
 *
 * The heading names the journey's own country, with the place name changing
 * from journey to journey (the designer's notes; the owner's decision of
 * 19 November 2026): "More to discover in Switzerland" under Swiss Elegance,
 * "in Italy" under Italy Uncovered and "in Croatia" under The Adriatic
 * Collection. A journey without a `mainCountry` names the first of its
 * countries, and one without a country reads "More journeys to discover".
 * The journeys sharing a country with this one come first, then the rest,
 * each group in Marc's order.
 *
 * Three cards across on a laptop and wider. On a tablet the row is swiped
 * sideways with two cards across, and on a phone with one card and the edge
 * of the next in view. Nothing renders when there is no other journey.
 */
export async function MoreToDiscover({ current }: { current: Journey }) {
  const own = countriesOf(current);
  const shares = (j: Journey) => countriesOf(j).some((c) => own.includes(c));
  const others = (await getJourneys())
    .filter((j) => j.slug !== current.slug && j.status !== 'past')
    .sort(
      (a, b) => Number(shares(b)) - Number(shares(a)) || journeyRank(a.slug) - journeyRank(b.slug),
    )
    .slice(0, LIMIT);
  if (others.length === 0) return null;

  const country = ownCountry(current);
  // "to discover" stays together, so on a phone every page breaks the same
  // way: "More to discover / in Italy".
  const heading = country ? `More to discover in ${country}` : 'More journeys to discover';

  return (
    <section className="mtd" aria-labelledby="mtd-h">
      <div className="mtd-in">
        <h2 id="mtd-h" className="mtd-h">
          {heading}
        </h2>
        <ul className="mtd-row">
          {others.map((j) => (
            <li key={j.slug}>
              <CollectionCard card={toCollectionCard(j)} compact />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
