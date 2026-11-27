import type { DepartureAvailability, DepartureStatus } from '@/lib/availability';
import type { JourneyStatus } from '@/lib/content';

/**
 * The booking state a journey shows as a StatusTag: its status when it is
 * not simply open, else "New" while it is new, else open (which the tag
 * renders only when given words of its own).
 */
export function journeyTagStatus(journey: {
  status?: JourneyStatus;
  isNew?: boolean;
}): JourneyStatus | 'new' {
  if (journey.status && journey.status !== 'open') return journey.status;
  return journey.isNew ? 'new' : 'open';
}

/** What a journey's booking tag shows: a status, and Limited Availability with Guaranteed. */
export type JourneyBookingTag = { status: DepartureStatus | 'past'; limited: boolean };

/**
 * A journey's booking tag, as the Journeys page's cards show it: the best of
 * its departures' statuses in Marc's words (Booking Now, Guaranteed, Sold Out;
 * his review of 23 November 2026), with Limited Availability where it shows.
 * No "New": the cards show none. A journey that has run shows Departed, as
 * its own page does (the Journeys page lists none).
 */
export function journeyBookingTag(
  status: JourneyStatus | undefined,
  availability: DepartureAvailability,
): JourneyBookingTag {
  return status === 'past' ? { status: 'past', limited: false } : availability;
}
