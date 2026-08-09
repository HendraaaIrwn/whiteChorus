# White Chorus

Anonymous two-character dress-up experience built with Next.js, Prisma, Supabase PostgreSQL/Storage, and Sharp.

## Local setup

1. Copy `.env.example` to `.env.local` and provide development credentials.
2. Run `pnpm install`, `pnpm prisma:generate`, and `pnpm prisma:migrate`.
3. Add official dress-up assets according to `docs/asset-production-guide.md`.
4. Run `pnpm dev`.

`pnpm prisma:seed` creates 100 active Hall fixtures plus ratings and a daily winner. Set `SEED_OUTFIT_COUNT` from 1–500 for load testing.
Fixture mode intentionally renders CSS placeholders; only production mode resolves generated Storage images.

## Verification

`pnpm env:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm assets:validate`, `pnpm prisma:validate`, and `pnpm build`.

`pnpm assets:validate:release` intentionally fails until the complete official art, logo, watermark, and audio handoff is present.
