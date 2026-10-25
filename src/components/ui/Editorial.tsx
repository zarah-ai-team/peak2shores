import type { CSSProperties, ReactNode } from 'react';
import { enterAt } from '@/lib/motion';

/** The blue tick. A 1px mark, never a fill. Draws itself inside a Reveal. */
export { Tick } from './Tick';

export type Tone = 'light' | 'dark' | 'stone';

const kickerTone: Record<Tone, string> = {
  light: 'text-muted',
  dark: 'text-on-dark-muted',
  stone: 'text-stone-text',
};

/**
 * The numbered section label — "01 — Philosophy". Sits above the headline.
 * A `div` by default; pass `as="p"` when it is the only text naming a region.
 */
export function SectionLabel({
  children,
  className = '',
  style,
  tone = 'light',
  as: Tag = 'div',
  id,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  tone?: Tone;
  as?: 'div' | 'p' | 'h2' | 'h3';
  id?: string;
}) {
  return (
    <Tag id={id} className={`kicker ${kickerTone[tone]} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

/**
 * A label/value pair stacked under a caps label. `size="serif"` sets the value
 * in the serif at `.h5` — the journey Facts bar.
 */
export function MetaItem({
  label,
  children,
  className = '',
  tone = 'light',
  size = 'sm',
}: {
  label: string;
  children: ReactNode;
  className?: string;
  tone?: Tone;
  size?: 'sm' | 'serif';
}) {
  const valueTone =
    size === 'serif'
      ? tone === 'dark'
        ? 'text-on-dark'
        : 'text-ink'
      : tone === 'dark'
        ? 'text-on-dark-body'
        : 'text-body';
  return (
    <div className={className}>
      <div className={`kicker-sm mb-2 ${kickerTone[tone]}`}>{label}</div>
      <div className={`${size === 'serif' ? 'h5' : 'meta'} ${valueTone}`}>{children}</div>
    </div>
  );
}

/**
 * The opening of an index page: kicker, page title and standfirst, entering a
 * tenth of a second apart (CSS, so the LCP never waits on a bundle).
 *
 * - `split` (default): title cols 1–8, standfirst cols 9–12 on the baseline.
 * - `stacked`: title cols 1–10, standfirst below in cols 1–5.
 */
export function PageTitle({
  kicker,
  title,
  children,
  variant = 'split',
  className = '',
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  variant?: 'split' | 'stacked';
  className?: string;
}) {
  const split = variant === 'split';
  return (
    <section className={`container-site pb-block pt-section-sm ${className}`}>
      <SectionLabel as="p" className="enter m-0 mb-6 md:mb-8" style={enterAt(0)}>
        {kicker}
      </SectionLabel>
      <div className="grid-site gap-y-8 lg:items-end">
        <h1
          className={`page-title enter col-span-full max-w-[14ch] ${
            split ? 'lg:col-span-8' : 'lg:col-span-10'
          }`}
          style={enterAt(0.1)}
        >
          {title}
        </h1>
        {children && (
          <p
            className={`prose-body enter col-span-full measure m-0 ${
              split
                ? 'md:col-span-6 lg:col-span-4 lg:col-start-9 lg:pb-3'
                : 'md:col-span-5 lg:col-span-5'
            }`}
            style={enterAt(0.24)}
          >
            {children}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Rows of label and value under a rule. The label column is fixed so the
 * values align down the page; on a phone the pairs stack.
 */
export function FactList({
  rows,
  labelWidth = 120,
  className = '',
  rowClassName = 'py-4',
  tone = 'light',
}: {
  rows: { label: string; value: ReactNode }[];
  /** Width of the label column at ≥640px, in px. */
  labelWidth?: 120 | 130 | 200;
  className?: string;
  rowClassName?: string;
  tone?: Tone;
}) {
  const cols = {
    120: 'sm:grid-cols-[120px_minmax(0,1fr)]',
    130: 'sm:grid-cols-[130px_minmax(0,1fr)]',
    200: 'sm:grid-cols-[200px_minmax(0,1fr)]',
  }[labelWidth];
  const rule = tone === 'dark' ? 'border-line-dark' : 'border-line';
  const value = tone === 'dark' ? 'text-on-dark-body' : 'text-body';

  return (
    <dl className={`m-0 flex flex-col border-t ${rule} ${className}`}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={`grid gap-2 border-b ${rule} sm:gap-6 ${cols} ${rowClassName}`}
        >
          <dt className={`kicker-sm leading-[1.8] ${kickerTone[tone]}`}>{row.label}</dt>
          <dd className={`meta m-0 ${value}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A pull quote: a 48px blue rule, the italic serif `.quote`, and an optional
 * attribution in caps. Never for unverified guest testimonials.
 */
export function Quote({
  children,
  cite,
  tone = 'light',
  className = '',
}: {
  children: ReactNode;
  cite?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <figure className={`m-0 ${className}`}>
      <span aria-hidden className="mb-7 block h-px w-12 bg-brand" />
      <blockquote className={`quote m-0 ${tone === 'dark' ? 'text-on-dark' : 'text-ink'}`}>
        {children}
      </blockquote>
      {cite && <figcaption className={`kicker-sm mt-6 ${kickerTone[tone]}`}>{cite}</figcaption>}
    </figure>
  );
}
