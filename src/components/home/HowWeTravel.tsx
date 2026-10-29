'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { beliefs } from '@/lib/data/copy';
import { Chevron } from './HomeMedia';
import { TiltCards } from './TiltCards';
import './why-home.css';

/**
 * How we travel — the why: six tall night-blue cards in a rail, the second,
 * fourth and sixth set lower. Four show at a time on a desktop; the arrows
 * (top right) slide the rest in and the blue line beneath follows. It is a
 * plain scroller underneath, so it swipes on a phone and scrolls without
 * script. Under a mouse a card tilts toward the pointer (TiltCards). The last
 * card closes the row with the way on, and a bridge leads to what is included
 * on every journey (#experience).
 */
export function HowWeTravel() {
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [bar, setBar] = useState(0.7);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const room = el.scrollWidth - el.clientWidth;
    const at = room > 0 ? el.scrollLeft / room : 1;
    const seen = el.clientWidth / el.scrollWidth;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft > room - 4 });
    setBar(seen + (1 - seen) * at);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  /* One card along per press. */
  const slide = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>('.card');
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(card.parentElement!).columnGap) || 0;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: still ? 'auto' : 'smooth' });
  };

  return (
    <section className="hc-hw" aria-labelledby="how-title">
      <div className="hw-head dk">
        <div>
          <p className="hw-lab lab">The why</p>
          <h2 id="how-title">How we travel</h2>
          <p className="hw-sub">The beliefs behind every journey.</p>
        </div>
        <div className="hw-nav">
          <button
            type="button"
            className="circ"
            aria-label="Previous cards"
            aria-controls="how-rail"
            disabled={edge.start}
            onClick={() => slide(-1)}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="circ"
            aria-label="Next cards"
            aria-controls="how-rail"
            disabled={edge.end}
            onClick={() => slide(1)}
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div
        className="hw-rail"
        ref={rail}
        id="how-rail"
        role="region"
        tabIndex={0}
        aria-label="Six beliefs, scroll sideways for more"
      >
        <TiltCards className="hw-cards">
          {beliefs.map((b, i) => {
            const n = String(i + 1).padStart(2, '0');
            const last = !b.img;
            return (
              <li key={b.label} className={`card ${last ? 'cta' : ''}`}>
                {last && (
                  <svg className="hw-lines" viewBox="0 0 360 170" fill="none" aria-hidden>
                    <path
                      d="M0 120 L70 70 L100 92 L160 22 L210 86 L240 64 L300 112 L360 84"
                      stroke="#d8b27a"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M0 140 C30 130 60 130 90 140 S150 150 180 140 S240 130 270 140 S330 150 360 140"
                      stroke="#7accfd"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M0 158 C30 148 60 148 90 158 S150 168 180 158 S240 148 270 158 S330 168 360 158"
                      stroke="#7accfd"
                      strokeWidth="1.2"
                      opacity="0.6"
                    />
                  </svg>
                )}
                <p className="kick">
                  <span className="n">{n}</span>
                  <span className="k">
                    {b.label}
                    {!last && (
                      <span className="plus" aria-hidden>
                        +
                      </span>
                    )}
                  </span>
                </p>
                <div className="body">
                  <h3>{b.title}</h3>
                  {!last && <span className="rule" aria-hidden />}
                  <p className="note">{b.body}</p>
                  {last && (
                    <Link className="hw-gold" href="/plan">
                      Plan Your Journey
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  )}
                </div>
                {b.img && (
                  <div className="ph">
                    <Image
                      src={b.img}
                      alt={b.alt ?? ''}
                      fill
                      sizes="(max-width: 700px) 80vw, (max-width: 1100px) 40vw, 20vw"
                      className="fill"
                      style={{ objectPosition: b.pos }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </TiltCards>
      </div>

      <div className="hw-foot">
        <div className="hw-prog" aria-hidden>
          <span style={{ width: `${Math.round(bar * 100)}%` }} />
        </div>
        <a className="hw-next" href="#experience">
          And what that means on every journey
          <span aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
