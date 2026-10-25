import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { MetaItem, SectionLabel, Tick } from '@/components/ui/Editorial';
import type { ItineraryDay } from '@/lib/content';
import { ExpandAll } from './ExpandAll';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Itinerary — the day by day, A&K-style: one row per day that opens in place.
 *
 * Each day is a native <details>, so it opens without JavaScript, by keyboard,
 * and with the browser's find-in-page; only "Expand all" is a client island.
 * The first day starts open, so the reader sees what a day holds before
 * choosing whether to open the rest. Inside: the photograph, the day, where
 * we sleep and the free time.
 *
 * `compact` (a journey in preparation): the working plan, every third day
 * pictured — a plan, not a brochure.
 */
export function Itinerary({
  days,
  headline,
  variant = 'full',
  kicker = 'Itinerary',
}: {
  days: ItineraryDay[];
  headline: string;
  variant?: 'full' | 'compact';
  kicker?: string;
}) {
  const compact = variant === 'compact';

  return (
    <section id="itinerary" aria-labelledby="itinerary-title" className="py-section-sm">
      <div className="container-site grid-site gap-y-block">
        <div className="col-span-4 self-start md:col-span-8 lg:sticky lg:top-[calc(var(--nav-h-compact)+96px)] lg:col-span-4">
          <SectionLabel className="mb-stack">{kicker}</SectionLabel>
          <Reveal variant="mask">
            <h2 id="itinerary-title" className="h3 mb-stack max-w-[16ch]">
              {headline}
            </h2>
          </Reveal>
          <p className="prose-body-sm flex items-center gap-3">
            <Tick className="w-[18px]" />
            Free time is deliberate. It’s the point.
          </p>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-8">
          <div className="mb-4 flex justify-end">
            <ExpandAll target="itinerary-days" />
          </div>
          <ol id="itinerary-days" className="m-0 list-none border-t border-ink p-0">
            {days.map((day, i) => {
              const pictured = !compact || day.n % 3 === 1;
              return (
                <li key={day.n} id={`day-${day.n}`} className="border-b border-line">
                  <details className="journey-day group/day" open={i === 0}>
                    <summary className="grid cursor-pointer list-none grid-cols-[72px_minmax(0,1fr)_24px] items-baseline gap-x-4 py-6 md:grid-cols-[96px_minmax(0,1fr)_24px]">
                      <span className="kicker text-acqua-text">Day {pad(day.n)}</span>
                      <span>
                        <span className="kicker-sm mb-1.5 block">{day.where}</span>
                        <span className="h5 block transition-colors duration-300 group-hover/day:text-acqua-text">
                          {day.title}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="day-toggle relative block size-4 self-center justify-self-end"
                      />
                    </summary>
                    <div className="grid gap-x-8 gap-y-6 pb-8 md:grid-cols-[96px_minmax(0,1fr)]">
                      <div aria-hidden className="hidden md:block" />
                      <div className={pictured ? 'grid gap-8 lg:grid-cols-2 lg:items-start' : ''}>
                        {pictured && (
                          <Frame
                            ratio="3/2"
                            media={day.media}
                            sizes="(min-width: 1024px) 28vw, (min-width: 768px) 60vw, 100vw"
                          />
                        )}
                        <div>
                          <p className="prose-body measure mb-stack">{day.body}</p>
                          <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-4">
                            <MetaItem label="Overnight">{day.stay}</MetaItem>
                            <MetaItem label="Free time">
                              <span
                                className={day.free.startsWith('Entire') ? 'text-acqua-text' : ''}
                              >
                                {day.free}
                              </span>
                            </MetaItem>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
