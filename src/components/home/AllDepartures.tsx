import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { StatusTag } from '@/components/ui/StatusTag';
import type { JourneySummary } from '@/lib/content';

/**
 * All departures, in date order, as one slim ledger: name, dates, length,
 * group and price, so every journey can be compared at a glance. A real table
 * on a desktop; on a phone each row folds into a short stack. The group
 * column comes from each journey's own data, so a smaller departure (Mallorca,
 * sixteen) never reads as the site-wide eighteen.
 */
export function AllDepartures({ journeys }: { journeys: JourneySummary[] }) {
  const rows = journeys
    .filter((j) => j.status !== 'past')
    .sort((a, b) => a.departureISO.localeCompare(b.departureISO));
  if (rows.length === 0) return null;

  return (
    <Reveal className="mt-section-sm">
      <h3 id="departures-title" className="kicker mb-6">
        All departures
      </h3>
      <table aria-labelledby="departures-title" className="w-full border-collapse text-left">
        <thead className="sr-only md:not-sr-only">
          <tr className="border-b border-ink">
            {['Journey', 'Dates', 'Length', 'Group', 'From'].map((h) => (
              <th key={h} scope="col" className="kicker-sm pb-3 pr-6 font-medium text-muted">
                {h}
              </th>
            ))}
            <th scope="col" className="pb-3">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((j) => (
            <tr
              key={j.slug}
              className="group relative grid grid-cols-2 gap-x-6 gap-y-1 border-b border-line py-5 md:table-row md:py-0"
            >
              <th scope="row" className="col-span-2 py-0 pr-6 font-normal md:py-5">
                <Link
                  href={`/journeys/${j.slug}`}
                  className="h5 after:absolute after:inset-0 after:content-[''] group-hover:text-acqua-text"
                >
                  {j.title}
                </Link>
                <span className="meta ml-3 text-muted">{j.country}</span>
                {j.status && j.status !== 'open' && (
                  <StatusTag status={j.status} className="ml-3 inline-flex align-middle" />
                )}
              </th>
              <td className="meta py-0 pr-6 text-body md:py-5">{j.departureWindow}</td>
              <td className="meta py-0 pr-6 text-body md:py-5">{j.days} days</td>
              <td className="meta py-0 pr-6 text-body md:py-5">Max. {j.groupMax}</td>
              <td className="meta py-0 pr-6 font-semibold text-ink md:py-5">{j.priceFrom}</td>
              <td aria-hidden className="hidden py-5 text-right md:table-cell">
                <span className="kicker-sm text-muted transition-colors group-hover:text-ink">
                  View →
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}
