# White Chorus Operations Runbook

- Run cleanup manually with `pnpm cron:expire`; it deletes expired generated files, keeps a 24-hour 410 tombstone, then hard-deletes records.
- Run winner selection with `pnpm cron:winner`; it snapshots the most recently completed Asia/Jakarta Monday–Sunday period, and unique weekly constraints make reruns idempotent.
- Backfill a missed period by passing a timestamp in the following week, for example `pnpm cron:winner 2026-08-10T00:05:00+07:00`.
- Vercel invokes cron paths with `GET`; protected `POST` remains available for operator reruns with the same Bearer secret.
- Investigate `PROCESSING` records older than 15 minutes through the query in the Prisma specification; cleanup marks them `FAILED`.
- Cleanup compares up to 1000 UUID-named `outfits/` folders with database records and removes orphans. Inspect Storage manually if the metric reports failures or the campaign exceeds that bound.
- Roll back application code through Vercel. Never edit an applied migration; create a corrective migration and rehearse it against preview data.
- Alerts: publish failure over 5%/15 minutes, database unavailable, storage failure spike, failed cron, or stale `PROCESSING` records.
- Before release, confirm Supabase backups/PITR for the production project and rehearse a restore into an isolated preview database; never test restore against production.
- Verify `/api/health`, cron execution history, orphan cleanup counters, and render latency after every deployment. Roll back code first; use a forward corrective migration unless an approved database restore is required.
