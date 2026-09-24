import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { enterAt } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Something went off course',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="gutter editorial-grid min-h-[70svh] items-center pb-24 pt-32 md:pt-40">
      <SectionLabel className="enter lg:pt-4" style={enterAt(0)}>
        404
      </SectionLabel>
      <h1 className="h1 enter" style={enterAt(0.1)}>
        Something went off course.
      </h1>
      <div className="enter max-w-[440px] lg:pt-4" style={enterAt(0.24)}>
        <p className="prose-body mb-8">
          The page you were looking for isn’t here — it may have moved, or the link may have been
          mistyped. The journeys are all still where we left them.
        </p>
        <div className="flex flex-wrap items-center gap-7">
          <ButtonLink href="/" variant="ink">
            Return to the journey
          </ButtonLink>
          <ButtonLink href="/journeys" variant="rule">
            All journeys
          </ButtonLink>
        </div>
        <p className="kicker mt-10 flex items-center gap-3">
          <Tick />
          Fewer, better journeys.
        </p>
      </div>
    </section>
  );
}
