# White Chorus — Design System

> **Direction:** Rebuild White Chorus with the visual and interaction language of the current Comotion website, while replacing Comotion's color identity with the White Chorus palette defined below.
>
> This document is an implementation specification, not a copy of Comotion's proprietary source code or assets. Recreate the observable composition, rhythm, motion language, interaction patterns, and art direction using original White Chorus assets and content.

---

## 1. Design North Star

White Chorus should feel like an **interactive editorial poster that happens to be a dress-up experience**.

The interface must not look like a SaaS dashboard, e-commerce catalog, or conventional game UI. The core visual language is:

- editorial composition
- oversized expressive typography
- strong geometric grid underneath freeform artwork
- bento-like sections with intentionally varied scale
- oversized organic SVG shapes
- hand-drawn / doodle accents
- playful but controlled asymmetry
- bold section-to-section color blocking
- motion-led storytelling
- responsive elements that react to pointer and scroll
- minimal chrome around content
- large rounded panels rather than small generic cards
- text used as a graphic element
- intentionally unexpected transitions

### 1.1 Product translation

The Comotion language should map to White Chorus as follows:

| Comotion pattern | White Chorus interpretation |
|---|---|
| Editorial hero | Character + outfit composition becomes the hero artwork |
| Work/project cards | Outfit collections / Hall of Fame submissions |
| Organic illustration | Fashion silhouettes, ribbons, threads, stars, scribbles, fabric waves |
| Service bento | Wardrobe category selector / dress-up controls |
| Full-screen menu | Full-screen White Chorus navigation scene |
| Project hover | Outfit / submission preview reaction |
| Large CTA sections | Save Look / Enter Hall of Fame / Start Dressing |
| Decorative doodles | Thread strokes, bows, hearts, sparkles, stitches, music marks |

### 1.2 Hard rules

Do **not** introduce unrelated aesthetics such as:

- glassmorphism-heavy cards
- generic Tailwind dashboard layouts
- neon cyberpunk styling
- excessive gradients
- tiny cards with repeated shadows
- standard centered SaaS hero sections
- generic pill buttons everywhere
- animation on every element just because it is possible

The experience should feel **composed**, not decorated.

---

# 2. Color System

## 2.1 Source palette

Use this palette as the single source of truth.

```css
:root {
  /* Background */
  --color-background: #FDF6EC;
  --color-background-secondary: #FCEFDF;
  --color-surface: #FDFAF9;

  /* Text */
  --color-text-primary: #324271;
  --color-text-secondary: #6F7E9A;
  --color-text-dark: #2C2E34;

  /* Brand */
  --color-primary: #6F7E9A;
  --color-primary-dark: #415886;

  /* Secondary */
  --color-secondary: #7CBFBD;
  --color-secondary-light: #B0E4E9;

  /* Accent */
  --color-accent: #FEBB75;
  --color-accent-dark: #BF6553;
  --color-pink: #DFBFC6;

  /* Neutral */
  --color-muted: #B2BAC9;
  --color-border: #72727D;
}
```

## 2.2 Semantic tokens

Do not use raw hex values throughout components. Map them to semantic tokens.

```css
:root {
  --bg-page: var(--color-background);
  --bg-soft: var(--color-background-secondary);
  --bg-card: var(--color-surface);

  --fg-heading: var(--color-text-primary);
  --fg-body: var(--color-text-dark);
  --fg-muted: var(--color-text-secondary);

  --brand-base: var(--color-primary);
  --brand-strong: var(--color-primary-dark);

  --accent-aqua: var(--color-secondary);
  --accent-aqua-soft: var(--color-secondary-light);
  --accent-orange: var(--color-accent);
  --accent-rust: var(--color-accent-dark);
  --accent-pink: var(--color-pink);

  --line-default: var(--color-border);
  --line-soft: color-mix(in srgb, var(--color-border) 28%, transparent);
}
```

## 2.3 Color distribution

Avoid using every accent in the same viewport. Each section should have one dominant visual pairing.

Recommended distribution:

- 50–60% cream / off-white backgrounds
- 15–20% primary blue-grey
- 10–15% aqua
- 5–10% orange
- 5–10% pink / rust accents

Suggested section combinations:

```text
Cream        + Blue text       + Orange accent
Soft cream   + Dark blue       + Aqua artwork
Primary      + Cream text      + Aqua-light accent
Aqua         + Dark text       + Pink accent
Orange       + Dark blue text  + Cream surface
Pink         + Dark blue text  + Rust accent
```

## 2.4 Color blocking

Large sections may switch background color abruptly. Prefer clean color changes over soft gradients.

Good:

```text
cream → primary → cream → aqua → soft cream
```

Avoid:

