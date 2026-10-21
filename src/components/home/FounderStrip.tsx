import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Quote, SectionLabel } from '@/components/ui/Editorial';
import { Section } from '@/components/ui/Section';
import type { HomeContent } from '@/lib/content';

/**
 * 4.6 — 06 The founder (stone).
 *
 * Marc's own cut-out portrait (public/brand/marc.webp, through the
 * `marc-portrait` slot) stands on the left half with its feet on the floor of
 * the section — contained, never cropped, no parallax. The text takes the
 * right half: headline, his two paragraphs, and the promise as a pull quote
 * under a short brass rule. It ends on Marc, who chooses the hotels next.
 * One screen on a desktop: the portrait stands the full height of it.
 */
export function FounderStrip({ founder }: { founder: HomeContent['founder'] }) {
  return (
    <Section
      ground="stone"
      screen
      id="story"
      aria-labelledby="founder-title"
      className="lg:py-0"
      innerClassName="lg:h-full"
    >
      <div className="grid-site lg:h-full">
        {/* Stretched to the text column, which is kept tight (section-sm), so a
            width-bound portrait stands on the floor without a field of stone above. */}
        <div className="col-span-4 pt-section-sm md:col-span-6 md:col-start-2 lg:col-span-6 lg:col-start-1 lg:min-h-0 lg:pt-[8svh]">
          <Frame
            media="marc-portrait"
            fit="contain"
            ground="transparent"
            sizes="(min-width: 1024px) 46vw, (min-width: 768px) 70vw, 100vw"
            className="h-full min-h-[480px] md:min-h-[600px] lg:min-h-0"
          />
        </div>

        <Reveal
          direction="left"
          distance={16}
          className="col-span-4 py-section-sm md:col-span-8 lg:col-span-6 lg:col-start-7 lg:self-center lg:py-[8svh]"
        >
          <div className="max-w-[520px]">
            <SectionLabel tone="stone" className="mb-8 lg:mb-[2.5svh]">
              06 — The founder
            </SectionLabel>
            <h2 id="founder-title" className="h2 mb-block lg:mb-[3.5svh]">
              {founder.headline}
            </h2>
            {founder.body.map((paragraph) => (
              <p key={paragraph} className="prose-body mb-stack">
                {paragraph}
              </p>
            ))}
            <Quote className="mb-10 mt-12 lg:mb-[3svh] lg:mt-[3.5svh]">“{founder.quote}”</Quote>
            <ButtonLink href="/our-story" variant="rule">
              Meet Marc
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
