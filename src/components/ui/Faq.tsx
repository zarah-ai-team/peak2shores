import { SectionLabel } from '@/components/ui/Editorial';
import type { FaqItem } from '@/lib/data/faq';
import { jsonLd } from '@/lib/seo';

/**
 * Short questions and answers as an open/close list — each a native
 * <details>, so it works without JavaScript and by keyboard — with the
 * FAQPage schema built from the same items, so the markup never says more
 * than the page shows. Styled as the itinerary's days.
 */
export function Faq({ items, id = 'faq' }: { items: FaqItem[]; id?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="container-site pb-section-sm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <div className="grid-site gap-y-block">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <SectionLabel className="mb-stack">Questions</SectionLabel>
          <h2 id={`${id}-title`} className="h2 max-w-[16ch]">
            Frequently asked questions
          </h2>
        </div>
        <ul className="col-span-4 m-0 list-none border-t border-ink p-0 md:col-span-8 lg:col-span-8">
          {items.map((item) => (
            <li key={item.question} className="border-b border-line">
              <details className="journey-day group/day">
                <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_24px] items-baseline gap-x-4 py-6">
                  <h3 className="h5 m-0 transition-colors duration-300 group-hover/day:text-acqua-text">
                    {item.question}
                  </h3>
                  <span
                    aria-hidden
                    className="day-toggle relative block size-4 self-center justify-self-end"
                  />
                </summary>
                <p className="prose-body measure pb-8">{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
