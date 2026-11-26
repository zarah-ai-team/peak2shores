'use client';

import Link from 'next/link';
import { Fragment, useId, useState } from 'react';
import { AvailabilityTag } from '@/components/ui/AvailabilityTag';
import {
  availability,
  limitedAvailability,
  OTHER_JOURNEYS_HREF,
  type DepartureAvailability,
} from '@/lib/availability';
import { PRIVATE_TRAVEL_HREF } from '@/lib/links';
import { OpenJourneyForm } from './forms/JourneyForms';

/** A departure as the table shows it, already in words. */
export type RateRow = {
  /** The departure's ISO interval, 'start/end': the booking form's value for it. */
  id: string;
  /** 'May 16 – May 28, 2027', for the row's button label. */
  dates: string;
  /** 'May 16, 2027' and its weekday, 'Sunday'. */
  starts: { date: string; day: string };
  ends: { date: string; day: string };
  year: string;
  price: string;
  single: string;
  withExtension?: string;
  /** Where it stands: its status, from its confirmed guests, and Limited Availability. */
  availability: DepartureAvailability;
  notes: string[];
};

const ALL = 'all';
const count = (n: number) => `${n} ${n === 1 ? 'departure' : 'departures'}`;

/**
 * The Dates & Prices table, after A&K's: a ruled table with a row for each
 * departure (departs, returns, price per person sharing, single supplement,
 * availability) and a Details button that opens a line beneath it with the
 * price with the extension, the departure's notes, and its status in Marc's
 * words with the next step it offers (Marc's review of 23 November 2026):
 * "Request your place" while booking now and "Secure your place" once
 * guaranteed, each opening the booking form on that departure (with the
 * deposit terms beside the second); once sold out, "Explore other journeys"
 * and "Discover private travel". Above it, a filter by year when the
 * departures start in more than one. On a phone each row stacks, every value
 * under its column's name.
 */
export function JourneyRatesTable({
  rows,
  extensionLabel,
  deposit,
}: {
  rows: RateRow[];
  /** "With Italy Uncovered", when the journey has an extension. */
  extensionLabel?: string;
  /** The deposit and balance terms, shown beside "Secure your place". */
  deposit?: string[];
}) {
  const id = useId();
  const years = [...new Set(rows.map((r) => r.year))];
  const [pick, setPick] = useState(ALL);
  const [open, setOpen] = useState<string | null>(null);
  const shown = pick === ALL ? rows : rows.filter((r) => r.year === pick);

  return (
    <div className="rtw">
      {years.length > 1 && (
        <div className="dfilter">
          <span className="lab" id={`${id}-by`}>
            Departures in
          </span>
          <div className="dopts" role="radiogroup" aria-labelledby={`${id}-by`}>
            {[ALL, ...years].map((y) => (
              <label key={y}>
                <input
                  className="sr-only"
                  type="radio"
                  name={`${id}-pick`}
                  value={y}
                  checked={pick === y}
                  onChange={() => setPick(y)}
                />
                <span>{y === ALL ? 'All' : y}</span>
              </label>
            ))}
          </div>
          <p className="sr-only" role="status">
            {`Showing ${count(shown.length)}${pick === ALL ? '' : ` in ${pick}`}.`}
          </p>
        </div>
      )}

      <table className="rt">
        <caption className="sr-only">Departures, prices per person and availability</caption>
        <thead>
          <tr>
            <th scope="col">Departs</th>
            <th scope="col">Returns</th>
            <th scope="col" className="num">
              Price per person
            </th>
            <th scope="col" className="num">
              Single supplement
            </th>
            <th scope="col">Availability</th>
            <th scope="col">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => {
            const isOpen = open === r.id;
            const panel = `${id}-${r.id.replace(/\W/g, '')}`;
            const { status, limited } = r.availability;
            const words = availability[status];
            return (
              <Fragment key={r.id}>
                <tr
                  className={`rt-row${isOpen ? ' is-open' : ''}${status === 'sold-out' ? ' is-out' : ''}`}
                >
                  <th scope="row" className="rt-d" data-k="Departs">
                    <b>{r.starts.date}</b>
                    <small>{r.starts.day}</small>
                  </th>
                  <td className="rt-d" data-k="Returns">
                    <b>{r.ends.date}</b>
                    <small>{r.ends.day}</small>
                  </td>
                  <td className="num rt-p" data-k="Price per person">
                    {r.price}
                  </td>
                  <td className="num" data-k="Single supplement">
                    {r.single}
                  </td>
                  <td className="rt-av" data-k="Availability">
                    <AvailabilityTag status={status} limited={limited} />
                    <small className="av-sub">
                      {limited ? limitedAvailability.wording : words.secondary}
                    </small>
                  </td>
                  <td className="rt-t">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      aria-label={`${isOpen ? 'Hide' : 'Show'} details of the ${r.dates} departure`}
                      onClick={() => setOpen(isOpen ? null : r.id)}
                    >
                      <span aria-hidden>{isOpen ? 'Close' : 'Details'}</span>
                      <svg viewBox="0 0 24 24" aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className="rt-x" id={panel} hidden={!isOpen}>
                  <td colSpan={6}>
                    <div className="rt-xc">
                      <dl className="rt-facts">
                        <div>
                          <dt>Sharing a double room</dt>
                          <dd>{r.price}</dd>
                        </div>
                        <div>
                          <dt>Room of one’s own</dt>
                          <dd>+ {r.single}</dd>
                        </div>
                        {extensionLabel && (
                          <div>
                            <dt>{extensionLabel}</dt>
                            <dd>{r.withExtension ?? 'Not on this departure'}</dd>
                          </div>
                        )}
                      </dl>
                      {r.notes.length > 0 && (
                        <div className="rt-notes">
                          <p className="lab">Departure notes</p>
                          <ul>
                            {r.notes.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* The departure's status, what it means and the next step. */}
                      <div className="rt-st">
                        <AvailabilityTag status={status} limited={limited} />
                        <p className="rt-stw">
                          {words.wording}
                          {limited && ` ${limitedAvailability.wording}`}
                        </p>
                        {status === 'guaranteed' && deposit && deposit.length > 0 && (
                          <p className="rt-dep">{deposit.join(' ')}</p>
                        )}
                        <div className="rt-cta">
                          {status === 'sold-out' ? (
                            <>
                              <Link className="btn btn-ink" href={OTHER_JOURNEYS_HREF}>
                                {words.cta}
                              </Link>
                              {words.altCta && (
                                <Link className="tlink" href={PRIVATE_TRAVEL_HREF}>
                                  {words.altCta}
                                </Link>
                              )}
                            </>
                          ) : (
                            <OpenJourneyForm
                              kind="group"
                              departure={r.id}
                              dialogTitle={words.cta}
                              dialogNote={`${words.wording}${limited ? ` ${limitedAvailability.wording}` : ''}`}
                              className="btn btn-ink"
                            >
                              {words.cta}
                            </OpenJourneyForm>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
