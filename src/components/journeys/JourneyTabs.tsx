'use client';

import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';

export type JourneyTab = { id: string; label: string };

/**
 * The journey page's menu, after A&K: Overview │ Itinerary │ Stays │ Dates &
 * Rates, pinned under the header once the hero has passed, with the price and
 * the way to enquire always beside it. The tab whose section is under the bar
 * is marked current as the page scrolls. The tabs are plain anchor links, so
 * they work before hydration and every section keeps its own address.
 *
 * `data-pin-header` keeps the header in place above the bar.
 */
export function JourneyTabs({
  tabs,
  priceFrom,
  cta,
}: {
  tabs: JourneyTab[];
  priceFrom: string;
  cta: string;
}) {
  const [current, setCurrent] = useState(tabs[0]?.id);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    const measure = () => {
      frame = 0;
      // The section whose top has passed a line just under the bar.
      const line = window.innerHeight * 0.3;
      let active = sections[0]?.id;
      for (const el of sections) if (el.getBoundingClientRect().top <= line) active = el.id;
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

  return (
    <nav
      aria-label="This journey"
      data-journey-tabs
      data-pin-header
      className="sticky top-[var(--nav-h-compact)] z-20 border-b border-line bg-ivory/95 backdrop-blur-[14px]"
    >
      <div className="container-site flex items-center justify-between gap-6">
        <ul className="-mx-1 m-0 flex list-none gap-1 overflow-x-auto p-0 [scrollbar-width:none] md:gap-4">
          {tabs.map((tab) => {
            const on = tab.id === current;
            return (
              <li key={tab.id} className="shrink-0">
                <a
                  href={`#${tab.id}`}
                  aria-current={on ? 'location' : undefined}
                  className={`nav-label relative flex min-h-14 items-center px-1.5 transition-colors duration-300 max-md:!text-[10.5px] max-md:!tracking-[0.12em] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:transition-transform after:duration-300 md:px-3 ${
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
        <div className="hidden shrink-0 items-center gap-6 md:flex">
          <p className="meta m-0 text-body">
            From <span className="font-semibold text-ink">{priceFrom}</span> per person
          </p>
          <ButtonLink href="#enquire" variant="forest" className="!py-3.5">
            {cta}
          </ButtonLink>
        </div>
      </div>
    </nav>
  );
}
