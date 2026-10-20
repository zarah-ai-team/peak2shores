import { Reveal } from '@/components/motion/Reveal';
import { FactList, SectionLabel } from '@/components/ui/Editorial';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import type { HomeContent } from '@/lib/content';
import { Section } from '@/components/ui/Section';

/**
 * 4.10 — 10 The circle (ivory, after the closing invitation, before the footer).
 *
 * Flush left and weighted to the centre: the question as the headline, the
 * letter and its two notes beneath, and the sign-up on the right, set at the
 * same height as the notes so the form reads as the answer.
 */
export function Circle({ circle }: { circle: HomeContent['circle'] }) {
  return (
    <Section contained={false} id="circle" aria-labelledby="circle-title" pad="section-sm">
      <div className="container-site">
        <div className="grid-site gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <SectionLabel className="mb-8 lg:mb-10">10 — The circle</SectionLabel>
            <Reveal variant="mask">
              <h2 id="circle-title" className="h2 max-w-[18ch]">
                {circle.headline}
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="col-span-4 md:col-span-8 lg:col-span-6 lg:mt-6">
            <p className="prose-body measure mb-10">{circle.body}</p>
            <FactList labelWidth={130} rows={circle.notes} />
          </Reveal>

          <Reveal
            delay={0.18}
            className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end"
          >
            <NewsletterForm />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
