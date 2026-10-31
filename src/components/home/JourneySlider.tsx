'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Arrow } from '@/components/ui/Button';
import { useSwipe } from '@/components/ui/useDrag';

/** One journey as the slider needs it — plain data, built on the server. */
export type JourneySlide = {
  slug: string;
  title: string;
  /** The name on a small card. */
  short: string;
  /** The place words in the title, set in blue — the slide's only country cue. */
  places: string[];
  lead: string;
  /** Length, group, and dates or rate once Marc sets them, as pills. */
  facts: string[];
  /** Where it stands for booking ("Now booking"), for a journey with a page. */
  status?: string;
  /** In the flipbook, not yet released: register interest instead of reserve. */
  soon?: boolean;
  photo: { src?: string; alt: string; tone: string };
};

/** How long a slide stays before the next, while the slider plays. */
const DWELL = 7000;
/** The most "up next" cards shown at once. */
const CARDS = 3;

const pad = (n: number) => String(n).padStart(2, '0');

/** A title with its place words picked out in blue. */
function marked(text: string, places: string[]) {
  if (!places.length) return text;
  const words = places.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text
    .split(new RegExp(`\\b(${words.join('|')})\\b`))
    .map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}

/**
 * The journeys as one large rounded frame: each journey a full photograph
 * with its booking status, name, tagline, length and group, and the two ways
 * on — reserve, or the itinerary and dates; the others as
 * small cards on the right. A drawn finale ("More journeys are taking shape")
 * follows the last journey.
 *
 * It plays every 7 s only while it is on screen, and holds still under the
 * pointer, while a control has keyboard focus, when paused, in a background
 * tab, and — unless the visitor presses Play — under reduced motion. The
 * first slide is rendered on the server, so it reads without JavaScript.
 */
