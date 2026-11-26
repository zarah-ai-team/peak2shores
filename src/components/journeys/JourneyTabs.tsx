'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HIDE_AFTER } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { availability, type DepartureStatus } from '@/lib/availability';
import { OpenJourneyForm } from './forms/JourneyForms';
import './journey-tabs.css';

export type JourneyTab = { id: string; label: string };

/**
 * A journey at a glance, in words: "13 days", "10–18 guests" and its
 * from-price, and its booking status (the best of its departures, from
 * journeyAvailability() in lib/availability.ts), which names the button:
 * "Request your place" while booking now, "Secure your place" once
 * guaranteed, "Explore other journeys" once sold out. Without a status the
 * journey is booking now.
 */
export type JourneyGlance = {
  days: string;
  group: string;
  price: string;
  status?: DepartureStatus;
};

/** Which ends of a tab strip that scrolls sideways have tabs hidden past them. */
type Edge = 'start' | 'end' | 'both';

/** Where "Explore other journeys" leads once every departure is sold out. */
const OTHER_JOURNEYS = '/journeys#collection';

/** The reader moving the page themselves: an arrival is then left where it is. */
const TAKE_OVER = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

/** When the reader last went Back or Forward within the visit (popstate). */
let traversedAt = Number.NEGATIVE_INFINITY;
if (typeof window !== 'undefined')
  window.addEventListener(
    'popstate',
    () => {
      traversedAt = performance.now();
    },
    true,
  );

/**
 * How the page on screen was reached. 'traverse': Back or Forward within the
 * site a moment ago; the router and the browser put the reader back where
 * they were, and SmoothScroll leaves them there too. 'restore': a reload, or
 * Back or Forward that loaded the page afresh, still on the entry the browser
 * loaded; the browser puts the reader back near where they were. 'visit':
 * anything else, a new visit to the section.
 */
function arrivalKind(): 'visit' | 'traverse' | 'restore' {
  if (performance.now() - traversedAt < 2000) return 'traverse';
  const entry = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  if (entry?.type !== 'reload' && entry?.type !== 'back_forward') return 'visit';
  // Still the entry the browser loaded, with no visit within the site since.
  // The router replaces the entry as the page starts (replaceState), which
  // gives it a new object but keeps its key; a visit gets a new key.
  const nav = (
    window as unknown as {
      navigation?: {
        activation?: { entry?: { key?: string } | null } | null;
        currentEntry?: { key?: string } | null;
      };
    }
  ).navigation;
  const loaded = nav?.activation?.entry?.key;
  if (loaded && nav?.currentEntry?.key)
    return loaded === nav.currentEntry.key ? 'restore' : 'visit';
  // Without the Navigation API: the address the browser loaded, in the first
  // seconds of the page.
  return performance.now() < 10_000 &&
    entry.name.split('#')[0] === window.location.href.split('#')[0]
    ? 'restore'
    : 'visit';
}

/**
 * The journey page's menu, after A&K: Overview │ Itinerary │ Stays │ Dates &
 * Rates │ Essential information, pinned at the top once the hero has passed.
 * The tab whose section is under the bar is marked current as the page
 * scrolls. The tabs are plain anchor links, so they work before hydration and
 * every section keeps its own address. Where the tabs are wider than their
 * room they scroll sideways: the current one is kept in view, and the end
 * with tabs hidden past it fades out.
 *
 * The header steps aside on a scroll down and the bar moves up to the very
 * top of the screen in its place, at every size, and back under the header
 * when it returns on a scroll up (the owner's decision of 25 November 2026;
 * globals.css). An in-page link (a tab, or any link to a part of the page)
 * lands its section flush under the bar in the state the header will be in
 * once the page has moved: away on the way down, back on the way up.
 *
 * With `glance` (a journey's own page), the bar also carries the journey's
 * booking (Ishika's notes of 9 November 2026, item 17a; the owner's decisions
 * of 18 November): from 1024px, at its right end, the journey's days, group
 * size and from-price and the booking button its status names; on a phone or
 * a tablet, a slim bar fixed to the foot of the screen with the days, the
 * group size (not under 410px wide), the from-price and the same button,
 * shown once the hero has gone and hidden while the footer is on the screen,
 * so that there the tabs keep the menu bar's whole width. That bar is marked
 * `data-fab-away`, so the floating "Connect with our team" steps aside while
 * it shows. On a short screen (a phone held sideways) the slim bar stays down
 * and the facts and the button join the tabs instead, as from 1024px
 * (journey-editorial.css: under 640px wide without the group size; under
 * 560px, a phone held upright on a short screen, the button alone). The
 * button opens the page's inquiry pop-up, so it must sit inside the page's
 * `JourneyFormsProvider`; once the journey is sold out it leads to the other
 * journeys instead.
 *
 * Without `glance`, a link button sits at the right of the bar only where
 * `cta` is given.
 *
 * The bar runs edge to edge on the header's own gutter, so its tabs start
 * under the logo and its right end lines up with the menu button, as the
 * sections of the pages that carry it (a journey's page and the Journeys
 * page) do.
 */
