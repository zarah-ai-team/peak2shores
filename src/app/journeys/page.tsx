import { JourneyExplorer } from '@/components/journeys/JourneyExplorer';
import { DarkCta } from '@/components/ui/DarkCta';
import { PageTitle } from '@/components/ui/Editorial';
import { journeys, toSummary } from '@/lib/journeys';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Journeys',
  description:
    'A short list, on purpose. Small-group luxury journeys of no more than 18 guests, each one somewhere Marc Haeni knows well.',
  path: '/journeys',
});

export default function JourneysPage() {
  return (
    <>
      <PageTitle kicker="Journeys" title="A short list, on purpose.">
        {journeys.length} journeys this year. Each limited to 18 guests, each one somewhere Marc
        knows well. If nothing here fits, we also design private journeys.
      </PageTitle>

      {/* Summaries only: the itineraries never need to cross to the browser. */}
      <JourneyExplorer journeys={journeys.map(toSummary)} />

      <DarkCta
        kicker="Private travel"
        headline="Or a journey with only your names on the list."
        body="Families, friends, a milestone. The same hotels, the same people on the ground, on your dates. Start with a conversation, not a form."
        href="/plan"
        cta="Plan your journey"
      />
    </>
  );
}
