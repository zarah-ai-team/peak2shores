import { JourneyExplorer } from '@/components/journeys/JourneyExplorer';
import { DarkCta } from '@/components/ui/DarkCta';
import { PageTitle } from '@/components/ui/Editorial';
import { getJourneySummaries, getSiteSettings, pageMetadata } from '@/lib/content';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Journeys',
  description:
    'A short list, on purpose. Small-group luxury journeys of no more than 18 guests, each one somewhere Marc Haeni knows well.',
  path: '/journeys',
});

export default async function JourneysPage() {
  // Summaries only: the itineraries never need to cross to the browser.
  const [journeys, site] = await Promise.all([getJourneySummaries(), getSiteSettings()]);

  return (
    <>
      <PageTitle kicker="Journeys" title="A short list, on purpose.">
        {journeys.length} journeys on the calendar. Each limited to {site.maxGuests} guests, each
        one somewhere Marc knows well. If nothing here fits, we also design private journeys.
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
