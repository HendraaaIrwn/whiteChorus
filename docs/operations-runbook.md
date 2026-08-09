# White Chorus Operations Runbook

## Staging bootstrap and verification

- Use a dedicated Supabase staging project. Set `DATABASE_URL` to Supavisor transaction mode on port 6543 with `sslmode=require&uselibpqcompat=true&pgbouncer=true&connection_limit=1`; set `DIRECT_URL` to the direct or Supavisor session-mode endpoint on port 5432 with `sslmode=require&uselibpqcompat=true`. `uselibpqcompat=true` preserves encrypted `sslmode=require` behavior with the current `pg` connection-string parser.
- Create the public `white-chorus-generated` Storage bucket. Only the server-side service-role key belongs in `SUPABASE_SERVICE_ROLE_KEY`; never expose it through a `NEXT_PUBLIC_` variable.
- In GitHub's protected `staging` environment, populate `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `TURNSTILE_SECRET_KEY`. Internal secrets must be unique staging-only random values.
- Set the staging variables `APP_URL`, `SUPABASE_URL`, `SUPABASE_STORAGE_BUCKET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_MODE=adaptive`, `DAILY_TIMEZONE=Asia/Jakarta`, `DAILY_MIN_RATINGS=5`, `DAILY_WINNER_ENABLED=true`, and `NEXT_PUBLIC_ASSET_MODE=production`.
- Keep Supabase's Data API disabled for `public`, or remove `public` from exposed schemas, because this application accesses these tables only through server-side Prisma. Recheck this dashboard setting before every release.
- Run the `Staging verification` GitHub Actions workflow manually. It applies migrations with `DIRECT_URL`, runs the PostgreSQL integration suite, verifies both database endpoints, performs a temporary Storage write/read/delete probe, checks the Turnstile secret with Siteverify, and validates daily competition settings.
- CI proves the migration from an empty PostgreSQL 16 database on every pull request and push to `main`; a non-empty target fails before `prisma migrate deploy`.

- Run cleanup manually with `pnpm cron:expire`; it deletes expired generated files, keeps a 24-hour 410 tombstone, then hard-deletes records.
- Run winner selection with `pnpm cron:daily`; it snapshots the most recently completed Asia/Jakarta calendar day, and unique daily constraints make reruns idempotent.
- Backfill a missed day by passing a timestamp shortly after the following midnight, for example `pnpm cron:daily 2026-08-10T00:05:00+07:00`.
- Vercel invokes cron paths with `GET`; protected `POST` remains available for operator reruns with the same Bearer secret.
- Investigate `PROCESSING` records older than 15 minutes through the query in the Prisma specification; cleanup marks them `FAILED`.
- Cleanup compares up to 1000 UUID-named `outfits/` folders with database records and removes orphans. Inspect Storage manually if the metric reports failures or the campaign exceeds that bound.
- Roll back application code through Vercel. Never edit an applied migration; create a corrective migration and rehearse it against preview data.
- Alerts: publish failure over 5%/15 minutes, database unavailable, storage failure spike, failed cron, or stale `PROCESSING` records.
- Before release, confirm Supabase backups/PITR for the production project and rehearse a restore into an isolated preview database; never test restore against production.
- Verify `/api/health`, cron execution history, orphan cleanup counters, and render latency after every deployment. Roll back code first; use a forward corrective migration unless an approved database restore is required.
