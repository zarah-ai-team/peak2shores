import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import '@/components/home/home.css';
import '@/components/experiences/experiences.css';
import '@/components/experiences/way.css';
import { WayReveal } from '@/components/experiences/WayReveal';
import { getJourneys, pageMetadata } from '@/lib/content';
import { horizon, type HorizonJourney } from '@/lib/data/copy';
import { wayBySlug, wayPages, type WayPhoto } from '@/lib/data/ways';
import { getMedia } from '@/lib/media';
import { RATES_TBA } from '@/lib/journeys';
import { site, whatsappHref } from '@/lib/site';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
/* The small group page lists the journeys, so it is rebuilt hourly with them. */
export const revalidate = 3600;

export function generateStaticParams() {
  return wayPages.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const way = wayBySlug((await params).slug);
  if (!way) return { title: 'Page not found', robots: { index: false, follow: true } };
  return pageMetadata({
    title: way.title,
    description: way.line,
    path: `/experiences/${way.slug}`,
  });
}

/**
 * One way to travel, in the Experiences page's language: a full-bleed
 * photograph with the way's name, the paragraph that opens it, then what
 * Peaks2Shores offers in three parts, each beside two or three photographs
 * (the side alternating), the journeys themselves on the small group page,
 * the journeys in the making on a page that has them (the safaris), the
 * other ways, and a call to begin. The footer is the site's own.
 */
