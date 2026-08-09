# White Chorus

# Final Prisma Schema Specification

**Document version:** 1.0 Final  
**Project:** White Chorus  
**Database:** Supabase PostgreSQL  
**ORM:** Prisma ORM 7  
**Application runtime:** Next.js on Vercel, Node.js runtime  
**Database access:** Server-only through Prisma Client and `@prisma/adapter-pg`  
**User model:** Anonymous guest with an opaque `HttpOnly` cookie  
**Primary schema file:** `prisma/schema.prisma`

---

## Table of Contents

1. [Tujuan Dokumen](#1-tujuan-dokumen)
2. [Keputusan Final Schema](#2-keputusan-final-schema)
3. [Prinsip Database](#3-prinsip-database)
4. [Entity Relationship Overview](#4-entity-relationship-overview)
5. [Final `schema.prisma`](#5-final-schemaprisma)
6. [Penjelasan Enum](#6-penjelasan-enum)
7. [Model `Guest`](#7-model-guest)
8. [Model `Outfit`](#8-model-outfit)
9. [Model `Rating`](#9-model-rating)
10. [Model `OutfitInteraction`](#10-model-outfitinteraction)
11. [Model `DailyWinner`](#11-model-dailywinner)
12. [Model `RateLimitCounter`](#12-model-ratelimitcounter)
13. [Relasi dan Referential Actions](#13-relasi-dan-referential-actions)
14. [Index Strategy](#14-index-strategy)
15. [Database Constraints yang Ditambahkan melalui SQL](#15-database-constraints-yang-ditambahkan-melalui-sql)
16. [Mengapa Beberapa Aturan Tidak Dimasukkan ke Prisma Schema](#16-mengapa-beberapa-aturan-tidak-dimasukkan-ke-prisma-schema)
17. [Prisma 7 Configuration](#17-prisma-7-configuration)
18. [Prisma Client untuk Next.js dan Supabase](#18-prisma-client-untuk-nextjs-dan-supabase)
19. [Environment Variables](#19-environment-variables)
20. [Package Installation](#20-package-installation)
21. [Migration Workflow](#21-migration-workflow)
22. [Seed Strategy](#22-seed-strategy)
23. [Core Query Patterns](#23-core-query-patterns)
24. [Publish Transaction](#24-publish-transaction)
25. [Rating Transaction](#25-rating-transaction)
26. [Rate Limit Counter Strategy](#26-rate-limit-counter-strategy)
27. [Daily Winner Query](#27-daily-winner-query)
28. [Expiration dan Cleanup](#28-expiration-dan-cleanup)
29. [Security Boundary](#29-security-boundary)
30. [Data Retention](#30-data-retention)
31. [DTO dan Decimal Serialization](#31-dto-dan-decimal-serialization)
32. [Testing Requirements](#32-testing-requirements)
33. [Operational Queries](#33-operational-queries)
34. [Schema Evolution Rules](#34-schema-evolution-rules)
35. [Keputusan yang Sengaja Tidak Digunakan](#35-keputusan-yang-sengaja-tidak-digunakan)
36. [Implementation Checklist](#36-implementation-checklist)
37. [Referensi Resmi](#37-referensi-resmi)

---

## 1. Tujuan Dokumen

Dokumen ini menetapkan schema Prisma final untuk White Chorus dan menjadi acuan implementasi database, migration, repository, transaction, cleanup, Hall of Fame, rating, daily winner, dan abuse protection.

Schema dirancang untuk kebutuhan berikut:

- user tidak login dan tampil sebagai guest anonim;
- satu browser memiliki guest session berbasis cookie;
- satu submission menampilkan dua karakter sekaligus;
- konfigurasi kedua karakter disimpan sebagai JSON tervalidasi;
- hasil publish memiliki gambar final, gambar download, thumbnail, dan social preview;
- Hall of Fame menampilkan sembilan card per halaman;
- submission dapat diberi rating 1–5 bintang;
- pemilik tidak boleh menilai submission sendiri;
- satu guest hanya memiliki satu rating aktif untuk satu outfit;
- rating dapat diperbarui;
- submission aktif selama tujuh hari;
- pemenang mingguan tetap tersimpan setelah submission reguler dihapus;
- share dan download dapat dicatat untuk analytics serta Trending;
- rate limit harus tetap konsisten pada lingkungan serverless;
- seluruh akses database hanya dilakukan dari server.

Schema ini dibuat untuk skala awal puluhan hingga ratusan submission, bukan untuk social network berskala global.

---

## 2. Keputusan Final Schema

### 2.1 Model yang digunakan

Schema final menggunakan enam model:

```text
Guest
Outfit
Rating
OutfitInteraction
DailyWinner
RateLimitCounter
```

### 2.2 Alasan masing-masing model

| Model               | Tanggung jawab                                                                 |
| ------------------- | ------------------------------------------------------------------------------ |
| `Guest`             | Identitas internal anonymous guest dan lifecycle session                       |
| `Outfit`            | Submission Hall of Fame, konfigurasi, image path, rating aggregate, dan status |
| `Rating`            | Rating 1–5 dari satu guest terhadap satu outfit                                |
| `OutfitInteraction` | Share intent dan download event untuk analytics, Trending, dan observability   |
| `DailyWinner`       | Snapshot pemenang mingguan yang tidak ikut terhapus bersama submission reguler |
| `RateLimitCounter`  | Counter rate limit persisten untuk Vercel/serverless                           |

### 2.3 Model yang tidak digunakan

Tidak ada model:

```text
UserAccount
Profile
Comment
ReviewText
UploadedAsset
RefreshToken
SupabaseAuthUser
AdminUser
Notification
Favorite
Follower
```

MVP tidak membutuhkan login, profil, komentar teks, atau upload file dari guest.

---

## 3. Prinsip Database

### 3.1 Database menyimpan state final, browser menyimpan draft

Draft dress-up tetap berada di `localStorage`.

Database hanya menerima submission ketika user memilih:

```text
Publish to Hall of Fame
```

### 3.2 Client tidak menentukan ownership

Request browser tidak boleh menentukan:

```text
guestId
ratingAverage
ratingCount
weightedScore
status
publishedAt
expiresAt
isCompetitionEligible
storage path
```

Nilai tersebut ditentukan oleh server.

### 3.3 Published outfit bersifat immutable

Setelah `PUBLISHED`, konfigurasi outfit tidak dapat diedit.

User yang ingin mengubah kombinasi harus membuat submission baru.

### 3.4 Generated images disimpan sebagai path

Database menyimpan Storage path, bukan image binary dan bukan base64.

### 3.5 Aggregate rating disimpan untuk query cepat

`Outfit` menyimpan:

```text
ratingAverage
ratingCount
weightedScore
```

Sumber kebenaran rating individual tetap berada di tabel `ratings`.

### 3.6 Pemenang mingguan menggunakan snapshot

`DailyWinner` menyimpan statistik dan image path final yang dibekukan pada saat winner dipilih.

Relasi ke source outfit bersifat nullable supaya snapshot tetap ada setelah source outfit dihapus.

### 3.7 Rate limit harus persisten

In-memory rate limit tidak cukup untuk Vercel karena request dapat diproses oleh instance berbeda.

`RateLimitCounter` menyediakan counter kecil di PostgreSQL tanpa Redis.

---

## 4. Entity Relationship Overview

```text
Guest
├── has many Outfit
├── has many Rating
└── has many OutfitInteraction

Outfit
├── belongs to Guest
├── has many Rating
├── has many OutfitInteraction
└── has zero or one DailyWinner snapshot

Rating
├── belongs to Guest
└── belongs to Outfit

OutfitInteraction
├── belongs to Guest
└── belongs to Outfit

DailyWinner
└── optionally references one source Outfit

RateLimitCounter
└── independent security table keyed by hashed scope + action
```

Diagram ringkas:

```text
┌───────────┐       1:N       ┌───────────┐
│   Guest   │────────────────▶│  Outfit   │
└───────────┘                 └───────────┘
      │                            │
      │ 1:N                        │ 1:N
      ▼                            ▼
┌───────────┐                 ┌───────────────┐
│  Rating   │◀────────────────│               │
└───────────┘                 │               │
                              │               │
┌───────────────────┐         │               │
│ OutfitInteraction │◀────────┘               │
└───────────────────┘                         │
                                              │ 0..1
                                              ▼
                                     ┌────────────────┐
                                     │ DailyWinner   │
                                     └────────────────┘

┌──────────────────┐
│ RateLimitCounter │
└──────────────────┘
```

---

## 5. Final `schema.prisma`

File:

```text
prisma/schema.prisma
```

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  runtime      = "nodejs"
  moduleFormat = "esm"
}

datasource db {
  provider = "postgresql"
}

enum OutfitStatus {
  PROCESSING
  PUBLISHED
  FAILED
  HIDDEN
  EXPIRED

  @@map("outfit_status")
}

enum OutfitInteractionType {
  NATIVE_SHARE
  COPY_LINK
  WHATSAPP
  FACEBOOK
  X
  TELEGRAM
  DOWNLOAD

  @@map("outfit_interaction_type")
}

enum RateLimitAction {
  SESSION_CREATE_HOURLY
  OUTFIT_PUBLISH_HOURLY
  OUTFIT_PUBLISH_DAILY
  OUTFIT_PUBLISH_COOLDOWN
  RATING_WRITE_HOURLY
  INTERACTION_WRITE_HOURLY
  DOWNLOAD_HOURLY

  @@map("rate_limit_action")
}

model Guest {
  id               String   @id @default(uuid()) @db.Uuid
  sessionTokenHash String   @unique(map: "guests_session_token_hash_key") @map("session_token_hash") @db.Char(64)
  ipHash           String?  @map("ip_hash") @db.Char(64)
  userAgentHash    String?  @map("user_agent_hash") @db.Char(64)
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  lastSeenAt       DateTime @default(now()) @map("last_seen_at") @db.Timestamptz(3)
  expiresAt        DateTime @map("expires_at") @db.Timestamptz(3)

  outfits     Outfit[]
  ratings     Rating[]
  interactions OutfitInteraction[]

  @@index([expiresAt], map: "guests_expires_at_idx")
  @@index([ipHash, createdAt(sort: Desc)], map: "guests_ip_hash_created_at_idx")
  @@map("guests")
}

model Outfit {
  id                       String       @id @default(uuid()) @db.Uuid
  guestId                  String       @map("guest_id") @db.Uuid
  shortCode                String       @unique(map: "outfits_short_code_key") @map("short_code") @db.VarChar(12)
  backgroundId             String       @map("background_id") @db.VarChar(64)
  characterAConfig         Json         @map("character_a_config") @db.JsonB
  characterBConfig         Json         @map("character_b_config") @db.JsonB
  configurationHash        String       @map("configuration_hash") @db.Char(64)

  finalImagePath           String?      @map("final_image_path") @db.VarChar(512)
  downloadImagePath        String?      @map("download_image_path") @db.VarChar(512)
  thumbnailPath            String?      @map("thumbnail_path") @db.VarChar(512)
  socialImagePath          String?      @map("social_image_path") @db.VarChar(512)

  status                   OutfitStatus @default(PROCESSING)
  ratingAverage            Decimal      @default(0) @map("rating_average") @db.Decimal(4, 3)
  ratingCount              Int          @default(0) @map("rating_count")
  weightedScore            Decimal      @default(0) @map("weighted_score") @db.Decimal(6, 4)
  isCompetitionEligible    Boolean      @default(true) @map("is_competition_eligible")

  publishedAt              DateTime?    @map("published_at") @db.Timestamptz(3)
  expiresAt                DateTime?    @map("expires_at") @db.Timestamptz(3)
  hiddenAt                 DateTime?    @map("hidden_at") @db.Timestamptz(3)
  hiddenReason             String?      @map("hidden_reason") @db.VarChar(128)
  failureReason            String?      @map("failure_reason") @db.VarChar(128)

  createdAt                DateTime     @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt                DateTime     @updatedAt @map("updated_at") @db.Timestamptz(3)

  guest                    Guest        @relation(fields: [guestId], references: [id], onDelete: Cascade, onUpdate: Cascade, map: "outfits_guest_id_fkey")
  ratings                  Rating[]
  interactions             OutfitInteraction[]
  dailyWinner             DailyWinner?

  @@index([status, expiresAt], map: "outfits_status_expires_at_idx")
  @@index([status, publishedAt(sort: Desc)], map: "outfits_status_published_at_idx")
  @@index(
    [status, weightedScore(sort: Desc), ratingCount(sort: Desc), publishedAt(sort: Asc)],
    map: "outfits_top_rated_idx"
  )
  @@index([guestId, createdAt(sort: Desc)], map: "outfits_guest_created_at_idx")
  @@index(
    [guestId, configurationHash, createdAt(sort: Desc)],
    map: "outfits_duplicate_lookup_idx"
  )
  @@index(
    [isCompetitionEligible, publishedAt(sort: Desc)],
    map: "outfits_competition_lookup_idx"
  )
  @@map("outfits")
}

model Rating {
  id        String   @id @default(uuid()) @db.Uuid
  outfitId  String   @map("outfit_id") @db.Uuid
  guestId   String   @map("guest_id") @db.Uuid
  value     Int      @db.SmallInt
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(3)

  outfit    Outfit   @relation(fields: [outfitId], references: [id], onDelete: Cascade, onUpdate: Cascade, map: "ratings_outfit_id_fkey")
  guest     Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade, onUpdate: Cascade, map: "ratings_guest_id_fkey")

  @@unique([outfitId, guestId], map: "ratings_outfit_id_guest_id_key")
  @@index([guestId, updatedAt(sort: Desc)], map: "ratings_guest_updated_at_idx")
  @@map("ratings")
}

model OutfitInteraction {
  id        String                @id @default(uuid()) @db.Uuid
  outfitId  String                @map("outfit_id") @db.Uuid
  guestId   String                @map("guest_id") @db.Uuid
  type      OutfitInteractionType
  createdAt DateTime              @default(now()) @map("created_at") @db.Timestamptz(3)

  outfit    Outfit                @relation(fields: [outfitId], references: [id], onDelete: Cascade, onUpdate: Cascade, map: "outfit_interactions_outfit_id_fkey")
  guest     Guest                 @relation(fields: [guestId], references: [id], onDelete: Cascade, onUpdate: Cascade, map: "outfit_interactions_guest_id_fkey")

  @@index([outfitId, createdAt(sort: Desc)], map: "outfit_interactions_outfit_created_at_idx")
  @@index([guestId, createdAt(sort: Desc)], map: "outfit_interactions_guest_created_at_idx")
  @@index([type, createdAt(sort: Desc)], map: "outfit_interactions_type_created_at_idx")
  @@map("outfit_interactions")
}

model DailyWinner {
  id                 String    @id @default(uuid()) @db.Uuid
  sourceOutfitId     String?   @unique(map: "daily_winners_source_outfit_id_key") @map("source_outfit_id") @db.Uuid
  dayKey            String    @unique(map: "daily_winners_day_key_key") @map("day_key") @db.Char(10)
  dayStart          DateTime  @map("day_start") @db.Timestamptz(3)
  dayEnd            DateTime  @map("day_end") @db.Timestamptz(3)

  shortCode          String    @map("short_code") @db.VarChar(12)
  winnerImagePath    String    @map("winner_image_path") @db.VarChar(512)
  socialImagePath    String?   @map("social_image_path") @db.VarChar(512)

  finalAverage       Decimal   @map("final_average") @db.Decimal(4, 3)
  finalRatingCount   Int       @map("final_rating_count")
  finalWeightedScore Decimal   @map("final_weighted_score") @db.Decimal(6, 4)

  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz(3)

  sourceOutfit       Outfit?   @relation(fields: [sourceOutfitId], references: [id], onDelete: SetNull, onUpdate: Cascade, map: "daily_winners_source_outfit_id_fkey")

  @@unique([dayStart, dayEnd], map: "daily_winners_day_period_key")
  @@index([dayStart(sort: Desc)], map: "daily_winners_day_start_idx")
  @@map("daily_winners")
}

model RateLimitCounter {
  keyHash         String          @map("key_hash") @db.Char(64)
  action          RateLimitAction
  windowStartedAt DateTime        @map("window_started_at") @db.Timestamptz(3)
  windowEndsAt    DateTime        @map("window_ends_at") @db.Timestamptz(3)
  count           Int             @default(0)
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz(3)
  updatedAt       DateTime        @updatedAt @map("updated_at") @db.Timestamptz(3)

  @@id([keyHash, action], map: "rate_limit_counters_pkey")
  @@index([windowEndsAt], map: "rate_limit_counters_window_ends_at_idx")
  @@map("rate_limit_counters")
}
```

---

## 6. Penjelasan Enum

## 6.1 `OutfitStatus`

```prisma
enum OutfitStatus {
  PROCESSING
  PUBLISHED
  FAILED
  HIDDEN
  EXPIRED
}
```

### `PROCESSING`

Record sudah dibuat, tetapi image bundle belum selesai dibuat atau belum selesai diunggah.

### `PUBLISHED`

Seluruh file wajib sudah tersedia dan submission dapat tampil di Hall of Fame.

### `FAILED`

Render, upload, atau finalisasi gagal.

Submission tidak tampil di Hall of Fame dan tidak dihitung sebagai publish sukses.

### `HIDDEN`

Submission pernah dipublikasikan, tetapi disembunyikan oleh operator.

### `EXPIRED`

Submission telah mencapai akhir masa aktif tujuh hari dan menunggu proses deletion.

Cleanup dapat langsung menghapus row tanpa mempertahankan status ini lama. Status tetap berguna untuk workflow dua tahap atau debugging.

---

## 6.2 `OutfitInteractionType`

```prisma
enum OutfitInteractionType {
  NATIVE_SHARE
  COPY_LINK
  WHATSAPP
  FACEBOOK
  X
  TELEGRAM
  DOWNLOAD
}
```

Model interaction digunakan untuk:

- mengukur share intent;
- membantu perhitungan Trending;
- memonitor download;
- investigasi abuse ringan;
- analytics produk.

Interaction bukan bukti bahwa share eksternal benar-benar selesai. Tombol share hanya dapat membuktikan bahwa user memulai action.

---

## 6.3 `RateLimitAction`

```prisma
enum RateLimitAction {
  SESSION_CREATE_HOURLY
  OUTFIT_PUBLISH_HOURLY
  OUTFIT_PUBLISH_DAILY
  OUTFIT_PUBLISH_COOLDOWN
  RATING_WRITE_HOURLY
  INTERACTION_WRITE_HOURLY
  DOWNLOAD_HOURLY
}
```

Setiap action memiliki window dan limit berbeda.

Contoh:

| Action                     |   Window |                 Limit |
| -------------------------- | -------: | --------------------: |
| `SESSION_CREATE_HOURLY`    |    1 jam |         5 per IP hash |
| `OUTFIT_PUBLISH_HOURLY`    |    1 jam |           5 per guest |
| `OUTFIT_PUBLISH_DAILY`     |   1 hari |          15 per guest |
| `OUTFIT_PUBLISH_COOLDOWN`  | 10 detik |           1 per guest |
| `RATING_WRITE_HOURLY`      |    1 jam |          30 per guest |
| `INTERACTION_WRITE_HOURLY` |    1 jam |          30 per guest |
| `DOWNLOAD_HOURLY`          |    1 jam | 60 per guest/IP scope |

---

## 7. Model `Guest`

```prisma
model Guest {
  id               String   @id @default(uuid()) @db.Uuid
  sessionTokenHash String   @unique @db.Char(64)
  ipHash           String?  @db.Char(64)
  userAgentHash    String?  @db.Char(64)
  createdAt        DateTime @default(now())
  lastSeenAt       DateTime @default(now())
  expiresAt        DateTime
}
```

## 7.1 `id`

Internal owner ID.

Tidak pernah ditampilkan pada UI publik dan tidak pernah diterima dari request body.

## 7.2 `sessionTokenHash`

Menyimpan SHA-256/HMAC hash dari random token pada cookie.

Browser memegang raw token.

Database hanya memegang hash sepanjang 64 karakter hex.

Keuntungan:

- kebocoran database tidak langsung memberikan cookie valid;
- token dapat dicocokkan dengan lookup hash;
- raw token tidak masuk log database.

## 7.3 `ipHash`

Bukan raw IP.

Nilainya direkomendasikan:

```text
HMAC(serverSecret, normalizedIp)
```

Digunakan untuk:

- membatasi pembuatan guest session;
- sinyal abuse;
- investigasi pola spam.

## 7.4 `userAgentHash`

Sinyal opsional, bukan identifier yang dipercaya.

Tidak boleh digunakan sebagai satu-satunya dasar memblokir user.

## 7.5 `lastSeenAt`

Diperbarui pada meaningful activity, bukan pada setiap asset click.

Contoh meaningful activity:

- membuka session;
- publish;
- rating;
- share;
- download.

## 7.6 `expiresAt`

Session cookie berlaku tujuh hari.

Record Guest dapat dipertahankan maksimal 14 hari atau sampai tidak memiliki data aktif, sesuai cleanup policy.

---

## 8. Model `Outfit`

`Outfit` adalah model inti White Chorus.

## 8.1 Identity

### `id`

UUID internal dan public route identifier.

### `shortCode`

Kode publik pendek:

```text
A7F2
```

Digunakan untuk:

```text
Anonymous Look #A7F2
white-chorus-A7F2.png
```

Kode harus dibuat server-side dengan entropy cukup dan unique retry.

## 8.2 Ownership

### `guestId`

Owner internal.

Client tidak dapat mengirim atau mengubah field ini.

## 8.3 Configuration

### `backgroundId`

ID background allowlist.

Contoh:

```text
background-03
```

### `characterAConfig`

Canonical JSON configuration Character A.

### `characterBConfig`

Canonical JSON configuration Character B.

Contoh JSON:

```json
{
  "hairId": "a-hair-02",
  "topId": "a-top-04",
  "bottomId": "a-bottom-01",
  "onePieceId": null,
  "shoesId": "a-shoes-03",
  "accessoryIds": ["a-accessory-02"]
}
```

Server harus:

- memvalidasi dengan Zod;
- menghapus field tambahan;
- mengurutkan array;
- menormalisasi optional value;
- memastikan asset cocok dengan character;
- memastikan One Piece tidak aktif bersama Top/Bottom.

### `configurationHash`

SHA-256 dari canonical configuration:

```text
background
+ characterA canonical JSON
+ characterB canonical JSON
```

Hash dipakai untuk duplicate lookup.

Tidak dibuat unique karena duplicate hanya diblokir selama window tertentu, bukan selamanya.

Jika dibuat unique, guest tidak dapat menerbitkan kombinasi yang sama lagi sampai row dihapus. Itu lebih ketat daripada requirement 24 jam.

## 8.4 Storage paths

```text
finalImagePath
downloadImagePath
thumbnailPath
socialImagePath
```

Field menyimpan path object, misalnya:

```text
outfits/{outfitId}/final.webp
outfits/{outfitId}/download.png
outfits/{outfitId}/thumbnail.webp
outfits/{outfitId}/social.jpg
```

Database tidak menyimpan signed URL karena signed URL dapat kedaluwarsa.

Public URL dibangun melalui storage adapter.

## 8.5 Rating aggregate

### `ratingAverage`

Nilai:

```text
0.000 sampai 5.000
```

`Decimal(4,3)` cukup untuk angka tersebut.

### `ratingCount`

Jumlah row rating.

### `weightedScore`

Score Bayesian/weighted untuk ranking Top Rated dan daily winner.

Nilai disimpan dengan empat digit desimal:

```text
Decimal(6,4)
```

## 8.6 Competition eligibility

### `isCompetitionEligible`

Default `true`.

Dapat diubah menjadi `false` untuk:

- pola rating mencurigakan;
- submission didiskualifikasi;
- keputusan operator.

Submission masih dapat tetap terlihat jika hanya didiskualifikasi dari kompetisi.

## 8.7 Lifecycle timestamps

### `createdAt`

Record `PROCESSING` dibuat.

### `publishedAt`

Diisi setelah seluruh image berhasil disimpan.

### `expiresAt`

```text
publishedAt + 7 hari
```

### `hiddenAt`

Diisi jika submission disembunyikan.

### `updatedAt`

Dikelola Prisma pada mutation.

## 8.8 Internal failure and moderation information

### `failureReason`

Hanya internal code pendek, misalnya:

```text
RENDER_FAILED
STORAGE_UPLOAD_FAILED
FINALIZE_FAILED
```

Jangan simpan stack trace atau secret pada field ini.

### `hiddenReason`

Alasan operasional singkat.

Tidak ditampilkan publik.

---

## 9. Model `Rating`

## 9.1 Satu guest satu rating

Constraint:

```prisma
@@unique([outfitId, guestId])
```

Memberikan jaminan database bahwa satu guest tidak dapat memiliki dua rating row pada outfit yang sama.

Update dilakukan dengan `upsert`.

## 9.2 Nilai rating

Prisma menggunakan:

```prisma
value Int @db.SmallInt
```

Database CHECK constraint membatasi:

```text
1 <= value <= 5
```

Validasi Zod tetap dilakukan sebelum query.

## 9.3 Self-rating

Pemilik tidak boleh memberi rating pada outfit sendiri.

Aturan ini melibatkan lookup ke tabel Outfit sehingga tidak cocok sebagai CHECK constraint biasa.

Enforce di use case dalam transaction:

```text
outfit.guestId !== currentGuest.id
```

## 9.4 Index

Unique index `[outfitId, guestId]` memiliki prefix `outfitId`, sehingga query seluruh rating suatu outfit dapat menggunakan index tersebut.

Index tambahan:

```prisma
@@index([guestId, updatedAt(sort: Desc)])
```

membantu observability dan query aktivitas guest.

Rate limiting write tidak hanya mengandalkan tabel Rating karena update berulang tetap hanya satu row. Rate limit write menggunakan `RateLimitCounter`.

---

## 10. Model `OutfitInteraction`

Model ini menggantikan kebutuhan model `ShareEvent` yang terlalu sempit.

White Chorus perlu mencatat:

- share;
- copy link;
- download.

Model ini tetap ringan dan terhapus melalui cascade bersama outfit.

## 10.1 Tidak menjadi sumber ownership

Interaction tidak mengubah outfit dan tidak memberikan akses khusus.

## 10.2 Trending

Query dapat menghitung interaction 24 jam terakhir:

```text
WHERE outfit_id = ?
AND created_at >= now() - interval '24 hours'
```

## 10.3 Rate limiting

Rate limit interaction tetap menggunakan `RateLimitCounter`.

Interaction table digunakan sebagai analytics, bukan satu-satunya enforcement.

## 10.4 Data retention

Karena relation `onDelete: Cascade`, interaction otomatis hilang saat submission regular dihapus.

---

## 11. Model `DailyWinner`

## 11.1 `sourceOutfitId`

Nullable dan unique.

Relasi:

```prisma
onDelete: SetNull
```

Saat source outfit dihapus setelah tujuh hari:

- DailyWinner tidak ikut terhapus;
- `sourceOutfitId` menjadi `null`;
- snapshot image dan statistik tetap tersedia.

## 11.2 `dayKey`

Format:

```text
YYYY-MM-DD
```

Mewakili tanggal Senin awal periode pada timezone kompetisi.

Contoh:

```text
2026-08-03
```

Digunakan pada URL:

```text
/daily-winners/2026-08-03
```

## 11.3 Period uniqueness

Constraint:

```prisma
@@unique([dayStart, dayEnd])
```

mencegah dua pemenang untuk periode yang sama.

`dayKey` juga unique sebagai public route key.

## 11.4 Frozen statistics

Field berikut tidak dihitung ulang:

```text
finalAverage
finalRatingCount
finalWeightedScore
```

Nilai mencerminkan kondisi pada saat winner dipilih.

## 11.5 Winner image

`winnerImagePath` harus menunjuk ke snapshot persisten, bukan hanya file regular outfit yang akan dihapus.

Contoh:

```text
daily-winners/2026-08-03/winner.webp
```

---

## 12. Model `RateLimitCounter`

## 12.1 Kenapa model ini diperlukan?

Vercel bersifat serverless/auto-scaling.

Counter in-memory dapat berbeda antara instance.

PostgreSQL counter memastikan request melihat state limit yang sama.

## 12.2 Composite primary key

```prisma
@@id([keyHash, action])
```

Satu key hanya memiliki satu active window untuk setiap action.

Contoh key material sebelum di-hash:

```text
guest:{guestId}
ip:{ipHash}
guest:{guestId}:outfit:{outfitId}
```

Database hanya menyimpan hash final.

## 12.3 Window

Field:

```text
windowStartedAt
windowEndsAt
count
```

Saat request masuk:

1. jika counter belum ada, buat count `1`;
2. jika window sudah berakhir, reset window dan count `1`;
3. jika window aktif dan count belum mencapai limit, increment;
4. jika count sudah mencapai limit, tolak request.

## 12.4 Atomicity

Update counter harus atomik.

Jangan lakukan:

```text
SELECT count
kemudian
UPDATE count
```

tanpa transaction/locking karena concurrent request dapat melewati limit.

Gunakan:

- transaction dengan row lock; atau
- satu raw SQL `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING`.

## 12.5 Cleanup

Counter lama dapat dihapus:

```sql
DELETE FROM rate_limit_counters
WHERE window_ends_at < now() - interval '1 day';
```

---

## 13. Relasi dan Referential Actions

| Parent | Child             | Action ketika parent dihapus | Alasan                                                       |
| ------ | ----------------- | ---------------------------- | ------------------------------------------------------------ |
| Guest  | Outfit            | Cascade                      | Guest dibersihkan hanya setelah tidak memiliki active outfit |
| Guest  | Rating            | Cascade                      | Rating anonymous tidak perlu hidup tanpa guest               |
| Guest  | OutfitInteraction | Cascade                      | Interaction anonymous tidak perlu hidup tanpa guest          |
| Outfit | Rating            | Cascade                      | Rating hilang bersama submission                             |
| Outfit | OutfitInteraction | Cascade                      | Analytics regular hilang bersama submission                  |
| Outfit | DailyWinner       | SetNull                      | Winner snapshot harus bertahan                               |

### Aturan cleanup Guest

Karena Guest → Outfit menggunakan Cascade, job cleanup Guest harus memastikan:

```text
tidak ada outfit aktif
tidak ada data yang masih diperlukan
```

Guest tidak boleh dihapus hanya karena cookie berakhir apabila submission aktif masih ada.

---

## 14. Index Strategy

## 14.1 Hall of Fame Newest

```prisma
@@index([status, publishedAt(sort: Desc)])
```

Mendukung:

```sql
WHERE status = 'PUBLISHED'
ORDER BY published_at DESC
LIMIT 9 OFFSET ?
```

## 14.2 Expiration

```prisma
@@index([status, expiresAt])
```

Mendukung:

```sql
WHERE status = 'PUBLISHED'
AND expires_at <= now()
```

## 14.3 Top Rated

```prisma
@@index([
  status,
  weightedScore(sort: Desc),
  ratingCount(sort: Desc),
  publishedAt(sort: Asc)
])
```

Mendukung urutan:

```text
weighted score tertinggi
rating count tertinggi
published lebih awal sebagai tie-breaker
```

## 14.4 Publish limit dan history guest

```prisma
@@index([guestId, createdAt(sort: Desc)])
```

Mendukung hitung successful/processing submission terbaru guest.

## 14.5 Duplicate lookup

```prisma
@@index([
  guestId,
  configurationHash,
  createdAt(sort: Desc)
])
```

Mendukung:

```text
guest yang sama
hash yang sama
dalam 24 jam terakhir
```

## 14.6 Daily candidate lookup

```prisma
@@index([isCompetitionEligible, publishedAt(sort: Desc)])
```

Query tetap harus memfilter:

```text
status = PUBLISHED
publishedAt dalam periode
```

## 14.7 Rating

Unique index:

```text
(outfitId, guestId)
```

dan activity index:

```text
(guestId, updatedAt DESC)
```

## 14.8 Interaction

Indexes disediakan berdasarkan:

- outfit dan waktu;
- guest dan waktu;
- type dan waktu.

## 14.9 Kenapa tidak menggunakan partial index sekarang?

Prisma ORM modern mendukung partial indexes melalui feature flag, tetapi White Chorus tidak memerlukannya untuk skala awal puluhan hingga ratusan submission.

Keputusan pragmatis:

> Gunakan index biasa dahulu. Tambahkan partial index hanya setelah `EXPLAIN ANALYZE` menunjukkan kebutuhan nyata.

Ini menghindari ketergantungan pada preview feature hanya untuk optimasi yang belum dibutuhkan.

---

## 15. Database Constraints yang Ditambahkan melalui SQL

Prisma Schema belum merepresentasikan semua PostgreSQL CHECK constraint secara langsung. Constraint tetap dapat dibuat melalui customized migration dan akan ditegakkan database.

Setelah membuat migration awal:

```bash
pnpm prisma migrate dev --name init_white_chorus --create-only
```

tambahkan SQL berikut ke file `migration.sql`.

```sql
-- Guest session expiry must be later than creation time.
ALTER TABLE "guests"
ADD CONSTRAINT "guests_expiry_check"
CHECK ("expires_at" > "created_at");


-- Public short code format.
ALTER TABLE "outfits"
ADD CONSTRAINT "outfits_short_code_format_check"
CHECK ("short_code" ~ '^[A-Z0-9]{4,12}$');


-- Rating aggregate must always stay in valid ranges.
ALTER TABLE "outfits"
ADD CONSTRAINT "outfits_rating_average_check"
CHECK ("rating_average" >= 0 AND "rating_average" <= 5);

ALTER TABLE "outfits"
ADD CONSTRAINT "outfits_rating_count_check"
CHECK ("rating_count" >= 0);

ALTER TABLE "outfits"
ADD CONSTRAINT "outfits_weighted_score_check"
CHECK ("weighted_score" >= 0 AND "weighted_score" <= 5);


-- Published lifecycle timestamps must be logically ordered.
ALTER TABLE "outfits"
ADD CONSTRAINT "outfits_expiry_after_publish_check"
CHECK (
  "published_at" IS NULL
  OR "expires_at" IS NULL
  OR "expires_at" > "published_at"
);


-- A visible or previously visible outfit must have all publish artifacts.
ALTER TABLE "outfits"
ADD CONSTRAINT "outfits_published_artifacts_check"
CHECK (
  "status" NOT IN ('PUBLISHED', 'HIDDEN', 'EXPIRED')
  OR (
    "published_at" IS NOT NULL
    AND "expires_at" IS NOT NULL
    AND "final_image_path" IS NOT NULL
    AND "download_image_path" IS NOT NULL
    AND "thumbnail_path" IS NOT NULL
    AND "social_image_path" IS NOT NULL
  )
);


-- Rating value is always 1 through 5.
ALTER TABLE "ratings"
ADD CONSTRAINT "ratings_value_check"
CHECK ("value" BETWEEN 1 AND 5);


-- Daily winner period and final values.
ALTER TABLE "daily_winners"
ADD CONSTRAINT "daily_winners_period_check"
CHECK ("day_end" > "day_start");

ALTER TABLE "daily_winners"
ADD CONSTRAINT "daily_winners_final_average_check"
CHECK ("final_average" >= 0 AND "final_average" <= 5);

ALTER TABLE "daily_winners"
ADD CONSTRAINT "daily_winners_final_rating_count_check"
CHECK ("final_rating_count" >= 0);

ALTER TABLE "daily_winners"
ADD CONSTRAINT "daily_winners_final_weighted_score_check"
CHECK (
  "final_weighted_score" >= 0
  AND "final_weighted_score" <= 5
);


-- Rate limit counters.
ALTER TABLE "rate_limit_counters"
ADD CONSTRAINT "rate_limit_counters_window_check"
CHECK ("window_ends_at" > "window_started_at");

ALTER TABLE "rate_limit_counters"
ADD CONSTRAINT "rate_limit_counters_count_check"
CHECK ("count" >= 0);
```

### Catatan penting

Prisma Client validation tetap diperlukan.

CHECK constraints adalah lapisan terakhir untuk mencegah data invalid masuk melalui:

- bug server;
- manual SQL;
- future migration;
- internal tooling.

---

## 16. Mengapa Beberapa Aturan Tidak Dimasukkan ke Prisma Schema

## 16.1 Self-rating

Aturan:

```text
Rating.guestId != Outfit.guestId
```

melibatkan dua tabel.

Enforce di use case transaction.

Database trigger mungkin dibuat, tetapi belum diperlukan untuk MVP.

## 16.2 Asset compatibility

Database tidak memiliki tabel asset resmi.

Asset catalog berasal dari code manifest.

Validasi berikut dilakukan server-side:

- asset ID ada;
- asset aktif;
- asset milik Character A atau B yang benar;
- kategori benar;
- One Piece versus Top/Bottom valid.

## 16.3 JSON shape

`JsonB` tidak otomatis menjamin shape.

Gunakan Zod untuk:

- canonicalization;
- strict object;
- array limit;
- enum/allowlist;
- cross-field validation.

Tidak perlu mengaktifkan `pg_jsonschema` untuk MVP.

## 16.4 Daily eligibility

Eligibility mencakup:

- status;
- period;
- minimum rating count;
- competition flag;
- suspicious activity;
- weighted score.

Logic lebih mudah diuji dalam TypeScript daripada database trigger.

---

## 17. Prisma 7 Configuration

Prisma ORM 7 memindahkan connection URL ke `prisma.config.ts`.

File:

```text
prisma.config.ts
```

```ts
import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Use a direct or Supavisor session-mode URL for Prisma CLI
    // migrations and schema operations.
    url: env("DIRECT_URL"),
  },
});
```

### Kenapa `DIRECT_URL`?

Runtime Vercel menggunakan Supavisor transaction pooler.

Prisma CLI untuk migration menggunakan:

- direct connection jika network mendukung; atau
- Supavisor session mode port 5432.

Migration tidak sebaiknya dijalankan melalui transaction pooler port 6543.

---

## 18. Prisma Client untuk Next.js dan Supabase

Prisma ORM 7 memerlukan driver adapter untuk direct database connection.

File:

```text
src/server/database/prisma.ts
```

```ts
import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Aturan

- file menggunakan `server-only`;
- tidak boleh di-import Client Component;
- runtime publish/Sharp menggunakan Node.js;
- Prisma Client dihasilkan ke `src/generated/prisma`;
- generated folder tidak diedit manual;
- jalankan `prisma generate` setelah schema berubah.

---

## 19. Environment Variables

```env
# Runtime application traffic on Vercel/serverless.
# Use Supavisor transaction mode, commonly port 6543.
DATABASE_URL="postgres://prisma.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres?sslmode=require"

# Prisma CLI migrations.
# Use direct connection or Supavisor session mode, commonly port 5432.
DIRECT_URL="postgres://prisma.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres?sslmode=require"
```

Additional application variables:

```env
SESSION_TOKEN_SECRET=
SESSION_MAX_AGE_SECONDS=604800

PUBLISH_LIMIT_PER_HOUR=5
PUBLISH_LIMIT_PER_DAY=15
PUBLISH_COOLDOWN_SECONDS=10
DUPLICATE_WINDOW_HOURS=24

RATING_LIMIT_PER_HOUR=30
INTERACTION_LIMIT_PER_HOUR=30
DOWNLOAD_LIMIT_PER_HOUR=60

SUBMISSION_RETENTION_DAYS=7
GUEST_RETENTION_DAYS=14

DAILY_TIMEZONE=Asia/Jakarta
DAILY_MIN_RATINGS=5
```

### Jangan pernah menggunakan

```env
NEXT_PUBLIC_DATABASE_URL=
NEXT_PUBLIC_DIRECT_URL=
NEXT_PUBLIC_SESSION_TOKEN_SECRET=
```

---

## 20. Package Installation

Dengan pnpm:

```bash
pnpm add @prisma/client @prisma/adapter-pg pg
pnpm add -D prisma @types/pg
```

Generate client:

```bash
pnpm prisma generate
```

Prisma ORM 7 tidak lagi mengandalkan generated client tersembunyi di `node_modules`. `output` harus ditentukan dalam generator.

---

## 21. Migration Workflow

## 21.1 Development migration

```bash
pnpm prisma migrate dev --name init_white_chorus --create-only
```

Edit migration SQL untuk menambahkan CHECK constraints.

Kemudian apply:

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

## 21.2 Migration berikutnya

```bash
pnpm prisma migrate dev --name add_feature_name
pnpm prisma generate
```

## 21.3 Production

```bash
pnpm prisma migrate deploy
pnpm prisma generate
pnpm build
```

Prisma ORM 7 tidak otomatis menjalankan `prisma generate` setelah `migrate dev`, sehingga perintah generate harus eksplisit.

## 21.4 Jangan gunakan `db push` di production

`prisma db push` cocok untuk prototyping lokal, bukan deployment schema production yang harus dapat diaudit dan di-rollback.

## 21.5 Migration immutable

Migration yang sudah diterapkan ke production tidak diedit.

Buat migration koreksi baru.

---

## 22. Seed Strategy

File:

```text
prisma/seed.ts
```

Seed development dapat membuat:

- 20 guest dummy;
- 50 outfit dummy;
- rating dummy;
- 2 daily winner snapshot.

Seed tidak perlu menjalankan Sharp untuk semua record.

Gunakan placeholder image path yang mengarah ke fixture development.

Jangan menjalankan seed development pada production.

Contoh package config:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Atau gunakan `prisma.config.ts` sesuai tooling project.

---

## 23. Core Query Patterns

## 23.1 Newest Hall of Fame

```ts
const outfits = await prisma.outfit.findMany({
  where: {
    status: "PUBLISHED",
    expiresAt: {
      gt: now,
    },
  },
  orderBy: {
    publishedAt: "desc",
  },
  skip: (page - 1) * 9,
  take: 9,
  select: {
    id: true,
    shortCode: true,
    thumbnailPath: true,
    ratingAverage: true,
    ratingCount: true,
    publishedAt: true,
    expiresAt: true,
  },
});
```

## 23.2 Top Rated

```ts
const outfits = await prisma.outfit.findMany({
  where: {
    status: "PUBLISHED",
    expiresAt: {
      gt: now,
    },
  },
  orderBy: [
    { weightedScore: "desc" },
    { ratingCount: "desc" },
    { publishedAt: "asc" },
  ],
  skip: (page - 1) * 9,
  take: 9,
  select: {
    id: true,
    shortCode: true,
    thumbnailPath: true,
    ratingAverage: true,
    ratingCount: true,
    weightedScore: true,
    publishedAt: true,
    expiresAt: true,
  },
});
```

## 23.3 Duplicate lookup

```ts
const duplicate = await prisma.outfit.findFirst({
  where: {
    guestId,
    configurationHash,
    createdAt: {
      gte: duplicateWindowStart,
    },
    status: {
      in: ["PROCESSING", "PUBLISHED"],
    },
  },
  select: {
    id: true,
  },
});
```

## 23.4 Active process

```ts
const activeProcess = await prisma.outfit.findFirst({
  where: {
    guestId,
    status: "PROCESSING",
    createdAt: {
      gte: stuckProcessingThreshold,
    },
  },
  select: {
    id: true,
  },
});
```

---

## 24. Publish Transaction

Publish memiliki external side effect berupa Storage upload, sehingga tidak dapat dibungkus seluruhnya dalam satu transaction database panjang.

Workflow yang disarankan:

### Step 1 — Validation

Dilakukan sebelum membuat record:

- guest valid;
- origin valid;
- Zod valid;
- asset allowlist valid;
- duplicate tidak ada;
- publish limit tersedia;
- tidak ada active processing.

### Step 2 — Create processing record

```ts
const processing = await prisma.outfit.create({
  data: {
    guestId,
    shortCode,
    backgroundId,
    characterAConfig,
    characterBConfig,
    configurationHash,
    status: "PROCESSING",
  },
});
```

### Step 3 — Render dan upload

Di luar DB transaction panjang:

```text
Sharp render
→ upload final
→ upload PNG
→ upload thumbnail
→ upload social image
```

### Step 4 — Finalize

```ts
const publishedAt = clock.now();
const expiresAt = addDays(publishedAt, 7);

await prisma.outfit.update({
  where: {
    id: processing.id,
  },
  data: {
    status: "PUBLISHED",
    finalImagePath,
    downloadImagePath,
    thumbnailPath,
    socialImagePath,
    publishedAt,
    expiresAt,
    failureReason: null,
  },
});
```

### Step 5 — Failure

Jika render/upload gagal:

1. hapus partial file;
2. update Outfit menjadi `FAILED`;
3. isi `failureReason` dengan code aman;
4. jangan increment successful publish counter.

---

## 25. Rating Transaction

Rating update harus konsisten dengan aggregate.

Pseudo-flow:

```ts
await prisma.$transaction(async (tx) => {
  const outfit = await tx.outfit.findUnique({
    where: { id: outfitId },
    select: {
      id: true,
      guestId: true,
      status: true,
      expiresAt: true,
    },
  });

  // Validate active outfit and self-rating here.

  await tx.rating.upsert({
    where: {
      outfitId_guestId: {
        outfitId,
        guestId,
      },
    },
    create: {
      outfitId,
      guestId,
      value,
    },
    update: {
      value,
    },
  });

  const aggregate = await tx.rating.aggregate({
    where: {
      outfitId,
    },
    _avg: {
      value: true,
    },
    _count: {
      value: true,
    },
  });

  const ratingAverage = aggregate._avg.value ?? 0;
  const ratingCount = aggregate._count.value;
  const weightedScore = calculateWeightedScore({
    ratingAverage,
    ratingCount,
    globalAverage,
    minimumRatings,
  });

  await tx.outfit.update({
    where: {
      id: outfitId,
    },
    data: {
      ratingAverage,
      ratingCount,
      weightedScore,
    },
  });
});
```

### Concurrency note

Untuk traffic MVP, transaction di atas cukup sebagai awal.

Jika concurrency rating tinggi, pertimbangkan:

- transaction isolation lebih kuat;
- aggregate query setelah upsert dengan retry;
- database function;
- asynchronous reconciliation.

Jangan menambah kompleksitas tersebut sebelum ada bukti masalah.

---

## 26. Rate Limit Counter Strategy

## 26.1 Scope key

Contoh material:

```text
guest:{guestId}
ip:{ipHash}
guest:{guestId}:outfit:{outfitId}
```

Hash:

```text
HMAC_SHA256(RATE_LIMIT_SECRET, material)
```

## 26.2 Atomic SQL concept

Implementasi ideal menggunakan satu statement PostgreSQL dengan upsert.

Pseudocode SQL:

```sql
INSERT INTO "rate_limit_counters" (
  "key_hash",
  "action",
  "window_started_at",
  "window_ends_at",
  "count",
  "created_at",
  "updated_at"
)
VALUES (
  $1,
  $2::rate_limit_action,
  $3,
  $4,
  1,
  now(),
  now()
)
ON CONFLICT ("key_hash", "action")
DO UPDATE SET
  "window_started_at" = CASE
    WHEN "rate_limit_counters"."window_ends_at" <= $3
    THEN $3
    ELSE "rate_limit_counters"."window_started_at"
  END,
  "window_ends_at" = CASE
    WHEN "rate_limit_counters"."window_ends_at" <= $3
    THEN $4
    ELSE "rate_limit_counters"."window_ends_at"
  END,
  "count" = CASE
    WHEN "rate_limit_counters"."window_ends_at" <= $3
    THEN 1
    ELSE "rate_limit_counters"."count" + 1
  END,
  "updated_at" = now()
RETURNING "count", "window_ends_at";
```

Application menolak action jika returned count melebihi limit.

Untuk memastikan request yang ditolak tidak terus meningkatkan count tanpa batas, implementasi dapat:

- membatasi increment pada `limit + 1`; atau
- menerima count bertambah dan membersihkannya saat window berakhir.

## 26.3 Publish success versus attempt

Gunakan counter cooldown sebelum render.

Counter hourly/daily dapat:

- di-reserve sebelum process dan dikembalikan jika gagal; atau
- di-increment setelah publish sukses.

Rekomendasi pragmatis:

- cooldown di-check sebelum render;
- hourly/daily successful publish dihitung dari tabel Outfit `PUBLISHED`;
- `RateLimitCounter` digunakan untuk request velocity dan rating-update writes.

Dengan begitu, failed publish tidak menghabiskan quota final.

---

## 27. Daily Winner Query

Eligibility:

```text
status = PUBLISHED
isCompetitionEligible = true
publishedAt >= dayStart
publishedAt < dayEnd
ratingCount >= minimumRatings
```

Query:

```ts
const candidates = await prisma.outfit.findMany({
  where: {
    status: "PUBLISHED",
    isCompetitionEligible: true,
    publishedAt: {
      gte: dayStart,
      lt: dayEnd,
    },
    ratingCount: {
      gte: minimumRatings,
    },
  },
  orderBy: [
    { weightedScore: "desc" },
    { ratingCount: "desc" },
    { ratingAverage: "desc" },
    { publishedAt: "asc" },
    { id: "asc" },
  ],
  take: 1,
});
```

Create snapshot menggunakan unique period constraint.

Jika cron dipanggil dua kali, create kedua harus dianggap idempotent.

---

## 28. Expiration dan Cleanup

## 28.1 Find expired

```ts
const expired = await prisma.outfit.findMany({
  where: {
    status: {
      in: ["PUBLISHED", "HIDDEN"],
    },
    expiresAt: {
      lte: now,
    },
  },
  take: batchSize,
  select: {
    id: true,
    finalImagePath: true,
    downloadImagePath: true,
    thumbnailPath: true,
    socialImagePath: true,
  },
});
```

## 28.2 Cleanup order

Recommended:

1. mark `EXPIRED`;
2. delete Storage objects;
3. delete Outfit row;
4. Rating dan OutfitInteraction terhapus melalui cascade;
5. DailyWinner source relation menjadi null.

## 28.3 Batch

Gunakan batch, misalnya:

```text
50–100 row per run
```

Tidak perlu menghapus ribuan row dalam satu transaction.

## 28.4 Failed/stuck processing cleanup

Query:

```text
status = PROCESSING
createdAt <= now - 15 minutes
```

Set menjadi `FAILED`, hapus orphan file, lalu delete setelah retention singkat.

---

## 29. Security Boundary

## 29.1 Prisma role

Gunakan custom Postgres role untuk Prisma sesuai panduan Supabase.

Jika aplikasi hanya memakai Prisma dan tidak memakai Supabase Data API untuk tabel ini, Data API dapat dinonaktifkan atau tabel tidak diekspos ke client.

## 29.2 No browser Prisma

Generated Prisma Client server tidak boleh masuk client bundle.

## 29.3 No service-role exposure

Supabase Storage service-role hanya berada pada server adapter.

## 29.4 No direct writes

Browser tidak menulis langsung ke:

```text
guests
outfits
ratings
outfit_interactions
daily_winners
rate_limit_counters
```

## 29.5 RLS

Karena database diakses melalui custom server role yang dapat bypass RLS dan tidak ada direct browser database access, security utama berada di Next.js server boundary.

Jangan berasumsi RLS akan melindungi endpoint yang salah.

Server authorization tetap wajib.

---

## 30. Data Retention

| Data              | Retention                                              |
| ----------------- | ------------------------------------------------------ |
| Outfit regular    | 7 hari sejak publish                                   |
| Rating            | Mengikuti Outfit melalui cascade                       |
| OutfitInteraction | Mengikuti Outfit melalui cascade                       |
| Guest             | Sekitar 14 hari atau setelah tidak memiliki data aktif |
| DailyWinner       | Selama campaign/hingga diarsipkan                      |
| RateLimitCounter  | Dihapus setelah window berakhir + buffer               |
| Failed Outfit     | Dapat dihapus setelah 1–3 hari untuk debugging         |
| Raw IP            | Tidak disimpan                                         |
| Session raw token | Tidak disimpan di database                             |

---

## 31. DTO dan Decimal Serialization

Prisma `Decimal` tidak boleh dikirim langsung tanpa mapping yang jelas.

Mapper:

```ts
function toPublicOutfitCard(outfit: OutfitCardRecord) {
  return {
    id: outfit.id,
    shortCode: outfit.shortCode,
    thumbnailUrl: getPublicFileUrl(outfit.thumbnailPath),
    ratingAverage: Number(outfit.ratingAverage),
    ratingCount: outfit.ratingCount,
    publishedAt: outfit.publishedAt?.toISOString() ?? null,
    expiresAt: outfit.expiresAt?.toISOString() ?? null,
  };
}
```

### Aturan

- convert Decimal ke number hanya untuk range kecil 0–5;
- jangan expose `guestId`;
- jangan expose internal Storage credential;
- jangan expose `failureReason`;
- DateTime dikirim sebagai ISO 8601.

---

## 32. Testing Requirements

## 32.1 Schema tests

- duplicate `sessionTokenHash` ditolak;
- duplicate `shortCode` ditolak;
- duplicate rating guest/outfit ditolak;
- rating 0 dan 6 ditolak CHECK constraint;
- negative rating count ditolak;
- invalid daily period ditolak;
- rate limit negative count ditolak.

## 32.2 Referential action tests

- delete Outfit menghapus Rating;
- delete Outfit menghapus OutfitInteraction;
- delete Outfit tidak menghapus DailyWinner;
- `DailyWinner.sourceOutfitId` menjadi null;
- delete Guest menghapus child data ketika cleanup memang dilakukan.

## 32.3 Use-case tests

- user tidak dapat self-rate;
- rating update tidak membuat row kedua;
- failed publish tidak menjadi PUBLISHED;
- published Outfit memiliki seluruh image path;
- duplicate detection hanya memblokir dalam window;
- daily winner period unique;
- expired Outfit tidak muncul di Hall of Fame.

## 32.4 Rate-limit concurrency test

Kirim beberapa request paralel dan pastikan counter tidak kehilangan increment.

---

## 33. Operational Queries

## 33.1 Active outfit count

```sql
SELECT count(*)
FROM "outfits"
WHERE "status" = 'PUBLISHED'
AND "expires_at" > now();
```

## 33.2 Stuck processing

```sql
SELECT
  "id",
  "guest_id",
  "created_at",
  now() - "created_at" AS age
FROM "outfits"
WHERE "status" = 'PROCESSING'
AND "created_at" < now() - interval '15 minutes'
ORDER BY "created_at";
```

## 33.3 Expired but not cleaned

```sql
SELECT count(*)
FROM "outfits"
WHERE "expires_at" <= now();
```

## 33.4 Top rated active

```sql
SELECT
  "id",
  "short_code",
  "rating_average",
  "rating_count",
  "weighted_score"
FROM "outfits"
WHERE "status" = 'PUBLISHED'
AND "expires_at" > now()
ORDER BY
  "weighted_score" DESC,
  "rating_count" DESC,
  "published_at" ASC
LIMIT 20;
```

## 33.5 Daily candidate

```sql
SELECT
  "id",
  "short_code",
  "rating_average",
  "rating_count",
  "weighted_score",
  "published_at"
FROM "outfits"
WHERE "status" = 'PUBLISHED'
AND "is_competition_eligible" = true
AND "published_at" >= $1
AND "published_at" < $2
AND "rating_count" >= $3
ORDER BY
  "weighted_score" DESC,
  "rating_count" DESC,
  "rating_average" DESC,
  "published_at" ASC,
  "id" ASC;
```

## 33.6 Rate limit cleanup

```sql
DELETE FROM "rate_limit_counters"
WHERE "window_ends_at" < now() - interval '1 day';
```

---

## 34. Schema Evolution Rules

### 34.1 Menambah item dress-up tidak membutuhkan migration

Asset item berada di code catalog, bukan database.

Perubahan dari 5 menjadi 10 item per kategori tidak mengubah schema.

### 34.2 Menambah interaction type membutuhkan migration enum

Tambahkan hanya jika channel benar-benar dibutuhkan.

### 34.3 Menambah field wajib dilakukan dua tahap

Untuk production data:

1. tambahkan nullable/default field;
2. deploy dan backfill;
3. ubah menjadi required pada migration berikutnya jika perlu.

### 34.4 Jangan rename langsung tanpa mapping plan

Rename field Prisma dapat menghasilkan drop/create bila tidak menggunakan `@map` dengan benar.

Review migration SQL sebelum apply.

### 34.5 Jangan menghapus field image sebelum cleanup code diperbarui

Storage cleanup bergantung pada image paths.

---

## 35. Keputusan yang Sengaja Tidak Digunakan

## 35.1 Tidak ada tabel Asset

Asset resmi dikelola dalam repository dan deployment.

Database Asset hanya dibutuhkan jika operator non-developer harus mengelola catalog tanpa deploy.

Belum diperlukan.

## 35.2 Tidak ada database trigger rating aggregate

Application transaction lebih mudah dipahami dan diuji untuk MVP.

Tambahkan trigger hanya jika ada direct writer lain atau konsistensi terbukti bermasalah.

## 35.3 Tidak ada partial index

Index biasa cukup untuk expected scale.

## 35.4 Tidak ada soft delete general

Outfit memiliki lifecycle status, tetapi cleanup tetap melakukan physical delete setelah tujuh hari.

Soft delete permanen bertentangan dengan retention requirement.

## 35.5 Tidak ada audit log lengkap

Structured application logs cukup untuk MVP.

Daily winner snapshot dan interaction event sudah mencakup kebutuhan produk utama.

## 35.6 Tidak ada Supabase Auth relation

Guest identity bukan `auth.users`.

White Chorus menggunakan custom anonymous guest cookie.

---

## 36. Implementation Checklist

### Schema

- [ ] Prisma ORM 7 digunakan.
- [ ] Generator memakai `prisma-client`.
- [ ] Custom output ditentukan.
- [ ] Datasource URL tidak ditulis di `schema.prisma`.
- [ ] Semua ID menggunakan PostgreSQL UUID.
- [ ] Semua timestamp menggunakan `Timestamptz(3)`.
- [ ] JSON menggunakan `JsonB`.
- [ ] Rating menggunakan `SmallInt`.
- [ ] Decimal precision sesuai.

### Constraints

- [ ] Rating 1–5 CHECK dibuat.
- [ ] Rating aggregate CHECK dibuat.
- [ ] Daily value CHECK dibuat.
- [ ] Publish artifact CHECK dibuat.
- [ ] Rate-limit window CHECK dibuat.
- [ ] Short-code format CHECK dibuat.

### Relations

- [ ] Guest deletion cascade diuji.
- [ ] Outfit deletion cascade diuji.
- [ ] DailyWinner SetNull diuji.
- [ ] Unique rating diuji.
- [ ] Unique daily period diuji.

### Runtime

- [ ] `@prisma/adapter-pg` digunakan.
- [ ] Runtime memakai pooled `DATABASE_URL`.
- [ ] Migration memakai `DIRECT_URL`.
- [ ] Prisma Client hanya di server.
- [ ] Development singleton digunakan.
- [ ] `prisma generate` masuk build workflow.

### Business logic

- [ ] Self-rating dicegah.
- [ ] Config dinormalisasi.
- [ ] Duplicate window 24 jam.
- [ ] Publish immutable.
- [ ] Expiration tujuh hari.
- [ ] Daily minimum lima rating.
- [ ] Rate-limit counter atomik.
- [ ] Decimal dipetakan ke DTO.

### Operations

- [ ] Stuck PROCESSING cleanup tersedia.
- [ ] Failed Outfit cleanup tersedia.
- [ ] RateLimitCounter cleanup tersedia.
- [ ] Operational SQL terdokumentasi.
- [ ] Backup/migration procedure tersedia.

---

## 37. Referensi Resmi

Prisma ORM:

- [Prisma ORM documentation](https://www.prisma.io/docs/orm)
- [Prisma Schema reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma Client generator](https://www.prisma.io/docs/orm/prisma-schema/overview/generators)
- [Generating Prisma Client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
- [Prisma Client setup and driver adapters](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction)
- [PostgreSQL connector](https://www.prisma.io/docs/orm/core-concepts/supported-databases/postgresql)
- [Indexes](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes)
- [Referential actions](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions)
- [CHECK constraints with PostgreSQL](https://www.prisma.io/docs/orm/more/troubleshooting/check-constraints)
- [Prisma Config reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/getting-started)

Supabase:

- [Using Prisma with Supabase Postgres](https://supabase.com/docs/guides/database/prisma)
- [Connecting to Supabase Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

# Final Recommendation

Gunakan schema di dokumen ini sebagai schema production baseline White Chorus.

Komposisi final:

```text
Guest               → anonymous session
Outfit              → published Hall of Fame submission
Rating              → one guest, one outfit, one star value
OutfitInteraction   → sharing, copy, and download events
DailyWinner        → persistent daily snapshot
RateLimitCounter    → persistent abuse controls for serverless
```

Schema ini mempertahankan batas pragmatis:

- tidak menggunakan Supabase Auth;
- tidak membuat tabel asset yang belum dibutuhkan;
- tidak memakai Redis;
- tidak memakai queue;
- tidak memakai trigger kompleks;
- tidak memakai partial index sebelum dibutuhkan;
- tetap memiliki constraint dan index yang cukup untuk keamanan serta performa MVP.

---

**End of document**
