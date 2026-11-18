import { getJourneys, type Journey } from '@/lib/content';
import { journeyRank } from '@/lib/data/flipbook';
import { toCollectionCard } from '@/lib/journeyCards';
import { CollectionCard } from './CollectionCard';
import './more-to-discover.css';

/** The journeys a row shows at most. */
const LIMIT = 3;

/** A journey's countries, in the order its name gives them: 'Switzerland & Italy'. */
const countriesOf = (j: Pick<Journey, 'country'>) => j.country.split(/\s*&\s*/);

/**
 * The row under a journey's page, in place of the questions (Ishika's notes
 * of 9 November 2026, items 25 and 26, after A&K's "More South Africa
 * Adventures"): the other journeys as The Collection's cards, in their
 * compact form (the lead photograph, the name, the itinerary, the days, the
 * price line and "View journey"; no status label).
 *
 * The heading names the country the journey shares with every journey in
 * the row, the first of its own countries that they all visit: "More to
 * discover in Italy" on each of the three launch journeys. When they share
 * none it reads "More journeys to discover". The journeys sharing a country
 * with this one come first, then the rest, each group in Marc's order.
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

  const country = own.find((c) => others.every((j) => countriesOf(j).includes(c)));
  const heading = country ? `More to discover in ${country}` : 'More journeys to discover';

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
