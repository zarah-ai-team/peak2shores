'use client';

import { useState } from 'react';
import Link from 'next/link';
import { experiences } from '@/lib/data/home';
import { HomeMedia } from './HomeMedia';

/**
 * 08b — Experiences & connections: four words set very large down the left.
 * Pointing at one (or focusing or tapping it) brings up its photograph or
 * film behind the whole section and its line on the right.
 */
export function ExperienceWords() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="hc-xp" aria-labelledby="xp-title">
      {experiences.map((x, i) => (
        <div key={x.word} className={`xbg ${i === current ? 'on' : ''}`} aria-hidden>
          <HomeMedia visual={x} active={i === current} sizes="100vw" />
        </div>
      ))}
      <div className="xshade" />

      <div className="xin">
        <div className="lab" id="xp-title">
          Experiences &amp; connections
        </div>
        <ul>
          {experiences.map((x, i) => (
            <li key={x.word}>
              <button
                type="button"
                className={`xw ${i === current ? 'on' : ''}`}
                aria-pressed={i === current}
                onMouseEnter={() => setCurrent(i)}
                onFocus={() => setCurrent(i)}
                onClick={() => setCurrent(i)}
              >
                {x.word}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="xside">
        <p aria-live="polite">{experiences[current].line}</p>
        <div className="tbtns">
          <Link className="btn btn-light" href="/experiences">
            All experiences
          </Link>
          <Link className="btn btn-line" href="/plan">
            Plan your journey
          </Link>
        </div>
      </div>
    </section>
  );
}
