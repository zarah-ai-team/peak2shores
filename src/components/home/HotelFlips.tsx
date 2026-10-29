'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { hotels } from '@/lib/data/home';
import { Chevron, HomeMedia } from './HomeMedia';

/**
 * 08 — Hotels, lodges & camps: five tall cards that turn over on hover or
 * tap to show the one detail that earns the place its booking and what lies
 * near it. Five across on a wide screen, a rail below that: swiped on a touch
 * screen, moved with the arrows beside the hint on a desktop. A bracketed
 * value is still to come from Marc and is set in rust so it cannot ship
 * unnoticed.
 *
 * Where a mouse turns a card by resting on it (CSS), its click does nothing:
 * a click that also toggled the card left it stuck turned, or turning back
 * under the pointer. A tap or Enter turns one card at a time.
 */
export function HotelFlips() {
  const [flipped, setFlipped] = useState(-1);
  const pointer = useRef('');
  const rail = useRef<HTMLDivElement>(null);

  /* One card and the gap after it, read from the page (both follow the viewport). */
  const move = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>('.flip');
    if (!el || !card) return;
    const step = card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className="hc-hot" aria-labelledby="hotels-title">
      <div className="head">
        <div>
          <h2 id="hotels-title">Hotels, lodges &amp; camps</h2>
          <p className="sub-h">
            Chosen for what they contribute to the journey, far beyond their star rating.
          </p>
        </div>
        <p>Each place we stay earns its place for a reason we can name.</p>
      </div>

      <div className="flips" ref={rail}>
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
              onPointerDown={(e) => {
                pointer.current = e.pointerType;
              }}
              onClick={(e) => {
                // A mouse click (never Enter or Space, whose clicks have no
                // detail), and only where the stylesheet turns cards on hover.
                const byHover =
                  e.detail > 0 &&
                  pointer.current === 'mouse' &&
                  window.matchMedia('(hover: hover) and (pointer: fine)').matches;
                if (!byHover) setFlipped(i === flipped ? -1 : i);
              }}
            >
              <span className="fin">
                <span className="face">
                  <HomeMedia
                    visual={h}
                    sizes="(max-width: 600px) 82vw, (max-width: 1699px) 360px, 20vw"
                  />
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
                      sizes="(max-width: 1699px) 360px, 20vw"
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

      <div className="flip-foot">
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
        <div className="fnav">
          <button
            type="button"
            className="circ"
            aria-label="Previous hotels"
            onClick={() => move(-1)}
          >
            <Chevron dir="left" />
          </button>
          <button type="button" className="circ" aria-label="Next hotels" onClick={() => move(1)}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>
      <div className="ctarow left">
        <Link className="btn btn-light" href="/destinations">
          Where we stay
        </Link>
      </div>
    </section>
  );
}
