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
import type { StoryPlace, StoryScene } from './story';

/**
 * The countries as one story told by scrolling, after the reference film:
 *
 * 1. Arrival. Each country's photograph slides up with the last one, a hard
 *    edge between them, and the country's name rises into the middle of the
 *    frame from behind the land: the name sits between the photograph and a
 *    cut-out of its foreground (the same picture with the sky removed), and
 *    travels up faster than its photograph.
 * 2. Hold. The name settled; one "See details" pill and a thin progress line
 *    stay put over the whole story. Scrolling goes on to the next country:
 *    the details never open by themselves.
 * 3. Details, only from the pill. The page holds still, the name shrinks to a
 *    heading at top left, the photograph darkens and drifts, the country's
 *    line and its journeys come in on the left and a row of photographs (the
 *    places the journeys stay, then the journeys) slides in from the right;
 *    the wheel, a swipe or the arrow keys move the row sideways. Close (or
 *    Escape) puts the scene back and lets the page scroll again.
 *
 * Layout is CSS (destinations.css): one tall article per country holding a
 * pinned stage, so the next stage scrolls up with the one it replaces. The
 * stage is pulled up by `--dz-x`, so the article's own top rests at the
 * scroll padding exactly when its name has settled: /destinations#italy, the
 * index chips and the site menu land there. The arrivals are driven here from
 * the scroll position and the details by time, once a frame, by transform
 * and opacity only.
 *
 * Readers who ask for reduced motion get no pinning and no movement: each
 * country is its photograph with its name, then its details, in the flow. So
 * does a phone held sideways, whose screen is too short for a country's
 * details to stand in the stage (`FLOW`). A turn of the device, which changes
 * every country's length and may change the layout, keeps the reader in the
 * same country, at the same moment in it.
 */
export function PlaceStory({
  places,
  lead = false,
}: {
  places: StoryPlace[];
  /** The story is the first thing on its page: the first country opens it, its name already standing. */
  lead?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  /** The country on screen, for the pill's name. */
  const [current, setCurrent] = useState(0);
  /** Countries up to this one may load their photographs now (the next one ahead of time). */
  const [near, setNear] = useState(-1);
  const currentRef = useRef(0);
  const story = useRef<Story | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const run = drive(el, {
      onCurrent: (i) => {
        currentRef.current = i;
        setCurrent(i);
        setNear((n) => Math.max(n, i + 1));
      },
      onNear: () => setNear((n) => Math.max(n, 0)),
    });
    story.current = run ?? null;
    return () => {
      run?.destroy();
      story.current = null;
    };
  }, []);

  const seeDetails = (event: MouseEvent<HTMLButtonElement>) => {
    const place = places[currentRef.current];
    if (!place) return;
    story.current?.open(currentRef.current);
    // From the keyboard, the reader goes on from the details' heading.
    if (event.detail === 0)
      document.getElementById(`${place.slug}-title`)?.focus({ preventScroll: true });
  };

  return (
    // The header stays over the story (`data-pin-header`): the stage is pinned
    // beneath it, and a header stepping aside would open a gap above it.
    <div
      ref={root}
      className="dz-story"
      data-lead={lead ? '' : undefined}
      data-tone="dark"
      data-fab-away
      data-pin-header
    >
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

/**
 * Where the story is laid out in the flow, nothing pinned and nothing moving:
 * for readers who ask for less motion, and on a phone held sideways. The same
 * query as destinations.css.
 */
const FLOW = '(prefers-reduced-motion: reduce), (orientation: landscape) and (max-height: 500px)';

/**
 * The stage photograph's `sizes`. On a screen narrower than the photograph's
 * shape, `object-fit: cover` draws it by the stage's height, wider than the
 * screen, so its file is chosen for that width: four-fifths of it, which
 * keeps it sharp without the weight of a file for the full crop. A screen of
 * three device pixels to the CSS pixel takes the file a two-pixel one would,
 * no softer to the eye and far lighter. The photograph and its cut-out take
 * the same value, so the two files always match.
 */
const COVER = 0.8;
const DENSE = 2 / 3;
const stageSizes = ({ width, height }: StoryScene) => {
  const cover = (k: number) => {
    const wide = (width / height) * COVER * k;
    return `(max-aspect-ratio: ${Math.round(wide * 1000)}/1000) calc((100vh - 4.25rem) * ${wide.toFixed(3)})`;
  };
  return `(min-resolution: 2.5dppx) and ${cover(DENSE)}, ${cover(1)}, 100vw`;
};

/** The flow layout of destinations.css, for a page without JavaScript. */
const STATIC = [
  '.dz-ui,.dz-mark,.dz-bar{display:none}',
  '.dz-place,.dz-place:last-of-type{height:auto;padding:0}',
  '.dz-ui+.dz-place,.dz-story[data-lead] .dz-ui+.dz-place{margin-top:0}',
  '.dz-stage{position:relative;top:auto;height:auto;margin-top:0}',
  '.dz-scene{position:relative;height:var(--dz-hs);overflow:hidden;overflow:clip}',
  '.dz-detail{position:relative;height:auto;padding-top:clamp(2.5rem,5vw,4.5rem);padding-bottom:clamp(3rem,6vw,5.5rem);pointer-events:auto}',
  '.dz-h,.dz-copy-body,.dz-cards{opacity:1}',
  '.dz-scroll{padding-bottom:.75rem;scrollbar-width:auto}',
  '.dz-shut{display:none}',
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
  const sizes = stageSizes(scene);
  const vars = {
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
    <article id={place.slug} className="dz-place" aria-labelledby={titleId} style={vars}>
      <div className="dz-stage">
        <div className="dz-scene" aria-hidden>
          <div className="dz-media">
            <Image
              src={scene.src}
              alt=""
              fill
              sizes={sizes}
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
                sizes={sizes}
                loading={loading}
                fetchPriority={first ? undefined : 'low'}
                onLoad={warm}
                className="dz-img"
              />
            </div>
          )}
        </div>

        <div className="dz-detail">
          <button
            type="button"
            className="dz-shut"
            aria-label={`Close details: ${place.country}`}
            data-shut
          >
            Close
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
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
            <div className="dz-scroll">
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
            </div>
            <span className="dz-bar" aria-hidden>
              <i />
            </span>
          </div>
        </div>
      </div>
      {/* Where the page is taken to: the country's last moment before the
          next one (snapping). */}
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
  scroll: HTMLElement | null;
  row: HTMLElement | null;
  bar: HTMLElement | null;
  end: HTMLElement | null;
};

