'use client';

import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { OpenJourneyForm } from './forms/JourneyForms';

export type JourneyTab = { id: string; label: string };

/** A journey at a glance, in words: "13 days", "Small group" and its from-price. */
export type JourneyGlance = { days: string; group: string; price: string };

/** Which ends of a tab strip that scrolls sideways have tabs hidden past them. */
type Edge = 'start' | 'end' | 'both';

/**
 * The journey page's menu, after A&K: Overview │ Itinerary │ Stays │ Dates &
 * Rates │ Essential information, pinned under the header once the hero has
 * passed. The tab whose section is under the bar is marked current as the
 * page scrolls. The tabs are plain anchor links, so they work before
 * hydration and every section keeps its own address. Where the tabs are wider
 * than their room they scroll sideways: the current one is kept in view, and
 * the end with tabs hidden past it fades out.
 *
 * With `glance` (a journey's own page), the bar also carries the inquiry
 * (Ishika's notes of 9 November 2026, item 17a; the owner's decisions of
 * 18 November): from 1024px, at its right end, the journey's days, group size
 * and from-price and the "Make an inquiry" button; on a phone or a tablet, a
 * slim bar fixed to the foot of the screen with the days, the group size, the
 * from-price and the same button, shown once the hero has gone and hidden
 * while the footer is on the screen, so that there the tabs keep the menu
 * bar's whole width. That bar is marked `data-fab-away`, so the floating
 * "Connect with our team" steps aside while it shows. On a short screen (a
 * phone held sideways) the slim bar stays down and the button joins the tabs
 * instead, as from 1024px (journey-editorial.css). The button opens the page's
 * inquiry pop-up, so it must sit inside the page's `JourneyFormsProvider`.
 *
 * Without `glance`, a link button sits at the right of the bar only where
 * `cta` is given.
 *
 * `data-pin-header` keeps the header in place above the bar. The bar runs edge
 * to edge on the header's own gutter, so its tabs start under the logo and
 * its right end lines up with the menu button, as the sections of the pages
 * that carry it (a journey's page and the Journeys page) do.
 */
export function JourneyTabs({
  tabs,
  glance,
  cta,
  ctaHref = '/plan#contact',
  label = 'This journey',
}: {
  tabs: JourneyTab[];
  /** The journey's days, group size and from-price, for its inquiry block. */
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
  const listRef = useRef<HTMLUListElement>(null);
  const withBar = !!glance;

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

  // The phone's and tablet's inquiry bar: on once the hero has gone up off
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

  return (
    <>
      <nav
        aria-label={label}
        data-journey-tabs
        data-pin-header
        className="sticky top-[var(--nav-h-compact)] z-20 border-b border-line bg-ivory"
      >
        <div className="flex w-full items-center justify-between gap-6 px-[clamp(1.25rem,3.39vw,4rem)]">
          <ul
            ref={listRef}
            data-edge={edge ?? undefined}
            className={`jt-tabs relative -mx-1 m-0 flex min-w-0 list-none scroll-px-10 gap-1 overflow-x-auto p-0 [scrollbar-width:none] ${
              // On a journey's page the tabs sit closer below 1280px: there
              // they share the bar with the inquiry block, or (on a tablet)
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
                    className={`nav-label relative flex min-h-14 items-center px-1.5 transition-colors focus-visible:-outline-offset-2 duration-300 max-md:!text-[0.65625rem] max-md:!tracking-[0.12em] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:transition-transform after:duration-300 ${
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
              <OpenJourneyForm kind="enquiry" className="jt-pill">
                Make an inquiry
              </OpenJourneyForm>
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
          <OpenJourneyForm kind="enquiry" className="jt-pill">
            Make an inquiry
          </OpenJourneyForm>
        </div>
      )}
    </>
  );
}
