'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { primaryNav, ctaNav, site, isHeroRoute } from '@/lib/site';
import { enterAt } from '@/lib/motion';
import { MobileMenu } from './MobileMenu';

/** Past this the header steps aside on a scroll down. */
const HIDE_AFTER = 320;

/**
 * The header has four states, all in CSS (`.site-header` in globals.css):
 *
 * - transparent over a hero, frosted ivory once the page is read (`data-solid`)
 * - a little shorter as soon as the page moves (`data-compact`)
 * - out of the way on a long scroll down, back on any scroll up (`data-hidden`)
 * - plain ivory behind the open mobile menu (`data-menu`)
 */
export function Header() {
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
      // The page's hero, if it has one. Measured directly: a fraction of the
      // viewport height is wrong on every route whose hero has a floor or a
      // ceiling, and changes with a phone's browser bar on every scroll. Looked
      // up each time, so a re-rendered page never leaves a detached node here.
      const hero = overHero ? document.querySelector<HTMLElement>('[data-hero]') : null;

      // The header solidifies once the hero's bottom edge has passed behind it.
      if (hero) {
        const barHeight = barRef.current?.offsetHeight ?? 88;
        setScrolled(hero.getBoundingClientRect().bottom <= barHeight + 8);
      } else {
        setScrolled(true);
      }

      setCompact(y > 40);

      const delta = y - lastY;
      if (y < HIDE_AFTER || delta < -4) setHidden(false);
      else if (delta > 8) setHidden(true);
      lastY = y;
    };

    // One measurement per frame, however many scroll events arrive.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    // The thresholds depend on the layout, so they have to be recomputed when
    // the viewport changes — a rotate, a resize, or a first paint that lands
    // before the layout has its real height.
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [overHero, pathname]);

  // Close the menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Stable, so the menu's keyboard effect is not re-run on every header render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        ref={barRef}
        className="site-header fixed inset-x-0 top-0 z-50"
        data-solid={solid ? '' : undefined}
        data-menu={menuOpen ? '' : undefined}
        data-compact={compact && !menuOpen ? '' : undefined}
        data-hidden={hidden && !menuOpen ? '' : undefined}
      >
        {/* The entrance sits on the inner row, not the bar: an animation's fill
            would otherwise pin the bar's transform and defeat the hide. */}
        <div className="gutter enter-down flex h-full items-center" style={enterAt(0.05)}>
          <Link href="/" className="mr-auto block" aria-label={`${site.name} — home`}>
            <Image
              src="/brand/logo-dark.png"
              alt={site.name}
              width={900}
              height={485}
              priority
              sizes="180px"
              className="site-logo h-[30px] w-auto md:h-[42px]"
              style={{ filter: solid ? 'none' : 'invert(1)' }}
            />
          </Link>

          {/* Five links and the button only just fit a 1024px iPad in landscape;
              the gaps open up again from 1280px. */}
          <nav aria-label="Primary" className="hidden lg:flex lg:gap-6 xl:gap-9">
            {primaryNav.map((item) => {
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
            href={ctaNav.href}
            className="btn ml-8 hidden border border-current px-[22px] py-[14px] font-ui text-[11px] font-medium uppercase leading-none tracking-[0.16em] hover:border-ink hover:bg-ink hover:text-ivory lg:inline-block xl:ml-14"
          >
            {ctaNav.label}
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="relative z-50 -mr-2 ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[6px] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'mobile-menu' : undefined}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            <span
              aria-hidden
              className="block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.2,0.6,0.2,1)]"
              style={{ transform: menuOpen ? 'translateY(3.5px) rotate(45deg)' : 'none' }}
            />
            <span
              aria-hidden
              className="block h-px w-6 bg-current transition-transform duration-300 ease-[cubic-bezier(0.2,0.6,0.2,1)]"
              style={{ transform: menuOpen ? 'translateY(-3.5px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} returnFocusTo={toggleRef} />

      {/* Solid-header routes need the space the fixed bar occupies. */}
      {!overHero && <div aria-hidden className="h-[var(--nav-h)]" />}
    </>
  );
}
