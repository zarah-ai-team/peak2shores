'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SiteMenu as SiteMenuData } from '@/lib/content/types';
import { site, isHeroRoute, type NavItem } from '@/lib/site';
import { enterAt } from '@/lib/motion';
import { MenuWarm } from './menu/MenuParts';
import { SiteMenu } from './SiteMenu';

/**
 * Past this the header steps aside on a scroll down. JourneyTabs reads it too,
 * to land an in-page link flush under its menu bar in the state the header
 * will be in once the page has moved.
 */
export const HIDE_AFTER = 480;

/** How long the bar takes to return to the page's own state after the menu closes. */
const CLOSING_MS = 400;

/**
 * The header has four states, all in CSS (`.site-header` in globals.css):
 *
 * - transparent over a hero, plain paper once the page is read (`data-solid`):
 *   once the hero has passed behind the bar, or, over a hero marked
 *   `data-header="solid-on-scroll"` (a journey page's), as soon as the page
 *   moves, so the bar never lies over that hero's title
 * - one size everywhere: the same bar, logo and links on every page and at
 *   every scroll position (`data-compact` marks a moved page but changes no size)
 * - out of the way on a long scroll down, back on any scroll up (`data-hidden`)
 *   and while keyboard focus is in it (`data-keyed`), unless the page pins a
 *   bar beneath it (`[data-pin-header]`). On the
 *   Journeys page and a journey's page the in-page menu bar (JourneyTabs)
 *   does not hold it: there the header steps aside on a scroll down at every
 *   size and the bar moves up to the very top of the screen in its place
 *   (globals.css; the owner's decision of 25 November 2026)
 * - on-dark over the open menu (`data-menu`), and for the moment after it
 *   closes (`data-nav-closing`) holding that state until the sheet has
 *   cleared the bar
 *
 * The three-line button is at the right end of the bar at every width and
 * opens the menu (`SiteMenu`). From 1024px the links and the button the client
 * approved stay beside it; they fade while the menu is open, and the bar is
 * then the logo and the cross.
 *
 * Both logo files are in the tree; CSS cross-fades between them, so the swap
 * never waits on a render. Nothing here reads the window to decide what to
 * render, so the server and the browser always draw the same bar.
 *
 * What the bar draws (over a hero or not, the spacer, the current link) is
 * read from the route the root layout is showing, not from the address. The
 * address can differ between the server and the browser: Vercel renders the
 * hourly rebuild of the homepage under "/index", so usePathname() read
 * "/index" on the server and "/" in the browser, and the cached homepage got
 * a solid bar and a spacer over the film (found 19 Nov 2026). The route is
 * the same on both sides: "/" on the homepage, "/journeys/<slug>" on a
 * journey. The address still drives the effects, which run in the browser.
 */
