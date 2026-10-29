import { site } from '@/lib/site';

export type FaqItem = { question: string; answer: string };

/*
 * The FAQ, worded as in the launch brief (28 Oct). Questions whose answer is
 * still a [placeholder] for Marc are left out until he supplies it, never
 * published half-written:
 *   journeys — "What is included?" (meals and other inclusions per journey),
 *              "How active is the journey?" (pace and walking per journey);
 *   plan     — "How far ahead should I plan?" (lead time).
 * "Can I combine Swiss Elegance with The Italian Experience?" belongs on
 * those two journey pages only, and goes in when they are on the site.
 */

/** On every journey page, under Dates & Rates. */
export const journeyFaq: FaqItem[] = [
  {
    question: 'How many guests travel on each journey?',
    answer: `No more than ${site.maxGuests}, so every table, boat and doorway works for the whole group.`,
  },
  {
    question: 'Are international flights included?',
    answer:
      'No. International flights are not included; we’re happy to advise on the best connections.',
  },
  {
    question: 'Is Marc on every journey?',
    answer:
      'Marc personally curates every journey and hosts selected departures, marked “Hosted by Marc”.',
  },
  {
    question: 'Can I travel on my own dates?',
    answer:
      'Yes. Any journey can become a private journey for your family or friends, with the same hotels and the same people on the ground.',
  },
  {
    question: 'Do I need travel insurance?',
    answer: 'Yes. Comprehensive travel insurance is required. Details are in our Booking Terms.',
  },
  {
    question: 'How do I reserve a place?',
    answer: `Choose Reserve Your Place, or write to ${site.email}. A deposit holds your place; see Booking Terms for the payment schedule.`,
  },
];

/** At the end of the Plan Your Journey page. */
export const planFaq: FaqItem[] = [
  {
    question: 'How does planning a private journey work?',
    answer:
      'Tell us a little about who’s traveling and when. Marc calls you, and we design the journey around you.',
  },
  {
    question: 'Can you arrange cruises, villas and sporting events?',
    answer:
      'Yes. Tell us what you have in mind in the form, and we’ll shape it around the way you like to travel.',
  },
  {
    question: 'Does sending an inquiry commit me to anything?',
    answer: 'No. Inquiring holds nothing and commits you to nothing.',
  },
];
