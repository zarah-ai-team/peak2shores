'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type SyntheticEvent,
} from 'react';
import { StatusTag } from '@/components/ui/StatusTag';
import type { StoryPlace } from './story';

/**
 * The countries as one story told by scrolling, after the reference film:
 *
 * 1. Arrival. Each country's photograph slides up with the last one, a hard
 *    edge between them, and the country's name rises into the middle of the
 *    frame from behind the land: the name sits between the photograph and a
 *    cut-out of its foreground (the same picture with the sky removed), and
 *    travels up faster than its photograph.
 * 2. Hold. The name settled; one "See details" pill and a thin progress line
 *    stay put over the whole story.
 * 3. Details. The name shrinks to a heading at top left, the photograph
 *    darkens and drifts, the country's line and its journeys come in on the
 *    left and a row of photographs (the places the journeys stay, then the
 *    journeys) slides in from the right and drifts left as the page goes on.
 *
 * Layout is CSS (destinations.css): one tall article per country holding a
 * pinned stage, so the next stage scrolls up with the one it replaces. The
 * stage is pulled up by `--dz-x`, so the article's own top rests at the
 * scroll padding exactly when its name has settled: /destinations#italy, the
 * index chips and the site menu land there. Everything that moves is driven
 * here from the scroll position, once a frame, by transform and opacity only.
 *
 * Readers who ask for reduced motion get no pinning and no movement: each
 * country is its photograph with its name, then its details, in the flow.
 */
export function PlaceStory({ places }: { places: StoryPlace[] }) {
  const root = useRef<HTMLDivElement>(null);
  /** The country on screen, for the pill's name. */
  const [current, setCurrent] = useState(0);
  /** Countries up to this one may load their photographs now (the next one ahead of time). */
  const [near, setNear] = useState(-1);
  const currentRef = useRef(0);
  const skipFocus = useRef(false);

  useEffect(() => {
    const story = root.current;
    if (!story) return;
    return drive(story, {
      onCurrent: (i) => {
        currentRef.current = i;
        setCurrent(i);
        setNear((n) => Math.max(n, i + 1));
      },
      onNear: () => setNear((n) => Math.max(n, 0)),
      skipFocus,
    });
  }, []);

  const seeDetails = (event: MouseEvent<HTMLButtonElement>) => {
    const place = places[currentRef.current];
    if (!place) return;
    window.dispatchEvent(new CustomEvent('p2s:scroll-to', { detail: `${place.slug}-details` }));
    // From the keyboard, the reader goes on from the details' heading.
    if (event.detail === 0) {
      skipFocus.current = true;
      document.getElementById(`${place.slug}-title`)?.focus({ preventScroll: true });
      skipFocus.current = false;
    }
  };

  return (
    // The header stays over the story (`data-pin-header`): the stage is pinned
    // beneath it, and a header stepping aside would open a gap above it.
    <div ref={root} className="dz-story" data-tone="dark" data-fab-away data-pin-header>
      {/* Over the whole story and still while the countries change. */}
      <div className="dz-ui">
        <div className="dz-ui-in">
          <button
            type="button"
            className="btn btn-light dz-see"
            aria-label={`See details: ${places[current]?.country ?? ''}`}
            onClick={seeDetails}
          >
            See details
          </button>
          <span className="dz-rail" aria-hidden>
            <i style={{ '--dz-count': places.length } as CSSProperties} />
          </span>
        </div>
      </div>

      {places.map((place, index) => (
        <Place
          key={place.slug}
          place={place}
          eager={index <= near + 1 && near >= 0}
          first={index === 0}
        />
      ))}

      {/* Without JavaScript nothing would open the details: the story is laid
          out as for reduced motion instead (destinations.css). */}
      <noscript>
        <style>{STATIC}</style>
      </noscript>
    </div>
  );
}

/** The reduced-motion layout of destinations.css, for a page without JavaScript. */
const STATIC = [
  '.dz-ui,.dz-mark,.dz-bar{display:none}',
  '.dz-place,.dz-place:last-of-type{height:auto;padding:0}',
  '.dz-ui+.dz-place{margin-top:0}',
  '.dz-stage{position:relative;top:auto;height:auto;margin-top:0}',
  '.dz-scene{position:relative;height:var(--dz-hs);overflow:hidden}',
  '.dz-detail{position:relative;height:auto;padding-top:clamp(2.5rem,5vw,4.5rem);padding-bottom:clamp(3rem,6vw,5.5rem);pointer-events:auto}',
  '.dz-h,.dz-copy-body,.dz-cards{opacity:1}',
  '.dz-cards{clip-path:none;overflow-x:auto;padding-bottom:.75rem}',
  '.dz-row{padding-right:var(--dz-side)}',
].join('');

