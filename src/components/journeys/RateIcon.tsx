/**
 * Line icons for the Dates & Prices section's additional information: one
 * for each kind of inclusion, exclusion and term. Drawn on a 24px grid with a
 * 1.5px stroke in the current colour, so they take the text's colour and
 * scale with it. Decorative: the words beside them carry the meaning.
 */
const paths = {
  hotel: 'M3 20V7.5L12 3l9 4.5V20M3 20h18M8 20v-4h3v4M13 20v-4h3v4M8 11h.01M12 11h.01M16 11h.01',
  meal: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.2 1.2-3 3.6-3 6.5V13h3',
  car: 'M5 16.5h14M6.5 16.5V19M17.5 16.5V19M4 16.5v-4l2-5.5h12l2 5.5v4M4 12.5h16M7.5 14.5h.01M16.5 14.5h.01',
  train:
    'M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM5 10h14M9 13.5h.01M15 13.5h.01M8 17l-2 4M16 17l2 4M7 21h10',
  guide: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21a7.5 7.5 0 0 1 15 0M15.5 15.5l1.5 1.5 3-3',
  boat: 'M3 16.5 5 20h14l2-3.5H3ZM6 16.5V11h12v5.5M9 11V7h6v4M12 7V3M3 21.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1',
  wine: 'M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0L8 3ZM8.3 7h7.4M12 12.5V20M8.5 21h7',
  ticket:
    'M3 8.5V6h18v2.5a2.5 2.5 0 0 0 0 5V16H3v-2.5a2.5 2.5 0 0 0 0-5ZM9 6v10M13 9.5h4M13 12.5h3',
  gratuity:
    'M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.6-7.5 10-7.5 10Z',
  plane:
    'M21 15.5 13.5 11V5a1.5 1.5 0 0 0-3 0v6L3 15.5v2l7.5-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5l-2-1.5v-4l7.5 2.5v-2Z',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3ZM9 12l2 2 4-4',
  glass: 'M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1L6 3ZM6.5 8.5h11',
  sparkle:
    'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16Z',
  passport:
    'M6 3h11a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 17 21H6V3ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9.5 17h5',
  tag: 'M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7l8.8 8.8a1.5 1.5 0 0 1 0 2.1l-7.1 7.1a1.5 1.5 0 0 1-2.1 0L3 12.2ZM8 8h.01',
  single: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0',
  route:
    'M6 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.5 16.5H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5',
  group:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14a6.5 6.5 0 0 1 3.5 6',
  card: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM3 9.5h18M6.5 15h4',
  calendar:
    'M4.5 5h15A1.5 1.5 0 0 1 21 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-13A1.5 1.5 0 0 1 4.5 5ZM3 10h18M8 3v4M16 3v4M9 15l2 2 4-4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  cancel: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  check: 'M5 12.5 10 17.5 19.5 7',
  cross: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  health:
    'M12 21s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.2-8 11-8 11ZM12 10v5M9.5 12.5h5',
  luggage:
    'M6.5 7h11A1.5 1.5 0 0 1 19 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-10A1.5 1.5 0 0 1 6.5 7ZM9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M9 11v5M15 11v5M8 20v1.5M16 20v1.5',
  document: 'M6.5 2.75h7.25l4.75 4.75v13.75h-12zM13.5 2.75v5h5M9 12.5h6M9 15.5h6M9 18.5h3.5',
  mail: 'M3.5 5.5h17a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1ZM3 6.5l9 6.5 9-6.5',
  phone:
    'M5 3.5h3.5l2 5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2Z',
  pen: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4',
  chat: 'M4 5h16v11H9l-5 4V5ZM8 9.5h8M8 12.5h5',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
  arrow: 'M4 12h15M13 6l6 6-6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5.5M12 7.5h.01',
} as const;

export type RateIconName = keyof typeof paths;

export function RateIcon({ name, className }: { name: RateIconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
