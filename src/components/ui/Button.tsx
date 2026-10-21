import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant =
  'ink' | 'forest' | 'light' | 'outline' | 'outline-dark' | 'rule' | 'rule-dark';

/* `.btn` (globals.css) owns the transitions: colour, a 2px lift on hover with
   the lift's own faint shadow, a settle on press, and the disabled fade.
   Every filled/outline button is at least 44px tall. */
const base =
  'btn inline-flex min-h-11 items-center justify-start gap-3 font-ui font-medium text-[11.5px] leading-none tracking-[0.16em] uppercase';

const variants: Record<ButtonVariant, string> = {
  /* On paper. */
  ink: 'bg-ink text-ivory px-7 py-[17px] hover:bg-forest',
  /* On paper — the primary CTA ("Plan your journey"). */
  forest: 'bg-forest text-ivory px-7 py-[17px] hover:bg-forest-deep',
  /* On a photograph or a dark ground. */
  light: 'bg-ivory text-ink px-7 py-[17px] hover:bg-white',
  /* On paper; fills with ink. Inherits colour, so it also works in the header. */
  outline:
    'btn--flat border border-current px-[26px] py-4 text-current hover:bg-ink hover:text-ivory hover:border-ink',
  /* On a dark ground; fills with ivory. */
  'outline-dark':
    'btn--flat border border-on-dark/70 px-[26px] py-4 text-on-dark hover:bg-ivory hover:text-ink hover:border-ivory',
  /* The sea-glass hairline link. Picks dark colours automatically inside a
     dark ground ([data-tone="dark"], .bg-forest…, [data-hero]). */
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
