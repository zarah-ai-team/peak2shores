'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { site, isHeroRoute, type NavItem } from '@/lib/site';
import { enterAt } from '@/lib/motion';
import { MobileMenu } from './MobileMenu';

/** Past this the header steps aside on a scroll down. */
const HIDE_AFTER = 480;

/**
 * The header has four states, all in CSS (`.site-header` in globals.css):
 *
 * - transparent over a hero, frosted paper once the page is read (`data-solid`)
 * - a little shorter as soon as the page moves (`data-compact`)
 * - out of the way on a long scroll down, back on any scroll up (`data-hidden`),
 *   unless the page pins a bar beneath it (`[data-pin-header]`)
 * - on-dark over the open forest mobile menu (`data-menu`)
 *
 * Both logo files are in the tree; CSS cross-fades between them, so the swap
 * never waits on a render.
 */
export function Header({ primary, cta }: { primary: NavItem[]; cta: NavItem }) {
  const pathname = usePathname() ?? '/';
  const overHero = isHeroRoute(pathname);
  const [scrolled, setScrolled] = useState(!overHero);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // A zero-height viewport means the layout has not settled yet; measuring
      // against it would solidify the header over the hero. Wait for the resize.
      if (!window.innerHeight) return;
      const y = window.scrollY;
      // The page's hero, if it has one — measured directly, and looked up each
      // time so a re-rendered page never leaves a detached node here.
      const hero = overHero ? document.querySelector<HTMLElement>('[data-hero]') : null;

      // The header solidifies once the hero's bottom edge has passed behind it.
      if (hero) {
        const barHeight = barRef.current?.offsetHeight ?? 84;
        setScrolled(hero.getBoundingClientRect().bottom <= barHeight + 8);
      } else {
        setScrolled(true);
      }

      setCompact(y > 40);

      // A page that pins a bar beneath the header (the journeys filters) keeps
      // the header in place; hiding it would leave that bar floating.
      const pinned = document.querySelector('[data-pin-header]') !== null;

      const delta = y - lastY;
      if (pinned || y < HIDE_AFTER || delta < -4) setHidden(false);
      else if (delta > 8) setHidden(true);
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
  }, [overHero, pathname]);

  // Close the menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  // The menu is for small screens; widening past it closes it.
  useEffect(() => {
    if (!menuOpen) return;
    const wide = window.matchMedia('(min-width: 1024px)');
    const onChange = () => wide.matches && setMenuOpen(false);
    wide.addEventListener('change', onChange);
    return () => wide.removeEventListener('change', onChange);
  }, [menuOpen]);

  // Stable, so the menu's keyboard effect is not re-run on every header render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        ref={barRef}
        className="site-header fixed inset-x-0 top-0 z-50"
        data-solid={scrolled || menuOpen ? '' : undefined}
        data-menu={menuOpen ? '' : undefined}
        data-compact={compact && !menuOpen ? '' : undefined}
        data-hidden={hidden && !menuOpen ? '' : undefined}
      >
        {/* The entrance sits on the inner row, not the bar: an animation's fill
            would otherwise pin the bar's transform and defeat the hide. */}
        <div className="container-site enter-down flex h-full items-center" style={enterAt(0.05)}>
          <Link
            href="/"
            className="relative z-50 mr-auto flex min-h-11 items-center"
            aria-label={`${site.name} — home`}
          >
            <span className="site-logo">
              <Image
                src="/brand/logo-light.png"
                alt=""
                width={900}
                height={485}
                priority
                sizes="80px"
                className="logo-on-photo"
              />
              <Image
                src="/brand/logo-dark.png"
                alt=""
                width={900}
                height={485}
                priority
                sizes="80px"
                className="logo-on-paper"
              />
            </span>
          </Link>

          {/* Five links and the button only just fit a 1024px iPad in landscape;
              the gaps open up again from 1280px. */}
          <nav aria-label="Primary" className="hidden lg:flex lg:gap-6 xl:gap-8">
            {primary.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
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
            aria-current={pathname.startsWith(cta.href) ? 'page' : undefined}
            className="header-cta ml-8 hidden min-h-11 items-center border border-current px-[22px] font-ui text-[11.5px] font-medium uppercase leading-none tracking-[0.16em] transition-colors duration-300 lg:inline-flex xl:ml-12"
          >
            {cta.label}
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="relative z-50 -mr-2.5 ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[7px] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'mobile-menu' : undefined}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span
              aria-hidden
              className="block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.2,0.6,0.2,1)]"
              style={{ transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none' }}
            />
            <span
              aria-hidden
              className="block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.2,0.6,0.2,1)]"
              style={{ transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        returnFocusTo={toggleRef}
        primary={primary}
        cta={cta}
      />

      {/* Solid-header routes need the space the fixed bar occupies. */}
      {!overHero && <div aria-hidden className="h-[var(--nav-h)]" />}
    </>
  );
}
