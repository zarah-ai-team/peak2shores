import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { DarkCta } from '@/components/ui/DarkCta';
import { PageTitle, SectionLabel } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { experiences } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Experiences',
  description:
    'Taste, Meet, Discover, Move, Stay — the five kinds of experience every Peaks2Shores journey is built from.',
  path: '/experiences',
});

export default function ExperiencesPage() {
  return (
    <>
      <PageTitle kicker="Experiences" title="The things worth your time.">
        Five kinds of experience shape every journey. Not a menu to choose from — the balance we
        build each itinerary around.
      </PageTitle>

      <div className="border-t border-line">
        {experiences.map((experience, i) => {
          const imageFirst = i % 2 === 0;
          return (
            <section
              key={experience.slug}
              id={experience.slug}
              aria-labelledby={`${experience.slug}-title`}
              className="grid border-b border-line lg:min-h-[560px] lg:grid-cols-2"
            >
              <Frame
                media={experience.media}
                parallax={36}
                decorative
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`aspect-[4/3] lg:aspect-auto ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}
              />

              <Reveal
                direction={imageFirst ? 'left' : 'right'}
                distance={24}
                className={`gutter flex flex-col justify-center gap-6 py-16 lg:py-20 lg:pr-24 ${
                  imageFirst ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <SectionLabel>{String(i + 1).padStart(2, '0')} — Experience</SectionLabel>
                <h2 id={`${experience.slug}-title`} className="h3">
                  {experience.title}
                </h2>
                <p className="lead max-w-[480px]">{experience.body}</p>
                <p className="prose-body max-w-[460px] text-[15px]">
                  Every journey carries some of this. How much depends on the place, the season and
                  who is travelling — which is the point of a journey planned by a person rather
                  than assembled from a catalogue.
                </p>
                <ButtonLink href="/journeys" variant="rule" className="self-start">
                  Journeys with this
                </ButtonLink>
              </Reveal>
            </section>
          );
        })}
      </div>

      <DarkCta
        kicker="Ask for something else"
        headline="If what you want isn’t on this page, say so."
        body="The five above describe how we plan, not what we are limited to. Private journeys start with what you actually want to do."
        href="/plan"
        cta="Plan your journey"
      />
    </>
  );
}
