import Image from 'next/image';
import Link from 'next/link';
import '@/components/home/home.css';
import '@/components/story/story.css';
import { WayReveal as Reveal } from '@/components/experiences/WayReveal';
import { PhotoHero } from '@/components/ui/PhotoHero';
import { DarkCta } from '@/components/ui/DarkCta';
import { Tick } from '@/components/ui/Editorial';
import { StoryPrinciples } from '@/components/story/StoryPrinciples';
import { getPageContent, getSiteSettings, jsonLd, pageMetadata } from '@/lib/content';

export const metadata = pageMetadata({
  title: 'Our story',
  description:
    'From the peaks of Switzerland to the shores of Miami. The story behind Peaks2Shores: thoughtfully curated luxury journeys, brought to life through exceptional hospitality and trusted local expertise.',
  path: '/our-story',
  image: 'story-hero',
});

/**
 * Our story, told as an editorial (the redesign of 23 Nov 2026; the opening
 * is kept as it was): the founder in a collage of his own portraits; why it
 * exists over a full-bleed photograph of Lake Lucerne; the name as one large
 * line over four staggered frames; the four principles beside a photograph
 * that turns with them; the founder's line over a film strip of guests on
 * the road; and the closing invitation. Every word is the approved copy
 * (copy.ts); the photographs are Marc's own and his guests'. The motion is
 * story.css's, set off by the Experiences pages' reveal (WayReveal).
 */
