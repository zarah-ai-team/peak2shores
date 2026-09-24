import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonVariant = 'light' | 'ink' | 'outline' | 'rule';

/* `.btn` (globals.css) owns the transitions: colour, a 2px lift on hover with
   the lift's own faint shadow, and a settle on press. */
const base =
  'btn inline-flex items-center justify-start font-ui font-medium text-[11px] leading-none tracking-[0.16em] uppercase';

const variants: Record<ButtonVariant, string> = {
  /* On a photograph or a dark field. */
  light: 'bg-ivory text-ink px-[26px] py-4 hover:bg-white',
  /* On the ivory ground. */
  ink: 'bg-ink text-ivory px-[26px] py-4 hover:bg-body',
  /* Inherits its colour from the header, which changes over the hero. */
  outline:
    'border border-current px-[22px] py-[14px] text-current hover:bg-ink hover:text-ivory hover:border-ink',
  /* The acqua hairline. The only place the accent runs in body layout. */
  rule: 'link-rule',
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type LinkButtonProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href' | 'className' | 'children'
  >;

type ActionButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

function classesFor(variant: ButtonVariant, className?: string) {
  const v = variants[variant];
  return variant === 'rule'
    ? `${v} ${className ?? ''}`.trim()
    : `${base} ${v} ${className ?? ''}`.trim();
}

/** Buttons are flush-left labels on a rectangle. No radius, no icon. */
export function Button({ children, variant = 'ink', className, ...rest }: ActionButtonProps) {
  return (
    <button className={classesFor(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = 'ink',
  className,
  ...rest
}: LinkButtonProps) {
  const isExternal =
    href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  const cls = classesFor(variant, className);

  if (isExternal) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
