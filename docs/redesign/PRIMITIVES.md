# Shared primitives — reference (Agent 5)

Implements DESIGN-SPEC §2 and §6. Everything here is live on `redesign/luxury-editorial`.
Old class names and props keep working. Need something that isn't here? Use Tailwind
utilities and tokens locally and leave a `// TODO(agent5): promote` comment. Don't add global CSS.

## Tokens (Tailwind utilities)

Colours: `ivory panel stone stone-text ink body muted forest forest-deep charcoal on-dark
on-dark-body on-dark-muted acqua acqua-deep acqua-text gorse error error-dark line line-dark
tone-stone tone-sand tone-slate`. So you get `bg-forest`, `text-acqua-text`, `border-line-dark`
and so on. `bg-ink` still exists, but use `forest` or `charcoal` for dark grounds.

- Acqua (`#8cc2b8`) can be text on dark grounds only. On light grounds use `acqua-text` for
  text and `acqua-deep` for hairlines.
- Gorse (brass) is never text on a light ground.
- Errors use `text-error` on light and `text-error-dark` on dark, always with words, never colour alone.

Spacing: `py-section` (96–192px), `py-section-sm` (64–128px), `mb-block`/`gap-block`
(40–80px), `gap-stack` (24px), `px-gutter` (the responsive outer margin), `gap-grid-gap`.
Fonts: `font-display` (Cormorant Garamond), `font-ui` (Manrope).

## Global classes (`globals.css`)

| Class | Use |
| --- | --- |
| `.container-site` | max 1680px, centred, includes the gutter (20/40/56/72px). All text lives inside one |
| `.grid-site` | 4 cols (<768), 8 cols (≥768), **12 cols (≥1024 = Tailwind `lg:`)**. Place with `col-span-*`/`col-start-*`. Phone/tablet: use `col-span-full` |
| `.gutter` | the outer margin only (legacy, still valid) |
| `.measure` / `.measure-lead` | 62ch / 34ch max-width |
| `.display .h1 .page-title .h2 .h3 .h4 .h5` | serif headings (500; h5 600), lining numerals, balanced |
| `.lead` | italic serif standfirst, one per block |
| `.quote` | italic serif pull quote (prefer `<Quote>`) |
| `.numeral` | big serif stat / index number |
| `.prose-body` / `.prose-body-sm` | Manrope 400 body, 16–17px / 15px (meta-level copy only; hotel `why`, pillar bodies and journey blurbs use `.prose-body`) |
| `.kicker` / `.kicker-sm` / `.nav-label` | caps labels (10.5px minimum) |
| `.meta` | 13.5px values (replaces `text-[13px]`/`[14px]`) |
| `.link-rule` | the hairline link (= `<ButtonLink variant="rule">`) |
| `.prose-link` | inline link inside prose |
| `.rule` / `.rule-dark` | 1px top border |
| `.toggle-link`, `.field-rule`, `.rail-marker`, `.frame-zoom`, `.card-cta`, `.btn` | unchanged roles. `.card-cta` is now always visible |
| `.editorial-grid`, `.editorial-grid--wide` | legacy. Use at most once per internal page; not on the homepage |

Italic headline words go in `<span className="italic font-normal">…</span>`.

**Tone-aware CSS.** Anything inside `[data-tone="dark"]` (which `Section` sets on dark
grounds) or `.bg-forest`, `.bg-forest-deep` or `.bg-charcoal` picks up the dark treatment:
`.kicker` and `.kicker-sm` go on-dark-muted, `.prose-body*` goes on-dark-body, `.link-rule`
goes on-dark with an acqua line, and `.field-rule`, `.toggle-link`, `.prose-link` and focus
rings switch to acqua. `[data-tone="stone"]` turns kickers to stone-text. `[data-tone="light"]`
resets everything for a paper island inside a dark one. Utility colours on the element itself
always win.

## Components

All paths are under `@/components/…`. Unless marked *(client)*, they are server-safe.

### `Section`, `Container`: `ui/Section`
```tsx
<Section ground="forest" pad="section" rule={false} contained id="experiences" aria-labelledby="ex-h">
  <div className="grid-site">…</div>
</Section>
```
- `ground`: `'ivory'` (default), `'panel'`, `'stone'`, `'forest'`, `'forest-deep'` or `'charcoal'`.
  Dark grounds render through `Ground` (they develop from the paper on arrival) and set `data-tone="dark"`.
- `pad`: `'section'` (default), `'section-sm'` or `'none'`. `rule` draws a top line inside the container (use it between two light sections).
- `contained` defaults to true and wraps children in `.container-site`. Pass `false` for full-bleed, then use `<Container>` for the text.
- Other props: `as` (section, div, aside, article, footer), `id`, `className`, `innerClassName`, `style`, `aria-label`, `aria-labelledby`.
- `<Container className as id>` is a plain `.container-site` wrapper.

