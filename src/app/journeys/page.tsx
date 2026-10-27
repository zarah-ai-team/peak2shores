import { JourneyExplorer } from '@/components/journeys/JourneyExplorer';
import { DarkCta } from '@/components/ui/DarkCta';
import { PageTitle } from '@/components/ui/Editorial';
import { getJourneySummaries, getSiteSettings, pageMetadata } from '@/lib/content';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Small Luxury Group Journeys',
  description:
    'Intimate journeys for never more than 18 guests — exceptional places, meaningful experiences and the joy of discovering the world together, each one somewhere Marc Haeni knows well.',
  path: '/journeys',
});

export default async function JourneysPage() {
  // Summaries only: the itineraries never need to cross to the browser.
  const [journeys, site] = await Promise.all([getJourneySummaries(), getSiteSettings()]);

  return (
    <>
      <PageTitle kicker="Small Luxury Group Journeys" title="A short list, on purpose.">
        Intimate journeys for never more than {site.maxGuests} guests, bringing together exceptional
        places, meaningful experiences and the joy of discovering the world together.{' '}
        {journeys.length} on the calendar, each one somewhere Marc knows well.
      </PageTitle>

      <JourneyExplorer journeys={journeys} />

      <DarkCta
        kicker="Private travel"
        headline="Or a journey with only your names on the list."
        body="Families, friends, a milestone. The same hotels, the same people on the ground, on your dates. Start with a conversation, not a form."
        href="/plan#private"
        cta="Plan your journey"
      />
    </>
  );
}