/** Where one country's phases fall, in scroll positions (px), and what moves how far. */
type Geo = {
  arrive: number;
  pin: number;
  rest: number;
  release: number;
  height: number;
  rise: number;
  shrink: { dx: number; dy: number; s: number };
  slide: number;
};

/**
 * Where the reader is, kept on every frame so a turn of the device can bring
 * them back: a country, whether (in the flow) its details hold the middle of
 * the screen, and in the pinned story the phase and how far through it
 * (`phases`); or, past the story, how far past its end.
 */
type Spot = { i: number; details: boolean; phase: number; t: number } | { after: number } | null;

/** The running story: its details opened and closed from the pill, and its clean-up. */
type Story = { open: (i: number) => void; close: () => void; destroy: () => void };

/** How long the details take to open, and to close (ms). */
const OPENING = 1100;
const CLOSING = 750;

/**
 * Runs the story: measures where every phase falls, then on every frame in
 * which the page moved, or the details are opening or closing, writes each
 * moving part's transform and opacity.
 */
function drive(
  story: HTMLElement,
  hooks: {
    onCurrent: (i: number) => void;
    onNear: () => void;
  },
): Story | undefined {
  const flow = window.matchMedia(FLOW);
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
        scroll: q('.dz-scroll'),
        row: q('.dz-row'),
        bar: q('.dz-bar > i'),
        end: document.getElementById(`${article.id}-end`),
      };
    },
  );
  const pill = story.querySelector<HTMLElement>('.dz-see');
  const rail = story.querySelector<HTMLElement>('.dz-rail');
  const thumb = story.querySelector<HTMLElement>('.dz-rail > i');
  if (!parts.length) return;

  let geo: Geo[] = [];
  let railRoom = 0;
  /** Where the story ends: the scroll position at which its last edge reaches the top. */
  let end = 0;
  let frame = 0;
  let current = -1;
  let running = false;
  /** Pinned and moving, or laid out in the flow; null until the story starts. */
  let layout: 'pinned' | 'flow' | null = null;
  let spot: Spot = null;
  let width = window.innerWidth;
  /** How far each country's details are open, 0 → 1. */
  const amount = parts.map(() => 0);
  /** The country whose details are open (or opening), and the tween under way. */
  let opened: number | null = null;
  let tween: { i: number; from: number; to: number; t0: number; ms: number } | null = null;
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
      const arrive = pin + top - vh;

      const nameBox = p.name ? inStage(p.name, p.stage) : { x: 0, y: 0, w: 1, h: 1 };
      const headBox = p.head ? inStage(p.head, p.stage) : nameBox;
      const s = nameBox.h ? headBox.h / nameBox.h : 1;
      const cardsBox = p.cards ? inStage(p.cards, p.stage) : { x: 0, y: 0, w: 0, h: 0 };

      // The country's last moment before the next (SmoothScroll rests a
      // target at the scroll padding).
      if (p.end) p.end.style.top = `${Math.round(release - 1 + pad - a)}px`;

      return {
        arrive,
        pin,
        rest,
        release,
        height,
        rise: Math.max(nameBox.h * 1.3, height * 0.2),
        shrink: { dx: headBox.x - nameBox.x, dy: headBox.y - nameBox.y, s },
        slide: Math.min(vw * 0.5, Math.max(0, vw - cardsBox.x) * 0.6),
      };
    });
    railRoom = rail && thumb ? Math.max(0, rail.offsetHeight - thumb.offsetHeight) : 0;
    end = docTop(story) + story.offsetHeight;
  };

  /**
   * A country's phases in the pinned story, as scroll positions: its stage
   * over half the screen, pinned, its name settled, its release, and the next
   * stage over half the screen (after the last country, the story's end).
   */
  const phases = (i: number) => {
    const g = geo[i];
    const next = geo[i + 1];
    return [
      g.pin - g.height / 2,
      g.pin,
      g.rest,
      g.release,
      next ? next.pin - next.height / 2 : end,
    ];
  };

  /** Where the reader is in the pinned story. */
  const locate = (y: number): Spot => {
    if (y + window.innerHeight / 2 >= end) return { after: y - end };
    for (let i = geo.length - 1; i >= 0; i--) {
      const m = phases(i);
      if (y < m[0]) continue;
      let phase = 0;
      while (phase < m.length - 2 && y >= m[phase + 1]) phase++;
      const room = m[phase + 1] - m[phase];
      return { i, details: false, phase, t: room > 0 ? clamp((y - m[phase]) / room) : 0 };
    }
    return null;
  };

  /** Where the reader is in the flow: the country, or its details, at the middle of the screen. */
  const locateFlow = (): Spot => {
    const y = window.scrollY;
    const mid = y + window.innerHeight / 2;
    const bottom = docTop(story) + story.offsetHeight;
    if (mid >= bottom) return { after: y - bottom };
    for (let i = parts.length - 1; i >= 0; i--) {
      const { article, detail } = parts[i];
      if (mid < docTop(article)) continue;
      return { i, details: !!detail && mid >= docTop(detail), phase: 0, t: 0 };
    }
    return null;
  };

  /**
   * After a turn of the device, the reader back where they were: within the
   * pinned story, the same country at the same phase and as far through it;
   * between the two layouts, the same country's photograph, or (into the
   * flow) its details if they were open; past the story, the same distance
   * past it (what follows the story no lower than the middle of the screen).
   */
  const restore = (from: 'pinned' | 'flow') => {
    const s = spot;
    if (!s) return;
    let to: number;
    if ('after' in s) {
      const bottom = docTop(story) + story.offsetHeight;
      to = bottom + Math.max(s.after, -window.innerHeight / 2);
    } else if (layout === 'pinned') {
      const g = geo[s.i];
      if (!g) return;
      if (from === 'pinned') {
        const m = phases(s.i);
        to = m[s.phase] + s.t * (m[s.phase + 1] - m[s.phase]);
      } else {
        to = g.rest;
      }
    } else {
      // In the flow, the photograph or the details land as a link to them would.
      const el = s.details ? parts[s.i]?.detail : parts[s.i]?.article;
      if (!el) return;
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      to = docTop(el) - pad;
    }
    window.scrollTo({ top: Math.max(0, Math.round(to)), behavior: 'instant' });
  };

  const render = () => {
    frame = 0;
    if (!running) {
      if (layout === 'flow') spot = locateFlow();
      return;
    }
    const y = window.scrollY;
    let pillOn = 0;
    let now = -1;

    if (tween) {
      const t = clamp((performance.now() - tween.t0) / tween.ms);
      amount[tween.i] = tween.from + (tween.to - tween.from) * t;
      if (t >= 1) {
        const { i, to } = tween;
        tween = null;
        if (!to) shut(i);
      } else schedule();
    }

    geo.forEach((g, i) => {
      const p = parts[i];
      // Before its arrival and after its departure a country holds its last state.
      const s = clamp(y, g.arrive, g.release);
      if (y >= g.pin - g.height / 2) now = i;

      // The name rises from behind the land, faster than its photograph, and
      // settles a little after the photograph has.
      const riseFrom = g.pin - g.height * 0.5;
      const r = span(s, riseFrom, g.rest);
      // The details, opened from the pill: the name to the heading, the
      // photograph darker, the words and the row in.
      const d = amount[i];

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
      const zoom = 1 + 0.055 * drift;
      const pan = -0.012 * drift * g.height;
      const photo = `translate3d(0, ${pan.toFixed(2)}px, 0) scale(${zoom.toFixed(4)})`;
      set(p.media, 'transform', photo);
      set(p.fg, 'transform', photo);
      set(p.fg, 'opacity', shown(1 - span(d, 0.1, 0.38)));
      set(p.dim, 'opacity', shown(easeInOut(span(d, 0.3, 0.75))));

      const words = span(d, 0.5, 0.82);
      set(p.body, 'opacity', shown(words));
      set(p.body, 'transform', `translate3d(0, ${((1 - easeOut(words)) * 24).toFixed(2)}px, 0)`);

      const enter = easeOut(span(d, 0.5, 1));
      set(p.row, 'transform', `translate3d(${((1 - enter) * g.slide).toFixed(2)}px, 0, 0)`);
      set(p.cards, 'opacity', shown(enter));
      // Under the row, how much of it has been seen.
      if (d > 0 && p.scroll && p.scroll.scrollWidth) {
        const { scrollLeft, clientWidth, scrollWidth } = p.scroll;
        set(
          p.bar,
          'transform',
          `scaleX(${clamp((scrollLeft + clientWidth) / scrollWidth).toFixed(4)})`,
        );
      }
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
      const t = span(y, first.rest, last.rest);
      set(thumb, 'transform', `translate3d(0, ${(t * railRoom).toFixed(2)}px, 0)`);
    }
    // The country on screen, once the story has begun.
    if (now >= 0 && now !== current) {
      current = now;
      hooks.onCurrent(now);
    }
    spot = locate(y);
  };

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  const clear = () => {
    for (const [el, props] of written)
      for (const prop of Object.keys(props)) el.style.removeProperty(prop);
    written.clear();
  };

  /**
   * Closed details are out of reach of the keyboard and screen readers in the
   * pinned story (they are not on screen); in the flow they are always there.
   */
  const reach = () => {
    parts.forEach((p, i) => {
      if (p.detail) p.detail.inert = running && opened !== i;
    });
  };

  /** The details all the way closed: the row back to its start. */
  function shut(i: number) {
    const p = parts[i];
    p.article.removeAttribute('data-open');
    if (p.scroll) p.scroll.scrollLeft = 0;
    rowGoal = 0;
  }

  const lockPage = (on: boolean) => {
    const html = document.documentElement;
    if (on) html.setAttribute('data-dz-open', '');
    else html.removeAttribute('data-dz-open');
    window.dispatchEvent(new Event(on ? 'p2s:scroll-lock' : 'p2s:scroll-unlock'));
  };

  const tweenTo = (i: number, to: number) => {
    const from = amount[i];
    const ms = (to ? OPENING : CLOSING) * Math.abs(to - from);
    tween = { i, from, to, t0: performance.now(), ms: Math.max(1, ms) };
    schedule();
  };

  const open = (i: number) => {
    if (!running || opened !== null || !geo[i]) return;
    const g = geo[i];
    // The stage pinned in full before the page holds still.
    const y = window.scrollY;
    if (y < g.pin || y > g.release)
      window.scrollTo({ top: Math.round(g.rest), behavior: 'instant' });
    opened = i;
    parts[i].article.setAttribute('data-open', '');
    reach();
    requestAnimationFrame(() => {
      if (opened === i) lockPage(true);
    });
    tweenTo(i, 1);
  };

  const close = () => {
    if (opened === null) return;
    const i = opened;
    opened = null;
    // Focus inside the details goes back to the pill before they leave reach.
    if (parts[i].detail?.contains(document.activeElement)) pill?.focus({ preventScroll: true });
    reach();
    lockPage(false);
    tweenTo(i, 0);
  };

  /**
   * Lays the story out for the screen, pinned and moving or in the flow, and
   * after a switch (a phone turned sideways, or back) brings the reader back
   * to where they were. True if the layout changed.
   */
  const start = () => {
    const next = flow.matches ? 'flow' : 'pinned';
    if (next === layout) return false;
    const from = layout;
    if (opened !== null) {
      const i = opened;
      opened = null;
      lockPage(false);
      amount[i] = 0;
      tween = null;
      shut(i);
    }
    layout = next;
    running = next === 'pinned';
    width = window.innerWidth;
    reach();
    if (running) measure();
    else clear();
    if (from) restore(from);
    if (running) render();
    else spot = locateFlow();
    return true;
  };

  const onResize = () => {
    if (start() || !running) return;
    // A turn that keeps the story pinned (a tablet) brings the reader back to
    // the same moment; a change of height alone (a phone's toolbar) leaves
    // the page where it is.
    const turned = window.innerWidth !== width;
    width = window.innerWidth;
    measure();
    if (turned && opened === null) restore('pinned');
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
  // comes to rest between two countries, the page glides on to the next one
  // in the direction it was going, or back if it had barely left the last.
  // Never on touch, keys or a glide of its own, never in the flow (nothing is
  // pinned then), and any new gesture takes over at once. The glide is
  // SmoothScroll's own (`p2s:scroll-to`, as the site menu's in-page links
  // use): everything that decides it lives here, and leaves with the story.
  let lastWheel = -Infinity;
  let heading = 1;
  let idle = 0;
  const restingPoint = (y: number) => {
    // On to the next resting point, unless the page had barely left the last.
    const onward = (t: number) => (heading > 0 ? t > 0.06 : t > 0.94);
    for (let i = 0; i < geo.length; i++) {
      const g = geo[i];
      const slug = parts[i].article.id;
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
      opened !== null ||
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

  // With the details open, the wheel moves the row of photographs sideways,
  // easing towards where it has been sent; a swipe or the keys move it natively.
  let rowGoal = 0;
  let rowFrame = 0;
  const glideRow = () => {
    rowFrame = 0;
    const el = opened !== null ? parts[opened].scroll : null;
    if (!el) return;
    const dx = rowGoal - el.scrollLeft;
    if (Math.abs(dx) < 1.5) {
      el.scrollLeft = rowGoal;
      return;
    }
    el.scrollLeft += dx * 0.18;
    rowFrame = requestAnimationFrame(glideRow);
  };
  const onWheel = (event: WheelEvent) => {
    lastWheel = performance.now();
    if (event.deltaY) heading = Math.sign(event.deltaY);
    if (!running || opened === null) return;
    event.preventDefault();
    const el = parts[opened].scroll;
    if (!el) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? el.clientWidth : 1;
    const from = rowFrame ? rowGoal : el.scrollLeft;
    rowGoal = clamp(from + delta * unit, 0, el.scrollWidth - el.clientWidth);
    if (!rowFrame) rowFrame = requestAnimationFrame(glideRow);
  };

  // A swipe or the keys moving the row: its line follows.
  const onRowScroll = () => schedule();
  const onClick = (event: Event) => {
    if ((event.target as HTMLElement).closest('[data-shut]')) close();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && opened !== null) close();
  };

  const onFonts = () => {
    fitNames();
    onResize();
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('scroll', onMove, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKey);
  story.addEventListener('click', onClick);
  for (const p of parts) p.scroll?.addEventListener('scroll', onRowScroll, { passive: true });
  flow.addEventListener('change', start);
  const sizes = new ResizeObserver(onResize);
  sizes.observe(story);
  document.fonts?.ready.then(onFonts).catch(() => {});

  fitNames();
  start();

  return {
    open,
    close,
    destroy: () => {
      if (opened !== null) lockPage(false);
      opened = null;
      running = false;
      layout = null;
      if (frame) cancelAnimationFrame(frame);
      if (rowFrame) cancelAnimationFrame(rowFrame);
      if (idle) window.clearTimeout(idle);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('scroll', onMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
      story.removeEventListener('click', onClick);
      for (const p of parts) p.scroll?.removeEventListener('scroll', onRowScroll);
      flow.removeEventListener('change', start);
      sizes.disconnect();
      ahead.disconnect();
      for (const p of parts) {
        p.article.removeAttribute('data-open');
        if (p.detail) p.detail.inert = false;
      }
      clear();
    },
  };
}