export default async function WayPage({ params }: Params) {
  const way = wayBySlug((await params).slug);
  if (!way) notFound();
  const others = wayPages.filter((w) => w.slug !== way.slug);
  const journeys = way.slug === 'small-group' ? await getJourneys() : [];
  const soon = (way.soon?.journeys ?? [])
    .map((slug) => horizon.find((journey) => journey.slug === slug))
    .filter((journey): journey is HorizonJourney => Boolean(journey));

  return (
    <div className="hc xp wy">
      {/* 01 — The opening. */}
      <section data-hero aria-labelledby="wy-title" className="xp-hero wy-hero">
        <div className="media">
          <Image
            src={way.hero.src}
            alt={way.hero.alt}
            fill
            priority
            // The whole screen: on an upright phone or tablet the photograph
            // is drawn by the screen's height, so its file is chosen wider,
            // as for the homepage's opening (at 100vw a 3:2 photograph was
            // drawn three times its file's width on a phone).
            sizes="(max-width: 900px) and (orientation: portrait) 160vw, 100vw"
            className="fill photo-grade"
            style={way.hero.pos ? { objectPosition: way.hero.pos } : undefined}
          />
        </div>
        <div className="shade" />
        <div className="copy">
          <p className="lab eb">
            <i />
            <Link href="/experiences#ways-title">Ways to travel</Link>
          </p>
          <h1 id="wy-title">{way.title}</h1>
          <p className="intro">{way.line}</p>
        </div>
      </section>

      {/* 02 — What it is. */}
      <WayReveal className="wy-lead" label={`${way.title}: in short`}>
        <p className="lab">What we offer</p>
        <p className="wy-lead-t">{way.lead}</p>
      </WayReveal>

      {/* 03 — The three parts: the first with its words between its
          photographs, the others beside them, the side alternating. */}
      {way.parts.map((part, i) => {
        const copy = (
          <div className="wy-copy">
            <p className="lab">{part.label}</p>
            <h2 id={`wy-part-${i + 1}`}>{part.title}</h2>
            <p className="wy-body">{part.body}</p>
            <ul className="wy-points">
              {part.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        );
        if (i === 0) {
          const [first, ...rest] = part.photos;
          return (
            <WayReveal key={part.title} className="wy-part wy-mid" labelledBy="wy-part-1">
              <div className="wy-side wy-left">{first && <Photo photo={first} lead />}</div>
              {copy}
              <div className={`wy-side wy-right wy-k${rest.length}`}>
                {rest.map((photo) => (
                  <Photo key={photo.src} photo={photo} lead={false} />
                ))}
              </div>
            </WayReveal>
          );
        }
        return (
          <WayReveal
            key={part.title}
            className={`wy-part ${i % 2 ? 'wy-flip' : ''}`}
            labelledBy={`wy-part-${i + 1}`}
          >
            {copy}
            <div className={`wy-photos wy-n${part.photos.length}`}>
              {part.photos.map((photo, j) => (
                <Photo key={photo.src} photo={photo} lead={j === 0} />
              ))}
            </div>
          </WayReveal>
        );
      })}

      {/* 04 — The journeys themselves (small group only). */}
      {journeys.length > 0 && (
        <WayReveal className="wy-journeys" labelledBy="wy-journeys-title">
          <div className="xp-head">
            <div>
              <p className="lab">The journeys</p>
              <h2 id="wy-journeys-title">Travel with us this season.</h2>
            </div>
            <Link className="tlink" href="/journeys">
              All journeys →
            </Link>
          </div>
          <ul className="wy-jlist">
            {journeys.map((journey) => {
              const photo = getMedia(journey.cardMedia ?? journey.listMedia);
              return (
                <li key={journey.slug}>
                  <Link href={`/journeys/${journey.slug}`} className="wy-jcard">
                    <span className="pic">
                      {photo.src && (
                        <Image
                          src={photo.src}
                          alt=""
                          fill
                          sizes="(min-width: 1100px) 26rem, (min-width: 641px) 50vw, 100vw"
                          className="fill photo-grade"
                        />
                      )}
                    </span>
                    <span className="k">
                      {journey.days} days · {journey.region}
                    </span>
                    <span className="t">{journey.title}</span>
                    <span className="f">
                      {journey.departureWindow} ·{' '}
                      {journey.priceFrom ? `From ${journey.priceFrom}` : RATES_TBA}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </WayReveal>
      )}

      {/* 04b — The journeys in the making this way, as coming soon (the
          safaris: Southern Africa, Kenya & Tanzania), with the Journey Book's
          photographs. No page yet, so no link: The Circle hears first. */}
      {way.soon && soon.length > 0 && (
        <WayReveal className="wy-journeys wy-soon" labelledBy="wy-soon-title">
          <div className="xp-head">
            <div>
              <p className="lab">{way.soon.label}</p>
              <h2 id="wy-soon-title">{way.soon.title}</h2>
            </div>
            <Link className="tlink" href="/#circle">
              Hear first in The Circle →
            </Link>
          </div>
          <ul className="wy-jlist wy-jlist-soon">
            {soon.map((journey) => (
              <li key={journey.slug}>
                <article
                  className="wy-jcard wy-jcard-soon"
                  aria-labelledby={`soon-${journey.slug}`}
                >
                  <span className="pic">
                    <Image
                      src={journey.photo.src}
                      alt={journey.photo.alt}
                      fill
                      sizes="(min-width: 1100px) 40rem, (min-width: 641px) 50vw, 100vw"
                      className="fill photo-grade"
                      style={journey.photo.pos ? { objectPosition: journey.photo.pos } : undefined}
                    />
                  </span>
                  <span className="k">Coming soon · {journey.place}</span>
                  <h3 id={`soon-${journey.slug}`} className="t">
                    {journey.title}
                  </h3>
                  <span className="f">{journey.line}</span>
                </article>
              </li>
            ))}
          </ul>
        </WayReveal>
      )}

      {/* 05 — The other ways, arriving quietly (way.css). */}
      <WayReveal className="wy-more" labelledBy="wy-more-title">
        <div className="xp-head" data-no-settle>
          <div>
            <p className="lab">More ways to travel</p>
            <h2 id="wy-more-title">Or travel another way.</h2>
          </div>
        </div>
        <ul className="wy-mlist" data-no-settle>
          {others.map((w) => (
            <li key={w.slug}>
              <Link href={`/experiences/${w.slug}`} className="wy-mcard">
                <span className="pic">
                  <Image
                    src={w.hero.src}
                    alt=""
                    fill
                    sizes="(min-width: 1100px) 16rem, (min-width: 641px) 33vw, 50vw"
                    className="fill photo-grade"
                    style={w.hero.pos ? { objectPosition: w.hero.pos } : undefined}
                  />
                </span>
                <span className="t">{w.title}</span>
                <span className="f">{w.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </WayReveal>

      {/* 06 — The one way on. */}
      <WayReveal className="xp-ask" labelledBy="ask-title">
        <div>
          <p className="lab">Speak to a travel designer</p>
          <h2 id="ask-title">Every journey begins with a conversation.</h2>
        </div>
        <div>
          <p>
            <Reach /> Tell us how you love to travel, and we will shape the rest around you.
          </p>
          {/* `data-fab-clear`: the floating "Connect with our team" steps
              aside rather than sit over these at the foot of the screen. */}
          <div className="wy-ctas" data-fab-clear>
            <Link className="btn btn-ink" href={way.cta.href}>
              {way.cta.label}
            </Link>
            <Link className="tlink" href="/plan#contact">
              Connect with our team →
            </Link>
          </div>
        </div>
      </WayReveal>
    </div>
  );
}

/**
 * The ways to reach us that exist, as one sentence: "Call us on +1 786 253
 * 5050 or write to welcome@peaks2shores.com." WhatsApp and a time to book
 * join it once site.ts has a number and a scheduling link; until then the
 * page does not offer them (Ishika's notes of 24 Nov 2026).
 */
function Reach() {
  const wa = whatsappHref();
  const ways = [
    site.phone && site.phoneHref
      ? { lead: 'call us on', text: site.phone, href: `tel:${site.phoneHref}`, away: false }
      : null,
    wa ? { lead: 'message us on', text: 'WhatsApp', href: wa, away: true } : null,
    site.bookingUrl
      ? { lead: 'book', text: 'a time that suits you', href: site.bookingUrl, away: true }
      : null,
    { lead: 'write to', text: site.email, href: `mailto:${site.email}`, away: false },
  ].filter((way) => way !== null);
  const last = ways.length - 1;
  return ways.map((way, i) => (
    <Fragment key={way.href}>
      {i === 0 ? way.lead.charAt(0).toUpperCase() + way.lead.slice(1) : way.lead}{' '}
      <a href={way.href} {...(way.away ? { target: '_blank', rel: 'noopener' } : {})}>
        {way.text}
      </a>
      {i === last ? '.' : i === last - 1 ? ' or ' : ', '}
    </Fragment>
  ));
}

/**
 * One photograph of a part: the first the larger, the others smaller beside
 * or below it. One marked `whole` is shown entire, over a blurred fill of
 * itself, rather than cropped to the frame.
 */
function Photo({ photo, lead }: { photo: WayPhoto; lead: boolean }) {
  const sizes = lead ? '(min-width: 1100px) 50rem, 100vw' : '(min-width: 1100px) 32rem, 100vw';
  return (
    <figure className={`wy-ph ${lead ? 'wy-ph-lead' : ''} ${photo.whole ? 'wy-whole' : ''}`}>
      {photo.whole && (
        <Image src={photo.src} alt="" aria-hidden fill sizes="24rem" className="fill wy-blur" />
      )}
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        className="fill photo-grade"
        style={photo.pos ? { objectPosition: photo.pos } : undefined}
      />
    </figure>
  );
}