export function JourneySlider({
  slides: now,
  soon = [],
  horizon,
}: {
  /** The journeys open for booking. */
  slides: JourneySlide[];
  /** The journeys still to come, shown when the visitor switches view. */
  soon?: JourneySlide[];
  /** The finale's photograph; without one, the drawn horizon. */
  horizon?: { src?: string };
}) {
  // Two views, switched at the top of the frame: what can be booked now, and
  // what is coming. Each plays on its own and ends on the finale.
  const [view, setView] = useState<'now' | 'soon'>('now');
  const slides = view === 'soon' && soon.length ? soon : now;
  const n = slides.length + 1; // the journeys, then the finale
  const fin = slides.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  /* Time already spent on the current slide, kept across pauses. Tagged with
     its view and slide so a change of either never inherits the last one's time. */
  const spent = useRef({ slide: 'now:0', ms: 0 });

  const running = playing && inView && !hovered && !focused && !hiddenTab;

  const go = useCallback(
    (k: number) => {
      const next = (k + n) % n;
      spent.current = { slide: `${view}:${next}`, ms: 0 };
      setIndex(next);
    },
    [n, view],
  );

  // Reduced motion: still, until asked.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  // On screen, and the tab in front.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    const onVis = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // The clock: the rest of this slide's 7 s, resumed where it paused.
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const left = Math.max(
      0,
      DWELL - (spent.current.slide === `${view}:${index}` ? spent.current.ms : 0),
    );
    const t = window.setTimeout(() => go(index + 1), left);
    return () => {
      window.clearTimeout(t);
      if (spent.current.slide === `${view}:${index}`) spent.current.ms += performance.now() - start;
    };
  }, [running, index, go, view]);

  useSwipe(frame, (dir) => go(index + dir));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
  };

  // A change of view starts that view's first journey afresh.
  const show = (v: 'now' | 'soon') => {
    if (v === view) return;
    spent.current = { slide: `${v}:0`, ms: 0 };
    setIndex(0);
    setView(v);
  };

  const onFin = index === fin;
  const upNext = Array.from({ length: Math.min(CARDS, n - 1) }, (_, o) => (index + o + 1) % n);

  return (
    <div
      ref={frame}
      className={`frame${onFin ? ' fin' : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Journeys"
      data-run={running ? '' : undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // Keyboard focus holds the slider; a mouse click on a control does not.
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* The pictures: a photograph per journey, the drawn horizon last. */}
      {slides.map((s, i) => (
        <div
          key={s.slug}
          className={`bg${i === index ? ' on' : ''}`}
          style={{ backgroundColor: s.photo.tone }}
          aria-hidden
        >
          {s.photo.src && (
            <Image
              src={s.photo.src}
              alt=""
              fill
              sizes="(min-width: 900px) 92vw, 100vw"
              quality={85}
              className="photo-grade"
            />
          )}
        </div>
      ))}
      <div className={`bg hzbg${horizon?.src ? ' photo' : ''}${onFin ? ' on' : ''}`} aria-hidden>
        {horizon?.src ? (
          <Image
            src={horizon.src}
            alt=""
            fill
            sizes="(min-width: 900px) 92vw, 100vw"
            quality={85}
            className="photo-grade"
          />
        ) : (
          <Horizon />
        )}
      </div>
      <div className="shade" aria-hidden />

      {soon.length > 0 && (
        <div className="views" role="group" aria-label="Show journeys">
          {(
            [
              ['now', 'Now booking', now.length],
              ['soon', 'Coming soon', soon.length],
            ] as const
          ).map(([v, label, count]) => (
            <button
              key={v}
              type="button"
              className={view === v ? 'on' : undefined}
              aria-pressed={view === v}
              onClick={() => show(v)}
            >
              <i aria-hidden className={v} />
              {label}
              <span className="ct">{count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="stage">
        {slides.map((s, i) => {
          const on = i === index;
          return (
            <div
              key={s.slug}
              className={`copy${on ? ' on' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.title}`}
              aria-hidden={!on}
              inert={!on}
            >
              {/* Said first, so a slide reads as a journey to book, not a picture. */}
              <p className={`badge${s.soon ? ' soon' : ''}`}>
                <i aria-hidden />
                Small-group journey
                <b>{s.soon ? 'Coming soon' : s.status}</b>
              </p>
              <h3>{marked(s.title, s.places)}</h3>
              <p className="lead">{s.lead}</p>
              <p className="facts">
                {s.facts.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </p>
              {s.soon ? (
                <div className="acts">
                  <Link
                    className="btn btn-accent"
                    href="/plan#contact"
                    aria-label={`Register your interest in ${s.title}`}
                  >
                    Register your interest <Arrow />
                  </Link>
                  <Link className="btn btn-line" href="#circle">
                    Hear first in The Circle
                  </Link>
                </div>
              ) : (
                <div className="acts">
                  <Link
                    className="btn btn-accent"
                    href={`/journeys/${s.slug}#enquire`}
                    aria-label={`Reserve your place on ${s.title}`}
                  >
                    Reserve your place <Arrow />
                  </Link>
                  <Link
                    className="btn btn-light"
                    href={`/journeys/${s.slug}`}
                    aria-label={`View the itinerary and dates for ${s.title}`}
                  >
                    Itinerary &amp; dates
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {/* The finale: centred, large, on the drawn horizon. */}
        <div
          className={`copy finale${onFin ? ' on' : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${n} of ${n}: More journeys are taking shape`}
          aria-hidden={!onFin}
          inert={!onFin}
        >
          <h3>
            More journeys are <em>taking shape.</em>
          </h3>
          <p className="lead">
            New journeys to the places we know and love. The circle hears first.
          </p>
          <div className="acts">
            <Link className="btn btn-accent" href="#circle">
              Join the circle <Arrow />
            </Link>
            <Link className="btn btn-line" href="/plan#private">
              Plan a private journey
            </Link>
          </div>
        </div>
      </div>

      <div className="side">
        {/* Up next: the following slides as small cards; gone on the finale.
            The label says plainly that there is more to see. */}
        <p className="nlab" aria-hidden>
          Up next
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </p>
        <ul
          className="next"
          style={{ ['--cards' as string]: upNext.length }}
          aria-label="Up next"
          aria-hidden={onFin}
          inert={onFin}
        >
          {upNext.map((k) => {
            const s = slides[k];
            // The finale's card shows its photograph too, when it has one.
            const photo = s ? s.photo.src : horizon?.src;
            return (
              <li key={k}>
                <button
                  type="button"
                  className={`card${s ? '' : ' horizon'}`}
                  onClick={() => go(k)}
                  aria-label={`Show ${s ? s.title : 'More journeys coming'}`}
                  style={s ? { backgroundColor: s.photo.tone } : undefined}
                >
                  {photo && (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      sizes="14rem"
                      quality={85}
                      className="photo-grade"
                    />
                  )}
                  {!photo && (
                    <span className="mark" aria-hidden>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        focusable="false"
                      >
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M15.5 8.5l-2 5-5 2 2-5z" />
                      </svg>
                    </span>
                  )}
                  <span className="num" aria-hidden>
                    {pad(k + 1)}
                  </span>
                  <span className="cap" aria-hidden>
                    {s && <span className="st">{s.soon ? 'Coming soon' : s.status}</span>}
                    <span className="t">
                      {s ? marked(s.short, s.places) : 'More journeys coming'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="ctrl">
          <button
            type="button"
            className="round"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="round fwd"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="prog" aria-hidden>
            {/* Restarts with each slide; fills only while the slider runs. */}
            <i key={`${view}-${index}`} />
          </span>
          <button
            type="button"
            className="play"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              {playing ? (
                <>
                  <rect x="5" y="4" width="4.5" height="16" rx="1" />
                  <rect x="14.5" y="4" width="4.5" height="16" rx="1" />
                </>
              ) : (
                <path d="M6 4l14 8-14 8z" />
              )}
            </svg>
            <span className="pt">{playing ? 'Pause' : 'Play'}</span>
          </button>
          {/* Announced when a visitor moves the slider, not on every turn. */}
          <p className="count" aria-live={running ? 'off' : 'polite'} aria-atomic>
            <span className="sr-only">Slide </span>
            {pad(index + 1)}
            <small>
              <span className="sr-only"> of</span> / {pad(n)}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The finale's picture, drawn rather than photographed: a night sky with
 * stars, a pale-blue sun rising between two ranges of peaks, its reflection on
 * the water, drifting waves, and a dotted blue route arcing over the words.
 */
function Horizon() {
  return (
    <svg
      className="hz"
      viewBox="0 0 1264 760"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="jr-hz-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081620" />
          <stop offset="0.5" stopColor="#0e2f42" />
          <stop offset="1" stopColor="#22607e" />
        </linearGradient>
        <radialGradient id="jr-hz-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6e3bc" stopOpacity="0.8" />
          <stop offset="0.3" stopColor="#7accfd" stopOpacity="0.38" />
          <stop offset="1" stopColor="#7accfd" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jr-hz-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbefd3" />
          <stop offset="1" stopColor="#7accfd" />
        </linearGradient>
        <linearGradient id="jr-hz-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14465f" />
          <stop offset="1" stopColor="#081620" />
        </linearGradient>
      </defs>
      <rect width="1264" height="600" fill="url(#jr-hz-sky)" />
      {/* Stars; a few of them twinkle. */}
      <g fill="#fff">
        <circle className="tw" cx="120" cy="90" r="1.4" opacity="0.7" />
        <circle cx="230" cy="190" r="1" opacity="0.45" />
        <circle className="tw tw2" cx="330" cy="60" r="1.5" opacity="0.8" />
        <circle cx="190" cy="300" r="1" opacity="0.4" />
        <circle className="tw" cx="1150" cy="80" r="1.4" opacity="0.7" />
        <circle cx="1040" cy="200" r="1" opacity="0.45" />
        <circle className="tw tw2" cx="940" cy="56" r="1.5" opacity="0.8" />
        <circle cx="1090" cy="310" r="1" opacity="0.4" />
        <circle className="tw" cx="60" cy="230" r="1.1" opacity="0.5" />
        <circle cx="1210" cy="240" r="1.1" opacity="0.5" />
      </g>
      {/* The route, arcing over the title to a point that pulses. */}
      <path
        className="route"
        d="M250 300 C300 120 480 64 632 64 S964 120 1014 300"
        fill="none"
        stroke="#7accfd"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="1 9"
        opacity="0.8"
      />
      <circle cx="250" cy="300" r="4" fill="#7accfd" />
      <circle cx="1014" cy="300" r="4" fill="#7accfd" />
      <circle
        className="ping"
        cx="632"
        cy="64"
        r="11"
        fill="none"
        stroke="#7accfd"
        strokeWidth="1.4"
      />
      <circle cx="632" cy="64" r="5" fill="#fbefd3" />
      {/* The sun, rising in the gap between the ranges. */}
      <g className="sunrise">
        <circle className="glow" cx="632" cy="600" r="420" fill="url(#jr-hz-glow)" />
        <path d="M532 600 A100 100 0 0 1 732 600 Z" fill="url(#jr-hz-sun)" />
      </g>
      {/* Peaks, left. */}
      <path
        d="M0 600 L0 420 L90 470 L200 330 L270 400 L340 360 L470 520 L560 600 Z"
        fill="#1a4a63"
        opacity="0.9"
      />
      <path
        d="M200 330 L228 362 L214 364 L200 350 L184 368 L172 362 Z"
        fill="#e9e3d6"
        opacity="0.5"
      />
      <path d="M0 600 L0 500 L130 450 L240 520 L320 480 L470 600 Z" fill="#0e2f42" />
      {/* Peaks, right. */}
      <path
        d="M1264 600 L1264 400 L1170 450 L1060 320 L990 400 L920 370 L790 520 L704 600 Z"
        fill="#1a4a63"
        opacity="0.9"
      />
      <path
        d="M1060 320 L1088 352 L1074 354 L1060 340 L1044 358 L1032 352 Z"
        fill="#e9e3d6"
        opacity="0.5"
      />
      <path d="M1264 600 L1264 490 L1140 450 L1030 520 L950 480 L800 600 Z" fill="#0e2f42" />
      {/* The water, the sun's reflection, and the waves. */}
      <rect y="600" width="1264" height="160" fill="url(#jr-hz-sea)" />
      <line x1="0" y1="600" x2="1264" y2="600" stroke="#7accfd" strokeOpacity="0.5" />
      <g stroke="#7accfd" strokeLinecap="round">
        <line x1="552" y1="618" x2="712" y2="618" strokeWidth="3" opacity="0.6" />
        <line x1="577" y1="636" x2="687" y2="636" strokeWidth="2.5" opacity="0.45" />
        <line x1="600" y1="654" x2="664" y2="654" strokeWidth="2" opacity="0.32" />
        <line x1="618" y1="672" x2="646" y2="672" strokeWidth="2" opacity="0.2" />
      </g>
      <g className="drift" fill="none" stroke="#7accfd" strokeWidth="1.2">
        <path
          d="M-40 690 C20 678 80 678 140 690 S260 702 320 690 S440 678 500 690 S620 702 680 690 S800 678 860 690 S980 702 1040 690 S1160 678 1220 690 S1340 702 1400 690"
          opacity="0.28"
        />
        <path
          d="M-40 726 C20 714 80 714 140 726 S260 738 320 726 S440 714 500 726 S620 738 680 726 S800 714 860 726 S980 738 1040 726 S1160 714 1220 726 S1340 738 1400 726"
          opacity="0.18"
        />
      </g>
    </svg>
  );
}