### `PhotoHero`: `ui/PhotoHero`
```tsx
<PhotoHero media="tr-3" kicker="Destinations" title={[{ text: 'Where we go,' }, { text: 'and why.', italic: true }]}
  titleSize="h1" lead="…" aside={<ButtonLink href="/journeys" variant="light" arrow>Explore</ButtonLink>}
  layout="bleed" height="full" />
```
- `title` is a string or `{text, italic?}[]` lines. The CSS line-rise uses lines 90ms apart and no JS, so it is LCP-safe.
- `titleSize`: `'h1'`, `'display'` or `'h2'`. `height`: `'full'` (100svh, min 600/640) or `'tall'` (92svh, min 620).
- `layout="bleed"`: a full-bleed photo with the hero overlay. The title sits in cols 1–8 and the lead/aside in cols 9–12. It sets `data-hero` and `data-tone="dark"`.
- `layout="split"`: the photo takes cols 1–7 and paper text takes cols 8–12. It sets **no** `data-hero`, so the header goes solid, and the text pads below the nav.
- Header transparency also needs the route listed in `isHeroRoute` (`src/lib/site.ts`, Agent 6).
- Other props: `drift`, `sizes`, `className`, `id`.

### `Button`, `ButtonLink`, `Arrow`: `ui/Button`
```tsx
<ButtonLink href="/plan" variant="forest" arrow>Plan your journey</ButtonLink>
<Button type="submit" variant="ink" aria-disabled={sending}>Send</Button>
```
- `variant`:
  - `'ink'` (default): light ground, hovers to forest.
  - `'forest'`: the primary CTA on light grounds.
  - `'light'`: on photos or dark grounds.
  - `'outline'`: inherits the current colour and fills with ink.
  - `'outline-dark'`: fills with ivory.
  - `'rule'`: the hairline link. It switches to dark colours automatically inside dark grounds or a hero.
  - `'rule-dark'`: forces the dark treatment.
- `arrow` appends a 1px → that nudges 4px on hover. Disabled buttons (`disabled` or `aria-disabled`) fade to 40% and don't lift.
- All buttons are at least 44px tall. `className` is appended.
- `<Arrow className>` is the bare SVG, for custom links (add `group` to the parent and it nudges too).

### `Frame` *(client)*: `ui/Frame`
```tsx
<Frame media="feat-1" ratio="4/5" hover sizes="(min-width:1024px) 58vw, 100vw" />
<Frame media="tr-1" ratio="2/3" caption={<>01 · <span className="h5">Alps</span></>} tone="dark"
  className="lg:col-span-3" frameClassName="" />
```
- Existing props are unchanged: `media`, `priority`, `warm`, `sizes`, `fit`, `reveal`, `className`, `overlay` (`none`, `hero`, `caption`; both scrims are now forest-tinted), `hover`, `parallax`, `drift`, `decorative`.
- New props:
  - `ratio`: `'21/9'`, `'16/9'`, `'16/10'`, `'3/2'`, `'4/3'`, `'1/1'`, `'4/5'`, `'3/4'` or `'2/3'`. Use it instead of `h-[Npx]`, and don't combine it with a fixed height.
  - `caption`: wraps the frame in `<figure>` with a `kicker-sm` `<figcaption>` below. `className` then goes on the figure and `frameClassName` on the picture box. With `hover`, a 36px acqua caption rule draws in on group hover.
  - `tone`: `'light'` or `'dark'`, the caption colour.
  - `ground`: `'tone'` (default, the slot's tone) or `'transparent'` (the section's ground shows through; no curtain, the picture fades in). Use it for the cut-out portrait on stone instead of `!bg-transparent` + `reveal={false}`.
  - `grade`: the house colour grade (`--photo-grade`: saturate .86, contrast .97, brightness 1.01). It's on by default; it's off for `marc-portrait` and `fit="contain"`. Pass `grade={false}` for brand artwork.
- `overlay="hero"`: bottom .78→0 over 62%, left .45→0 over 55%, top .28→0 over 22%.
- Timing: curtain 1.2s, settle 1.04→1 over 1.6s, hover zoom 1.035 over 1s. Parallax goes only on the home hero, P2S frames and one panorama per page (max ±40px).

### `Rail` *(client)*: `ui/Rail`
```tsx
<Rail label="Experiences" tone="dark" bleed="right" items={experiences.map((e) => <ExperienceItem key={e.slug} {...e} />)}
  itemClassName="w-[clamp(260px,28vw,420px)]" />
```
- It uses native horizontal scroll with snap. The track is a focusable `role="region"` with your `label`.
- Prev/next are 44px square buttons in a `.container-site`, aligned right below the track. They scroll by one item and disable at the ends.
- `bleed="right"` starts the rail at the container's left edge and bleeds it off the right, so render it **outside** a container (`Section contained={false}`).
- `controls`: `after` (default) or `before` — the previous / next buttons above the track, first in keyboard order too.
- Other props: `className`, `controlsClassName`.

