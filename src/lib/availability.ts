/**
 * Journey availability and booking status, after Marc's "Journey Availability &
 * Booking Status" notes in his website review of 23 November 2026.
 *
 * Three statuses, in the order a departure moves through them:
 * Booking Now -> Guaranteed -> Sold Out. Limited Availability is not a status
 * of its own: it is a secondary indicator shown alongside Guaranteed when only
 * a few places remain ("GUARANTEED | LIMITED AVAILABILITY").
 *
 * The status belongs to each departure date, not to the journey, because two
 * departures of the same journey can be at different stages. A journey's card
 * and its page header show the best status among its departures (the owner's
 * choice of 25 November 2026): Guaranteed if any departure is guaranteed,
 * otherwise Booking Now, and Sold Out only when every departure is sold out.
 *
 * The status follows the number of confirmed guests on a departure (0-9
 * Booking Now, 10-17 Guaranteed, 18 Sold Out), so it changes by itself when the
 * count is updated. Only confirmed reservations count: not inquiries, and not
 * requested places.
 *
 * Where the count lives: each departure's `confirmed` in the site's own data
 * files (a journey's `departures` in src/lib/journeys.ts; the Dates & Prices
 * rows in src/lib/data/journeyRates.ts), updated by the web team from the
 * Liberty offices' confirmed bookings. There is no booking system or CMS
 * behind the site today, so an inquiry or a requested place never reaches
 * the count: only a booking confirmed by hand does.
 */

export type DepartureStatus = 'booking-now' | 'guaranteed' | 'sold-out';

/** The smallest group a journey operates with. */
export const MIN_GUESTS = 10;
/** The largest group on any journey. */
export const MAX_GUESTS = 18;
/** At or below this many remaining places, a guaranteed departure shows Limited Availability. */
export const LIMITED_FROM = 4;

/** The guests a group journey takes, in words: "10–18 guests". */
export const groupSizeLabel = `${MIN_GUESTS}–${MAX_GUESTS} guests`;

export const availability: Record<
  DepartureStatus,
  {
    /** The visual label, set in capitals by the design: "Booking Now". */
    label: string;
    /** The secondary description under or beside the label. */
    secondary: string;
    /** Marc's website wording, explaining what the status means. */
    wording: string;
    /** The booking call to action for a departure in this status. */
    cta: string;
    /** A second way on, where there is one. */
    altCta?: string;
  }
> = {
  'booking-now': {
    label: 'Booking Now',
    secondary: 'Reservations Open',
    wording:
      'Our journeys are open for reservations. With a minimum of 10 guests required, places can initially be requested while the group comes together. Once the minimum is reached, the journey will be confirmed.',
    cta: 'Request your place',
  },
  guaranteed: {
    label: 'Guaranteed',
    secondary: 'Departure Confirmed',
    wording:
      'The minimum group size has been reached and the journey is confirmed to go ahead. Reservations can now be secured with the required deposit as we move forward with confirming accommodations and experiences.',
    cta: 'Secure your place',
  },
  'sold-out': {
    label: 'Sold Out',
    secondary: 'Fully Booked',
    wording:
      'This journey has reached its maximum of 18 guests. Explore another available departure or let us create a personalized experience through our Private Travel collection.',
    cta: 'Explore other journeys',
    altCta: 'Discover private travel',
  },
};

/** The secondary indicator for a guaranteed departure that is nearly full. */
export const limitedAvailability = {
  label: 'Limited Availability',
  wording: 'Only a few places remaining.',
} as const;

/** A departure's status from its confirmed guest count. */
export function statusFromGuests(confirmed: number): DepartureStatus {
  if (confirmed >= MAX_GUESTS) return 'sold-out';
  if (confirmed >= MIN_GUESTS) return 'guaranteed';
  return 'booking-now';
}

/**
 * Whether a departure shows Limited Availability: only when guaranteed, and
 * either set by hand (`limited`) or when no more than LIMITED_FROM places remain.
 */
export function isLimited(confirmed: number, limited?: boolean): boolean {
  if (statusFromGuests(confirmed) !== 'guaranteed') return false;
  return limited ?? MAX_GUESTS - confirmed <= LIMITED_FROM;
}

export type DepartureAvailability = { status: DepartureStatus; limited: boolean };

/**
 * A journey's status from its departures: the best of them. Guaranteed if any
 * departure is guaranteed (limited only if every guaranteed one is limited),
 * otherwise Booking Now while any departure is open, and Sold Out only when
 * every departure is sold out. A journey with no departures yet is Booking Now.
 */
export function journeyAvailability(departures: DepartureAvailability[]): DepartureAvailability {
  const guaranteed = departures.filter((d) => d.status === 'guaranteed');
  if (guaranteed.length)
    return { status: 'guaranteed', limited: guaranteed.every((d) => d.limited) };
  if (departures.length && departures.every((d) => d.status === 'sold-out')) {
    return { status: 'sold-out', limited: false };
  }
  return { status: 'booking-now', limited: false };
}

/**
 * A departure as the data files hold it: its confirmed guests (absent, none
 * yet) and, where set by hand, whether it shows Limited Availability.
 */
export type GuestCount = { confirmed?: number; limited?: boolean };

/**
 * A departure still to come: it starts after today. One that has run (or set
 * off) neither sets a journey's status nor is offered, whether or not its row
 * has been taken out of the data yet (the pages are rebuilt hourly).
 */
export function isUpcoming({ start }: { start: string }, now = new Date()): boolean {
  return start > now.toISOString().slice(0, 10);
}

/** A departure's status and Limited Availability, from its confirmed guests. */
export function departureAvailability({
  confirmed = 0,
  limited,
}: GuestCount): DepartureAvailability {
  return { status: statusFromGuests(confirmed), limited: isLimited(confirmed, limited) };
}

/** A journey's status from its departures as the data files hold them (see journeyAvailability). */
export function availabilityOf(departures: readonly GuestCount[] = []): DepartureAvailability {
  return journeyAvailability(departures.map(departureAvailability));
}

/**
 * The status in words, with Limited Availability where it shows: "Booking
 * Now", "Guaranteed · Limited Availability". For a line of plain text (a
 * card's label, an aria label); the tags draw the two parts themselves.
 */
export function availabilityText({ status, limited }: DepartureAvailability): string {
  return limited
    ? `${availability[status].label} · ${limitedAvailability.label}`
    : availability[status].label;
}

/** Where "Explore other journeys" leads from a sold-out journey or departure. */
export const OTHER_JOURNEYS_HREF = '/journeys#collection';
