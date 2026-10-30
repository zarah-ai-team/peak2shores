'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Marc's line, read aloud: each word brightens in turn once the quote is on
 * screen, then the credit's blue rules draw out. Rendered fully lit, so the
 * words never wait on JavaScript; only a quote that starts below the fold,
 * with motion allowed, dims and waits to be read.
 */
export function QuoteWords({
  before,
  emphasis,
  after,
  children,
}: {
  before: string;
  emphasis: string;
  after: string;
  /** The credit and link, shown once the words are read. */
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'lit' | 'waiting' | 'reading'>('lit');

  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return;
    setState('waiting');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState('reading');
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = [
    ...before
      .trim()
      .split(/\s+/)
      .map((text) => ({ text, accent: false })),
    { text: emphasis, accent: true },
    ...after
      .trim()
      .split(/\s+/)
      .map((text) => ({ text, accent: false })),
  ];

  return (
    <div
      ref={root}
      className={`qw ${state}`}
      style={{ '--n': words.length } as React.CSSProperties}
    >
      <blockquote>
        {words.map((word, i) => (
          <span key={i} className="w" style={{ '--i': i } as React.CSSProperties}>
            {word.accent ? <em>{word.text}</em> : word.text}{' '}
          </span>
        ))}
      </blockquote>
      {children}
    </div>
  );
}
