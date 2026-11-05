'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';

export type HeroPlace = {
  name: string;
  /** "3 nights", or "Along the way" for a stop with no night. */
  stay: string;
  img?: string;
  alt: string;
};

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
            sizes="100vw"
            quality={85}
          />
        )}
        {places.map((p, k) =>
          p.img ? (
            <Image
              key={p.name}
              className={`fill${shown === k ? ' on' : ''}`}
              src={p.img}
              alt={shown === k ? p.alt : ''}
              aria-hidden={shown !== k}
              fill
              sizes="100vw"
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
                  onMouseEnter={() => setOn(k)}
                  onFocus={() => setOn(k)}
                  onBlur={() => setOn(-1)}
                  onClick={() => setOn((cur) => (cur === k ? -1 : k))}
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
