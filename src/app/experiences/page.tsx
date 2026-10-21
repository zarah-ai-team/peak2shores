import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { DarkCta } from '@/components/ui/DarkCta';
import { PageTitle, SectionLabel } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { getPageContent, pageMetadata, type Experience } from '@/lib/content';

export const metadata = pageMetadata({
  title: 'Experiences',
  description:
    'Taste, Meet, Discover, Move, Stay — the five kinds of experience every Peaks2Shores journey is built from.',
  path: '/experiences',
});

/**
 * Five chapters, each composed differently so the page reads as a sequence
 * rather than a list (DESIGN-SPEC §5.4):
 *   0 portrait left, text right · 1 text left, portrait right, dropped 64px ·
 *   2 panorama across the page, text below · 3 = 0 mirrored · 4 = 1 mirrored.
 * Anchors (#taste, #meet…) are kept: the homepage index links to them.
 */
export default async function ExperiencesPage() {
  const { experiences } = await getPageContent('experiences');

  return (
    <>
      <PageTitle kicker="Experiences" title="The things worth your time." variant="stacked">
        Five kinds of experience shape every journey. Not a menu to choose from — the balance we
        build each itinerary around.
      </PageTitle>

      <div className="pb-section-sm">
        {experiences.map((experience, i) => (
          <Chapter key={experience.slug} experience={experience} index={i} />
        ))}
      </div>

      <DarkCta
        ground="charcoal"
        kicker="Ask for something else"
        headline="If what you want isn’t on this page, say so."
        body="The five above describe how we plan, not what we are limited to. Private journeys start with what you actually want to do."
        href="/plan"
        cta="Plan your journey"
      />
    </>
  );
}

function Chapter({ experience, index }: { experience: Experience; index: number }) {
  const titleId = `${experience.slug}-title`;
  const kicker = `${String(index + 1).padStart(2, '0')} — Experience`;
  const shape = index % 5;

  const text = (
    <>
      <SectionLabel className="mb-stack">{kicker}</SectionLabel>
      <Reveal variant="mask">
        <h2 id={titleId} className="h1 mb-stack">
          {experience.title}
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="lead measure-lead mb-7">{experience.body}</p>
        <ButtonLink href="/journeys" variant="rule" arrow>
          Journeys with this
        </ButtonLink>
      </Reveal>
    </>
  );

  // 2 — the panorama: the photograph across the page, text below.
  if (shape === 2) {
    return (
      <section id={experience.slug} aria-labelledby={titleId} className="pt-section-sm">
        <Frame
          media={experience.media}
          parallax={30}
          decorative
          sizes="100vw"
          className="mb-block aspect-[4/3] w-full md:aspect-[21/9]"
        />
        <div className="container-site grid-site">
          <div className="col-span-4 md:col-span-6 md:col-start-2 lg:col-span-7 lg:col-start-3">
            {text}
          </div>
        </div>
      </section>
    );
  }

  // 0 / 3 — a large portrait (7 cols) beside the text; 3 is mirrored.
  if (shape === 0 || shape === 3) {
    const mirror = shape === 3;
    return (
      <section id={experience.slug} aria-labelledby={titleId} className="pt-section-sm">
        <div className="container-site grid-site items-center gap-y-block">
          <Frame
            media={experience.media}
            ratio="4/5"
            decorative
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={`col-span-4 md:col-span-7 lg:col-span-7 ${
              mirror ? 'md:col-start-2 lg:order-2 lg:col-start-6' : ''
            }`}
          />
          <div
            className={`col-span-4 md:col-span-7 lg:col-span-4 ${
              mirror ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-9'
            }`}
          >
            {text}
          </div>
        </div>
      </section>
    );
  }

  // 1 / 4 — text first, a smaller portrait (5 cols) dropped 64px; 4 is mirrored.
  const mirror = shape === 4;
  return (
    <section id={experience.slug} aria-labelledby={titleId} className="pt-section-sm">
      <div className="container-site grid-site items-start gap-y-block">
        <div
          className={`col-span-4 md:col-span-7 lg:col-span-5 lg:self-center ${
            mirror ? 'lg:order-2 lg:col-start-8' : 'lg:col-start-2'
          }`}
        >
          {text}
        </div>
        <Frame
          media={experience.media}
          ratio="3/4"
          decorative
          sizes="(min-width: 1024px) 40vw, 100vw"
          className={`col-span-4 md:col-span-5 md:col-start-4 lg:col-span-5 lg:mt-16 ${
            mirror ? 'lg:order-1 lg:col-start-2' : 'lg:col-start-8'
          }`}
        />
      </div>
    </section>
  );
}