```text
cream gradient → pink gradient → blue gradient → aqua gradient
```

Gradients are reserved for small decorative artwork, image overlays, or subtle atmospheric surfaces.

---

# 3. Typography

## 3.1 Typeface

Use **Manrope** as the primary UI/display typeface.

```css
font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;
```

Fallbacks must remain clean and geometric.

Optional editorial accent only if an existing White Chorus brand font already exists. Do not add a second font merely for decoration.

## 3.2 Typography philosophy

Typography is part of the composition.

Headings should:

- occupy substantial screen area
- wrap intentionally
- sometimes span 60–90% of the viewport width
- use tight leading
- use fluid sizing
- create tension with illustrations
- occasionally overlap decorative graphics, never body text

Body text should remain highly readable and restrained.

## 3.3 Fluid scale

```css
:root {
  --text-xs: clamp(0.72rem, 0.69rem + 0.12vw, 0.82rem);
  --text-sm: clamp(0.84rem, 0.80rem + 0.16vw, 0.95rem);
  --text-base: clamp(0.98rem, 0.93rem + 0.20vw, 1.12rem);
  --text-lg: clamp(1.15rem, 1.05rem + 0.42vw, 1.42rem);
  --text-xl: clamp(1.45rem, 1.25rem + 0.85vw, 2rem);
  --text-2xl: clamp(2rem, 1.55rem + 1.8vw, 3.25rem);
  --text-3xl: clamp(2.8rem, 1.9rem + 3.5vw, 5.8rem);
  --text-display: clamp(3.8rem, 2rem + 7vw, 9.5rem);
}
```

## 3.4 Roles

### Display

```css
font-size: var(--text-display);
font-weight: 600;
line-height: 0.88;
letter-spacing: -0.055em;
```

### H1

```css
font-size: var(--text-3xl);
font-weight: 600;
line-height: 0.94;
letter-spacing: -0.045em;
```

### H2

```css
font-size: var(--text-2xl);
font-weight: 600;
line-height: 1;
letter-spacing: -0.035em;
```

### H3

```css
font-size: var(--text-xl);
font-weight: 600;
line-height: 1.08;
letter-spacing: -0.025em;
```

### Body Large

```css
font-size: var(--text-lg);
line-height: 1.45;
letter-spacing: -0.01em;
```

### Body

```css
font-size: var(--text-base);
line-height: 1.55;
```

### Label

```css
font-size: var(--text-xs);
font-weight: 700;
line-height: 1;
letter-spacing: 0.08em;
text-transform: uppercase;
```

## 3.5 Heading composition

Use controlled line breaks on large screens.

Example:

```text
Dress the
chorus your way.
```

Do not hard-code the same line breaks on mobile.

---

# 4. Spatial System

## 4.1 Base unit

Use a 4px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
--space-40: 160px;
```

## 4.2 Section spacing

Desktop sections should feel generous.

```css
--section-y: clamp(72px, 9vw, 160px);
--section-y-large: clamp(110px, 14vw, 240px);
```

Do not compress the design merely to show more content above the fold.

## 4.3 Page gutter

```css
--page-gutter: clamp(16px, 3vw, 48px);
```

Maximum content width:

```css
--container-max: 1600px;
```

Most major sections:

```css
width: min(calc(100% - (var(--page-gutter) * 2)), var(--container-max));
margin-inline: auto;
```

---

# 5. Grid & Layout

## 5.1 Master grid

Desktop:

```text
12 columns
24–32px gutters
fluid outer gutter
```

Tablet:

```text
8 columns
20–24px gutters
```

Mobile:

```text
4 columns
12–16px gutters
```

## 5.2 Composition rules

The underlying grid must be strict; visible elements may intentionally break it.

Allowed:

- artwork crossing two columns
- heading extending beyond its text column
- decorative SVG partially outside a section
- cards with varying heights
- overlapping layers where readability is preserved

Not allowed:

- arbitrary placement without grid anchors
- random rotation of every object
- accidental misalignment

## 5.3 Bento rhythm

Use asymmetric blocks such as:

```text
┌───────────────────────┬──────────┐
│                       │          │
│      FEATURE          │  SMALL   │
│                       │          │
├───────────┬───────────┴──────────┤
│   SMALL   │                      │
│           │       FEATURE        │
└───────────┴──────────────────────┘
```

Never create a uniform three-column card grid when a varied composition can communicate hierarchy better.

## 5.4 Border grid motif

Thin grid lines can appear inside hero or feature panels.

```css
background-image:
  linear-gradient(to right, var(--line-soft) 1px, transparent 1px),
  linear-gradient(to bottom, var(--line-soft) 1px, transparent 1px);
