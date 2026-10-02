import { PageTitle } from '@/components/ui/Editorial';
import { site } from '@/lib/site';

export type LegalSection = {
  heading: string;
  /** Paragraphs. While the page is a draft, these say what the section must cover. */
  body: string[];
};

/**
 * The shared shell for the legal pages: a title, an optional draft notice and
 * numbered sections in reading measure. The structure is final; the wording
 * comes from Marc and replaces each section's body.
 */
export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  /** e.g. "October 2026". */
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageTitle kicker="Legal" title={title}>
        {intro}
      </PageTitle>

      <section className="gutter pb-24 md:pb-[104px]">
        <div className="max-w-[720px]">
          {site.legalDraft && (
            <p className="kicker-sm mb-10 border-y border-line py-4 text-acqua-text">
              Draft structure — final wording to be supplied by {site.founder.name}.
            </p>
          )}
          <p className="kicker-sm mb-12">Last updated {updated}</p>

          <ol className="m-0 list-none p-0">
            {sections.map((section, i) => (
              <li key={section.heading} className="border-t border-line py-9">
                <h2 className="h4 mb-4">
                  {i + 1}. {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="prose-body mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </li>
            ))}
          </ol>

          <p className="prose-body-sm border-t border-line pt-9">
            Questions about this page:{' '}
            <a href={`mailto:${site.email}`} className="text-acqua-text hover:text-ink">
              {site.email}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}

/** Legal pages stay out of search while their wording is a draft. */
export const legalRobots = site.legalDraft ? { index: false, follow: true } : undefined;
