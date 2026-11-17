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
  /** Dates and rate, once Marc sets them, as a quiet line under the tagline. */
  facts: string[];
  /** Where it stands for booking ("Now booking"), for a journey with a page. */
  status?: string;
  /** In the flipbook, not yet released: register interest instead of reserve. */
  soon?: boolean;
  /** `pos`: where the wide crop centres (CSS object-position). */
  photo: { src?: string; alt: string; tone: string; pos?: string };
};

type View = 'now' | 'soon';
/** A slide asked for: which view, which slide in it, and the way it arrives. */
type Target = { view: View; index: number; dir: 'next' | 'prev' };

/** How long a slide stays before the next, while the slider plays. */
const DWELL = 7000;
/** The most "up next" cards shown at once. */
const CARDS = 3;
/** The longest a change of slide waits for its photograph before going ahead. */
const PATIENCE = 8000;
/** The finale's photograph, shared by both views. */
const FINALE = 'finale';
const NONE: JourneySlide[] = [];

/** A title with its place words picked out in blue. */
function marked(text: string, places: string[]) {
  if (!places.length) return text;
  const words = places.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text
    .split(new RegExp(`\\b(${words.join('|')})\\b`))
    .map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}

/** Whether an image has arrived (a broken one has a natural width of 0). */
const arrived = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

/**
 * The journeys as one large rounded frame: each journey a full photograph
 * with its name, its tagline, its dates and rate once they are set, and one
 * button, to the journey's own page; the others as small cards on the right.
 * A finale ("More journeys are taking shape") follows the last journey.
 *
 * It plays every 7 s only while it is on screen, and holds still under the
 * pointer, while a control has keyboard focus, when paused, in a background
 * tab, and — unless the visitor presses Play — under reduced motion. The
 * first slide is rendered on the server, so it reads without JavaScript.
 *
 * A slide never moves ahead of its photograph (17 Nov). The first slide's
 * photograph is fetched with the page; the one after the slide on show is
 * fetched while that slide plays; and a change of slide — by the clock, an
 * arrow, a card, a swipe or the view switch — waits until the photograph it
 * needs has loaded and decoded, so the wipe always opens on a finished
 * picture. The ground behind is the night blue throughout.
 */
