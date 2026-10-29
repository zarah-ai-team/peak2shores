'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { hotels } from '@/lib/data/home';
import { HomeMedia } from './HomeMedia';

/**
 * 08 — Hotels, lodges & camps: five tall cards that turn over on hover or
 * tap to show the one detail that earns the place its booking and what lies
 * near it. Five across on a wide screen, a swiped rail below that. A bracketed
 * value is still to come from Marc and is set in rust so it cannot ship
 * unnoticed.
 */
export function HotelFlips() {
  const [flipped, setFlipped] = useState(-1);

  return (
    <section className="hc-hot" aria-labelledby="hotels-title">
      <div className="head">
        <div>
          <div className="lab">Hotels, lodges &amp; camps</div>
          <h2 id="hotels-title">
            Chosen for what they contribute to the journey, far beyond their star rating.
          </h2>
        </div>
        <p>Each place we stay earns its place for a reason we can name.</p>
      </div>

      <div className="flips">
        {hotels.map((h, i) => {
          const placeholder = (v: string) => (v.startsWith('[') ? 'ph' : undefined);
          const id = `hotel-${i}`;
          return (
            <button
              key={h.name}
              type="button"
              className={`flip ${i === flipped ? 'on' : ''}`}
              aria-pressed={i === flipped}
              // Named by what it shows (place and hotel); the turned side's
              // details are its description, so they are read without turning.
              aria-labelledby={`${id}-place ${id}-name`}
              aria-describedby={`${id}-more`}
              onClick={() => setFlipped(i === flipped ? -1 : i)}
            >
              <span className="fin">
                <span className="face">
                  <HomeMedia visual={h} sizes="(max-width: 1100px) 100vw, 33vw" />
                  <span className="fs" />
                  <span className="fb">
                    <span className="lab" id={`${id}-place`}>
                      {h.place}
                    </span>
                    <h3 id={`${id}-name`}>{h.name}</h3>
                  </span>
                </span>
                <span className="face back">
                  {/* A second view of the place, so the turned side is a picture too. */}
                  <span className="bimg" aria-hidden>
                    <Image
                      src={h.back ?? h.img}
                      alt={(h.back && h.backAlt) || h.alt}
                      fill
                      sizes="(max-width: 1400px) 360px, 20vw"
                      className="fill"
                    />
                  </span>
                  {/* The name again, for the eye only: it is already the button's name. */}
                  <span aria-hidden>
                    <span className="lab">{h.place}</span>
                    <span className="hn">{h.name}</span>
                  </span>
                  <dl id={`${id}-more`}>
                    <div>
                      <dt>Signature detail</dt>
                      <dd className={placeholder(h.signature)}>{h.signature}</dd>
                    </div>
                    <div>
                      <dt>Nearby</dt>
                      <dd className={placeholder(h.nearby)}>{h.nearby}</dd>
                    </div>
                  </dl>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flip-hint">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" />
        </svg>
        Hover or tap to turn over
      </div>
      <div className="ctarow left">
        <Link className="btn btn-light" href="/destinations">
          Where we stay
        </Link>
      </div>
    </section>
  );
}
