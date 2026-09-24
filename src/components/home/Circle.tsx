import { Reveal } from '@/components/motion/Reveal';
import { FactList, SectionLabel } from '@/components/ui/Editorial';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { circle } from '@/lib/content';

export function Circle() {
  return (
    <section
      id="circle"
      className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[128px]"
    >
      <SectionLabel className="lg:pt-4">09 — The circle</SectionLabel>

      <div>
        <Reveal variant="mask" className="mb-8">
          <h2 className="h2">{circle.headline}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="prose-body max-w-[480px]">{circle.body}</p>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="flex flex-col gap-7 lg:pt-4">
        <FactList rowClassName="py-5" rows={circle.notes} />
        <NewsletterForm />
      </Reveal>
    </section>
  );
}
