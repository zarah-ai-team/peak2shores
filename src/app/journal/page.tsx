import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { PageTitle, SectionLabel } from '@/components/ui/Editorial';
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

/* Kept out of search until the first piece is published. */
export async function generateMetadata() {
  const published = await getPublishedArticles();
  return pageMetadata({
    title: 'Journal',
    description:
      'Places we love, hotels worth staying in, and notes from the road — the Peaks2Shores travel journal.',
    path: '/journal',
    noindex: published.length === 0,
  });
}

/* A piece can be scheduled with publishAt, so the index rebuilds hourly. */
export const revalidate = 3600;

/* Each photograph loads over the house image ground (stone, the soft lake
   blue the site's other image frames hold), so the journal keeps one ground
   rather than each slot's own blue-grey. The cover that lifts off each
   photograph takes the same blue. */
const ground = '!bg-stone [&_[data-curtain]]:!bg-stone';

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
      <PageTitle kicker="Journal" title={'Notes, not\u00a0newsletters.'}>
        A place we love. A hotel worth the trip. A table worth booking.
      </PageTitle>

      {/* A list, not a nav: these are the journal's sections, not yet links.
          Each item is set off from the one before by a dot in its own left
          padding, and the list starts that padding's width to the left inside
          a clipping box: the first item on every line has its dot cut off, so
          a line never starts with one, however the list wraps. */}
      <div className="container-site enter" style={enterAt(0.36)}>
        <div className="overflow-hidden border-y border-line">
          <ul
            aria-label="Journal categories"
            className={`kicker m-0 flex list-none flex-wrap gap-y-3 px-0 py-5 ${dotRoom.kicker.list}`}
          >
            {categories.map((category) => (
              <li
                key={category}
                className={`kicker relative flex items-center ${dotRoom.kicker.item}`}
              >
                <Separator className={`text-acqua-deep ${dotRoom.kicker.dot}`} />
                {category}
              </li>
            ))}
          </ul>
        </div>
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
                sizes="(min-width: 1024px) 66vw, 100vw"
                className={`col-span-4 opacity-85 grayscale-[.25] md:col-span-8 lg:col-span-8 ${ground}`}
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
                      {/* The photographs are landscape, so in these upright
                          frames they are drawn up to 1.875 times the frame's
                          width, and `sizes` asks for that. On a phone held
                          sideways, where the row is one column, an upright
                          frame would fill two screens: it is cropped 2:1. */}
                      <Frame
                        media={entry.media}
                        ratio={i === 1 ? '1/1' : '4/5'}
                        sizes="(orientation: landscape) and (max-height: 500px) and (max-width: 767px) 100vw, (min-width: 768px) 56vw, 160vw"
                        className={`mb-7 opacity-85 grayscale-[.25] [@media(orientation:landscape)_and_(max-height:500px)_and_(max-width:767px)]:!aspect-[2/1] ${ground}`}
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
            <SectionLabel className="mb-stack">The Circle</SectionLabel>
            <Reveal variant="mask">
              <h2 id="circle-title" className="h2 mb-stack max-w-[20ch]">
                {circle.headline}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="prose-body measure">{circle.body}</p>
            </Reveal>
          </div>
          <Reveal
            delay={0.15}
            className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
          >
            {/* `data-fab-away`: the floating "Connect with our team" steps
                aside while the form is on screen, as it does for the home
                page's Circle, rather than sit over Join The Circle and the
                Privacy Policy link. */}
            <div data-fab-away>
              <NewsletterForm variant="large" />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

/**
 * The room a separating dot takes before an item: the 1rem gap either side of
 * it that the rows have always had, and the dot itself (its glyph and the
 * caps' letter-spacing: 0.304em in `.kicker`, 0.284em in `.kicker-sm`). The
 * item is padded by it, the dot is centred in that padding, and the row starts
 * that much to the left inside a clipping box.
 */
const dotRoom = {
  kicker: {
    list: '-ml-[calc(2rem+0.304em)]',
    item: 'pl-[calc(2rem+0.304em)]',
    dot: 'w-[calc(2rem+0.304em)]',
  },
  kickerSm: {
    list: '-ml-[calc(2rem+0.284em)]',
    item: 'pl-[calc(2rem+0.284em)]',
    dot: 'w-[calc(2rem+0.284em)]',
  },
};

/**
 * The dot between two caps items, centred in the left padding of the item it
 * precedes (see dotRoom), so the dot of an item that begins a line is cut off
 * with the padding.
 */
function Separator({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`absolute left-0 top-0 text-center ${className}`}>
      ·
    </span>
  );
}

function Teaser({ entry, size = 'row' }: { entry: ForthcomingArticle; size?: 'lead' | 'row' }) {
  return (
    <>
      {/* Category · date, and when the two do not fit on one line, the date
          starts the next one without its dot (see Separator). */}
      <p className="kicker-sm mb-4 overflow-hidden">
        <span className={`flex flex-wrap items-center gap-y-2 ${dotRoom.kickerSm.list}`}>
          <span className={dotRoom.kickerSm.item}>{entry.category}</span>{' '}
          <span className={`relative ${dotRoom.kickerSm.item}`}>
            <Separator className={dotRoom.kickerSm.dot} />
            {entry.date}
          </span>
        </span>
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
