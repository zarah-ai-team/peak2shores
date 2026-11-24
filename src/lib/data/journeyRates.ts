/**
 * Dates & Prices for a journey's page, laid out after A&K's "Dates & Prices"
 * (each departure a row that opens on its rates, availability and notes) with
 * the additional information beneath: price notes, what is included and not,
 * and the deposit and payment terms.
 *
 * SAMPLE VALUES. Marc has not confirmed any dates or prices yet. The entries
 * below are invented so the layout can be reviewed with real-looking rows,
 * and `sample: true` makes the page say so above the table. They are read by
 * the Dates & Prices section only: the journey's hero, cards, filters,
 * structured data and booking forms still read `departures` and `priceFrom`
 * in journeys.ts, which stay "to be announced". Replace every value with
 * Marc's and set `sample: false` (or remove it) before launch; once the dates
 * are confirmed, copy them into the journey's `departures` in journeys.ts too.
 */

import type { RateIconName } from '@/components/journeys/RateIcon';

/** A line of the additional information, with its icon. */
export type RateItem = { icon: RateIconName; text: string };

/** Where a departure stands, as its row says it. */
export type Availability = 'available' | 'limited' | 'waitlist' | 'sold-out';

export type RateDeparture = {
  /** The first day, 'YYYY-MM-DD'. */
  start: string;
  /** The last day, 'YYYY-MM-DD'. */
  end: string;
  /** Per person, sharing a double room: '$14,950'. */
  price: string;
  /** The supplement for a room of one's own: '$4,650'. */
  single: string;
  /** With the journey's extension, per person sharing, where it runs on this departure. */
  withExtension?: string;
  availability: Availability;
  /** Places left, shown with "limited": "4 places left". */
  placesLeft?: number;
  /** The departure runs whatever the number booked. */
  guaranteed?: boolean;
  /** Notes for this departure alone: a different hotel, a festival, a host. */
  notes?: string[];
};

export type JourneyRates = {
  /** True while the values are invented for review: the page says so. */
  sample?: boolean;
  currency: 'USD';
  departures: RateDeparture[];
  /** How to read the prices. */
  priceNotes: RateItem[];
  included: RateItem[];
  excluded: RateItem[];
  /** Deposit, balance and cancellation, in brief; the full terms are on /terms. */
  payment: RateItem[];
};

