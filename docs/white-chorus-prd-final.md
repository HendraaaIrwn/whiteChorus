# Product Requirements Document (PRD)

# White Chorus

**Document version:** 1.0 Final  
**Product type:** Interactive dress-up microsite  
**Primary platform:** Responsive web  
**Primary language:** English  
**User model:** Anonymous guest, no registration or login  
**Target MVP delivery:** 7 calendar days  
**Submission lifetime:** 7 days from publication  
**Core experience:** Dress two characters, publish the final look, enter the Hall of Fame, receive star ratings, win a daily competition, download the final image, and share it on social media.

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Executive Summary](#2-executive-summary)
3. [Background and Opportunity](#3-background-and-opportunity)
4. [Product Vision](#4-product-vision)
5. [Product Objectives](#5-product-objectives)
6. [Product Principles](#6-product-principles)
7. [Users and Jobs to Be Done](#7-users-and-jobs-to-be-done)
8. [Final Product Decisions](#8-final-product-decisions)
9. [Scope](#9-scope)
10. [Information Architecture](#10-information-architecture)
11. [Primary User Journeys](#11-primary-user-journeys)
12. [Functional Requirements](#12-functional-requirements)
13. [Hall of Fame and Daily Competition](#13-hall-of-fame-and-daily-competition)
14. [Rating System](#14-rating-system)
15. [Social Sharing and Download](#15-social-sharing-and-download)
16. [Music and Audio Experience](#16-music-and-audio-experience)
17. [User Experience and Visual Direction](#17-user-experience-and-visual-direction)
18. [Technical Architecture](#18-technical-architecture)
19. [Data Model](#19-data-model)
20. [API Requirements](#20-api-requirements)
21. [Image Rendering Pipeline](#21-image-rendering-pipeline)
22. [Security and Abuse Prevention](#22-security-and-abuse-prevention)
23. [Data Retention and Cleanup](#23-data-retention-and-cleanup)
24. [Performance Requirements](#24-performance-requirements)
25. [Accessibility Requirements](#25-accessibility-requirements)
26. [SEO and Social Metadata](#26-seo-and-social-metadata)
27. [Analytics and Product Metrics](#27-analytics-and-product-metrics)
28. [Logging, Monitoring, and Operations](#28-logging-monitoring-and-operations)
29. [Error Handling and User Messaging](#29-error-handling-and-user-messaging)
30. [Testing and Quality Assurance](#30-testing-and-quality-assurance)
31. [Deployment and Release Strategy](#31-deployment-and-release-strategy)
32. [Seven-Day Implementation Plan](#32-seven-day-implementation-plan)
33. [Acceptance Criteria](#33-acceptance-criteria)
34. [Definition of Done](#34-definition-of-done)
35. [Risks and Mitigations](#35-risks-and-mitigations)
36. [Future Roadmap](#36-future-roadmap)
37. [Required Inputs Before Development](#37-required-inputs-before-development)
38. [Appendices](#38-appendices)

---

## 1. Document Purpose

This document defines the final product and technical requirements for **White Chorus**. It is intended to align product, design, frontend, backend, illustration, quality assurance, and deployment work around one agreed scope.

The document describes:

- what White Chorus must do;
- how users interact with it;
- which features are required for launch;
- how anonymous guest identity works;
- how submissions, ratings, daily winners, downloads, and social sharing work;
- how the system prevents abuse without creating unnecessary complexity;
- which technical stack will be used;
- what qualifies the MVP as complete.

This PRD is the primary implementation reference for the MVP.

---

## 2. Executive Summary

**White Chorus** is an interactive web experience in which visitors dress **two characters displayed together**. Users can choose a shared background and customize each character using official outfit assets.

No login or registration is required. Every visitor is treated as an anonymous guest through a secure server-issued session cookie.

After completing a look, the guest can publish it to the **Hall of Fame**. The server combines the selected assets into a final image, creates an optimized thumbnail and social preview, and stores the generated files. Each published submission receives a unique public URL.

Other visitors can rate each submission from **1 to 5 stars**. There are no text comments in the MVP. Submissions are displayed anonymously and expire exactly seven days after publication.

The Hall of Fame supports:

- Newest;
- Top Rated;
- Trending;
- Daily Winners;
- pagination with nine cards per page;
- a public detail page for each active submission.

Each day, White Chorus selects a winner using a weighted rating score that considers both average stars and rating volume. A winner snapshot is stored separately so that daily winners remain visible even after the original seven-day submission expires.

Users can:

- download the final image;
- share the public URL;
- use the device’s native share sheet;
- share through common social platforms;
- see a social preview generated specifically for the submission.

The system uses a pragmatic full-stack architecture:

```text
Next.js App Router
TypeScript
Tailwind CSS
Framer Motion
Prisma ORM
Supabase PostgreSQL
Custom anonymous guest session using an opaque HttpOnly cookie
Supabase Storage
Sharp
Zod
Vercel
Cloudflare Turnstile
PostgreSQL-based rate limiting
Scheduled cleanup
```

White Chorus deliberately does **not** use a separate Elysia backend, Supabase Anonymous Auth, Redis, microservices, a message queue, or real-time infrastructure for the MVP.

---

## 3. Background and Opportunity

Most dress-up experiences end once a user finishes choosing clothes. White Chorus extends the activity into a lightweight social loop:

```text
Create → Publish → Discover → Rate → Share → Compete
```

The product opportunity is to combine three experiences in one simple microsite:

1. **Creative play**  
   Guests can experiment with official character and outfit assets.

2. **Public recognition**  
   Finished combinations appear in a visible Hall of Fame.

3. **Social distribution**  
   Every look can be downloaded and shared through a unique URL with a visual preview.

The lack of account registration reduces friction, but it also creates operational risks:

- one guest may submit excessive numbers of outfits;
- bots may manipulate ratings;
- duplicate submissions may flood the Hall of Fame;
- generated image rendering may be abused;
- storage may accumulate expired files;
- users may attempt to modify records they do not own.

The product therefore needs proportionate security controls while preserving a fast guest experience.

---

## 4. Product Vision

> White Chorus is a playful, polished, and shareable dress-up experience where anyone can create a coordinated two-character look, enter the Hall of Fame, receive community ratings, and compete for a daily spotlight without creating an account.

---

## 5. Product Objectives

### 5.1 Primary objectives

1. Allow visitors to start playing without registration or login.
2. Display and customize two characters at the same time.
3. Support five initial items in each outfit category, expandable to ten.
4. Support five initial backgrounds, expandable to ten.
5. Publish finished looks immediately after automated validation.
6. Generate a final downloadable image for every published submission.
7. Display published submissions in a paginated Hall of Fame.
8. Allow anonymous guests to rate active submissions from one to five stars.
9. Create a fairer daily competition than raw average rating alone.
10. Provide a unique shareable URL and social preview for every submission.
11. Keep each regular submission active for exactly seven days.
12. Automatically delete expired records and generated files.
13. Preserve a persistent music experience across internal navigation.
14. Deliver a polished responsive experience on desktop and mobile.
15. Complete the MVP without unnecessary backend infrastructure.

### 5.2 Success indicators

Initial product targets:

| Metric                                              |                              Initial target |
| --------------------------------------------------- | ------------------------------------------: |
| Landing visitors who enter the experience           |                                       ≥ 60% |
| Studio visitors who complete a valid look           |                                       ≥ 35% |
| Studio visitors who publish                         |                                       ≥ 20% |
| Published submissions receiving at least one rating |                                       ≥ 50% |
| Average ratings received per submission             |                                         ≥ 3 |
| Published submissions shared or downloaded          |                                       ≥ 10% |
| Successful publish operations                       |                                       ≥ 98% |
| Successful rating operations                        |                                       ≥ 99% |
| Hall of Fame page response time                     |  ≤ 1 second server time under expected load |
| Hall of Fame usable load time                       | ≤ 2.5 seconds on a normal mobile connection |
| Failed image render rate                            |                                        < 2% |
| Expired submission cleanup completion               |                       ≥ 99% within 24 hours |

These targets are operational starting points, not contractual guarantees.

---

## 6. Product Principles

### 6.1 Play first

Changing clothes, switching characters, and experimenting with combinations must feel immediate. Server requests must not occur for every outfit selection.

### 6.2 No-login does not mean no identity

Users see no account flow, but the backend assigns each browser a secure anonymous guest session.

### 6.3 Hall of Fame is a core feature

The Hall of Fame is not a decorative gallery. Its performance, discoverability, rating system, ranking logic, and sharing capability are launch-critical.

### 6.4 Use official assets only

Guests cannot upload images, clothes, backgrounds, text, SVG, URLs, or custom files. This greatly reduces moderation and security complexity.

### 6.5 Publish creates an immutable snapshot

A published look cannot be edited. A guest creates a new submission to publish a different combination.

### 6.6 Security must be proportional

The MVP uses strong server validation, secure cookies, rate limiting, database constraints, and conditional CAPTCHA. It does not introduce infrastructure that is not required for the expected scale.

### 6.7 Mobile is not a reduced desktop

The studio and Hall of Fame must be designed intentionally for touch interaction and smaller screens.

### 6.8 Generated images are product assets

Every published look must have a stable thumbnail, final download image, and social preview. Hall of Fame cards do not recompose all outfit layers in the browser.

---

## 7. Users and Jobs to Be Done

### 7.1 Casual visitor

**Context:** Opens White Chorus from a shared link, event page, or social post.

**Job to be done:**

> Let me understand the experience quickly and start creating without signing up.

**Needs:**

- clear entry action;
- simple controls;
- no registration;
- responsive layout;
- obvious music controls.

### 7.2 Creative participant

**Context:** Wants to build a coordinated look for both characters.

**Job to be done:**

> Let me experiment with two characters and publish a combination that feels unique.

**Needs:**

- both characters always visible;
- clear active-character state;
- fast outfit switching;
- reset and randomize;
- immediate preview;
- reliable publication.

### 7.3 Hall of Fame browser

**Context:** Primarily visits to explore, compare, and rate existing looks.

**Job to be done:**

> Let me discover the newest and best looks without loading a huge gallery.

**Needs:**

- nine-card pagination;
- fast thumbnails;
- clear rating summaries;
- sorting;
- active submission detail pages;
- daily winners.

### 7.4 Social sharer

**Context:** Wants to show a finished look to friends.

**Job to be done:**

> Let me download the image or share a link that looks good when opened in another app.

**Needs:**

- final image download;
- native sharing;
- copy link;
- correct Open Graph preview;
- stable public URL.

### 7.5 Product operator

**Context:** Monitors launch health and handles abnormal activity.

**Job to be done:**

> Let me detect failed renders, spam, cleanup failures, and suspicious rating activity without maintaining a complex admin system.

**Needs:**

- logs;
- database visibility;
- operational metrics;
- ability to hide a submission manually;
- cleanup status;
- configurable limits.

A custom moderation dashboard is not required for the first MVP. Manual intervention may use the database dashboard or a protected internal action.

---

## 8. Final Product Decisions

| Area                        | Final decision                                                       |
| --------------------------- | -------------------------------------------------------------------- |
| Product name                | White Chorus                                                         |
| Primary language            | English                                                              |
| Login                       | No login or registration                                             |
| Identity                    | Anonymous guest session via secure opaque cookie                     |
| Characters                  | Both characters are displayed and dressed together                   |
| Outfit inventory            | 5 initial items per category, expandable to 10                       |
| Background inventory        | 5 initial backgrounds, expandable to 10                              |
| User uploads                | Not allowed                                                          |
| Publication                 | Immediate after automated validation and successful image generation |
| Editing published looks     | Not allowed                                                          |
| Rating                      | 1–5 stars only                                                       |
| Text reviews/comments       | Not included                                                         |
| Hall of Fame page size      | 9 cards                                                              |
| Download                    | Final image can be downloaded                                        |
| Sharing                     | Public URL, native share, copy link, common social options           |
| Daily competition           | Included                                                             |
| Submission identity         | Anonymous                                                            |
| Regular submission lifetime | 7 days from publication                                              |
| Music                       | MP3, loops while site remains open, mute/unmute available            |
| Backend                     | Next.js full-stack                                                   |
| ORM                         | Prisma                                                               |
| Database                    | Supabase PostgreSQL                                                  |
| Storage                     | Supabase Storage for generated images                                |
| Image generation            | Sharp on the server                                                  |
| CAPTCHA                     | Conditional Cloudflare Turnstile                                     |
| Rate limiting               | Server-side with PostgreSQL-backed checks                            |
| Deployment                  | Vercel                                                               |
| Separate Elysia backend     | Not used                                                             |
| Supabase Anonymous Auth     | Not used                                                             |
| Redis                       | Not used for MVP                                                     |
| Queue worker                | Not used for MVP                                                     |

### 8.1 Interpretation of “five backgrounds per category”

For the MVP, White Chorus will provide **five backgrounds in total**, expandable to ten. The data model may optionally include a background group field later, but background categories are not required for launch.

---

## 9. Scope

### 9.1 P0: Required for launch

- English landing page.
- Entry choice with music or silent mode.
- Persistent looping MP3.
- Mute/unmute control.
- Anonymous guest session.
- Two characters visible together.
- Active-character selector.
- Shared background selector.
- Six outfit categories per character:
  - Hair;
  - Top;
  - Bottom;
  - One Piece;
  - Shoes;
  - Accessories.
- Five initial items per category.
- Five initial backgrounds.
- Asset system expandable to ten items/backgrounds.
- Real-time client-side visual preview.
- Reset both characters.
- Randomize both characters.
- Save local draft.
- Publish to Hall of Fame.
- Server-side validation.
- Duplicate detection.
- Configurable publish limits.
- Sharp-based final image rendering.
- Final downloadable image.
- Hall of Fame thumbnail.
- Social preview image.
- Supabase Storage upload.
- Hall of Fame with nine cards per page.
- Newest, Top Rated, and Trending sorting.
- Submission detail page.
- Star rating from 1 to 5.
- One rating per guest per outfit.
- Rating update.
- Self-rating prevention.
- Daily winner selection.
- Daily winner archive/snapshot.
- Public unique URL.
- Native share.
- Copy link.
- Direct share links where practical.
- Seven-day submission expiration.
- Scheduled cleanup.
- Responsive desktop and mobile layouts.
- Rate limiting.
- Conditional Turnstile.
- Basic logging and operational monitoring.

### 9.2 P1: Strongly recommended if time permits

- Individual reset for Character A and Character B.
- Individual randomize for Character A and Character B.
- Related looks on detail pages.
- Daily leaderboard before the day closes.
- Manual hide action for operators.
- Share and download analytics.
- Lightweight page transitions.
- Confetti after publishing.
- Character pose animation after publishing.
- “Time remaining” label on active submissions.

### 9.3 Out of scope for MVP

- Email/password authentication.
- Social login.
- Permanent user profiles.
- Usernames.
- Text comments or free-text reviews.
- User image uploads.
- User-generated outfit assets.
- Live chat.
- Following/followers.
- Favorites.
- Virtual currency.
- Marketplace.
- Real-time multiplayer.
- 3D characters.
- Complex skeletal animation.
- Drag-and-drop free positioning.
- Push notifications.
- Native mobile applications.
- Microservices.
- Message queues.
- Redis.
- Real-time subscriptions.
- A separate Elysia backend.
- A full custom moderation dashboard.

---

## 10. Information Architecture

### 10.1 Public routes

```text
/
├── Landing hero
├── Intro / music entry
├── How it works
├── Featured Hall of Fame
└── Calls to action

/studio
├── Character stage
├── Character selector
├── Background selector
├── Outfit categories
├── Item grid
├── Randomize
├── Reset
└── Publish

/hall-of-fame
├── Newest
├── Top Rated
├── Trending
├── Character/background filters if later required
├── 9-card grid
└── Pagination

/outfits/[id]
├── Final image
├── Anonymous look identifier
├── Average star rating
├── Rating count
├── Rate this look
├── Share
├── Download
├── Expiration status
└── Related looks, optional

/daily-winners
├── Live ranking for the current day, refreshed every 15 seconds
└── Previous daily winner snapshots

/daily-winners/[day]
└── Winner image and final statistics
```

### 10.2 System routes

```text
/api/guest/session
/api/outfits
/api/outfits/[id]
/api/outfits/[id]/rating
/api/outfits/[id]/share
/api/outfits/[id]/download
/api/cron/expire-outfits
/api/cron/select-daily-winner
/api/internal/outfits/[id]/hide
```

Internal and cron routes must be authenticated separately from guest sessions.

---

## 11. Primary User Journeys

### 11.1 Entering White Chorus

```text
User opens White Chorus
        ↓
Landing visuals and characters appear
        ↓
User chooses:
- Enter with Music
- Enter Silently
        ↓
Browser interaction unlocks audio playback
        ↓
Server creates or restores guest session
        ↓
User enters the studio
```

### 11.2 Creating a look

```text
Studio displays both characters
        ↓
User selects Character A or Character B as active
        ↓
User chooses a shared background
        ↓
User selects categories and outfit items
        ↓
Preview updates immediately
        ↓
User switches between characters as needed
        ↓
User optionally randomizes or resets
        ↓
Draft is saved locally
```

### 11.3 Publishing a look

```text
User selects Publish to Hall of Fame
        ↓
Client performs basic validation
        ↓
POST /api/outfits
        ↓
Server validates session, payload, asset IDs, limits, and duplicate hash
        ↓
Server creates PROCESSING record
        ↓
Sharp renders final image, thumbnail, and social preview
        ↓
Generated files upload to Supabase Storage
        ↓
Record becomes PUBLISHED
        ↓
Submission immediately appears in Hall of Fame
        ↓
Success page offers:
- View in Hall of Fame
- Download Image
- Share Outfit
- Create Another Look
```

### 11.4 Browsing the Hall of Fame

```text
User opens Hall of Fame
        ↓
Server returns 9 active submissions
        ↓
User selects Newest, Top Rated, or Trending
        ↓
URL preserves page and sort state
        ↓
User opens a submission detail page
```

### 11.5 Rating a look

```text
User opens active submission
        ↓
User selects 1–5 stars
        ↓
PUT /api/outfits/[id]/rating
        ↓
Server checks session, ownership, expiry, limits, and rating value
        ↓
Rating is inserted or updated
        ↓
Aggregate score refreshes
```

### 11.6 Downloading and sharing

```text
User opens published submission
        ↓
User chooses Download Image or Share Outfit
        ↓
Download:
- final image is returned with a friendly filename

Share:
- Web Share API opens when available
- otherwise copy link or platform link is used
        ↓
Shared URL displays the generated social preview
```

### 11.7 Daily winner selection

```text
Daily competition closes
        ↓
Cron runs at 00:05 Asia/Jakarta and calculates eligible scores
        ↓
Highest weighted score wins
        ↓
Tie-breakers are applied
        ↓
Winner snapshot is created
        ↓
Winner is shown in Daily Winners
        ↓
Original submission still follows its normal 7-day expiration
```

---

## 12. Functional Requirements

## 12.1 Landing page and entry

### FR-LP-001 — Product introduction

The landing page must communicate within the first viewport that users can:

- dress two characters;
- publish the result;
- enter the Hall of Fame;
- receive ratings;
- compete for a daily winner position.

### FR-LP-002 — Primary actions

The landing page must include:

- `Start Dressing`;
- `Explore Hall of Fame`.

### FR-LP-003 — Music entry

Before audible music begins, the user must make an explicit choice:

- `Enter with Music`;
- `Enter Silently`.

### FR-LP-004 — Session initialization

The application should create or restore the anonymous guest session when the user enters the experience or attempts the first state-changing action.

### FR-LP-005 — Featured Hall of Fame

The landing page may show up to three featured active submissions. These must use generated thumbnails, not live layer composition.

---

## 12.2 Anonymous guest session

### FR-GS-001 — No visible authentication

Users must not see a registration or login step.

### FR-GS-002 — Opaque session token

The server creates a cryptographically random session token. The database stores only its hash.

### FR-GS-003 — Cookie properties

The guest session cookie must use:

```text
HttpOnly
Secure
SameSite=Lax
Path=/
Max-Age=7 days
```

Recommended cookie name:

```text
wc_guest
```

### FR-GS-004 — Session restoration

Returning visitors using the same browser and cookie should retain the same guest identity until expiration.

### FR-GS-005 — Lost session

If the cookie is deleted, the user becomes a new guest. White Chorus does not promise identity recovery.

### FR-GS-006 — Client isolation

The browser must never be allowed to choose or overwrite the database `guestId`.

---

## 12.3 Dress-up studio

### FR-ST-001 — Two-character stage

Character A and Character B must be visible together throughout the dress-up process.

### FR-ST-002 — Active-character selection

The user must be able to choose which character is currently being edited.

Example control:

```text
[ Character A ] [ Character B ]
```

The active character must be visually clear through focus, border, glow, scale, or another non-ambiguous treatment.

### FR-ST-003 — Shared background

One background is shared by both characters in a submission.

### FR-ST-004 — Outfit categories

Each character supports:

- Hair;
- Top;
- Bottom;
- One Piece;
- Shoes;
- Accessories.

### FR-ST-005 — Initial and maximum inventory

Each category begins with five active items and must support up to ten without code changes.

Backgrounds begin with five and must support up to ten.

### FR-ST-006 — Item selection

Selecting an item immediately updates the visual preview without a page reload.

### FR-ST-007 — Category exclusivity

Rules:

- selecting a One Piece clears Top and Bottom;
- selecting Top or Bottom clears One Piece as required;
- one Hair item may be active per character;
- one Shoes item may be active per character;
- the MVP supports one active accessory per character unless design assets explicitly require multiple accessories.

The maximum accessories setting must be configurable.

### FR-ST-008 — Asset compatibility

Every item must be validated against:

- character;
- category;
- active status;
- allowed layer order.

### FR-ST-009 — Reset

`Reset All` restores:

- both character configurations;
- the default background;
- all default item selections.

### FR-ST-010 — Randomize

`Randomize All` creates a valid combination for:

- Character A;
- Character B;
- background.

The randomizer must respect One Piece versus Top/Bottom compatibility.

### FR-ST-011 — Draft persistence

The current configuration should be stored in `localStorage`.

Draft persistence includes:

- background;
- Character A configuration;
- Character B configuration;
- last active character.

### FR-ST-012 — Draft privacy

Drafts remain local and are not written to the database before publication.

### FR-ST-013 — Publish readiness

The Publish button is enabled only when:

- both characters have valid configurations;
- a background is selected;
- minimum outfit requirements are satisfied;
- no publish request is already active.

Minimum outfit requirement:

- each character must have either:
  - a One Piece; or
  - both Top and Bottom.

Hair, shoes, and accessories may be optional depending on the final art direction.

---

## 12.4 Asset manifest

### FR-AM-001 — Asset source

Official source assets should be stored as application-controlled static files available to the rendering server.

Generated user submission images are stored in Supabase Storage.

### FR-AM-002 — Common coordinate system

All assets for a character must use:

- the same canvas dimensions;
- the same anchor point;
- the same character position;
- transparent backgrounds where applicable.

### FR-AM-003 — Manifest fields

Each asset entry includes:

```text
id
characterId
category
filePath
layerOrder
active
displayName
thumbnailPath
metadata
```

### FR-AM-004 — Expansion

Adding items six through ten must require only:

- adding files;
- adding manifest entries;
- redeploying or refreshing the manifest.

Core dress-up code must not require category-specific rewrites.

---

## 12.5 Publishing

### FR-PB-001 — Publish request

The client sends configuration IDs only. It must not send:

- rendered images;
- remote URLs;
- file data;
- guest ID;
- average rating;
- rating count;
- status;
- expiry;
- owner fields.

### FR-PB-002 — Server validation

The server validates:

- guest session;
- JSON schema;
- asset IDs;
- character compatibility;
- category rules;
- maximum accessory count;
- campaign availability;
- publish limits;
- cooldown;
- duplicate hash;
- current submission processing state.

### FR-PB-003 — Immutable publication

Published configuration cannot be edited.

### FR-PB-004 — Duplicate detection

The server creates a canonical configuration and calculates a hash.

A guest cannot publish an identical configuration repeatedly within the duplicate-blocking window.

Recommended duplicate window:

```text
24 hours
```

The duration must be configurable.

### FR-PB-005 — Default publish limits

Default operational limits:

```text
5 successful publications per guest per rolling hour
15 successful publications per guest per calendar day
10-second cooldown between publish attempts
1 active image-rendering publication per guest
```

The values must be configurable without a code rewrite.

### FR-PB-006 — Limit counting

Only successful published submissions count toward the publication quota.

Failed validation or failed image rendering does not consume quota.

### FR-PB-007 — Processing state

The server creates a record with status `PROCESSING` before image rendering begins.

### FR-PB-008 — Successful publication

A submission becomes `PUBLISHED` only after all required image files are successfully created and stored.

### FR-PB-009 — Failed publication

If rendering or upload fails:

- status becomes `FAILED`;
- generated partial files are removed where possible;
- the user sees a retry-safe message;
- publication quota is not consumed.

### FR-PB-010 — Expiration

The server sets:

```text
expiresAt = publishedAt + 7 days
```

The client cannot alter this value.

---

## 12.6 Submission detail

### FR-SD-001 — Unique public route

Each active submission must be accessible at:

```text
/outfits/{outfitId}
```

### FR-SD-002 — Displayed information

The detail page displays:

- final image;
- anonymous short identifier;
- average rating;
- rating count;
- interactive star control;
- share button;
- copy link;
- download image;
- time remaining or expiry date;
- daily badge if applicable.

### FR-SD-003 — Anonymous identity

The page must not display:

- guest ID;
- session token;
- IP;
- device identifier;
- username;
- creator profile.

### FR-SD-004 — Short identifier

An anonymous display ID may be derived from the outfit ID, for example:

```text
Anonymous Look #A7F2
```

The identifier must not expose the guest identity.

### FR-SD-005 — Expired route

An expired submission must not expose the deleted asset.

Recommended behavior:

- return an expired page with HTTP `410 Gone` after cleanup;
- provide a call to action to create a new look;
- avoid redirecting silently to an unrelated page.

---

## 12.7 Hall of Fame

### FR-HF-001 — Page size

The Hall of Fame must return nine submissions per page.

### FR-HF-002 — Desktop grid

Desktop target:

```text
3 columns × 3 rows
```

### FR-HF-003 — Tablet grid

Tablet target:

```text
2 or 3 columns depending on available width
```

### FR-HF-004 — Mobile grid

Mobile target:

```text
1 or 2 columns depending on device width and card readability
```

### FR-HF-005 — Card contents

Each card displays:

- thumbnail;
- anonymous look identifier;
- average stars;
- rating count;
- publication recency or time remaining;
- daily rank badge where relevant;
- quick share action, optional.

### FR-HF-006 — Active-only query

Only submissions with:

```text
status = PUBLISHED
expiresAt > current time
```

may appear in the regular Hall of Fame.

### FR-HF-007 — Sorting

Required sorting modes:

1. `Newest`
2. `Top Rated`
3. `Trending`

### FR-HF-008 — URL state

Sort and page must be represented in the URL.

Example:

```text
/hall-of-fame?sort=top-rated&page=2
```

### FR-HF-009 — Pagination controls

Controls include:

- Previous;
- Next;
- current page;
- nearby page numbers when practical.

Changing pages should move focus or scroll to the top of the result grid.

### FR-HF-010 — Empty state

English empty-state example:

> No looks are available here yet. Be the first to enter the Hall of Fame.

### FR-HF-011 — Loading state

The Hall of Fame must display skeleton cards rather than a blank page during navigation.

### FR-HF-012 — Thumbnail-only listing

Hall of Fame cards must load the generated thumbnail, not the full final image and not the individual outfit layers.

---

## 12.8 Rating

### FR-RT-001 — Rating range

Valid rating values:

```text
1, 2, 3, 4, 5
```

### FR-RT-002 — One rating per guest per outfit

The database must enforce:

```text
UNIQUE(outfitId, guestId)
```

### FR-RT-003 — Rating update

A guest may change an existing rating. The existing row is updated instead of adding a second rating.

### FR-RT-004 — Self-rating prevention

The owner guest cannot rate their own submission.

### FR-RT-005 — Active submission requirement

Rating is allowed only when the outfit:

- is `PUBLISHED`;
- has not expired;
- is not hidden.

### FR-RT-006 — Server-controlled aggregates

The client sends only:

```json
{ "value": 4 }
```

The server/database calculates:

- average rating;
- rating count;
- weighted score.

### FR-RT-007 — Rating feedback

The UI should acknowledge a successful rating without requiring a full page reload.

### FR-RT-008 — Rate limiting

Default rating limit:

```text
30 rating writes per guest per rolling hour
```

A rating update counts as a rating write.

### FR-RT-009 — No text review

The MVP must not accept comment text, review text, captions, names, or user-entered descriptions.

---

## 12.9 Download

### FR-DL-001 — Final image download

Every published submission must offer a final downloadable image.

### FR-DL-002 — Format

Recommended user download format:

```text
PNG
```

A high-quality WebP may be retained internally, but the user-facing download should prioritize broad compatibility.

### FR-DL-003 — Filename

Example:

```text
white-chorus-A7F2.png
```

### FR-DL-004 — Content

The downloaded image includes:

- selected background;
- both fully composed characters;
- optional White Chorus logo or subtle watermark;
- no personal identity;
- no rating value embedded by default.

### FR-DL-005 — Download authorization

Active public submissions may be downloaded by any visitor. Winner snapshots may also be downloaded if enabled.

---

## 12.10 Social sharing

### FR-SH-001 — Public URL

Every active outfit has a public canonical URL.

### FR-SH-002 — Native share

Use `navigator.share` where supported.

### FR-SH-003 — Fallback actions

Fallback actions:

- Copy Link;
- WhatsApp;
- Facebook;
- X;
- Telegram.

### FR-SH-004 — Instagram handling

The MVP must not promise direct browser-to-Instagram posting. The supported fallback is:

- download image;
- use native share sheet where available;
- copy the public link.

### FR-SH-005 — Social preview

Each submission must have a 1200 × 630 social image or another platform-compatible landscape equivalent.

### FR-SH-006 — Share tracking

A lightweight share event may be recorded when a user selects a share action. White Chorus cannot guarantee that the external platform completed the share.

---

## 13. Hall of Fame and Daily Competition

## 13.1 Newest

`Newest` sorts active submissions by:

```text
publishedAt DESC
```

## 13.2 Top Rated

Raw average alone is not sufficient because a five-star submission with one rating should not automatically outrank a 4.8-star submission with many ratings.

White Chorus uses a weighted rating:

```text
Weighted Score =
(v / (v + m)) × R
+
(m / (v + m)) × C
```

Where:

```text
R = submission average rating
v = submission rating count
m = minimum competitive rating count
C = mean rating across eligible active submissions
```

Default:

```text
m = 5
```

A submission with fewer than five ratings may still appear, but its score is pulled toward the global mean.

## 13.3 Trending

The MVP uses a simple score, not a machine-learning ranking system.

Recommended signals:

```text
recent rating count
recent share clicks
current weighted rating
submission age decay
```

Illustrative formula:

```text
Trending Score =
(recentRatings24h × 3)
+ (recentShares24h × 1)
+ (weightedRating × 5)
- agePenalty
```

Exact weights are configurable and may be tuned after observing real traffic.

## 13.4 Daily period

Default operational timezone:

```text
Asia/Jakarta
```

Default daily period:

```text
Every calendar day 00:00:00
through
23:59:59 Asia/Jakarta
```

The timezone and schedule must be configurable.

## 13.5 Daily eligibility

A submission is eligible when:

- it was published during the daily period;
- it remains valid and not hidden at winner calculation time;
- it has at least five ratings;
- its creator did not rate it;
- no suspicious abuse flag disqualifies it.

For the MVP, a late submission receives less exposure than an early submission. This trade-off is accepted to keep the daily system simple.

## 13.6 Winner calculation

At the end of the daily period:

1. calculate final weighted score;
2. rank eligible submissions;
3. select the highest score.

Tie-breakers:

1. higher rating count;
2. higher raw average rating;
3. earlier publication time;
4. deterministic outfit ID order as the final technical tie-breaker.

## 13.7 No eligible winner

If no submission reaches the minimum rating count:

- select no official winner; or
- use the highest-rated submission with a visible `Community Pick` label.

The recommended MVP behavior is **no official winner** unless the minimum is met. This avoids presenting weak data as a confident result.

## 13.8 Winner snapshot

A daily winner snapshot contains:

- winner image path;
- day start;
- day end;
- final weighted score;
- final average;
- final rating count;
- anonymous look identifier;
- snapshot creation time.

The winner snapshot is separate from the regular submission.

## 13.9 Winner retention

Regular submissions expire after seven days.

Daily winner snapshots are retained for the duration of the White Chorus campaign or until an operator archives them. They contain no personal identity.

## 13.10 Daily Winners page

The page displays:

- live rank, weighted score, rating count, and eligibility for today;
- automatic refresh every 15 seconds and when the tab becomes visible;
- current or latest winner;
- previous winner snapshots;
- day label;
- final stars;
- final rating count;
- final image;
- share/download actions if enabled.

---

## 14. Rating System

### 14.1 Visual control

The rating control uses five selectable stars.

Accessibility requirements:

- each star has an accessible label;
- keyboard users can select a value;
- current selection is announced;
- hover and selected states are visually distinct.

### 14.2 Rating storage

Each rating stores:

```text
outfitId
guestId
value
createdAt
updatedAt
```

### 14.3 Aggregate consistency

Aggregate values must be recalculated within the same logical transaction as rating insert/update, or calculated from source ratings when queried.

For the MVP, recommended approach:

- store `ratingCount`;
- store `ratingAverage`;
- update them in a transaction after an upsert.

A scheduled integrity task may periodically verify aggregates.

### 14.4 Rating manipulation limits

The product cannot prove that one human equals one guest because users may:

- delete cookies;
- use private browsing;
- switch browsers;
- switch devices;
- use a VPN.

The MVP goal is to make abuse inconvenient and detectable, not impossible.

---

## 15. Social Sharing and Download

## 15.1 Share page metadata

Each submission detail page includes dynamic metadata:

```text
Title:
A New Look from White Chorus

Description:
Rate this anonymous look and discover more styles in the White Chorus Hall of Fame.

Open Graph image:
generated social image

Canonical URL:
https://{domain}/outfits/{id}
```

## 15.2 Social preview layout

The landscape social preview should include:

- both characters;
- a cropped or adapted version of the selected background;
- White Chorus branding;
- short look identifier;
- a small call to action such as `Rate this look`.

Rating values should not be embedded in the social image because they change over time.

## 15.3 Download image layout

The final downloadable image should use a vertical composition suitable for mobile sharing.

Recommended size:

```text
1200 × 1600
```

## 15.4 Share lifecycle

If a submission expires, an old external share link opens the expired submission page. The image may already have been removed according to retention policy.

Winner snapshots have independent share URLs and retention.

---

## 16. Music and Audio Experience

### 16.1 Music source

The MVP uses one MP3 file.

### 16.2 Playback behavior

- begins after user interaction;
- loops continuously while the White Chorus application remains open;
- persists across internal route changes;
- does not restart when navigating between Studio, Hall of Fame, and detail pages;
- can be muted and unmuted;
- remembers mute preference in `localStorage`.

### 16.3 Recommended default volume

```text
35%
```

The default must be configurable.

### 16.4 Application structure

The audio player should live in the root application layout or a persistent client provider.

```text
Root Layout
├── Music Provider
├── Header
├── Route Content
└── Persistent Music Control
```

### 16.5 Music controls

The control must clearly communicate:

- sound on;
- muted;
- playback unavailable.

### 16.6 Silent entry

`Enter Silently` loads the experience with music muted. The user may unmute later.

---

## 17. User Experience and Visual Direction

## 17.1 Visual personality

White Chorus should feel:

- dreamy;
- playful;
- elegant;
- youthful;
- soft;
- collectible;
- polished rather than childish.

Suggested visual language:

- pastel palette;
- organic shapes;
- soft shadows;
- subtle gradients;
- sparkles;
- rounded controls;
- gentle motion;
- clear focal stage.

## 17.2 Desktop studio

Recommended structure:

```text
---------------------------------------------------------
Header / Logo / Music / Hall of Fame
---------------------------------------------------------
Two-Character Stage       | Editing Panel
                          |
Both Characters Visible   | Active Character Selector
Shared Background         | Category Tabs
                          | Item Grid
                          | Reset / Randomize
                          | Publish
---------------------------------------------------------
Featured Hall of Fame / Footer
```

The stage should remain visible while the user browses outfit items.

## 17.3 Mobile studio

Recommended structure:

```text
Header + Music
Two-Character Stage
Active Character Switcher
Background Selector
Category Tabs
Scrollable Item Grid or Bottom Sheet
Reset / Randomize
Sticky Publish Button
```

The stage must remain readable without forcing the user to scroll far away from the characters.

## 17.4 Motion requirements

Recommended MVP motion:

- subtle idle breathing;
- occasional blink;
- fade/scale when applying an item;
- small sparkle on selection;
- smooth active-character transition;
- card elevation on desktop hover;
- star bounce on rating;
- brief success confetti;
- optional final pose after publication.

## 17.5 Motion constraints

- avoid constant movement in every element;
- do not block interaction while animation plays;
- keep transitions generally under 400 ms;
- support reduced motion.

## 17.6 English interface copy examples

```text
Start Dressing
Explore Hall of Fame
Character A
Character B
Choose a Background
Hair
Top
Bottom
One Piece
Shoes
Accessories
Randomize All
Reset All
Publish to Hall of Fame
Download Image
Share Outfit
Rate This Look
Newest
Top Rated
Trending
Daily Winners
```

---

## 18. Technical Architecture

## 18.1 Final stack

```text
Framework:           Next.js App Router
Language:            TypeScript
Styling:             Tailwind CSS
Animation:           Framer Motion
ORM:                 Prisma
Database:            Supabase PostgreSQL
Guest session:       Opaque HttpOnly cookie
Generated storage:   Supabase Storage
Image rendering:     Sharp
Validation:          Zod
Deployment:          Vercel
Bot protection:      Cloudflare Turnstile
Rate limiting:       PostgreSQL-backed application logic
Scheduled jobs:      Vercel Cron or Supabase Cron
```

## 18.2 Request architecture

```text
Browser
   ↓
Next.js UI
   ↓
Next.js Route Handler
   ↓
Guest session validation
   ↓
Origin and content-type validation
   ↓
Zod payload validation
   ↓
Rate-limit check
   ↓
Prisma
   ↓
Supabase PostgreSQL
   ↓
Sharp rendering
   ↓
Supabase Storage
```

## 18.3 Server runtime

Image-rendering routes must use the Node.js runtime, not Edge runtime.

## 18.4 No direct client database writes

The browser must not directly insert or update outfit and rating tables.

All state-changing requests go through Next.js server routes.

## 18.5 Source assets versus generated assets

Recommended separation:

```text
Official source assets:
- stored with the application or in a controlled read-only asset location
- versioned with deployment

Generated submission assets:
- stored in Supabase Storage
```

## 18.6 Why no queue

Expected publication volume is tens to hundreds of submissions, not sustained high-throughput media processing.

The MVP uses synchronous rendering:

```text
request → validate → render → upload → publish
```

A queue is introduced only if measured render latency or concurrency requires it.

## 18.7 Why no Redis

PostgreSQL is sufficient for:

- guest records;
- outfit records;
- rating constraints;
- rolling publication checks;
- hundreds of submissions;
- nine-card pagination.

Redis is deferred until there is evidence that database-backed limits or reads are inadequate.

---

## 19. Data Model

## 19.1 Enumerations

```text
OutfitStatus:
PROCESSING
PUBLISHED
FAILED
HIDDEN
EXPIRED

AssetCategory:
HAIR
TOP
BOTTOM
ONE_PIECE
SHOES
ACCESSORY
BACKGROUND
```

## 19.2 Guest

| Field            | Type            | Requirement                    |
| ---------------- | --------------- | ------------------------------ |
| id               | UUID            | Primary key                    |
| sessionTokenHash | String          | Unique; never expose           |
| ipHash           | String nullable | Abuse signal only              |
| userAgentHash    | String nullable | Optional signal                |
| createdAt        | DateTime        | Server-generated               |
| lastSeenAt       | DateTime        | Updated on meaningful activity |
| expiresAt        | DateTime        | Session cleanup                |

## 19.3 Outfit

| Field             | Type              | Requirement                |
| ----------------- | ----------------- | -------------------------- |
| id                | UUID              | Primary key                |
| guestId           | UUID              | Owner                      |
| shortCode         | String            | Unique public display code |
| backgroundId      | String            | Valid manifest ID          |
| characterAConfig  | JSON              | Validated canonical config |
| characterBConfig  | JSON              | Validated canonical config |
| configurationHash | String            | Duplicate detection        |
| finalImagePath    | String nullable   | Storage path               |
| downloadImagePath | String nullable   | PNG path if separate       |
| thumbnailPath     | String nullable   | Storage path               |
| socialImagePath   | String nullable   | Storage path               |
| status            | OutfitStatus      | State machine              |
| ratingAverage     | Decimal           | Default 0                  |
| ratingCount       | Integer           | Default 0                  |
| weightedScore     | Decimal           | Default 0                  |
| publishedAt       | DateTime nullable | Set on publication         |
| createdAt         | DateTime          | Set on record creation     |
| expiresAt         | DateTime nullable | Published + 7 days         |
| hiddenAt          | DateTime nullable | Operator action            |
| failureReason     | String nullable   | Internal only              |

Recommended indexes:

```text
(status, expiresAt)
(publishedAt DESC)
(weightedScore DESC)
(ratingAverage DESC, ratingCount DESC)
(configurationHash, guestId)
```

## 19.4 Rating

| Field     | Type     | Requirement      |
| --------- | -------- | ---------------- |
| id        | UUID     | Primary key      |
| outfitId  | UUID     | Foreign key      |
| guestId   | UUID     | Foreign key      |
| value     | SmallInt | 1–5              |
| createdAt | DateTime | Server-generated |
| updatedAt | DateTime | Server-generated |

Constraints:

```text
UNIQUE(outfitId, guestId)
CHECK(value >= 1 AND value <= 5)
```

Recommended indexes:

```text
(outfitId)
(guestId, createdAt)
```

## 19.5 DailyWinner

| Field              | Type            | Requirement                                  |
| ------------------ | --------------- | -------------------------------------------- |
| id                 | UUID            | Primary key                                  |
| sourceOutfitId     | UUID nullable   | May remain after source deletion as nullable |
| dayStart           | DateTime        | Competition period                           |
| dayEnd             | DateTime        | Competition period                           |
| shortCode          | String          | Winner display code                          |
| winnerImagePath    | String          | Persistent snapshot                          |
| socialImagePath    | String nullable | Winner share image                           |
| finalAverage       | Decimal         | Frozen value                                 |
| finalRatingCount   | Integer         | Frozen value                                 |
| finalWeightedScore | Decimal         | Frozen value                                 |
| createdAt          | DateTime        | Snapshot time                                |

Constraint:

```text
UNIQUE(dayStart, dayEnd)
```

## 19.6 ShareEvent

Optional lightweight table:

| Field     | Type          |
| --------- | ------------- |
| id        | UUID          |
| outfitId  | UUID          |
| guestId   | UUID nullable |
| channel   | String        |
| createdAt | DateTime      |

This table may be omitted if analytics tooling provides sufficient event tracking.

## 19.7 Illustrative Prisma schema

```prisma
enum OutfitStatus {
  PROCESSING
  PUBLISHED
  FAILED
  HIDDEN
  EXPIRED
}

model Guest {
  id               String   @id @default(uuid())
  sessionTokenHash String   @unique
  ipHash           String?
  userAgentHash    String?
  createdAt        DateTime @default(now())
  lastSeenAt       DateTime @default(now())
  expiresAt        DateTime

  outfits          Outfit[]
  ratings          Rating[]
}

model Outfit {
  id                 String       @id @default(uuid())
  guestId            String
  shortCode          String       @unique
  backgroundId       String
  characterAConfig   Json
  characterBConfig   Json
  configurationHash  String
  finalImagePath     String?
  downloadImagePath  String?
  thumbnailPath      String?
  socialImagePath    String?
  status             OutfitStatus @default(PROCESSING)
  ratingAverage      Decimal      @default(0)
  ratingCount        Int          @default(0)
  weightedScore      Decimal      @default(0)
  publishedAt        DateTime?
  createdAt          DateTime     @default(now())
  expiresAt          DateTime?
  hiddenAt           DateTime?
  failureReason      String?

  guest              Guest        @relation(fields: [guestId], references: [id], onDelete: Cascade)
  ratings            Rating[]

  @@index([status, expiresAt])
  @@index([publishedAt])
  @@index([weightedScore])
  @@index([guestId, configurationHash])
}

model Rating {
  id        String   @id @default(uuid())
  outfitId  String
  guestId   String
  value     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  outfit    Outfit   @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  guest     Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)

  @@unique([outfitId, guestId])
  @@index([outfitId])
  @@index([guestId, createdAt])
}

model DailyWinner {
  id                 String   @id @default(uuid())
  sourceOutfitId     String?
  dayStart          DateTime
  dayEnd            DateTime
  shortCode          String
  winnerImagePath    String
  socialImagePath    String?
  finalAverage       Decimal
  finalRatingCount   Int
  finalWeightedScore Decimal
  createdAt          DateTime @default(now())

  @@unique([dayStart, dayEnd])
}
```

The final schema may adjust provider-specific data types, but its behavior must match this PRD.

---

## 20. API Requirements

## 20.1 General API rules

All state-changing endpoints must:

- accept JSON unless serving downloads;
- require same-origin requests;
- validate `Origin` or `Referer`;
- reject unexpected content types;
- validate guest session;
- validate payload with Zod;
- return structured error codes;
- avoid exposing stack traces;
- apply rate limits;
- log failures with request correlation IDs.

## 20.2 Create or restore session

```http
POST /api/guest/session
```

Response:

```json
{
  "ok": true,
  "guest": {
    "expiresAt": "2026-08-09T06:00:00.000Z"
  }
}
```

The session token is sent only in the HttpOnly cookie.

## 20.3 Publish outfit

```http
POST /api/outfits
Content-Type: application/json
```

Request:

```json
{
  "backgroundId": "background-forest",
  "characterA": {
    "hairId": "a-hair-02",
    "topId": "a-top-04",
    "bottomId": "a-bottom-01",
    "onePieceId": null,
    "shoesId": "a-shoes-03",
    "accessoryIds": ["a-accessory-02"]
  },
  "characterB": {
    "hairId": "b-hair-01",
    "topId": null,
    "bottomId": null,
    "onePieceId": "b-one-piece-03",
    "shoesId": "b-shoes-04",
    "accessoryIds": ["b-accessory-01"]
  },
  "turnstileToken": null
}
```

Success:

```json
{
  "ok": true,
  "outfit": {
    "id": "uuid",
    "shortCode": "A7F2",
    "status": "PUBLISHED",
    "url": "/outfits/uuid",
    "publishedAt": "2026-08-02T06:00:00.000Z",
    "expiresAt": "2026-08-09T06:00:00.000Z",
    "remainingPublishesToday": 14
  }
}
```

Possible error codes:

```text
INVALID_SESSION
INVALID_CONFIGURATION
INVALID_ASSET
DUPLICATE_SUBMISSION
PUBLISH_RATE_LIMITED
PUBLISH_COOLDOWN
PUBLISH_ALREADY_PROCESSING
TURNSTILE_REQUIRED
TURNSTILE_FAILED
RENDER_FAILED
STORAGE_FAILED
CAMPAIGN_CLOSED
```

## 20.4 List Hall of Fame

```http
GET /api/outfits?sort=newest&page=1&pageSize=9
```

Allowed sort:

```text
newest
top-rated
trending
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "shortCode": "A7F2",
      "thumbnailUrl": "https://...",
      "ratingAverage": 4.7,
      "ratingCount": 23,
      "publishedAt": "2026-08-02T06:00:00.000Z",
      "expiresAt": "2026-08-09T06:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 9,
    "totalItems": 87,
    "totalPages": 10
  }
}
```

## 20.5 Get outfit detail

```http
GET /api/outfits/{id}
```

Must return `404` for unknown records and an expired response for deleted/expired content.

## 20.6 Upsert rating

```http
PUT /api/outfits/{id}/rating
Content-Type: application/json
```

Request:

```json
{
  "value": 5,
  "turnstileToken": null
}
```

Success:

```json
{
  "ok": true,
  "rating": {
    "value": 5
  },
  "aggregate": {
    "average": 4.8,
    "count": 24
  }
}
```

Error codes:

```text
INVALID_SESSION
INVALID_RATING
OUTFIT_NOT_FOUND
OUTFIT_EXPIRED
OUTFIT_HIDDEN
SELF_RATING_NOT_ALLOWED
RATING_RATE_LIMITED
TURNSTILE_REQUIRED
```

## 20.7 Record share intent

```http
POST /api/outfits/{id}/share
```

Request:

```json
{
  "channel": "whatsapp"
}
```

This endpoint records share intent, not confirmed external completion.

## 20.8 Download

```http
GET /api/outfits/{id}/download
```

Behavior:

- verifies outfit is active or winner snapshot is public;
- returns image with `Content-Disposition: attachment`;
- sets a friendly filename.

## 20.9 Cleanup cron

```http
POST /api/cron/expire-outfits
```

Must require a cron secret.

## 20.10 Daily winner cron

```http
POST /api/cron/select-daily-winner
```

Runs daily at `00:05 Asia/Jakarta`, must require a cron secret, and must be
idempotent.

---

## 21. Image Rendering Pipeline

## 21.1 Rendering inputs

The server receives only validated asset IDs.

The renderer resolves IDs to local or controlled asset paths.

## 21.2 Rendering order

Illustrative order:

```text
Background
Character A back hair
Character A base
Character A bottom
Character A shoes
Character A top or one piece
Character A front hair
Character A accessory
Character B back hair
Character B base
Character B bottom
Character B shoes
Character B top or one piece
Character B front hair
Character B accessory
Foreground effect, optional
Branding or watermark, optional
```

Actual order must be verified with the illustration team.

## 21.3 Required outputs

### Final web image

```text
1200 × 1600
WebP
high quality
```

### Download image

```text
1200 × 1600
PNG
```

If generating both creates unnecessary processing, the final WebP may be converted to PNG on demand. The selected approach should be measured during implementation.

### Hall of Fame thumbnail

```text
450 × 600
WebP
target under 100 KB when visually acceptable
```

### Social preview

```text
1200 × 630
JPEG or PNG
```

## 21.4 Storage paths

```text
outfits/{outfitId}/final.webp
outfits/{outfitId}/download.png
outfits/{outfitId}/thumbnail.webp
outfits/{outfitId}/social.jpg
daily-winners/{dayKey}/winner.webp
daily-winners/{dayKey}/social.jpg
```

## 21.5 Storage permissions

- public read for active generated images, if using public URLs;
- server-only write;
- server-only delete;
- no client upload;
- no client overwrite.

## 21.6 Rendering target

Recommended publish target:

```text
P95 render + upload completion under 5 seconds
```

## 21.7 Idempotency

The publish operation should use the outfit ID as its idempotency anchor.

Repeated internal attempts must not create multiple storage folders or multiple published records.

## 21.8 Partial failure cleanup

If:

- final succeeds;
- thumbnail fails;
- social succeeds;

the record must not become `PUBLISHED`.

The pipeline should delete partial files or mark them for orphan cleanup.

---

## 22. Security and Abuse Prevention

## 22.1 Security principles

1. Never trust client-supplied ownership or aggregate fields.
2. Do not expose database service credentials to the browser.
3. Do not allow direct guest writes to PostgreSQL or Storage.
4. Use allowlisted asset IDs only.
5. Apply database constraints even when server validation exists.
6. Make high-cost actions more restricted than low-cost play actions.
7. Store only the minimum abuse signals required.

## 22.2 Threat model

### Threat: submission spam

**Risk:** Hall of Fame flooding and image-processing cost.

**Controls:**

- five publications per hour;
- fifteen per day;
- ten-second cooldown;
- one active render per guest;
- duplicate hash;
- guest + IP-hash signals;
- conditional Turnstile.

### Threat: rating manipulation

**Risk:** unfair daily winner.

**Controls:**

- one guest rating per outfit;
- self-rating blocked;
- rating write limits;
- suspicious IP/guest pattern logging;
- weighted rating;
- minimum five ratings;
- operator ability to disqualify suspicious entries.

### Threat: IDOR

**Risk:** a guest attempts to edit or delete another outfit.

**Controls:**

- no guest edit/delete endpoint;
- published submissions are immutable;
- server resolves owner from session;
- internal operator actions require separate authorization.

### Threat: cookie theft or modification

**Controls:**

- opaque random token;
- HttpOnly;
- Secure;
- SameSite=Lax;
- token hash stored in database;
- token rotation may be added if needed.

### Threat: CSRF

Cookie-based state-changing routes must use:

- SameSite=Lax;
- same-origin checks;
- `Origin` or `Referer` validation;
- JSON-only writes;
- no cross-origin credential support.

### Threat: XSS

The MVP has no free-text user content.

Additional controls:

- avoid unsafe HTML rendering;
- apply Content Security Policy;
- escape all dynamic strings;
- do not render storage metadata as HTML.

### Threat: file upload attack

Not applicable because guests cannot upload files.

### Threat: SSRF

Not applicable to normal product flow because guests cannot submit external URLs.

### Threat: secret leakage

Controls:

- secrets stored in Vercel environment variables;
- no `NEXT_PUBLIC_` prefix for secrets;
- service-role keys used only server-side;
- secret scanning in source control;
- separate preview and production credentials.

## 22.3 Security headers

Recommended production headers:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
X-Frame-Options or CSP frame-ancestors
```

The exact Content Security Policy must allow required assets, Supabase Storage, analytics if used, and Turnstile.

## 22.4 IP privacy

Do not store raw IP addresses.

Recommended:

```text
ipHash = HMAC(serverSecret, normalizedIp)
```

The secret may rotate periodically. The IP hash is used only for abuse detection and rate limiting.

## 22.5 Turnstile strategy

Turnstile should not interrupt normal dress-up activity.

Trigger it when:

- guest session creation volume from an IP is abnormal;
- publish soft limit is approached;
- repeated invalid requests occur;
- rating velocity is suspicious;
- prior abuse signals exist.

## 22.6 Default rate limits

| Action                   |                          Default |
| ------------------------ | -------------------------------: |
| New guest sessions       |           5 per IP hash per hour |
| Publish                  |     5 per guest per rolling hour |
| Publish                  |             15 per guest per day |
| Publish cooldown         |                       10 seconds |
| Active publish process   |                      1 per guest |
| Rating writes            |            30 per guest per hour |
| Rating writes by IP hash | Configurable secondary threshold |
| Share event writes       |            30 per guest per hour |
| Download requests        |         60 per guest/IP per hour |

## 22.7 Database permissions

The application database role should have only the permissions it needs.

Supabase public client keys are not used for database writes.

## 22.8 Operator intervention

At minimum, operators must be able to:

- hide a published outfit;
- exclude an outfit from daily ranking;
- inspect failed rendering records;
- manually run cleanup;
- review suspicious activity logs.

For the MVP, these actions may use the Supabase dashboard or a protected internal route.

---

## 23. Data Retention and Cleanup

## 23.1 Regular submission retention

Each regular submission remains active for seven days from `publishedAt`.

## 23.2 Visibility expiration

As soon as:

```text
expiresAt <= current time
```

the submission must no longer appear in:

- Hall of Fame;
- Top Rated;
- Trending;
- Newest;
- daily eligibility.

## 23.3 Physical cleanup

A scheduled task runs at least daily.

Process:

```text
Find expired outfits
        ↓
Mark EXPIRED if required
        ↓
Delete final image
        ↓
Delete download image
        ↓
Delete thumbnail
        ↓
Delete social image
        ↓
Delete outfit record
        ↓
Ratings delete through cascade
        ↓
Log cleanup result
```

## 23.4 Orphan cleanup

A separate or combined task should find:

- storage folders without outfit records;
- failed outfit records older than a safe threshold;
- processing records stuck beyond the maximum expected render time.

Recommended stuck threshold:

```text
15 minutes
```

## 23.5 Guest retention

Recommended behavior:

- cookie expires after seven days;
- guest database record may remain up to fourteen days after last activity;
- guest record may be deleted once it owns no active outfits and has no active ratings.

## 23.6 Daily winner retention

Daily winner snapshots are not regular submissions.

They may remain for the campaign duration and be archived later.

## 23.7 Cleanup idempotency

Running the cleanup job twice must not corrupt data or produce errors that stop the whole job.

---

## 24. Performance Requirements

## 24.1 Studio performance

- outfit switching should feel immediate;
- no server request for ordinary item changes;
- use optimized static images;
- prefetch the active category;
- lazy-load non-active categories;
- cache official assets aggressively.

## 24.2 Hall of Fame performance

- nine thumbnails per page;
- server-side pagination;
- thumbnail only, not full image;
- use image dimensions to prevent layout shift;
- lazy-load below-the-fold cards;
- use database indexes for sort and expiry filters.

## 24.3 API targets

| Operation                     |                             Target |
| ----------------------------- | ---------------------------------: |
| Hall of Fame list P95         | < 500 ms application/database time |
| Outfit detail P95             | < 500 ms application/database time |
| Rating write P95              |                           < 750 ms |
| Publish render and upload P95 |                        < 5 seconds |
| Session creation P95          |                           < 500 ms |

## 24.4 Expected scale

The MVP is designed for:

- tens to hundreds of published submissions;
- hundreds to low thousands of ratings;
- nine-card paginated browsing;
- low to moderate simultaneous publishing.

It should not be designed as if it were a global social network.

## 24.5 Pagination method

Offset pagination is acceptable for the expected scale.

Cursor pagination is deferred until measured data volume or query performance requires it.

---

## 25. Accessibility Requirements

- keyboard-accessible controls;
- visible keyboard focus;
- rating control usable without a mouse;
- text alternatives for images;
- descriptive labels for music controls;
- minimum touch target approximately 44 × 44 CSS pixels;
- sufficient color contrast;
- no essential information conveyed only through color;
- reduced-motion support;
- no audible music before user interaction;
- correct heading hierarchy;
- buttons use semantic button elements;
- dialogs and bottom sheets manage focus correctly;
- loading and error states announced where practical.

---

## 26. SEO and Social Metadata

## 26.1 Landing page metadata

```text
Title:
White Chorus — Dress, Create, and Share

Description:
Dress two characters, publish your look to the Hall of Fame, earn community ratings, and compete for the daily spotlight.
```

## 26.2 Hall of Fame metadata

```text
Title:
White Chorus Hall of Fame

Description:
Discover the newest, highest-rated, and trending anonymous looks created in White Chorus.
```

## 26.3 Dynamic outfit metadata

Active outfit pages use the generated social image.

## 26.4 Indexing

- landing page: indexable;
- Hall of Fame: indexable;
- active outfit pages: indexable;
- expired outfit pages: `410 Gone` or `noindex`;
- internal API and operator routes: not indexable.

## 26.5 Sitemap

The sitemap may include:

- landing;
- Hall of Fame;
- Daily Winners;
- active submission URLs.

Expired URLs must be removed in the next sitemap generation.

---

## 27. Analytics and Product Metrics

## 27.1 Core events

```text
landing_view
enter_with_music
enter_silently
studio_view
character_selected
background_selected
outfit_item_selected
randomize_all
reset_all
publish_started
publish_success
publish_failed
hall_of_fame_view
hall_sort_changed
hall_page_changed
outfit_detail_view
rating_submitted
rating_updated
download_clicked
share_clicked
daily_winners_view
```

## 27.2 Funnel

Recommended funnel:

```text
Landing view
→ Enter experience
→ Studio view
→ Valid look completed
→ Publish started
→ Publish success
→ Share or download
```

## 27.3 Competition metrics

- eligible submissions per day;
- submissions below minimum rating count;
- winner weighted score;
- winner average;
- winner rating count;
- suspicious/disqualified submissions.

## 27.4 Privacy

Analytics must not expose:

- session tokens;
- raw IP;
- internal guest IDs in public dashboards;
- personal identity.

---

## 28. Logging, Monitoring, and Operations

## 28.1 Structured logs

Each server action should log:

```text
timestamp
requestId
operation
outfitId when applicable
guestId hash or internal ID
result
duration
errorCode
```

Do not log session tokens.

## 28.2 Required monitoring

Monitor:

- publish success rate;
- render duration;
- storage upload failures;
- rating errors;
- database connection errors;
- cleanup results;
- stuck PROCESSING records;
- daily winner job result;
- rate-limit blocks;
- Turnstile failures.

## 28.3 Alerts

Recommended alerts:

- publish failure rate > 5% over 15 minutes;
- cleanup job fails;
- daily winner job fails;
- database unavailable;
- storage upload failure spike;
- PROCESSING records older than 15 minutes.

## 28.4 Operational dashboard

A full custom dashboard is optional.

Initial operations may use:

- Vercel logs;
- Supabase dashboard;
- database queries;
- storage inspection;
- lightweight analytics dashboard.

---

## 29. Error Handling and User Messaging

All user-facing messages must be in English.

### Invalid session

> Your session has expired. Refresh the page to continue.

### Invalid configuration

> This look could not be published because one or more items are no longer available.

### Duplicate submission

> You already published this exact look. Change an item and try again.

### Publish limit

> You have reached the publishing limit for now. You can keep dressing and publish again later.

### Daily limit

> You have used all of today’s publication slots. Come back tomorrow to publish more looks.

### Cooldown

> Please wait a few seconds before publishing another look.

### Render failure

> We could not create your final image. Your publication limit was not used. Please try again.

### Rating blocked on own submission

> You cannot rate your own look.

### Expired outfit

> This look has completed its seven-day Hall of Fame run. Create a new look and join the chorus.

### Offline draft

> You appear to be offline. Your current look remains saved on this device.

### Generic server error

> Something went wrong. Please try again.

Internal stack traces and provider messages must never be displayed directly.

---

## 30. Testing and Quality Assurance

## 30.1 Unit tests

Required targets:

- canonical configuration creation;
- configuration hashing;
- asset compatibility;
- One Piece versus Top/Bottom rule;
- rating validation;
- weighted score;
- daily tie-breakers;
- expiration calculation;
- rate-limit window logic;
- short-code generation.

## 30.2 Integration tests

Required flows:

- create session;
- publish valid outfit;
- reject invalid asset;
- reject duplicate outfit;
- enforce publish limit;
- render and upload images;
- create Hall of Fame entry;
- upsert rating;
- block self-rating;
- block expired rating;
- cleanup expired submission;
- select daily winner;
- rerun winner cron idempotently.

## 30.3 End-to-end tests

Required user journeys:

1. enter with music;
2. mute and unmute;
3. dress both characters;
4. refresh and restore local draft;
5. publish;
6. open Hall of Fame;
7. paginate;
8. open detail;
9. rate;
10. download;
11. share or copy link;
12. view daily winner.

## 30.4 Visual tests

Verify:

- character alignment;
- clothing layer position;
- two-character composition;
- background crop;
- final image;
- thumbnail;
- social preview;
- desktop grid;
- mobile grid;
- reduced-motion state.

## 30.5 Browser matrix

Minimum:

- Chrome desktop;
- Safari desktop;
- Firefox desktop;
- iOS Safari;
- Android Chrome.

## 30.6 Security tests

- attempts to supply guestId;
- attempts to modify rating aggregate;
- attempts to publish invalid IDs;
- attempts to send HTML or URLs;
- cross-origin write request;
- repeated duplicate publication;
- repeated rating spam;
- direct Storage upload attempt;
- access to internal cron routes without secret;
- expired session behavior.

## 30.7 Load smoke test

Test:

- 100–500 active submissions;
- paginated Hall of Fame;
- concurrent rating writes;
- moderate concurrent publishes;
- cleanup against expired data.

The goal is confidence, not enterprise-scale benchmarking.

---

## 31. Deployment and Release Strategy

## 31.1 Environments

```text
Local
Preview
Production
```

Each environment uses separate:

- database credentials;
- Storage bucket or prefix;
- Turnstile configuration;
- cron secret;
- session hashing secret.

## 31.2 Database migration

Prisma migrations must run in a controlled deployment step.

## 31.3 Vercel deployment

Recommended:

- preview deployments for pull requests;
- production deployment from the protected main branch;
- Node runtime for Sharp routes;
- environment variables managed in Vercel.

## 31.4 CI checks

Before merge:

- TypeScript check;
- lint;
- unit tests;
- build;
- Prisma schema validation;
- secret scanning.

## 31.5 Rollback

Rollback must consider both application code and database migrations.

Avoid destructive migrations during the one-week campaign.

## 31.6 Feature controls

Recommended environment settings:

```text
REVIEWS_ENABLED=false
DAILY_WINNER_ENABLED=true
DOWNLOAD_ENABLED=true
SHARING_ENABLED=true
TURNSTILE_MODE=adaptive
```

Only star ratings exist in the MVP; `REVIEWS_ENABLED` remains false.

---

## 32. Seven-Day Implementation Plan

The schedule is realistic only when all character, clothing, background, logo, and music assets are ready before development begins.

## Day 1 — Foundation

- initialize Next.js and TypeScript;
- configure Tailwind;
- configure Prisma;
- connect Supabase PostgreSQL;
- create initial schema;
- configure Supabase Storage;
- implement guest session;
- create asset manifest format;
- establish desktop/mobile layout shell;
- configure music provider.

**Exit condition:** application runs, database connects, session cookie works, and assets can be resolved.

## Day 2 — Dress-up engine

- render both characters;
- implement background selection;
- implement active-character selector;
- implement categories;
- implement item selection;
- enforce category compatibility;
- implement reset;
- implement randomize;
- implement local draft;
- verify mobile stage.

**Exit condition:** a guest can complete a valid two-character look without publishing.

## Day 3 — Publication and image rendering

- implement publish schema;
- implement asset allowlist validation;
- implement duplicate hash;
- implement publish limits;
- create PROCESSING record;
- implement Sharp composition;
- generate final, thumbnail, social image;
- upload to Storage;
- publish record;
- implement failure cleanup.

**Exit condition:** a valid look produces stored images and a published database record.

## Day 4 — Hall of Fame

- create Hall of Fame query;
- implement nine-card pagination;
- implement Newest;
- implement Top Rated;
- implement Trending;
- create card;
- create detail page;
- handle expiry state;
- add skeleton loading.

**Exit condition:** published submissions can be browsed quickly on desktop and mobile.

## Day 5 — Rating, download, and sharing

- implement rating upsert;
- implement self-rating prevention;
- update aggregates;
- implement download;
- implement native share;
- implement copy link and platform links;
- implement dynamic metadata;
- verify social preview.

**Exit condition:** guests can rate, download, and share active looks.

## Day 6 — Daily winner, security, and cleanup

- implement weighted score;
- implement daily winner selection;
- implement winner snapshot;
- implement cleanup cron;
- implement orphan cleanup;
- add origin checks;
- add security headers;
- add Turnstile adaptive flow;
- add abuse logs;
- add protected operator hide action or documented database procedure.

**Exit condition:** daily and retention lifecycle works and core abuse controls are active.

## Day 7 — QA, polish, and production

- cross-browser testing;
- mobile testing;
- visual alignment check;
- performance optimization;
- music persistence validation;
- accessibility pass;
- production environment verification;
- cleanup dry run;
- winner cron dry run;
- deployment;
- launch checklist.

**Exit condition:** all P0 acceptance criteria pass.

---

## 33. Acceptance Criteria

## 33.1 Entry and music

- user can enter with music;
- user can enter silently;
- music loops after being started;
- music persists across internal navigation;
- mute/unmute works;
- mute preference survives refresh.

## 33.2 Studio

- both characters are visible together;
- active character can be switched;
- all categories load;
- five items per category are supported;
- system can support ten without code redesign;
- five backgrounds load;
- system can support ten without code redesign;
- item changes update immediately;
- One Piece and Top/Bottom rules work;
- reset works;
- randomize creates valid combinations;
- local draft restores after refresh.

## 33.3 Publish

- guest can publish without login;
- client cannot choose guest ID;
- server rejects invalid asset IDs;
- server rejects incompatible items;
- server rejects duplicate configuration;
- publish limits work;
- cooldown works;
- only one active render per guest is allowed;
- failed render does not consume successful quota;
- final, thumbnail, download, and social files are generated;
- published record receives seven-day expiry;
- successful submission appears immediately.

## 33.4 Hall of Fame

- nine cards appear per page where available;
- pagination works;
- Newest works;
- Top Rated uses weighted score;
- Trending uses recent signals;
- only active submissions appear;
- cards use thumbnails;
- card opens detail page;
- mobile and desktop grids are usable.

## 33.5 Rating

- rating accepts only 1–5;
- one guest has one rating per outfit;
- rating can be updated;
- self-rating is blocked;
- expired outfits cannot be rated;
- aggregate average and count update correctly;
- rating write limits work.

## 33.6 Download and share

- final image downloads with friendly filename;
- public URL works;
- dynamic social image is present;
- native share works where supported;
- copy link works;
- common share links work;
- no personal identity appears.

## 33.7 Daily winner

- daily period is calculated correctly;
- minimum rating count is enforced;
- weighted score is used;
- tie-breakers are deterministic;
- cron is idempotent;
- snapshot remains after source submission expires;
- no winner is declared when no entry qualifies, unless explicitly configured otherwise.

## 33.8 Retention

- submission disappears when seven days elapse;
- generated images are deleted;
- ratings cascade-delete;
- expired route behaves correctly;
- orphan cleanup works;
- cleanup logs results.

## 33.9 Security

- no direct client database write;
- no direct client Storage upload;
- service credentials are not exposed;
- state-changing routes validate origin;
- cookie is HttpOnly, Secure, and SameSite;
- rate limiting is active;
- adaptive Turnstile can be triggered;
- cron and internal routes require separate secrets;
- errors do not expose stack traces.

---

## 34. Definition of Done

White Chorus MVP is done when:

1. every P0 requirement is implemented;
2. every acceptance criterion passes;
3. production deployment is live;
4. source assets align correctly in generated images;
5. Hall of Fame works with at least 100 seeded test submissions;
6. rating constraints are verified at the database level;
7. daily winner selection is tested with deterministic fixtures;
8. seven-day expiration is tested using accelerated test timestamps;
9. Storage cleanup is verified;
10. production secrets are configured;
11. music behavior is verified on Safari and Chrome;
12. mobile layout is approved;
13. security checks pass;
14. rollback steps are documented;
15. operators know how to hide a submission and rerun cleanup.

---

## 35. Risks and Mitigations

| Risk                                              | Impact                       | Mitigation                                                       |
| ------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| Character assets use inconsistent canvas sizes    | Misaligned outfits           | Lock a shared asset template before development                  |
| Two-character composition feels crowded on mobile | Poor usability               | Scale stage carefully and use compact bottom controls            |
| Sharp rendering exceeds acceptable time           | Publish feels slow           | Optimize source dimensions and avoid unnecessary transformations |
| Storage contains partial files                    | Wasted storage               | Idempotent paths and orphan cleanup                              |
| Bot publication                                   | Hall of Fame spam            | Limits, duplicate hash, IP hash, adaptive Turnstile              |
| Rating manipulation                               | Unfair winner                | Unique guest rating, weighted score, minimum count, abuse review |
| Users delete cookies                              | New guest identity           | Accept as anonymous-system limitation                            |
| Late daily entries have less exposure             | Competition fairness concern | Accepted MVP trade-off; revisit with cohort windows later        |
| Social preview caches stale metadata              | Old preview remains          | Stable image per submission and cache-aware testing              |
| Music restarts on navigation                      | Broken experience            | Persistent root-layout audio provider                            |
| Autoplay is blocked                               | No music at entry            | Explicit entry interaction                                       |
| Asset count grows beyond ten                      | UI crowding                  | Scrollable item grid and lazy loading                            |
| One-week schedule slips                           | Incomplete launch            | Freeze P0 scope and ensure assets are ready first                |
| Winner source submission expires                  | Missing archive              | Store independent winner snapshot                                |
| Cron fails                                        | Expired content remains      | Alert on failure and provide manual rerun                        |
| Database connection limits                        | Intermittent API failures    | Use supported pooled connection and conservative concurrency     |

---

## 36. Future Roadmap

### Phase 1.1

- individual randomize/reset;
- filters by background or style;
- operator dashboard;
- better abuse scoring;
- share templates optimized for Stories;
- image download variants.

### Phase 2

- permanent accounts;
- favorites;
- saved personal gallery;
- badges;
- campaign challenges;
- themed daily competitions;
- more characters;
- more categories;
- seasonal collections.

### Phase 3

- creator-provided asset packs;
- moderation workflow;
- sponsored collections;
- rewards;
- advanced ranking;
- native mobile application.

No future feature should compromise the simplicity of the guest-first MVP unless supported by real user demand.

---

## 37. Required Inputs Before Development

The following must be available or locked before Day 1:

1. White Chorus logo.
2. Brand colors.
3. Primary and secondary fonts.
4. Character A base assets.
5. Character B base assets.
6. Five assets per outfit category for both characters.
7. Five backgrounds.
8. Layer order documentation.
9. Common canvas dimensions.
10. Anchor points for both characters.
11. Thumbnail images for item selectors.
12. Final MP3 music file.
13. Music usage rights confirmation.
14. Domain or temporary production URL.
15. Supabase project.
16. Supabase Storage bucket.
17. Vercel project.
18. Cloudflare Turnstile site and secret keys.
19. Default daily timezone confirmation.
20. Final watermark decision.
21. Exact campaign start date, if the site has a launch window.
22. Operator responsible for abuse review and cron monitoring.

---

## 38. Appendices

## Appendix A — Canonical outfit configuration

```json
{
  "backgroundId": "background-forest",
  "characterA": {
    "hairId": "a-hair-02",
    "topId": "a-top-04",
    "bottomId": "a-bottom-01",
    "onePieceId": null,
    "shoesId": "a-shoes-03",
    "accessoryIds": ["a-accessory-02"]
  },
  "characterB": {
    "hairId": "b-hair-01",
    "topId": null,
    "bottomId": null,
    "onePieceId": "b-one-piece-03",
    "shoesId": "b-shoes-04",
    "accessoryIds": ["b-accessory-01"]
  }
}
```

Canonicalization rules:

- keys always appear in a fixed order;
- arrays are sorted;
- absent optional values become `null` or empty arrays consistently;
- IDs are normalized exactly as defined in the manifest;
- no display labels are included in the hash.

## Appendix B — Suggested environment variables

```env
DATABASE_URL=
DIRECT_URL=

SESSION_COOKIE_NAME=wc_guest
SESSION_TOKEN_SECRET=
SESSION_MAX_AGE_SECONDS=604800

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=white-chorus-generated

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_MODE=adaptive

PUBLISH_LIMIT_PER_HOUR=5
PUBLISH_LIMIT_PER_DAY=15
PUBLISH_COOLDOWN_SECONDS=10
DUPLICATE_WINDOW_HOURS=24

RATING_LIMIT_PER_HOUR=30
SHARE_EVENT_LIMIT_PER_HOUR=30
DOWNLOAD_LIMIT_PER_HOUR=60

SUBMISSION_RETENTION_DAYS=7
GUEST_RETENTION_DAYS=14
STUCK_PROCESSING_MINUTES=15

DAILY_WINNER_ENABLED=true
DAILY_TIMEZONE=Asia/Jakarta
DAILY_MIN_RATINGS=5

MUSIC_DEFAULT_VOLUME=0.35

CRON_SECRET=
INTERNAL_ADMIN_SECRET=
```

## Appendix C — Suggested project structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── studio/
│   ├── hall-of-fame/
│   ├── outfits/[id]/
│   ├── daily-winners/
│   └── api/
│       ├── guest/session/
│       ├── outfits/
│       ├── outfits/[id]/
│       ├── outfits/[id]/rating/
│       ├── outfits/[id]/share/
│       ├── outfits/[id]/download/
│       ├── cron/expire-outfits/
│       └── cron/select-daily-winner/
├── components/
│   ├── audio/
│   ├── studio/
│   ├── hall-of-fame/
│   ├── rating/
│   └── shared/
├── lib/
│   ├── auth/
│   ├── database/
│   ├── rate-limit/
│   ├── security/
│   ├── validation/
│   ├── rendering/
│   ├── storage/
│   ├── ranking/
│   └── analytics/
├── assets/
│   ├── characters/
│   ├── outfits/
│   ├── backgrounds/
│   └── audio/
├── data/
│   └── asset-manifest.ts
└── prisma/
    └── schema.prisma
```

## Appendix D — Outfit state machine

```text
PROCESSING
   ├── success → PUBLISHED
   └── failure → FAILED

PUBLISHED
   ├── operator action → HIDDEN
   └── expiresAt reached → EXPIRED

HIDDEN
   └── optional operator restore → PUBLISHED, only if still active

EXPIRED
   └── cleanup → deleted
```

## Appendix E — Daily winner score example

Suppose:

```text
Submission A:
R = 5.0
v = 1

Submission B:
R = 4.8
v = 40

Global mean:
C = 4.2

Minimum:
m = 5
```

Submission A:

```text
(1 / 6 × 5.0) + (5 / 6 × 4.2)
= 4.33
```

Submission B:

```text
(40 / 45 × 4.8) + (5 / 45 × 4.2)
= 4.73
```

Submission B ranks higher because its rating has much stronger evidence.

## Appendix F — Launch checklist

- [ ] Production database migrated.
- [ ] Storage permissions verified.
- [ ] Service role not exposed.
- [ ] Session cookie secure in production.
- [ ] Turnstile configured.
- [ ] Cron secret configured.
- [ ] Cleanup cron scheduled.
- [ ] Daily winner cron scheduled.
- [ ] Music file loads and loops.
- [ ] Mute preference persists.
- [ ] Both characters align on desktop.
- [ ] Both characters align on mobile.
- [ ] Five items per category available.
- [ ] Five backgrounds available.
- [ ] Publish limits verified.
- [ ] Duplicate detection verified.
- [ ] Rating constraints verified.
- [ ] Social preview tested.
- [ ] Download filename tested.
- [ ] Expiry tested.
- [ ] Winner snapshot tested.
- [ ] Error pages tested.
- [ ] Cross-browser QA complete.
- [ ] Operator runbook shared.

---

**End of PRD**
