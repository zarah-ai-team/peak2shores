import { Reveal } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import { pillars } from '@/lib/content';
import { PillarsIndex } from './PillarsIndex';

/**
 * The four pillars as one spread: a numbered index down the right, and a
 * single photograph on the left that stays put and changes as each pillar
 * comes level with it. Four ideas, one frame — rather than four full-height
 * spreads that read as the same page repeated.
 */
export function Pillars() {
  return (
    <section id="pillars" className="border-b border-line">
      <div className="gutter editorial-grid--wide mb-12 pt-20 md:pt-[112px] lg:mb-16">
        <SectionLabel className="lg:pt-3">02 — Principles</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h3 max-w-[820px]">What every journey is held to.</h2>
        </Reveal>
      </div>

      <PillarsIndex pillars={pillars} />
    </section>
  );
}
