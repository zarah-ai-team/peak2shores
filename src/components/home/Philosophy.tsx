import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import type { HomeContent } from '@/lib/content';
import { Section } from '@/components/ui/Section';

/**
 * 4.2 — 01 Philosophy (ivory). A statement page.
 *
 * The belief, set large and centred, then one line beneath it and the way on.
 * Nothing else: after the film, this is the one pause for reading, and the
 * principles that follow carry the detail.
 */
export function Philosophy({ philosophy }: { philosophy: HomeContent['philosophy'] }) {
  return (
    <Section contained={false} screen id="philosophy" aria-labelledby="philosophy-title">
      <div className="container-site flex flex-col items-center text-center">
        <SectionLabel className="mb-8 lg:mb-10">01 — Philosophy</SectionLabel>
        <Reveal variant="mask">
          <h2 id="philosophy-title" className="h2 mx-auto max-w-[20ch]">
            {philosophy.headline}
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10 flex flex-col items-center lg:mt-12">
          {philosophy.body.map((paragraph) => (
            <p key={paragraph} className="lead measure-lead mb-8">
              {paragraph}
            </p>
          ))}
          <ButtonLink href="/our-story" variant="rule">
            How we travel
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
