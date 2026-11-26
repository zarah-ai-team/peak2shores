'use client';

import { useId, useState } from 'react';
import { AvailabilityTag } from '@/components/ui/AvailabilityTag';
import type { DepartureAvailability } from '@/lib/availability';

/** A row of the Dates and rates table, in words: "Jun 19 – Jul 1, 2027", its price and status. */
export type DepartureRow = {
  id: string;
  dates: string;
  price: string;
  /** Where it stands, from its confirmed guests (Booking Now, Guaranteed, Sold Out). */
  availability: DepartureAvailability;
  /** The filter option the row belongs to: its year ('2027') or month ('2027-06'). */
  key: string;
};

/** The table's filter: by the year a departure starts in, or by its month. */
export type DepartureFilter = {
  by: 'year' | 'month';
  options: { value: string; label: string }[];
};

const ALL = 'all';

const count = (n: number) => `${n} ${n === 1 ? 'departure' : 'departures'}`;

/**
 * The Dates and rates table of a journey's page: dates, price and status for
 * each departure, after A&K's, the status drawn as everywhere (AvailabilityTag). Above it, when the departures start in more
 * than one year (or month), a small filter by year (by month when every
 * departure starts in the same year): native radio buttons drawn as pills, so
 * the arrow keys move between them, and a polite status line that says how
 * many departures are shown. A filter with a single choice would change
 * nothing, so it is left out. On a phone each row stacks, every value under
 * its column's name.
 */
export function JourneyDepartures({
  rows,
  filter: offered,
}: {
  rows: DepartureRow[];
  filter?: DepartureFilter;
}) {
  const filter = offered && offered.options.length > 1 ? offered : undefined;
  const [pick, setPick] = useState(ALL);
  const id = useId();
  const shown = filter && pick !== ALL ? rows.filter((r) => r.key === pick) : rows;
  const chosen = filter?.options.find((o) => o.value === pick);

  return (
    <>
      {filter && (
        <div className="dfilter">
          <span className="lab" id={`${id}-by`}>
            {filter.by === 'year' ? 'Year' : 'Month'}
          </span>
          <div className="dopts" role="radiogroup" aria-labelledby={`${id}-by`}>
            {[{ value: ALL, label: 'All' }, ...filter.options].map((o) => (
              <label key={o.value}>
                <input
                  className="sr-only"
                  type="radio"
                  name={`${id}-pick`}
                  value={o.value}
                  checked={pick === o.value}
                  onChange={() => setPick(o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          <p className="sr-only" role="status">
            {`Showing ${count(shown.length)}${chosen ? ` in ${chosen.label}` : ''}.`}
          </p>
        </div>
      )}
      <table className="tbl">
        <caption className="sr-only">Departures</caption>
        <thead>
          <tr>
            <th scope="col">Dates</th>
            <th scope="col">Price</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id}>
              <th scope="row" className="big" data-k="Dates">
                {r.dates}
              </th>
              <td data-k="Price">{r.price}</td>
              <td data-k="Status">
                <AvailabilityTag status={r.availability.status} limited={r.availability.limited} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
