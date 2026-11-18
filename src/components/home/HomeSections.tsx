import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { circle, founderStory, statement } from '@/lib/data/home';
import { site } from '@/lib/site';
import { HomeMedia } from './HomeMedia';
import { QuoteWords } from './QuoteWords';
import './home-fixes.css';

/** 02 — The philosophy: Marc's statement, centered between two short blue rules. */
export function Intro() {
  return (
    <section className="hc-intro" aria-label="Our philosophy">
      <span className="rule" aria-hidden />
      <p>
        From the peaks to the shores, we design journeys to the places we know and love —{' '}
        <em>personally curated</em>, thoughtfully paced and enriched by meaningful experiences and
        connections.
      </p>
      {/* No call to action: the film above already offers the way on. */}
      <span className="rule" aria-hidden />
    </section>
  );
}

/** 05 — Marc's remark over the Cape Town film, set in full: the mark, the
    words and his name, on one centre axis with nothing drawn around them.
    The remark has no link of its own: the story follows a little further
    down the page. */
export function Statement() {
  return (
    <section className="hc-pause" aria-label="A word from our founder">
      <div className="bg" aria-hidden>
        <HomeMedia visual={statement.film} sizes="100vw" />
      </div>
      <div className="in">
        <span className="mark" aria-hidden>
          “
        </span>
        <QuoteWords before={statement.before} emphasis={statement.emphasis} after={statement.after}>
          <p className="credit">
            <span>{site.founder.name}</span> <b aria-hidden>·</b> <span>Founder, {site.name}</span>
          </p>
        </QuoteWords>
      </div>
    </section>
  );
}

/** 07b — The founder: his photograph in a narrow column with a quiet caption,
    the story beside it. */
export function FounderStory() {
  return (
    <section className="hc-fd story" id="story" aria-labelledby="founder-title">
      <figure className="img">
        <Image
          src={founderStory.portrait.img}
          alt={founderStory.portrait.alt}
          width={founderStory.portrait.width}
          height={founderStory.portrait.height}
          sizes="(max-width: 900px) 24rem, 30vw"
        />
        <figcaption>
          {site.founder.name} <span aria-hidden>|</span> Founder, {site.name}
        </figcaption>
      </figure>
      <div className="c">
        <p className="eyebrow">The Peaks2Shores story</p>
        <h2 id="founder-title">{founderStory.headline}</h2>
        {founderStory.body.map((p) => (
          <p key={p.slice(0, 24)} className="body">
            {p}
          </p>
        ))}
        <Link className="btn btn-ink" href="/our-story">
          Read Our Story <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/** 09 — The Circle: one invitation and one field, centred as one column over
    the herd at the waterhole (`invite`: the homepage's own setting of the
    band; /destinations shares `.hc-circle` without it). The ways to talk live
    in the footer, so the sign-up is the only action here. */
export function CircleBand() {
  return (
    <section className="hc-circle invite" id="circle" aria-labelledby="circle-title" data-fab-away>
      <div className="bg" aria-hidden>
        {/* On a phone the photograph runs the width of the screen; up to
            1351px wide the 1080px band crops it to 1352px wide (2400x1918). */}
        <Image
          src={circle.img}
          alt={circle.alt}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1351px) 1352px, 100vw"
          className="fill"
        />
      </div>
      <div className="in">
        <h2 id="circle-title">The Circle</h2>
        <p className="sub-h">{circle.headline}</p>
        {/* The band's own name is never broken across two lines. */}
        <p>{circle.body.replace('The Circle', 'The\u00a0Circle')}</p>
        <div className="form">
          <NewsletterForm variant="invite" />
        </div>
      </div>
    </section>
  );
}
