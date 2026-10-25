'use client';

import { useEffect, useState } from 'react';

/**
 * Opens or closes every <details> inside `target` at once. The label follows
 * the days themselves, so a reader who opens each by hand sees "Collapse all"
 * once they are all open.
 */
export function ExpandAll({ target }: { target: string }) {
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const list = document.getElementById(target);
    if (!list) return;
    const items = () => [...list.querySelectorAll('details')];
    const sync = () => setAllOpen(items().every((d) => d.open));
    sync();
    // `toggle` does not bubble; listen in the capture phase.
    list.addEventListener('toggle', sync, true);
    return () => list.removeEventListener('toggle', sync, true);
  }, [target]);

  return (
    <button
      type="button"
      aria-controls={target}
      onClick={() => {
        const open = !allOpen;
        document
          .getElementById(target)
          ?.querySelectorAll('details')
          .forEach((d) => {
            d.open = open;
          });
      }}
      className="link-rule border-0 bg-transparent"
    >
      {allOpen ? 'Collapse all days' : 'Expand all days'}
    </button>
  );
}
