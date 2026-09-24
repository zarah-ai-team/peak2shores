import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import type { ItineraryDay } from '@/lib/journeys';
import { ItineraryRail } from './ItineraryRail';

/**
 * Day by day.
 *
 * The days are ordinary server-rendered articles. Only the contents rail is
 * a client component — it watches which day is in view and slides an acqua
 * hairline down to it. On mobile the rail collapses away entirely and the
 * days simply read down the page, which is what you want on a phone.
 */
export function Itinerary({ days, headline }: { days: ItineraryDay[]; headline: string }) {
  return (
    <section
      id="days"
      className="gutter grid gap-10 border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px] lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-14"
    >
      <div className="self-start lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
        <SectionLabel className="mb-6">Day by day</SectionLabel>
        <h2 className="h4 mb-8">{headline}</h2>

        <ItineraryRail days={days.map((day) => ({ n: day.n, title: day.title }))} />

        <p className="mt-7 flex items-center gap-2.5 font-ui text-[12px] font-light leading-[1.6] text-muted">
          <Tick className="w-[18px]" />
          Free time is deliberate. It’s the point.
        </p>
      </div>

      <div className="flex flex-col">
        {days.map((day) => (
          <Reveal
            key={day.n}
            id={`day-${day.n}`}
            as="article"
            className="grid gap-6 border-t border-line py-10 lg:grid-cols-[minmax(0,104px)_minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8 lg:py-12"
          >
            <div>
              <div className="kicker mb-2">Day {day.n}</div>
              <div className="font-ui text-[12px] font-normal leading-[1.5] text-body">
                {day.where}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-display text-[clamp(24px,2.4vw,30px)] leading-[1.15] tracking-[-0.01em]">
                {day.title}
              </h3>
              <p className="prose-body mb-4 max-w-[520px] text-[15px]">{day.body}</p>
              <div className="flex flex-wrap gap-x-7 gap-y-2 font-ui text-[11px] uppercase leading-[1.6] tracking-[0.14em] text-muted">
                <span>Stay · {day.stay}</span>
                <span className={day.free.startsWith('Entire') ? 'text-acqua-text' : undefined}>
                  {day.free}
                </span>
              </div>
            </div>

            <Frame
              media={day.media}
              sizes="(min-width: 1024px) 25vw, 100vw"
              className="aspect-[4/3]"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
