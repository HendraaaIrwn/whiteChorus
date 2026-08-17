# White Chorus

# Final Project Folder Architecture

**Document version:** 1.0 Final  
**Document type:** Project structure and code-organization specification  
**Project:** White Chorus  
**Architecture style:** Feature-oriented modular monolith  
**Framework:** Next.js App Router  
**Primary language:** TypeScript  
**Deployment:** Vercel  
**Database:** Supabase PostgreSQL through Prisma  
**Generated-file storage:** Supabase Storage  
**Image processing:** Sharp on the Node.js runtime  
**User identity:** Anonymous guest with an opaque `HttpOnly` cookie

---

## Table of Contents

1. [Tujuan Dokumen](#1-tujuan-dokumen)
2. [Keputusan Arsitektur](#2-keputusan-arsitektur)
3. [Prinsip Organisasi Kode](#3-prinsip-organisasi-kode)
4. [Struktur Folder Final](#4-struktur-folder-final)
5. [Penjelasan Folder Root](#5-penjelasan-folder-root)
6. [Struktur `src/app`](#6-struktur-srcapp)
7. [Struktur `src/features`](#7-struktur-srcfeatures)
8. [Struktur `src/components`](#8-struktur-srccomponents)
9. [Struktur `src/server`](#9-struktur-srcserver)
10. [Struktur `src/lib`, `src/config`, dan `src/types`](#10-struktur-srclib-srcconfig-dan-srctypes)
11. [Struktur Asset Dress-Up](#11-struktur-asset-dress-up)
12. [Prisma dan Database](#12-prisma-dan-database)
13. [API Route Mapping](#13-api-route-mapping)
14. [Image Rendering Pipeline](#14-image-rendering-pipeline)
15. [Guest Session dan Security Boundary](#15-guest-session-dan-security-boundary)
16. [Rate Limiting dan Abuse Protection](#16-rate-limiting-dan-abuse-protection)
17. [Hall of Fame dan Ranking](#17-hall-of-fame-dan-ranking)
18. [Daily Winner](#18-daily-winner)
19. [Music Architecture](#19-music-architecture)
20. [Testing Architecture](#20-testing-architecture)
21. [Scripts dan Automation](#21-scripts-dan-automation)
22. [Environment Variables](#22-environment-variables)
23. [Import Rules dan Dependency Direction](#23-import-rules-dan-dependency-direction)
24. [Naming Conventions](#24-naming-conventions)
25. [Server dan Client Component Rules](#25-server-dan-client-component-rules)
26. [Error Handling](#26-error-handling)
27. [Logging dan Observability](#27-logging-dan-observability)
28. [CI/CD dan GitHub](#28-cicd-dan-github)
29. [File Ownership per Fitur](#29-file-ownership-per-fitur)
30. [Contoh Alur Implementasi](#30-contoh-alur-implementasi)
31. [Urutan Pembuatan Folder](#31-urutan-pembuatan-folder)
32. [Folder yang Tidak Perlu Dibuat](#32-folder-yang-tidak-perlu-dibuat)
33. [Checklist Arsitektur](#33-checklist-arsitektur)
34. [Referensi Implementasi Resmi](#34-referensi-implementasi-resmi)

---

## 1. Tujuan Dokumen

Dokumen ini menetapkan struktur folder final untuk implementasi **White Chorus** berdasarkan PRD final.

Tujuannya adalah memastikan bahwa:

- route Next.js tetap tipis dan mudah dibaca;
- UI, business logic, dan infrastructure tidak bercampur;
- proses dress-up tetap cepat di browser;
- proses publish, rating, ranking, cleanup, dan image rendering tetap aman di server;
- dua karakter menggunakan satu sumber konfigurasi asset yang konsisten;
- project tetap sederhana untuk MVP, tetapi tidak berantakan ketika item bertambah dari 5 menjadi 10 per kategori;
- fitur Hall of Fame, rating, social sharing, download, dan daily winner dapat berkembang tanpa memerlukan refactor besar;
- tim tidak membuat abstraksi atau service yang belum dibutuhkan.

Dokumen ini bukan panduan microservices. White Chorus menggunakan **satu aplikasi Next.js full-stack**, satu database PostgreSQL, dan satu layanan object storage.

---

## 2. Keputusan Arsitektur

### 2.1 Architecture style

White Chorus menggunakan:

> **Feature-oriented modular monolith**

Artinya:

- seluruh aplikasi berada dalam satu repository;
- frontend dan backend berada dalam satu project Next.js;
- setiap fitur memiliki modul sendiri;
- database diakses melalui Prisma dari server;
- Route Handler hanya menjadi pintu masuk HTTP;
- business logic ditempatkan di feature use case;
- adapter database, storage, image renderer, dan security ditempatkan di `src/server`;
- tidak ada backend Elysia terpisah;
- tidak ada microservice;
- tidak ada Redis untuk MVP;
- tidak ada message queue untuk MVP.

### 2.2 Kenapa bukan struktur berdasarkan jenis file saja?

Struktur seperti ini tidak digunakan:

```text
components/
hooks/
services/
utils/
types/
```

tanpa pembagian fitur.

Struktur tersebut terlihat sederhana di awal, tetapi akan cepat menghasilkan folder besar berisi file dari banyak domain berbeda.

White Chorus memakai kombinasi:

```text
app/         → routing
features/    → domain dan use case
components/  → UI yang benar-benar shared
server/      → infrastructure server-only
lib/         → utility kecil dan generik
```

### 2.3 Prinsip “thin route, thick feature”

File berikut harus tipis:

```text
page.tsx
layout.tsx
route.ts
```

File route tidak boleh berisi seluruh implementasi bisnis.

Contoh tanggung jawab `route.ts`:

1. membaca request;
2. memanggil guest-session resolver;
3. memvalidasi origin dan content type;
4. memanggil use case;
5. memetakan hasil ke HTTP response.

Contoh tanggung jawab feature use case:

1. memvalidasi konfigurasi outfit;
2. memeriksa publish limit;
3. membuat record `PROCESSING`;
4. memanggil renderer;
5. mengunggah file;
6. membuat submission `PUBLISHED`;
7. menangani rollback parsial.

---

## 3. Prinsip Organisasi Kode

### 3.1 Satu file memiliki satu alasan utama untuk berubah

Contoh:

- `publish-outfit.ts` berubah ketika workflow publish berubah;
- `render-outfit.ts` berubah ketika pipeline Sharp berubah;
- `outfit.repository.ts` berubah ketika akses database Outfit berubah;
- `outfit-card.tsx` berubah ketika tampilan card berubah.

Jangan menggabungkan seluruh fitur dalam satu file `outfit-service.ts` berukuran ribuan baris.

### 3.2 Route bukan domain

Folder `src/app` mengikuti URL.

Folder `src/features` mengikuti produk.

Contoh:

```text
src/app/outfits/[id]/page.tsx
```

adalah halaman URL, sedangkan:

```text
src/features/outfits/
```

adalah domain submission outfit.

### 3.3 Infrastructure tidak boleh bocor ke UI

Komponen React tidak boleh langsung:

- memanggil Prisma;
- menggunakan Supabase service-role key;
- membaca environment secret;
- menjalankan Sharp;
- membaca raw cookie session;
- menghapus file Storage.

### 3.4 Business rule memiliki satu sumber

Aturan berikut tidak boleh ditulis ulang di banyak tempat:

- One Piece tidak boleh aktif bersama Top dan Bottom;
- satu guest hanya dapat memberi satu rating per outfit;
- pemilik tidak boleh memberi rating pada outfit sendiri;
- submission aktif selama tujuh hari;
- minimum daily winner adalah lima rating;
- maksimal publish default adalah 5 per jam dan 15 per hari.

Business rule ditempatkan pada modul domain/use case dan diuji.

### 3.5 Jangan membuat abstraction sebelum ada kebutuhan kedua

Contoh:

- tidak perlu `BaseRepository`;
- tidak perlu generic CRUD service;
- tidak perlu event bus;
- tidak perlu dependency-injection container;
- tidak perlu plugin system;
- tidak perlu folder `factories` untuk setiap object;
- tidak perlu interface untuk fungsi internal yang hanya memiliki satu implementasi.

Interface dibuat jika memang ada boundary yang perlu diganti atau diuji, seperti:

- storage adapter;
- image renderer;
- clock;
- random ID generator.

---

## 4. Struktur Folder Final

```text
white-chorus/
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   ├── white-chorus-prd-final.md
│   ├── white-chorus-project-architecture.md
│   ├── asset-production-guide.md
│   ├── api-contracts.md
│   ├── security-runbook.md
│   └── operations-runbook.md
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── audio/
│   │   └── white-chorus-theme.mp3
│   ├── brand/
│   │   ├── logo-horizontal.svg
│   │   ├── logo-mark.svg
│   │   ├── watermark-white.png
│   │   └── social-fallback.jpg
│   ├── dress-up/
│   │   ├── backgrounds/
│   │   │   ├── background-01.webp
│   │   │   ├── background-02.webp
│   │   │   ├── background-03.webp
│   │   │   ├── background-04.webp
│   │   │   └── background-05.webp
│   │   ├── character-a/
│   │   │   ├── base/
│   │   │   │   └── base.webp
│   │   │   ├── hair-back/
│   │   │   ├── hair-front/
│   │   │   ├── tops/
│   │   │   ├── bottoms/
│   │   │   ├── one-pieces/
│   │   │   ├── shoes/
│   │   │   ├── accessories/
│   │   │   └── thumbnails/
│   │   └── character-b/
│   │       ├── base/
│   │       │   └── base.webp
│   │       ├── hair-back/
│   │       ├── hair-front/
│   │       ├── tops/
│   │       ├── bottoms/
│   │       ├── one-pieces/
│   │       ├── shoes/
│   │       ├── accessories/
│   │       └── thumbnails/
│   └── icons/
│       ├── star.svg
│       ├── volume-on.svg
│       └── volume-off.svg
│
├── scripts/
│   ├── validate-dress-up-assets.ts
│   ├── verify-storage-access.ts
│   ├── seed-demo-submissions.ts
│   ├── expire-submissions-manually.ts
│   └── select-daily-winner-manually.ts
│
├── src/
│   ├── app/
│   │   ├── (site)/
│   │   │   ├── page.tsx
│   │   │   ├── studio/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── hall-of-fame/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── outfits/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── loading.tsx
│   │   │   │       ├── error.tsx
│   │   │   │       └── not-found.tsx
│   │   │   └── daily-winners/
│   │   │       ├── page.tsx
│   │   │       └── [day]/
│   │   │           ├── page.tsx
│   │   │           └── not-found.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── guest/
│   │   │   │   └── session/
│   │   │   │       └── route.ts
│   │   │   ├── outfits/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── rating/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── share/
│   │   │   │       │   └── route.ts
│   │   │   │       └── download/
│   │   │   │           └── route.ts
│   │   │   ├── daily-winners/
│   │   │   │   └── route.ts
│   │   │   ├── cron/
│   │   │   │   ├── expire-outfits/
│   │   │   │   │   └── route.ts
│   │   │   │   └── select-daily-winner/
│   │   │   │       └── route.ts
│   │   │   ├── internal/
│   │   │   │   └── outfits/
│   │   │   │       └── [id]/
│   │   │   │           └── hide/
│   │   │   │               └── route.ts
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── not-found.tsx
│   │   ├── manifest.ts
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   │
│   ├── components/
│   │   ├── feedback/
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-panel.tsx
│   │   │   └── loading-spinner.tsx
│   │   ├── layout/
│   │   │   ├── site-footer.tsx
│   │   │   ├── site-header.tsx
│   │   │   └── site-shell.tsx
│   │   ├── providers/
│   │   │   ├── app-providers.tsx
│   │   │   └── music-provider.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── icon-button.tsx
│   │       ├── pagination.tsx
│   │       ├── skeleton.tsx
│   │       ├── tabs.tsx
│   │       └── toast.tsx
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── public-config.ts
│   │   ├── limits.ts
│   │   └── routes.ts
│   │
│   ├── features/
│   │   ├── audio/
│   │   │   ├── components/
│   │   │   │   ├── entry-audio-gate.tsx
│   │   │   │   └── music-control.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-music.ts
│   │   │   └── music.types.ts
│   │   │
│   │   ├── dress-up/
│   │   │   ├── catalog/
│   │   │   │   ├── asset-catalog.ts
│   │   │   │   ├── backgrounds.ts
│   │   │   │   ├── character-a.ts
│   │   │   │   └── character-b.ts
│   │   │   ├── components/
│   │   │   │   ├── active-character-switcher.tsx
│   │   │   │   ├── background-selector.tsx
│   │   │   │   ├── character-canvas.tsx
│   │   │   │   ├── character-layer-stack.tsx
│   │   │   │   ├── dress-up-studio.tsx
│   │   │   │   ├── item-card.tsx
│   │   │   │   ├── item-grid.tsx
│   │   │   │   ├── outfit-category-tabs.tsx
│   │   │   │   ├── publish-bar.tsx
│   │   │   │   └── studio-stage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-dress-up-draft.ts
│   │   │   │   └── use-dress-up-state.ts
│   │   │   ├── model/
│   │   │   │   ├── dress-up.actions.ts
│   │   │   │   ├── dress-up.defaults.ts
│   │   │   │   ├── dress-up.reducer.ts
│   │   │   │   ├── dress-up.selectors.ts
│   │   │   │   ├── dress-up.schema.ts
│   │   │   │   ├── dress-up.types.ts
│   │   │   │   └── normalize-configuration.ts
│   │   │   └── lib/
│   │   │       ├── randomize-outfit.ts
│   │   │       └── validate-client-outfit.ts
│   │   │
│   │   ├── guest-session/
│   │   │   ├── guest-session.constants.ts
│   │   │   ├── guest-session.types.ts
│   │   │   └── server/
│   │   │       ├── create-guest-session.ts
│   │   │       ├── get-current-guest.ts
│   │   │       ├── refresh-guest-session.ts
│   │   │       └── guest-session.repository.ts
│   │   │
│   │   ├── outfits/
│   │   │   ├── components/
│   │   │   │   ├── outfit-detail.tsx
│   │   │   │   ├── outfit-expired-state.tsx
│   │   │   │   ├── outfit-image.tsx
│   │   │   │   └── publish-success-panel.tsx
│   │   │   ├── schemas/
│   │   │   │   ├── outfit-id.schema.ts
│   │   │   │   └── publish-outfit.schema.ts
│   │   │   ├── server/
│   │   │   │   ├── get-outfit-detail.ts
│   │   │   │   ├── list-outfits.ts
│   │   │   │   ├── publish-outfit.ts
│   │   │   │   ├── hide-outfit.ts
│   │   │   │   ├── expire-outfits.ts
│   │   │   │   ├── calculate-configuration-hash.ts
│   │   │   │   └── outfit.repository.ts
│   │   │   ├── outfit.errors.ts
│   │   │   ├── outfit.mapper.ts
│   │   │   └── outfit.types.ts
│   │   │
│   │   ├── hall-of-fame/
│   │   │   ├── components/
│   │   │   │   ├── hall-of-fame-grid.tsx
│   │   │   │   ├── hall-of-fame-toolbar.tsx
│   │   │   │   ├── outfit-card.tsx
│   │   │   │   └── sort-tabs.tsx
│   │   │   ├── schemas/
│   │   │   │   └── hall-query.schema.ts
│   │   │   ├── server/
│   │   │   │   └── get-hall-of-fame-page.ts
│   │   │   ├── hall-of-fame.constants.ts
│   │   │   └── hall-of-fame.types.ts
│   │   │
│   │   ├── ratings/
│   │   │   ├── components/
│   │   │   │   ├── rating-summary.tsx
│   │   │   │   └── star-rating.tsx
│   │   │   ├── schemas/
│   │   │   │   └── submit-rating.schema.ts
│   │   │   ├── server/
│   │   │   │   ├── upsert-rating.ts
│   │   │   │   ├── recalculate-rating-aggregate.ts
│   │   │   │   └── rating.repository.ts
│   │   │   ├── rating.errors.ts
│   │   │   └── rating.types.ts
│   │   │
│   │   ├── sharing/
│   │   │   ├── components/
│   │   │   │   ├── download-button.tsx
│   │   │   │   ├── share-button.tsx
│   │   │   │   └── share-dialog.tsx
│   │   │   ├── lib/
│   │   │   │   ├── build-share-links.ts
│   │   │   │   └── build-download-filename.ts
│   │   │   └── server/
│   │   │       └── record-share-intent.ts
│   │   │
│   │   ├── daily-winners/
│   │   │   ├── components/
│   │   │   │   ├── daily-winner-card.tsx
│   │   │   │   └── daily-winner-list.tsx
│   │   │   ├── server/
│   │   │   │   ├── calculate-weighted-score.ts
│   │   │   │   ├── get-day-period.ts
│   │   │   │   ├── get-daily-winners.ts
│   │   │   │   ├── select-daily-winner.ts
│   │   │   │   └── daily-winner.repository.ts
│   │   │   ├── daily-winner.errors.ts
│   │   │   └── daily-winner.types.ts
│   │   │
│   │   └── abuse-protection/
│   │       ├── server/
│   │       │   ├── assert-origin.ts
│   │       │   ├── check-publish-limit.ts
│   │       │   ├── check-rating-limit.ts
│   │       │   ├── evaluate-turnstile-requirement.ts
│   │       │   └── verify-turnstile.ts
│   │       ├── abuse.constants.ts
│   │       └── abuse.types.ts
│   │
│   ├── server/
│   │   ├── database/
│   │   │   ├── prisma.ts
│   │   │   └── transaction.ts
│   │   ├── rendering/
│   │   │   ├── compose-final-image.ts
│   │   │   ├── compose-social-image.ts
│   │   │   ├── compose-thumbnail.ts
│   │   │   ├── load-render-assets.ts
│   │   │   ├── render-outfit-bundle.ts
│   │   │   ├── rendering.constants.ts
│   │   │   └── rendering.types.ts
│   │   ├── storage/
│   │   │   ├── delete-outfit-files.ts
│   │   │   ├── get-public-file-url.ts
│   │   │   ├── storage-client.ts
│   │   │   ├── storage-paths.ts
│   │   │   └── upload-outfit-files.ts
│   │   ├── security/
│   │   │   ├── cookie-options.ts
│   │   │   ├── hash-ip.ts
│   │   │   ├── hash-session-token.ts
│   │   │   ├── require-cron-secret.ts
│   │   │   ├── require-internal-secret.ts
│   │   │   ├── secure-random-token.ts
│   │   │   └── security-headers.ts
│   │   ├── observability/
│   │   │   ├── create-request-context.ts
│   │   │   ├── logger.ts
│   │   │   └── metrics.ts
│   │   └── time/
│   │       ├── clock.ts
│   │       └── timezone.ts
│   │
│   ├── lib/
│   │   ├── cn.ts
│   │   ├── date-format.ts
│   │   ├── invariant.ts
│   │   ├── pagination.ts
│   │   ├── safe-json.ts
│   │   └── short-code.ts
│   │
│   └── types/
│       ├── api-response.ts
│       └── branded.ts
│
├── tests/
│   ├── e2e/
│   │   ├── entry-and-music.spec.ts
│   │   ├── dress-up.spec.ts
│   │   ├── publish.spec.ts
│   │   ├── hall-of-fame.spec.ts
│   │   ├── rating.spec.ts
│   │   ├── sharing.spec.ts
│   │   └── daily-winner.spec.ts
│   ├── integration/
│   │   ├── outfit-publish.integration.test.ts
│   │   ├── rating.integration.test.ts
│   │   ├── cleanup.integration.test.ts
│   │   └── daily-winner.integration.test.ts
│   ├── fixtures/
│   │   ├── dress-up-configurations.ts
│   │   ├── outfit-records.ts
│   │   └── rating-records.ts
│   └── helpers/
│       ├── create-test-guest.ts
│       ├── reset-test-database.ts
│       └── seed-test-assets.ts
│
├── .editorconfig
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── prettier.config.mjs
├── README.md
├── tsconfig.json
├── vercel.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## 5. Penjelasan Folder Root

## 5.1 `.github/`

Berisi workflow dan aturan kolaborasi GitHub.

```text
.github/
├── CODEOWNERS
├── pull_request_template.md
└── workflows/ci.yml
```

### `CODEOWNERS`

Opsional jika tim kecil, tetapi berguna untuk menentukan reviewer default.

Contoh area:

```text
/src/features/dress-up/     @frontend-owner
/src/server/rendering/      @backend-owner
/prisma/                    @backend-owner
/public/dress-up/           @art-owner
```

### `pull_request_template.md`

Memastikan setiap PR menjelaskan:

- tujuan;
- screenshot desktop/mobile;
- perubahan schema;
- perubahan environment variable;
- pengujian;
- dampak terhadap asset rendering.

### `workflows/ci.yml`

Menjalankan:

```text
install
lint
typecheck
unit tests
integration tests when configured
build
Prisma schema validation
asset validation
```

---

## 5.2 `docs/`

Berisi dokumentasi yang harus dapat dibaca tanpa membuka chat.

```text
docs/
├── white-chorus-prd-final.md
├── white-chorus-project-architecture.md
├── asset-production-guide.md
├── api-contracts.md
├── security-runbook.md
└── operations-runbook.md
```

### Dokumen minimum

#### `asset-production-guide.md`

Menjelaskan:

- ukuran canvas;
- posisi anchor;
- naming asset;
- format WebP/PNG;
- transparansi;
- layer order;
- aturan Character A dan B;
- checklist sebelum asset masuk repository.

#### `security-runbook.md`

Menjelaskan:

- cara rotasi secret;
- cara memblokir submission;
- cara membaca abuse log;
- cara menonaktifkan publishing;
- cara memaksa Turnstile.

#### `operations-runbook.md`

Menjelaskan:

- cara menjalankan cleanup manual;
- cara memilih daily winner manual;
- cara memeriksa `PROCESSING` yang tersangkut;
- cara menghapus orphan file;
- cara rollback deployment.

---

## 5.3 `prisma/`

```text
prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```

### Aturan

- semua perubahan schema melalui migration;
- migration yang sudah masuk production tidak diedit;
- `seed.ts` hanya membuat data lokal/demo yang aman;
- jangan menyimpan credential database di folder ini;
- jangan menaruh query aplikasi di `seed.ts`.

---

## 5.4 `public/`

Berisi asset statis yang dapat diakses browser.

Next.js menyajikan file di `public` dari root URL. Contoh:

```text
public/audio/white-chorus-theme.mp3
```

diakses melalui:

```text
/audio/white-chorus-theme.mp3
```

Folder ini memiliki tiga kategori utama:

```text
brand/
dress-up/
audio/
```

Generated user submissions **tidak** disimpan di sini. Generated submissions masuk ke Supabase Storage.

---

## 5.5 `scripts/`

Script ini dijalankan manual atau dari CI, bukan dari request user biasa.

```text
scripts/
├── validate-dress-up-assets.ts
├── verify-storage-access.ts
├── seed-demo-submissions.ts
├── expire-submissions-manually.ts
└── select-daily-winner-manually.ts
```

Jangan membuat script menjadi cara utama aplikasi bekerja. Semua proses penting tetap memiliki use case server yang dapat dipanggil oleh cron maupun script.

Contoh:

```text
scripts/select-daily-winner-manually.ts
```

memanggil function:

```text
src/features/daily-winners/server/select-daily-winner.ts
```

Bukan menulis ulang algoritmanya.

---

## 6. Struktur `src/app`

`src/app` adalah lapisan routing Next.js.

Next.js menggunakan folder sebagai route segment. Route group `(site)` digunakan hanya untuk organisasi dan tidak muncul pada URL.

## 6.1 Root layout

```text
src/app/layout.tsx
```

Tanggung jawab:

- elemen `<html>` dan `<body>`;
- global metadata;
- `AppProviders`;
- `MusicProvider`;
- global toast;
- global font;
- global site shell jika benar-benar berlaku untuk semua halaman.

Music provider harus berada di root layout agar musik tidak restart ketika user pindah dari:

```text
/studio
/hall-of-fame
/outfits/[id]
```

Jangan membuat beberapa root layout yang memutus audio persistence.

## 6.2 Route group `(site)`

```text
src/app/(site)/
```

Semua halaman publik berada dalam group ini.

Folder `(site)` tidak muncul dalam URL.

Contoh:

```text
src/app/(site)/studio/page.tsx
```

tetap menghasilkan:

```text
/studio
```

## 6.3 Landing page

```text
src/app/(site)/page.tsx
```

Halaman ini menyusun:

- hero;
- audio entry gate;
- CTA;
- featured Hall of Fame;
- how it works.

Business logic featured outfits tetap di feature Hall of Fame.

## 6.4 Studio

```text
src/app/(site)/studio/page.tsx
```

Halaman server hanya:

- memuat asset catalog publik;
- memuat konfigurasi publik;
- merender `DressUpStudio`.

State interaktif studio berada dalam Client Component di feature `dress-up`.

## 6.5 Hall of Fame

```text
src/app/(site)/hall-of-fame/page.tsx
```

Tanggung jawab:

- membaca `searchParams`;
- memvalidasi query melalui `hall-query.schema.ts`;
- memanggil `get-hall-of-fame-page.ts`;
- merender toolbar, grid, dan pagination.

Jangan melakukan query Prisma langsung di `page.tsx`.

## 6.6 Outfit detail

```text
src/app/(site)/outfits/[id]/page.tsx
```

Tanggung jawab:

- memvalidasi ID;
- mengambil detail outfit;
- memanggil `notFound()` jika tidak ada;
- menampilkan expired state jika sesuai;
- menghasilkan metadata dinamis dari `socialImagePath`.

## 6.7 Daily Winners

```text
src/app/(site)/daily-winners/
```

Halaman list menampilkan live ranking hari berjalan yang polling setiap 15 detik,
diikuti snapshot pemenang harian. Halaman detail menampilkan satu snapshot final.

Snapshot tidak bergantung pada file submission reguler yang akan dihapus setelah tujuh hari.

## 6.8 API routes

Semua endpoint menggunakan Route Handler:

```text
route.ts
```

Route Handler tidak boleh digunakan sebagai tempat menulis seluruh business logic.

Contoh:

```text
src/app/api/outfits/route.ts
```

boleh menangani:

```text
GET  → list outfit
POST → publish outfit
```

Namun implementasi utama berada di:

```text
src/features/outfits/server/
```

## 6.9 Cron routes

```text
src/app/api/cron/
```

Cron routes:

- tidak menggunakan guest session;
- memerlukan `CRON_SECRET`;
- bersifat idempotent;
- mencatat request ID;
- mengembalikan summary hasil.

## 6.10 Internal routes

```text
src/app/api/internal/
```

Hanya untuk operasi internal yang sangat kecil, seperti hide submission.

Tidak boleh dibuka sebagai admin API publik.

---

## 7. Struktur `src/features`

`src/features` adalah pusat domain White Chorus.

Setiap feature hanya memiliki folder yang benar-benar dibutuhkan.

Pola umum:

```text
feature-name/
├── components/      # UI feature-specific
├── hooks/           # hook feature-specific
├── schemas/         # input validation
├── model/           # state/domain model
├── lib/             # pure helper feature-specific
├── server/          # use case dan repository server-only
├── feature.errors.ts
└── feature.types.ts
```

Tidak semua feature harus memiliki semua folder.

---

## 7.1 `features/audio`

Mengelola UX musik, bukan file MP3 itu sendiri.

```text
audio/
├── components/
├── hooks/
└── music.types.ts
```

### Boleh berisi

- entry gate;
- mute/unmute;
- audio state;
- localStorage preference;
- persistent audio element.

### Tidak boleh berisi

- Supabase;
- Prisma;
- rating;
- outfit rendering;
- guest token.

---

## 7.2 `features/dress-up`

Feature paling besar di sisi client.

```text
dress-up/
├── catalog/
├── components/
├── hooks/
├── model/
└── lib/
```

### `catalog/`

Sumber kebenaran untuk asset resmi.

```text
catalog/
├── asset-catalog.ts
├── backgrounds.ts
├── character-a.ts
└── character-b.ts
```

Setiap item mendefinisikan:

```ts
type DressUpAsset = {
  id: string;
  characterId: "character-a" | "character-b" | null;
  category:
    | "background"
    | "hair"
    | "top"
    | "bottom"
    | "one-piece"
    | "shoes"
    | "accessory";
  iconSrc: string;
  assetSrcs: string[];
  iconPresentation: "standard" | "framed-square";
  layerOrder: number;
  active: boolean;
};
```

`assetSrcs` dapat memuat dua file rambut:

```text
hair-back
hair-front
```

jika satu hairstyle membutuhkan bagian depan dan belakang.

### `model/`

Berisi state dan pure domain rule.

```text
dress-up.reducer.ts
dress-up.selectors.ts
dress-up.schema.ts
normalize-configuration.ts
```

### Aturan penting

- state studio tidak disimpan di database sebelum publish;
- draft disimpan di localStorage;
- client validation hanya untuk UX;
- server tetap melakukan validasi penuh saat publish.

---

## 7.3 `features/guest-session`

Mengelola anonymous guest identity.

```text
guest-session/
├── guest-session.constants.ts
├── guest-session.types.ts
└── server/
```

Karena token session bersifat server-only, sebagian besar logic berada di folder `server`.

### Repository

```text
guest-session.repository.ts
```

Hanya bertanggung jawab atas operasi database Guest.

### Use case

```text
create-guest-session.ts
get-current-guest.ts
refresh-guest-session.ts
```

Cookie detail berada di `src/server/security/cookie-options.ts`.

Dengan demikian, feature session tidak bergantung pada implementasi cookie secara berlebihan.

---

## 7.4 `features/outfits`

Mengelola lifecycle submission.

```text
outfits/
├── components/
├── schemas/
├── server/
├── outfit.errors.ts
├── outfit.mapper.ts
└── outfit.types.ts
```

### Use case utama

```text
publish-outfit.ts
```

Workflow:

1. menerima authenticated guest internal;
2. memvalidasi configuration;
3. normalize configuration;
4. memeriksa duplicate hash;
5. memeriksa rate limit;
6. membuat `PROCESSING`;
7. memanggil `render-outfit-bundle`;
8. mengunggah files;
9. mengubah status menjadi `PUBLISHED`;
10. mengembalikan DTO publik.

### Repository

```text
outfit.repository.ts
```

Berisi query Prisma yang spesifik untuk Outfit.

Jangan membuat repository generic.

### Mapper

```text
outfit.mapper.ts
```

Mengubah database entity menjadi DTO publik tanpa:

- `guestId`;
- internal failure reason;
- storage internal metadata;
- abuse signal.

---

## 7.5 `features/hall-of-fame`

Mengelola presentation dan query Hall of Fame.

```text
hall-of-fame/
├── components/
├── schemas/
├── server/
├── hall-of-fame.constants.ts
└── hall-of-fame.types.ts
```

Tidak mengelola publish workflow.

`get-hall-of-fame-page.ts` dapat menggunakan `outfit.repository.ts`, tetapi hanya mengembalikan data yang dibutuhkan card.

---

## 7.6 `features/ratings`

Mengelola rating 1–5.

```text
ratings/
├── components/
├── schemas/
├── server/
├── rating.errors.ts
└── rating.types.ts
```

### `upsert-rating.ts`

Tanggung jawab:

- memastikan outfit aktif;
- memastikan guest bukan pemilik;
- memeriksa rate limit;
- melakukan upsert;
- menghitung ulang aggregate;
- mengembalikan rating terbaru.

Database constraint tetap menjadi lapisan terakhir:

```text
UNIQUE(outfitId, guestId)
```

---

## 7.7 `features/sharing`

Mengelola UX sharing dan download.

```text
sharing/
├── components/
├── lib/
└── server/
```

Client helper hanya membangun:

- native share payload;
- WhatsApp URL;
- X URL;
- Telegram URL;
- copy-link action.

Download file tetap dilakukan melalui Route Handler server.

---

## 7.8 `features/daily-winners`

Mengelola:

- periode kalender harian `Asia/Jakarta`;
- live ranking hari berjalan;
- refresh ranking melalui endpoint read-only;
- weighted score;
- eligibility;
- tie-breaker;
- snapshot;
- winner list.

```text
daily-winners/
├── components/
├── server/
├── daily-winner.errors.ts
└── daily-winner.types.ts
```

Algoritma tidak boleh berada di cron route.

Cron route hanya memanggil:

```text
select-daily-winner()
```

---

## 7.9 `features/abuse-protection`

Mengelola policy abuse, bukan infrastructure hash/token.

```text
abuse-protection/
├── server/
├── abuse.constants.ts
└── abuse.types.ts
```

Contoh:

- publish limit;
- rating limit;
- keputusan kapan Turnstile diperlukan;
- verifikasi Turnstile;
- same-origin assertion.

Hash IP dan security primitive generik tetap berada di `src/server/security`.

---

## 8. Struktur `src/components`

Folder ini hanya untuk UI lintas fitur.

```text
components/
├── feedback/
├── layout/
├── providers/
└── ui/
```

### Aturan masuk ke `components/ui`

Komponen masuk ke `ui` jika tidak mengetahui domain White Chorus.

Contoh yang boleh:

```text
Button
Dialog
Tabs
Skeleton
Pagination
Toast
```

Contoh yang tidak boleh:

```text
OutfitCard
CharacterCanvas
DailyWinnerCard
StarRating
```

Komponen domain tersebut tetap berada dalam feature masing-masing.

### Jangan membuat barrel besar

Hindari satu file:

```text
components/index.ts
```

yang mengekspor seluruh aplikasi.

Gunakan direct import:

```ts
import { Button } from "@/components/ui/button";
```

---

## 9. Struktur `src/server`

`src/server` adalah infrastructure server-only.

Semua module di folder ini harus menggunakan:

```ts
import "server-only";
```

bila sesuai.

```text
server/
├── database/
├── rendering/
├── storage/
├── security/
├── observability/
└── time/
```

## 9.1 `database/`

```text
database/
├── prisma.ts
└── transaction.ts
```

### `prisma.ts`

Menyediakan singleton Prisma client untuk development dan instance server yang aman.

Tidak boleh di-import dari Client Component.

### `transaction.ts`

Opsional helper kecil untuk transaction pattern yang dipakai berulang.

Jangan membungkus seluruh Prisma API.

---

## 9.2 `rendering/`

Semua Sharp operation berada di sini.

```text
rendering/
├── compose-final-image.ts
├── compose-social-image.ts
├── compose-thumbnail.ts
├── load-render-assets.ts
├── render-outfit-bundle.ts
├── rendering.constants.ts
└── rendering.types.ts
```

### Boundary

Feature Outfit mengatur workflow.

Infrastructure Rendering hanya:

- membaca validated asset;
- mengatur layer;
- memanggil Sharp;
- menghasilkan Buffer.

Renderer tidak:

- membuat database record;
- membaca guest cookie;
- memeriksa publish limit;
- memilih daily winner.

---

## 9.3 `storage/`

Adapter Supabase Storage.

```text
storage/
├── delete-outfit-files.ts
├── get-public-file-url.ts
├── storage-client.ts
├── storage-paths.ts
└── upload-outfit-files.ts
```

Client Supabase service-role hanya dibuat di server.

Jangan menaruh Supabase client dengan service key di:

```text
src/components
src/features/*/components
src/app/*/page.tsx client component
```

---

## 9.4 `security/`

Security primitive yang reusable.

```text
security/
├── cookie-options.ts
├── hash-ip.ts
├── hash-session-token.ts
├── require-cron-secret.ts
├── require-internal-secret.ts
├── secure-random-token.ts
└── security-headers.ts
```

Policy fitur tetap berada di `abuse-protection`.

---

## 9.5 `observability/`

```text
observability/
├── create-request-context.ts
├── logger.ts
└── metrics.ts
```

Log menggunakan structured object.

Jangan log:

- raw session token;
- Supabase service key;
- database URL;
- raw IP;
- full cookie header.

---

## 9.6 `time/`

Time adalah dependency penting karena:

- submission berumur tujuh hari;
- publish limit menggunakan window waktu;
- daily winner menggunakan Asia/Jakarta;
- integration test membutuhkan waktu yang dapat dikendalikan.

```text
time/
├── clock.ts
└── timezone.ts
```

Gunakan satu abstraction kecil:

```ts
export const clock = {
  now: () => new Date(),
};
```

Test dapat menggantinya dengan waktu tetap.

---

## 10. Struktur `src/lib`, `src/config`, dan `src/types`

## 10.1 `src/lib`

Berisi utility kecil, generic, dan tidak mengetahui domain.

Contoh:

```text
cn.ts
date-format.ts
invariant.ts
pagination.ts
safe-json.ts
short-code.ts
```

Jangan menjadikan `lib` tempat pembuangan file.

Jika helper hanya digunakan Dress-Up, tempatkan di:

```text
features/dress-up/lib
```

## 10.2 `src/config`

Berisi konfigurasi aplikasi yang tervalidasi.

```text
config/
├── env.ts
├── public-config.ts
├── limits.ts
└── routes.ts
```

### `env.ts`

- membaca `process.env`;
- memvalidasi dengan Zod;
- hanya boleh di-import server;
- gagal cepat jika secret wajib hilang.

### `public-config.ts`

Hanya berisi nilai aman untuk browser:

- app name;
- public base URL;
- public Turnstile site key;
- default language;
- default music volume jika diperlukan.

### `limits.ts`

Menyatukan limit runtime:

```text
publish per hour
publish per day
publish cooldown
rating per hour
retention days
daily minimum rating
```

Nilai dapat berasal dari validated environment.

## 10.3 `src/types`

Hanya untuk tipe yang benar-benar lintas domain.

Jangan menaruh semua type aplikasi di sini.

Tipe Outfit tetap di feature Outfit.

---

## 11. Struktur Asset Dress-Up

## 11.1 Folder asset

```text
public/dress-up/
├── backgrounds/
├── character-a/
└── character-b/
```

Karakter A dan B memiliki struktur identik.

## 11.2 Naming

Gunakan lowercase kebab-case.

Contoh:

```text
hair-01-back.webp
hair-01-front.webp
top-01.webp
bottom-01.webp
one-piece-01.webp
shoes-01.webp
accessory-01.webp
```

Jangan menggunakan nama:

```text
final-final.png
newhair2.png
IMG_1234.png
characterA top latest.webp
```

## 11.3 ID dan filename

ID tidak harus sama persis dengan filename, tetapi sebaiknya konsisten.

Contoh catalog:

```ts
{
  id: "a-hair-01",
  characterId: "character-a",
  category: "hair",
  iconSrc: "/dress-up/character-a/thumbnails/hair-01.webp",
  assetSrcs: [
    "/dress-up/character-a/hair-back/hair-01-back.webp",
    "/dress-up/character-a/hair-front/hair-01-front.webp"
  ],
  iconPresentation: "standard",
  layerOrder: 50,
  active: true
}
```

## 11.4 Canvas

Semua render asset harus memiliki:

- dimensi identik;
- transparent background;
- coordinate origin identik;
- character anchor identik;
- tidak memiliki padding tak terduga.

## 11.5 Browser cache

Asset filename yang sudah dirilis tidak boleh diubah isinya tanpa versi baru.

Gunakan versi atau hash jika asset diperbarui:

```text
top-01-v2.webp
```

Dengan filename stabil-versi, `next.config.ts` dapat memberi cache immutable untuk:

```text
/dress-up/:path*
/brand/:path*
/audio/:path*
```

## 11.6 Server rendering dan output tracing

Publish route menggunakan Sharp dan membaca source asset melalui filesystem.

`next.config.ts` harus memastikan asset render ikut dalam server trace.

Contoh konseptual:

```ts
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/outfits": ["public/dress-up/**/*", "public/brand/**/*"],
  },
};
```

Gunakan pattern sesempit mungkin.

Route publish harus menggunakan:

```ts
export const runtime = "nodejs";
```

Jangan menggunakan Edge runtime untuk Sharp pipeline.

## 11.7 Asset validation script

`validate-dress-up-assets.ts` harus memeriksa:

- ID unik;
- file ada;
- preview ada;
- asset aktif memiliki render path;
- dimensi konsisten;
- format valid;
- kategori valid;
- Character A tidak memakai file Character B;
- One Piece, Top, Bottom, Shoes, Hair, dan Accessory memiliki jumlah yang diharapkan;
- jumlah item tidak melebihi 10 kecuali PRD diperbarui.

Script dijalankan di CI.

---

## 12. Prisma dan Database

## 12.1 File utama

```text
prisma/schema.prisma
```

Model minimum:

```text
Guest
Outfit
Rating
DailyWinner
```

ShareEvent bersifat optional.

## 12.2 Repository location

Query database berada dekat domain:

```text
features/outfits/server/outfit.repository.ts
features/ratings/server/rating.repository.ts
features/daily-winners/server/daily-winner.repository.ts
features/guest-session/server/guest-session.repository.ts
```

`src/server/database/prisma.ts` hanya menyediakan Prisma client.

## 12.3 Migration naming

Gunakan nama deskriptif:

```text
20260802090000_init_white_chorus
20260802110000_add_outfit_image_paths
20260802130000_add_rating_constraints
```

Jangan gunakan nama:

```text
update
fix
change2
```

## 12.4 Seed

`prisma/seed.ts` dapat membuat:

- guest dummy;
- outfit dummy;
- rating dummy;
- daily winner dummy.

Seed tidak mengunggah generated file production.

Gunakan placeholder asset lokal atau public fixture.

---

## 13. API Route Mapping

| HTTP | URL                               | Route file                               | Use case                  |
| ---- | --------------------------------- | ---------------------------------------- | ------------------------- |
| POST | `/api/guest/session`              | `app/api/guest/session/route.ts`         | `create-guest-session.ts` |
| GET  | `/api/outfits`                    | `app/api/outfits/route.ts`               | `list-outfits.ts`         |
| POST | `/api/outfits`                    | `app/api/outfits/route.ts`               | `publish-outfit.ts`       |
| GET  | `/api/outfits/[id]`               | `app/api/outfits/[id]/route.ts`          | `get-outfit-detail.ts`    |
| PUT  | `/api/outfits/[id]/rating`        | `app/api/outfits/[id]/rating/route.ts`   | `upsert-rating.ts`        |
| POST | `/api/outfits/[id]/share`         | `app/api/outfits/[id]/share/route.ts`    | `record-share-intent.ts`  |
| GET  | `/api/outfits/[id]/download`      | `app/api/outfits/[id]/download/route.ts` | download handler          |
| GET  | `/api/daily-winners`              | `app/api/daily-winners/route.ts`         | `get-daily-winners.ts`    |
| POST | `/api/cron/expire-outfits`        | cron route                               | `expire-outfits.ts`       |
| POST | `/api/cron/select-daily-winner`   | cron route                               | `select-daily-winner.ts`  |
| POST | `/api/internal/outfits/[id]/hide` | internal route                           | `hide-outfit.ts`          |
| GET  | `/api/health`                     | health route                             | health checks             |

## 13.1 Route response

Gunakan format response konsisten.

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "PUBLISH_RATE_LIMITED",
    "message": "You have reached the publishing limit for now.",
    "requestId": "req_..."
  }
}
```

## 13.2 Jangan expose internal error

Jangan mengembalikan:

```text
Prisma error code
SQL query
Storage secret
Stack trace
Filesystem path
```

---

## 14. Image Rendering Pipeline

## 14.1 Layer separation

Workflow dibagi menjadi:

```text
Feature orchestration
        ↓
Rendering infrastructure
        ↓
Storage infrastructure
```

### Feature orchestration

```text
features/outfits/server/publish-outfit.ts
```

### Rendering infrastructure

```text
server/rendering/render-outfit-bundle.ts
```

### Storage infrastructure

```text
server/storage/upload-outfit-files.ts
```

## 14.2 `render-outfit-bundle.ts`

Menghasilkan:

```ts
type RenderedOutfitBundle = {
  finalWebp: Buffer;
  downloadPng: Buffer;
  thumbnailWebp: Buffer;
  socialJpeg: Buffer;
};
```

## 14.3 Storage paths

Dibangun hanya melalui:

```text
server/storage/storage-paths.ts
```

Contoh:

```text
outfits/{outfitId}/final.webp
outfits/{outfitId}/download.png
outfits/{outfitId}/thumbnail.webp
outfits/{outfitId}/social.jpg
```

Jangan membangun string path Storage secara manual di banyak file.

## 14.4 Failure handling

Jika satu file gagal:

- Outfit tidak menjadi `PUBLISHED`;
- file parsial dihapus;
- record menjadi `FAILED`;
- quota sukses tidak bertambah;
- error dicatat;
- user mendapat error aman.

---

## 15. Guest Session dan Security Boundary

## 15.1 Cookie

Cookie dibuat dan dibaca hanya di server.

Default:

```text
HttpOnly
Secure
SameSite=Lax
Path=/
Max-Age=604800
```

## 15.2 Token storage

Browser menyimpan raw random token dalam cookie.

Database menyimpan:

```text
hash(token)
```

Jangan menyimpan raw token di database.

## 15.3 Guest resolver

Semua mutation menggunakan:

```text
get-current-guest.ts
```

Route tidak menerima `guestId` dari body.

## 15.4 Public DTO

DTO Outfit publik tidak boleh memiliki:

```text
guestId
sessionTokenHash
ipHash
userAgentHash
failureReason
```

---

## 16. Rate Limiting dan Abuse Protection

## 16.1 Kenapa ada feature khusus?

Rate limiting bukan sekadar utility karena policy berbeda per action:

- publish;
- rating;
- share;
- session creation;
- download.

## 16.2 Data source

Untuk MVP, check limit menggunakan PostgreSQL berdasarkan:

- guest ID;
- timestamp record;
- IP hash bila diperlukan;
- action.

Tidak perlu Redis.

## 16.3 Default limits

```text
Publish:
5 per rolling hour
15 per day
10-second cooldown
1 active PROCESSING per guest

Rating:
30 writes per rolling hour

Session creation:
5 per IP hash per hour
```

## 16.4 Turnstile

`evaluate-turnstile-requirement.ts` memutuskan apakah challenge diperlukan.

`verify-turnstile.ts` hanya memverifikasi token.

Jangan mencampur policy dan HTTP call verification dalam satu function besar.

---

## 17. Hall of Fame dan Ranking

## 17.1 Query boundary

Semua query Hall of Fame masuk melalui:

```text
get-hall-of-fame-page.ts
```

Input:

```ts
type HallQuery = {
  sort: "newest" | "top-rated" | "trending";
  page: number;
  pageSize: 9;
};
```

## 17.2 Newest

Order:

```text
publishedAt DESC
```

## 17.3 Top Rated

Order:

```text
weightedScore DESC
ratingCount DESC
publishedAt ASC
```

## 17.4 Trending

Trending score dapat dihitung saat query atau disimpan berkala.

Untuk skala puluhan hingga ratusan, query sederhana masih cukup.

Jangan membuat background worker hanya untuk trending pada MVP.

## 17.5 Card DTO

Card hanya membutuhkan:

```text
id
shortCode
thumbnailUrl
ratingAverage
ratingCount
publishedAt
expiresAt
dailyRank optional
```

Jangan mengambil seluruh JSON configuration untuk Hall of Fame card.

---

## 18. Daily Winner

## 18.1 Period calculation

Semua logic periode berada di:

```text
get-day-period.ts
```

Timezone default:

```text
Asia/Jakarta
```

Periode mengikuti kalender harian `00:00:00` sampai sebelum `00:00:00` hari
berikutnya. Cron finalisasi berjalan pukul `00:05 Asia/Jakarta`.

## 18.2 Weighted score

Berada di pure function:

```text
calculate-weighted-score.ts
```

Agar mudah diuji dengan fixture.

## 18.3 Winner selection

`select-daily-winner.ts`:

1. menghitung period;
2. memastikan snapshot belum ada;
3. mengambil eligible submissions;
4. menghitung ranking;
5. menerapkan tie-breaker;
6. menyalin/snapshot image;
7. membuat record DailyWinner;
8. mengembalikan summary.

## 18.4 Idempotency

Constraint:

```text
UNIQUE(dayStart, dayEnd)
```

Cron yang dipanggil dua kali tidak boleh membuat dua pemenang.

---

## 19. Music Architecture

## 19.1 Provider location

```text
src/components/providers/music-provider.tsx
```

Provider di root layout.

## 19.2 Feature UI

```text
features/audio/components/
```

Berisi:

- entry gate;
- music control.

## 19.3 State

Minimum state:

```ts
type MusicState = {
  hasEntered: boolean;
  muted: boolean;
  volume: number;
  playbackError: boolean;
};
```

## 19.4 Persistence

LocalStorage key:

```text
white-chorus:music-preference
```

Jangan menyimpan preferensi musik di database.

---

## 20. Testing Architecture

## 20.1 Unit tests

Unit test sebaiknya colocated dekat source dengan nama:

```text
*.test.ts
*.test.tsx
```

Contoh:

```text
features/daily-winners/server/calculate-weighted-score.test.ts
features/dress-up/model/normalize-configuration.test.ts
```

## 20.2 Integration tests

Centralized:

```text
tests/integration/
```

Menguji:

- Prisma;
- transaction;
- constraint;
- use case;
- storage mock/test bucket;
- cleanup.

## 20.3 E2E tests

```text
tests/e2e/
```

Menggunakan Playwright.

Tidak perlu memeriksa setiap pixel, tetapi harus memverifikasi flow utama.

## 20.4 Fixture

Fixture tidak masuk production bundle.

```text
tests/fixtures/
```

Jangan menaruh fixture di `src`.

## 20.5 Test database

Gunakan database terpisah.

Jangan menjalankan integration test terhadap production Supabase.

---

## 21. Scripts dan Automation

## 21.1 `validate-dress-up-assets.ts`

Dijalankan:

```text
pnpm assets:validate
```

## 21.2 `verify-storage-access.ts`

Memastikan server dapat:

- upload;
- read URL;
- delete;

pada bucket non-production atau prefix khusus test.

## 21.3 Manual cron scripts

Manual script tidak boleh mem-bypass use case.

Contoh:

```text
pnpm cron:expire
pnpm cron:winner
```

Script memanggil use case yang sama dengan cron route.

---

## 22. Environment Variables

`.env.example` hanya berisi nama dan contoh aman.

```env
DATABASE_URL=
DIRECT_URL=

APP_URL=http://localhost:3000
NODE_ENV=development

SESSION_COOKIE_NAME=wc_guest
SESSION_TOKEN_SECRET=
SESSION_MAX_AGE_SECONDS=604800

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=white-chorus-generated

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_MODE=adaptive

PUBLISH_LIMIT_PER_HOUR=5
PUBLISH_LIMIT_PER_DAY=15
PUBLISH_COOLDOWN_SECONDS=10
DUPLICATE_WINDOW_HOURS=24

RATING_LIMIT_PER_HOUR=30
SUBMISSION_RETENTION_DAYS=7
GUEST_RETENTION_DAYS=14
DAILY_TIMEZONE=Asia/Jakarta
DAILY_MIN_RATINGS=5

MUSIC_DEFAULT_VOLUME=0.35

CRON_SECRET=
INTERNAL_ADMIN_SECRET=
```

## 22.1 Public prefix rule

Hanya value yang aman untuk browser menggunakan:

```text
NEXT_PUBLIC_
```

Jangan pernah:

```text
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_DATABASE_URL
NEXT_PUBLIC_SESSION_TOKEN_SECRET
```

## 22.2 Environment validation

Aplikasi harus gagal saat boot/build jika secret wajib tidak ada.

---

## 23. Import Rules dan Dependency Direction

## 23.1 Alias

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 23.2 Allowed direction

```text
app
  ↓
features
  ↓
server infrastructure / lib / config
```

Shared UI:

```text
features → components/ui
```

## 23.3 Forbidden imports

### Client Component tidak boleh import

```text
@/server/*
@/features/*/server/*
@prisma/client
sharp
Supabase service client
```

### `src/server` tidak boleh import

```text
React client hooks
browser localStorage
window
document
```

### Feature tidak boleh bergantung dua arah

Contoh yang harus dihindari:

```text
outfits imports ratings
ratings imports outfits
```

Gunakan query/repository boundary atau shared domain DTO yang sempit.

## 23.4 Feature public API

Tidak wajib membuat `index.ts` untuk setiap folder.

Direct import lebih jelas.

Jika feature berkembang dan memerlukan API publik, buat satu `index.ts` di root feature saja. Jangan membuat barrel berlapis.

---

## 24. Naming Conventions

## 24.1 Folder dan file

```text
kebab-case
```

Contoh:

```text
publish-outfit.ts
daily-winner-card.tsx
guest-session.repository.ts
```

## 24.2 React component

```text
PascalCase
```

File tetap kebab-case:

```text
outfit-card.tsx
```

Export:

```ts
export function OutfitCard() {}
```

## 24.3 Function

Gunakan verb yang jelas:

```text
publishOutfit
getOutfitDetail
upsertRating
expireOutfits
selectDailyWinner
```

Hindari:

```text
handleData
processThing
doAction
manager
helper
```

## 24.4 Boolean

Gunakan prefix:

```text
is
has
can
should
```

Contoh:

```text
isPublished
hasExpired
canRate
shouldRequireTurnstile
```

## 24.5 Database enum

Gunakan uppercase:

```text
PROCESSING
PUBLISHED
FAILED
HIDDEN
EXPIRED
```

## 24.6 IDs

```text
character-a
character-b
a-top-01
b-one-piece-03
background-01
```

---

## 25. Server dan Client Component Rules

## 25.1 Default server

Semua page dan component default menjadi Server Component.

Tambahkan:

```ts
"use client";
```

hanya jika membutuhkan:

- state;
- event handler;
- browser API;
- localStorage;
- Web Share API;
- audio element;
- animation state.

## 25.2 Client boundary kecil

Contoh:

```text
page.tsx                  server
OutfitDetail.tsx          server bila statis
StarRating.tsx            client
ShareButton.tsx           client
```

Jangan menandai seluruh page sebagai Client Component hanya karena satu tombol membutuhkan interaksi.

## 25.3 Server action versus Route Handler

White Chorus memakai Route Handler untuk mutation utama karena:

- public API contract jelas;
- response error konsisten;
- mudah diuji;
- digunakan dari Client Component;
- publish memiliki proses kompleks dan output status.

Server Action dapat digunakan untuk operasi internal kecil, tetapi bukan pola utama.

---

## 26. Error Handling

## 26.1 Domain errors

Setiap feature dapat memiliki error typed.

Contoh:

```ts
class OutfitError extends Error {
  code:
    | "INVALID_CONFIGURATION"
    | "DUPLICATE_SUBMISSION"
    | "PUBLISH_RATE_LIMITED"
    | "RENDER_FAILED";
}
```

## 26.2 HTTP mapping

Route Handler memetakan domain error ke status:

```text
INVALID_CONFIGURATION   → 400
INVALID_SESSION         → 401
SELF_RATING             → 403
OUTFIT_NOT_FOUND        → 404
DUPLICATE_SUBMISSION    → 409
RATE_LIMITED            → 429
RENDER_FAILED           → 500/503
```

## 26.3 React error UI

- route-specific `error.tsx` untuk pemulihan lokal;
- global error untuk kegagalan fatal;
- `not-found.tsx` untuk unknown resource;
- expired outfit menggunakan UI khusus, bukan generic 404.

---

## 27. Logging dan Observability

## 27.1 Request context

Setiap request mendapatkan:

```text
requestId
operation
timestamp
duration
```

## 27.2 Publish log stages

```text
publish.requested
publish.validated
publish.processing_created
publish.render_completed
publish.storage_uploaded
publish.published
publish.failed
```

## 27.3 Cron logs

Cleanup summary:

```text
expiredFound
recordsDeleted
filesDeleted
failedDeletes
duration
```

Winner summary:

```text
dayStart
dayEnd
eligibleCount
winnerId
winnerScore
status
```

## 27.4 PII discipline

White Chorus anonim, tetapi guest internal data tetap sensitif.

Jangan menampilkan IP hash atau guest ID di UI publik.

---

## 28. CI/CD dan GitHub

## 28.1 CI sequence

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm assets:validate
pnpm prisma:validate
pnpm build
```

## 28.2 Package scripts

Contoh:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "assets:validate": "tsx scripts/validate-dress-up-assets.ts",
    "prisma:validate": "prisma validate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

## 28.3 Deployment

- preview deployment untuk pull request;
- production dari protected main branch;
- migration dijalankan secara terkontrol;
- build gagal jika asset validation gagal;
- production secret hanya di Vercel environment.

---

## 29. File Ownership per Fitur

| Kebutuhan             | Lokasi utama                                   |
| --------------------- | ---------------------------------------------- |
| Audio state           | `features/audio`                               |
| Music provider        | `components/providers/music-provider.tsx`      |
| Outfit item catalog   | `features/dress-up/catalog`                    |
| Studio state          | `features/dress-up/model`                      |
| Guest session         | `features/guest-session/server`                |
| Publish workflow      | `features/outfits/server/publish-outfit.ts`    |
| Prisma client         | `server/database/prisma.ts`                    |
| Outfit repository     | `features/outfits/server/outfit.repository.ts` |
| Sharp pipeline        | `server/rendering`                             |
| Storage upload/delete | `server/storage`                               |
| Hall pagination/sort  | `features/hall-of-fame`                        |
| Rating UI/use case    | `features/ratings`                             |
| Sharing UI            | `features/sharing`                             |
| Daily score/winner    | `features/daily-winners`                       |
| Rate limit policy     | `features/abuse-protection`                    |
| Security primitive    | `server/security`                              |
| Environment config    | `config/env.ts`                                |
| Cron endpoints        | `app/api/cron`                                 |
| E2E test              | `tests/e2e`                                    |
| Database schema       | `prisma/schema.prisma`                         |

---

## 30. Contoh Alur Implementasi

## 30.1 User memilih outfit

```text
ItemCard
  ↓
DressUpStudio dispatch
  ↓
dress-up.reducer
  ↓
selectors menghasilkan active layers
  ↓
CharacterLayerStack render
  ↓
draft disimpan oleh use-dress-up-draft
```

Tidak ada request server.

## 30.2 User publish

```text
PublishBar
  ↓
POST /api/outfits
  ↓
Route Handler
  ↓
getCurrentGuest
  ↓
assertOrigin
  ↓
publishOutfitSchema
  ↓
publishOutfit use case
  ↓
checkPublishLimit
  ↓
calculateConfigurationHash
  ↓
outfitRepository.createProcessing
  ↓
renderOutfitBundle
  ↓
uploadOutfitFiles
  ↓
outfitRepository.markPublished
  ↓
public DTO response
```

## 30.3 User memberi rating

```text
StarRating
  ↓
PUT /api/outfits/[id]/rating
  ↓
getCurrentGuest
  ↓
submitRatingSchema
  ↓
upsertRating
  ↓
checkRatingLimit
  ↓
verify not owner
  ↓
ratingRepository.upsert
  ↓
recalculateRatingAggregate
  ↓
response
```

## 30.4 Cleanup

```text
Vercel Cron
  ↓
POST /api/cron/expire-outfits
  ↓
requireCronSecret
  ↓
expireOutfits
  ↓
find expired
  ↓
delete Storage files
  ↓
delete Outfit records
  ↓
Rating cascade
  ↓
summary log
```

---

## 31. Urutan Pembuatan Folder

Jangan membuat seluruh tree kosong pada hari pertama.

Buat secara bertahap.

### Tahap 1

```text
src/app
src/components
src/config
src/features/dress-up
src/features/guest-session
src/server/database
prisma
public
```

### Tahap 2

Saat publish dibuat:

```text
src/features/outfits
src/features/abuse-protection
src/server/rendering
src/server/storage
src/server/security
```

### Tahap 3

Saat social layer dibuat:

```text
src/features/hall-of-fame
src/features/ratings
src/features/sharing
src/features/daily-winners
```

### Tahap 4

Saat hardening:

```text
src/server/observability
tests/integration
tests/e2e
docs/runbooks
scripts
```

Struktur final adalah target, bukan perintah membuat folder kosong.

---

## 32. Folder yang Tidak Perlu Dibuat

Untuk MVP White Chorus, jangan membuat:

```text
backend/
frontend/
microservices/
packages/
apps/
workers/
queues/
events/
event-bus/
redis/
graphql/
websocket/
repositories/base/
services/base/
dependency-injection/
domain-driven-design/
use-cases/interfaces/
```

kecuali requirement berubah secara nyata.

### Tidak perlu monorepo

White Chorus saat ini hanya memiliki satu aplikasi deployable.

Monorepo menambah:

- workspace config;
- build graph;
- package boundary;
- deployment config;
- dependency version management.

Tidak ada manfaat yang cukup untuk MVP ini.

### Tidak perlu admin app terpisah

Operasi internal awal dapat dilakukan melalui:

- Supabase dashboard;
- protected internal route;
- manual script;
- runbook.

---

## 33. Checklist Arsitektur

### Routing

- [ ] Root layout tunggal mempertahankan musik.
- [ ] Public page berada di `(site)`.
- [ ] Route Handler berada di `app/api`.
- [ ] Cron route memakai secret.
- [ ] Route file tetap tipis.

### Client/server boundary

- [ ] Prisma hanya di server.
- [ ] Sharp hanya di server.
- [ ] Supabase service-role hanya di server.
- [ ] `"use client"` hanya pada komponen interaktif.
- [ ] Client tidak menerima `guestId`.

### Dress-up

- [ ] Catalog merupakan single source of truth.
- [ ] Semua ID asset unik.
- [ ] Character A/B tidak tertukar.
- [ ] Canvas dan anchor konsisten.
- [ ] Asset validation berjalan di CI.
- [ ] Item 5 dapat bertambah menjadi 10 tanpa refactor.

### Publish

- [ ] Configuration dinormalisasi.
- [ ] Duplicate hash dibuat di server.
- [ ] Publish limit aktif.
- [ ] Status `PROCESSING` dipakai.
- [ ] Partial file dibersihkan.
- [ ] `PUBLISHED` hanya setelah seluruh output berhasil.

### Hall of Fame

- [ ] Query mengambil 9 item.
- [ ] Card memakai thumbnail.
- [ ] Sort berada di URL.
- [ ] DTO tidak memuat configuration JSON yang tidak dibutuhkan.
- [ ] Expired submission tidak tampil.

### Rating

- [ ] Nilai hanya 1–5.
- [ ] Unique constraint aktif.
- [ ] Self-rating diblokir.
- [ ] Aggregate konsisten.
- [ ] Daily score diuji.

### Retention

- [ ] `expiresAt = publishedAt + 7 hari`.
- [ ] Cleanup menghapus database dan Storage.
- [ ] Cron idempotent.
- [ ] Daily winner memiliki snapshot sendiri.
- [ ] Stuck `PROCESSING` ditangani.

### Security

- [ ] Cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- [ ] Raw token tidak disimpan di database.
- [ ] Raw IP tidak disimpan.
- [ ] Origin check aktif pada mutation.
- [ ] Turnstile adaptif tersedia.
- [ ] Secret tidak memakai `NEXT_PUBLIC_`.

### Testing

- [ ] Weighted score unit test.
- [ ] Configuration normalization unit test.
- [ ] Publish integration test.
- [ ] Rating constraint integration test.
- [ ] Cleanup integration test.
- [ ] Daily winner idempotency test.
- [ ] E2E desktop dan mobile.

---

## 34. Referensi Implementasi Resmi

Struktur ini mengikuti konvensi resmi dan kemampuan platform yang digunakan:

- [Next.js project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js route file convention and Node.js runtime](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Next.js public folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)
- [Next.js output file tracing](https://nextjs.org/docs/15/app/api-reference/config/next-config-js/output)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/next/frameworks/nextjs)
- [Prisma deployment to Vercel](https://docs.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [Supabase serving stored files](https://supabase.com/docs/guides/storage/serving/downloads)

---

# Final Recommendation

Gunakan struktur ini sebagai **target akhir**, tetapi buat folder ketika benar-benar dibutuhkan.

Fondasi utama White Chorus adalah:

```text
src/app       → route dan layout
src/features  → produk dan business logic
src/server    → database, renderer, storage, security
src/components→ shared UI
public        → official dress-up assets dan audio
prisma        → schema dan migration
tests         → integration dan E2E
```

Dengan batas tersebut, project tetap:

- sederhana untuk diselesaikan cepat;
- aman untuk guest access;
- mudah diuji;
- mudah dikembangkan dari 5 menjadi 10 asset per kategori;
- cukup kuat untuk ratusan submission;
- tidak berubah menjadi arsitektur enterprise yang tidak diperlukan.

---

**End of document**
