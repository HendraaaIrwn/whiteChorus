# White Chorus HTTP Contracts

All JSON responses use `{ "ok": true, "data": ... }` or `{ "ok": false, "error": { "code", "message", "requestId" } }`.

| Method   | Route                             | Purpose                                           |
| -------- | --------------------------------- | ------------------------------------------------- |
| POST     | `/api/guest/session`              | Create or restore anonymous guest cookie          |
| GET/POST | `/api/outfits`                    | List or publish outfits                           |
| GET      | `/api/outfits/[id]`               | Public outfit detail                              |
| PUT      | `/api/outfits/[id]/rating`        | Upsert 1–5 star rating                            |
| POST     | `/api/outfits/[id]/share`         | Record share intent                               |
| GET      | `/api/outfits/[id]/download`      | Download active PNG                               |
| GET      | `/api/daily-winners`              | Daily snapshots plus current live ranking         |
| GET/POST | `/api/cron/expire-outfits`        | Retention cleanup; Bearer cron secret             |
| GET/POST | `/api/cron/select-daily-winner`   | Idempotent daily selection; Bearer cron secret    |
| POST     | `/api/internal/outfits/[id]/hide` | Hide, restore, or disqualify with internal secret |
| GET      | `/api/health`                     | Configuration and database health                 |

State-changing guest routes require same-origin JSON. All except session bootstrap require a valid `wc_guest` cookie. Browser requests never provide ownership or aggregate fields.
