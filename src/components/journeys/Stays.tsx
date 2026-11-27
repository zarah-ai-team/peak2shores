'use client';

import Image from 'next/image';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useSwipe } from '@/components/ui/useDrag';
import {
  hotelByName,
  hotelTabLabels,
  type HotelPhoto,
  type HotelRecord,
  type HotelTabId,
} from '@/lib/data/hotels';
import { staysIntended, staysNote } from '@/lib/data/homeHotels';
import type { Journey } from '@/lib/journeys';
import { placePhotos } from './placePhotos';
import './stays.css';

/*
 * Where you'll stay, on a journey's page: a card for each hotel, and a pop-up
 * for each (Ishika's notes of 9 Nov 2026, item 23, after A&K's): the hotel's
 * name as the title, its photographs with arrows, tabs for what the hotel
 * offers, its website and the photographs' credits at the foot. The cards and
 * the write-ups come from src/lib/data/hotels.ts. Marc's note that the final
 * hotels may vary by departure opens the section (his review of 23 Nov 2026),
 * and a hotel still to be confirmed is no longer marked on the page.
 */

type StayCard = {
  key: string;
  name: string;
  /** "Lucerne · 3 nights" */
  where: string;
  /** The hotel's own first photograph, else the photograph of its town. */
  photo?: { src: string; alt: string };
  url?: string;
  /** The hotel's record; without one the card does not open a pop-up. */
  hotel?: HotelRecord;
};

const nights = (n?: number) => (n ? `${n} ${n === 1 ? 'night' : 'nights'}` : '');

/** Each hotel of the journey, with its stay's nights and its photograph. */
function cardsOf(journey: Journey): StayCard[] {
  const flyer = journey.flyer;
  if (!flyer) return [];
  const stays = flyer.parts.flatMap((part) => part.stays);
  return flyer.hotels.map((h) => {
    const stay = stays.find((s) => s.place.toLowerCase().includes(h.place.toLowerCase()));
    const hotel = hotelByName(h.name);
    const lead = hotel?.photos[0];
    const length = nights(stay?.nights);
    return {
      key: `${h.place}-${h.name}`,
      name: h.name,
      where: length ? `${h.place} · ${length}` : h.place,
      photo: lead ? { src: lead.src, alt: lead.alt } : placePhotos[h.place],
      url: hotel?.url ?? h.url,
      hotel,
    };
  });
}

/** The credit line at the foot of a pop-up: each credit once. */
function creditLine(photos: HotelPhoto[]) {
  const own = [...new Set(photos.filter((p) => !p.place).map((p) => p.credit))];
  const town = [...new Set(photos.filter((p) => p.place).map((p) => p.credit))];
  const label = photos.filter((p) => !p.place).length === 1 ? 'Photo' : 'Photos';
  return [...own.map((credit) => `${label} ${credit}`), ...town].join(' · ');
}

