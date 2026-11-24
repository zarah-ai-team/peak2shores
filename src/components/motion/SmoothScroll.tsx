'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/** What slides in as it is scrolled to, for browsers without scroll-driven animation. */
const SLIDES = [
  'main section:not([data-hero]) > :not([aria-hidden="true"]):not([data-no-settle]):not(script):not(style)',
  'main .dz-place .dz-in > *',
  '.jx .grid > li',
  '.xpd-grid > li',
  '.dz-facts > li',
].join(',');

/**
 * Where a section rests in the page, measured from the top of the document.
 * Its box cannot be trusted for this: a pinned section (`position: sticky`,
 * as the countries on Destinations are) reports the place it is pinned at,
 * not its own, and an arriving page is still a few pixels off its place
 * (PageTransition). So the section is unpinned for the length of the
 * measurement, and its offsets in the flow are added up, which no transform
 * touches.
 */
function restingTop(target: HTMLElement) {
  const pinned = getComputedStyle(target).position === 'sticky';
  const previous = target.style.position;
  if (pinned) target.style.position = 'static';
  let top = 0;
  for (let el: HTMLElement | null = target; el;) {
    const parent = el.offsetParent as HTMLElement | null;
    top += el.offsetTop + (parent?.clientTop ?? 0);
    el = parent;
  }
  if (pinned) target.style.position = previous;
  return top;
}

/**
 * Smooth, eased scrolling by wheel and trackpad (Lenis), with in-page links
 * landing clear of the header. Touch keeps the device's own scrolling. Off
 * entirely for readers who ask for reduced motion.
 *
 * Where the browser cannot tie animation to scroll position (the stylesheet's
 * slide-ins), blocks below the fold are marked to wait and slide in when they
 * arrive. Nothing is hidden unless this script has run and marked it.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  /** The section the page has been asked to glide to and has not reached yet. */
  const goal = useRef<string | null>(null);

  // Takes the page to a section, clear of the header: a glide with Lenis, at
  // once without it (reduced motion), where the browser places the section by
  // the root's scroll padding.
  //
  // The page is sent to a position, not to the element: a pinned section's
  // box is wherever it is pinned, so "scroll to this element" from further
  // down the page would move a little and stop on the section above it.
  const glideTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const l = lenis.current;
    if (l) {
      goal.current = id;
      l.scrollTo(restingTop(target) - pad, {
        onComplete: () => {
          goal.current = null;
        },
      });
    } else if (getComputedStyle(target).position === 'sticky')
      window.scrollTo(0, restingTop(target) - pad);
    else target.scrollIntoView();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      // In-page links land clear of the header, and of a pinned in-page menu:
      // the root's scroll padding, read at each click. This one instance
      // serves every page of the visit, and the padding differs between them
      // (a page with an in-page menu adds the menu's height) and with the
      // screen, so a value read once would be the first page's.
      anchors: {
        get offset() {
          return -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
        },
      },
      allowNestedScroll: true,
      autoRaf: true,
    });
    lenis.current = l;
    // The open menu holds the page still (SiteMenu); a glide in progress stops
    // with it, and is taken up again when the menu lets go (the reader opened
    // the menu again before the page had arrived). The reader moving the page
    // themselves ends a glide for good.
    const lock = () => l.stop();
    const unlock = () => {
      l.start();
      if (goal.current) glideTo(goal.current);
    };
    const drop = () => {
      goal.current = null;
    };
    window.addEventListener('p2s:scroll-lock', lock);
    window.addEventListener('p2s:scroll-unlock', unlock);
    window.addEventListener('wheel', drop, { passive: true });
    window.addEventListener('touchstart', drop, { passive: true });
    return () => {
      window.removeEventListener('p2s:scroll-lock', lock);
      window.removeEventListener('p2s:scroll-unlock', unlock);
      window.removeEventListener('wheel', drop);
      window.removeEventListener('touchstart', drop);
      l.destroy();
      lenis.current = null;
    };
  }, [glideTo]);

  // A new page starts still, with no glide carried over from the last one.
  // (Under the open menu it stays stopped; the menu starts it again as it closes.)
  // A new visit (a card, a link: not Back or Forward, and not to a section,
  // #…) opens at the top: Lenis keeps a scroll position of its own, and
  // would otherwise carry the last page's onto the new one.
  const visited = useRef<string | null>(null);
  useEffect(() => {
    goal.current = null;
    const l = lenis.current;
    const fresh = visited.current !== null && !traversed.current && !window.location.hash;
    visited.current = pathname;
    if (fresh) {
      l?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (!l) return;
    l.stop();
    if (!document.documentElement.hasAttribute('data-nav-open')) l.start();
  }, [pathname]);

  // The menu asks for a section of the page that is already open, once it has
  // let go of the page: the same glide as any in-page link.
  useEffect(() => {
    const onScrollTo = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (id) glideTo(id);
    };
    window.addEventListener('p2s:scroll-to', onScrollTo);
    return () => window.removeEventListener('p2s:scroll-to', onScrollTo);
  }, [glideTo]);

  // Back and Forward are told apart from a new visit. The flag is raised only
  // by a traversal that changes the route (the browser has the new address
  // before this component renders it), so one within a single page leaves
  // nothing behind for the next visit to trip over.
  const traversed = useRef(false);
  const rendered = useRef(pathname);
  rendered.current = pathname;
  useEffect(() => {
    const onTraverse = () => {
      traversed.current = window.location.pathname !== rendered.current;
    };
    window.addEventListener('popstate', onTraverse);
    return () => window.removeEventListener('popstate', onTraverse);
  }, []);
  /** True until the first page of this document has been handled. */
  const firstPage = useRef(true);

  // Arriving on a page at a section that is pinned (`position: sticky`, as the
  // countries on Destinations are): the router declines to scroll to a pinned
  // element, so a link such as /destinations#italy from another page would
  // leave the reader at the top. The page is taken there here instead. Other
  // targets are left to the router, which already places them, and so is a
  // return (Back, Forward, or a reload of the page), which is not a new visit
  // to the section: the reader is left where the browser put them back.
  useEffect(() => {
    const first = firstPage.current;
    firstPage.current = false;
    if (traversed.current) {
      traversed.current = false;
      return;
    }
    if (first) {
      const entry = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined;
      if (entry?.type === 'reload' || entry?.type === 'back_forward') return;
    }
    const raw = window.location.hash.slice(1);
    if (!raw) return;
    let id = raw;
    try {
      id = decodeURIComponent(raw);
    } catch {
      // A stray % (a mistyped or mangled link) cannot be decoded: the address
      // is read as written rather than allowed to stop the page.
    }
    const target = document.getElementById(id) ?? document.getElementById(raw);
    if (!target || getComputedStyle(target).position !== 'sticky') return;
    const frame = requestAnimationFrame(() =>
      window.dispatchEvent(new CustomEvent('p2s:scroll-to', { detail: target.id })),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      CSS.supports('animation-timeline: view()')
    )
      return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('sl-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    const fold = window.innerHeight;
    document.querySelectorAll<HTMLElement>(SLIDES).forEach((el, i) => {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add('sl-wait');
      el.style.setProperty('--sl-i', String(i % 3));
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
