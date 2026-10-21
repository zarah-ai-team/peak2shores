import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { Frame } from '@/components/ui/Frame';
import { enterAt } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Something went off course',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[78svh] items-center pb-section-sm pt-section-sm">
      <div className="grid-site w-full items-end gap-y-10">
        <div className="col-span-full lg:col-span-9">
          <SectionLabel as="p" className="enter m-0 mb-8" style={enterAt(0)}>
            404
          </SectionLabel>
          <h1 className="h1 enter m-0 max-w-[14ch]" style={enterAt(0.1)}>
            Something went off course.
          </h1>
          <div className="enter mt-block md:max-w-[480px]" style={enterAt(0.24)}>
            <p className="prose-body mb-8">
              The page you were looking for isn’t here — it may have moved, or the link may have
              been mistyped. The journeys are all still where we left them.
            </p>
            <div className="flex flex-wrap items-center gap-x-9 gap-y-2">
              <ButtonLink href="/journeys" variant="rule" arrow>
                All journeys
              </ButtonLink>
              <ButtonLink href="/" variant="rule">
                Home
              </ButtonLink>
            </div>
            <p className="kicker mt-10 flex items-center gap-3">
              <Tick />
              Fewer, better journeys.
            </p>
          </div>
        </div>
        <Frame
          media="not-found"
          ratio="3/4"
          decorative
          sizes="(min-width: 1024px) 22vw, 0px"
          className="hidden lg:col-span-3 lg:col-start-10 lg:block"
        />
      </div>
    </section>
  );
}
