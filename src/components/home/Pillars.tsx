import { Reveal } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import { Tick } from '@/components/ui/Tick';
import type { Pillar } from '@/lib/content';
import { Section } from '@/components/ui/Section';
import { PrincipleCards } from './PrincipleCards';

/**
 * 4.5 — 02 Principles (panel).
 *
 * What used to be two sections — the four pillars and the six-box "why us" —
 * is one: the why-us headline above the four principles, which open on hover
 * as photographs, and the one reason the principles do not already cover set
 * as a single closing line. Four of the six reasons repeated the pillars and
 * a fifth the hotels section (client review, October 2026).
 */
export function Pillars({ pillars }: { pillars: Pillar[] }) {
  return (
    <Section contained={false} ground="panel" id="pillars" aria-labelledby="pillars-title">
      <div className="container-site">
        <div className="grid-site mb-block gap-y-8 lg:items-end">
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <SectionLabel className="mb-8 lg:mb-10">02 — What every journey is held to</SectionLabel>
            <Reveal variant="mask">
              <h2 id="pillars-title" className="h2 max-w-[22ch]">
                Someone who really knows travel has already done the filtering for you.
              </h2>
            </Reveal>
          </div>
        </div>

        <Reveal distance={16}>
          <PrincipleCards pillars={pillars} />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex items-start gap-4 lg:mt-14">
          <Tick className="mt-[0.7em] w-[22px] shrink-0" />
          <p className="h5 m-0">
            Seamless by nature.{' '}
            <span className="prose-body text-muted">
              The complexity happens behind the scenes, so you can stay present.
            </span>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
