import { site } from '@/lib/site';

export type FaqItem = { question: string; answer: string };

/** Marc's answer on group size (his review of 23 November 2026), word for word. */
const GROUPS =
  'Our journeys are designed for a minimum of 10 and a maximum of 18 guests. Small enough to feel personal, yet large enough to create a wonderful sense of shared discovery and connection.';

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
    answer: GROUPS,
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
    question: 'How do I request a place?',
    answer: `Choose Request your place on the journey’s page, or write to ${site.email}. Once the departure is guaranteed, a deposit secures your place; see the Booking Terms for the payment schedule.`,
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
 * that already have an answer, with Marc's own answers and his question on
 * the availability statuses (his review of 23 November 2026, sections 3D and
 * 4). The rest of her list waits for Marc's picks and his answers to the
 * [bracketed] parts.
 */
export const journeysFaq: FaqItem[] = [
  {
    question: 'How large are the groups?',
    answer: GROUPS,
  },
  {
    question: 'What do the different journey availability statuses mean?',
    answer:
      'Booking Now means reservations are open: places can be requested while the group comes together, and the departure is confirmed once 10 guests are reached. Guaranteed means it is confirmed to go ahead, and a deposit secures your place; Limited Availability beside it means only a few places remain. Sold Out means it has reached its maximum of 18 guests. Each journey’s page shows the status of every departure beside its dates.',
  },
  {
    question: 'What is the pace like?',
    answer:
      'Thoughtfully balanced. Each journey blends enriching discoveries and memorable experiences with time to slow down, explore independently and simply enjoy being there.',
  },
  {
    question: 'What’s included?',
    answer:
      'Every detail is thoughtfully considered. Depending on the journey, inclusions may feature exceptional accommodations, private transfers, expert local guides, distinctive culinary experiences and carefully curated activities. Full details are outlined on each journey page.',
  },
  {
    question: 'Can I travel Italy Uncovered on its own?',
    answer:
      'Yes. Italy Uncovered can be traveled as a journey of its own, or joined right after Swiss Elegance, Italian Lakes & Milanese Flair.',
  },
  {
    question: 'Can you arrange a private or customized journey?',
    answer:
      'Absolutely. Beyond our published journeys, we create beautifully tailored travel experiences shaped around your interests, aspirations and preferred dates. Whether you’re traveling with family, friends or as a private group, we’ll work with you to design a journey that is uniquely yours.',
  },
  {
    question: 'Will more journeys and departure dates be announced?',
    answer:
      'Absolutely. We’re continually developing new journeys and releasing additional departure dates. Join The Circle to be among the first to discover what’s coming next and receive our latest journey announcements and updates.',
  },
];
