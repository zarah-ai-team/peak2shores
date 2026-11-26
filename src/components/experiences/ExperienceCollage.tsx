import Image from 'next/image';

export type CollageItem = {
  slug: string;
  title: string;
  body: string;
  img?: string;
  alt: string;
};

/**
 * The four experiences as one collage of photographs, laid like prints on a
 * travel table: one tall print leading, the others stepping around it at
 * different sizes and heights, each with its name and line. Nothing
 * moves but a slow lift under the pointer, and each print rises into place
 * as it scrolls in where the browser can tie that to the scroll. Each print
 * is its own article, so an anchor (#taste, #meet…) lands on it.
 */
export function ExperienceCollage({ items }: { items: CollageItem[] }) {
  return (
    <div className="xp-collage">
      {items.map((x, i) => {
        const titleId = `${x.slug}-title`;
        return (
          <article
            key={x.slug}
            id={x.slug}
            aria-labelledby={titleId}
            className={`xp-print xp-print-${i + 1}`}
          >
            <div className="pic">
              {x.img && (
                // The leading print is about two-fifths of the measure, the
                // others a quarter to a third; below 1100px they run two by
                // two at half the width, upright (4:5), so a landscape
                // photograph is drawn by the print's height, nearly twice
                // its width: the file is chosen at 60vw. The full width on
                // a phone.
                <Image
                  src={x.img}
                  alt={x.alt}
                  fill
                  sizes={
                    i === 0
                      ? '(min-width: 1100px) 36rem, (min-width: 561px) 60vw, 100vw'
                      : '(min-width: 1100px) 28rem, (min-width: 561px) 60vw, 100vw'
                  }
                  className="fill photo-grade"
                />
              )}
            </div>
            <div className="txt">
              <h3 id={titleId}>{x.title}</h3>
              <p>{x.body}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
