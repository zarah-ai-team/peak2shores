'use client';

import * as m from 'motion/react-m';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ease } from '@/lib/motion';

const SESSION_KEY = 'p2s:seen-preloader';
/** The shortest the sequence can read as intentional rather than a flash. */
const MIN_MS = 900;
/** The longest anyone waits, however slow the network. */
const MAX_MS = 1800;

/** Let the page's own entrance play. Set by the boot script in the layout. */
function releasePage() {
  document.documentElement.removeAttribute('data-preload');
}

/**
 * PEAKS → 2 → SHORES.
 *
 * The loader resolves on the window's own load event, floored at 900ms and
 * capped at 1800ms — it never invents a delay to look impressive. It runs once
 * per session; a returning visitor goes straight to the page.
 *
 * While it is up, the hero's entrance waits (see `data-preload` in
 * globals.css). The two hand over at the same instant: the cover lifts, the
 * words fade, the headline rises underneath.
 *
 * Renders nothing on the server and nothing at all under reduced motion, so
 * the decision never touches the hydrated markup.
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) {
      releasePage();
      return;
    }
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private browsing. Show it — a single 900ms screen is not a problem.
    }
    if (seen) {
      releasePage();
      return;
    }

    setVisible(true);
    const started = performance.now();
    let timer: number;

    const finish = () => {
      const elapsed = performance.now() - started;
      const wait = Math.max(0, MIN_MS - elapsed);
      timer = window.setTimeout(() => {
        setVisible(false);
        releasePage();
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* ignore */
        }
      }, wait);
    };

    const cap = window.setTimeout(finish, MAX_MS);

    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish, { once: true });
    }

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(cap);
      window.removeEventListener('load', finish);
    };
  }, [reduced]);

  // Hold the page still underneath.
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  const word = {
    hidden: { y: '110%' },
    visible: { y: '0%' },
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory"
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: ease.exit },
          }}
        >
          <div className="gutter w-full">
            <div className="flex flex-col items-start font-display leading-[0.92] tracking-[-0.02em] text-ink">
              {[
                { label: 'Peaks', delay: 0.05 },
                { label: '2', delay: 0.17 },
                { label: 'Shores', delay: 0.29 },
              ].map((line) => (
                <span key={line.label} className="block overflow-hidden pb-[0.04em]">
                  <m.span
                    className="block text-[clamp(40px,9vw,120px)]"
                    variants={word}
                    initial="hidden"
                    animate="visible"
                    style={{ color: line.label === '2' ? 'var(--color-acqua)' : undefined }}
                    transition={{ duration: 1, ease: ease.reveal, delay: line.delay }}
                  >
                    {line.label}
                  </m.span>
                </span>
              ))}
            </div>

            <m.div
              className="mt-8 h-px w-full max-w-[420px] origin-left bg-gorse"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: ease.editorial, delay: 0.2 }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
