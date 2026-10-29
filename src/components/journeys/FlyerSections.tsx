import Image from 'next/image';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import type { Journey, JourneyFlyer } from '@/lib/content';
import { site } from '@/lib/site';

/*
 * A journey as Marc's flyer lays it out (launch brief): the intro and what
 * every journey includes, the itinerary by stay, and the hotels by place.
 * Copy is Marc's own; nothing here adds to it.
 */

/* -- Overview -------------------------------------------------------------- */

export function FlyerOverview({ journey, flyer }: { journey: Journey; flyer: JourneyFlyer }) {
  return (
    <section aria-labelledby="overview-title" className="py-section">
      <div className="container-site grid-site gap-y-block">
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <SectionLabel className="mb-stack">The journey</SectionLabel>
          <Reveal variant="mask">
            <h2 id="overview-title" className="h2 mb-stack max-w-[20ch]">
              {journey.lead}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="prose-body measure mb-stack">{journey.blurb}</p>
            <ButtonLink href="#itinerary" variant="rule" arrow>
              Itinerary
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal
          delay={0.15}
          className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:pt-12"
        >
          <h2 className="kicker mb-4 border-t border-line pt-6">The Peaks2Shores Experience</h2>
          <ul className="m-0 list-none p-0">
            {flyer.included.map((item) => (
              <li
                key={item}
                className="prose-body flex items-center gap-3 border-b border-line py-3"
              >
                <Tick className="w-[16px] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** Marc's two lines on the journey. Shown only once he has approved them. */
export function FlyerNote({ flyer }: { flyer: JourneyFlyer }) {
  if (!flyer.marcNote?.approved) return null;
  return (
    <section aria-labelledby="marc-title" className="bg-stone py-section-sm">
      <div data-tone="stone" className="container-site grid-site gap-y-block">
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-8">
          <SectionLabel
            as="h2"
            id="marc-title"
            tone="stone"
            className="mb-block flex items-center gap-3.5"
          >
            <Tick />A note from Marc
          </SectionLabel>
          <blockquote className="quote m-0 max-w-[30ch]">“{flyer.marcNote.quote}”</blockquote>
        </Reveal>
        <Reveal
          delay={0.12}
          className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-end justify-center overflow-hidden rounded-full bg-white">
              <Image
                src="/brand/marc.webp"
                alt={`${site.founder.name}, founder of ${site.name}`}
                width={1150}
                height={1400}
                sizes="56px"
                className="mb-[-0.5rem] h-auto w-14"
              />
            </div>
            <p className="m-0">
              <span className="h5 block">{site.founder.name}</span>
              <span className="kicker-sm">Founder, {site.name}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The journey this one continues into (or follows), as a box with a way through. */
export function FlyerLink({ flyer }: { flyer: JourneyFlyer }) {
  const link = flyer.link;
  if (!link) return null;
  return (
    <section aria-labelledby="continue-title" className="pb-section-sm">
      <div className="container-site">
        <Reveal className="grid-site gap-y-6 border border-line bg-panel p-[clamp(24px,4vw,56px)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <p className="kicker mb-4 !text-acqua-text">{link.kicker}</p>
            <h2 id="continue-title" className="h3 mb-3">
              {link.title}
            </h2>
            <p className="kicker-sm mb-stack">{link.places}</p>
            <p className="prose-body measure m-0">{link.text}</p>
          </div>
          <div className="col-span-4 self-end md:col-span-8 lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <ButtonLink href={`/journeys/${link.slug}`} variant="rule" arrow>
              {link.cta}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -- Itinerary, by stay ---------------------------------------------------- */

export function FlyerItinerary({ flyer }: { flyer: JourneyFlyer }) {
  return (
    <section id="itinerary" aria-labelledby="itinerary-title" className="py-section-sm">
      <div className="container-site">
        <SectionLabel className="mb-stack">Itinerary</SectionLabel>
        <Reveal variant="mask" className="mb-block">
          <h2 id="itinerary-title" className="h2 max-w-[22ch]">
            Stay by stay.
          </h2>
        </Reveal>

        {flyer.parts.map((part, p) => (
          <div key={part.title ?? p} className="mb-section-sm last:mb-0">
            {part.title && (
              <Reveal className="mb-block border-t border-ink pt-6">
                <h3 className="h3 m-0">{part.title}</h3>
                {part.subtitle && <p className="kicker mt-2.5 mb-0">{part.subtitle}</p>}
              </Reveal>
            )}
            <ol className="m-0 grid list-none gap-x-10 gap-y-14 p-0 md:grid-cols-2">
              {part.stays.map((stay) => (
                <Reveal as="li" key={stay.place} distance={16}>
                  <article aria-label={stay.place}>
                    {stay.media && (
                      <Frame
                        ratio="3/2"
                        media={stay.media}
                        sizes="(min-width: 768px) 45vw, 100vw"
                        className="mb-6"
                      />
                    )}
                    <h4 className="h4 mb-2">
                      {stay.place}
                      {stay.nights && (
                        <span className="text-muted">
                          {' '}
                          · {stay.nights} {stay.nights === 1 ? 'night' : 'nights'}
                        </span>
                      )}
                    </h4>
                    <p className="lead mb-5 !text-body">{stay.tagline}</p>
                    <p className="kicker-sm mb-3">What you’ll do</p>
                    <ul className="m-0 list-none border-t border-line p-0">
                      {stay.doing.map((line) => (
                        <li key={line} className="prose-body-sm border-b border-line py-3">
                          {line}
                        </li>
                      ))}
                    </ul>
                    {stay.moment && (
                      <div className="mt-5 bg-panel p-5">
                        <p className="kicker mb-2 !text-acqua-text">A Peaks2Shores moment</p>
                        <p className="prose-body-sm m-0">{stay.moment}</p>
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -- Stays: the hotels, by place ------------------------------------------- */

export function FlyerStays({ flyer }: { flyer: JourneyFlyer }) {
  return (
    <section id="stays" aria-labelledby="stays-title" className="bg-panel py-section-sm">
      <div className="container-site grid-site gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <SectionLabel className="mb-stack">Stays</SectionLabel>
          <Reveal variant="mask">
            <h2 id="stays-title" className="h2 max-w-[16ch]">
              Where you stay.
            </h2>
          </Reveal>
        </div>
        <ol className="col-span-4 m-0 list-none border-t border-ink p-0 md:col-span-8 lg:col-span-7 lg:col-start-6">
          {flyer.hotels.map((hotel) => (
            <li
              key={hotel.place}
              className="grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[160px_minmax(0,1fr)]"
            >
              <span className="kicker-sm self-center">{hotel.place}</span>
              <span>
                {hotel.url ? (
                  <a
                    href={hotel.url}
                    target="_blank"
                    rel="noopener"
                    className="h5 underline-offset-4 hover:underline"
                  >
                    {hotel.name}
                  </a>
                ) : (
                  <span className="h5">{hotel.name}</span>
                )}
                {hotel.credit && <span className="meta block text-muted">{hotel.credit}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
