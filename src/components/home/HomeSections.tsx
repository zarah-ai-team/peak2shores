import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { circle, founderStory, statement } from '@/lib/data/home';
import { site } from '@/lib/site';
import { Film, HomeMedia } from './HomeMedia';
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

/** 05 — Marc's remark over his film, framed like a note and read word by word. */
export function Statement() {
  return (
    <section className="hc-pause framed" aria-label="A word from our founder">
      <div className="bg" aria-hidden>
        <HomeMedia visual={statement.film} sizes="100vw" />
      </div>
      <span className="frame" aria-hidden />
      <span className="mark" aria-hidden>
        “
      </span>
      <div className="in">
        <QuoteWords before={statement.before} emphasis={statement.emphasis} after={statement.after}>
          <p className="credit">
            <i aria-hidden />
            <span>
              {site.founder.name} <b aria-hidden>·</b> Founder, {site.name}
            </span>
            <i aria-hidden />
          </p>
          <Link className="qlink" href="#story">
            Discover the Peaks2Shores story <span aria-hidden>→</span>
          </Link>
        </QuoteWords>
      </div>
    </section>
  );
}

/** 07b — The founder: his film in a narrow column with a quiet caption, the story beside it. */
export function FounderStory() {
  return (
    <section className="hc-fd story" id="story" aria-labelledby="founder-title">
      <figure className="img">
        <Film src={founderStory.film.src} label={founderStory.film.label} />
        <figcaption>
          {site.founder.name} <span aria-hidden>|</span> Founder, {site.name}
        </figcaption>
      </figure>
      <div className="c">
        <p className="eyebrow">
          The Peaks2Shores story
        </p>
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

/** 09 — The Circle: one invitation and one field, over the coast. The ways to
    talk live in the footer, so the sign-up is the only action here. */
export function CircleBand() {
  return (
    <section className="hc-circle" id="circle" aria-labelledby="circle-title" data-fab-away>
      <div className="bg" aria-hidden>
        <Image src={circle.img} alt={circle.alt} fill sizes="100vw" className="fill" />
      </div>
      <div className="in">
        <h2 id="circle-title">The Circle</h2>
        <p className="sub-h">{circle.headline}</p>
        <p>{circle.body}</p>
        <div className="form">
          <NewsletterForm variant="invite" />
        </div>
      </div>
    </section>
  );
}
