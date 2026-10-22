import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { MetaItem, SectionLabel, Tick } from '@/components/ui/Editorial';
import type { ItineraryDay } from '@/lib/content';
import { ItineraryRail } from './ItineraryRail';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Day by day — the journey page's signature block.
 *
 * The days are ordinary server-rendered articles. Only the contents rail is a
 * client component: it watches which day is in view and slides a water-blue
 * hairline down to it. On a phone the rail is hidden and the days simply read
 * down the page.
 *
 * `full` (a written journey): rail in the first three columns, days in the
 * last nine, the photograph alternating between a 3/2 landscape across the
 * day (odd days) and a 4/5 portrait beside its text (even days).
 * `compact` (a journey in preparation): the working plan as a ruled list,
 * with a photograph only on every third day — a plan, not a brochure.
 */
export function Itinerary({
  days,
  headline,
  variant = 'full',
  kicker = 'Day by day',
}: {
  days: ItineraryDay[];
  headline: string;
  variant?: 'full' | 'compact';
  kicker?: string;
}) {
  if (variant === 'compact')
    return <CompactItinerary days={days} headline={headline} kicker={kicker} />;

  return (
    <section id="days" aria-labelledby="days-title" className="py-section">
      <div className="container-site grid-site gap-y-block">
        <div className="col-span-4 self-start md:col-span-8 lg:sticky lg:top-[calc(var(--nav-h)+32px)] lg:col-span-3">
          <SectionLabel className="mb-stack">{kicker}</SectionLabel>
          <h2 id="days-title" className="h3 mb-block">
            {headline}
          </h2>

          <ItineraryRail days={days.map((day) => ({ n: day.n, title: day.title }))} />

          <p className="prose-body-sm mt-7 flex items-center gap-3">
            <Tick className="w-[18px]" />
            Free time is deliberate. It’s the point.
          </p>
        </div>

        <div className="col-span-4 flex flex-col md:col-span-8 lg:col-span-9">
          {days.map((day) => {
            const portrait = day.n % 2 === 0;
            return (
              <Reveal
                key={day.n}
                id={`day-${day.n}`}
                as="article"
                className="border-t border-line py-block first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-block"
              >
                <div className={portrait ? 'grid gap-8 md:grid-cols-2 md:items-end lg:gap-10' : ''}>
                  <div className={portrait ? 'md:order-1' : ''}>
                    <p className="kicker mb-4">
                      Day {pad(day.n)} · {day.where}
                    </p>
                    <h3 className="h4 mb-stack max-w-[22ch]">{day.title}</h3>
                    {!portrait && (
                      <Frame
                        ratio="3/2"
                        media={day.media}
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className="mb-stack "
                      />
                    )}
                    <p className="prose-body measure mb-stack">{day.body}</p>
                    <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-4">
                      <MetaItem label="Stay">{day.stay}</MetaItem>
                      <MetaItem label="Free time">
                        <span className={day.free.startsWith('Entire') ? 'text-acqua-text' : ''}>
                          {day.free}
                        </span>
                      </MetaItem>
                    </div>
                  </div>
                  {portrait && (
                    <Frame
                      ratio="4/5"
                      media={day.media}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className=" md:order-2"
                    />
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CompactItinerary({
  days,
  headline,
  kicker,
}: {
  days: ItineraryDay[];
  headline: string;
  kicker: string;
}) {
  return (
    <section id="days" aria-labelledby="days-title" className="pb-section">
      <div className="container-site">
        <div className="rule grid-site gap-y-stack pt-section-sm">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <SectionLabel className="mb-stack">{kicker}</SectionLabel>
            <h2 id="days-title" className="h3 max-w-[18ch]">
              {headline}
            </h2>
          </div>
          <ol className="col-span-4 m-0 list-none p-0 md:col-span-8 lg:col-span-8">
            {days.map((day) => {
              const pictured = day.n % 3 === 1;
              return (
                <Reveal
                  as="li"
                  key={day.n}
                  id={`day-${day.n}`}
                  distance={12}
                  className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line py-7 md:grid-cols-8"
                >
                  <p className="kicker md:col-span-2">
                    Day {pad(day.n)}
                    <span className="mt-1.5 block normal-case tracking-normal">{day.where}</span>
                  </p>
                  <div className={pictured ? 'md:col-span-3' : 'md:col-span-6'}>
                    <h3 className="h5 mb-2">{day.title}</h3>
                    <p className="prose-body-sm measure">{day.body}</p>
                    <p className="kicker-sm mt-3">
                      Stay · {day.stay} <span aria-hidden>·</span> {day.free}
                    </p>
                  </div>
                  {pictured && (
                    <Frame
                      ratio="3/2"
                      media={day.media}
                      sizes="(min-width: 1024px) 22vw, (min-width: 768px) 40vw, 100vw"
                      className=" md:col-span-3"
                    />
                  )}
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
