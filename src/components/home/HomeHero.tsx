'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import type { ReelClip } from '@/lib/data/home';

/**
 * 01 — The opening: a reel of four clips in Marc's order (safari, Switzerland,
 * Positano, Hvar), resolved on the server so only files that exist are named.
 * Only the clip on screen plays, from its `start`; when it ends the next
 * fades in. The dashes pick a clip, the button pauses. Under reduced motion
 * the first clip's still holds until the reader presses play. The reel rests
 * while the hero is scrolled away.
 */
export function HomeHero({ reel }: { reel: ReelClip[] }) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [choice, setChoice] = useState<'auto' | 'play' | 'pause'>('auto');
  const [visible, setVisible] = useState(true);
  // The films join only once the page has loaded: until then the first
  // clip's still (a priority image) holds the frame, and the clips' megabytes
  // do not compete with the scripts and the headline for the connection.
  const [armed, setArmed] = useState(false);
  const section = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const last = useRef(-1);

  // The reader's motion setting is only known in the browser, so it applies
  // from the moment the films arm — the first render matches the server's.
  const paused = choice === 'pause' || (choice === 'auto' && armed && !!reduced);
  const playing = !paused && visible;

  useEffect(() => {
    const arm = () => setArmed(true);
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => window.removeEventListener('load', arm);
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!armed) return;
    videos.current.forEach((el, i) => {
      if (!el) return;
      if (i !== current) {
        el.pause();
        return;
      }
      if (last.current !== current) {
        el.currentTime = reel[i].start ?? 0;
        last.current = current;
      }
      if (playing) el.play().catch(() => {});
      else el.pause();
    });
  }, [armed, current, playing, reel]);

  const next = () => setCurrent((c) => (c + 1) % reel.length);

  return (
    <section ref={section} data-hero aria-label="Introduction" className="hc-hero">
      {reel.map((clip, i) => (
        <div key={clip.video} className={`hv fill ${i === current ? 'on' : ''}`} aria-hidden>
          <Image src={clip.img} alt="" fill sizes="100vw" priority={i === 0} className="fill" />
          <video
            ref={(el) => {
              videos.current[i] = el;
            }}
            className="fill"
            // No poster: the still beneath is the optimized image already.
            src={armed ? clip.video : undefined}
            muted
            playsInline
            // The clip on screen and the one after it load; the rest wait.
            preload={i === current || i === (current + 1) % reel.length ? 'auto' : 'none'}
            onEnded={() => i === current && next()}
            tabIndex={-1}
          />
        </div>
      ))}
      <div className="shade" />

      <div className="copy">
        <h1>
          Luxury travel, <em>personally curated.</em>
        </h1>
        <p>
          Thoughtfully paced journeys designed to inspire, connect and experience the world
          differently.
        </p>
        <div className="ctas">
          <Link className="btn btn-light" href="/journeys">
            Explore Journeys
          </Link>
          <Link className="btn btn-line" href="/our-story">
            Discover Peaks2Shores
          </Link>
        </div>
      </div>

      <div className="vctl">
        <span aria-live="polite">{reel[current].place}</span>
        <span className="vdots">
          {reel.map((clip, i) => (
            <button
              key={clip.place}
              type="button"
              className={`vdot ${i === current ? 'on' : ''}`}
              aria-label={`Show ${clip.place}`}
              aria-current={i === current}
              onClick={() => {
                setCurrent(i);
                setChoice('play');
              }}
            >
              <i />
            </button>
          ))}
        </span>
        <button
          type="button"
          className="circ"
          aria-label={paused ? 'Play the film' : 'Pause the film'}
          aria-pressed={paused}
          onClick={() => setChoice(paused ? 'play' : 'pause')}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="7" y="5" width="3" height="14" />
              <rect x="14" y="5" width="3" height="14" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
