# White Chorus Design System

**File:** `design-system.md`  
**Version:** 1.0 Final  
**Product:** White Chorus  
**Primary language:** English  
**Document language:** Indonesian  
**Design direction:** Hand-drawn editorial, soft nostalgic paper, playful fashion game  
**Reference basis:** Mobile interface supplied for White Chorus  
**Supported viewport:** Mobile, tablet, desktop  
**Theme:** Light only for MVP

---

## Table of Contents

1. [Tujuan Design System](#1-tujuan-design-system)
2. [Ringkasan Gaya Visual](#2-ringkasan-gaya-visual)
3. [Design Principles](#3-design-principles)
4. [Brand Personality](#4-brand-personality)
5. [Visual DNA](#5-visual-dna)
6. [Design Tokens](#6-design-tokens)
7. [Color System](#7-color-system)
8. [Typography](#8-typography)
9. [Spacing System](#9-spacing-system)
10. [Grid dan Layout](#10-grid-dan-layout)
11. [Border, Radius, dan Shadow](#11-border-radius-dan-shadow)
12. [Texture dan Decorative Doodles](#12-texture-dan-decorative-doodles)
13. [Iconography](#13-iconography)
14. [Illustration dan Dress-Up Assets](#14-illustration-dan-dress-up-assets)
15. [Logo System](#15-logo-system)
16. [Component Foundations](#16-component-foundations)
17. [Header dan Navigation](#17-header-dan-navigation)
18. [Character Stage](#18-character-stage)
19. [Character Selector](#19-character-selector)
20. [Background Carousel](#20-background-carousel)
21. [Category Tabs](#21-category-tabs)
22. [Item Card dan Item Grid](#22-item-card-dan-item-grid)
23. [Primary Actions](#23-primary-actions)
24. [Hall of Fame Components](#24-hall-of-fame-components)
25. [Star Rating](#25-star-rating)
26. [Pagination](#26-pagination)
27. [Dialog, Sheet, dan Popover](#27-dialog-sheet-dan-popover)
28. [Toast dan Feedback](#28-toast-dan-feedback)
29. [Loading, Empty, dan Error States](#29-loading-empty-dan-error-states)
30. [Audio Experience](#30-audio-experience)
31. [Responsive Behavior](#31-responsive-behavior)
32. [Motion System](#32-motion-system)
33. [Interaction States](#33-interaction-states)
34. [Accessibility](#34-accessibility)
35. [Content dan UX Writing](#35-content-dan-ux-writing)
36. [CSS Variables](#36-css-variables)
37. [Tailwind Integration](#37-tailwind-integration)
38. [Component API Guidelines](#38-component-api-guidelines)
39. [Page Composition](#39-page-composition)
40. [Do and Don’t](#40-do-and-dont)
41. [Design QA Checklist](#41-design-qa-checklist)
42. [Asset Handoff Checklist](#42-asset-handoff-checklist)
43. [Final Design Decisions](#43-final-design-decisions)

---

# 1. Tujuan Design System

Design system ini menjadi sumber kebenaran visual dan interaksi untuk seluruh pengalaman **White Chorus**.

Dokumen ini mengatur:

- warna;
- tipografi;
- spacing;
- border;
- shadow;
- texture;
- ilustrasi;
- komponen;
- state interaksi;
- responsive behavior;
- motion;
- accessibility;
- UI copy;
- implementasi token di CSS dan Tailwind.

Tujuan utamanya adalah menjaga White Chorus terasa seperti satu dunia visual yang konsisten: hangat, playful, handmade, dan mudah digunakan.

Design system ini harus memungkinkan tim menambah:

- item pakaian dari 5 menjadi 10 per kategori;
- background dari 5 menjadi 10;
- submission Hall of Fame hingga ratusan;
- halaman Weekly Winners;
- detail outfit;
- sharing dan download;

tanpa mengubah karakter visual produk.

---

# 2. Ringkasan Gaya Visual

White Chorus menggunakan gaya:

> **Soft hand-drawn fashion scrapbook with retro web-game energy.**

Karakter utama gaya ini:

- background cream seperti kertas;
- garis outline navy yang sedikit organik;
- panel berwarna ivory;
- button dengan shadow offset seperti sticker atau cardboard;
- warna pastel yang sedikit muted;
- ilustrasi 2D sederhana;
- bentuk rounded, tetapi tidak terlalu modern atau glossy;
- typography condensed yang kuat;
- doodle dekoratif berupa garis, note musik, star, sparkle, dan sketch marks;
- layout jelas dan mudah dipindai.

White Chorus **bukan**:

- UI SaaS minimalis putih polos;
- cyberpunk;
- glassmorphism;
- neon gaming;
- material design generik;
- kawaii berlebihan;
- skeuomorphism realistis;
- luxury fashion editorial yang terlalu serius.

---

# 3. Design Principles

## 3.1 Playful, not chaotic

Elemen boleh terasa fun, tetapi hierarchy harus tetap jelas.

Aturan:

- satu primary action per section;
- dekorasi tidak boleh mengganggu item selection;
- maksimal dua warna aksen dominan dalam satu viewport;
- gunakan whitespace yang cukup.

## 3.2 Handmade, not messy

Border dapat terasa hand-drawn, tetapi alignment tetap presisi.

Aturan:

- ketidaksempurnaan hanya pada texture dan decorative line;
- grid, hit area, dan spacing tetap konsisten;
- text tidak boleh miring atau bergeser acak;
- item card harus memiliki ukuran seragam.

## 3.3 Soft, not low-contrast

Pastel tidak boleh membuat text sulit dibaca.

Aturan:

- body text menggunakan dark ink;
- decorative pastel tidak dipakai sebagai body text;
- active state harus jelas dengan color, border, dan shadow;
- focus ring wajib terlihat.

## 3.4 Fashion-first

Pakaian dan karakter harus menjadi focal point.

Aturan:

- stage lebih dominan daripada control;
- thumbnail item tidak tertutup badge;
- background UI tidak bersaing dengan detail outfit;
- visual effects di stage harus halus.

## 3.5 Immediate feedback

Setiap action harus memiliki feedback.

Contoh:

- item terpilih memiliki border dan check;
- karakter aktif memiliki color treatment;
- star rating berubah langsung;
- publish menampilkan progress;
- download menampilkan confirmation toast.

## 3.6 Mobile-first, desktop-enhanced

Mobile bukan versi desktop yang diperkecil.

Aturan:

- sticky publish action di mobile;
- category dapat horizontal-scroll;
- item grid tetap mudah disentuh;
- character stage tetap terlihat selama editing;
- desktop memanfaatkan side panel dan lebih banyak whitespace.

---

# 4. Brand Personality

| Attribute | Deskripsi                                 |
| --------- | ----------------------------------------- |
| Warm      | Terasa ramah dan tidak intimidating       |
| Playful   | Mengajak user bereksperimen               |
| Creative  | Menghargai kombinasi outfit               |
| Nostalgic | Mengingatkan pada dress-up games dan zine |
| Gentle    | Gerakan dan warna tidak agresif           |
| Social    | Mendorong publish, rating, dan sharing    |
| Anonymous | Tidak menonjolkan identity atau profile   |
| Inclusive | Tidak menghakimi pilihan fashion          |

## Voice keywords

```text
Create
Dress
Mix
Match
Share
Rate
Discover
Spotlight
Hall of Fame
Weekly Winner
```

## Tone

- singkat;
- optimistis;
- tidak infantil;
- tidak terlalu formal;
- tidak memakai slang yang cepat usang;
- tidak memakai guilt-based language.

---

# 5. Visual DNA

Visual DNA White Chorus terdiri dari enam lapisan.

## 5.1 Paper canvas

Background global menggunakan cream hangat, bukan putih murni.

## 5.2 Ink outline

Hampir semua panel dan control memiliki outline navy.

## 5.3 Offset shadow

Button dan card penting memiliki shadow horizontal/vertikal seperti potongan sticker.

## 5.4 Pastel blocks

Mint, dusty blue, apricot, dan soft yellow digunakan untuk active state dan CTA.

## 5.5 Hand-drawn accents

Garis sketsa, note musik, star, sparkle, dan underline digunakan sebagai aksen.

## 5.6 Editorial condensed type

Heading dan label menggunakan font condensed agar tampil kuat dalam ruang sempit.

---

# 6. Design Tokens

Token dibagi menjadi:

```text
primitive tokens
semantic tokens
component tokens
```

## Primitive token

Nilai dasar seperti:

```text
cream-50
navy-700
space-4
radius-md
```

## Semantic token

Makna UI:

```text
background-canvas
text-primary
border-default
action-primary
```

## Component token

Nilai spesifik:

```text
button-primary-bg
item-card-selected-border
stage-shadow
```

Komponen tidak boleh menggunakan random hex color jika token sudah tersedia.

---

# 7. Color System

Palette diambil dari karakter visual reference: cream paper, navy outline, dusty blue, mint, apricot, pink, dan star yellow.

## 7.1 Primitive palette

| Token         |       Hex | Peran                      |
| ------------- | --------: | -------------------------- |
| `cream-50`    | `#FFF9F0` | Highlight paling terang    |
| `cream-100`   | `#FDF7EC` | Surface utama              |
| `cream-200`   | `#FBEDE0` | Canvas/background          |
| `cream-300`   | `#F4DFCC` | Surface warm secondary     |
| `navy-500`    | `#6D7D95` | Muted ink/decorative       |
| `navy-700`    | `#3B507D` | Primary outline/brand      |
| `navy-800`    | `#2F426D` | Pressed shadow             |
| `ink-900`     | `#2B2C30` | Body text paling gelap     |
| `mint-300`    | `#B6E5E8` | Soft selected surface      |
| `mint-500`    | `#7DB6BA` | Secondary character action |
| `blue-400`    | `#8296B5` | Dusty blue button          |
| `blue-600`    | `#566F9B` | Blue active/pressed        |
| `apricot-300` | `#FFD09A` | CTA highlight              |
| `apricot-500` | `#FAB876` | Primary CTA                |
| `coral-400`   | `#D9878E` | Accent text dan favorite   |
| `yellow-400`  | `#F6C45C` | Star dan winner badge      |
| `green-500`   | `#75A98D` | Success                    |
| `red-500`     | `#C8656C` | Error/destructive          |
| `white`       | `#FFFFFF` | Limited highlight          |
| `black`       | `#000000` | Tidak digunakan langsung   |

## 7.2 Semantic color tokens

| Token                           | Value         |
| ------------------------------- | ------------- |
| `--color-canvas`                | `cream-200`   |
| `--color-surface`               | `cream-100`   |
| `--color-surface-warm`          | `cream-300`   |
| `--color-text-primary`          | `ink-900`     |
| `--color-text-secondary`        | `navy-500`    |
| `--color-text-brand`            | `navy-700`    |
| `--color-border`                | `navy-700`    |
| `--color-border-muted`          | `#A9B0BD`     |
| `--color-focus`                 | `yellow-400`  |
| `--color-action-primary`        | `apricot-500` |
| `--color-action-primary-text`   | `ink-900`     |
| `--color-action-secondary`      | `mint-500`    |
| `--color-action-secondary-text` | `ink-900`     |
| `--color-action-tertiary`       | `blue-400`    |
| `--color-selected`              | `mint-300`    |
| `--color-rating`                | `yellow-400`  |
| `--color-success`               | `green-500`   |
| `--color-error`                 | `red-500`     |

## 7.3 Accessible color pairings

Gunakan pasangan berikut untuk text normal:

| Foreground | Background    | Pemakaian          |
| ---------- | ------------- | ------------------ |
| `ink-900`  | `cream-100`   | Body dan panel     |
| `ink-900`  | `cream-200`   | Body pada canvas   |
| `ink-900`  | `mint-500`    | Character button   |
| `ink-900`  | `apricot-500` | Primary CTA        |
| `navy-700` | `cream-100`   | Heading dan border |
| `navy-700` | `apricot-500` | Label CTA besar    |
| `navy-700` | `yellow-400`  | Badge dan focus    |

Jangan gunakan:

```text
coral-400 sebagai body text di cream
blue-400 sebagai small text di mint
white text di apricot
white text di mint
```

Warna tersebut tidak memiliki contrast yang cukup untuk text kecil.

## 7.4 Color usage ratio

Rekomendasi satu page:

```text
60% cream canvas dan ivory surface
20% navy outline dan text
10% dusty blue/mint
7% apricot
3% coral/yellow/decorative accents
```

## 7.5 Character accent mapping

| Character | Primary accent | Secondary  |
| --------- | -------------- | ---------- |
| Emir      | Dusty blue     | Navy       |
| Friska    | Mint           | Coral pink |

Mapping ini membantu user memahami character aktif.

---

# 8. Typography

## 8.1 Font strategy

Gunakan maksimal dua typeface utama.

### Display / UI condensed

Rekomendasi:

```text
"Barlow Condensed"
```

Fallback:

```text
"Arial Narrow", "Helvetica Neue Condensed", sans-serif
```

Digunakan untuk:

- logo wordmark jika logo text-based;
- page title;
- button label;
- category tab;
- Hall of Fame heading;
- badge.

### Body / utility

Rekomendasi:

```text
"Inter"
```

Fallback:

```text
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Digunakan untuk:

- body copy;
- helper text;
- rating count;
- metadata;
- error message;
- dialog content.

### Handwritten accent

Opsional, maksimal untuk aksen kecil:

```text
"Caveat"
```

Hanya untuk:

- decorative note;
- limited sticker label;
- campaign annotation.

Jangan gunakan sebagai body atau button.

## 8.2 Typography scale

| Token        | Size mobile | Size desktop | Line height | Weight | Font      |
| ------------ | ----------: | -----------: | ----------: | -----: | --------- |
| `display-xl` |        40px |         64px |        0.95 |    700 | Condensed |
| `display-lg` |        32px |         48px |         1.0 |    700 | Condensed |
| `heading-1`  |        28px |         40px |        1.05 |    700 | Condensed |
| `heading-2`  |        24px |         32px |         1.1 |    700 | Condensed |
| `heading-3`  |        20px |         24px |        1.15 |    650 | Condensed |
| `label-lg`   |        18px |         20px |         1.0 |    700 | Condensed |
| `label-md`   |        16px |         18px |         1.0 |    650 | Condensed |
| `body-lg`    |        17px |         18px |        1.55 |    400 | Body      |
| `body-md`    |        15px |         16px |         1.5 |    400 | Body      |
| `body-sm`    |        13px |         14px |         1.4 |    400 | Body      |
| `caption`    |        12px |         12px |        1.35 |    500 | Body      |

## 8.3 Letter spacing

Condensed uppercase labels:

```text
0.02em sampai 0.04em
```

Body:

```text
0
```

Small all-caps:

```text
0.04em
```

Hindari letter spacing lebih dari `0.08em`.

## 8.4 Text transform

Boleh uppercase untuk:

- category tab;
- primary button;
- section label;
- badge.

Jangan uppercase untuk:

- helper text;
- error message;
- body paragraph;
- long dialog content.

## 8.5 Line length

Body desktop:

```text
45–70 characters per line
```

Modal:

```text
maksimal 55 characters per line
```

---

# 9. Spacing System

Base unit:

```text
4px
```

## 9.1 Primitive spacing

| Token      | Value |
| ---------- | ----: |
| `space-0`  |     0 |
| `space-1`  |   4px |
| `space-2`  |   8px |
| `space-3`  |  12px |
| `space-4`  |  16px |
| `space-5`  |  20px |
| `space-6`  |  24px |
| `space-8`  |  32px |
| `space-10` |  40px |
| `space-12` |  48px |
| `space-16` |  64px |
| `space-20` |  80px |
| `space-24` |  96px |

## 9.2 Component spacing defaults

| Component    | Internal spacing               |
| ------------ | ------------------------------ |
| Button       | 12px vertical, 20px horizontal |
| Small button | 8px vertical, 14px horizontal  |
| Item card    | 8px                            |
| Hall card    | 12–16px                        |
| Panel        | 16px mobile, 24px desktop      |
| Dialog       | 24px mobile, 32px desktop      |
| Page section | 40px mobile, 64–80px desktop   |
| Grid gap     | 12px mobile, 20px desktop      |

## 9.3 Touch spacing

Jarak minimum antar interactive target:

```text
8px
```

---

# 10. Grid dan Layout

## 10.1 Breakpoints

| Name | Range       |
| ---- | ----------- |
| `xs` | 0–479px     |
| `sm` | 480–767px   |
| `md` | 768–1023px  |
| `lg` | 1024–1279px |
| `xl` | 1280px+     |

Breakpoint digunakan berdasarkan kebutuhan layout, bukan device brand.

## 10.2 Page container

| Viewport     | Max width | Horizontal padding |
| ------------ | --------: | -----------------: |
| Mobile       |      100% |               16px |
| Large mobile |      100% |               20px |
| Tablet       |      100% |               24px |
| Desktop      |    1200px |               32px |
| Wide         |    1280px |               40px |

## 10.3 Studio layout

### Mobile

```text
1 column
Stage
Character selector
Backgrounds
Categories
Item grid
Sticky actions
```

### Tablet

```text
Stage on top
Control panel below in wider grids
```

### Desktop

```text
Grid: 7/5 or 2fr/1fr
Left: character stage
Right: controls
```

## 10.4 Hall of Fame grid

| Viewport     | Columns |
| ------------ | ------: |
| `< 480px`    |       1 |
| `480–767px`  |       2 |
| `768–1023px` |       2 |
| `1024px+`    |       3 |

Page size tetap 9 card.

Pada mobile satu kolom, satu page menjadi panjang; ini tetap diterima karena image card adalah fokus utama.

## 10.5 Z-index scale

| Token       | Value | Use              |
| ----------- | ----: | ---------------- |
| `z-base`    |     0 | Normal content   |
| `z-raised`  |    10 | Sticky toolbar   |
| `z-header`  |    20 | Header           |
| `z-overlay` |    40 | Backdrop         |
| `z-dialog`  |    50 | Dialog/sheet     |
| `z-toast`   |    60 | Toast            |
| `z-debug`   |   100 | Development only |

---

# 11. Border, Radius, dan Shadow

## 11.1 Border

Default visual:

```text
2px solid navy-700
```

Large panel desktop:

```text
2.5px visual equivalent
```

Karena fractional border dapat terlihat tidak konsisten, implementasi utama tetap `2px`.

## 11.2 Border style

Border harus:

- rounded;
- solid;
- sedikit terasa drawn melalui texture overlay atau SVG;
- tidak menggunakan dashed border kecuali drop area—dan MVP tidak memiliki upload area.

## 11.3 Radius tokens

| Token         | Value |
| ------------- | ----: |
| `radius-xs`   |   6px |
| `radius-sm`   |  10px |
| `radius-md`   |  14px |
| `radius-lg`   |  20px |
| `radius-xl`   |  28px |
| `radius-pill` | 999px |

Penggunaan:

| Component    | Radius        |
| ------------ | ------------- |
| Category tab | `radius-sm`   |
| Item card    | `radius-md`   |
| Button       | `radius-md`   |
| Stage        | `radius-lg`   |
| Hall card    | `radius-lg`   |
| Badge        | `radius-pill` |
| Dialog       | `radius-xl`   |

## 11.4 Shadow tokens

### Sticker shadow

```css
box-shadow: 0 5px 0 #2f426d;
```

### Small card shadow

```css
box-shadow: 0 3px 0 #2f426d;
```

### Floating panel

```css
box-shadow:
  0 5px 0 #2f426d,
  0 12px 24px rgba(47, 66, 109, 0.12);
```

### Soft illustration shadow

```css
filter: drop-shadow(0 8px 8px rgba(47, 66, 109, 0.1));
```

## 11.5 Pressed behavior

Pressed button:

```text
translateY(3px)
shadow 0 2px 0 navy-800
```

Jangan menghapus shadow tanpa movement, karena button akan terasa patah.

---

# 12. Texture dan Decorative Doodles

## 12.1 Paper texture

Background dapat memakai subtle noise:

```text
opacity 2–4%
monochrome
repeat
mix-blend-mode multiply
```

Texture tidak boleh:

- mengurangi readability;
- membuat image compression terlihat buruk;
- memiliki pattern kuat;
- bergerak.

## 12.2 Sketch grid

Garis sketsa diagonal/rectangular dapat muncul di tepi page.

Aturan:

- warna `navy-500`;
- opacity 18–30%;
- stroke 1.5–2px;
- tidak melewati body text;
- tidak muncul di setiap section.

## 12.3 Decorative motifs

Motif utama:

```text
music note
five-point star
four-point sparkle
small dash marks
hand-drawn underline
tiny stitch
```

Maksimal 2–4 motif dalam satu section.

## 12.4 Underline style

Link besar seperti Hall of Fame dapat memakai underline hand-drawn.

Underline:

- berada 4–6px di bawah text;
- tidak menabrak descender;
- warna navy;
- thickness 2px;
- boleh sedikit tidak simetris.

---

# 13. Iconography

## 13.1 Style

Icon harus:

- outline;
- rounded linecap;
- 1.75–2px stroke;
- sederhana;
- tidak terlalu geometris;
- selaras dengan sketch style.

## 13.2 Sizes

| Use         |     Size |
| ----------- | -------: |
| Inline      |     16px |
| Button      |     20px |
| Toolbar     |     24px |
| Empty state |  40–56px |
| Decorative  | Variable |

## 13.3 Required icons

```text
music on
music muted
chevron left/right
star
share
copy
download
reset
randomize
close
check
external link
trophy
clock
warning
```

## 13.4 Active icons

Active icon dapat:

- memperoleh fill pastel;
- menggunakan navy stroke;
- sedikit scale up.

Jangan menggunakan neon glow.

---

# 14. Illustration dan Dress-Up Assets

## 14.1 Illustration style

Karakter harus mempertahankan:

- clean thin outline;
- simple facial features;
- muted pastel coloring;
- minimal shading;
- flat 2D appearance;
- friendly neutral pose.

## 14.2 Outline

Recommended visual outline:

```text
dark navy, bukan pure black
1.5–2.5px pada output mobile reference
```

Semua asset overlay harus menggunakan outline weight konsisten.

## 14.3 Canvas

Semua layer per character harus memiliki:

- canvas width sama;
- canvas height sama;
- origin sama;
- posisi body sama;
- transparent background;
- tidak memiliki hidden crop.

## 14.4 Layer order

Recommended:

```text
background
decorative background foreground
character A back hair
character A body
character A bottom
character A shoes
character A top / one-piece
character A front hair
character A accessory
character B back hair
character B body
character B bottom
character B shoes
character B top / one-piece
character B front hair
character B accessory
foreground effect
branding watermark
```

## 14.5 Thumbnail item

Thumbnail item harus:

- menggunakan ivory background;
- memiliki padding 8–12%;
- menampilkan asset secara penuh;
- tidak terpotong;
- tidak memiliki text embedded;
- menggunakan consistent visual scale.

## 14.6 Background thumbnail

Aspect ratio:

```text
4:3
```

Full stage background dapat menggunakan aspect ratio sesuai render canvas.

## 14.7 Selected item overlay

Gunakan:

- mint wash;
- 3px navy border;
- check badge top-right;
- optional sparkle kecil.

Jangan mengubah opacity asset terpilih.

---

# 15. Logo System

## 15.1 Primary logo

Primary lockup:

```text
music note + WHITE CHORUS wordmark + star
```

## 15.2 Wordmark

- uppercase;
- condensed;
- navy;
- strong but friendly;
- tracking kecil;
- tidak memakai gradient.

## 15.3 Clear space

Minimum clear space:

```text
setara tinggi huruf “W” dibagi 2
```

## 15.4 Minimum size

Digital:

```text
180px width untuk full lockup
96px width untuk wordmark-only
32px untuk logo mark
```

## 15.5 Logo variants

```text
primary on cream
navy monochrome
white reverse untuk image gelap
mark-only
```

Jangan membuat versi baru per halaman.

---

# 16. Component Foundations

Semua interactive component harus mendukung:

```text
default
hover
focus-visible
active/pressed
selected
disabled
loading
error when relevant
```

## 16.1 Hit target

Minimum:

```text
44 × 44px
```

## 16.2 Focus ring

Default:

```css
outline: 3px solid #f6c45c;
outline-offset: 3px;
```

Focus tidak boleh dihapus.

## 16.3 Disabled

Disabled bukan hanya opacity.

Gunakan:

```text
background muted
border muted
text muted
no shadow or smaller shadow
cursor not-allowed
```

Opacity minimal:

```text
0.55
```

---

# 17. Header dan Navigation

## 17.1 Mobile header

Isi:

```text
logo
music control
Hall of Fame shortcut optional
```

Height:

```text
64–72px
```

Behavior:

- sticky;
- cream background dengan sedikit transparency;
- bottom border navy atau hand-drawn divider;
- tidak terlalu tinggi agar stage tetap terlihat.

## 17.2 Desktop header

Isi:

```text
logo
Studio
Hall of Fame
Weekly Winners
music control
```

Navigation label menggunakan condensed uppercase.

## 17.3 Active navigation

Active state:

- underline hand-drawn;
- text navy;
- optional small star;
- tidak hanya mengandalkan color.

---

# 18. Character Stage

## 18.1 Purpose

Stage adalah pusat pengalaman dan harus menjadi elemen paling dominan.

## 18.2 Surface

```text
background: surface ivory
border: 2px navy
radius: 20px
overflow: hidden
```

## 18.3 Aspect ratio

Recommended:

```text
mobile: 4 / 3 atau 3 / 2
desktop: 4 / 3
final download tetap 3 / 4 portrait
```

Stage UI tidak harus memiliki aspect ratio yang sama dengan output final, tetapi crop mapping harus konsisten.

## 18.4 Active character treatment

Jangan menutupi karakter dengan overlay penuh.

Gunakan salah satu:

- subtle glow di area character;
- small name tag;
- 100% opacity untuk active dan 82–90% untuk inactive;
- tiny sparkle dekat active character.

Jangan membuat inactive character terlalu pudar.

## 18.5 Stage controls

Optional controls:

```text
reset
randomize
fullscreen preview
```

Di mobile, controls dapat berada di bawah stage.

## 18.6 Stage loading

Gunakan silhouette skeleton untuk dua karakter, bukan spinner besar di tengah.

---

# 19. Character Selector

## 19.1 Layout

Dua button berdampingan:

```text
DRESS EMIR
DRESS FRISKA
```

Mobile:

```text
50% / 50%
gap 12px
```

## 19.2 Emir button

Default:

```text
dusty blue background
navy border
dark text
offset shadow
```

## 19.3 Friska button

Default:

```text
mint background
navy border
dark text
offset shadow
```

## 19.4 Selected state

Selected:

- border 3px;
- slight lift;
- small star/check;
- stronger saturation;
- `aria-pressed="true"`.

Inactive tetap jelas dan clickable.

## 19.5 Label

Gunakan:

```text
DRESS EMIR
DRESS FRISKA
```

Bukan hanya nama, agar fungsi button jelas.

---

# 20. Background Carousel

## 20.1 Container

- ivory surface;
- navy border;
- radius 16px;
- padding 8–12px;
- left/right navigation.

## 20.2 Thumbnail

Mobile:

```text
3 visible thumbnails
gap 8px
```

Desktop:

```text
4–5 visible thumbnails
```

## 20.3 Selected state

- navy 3px border;
- internal cream gap 2px;
- subtle mint wash;
- check badge.

## 20.4 Navigation arrows

- hit target 44px;
- icon 24px;
- dapat berada di luar frame;
- disable saat tidak ada next/previous jika carousel tidak loop.

## 20.5 Pagination indicator

Opsional:

```text
1 / 5
```

Tidak wajib jika semua thumbnail terlihat.

---

# 21. Category Tabs

## 21.1 Categories

```text
HAIR
TOP
BOTTOM
ONE-PIECE
SHOES
ACCESSORIES
```

## 21.2 Mobile behavior

Horizontal scroll dengan:

```text
scroll-snap-type: x proximity
```

Jangan memaksa semua tab mengecil sampai text sulit dibaca.

## 21.3 Dimensions

Minimum:

```text
height 44px
horizontal padding 14px
```

## 21.4 Default state

```text
cream surface
2px navy border
navy text
```

## 21.5 Active state

Reference style:

```text
dusty blue fill
navy text
stronger border
```

Boleh menggunakan character accent secara kontekstual:

- Emir active category: dusty blue;
- Friska active category: mint.

Untuk konsistensi, kategori aktif utama tetap dapat memakai dusty blue terlepas dari character.

## 21.6 Overflow affordance

Tambahkan fade kecil di tepi kanan untuk menunjukkan masih ada tab.

---

# 22. Item Card dan Item Grid

## 22.1 Item grid

Mobile:

```text
2–3 columns
```

Rekomendasi:

- `< 360px`: 2 columns;
- `360px+`: 3 columns;
- tablet: 4–5 columns;
- desktop side panel: 3 columns.

## 22.2 Item card

Default:

```text
aspect-ratio: 1 / 1
ivory background
2px navy border
radius 12–14px
padding 8px
```

## 22.3 Hover

Desktop:

```text
translateY(-2px)
small shadow
background cream-50
```

## 22.4 Selected

```text
3px navy border
mint-300 background
small offset shadow
check badge
```

## 22.5 Pressed

```text
scale 0.98
translateY(1px)
```

## 22.6 Disabled/incompatible

Jangan tampilkan item incompatible jika catalog sudah difilter.

Jika perlu disabled:

- opacity 55%;
- lock icon;
- helper text via tooltip;
- tidak menerima click.

## 22.7 None option

Kategori optional dapat memiliki card:

```text
NONE
```

Gunakan icon slash sederhana dan bukan empty blank card.

## 22.8 Loading

Skeleton berbentuk rounded square.

---

# 23. Primary Actions

## 23.1 Button hierarchy

### Primary

Contoh:

```text
PUBLISH TO HALL OF FAME
SAVE OUTFIT & UPLOAD
```

Untuk produk final, gunakan:

```text
PUBLISH TO HALL OF FAME
```

Style:

- apricot background;
- navy/dark text;
- navy border;
- strong offset shadow;
- full width di mobile;
- minimum height 56px.

### Secondary

Contoh:

```text
RANDOMIZE ALL
DOWNLOAD IMAGE
```

Style:

- mint atau dusty blue;
- navy outline;
- medium shadow.

### Tertiary

Contoh:

```text
RESET ALL
COPY LINK
```

Style:

- transparent/cream;
- navy outline;
- no heavy shadow.

### Destructive

Contoh internal:

```text
HIDE SUBMISSION
```

Style:

- cream surface;
- red border/text;
- tidak menggunakan solid red besar kecuali confirmation.

## 23.2 Primary button typography

```text
label-lg
uppercase
0.02em tracking
```

## 23.3 Loading button

Saat publish:

```text
CREATING YOUR LOOK…
```

- tampilkan spinner kecil;
- disable double click;
- pertahankan width;
- jangan mengganti layout.

## 23.4 Sticky mobile actions

Bottom bar:

```text
background cream dengan blur ringan
top border navy
safe-area padding
```

Primary CTA tetap terlihat.

---

# 24. Hall of Fame Components

## 24.1 Outfit card

Card terdiri dari:

```text
thumbnail
Anonymous Look #XXXX
star average
rating count
time remaining
optional rank badge
share shortcut optional
```

## 24.2 Card visual

```text
cream-100 background
2px navy border
radius 20px
small offset shadow
```

## 24.3 Image ratio

```text
3 / 4 portrait
```

Image memenuhi width card.

## 24.4 Card metadata

Hierarchy:

1. short code;
2. rating;
3. count dan expiry.

Gunakan body font untuk metadata.

## 24.5 Winner badge

```text
yellow star
navy outline
“WEEKLY WINNER”
```

Badge harus menempel pada card tanpa menutupi wajah karakter.

## 24.6 Sort toolbar

Tabs:

```text
NEWEST
TOP RATED
TRENDING
WEEKLY WINNERS
```

Mobile dapat horizontal scroll.

## 24.7 Hover

Desktop:

- card naik 3px;
- shadow bertambah;
- image tetap stabil;
- tidak tilt berlebihan.

## 24.8 Expiring soon

Jika kurang dari 24 jam:

```text
Ends soon
```

Gunakan coral accent, tetapi text tetap dark/navy.

---

# 25. Star Rating

## 25.1 Visual

- five stars;
- outline navy;
- selected fill yellow;
- hover preview;
- size 32–40px pada detail page;
- minimum hit area 44px per star.

## 25.2 States

### Empty

```text
cream fill atau transparent
navy outline
```

### Hover preview

```text
yellow-300
slight scale 1.06
```

### Selected

```text
yellow-400 fill
navy outline
small bounce
```

### Disabled/self-owned

Tampilkan summary, tetapi interaction disabled.

## 25.3 Accessibility

Gunakan radio group atau accessible button group.

Label:

```text
1 star
2 stars
3 stars
4 stars
5 stars
```

Status:

```text
You rated this look 4 out of 5 stars.
```

## 25.4 Average display

Contoh:

```text
4.7 ★ · 23 ratings
```

Jangan hanya menampilkan icon tanpa nilai numerik.

---

# 26. Pagination

## 26.1 Layout

```text
Previous
1
2
3
…
Next
```

## 26.2 Visual

- cream button;
- navy border;
- active page dusty blue;
- selected page memiliki shadow kecil.

## 26.3 Mobile

Gunakan:

```text
Previous
2 of 8
Next
```

jika full page list terlalu padat.

## 26.4 Disabled

Previous/Next disabled ketika mencapai batas.

---

# 27. Dialog, Sheet, dan Popover

## 27.1 Mobile

Gunakan bottom sheet untuk:

- share actions;
- publish success;
- music entry jika tidak full-page;
- confirmation.

## 27.2 Desktop

Gunakan centered dialog.

## 27.3 Visual

```text
cream surface
2px navy border
radius 24px
offset shadow
```

## 27.4 Backdrop

```text
rgba(47, 66, 109, 0.28)
```

Tidak memakai backdrop hitam pekat.

## 27.5 Close button

- top-right;
- 44px hit target;
- icon 20px;
- clear focus ring.

---

# 28. Toast dan Feedback

## 28.1 Position

Mobile:

```text
bottom, di atas sticky action
```

Desktop:

```text
top-right
```

## 28.2 Variants

| Variant | Accent     |
| ------- | ---------- |
| Success | Green      |
| Info    | Dusty blue |
| Warning | Yellow     |
| Error   | Coral/red  |

## 28.3 Copy examples

```text
Your look is now in the Hall of Fame.
Image downloaded.
Link copied.
Rating saved.
Your draft is saved on this device.
```

## 28.4 Duration

```text
4–6 seconds
```

Error penting tidak auto-dismiss terlalu cepat.

---

# 29. Loading, Empty, dan Error States

## 29.1 Skeleton

Skeleton memakai:

- cream-300;
- subtle shimmer;
- navy outline tidak diperlukan;
- reduced motion mematikan shimmer.

## 29.2 Empty Hall of Fame

Visual:

- outlined star;
- small fashion hanger or two-character silhouette;
- short copy;
- primary CTA.

Copy:

> No looks are here yet. Be the first to join the Hall of Fame.

## 29.3 Expired submission

Copy:

> This look has completed its seven-day Hall of Fame run.

CTA:

```text
CREATE A NEW LOOK
EXPLORE HALL OF FAME
```

## 29.4 Publish error

Jangan hapus draft.

Copy:

> We couldn’t create your final image. Your look is still saved on this device.

## 29.5 Offline

Gunakan banner ringan, bukan blocking modal.

---

# 30. Audio Experience

## 30.1 Entry gate

Pilihan:

```text
ENTER WITH MUSIC
ENTER SILENTLY
```

Visual mengikuti button hierarchy.

## 30.2 Persistent control

Music control harus selalu tersedia setelah masuk.

## 30.3 States

```text
playing
muted
playback error
```

## 30.4 Animation

Music note dapat bergerak ringan saat playing.

Reduced motion:

- icon tetap;
- state hanya melalui visual fill dan label.

## 30.5 Volume

Default:

```text
35%
```

Tidak perlu slider volume untuk MVP; mute/unmute cukup.

---

# 31. Responsive Behavior

## 31.1 Mobile priorities

Urutan prioritas:

1. stage;
2. character selector;
3. background;
4. category;
5. items;
6. publish;
7. secondary action.

## 31.2 Mobile viewport height

Stage tidak boleh memakai seluruh screen.

Target:

```text
35–45vh
```

agar controls tetap terlihat.

## 31.3 Sticky behavior

Mobile:

- header sticky;
- publish bar sticky bottom;
- category tabs dapat sticky di bawah stage bila tidak mengganggu.

## 31.4 Desktop

Stage dapat sticky dalam viewport sementara right control panel scroll.

Recommended:

```css
position: sticky;
top: 96px;
```

## 31.5 Safe areas

Bottom bar harus menggunakan:

```css
padding-bottom: env(safe-area-inset-bottom);
```

## 31.6 Landscape mobile

Gunakan two-column compact layout jika height sangat pendek:

```text
stage left
controls right
```

Jika tidak memungkinkan, pertahankan portrait flow dan izinkan scroll.

---

# 32. Motion System

## 32.1 Motion personality

Gerakan:

- gentle;
- buoyant;
- brief;
- slightly handmade;
- tidak hyperactive.

## 32.2 Duration tokens

| Token                | Value |
| -------------------- | ----: |
| `motion-instant`     |  80ms |
| `motion-fast`        | 150ms |
| `motion-base`        | 220ms |
| `motion-slow`        | 360ms |
| `motion-celebration` | 650ms |

## 32.3 Easing

Standard:

```css
cubic-bezier(0.2, 0.8, 0.2, 1)
```

Bounce ringan:

```css
cubic-bezier(0.34, 1.56, 0.64, 1)
```

Gunakan bounce hanya untuk:

- star select;
- item select;
- publish success;
- winner badge.

## 32.4 Item selection

```text
opacity 0.7 → 1
scale 0.98 → 1
150–220ms
```

## 32.5 Character switch

- active indicator slide;
- subtle spotlight move;
- 220ms.

Jangan memindahkan posisi character secara besar.

## 32.6 Publish success

- stage sparkle;
- small confetti;
- button success state;
- maksimal 650ms primary animation.

## 32.7 Reduced motion

Jika `prefers-reduced-motion: reduce`:

- hapus parallax;
- hapus idle breathing;
- hapus bounce;
- gunakan opacity transition maksimal 100ms;
- jangan auto-scroll dengan smooth behavior.

---

# 33. Interaction States

## 33.1 Hover

Hanya untuk pointer device.

Hover tidak boleh menjadi satu-satunya cara melihat informasi.

## 33.2 Focus-visible

Setiap interactive component wajib memiliki focus ring.

## 33.3 Pressed

Pressed state memakai physical translation untuk menjaga sticker feel.

## 33.4 Selected

Selected state menggunakan minimal dua indikator:

```text
fill + border
border + check
fill + shadow
```

Bukan color saja.

## 33.5 Loading

Loading harus:

- mencegah duplicate action;
- mempertahankan component dimensions;
- memberi label yang jelas;
- tidak menghilangkan draft.

## 33.6 Disabled

Disabled state tetap readable.

---

# 34. Accessibility

## 34.1 Contrast

- body text minimal 4.5:1;
- large text minimal 3:1;
- focus indicator jelas;
- pastel hanya sebagai surface atau accent.

## 34.2 Keyboard

User harus dapat:

- pindah character;
- memilih background;
- memilih category;
- memilih item;
- publish;
- rating;
- pagination;
- share;
- mute.

## 34.3 Screen reader

Contoh label:

```text
Dress Emir
Dress Friska
Select beach background
Select Hair category
Choose blue hoodie
Selected: blue hoodie
Rate 4 out of 5 stars
Mute background music
```

## 34.4 Live region

Gunakan polite live region untuk:

```text
Item selected
Character changed
Rating saved
Link copied
Publish complete
```

## 34.5 Image alt

Hall card:

```text
Anonymous White Chorus look showing Emir and Friska in a beach background.
```

Jika alt terlalu sulit dibangun akurat dari metadata, gunakan:

```text
Anonymous White Chorus outfit #A7F2.
```

## 34.6 Color blindness

Selected state tidak hanya mengandalkan mint vs blue.

Tambahkan border/check.

## 34.7 Audio

- tidak autoplay dengan suara sebelum interaction;
- mute selalu tersedia;
- audio bukan sumber informasi penting.

---

# 35. Content dan UX Writing

## 35.1 Primary labels

```text
START DRESSING
EXPLORE HALL OF FAME
DRESS EMIR
DRESS FRISKA
CHOOSE A BACKGROUND
RANDOMIZE ALL
RESET ALL
PUBLISH TO HALL OF FAME
DOWNLOAD IMAGE
SHARE OUTFIT
RATE THIS LOOK
```

## 35.2 Hall of Fame

```text
NEWEST
TOP RATED
TRENDING
WEEKLY WINNERS
ANONYMOUS LOOK #A7F2
ENDS IN 3 DAYS
```

## 35.3 Success

```text
YOUR LOOK IS LIVE!
Your outfit is now in the Hall of Fame.
```

## 35.4 Error

Gunakan human-readable message, bukan code.

Bad:

```text
Error 429
```

Good:

```text
You’ve reached the publishing limit for now. Keep dressing and try again later.
```

## 35.5 Sentence casing

- button dan tab boleh uppercase;
- message menggunakan sentence case;
- hindari exclamation berlebihan;
- maksimal satu exclamation per success state.

---

# 36. CSS Variables

```css
:root {
  /* Color primitives */
  --cream-50: #fff9f0;
  --cream-100: #fdf7ec;
  --cream-200: #fbede0;
  --cream-300: #f4dfcc;

  --navy-500: #6d7d95;
  --navy-700: #3b507d;
  --navy-800: #2f426d;
  --ink-900: #2b2c30;

  --mint-300: #b6e5e8;
  --mint-500: #7db6ba;

  --blue-400: #8296b5;
  --blue-600: #566f9b;

  --apricot-300: #ffd09a;
  --apricot-500: #fab876;

  --coral-400: #d9878e;
  --yellow-400: #f6c45c;

  --green-500: #75a98d;
  --red-500: #c8656c;

  /* Semantic colors */
  --color-canvas: var(--cream-200);
  --color-surface: var(--cream-100);
  --color-surface-warm: var(--cream-300);

  --color-text-primary: var(--ink-900);
  --color-text-secondary: var(--navy-500);
  --color-text-brand: var(--navy-700);

  --color-border: var(--navy-700);
  --color-shadow: var(--navy-800);
  --color-focus: var(--yellow-400);

  --color-action-primary: var(--apricot-500);
  --color-action-secondary: var(--mint-500);
  --color-action-tertiary: var(--blue-400);
  --color-selected: var(--mint-300);

  --color-success: var(--green-500);
  --color-error: var(--red-500);
  --color-rating: var(--yellow-400);

  /* Typography */
  --font-display: "Barlow Condensed", "Arial Narrow", sans-serif;
  --font-body:
    "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Radius */
  --radius-xs: 0.375rem;
  --radius-sm: 0.625rem;
  --radius-md: 0.875rem;
  --radius-lg: 1.25rem;
  --radius-xl: 1.75rem;
  --radius-pill: 999px;

  /* Border */
  --border-width: 2px;

  /* Shadow */
  --shadow-sticker-sm: 0 3px 0 var(--color-shadow);
  --shadow-sticker: 0 5px 0 var(--color-shadow);
  --shadow-floating:
    0 5px 0 var(--color-shadow), 0 12px 24px rgb(47 66 109 / 12%);

  /* Motion */
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-base: 220ms;
  --duration-slow: 360ms;
  --duration-celebration: 650ms;

  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

Catatan: normalisasi penulisan production menjadi lowercase konsisten:

```css
--cream-200: #fbede0;
```

---

# 37. Tailwind Integration

Gunakan CSS variables sebagai sumber warna, bukan menyalin hex ke setiap component.

Contoh theme mapping:

```css
@theme {
  --color-canvas: var(--color-canvas);
  --color-surface: var(--color-surface);
  --color-ink: var(--color-text-primary);
  --color-brand: var(--color-text-brand);
  --color-border: var(--color-border);
  --color-primary: var(--color-action-primary);
  --color-secondary: var(--color-action-secondary);
  --color-selected: var(--color-selected);
  --color-rating: var(--color-rating);

  --font-display: var(--font-display);
  --font-body: var(--font-body);

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}
```

Contoh button:

```tsx
<button className="border-border bg-primary font-display text-ink focus-visible:outline-rating min-h-14 w-full rounded-md border-2 px-5 py-3 text-lg font-bold tracking-[0.02em] uppercase shadow-[0_5px_0_var(--color-shadow)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 active:translate-y-[3px] active:shadow-[0_2px_0_var(--color-shadow)] disabled:cursor-not-allowed disabled:opacity-55">
  Publish to Hall of Fame
</button>
```

## Utility policy

Boleh menggunakan utility untuk layout dan spacing.

Untuk visual pattern kompleks yang berulang, buat component class atau reusable component.

Jangan membuat satu string class 50 baris di banyak file.

---

# 38. Component API Guidelines

## 38.1 Button

```ts
type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

type ButtonSize = "sm" | "md" | "lg";
```

Props minimum:

```ts
type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};
```

## 38.2 ItemCard

```ts
type ItemCardProps = {
  id: string;
  label: string;
  imageSrc: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
};
```

## 38.3 StarRating

```ts
type StarRatingProps = {
  value: number | null;
  average?: number;
  count?: number;
  disabled?: boolean;
  submitting?: boolean;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
};
```

## 38.4 OutfitCard

```ts
type OutfitCardProps = {
  id: string;
  shortCode: string;
  thumbnailUrl: string;
  ratingAverage: number;
  ratingCount: number;
  expiresAt: string;
  weeklyWinner?: boolean;
};
```

## 38.5 Visual state ownership

Component menerima semantic props:

```text
selected
loading
disabled
winner
```

Jangan meminta caller mengirim raw class untuk state utama.

---

# 39. Page Composition

## 39.1 Landing page

```text
Header
Hero
Entry CTA
How It Works
Featured Hall of Fame
Weekly Winner teaser
Footer
```

## 39.2 Studio page

```text
Header
Page title / short instruction
Desktop split layout
  Character stage
  Editing controls
Sticky mobile publish bar
Hall of Fame teaser
Footer
```

## 39.3 Hall of Fame

```text
Header
Title + star doodle
Sort toolbar
9-card grid
Pagination
Weekly Winner CTA
Footer
```

## 39.4 Detail page

```text
Header
Back link
Final image
Look metadata
Star rating
Share/download actions
Related looks optional
Footer
```

## 39.5 Weekly Winners

```text
Header
Hero winner card
Week selector
Previous winners grid
CTA to studio
Footer
```

---

# 40. Do and Don’t

## 40.1 Color

### Do

- gunakan cream sebagai canvas;
- gunakan navy untuk text dan border;
- gunakan pastel sebagai surface;
- gunakan apricot untuk primary CTA;
- gunakan yellow untuk star dan focus.

### Don’t

- gunakan pure white di seluruh page;
- gunakan black outline;
- gunakan gradient neon;
- gunakan pastel untuk body text;
- gunakan terlalu banyak accent dalam satu component.

## 40.2 Border

### Do

- gunakan 2px navy;
- radius konsisten;
- shadow offset.

### Don’t

- gunakan border abu tipis ala dashboard SaaS;
- gunakan radius berbeda tanpa aturan;
- gunakan glass blur sebagai gaya utama.

## 40.3 Typography

### Do

- condensed uppercase untuk label;
- body font untuk explanation;
- hierarchy jelas.

### Don’t

- memakai condensed font untuk paragraph panjang;
- memakai handwritten font untuk controls;
- menggunakan lebih dari tiga font.

## 40.4 Motion

### Do

- subtle bounce;
- fast feedback;
- reduced motion support.

### Don’t

- animasi continuous di semua card;
- parallax kuat;
- confetti panjang;
- motion yang menggeser layout.

## 40.5 Layout

### Do

- stage dominan;
- controls dikelompokkan;
- sticky CTA mobile;
- whitespace cukup.

### Don’t

- membuat semua item terlihat sekaligus tanpa scroll;
- memperkecil target sentuh;
- menempatkan CTA jauh dari editing flow.

---

# 41. Design QA Checklist

## Global

- [ ] Canvas menggunakan warm cream.
- [ ] Tidak ada text utama dengan contrast rendah.
- [ ] Navy outline konsisten.
- [ ] Radius konsisten.
- [ ] Shadow bergerak benar saat pressed.
- [ ] Focus ring terlihat.
- [ ] Reduced motion diuji.

## Header

- [ ] Logo memiliki clear space.
- [ ] Music control mudah ditemukan.
- [ ] Header tidak menutupi content.
- [ ] Navigation active jelas.

## Studio

- [ ] Dua karakter terlihat bersamaan.
- [ ] Active character jelas.
- [ ] Background selected jelas.
- [ ] Category horizontal scroll bekerja.
- [ ] Item card minimum 44px.
- [ ] Item thumbnail tidak terpotong.
- [ ] Sticky publish tidak menutupi item terakhir.
- [ ] Safe area iPhone diperhitungkan.

## Hall of Fame

- [ ] 9 card per page.
- [ ] Image ratio konsisten.
- [ ] Rating dan count terbaca.
- [ ] Winner badge tidak menutup wajah.
- [ ] Pagination keyboard accessible.
- [ ] Mobile card tidak terlalu sempit.

## Rating

- [ ] Star dapat dioperasikan keyboard.
- [ ] Selected rating memiliki fill dan label.
- [ ] Self-rating disabled state jelas.
- [ ] Average tampil secara numerik.

## Sharing

- [ ] Share dialog usable di mobile.
- [ ] Copy link memberi toast.
- [ ] Download memiliki loading state.
- [ ] Social preview tidak memotong karakter.

## Error

- [ ] Draft tidak hilang ketika publish gagal.
- [ ] Error copy mudah dimengerti.
- [ ] Retry action jelas.
- [ ] Expired state memiliki next action.

---

# 42. Asset Handoff Checklist

## Character asset

- [ ] Canvas width dan height sama.
- [ ] Posisi body sama.
- [ ] Transparent background.
- [ ] Tidak ada accidental white pixel.
- [ ] Outline weight konsisten.
- [ ] Color profile konsisten.
- [ ] Naming mengikuti convention.
- [ ] Character A/B tidak tertukar.

## Outfit asset

- [ ] Hair memiliki front/back jika diperlukan.
- [ ] Top tidak menutupi face.
- [ ] Bottom alignment benar.
- [ ] One Piece kompatibel.
- [ ] Shoes berada di anchor yang benar.
- [ ] Accessory tidak keluar canvas.
- [ ] Thumbnail tersedia.
- [ ] Item ID sesuai catalog.

## Background

- [ ] Full-size render tersedia.
- [ ] Thumbnail 4:3 tersedia.
- [ ] Safe area karakter diperiksa.
- [ ] Contrast dengan kedua karakter cukup.
- [ ] Tidak ada text penting di background.

## Brand

- [ ] Logo SVG.
- [ ] Logo mark.
- [ ] Watermark PNG transparent.
- [ ] Social fallback image.
- [ ] Music note dan star decorative assets.

## Audio

- [ ] MP3 final.
- [ ] Loop point tidak terdengar patah.
- [ ] Volume dinormalisasi.
- [ ] File size dioptimalkan.
- [ ] Usage rights dikonfirmasi.

---

# 43. Final Design Decisions

White Chorus menggunakan design direction final berikut:

```text
Canvas:
Warm cream paper

Surfaces:
Ivory cards and panels

Primary ink:
Navy outline and dark body text

Character accents:
Dusty blue for Emir
Mint with coral detail for Friska

Primary CTA:
Apricot with navy offset shadow

Rating:
Yellow stars with navy outline

Typography:
Condensed uppercase for display and controls
Readable sans-serif for body and metadata

Shape:
Rounded rectangles with 2px navy borders

Depth:
Sticker-like offset shadows

Decoration:
Hand-drawn notes, stars, sparkles, and sketch lines

Motion:
Gentle, short, and tactile

Accessibility:
Strong text contrast, visible focus, keyboard support,
large touch targets, and reduced-motion behavior
```

Design system ini menjaga reference style tetap terasa autentik, tetapi mengubahnya menjadi sistem produk yang dapat digunakan secara konsisten untuk:

- landing page;
- dress-up studio;
- Hall of Fame;
- detail outfit;
- rating;
- weekly winner;
- sharing;
- download;
- empty/error/loading states;
- mobile dan desktop.

---

**End of White Chorus Design System**
