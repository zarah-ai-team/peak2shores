import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import { experiences } from '@/lib/content';

export function ExperiencesStrip() {
  return (
    <section
      id="experiences"
      className="gutter border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]"
    >
      <div className="editorial-grid--wide mb-12 lg:mb-16">
        <SectionLabel className="lg:pt-3">07 — Experiences</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h3 max-w-[820px]">The things we believe are worth your time.</h2>
        </Reveal>
      </div>

      <RevealGroup
        as="ul"
        className="grid list-none items-start gap-x-0.5 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-y-0"
      >
        {experiences.map((experience) => (
          <RevealItem as="li" key={experience.slug} distance={22} className="lg:even:mt-14">
            <Link href={`/experiences#${experience.slug}`} className="group block h-full">
              <Frame
                media={experience.media}
                hover
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                className="h-[300px] lg:h-[360px] xl:h-[440px]"
              />
              <div className="mt-0.5 border-t border-line pr-4 pt-6">
                {/* Five columns at 1024px are narrow; the title scales with them. */}
                <h3 className="mb-3 font-display text-[clamp(24px,2.3vw,30px)] leading-none">
                  {experience.title}
                </h3>
                <p className="prose-body-sm text-[13px]">{experience.body}</p>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
