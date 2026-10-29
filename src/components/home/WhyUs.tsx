import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import { reasons as defaultReasons, type HomeContent } from '@/lib/content';

/**
 * 4.9 — 08 Why us (ivory).
 *
 * The headline holds still on the left (sticky, clear of the header) while
 * the six reasons scroll past on the right as a numbered two-column list,
 * each row ruled above only. On Our story it closes the page under a
 * different label (`label`, `className` and `reasons` are optional, so the
 * existing call keeps working).
 */
export function WhyUs({
  label = '08 — Why us',
  className = '',
  reasons = defaultReasons,
}: {
  label?: string;
  className?: string;
  reasons?: HomeContent['reasons'];
}) {
  return (
    <section
      id="why-us"
      aria-labelledby="why-title"
      data-tone="light"
      className={`bg-ivory py-section text-ink ${className}`}
    >
      <div className="container-site grid-site gap-y-block">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
            <SectionLabel className="mb-8 lg:mb-10">{label}</SectionLabel>
            <Reveal variant="mask">
              <h2 id="why-title" className="h2">
                Someone who really knows travel has already done the filtering for you.
              </h2>
            </Reveal>
          </div>
        </div>

        <RevealGroup
          as="ol"
          stagger={0.06}
          className="col-span-4 m-0 grid list-none gap-x-[var(--grid-gap)] p-0 md:col-span-8 md:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:pt-3"
        >
          {reasons.map((reason) => (
            <RevealItem
              as="li"
              key={reason.n}
              distance={16}
              className="border-t border-line pb-12 pt-7 lg:pb-16"
            >
              <div aria-hidden className="h5 mb-5 text-acqua-text">
                {reason.n}
              </div>
              <h3 className="h5 mb-3">{reason.title}</h3>
              <p className="prose-body-sm max-w-[40ch]">{reason.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
