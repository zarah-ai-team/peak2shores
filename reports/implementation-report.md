# Peaks2Shores — implementation report

Branch `redesign/luxury-editorial`. All changes are uncommitted and nothing was deployed. Finding numbers (F1…) refer to `website-audit.md`.

## Measured results

All runs use Lighthouse 12.6.1 with simulated throttling (the mobile default and `--preset=desktop`) against the same local production build and port. Figures are the before and after runs, not estimates.

| Page               | Form factor | Perf        | A11y         | LCP                | TBT                  | Page weight       |
| ------------------ | ----------- | ----------- | ------------ | ------------------ | -------------------- | ----------------- |
| Home               | mobile      | 75 → **91** | 97 → **100** | 12.8 s → **3.5 s** | 52 → 20 ms           | 12.9 → **7.4 MB** |
| Home               | desktop     | 89 → **97** | 97 → **100** | 2.2 s → **1.2 s**  | 0 → 0 ms             | 13.2 → **8.0 MB** |
| Journeys           | mobile      | 43 → **71** | 100 → 100    | 7.8 s → 7.8 s      | 160,742 → **236 ms** | 1.4 → 1.4 MB      |
| Journeys           | desktop     | 60 → **92** | 100 → 100    | 1.9 s → 1.9 s      | 26,921 → **21 ms**   | 1.8 → 1.8 MB      |
| Amalfi, Slowly     | mobile      | 83 → 83     | 100 → 100    | 4.0 s → 4.0 s      | 22 → 16 ms           | unchanged         |
| Amalfi, Slowly     | desktop     | 99 → 99     | 100 → 100    | 0.8 s → 0.8 s      | 0 → 0 ms             | unchanged         |
| Destinations (new) | mobile      | **95**      | **100**      | 2.9 s              | 12 ms                | 0.7 MB            |
| Destinations (new) | desktop     | **100**     | **100**      | 0.6 s              | 0 ms                 | 1.3 MB            |

Best Practices and SEO scored 100 on every run, before and after. CLS stayed at 0.023 or below everywhere.

Globe, measured in headless Chrome at 1440 × 900 with a performance observer in the page:

|                                | Before                                | After                                                                  |
| ------------------------------ | ------------------------------------- | ---------------------------------------------------------------------- |
| At rest                        | 2 fps; long tasks about 757 ms        | 128 fps (no redraws); no long tasks                                    |
| During a hover flight (6 runs) | about 25 fps; long tasks up to 418 ms | 63–67 fps in 5 runs, no long tasks; one run 19 fps with 50–77 ms tasks |

Raw JSON is in the session scratchpad under `lh/before-*.json` and `lh/after-*.json`.

## Changes

| Area                       | Files                                                                                                                                                                                              | What changed                                                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Globe performance (F1)     | `src/components/journeys/Globe.tsx`                                                                                                                                                                | Removed the perpetual drift; offscreen layer cache keyed on the view; coarse 110m outlines and `precision(2)` while moving, for destination countries too; `clipExtent` culling; `arc()` spheres; repaint on resize. |
| Homepage loading (F2)      | `HomeHero.tsx`, `HomeMedia.tsx`, `WaysToTravel.tsx`                                                                                                                                                | Removed raw-JPG posters; hero film `src` set only after `window.load` (the priority still holds the frame until then).                                                                                               |
| Hydration (F9)             | `HomeHero.tsx`                                                                                                                                                                                     | The reduced-motion pause applies after the films arm, so the first render matches the server.                                                                                                                        |
| Floating button (F3)       | `ExpertButton.tsx`, `HomeSections.tsx`, `home.css`                                                                                                                                                 | An IntersectionObserver on `[data-fab-away], footer` hides the button and closes its panel; 0.4 s fade and drop.                                                                                                     |
| Contrast (F4)              | `home.css`                                                                                                                                                                                         | `.hc-ways .badge` and `.hc-fab .fab-btn` use `--color-brand-deep`.                                                                                                                                                   |
| Hotel cards (F5)           | `HotelFlips.tsx`, `home.css`                                                                                                                                                                       | `aria-labelledby` and `aria-describedby` on visible text; back-face duplicate name is `aria-hidden` and no longer an `h3`.                                                                                           |
| Legibility (F6)            | `home.css`                                                                                                                                                                                         | `.hc-cmp::before` top gradient; `.hc-circle::after` radial scrim.                                                                                                                                                    |
| Journeys grid (F7)         | `FeaturedJourneys.tsx`, `JourneyCard.tsx`                                                                                                                                                          | Six-column grid with a lead count so rows are always full; a `wide` 16/10 card; reveal at 2% in view.                                                                                                                |
| Destinations redesign (F8) | `src/app/destinations/page.tsx`, `src/components/destinations/destinations.css` (new)                                                                                                              | Rebuilt in the homepage's language (described below).                                                                                                                                                                |
| Experiences imagery (F12)  | `src/lib/media.ts`, `media.generated.ts`, `scripts/photography-manifest.json`, `public/images/credits.json`, `CREDITS.md`, `PHOTOGRAPHY-BRIEF.md`; removed `public/images/ex-4.jpg` and `ex-5.jpg` | `ex-4` and `ex-5` now use client Drive photos with new alt text; new `dest-private` slot.                                                                                                                            |
| Cleanup (F13)              | Removed `src/components/home/PeaksToShores.tsx`                                                                                                                                                    | It had no imports after the redesign.                                                                                                                                                                                |
| Formatting                 | `src/app/layout.tsx`                                                                                                                                                                               | Prettier one-line fix.                                                                                                                                                                                               |

