import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import { reasons } from '@/lib/content';

/**
 * The six reasons, as a ruled grid. On the homepage it is section 04; on
 * Our story it closes the page under a different label.
 */
export function WhyUs({
  label = '04 — Why us',
  className = 'border-b border-line',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <section className={`gutter pb-20 pt-20 md:pb-[104px] md:pt-[112px] ${className}`}>
      <div className="editorial-grid--wide mb-12 lg:mb-16">
        <SectionLabel className="lg:pt-3">{label}</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h3 max-w-[820px]">
            Someone who really knows travel has already done the filtering for you.
          </h2>
        </Reveal>
      </div>

      <RevealGroup
        as="ul"
        className="grid list-none border-t border-line p-0 sm:grid-cols-2 lg:grid-cols-3 lg:border-l"
      >
        {reasons.map((reason) => (
          <RevealItem
            as="li"
            key={reason.n}
            distance={22}
            className="flex flex-col gap-4 border-b border-line pb-14 pr-10 pt-10 sm:border-r sm:pl-7"
          >
            <div className="kicker">{reason.n}</div>
            <h3 className="h5">{reason.title}</h3>
            <p className="prose-body-sm">{reason.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