export function Stays({ journey }: { journey: Journey }) {
  const cards = cardsOf(journey);
  const [active, setActive] = useState<StayCard | null>(null);
  const [open, setOpen] = useState(false);
  /** Counts the openings, so a hotel opened again starts on its first tab and photograph. */
  const [opened, setOpened] = useState(0);
  /** The card's button that opened the pop-up; focus goes back to it on close. */
  const opener = useRef<HTMLButtonElement | null>(null);
  const whereId = useId();

  if (cards.length === 0) return null;

  const show = (card: StayCard, button: HTMLButtonElement) => {
    opener.current = button;
    setActive(card);
    setOpened((n) => n + 1);
    setOpen(true);
  };

  return (
    <section className="jy jst" id="stays" aria-labelledby="jy-stay-h">
      <div className="head">
        <div>
          <p className="lab">Stays</p>
          <h2 id="jy-stay-h">Where you’ll stay</h2>
        </div>
        <p className="say">
          Handpicked luxury properties, selected for their character, outstanding hospitality, and
          sense of place.
        </p>
        <p className="jst-note">
          {staysNote} {staysIntended}
        </p>
      </div>
      <ul className="jst-grid">
        {cards.map((card) => (
          <li key={card.key} className="jst-card" data-opens={card.hotel ? '' : undefined}>
            <div className="jst-ph">
              {card.photo && (
                <Image
                  className="jst-img"
                  src={card.photo.src}
                  alt={card.photo.alt}
                  fill
                  sizes="(min-width: 1100px) 33vw, (min-width: 601px) 50vw, 100vw"
                />
              )}
              <span className="jst-pill">{card.where}</span>
            </div>
            <div className="jst-body">
              <h3 className="jst-name">
                {card.hotel ? (
                  // The button covers the whole card (stays.css), so a press
                  // anywhere on it opens the pop-up. Its name ends with the
                  // card's visible "More about the hotel", so a voice command
                  // that says those words finds it; it is given whole, since
                  // a hidden span would be read with a space before its comma.
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`${card.name}, more about the hotel`}
                    onClick={(event) => show(card, event.currentTarget)}
                  >
                    {card.name}
                  </button>
                ) : (
                  card.name
                )}
              </h3>
              {card.hotel ? (
                <p className="jst-more" aria-hidden>
                  More about the hotel
                  <svg viewBox="0 0 12 12" focusable="false">
                    <path d="M6 1.5v9M1.5 6h9" />
                  </svg>
                </p>
              ) : (
                card.url && (
                  <a className="jst-site" href={card.url} target="_blank" rel="noopener noreferrer">
                    Visit hotel website <span aria-hidden>↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* The pop-up is placed only once a hotel is opened, already open (as
          the journey forms' is), so the page never carries its title empty
          (Ishika's notes of 24 Nov 2026: "an empty heading at the bottom").
          It stays placed afterwards, since `active` is never cleared. */}
      {active?.hotel && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title={active.hotel.name}
          describedBy={whereId}
          returnFocus={opener}
          closeLabel="Close hotel details"
        >
          <HotelPopup
            key={`${active.key}-${opened}`}
            card={active}
            hotel={active.hotel}
            whereId={whereId}
          />
        </Dialog>
      )}
    </section>
  );
}

/** A hotel's pop-up: where it is, its photographs, its tabs and its foot. */
function HotelPopup({
  card,
  hotel,
  whereId,
}: {
  card: StayCard;
  hotel: HotelRecord;
  whereId: string;
}) {
  const { tabs, photos } = hotel;
  const [tab, setTab] = useState<HotelTabId | undefined>(tabs[0]?.id);
  const [index, setIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const current = tabs.find((t) => t.id === tab);

  const go = (i: number) => setIndex((i + photos.length) % photos.length);

  /** A tab is chosen: its text shows, and the gallery turns to its photograph if it has one. */
  const choose = (next: HotelTabId) => {
    setTab(next);
    const at = photos.findIndex((p) => p.tab === next);
    if (at >= 0) setIndex(at);
  };

  /* A tab list: the arrow keys, Home and End move between the tabs and choose them. */
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = tabs.findIndex((t) => t.id === tab);
    const count = tabs.length;
    const moves: Record<string, number> = {
      ArrowRight: (at + 1) % count,
      ArrowLeft: (at - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const to = moves[event.key];
    if (to === undefined) return;
    event.preventDefault();
    choose(tabs[to].id);
    tabRefs.current[to]?.focus();
  };

  return (
    <div className="hpop">
      <p className="hpop-where" id={whereId}>
        {card.where}
      </p>

      {photos.length > 0 && <Gallery photos={photos} index={index} go={go} name={hotel.name} />}

      {tabs.length > 0 && (
        <>
          <div
            role="tablist"
            aria-label={`About ${hotel.name}`}
            className="hpop-tabs"
            onKeyDown={onTabKey}
          >
            {tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${t.id}`}
                aria-selected={t.id === tab}
                aria-controls={`${id}-panel`}
                tabIndex={t.id === tab ? 0 : -1}
                className="hpop-tab"
                onClick={() => choose(t.id)}
              >
                {hotelTabLabels[t.id]}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${tab}`}
            tabIndex={0}
            className="hpop-panel"
          >
            <p>{current?.text}</p>
          </div>
        </>
      )}

      <div className="hpop-foot">
        <a className="hpop-site" href={hotel.url} target="_blank" rel="noopener noreferrer">
          Visit hotel website <span aria-hidden>↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {photos.length > 0 && <p className="hpop-credit">{creditLine(photos)}</p>}
      </div>
    </div>
  );
}

/**
 * The photographs, one at a time: round Previous and Next buttons, the arrow
 * keys while focus is on them, and a sideways swipe or mouse drag. A swipe may
 * start anywhere on the gallery, its round buttons included (on a phone they
 * cover much of the photograph's middle, where a thumb starts a swipe); a
 * press on a button that does not travel stays a press on it. The count below
 * is read out as the photograph changes.
 */
function Gallery({
  photos,
  index,
  go,
  name,
}: {
  photos: HotelPhoto[];
  index: number;
  go: (i: number) => void;
  name: string;
}) {
  const gallery = useRef<HTMLDivElement>(null);
  const many = photos.length > 1;
  useSwipe(
    gallery,
    (dir) => {
      if (many) go(index + dir);
    },
    { fromControls: true },
  );

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!many || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    go(index + (event.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <div
      ref={gallery}
      className="hpop-gal"
      role="group"
      aria-roledescription="carousel"
      aria-label={`Photographs of ${name}`}
      onKeyDown={onKey}
    >
      <div className="hpop-frame">
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            className="hpop-slide"
            data-on={i === index ? '' : undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${photos.length}`}
            aria-hidden={i !== index}
          >
            <Image
              className="hpop-img"
              src={photo.src}
              alt={photo.alt}
              fill
              // The frame is 3:2, so a wider photograph is drawn wider than the
              // frame to cover it: 44rem leaves room for one up to 16:9.
              sizes="(min-width: 640px) 44rem, 100vw"
              draggable={false}
            />
          </div>
        ))}
      </div>
      {many && (
        <>
          <button
            type="button"
            className="hpop-arrow"
            data-dir="prev"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="hpop-arrow"
            data-dir="next"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="hpop-count" aria-live="polite">
            <span className="sr-only">Photo </span>
            {index + 1}
            <span aria-hidden> / </span>
            <span className="sr-only"> of </span>
            {photos.length}
          </p>
        </>
      )}
    </div>
  );
}
