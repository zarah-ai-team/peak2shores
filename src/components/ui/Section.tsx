import type { CSSProperties, ReactNode } from 'react';
import { Ground } from '@/components/motion/Ground';

export type SectionGround = 'ivory' | 'panel' | 'stone' | 'navy' | 'navy-deep' | 'charcoal';

const groundClass: Record<SectionGround, string> = {
  ivory: 'bg-ivory text-ink',
  panel: 'bg-panel text-ink',
  stone: 'bg-stone text-ink',
  navy: 'bg-navy text-on-dark',
  'navy-deep': 'bg-navy-deep text-on-dark',
  charcoal: 'bg-charcoal text-on-dark',
};

const padClass = {
  section: 'py-section',
  'section-sm': 'py-section-sm',
  none: '',
} as const;

const isDark = (g: SectionGround) => g === 'navy' || g === 'navy-deep' || g === 'charcoal';

type Tag = 'section' | 'div' | 'aside' | 'article' | 'footer';

/**
 * The text container: max 1480px, centered, with the responsive page gutter
 * (20px on a phone, 40px from 768px, opening to 72px at 1888px). Full-bleed
 * photographs sit outside it.
 */
export function Container({
  children,
  className = '',
  as: TagName = 'div',
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'header' | 'nav' | 'section';
  id?: string;
}) {
  return (
    <TagName id={id} className={`container-site ${className}`}>
      {children}
    </TagName>
  );
}

/**
 * A page section on one of the six grounds.
 *
 * - `ground` (default ivory). Dark grounds (navy, navy-deep, charcoal)
 *   render through `Ground`, so they develop from the paper as they arrive,
 *   and set `data-tone="dark"` so kickers, body copy, rule links, fields and
 *   focus rings switch to their dark treatment through CSS. Stone sets
 *   `data-tone="stone"` (kickers in stone-text).
 * - `pad`: `section` (major, clamp 72–136px), `section-sm` (56–96px) or `none`.
 * - `rule`: a 1px line rule at the top, inside the container — use it between
 *   two consecutive light sections; never between light and dark.
 * - `contained` (default true): wraps children in `.container-site`. Pass
 *   false for full-bleed content and place a `<Container>` yourself.
 * - `screen`: from 1024px the section is exactly one viewport tall, its
 *   content a centered column (`.screen` in globals.css). Replaces `pad`.
 */
export function Section({
  children,
  ground = 'ivory',
  pad = 'section',
  rule = false,
  contained = true,
  screen = false,
  as = 'section',
  id,
  className = '',
  innerClassName = '',
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: {
  children: ReactNode;
  ground?: SectionGround;
  pad?: keyof typeof padClass;
  rule?: boolean;
  contained?: boolean;
  screen?: boolean;
  as?: Tag;
  id?: string;
  className?: string;
  /** Classes for the inner container (when `contained`). */
  innerClassName?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}) {
  const cls = `relative ${groundClass[ground]} ${screen ? 'screen max-lg:py-section-sm' : padClass[pad]} ${className}`;
  const content = (
    <>
      {rule && (
        <div aria-hidden className="container-site absolute inset-x-0 top-0">
          <div className={`border-t ${isDark(ground) ? 'border-line-dark' : 'border-line'}`} />
        </div>
      )}
      {contained ? <div className={`container-site ${innerClassName}`}>{children}</div> : children}
    </>
  );

  if (isDark(ground)) {
    return (
      <Ground
        as={as}
        id={id}
        className={cls}
        style={style}
        data-tone="dark"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      >
        {content}
      </Ground>
    );
  }

  const TagName = as;
  return (
    <TagName
      id={id}
      className={cls}
      style={style}
      data-tone={ground === 'stone' ? 'stone' : 'light'}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {content}
    </TagName>
  );
}
