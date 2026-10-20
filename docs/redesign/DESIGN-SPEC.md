# Peaks2Shores — Redesign Specification (wave 2)

Owner: Agent 1 (Creative Director). Status: **binding for Agents 2–6.**
Branch: `redesign/luxury-editorial`. Where this spec and `README.md` disagree, this spec wins;
Agent 5 updates the README's design-system section at the end of the wave.

Brand idea in one line: **a printed travel journal kept by one person.** Warm paper, deep
forest ink, sea-glass hairlines, photographs given room. Every page alternates *reading*
(light paper) and *looking* (dark ground or full-bleed photograph). Nothing is a card grid.

Hard content rule (all agents): copy comes only from `src/lib/content.ts`, `src/lib/journeys.ts`,
`src/lib/site.ts` and the strings already hard-coded in today's components. No invented
facts, prices, reviews, awards, press, partners, counts or dates.

---

## 1. Audit — what is replaced

| Where | Problem | Decision |
| --- | --- | --- |
| `globals.css` `--font-display: Georgia` | System Georgia reads default/web-safe, not luxury; poor italic at display sizes on Windows | Replace with **Cormorant Garamond** via `next/font` (§2.2) |
| `layout.tsx` Poppins 300 body | Geometric startup voice; 300 weight at 14–16px is thin and low-contrast | Replace with **Manrope** (variable) at 400 body (§2.2) |
| `--color-acqua #0cc0df` | Electric cyan; reads tech, fights photographs | Muted sea-glass (§2.1), same token names |
| `--color-gorse #d7da5e` | Acid yellow-green; looks like a highlighter | Muted brass (§2.1), same name |
| `bg-ink` dark sections (`PeaksToShores`, `DarkCta`) | Near-black is flat; no "forest" identity | Dark grounds become `forest` / `charcoal` (§2.1) |
| Every section: `pt-20 md:pt-[112px]`, `.editorial-grid` 140px rail + 2 equal cols | Same skeleton on every block → monotone; arbitrary px values | 12-col grid + section rhythm tokens (§2.4); rail used max 2× per page |
| `home/FeaturedJourneys` 3 equal cards | Generic card grid | Lead + two secondaries, unequal ratios (§4.4) |
| `home/ExperiencesStrip` 5 equal columns with even-offset | Card grid in disguise; 13px copy | Typographic index + horizontal rail on forest (§4.8) |
| `home/WhyUs` 3×2 bordered boxes | Spreadsheet look | Sticky headline + numbered two-column list (§4.9) |
| `home/Philosophy`, `Circle`, `PageTitle` | Identical rail/headline/body triple | Each gets its own composition (§4, §5) |
| Section-heading sizes (`h3` used as section H2 everywhere) | Hierarchy flat | `.h2` for homepage section heads, `.h3` for sub-sections (§2.3) |
| `JourneyCard` `hover:bg-panel` card | Card-like; hidden CTA (`.card-cta`) only on hover | Removed on home; Journeys index uses rows (§5.1). `.card-cta` always visible |
| `journeys/[slug]` Guests quotes | Two testimonials from the canvas with unverified attribution | **Hidden** until `verified: true` exists on quote data (Agent 6 adds field, default false). Agent 4 renders section only for verified quotes |
| Footer on ivory, logo PNG dark | Page ends weakly on the same ground it started | Footer moves to `forest-deep` ground (§2.8) |
| Preloader floor 900ms / cap 1800ms | Too long for "fast" | Floor 600ms, cap 1400ms (§3) |
| Arbitrary values `text-[13px]`, `h-[560px]`, `pb-[104px]` | Inconsistent | Use tokens/classes from §2; fixed heights → `aspect-*` ratios |

Keep (they are good): zero radius, 1px rules, `link-rule` sweep, `nav-link` hairline, `field-rule`
inputs, `Frame` curtain reveal, CSS-only hero line-rise, `Ground` develop-in, `PillarsIndex` sticky
cross-fade, `HotelsStrip` ledger, `ItineraryRail` marker, reduced-motion/no-JS safety net,
`data-preload` boot script, the globe.

---

## 2. Design system

### 2.1 Colour tokens (`@theme` in `globals.css`)

Existing names are kept so nothing breaks; values evolve. New tokens added.

