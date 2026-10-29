'use client';

import { useState } from 'react';
import Link from 'next/link';
import { principles } from '@/lib/data/home';
import { Chevron, HomeMedia } from './HomeMedia';

/**
 * 06 — Why Peaks2Shores: the four principles as panels that open on hover,
 * focus or tap. The open one takes most of the row and shows its name and
 * line; the others narrow to a photograph with the name set upright. One is
 * always open, so nothing is hidden from a reader who never interacts.
 */
export function WhyPeaks() {
  const [open, setOpen] = useState(0);
  const n = principles.length;

  return (
    <section className="hc-why" aria-labelledby="why-title">
      <div className="head dk">
        {/* The section's name, then its line: the same pattern as every home section. */}
        <div>
          <h2 id="why-title">Why Peaks2Shores</h2>
          <p className="sub-h">The moments that bring a journey to life.</p>
        </div>
        <div className="nav" style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="circ"
            aria-label="Previous principle"
            onClick={() => setOpen((open + n - 1) % n)}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="circ"
            aria-label="Next principle"
            onClick={() => setOpen((open + 1) % n)}
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="row">
        {principles.map((p, i) => (
          <button
            key={p.title}
            type="button"
            className={`pc ${i === open ? 'on' : ''}`}
            aria-expanded={i === open}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => setOpen(i)}
          >
            <HomeMedia visual={p} active={i === open} sizes="(max-width: 900px) 100vw, 55vw" />
            <span className="ps" />
            <span className="pn">{String(i + 1).padStart(2, '0')}</span>
            <span className="pv" aria-hidden>
              {p.title}
            </span>
            <span className="pb">
              <h3>{p.title}</h3>
              <span className="d">{p.line}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="ctarow left">
        <Link className="btn btn-ink" href="/our-story">
          How we travel
        </Link>
      </div>
    </section>
  );
}
