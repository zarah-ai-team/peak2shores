import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/experiences/experiences.css';
import { ExperiencePanels } from '@/components/experiences/ExperiencePanels';
import { Film } from '@/components/experiences/Film';
import { WaysStage } from '@/components/experiences/WaysStage';
import { experiences as homeExperiences, ways } from '@/lib/data/home';
import { getPageContent, pageMetadata } from '@/lib/content';
import { getMedia } from '@/lib/media';

export const metadata = pageMetadata({
  title: 'Experiences',
  description:
    'Taste, Meet, Discover, Explore, Stay — the five kinds of experience every Peaks2Shores journey is built from.',
  path: '/experiences',
});

const pad = (n: number) => String(n).padStart(2, '0');

/* The opening film: the street piano by the Chapel Bridge in Lucerne. */
const opening = homeExperiences.find((x) => x.word === 'Meet') ?? homeExperiences[0];

/**
 * Experiences, in the homepage's language (home.css supplies the .hc tokens,
 * labels and buttons; experiences.css the rest):
 *   01 a full-bleed film with the five experiences as a way in along its foot ·
 *   02 the five as a row of tall photographs, one open at a time ·
 *   03 the ways to travel as a list beside a framed film screen ·
 *   04 one call to action: plan your journey.
 * Everything is on the page from the first paint; the motion only changes
 * which photograph has the room. Anchors (#taste, #meet…) are kept: the
 * homepage index links to them.
 */
export default async function ExperiencesPage() {
  const { experiences } = await getPageContent('experiences');
  const panels = experiences.map((x) => {
    const slot = getMedia(x.media);
    return {
      slug: x.slug,
      title: x.title,
      body: x.body,
      img: slot.src,
      alt: slot.alt ?? slot.label,
      tone: slot.tone,
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
        <nav className="xp-index" aria-label="Experiences on this page">
          {experiences.map((x, i) => (
            <a key={x.slug} href={`#${x.slug}`}>
              <span>{pad(i + 1)}</span>
              {x.title}
            </a>
          ))}
        </nav>
      </section>

      {/* 02 — The five. */}
      <div className="xp-kinds">
        <div className="xp-head">
          <p className="lab">Five kinds of experience</p>
          <p className="sub">
            Not a menu to choose from — the balance we build each itinerary around.
          </p>
        </div>
        <ExperiencePanels items={panels} />
      </div>

      {/* 03 — The ways to travel. */}
      <section className="xp-ways" aria-labelledby="ways-title">
        <div className="xp-head">
          <div>
            <p className="lab">Ways to travel</p>
            <h2 id="ways-title">From a small group to a yacht of your own.</h2>
          </div>
          <p className="sub">
            Every experience above can be shaped into any of these — with the same people on the
            ground and the same care behind each day.
          </p>
        </div>
        <WaysStage
          ways={ways.map(({ title, line, img, alt, video }) => ({ title, line, img, alt, video }))}
        />
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