| Token | Hex | Role / where allowed | Contrast notes |
| --- | --- | --- | --- |
| `--color-ivory` | `#f4f1ea` | Main paper ground. Unchanged | ink 14.7:1 |
| `--color-panel` | `#ede9df` | Second paper (Pillars, filters bar, form fields' hover) | muted 4.5:1 — muted text allowed ≥11px |
| `--color-stone` **new** | `#d9d0bf` | Founder / Marc blocks, image grounds, placeholder tone default | ink 10.8:1; use `--color-stone-text` for metadata |
| `--color-stone-text` **new** | `#5e594f` | Caps labels on stone only | 4.55:1 on stone |
| `--color-ink` | `#1e1f1d` | Headlines + primary text on light | — |
| `--color-body` | `#3a3b38` | Body copy on light | 10.0:1 on ivory |
| `--color-muted` | `#6f6a60` | Kickers/meta on ivory/panel only, never on stone | 4.77 ivory |
| `--color-forest` **new** | `#1d2a25` | Primary dark ground (P2S, Experiences, DarkCta, globe band) | on-dark 13.2:1 |
| `--color-forest-deep` **new** | `#151e1a` | Footer, mobile menu sheet, globe band | on-dark ≥14:1 |
| `--color-charcoal` **new** | `#232422` | Secondary dark ground (journey Pacing, error page). Never adjacent to forest | on-dark-body 8.9:1 |
| `--color-on-dark` | `#f4f1ea` | Headlines on dark/photo | — |
| `--color-on-dark-body` | `#c9c4b6` | Body on forest/charcoal | 8.5:1 forest |
| `--color-on-dark-muted` | `#a3a89f` | Kickers on dark | 6.1:1 forest |
| `--color-acqua` | `#8cc2b8` | Sea-glass. Hairlines on dark/photo, hover text on dark, active nav rule over hero, scroll progress | 7.5:1 on forest → **text-safe on dark** |
| `--color-acqua-deep` | `#5f948c` | Hairlines/rules on light ground. **Not text** (3.05:1) | — |
| `--color-acqua-text` | `#2f6b64` | The only acqua as text on light (link hover, status tags, filter "clear") | 5.46 ivory, 4.9 panel |
| `--color-gorse` | `#b39e64` | Muted brass: Tick mark, quote rule, preloader rule, active hero progress. **Never text on light** (2.3:1); OK as text on forest (5.7:1) only ≥14px | — |
| `--color-line` | `rgb(30 31 29 / 0.16)` | Rules on light | — |
| `--color-line-dark` | `rgb(244 241 234 / 0.18)` | Rules on dark | — |
| `--color-tone-*` | unchanged | Photo placeholder grounds | — |

Rules: acqua is never a fill larger than 2px except selection (`rgb(140 194 184 / 0.35)`).
No gradients except the Frame overlays (`hero`: `linear-gradient(to top, rgb(21 30 26 / .62), rgb(21 30 26 / 0) 55%)` + top `rgb(21 30 26 / .28)` → 0 over 22%; `caption`: bottom 40% to `/.55`).
`viewport.themeColor` stays `#f4f1ea`. Focus ring: 2px `ink` on light, 2px `acqua` on dark/photo
(add `.bg-forest, .bg-charcoal, .bg-forest-deep` to the existing `:where(...)` selector).

### 2.2 Typography decision

**Display / editorial serif: Cormorant Garamond** (`next/font/google`, `subsets:['latin']`,
`weight:['400','500','600']`, `style:['normal','italic']`, `variable:'--font-cormorant'`,
`display:'swap'`, `preload: true`). Why: high-contrast Garamond that holds up at 100px+, a
genuinely beautiful italic for the "personally curated." line and leads, and it feels like
a printed journal rather than a fashion house (it is set *large and medium weight*, never
thin, which is what keeps it from the generic "luxury template" look). It runs ~10% smaller
than Georgia at equal px — the scale below already compensates.
- 500 = all headings (display → h4). 600 = h5 and serif numerals under 28px. 400 italic = `.lead`, quotes, italic headline lines. Never 300.
- `font-feature-settings: "lnum" 1, "kern" 1` on headings (lining numerals for day numbers/prices); `"onum"` inside `.lead`.

**UI / body sans: Manrope** (`next/font/google`, variable, `variable:'--font-manrope'`,
`display:'swap'`). Why: humanist-geometric, much more readable than Poppins at 14–17px,
tight caps for kickers, neutral enough to let the serif lead. Weights used: 400 body,
500 kickers/nav/buttons, 600 only for the price/"from" figure. Never 300.

`--font-display: var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;`
`--font-ui: var(--font-manrope), system-ui, -apple-system, 'Segoe UI', sans-serif;`
`body { font-weight: 400 }`. Remove Poppins import.

### 2.3 Type scale (class names unchanged — values change)

| Class | Font / wt | Size | LH | Tracking | Measure / use |
| --- | --- | --- | --- | --- | --- |
| `.display` | serif 500 | `clamp(54px, 9.2vw, 156px)` | 0.94 | -0.025em | Journey hero titles; max 12ch |
| `.h1` | serif 500 | `clamp(48px, 8vw, 132px)` | 0.96 | -0.022em | Home hero, photo heroes, 404 |
| `.page-title` | serif 500 | `clamp(46px, 6.4vw, 104px)` | 0.98 | -0.02em | Index pages; max 14ch |
| `.h2` | serif 500 | `clamp(38px, 5vw, 76px)` | 1.02 | -0.018em | Homepage/section statements; max 20ch |
| `.h3` | serif 500 | `clamp(32px, 3.8vw, 58px)` | 1.05 | -0.015em | Sub-section heads; max 22ch |
| `.h4` | serif 500 | `clamp(26px, 2.6vw, 40px)` | 1.1 | -0.01em | Row titles (journey, hotel, day) |
| `.h5` | serif 600 | `clamp(22px, 1.8vw, 28px)` | 1.18 | -0.005em | List titles, card-level |
| `.lead` | serif 400 italic | `clamp(21px, 1.9vw, 28px)` | 1.36 | 0 | One per block; max 34ch (`.measure-lead`) |
| `.quote` **new** | serif 400 italic | `clamp(28px, 3.2vw, 48px)` | 1.18 | -0.01em | Pull quotes (founder, Marc's note) |
| `.numeral` **new** | serif 500 lnum | `clamp(56px, 7vw, 112px)` | 0.9 | -0.03em | Stats (pacing), big index numbers |
| `.prose-body` | sans 400 | `clamp(16px, 0.35vw + 14.8px, 17px)` | 1.7 | 0 | max 62ch (`.measure`) |
| `.prose-body-sm` | sans 400 | `14.5px` | 1.65 | 0 | max 52ch |
| `.kicker` | sans 500 caps | `11.5px` | 1.2 | 0.18em | Section labels |
| `.kicker-sm` | sans 500 caps | `10.5px` | 1.2 | 0.16em | Meta labels (min — never smaller) |
| `.nav-label` | sans 500 caps | `12px` | 1 | 0.14em | Nav |
| `.meta` **new** | sans 400 | `13.5px` | 1.55 | 0.01em | MetaItem/FactList values (replaces `text-[13px]`/`[14px]`) |

All headings `text-wrap: balance`; body `text-wrap: pretty`. Italic headline lines use `<span class="italic font-normal">` (400 italic).
Arbitrary `text-[Npx]` in components must be removed in favour of these classes.

### 2.4 Grid, spacing, rhythm

Container: `.container-site` = `width:100%; max-width: 1680px; margin-inline:auto;` + `.gutter`.
Full-bleed images ignore the container (they sit outside it), text never does.

| Breakpoint | Columns | Column gap | Outer margin (`.gutter`) |
| --- | --- | --- | --- |
| < 768 | 4 | 16px | 20px |
| 768–1119 | 8 | 24px | 40px |
| ≥ 1120 | 12 | 32px | 56px |
| ≥ 1440 | 12 | 40px | 72px |

`.grid-site` **new** = `display:grid; grid-template-columns: repeat(4|8|12, minmax(0,1fr)); column-gap: var(--grid-gap)`.
Components place content with Tailwind `col-span-*` / `col-start-*` (`lg:` = 1024, use `xl:` 1280 for the 12-col
refinements if 1024 is cramped). Retire `.editorial-grid` usage on the homepage; keep the class
(internal pages may use `.editorial-grid--wide` once per page for a numbered rail).

Spacing tokens (`@theme --spacing-*`, usable as `py-section` etc.):
`--spacing-section: clamp(96px, 12vw, 192px)` (major sections) ·
`--spacing-section-sm: clamp(64px, 8vw, 128px)` (sub-sections, ledger, CTA) ·
`--spacing-block: clamp(40px, 5vw, 80px)` (headline → content) ·
`--spacing-stack: 24px` (paragraph/element stack) · `--spacing-gutter` per table above.
Rhythm rule: a light section following a light section is separated by a full-width 1px
`line` rule inside the container (not edge to edge); light↔dark transitions have no rule.
No two consecutive sections share the same layout skeleton.

### 2.5 Image ratios (Frame `ratio` prop)

| Use | Ratio | Notes |
| --- | --- | --- |
| Home hero / photo heroes | `h-svh` min 640px (mobile 600) | full-bleed, `overlay="hero"` |
| Journey hero | `h-[92svh]` min 620px | full-bleed |
| Lead feature (featured journey #1, chapter openers) | `4/5` desktop, `4/5` mobile | 7 of 12 cols |
| Secondary feature | `3/4` and `1/1` | 5 cols, never equal pair |
| Panorama break | `21/9` desktop, `4/3` mobile | full-bleed, once per page max |
| Landscape in text | `3/2` | itinerary days, journal entries |
| Portrait in ledger | `4/5` | hotels, 3 cols |
| Rail items | `3/4` | experiences rail |
| Gallery | `16/9` wide, `4/5` tall, `1/1` short | from `gallery[].span/height` (§5.2) |
| Founder cut-out | `fit="contain"` on stone, min-h 560/720 | never cropped |

### 2.6 Buttons and links

All: zero radius, Manrope 500, 11.5px caps, tracking 0.16em, min target 44×44 (pad to it).
| Variant | Rest | Hover (pointer:fine) | Active | Focus |
| --- | --- | --- | --- | --- |
| `ink` (light ground) | bg ink / text ivory, `px-7 py-[17px]` | bg `forest`, lift -2px + current shadow | scale .985 | 2px ink outline, offset 3px |
| `forest` **new** (light ground, primary CTA "Plan your journey") | bg forest / ivory | bg forest-deep | same | same |
| `light` (photo/dark) | bg ivory / ink | bg white | same | 2px acqua outline |
| `outline` | 1px currentColor | fill ink (light) / fill ivory text ink (dark: add `outline-dark`) | — | — |
| `rule` | `link-rule`: text ink, 1px `acqua-deep` underline (on dark: text on-dark, `acqua`) | sweep (existing), text `acqua-text` / on dark `acqua` | — | outline |
Add optional `arrow` prop to `Button`/`ButtonLink`: appends a 14px 1px-stroke `→` SVG that
translates 4px right on hover (300ms). Disabled: opacity .4, no lift. Inline text links in
prose: underline 1px `acqua-deep`, `text-underline-offset: 0.22em`, hover colour `acqua-text`.

### 2.7 Navigation

Desktop (≥1024): logo left (h 34px / compact 28px), primary nav centred-right
(`gap-8`, `nav-label`), CTA `outline` "Plan your journey" right. Transparent over heroes
(white text, acqua rule); solid state = `rgb(244 241 234 / .9)` + blur 14px + bottom `line`.
Heights: `--nav-h` 68 mobile / 84 desktop; compact 60/68. Hide on scroll-down after 480px,
show on scroll-up (existing). Active page: rule persists.
Mobile (<1024): logo + 44px burger (two 1px lines → X). Menu = full-screen `forest-deep`
sheet (change from ivory) with nav items in `.h3` serif, stacked, 1px `line-dark` between,
staggered 60ms rise; below: CTA `light`, email, locations in `kicker-sm on-dark-muted`.
Header over the open menu: on-dark colours. Focus trapped (existing behaviour kept).

### 2.8 Footer

Ground `forest-deep`, text on-dark. Top band: `.h2` "Fewer, better journeys." (existing string)
cols 1–7 + `NewsletterForm` (dark variant) cols 8–12 with `kicker` "The travel journal".
Then rule `line-dark`, then 4 columns: brand blurb (existing copy), two `footerNav` groups,
contact (`site.locations`, email, phone/WhatsApp when set). Bottom bar: legal links + ©,
`kicker-sm on-dark-muted`. Logo: use a light version — Agent 2 to supply
`public/brand/logo-light.png` (or Agent 5 applies `filter: invert(1) brightness(1.1)` as a
stop-gap). Padding: `pt-section-sm pb-10`.

---

## 3. Motion language

Keep `src/lib/motion.ts` structure; change values:
`duration = { ui: 0.25, uiSlow: 0.4, reveal: 0.9, page: 0.6, signature: 1.2 }`.
Eases unchanged (`editorial`, `exit`, `reveal`). `maskInnerVariants` duration 1.0.
`viewportOnce` unchanged. Default reveal distance 16px (was 18).

| Element | Behaviour |
| --- | --- |
| Hero headline | CSS `.line-rise` 1.0s, lines 90ms apart; kicker/standfirst/buttons `.enter` at 0.05/0.45/0.55s |
| Section headlines | `Reveal variant="mask"` — once per section, headline only |
| Body/meta blocks | `Reveal` fade-up 16px, 0.9s, delay 0.1 after headline |
| Lists | `RevealGroup` stagger 0.06 (max 6 items animated; rest appear with the 6th) |
| Images | `Frame` curtain 1.2s + settle 1.04→1 1.6s. Parallax only on: home hero, P2S frames, one panorama per page; max ±40px |
| Image hover (linked) | `frame-zoom` scale 1.035 over 1.0s; caption rule draws (acqua) 400ms |
| Dark grounds | `Ground` develop 0.9s |
| Page transition | Incoming page: opacity 0→1 + y 12px→0, 0.6s editorial; outgoing not animated. First page of session not animated (keep) |
| Preloader | Keep PEAKS → 2 → SHORES; floor 600ms, cap 1400ms, once per 24h; brass rule draws 0.8s; exit = ivory cover lifts (scaleY to 0 from bottom) 0.7s `reveal` ease |
| Header | existing transitions at 0.45s |
| Scroll progress | 1px `acqua-deep` on light / `acqua` over hero (keep scroll-event driven) |
| Rails (`Rail`) | native `overflow-x:auto` + `scroll-snap-type:x mandatory`; buttons scroll by one item with `behavior:'smooth'` (auto under reduced motion) |

Forbidden: scroll-jacking, pinned horizontal scroll, cursor followers, springs, text scramble,
marquee, autoplay video, anything > 1.4s except hero drift (9s).
Reduced motion: existing stylesheet net stays authoritative; every new primitive must
add its selectors to it.

---

## 4. Homepage storytelling sequence

Narrative: *arrive → the belief → the name (where it comes from) → the journeys → what they are
held to → the man → where you sleep → what you do → why us → stay in touch.* Grounds alternate.
Rail numbering `01 — …` stays as `SectionLabel` (kicker) but placed **above** the headline,
not in a 140px column (except Hotels, which keeps the ledger rail).

### 4.1 Hero — photo (dark)
Existing `Hero` + carousel (home-hero, -2, -3; peaks → shores). Changes: headline `.h1`,
cols 1–9, bottom-aligned `pb-[clamp(40px,7vh,88px)]`; standfirst + buttons in cols 9–12 aligned
to headline baseline. Slide controls move bottom-right as a numbered caption index:
`01 The Amalfi Coast · 02 The Alps · 03 The open sea` (`kicker-sm` white/70, active white +
acqua 1px progress rule 36px). Copy: existing hero strings. Buttons: `light` "Explore journeys",
`rule` (white) "Our story". Scroll cue: none.
→ connects: hero's last line "enough time to be there" hands to Philosophy's statement.

### 4.2 01 — Philosophy — ivory
Composition "statement page": `SectionLabel` col 1; `philosophy.headline` as `.h2` cols 1–10
(max 20ch); below, offset to cols 7–11, the two paragraphs (`.prose-body`, first paragraph
as `.lead`), `rule` button "How we travel". Right-hand small frame `pillar-4` ratio `3/4`,
cols 1–4 bottom-left, overlapping upward 15% (desktop only) — the only image, small, quiet.
Padding `py-section`. → Thesis stated; next shows where it comes from.

### 4.3 02 — The name (Peaks → Shores) — forest
`Ground` forest. Headline `Peaks. 2. Shores.` as `.display` (the "2." in `acqua`), body
cols 8–12. Frames (`peaksToShores.frames`) become a **staggered descending strip** across
12 cols: tr-1 cols 1–3 ratio `2/3` top 0; tr-2 cols 4–6 `1/1` top +96px; tr-3 cols 7–9 `4/5`
top +48px; tr-4 cols 10–12 `3/4` top +160px. Captions under each (not over): `kicker-sm`
`frame.n` + `.h5` label, on-dark. Mobile: 2-col, alternating `2/3`/`1/1`, offsets 0/48px.
Parallax kept (±28–46px). → ends at Miami/"Shores"; next: the journeys in those places.

### 4.4 03 — Journeys — ivory
Header: `SectionLabel`, `.h2` "A few journeys a year. Each one we’d take ourselves." cols 1–8,
`rule` "All journeys" right-aligned at baseline. Body: `featuredJourneys()`:
- #1 lead: Frame `4/5` cols 1–7 (hover zoom), caption block to its right cols 8–12, top-aligned
  to 25% of image height: status tag, `.h3` title, `.lead` journey.lead, MetaItems (departure,
  days, group), "From {priceFrom} per person" (`meta` 600), `rule` "View the journey".
- #2 cols 8–12 below caption, Frame `1/1`; #3 cols 2–6 under lead, Frame `3/4`, offset top -64px.
  Each with kicker (region · days), `.h4` title, blurb, link.
Mobile: stacked, ratios 4/5, 1/1, 3/4. If fewer than 3 featured: lead + one; if 1: lead only.
→ next: what each of these is held to.

### 4.5 04 — Principles — panel
Keep `PillarsIndex` (sticky cross-fading `4/5` frame left cols 1–6, list cols 7–12). Section
head `.h2` "What every journey is held to." Each pillar: `kicker` n + Tick, `.h4` title,
`.lead`, `prose-body-sm`. → "Personal" pillar names Marc; next section is Marc.

### 4.6 05 — The founder — stone
Split: cut-out `marc-portrait` cols 1–6 on stone, feet on floor, min-h 720 desktop.
Text cols 7–12 (inner max 520px): `SectionLabel` (stone-text colour), `.h2` founder.headline,
two paragraphs, `.quote` founder.quote with 1px brass rule above (48px wide), `rule` "Meet Marc".
Mobile: portrait first (min-h 480), text below. → Marc chooses the hotels.

### 4.7 06 — Hotels — ivory
Keep the ledger (`HotelsStrip`), restyled: rail label + `.h2` headline cols 1–8, intro paragraph
cols 9–12. Rows: number (`.numeral` at 40px → use `.h4` serif `01`), Frame `4/5` 3 cols,
name `.h4` + place kicker + why 5 cols, MetaItems 3 cols. Row hover (pointer:fine): image
zoom only, no bg change. Remove `bg-panel` (panel is used by Principles).
→ "Nearby" details lead into what you do there.

### 4.8 07 — Experiences — forest
`Ground` forest. Top: `.h2` "The things we believe are worth your time." cols 1–7; on the
right cols 8–12 the five titles as an inline typographic index (`.h4` serif, separated by
`·` in acqua), each a link to `/experiences#slug`. Below, full-bleed-right `Rail`
(starts at the container's left edge, bleeds off the right): five items `ex-1..5`, ratio `3/4`,
item width `clamp(260px, 28vw, 420px)`, gap 24px; caption: `kicker-sm` "0n", `.h5` title,
`prose-body-sm` body (on-dark-body). Prev/next 44px square outline-dark buttons bottom-right.
→ next: the reasons the whole thing works.

### 4.9 08 — Why us — ivory
Left cols 1–5 sticky (`top: calc(var(--nav-h) + 48px)`): `SectionLabel`, `.h2` "Someone who
really knows travel has already done the filtering for you." Right cols 7–12: `reasons` as an
ordered list in a 2-col sub-grid (1-col mobile), each item: serif `.h5` index `01` in
`acqua-text`, `.h5` title, `prose-body-sm`; rows separated by 1px `line` top rules only.
`WhyUs` remains reusable (our-story passes `label`).

### 4.10 09 — The circle — ivory → footer
Rule-separated from Why us. Centre-weighted but flush-left: `.h2` circle.headline cols 1–8;
cols 1–6 body + `circle.notes` as `FactList` (labelWidth 130); cols 8–12 `NewsletterForm`
(large variant: input `.h5` serif placeholder, `ink` submit). `py-section-sm`. Footer (forest-deep)
follows directly — page ends dark.

Ground sequence check: photo → ivory → forest → ivory → panel → stone → ivory → forest → ivory → ivory(rule) → forest-deep. ✔

---

## 5. Page templates

Shared skeleton for internal pages: one hero type (photo or typographic), max one numbered
rail, one dark section, closing `DarkCta`. Siblings, never twins — each page's signature
block is named below.

### 5.1 `/journeys` — discovery
1. `PageTitle variant="split"`: kicker "Journeys", `.page-title` "A short list, on purpose." cols 1–8, standfirst cols 9–12 baseline-aligned. Ivory.
2. **Globe band** (signature): full-bleed `forest-deep`, height `clamp(420px, 56vw, 720px)`; globe right-weighted (cols 5–12), left cols 1–4: kicker "Where we go", list of live journeys (`.h5` title + region kicker) that highlight their globe pin on hover/focus and vice-versa. Mobile: globe 1/1 square, list below. Globe dots: `acqua`; land: `on-dark` at 12%; active pin: brass.
3. **Filters**: sticky bar (`top: var(--nav-h)`, `bg-panel/95` + blur, bottom rule), four groups as existing `fieldset`s in one row (desktop) / a "Refine" disclosure (mobile, `<details>` styled) showing groups stacked. Count + "Clear" (`acqua-text`) right. Toggles keep `toggle-link`.
4. **Results**: `JourneyRow` editorial rows, alternating image side (even rows image right). Image `4/5` cols 1–6 (or 7–12), text 6 cols vertical-centred: status tag, kicker (country · days · departure), `.h3` title, `.lead`, blurb, MetaItems (group, hosted by Marc when true), "From {priceFrom} per person", `rule` arrow "View the journey". Rule between rows. Filter change: rows fade 250ms (no layout animation).
5. **Empty state**: existing copy; ivory, `editorial-grid--wide`, `.h4`, `rule` "Clear filters" + `rule` "Ask about private travel" → `/plan#private`.
6. `DarkCta` forest (existing copy "Or a journey with only your names on the list.").

### 5.2 `/journeys/[slug]` — journey
1. **Hero** (photo): `heroMedia`/`listMedia`, `h-[92svh]`; bottom-left `.display` title (cols 1–9), `kicker` region · country above; bottom-right `.lead` journey.lead (cols 9–12). Status tag top of copy.
2. **Facts** bar: ivory, a 6-cell ruled row (desktop 6 cols, mobile 2×3): Days, Departure window, Group (≤ groupMax), From (price), Hosted by Marc (if true), Status. `MetaItem` with value in `.h5` serif. One primary `forest` button "Enquire" → `#enquire`; nothing else.
3. **Overview**: `overviewHeadline` `.h2` cols 1–8; `overview[0]` `.lead` cols 2–7, `overview[1]` `prose-body` cols 8–12 offset down 96px.
4. **Why this journey**: split, Frame `why.media` `4/5` cols 1–6 (parallax 30); right cols 7–12: `.h3` why.headline, highlights as numbered list (serif `01` acqua-text, `.h5`, body-sm).
5. **Itinerary** (signature): existing `ItineraryRail` sticky left 3 cols (day list, marker), days right 9 cols. Each day: `kicker` "Day 0n · where", `.h4` title, Frame `3/2` (odd) / `4/5` at 6 cols beside text (even) — vary, `prose-body`, MetaItems Stay / Free time. Panorama break after the middle day: `g1` 21/9 full-bleed.
6. **Where you stay**: each hotel a split spread, alternating; Frame `4/5` 6 cols, text: place kicker, `.h3` name, nights, why, MetaItems detail/nearby. Ivory.
7. **On pacing**: `charcoal` ground; `pacing.media` 16/9 full-bleed top, then `.h2` headline cols 1–6, body cols 7–11, stats as `.numeral` values with kicker labels in a 3-col row.
8. **Practicalities**: ivory, two columns: "Included" `FactList labelWidth=200`, "Not included" paragraph + booking terms link (`/booking-terms`).
9. **From Marc**: stone ground; `.quote` marc.quote cols 1–8, note + role cols 9–12, small Tick.
10. **Gallery**: 12-col mosaic, gap 8px: `span:'wide'` → 8 cols, `'single'` → 4 cols; `height:'tall'` → ratio 4/5 (single) or 16/10 (wide), `'short'` → 1/1 (single) or 16/9 (wide). Mobile: 2-col, wide spans 2.
11. **Guests**: render only quotes with `verified: true` (none today → section absent).
12. **Related journeys**: "Also on the list" — 2 other live journeys (same `inspire` first, else next by departure), as compact rows: Frame `3/2` 4 cols + `.h4` + kicker + link. Agent 6 to expose `relatedJourneys(slug, n=2)`.
13. **Enquiry** `#enquire`: forest ground, `.h2` "Tell us a little. We’ll call you, not the other way round." (existing /plan string) cols 1–5, `EnquiryForm` (dark variant) cols 7–12, journey preselected.
**In preparation state** (no `detail`): Hero + Facts as above; then ivory block: status tag "In preparation" (acqua-text kicker with Tick), `.h2` journey.lead, blurb `prose-body`; if `itinerary` exists: compact day list (`kicker` Day n · where, `.h5` title, body-sm, no images except every third day `3/2` at 4 cols); then Enquiry block with heading "Register interest" (use existing InPreparation strings where present). No gallery, no pacing, no fake sections.
Sold-out/waitlist/past: status tag in hero + Facts; Enquiry heading switches to existing waitlist copy; never hide the page.

### 5.3 `/destinations`
Photo hero (`tr-3`, existing headline) → "The map" statement (`.h2` existing, ivory, Tick) →
**signature: country chapters** — each of the four countries as a chapter: country name in
`.display`-sized serif (clamp 56–120px) cols 1–7, its journeys listed cols 8–12 as text links
(`.h5` title + days kicker), one Frame per chapter alternating `21/9` full-bleed and `4/5` 6-col
(media from each journey's `listMedia`) → the Peaks → Shores block reused in compact form
(headline + 4 frames in an even 4-col strip, forest) → `DarkCta`.

### 5.4 `/experiences`
`PageTitle variant="stacked"` (title cols 1–10, standfirst below cols 1–5). **Signature: five
chapters**, alternating composition per index: (0) Frame 4/5 left 7 cols + text right; (1)
text left 5 cols + Frame 3/4 right 5 cols offset down 120px; (2) panorama 21/9 full-bleed with
text below in cols 3–9; (3) as (0) mirrored; (4) as (1) mirrored. Each: `kicker` "0n —
Experience", `.h2` title (one word, large), body as `.lead`. Anchors `#taste` etc. kept.
`DarkCta` charcoal (existing copy).

### 5.5 `/our-story`
Photo hero split: Frame `tr-1` cols 1–7 full-height; ivory text cols 8–12 (existing `.h2`
hero line). → Founder narrative (`founder.body`, `.lead` first paragraph, portrait on stone) →
"Why it exists" split (existing) → **signature: Peaks → Shores timeline** as a horizontal ruled
line with the four frames' labels as stops (text only, `kicker` n + `.h5` label; no new facts)
→ How we travel: four pillars as a 2×2 typographic grid with large serif numerals (no images)
→ `WhyUs label="Why travel with us"` → `DarkCta`.

### 5.6 `/journal`
`PageTitle variant="split"`. Category list as a single ruled line of `kicker` items (not links,
existing behaviour). **Signature: magazine layout**: entry 1 lead (Frame 16/10 cols 1–8, text
cols 9–12); entries 2–4 in a 3-col row with ratios 4/5, 1/1, 4/5. Every draft shows a `StatusTag
status="draft"` ("In preparation") and is **not a link**; image at 85% opacity + `grayscale(.25)`.
Category kicker + date. Then Circle block (existing) on panel.

### 5.7 `/plan`
`PageTitle variant="split"` → Private travel (stone ground, split, existing copy + Tick) →
Upcoming departures as a **ledger table** (`<table>` semantics on desktop: Journey · Window ·
Days · Group · From · Status; stacked rows on mobile) → Enquiry on forest (headline cols 1–5,
form cols 7–12). Form fields: `field-rule` lines, labels `kicker-sm`, inputs `prose-body` 17px,
selects as rule + chevron 1px, party toggles `toggle-link`. Errors use `#8a3b2e` (`--color-error` new, 6.6:1 on ivory; on forest use `#e8a594`) + text,
never colour alone.

### 5.8 `/links`
Mobile-first single column max 520px centred: logo, `.h3` "Fewer, better journeys.", list of
links as full-width rows (`.h5` serif + arrow, 1px rules, 64px min height), one featured
journey Frame 4/5 at top. Ivory. No footer changes.

### 5.9 Legal (`privacy`, `terms`, `cookies`, `booking-terms`) and `/credits`
`LegalPage`: `.page-title` at h2 size, draft notice (when `site.legalDraft`) as a panel band
with Tick. Body: 2 columns desktop — sticky TOC cols 1–3 (`kicker-sm` links), text cols 5–11
`.measure`, `h2` → `.h5`, paragraphs `.prose-body`. Credits: ledger table, `prose-body-sm`.

### 5.10 404 / error
404: ivory, `.h1` existing copy cols 1–9, `rule` links to Journeys and Home, small Frame
`tr-2` 3/4 at cols 10–12 (desktop only). Error: `charcoal` ground, `.h2` existing copy, `light`
"Try again" button + `rule` home. No preloader interplay.

---

## 6. Shared primitives Agent 5 must provide

(Existing names reused; additive props; defaults preserve current behaviour.)

| Primitive | File | Props / spec |
| --- | --- | --- |
| `Section` **new** | `ui/Section.tsx` | `ground?: 'ivory'\|'panel'\|'stone'\|'forest'\|'forest-deep'\|'charcoal'` (default ivory); `pad?: 'section'\|'section-sm'\|'none'`; `rule?: boolean` (top rule inside container); `contained?: boolean` (default true → `.container-site`); `as`, `id`, `className`, `aria-*`. Dark grounds render through `Ground` (develop-in) and set `data-tone="dark"` so children pick dark variants via CSS |
| `Container` **new** | `ui/Section.tsx` | `.container-site` wrapper |
| `SectionLabel` | `ui/Editorial.tsx` | add `tone: 'light'\|'dark'\|'stone'` |
| `PageTitle` | `ui/Editorial.tsx` | add `variant?: 'split'\|'stacked'` (split default = new 8/4 layout) |
| `PhotoHero` **new** | `ui/PhotoHero.tsx` | `media`, `kicker?`, `title: string \| {text, italic?}[]` (TextReveal lines), `titleSize?: 'h1'\|'display'\|'h2'`, `lead?`, `aside?: ReactNode`, `layout?: 'bleed'\|'split'`, `height?: 'full'\|'tall'`; sets `data-hero`; header transparency still driven by `isHeroRoute` (Agent 6) |
| `Button` / `ButtonLink` | `ui/Button.tsx` | variants `ink`, `forest`, `light`, `outline`, `outline-dark`, `rule`, `rule-dark`; `arrow?: boolean` |
| `Frame` | `ui/Frame.tsx` | add `ratio?: '21/9'\|'16/9'\|'16/10'\|'3/2'\|'4/3'\|'1/1'\|'4/5'\|'3/4'\|'2/3'` (sets `aspect-ratio`; className heights still allowed), `caption?: ReactNode` (renders `<figure>/<figcaption>` below, `kicker-sm`), `tone?: 'light'\|'dark'` for caption colour |
| `Rail` **new** | `ui/Rail.tsx` (client) | `items: ReactNode[]`, `itemClassName`, `label` (aria), `tone`; native scroll-snap, prev/next buttons, keyboard focusable region, no autoplay |
| `StatusTag` **new** | `ui/StatusTag.tsx` | `status: 'open'\|'waitlist'\|'sold-out'\|'past'\|'new'\|'preparation'\|'draft'`, `tone`; text from `journeyLabel()` where applicable, `kicker-sm` + 6px square brass/acqua marker |
| `Quote` **new** | `ui/Editorial.tsx` | `children`, `cite?`, `tone`; `.quote` + 48px brass rule |
| `FactList`, `MetaItem` | `ui/Editorial.tsx` | add `tone` to FactList; values use `.meta`; MetaItem `size?: 'sm'\|'serif'` (serif = `.h5` value for Facts bars) |
| `DarkCta` | `ui/DarkCta.tsx` | add `ground?: 'forest'\|'charcoal'` (default forest), `media?: MediaKey` (optional 16/9 frame above), new layout headline cols 1–7 / body+button cols 8–12 |
| `NewsletterForm` | `ui/NewsletterForm.tsx` | `variant?: 'compact'\|'large'\|'dark'` (keep `compact` prop working) |
| `Reveal`, `RevealGroup/Item`, `TextReveal`, `Tick`, `Ground` | motion/ui | unchanged APIs; new timings from `motion.ts` |
| Global classes | `globals.css` | `.container-site`, `.grid-site`, `.measure` (62ch), `.measure-lead` (34ch), `.quote`, `.numeral`, `.meta`, spacing tokens `section/section-sm/block/stack`, colour tokens §2.1, `.prose-link` (inline link style §2.6) |
| `EnquiryForm` dark variant | Agent 4 owns (journeys/**) | uses `field-rule` on `line-dark`, labels `on-dark-muted` |

Agents 3/4: if you need something not in this table, use Tailwind utilities + tokens locally
and leave a `// TODO(agent5): promote` comment; do not add global CSS.

---

## 7. File ownership map (next wave)

- **AGENT 5 — Design System/Motion:** `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/**`, `src/components/motion/**`, `src/components/ui/**`, `src/lib/motion.ts`, `src/app/not-found.tsx`, `src/app/error.tsx`, legal pages (`src/app/{privacy,terms,cookies,booking-terms}/page.tsx`), `src/app/credits/page.tsx`. Also updates README design-system section at end.
- **AGENT 3 — Homepage:** `src/app/page.tsx`, `src/components/home/**`.
- **AGENT 4 — Internal pages:** `src/app/{journeys,destinations,experiences,our-story,journal,plan,links}/**`, `src/components/journeys/**`, new `src/components/pages/**` if needed.
- **AGENT 2 — Photography:** `public/images/**`, `public/brand/**` (light logo), `src/lib/media.ts`, `src/lib/media.generated.ts` (generated), `PHOTOGRAPHY-BRIEF.md`, `scripts/fetch-stock.mjs`, `scripts/contact-sheet.mjs`.
- **AGENT 6 — Architecture:** `src/lib/**` (except `media*`), new `src/lib/content/**` provider, `src/app/api/**`, `sitemap.ts`, `robots.ts`, `llms.txt`, `next.config.mjs`.
- **AGENT 1:** `docs/redesign/**` only.

Shared rule: only Agent 5 adds global CSS classes / shared ui primitives. Agents 3/4 consume §6.

### Cross-agent requests
- **Agent 5 first, fast:** land tokens, fonts, type classes and the §6 primitive *signatures* (even if internals are minimal) in the first commit so 3/4 can compile against them. Keep old class names working (`.editorial-grid`, `kicker`, `h1–h5`, `bg-ink`).
- **Agent 6:** add `verified?: boolean` to journey `quotes` (all current = false/undefined); add `relatedJourneys(slug, n)`; keep `isHeroRoute` in sync if a page gains/loses a photo hero (`/our-story`, `/destinations`, `/journeys/[slug]` stay photo heroes; `/` too). Don't change content strings.
- **Agent 2:** priority slots by visibility: `home-hero*`, `tr-1..4`, `feat-1..3`, `pillar-1..4`, `ex-1..5`, `hotel-1..3`, `am-*`, `g1..g5`, `jl-1..5`, `jn-1..4`. Art direction: natural light, low saturation, warm highlights, cool shadows, no people facing camera, horizons low; landscape-orientated sources must survive a 4/5 and 3/4 crop. Supply `logo-light.png`. Record ratio needs from §2.5 in the brief.
- **Agents 3/4:** no arbitrary `text-[Npx]`/`h-[Npx]` for type and images — use classes/`ratio`. Every new `'use client'` component justifies itself; sections stay server components where possible.

### Acceptance checks (all agents)
`npm run typecheck && npm run lint && npm run build` clean; no horizontal scroll at 360px;
text contrast per §2.1; every animated element has a reduced-motion rule; LCP element is the
hero image or CSS-animated headline (no JS-gated LCP); keyboard focus visible on all grounds.
