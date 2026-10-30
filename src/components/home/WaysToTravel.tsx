'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { ways } from '@/lib/data/home';
import { Arrow } from '@/components/ui/Button';
import { Chevron, posterOf } from './HomeMedia';
import { useDragScroll } from '@/components/ui/useDrag';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 03 — Experiences (the ways to travel): six upright tiles on a rail that scrolls sideways,
 * group journeys first as "our signature". A tile's film plays only while the
 * pointer (or focus) is on it; its line opens beneath the name. Every tile is
 * the same size; the signature one is marked by its badge and blue name.
 *
 * A touch screen has no hover, so there the tile that is mostly on screen
 * plays instead, as it is swiped into view, and every line shows.
 *
 * While the section is on screen the rail moves on by itself, one tile every
 * few seconds, playing the film of the tile it lands on, and starts over at the
 * end. Pointing at the rail pauses it; using the arrows or swiping stops it.
 */
const AUTO_MS = 5000;

export function WaysToTravel() {
  const rail = useRef<HTMLDivElement>(null);
  useDragScroll(rail);
  const films = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(-1);
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || paused || !onScreen || reduced) return;
    const id = window.setInterval(() => {
      const el = rail.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step(), behavior: 'smooth' });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [auto, paused, onScreen, reduced]);

  /* On a pointer device the moving rail plays the tile it lands on. */
  useEffect(() => {
    if (!auto || reduced || !onScreen || window.matchMedia('(hover: none)').matches) return;
    setInView(index);
  }, [auto, index, onScreen, reduced]);

  useEffect(() => {
    const el = rail.current;
    if (!el || reduced || !window.matchMedia('(hover: none)').matches) return;
    const tiles = [...el.querySelectorAll<HTMLElement>('.wt')];
    const shown = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          shown.set(tiles.indexOf(entry.target as HTMLElement), entry.intersectionRatio);
        let best = -1;
        let ratio = 0.6;
        shown.forEach((r, i) => {
          if (r >= ratio) [best, ratio] = [i, r];
        });
        setInView(best);
      },
      { threshold: [0, 0.6, 0.8, 1] },
    );
    tiles.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    films.current.forEach((film, i) => {
      if (!film) return;
      if (i === inView) film.play().catch(() => {});
      else film.pause();
    });
  }, [inView]);

  /* One tile and the gap after it; both follow the viewport, so both are read. */
  const step = () => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>('.wt');
    if (!el || !card) return 400;
    return card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
  };
  const play = (i: number) => {
    const el = films.current[i];
    if (el && !reduced) el.play().catch(() => {});
  };
  const stop = (i: number) => films.current[i]?.pause();

  const shown = Math.min(ways.length, index + 1);

  return (
    <section ref={section} className="hc-ways" id="ways" aria-labelledby="ways-title">
      <div className="head dk">
        <div>
          {/* "Ways to explore", so it no longer clashes with the Experiences page. */}
          <h2 id="ways-title">Ways to Explore</h2>
          <p className="sub-h">Experience the world your way.</p>
        </div>
        {/* The way to a designer sits up here, clear of the floating button
            in the bottom corner; the slider's arrows sit beneath the cards. */}
        <div className="ctarow">
          <span className="hint">Not sure which suits you?</span>
          <Link className="btn btn-ink" href="/plan#contact">
            Speak to a travel designer <Arrow />
          </Link>
        </div>
      </div>

      <div
        ref={rail}
        className="rail"
        onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onTouchStart={() => setAuto(false)}
        onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && setAuto(false)}
        onScroll={() => {
          const el = rail.current;
          if (el) setIndex(Math.round(el.scrollLeft / step()));
        }}
      >
        {ways.map((way, i) => (
          <Link
            key={way.title}
            href={way.href}
            className={`wt ${way.lead ? 'lead' : ''} ${i === inView ? 'playing' : ''}`}
            onMouseEnter={() => play(i)}
            onMouseLeave={() => i !== inView && stop(i)}
            onFocus={() => play(i)}
            onBlur={() => stop(i)}
          >
            <Image
              src={way.img}
              alt={way.alt}
              fill
              sizes="(max-width: 900px) 80vw, 460px"
              className="fill"
            />
            {way.video && (
              <video
                ref={(el) => {
                  films.current[i] = el;
                }}
                className="fill"
                poster={posterOf(way.img)}
                src={way.video}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                tabIndex={-1}
              />
            )}
            <span className="ws" />
            <span className="wn">{pad(i + 1)}</span>
            {way.lead ? (
              <span className="badge">Our signature</span>
            ) : (
              way.video && (
                <span className="wplay" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )
            )}
            <span className="wb">
              <h3>{way.title}</h3>
              <span className="wl">{way.line}</span>
              <span className="more">Explore</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="wfoot dk">
        <div className="wnav">
          <button
            type="button"
            className="circ"
            aria-label="Previous"
            onClick={() => {
              setAuto(false);
              rail.current?.scrollBy({ left: -step(), behavior: 'smooth' });
            }}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="circ"
            aria-label="Next"
            onClick={() => {
              setAuto(false);
              rail.current?.scrollBy({ left: step(), behavior: 'smooth' });
            }}
          >
            <Chevron dir="right" />
          </button>
          <span className="count">
            {pad(shown)} / {pad(ways.length)}
          </span>
        </div>
        <div className="prog" aria-hidden>
          <i style={{ width: `${Math.round((shown / ways.length) * 100)}%` }} />
        </div>
      </div>
    </section>
  );
}
