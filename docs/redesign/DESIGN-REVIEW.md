# Peaks2Shores — Creative-director review of the implementation

Reviewer: Agent 1. Measured against `docs/redesign/DESIGN-SPEC.md`.
Method: production build of a mirror of the working tree (`next build && next start -p 3108`),
headless Chrome at 1440×900 and 390×844, preloader skipped, scrolled to trigger every reveal.
Pages checked: `/`, `/journeys`, `/journeys/amalfi-slowly`, `/journeys/the-swiss-lakes`
(in preparation), `/destinations`, `/experiences`, `/our-story`, `/journal`, `/plan`, `/links`,
`/privacy`, 404. No page scrolls sideways at 390px or 1440px.

## Verdict

The **system** now reads as an art-directed editorial brand:
- Cormorant at 500 with its italic, Manrope for UI, the forest / ivory / stone grounds, the
  sea-glass rules and the numbered kickers all hold together.
- Pages are related without being identical: the globe band, the journey facts bar, the
  ledger tables on /plan and the 2×2 numerals on /our-story all work.
- The Peaks → Shores strip and the hotels ledger are the strongest moments.

What still breaks the luxury read, in order:
1. **The photography.** Stock comps are saturated and unrelated to each other, some show
   the wrong subject, and some appear on several pages.
2. **Hero legibility** on bright photographs.
3. **Dark sections running straight into the dark footer.**
4. **Too much repetition at the end of the homepage:** two newsletter forms and three
   closing sections in a row.
5. **Dead space** on /experiences and in two homepage sections.

---

## P1 — must fix before anyone outside the team sees it

1. **Hero slide 3, "The open sea", shows a wind farm in a field.** The same file is the
   background of the homepage's closing invitation. It is off-brand, and the closing
   headline and kicker are unreadable over its sky.
   *Fix (Agent 2):* replace `home-hero-3` with a dark, low-horizon sea image (dusk, or
   overcast water; no horizon in the top third).
   *Fix (Agent 3, `src/components/home/PlanInvitation.tsx`):* until it is replaced, use
   `tr-3` and raise the scrim from `bg-forest-deep/35` to `/55`.

2. **Journey hero titles are unreadable on bright pictures** (The Swiss Lakes: white
   headline on white buildings; the breadcrumb and the lead disappear; the Amalfi lead is
   lost over the town). The overlay I specified (0.62 → 0 over 55%) is too weak for
   midday stock photographs.
   *Fix (Agent 5, `src/components/ui/Frame.tsx`, `overlay="hero"`):*
   - Bottom gradient `rgb(21 30 26 / .78)` → 0 at 62%.
   - Add a left gradient `linear-gradient(to right, rgb(21 30 26 / .45), transparent 55%)`.
   - Keep the top gradient at .28.
   *Fix (Agent 2):* choose hero images whose lower-left third is dark or quiet
   (`sl-*`/`listMedia` for the Swiss Lakes, `am-hero`).

3. **The journey filters collide at 1440px.** "ALL 5 JOURNEYS" sits on top of "Art & Design".
   *Fix (Agent 4, `src/components/journeys/JourneyExplorer.tsx`):* take the count and
   "Clear" out of the fieldset row and put them in their own line under the bar. Use
   `grid-cols-[1fr_0.8fr_1fr_1.6fr]`, so "What inspires you" gets the widest column.
   Confirm at 1024px, 1280px and 1440px.

4. **The journal images undermine the brand.** "At the table" is a wrapped sandwich, the
   "Engadin" piece shows a flat larch hill with hay bales, and the rest are random.
   *Fix (Agent 2):* `jn-1` should be an Engadin lake or larches in October gold, `jn-2` the
   coast in soft September light, `jn-3` a long table outdoors, `jn-4` a hotel terrace.
   If nothing suitable exists, use the existing `tr-2`, `g1`, `cp-5` and `am-h1` files for
   now; don't publish weak images.

5. **Dark sections run straight into the dark footer.** This happens with the enquiry block
   on `/journeys/[slug]` and `/plan`, with the closing invitation on `/`, and with the
   DarkCta on `/journeys`, `/destinations` and `/experiences`. Forest against forest-deep
   is a ΔL of about 2%, so it reads as one muddy block and the footer loses its ending.
   *Fix (Agent 5, `src/components/layout/Footer.tsx`):* start the footer with a
   1px `line-dark` rule inside the container, plus `pt-section` (not `-sm`).
   *Fix (Agent 4):* move the journey and /plan enquiry onto the **stone** ground, using the
   light `EnquiryForm` variant with `field-rule` on `line` and `kicker-sm` in `stone-text`.
   Stone → forest-deep is a clear change of ground.
   *Fix (Agent 3, `src/app/page.tsx`):* change the order to WhyUs → **PlanInvitation** →
   **Circle** → footer, so an ivory section sits between the two darks.

6. **The homepage ends with two newsletter forms in a row** (Circle, then the footer band).
   *Fix (Agent 5, `Footer.tsx`):* hide the footer's `NewsletterForm` on routes that render
   the Circle (`/` and `/journal`, via `usePathname`). On those routes keep the
   "Fewer, better journeys." line with a `rule` link to `/plan`.

## P2 — should fix this wave

7. **No shared colour grade.** The comps vary from neon (the Miami lifeguard tower, the
   lemon blossom macro, lemons on black) to grey, so pages feel assembled rather than shot.
   *Fix (Agent 5, `Frame.tsx`):* apply a house grade to every photograph,
   `filter: saturate(.86) contrast(.97) brightness(1.01)`, defined as `--photo-grade` in
   `globals.css`. Exclude the `marc-portrait` cut-out. Remove it once commissioned work lands.
   *Fix (Agent 2):* replace `tr-4` (pick a softer Miami at dawn, ocean and palms), `am-why`
   (lemon terraces, not a macro), `g2` (lemons in a crate, not on black) and `d9`, which
   reads as Palermo, not a Naples departure.

