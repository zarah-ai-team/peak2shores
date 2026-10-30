'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { rhythm } from '@/lib/data/copy';
import { HomeMedia } from './HomeMedia';
import './why-home.css';

/**
 * 08b — The rhythm of every journey: Taste · Meet · Pause · Wander, set very
 * large down the left. Each word is a button; left alone they move on every
 * six seconds, a blue line filling under the one in play. Its photograph (or
 * film) fills the section, and on the right its line and a real example.
 *
 * The line's own animation keeps the time: when it ends, the next word comes
 * in, so pausing the animation pauses the rotation. It pauses under the
 * pointer, while anything in the section has focus, and while the section is
 * off screen; under reduced motion there is no animation, so nothing moves on
 * its own.
 */
export function ExperienceWords() {
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState({ hover: false, focus: false });
  const section = useRef<HTMLElement>(null);
  const n = rhythm.length;

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const running = inView && !held.hover && !held.focus;

  return (
    <section
      ref={section}
      className={`hc-rh ${running ? 'run' : ''}`}
      aria-labelledby="rh-title"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld((h) => ({ ...h, hover: true }))}
      onPointerLeave={() => setHeld((h) => ({ ...h, hover: false }))}
      onFocus={() => setHeld((h) => ({ ...h, focus: true }))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld((h) => ({ ...h, focus: false }));
      }}
    >
      {rhythm.map((x, i) => (
        <div key={x.word} className={`rbg ${i === current ? 'on' : ''}`} aria-hidden>
          <HomeMedia visual={x} active={i === current} sizes="100vw" />
        </div>
      ))}
      <div className="rshade" />

      <div className="rin">
        <h2 className="lab" id="rh-title">
          The Rhythm of Every Journey
        </h2>
        <ul>
          {rhythm.map((x, i) => (
            <li key={x.word}>
              <button
                type="button"
                className={`rw ${i === current ? 'on' : ''}`}
                aria-pressed={i === current}
                aria-controls="rh-copy"
                onClick={() => setCurrent(i)}
              >
                <span className="rn" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <em>{x.word}</em>
                {i === current && (
                  <span className="rprog" aria-hidden>
                    <span key={current} onAnimationEnd={() => setCurrent((c) => (c + 1) % n)} />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {/* Says the words are choices, not a list. */}
        <p className="rhint" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10" />
            <path d="M12 9.5a1.5 1.5 0 0 1 3 0V11" />
            <path d="M15 10.5a1.5 1.5 0 0 1 3 0v3.5a6 6 0 0 1-6 6h-.7a6 6 0 0 1-4.6-2.2L4.4 15a1.6 1.6 0 0 1 2.4-2.1L9 15" />
          </svg>
          Choose an experience
        </p>
      </div>

      <div className="rside">
        <div className="rcopies" id="rh-copy">
          {rhythm.map((x, i) => (
            <div
              key={x.word}
              className={`rcopy ${i === current ? 'on' : ''}`}
              aria-hidden={i !== current}
            >
              <p className="rline">{x.line}</p>
              <p className="rex">
                <span>For example</span>
                {x.example}
              </p>
            </div>
          ))}
        </div>
        <Link className="btn btn-light" href="/experiences">
          See All Experiences
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
