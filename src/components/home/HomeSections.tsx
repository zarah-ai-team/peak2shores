import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { circle, founderStory, statement } from '@/lib/data/home';
import { site, whatsappHref } from '@/lib/site';
import { HomeMedia } from './HomeMedia';

/** 02 — The short introduction, set large and centered after the film. */
export function Intro() {
  return (
    <section className="hc-intro" aria-label="About Peaks2Shores">
      <div className="lab">Peaks2Shores</div>
      <p>
        From the peaks to the shores, we design journeys to the places we know and love —{' '}
        <em>personally curated</em>, thoughtfully paced and enriched by meaningful experiences and
        connections.
      </p>
      {/* No call to action: this is the brand statement, an editorial pause
          between the film (which already offers the way on) and the ways to
          travel. */}
    </section>
  );
}

/** 05 — Marc's line over his film of the journeys: a pause between the journeys and the principles. */
export function Statement() {
  return (
    <section className="hc-pause" aria-label="Founder statement">
      <div className="bg" aria-hidden>
        <HomeMedia visual={statement.film} sizes="100vw" />
      </div>
      <div className="in">
        <span className="mark" aria-hidden>
          “
        </span>
        <blockquote>
          {statement.before}
          <em>{statement.emphasis}</em>
          {statement.after}
        </blockquote>
        <cite>
          {site.founder.name} · Founder, {site.name}
        </cite>
        <div className="ctarow">
          <Link className="tlink light" href="#name">
            Discover the Peaks2Shores story →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 07b — The founder: his portrait on stone, the story beside it. */
export function FounderStory() {
  return (
    <section className="hc-fd" id="story" aria-labelledby="founder-title">
      <div className="img">
        <Image
          src={founderStory.portrait.img}
          alt={founderStory.portrait.alt}
          fill
          sizes="(max-width: 900px) 100vw, 42vw"
          className="fill"
        />
      </div>
      <div className="c">
        <div className="lab">The Peaks2Shores story</div>
        <h2 id="founder-title">{founderStory.headline}</h2>
        <p>{founderStory.body}</p>
        <div className="ctarow left" style={{ marginTop: 0 }}>
          <Link className="btn btn-ink" href="/our-story">
            Our story
          </Link>
        </div>
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
        <Image src={circle.img} alt="" fill sizes="100vw" className="fill" />
      </div>
      <div className="in">
        <div className="lab">The circle</div>
        <h2 id="circle-title">{circle.headline}</h2>
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
