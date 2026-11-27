import Image from 'next/image';
import { getMedia } from '@/lib/media';
import './journeys-index.css';

/**
 * The Journeys page's opening, after Ishika's notes of 9 November 2026 (items
 * 10 and 11, after A&K's Small Group Journeys) and the owner's decision of
 * 18 November: half and half, the page's words on one half and one photograph
 * on the other, with no map and no button. The in-page menu follows at once.
 *
 * The words are the ones the page has carried since 3 November: the
 * "Journeys" label, the name, Marc's line and the short intro. The photograph
 * is a long table laid for a small party under a great tree (Jennifer Yung,
 * Unsplash, credited on /credits), shown nowhere else on the page. On a phone
 * the photograph comes first, then the words.
 */
export function JourneysHero() {
  const photo = getMedia('jn-3');

  return (
    <section className="jxh" data-hero aria-labelledby="jxh-h1">
      <div className="jxh-text">
        <p className="jxh-lab">Journeys</p>
        <h1 id="jxh-h1">Small Luxury Group Journeys</h1>
        {/* Each phrase holds together; the line breaks only between them. */}
        <p className="jxh-line">
          <span>Extraordinary destinations.</span> <span>Intimate groups.</span>{' '}
          <span>Thoughtfully curated experiences.</span>
        </p>
        <p className="jxh-say">
          Intimate journeys shared with a small circle of fellow travelers, bringing together
          exceptional places, meaningful experiences and the joy of discovering the world together.
        </p>
      </div>
      <div className="jxh-photo">
        {/* The half is taller than the photograph's 3:2, so the photograph
            is drawn wider than the half to cover it: `sizes` asks for 60%
            of the screen, which keeps it sharp. From 761 to 1100px wide the
            half is narrow for the hero's height, and the photograph is drawn
            about one and a half times that height across: at most 864px
            (the hero is at most 36rem tall), so `sizes` asks for that. */}
        {photo.src && (
          <Image
            src={photo.src}
            alt={photo.alt ?? photo.label}
            fill
            priority
            // The page's largest paint: fetched ahead of everything.
            fetchPriority="high"
            quality={85}
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 864px, 60vw"
          />
        )}
      </div>
    </section>
  );
}
