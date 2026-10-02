import { liveJourneys } from '@/lib/journeys';
import { site } from '@/lib/site';

/* Rebuilt hourly, with the journeys, so a released journey is listed on time. */
export const revalidate = 3600;

/**
 * /llms.txt — a short, plain summary of the business for AI assistants, with
 * links to the pages that answer most questions. Assembled from the same data
 * as the site, so it is never out of step with it.
 */
export function GET() {
  const journeys = liveJourneys();
  const url = (path: string) => `${site.url}${path}`;

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} (${site.legalName}) designs small-group luxury journeys of no more than ${site.maxGuests} guests, ` +
      `each personally curated by founder ${site.founder.name}, plus private journeys on the traveller's own dates. ` +
      `Based in ${site.locations.replace(' · ', ' and ')}. Founded ${site.founded}. ` +
      'Prices are per person in US dollars. Enquiring commits the traveller to nothing.',
    '',
    '## Journeys',
    '',
    ...journeys.map(
      (j) =>
        `- [${j.title}](${url(`/journeys/${j.slug}`)}): ${j.country}, ${j.region}. ${j.days} days, ` +
        `departs ${j.departureWindow}, from ${j.priceFrom} per person, maximum ${j.groupMax} guests` +
        `${j.hostedByMarc ? ', hosted by Marc' : ''}${j.status && j.status !== 'open' ? ` (${j.status.replace('-', ' ')})` : ''}. ${j.lead}`,
    ),
    '',
    '## Key pages',
    '',
    `- [All journeys](${url('/journeys')}): the current list, filterable by destination, season and who it suits`,
    `- [Destinations](${url('/destinations')}): the countries the journeys go to`,
    `- [Experiences](${url('/experiences')}): what a day on a journey can hold`,
    `- [Our story](${url('/our-story')}): ${site.founder.name} and the philosophy behind the journeys`,
    `- [Plan your journey](${url('/plan')}): enquire about a journey or a private trip`,
    `- [Journal](${url('/journal')}): notes on places, hotels and tables`,
    '',
    '## Contact',
    '',
    `- Email: ${site.email}`,
    ...(site.phone ? [`- Phone: ${site.phone}`] : []),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