export const journeyRates: Record<string, JourneyRates> = {
  'swiss-elegance': {
    sample: true,
    currency: 'USD',
    departures: [
      {
        start: '2027-05-16',
        end: '2027-05-28',
        price: '$14,950',
        single: '$4,650',
        withExtension: '$25,400',
        availability: 'available',
        guaranteed: true,
        notes: ['Spring departure: wildflowers in the Alpine meadows, quieter lakes.'],
      },
      {
        start: '2027-06-13',
        end: '2027-06-25',
        price: '$15,450',
        single: '$4,850',
        withExtension: '$26,200',
        availability: 'limited',
        placesLeft: 4,
        guaranteed: true,
        notes: ['Midsummer: the longest days for walks in the high Alps.'],
      },
      {
        start: '2027-07-11',
        end: '2027-07-23',
        price: '$15,950',
        single: '$4,950',
        availability: 'sold-out',
        notes: ['The Italian extension does not run on this departure.'],
      },
      {
        start: '2027-09-05',
        end: '2027-09-17',
        price: '$15,450',
        single: '$4,850',
        withExtension: '$26,200',
        availability: 'available',
        notes: ['Grape harvest in the Lavaux vineyards.'],
      },
      {
        start: '2027-09-26',
        end: '2027-10-08',
        price: '$14,950',
        single: '$4,650',
        withExtension: '$25,400',
        availability: 'waitlist',
        notes: [
          'Days 7–8 at Mont Cervin Palace, Zermatt, in place of the Grand Hotel Zermatterhof.',
        ],
      },
      {
        start: '2028-05-21',
        end: '2028-06-02',
        price: '$15,450',
        single: '$4,850',
        withExtension: '$26,400',
        availability: 'available',
      },
      {
        start: '2028-06-18',
        end: '2028-06-30',
        price: '$15,950',
        single: '$4,950',
        withExtension: '$26,900',
        availability: 'available',
      },
    ],
    priceNotes: [
      { icon: 'tag', text: 'Prices are per person in US dollars, sharing a double or twin room.' },
      {
        icon: 'single',
        text: 'The single supplement is added to the price for a room of one’s own.',
      },
      {
        icon: 'route',
        text: 'The price with the Italian extension covers Swiss Elegance and Italy Uncovered together, from Lucerne to Venice.',
      },
      { icon: 'info', text: 'Prices are confirmed when you book and may change until then.' },
      {
        icon: 'group',
        text: 'A group departs with a minimum of 6 guests. A guaranteed departure runs whatever the number booked.',
      },
    ],
    included: [
      { icon: 'hotel', text: '12 nights in the hotels named in the itinerary' },
      {
        icon: 'meal',
        text: 'Daily breakfast, 6 lunches and 7 dinners, including a welcome and a farewell dinner',
      },
      {
        icon: 'car',
        text: 'Private transfers throughout, including arrival and departure on the journey’s dates',
      },
      {
        icon: 'train',
        text: 'First-class Swiss rail, mountain railways and cable cars on the itinerary',
      },
      { icon: 'guide', text: 'Private guiding and a Peaks2Shores journey director throughout' },
      { icon: 'boat', text: 'Lake cruises on Lake Lucerne and Lake Maggiore' },
      { icon: 'wine', text: 'Wine tasting in the Lavaux vineyards' },
      { icon: 'ticket', text: 'Entrance fees for every visit on the itinerary' },
      {
        icon: 'gratuity',
        text: 'Gratuities for guides, drivers and hotel staff on included services',
      },
    ],
    excluded: [
      { icon: 'plane', text: 'International flights to Zurich and from Milan' },
      { icon: 'shield', text: 'Travel insurance, which we strongly recommend' },
      { icon: 'glass', text: 'Meals and drinks not listed as included' },
      { icon: 'sparkle', text: 'Optional activities and personal expenses' },
      { icon: 'passport', text: 'Passport and visa fees' },
    ],
    payment: [
      { icon: 'card', text: 'A deposit of $2,500 per person holds your place.' },
      { icon: 'clock', text: 'The balance is due 120 days before departure.' },
      {
        icon: 'calendar',
        text: 'Booked within 120 days of departure, the full price is due when you book.',
      },
      {
        icon: 'cancel',
        text: 'Cancellation charges rise as the departure nears; see the Booking Terms.',
      },
    ],
  },

  /*
   * Italy Uncovered runs on from Swiss Elegance: each departure that joins
   * one of Swiss Elegance's starts in Bologna on the day Swiss Elegance ends
   * in Milan, and the price for both together is the same on both pages.
   * The April departure is Italy Uncovered on its own.
   */
  'the-italian-experience': {
    sample: true,
    currency: 'USD',
    departures: [
      {
        start: '2027-04-18',
        end: '2027-04-26',
        price: '$11,250',
        single: '$3,250',
        availability: 'available',
        notes: [
          'Italy Uncovered on its own; Swiss Elegance does not run before this departure.',
          'Spring in Emilia-Romagna, before the summer crowds in Venice.',
        ],
      },
      {
        start: '2027-05-28',
        end: '2027-06-05',
        price: '$11,250',
        single: '$3,250',
        withExtension: '$25,400',
        availability: 'available',
        guaranteed: true,
        notes: ['Continues from the Swiss Elegance departure of May 16, 2027.'],
      },
      {
        start: '2027-06-25',
        end: '2027-07-03',
        price: '$11,650',
        single: '$3,450',
        withExtension: '$26,200',
        availability: 'limited',
        placesLeft: 3,
        guaranteed: true,
        notes: ['Continues from the Swiss Elegance departure of June 13, 2027.'],
      },
      {
        start: '2027-09-17',
        end: '2027-09-25',
        price: '$11,650',
        single: '$3,450',
        withExtension: '$26,200',
        availability: 'available',
        notes: [
          'Continues from the Swiss Elegance departure of September 5, 2027.',
          'Harvest time in the Valpolicella vineyards.',
        ],
      },
      {
        start: '2027-10-08',
        end: '2027-10-16',
        price: '$11,250',
        single: '$3,250',
        withExtension: '$25,400',
        availability: 'available',
        notes: [
          'Continues from the Swiss Elegance departure of September 26, 2027, which has a waitlist; Italy Uncovered alone has places.',
        ],
      },
      {
        start: '2028-06-02',
        end: '2028-06-10',
        price: '$11,650',
        single: '$3,450',
        withExtension: '$26,400',
        availability: 'available',
        notes: ['Continues from the Swiss Elegance departure of May 21, 2028.'],
      },
      {
        start: '2028-06-30',
        end: '2028-07-08',
        price: '$11,950',
        single: '$3,550',
        withExtension: '$26,900',
        availability: 'available',
        notes: ['Continues from the Swiss Elegance departure of June 18, 2028.'],
      },
    ],
    priceNotes: [
      { icon: 'tag', text: 'Prices are per person in US dollars, sharing a double or twin room.' },
      {
        icon: 'single',
        text: 'The single supplement is added to the price for a room of one’s own.',
      },
      {
        icon: 'route',
        text: 'The price with Swiss Elegance covers both journeys together, from Lucerne to Venice, with a private transfer from Milan to Bologna between them.',
      },
      { icon: 'info', text: 'Prices are confirmed when you book and may change until then.' },
      {
        icon: 'group',
        text: 'A group departs with a minimum of 6 guests. A guaranteed departure runs whatever the number booked.',
      },
    ],
    included: [
      {
        icon: 'hotel',
        text: '8 nights at Grand Hotel Majestic già Baglioni, Quellenhof Luxury Resort Lazise and JW Marriott Venice Resort & Spa',
      },
      {
        icon: 'meal',
        text: 'Daily breakfast, 4 lunches and 5 dinners, including a welcome and a farewell dinner',
      },
      { icon: 'car', text: 'Private transfers throughout, including arrival and departure' },
      { icon: 'boat', text: 'Private water taxi to your island hotel in Venice' },
      { icon: 'guide', text: 'Private guiding and a Peaks2Shores journey director throughout' },
      {
        icon: 'meal',
        text: 'Tastings of Parmigiano Reggiano, Parma ham and Modena’s balsamic vinegar',
      },
      { icon: 'ticket', text: 'A private leather workshop visit in Bologna' },
      { icon: 'car', text: 'The Ferrari Museum and a Motor Valley visit' },
      { icon: 'boat', text: 'A guided walk and lake cruise in Sirmione' },
      {
        icon: 'wine',
        text: 'Amarone tasting and a wine-paired lunch in Valpolicella',
      },
      {
        icon: 'guide',
        text: 'A gondola workshop visit, a gondola ride and a bacari tour in Venice',
      },
      {
        icon: 'gratuity',
        text: 'Entrance fees, and gratuities for guides, drivers and hotel staff on included services',
      },
    ],
    excluded: [
      { icon: 'plane', text: 'International flights to Bologna and from Venice' },
      { icon: 'shield', text: 'Travel insurance, which we strongly recommend' },
      { icon: 'car', text: 'The optional Ferrari driving experience' },
      { icon: 'glass', text: 'Meals and drinks not listed as included' },
      { icon: 'sparkle', text: 'Spa treatments, optional activities and personal expenses' },
      { icon: 'passport', text: 'Passport and visa fees' },
    ],
    payment: [
      {
        icon: 'card',
        text: 'A deposit of $1,500 per person holds your place, or $2,500 with Swiss Elegance.',
      },
      { icon: 'clock', text: 'The balance is due 120 days before departure.' },
      {
        icon: 'calendar',
        text: 'Booked within 120 days of departure, the full price is due when you book.',
      },
      {
        icon: 'cancel',
        text: 'Cancellation charges rise as the departure nears; see the Booking Terms.',
      },
    ],
  },

  'adriatic-collection': {
    sample: true,
    currency: 'USD',
    departures: [
      {
        start: '2027-05-09',
        end: '2027-05-19',
        price: '$12,950',
        single: '$3,950',
        availability: 'available',
        guaranteed: true,
        notes: ['Early season: quiet Old Towns, and the islands before the summer.'],
      },
      {
        start: '2027-06-06',
        end: '2027-06-16',
        price: '$13,750',
        single: '$4,250',
        availability: 'limited',
        placesLeft: 2,
        guaranteed: true,
        notes: ['Early summer: the speedboat day to Hvar in the long June light.'],
      },
      {
        start: '2027-09-12',
        end: '2027-09-22',
        price: '$13,750',
        single: '$4,250',
        availability: 'waitlist',
        notes: ['Late summer: the warmest sea of the year, and the Istrian grape harvest.'],
      },
      {
        start: '2027-10-03',
        end: '2027-10-13',
        price: '$12,950',
        single: '$3,950',
        availability: 'available',
        notes: [
          'White truffle season in Istria.',
          'Days 5–7 at Le Méridien Grand Hotel Lav, near Split, in place of Hotel Ambasador.',
        ],
      },
      {
        start: '2028-05-14',
        end: '2028-05-24',
        price: '$13,250',
        single: '$3,950',
        availability: 'available',
      },
      {
        start: '2028-09-17',
        end: '2028-09-27',
        price: '$13,950',
        single: '$4,350',
        availability: 'available',
      },
    ],
    priceNotes: [
      { icon: 'tag', text: 'Prices are per person in US dollars, sharing a double or twin room.' },
      {
        icon: 'single',
        text: 'The single supplement is added to the price for a room of one’s own.',
      },
      {
        icon: 'route',
        text: 'The journey is one way, from Venice to Dubrovnik; we can arrange your flights home from Dubrovnik.',
      },
      { icon: 'info', text: 'Prices are confirmed when you book and may change until then.' },
      {
        icon: 'group',
        text: 'A group departs with a minimum of 6 guests. A guaranteed departure runs whatever the number booked.',
      },
    ],
    included: [
      {
        icon: 'hotel',
        text: '10 nights at JW Marriott Venice Resort & Spa, Grand Park Hotel Rovinj, Hotel Ambasador Split and Hotel Excelsior Dubrovnik',
      },
      {
        icon: 'meal',
        text: 'Daily breakfast, 5 lunches and 6 dinners, including a farewell dinner within Dubrovnik’s walls',
      },
      {
        icon: 'car',
        text: 'Private transfers throughout, including the coastal drive from Istria to Split',
      },
      { icon: 'boat', text: 'Private water taxi to your island hotel in Venice' },
      { icon: 'guide', text: 'Private guiding and a Peaks2Shores journey director throughout' },
      { icon: 'guide', text: 'A gondola workshop visit with Venice’s master craftsmen' },
      {
        icon: 'meal',
        text: 'A truffle hunt with a local hunter and his dog, and a countryside lunch in Istria',
      },
      { icon: 'wine', text: 'A private wine tasting at an Istrian vineyard' },
      { icon: 'ticket', text: 'An excursion to the waterfalls of Krka National Park' },
      {
        icon: 'boat',
        text: 'A private speedboat day to Hvar and the Pakleni Islands',
      },
      {
        icon: 'wine',
        text: 'A toast atop Mount Srđ, overlooking Dubrovnik and the Adriatic',
      },
      {
        icon: 'gratuity',
        text: 'Entrance fees, including Diocletian’s Palace and Dubrovnik’s walls, and gratuities on included services',
      },
    ],
    excluded: [
      { icon: 'plane', text: 'International flights to Venice and from Dubrovnik' },
      { icon: 'shield', text: 'Travel insurance, which we strongly recommend' },
      { icon: 'glass', text: 'Meals and drinks not listed as included' },
      { icon: 'sparkle', text: 'Optional activities and personal expenses' },
      { icon: 'passport', text: 'Passport and visa fees' },
    ],
    payment: [
      { icon: 'card', text: 'A deposit of $2,000 per person holds your place.' },
      { icon: 'clock', text: 'The balance is due 120 days before departure.' },
      {
        icon: 'calendar',
        text: 'Booked within 120 days of departure, the full price is due when you book.',
      },
      {
        icon: 'cancel',
        text: 'Cancellation charges rise as the departure nears; see the Booking Terms.',
      },
    ],
  },
};

export function ratesOf(slug: string): JourneyRates | undefined {
  return journeyRates[slug];
}
