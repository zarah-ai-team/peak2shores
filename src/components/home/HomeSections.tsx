import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { circle, founderStory, statement } from '@/lib/data/home';
import { site, whatsappHref } from '@/lib/site';
import { HomeMedia } from './HomeMedia';
import { QuoteWords } from './QuoteWords';
import './home-fixes.css';

/** 02 — The philosophy: Marc's statement, centered between two short gold rules. */
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

/** 07b — The founder: his portrait on the left, the story beside a gold rule. */
export function FounderStory() {
  return (
    <section className="hc-fd story" id="story" aria-labelledby="founder-title">
      <figure className="img">
        <Image
          src={founderStory.portrait.img}
          alt={founderStory.portrait.alt}
          fill
          sizes="(max-width: 900px) 100vw, 42vw"
          className="fill"
        />
        <figcaption>
          <span className="nm">{site.founder.name}</span>
          <span className="rl">Founder, {site.name}</span>
        </figcaption>
      </figure>
      <div className="c">
        <span className="vline" aria-hidden />
        <p className="eyebrow">
          <i aria-hidden />
          The Peaks2Shores story
        </p>
        <h2 id="founder-title">{founderStory.headline}</h2>
        <p className="body">{founderStory.body}</p>
        <dl className="facts">
          <div>
            <dt>Where it began</dt>
            <dd>Switzerland</dd>
          </div>
          <div>
            <dt>Based in Miami</dt>
            <dd>25+ years</dd>
          </div>
        </dl>
        <Link className="btn btn-ink" href="/our-story">
          Read our story <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/** 09 — The circle: the letter sign-up and every way to talk, over the coast. */
export function CircleBand() {
  const whatsapp = whatsappHref();
  return (
    <section className="hc-circle" id="circle" aria-labelledby="circle-title" data-fab-away>
      <div className="bg" aria-hidden>
        <Image src={circle.img} alt={circle.alt} fill sizes="100vw" className="fill" />
      </div>
      <div className="in">
        <h2 id="circle-title">The circle</h2>
        <p className="sub-h">{circle.headline}</p>
        <p>{circle.body}</p>
        <div className="form">
          <NewsletterForm variant="dark" />
        </div>
        <div className="talk">
          {site.phone && site.phoneHref && (
            <span>
              <b>Speak to a travel designer</b>
              <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
            </span>
          )}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener">
              WhatsApp
            </a>
          )}
          <a href={site.bookingUrl ?? '/plan#contact'}>Book a call</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </section>
  );
}
