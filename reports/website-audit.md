# Peaks2Shores — UI/UX audit

Audited 26–27 October 2026 on branch `redesign/luxury-editorial`, against a local production build (`next build` + `next start`, port 3210). No live URL was supplied (the brief's placeholder was left unfilled), so every finding below comes from the codebase and the local build.

**How findings were verified**

- **Verified:** reproduced in the running build. The evidence is one of:
  - a headless-Chrome screenshot at 375, 430, 768, 1366 or 1440 px;
  - DOM metrics: horizontal overflow, tap-target size, console errors;
  - a Lighthouse 12.6.1 run (simulated throttling);
  - in-page performance instrumentation.
- **Assumption:** inferred from code or content but not measurable locally. Examples are licence provenance and real-network behaviour.

Severity scale:

- **Critical:** breaks a page or makes it unusable.
- **High:** a measurable UX, performance or accessibility failure on a key page.
- **Medium:** a visible quality or consistency defect.
- **Low:** polish.

## Baseline (before any change)

| Page           | Form factor | Perf | A11y | BP  | SEO | LCP    | TBT        | Weight  |
| -------------- | ----------- | ---- | ---- | --- | --- | ------ | ---------- | ------- |
| Home           | mobile      | 75   | 97   | 100 | 100 | 12.8 s | 52 ms      | 12.9 MB |
| Home           | desktop     | 89   | 97   | 100 | 100 | 2.2 s  | 0 ms       | 13.2 MB |
| Journeys       | mobile      | 43   | 100  | 100 | 100 | 7.8 s  | 160,742 ms | 1.4 MB  |
| Journeys       | desktop     | 60   | 100  | 100 | 100 | 1.9 s  | 26,921 ms  | 1.8 MB  |
| Amalfi, Slowly | mobile      | 83   | 100  | 100 | 100 | 4.0 s  | 22 ms      | 0.8 MB  |
| Amalfi, Slowly | desktop     | 99   | 100  | 100 | 100 | 0.8 s  | 0 ms       | 1.3 MB  |

Other baseline checks:

- `tsc`, `eslint` and `next build` were all clean (31 routes).
- No horizontal overflow or console errors at any of the five widths.
- `PeaksShoresSlider.tsx` already failed `prettier --check`.

## Findings

### F1 — Journeys globe redraws forever and blocks the main thread · Critical · Verified

- **Where:** `/journeys`, `src/components/journeys/Globe.tsx`.
- **Evidence:**
  - TBT was 160.7 s on mobile and 26.9 s on desktop.
  - In-page instrumentation at rest measured 2 fps, with long tasks of about 757 ms.
  - Cause: a perpetual "drift" animation re-projected about 250 high-detail country outlines every frame, plus the graticule and three radial gradients, with no change detection.
- **Impact:** the page is close to unusable on mid-range phones. Scroll and tap stall, the battery drains, and the Performance score is 43.
- **Fix (done):**
  - Removed the constant drift (the brief also asks for no constant looping motion).
  - Paint the globe into an offscreen layer and repaint only when the view key changes (centre, zoom, size, selection, hover).
  - Use the 110m outlines and looser resampling (`precision 2`) while the globe is moving, including for the destination countries, which had still used the 50m set.
  - Cull geometry with `clipExtent`.
  - Draw the spheres with `arc()`.
- **Expected outcome:** about 0 TBT at rest and smooth flights. Measured after the fix: see the implementation report.

### F2 — Homepage LCP held back by the hero films · High · Verified

- **Where:** `/`, `HomeHero.tsx`, `HomeMedia.tsx`, `WaysToTravel.tsx`.
- **Evidence:**
  - Mobile LCP was 12.8 s, 96% of it render delay.
  - Total weight was 12.9 MB.
  - Every `<video>` carried a `poster` pointing at the raw 1.7–2 MB JPG, alongside the optimised `next/image` still beneath it.
  - The hero clips started downloading during the initial load, competing with the scripts and the headline.
- **Impact:** a slow first impression on phones, and about 5 MB of avoidable transfer on every visit.
- **Fix (done):**
  - Removed the redundant posters; the optimised still beneath does that job.
  - The hero films get their `src` only after `window.load`.
- **Expected outcome:** mobile LCP under 4 s and weight down by about 5 MB.

### F3 — "Speak to an expert" button covers form fields and footer links on phones · High · Verified

- **Where:** all pages that render `ExpertButton`; on the homepage it overlapped the Circle email field and the footer links at 375 px.
- **Impact:** readers can't tap the newsletter input or the legal links without scrolling past them.
- **Fix (done):** the button now steps aside (fades and drops) whenever an element marked `[data-fab-away]` or the footer is in view, and its panel closes. The Circle band and the destinations closing band carry the marker.

### F4 — Text contrast failures · High · Verified (Lighthouse `color-contrast`)

- **Where:**
  - The Ways-to-travel badge, `.hc-ways .badge`.
  - The floating button, `.hc-fab .fab-btn`: white text on `--brand` #1190cb, 3.6:1.
- **Fix (done):** both now use `--color-brand-deep` (AA 4.5:1 or better), with a lake-blue hover.

### F5 — Hotel flip cards: accessible name doesn't match the visible label · Medium · Verified (Lighthouse `label-content-name-mismatch`)

- **Where:** `/`, `HotelFlips.tsx`.
- **Evidence:**
  - The button's `aria-label` replaced the visible place and hotel name, which breaks voice control ("click Mandarin Oriental").
  - Each hotel name was also rendered twice as an `<h3>`, front and back.
- **Fix (done):**
  - The name now comes from `aria-labelledby` on the visible place and name, and the description from `aria-describedby` on the back-face details.
  - The duplicate back-face name is `aria-hidden` and is no longer a heading.

### F6 — Text over bright photographs is hard to read · Medium · Verified (screenshots)

- **Where:**
  - The name-slider ("Peaks 2 Shores") label over a bright sky, `.hc-cmp`.
  - The Circle headline over the coast, `.hc-circle`.
- **Fix (done):** a top gradient on `.hc-cmp` and a radial scrim behind the Circle copy. Both are subtle and leave the photograph legible.

### F7 — Journeys grid leaves an orphan row and a blank band · Medium · Verified

- **Where:** `/`, `FeaturedJourneys.tsx`.
- **Evidence:**
  - Five departures in rows of three left the second row with one empty slot.
  - The reveal waited for 10% of a very tall list to be in view, so a blank band showed on scroll.
- **Fix (done):**
  - A six-column grid in which the earliest departures span two-up as needed, so five cards read 2 + 3 with no gaps, and four read 2 + 2.
  - Wide cards use a 16/10 frame.
  - The reveal triggers at 2% in view.

### F8 — Destinations page doesn't match the homepage's visual language · High · Verified (user-reported, then screenshots)

- **Where:** `/destinations`.
- **Evidence:**
  - The page still used the older square editorial primitives (Frame, PhotoHero, Section, DarkCta), while the homepage uses rounded 10 px tiles, pill buttons, caps labels, navy bands and a full-bleed hero.
  - "Switzerland" clipped its column at 1440 px.
- **Fix (done):** rebuilt in the homepage's system. It reuses `.hc` tokens, `.hc-hero`, `.hc-intro`, `.btn`, `.circ` and `.hc-circle`, and adds a scoped `destinations.css`:
  - A full-bleed hero with country anchor pills.
  - A statement with catalogue-derived facts.
  - Alternating country rows: a rounded photograph tile beside journey cards.
  - A navy "Peaks. 2. Shores." band.
  - A private-travel close.
  - Every figure on the page is computed from content. Nothing is invented.

### F9 — Hydration error under reduced motion · Medium · Verified (console, found during this work)

- **Where:** `/` with `prefers-reduced-motion: reduce`, `HomeHero.tsx`.
- **Evidence:** React error #418. `useReducedMotion()` is `null` on the server but `true` on the first client render, so the play/pause label and icon differ.
- **Fix (done):** the reduced-motion pause applies only once the films arm, after load, so the first client render matches the server.

### F10 — `/journeys` mobile LCP held back by reveal-on-hydrate · Medium · Verified

- **Evidence:**
  - After F1, mobile LCP is still 7.8 s, 94% of it render delay.
  - The LCP element is the region toggle under the globe, inside a `Reveal` that stays at opacity 0 until JavaScript hydrates.
- **Fix (recommended, not done):** render above-the-fold content visible on the server and animate only content below the fold. This touches the site-wide `Reveal` primitive, so it should be its own change.

### F11 — Duplicate photograph on the homepage · Low · Verified

- **Evidence:** the "Shores" fallback (`home-cove`) shows the same yacht as `home-way-cruises`.
- **Fix (recommended):** this resolves itself once Marc picks the `client-shores` photo (see the image asset plan). Not changed, to avoid pre-empting his choice.

### F12 — Repeated stock imagery on /experiences · Low · Verified

- **Evidence:** `ex-4` and `ex-5` were generic stock frames that duplicated images used elsewhere.
- **Fix (done):** replaced them with client photographs from the Drive folder (an alpine suspension bridge above Zermatt, and a Qwabi lodge suite), and removed the old stock files and their manifest and credit entries.

### F13 — Unused heavy media and components · Low · Verified

- **Evidence:**
  - About 26 MB of `public/video/hero-reel*.mp4` and about 40 Drive photographs are not referenced anywhere.
  - `PeaksToShores.tsx` was unused after the redesign.
- **Fix:**
  - Removed the unused component.
  - Media kept on purpose: deleting client files is a destructive call for the owner. Unreferenced files in `public/` don't affect page weight, only repository and deploy size.

### F14 — Brand-final slots pointing at stock · Low · Verified

- **Evidence:** `dest-italy` and `dest-spain` are marked "brand asset (final)" but resolve to stock frames `pillar-1` and `pillar-4`. The Spain frame is the weakest on the destinations page.
- **Fix (recommended):** ask Marc for his own Italy and Mallorca photographs.

### A1 — Licence provenance of homepage media · Assumption

- The `public/images/home/*` and `public/video/home/*` files come from the client-approved "Sample C" homepage, but no licence record exists in the repository.
- The Positano and Hvar reel clips are noted in code as licensed Shutterstock, but no licence IDs are recorded.
- Drive files that aren't phone originals (Croatia aerials, Hout Bay, Rigi, hotel press images, the lion photographs) have unknown provenance.
- **Needs owner confirmation; see the image asset plan.**

### A2 — Real-network behaviour · Assumption

- Lighthouse simulated throttling is a model. Field data (CrUX/RUM) wasn't available locally, so treat the scores as directional.

## Prioritised roadmap

| #   | Item                                                                                     | Severity | Status           |
| --- | ---------------------------------------------------------------------------------------- | -------- | ---------------- |
| 1   | F1 globe main-thread cost                                                                | Critical | Done             |
| 2   | F2 homepage LCP and weight                                                               | High     | Done             |
| 3   | F8 destinations redesign                                                                 | High     | Done             |
| 4   | F3 floating button overlap                                                               | High     | Done             |
| 5   | F4 contrast                                                                              | High     | Done             |
| 6   | F5, F9 accessibility and hydration                                                       | Medium   | Done             |
| 7   | F6, F7 legibility and grid                                                               | Medium   | Done             |
| 8   | A1 licence records for home media and Drive files                                        | —        | **Owner action** |
| 9   | F10 server-visible above-the-fold reveals                                                | Medium   | Next             |
| 10  | 10 outstanding `client-*` slots (Marc's picks), F11, F14                                 | Low      | **Owner action** |
| 11  | Phone captions for the name slider; 44 px tap targets on inline text links in the footer | Low      | Next             |
| 12  | Decide whether to archive the unused 26 MB reel videos and Drive files                   | Low      | **Owner action** |
| 13  | `prettier --write` on `PeaksShoresSlider.tsx` (pre-existing)                             | Low      | Next             |
