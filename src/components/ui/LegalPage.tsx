import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { enterAt } from '@/lib/motion';
import { site } from '@/lib/site';

export type LegalSection = {
  heading: string;
  /** Paragraphs. While the page is a draft, these say what the section must cover. */
  body: string[];
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The shared shell for the legal pages: a title, an optional draft notice
 * (driven by `site.legalDraft` unless the page passes `draft`), a sticky
 * contents list and numbered sections in reading measure. The structure is
 * final; the wording comes from Marc and replaces each section's body.
 */
export function LegalPage({
  title,
  intro,
  updated,
  sections,
  draft = site.legalDraft,
}: {
  title: string;
  intro: string;
  /** e.g. "October 2026". */
  updated: string;
  sections: LegalSection[];
  /** Whether to show the draft notice. Pages whose wording is final pass false. */
  draft?: boolean;
}) {
  const items = sections.map((s, i) => ({ ...s, id: slug(s.heading) || `section-${i + 1}` }));

  return (
    <>
      <section className="container-site pb-block pt-section-sm">
        <SectionLabel as="p" className="enter m-0 mb-6" style={enterAt(0)}>
          Legal
        </SectionLabel>
        <div className="grid-site gap-y-6 lg:items-end">
          <h1 className="h2 enter col-span-full m-0 lg:col-span-8" style={enterAt(0.1)}>
            {title}
          </h1>
          <p
            className="prose-body enter col-span-full m-0 md:col-span-6 lg:col-span-4 lg:col-start-9"
            style={enterAt(0.24)}
          >
            {intro}
          </p>
        </div>
      </section>

      {draft && (
        <div className="bg-panel">
          <p className="container-site kicker m-0 flex items-center gap-4 py-5 text-ink">
            <Tick className="shrink-0" />
            Draft structure — final wording to be supplied by {site.founder.name}.
          </p>
        </div>
      )}

      <section className="container-site pb-section-sm pt-block">
        <div className="grid-site gap-y-10">
          <nav
            aria-label="On this page"
            className="col-span-full lg:col-span-3 lg:self-start lg:sticky lg:top-[calc(var(--nav-h)+32px)]"
          >
            <p className="kicker-sm m-0 mb-4">Last updated {updated}</p>
            <ol className="m-0 hidden list-none border-t border-line p-0 lg:block">
              {items.map((s, i) => (
                <li key={s.id} className="border-b border-line">
                  <a
                    href={`#${s.id}`}
                    className="kicker-sm flex min-h-11 items-center gap-3 py-2 text-body transition-colors duration-300 hover:text-acqua-text"
                  >
                    <span className="w-5 shrink-0 text-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="col-span-full lg:col-span-7 lg:col-start-5">
            <ol className="measure m-0 list-none p-0">
              {items.map((section, i) => (
                <li key={section.id} id={section.id} className="border-t border-line py-9">
                  <h2 className="h5 mb-4">
                    <span className="mr-3 text-muted">{i + 1}.</span>
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="prose-body mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </li>
              ))}
            </ol>

            <p className="prose-body-sm measure border-t border-line pt-9">
              Questions about this page:{' '}
              <a href={`mailto:${site.email}`} className="prose-link">
                {site.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Legal pages stay out of search while their wording is a draft. */
export const legalRobotsFor = (draft: boolean) =>
  draft ? { index: false, follow: true } : undefined;

export const legalRobots = legalRobotsFor(site.legalDraft);
