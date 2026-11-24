import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/experiences/experiences.css';
import { ExperienceCollage } from '@/components/experiences/ExperienceCollage';
import { ExperiencePanels } from '@/components/experiences/ExperiencePanels';
import { Film } from '@/components/experiences/Film';
import { experiences as homeExperiences, ways } from '@/lib/data/home';
import { getPageContent, pageMetadata } from '@/lib/content';
import { wayPages } from '@/lib/data/ways';
import { getMedia } from '@/lib/media';

export const metadata = pageMetadata({
  title: 'Experiences',
  description:
    'Taste, Meet, Discover, Explore, Stay — the five kinds of experience every Peaks2Shores journey is built from.',
  path: '/experiences',
});

/* The opening film: the street piano by the Chapel Bridge in Lucerne. */
const opening = homeExperiences.find((x) => x.word === 'Meet') ?? homeExperiences[0];

/**
 * Experiences, in the homepage's language (home.css supplies the .hc tokens,
 * labels and buttons; experiences.css the rest):
 *   01 a full-bleed film ·
 *   02 the ways to travel as a row of tall photographs, one open at a time ·
 *   03 the five experiences as a collage of photographs ·
 *   04 one call to action: plan your journey.
 * Everything is on the page from the first paint; the motion only changes
 * which photograph has the room. Each experience keeps its anchor (#taste,
 * #meet…) on its print in the collage.
 */
export default async function ExperiencesPage() {
  const { experiences } = await getPageContent('experiences');
  const prints = experiences.map((x) => {
    const slot = getMedia(x.media);
    return {
      slug: x.slug,
      title: x.title,
      body: x.body,
      img: slot.src,
      alt: slot.alt ?? slot.label,
    };
  });
  // Each way's photograph from the homepage's list; its words and its page
  // from the ways' own pages (/experiences/<slug>).
  const panels = wayPages.map((page) => {
    const way = ways.find((w) => w.title === page.title);
    return {
      slug: page.slug,
      title: page.title,
      body: page.short,
      img: way?.img ?? page.hero.src,
      alt: way?.alt ?? page.hero.alt,
      pos: way?.pos ?? page.hero.pos,
      href: `/experiences/${page.slug}`,
    };
  });

  return (
    <div className="hc xp">
      {/* 01 — The opening. */}
      <section data-hero aria-labelledby="xp-title" className="xp-hero">
        <div className="media">
          <Film visual={opening} sizes="100vw" priority />
        </div>
        <div className="shade" />
        <div className="copy">
          <p className="lab eb">
            <i />
            Experiences
          </p>
          <h1 id="xp-title">The things worth your time.</h1>
          <p className="intro">Five kinds of experience shape every journey.</p>
        </div>
      </section>

      {/* 02 — The ways to travel. */}
      <section className="xp-kinds" aria-labelledby="ways-title">
        <div className="xp-head">
          <div>
            <p className="lab">Ways to travel</p>
            <h2 id="ways-title">From a small group to a yacht of your own.</h2>
          </div>
          <p className="sub">
            Every one is built from the five experiences below, with the same people on the ground
            and the same care behind each day.
          </p>
        </div>
        <ExperiencePanels items={panels} />
      </section>

      {/* 03 — The five. */}
      <section className="xp-five" aria-labelledby="five-title">
        <div className="xp-head">
          <div>
            <p className="lab">Five kinds of experience</p>
            <h2 id="five-title">What fills the days of every journey.</h2>
          </div>
          <p className="sub">
            Not a menu to choose from, but the balance we build each itinerary around.
          </p>
        </div>
        <ExperienceCollage items={prints} />
      </section>

      {/* 04 — The one way on. */}
      <section className="xp-ask" aria-labelledby="ask-title">
        <div>
          <p className="lab">Ask for something else</p>
          <h2 id="ask-title">If what you want isn’t on this page, say so.</h2>
        </div>
        <div>
          <p>
            The five above describe how we plan, not what we are limited to. Private journeys start
            with what you actually want to do.
          </p>
          <Link className="btn btn-ink" href="/plan">
            Plan your journey
          </Link>
        </div>
      </section>
    </div>
  );
}
