import { availabilityText } from '@/lib/availability';
import { getJourneys, getSiteSettings } from '@/lib/content';
import { fromPriceLabel } from '@/lib/journeyPrice';
import { journeyAvailabilityOf } from '@/lib/journeys';

/* Rebuilt hourly, with the journeys, so a released journey is listed on time. */
export const revalidate = 3600;

/**
 * /llms.txt — a short, plain summary of the business for AI assistants, with
 * links to the pages that answer most questions. Assembled from the same data
 * as the site, so it is never out of step with it.
 */
export async function GET() {
  const [site, journeys] = await Promise.all([getSiteSettings(), getJourneys()]);
  const url = (path: string) => `${site.url}${path}`;
  /** The journey's price line as the site shows it, in the middle of a sentence. */
  const price = (j: (typeof journeys)[number]) => {
    const label = fromPriceLabel(j);
    return label.charAt(0).toLowerCase() + label.slice(1);
  };

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} (${site.legalName}) designs small luxury group journeys for intimate groups of travelers, ` +
      `each personally curated by founder ${site.founder.name}, plus private journeys on the traveler's own dates. ` +
      `Based in Miami, with Swiss roots. Founded ${site.founded}. ` +
      `Group journeys are designed for ${site.groupSize}. ` +
      'Each departure shows its status: Booking Now while its group comes together, Guaranteed once 10 guests have confirmed, Sold Out at 18. ' +
      'Prices are per person in US dollars. Inquiring commits the traveler to nothing.',
    '',
    '## Journeys',
    '',
    ...journeys.map(
      (j) =>
        `- [${j.title}](${url(`/journeys/${j.slug}`)}): ${j.country}, ${j.region}. ${j.days} days, ` +
        `${j.departureISO ? `departs ${j.departureWindow}` : 'dates to be announced'}, ${price(j)}, ${site.groupSize}` +
        `${j.hostedByMarc ? ', hosted by Marc' : ''}, ${j.status === 'past' ? 'departed' : availabilityText(journeyAvailabilityOf(j))}. ${j.lead}`,
    ),
    '',
    '## Key pages',
    '',
    `- [All journeys](${url('/journeys')}): the current list of journeys`,
    `- [Destinations](${url('/destinations')}): the countries the journeys go to`,
    `- [Experiences](${url('/experiences')}): what a day on a journey can hold`,
    `- [Our story](${url('/our-story')}): ${site.founder.name} and the philosophy behind the journeys`,
    `- [Plan your journey](${url('/plan')}): inquire about a journey or a private trip`,
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
