import { Frame } from '@/components/ui/Frame';
import { RevealGroup, RevealItem, Reveal } from '@/components/motion/Reveal';
import { PageTitle, SectionLabel } from '@/components/ui/Editorial';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { journal, journalCategories, circle } from '@/lib/content';
import { enterAt } from '@/lib/motion';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Journal',
  description:
    'Places we love, hotels worth staying in, and notes from the road — the Peaks2Shores travel journal.',
  path: '/journal',
});

export default function JournalPage() {
  return (
    <>
      <PageTitle kicker="Journal" title="Notes, not newsletters.">
        A place we love. A hotel worth the trip. A table worth booking. Written by Marc, sent to the
        circle first.
      </PageTitle>

      {/* A list, not a nav: these are the journal's sections, not yet links. */}
      <ul
        aria-label="Journal categories"
        className="gutter enter m-0 flex list-none flex-wrap gap-x-7 gap-y-3 border-y border-line py-5"
        style={enterAt(0.36)}
      >
        {journalCategories.map((category) => (
          <li key={category} className="kicker-sm">
            {category}
          </li>
        ))}
      </ul>

      <section className="gutter pb-24 pt-14 md:pb-[104px]">
        <RevealGroup
          as="ul"
          className="grid list-none gap-x-14 gap-y-16 p-0 sm:grid-cols-2"
          stagger={0.09}
        >
          {journal.map((entry) => (
            <RevealItem as="li" key={entry.slug} distance={22}>
              <article className="flex h-full flex-col">
                <Frame
                  media={entry.media}
                  decorative
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="h-[280px] lg:h-[420px]"
                />
                <div className="flex flex-1 flex-col pt-7">
                  <div className="kicker-sm mb-4 flex flex-wrap justify-between gap-4">
                    <span>{entry.category}</span>
                    <span>{entry.date}</span>
                  </div>
                  <h2 className="h4 mb-4 max-w-[460px]">{entry.title}</h2>
                  <p className="prose-body-sm mb-6 max-w-[460px]">{entry.standfirst}</p>
                  {entry.draft && (
                    <p className="mt-auto border-t border-line pt-4 font-ui text-[10px] uppercase leading-none tracking-[0.18em] text-muted">
                      In preparation — announced to the circle first
                    </p>
                  )}
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="gutter editorial-grid border-t border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <SectionLabel className="lg:pt-4">The circle</SectionLabel>
        <div>
          <Reveal variant="mask" className="mb-8">
            <h2 className="h2">{circle.headline}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="prose-body max-w-[480px]">{circle.body}</p>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="lg:pt-4">
          <NewsletterForm />
        </Reveal>
      </section>
    </>
  );
}
