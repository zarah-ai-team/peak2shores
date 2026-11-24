'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site, whatsappHref } from '@/lib/site';
import './connect.css';

/**
 * "Connect with our team", fixed bottom right on every page: one tap opens the
 * ways to reach the team. Escape or a click outside closes it. Call,
 * WhatsApp and the scheduling link appear only once they are set in site.ts;
 * until a scheduling link exists, "Book a call" opens the enquiry form.
 */
/** The height of the strip at the foot of the screen that the button occupies. */
const STRIP = 104;

export function ConnectButton() {
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // The circle and the footer already offer every way to reach us,
  // and the button would sit over their fields and links: it steps aside
  // while either is on screen (`data-fab-away`). It also steps aside for a
  // row of controls it would cover, such as the journeys slider's arrows and
  // Pause (`data-fab-clear`), while that row is in the strip of the screen
  // where the button sits. Looked up again on every page, and the rows again
  // whenever the page's content changes: some are only built later, as the
  // Journeys page's Map view is the first time it is opened.
  useEffect(() => {
    const showing = new Set<Element>();
    const update = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) showing.add(entry.target);
        else showing.delete(entry.target);
      }
      const hidden = showing.size > 0;
      setAway(hidden);
      if (hidden) setOpen(false);
    };
    const whole = new IntersectionObserver(update);
    document.querySelectorAll('[data-fab-away], footer').forEach((el) => whole.observe(el));

    // The strip: the foot of the screen, as tall as the button and its margin.
    let rows: Element[] = [];
    let strip: IntersectionObserver | null = null;
    const watch = () => {
      strip?.disconnect();
      strip = null;
      rows.forEach((el) => showing.delete(el));
      // With rows to watch, the new observer reports each one straight away.
      if (!rows.length) {
        setAway(showing.size > 0);
        return;
      }
      const above = Math.max(0, window.innerHeight - STRIP);
      strip = new IntersectionObserver(update, { rootMargin: `-${above}px 0px 0px 0px` });
      rows.forEach((el) => strip?.observe(el));
    };
    const collect = () => {
      const found = [...document.querySelectorAll('[data-fab-clear]')];
      if (found.length === rows.length && found.every((el, i) => el === rows[i])) return;
      rows.forEach((el) => showing.delete(el));
      rows = found;
      watch();
    };
    collect();
    let frame = 0;
    const changes = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        collect();
      });
    });
    changes.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', watch);
    return () => {
      whole.disconnect();
      strip?.disconnect();
      changes.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', watch);
      setAway(false);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div ref={box} className={`hc hc-fab ${open ? 'open' : ''} ${away ? 'away' : ''}`}>
      {/* On a short screen the panel scrolls (connect.css); a wheel scrolls
          it too, not the page behind it. */}
      <div className="panel" id="expert-panel" aria-hidden={!open} data-lenis-prevent>
        <div className="lab">Connect with our team</div>
        <p>Our team will help you choose the right journey — or design one around you.</p>
        {site.phone && site.phoneHref && (
          <a href={`tel:${site.phoneHref}`}>
            Call<span>{site.phone}</span>
          </a>
        )}
        {site.whatsapp && (
          <a href={whatsappHref() ?? undefined} target="_blank" rel="noopener">
            WhatsApp<span>Message Peaks2Shores</span>
          </a>
        )}
        <a
          href={site.bookingUrl ?? '/plan#contact'}
          {...(site.bookingUrl ? { target: '_blank', rel: 'noopener' } : {})}
        >
          Book a call<span>{site.bookingUrl ? 'Choose a time' : 'Send us your dates'}</span>
        </a>
        <a href={`mailto:${site.email}`}>
          Email<span>{site.email}</span>
        </a>
      </div>
      <button
        type="button"
        className="fab-btn"
        aria-expanded={open}
        aria-controls="expert-panel"
        onClick={() => setOpen(!open)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
          )}
        </svg>
        <span>Connect with our team</span>
      </button>
    </div>
  );
}
