import { AvailabilityTag } from '@/components/ui/AvailabilityTag';
import {
  availability,
  LIMITED_FROM,
  limitedAvailability,
  MAX_GUESTS,
  MIN_GUESTS,
  type DepartureStatus,
} from '@/lib/availability';
import './availability.css';

/**
 * The three statuses in the order a departure moves through them, each with
 * the confirmed guests it stands for.
 */
const STEPS: { status: DepartureStatus; from: number; to: number }[] = [
  { status: 'booking-now', from: 0, to: MIN_GUESTS - 1 },
  { status: 'guaranteed', from: MIN_GUESTS, to: MAX_GUESTS - 1 },
  { status: 'sold-out', from: MAX_GUESTS, to: MAX_GUESTS },
];

const soldOut = availability['sold-out'];

/**
 * What a traveller can do at each status, in the booking buttons' own words;
 * for Booking Now with the line the request form itself opens with.
 */
const NEXT: Record<DepartureStatus, { act: string; note?: string }> = {
  'booking-now': {
    act: availability['booking-now'].cta,
    note: 'Sending a request commits you to nothing.',
  },
  guaranteed: { act: availability.guaranteed.cta },
  'sold-out': {
    act: `Choose another date, ${soldOut.cta.toLowerCase()}, or ${(soldOut.altCta ?? '').toLowerCase()}`,
  },
};

/** The places numbered under a strip: the first, the minimum, the last. */
const SCALE = new Set([1, MIN_GUESTS, MAX_GUESTS]);

/** A guest range: "0–9" on screen, "0 to 9" to a screen reader. */
function Guests({ from, to }: { from: number; to: number }) {
  return (
    <b>
      {from === to ? (
        from
      ) : (
        <>
          {from}
          <span aria-hidden>–</span>
          <span className="sr-only"> to </span>
          {to}
        </>
      )}
    </b>
  );
}

/**
 * A departure's 18 places as a strip, the places of this status's range
 * coloured (the guest counts that give it), the rest open, with a step
 * before the minimum; numbered beneath at the first place, the minimum and
 * the last. A range, not a count: it never shows a departure as it stands.
 * Drawn only: the words beside it say the same.
 */
function Places({ from, to }: { from: number; to: number }) {
  const places = Array.from({ length: MAX_GUESTS }, (_, i) => i + 1);
  const min = (n: number) => (n === MIN_GUESTS ? '' : undefined);
  return (
    <span className="avg-strip" aria-hidden>
      <span className="avg-places">
        {places.map((n) => (
          <i key={n} data-on={n >= from && n <= to ? '' : undefined} data-min={min(n)} />
        ))}
      </span>
      <span className="avg-scale">
        {places.map((n) => (
          <span key={n} data-min={min(n)}>
            {SCALE.has(n) ? n : ''}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Understanding Journey Availability, on the Journeys page between The
 * Collection and The Peaks2Shores Experience (Marc's review of 23 November
 * 2026, section 3C; Ishika's placement), made plainer on the owner's request
 * of 26 November 2026 and after an independent review the same day.
 *
 * The head: the heading, the group size, what sets a status and how a
 * departure moves through them, and where a status is shown, each with the
 * status as it looks there (the chip on a journey card's photograph; the tag
 * and its secondary words beside a date). Then a key to the dots, and the
 * three statuses as three panels in their order (Booking Now → Guaranteed →
 * Sold Out): the status and its secondary words as beside a date, the
 * confirmed guests it stands for, the departure's 18 places with that range
 * coloured, Marc's website wording, and what the traveller can do then (the
 * booking buttons' words). Limited Availability sits in the Guaranteed panel,
 * as the indicator shown beside Guaranteed.
 */
export function AvailabilityGuide() {
  const now = availability['booking-now'];
  return (
    <section className="avg" id="availability" aria-labelledby="avg-h">
      <div className="avg-in">
        <div className="avg-head">
          <div className="avg-title">
            <p className="avg-lab">How booking works</p>
            <h2 id="avg-h">Understanding Journey Availability</h2>
          </div>
          <p className="avg-intro">
            Our small-group journeys are designed for a minimum of {MIN_GUESTS} and a maximum of{' '}
            {MAX_GUESTS} guests. Each departure has its own status, set by its confirmed bookings
            only (not by requests or inquiries), and it moves from Booking Now to Guaranteed to Sold
            Out as guests confirm.
          </p>
          <p className="avg-k avg-where-k" id="avg-where">
            Where you’ll see it
          </p>
          <ul className="avg-where" role="list" aria-labelledby="avg-where">
            <li>
              {/* As on a journey card's photograph (collection-card.css). */}
              <span className="avg-sample" aria-hidden>
                <span className="avg-chip">
                  <i />
                  {now.label}
                </span>
              </span>
              <span className="avg-wt">
                <b>On each journey’s card and page</b>
                Guaranteed as soon as one of its dates is; Sold Out only when every date is.
              </span>
            </li>
            <li>
              {/* As beside a date in a journey's Dates & Prices. */}
              <span className="avg-sample" aria-hidden>
                <span className="avg-date">
                  <AvailabilityTag status="booking-now" />
                  <small>{now.secondary}</small>
                </span>
              </span>
              <span className="avg-wt">
                <b>Beside every date</b>
                Each date shows its own status. Open its Details for the booking button.
              </span>
            </li>
          </ul>
        </div>

        <p className="avg-legend" aria-hidden>
          <span className="avg-key">
            <i />
            <i data-on="" />
          </span>
          Each dot is one of a departure’s {MAX_GUESTS} places. The colored dots show how many
          confirmed guests give each status.
        </p>

        <ol className="avg-steps" role="list">
          {STEPS.map(({ status, from, to }) => (
            <li key={status} data-s={status}>
              <h3>
                <AvailabilityTag status={status} />
              </h3>
              <p className="avg-sec">{availability[status].secondary}</p>
              <p className="avg-n">
                <Guests from={from} to={to} /> confirmed guests
              </p>
              <Places from={from} to={to} />
              <div className="avg-body">
                <p className="avg-w">{availability[status].wording}</p>
                {status === 'guaranteed' && (
                  <div className="avg-lim">
                    <h4>
                      <AvailabilityTag status="guaranteed" limited />
                    </h4>
                    <p>
                      {limitedAvailability.wording} Shown beside Guaranteed when about{' '}
                      {LIMITED_FROM} or fewer of the {MAX_GUESTS} places are left.
                    </p>
                  </div>
                )}
              </div>
              <p className="avg-do">
                <span className="avg-k">What you can do</span>
                {NEXT[status].act}
                {NEXT[status].note && <span className="avg-note">{NEXT[status].note}</span>}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
