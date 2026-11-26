import { availability, limitedAvailability, type DepartureStatus } from '@/lib/availability';

/**
 * A departure's or a journey's booking status, after Marc's review of 23
 * November 2026, drawn the same wherever it is shown: a small mark and the
 * label in the house's caps, "BOOKING NOW", "GUARANTEED", "SOLD OUT", and
 * beside Guaranteed, where it applies, "| LIMITED AVAILABILITY" (Marc's own
 * example). Quiet by design (no pill, no bright colour): the mark is a dot in
 * the brand blue, ringed once the departure is guaranteed; Sold Out is muted.
 * The two parts wrap as wholes, and where the second goes to a line of its
 * own its bar is left behind (clipped at the tag's edge), so a line never
 * starts with "|". `tone`: the ground it sits on.
 */
export function AvailabilityTag({
  status,
  limited = false,
  tone = 'light',
  className = '',
}: {
  status: DepartureStatus;
  limited?: boolean;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const out = status === 'sold-out';
  const text =
    tone === 'dark'
      ? out
        ? 'text-on-dark-muted'
        : 'text-on-dark'
      : out
        ? 'text-muted'
        : 'text-ink';
  const mark =
    tone === 'dark'
      ? out
        ? 'text-on-dark-muted'
        : 'text-acqua'
      : out
        ? 'text-muted'
        : 'text-acqua-deep';
  return (
    <span
      className={`kicker-sm inline-flex overflow-hidden align-middle font-semibold ${text} ${className}`}
    >
      {/* Every part starts 1.25rem early: the first with blank room there, the
          second with its bar, which the tag's edge clips once it wraps. */}
      <span className="-ml-5 flex flex-wrap items-center gap-y-1">
        <span className="inline-flex items-center gap-2 whitespace-nowrap pl-5">
          <StatusMark status={status} className={mark} />
          {availability[status].label}
        </span>
        {limited && status === 'guaranteed' && (
          <span className="inline-flex items-center whitespace-nowrap">
            <span aria-hidden className="mx-2.5 h-[1.1em] w-px bg-current opacity-35" />
            {limitedAvailability.label}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * The mark alone: a dot for Booking Now, the dot ringed for Guaranteed (the
 * departure is confirmed), a plain dot for Sold Out, in the colour given.
 */
export function StatusMark({
  status,
  className = '',
}: {
  status: DepartureStatus;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      focusable="false"
      className={`h-[0.6875rem] w-[0.6875rem] flex-none ${className}`}
    >
      {status === 'guaranteed' ? (
        <>
          <circle cx="6" cy="6" r="5.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6" cy="6" r="2.6" fill="currentColor" />
        </>
      ) : (
        <circle cx="6" cy="6" r="3.4" fill="currentColor" />
      )}
    </svg>
  );
}