export function Header({
  primary,
  cta,
  menu,
}: {
  primary: NavItem[];
  cta: NavItem;
  menu: SiteMenuData;
}) {
  const pathname = usePathname() ?? '/';
  const route = `/${useSelectedLayoutSegments().join('/')}`;
  const overHero = isHeroRoute(route);
  const [scrolled, setScrolled] = useState(!overHero);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  /**
   * Keyboard focus is in the bar (it arrived there with Tab, Shift+Tab or the
   * like, as `:focus-visible` tells): a bar that has stepped aside comes back
   * while it is, so focus is never off-screen. A link clicked with the mouse
   * keeps focus too, but that must not hold the bar: after "Journeys" in the
   * bar was clicked, the bar stayed in place on the whole Journeys page (the
   * owner's report of 26 Nov 2026), as `:focus-within` would have it.
   */
  const [keyed, setKeyed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  /** Set the first time the button is pointed at, focused or touched. */
  const [warm, setWarm] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;

  useEffect(() => {
    let lastY = window.scrollY;
    /** How far the page has moved one way since it last turned (down is positive). */
    let run = 0;
    /** The page this is set up for: it is set up again for the next one. */
    const page = window.location.pathname;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // A zero-height viewport means the layout has not settled yet; measuring
      // against it would solidify the header over the hero. Wait for the resize.
      if (!window.innerHeight) return;
      // The open menu holds the bar's state: a resize must not restate it. The
      // page can still change under the menu (Back, Forward, the logo), so the
      // bar is measured again the moment the menu closes (`menuOpen` below).
      if (menuOpenRef.current) return;
      const y = window.scrollY;
      // The page's hero, if it has one — measured directly, and looked up each
      // time so a re-rendered page never leaves a detached node here.
      const hero = overHero ? document.querySelector<HTMLElement>('[data-hero]') : null;

      // The header solidifies once the hero's bottom edge has passed behind it,
      // or as soon as the page has moved over a hero that asks for that.
      if (hero?.dataset.header === 'solid-on-scroll') {
        setScrolled(y > 0);
      } else if (hero) {
        const barHeight = barRef.current?.offsetHeight ?? 84;
        setScrolled(hero.getBoundingClientRect().bottom <= barHeight + 8);
      } else {
        setScrolled(true);
      }

      setCompact(y > 40);

      // A page that pins a bar beneath the header (a destination's story)
      // keeps the header in place; hiding it would leave that bar floating.
      // The in-page menu of the Journeys page and of a journey's page is not
      // such a bar: it moves up into the header's place (globals.css).
      const pinned = document.querySelector('[data-pin-header]') !== null;

      const delta = y - lastY;
      if (delta) run = Math.sign(delta) === Math.sign(run) ? run + delta : delta;
      // Elsewhere the speed of a frame's move decides. On a page with an
      // in-page menu (the Journeys page, a journey's page) the distance
      // does, so the header steps aside however slowly the page is scrolled
      // down and at any frame rate (a 120Hz screen halves a frame's move),
      // and the bar takes the top as the owner decided on 25 November 2026.
      const step = document.querySelector('[data-journey-tabs]') ? run : delta;
      // The jump of a move to another page (to its top, or to the part its
      // address names, such as /journeys#availability from a journey's page)
      // is not a scroll up or down: until this is set up for the new page the
      // header keeps its state, so the landing, made with the scroll padding
      // of that state (globals.css), stays clear of it.
      const moved = window.location.pathname !== page;
      if (pinned || y < HIDE_AFTER || (!moved && step < -4)) setHidden(false);
      else if (!moved && step > 8) setHidden(true);
      lastY = y;
    };

    // One measurement per frame, however many scroll events arrive.
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
  }, [overHero, pathname, menuOpen]);

  // Close the menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  // A link in the bar was followed (by mouse, touch or keyboard): focus goes
  // into the new page, as the menu's links send it (SiteMenu), so it is not
  // left in a bar that steps aside, holding the bar in place (the owner's
  // report of 26 Nov 2026 and the independent check of the same day). The
  // page's <main> takes it without a ring and without moving the page.
  const shownPath = useRef(pathname);
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    if (barRef.current?.contains(document.activeElement)) {
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }, [pathname]);

  // Back or Forward to another part of the same page changes no route, but
  // the page moves all the same: the menu closes for that too.
  useEffect(() => {
    const onTraverse = () => setMenuOpen(false);
    window.addEventListener('popstate', onTraverse);
    return () => window.removeEventListener('popstate', onTraverse);
  }, []);

  // For a moment after the menu closes the bar is "closing": it keeps its dark
  // state while the sheet is still under it and returns to the page's own
  // ground as the sheet clears it. That state has to begin in the very render
  // in which the menu closes: a transition takes its timing from the rules in
  // force when the value changes, and a state set one render later (from an
  // effect) would arrive after the bar's transitions had already started.
  // Reopening within that moment cancels it.
  const [wasOpen, setWasOpen] = useState(false);
  if (menuOpen !== wasOpen) {
    setWasOpen(menuOpen);
    setClosing(!menuOpen);
  }
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setClosing(false), CLOSING_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  // Stable, so the menu's keyboard effect is not re-run on every header render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const warmUp = useCallback(() => setWarm(true), []);

  return (
    <>
      <header
        ref={barRef}
        className="site-header fixed inset-x-0 top-0 z-50"
        data-solid={scrolled || menuOpen ? '' : undefined}
        data-menu={menuOpen ? '' : undefined}
        data-nav-closing={closing ? '' : undefined}
        data-compact={compact && !menuOpen ? '' : undefined}
        data-hidden={hidden && !menuOpen ? '' : undefined}
        data-keyed={keyed ? '' : undefined}
        onFocus={(e) => setKeyed(e.target.matches(':focus-visible'))}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyed(false);
        }}
      >
        {/* The entrance sits on the inner row, not the bar: an animation's fill
            would otherwise pin the bar's transform and defeat the hide. */}
        <div className="site-header-row enter-down flex h-full items-center" style={enterAt(0.05)}>
          <Link
            href="/"
            className="site-header-home relative z-50 mr-auto flex min-h-11 items-center"
            aria-label={`${site.name} — home`}
            // Closes the menu at the click, as every link in the sheet does;
            // on the home page there is no change of route to close it. A
            // click that opens a new tab or window leaves the menu as it is.
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
              )
                return;
              closeMenu();
            }}
          >
            {/* Only the logo the page opens with is preloaded: the white one
                over a hero, the dark one on paper. Both load with the page
                (`eager`), so the other is there when the bar changes. */}
            <span className="site-logo">
              <Image
                src="/brand/p2s-logo-white.svg"
                alt={site.name}
                unoptimized
                width={2454}
                height={1017}
                priority={overHero}
                fetchPriority={overHero ? undefined : 'low'}
                loading="eager"
                className="logo-on-photo"
              />
              <Image
                src="/brand/p2s-logo.svg"
                alt={site.name}
                unoptimized
                width={2454}
                height={1017}
                priority={!overHero}
                fetchPriority={overHero ? 'low' : undefined}
                loading="eager"
                className="logo-on-paper"
              />
            </span>
          </Link>

          {/* The links and the button, as one piece: it fades while the menu
              is open and leaves the tab order with it. The gaps, the CTA's
              spacing and the labels (`--type-nav`) scale with the viewport:
              20px apart on a 1024px iPad, 32px at 1888px. Five links are
              what the row holds at 1024px beside the menu button (49px is
              left before the first link on a touch screen). A sixth needs
              this block to start later (72rem), together with the two
              `min-width: 64rem` rules of `.menu-toggle` in globals.css. */}
          <div className="header-inline hidden items-center lg:flex">
            <nav aria-label="Primary" className="flex gap-[clamp(1.25rem,1.695vw,2rem)]">
              {primary.map((item) => {
                const active = item.href === '/' ? route === '/' : route.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="nav-link nav-label"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href={cta.href}
              aria-current={route.startsWith(cta.href) ? 'page' : undefined}
              className="header-cta ml-[clamp(1.5rem,2.54vw,3rem)] inline-flex min-h-(--btn-h) items-center border border-current px-[clamp(1rem,1.17vw,1.375rem)] font-ui text-(length:--type-button) font-medium uppercase leading-none tracking-[0.16em] transition-colors duration-300"
            >
              {cta.label}
            </Link>
          </div>

          {/* Three lines that become a cross. The word beside them shows only
              where the bar has no links of its own (a tablet); either way the
              button's name says what it will do. */}
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-controls={menuOpen ? 'site-menu' : undefined}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
            onPointerEnter={warmUp}
            onFocus={warmUp}
            onTouchStart={warmUp}
          >
            <span className="menu-toggle-word nav-label" aria-hidden>
              <span>Menu</span>
              <span>Close</span>
            </span>
            <span className="menu-toggle-lines" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <SiteMenu
        open={menuOpen}
        onClose={closeMenu}
        returnFocusTo={toggleRef}
        headerRef={barRef}
        menu={menu}
        cta={cta}
      />
      {warm && <MenuWarm journeys={menu.journeys} />}

      {/* Solid-header routes need the space the fixed bar occupies. */}
      {!overHero && <div aria-hidden className="h-[var(--nav-h)]" />}
    </>
  );
}
