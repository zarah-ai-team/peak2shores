import type { ReactNode } from 'react';
import type { DepartureStatus } from '@/lib/availability';
import { journeyLabel, type JourneyStatus } from '@/lib/journeys';
import { AvailabilityTag } from './AvailabilityTag';

export type TagStatus = JourneyStatus | DepartureStatus | 'new' | 'preparation' | 'draft';

/** The booking statuses of Marc's review of 23 November 2026, drawn by AvailabilityTag. */
const BOOKING: readonly TagStatus[] = ['booking-now', 'guaranteed', 'sold-out'];

/**
 * The words come from `journeyLabel()` wherever it has them (Waitlist,
 * Departed, New); "In preparation" is the site's existing string for
 * unwritten journeys and journal entries. `open` has no label of its own in
 * the content — pass `children` if a page needs one shown.
 */
function labelFor(status: TagStatus): string | null {
  switch (status) {
    case 'waitlist':
    case 'past':
    case 'open':
      return journeyLabel({ status });
    case 'new':
      return journeyLabel({ isNew: true });
    case 'preparation':
    case 'draft':
      return 'In preparation';
    default:
      return null;
  }
}

/** Brand blue for something you can act on, a paler blue for something pending, a rule for closed. */
const markFor: Record<Exclude<TagStatus, DepartureStatus>, { light: string; dark: string }> = {
  open: { light: 'bg-acqua-deep', dark: 'bg-acqua' },
  new: { light: 'bg-acqua-deep', dark: 'bg-acqua' },
  waitlist: { light: 'bg-acqua', dark: 'bg-brand' },
  preparation: { light: 'bg-acqua', dark: 'bg-brand' },
  draft: { light: 'bg-acqua', dark: 'bg-brand' },
  past: { light: 'bg-muted', dark: 'bg-on-dark-muted' },
};

/**
 * A journey's or entry's state: a 6px square and a caps label. Renders
 * nothing when there is no label to show (an open journey without children).
 * A booking status (Booking Now, Guaranteed, Sold Out) is drawn as
 * AvailabilityTag draws it everywhere, in Marc's words, with Limited
 * Availability beside Guaranteed where `limited` says so.
 */
export function StatusTag({
  status,
  limited = false,
  tone = 'light',
  children,
  className = '',
}: {
  status: TagStatus;
  /** With Guaranteed: the departure shows Limited Availability. */
  limited?: boolean;
  tone?: 'light' | 'dark';
  /** Overrides the label. */
  children?: ReactNode;
  className?: string;
}) {
  if (BOOKING.includes(status) && !children) {
    return (
      <AvailabilityTag
        status={status as DepartureStatus}
        limited={limited}
        tone={tone}
        className={className}
      />
    );
  }
  const label = children ?? labelFor(status);
  if (!label) return null;
  const text =
    tone === 'dark'
      ? 'text-on-dark'
      : status === 'open' || status === 'new' || status === 'booking-now'
        ? 'text-acqua-text'
        : 'text-ink';
  const mark =
    status === 'booking-now' || status === 'guaranteed'
      ? markFor.open
      : status === 'sold-out'
        ? markFor.past
        : markFor[status];

  return (
    <span className={`kicker-sm inline-flex items-center gap-2.5 ${text} ${className}`}>
      <span aria-hidden className={`status-mark ${mark[tone]}`} />
      {label}
    </span>
  );
}
