'use client';

import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';

export type HeroPlace = {
  name: string;
  /** "3 nights", or "Along the way" for a stop with no night. */
  stay: string;
  img?: string;
  alt: string;
};

/* On a phone the hero is taller than it is wide, so the landscape photograph
   is cropped to fill the height and shows at two to three times the screen's
   width: ask the optimizer for that much, or it is drawn soft. */
const HERO_SIZES = '(max-width: 800px) 230vw, 100vw';

/**
 * The journey page's hero, after the notes of 5 November 2026: the photograph,
 * and along the route each place with its nights. Pointing at a place (or
 * tabbing to it) crossfades the photograph to that place; leaving returns it
 * to the journey's own. Only opacity changes: no zoom, no movement.
 */
export function HeroStage({
  media,
  places,
  children,
}: {
  media: { src?: string; alt?: string };
  places: HeroPlace[];
  /** The breadcrumb, title and lead line, above the route. */
  children: ReactNode;
}) {
  const [on, setOn] = useState(-1);
  // The places' photographs load only once they can be asked for: after the
  // page has loaded where there is a pointer to hover with, and on a touch
  // screen at the first tap on the route, so a phone never downloads five
  // full-screen photographs it may not show.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const go = () => setWarm(true);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => window.removeEventListener('load', go);
  }, []);
  const show = (k: number) => {
    setWarm(true);
    setOn(k);
  };
  const shown = on >= 0 && places[on]?.img ? on : -1;

  return (
    <>
      <div className="hero-bg">
        {media.src && (
          <Image
            className={`fill${shown === -1 ? ' on' : ''}`}
            src={media.src}
            alt={media.alt ?? ''}
            fill
            priority
            sizes={HERO_SIZES}
            quality={85}
          />
        )}
        {places.map((p, k) =>
          warm && p.img ? (
            <Image
              key={p.name}
              className={`fill${shown === k ? ' on' : ''}`}
              src={p.img}
              alt={shown === k ? p.alt : ''}
              aria-hidden={shown !== k}
              fill
              sizes={HERO_SIZES}
              quality={85}
            />
          ) : null,
        )}
      </div>
      <div className="hero-shade" aria-hidden />
      <div className="hero-c">
        {children}
        {places.length > 1 && (
          <ol className="hroute" aria-label="The route" onMouseLeave={() => setOn(-1)}>
            {places.map((p, k) => (
              <li key={p.name} className={on === k ? 'on' : undefined}>
                <button
                  type="button"
                  aria-pressed={on === k}
                  aria-label={`${p.name}, ${p.stay}: show a photograph of ${p.name}`}
                  onMouseEnter={() => show(k)}
                  onFocus={() => show(k)}
                  onBlur={() => setOn(-1)}
                  onClick={() => {
                    setWarm(true);
                    setOn((cur) => (cur === k ? -1 : k));
                  }}
                >
                  <span className="nm">{p.name}</span>
                  <span className="ns">{p.stay}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
