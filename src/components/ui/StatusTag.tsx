import type { ReactNode } from 'react';
import { journeyLabel, type JourneyStatus } from '@/lib/journeys';

export type TagStatus = JourneyStatus | 'new' | 'preparation' | 'draft';

/**
 * The words come from `journeyLabel()` wherever it has them (Sold out,
 * Waitlist, Departed, New); "In preparation" is the site's existing string for
 * unwritten journeys and journal entries. `open` has no label of its own in
 * the content — pass `children` if a page needs one shown.
 */
function labelFor(status: TagStatus): string | null {
  switch (status) {
    case 'sold-out':
    case 'waitlist':
    case 'past':
    case 'open':
      return journeyLabel({ status });
    case 'new':
      return journeyLabel({ isNew: true });
    case 'preparation':
    case 'draft':
      return 'In preparation';
  }
}

/** Brand blue for something you can act on, a paler blue for something pending, a rule for closed. */
const markFor: Record<TagStatus, { light: string; dark: string }> = {
  open: { light: 'bg-acqua-deep', dark: 'bg-acqua' },
  new: { light: 'bg-acqua-deep', dark: 'bg-acqua' },
  waitlist: { light: 'bg-acqua', dark: 'bg-brand' },
  preparation: { light: 'bg-acqua', dark: 'bg-brand' },
  draft: { light: 'bg-acqua', dark: 'bg-brand' },
  'sold-out': { light: 'bg-muted', dark: 'bg-on-dark-muted' },
  past: { light: 'bg-muted', dark: 'bg-on-dark-muted' },
};

/**
 * A journey's or entry's state: a 6px square and a caps label. Renders
 * nothing when there is no label to show (an open journey without children).
 */
export function StatusTag({
  status,
  tone = 'light',
  children,
  className = '',
}: {
  status: TagStatus;
  tone?: 'light' | 'dark';
  /** Overrides the label. */
  children?: ReactNode;
  className?: string;
}) {
  const label = children ?? labelFor(status);
  if (!label) return null;
  const text =
    tone === 'dark'
      ? 'text-on-dark'
      : status === 'open' || status === 'new'
        ? 'text-acqua-text'
        : 'text-ink';

  return (
    <span className={`kicker-sm inline-flex items-center gap-2.5 ${text} ${className}`}>
      <span aria-hidden className={`status-mark ${markFor[status][tone]}`} />
      {label}
    </span>
  );
}