background-size: clamp(56px, 7vw, 110px) clamp(56px, 7vw, 110px);
```

Keep opacity low. Grid lines are structural texture, not the focal point.

---

# 6. Shape Language

## 6.1 Organic forms

Use oversized vector forms inspired by waves, ribbons, threads, folds, and hand-drawn curves.

Preferred forms:

- S-curves
- broad ribbon waves
- imperfect circles
- looping thread lines
- hand-drawn arrows
- sparkle stars
- simple flower/bow silhouettes
- stitch patterns

## 6.2 Shape scale

Decorative artwork should often be larger than expected.

```text
small icon       → 20–40px
accent doodle    → 60–180px
section artwork  → 25–60vw
hero artwork     → 45–100vw
```

## 6.3 Stroke

```css
--doodle-stroke: clamp(2px, 0.18vw, 4px);
```

Use rounded linecaps and linejoins for hand-drawn assets.

## 6.4 Rotation

Keep most UI straight. Rotation is for decorative assets and selected image cards only.

Recommended range:

```text
-4deg to +4deg
```

Avoid random rotations beyond this unless a deliberate hero composition needs it.

---

# 7. Surface, Border & Radius

## 7.1 Radius

Compositions should feel soft but not app-like.

```css
--radius-sm: 10px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 36px;
--radius-pill: 999px;
```

Use `24–36px` mainly for major panels.

Do not give every small piece of text its own rounded container.

## 7.2 Borders

Default:

```css
border: 1px solid color-mix(in srgb, var(--color-border) 55%, transparent);
```

Strong editorial divider:

```css
border-top: 1px solid var(--color-border);
```

## 7.3 Shadows

Use shadows sparingly.

Default cards should depend on contrast, borders, scale, and motion rather than heavy shadows.

Allowed floating shadow:

```css
box-shadow: 0 18px 50px rgb(44 46 52 / 0.10);
```

---

# 8. Navigation

## 8.1 Desktop header

Header should visually disappear into the hero rather than look like a separate navbar component.

Recommended layout:

```text
[WHITE CHORUS]                         [MENU ○]
```

or

```text
[WHITE CHORUS]        [DRESS UP] [HALL OF FAME] [MENU ○]
```

Rules:

- transparent by default
- 72–96px initial height
- no boxed navigation background at page top
- links have understated type treatment
- menu trigger is visually distinct

## 8.2 Sticky behavior

After leaving hero:

- header becomes compact
- optional surface background with slight opacity
- maintain readable contrast
- motion should be a soft translate/fade, not a sudden jump

## 8.3 Full-screen menu

Menu is a **scene transition**, not a dropdown.

Structure:

```text
┌──────────────────────────────────────────┐
│ WHITE CHORUS                         X   │
│                                          │
│ 01  Dress Up                             │
│ 02  Hall of Fame                         │
│ 03  About                                │
│                                          │
│              [large animated artwork]    │
│                                          │
│ Instagram                    Sound: On    │
└──────────────────────────────────────────┘
```

Motion sequence:

1. menu panel expands / wipes across viewport
2. large decorative ribbon enters
3. navigation items reveal sequentially
4. footer meta fades upward
5. pointer hover causes nearby artwork to subtly react

Close reverses the sequence quickly.

### Menu timing

```text
panel        650–850ms
artwork      700–1000ms
nav stagger  50–80ms
close        450–650ms
```

Suggested ease:

```text
power3.inOut
expo.out
```

---

# 9. Buttons & Links

## 9.1 Primary button

Use compact editorial buttons rather than giant SaaS CTAs.

```css
.button-primary {
  min-height: 48px;
  padding-inline: 22px;
  border-radius: 12px;
  background: var(--brand-strong);
  color: var(--color-surface);
  font-weight: 700;
}
```

Hover:

- inner label moves up 100%
- duplicate label enters from below
- background shifts to aqua or rust depending on section
- optional arrow rotates / translates 4–6px

Avoid only changing opacity.

## 9.2 Text links

Default link interaction:

```text
text
────────
```

On hover:

- underline exits right
- new underline enters left
- arrow nudges diagonally

Duration: `280–420ms`.

## 9.3 Magnetic behavior

Use very subtle magnetic attraction only for:

- menu trigger
- primary CTA
- audio control
- circular icon buttons

Maximum offset:

```text
6–10px desktop
0px touch devices
```

---

# 10. Hero System

## 10.1 Hero purpose

The hero must immediately establish White Chorus as an interactive fashion playground.

It should combine:

- oversized headline
- character artwork
- one dominant organic shape
- background grid or line texture
- short explanatory surface card
- clear dress-up CTA

## 10.2 Desktop composition

Suggested composition:

```text
┌────────────────────────────────────────────────────┐
│ WHITE CHORUS                               MENU    │
│                                                    │
│ DRESS THE                                          │
│ CHORUS YOUR WAY.                                   │
│                   ╭──────── ribbon ───────╮        │
│              [character A]     [character B]       │
│                                                    │
│                              ┌──────────────────┐  │
│                              │ Mix. Match. Play.│  │
│                              │ [Start dressing] │  │
│                              └──────────────────┘  │
└────────────────────────────────────────────────────┘
```

## 10.3 Hero entrance animation

Sequence:

```text
0ms     page cover / loader exits
100ms   grid fades in
180ms   headline reveals by line
350ms   organic ribbon draws / scales in
520ms   characters rise into position
680ms   info card enters
780ms   CTA label appears
```

Total sequence should feel around `1.2–1.8s`, not sluggish.

## 10.4 Pointer response

Hero illustration may react to pointer position:

```text
background grid   2–4px
ribbon            5–10px
character layers  3–7px
foreground doodle 8–14px
```

Use spring smoothing; never map pointer position directly without damping.

---

# 11. Dress-Up Workspace

This is the functional heart of White Chorus. It should inherit the editorial visual language without compromising usability.

## 11.1 Desktop layout

Avoid a dashboard-like three-panel UI.

Preferred layout:

```text
┌──────────────────────────────────────────────────────┐
│  CATEGORY TABS                                      │
├───────────────────────┬──────────────────────────────┤
│                       │                              │
│ wardrobe cards        │       CHARACTER STAGE       │
│ horizontal /          │                              │
│ staggered             │         A       B            │
│                       │                              │
│                       │                              │
├───────────────────────┴──────────────────────────────┤
│ Randomize       Reset                Save Look →    │
└──────────────────────────────────────────────────────┘
```

The character stage is dominant. Controls visually orbit the experience rather than boxing it in.

## 11.2 Category selector

Categories use large editorial labels:

```text
TOPS / BOTTOMS / SHOES / ACCESSORIES / BACKGROUND
```

Active category:

- underline or sliding marker
- subtle color swap
- nearby decorative arrow can move

Avoid tab components that look like admin UI.

## 11.3 Outfit item cards

Item previews should feel like collectible editorial cut-outs.

Default:

- transparent or surface background
- minimal border
- generous internal whitespace
- no unnecessary item name if visual is self-explanatory

Hover:

1. card tilts max `1.5deg`
2. item scales `1 → 1.045`
3. background changes to one accent color
4. small doodle or index becomes visible

Selected:

- bold outline or inset line
- small check/star mark
- item does not dramatically shrink or jump

## 11.4 Outfit change animation

When switching an item:

```text
old item: opacity 1 → 0, scale 1 → 0.97, 120–180ms
new item: opacity 0 → 1, scale 1.04 → 1, 220–320ms
```

Avoid long crossfades. Dressing should feel immediate.

## 11.5 Character switch / dual character

When both characters are visible:

- active character gets a subtle floating marker
- inactive character remains full contrast; do not grey it out dramatically
- clicking a character makes the wardrobe target transition via a small scale + doodle indicator

## 11.6 Randomize interaction

Randomize should have a playful micro-sequence:

1. button presses inward
2. spark / thread doodle spins briefly
3. 2–4 wardrobe layers rapidly cycle
4. settle into final outfit

Keep entire sequence under `700ms`.

---

# 12. Work Grid → Hall of Fame

The Hall of Fame should borrow the asymmetric project-grid language rather than using a generic social feed.

## 12.1 Grid

Desktop pattern may cycle through:

```text
row 1:  7 columns + 5 columns
row 2:  4 columns + 8 columns
row 3:  6 columns + 6 columns
```

Every few entries, use a full-width or oversized featured winner.

## 12.2 Submission card

Content hierarchy:

```text
[look preview]