## Design decisions

**Destinations page.** It reuses the homepage system rather than adding a second one:

- `.hc` tokens: paper, ink, lake, brand, sky, deep navy; Georgia serif with Poppins.
- Shared pieces: `.hc-hero`, `.hc-intro`, `.lab` caps labels, pill `.btn`s, round `.circ` arrows, the `.hc-circle` close, and 10 px tile radius.
- Everything new is scoped under `dz-` in its own stylesheet.

Page structure, in order:

1. A full-bleed opening, with the countries as anchor pills along the foot on wider screens.
2. The statement set large.
3. Three facts, all computed from the catalogue: country count, unique journey count (cross-border journeys counted once), and `site.maxGuests`.
4. One country per row, alternating sides. Each row has a rounded photograph tile with the name set over it, beside journey cards showing days, status, dates and price.
5. The name on a navy band, with staggered frames.
6. A private-travel close.

The copy reuses existing page content or states only what the catalogue already says. No claims were added.

**Grid balance.** Five departures read as two over three, never three over two with a gap. The earliest departures get the wider frames, which matches date-order reading.

**Floating button.** It gets out of the way rather than moving, so it never competes with a form or the footer.

## Animation

- Every new transition runs 0.4 s, except slow hover zooms on photographs (1.8 s, transform only) and the one-time 2.4 s settle of the destinations hero photograph.
- Nothing loops. The globe's constant drift was removed; it now moves only on hover, selection or drag.
- No scroll-jacking. Reveals reuse the site's existing `Reveal` and `RevealGroup`.
- Under `prefers-reduced-motion`:
  - The hero settle and hover transitions are off.
  - The films hold their still.
  - Globe pin pulses stop (existing behaviour).
  - Reveals follow the existing primitive's reduced-motion handling.
  - Verified at 375 and 1440 px with no console errors.

## Image optimisation

- Every image goes through `next/image` (WebP, q85) with `sizes` matched to the layout. Only the destinations hero is `priority`.
- Removing the video posters cut about 5 MB from the homepage on both form factors (12.9 → 7.4 MB mobile, 13.2 → 8.0 MB desktop).
- Hero films no longer download during the initial load.

## Verification

- `tsc --noEmit`: pass.
- `eslint .`: pass.
- `next build`: pass, all routes generated.
- `prettier --check` on every changed file: pass. The pre-existing `PeaksShoresSlider.tsx` failure is untouched.
- Headless Chrome screenshots and DOM metrics:
  - Widths: 1440 × 900 and 375 × 812 for `/`, `/destinations`, `/experiences` and `/journeys`, plus a reduced-motion pass on `/` and `/destinations`.
  - No horizontal overflow, no undersized tap targets flagged, no console errors, and no content left hidden after scrolling.
  - Earlier passes also covered 430, 768 and 1366 px.

## Limitations

- **`/journeys` mobile LCP is still 7.8 s (F10).** The LCP element sits inside a `Reveal` that stays at opacity 0 until JavaScript hydrates. Fixing it means changing the site-wide `Reveal` primitive, so it is left as the next change.
- **Lighthouse figures are lab estimates.** They come from simulated throttling on one machine; field data wasn't available.
- **Globe fps comes from headless Chrome**, which renders canvas in software. Real devices with GPU rasterisation should do as well or better, but haven't been measured.
- **Amalfi mobile LCP (4.0 s) is unchanged**; that page wasn't in scope for structural changes.

## Assets needing purchase, attribution or approval

Nothing was purchased. Details are in `image-asset-plan.md`:

1. Licence records for `public/images/home/*` and `public/video/home/*` ("Sample C" homepage).
2. Shutterstock licence IDs for the Positano and Hvar hero clips.
3. Provenance of the Drive files that aren't phone originals. The hotel press images likely need the hotels' permission.
4. Marc's picks for the 10 outstanding `client-*` slots. This also resolves the duplicate yacht in `home-cove`.
5. Marc's own photographs for `dest-italy` and `dest-spain`, which currently resolve to stock.
6. A decision on the unused `public/video/hero-reel*.mp4` files (about 26 MB) and about 40 unused Drive photos. They were kept, not deleted.
