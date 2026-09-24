import type { CSSProperties, ReactNode } from 'react';
import { enterAt } from '@/lib/motion';

/** The gray-yellow tick. A 1px mark, never a fill. Draws itself inside a Reveal. */
export { Tick } from './Tick';

/**
 * The numbered rail label — "01 — Philosophy". On the canvas this sits in its
 * own 140px column; on mobile it becomes the section's opening line. A `div`
 * by default; pass `as="p"` when it is the only text naming a region.
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
  tone?: 'light' | 'dark';
  as?: 'div' | 'p' | 'h2' | 'h3';
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`kicker ${tone === 'dark' ? 'text-on-dark-muted' : ''} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

/** A label/value pair stacked under a caps label. Used across facts and specs. */
export function MetaItem({
  label,
  children,
  className = '',
  tone = 'light',
}: {
  label: string;
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div className={className}>
      <div className={`kicker-sm mb-2 ${tone === 'dark' ? 'text-on-dark-muted' : ''}`}>{label}</div>
      <div
        className={`font-ui text-[13px] font-light leading-[1.6] ${
          tone === 'dark' ? 'text-on-dark-body' : 'text-body'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The opening of an index page: a rail label, the page title, and a
 * standfirst — three lines that enter a tenth of a second apart. Used by
 * Journeys, Experiences, Journal and Plan; the photographic heroes are their
 * own thing.
 */
export function PageTitle({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="gutter editorial-grid pb-14 pt-20 md:pb-[72px] md:pt-[120px] lg:items-end">
      <SectionLabel as="p" className="enter m-0 lg:pb-3.5" style={enterAt(0)}>
        {kicker}
      </SectionLabel>
      <h1 className="page-title enter" style={enterAt(0.1)}>
        {title}
      </h1>
      <p className="prose-body enter max-w-[440px] lg:pb-2" style={enterAt(0.24)}>
        {children}
      </p>
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
}: {
  rows: { label: string; value: ReactNode }[];
  /** Width of the label column at ≥640px, in px. */
  labelWidth?: 120 | 130 | 200;
  className?: string;
  rowClassName?: string;
}) {
  const cols = {
    120: 'sm:grid-cols-[120px_minmax(0,1fr)]',
    130: 'sm:grid-cols-[130px_minmax(0,1fr)]',
    200: 'sm:grid-cols-[200px_minmax(0,1fr)]',
  }[labelWidth];

  return (
    <dl className={`m-0 flex flex-col border-t border-line ${className}`}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={`grid gap-2 border-b border-line sm:gap-6 ${cols} ${rowClassName}`}
        >
          <dt className="kicker-sm leading-[1.8]">{row.label}</dt>
          <dd className="m-0 font-ui text-[14px] font-light leading-[1.6]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
