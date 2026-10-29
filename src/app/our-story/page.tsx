import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { PhotoHero } from '@/components/ui/PhotoHero';
import { Section } from '@/components/ui/Section';
import { DarkCta } from '@/components/ui/DarkCta';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { StoryRoute } from '@/components/story/StoryRoute';
import { getMedia } from '@/lib/media';
import { getPageContent, getSiteSettings, jsonLd, pageMetadata } from '@/lib/content';

export const metadata = pageMetadata({
  title: 'Our story',
  description:
    'From the peaks of Switzerland to the shores of Miami. The story behind Peaks2Shores: thoughtfully curated luxury journeys, brought to life through exceptional hospitality and trusted local expertise.',
  path: '/our-story',
  image: 'story-hero',
});

/**
 * Our story, kept short and brand-led (Marc's notes, October 2026): a compact
 * split opening, the founder beside a smaller portrait, why it exists, the
 * name as four ideas, the four principles, and the closing invitation.
 */
export default async function OurStoryPage() {
  const [{ founder, pillars }, site] = await Promise.all([
    getPageContent('our-story'),
    getSiteSettings(),
  ]);

  /* Marc, as the person behind the company (the Organization is in the layout). */
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/our-story#marc`,
    name: site.founder.name,
    jobTitle: site.founder.role,
    worksFor: { '@id': `${site.url}/#organization` },
    url: `${site.url}/our-story`,
    image: `${site.url}/images/marc-eiger.jpg`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <PhotoHero
        layout="split"
        height="compact"
        media="story-hero"
        titleSize="page-title"
        kicker={
          <span className="flex items-center gap-3.5">
            <Tick />
            The story behind Peaks2Shores
          </span>
        }
        title={[
          { text: 'From the peaks' },
          { text: 'of Switzerland to' },
          { text: 'the shores of Miami.' },
        ]}
      />

      <Section ground="stone" pad="section-sm" aria-labelledby="founder-title">
        <div className="grid-site items-center gap-y-block">
          <Frame
            media="marc-eiger"
            ratio="4/5"
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
            className="col-span-4 md:col-span-4 lg:col-span-4"
          />
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            <SectionLabel as="h2" id="founder-title" tone="stone" className="mb-stack">
              The founder
            </SectionLabel>
            <Reveal>
              <p className="lead measure-lead mb-stack">{founder.body[0]}</p>
              {founder.body.slice(1).map((paragraph) => (
                <p key={paragraph} className="prose-body measure">
                  {paragraph}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </Section>

      <Section pad="section-sm" aria-labelledby="why-exists-title">
        <div className="grid-site gap-y-stack lg:items-end">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <SectionLabel className="mb-stack">Why it exists</SectionLabel>
            <Reveal variant="mask">
              <h2 id="why-exists-title" className="h2 max-w-[20ch]">
                {founder.why.headline}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            {founder.why.body.map((paragraph) => (
              <p key={paragraph} className="prose-body measure mb-stack">
                {paragraph}
              </p>
            ))}
            <ButtonLink href="/journeys" variant="rule" arrow>
              Explore our journeys
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section ground="panel" pad="section-sm" aria-labelledby="route-title">
        <SectionLabel as="h2" id="route-title" className="mb-block">
          Peaks. 2. Shores.
        </SectionLabel>
        <StoryRoute
          stops={founder.name.stops.map((stop) => {
            if ('img' in stop) return { label: stop.label, src: stop.img, alt: stop.alt };
            const photo = getMedia(stop.media);
            return { label: stop.label, src: photo.src, alt: photo.alt };
          })}
        />
        <div className="mt-block grid gap-x-[var(--grid-gap)] gap-y-stack lg:grid-cols-2">
          {founder.name.body.map((paragraph) => (
            <p key={paragraph} className="prose-body measure m-0">
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      <Section pad="section-sm" aria-labelledby="pillars-title">
        <div className="mb-block">
          <SectionLabel className="mb-stack">How we travel</SectionLabel>
          <Reveal variant="mask">
            <h2 id="pillars-title" className="h2 max-w-[20ch]">
              Four principles behind every journey.
            </h2>
          </Reveal>
        </div>
        <RevealGroup as="ul" className="m-0 grid list-none border-t border-line p-0 md:grid-cols-2">
          {pillars.map((pillar, i) => (
            <RevealItem
              as="li"
              key={pillar.n}
              distance={16}
              className={`grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 border-b border-line py-stack md:gap-x-10 md:py-block ${
                i % 2 === 0 ? 'md:border-r md:pr-10 lg:pr-16' : 'md:pl-10 lg:pl-16'
              }`}
            >
              <span aria-hidden className="numeral text-acqua-text">
                {pillar.n}
              </span>
              <div>
                <h3 className="h3 mb-3">{pillar.title}</h3>
                <p className="lead mb-3">{pillar.lead}</p>
                <p className="prose-body measure m-0">{pillar.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <DarkCta
        kicker="Plan your journey"
        headline="Your extraordinary journey begins here."
        body="Whether you’re joining one of our intimate luxury group journeys or dreaming of a privately tailored experience, we’d love to hear what inspires you. Share your travel aspirations with us, and our team will help bring them to life."
        href="/plan"
        cta="Plan your journey"
      />
    </>
  );
}