export default async function OurStoryPage() {
  const [{ founder, pillars }, site] = await Promise.all([
    getPageContent('our-story'),
    getSiteSettings(),
  ]);

  /* Marc, as the person behind the company (the Organization is in the layout). */
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/our-story#marc`,
    name: site.founder.name,
    jobTitle: site.founder.role,
    worksFor: { '@id': `${site.url}/#organization` },
    url: `${site.url}/our-story`,
    image: `${site.url}/images/marc-eiger.jpg`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <PhotoHero
        layout="split"
        height="compact"
        media="story-hero"
        titleSize="page-title"
        kicker={
          <span className="flex items-center gap-3.5">
            <Tick />
            The story behind Peaks2Shores
          </span>
        }
        title={[
          { text: 'From the peaks' },
          { text: 'of Switzerland to' },
          { text: 'the shores of Miami.' },
        ]}
      />

      <div className="hc st">
        {/* 02 — The founder: his portraits layered like prints, his story beside them. */}
        <Reveal className="st-founder" labelledBy="founder-title">
          <div className="st-founder-pics" data-no-settle>
            <figure className="st-print st-print-a">
              <Image
                src={MARC.eiger.src}
                alt={MARC.eiger.alt}
                fill
                sizes="(min-width: 1100px) 34vw, 80vw"
                className="fill photo-grade"
              />
              <figcaption>Grindelwald</figcaption>
            </figure>
            <figure className="st-print st-print-b">
              <Image
                src={MARC.solothurn.src}
                alt={MARC.solothurn.alt}
                fill
                sizes="(min-width: 1100px) 18vw, 45vw"
                className="fill photo-grade"
              />
              <figcaption>Solothurn</figcaption>
            </figure>
          </div>
          <div className="st-founder-copy" data-no-settle>
            <p className="lab">The founder</p>
            <h2 id="founder-title">{site.founder.name}</h2>
            <p className="st-role">
              {site.founder.role}, {site.name}
            </p>
            <p className="st-lead">{founder.body[0]}</p>
            {founder.body.slice(1).map((paragraph) => (
              <p key={paragraph} className="st-body">
                {paragraph}
              </p>
            ))}
            {/* The facts of his story, as the paragraph above gives them. */}
            <dl className="st-facts">
              {FACTS.map((fact) => (
                <div key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* 03 — Why it exists: the headline over Lake Lucerne, the story below it
            beside Marc on a river deck, which breaks out of the photograph. */}
        <Reveal className="st-why" labelledBy="why-exists-title">
          <div className="st-why-band" data-no-settle>
            <div className="st-why-bg">
              <Image
                src="/images/drive/switzerland-lake-lucerne-balcony-view.jpg"
                alt="Lake Lucerne from a hotel balcony, the old town and the mountains beyond"
                fill
                sizes="100vw"
                className="fill photo-grade"
              />
            </div>
            <div className="st-why-head">
              <p className="lab">Why it exists</p>
              <h2 id="why-exists-title">{founder.why.headline}</h2>
            </div>
          </div>
          <div className="st-why-body" data-no-settle>
            <figure className="st-why-pic">
              <Image
                src="/images/drive/marc-river-cruise-deck.jpg"
                alt="Marc Haeni on the deck of a river cruise ship, a wooded riverbank behind him"
                fill
                sizes="(min-width: 1100px) 26vw, 70vw"
                className="fill photo-grade"
                style={{ objectPosition: '50% 30%' }}
              />
            </figure>
            <div className="st-why-text">
              {founder.why.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <Link className="btn btn-ink" href="/journeys">
                Explore our journeys
              </Link>
            </div>
          </div>
        </Reveal>

        {/* 04 — The name: one large line, its words filled with photographs, over four
            staggered frames, then what it means. */}
        <Reveal className="st-name" labelledBy="route-title">
          <h2 id="route-title" className="st-name-t" data-no-settle>
            {/* Each word filled with its own photograph: the Eiger's
                north face for the peaks, Cape Point's sea and cliffs for the
                shores (story.css). */}
            <span className="st-mask st-peaks">Peaks.</span> <span className="st-two">2.</span>{' '}
            <span className="st-mask st-shores">Shores.</span>
          </h2>
          <ul className="st-frames" data-no-settle>
            {NAME.map((stop, i) => (
              <li key={stop.src} className={`st-frame st-frame-${i + 1}`}>
                <figure>
                  <Image
                    src={stop.src}
                    alt={stop.alt}
                    fill
                    sizes="(min-width: 1100px) 22vw, 46vw"
                    className="fill photo-grade"
                    style={stop.pos ? { objectPosition: stop.pos } : undefined}
                  />
                </figure>
                <span className="st-frame-l">{founder.name.stops[i]?.label}</span>
              </li>
            ))}
          </ul>
          <div className="st-name-body" data-no-settle>
            {founder.name.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        {/* 05 — How we travel: the four principles beside a photograph that turns with them. */}
        <section className="st-how" aria-labelledby="pillars-title">
          <Reveal className="st-how-head">
            <p className="lab" data-no-settle>
              How we travel
            </p>
            <h2 id="pillars-title" data-no-settle>
              Four principles behind every journey.
            </h2>
          </Reveal>
          <div data-no-settle>
            <StoryPrinciples
              items={pillars.map((pillar, i) => ({
                title: pillar.title,
                lead: pillar.lead,
                body: pillar.body,
                ...PRINCIPLE_PHOTOS[i],
              }))}
            />
          </div>
        </section>

        {/* 06 — On the road: the founder's line over a film strip of guests. */}
        <Reveal className="st-road" label="On the road with Peaks2Shores">
          <p className="st-road-q" data-no-settle>
            {founder.quote.split('. ').map((part, i, all) => (
              <span key={part}>{i < all.length - 1 ? `${part}.` : part}</span>
            ))}
          </p>
          <div className="st-strip" data-no-settle>
            <ul className="st-strip-run">
              {[...ROAD, ...ROAD].map((photo, i) => (
                <li
                  key={`${photo.src}-${i}`}
                  className={`st-shot st-shot-${(i % ROAD.length) % 3}`}
                  aria-hidden={i >= ROAD.length || undefined}
                >
                  <Image
                    src={photo.src}
                    alt={i < ROAD.length ? photo.alt : ''}
                    fill
                    sizes="(min-width: 1100px) 22rem, 60vw"
                    className="fill photo-grade"
                    style={photo.pos ? { objectPosition: photo.pos } : undefined}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <DarkCta
        kicker="Plan your journey"
        headline="Your extraordinary journey begins here."
        body="Whether you’re joining one of our intimate luxury group journeys or dreaming of a privately tailored experience, we’d love to hear what inspires you. Share your travel aspirations with us, and our team will help bring them to life."
        href="/plan"
        cta="Plan your journey"
      />
    </>
  );
}

/** Marc's own portraits, for the founder. */
const MARC = {
  eiger: {
    src: '/images/marc-eiger.jpg',
    alt: 'Marc Haeni, founder of Peaks2Shores, in the VIP lounge of the Eiger Express in Grindelwald, a gondola passing the window behind him',
  },
  solothurn: {
    src: '/images/home/story-marc-solothurn.jpg',
    alt: 'Marc Haeni smiling in the old town of Solothurn, Switzerland',
  },
};

/** The founder's facts, as his story (founder.body) states them. */
const FACTS = [
  { term: 'Switzerland', detail: 'Born and raised' },
  { term: 'Miami', detail: 'Home for more than 25 years' },
  { term: 'Three decades', detail: 'In travel and hospitality' },
];

/** The four ideas of the name (founder.name.stops), each told by a photograph from the road. */
const NAME: { src: string; alt: string; pos?: string }[] = [
  {
    src: '/images/drive/marc-matterhorn-trail.jpg',
    alt: 'Marc Haeni on a mountain trail above Zermatt, the Matterhorn behind him',
  },
  {
    // Butterfly Valley, Fethiye: Pexels 12193796 (credits.json, story-shores-frame).
    src: '/images/story/shores-frame.jpg',
    alt: 'A turquoise cove from above, boats moored off a long beach beneath green cliffs',
  },
  {
    // A canal in Venice: Pexels 10768371 (credits.json, story-places-frame).
    src: '/images/story/places-frame.jpg',
    alt: 'Gondolas moored beside a stone bridge on a quiet canal in Venice, shuttered palazzi above',
    pos: '50% 62%',
  },
  {
    src: '/images/home/hw-personal-zambia.jpg',
    alt: 'Marc Haeni with two local experts on safari in Zambia',
    pos: '50% 30%',
  },
];

/** A photograph for each principle, in the pillars' order. */
const PRINCIPLE_PHOTOS: { img: string; alt: string; pos?: string }[] = [
  {
    img: '/images/drive/marc-bern-overlook.jpg',
    alt: 'Marc Haeni at an overlook above the old town of Bern and the river Aare',
    pos: '50% 35%',
  },
  {
    img: '/images/home/hw-seamless-dolomites-hotel.jpg',
    alt: 'A grand hotel on the shore of a mountain lake beneath the Dolomites',
  },
  {
    img: '/images/drive/switzerland-alpine-cheesemaker.jpg',
    alt: 'An alpine cheesemaker in his white apron beside the copper cauldron of his dairy',
    pos: '50% 35%',
  },
  {
    img: '/images/drive/switzerland-guests-grindelwald-bench.jpg',
    alt: 'Guests resting on a bench facing the peaks above Grindelwald',
  },
];

/** Guests on the road, for the film strip. */
const ROAD: { src: string; alt: string; pos?: string }[] = [
  {
    src: '/images/drive/switzerland-guests-lucerne-chapel-bridge.jpg',
    alt: 'A group of guests by the Chapel Bridge and Water Tower in Lucerne',
  },
  {
    src: '/images/drive/switzerland-guests-jungfraujoch.jpg',
    alt: 'Guests in the snow beside the Swiss flag on the Jungfraujoch',
    pos: '50% 60%',
  },
  {
    src: '/images/drive/south-africa-guests-african-feast.jpg',
    alt: 'Guests in colorful shirts sharing a long dinner table at an African feast',
  },
  {
    src: '/images/drive/switzerland-guests-matterhorn-selfie.jpg',
    alt: 'Four guests smiling in front of the Matterhorn above Zermatt',
  },
  {
    src: '/images/drive/botswana-chobe-group-lunch.jpg',
    alt: 'Guests sharing a long lunch table under a thatched roof in Chobe, Botswana',
    pos: '50% 65%',
  },
  {
    src: '/images/drive/switzerland-guests-lavaux-vineyards.jpg',
    alt: 'Two guests with glasses of wine above the Lavaux vineyards and Lake Geneva',
  },
  {
    src: '/images/drive/south-africa-guests-bo-kaap.jpg',
    alt: 'A group of guests before a pink wall painted with BO-KAAP in rainbow letters, Cape Town',
    pos: '50% 70%',
  },
];
