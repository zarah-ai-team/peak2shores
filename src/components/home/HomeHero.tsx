'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import type { ReelClip } from '@/lib/data/home';
import { forScreen } from './HomeMedia';

/** A play() the browser declined by policy (a phone saving power, a data
    saver), as against one cut short by a pause or a change of clip. */
const declined = (e: unknown) => e instanceof DOMException && e.name === 'NotAllowedError';

/**
 * 01 — The opening: a reel of four clips in Marc's order (safari, Switzerland,
 * Positano, Seville), resolved on the server so only files that exist are named.
 * Only the clip on screen plays, from its `start`; when it ends the next
 * fades in. The dashes pick a clip, the button pauses. Under reduced motion
 * the first clip's still holds until the reader presses play. The reel rests
 * while the hero is scrolled away.
 *
 * Where the browser will not start a film by itself (an iPhone in Low Power
 * Mode, a data saver) or the system pauses it, each clip's still holds for
 * its `hold` and the reel moves on, as a reel of stills does; the button then
 * offers Play, and a tap on it starts the film.
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
  // The film on screen was declined or paused by the browser, not the reader.
  const [refused, setRefused] = useState(false);
  // The reader chose the clip on screen, so its place is announced; while the
  // reel moves on by itself it is not (a change every eight seconds).
  const [picked, setPicked] = useState(false);
  // The clips whose stills are in the page: the one on screen, the next, and
  // every one already shown. The rest wait for their turn, so a phone fetches
  // two stills with the page rather than four.
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const section = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const last = useRef(-1);

  // The reader's motion setting is only known in the browser, so it applies
  // from the moment the films arm — the first render matches the server's.
  const paused = choice === 'pause' || (choice === 'auto' && armed && !!reduced);
  // The open menu covers the film (all of it on a phone): it rests meanwhile,
  // and leaves the device to the menu's own movement.
  const [covered, setCovered] = useState(false);
  const playing = !paused && visible && !covered;
  // What the button offers: Play whenever no film is moving.
  const stopped = paused || refused;

  /** Plays a clip, and records whether the browser let it. */
  const start = useCallback((el: HTMLVideoElement) => {
    el.play().then(
      () => setRefused(false),
      (e: unknown) => {
        if (declined(e)) setRefused(true);
      },
    );
  }, []);

  useEffect(() => {
    const cover = () => setCovered(true);
    const uncover = () => setCovered(false);
    window.addEventListener('p2s:scroll-lock', cover);
    window.addEventListener('p2s:scroll-unlock', uncover);
    return () => {
      window.removeEventListener('p2s:scroll-lock', cover);
      window.removeEventListener('p2s:scroll-unlock', uncover);
    };
  }, []);

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
    setSeen((had) => (had.has(current) ? had : new Set(had).add(current)));
  }, [current]);

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
      if (playing) start(el);
      else el.pause();
    });
  }, [armed, current, playing, reel, start]);

  // Back from another tab or app, the film on screen is asked to play again
  // (a phone pauses it while the page is out of sight).
  useEffect(() => {
    if (!armed || !playing) return;
    const wake = () => {
      const el = videos.current[current];
      if (document.visibilityState === 'visible' && el) start(el);
    };
    document.addEventListener('visibilitychange', wake);
    return () => document.removeEventListener('visibilitychange', wake);
  }, [armed, playing, current, start]);

  const next = () => {
    setPicked(false);
    setCurrent((c) => (c + 1) % reel.length);
  };

  // A still without a film, or a film the browser would not play, holds for
  // its `hold`, then the reel moves on.
  const hold = reel[current].video && !refused ? 0 : (reel[current].hold ?? 8);
  useEffect(() => {
    if (!armed || !playing || !hold) return;
    const timer = window.setTimeout(() => {
      setPicked(false);
      setCurrent((c) => (c + 1) % reel.length);
    }, hold * 1000);
    return () => window.clearTimeout(timer);
  }, [armed, playing, hold, current, reel.length]);

  return (
    <section ref={section} data-hero aria-label="Introduction" className="hc-hero">
      {reel.map((clip, i) => (
        <div
          key={clip.video ?? clip.img}
          className={`hv fill ${i === current ? 'on' : ''} ${playing ? '' : 'held'} ${clip.flip ? 'flip' : ''}`}
          // Each clip's own crop, so its subject stays in frame (home-fixes.css).
          style={
            {
              '--pos': clip.pos ?? 'center',
              '--pos-m': clip.posM ?? clip.pos ?? 'center',
            } as CSSProperties
          }
          aria-hidden
        >
          {/* The clip's still: the frame until its film is ready, and the
              whole clip where the film does not play. On an upright phone or
              tablet the 16:9 frame covers a tall box, so it is drawn about
              two and a half times the screen's width. */}
          {(i === current || i === (current + 1) % reel.length || seen.has(i)) && (
            <Image
              src={clip.img}
              alt={clip.alt}
              fill
              sizes="(max-width: 900px) and (orientation: portrait) 160vw, 100vw"
              priority={i === 0}
              className={clip.video ? 'fill' : 'fill drift'}
              style={{
                filter: clip.grade,
                animationDuration: clip.video ? undefined : `${clip.hold ?? 8}s`,
              }}
            />
          )}
          {clip.video && (
            <video
              ref={(el) => {
                videos.current[i] = el;
              }}
              className="fill"
              style={{ filter: clip.grade }}
              src={armed ? forScreen(clip.video) : undefined}
              muted
              playsInline
              // Only the clip on screen loads; each of the others waits for its
              // turn, its still holding the frame until then.
              preload={i === current ? 'auto' : 'none'}
              onEnded={() => i === current && next()}
              // Paused by the system rather than the reader (a phone saving
              // power, the page in the background): the button says so.
              onPause={(e) => {
                if (i === current && playing && !e.currentTarget.ended) setRefused(true);
              }}
              tabIndex={-1}
            />
          )}
        </div>
      ))}
      <div className="shade" />

      {/* Left-aligned and low in the frame, editorial rather than centered. */}
      <div className="copy left">
        <h1>
          Luxury travel,
          <br />
          personally curated.
        </h1>
        <p className="standfirst">
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
        <span aria-live={picked ? 'polite' : 'off'}>{reel[current].place}</span>
        <span className="vdots">
          {reel.map((clip, i) => (
            <button
              key={clip.place}
              type="button"
              className={`vdot ${i === current ? 'on' : ''}`}
              aria-label={`Show ${clip.place}`}
              aria-current={i === current}
              onClick={() => {
                setPicked(true);
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
          aria-label={stopped ? 'Play the film' : 'Pause the film'}
          aria-pressed={stopped}
          onClick={() => {
            if (!stopped) {
              setChoice('pause');
              return;
            }
            // A tap may start a film the browser would not start by itself.
            const el = videos.current[current];
            if (refused && el) start(el);
            setChoice('play');
          }}
        >
          {stopped ? (
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