LOOK #042                       ★ 4.8
weekly winner / submitted 2d ago
```

Keep metadata visually secondary.

## 12.3 Hover interaction

On desktop hover:

- media scales 1.00 → 1.035
- card clip radius subtly changes
- title/score translate 4–8px
- a doodle arrow or star enters
- optional preview layers shift independently by 2–5px

Duration: `350–550ms`.

## 12.4 Weekly winner

Featured winner should break the grid:

- full-bleed or 8–12 column layout
- background color block
- large `WEEKLY WINNER` typography
- winner image crossing the grid
- animated star / ribbon accent

Do not make it look like a gold trophy gaming banner.

## 12.5 Rating interaction

Star rating should feel tactile.

Hover:

- stars before cursor fill
- hovered star rotates max `8deg`
- scale `1 → 1.15`

Submit:

- star briefly pops to `1.25`
- adjacent tiny sparkle appears
- score update uses number tween or crossfade

---

# 13. Cards

## 13.1 Editorial card

Cards should behave as layout blocks, not repeated components.

Properties:

```text
large radius
low/no shadow
strong image crop
asymmetric dimensions
large whitespace
simple metadata
```

## 13.2 Info card

Used for short copy inside visual compositions.

```css
background: var(--color-surface);
border-radius: var(--radius-lg);
padding: clamp(20px, 2vw, 34px);
```

It may overlap hero artwork or grid lines.

---

# 14. Images & Character Artwork

## 14.1 Crop behavior

Use strong intentional crops. Avoid generic `object-fit: cover` with random focal points.

## 14.2 Masking

Allowed masks:

- rounded rectangles
- giant pill shapes
- organic SVG clipping paths
- straight crop with decorative doodle overlay

Do not apply a different mask to every image.

## 14.3 Character rendering

Character layers should stay sharp and visually stable during motion.

Prefer transforms on containing layers rather than modifying bitmap dimensions frame-by-frame.

---

# 15. Doodles & Decorative Graphics

## 15.1 Purpose

Decorative graphics should do one of these jobs:

- guide attention
- connect two blocks
- reinforce fashion/music identity
- make transitions feel handmade
- fill deliberate negative space

If a doodle has no compositional purpose, remove it.

## 15.2 White Chorus motif library

Create original SVG motifs:

- thread-wave
- stitched-arrow
- bow-outline
- four-point-star
- six-point-sparkle
- music-note-scribble
- heart-loop
- hanger-line
- fabric-ribbon
- hand-drawn-circle

## 15.3 Draw animation

SVG line drawings can animate using stroke dash offset.

Recommended duration:

```text
500–1200ms
```

Only draw when entering the viewport or opening a scene. Do not loop line drawing endlessly.

---

# 16. Motion System

## 16.1 Motion personality

Motion should feel:

```text
playful
organic
confident
softly elastic
editorial
intentional
```

It should not feel:

```text
bouncy mobile app
hyperactive game UI
mechanical dashboard
slow cinematic portfolio
```

## 16.2 Motion tokens

```ts
export const motion = {
  duration: {
    instant: 0.12,
    fast: 0.22,
    normal: 0.4,
    slow: 0.7,
    scene: 1.0,
  },
  ease: {
    out: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
    soft: [0.16, 1, 0.3, 1],
  },
};
```

For GSAP:

```text
power2.out       local UI
power3.out       entrances
power3.inOut     scene transitions
expo.out         large artwork
sine.inOut       floating loops
```

## 16.3 Motion hierarchy

### Level 1 — Scene motion

Used for:

- route transitions
- full-screen navigation
- hero entrance
- winner reveal

Duration: `650–1200ms`.

### Level 2 — Section motion

Used for:

- scroll reveals
- image parallax
- bento block entrances
- heading reveals

Duration: `450–800ms`.

### Level 3 — Microinteraction

Used for:

- button hover
- star rating
- card hover
- item selection

Duration: `120–450ms`.

Do not use Level 1 timing for microinteraction.

---

# 17. Scroll Behavior

## 17.1 Smooth scroll

Desktop may use Lenis-style smooth scrolling.

Rules:

- retain native scroll semantics
- no excessive scroll lag
- disable/customize appropriately on touch
- ScrollTrigger or equivalent must sync correctly

## 17.2 Reveal pattern

Avoid fading every element from `y: 30`.

Use several coordinated patterns:

### Text mask reveal

```text
line clipped
text moves y: 105% → 0
```

### Image reveal

```text
clip-path inset(12% 0 0 0) → inset(0)
image scale 1.07 → 1
```

### Bento reveal

```text
blocks enter with 50–90ms stagger
alternating slight x/y offsets
```

### Doodle reveal

```text
stroke draws or shape scales 0.85 → 1
```

## 17.3 Parallax

Keep depth subtle.

Recommended scroll displacement:

```text
background artwork  40–90px
foreground doodle   25–60px
image                20–45px
text                  0–20px
```

Avoid making body text drift while reading.

---

# 18. Hover Language

Every interactive element should answer three questions:

1. What can I click?
2. What will happen?
3. Did the system notice me?

Recommended hover vocabulary:

- translate
- scale
- mask reveal
- underline travel
- image crop change
- controlled rotation
- doodle entrance
- cursor state change

Avoid relying only on color changes.

---

# 19. Custom Cursor

Desktop only, fine pointer only.

## 19.1 Default

Small circle or dot using `--brand-strong`.

## 19.2 Context states

```text
link       → slightly larger
project    → circular “VIEW” label
wardrobe   → “WEAR” / plus icon
rating     → star cursor state
media      → “OPEN”
```

The cursor must trail with light smoothing, not dramatic latency.

Hide on:

- touch devices
- reduced motion
- form text inputs if it harms precision

Never disable the system cursor until the custom cursor is ready.

---

# 20. Page Transitions

Use one coherent transition across routes.

Recommended:

```text
current page
↓
cream/primary curtain rises or sweeps
↓
route changes
↓
new page artwork appears
↓
curtain exits
```

Duration target:

```text
700–1000ms total perceived transition
```

Do not wait for animation to finish before initiating data/navigation work.

---

# 21. Loader

Only use a loader if required for media initialization.

Visual:

```text
WHITE CHORUS
small animated thread / waveform
00 → 100 optional
```

Avoid fake percentage counters that intentionally delay entry.

---

# 22. Audio Control

Since White Chorus includes looping music, treat audio as part of the visual system.

Control should be compact:

```text
SOUND )))
SOUND —
```

or a small circular equalizer icon.

Interaction:

- equalizer bars animate only while sound is active
- mute transitions within `150–250ms`
- setting remains persistent during navigation

Never surprise users by restoring sound after they mute it.

---

# 23. Form Design

Forms should feel editorial and simple.

Use:

- large text fields
- bottom borders or subtle rounded surfaces
- large labels
- minimal helper text

Focus state:

```css
outline: none;
border-color: var(--brand-strong);
box-shadow: 0 0 0 3px rgb(65 88 134 / 0.14);
```

Validation messages use rust accent, but do not rely on color alone.

---

# 24. Responsive Rules

## 24.1 Desktop ≥ 1200px

- full 12-column compositions
- pointer parallax enabled
- custom cursor enabled
- larger artwork overlap
- asymmetrical Hall of Fame grid
- full menu scene animations

## 24.2 Tablet 768–1199px

- 8-column layout
- reduce overlaps
- keep bento asymmetry where possible
- lower parallax range by ~40%
- hide non-essential doodles

## 24.3 Mobile < 768px

Mobile is not a scaled desktop screenshot.

Rules:

- 4-column layout
- headline remains oversized but wraps naturally
- stack hero artwork beneath/behind text deliberately
- turn bento into alternating full-width blocks
- wardrobe selector becomes horizontal scroll / carousel
- stage remains dominant
- disable cursor/magnetic interactions
- replace hover-only states with tap/active states
- reduce large scene movement
- preserve color-block storytelling

## 24.4 Small mobile < 390px

- minimum page gutter: `14px`
- ensure CTA labels never truncate
- allow display headlines to scale down
- decorative artwork may crop aggressively instead of shrinking everything

---

# 25. Accessibility

Playfulness must never reduce usability.

## 25.1 Contrast

Check all text/background combinations against WCAG AA.

Especially verify:

- muted blue on cream
- pink on cream
- aqua-light with white text
- orange with cream text

If contrast fails, use `--color-text-dark` or `--color-primary-dark` for text.

## 25.2 Keyboard

All interactive elements must support keyboard navigation.

Visible focus states are mandatory.

## 25.3 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In application logic also disable:

- parallax
- cursor trails
- magnetic motion
- long page transitions
- looping decorative animation

Do not remove meaningful state feedback.

---

# 26. Performance Rules

Motion-heavy does not mean expensive.

## 26.1 Animate only

Prefer:

```text
transform
opacity
clip-path (selectively)
SVG stroke properties
```

Avoid continuous animation of:

```text
width
height
top
left
filter blur on huge layers
large box-shadow values
```

## 26.2 GPU discipline

Do not apply `will-change` globally.

Enable it only immediately before animation and remove where practical.

## 26.3 Media

- pre-size all character assets
- use modern compressed image formats
- lazy-load below-fold Hall of Fame media
- preload hero character assets
- keep decorative SVG as vectors

## 26.4 Mobile

Disable non-essential parallax and pointer systems entirely.

---

# 27. Recommended Frontend Motion Stack

For a Next.js implementation:

```text
GSAP
@gsap/react
GSAP ScrollTrigger
Lenis
CSS transitions / keyframes
SVG
```

Optional:

```text
Motion / Framer Motion
```

Use Motion only if it already exists in the project and is useful for React-local state transitions. Do not implement the same scroll animation in both GSAP and Motion.

Suggested ownership:

| Need | Tool |
|---|---|
| Hero choreography | GSAP timeline |
| Scroll-triggered scenes | GSAP ScrollTrigger |
| Smooth scrolling | Lenis |
| Menu scene | GSAP timeline |
| SVG line drawing | GSAP or CSS |
| Button hover | CSS first |
| Outfit swap | CSS / Motion |
| Layout transition | Motion if already installed |
| Pointer parallax | requestAnimationFrame / GSAP quickTo |
| Custom cursor | requestAnimationFrame / GSAP quickTo |

---

# 28. Component Architecture

Suggested visual component structure:

```text
components/
├── layout/
│   ├── SiteHeader.tsx
│   ├── FullscreenMenu.tsx
│   ├── PageTransition.tsx
│   ├── Section.tsx
│   └── Footer.tsx
│
├── motion/
│   ├── SmoothScroll.tsx
│   ├── CustomCursor.tsx
│   ├── TextReveal.tsx
│   ├── ImageReveal.tsx
│   ├── ParallaxLayer.tsx
│   ├── Magnetic.tsx
│   └── DrawSvg.tsx
│
├── decorative/
│   ├── Ribbon.tsx
│   ├── DoodleArrow.tsx
│   ├── Sparkle.tsx
│   ├── ThreadLine.tsx
│   └── GridBackdrop.tsx
│
├── dress-up/
│   ├── CharacterStage.tsx
│   ├── CharacterLayer.tsx
│   ├── Wardrobe.tsx
│   ├── CategoryNav.tsx
│   ├── OutfitItem.tsx
│   ├── RandomizeButton.tsx
│   └── SaveLookButton.tsx
│
└── hall-of-fame/
    ├── LookGrid.tsx
    ├── LookCard.tsx
    ├── FeaturedWinner.tsx
    ├── RatingStars.tsx
    └── SubmissionMeta.tsx
