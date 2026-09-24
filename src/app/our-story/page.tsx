import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { WhyUs } from '@/components/home/WhyUs';
import { FactList, SectionLabel, Tick } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { founder, pillars } from '@/lib/content';
import { enterAt } from '@/lib/motion';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Our story',
  description:
    'From the peaks of Switzerland to the shores of Miami. Marc Haeni founded Peaks2Shores in 2022 as the natural extension of a life spent travelling and returning.',
  path: '/our-story',
});

export default function OurStoryPage() {
  return (
    <>
      <section
        data-hero
        className="relative isolate grid overflow-hidden border-b border-line lg:grid-cols-2"
      >
        <Frame
          media="tr-1"
          priority
          reveal={false}
          drift
          decorative
          sizes="(min-width: 1024px) 50vw, 100vw"
          overlay="hero"
          className="min-h-[420px] lg:min-h-[760px]"
        />
        <div className="gutter flex flex-col justify-end gap-7 py-16 lg:justify-center lg:py-24 lg:pr-24">
          <p className="enter kicker m-0 flex items-center gap-3.5" style={enterAt(0.05)}>
            <Tick />
            {site.founder.name} · {site.founder.role}
          </p>
          <TextReveal
            as="h1"
            immediate
            delay={0.1}
            /* Half-column hero: the h2 scale keeps each line unbroken. */
            className="h2"
            lines={[
              { text: 'From the peaks' },
              { text: 'of Switzerland to' },
              { text: 'the shores of Miami.', italic: true },
            ]}
          />
        </div>
      </section>

      <section className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <SectionLabel className="lg:pt-4">The founder</SectionLabel>
        <Reveal>
          {founder.body.map((paragraph) => (
            <p key={paragraph} className="prose-body mb-5 max-w-[520px] text-[17px]">
              {paragraph}
            </p>
          ))}
        </Reveal>
        <Reveal delay={0.12} className="lg:pt-4">
          <blockquote className="lead m-0 max-w-[440px] border-l border-gorse pl-6 text-[26px]">
            “{founder.quote}”
          </blockquote>
          <FactList
            className="mt-10"
            rows={[
              { label: 'Born', value: 'Switzerland' },
              { label: 'Home', value: 'Miami, for more than 25 years' },
              { label: 'Founded', value: `Peaks2Shores, ${site.founded}` },
              { label: 'Group size', value: `Never more than ${site.maxGuests} guests` },
            ]}
          />
        </Reveal>
      </section>

      <section className="grid border-b border-line lg:grid-cols-2">
        <Frame
          media="marc-portrait"
          fit="contain"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-[420px] sm:min-h-[560px] lg:min-h-[820px]"
        />
        <Reveal
          direction="left"
          distance={24}
          className="gutter flex flex-col justify-center gap-7 py-20 lg:py-[100px] lg:pr-24"
        >
          <SectionLabel>Why it exists</SectionLabel>
          <h2 className="h3 max-w-[520px]">Peaks2Shores isn’t a personal brand. It’s a promise.</h2>
          <p className="prose-body max-w-[460px]">
            There is a real person behind every journey, and he has already been where you’re going.
            The name says the rest: peaks is where it began — the Alps, childhood, the outdoors.
            Shores is where it lives now — Miami, the ocean, a different light.
          </p>
          <ButtonLink href="/destinations" variant="rule" className="self-start">
            Where that takes us
          </ButtonLink>
        </Reveal>
      </section>

      <section className="gutter border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <div className="editorial-grid--wide mb-12 lg:mb-16">
          <SectionLabel className="lg:pt-3">How we travel</SectionLabel>
          <Reveal variant="mask">
            <h2 className="h3 max-w-[820px]">Four things every journey is held to.</h2>
          </Reveal>
        </div>

        <RevealGroup as="ul" className="grid list-none border-t border-line p-0 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <RevealItem
              as="li"
              key={pillar.n}
              distance={22}
              className="flex flex-col gap-4 border-b border-line py-10 pr-10 sm:odd:border-r sm:odd:pr-14 sm:even:pl-14"
            >
              <div className="kicker flex items-center gap-3">
                {pillar.n}
                <Tick className="w-[22px]" />
              </div>
              <h3 className="h4">{pillar.title}</h3>
              <p className="lead max-w-[420px] text-[20px]">{pillar.lead}</p>
              <p className="prose-body-sm max-w-[440px]">{pillar.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <WhyUs label="In practice" className="" />
    </>
  );
}