8. **The same photographs repeat across pages.**
   - The alpine lake (`tr-2`) appears on the home strip, the /destinations strip, /plan
     private travel and the 404.
   - The Matterhorn (`tr-1`) appears on the home strip, /destinations and the /our-story hero.
   - The same Swiss village appears in the Swiss Lakes hero, its /journeys row and the
     /destinations chapter.

   *Fix:*
   - Agent 4: /plan private travel uses `ce-4` (the jetty with empty chairs), and the
     /our-story hero uses `home-hero-2`.
   - Agent 5: the 404 uses `g5` (an empty terrace).
   - Agent 2: give `jl-2` a different frame from the Swiss hero.

9. **Dead space on /experiences.** Each chapter is about 1,400px tall, with 300px+ voids
   between chapters, so the page reads as unfinished.
   *Fix (Agent 4, `src/app/experiences/page.tsx`):*
   - Chapter padding `py-section-sm`, not `py-section`.
   - The vertical offset on composition (1)/(4) becomes 64px, not 120px.
   - Text blocks get `self-center`.
   - Add the experience's existing body as `.prose-body` under the `.lead`, if the data has
     it. If not, the chapter stays short; don't invent copy.

10. **Dead space in the homepage Peaks → Shores section** (about 250px of forest under
    "Miami"). *Fix (Agent 3, `PeaksToShores.tsx`):* reduce the stagger to 0, 64, 32 and
    112px, and apply `pb-section-sm` after the strip, not `pb-section`.

11. **The founder portrait floats in a tall empty stone field** on `/` (about 300px of
    blank stone above the head) and sits in a lighter rectangle on /our-story.
    *Fix (Agent 3, `FounderStrip.tsx`):* use `min-h-[640px]`, the frame aligned to the
    bottom (`object-position: bottom`), and the text column `self-center`.
    *Fix (Agent 2, `media.ts`):* set the `marc-portrait` slot's `tone` to `#d9d0bf` (stone),
    so the frame ground matches the section.

12. **Body copy is too small next to very large headlines.** At 1440px, pillar bodies,
    hotel "why" text, journey row blurbs and the Why us items render at about 14px under
    60–76px headlines. The hierarchy jump is too steep and reads like a template.
    *Fix (Agent 5, `globals.css`):* `.prose-body-sm` becomes `15px/1.65`.
    *Fix (Agents 3/4):* use `.prose-body` (17px) for hotel `why`, pillar `body` and journey
    row blurbs; keep `-sm` for meta-level copy only.

13. **The header logo is too small to read** at 1440px: the stacked PNG's tagline turns to
    noise at about 30px high.
    *Fix (Agent 5, `Header.tsx`):* logo height 40px desktop / 32px compact.
    *Fix (Agent 2):* supply a wordmark-only `logo-dark.svg` / `logo-light.svg` with no
    tagline line; the tagline appears only in the footer.

14. **/destinations has a stranded kicker:** "WHERE WE GO — 4 COUNTRIES" sits alone in an
    empty ivory band before the first chapter.
    *Fix (Agent 4, `src/app/destinations/page.tsx`):* add the existing headline "Four
    countries, and the journeys that know them." as `.h2` under it, or delete the band.

15. **The Philosophy companion image** (`pillar-4`, a resort pool on terracotta tiles) is
    the first photograph after the hero and the cheapest-looking on the site.
    *Fix (Agent 3, `Philosophy.tsx`):* use `am-h2` ("The quiet side") or `ce-4`.
    *Fix (Agent 2):* replace `pillar-4` with a terrace or chair with a book, in soft light.

16. **Related journeys rows leave a 4-column void** between the image and the text at
    desktop. *Fix (Agent 4, the slug page's related block):* image cols 1–4, text cols 6–10,
    link col 12; or make the image 5 columns at `3/2`.

## P3 — nice to have

17. **Mobile hero kicker orphans "GUESTS"** on its own line.
    *Fix (Agent 3, `Hero.tsx`):* `text-wrap: balance`, or keep "max. 18 guests" together
    with a `whitespace-nowrap` span.
18. **The journal category line** reads as dead text. Raise it to `kicker` (not `-sm`) and
    space the items with `·` separators in `acqua-deep`, so it reads as a table of contents.
19. **The 404 link label "Return to the journey"** is ambiguous when there is no journey.
    Use "Home" (Agent 5, `not-found.tsx`), using existing strings only.
20. **Experiences rail on `/`:** the arrows sit 60px below the captions. Align them to the
    rail's top-right, next to the heading's word index (Agent 3, `ExperiencesStrip.tsx`).
21. **Motion:** reveals, the curtain and the hero line-rise all complete; nothing sticks
    hidden. The page still feels slightly slow on long pages because every list item
    staggers. Cap `RevealGroup` stagger at 6 items, as the spec says (Agent 5, `Reveal.tsx`),
    and check `/journeys/amalfi-slowly` (about 20,000px tall) for scroll smoothness on a
    mid-range phone.
22. **Homepage section numbers** run 01–09 but the closing invitation has none. Either
    give it "10 — Plan" or drop numbers from Circle too, so the sequence ends cleanly
    (Agent 3).

## Keep as built (don't regress)

- Facts bar on the journey pages.
- The `/plan` departures ledger.
- The globe band with its linked list.
- The /our-story 2×2 numerals.
- The privacy page's sticky contents list.
- The hotels ledger.
- The Peaks → Shores captions set under the images.
- The stone "From Marc" quote block.
- The mobile journey facts grid.
- The `/links` page.
