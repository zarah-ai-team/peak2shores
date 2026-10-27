'use client';

import { useEffect, useRef, useState } from 'react';
import { site, whatsappHref } from '@/lib/site';

/**
 * "Speak to a travel designer", fixed bottom right on the homepage: one tap opens the
 * ways to reach a travel designer. Escape or a click outside closes it. Call,
 * WhatsApp and the scheduling link appear only once they are set in site.ts;
 * until a scheduling link exists, "Book a call" opens the inquiry form.
 */
export function ExpertButton() {
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // The circle and the footer already offer every way to reach a designer,
  // and the button would sit over their fields and links: it steps aside
  // while either is on screen.
  useEffect(() => {
    const targets = [...document.querySelectorAll('[data-fab-away], footer')];
    if (!targets.length) return;
    const showing = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) showing.add(entry.target);
        else showing.delete(entry.target);
      }
      const hidden = showing.size > 0;
      setAway(hidden);
      if (hidden) setOpen(false);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      <div className="panel" id="expert-panel" aria-hidden={!open}>
        <div className="lab">Speak to a travel designer</div>
        <p>
          Our travel designers will help you choose the right journey — or design one around you.
        </p>
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
        <span>Speak to a travel designer</span>
      </button>
    </div>
  );
}
