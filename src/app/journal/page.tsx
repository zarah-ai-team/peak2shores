import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { FactList, PageTitle, SectionLabel } from '@/components/ui/Editorial';
import { Section } from '@/components/ui/Section';
import { StatusTag } from '@/components/ui/StatusTag';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { enterAt } from '@/lib/motion';
import {
  getForthcomingArticles,
  getPageContent,
  getPublishedArticles,
  pageMetadata,
  type ForthcomingArticle,
} from '@/lib/content';

export const metadata = pageMetadata({
  title: 'Journal',
  description:
    'Places we love, hotels worth staying in, and notes from the road — the Peaks2Shores travel journal.',
  path: '/journal',
});

/* A piece can be scheduled with publishAt, so the index rebuilds hourly. */
export const revalidate = 3600;

/**
 * The journal index as a magazine spread: one lead piece, then a row of
 * three in different shapes. Every entry is still in preparation, so each
 * is an unlinked teaser — no address exists for a draft — with its picture
 * held back a little (85%, slightly desaturated) so it reads as forthcoming.
 *
 * When a piece is written (getPublishedArticles), it will need its own
 * /journal/[slug] route before it can be linked; until then nothing here links.
 */
export default async function JournalPage() {
  const [{ categories, circle }, published, forthcoming] = await Promise.all([
    getPageContent('journal'),
    getPublishedArticles(),
    getForthcomingArticles(),
  ]);
  // Published pieces lead once they exist; there is no route for them yet,
  // so they are shown the same way (unlinked) rather than linking to a 404.
  const entries: ForthcomingArticle[] = [...published, ...forthcoming];
  const [lead, ...rest] = entries;

  return (
    <>
      <PageTitle kicker="Journal" title="Notes, not newsletters.">
        A place we love. A hotel worth the trip. A table worth booking. Written by Marc, sent to the
        circle first.
      </PageTitle>

      {/* A list, not a nav: these are the journal's sections, not yet links. */}
      <div className="container-site enter" style={enterAt(0.36)}>
        <ul
          aria-label="Journal categories"
          className="m-0 flex list-none flex-wrap gap-x-4 gap-y-3 border-y border-line px-0 py-5"
        >
          {categories.map((category, i) => (
            <li key={category} className="kicker flex items-center gap-4">
              {i > 0 && (
                <span aria-hidden className="text-acqua-deep">
                  ·
                </span>
              )}
              {category}
            </li>
          ))}
        </ul>
      </div>

      {lead && (
        <section aria-labelledby="journal-entries-title" className="pb-section-sm pt-block">
          <h2 id="journal-entries-title" className="sr-only">
            In the journal
          </h2>
          <div className="container-site">
            <article className="grid-site items-end gap-y-8">
              <Frame
                media={lead.media}
                ratio="16/10"
                decorative
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="col-span-4 opacity-85 grayscale-[.25] md:col-span-8 lg:col-span-8"
              />
              <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
                <Teaser entry={lead} size="lead" />
              </div>
            </article>

            {rest.length > 0 && (
              <RevealGroup
                as="ul"
                className="mt-section-sm grid list-none gap-x-[var(--grid-gap)] gap-y-block border-t border-line p-0 pt-block md:grid-cols-3"
              >
                {rest.slice(0, 3).map((entry, i) => (
                  <RevealItem as="li" key={entry.slug} distance={16}>
                    <article>
                      <Frame
                        media={entry.media}
                        ratio={i === 1 ? '1/1' : '4/5'}
                        decorative
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="mb-7 opacity-85 grayscale-[.25]"
                      />
                      <Teaser entry={entry} />
                    </article>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </section>
      )}

      <Section ground="panel" aria-labelledby="circle-title">
        <div className="grid-site gap-y-block">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionLabel className="mb-stack">The circle</SectionLabel>
            <Reveal variant="mask">
              <h2 id="circle-title" className="h2 mb-stack max-w-[20ch]">
                {circle.headline}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="prose-body measure mb-block">{circle.body}</p>
              <FactList labelWidth={130} rows={circle.notes} />
            </Reveal>
          </div>
          <Reveal
            delay={0.15}
            className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
          >
            <NewsletterForm variant="large" />
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function Teaser({ entry, size = 'row' }: { entry: ForthcomingArticle; size?: 'lead' | 'row' }) {
  return (
    <>
      <p className="kicker-sm mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span>{entry.category}</span>
        <span aria-hidden>·</span>
        <span>{entry.date}</span>
      </p>
      <h3 className={`${size === 'lead' ? 'h3' : 'h4'} mb-4 max-w-[22ch]`}>{entry.title}</h3>
      <p className={`${size === 'lead' ? 'prose-body' : 'prose-body-sm'} measure mb-6`}>
        {entry.standfirst}
      </p>
      {entry.draft && (
        <p className="m-0 border-t border-line pt-4">
          <StatusTag status="draft">In preparation — announced to the circle first</StatusTag>
        </p>
      )}
    </>
  );
}