export function JourneySlider({
  slides: now,
  soon = NONE,
  horizon,
}: {
  /** The journeys open for booking. */
  slides: JourneySlide[];
  /** The journeys still to come, shown when the visitor switches view. */
  soon?: JourneySlide[];
  /** The finale's photograph; without one, the plain night ground. */
  horizon?: { src?: string };
}) {
  // Two views, switched at the top of the frame: what can be booked now, and
  // what is coming. Each plays on its own and ends on the finale.
  const [view, setView] = useState<View>('now');
  const slides = view === 'soon' && soon.length ? soon : now;
  const n = slides.length + 1; // the journeys, then the finale
  const fin = slides.length;
  const [index, setIndex] = useState(0);
  /* Which way the slides move, so the photograph wipes and the words slide from that side. */
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  /* Set by the first change of slide: the slide the page opens on is simply there. */
  const [moved, setMoved] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  /* Within a screen of the viewport: time to fetch the photograph that follows. */
  const [near, setNear] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hiddenTab, setHiddenTab] = useState(false);
  /* Wide enough for the "up next" cards (hidden at 900px and below). */
  const [cardsShown, setCardsShown] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  /* The Next arrow: where keyboard focus goes when a card is chosen. */
  const fwd = useRef<HTMLButtonElement>(null);
  /* Time already spent on the current slide, kept across pauses. Tagged with
     its view and slide so a change of either never inherits the last one's time. */
  const spent = useRef({ slide: 'now:0', ms: 0 });

  /* The photographs. `settled`: those loaded and decoded (or failed, so a
     broken file never holds the slider); null until the first look, so the
     server's markup shows every picture without JavaScript. `wanted`: those
     to fetch now rather than when they scroll into view. `pending`: the slide
     asked for, while its photograph is still on its way. */
  const [settled, setSettled] = useState<ReadonlySet<string> | null>(null);
  const [wanted, setWanted] = useState<ReadonlySet<string>>(() => new Set());
  const [pending, setPending] = useState<Target | null>(null);

  /** The photograph behind a slide: its name here, and its file if it has one. */
  const photoOf = useCallback(
    (v: View, i: number) => {
      const s = (v === 'soon' && soon.length ? soon : now)[i];
      return s ? { id: `${v}:${s.slug}`, src: s.photo.src } : { id: FINALE, src: horizon?.src };
    },
    [now, soon, horizon?.src],
  );
  const ready = useCallback(
    (v: View, i: number) => {
      const p = photoOf(v, i);
      return !p.src || Boolean(settled?.has(p.id));
    },
    [photoOf, settled],
  );
  const settle = useCallback(
    (id: string) => setSettled((had) => (had?.has(id) ? had : new Set(had ?? []).add(id))),
    [],
  );
  const want = useCallback(
    (id: string) => setWanted((had) => (had.has(id) ? had : new Set(had).add(id))),
    [],
  );

  const shown = ready(view, index);
  const running =
    playing && inView && !hovered && !focused && !hiddenTab && shown && pending === null;

  /** Puts a slide on show. */
  const commit = useCallback((t: Target) => {
    spent.current = { slide: `${t.view}:${t.index}`, ms: 0 };
    setDir(t.dir);
    setView(t.view);
    setIndex(t.index);
    setMoved(true);
    setPending(null);
  }, []);

  /** Asks for a slide: shown at once if its photograph is in, otherwise when it is. */
  const request = useCallback(
    (t: Target) => {
      if (t.view === view && t.index === index) setPending(null);
      else if (ready(t.view, t.index)) commit(t);
      else {
        want(photoOf(t.view, t.index).id);
        setPending(t);
      }
    },
    [view, index, ready, commit, want, photoOf],
  );

  const go = useCallback(
    (k: number) => request({ view, index: ((k % n) + n) % n, dir: k < index ? 'prev' : 'next' }),
    [request, view, index, n],
  );

  // A change of view starts that view's first journey afresh. The button of
  // the view already on show does nothing, except to withdraw a change of view
  // that is still waiting for its photograph.
  const show = (v: View) => {
    if (v === view) {
      if (pending && pending.view !== view) setPending(null);
      return;
    }
    request({ view: v, index: 0, dir: v === 'soon' ? 'next' : 'prev' });
  };

  // The photographs already in when the page wakes: seen at once, never faded.
  // A file that fails counts as settled too, so it never holds the slider. (A
  // listener here rather than next/image's `onError`, which sets the image's
  // source again on every render to catch an early error, and so fetches it
  // again. Error events do not bubble, hence the capture.)
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const here: string[] = [];
    el.querySelectorAll<HTMLImageElement>('.bg img[data-photo]').forEach((img) => {
      if (arrived(img)) here.push(img.dataset.photo as string);
    });
    setSettled((had) => new Set([...(had ?? []), ...here]));
    const onError = (e: Event) => {
      const id = (e.target as HTMLElement).dataset?.photo;
      if (id) settle(id);
    };
    el.addEventListener('error', onError, true);
    return () => el.removeEventListener('error', onError, true);
  }, [settle]);

  // The slide asked for goes on show the moment its photograph is ready…
  useEffect(() => {
    if (pending && ready(pending.view, pending.index)) commit(pending);
  }, [pending, ready, commit]);
  // …or, on a connection too slow to wait for, after a patient pause: the
  // words arrive on the night ground and the photograph fades in behind them.
  useEffect(() => {
    if (!pending) return;
    const t = window.setTimeout(() => commit(pending), PATIENCE);
    return () => window.clearTimeout(t);
  }, [pending, commit]);

  // While a slide shows, the photograph of the one after it is fetched.
  useEffect(() => {
    if (near && shown) want(photoOf(view, (index + 1) % n).id);
  }, [near, shown, view, index, n, want, photoOf]);

  // Reduced motion: still, until asked.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  // Whether the cards are on show at this width.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 901px)');
    const read = () => setCardsShown(wide.matches);
    read();
    wide.addEventListener('change', read);
    return () => wide.removeEventListener('change', read);
  }, []);

  // On screen (and nearly so), and the tab in front.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    const close = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        close.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    close.observe(el);
    const onVis = () => setHiddenTab(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      close.disconnect();
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

  const onFin = index === fin;
  const upNext = Array.from({ length: Math.min(CARDS, n - 1) }, (_, o) => (index + o + 1) % n);
  /* The switch answers at once, even while its first photograph is on its way. */
  const chosen = pending?.view ?? view;
  /* Fetch a photograph as soon as the pointer or the keyboard reaches its control. */
  const ahead = (v: View, i: number) => {
    const id = photoOf(v, i).id;
    return { onPointerEnter: () => want(id), onFocus: () => want(id) };
  };

  /** One slide's photograph, behind everything: fetched when wanted, shown when in. */
  const backdrop = (id: string, src: string, first: boolean, pos?: string) => (
    <Image
      src={src}
      alt=""
      fill
      // On a phone or tablet the frame is taller than it is wide, so the
      // landscape photograph is cropped by height and needs a wider file.
      sizes="(max-width: 600px) 150vw, (max-width: 900px) 125vw, 92vw"
      quality={85}
      // The slide the page opens on is fetched with the page; the rest when wanted.
      loading={first || wanted.has(id) ? 'eager' : 'lazy'}
      data-photo={id}
      // next/image calls this once the picture has loaded and decoded.
      onLoad={() => settle(id)}
      className="photo-grade"
      style={pos ? { objectPosition: pos } : undefined}
    />
  );
  const waits = (id: string) => (settled && !settled.has(id) ? ' wait' : '');

  return (
    <div
      ref={frame}
      className={`frame${onFin ? ' fin' : ''}`}
      data-dir={dir}
      data-moved={moved ? '' : undefined}
      data-busy={pending ? '' : undefined}
      aria-busy={pending ? true : undefined}
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
      {/* The pictures: a photograph per journey of either view, the finale's
          last. Only the one on show is seen; the rest wait, clipped away. */}
      {(['now', 'soon'] as const).flatMap((v) =>
        (v === 'now' ? now : soon).map((s, i) => {
          const id = `${v}:${s.slug}`;
          return (
            <div
              key={id}
              className={`bg${v === view && i === index ? ' on' : ''}${waits(id)}`}
              aria-hidden
            >
              {s.photo.src && backdrop(id, s.photo.src, v === 'now' && i === 0, s.photo.pos)}
            </div>
          );
        }),
      )}
      <div
        className={`bg hzbg${horizon?.src ? ' photo' : ''}${onFin ? ' on' : ''}${waits(FINALE)}`}
        aria-hidden
      >
        {horizon?.src && backdrop(FINALE, horizon.src, false)}
      </div>
      <div className="shade" aria-hidden />
      {/* Every card's photograph, fetched ahead once the frame is near, so a
          card never arrives empty while its slide is already moving. The same
          file as the card's own, so the card reads it from the cache. */}
      {near && cardsShown && (
        <div className="pre" aria-hidden>
          {[...now, ...soon].map(
            (s, i) => s.photo.src && <Thumb key={`${i}:${s.slug}`} src={s.photo.src} eager />,
          )}
          {horizon?.src && <Thumb src={horizon.src} eager />}
        </div>
      )}

      {soon.length > 0 && (
        <div className="views" role="group" aria-label="Show journeys">
          {(
            [
              ['now', 'Now booking'],
              ['soon', 'Coming soon'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              className={chosen === v ? 'on' : undefined}
              aria-pressed={chosen === v}
              onClick={() => show(v)}
              {...ahead(v, 0)}
            >
              {label}
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
              {/* No status pill or length/group line on the slide (5 Nov): the
                  Now booking / Coming soon switch above already says it. */}
              <h3>{marked(s.title, s.places)}</h3>
              <p className="lead">{s.lead}</p>
              {s.facts.length > 0 && (
                <p className="facts">
                  {s.facts.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </p>
              )}
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
                // One button, to the journey's own page (13 Nov), in place of
                // the pair "Request details" and "Itinerary & dates".
                <div className="acts">
                  <Link
                    className="btn btn-accent"
                    href={`/journeys/${s.slug}`}
                    aria-label={`Explore journey: ${s.title}`}
                  >
                    Explore journey <Arrow />
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {/* The finale: its words on the left, over the photograph. */}
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
              // Keyed by journey, so a card never shows the last one's picture.
              <li key={photoOf(view, k).id}>
                <button
                  type="button"
                  className="card"
                  onClick={() => {
                    go(k);
                    // The card leaves with the change; focus moves to Next
                    // rather than falling to the page.
                    fwd.current?.focus({ preventScroll: true });
                  }}
                  aria-label={`Show ${s ? s.title : 'More journeys coming'}`}
                  {...ahead(view, k)}
                >
                  {photo && <Thumb src={photo} />}
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

        {/* `data-fab-clear`: the floating "Connect" button steps aside rather
            than sit over the arrows, the line and Pause. */}
        <div className="ctrl" data-fab-clear>
          <button
            type="button"
            className="round"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            {...ahead(view, (index - 1 + n) % n)}
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            ref={fwd}
            type="button"
            className="round fwd"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            {...ahead(view, (index + 1) % n)}
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
          {/* No slide numbers (8 Nov): the count is for screen readers only. */}
          <p className="sr-only" aria-live={running ? 'off' : 'polite'} aria-atomic>
            Slide {index + 1} of {n}
          </p>
        </div>
      </div>
    </div>
  );
}

/** The card photographs already loaded on this page: shown at once, never faded. */
const loaded = new Set<string>();

/**
 * A card's photograph. One that is still on its way when the card appears
 * fades in once it has loaded and decoded, rather than popping in; one that
 * is already there (and every one, without JavaScript) is simply shown. A
 * file that fails stays out of sight, the card's night ground in its place.
 * `eager`: fetched now rather than when it comes into view.
 */
function Thumb({ src, eager = false }: { src: string; eager?: boolean }) {
  const img = useRef<HTMLImageElement>(null);
  const [wait, setWait] = useState(false);
  useEffect(() => {
    if (img.current && !arrived(img.current) && !loaded.has(src)) setWait(true);
  }, [src]);
  return (
    <Image
      ref={img}
      src={src}
      alt=""
      fill
      // A card shows a portrait crop of a landscape photograph, so the file is
      // about one and a half times the card's width (roughly 28vw).
      sizes="(max-width: 900px) 1px, 28vw"
      quality={85}
      loading={eager ? 'eager' : 'lazy'}
      className={`photo-grade${wait ? ' wait' : ''}`}
      onLoad={() => {
        loaded.add(src);
        setWait(false);
      }}
    />
  );
}