export function JourneyTabs({
  tabs,
  glance,
  cta,
  ctaHref = '/plan#contact',
  label = 'This journey',
}: {
  tabs: JourneyTab[];
  /** The journey's days, group size, from-price and status, for its booking block. */
  glance?: JourneyGlance;
  /** The button's label. Leave it out and the bar carries the tabs alone. */
  cta?: string;
  /** Where the button goes: the inquiry form on the Plan page by default. */
  ctaHref?: string;
  label?: string;
}) {
  const [current, setCurrent] = useState(tabs[0]?.id);
  const [edge, setEdge] = useState<Edge | null>(null);
  const [barOn, setBarOn] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const withBar = !!glance;
  const status = glance?.status ?? 'booking-now';

  // An in-page link lands its section flush under the bar in the state the
  // header will be in once the page has moved: on the way down the header
  // steps aside (past HIDE_AFTER, as Header.tsx decides), so the bar alone is
  // above the section; on the way up the header returns above the bar. The
  // landing is the page's scroll padding, set for this one move as the link is
  // followed (the browser still scrolls, focuses and updates the address
  // itself), then left to the stylesheet again (globals.css), which follows
  // the header as it is.
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    const release = () => {
      window.clearTimeout(timer);
      root.style.removeProperty('scroll-padding-top');
      window.removeEventListener('scrollend', release);
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      let id = link?.getAttribute('href')?.slice(1) ?? '';
      try {
        id = decodeURIComponent(id);
      } catch {
        // A malformed escape: the id as written.
      }
      const target = id ? document.getElementById(id) : null;
      const bar = navRef.current;
      if (!target || !bar) return;
      const header = document.querySelector<HTMLElement>('.site-header');
      const barHeight = bar.offsetHeight;
      const y = window.scrollY;
      // Where the section would land with the bar alone above it.
      const land = target.getBoundingClientRect().top + y - barHeight;
      const moves = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
      const away = header?.hasAttribute('data-hidden') ?? false;
      // Keyboard focus in the header holds it in place (Header.tsx `data-keyed`).
      const held = header?.hasAttribute('data-keyed') ?? false;
      // The header steps aside only on a move down of some length past
      // HIDE_AFTER (a short glide may not get there), and comes back on any
      // move up; under reduced motion it never moves at all.
      const willBeAway =
        moves && !held && land >= HIDE_AFTER && (land > y + 64 || (away && land >= y - 1));
      release();
      root.style.setProperty(
        'scroll-padding-top',
        `${willBeAway ? barHeight : barHeight + (header?.offsetHeight ?? 0)}px`,
      );
      window.addEventListener('scrollend', release, { once: true });
      timer = window.setTimeout(release, 1500);
    };
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      release();
    };
  }, []);

  // Arriving at a section (a shared address, /journeys/swiss-elegance#dates,
  // or a link from another page): the browser, or the router, sets off for it
  // reckoning with the header above the bar, but on the way down the header
  // steps aside, so the section would come to rest a header's height below
  // the bar (or under it, should the header come back). Once the page has
  // loaded and is still, a section left within a header and a bar's height of
  // where it belongs (more by as much as the cards above it have shrunk since
  // the page set off) is brought flush under the bar, in the state the header
  // will be in once the page has moved, as an in-page link lands (above). A
  // page put back (Back or Forward within the site, a reload: arrivalKind) is
  // left where it was put, but for a reload that left the section's start
  // just above the bar, and so is a page the reader has already taken over.
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    const bar = navRef.current;
    if (!raw || !bar) return;
    let id = raw;
    try {
      id = decodeURIComponent(raw);
    } catch {
      // A malformed escape: the id as written.
    }
    const target = document.getElementById(id);
    const kind = arrivalKind();
    if (!target || kind === 'traverse') return;
    const restore = kind === 'restore';
    // Where the section stood in the page when the browser or the router set
    // off for it: the Journeys cards fit themselves to the screen a frame
    // later, and the section rises by as much as they shrink.
    const from = target.getBoundingClientRect().top + window.scrollY;
    let timer = 0;
    let giveUp = 0;
    let stopped = false;
    // Still: no scroll for 200ms, counted once the page has loaded, and
    // waited for no longer than 6 seconds from then.
    const settle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(align, 200);
    };
    const arm = () => {
      giveUp = window.setTimeout(stop, 6000);
      window.addEventListener('scroll', settle, { passive: true });
      settle();
    };
    const stop = () => {
      stopped = true;
      window.clearTimeout(timer);
      window.clearTimeout(giveUp);
      window.removeEventListener('load', arm);
      window.removeEventListener('scroll', settle);
      for (const type of TAKE_OVER) window.removeEventListener(type, stop);
    };
    const align = () => {
      if (stopped) return;
      // The page's own arrival (PageTransition's 12px rise) still carrying
      // the section: it is measured once that has finished.
      const moving = document.getAnimations().filter((a) => {
        const el = a.effect instanceof KeyframeEffect ? a.effect.target : null;
        const end = a.effect?.getComputedTiming().endTime;
        return (
          a.playState === 'running' &&
          a.timeline === document.timeline &&
          typeof end === 'number' &&
          Number.isFinite(end) &&
          el instanceof Element &&
          el.contains(target)
        );
      });
      if (moving.length) {
        void Promise.allSettled(moving.map((a) => a.finished)).then(align);
        return;
      }
      const header = document.querySelector<HTMLElement>('.site-header');
      const headerHeight = header?.offsetHeight ?? 0;
      const barHeight = bar.offsetHeight;
      const away = header?.hasAttribute('data-hidden') ?? false;
      const held = header?.hasAttribute('data-keyed') ?? false;
      const moves = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
      const y = window.scrollY;
      const top = target.getBoundingClientRect().top;
      // Under the bar alone if the header is, or will be, away after the move
      // (as Header.tsx decides: past HIDE_AFTER, a move down of over 8px, or
      // none to speak of while it is away, and no keyboard focus in it); else
      // under the header and the bar.
      const under = top - barHeight;
      const willBeAway =
        moves && !held && y + under >= HIDE_AFTER && (under > 8 || (away && under >= -4));
      const move = willBeAway ? under : under - headerHeight;
      // A page put back (a reload): the reader is where they were, the header
      // perhaps back above the bar where it had stepped aside, so a section
      // they were reading at its start, left within a header and two bars'
      // height, is set back in place at once; one further off is left where
      // the browser put it. On a visit: further off than a header and a bar
      // (plus whatever the section has risen since), the page is still on its
      // way, in a pause of the browser's own glide, or was put back somewhere
      // else; it is looked at again the next time it comes to rest, until the
      // reader takes over or the six seconds are up.
      if (restore) {
        stop();
        if (Math.abs(move) < 2 || Math.abs(move) > headerHeight + 2 * barHeight) return;
        window.scrollTo({ top: y + move, behavior: 'instant' });
        return;
      }
      const shift = Math.abs(top + y - from);
      if (Math.abs(move) > headerHeight + barHeight + shift) return;
      stop();
      if (Math.abs(move) < 2) return;
      window.scrollTo({ top: y + move, behavior: moves ? 'smooth' : 'instant' });
    };
    for (const type of TAKE_OVER) window.addEventListener(type, stop, { passive: true });
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm);
    return stop;
  }, []);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    const measure = () => {
      frame = 0;
      // A section is current once its top has passed a line 30% of the way
      // down the screen, or the line where an in-page link lands it (the
      // page's scroll padding, under the pinned bar) when that is lower, as
      // on a phone held sideways: a tapped section is then always current.
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const line = Math.max(window.innerHeight * 0.3, pad + 2);
      // The lowest section on the page whose top has passed it — by position,
      // since the menu need not list the sections in page order.
      let active = sections[0]?.id;
      let best = -Infinity;
      for (const el of sections) {
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > best) {
          best = top;
          active = el.id;
        }
      }
      setCurrent(active);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [tabs]);

  // Where the strip scrolls sideways, the ends with tabs hidden past them.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const max = list.scrollWidth - list.clientWidth;
      const start = list.scrollLeft > 1;
      const end = list.scrollLeft < max - 1;
      setEdge(start && end ? 'both' : start ? 'start' : end ? 'end' : null);
    };
    update();
    // The strip and each tab: a tab widens when its font arrives after the
    // first measure, while the strip itself keeps its size.
    const resize = new ResizeObserver(update);
    resize.observe(list);
    list.querySelectorAll('li').forEach((li) => resize.observe(li));
    list.addEventListener('scroll', update, { passive: true });
    return () => {
      resize.disconnect();
      list.removeEventListener('scroll', update);
    };
  }, [tabs]);

  // The current tab is brought into the strip's view, sideways only.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector('[aria-current]')?.parentElement;
    if (!list || !item || list.scrollWidth <= list.clientWidth + 1) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({
      left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [current]);

  // The phone's and tablet's booking bar: on once the hero has gone up off
  // the screen or under the fixed header, off again while the footer is on
  // the screen. The header hides the strip of the screen it covers, so the
  // hero counts as gone once it has passed beneath it: the Overview tab,
  // which lands with the hero's foot just at the header's, brings the bar up
  // too.
  useEffect(() => {
    if (!withBar) return;
    const hero = document.querySelector('[data-hero]');
    const footer = document.querySelector('footer');
    // One pixel more than the header, so a hero ending exactly at its foot is past.
    const header = document.querySelector('.site-header');
    const under = Math.ceil(header?.getBoundingClientRect().height ?? 0) + 1;
    let past = !hero;
    let foot = false;
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero)
            past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          else foot = entry.isIntersecting;
        }
        setBarOn(past && !foot);
      },
      { rootMargin: `-${under}px 0px 0px 0px` },
    );
    if (hero) watch.observe(hero);
    if (footer) watch.observe(footer);
    if (!hero && !footer) setBarOn(true);
    return () => watch.disconnect();
  }, [withBar]);

  // The booking button, named by the journey's status: the inquiry pop-up
  // while places can be requested or secured, the other journeys once every
  // departure is sold out. The same button in the bar and in the phone's bar.
  const pill =
    status === 'sold-out' ? (
      <Link href={OTHER_JOURNEYS} className="jt-pill">
        {availability[status].cta}
      </Link>
    ) : (
      <OpenJourneyForm kind="enquiry" className="jt-pill">
        {availability[status].cta}
      </OpenJourneyForm>
    );

  return (
    <>
      <nav
        ref={navRef}
        aria-label={label}
        data-journey-tabs
        className="sticky top-[var(--nav-h-compact)] z-20 border-b border-line bg-ivory"
      >
        <div className="flex w-full items-center justify-between gap-6 px-[clamp(1.25rem,3.39vw,4rem)]">
          <ul
            ref={listRef}
            data-edge={edge ?? undefined}
            className={`jt-tabs relative -mx-1 m-0 flex min-w-0 list-none scroll-px-10 gap-1 overflow-x-auto p-0 [scrollbar-width:none] ${
              // On a journey's page the tabs sit closer below 1280px: there
              // they share the bar with the booking block, or (on a tablet)
              // are too many for its width.
              glance ? 'xl:gap-4' : 'md:gap-4'
            }`}
          >
            {tabs.map((tab) => {
              const on = tab.id === current;
              return (
                <li key={tab.id} className="shrink-0">
                  {/* The focus ring is drawn inside the tab: the strip scrolls
                      sideways, so it clips anything drawn outside its edges. */}
                  <a
                    href={`#${tab.id}`}
                    aria-current={on ? 'location' : undefined}
                    className={`nav-label relative flex min-h-14 items-center px-1.5 transition-colors focus-visible:-outline-offset-2 duration-300 max-md:!text-[0.6875rem] max-md:!tracking-[0.1em] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:transition-transform after:duration-300 ${
                      glance ? 'md:px-2.5 xl:px-3' : 'md:px-3'
                    } ${
                      on
                        ? 'text-ink after:scale-x-100 after:bg-acqua-deep'
                        : 'text-muted after:scale-x-0 after:bg-acqua-deep hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </a>
                </li>
              );
            })}
          </ul>
          {glance ? (
            <div className="jt-aside">
              <ul className="jt-glance" aria-label="This journey at a glance">
                <li>{glance.days}</li>
                <li>{glance.group}</li>
                <li className="v">{glance.price}</li>
              </ul>
              {pill}
            </div>
          ) : (
            cta && (
              <div className="hidden shrink-0 items-center gap-6 md:flex">
                <ButtonLink href={ctaHref} variant="navy" arrow className="!rounded-full !py-3.5">
                  {cta}
                </ButtonLink>
              </div>
            )
          )}
        </div>
      </nav>
      {glance && (
        <div className="jt-ibar" data-on={barOn ? '' : undefined} data-fab-away>
          <ul className="jt-glance" aria-label="This journey at a glance">
            <li>{glance.days}</li>
            <li>{glance.group}</li>
            <li className="v">{glance.price}</li>
          </ul>
          {pill}
        </div>
      )}
    </>
  );
}
