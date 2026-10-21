'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';
import { site, type NavItem } from '@/lib/site';
import { duration, ease } from '@/lib/motion';
import { Arrow } from '@/components/ui/Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  /** The control that opened the menu; focus returns to it on close. */
  returnFocusTo: RefObject<HTMLElement | null>;
  primary: NavItem[];
  cta: NavItem;
};

/**
 * A full-screen forest-deep sheet rather than a drawer.
 *
 * The links are set in the serif at `.h3`, ruled, and rise 60ms apart, so
 * opening the menu feels like turning to a contents page. Under reduced motion
 * Motion drops the movement and the stylesheet pins `[data-menu-item]`.
 *
 * It behaves as a modal should: while it is open the rest of the page is
 * `inert`, Tab wraps inside the panel, Escape closes it, and focus goes back
 * to the button that opened it.
 */
export function MobileMenu({ open, onClose, returnFocusTo, primary, cta }: MobileMenuProps) {
  const scrollY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Lock the page behind the overlay and restore the exact scroll position.
  useEffect(() => {
    if (!open) return;

    scrollY.current = window.scrollY;
    const openedOn = pathnameRef.current;
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
      // Back to where the reader was — unless a menu link took them to a new
      // page, which starts at the top. Instant: the stylesheet's smooth
      // scrolling would otherwise show the page gliding down from the top.
      if (pathnameRef.current === openedOn) {
        window.scrollTo({ top: scrollY.current, behavior: 'instant' });
      }
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
          data-tone="dark"
          className="fixed inset-0 z-40 bg-forest-deep text-on-dark outline-none lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: duration.ui, ease: ease.exit } }}
          transition={{ duration: duration.uiSlow, ease: ease.editorial }}
        >
          <div className="container-site flex h-full flex-col overflow-y-auto pb-10 pt-[calc(var(--nav-h)+16px)]">
            <nav aria-label="Primary" className="flex flex-col border-t border-line-dark">
              {primary.map((item, i) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <span key={item.href} className="overflow-hidden border-b border-line-dark">
                    <m.span
                      data-menu-item
                      className="block"
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{ duration: 0.6, ease: ease.reveal, delay: 0.08 + i * 0.06 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className="group flex items-baseline gap-4 py-4 transition-colors duration-300 hover:text-acqua aria-[current=page]:text-acqua"
                      >
                        <span className="kicker-sm w-7 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="h3">{item.label}</span>
                      </Link>
                    </m.span>
                  </span>
                );
              })}
            </nav>

            <m.div
              data-menu-item
              className="mt-auto flex flex-col gap-7 pt-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: ease.editorial,
                delay: 0.08 + primary.length * 0.06,
              }}
            >
              <Link
                href={cta.href}
                onClick={onClose}
                className="btn inline-flex min-h-11 items-center gap-3 self-start bg-ivory px-7 py-[17px] font-ui text-[11.5px] font-medium uppercase leading-none tracking-[0.16em] text-ink hover:bg-white"
              >
                {cta.label}
                <Arrow />
              </Link>
              <div className="prose-body-sm">
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors duration-300 hover:text-acqua"
                >
                  {site.email}
                </a>
                {site.phone && site.phoneHref && (
                  <>
                    <br />
                    <a
                      href={`tel:${site.phoneHref}`}
                      className="transition-colors duration-300 hover:text-acqua"
                    >
                      {site.phone}
                    </a>
                  </>
                )}
              </div>
              <p className="kicker-sm m-0 text-on-dark-muted">{site.locations}</p>
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
