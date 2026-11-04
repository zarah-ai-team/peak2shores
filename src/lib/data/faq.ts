import { site } from '@/lib/site';

export type FaqItem = { question: string; answer: string };

/*
 * The FAQ, worded as in the launch brief (28 Oct). Questions whose answer is
 * still a [placeholder] for Marc are left out until he supplies it, never
 * published half-written:
 *   journeys — "What is included?" (meals and other inclusions per journey),
 *              "How active is the journey?" (pace and walking per journey);
 *   plan     — "How far ahead should I plan?" (lead time).
 * "Can I combine Swiss Elegance with Italy Uncovered?" belongs on
 * those two journey pages only, and goes in when they are on the site.
 */

/** On every journey page, under Dates & Rates. */
export const journeyFaq: FaqItem[] = [
  {
    question: 'How large is the group?',
    answer:
      'Small by design: few enough that every table, boat and doorway works for the whole group, and everyone knows each other by the second evening.',
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
    question: 'How do I request details?',
    answer: `Choose Request details, or write to ${site.email}. A deposit holds your place; see Booking Terms for the payment schedule.`,
  },
];

/** At the end of the Plan Your Journey page. */
export const planFaq: FaqItem[] = [
  {
    question: 'How does planning a private journey work?',
    answer:
      'Tell us a little about who’s traveling and when. Our team will be in touch, and we design the journey around you.',
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

/**
 * "Good to know" on the Journeys page: the questions Ishika drafted (3 Nov)
 * that already have an answer. The rest of her list waits for Marc's picks
 * and his answers to the [bracketed] parts.
 */
export const journeysFaq: FaqItem[] = [
  {
    question: 'How large are the groups?',
    answer:
      'Small and intimate by design: a circle of like-minded travelers, close enough for a more personal and connected travel experience.',
  },
  {
    question: 'What is the pace like?',
    answer:
      'Beautifully balanced: extraordinary discoveries, memorable experiences and time to truly enjoy each destination.',
  },
  {
    question: 'What’s included?',
    answer:
      'It varies by journey, so each journey page lists exactly what’s included: handpicked hotels, private transfers, expert local guides, culinary discoveries and curated experiences.',
  },
  {
    question: 'Can I travel Italy Uncovered on its own?',
    answer:
      'Yes. Italy Uncovered can be traveled as a journey of its own, or joined right after Swiss Elegance, Italian Lakes & Milanese Flair.',
  },
  {
    question: 'Can you arrange a private version?',
    answer:
      'Yes. Families, friends, a milestone — the same hotels and the same people on the ground, on your own dates.',
  },
  {
    question: 'When will dates and prices be announced?',
    answer:
      'Departure dates and rates are being finalized. Join The Circle to be among the first to hear.',
  },
];
