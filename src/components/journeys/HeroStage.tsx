'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type HeroPlace = {
  name: string;
  /** "3 nights", or "Along the way" for a stop with no night. */
  stay: string;
  img?: string;
  alt: string;
  /** Where the photograph's crop centres (CSS object-position), when its subject is off the middle. */
  pos?: string;
};

/* The hero fills the screen's height, so on a screen taller than it is wide
   (a phone, an upright tablet) the landscape photograph is cropped to that
   height and drawn about one and a half times as wide as the screen is tall:
   ask the optimizer for that much, or it is drawn soft. A phone held sideways
   is cropped to the hero's least height, two to three times its width. */
const HERO_SIZES = '(orientation: portrait) 140vh, (max-width: 800px) 230vw, 100vw';

/** Is the focus the keyboard's (rather than a press's)? Where the browser
    cannot tell, it counts as the keyboard's, as every focus did before. */
const byKeyboard = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

/** A set with one more member, or the same set where it is already in it. */
const plus = (set: ReadonlySet<number>, k: number) => (set.has(k) ? set : new Set(set).add(k));

/**
 * The journey page's hero, after the notes of 5 November 2026: the photograph,
 * and along the route each place with its nights. Pointing at a place (or
 * tabbing to it) crossfades the photograph to that place; leaving returns it
 * to the journey's own. On a touch screen a tap shows a place, and a second
 * tap the journey's own photograph again. Only opacity changes: no zoom, no
 * movement.
 */
export function HeroStage({
  media,
  places,
  children,
}: {
  media: { src?: string; alt?: string };
  places: HeroPlace[];
  /** The breadcrumb, title and lead line, above the route. */
  children: ReactNode;
}) {
  const [on, setOn] = useState(-1);
  // The places' photographs load only once they can be asked for: all of them
  // after the page has loaded where there is a pointer to hover with, and on a
  // touch screen each place's own at its tap on the route, so a phone never
  // downloads five full-screen photographs it may not show.
  const [warm, setWarm] = useState(false);
  const [asked, setAsked] = useState<ReadonlySet<number>>(() => new Set());
  // The places whose photographs have arrived: until a place's has, the
  // journey's own stays, rather than the hero turning dark while it loads.
  const [ready, setReady] = useState<ReadonlySet<number>>(() => new Set());
  // The kind of pointer that last pressed a stop: a mouse's click keeps the
  // place its pointer already shows, where a tap or a key turns it over.
  const pressedBy = useRef('');
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const go = () => setWarm(true);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => window.removeEventListener('load', go);
  }, []);
  const show = (k: number) => {
    setAsked((s) => plus(s, k));
    setOn(k);
  };
  const shown = on >= 0 && places[on]?.img && ready.has(on) ? on : -1;

  return (
    <>
      <div className="hero-bg">
        {media.src && (
          <Image
            className={`fill${shown === -1 ? ' on' : ''}`}
            src={media.src}
            alt={media.alt ?? ''}
            fill
            priority
            // The page's largest paint: fetched ahead of everything.
            fetchPriority="high"
            sizes={HERO_SIZES}
            quality={85}
          />
        )}
        {places.map((p, k) =>
          (warm || asked.has(k)) && p.img ? (
            <Image
              key={p.name}
              className={`fill${shown === k ? ' on' : ''}`}
              src={p.img}
              alt={shown === k ? p.alt : ''}
              aria-hidden={shown !== k}
              fill
              style={p.pos ? { objectPosition: p.pos } : undefined}
              sizes={HERO_SIZES}
              quality={85}
              onLoad={() => setReady((s) => plus(s, k))}
            />
          ) : null,
        )}
      </div>
      <div className="hero-shade" aria-hidden />
      {/* `data-fab-clear`: the floating "Connect with our team" steps aside
          while the hero's words or route are in the foot of the screen, as it
          does for the facts below them, rather than lie over a stop. */}
      <div className="hero-c" data-fab-clear>
        {children}
        {places.length > 1 && (
          <div className="hfoot">
            <ol
              className="hroute"
              aria-label="The route"
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') setOn(-1);
              }}
            >
              {places.map((p, k) => (
                <li key={p.name} className={on === k ? 'on' : undefined}>
                  {/* A mouse shows the place it points at, the keyboard the
                      place it reaches; a tap's own mouse events and focus are
                      left out, or they would show the place just before the
                      tap's click turned it off again. */}
                  <button
                    type="button"
                    aria-pressed={on === k}
                    aria-label={`${p.name}, ${p.stay}: show a photograph of ${p.name}`}
                    onPointerEnter={(e) => {
                      if (e.pointerType === 'mouse') show(k);
                    }}
                    onPointerDown={(e) => {
                      pressedBy.current = e.pointerType;
                    }}
                    onFocus={(e) => {
                      if (byKeyboard(e.currentTarget)) show(k);
                    }}
                    onBlur={() => setOn(-1)}
                    onClick={(e) => {
                      const mouse = e.detail > 0 && pressedBy.current === 'mouse';
                      setAsked((s) => plus(s, k));
                      setOn((cur) => (cur === k && !mouse ? -1 : k));
                    }}
                  >
                    <span className="nm">{p.name}</span>
                    <span className="ns">{p.stay}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  );
}
