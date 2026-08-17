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
| GET      | `/api/daily-winners?page=N`       | Latest snapshots plus paginated active ranking    |
| GET/POST | `/api/cron/expire-outfits`        | Retention cleanup; Bearer cron secret             |
| GET/POST | `/api/cron/select-daily-winner`   | Idempotent daily selection; Bearer cron secret    |
| POST     | `/api/internal/outfits/[id]/hide` | Hide, restore, or disqualify with internal secret |
| GET      | `/api/health`                     | Configuration and database health                 |

State-changing guest routes require same-origin JSON. All except session bootstrap require a valid `wc_guest` cookie. Browser requests never provide ownership or aggregate fields.

## Daily Winner overview

`GET /api/daily-winners?page=N` returns the newest finalized Daily Winner separately from at most seven older completed days. Its `ranking` covers every active, competition-eligible published outfit and includes `page`, `pageSize`, `totalItems`, and `totalPages` alongside globally ranked items. Page numbers are positive integers; invalid values return `400 INVALID_REQUEST`, and values beyond the available range clamp to the final page.

```json
{
  "ok": true,
  "data": {
    "latestWinner": null,
    "ranking": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 0,
      "totalPages": 0,
      "items": []
    },
    "completedDays": []
  }
}
```

The compatibility route `GET /api/weekly-winners?page=N` exposes the same contract. Debug Daily Winner placeholders are presentation-only and are never returned by either API.