### `StatusTag`: `ui/StatusTag`
```tsx
<StatusTag status="waitlist" />  <StatusTag status="draft" tone="dark" />
```
- `status`: `'open'`, `'waitlist'`, `'sold-out'`, `'past'`, `'new'`, `'preparation'` or `'draft'`.
- Labels come from `journeyLabel()`: Waitlist, Sold out, Departed, New. Preparation and draft show "In preparation".
- `open` has no label, so it renders nothing unless you pass `children`.
- It shows a 6px square (acqua for open/new, brass for pending, muted for closed) plus `kicker-sm`. Other props: `tone`, `className`.

### `SectionLabel`, `MetaItem`, `PageTitle`, `FactList`, `Quote`, `Tick`: `ui/Editorial`
- `SectionLabel {children, tone?: 'light'|'dark'|'stone', as?, id?, className?, style?}`: the kicker that goes **above** a headline.
- `MetaItem {label, children, tone?, size?: 'sm'|'serif'}`. The value uses `.meta`; with `serif` it uses `.h5`, for the journey Facts bar.
- `PageTitle {kicker, title, children?, variant?: 'split'|'stacked', className?}`.
  - `split` (default): title cols 1–8, standfirst cols 9–12.
  - `stacked`: title cols 1–10, standfirst below in cols 1–5.
  - It renders its own `<section class="container-site">` with CSS entrance.
- `FactList {rows, labelWidth?: 120|130|200, tone?, className?, rowClassName?}`: values use `.meta`.
- `Quote {children, cite?, tone?, className?}`: a 48px brass rule, then `.quote` and an optional `kicker-sm` cite. Don't use it for unverified guest quotes.
- `Tick {className?}`: the brass 1px mark, which draws inside a Reveal.

### `DarkCta`: `ui/DarkCta`
```tsx
<DarkCta kicker="Private travel" headline="…" body="…" href="/plan#private" cta="Ask about private travel"
  ground="charcoal" media="g3" />
```
- `ground`: `'forest'` (default) or `'charcoal'`.
- `media`: optional 16/9 frame above.
- Layout: headline cols 1–7, body and light arrow button cols 8–12. Other props: `id`.

### `NewsletterForm` *(client)*: `ui/NewsletterForm`
- `variant`: `'compact'`, `'large'` (default) or `'dark'`.
  - `large` sets the serif field at h5 size with an ink submit.
  - `dark` is for forest grounds.
  - The legacy `compact` boolean still works.
- It handles `{delivered:false}` honestly (offers the email address) and includes the `website` honeypot. Prop: `className`.

### `LegalPage`, `legalRobots`: `ui/LegalPage`
`{title, intro, updated, sections: {heading, body[]}[]}`. It renders a sticky TOC and the draft notice (from `site.legalDraft`). `legalRobots` keeps draft legal pages noindex.

### Motion: `motion/*`
- `Reveal {variant?: 'fade'|'scale'|'mask', direction?, delay?, distance? (default 16), amount?, as?}`. Use `variant="mask"` for **section headlines only**, once per section. Body and meta blocks get `delay={0.1}`.
- `RevealGroup {stagger? (default 0.06), delay?, as?, amount?}` + `RevealItem`. The stagger is capped in `staggerParent`: item 7 onward arrives with item 6.
- `TextReveal {lines, as?, delay?, immediate?}`: masked lines. `immediate` gives the CSS hero version.
- `Ground {as, className, id, style, data-tone}`: the develop-in dark section (Section uses it for you).
- `@/lib/motion` exports `ease`, `duration` (`ui .25`, `uiSlow .4`, `reveal .9`, `page .6`, `signature 1.2`), `DEFAULT_DISTANCE`, `stagger` (`list .06`, `lines .09`), `heroTiming` (`kicker .05`, `firstLine .12`, `lead .45`, `actions .55`) and `enterAt(s)` (style for a CSS `.enter` delay).
- Anything that moves must be `m.*` (LazyMotion strict). Never branch markup on reduced motion; add a rule to the reduced-motion block in `globals.css` instead (ask Agent 5).

### Layout chrome (Agent 5 only)
`Header`, `MobileMenu`, `Footer` (forest-deep, opens on a `line-dark` rule; its journal sign-up is swapped for a "Plan your journey" link on `/` and `/journal*`, which carry their own), `Preloader`, `PageTransition` and `ScrollProgress`. The layout loads nav data through `getNavigation()` and passes it down as props.
