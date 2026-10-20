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
