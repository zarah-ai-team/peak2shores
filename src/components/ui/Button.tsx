import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant =
  'ink' | 'navy' | 'light' | 'outline' | 'outline-dark' | 'rule' | 'rule-dark';

/* `.btn` (globals.css) owns the transitions: color, a 2px lift on hover with
   the lift's own faint shadow, a settle on press, and the disabled fade.
   Size comes from the `--btn-*` tokens: 11.5px label, 28 × 17px padding on a
   phone and at 1888px, scaling down to a 10.5px label and no less than 40px
   tall on a laptop. Any touch screen keeps the 44px minimum. */
const base =
  'btn inline-flex min-h-(--btn-h) items-center justify-start gap-3 font-ui font-medium text-(length:--type-button) leading-none tracking-[0.16em] uppercase';

/* The padding of a filled button; an outline gives back its 1px border. */
const fill = 'px-(--btn-px) py-(--btn-py)';
const line = 'px-[calc(var(--btn-px)-2px)] py-[calc(var(--btn-py)-1px)]';

const variants: Record<ButtonVariant, string> = {
  /* On paper. */
  ink: `bg-ink text-ivory ${fill} hover:bg-brand`,
  /* On paper — the primary CTA ("Plan your journey"). */
  navy: `bg-navy text-ivory ${fill} hover:bg-brand`,
  /* On a photograph or a dark ground. */
  light: `bg-ivory text-ink ${fill} hover:bg-brand hover:text-white`,
  /* On paper; fills with the brand blue. Inherits color, so it also works in the header. */
  outline: `btn--flat border border-current ${line} text-current hover:bg-brand hover:text-white hover:border-brand`,
  /* On a dark ground; fills with the brand blue. */
  'outline-dark': `btn--flat border border-on-dark/70 ${line} text-on-dark hover:bg-brand hover:text-white hover:border-brand`,
  /* The blue hairline link. Picks dark colors automatically inside a
     dark ground ([data-tone="dark"], .bg-navy…, [data-hero]). */
  rule: 'link-rule',
  /* Forces the dark treatment where the ground can't be detected. */
  'rule-dark': 'link-rule link-rule--dark',
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  /** Appends a 14px 1px-stroke → that nudges 4px right on hover. */
  arrow?: boolean;
};

type LinkButtonProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href' | 'className' | 'children'
  >;

type ActionButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

function classesFor(variant: ButtonVariant, className?: string) {
  const v = variants[variant];
  return variant === 'rule' || variant === 'rule-dark'
    ? `${v} ${className ?? ''}`.trim()
    : `${base} ${v} ${className ?? ''}`.trim();
}

/** The arrow. Decorative; the label carries the meaning. */
export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={`btn-arrow ${className}`}
    >
      <path d="M0 5h13M9 1l4 4-4 4" />
    </svg>
  );
}

function Label({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );
}

/** Buttons are flush-left labels on a rectangle. No radius. */
export function Button({
  children,
  variant = 'ink',
  className,
  arrow,
  ...rest
}: ActionButtonProps) {
  return (
    <button className={classesFor(variant, className)} {...rest}>
      <Label arrow={arrow}>{children}</Label>
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = 'ink',
  className,
  arrow,
  ...rest
}: LinkButtonProps) {
  const isExternal =
    href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  const cls = classesFor(variant, className);

  if (isExternal) {
    return (
      <a href={href} className={cls} {...rest}>
        <Label arrow={arrow}>{children}</Label>
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      <Label arrow={arrow}>{children}</Label>
    </Link>
  );
}
