'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';
import { primaryNav, ctaNav, site } from '@/lib/site';
import { ease } from '@/lib/motion';
import { Tick } from '@/components/ui/Editorial';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  /** The control that opened the menu; focus returns to it on close. */
  returnFocusTo: RefObject<HTMLElement | null>;
};

/**
 * A full-screen editorial overlay rather than a drawer.
 *
 * The links arrive as masked lines, the same reveal the display type uses, so
 * opening the menu feels like turning to a contents page.
 *
 * It behaves as a modal should: while it is open the rest of the page is
 * `inert`, Tab wraps inside the panel, Escape closes it, and focus goes back
 * to the button that opened it.
 */
export function MobileMenu({ open, onClose, returnFocusTo }: MobileMenuProps) {
  const scrollY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock the page behind the overlay and restore the exact scroll position.
  useEffect(() => {
    if (!open) return;

    scrollY.current = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY.current}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY.current);
    };
  }, [open]);

  // Everything outside the header and the panel is inert while the menu is
  // up — nothing behind the overlay can take focus or be read.
  useEffect(() => {
    if (!open) return;
    const outside = document.querySelectorAll<HTMLElement>('main, footer, a[href="#main"]');
    outside.forEach((el) => {
      el.inert = true;
    });
    return () => {
      outside.forEach((el) => {
        el.inert = false;
      });
    };
  }, [open]);

  // Escape closes; Tab wraps; focus enters the panel on open and returns to
  // the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = returnFocusTo.current;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // The opener (in the header) stays reachable: it is the one element
      // outside the panel that can close the menu with the keyboard.
      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        (opener ?? last).focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        (opener ?? first).focus();
      } else if (!event.shiftKey && active === opener) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === opener) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open, onClose, returnFocusTo]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="mobile-menu"
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-40 bg-ivory lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: ease.exit } }}
          transition={{ duration: 0.45, ease: ease.editorial }}
        >
          <div className="gutter flex h-full flex-col overflow-y-auto pb-10 pt-[calc(var(--nav-h)+24px)]">
            <nav aria-label="Primary" className="flex flex-col border-t border-line">
              {primaryNav.map((item, i) => (
                <span key={item.href} className="overflow-hidden border-b border-line">
                  <m.span
                    className="block"
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 0.7,
                      ease: ease.reveal,
                      delay: 0.1 + i * 0.06,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-baseline gap-4 py-5"
                    >
                      <span className="kicker-sm w-8 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h4">{item.label}</span>
                    </Link>
                  </m.span>
                </span>
              ))}
            </nav>

            <m.div
              className="mt-auto flex flex-col gap-6 pt-10"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: ease.editorial, delay: 0.42 }}
            >
              <div className="kicker flex items-start gap-3 leading-[1.6]">
                <Tick className="mt-2 shrink-0" />
                Small-group journeys · max. {site.maxGuests} guests
              </div>
              <Link
                href={ctaNav.href}
                onClick={onClose}
                className="btn inline-flex self-start justify-start bg-ink px-[26px] py-4 font-ui text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-ivory"
              >
                {ctaNav.label}
              </Link>
              <div className="prose-body-sm">
                <a href={`mailto:${site.email}`} className="hover:text-acqua-text">
                  {site.email}
                </a>
                {site.phone && (
                  <>
                    <br />
                    <a href={`tel:${site.phoneHref}`} className="hover:text-acqua-text">
                      {site.phone}
                    </a>
                  </>
                )}
              </div>
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