```

Keep decorative and motion primitives independent from business logic.

---

# 29. CSS Architecture

Use semantic classes/tokens instead of page-specific magic values wherever possible.

Suggested global layers:

```css
@layer reset, tokens, base, components, utilities;
```

Recommended token groups:

```text
color
spacing
typography
radius
border
motion
z-index
container
```

---

# 30. Z-Index System

```css
--z-base: 0;
--z-decoration: 10;
--z-content: 20;
--z-floating: 40;
--z-header: 60;
--z-cursor: 80;
--z-menu: 100;
--z-transition: 120;
--z-modal: 140;
--z-toast: 160;
```

Do not invent arbitrary `z-index: 99999` values.

---

# 31. Interaction Recipes

## 31.1 Project / Look card hover

```text
pointer enter
→ image scale 1 → 1.035
→ image translate y 0 → -4px
→ title translate x 0 → 6px
→ doodle arrow scale 0 → 1
→ cursor changes to VIEW
```

## 31.2 Wardrobe item hover

```text
pointer enter
→ item scale 1 → 1.045
→ card rotate 0 → ±1.5deg
→ surface shifts to accent
→ small index appears
```

## 31.3 Menu link hover

```text
pointer enter
→ current label x 0 → 10px
→ associated doodle shifts / rotates
→ menu index opacity increases
```

## 31.4 CTA hover

```text
label A y 0 → -110%
label B y 110% → 0
arrow x 0 → 5px
button magnetic offset max 8px
```

## 31.5 Character hover

```text
character moves y 0 → -3px
shadow / grounding shape scales slightly
active-character indicator appears
```

---

# 32. Animation Budget

At any single moment:

- maximum 1 dominant scene animation
- maximum 2–4 secondary decorative movements
- microinteractions may respond independently

Avoid more than 2 looping decorative animations in the same viewport.

Looping animation should be slow:

```text
floating ribbon  6–10s
sparkle pulse     3–5s
ambient drift     8–14s
```

No constant rapid rotation.

---

# 33. Home Page Blueprint

Recommended order:

```text
01 Hero — Dress the Chorus Your Way
02 Short manifesto / intro card
03 Interactive preview / dress-up teaser
04 Featured looks — asymmetric bento grid
05 Large color-block statement
06 How it works — 3 steps with oversized graphics
07 Weekly winner
08 Hall of Fame preview
09 Final dress-up CTA
10 Footer / music / social
```

The page should alternate density:

```text
high visual density
→ breathing space
→ card/grid density
→ oversized statement
→ interactive content
→ breathing space
```

---

# 34. Dress-Up Page Blueprint

```text
01 Compact editorial header
02 Large category navigation
03 Character stage + wardrobe
04 Action rail: randomize / reset / save
05 Decorative footer cue to Hall of Fame
```

Do not bury the character beneath menus.

---

# 35. Hall of Fame Blueprint

```text
01 Oversized title + weekly status
02 Featured weekly winner
03 Filter / sort as editorial controls
04 Asymmetric submission grid
05 Pagination
06 Submit / Dress Yours CTA
```

Pagination should feel integrated into the visual system rather than like a data table control.

---

# 36. Empty / Loading / Error States

Even utility states should preserve character.

### Empty Hall of Fame

```text
No looks here yet.
Be the first to make some noise.
[Start dressing →]
```

Use one doodle illustration.

### Loading

Use skeleton shapes based on actual card dimensions, or a compact animated thread motif.

### Error

Keep messaging clear first, personality second.

---

# 37. Copy Tone

UI copy should be:

- short
- playful
- confident
- slightly editorial
- never childish

Examples:

```text
Start dressing
Mix it up
Wear this
Save the look
Make some noise
Enter the Hall
Rate this look
Try another chorus
```

Avoid overexplaining obvious interactions.

---

# 38. Do / Don't

## Do

- let typography dominate when appropriate
- use large areas of flat color
- design with negative space
- create original organic SVGs
- use motion to connect sections
- create asymmetric card compositions
- use strong visual hierarchy
- make hover states feel physical
- keep the dress-up interaction immediate

## Don't

- turn every section into a rounded white card
- use a generic 3-column feature layout
- use tiny text everywhere to look “minimal”
- stack many unrelated motion libraries
- hide functionality behind visual experimentation
- use parallax on reading text
- animate layout properties continuously
- autoplay intrusive sound without clear control
- copy Comotion logos, illustrations, photos, text, or proprietary assets

---

# 39. Acceptance Criteria

The refactor is visually complete only when all of the following are true:

- [ ] White Chorus uses the supplied palette exclusively for the core UI.
- [ ] Homepage no longer resembles a standard landing-page template.
- [ ] Hero is an editorial composition with oversized type, character artwork, and organic vector art.
- [ ] Major layouts use a consistent 12/8/4-column grid.
- [ ] Hall of Fame uses asymmetric editorial cards rather than a uniform grid.
- [ ] Dress-up controls feel integrated into the composition rather than like a dashboard.
- [ ] Full-screen menu behaves like a scene transition.
- [ ] Headings use masked/revealed animation instead of generic fade-up everywhere.
- [ ] Cards have deliberate hover choreography.
- [ ] Buttons have label/arrow motion, not just color changes.
- [ ] SVG doodles and ribbons use original White Chorus artwork.
- [ ] Scroll motion has hierarchy and does not compete with content.
- [ ] Pointer parallax is subtle and desktop-only.
- [ ] Custom cursor has contextual states on fine-pointer devices.
- [ ] Reduced-motion mode works.
- [ ] Mobile layout is recomposed rather than simply scaled down.
- [ ] No unnecessary shadow-heavy/glass UI remains.
- [ ] No legacy CSS/components conflicting with this system remain after refactor.
- [ ] Performance remains smooth on a modern mid-range mobile device.

---

# 40. Refactor Rule

When implementing this design system into an existing White Chorus codebase:

1. Audit existing components and styles.
2. Keep business logic, data fetching, authentication, persistence, and dress-up state unless a change is required for the new UX.
3. Remove legacy visual components that conflict with this design system.
4. Replace repeated magic values with design tokens.
5. Establish layout primitives before adding motion.
6. Establish static composition before implementing microinteractions.
7. Add section motion only after responsive layouts are stable.
8. Add cursor/parallax last.
9. Test reduced motion and touch behavior.
10. Delete dead CSS, obsolete components, duplicate motion utilities, and unused assets.

**Do not layer the Comotion-inspired system on top of the old UI. Refactor toward one coherent visual language.**

---

# 41. Implementation Priority

### Phase 1 — Foundation

```text
colors
font
spacing
grid
section primitives
buttons
navigation
```

### Phase 2 — Core Composition

```text
hero
dress-up stage
wardrobe
Hall of Fame grid
featured winner
footer
```

### Phase 3 — Motion

```text
text reveal
image reveal
menu timeline
scroll choreography
outfit transition
```

### Phase 4 — Microinteraction

```text
hover states
magnetic CTA
rating interaction
randomize animation
custom cursor
pointer parallax
```

### Phase 5 — Polish

```text
responsive refinement
reduced motion
performance profiling
asset optimization
cleanup
```

---

# 42. Reference Notes

This system is derived from observable design characteristics of the live Comotion site and its Awwwards showcase, including its editorial/illustrative presentation, bento/grid layout language, doodle/line treatment, menu motion, and large-scale animation-led composition. White Chorus intentionally replaces the original site's brand palette, content, artwork, and identity with its own.

Reference targets:

- Comotion live website — `https://wearecomotion.com/`
- Comotion Awwwards project page — `https://www.awwwards.com/sites/comotion`
- Awwwards Layout element — `https://www.awwwards.com/inspiration/layout-comotion`
- Awwwards Menu Motion element — `https://www.awwwards.com/inspiration/menu-motion-comotion`

---

## Final Principle

> **Build the grid first. Break it intentionally. Use type as artwork. Let motion explain hierarchy. Keep the interaction playful, but never let playfulness interfere with dressing the characters.**