/**
 * One country. Memoised: the story re-renders for the pill's name; a country
 * re-renders only when its photographs may start loading.
 */
const Place = memo(function Place({
  place,
  eager,
  first,
}: {
  place: StoryPlace;
  eager: boolean;
  first: boolean;
}) {
  const { scene } = place;
  const titleId = `${place.slug}-title`;
  const loading = eager ? 'eager' : 'lazy';
  const vars = {
    '--dz-n': place.stays.length + place.journeys.length,
    '--dz-ar': scene.height / scene.width,
    '--dz-px': scene.x,
    '--dz-pxn': scene.xNarrow,
    '--dz-py': scene.y,
    '--dz-sky': scene.skyline,
    '--dz-sink': scene.sink,
    // The name's width in em until the face has been measured (PlaceStory
    // measures it once the font is in): its capitals run about 0.47em, I 0.22em.
    '--dz-em': [...place.country.toUpperCase()]
      .reduce((em, c) => em + (c === 'I' ? 0.22 : c === ' ' ? 0.25 : 0.47), 0)
      .toFixed(3),
  } as CSSProperties;

  return (
    <article
      id={place.slug}
      className="dz-place"
      aria-labelledby={titleId}
      style={vars}
      data-cut={scene.cutout ? '' : undefined}
    >
      <div className="dz-stage">
        <div className="dz-scene" aria-hidden>
          <div className="dz-media">
            <Image
              src={scene.src}
              alt=""
              fill
              sizes="100vw"
              loading={loading}
              fetchPriority={first ? undefined : 'low'}
              onLoad={warm}
              className="dz-img"
            />
          </div>
          <span className="dz-dim" />
          <div className="dz-name">
            <span>{place.country}</span>
          </div>
          {scene.cutout && (
            <div className="dz-fgw">
              <Image
                src={scene.cutout}
                alt=""
                fill
                sizes="100vw"
                loading={loading}
                fetchPriority={first ? undefined : 'low'}
                onLoad={warm}
                className="dz-img"
              />
            </div>
          )}
        </div>

        <div className="dz-detail">
          <div className="dz-copy">
            <h3 id={titleId} className="dz-h" tabIndex={-1}>
              {place.country}
            </h3>
            <div className="dz-copy-body">
              {place.tagline && <p className="dz-tl">{place.tagline}</p>}
              <ul className="dz-js" aria-label={`Journeys to ${place.country}`}>
                {place.journeys.map((journey) => (
                  <li key={journey.slug}>
                    <Link href={`/journeys/${journey.slug}`} className="dz-j">
                      <span className="dz-j-main">
                        <span className="dz-j-title">{journey.title}</span>
                        <span className="dz-j-facts">
                          <span>{journey.region}</span>
                          <span>{journey.days} days</span>
                          <span>{journey.departureWindow}</span>
                          <span>{journey.price}</span>
                        </span>
                        {journey.tag !== 'open' && (
                          <StatusTag status={journey.tag} tone="dark" className="dz-j-tag" />
                        )}
                      </span>
                      <Arrow />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dz-cards">
            <ol className="dz-row" aria-label={`${place.country}: where the journeys stay`}>
              {place.stays.map((stay) => (
                <li key={stay.name} className="dz-card">
                  <figure>
                    <span className="dz-card-img">
                      <Image
                        src={stay.photo.src}
                        alt={stay.photo.alt}
                        fill
                        sizes="(max-width: 900px) 72vw, 24vw"
                        loading={loading}
                      />
                    </span>
                    <figcaption className="dz-card-cap">
                      <span className="dz-card-k">
                        {stay.nights} · {stay.journey}
                      </span>
                      <span className="dz-card-t">{stay.name}</span>
                      <span className="dz-card-f">{stay.tagline}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
              {place.journeys.map((journey) => (
                <li key={journey.slug} className="dz-card dz-card-j">
                  <Link href={`/journeys/${journey.slug}`} className="dz-card-a">
                    {journey.photo && (
                      <span className="dz-card-img">
                        <Image
                          src={journey.photo.src}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 72vw, 24vw"
                          loading={loading}
                        />
                      </span>
                    )}
                    <span className="dz-card-cap">
                      <span className="dz-card-k">Journey · {journey.days} days</span>
                      <span className="dz-card-t">{journey.title}</span>
                      <span className="dz-card-f">
                        {journey.region} · {journey.departureWindow} · {journey.price}
                      </span>
                      {journey.tag !== 'open' && (
                        <StatusTag status={journey.tag} tone="dark" className="dz-j-tag" />
                      )}
                      <span className="dz-card-go">
                        View journey <Arrow />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <span className="dz-bar" aria-hidden>
              <i />
            </span>
          </div>
        </div>
      </div>
      {/* Where the page is taken to: the details in full ("See details"),
          and the details' last moment before the next country (snapping). */}
      <span id={`${place.slug}-details`} className="dz-mark" aria-hidden />
      <span id={`${place.slug}-end`} className="dz-mark" aria-hidden />
    </article>
  );
});

/** Decodes a photograph as soon as it has loaded, so its first frame on screen does not wait for it. */
const warm = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.decode?.().catch(() => {});
};

function Arrow() {
  return (
    <svg
      className="dz-arrow"
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M0 5h16M12 1l4 4-4 4" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/**
 * An opacity that never quite reaches 0: a layer at 0 is not drawn, so it
 * would be painted for the first time on the frame it appears; at 0.001 it is
 * ready beforehand, and still invisible.
 */
const shown = (v: number) => Math.max(0.001, v).toFixed(3);
/** 0 → 1 as `v` goes from `a` to `b`. */
const span = (v: number, a: number, b: number) =>
  b > a ? clamp((v - a) / (b - a)) : v >= b ? 1 : 0;

type Parts = {
  article: HTMLElement;
  stage: HTMLElement;
  media: HTMLElement | null;
  fg: HTMLElement | null;
  dim: HTMLElement | null;
  name: HTMLElement | null;
  head: HTMLElement | null;
  body: HTMLElement | null;
  detail: HTMLElement | null;
  cards: HTMLElement | null;
  row: HTMLElement | null;
  items: HTMLElement[];
  bar: HTMLElement | null;
  marks: { details: HTMLElement | null; end: HTMLElement | null };
};

/** Where one country's phases fall, in scroll positions (px), and what moves how far. */
type Geo = {
  arrive: number;
  pin: number;
  rest: number;
  d0: number;
  d1: number;
  d2: number;
  release: number;
  height: number;
  rise: number;
  shrink: { dx: number; dy: number; s: number };
  x0: number;
  slide: number;
  overflow: number;
  lefts: number[];
  widths: number[];
  right: number;
};

/**
 * Runs the story: measures where every phase falls, then on every frame in
 * which the page moved writes each moving part's transform and opacity.
 * Returns the clean-up.
 */
function drive(
  story: HTMLElement,
  hooks: {
    onCurrent: (i: number) => void;
    onNear: () => void;
    skipFocus: { current: boolean };
  },
) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const parts: Parts[] = Array.from(story.querySelectorAll<HTMLElement>(':scope > .dz-place')).map(
    (article) => {
      const q = (s: string) => article.querySelector<HTMLElement>(s);
      return {
        article,
        stage: q('.dz-stage')!,
        media: q('.dz-media'),
        fg: q('.dz-fgw'),
        dim: q('.dz-dim'),
        name: q('.dz-name > span'),
        head: q('.dz-h'),
        body: q('.dz-copy-body'),
        detail: q('.dz-detail'),
        cards: q('.dz-cards'),
        row: q('.dz-row'),
        items: Array.from(article.querySelectorAll<HTMLElement>('.dz-card')),
        bar: q('.dz-bar > i'),
        marks: {
          details: document.getElementById(`${article.id}-details`),
          end: document.getElementById(`${article.id}-end`),
        },
      };
    },
  );
  const pill = story.querySelector<HTMLElement>('.dz-see');
  const rail = story.querySelector<HTMLElement>('.dz-rail');
  const thumb = story.querySelector<HTMLElement>('.dz-rail > i');
  if (!parts.length) return;

  let geo: Geo[] = [];
  let railRoom = 0;
  let frame = 0;
  let current = -1;
  let running = false;
  const written = new Map<HTMLElement, Record<string, string>>();
  const set = (el: HTMLElement | null, prop: string, value: string) => {
    if (!el) return;
    let cache = written.get(el);
    if (!cache) written.set(el, (cache = {}));
    if (cache[prop] === value) return;
    cache[prop] = value;
    el.style.setProperty(prop, value);
  };

  /** The size of the face, from the face itself, once it has loaded. */
  const fitNames = () => {
    for (const p of parts) {
      if (!p.name) continue;
      const size = parseFloat(getComputedStyle(p.name).fontSize);
      if (!size || !p.name.offsetWidth) continue;
      p.article.style.setProperty('--dz-em', (p.name.offsetWidth / size).toFixed(4));
    }
  };

  const docTop = (el: HTMLElement) => {
    let y = 0;
    for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null)
      y += e.offsetTop;
    return y;
  };
  /** An element's box within its stage, untouched by any transform. */
  const inStage = (el: HTMLElement, stage: HTMLElement) => {
    let x = 0;
    let y = 0;
    for (
      let e: HTMLElement | null = el;
      e && e !== stage;
      e = e.offsetParent as HTMLElement | null
    ) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };

  const measure = () => {
    const css = getComputedStyle(story);
    const f = (name: string, fallback: number) =>
      parseFloat(css.getPropertyValue(name)) || fallback;
    const hold = f('--dz-hold', 0.25);
    const reveal = f('--dz-reveal', 0.8);
    const dwell = f('--dz-dwell', 0.3);
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    geo = parts.map((p) => {
      const sc = getComputedStyle(p.stage);
      const top = parseFloat(sc.top) || 0;
      const pull = -(parseFloat(sc.marginTop) || 0);
      const height = p.stage.offsetHeight;
      const a = docTop(p.article);
      const content =
        p.article.clientHeight - (parseFloat(getComputedStyle(p.article).paddingBottom) || 0);
      const pin = a - pull - top;
      const release = Math.max(pin, a + content - height - top);
      const rest = clamp(a - pad, pin, release);
      const d0 = Math.min(release, rest + hold * height);
      const d1 = Math.min(release, d0 + reveal * height);
      const d2 = Math.max(d1, release - dwell * height);
      const arrive = pin + top - vh;

      const nameBox = p.name ? inStage(p.name, p.stage) : { x: 0, y: 0, w: 1, h: 1 };
      const headBox = p.head ? inStage(p.head, p.stage) : nameBox;
      const s = nameBox.h ? headBox.h / nameBox.h : 1;

      const cardsBox = p.cards ? inStage(p.cards, p.stage) : { x: 0, y: 0, w: 0, h: 0 };
      const lefts = p.items.map((it) => it.offsetLeft);
      const widths = p.items.map((it) => it.offsetWidth);
      const rowWidth = lefts.length ? lefts[lefts.length - 1] + widths[widths.length - 1] : 0;
      // The last card stops at the gutter, as the words start at it.
      const side = p.detail ? parseFloat(getComputedStyle(p.detail).paddingLeft) || 0 : 0;
      const right = vw - side;
      const overflow = Math.max(0, cardsBox.x + rowWidth - right);

      // Where the page glides to (SmoothScroll rests a target at the scroll
      // padding): the details in full, and their last moment.
      if (p.marks.details) p.marks.details.style.top = `${Math.round(d1 + pad - a)}px`;
      if (p.marks.end) p.marks.end.style.top = `${Math.round(release - 1 + pad - a)}px`;

      return {
        arrive,
        pin,
        rest,
        d0,
        d1,
        d2,
        release,
        height,
        rise: Math.max(nameBox.h * 1.3, height * 0.2),
        shrink: { dx: headBox.x - nameBox.x, dy: headBox.y - nameBox.y, s },
        x0: cardsBox.x,
        slide: Math.min(vw * 0.5, Math.max(0, vw - cardsBox.x) * 0.6),
        overflow,
        lefts,
        widths,
        right,
      };
    });
    railRoom = rail && thumb ? Math.max(0, rail.offsetHeight - thumb.offsetHeight) : 0;
  };

  const render = () => {
    frame = 0;
    if (!running) return;
    const y = window.scrollY;
    let pillOn = 0;
    let now = -1;

    geo.forEach((g, i) => {
      const p = parts[i];
      // Before its arrival and after its departure a country holds its last state.
      const s = clamp(y, g.arrive, g.release);
      if (y >= g.pin - g.height / 2) now = i;

      // The name rises from behind the land, faster than its photograph, and
      // settles a little after the photograph has.
      const riseFrom = g.pin - g.height * 0.5;
      const r = span(s, riseFrom, g.rest);
      // The details: the name to the heading, the photograph darker, the words and the row in.
      const d = span(s, g.d0, g.d1);
      // Then the row drifts left (evenly, with the scroll).
      const q = span(s, g.d1, g.d2);

      const ds = easeInOut(span(d, 0, 0.55));
      const lift = g.rise * (1 - r) * (1 - r);
      const sc = 1 + (g.shrink.s - 1) * ds;
      set(
        p.name,
        'transform',
        `translate3d(${(g.shrink.dx * ds).toFixed(2)}px, ${(lift + g.shrink.dy * ds).toFixed(2)}px, 0) scale(${sc.toFixed(4)})`,
      );
      const nameIn = span(r, 0, 0.3);
      const swap = span(d, 0.47, 0.56);
      set(p.name, 'opacity', shown(Math.min(nameIn, 1 - swap)));
      set(p.head, 'opacity', shown(swap));

      // The photograph darkens and drifts; its cut-out drifts with it (so the
      // two never part) and fades as the name leaves it, which changes no
      // pixel of the photograph itself.
      const drift = easeInOut(d);
      const zoom = 1 + 0.055 * drift + 0.025 * q;
      const pan = -(0.012 * drift + 0.01 * q) * g.height;
      const photo = `translate3d(0, ${pan.toFixed(2)}px, 0) scale(${zoom.toFixed(4)})`;
      set(p.media, 'transform', photo);
      set(p.fg, 'transform', photo);
      set(p.fg, 'opacity', shown(1 - span(d, 0.1, 0.38)));
      set(p.dim, 'opacity', shown(easeInOut(span(d, 0.3, 0.75))));

      const words = span(d, 0.5, 0.82);
      set(p.body, 'opacity', shown(words));
      set(p.body, 'transform', `translate3d(0, ${((1 - easeOut(words)) * 24).toFixed(2)}px, 0)`);

      const enter = easeOut(span(d, 0.5, 1));
      const rowX = (1 - enter) * g.slide - q * g.overflow;
      set(p.row, 'transform', `translate3d(${rowX.toFixed(2)}px, 0, 0)`);
      set(p.cards, 'opacity', shown(enter));
      p.items.forEach((item, j) => {
        // A card is whole up to the left edge of the row, fades as it passes
        // the edge, and is gone before it is a third of the way past it.
        const x = g.x0 + g.lefts[j] + rowX;
        const out = clamp((x - g.x0 + g.widths[j] * 0.3) / (g.widths[j] * 0.3));
        set(item, 'opacity', shown(out));
      });
      set(p.bar, 'transform', `scaleX(${q.toFixed(4)})`);
      set(p.detail, 'pointer-events', d > 0.6 ? 'auto' : 'none');

      // The pill: in as a country arrives, out as its details open.
      const arrived = span(s, g.pin - g.height * 0.35, g.pin);
      pillOn = Math.max(pillOn, Math.min(arrived, 1 - span(d, 0, 0.2)));
    });

    if (pill) {
      set(pill, 'opacity', pillOn.toFixed(3));
      set(pill, 'visibility', pillOn < 0.02 ? 'hidden' : 'visible');
    }
    // The progress line shows with the pill, and steps back for the details.
    set(rail, 'opacity', pillOn.toFixed(3));
    if (thumb && geo.length) {
      const first = geo[0];
      const last = geo[geo.length - 1];
      const t = span(y, first.rest, last.d2);
      set(thumb, 'transform', `translate3d(0, ${(t * railRoom).toFixed(2)}px, 0)`);
    }
    // The country on screen, once the story has begun.
    if (now >= 0 && now !== current) {
      current = now;
      hooks.onCurrent(now);
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const clear = () => {
    for (const [el, props] of written)
      for (const prop of Object.keys(props)) el.style.removeProperty(prop);
    written.clear();
  };

  const start = () => {
    running = !reduce.matches;
    if (!running) {
      clear();
      return;
    }
    measure();
    render();
  };

  const onResize = () => {
    if (!running) return;
    measure();
    schedule();
  };

  // The first photographs start loading a screen and a half before the story.
  const ahead = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) hooks.onNear();
    },
    { rootMargin: '150% 0px 150% 0px' },
  );
  ahead.observe(story);

  // Gentle snapping. When a wheel or trackpad gesture (smooth scrolling on)
  // comes to rest between two resting points (between countries, or while a
  // country's details are opening), the page glides on to the next resting
  // point in the direction it was going, or back if it had barely left the
  // last one. Never on touch, keys or a glide of its own, never with reduced
  // motion (nothing is pinned then), and any new gesture takes over at once.
  let lastWheel = -Infinity;
  let heading = 1;
  let idle = 0;
  const onWheel = (event: WheelEvent) => {
    lastWheel = performance.now();
    if (event.deltaY) heading = Math.sign(event.deltaY);
  };
  const restingPoint = (y: number) => {
    // On to the next resting point, unless the page had barely left the last.
    const onward = (t: number) => (heading > 0 ? t > 0.06 : t > 0.94);
    for (let i = 0; i < geo.length; i++) {
      const g = geo[i];
      const slug = parts[i].article.id;
      if (y > g.d0 + 2 && y < g.d1 - 2)
        return onward((y - g.d0) / (g.d1 - g.d0)) ? `${slug}-details` : slug;
      const last = geo[i - 1];
      if (last && y > last.release + 2 && y < g.rest - 2)
        return onward((y - last.release) / (g.rest - last.release))
          ? slug
          : `${parts[i - 1].article.id}-end`;
      // The first country, once it fills most of the screen on the way down,
      // finishes arriving; on the way up the page is left to go back.
      if (!last && heading > 0 && y > g.pin - g.height * 0.4 && y < g.rest - 2) return slug;
    }
    return null;
  };
  const settle = () => {
    idle = 0;
    const html = document.documentElement;
    if (
      !running ||
      performance.now() - lastWheel > 1200 ||
      !html.classList.contains('lenis') ||
      html.classList.contains('lenis-stopped') ||
      html.hasAttribute('data-nav-open')
    )
      return;
    const to = restingPoint(window.scrollY);
    if (to) window.dispatchEvent(new CustomEvent('p2s:scroll-to', { detail: to }));
  };
  const onMove = () => {
    if (idle) window.clearTimeout(idle);
    idle = window.setTimeout(settle, 160);
  };

  // A link or card reached by Tab while its details are not open: the page
  // goes to where it shows.
  const onFocus = (event: FocusEvent) => {
    if (!running) return;
    if (hooks.skipFocus.current) {
      hooks.skipFocus.current = false;
      return;
    }
    const target = event.target as HTMLElement;
    const i = parts.findIndex((p) => p.detail?.contains(target));
    const g = geo[i];
    if (!g) return;
    // Where `overflow: clip` is unknown, the browser may have scrolled the
    // stage sideways to the card; the row's own movement shows it instead.
    parts[i].stage.scrollLeft = 0;
    const y = window.scrollY;
    let want: number | null = null;
    const card = target.closest<HTMLElement>('.dz-card');
    const j = card ? parts[i].items.indexOf(card) : -1;
    if (j >= 0 && g.overflow > 0) {
      // Far enough along that the whole card is in view.
      const need = (g.x0 + g.lefts[j] + g.widths[j] - g.right) / g.overflow;
      const keep = g.lefts[j] / g.overflow;
      const q = clamp(Math.max(need, 0), 0, clamp(keep));
      want = g.d1 + q * (g.d2 - g.d1);
      if (y >= g.d1 && y <= g.release) {
        const now = span(y, g.d1, g.d2);
        if (now >= need && now <= keep) want = null;
      }
    } else if (y < g.d1 || y > g.release) {
      want = g.d1;
    }
    if (want === null) return;
    const to = Math.round(want);
    requestAnimationFrame(() => window.scrollTo({ top: to, behavior: 'instant' }));
  };

  const onFonts = () => {
    fitNames();
    onResize();
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('scroll', onMove, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('resize', onResize);
  story.addEventListener('focusin', onFocus);
  reduce.addEventListener('change', start);
  const sizes = new ResizeObserver(onResize);
  sizes.observe(story);
  document.fonts?.ready.then(onFonts).catch(() => {});

  fitNames();
  start();

  return () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    if (idle) window.clearTimeout(idle);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('scroll', onMove);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    story.removeEventListener('focusin', onFocus);
    reduce.removeEventListener('change', start);
    sizes.disconnect();
    ahead.disconnect();
    clear();
  };
}
