import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { PhotoHero } from '@/components/ui/PhotoHero';
import { Section } from '@/components/ui/Section';
import { DarkCta } from '@/components/ui/DarkCta';
import { WhyUs } from '@/components/home/WhyUs';
import { FactList, Quote, SectionLabel, Tick } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { getPageContent, getSiteSettings, pageMetadata } from '@/lib/content';

export const metadata = pageMetadata({
  title: 'Our story',
  description:
    'From the peaks of Switzerland to the shores of Miami. Marc Haeni founded Peaks2Shores in 2022 as the natural extension of a life spent travelling and returning.',
  path: '/our-story',
});

/**
 * Our story: the split photographic opening, Marc on stone, why it exists,
 * the signature — the Peaks → Shores route as a ruled timeline of its four
 * stops (labels only, no new facts) — the four pillars as a typographic
 * grid, why travel with us, and the closing invitation.
 */
export default async function OurStoryPage() {
  const [{ founder, pillars }, { peaksToShores }, site] = await Promise.all([
    getPageContent('our-story'),
    getPageContent('destinations'),
    getSiteSettings(),
  ]);
  const [firstParagraph, ...otherParagraphs] = founder.body;

  return (
    <>
      <PhotoHero
        layout="split"
        media="home-hero-2"
        titleSize="h2"
        kicker={
          <span className="flex items-center gap-3.5">
            <Tick />
            {site.founder.name} · {site.founder.role}
          </span>
        }
        title={[
          { text: 'From the peaks' },
          { text: 'of Switzerland to' },
          { text: 'the shores of Miami.', italic: true },
        ]}
      />

      <Section ground="stone" pad="none" aria-labelledby="founder-title">
        <div className="grid-site gap-y-block">
          <Frame
            media="marc-portrait"
            fit="contain"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="col-span-4 min-h-[480px] md:col-span-6 md:col-start-2 lg:col-span-6 lg:col-start-1 lg:min-h-[720px]"
          />
          <div className="col-span-4 py-section-sm md:col-span-8 lg:col-span-5 lg:col-start-8 lg:self-center">
            <SectionLabel as="h2" id="founder-title" tone="stone" className="mb-stack">
              The founder
            </SectionLabel>
            <Reveal>
              <p className="lead measure-lead mb-stack">{firstParagraph}</p>
              {otherParagraphs.map((paragraph) => (
                <p key={paragraph} className="prose-body measure mb-block">
                  {paragraph}
                </p>
              ))}
            </Reveal>
            <Reveal delay={0.1}>
              <Quote className="mb-block">{founder.quote}</Quote>
              <FactList
                labelWidth={130}
                tone="stone"
                rowClassName="py-3.5"
                rows={[
                  { label: 'Born', value: 'Switzerland' },
                  { label: 'Home', value: 'Miami, for more than 25 years' },
                  { label: 'Founded', value: `Peaks2Shores, ${site.founded}` },
                  { label: 'Group size', value: `Never more than ${site.maxGuests} guests` },
                ]}
              />
            </Reveal>
          </div>
        </div>
      </Section>

      <Section aria-labelledby="why-exists-title">
        <div className="grid-site gap-y-block">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <SectionLabel className="mb-stack">Why it exists</SectionLabel>
            <Reveal variant="mask">
              <h2 id="why-exists-title" className="h2 max-w-[18ch]">
                Peaks2Shores isn’t a personal brand. It’s a promise.
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.1}
            className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
          >
            <p className="prose-body measure mb-stack">
              There is a real person behind every journey, and he has already been where you’re
              going. The name says the rest: peaks is where it began — the Alps, childhood, the
              outdoors. Shores is where it lives now — Miami, the ocean, a different light.
            </p>
            <ButtonLink href="/destinations" variant="rule" arrow>
              Where that takes us
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section ground="panel" pad="section-sm" aria-labelledby="route-title">
        <h2 id="route-title" className="kicker mb-block">
          {peaksToShores.headlineParts.join(' ')}
        </h2>
        <RevealGroup as="ol" className="m-0 grid list-none grid-cols-2 gap-y-10 p-0 lg:grid-cols-4">
          {peaksToShores.frames.map((frame, i) => (
            <RevealItem as="li" key={frame.label} distance={12} className="relative pr-4 pt-9">
              {/* The route: one ruled line, a brass stop at each place. */}
              <span aria-hidden className="absolute inset-x-0 top-[3px] h-px bg-line" />
              <span
                aria-hidden
                className={`status-mark absolute left-0 top-0 ${
                  i === 0 || i === peaksToShores.frames.length - 1 ? 'bg-gorse' : 'bg-acqua-deep'
                }`}
              />
              <span className="kicker-sm mb-2 block">
                {String(i + 1).padStart(2, '0')} · {frame.n}
              </span>
              <span className="h4 block">{frame.label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="prose-body measure mt-block">{peaksToShores.body}</p>
      </Section>

      <Section aria-labelledby="pillars-title">
        <div className="mb-block">
          <SectionLabel className="mb-stack">How we travel</SectionLabel>
          <Reveal variant="mask">
            <h2 id="pillars-title" className="h2 max-w-[20ch]">
              Four things every journey is held to.
            </h2>
          </Reveal>
        </div>
        <RevealGroup as="ul" className="m-0 grid list-none border-t border-line p-0 md:grid-cols-2">
          {pillars.map((pillar, i) => (
            <RevealItem
              as="li"
              key={pillar.n}
              distance={16}
              className={`grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 border-b border-line py-block md:gap-x-10 ${
                i % 2 === 0 ? 'md:border-r md:pr-10 lg:pr-16' : 'md:pl-10 lg:pl-16'
              }`}
            >
              <span aria-hidden className="numeral text-acqua-text">
                {pillar.n}
              </span>
              <div>
                <h3 className="h3 mb-4">{pillar.title}</h3>
                <p className="lead mb-4">{pillar.lead}</p>
                <p className="prose-body measure">{pillar.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <div aria-hidden className="container-site">
        <div className="rule" />
      </div>
      <WhyUs label="Why travel with us" />

      <DarkCta
        kicker="Plan your journey"
        headline="Tell us a little. We’ll call you, not the other way round."
        body="Join one of our upcoming departures, or design a private journey on your own dates. Either way it begins the same way — you tell us a little, and Marc calls you."
        href="/plan"
        cta="Plan your journey"
      />
    </>
  );
}
