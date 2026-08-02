# White Chorus Security Runbook

- Rotate `SESSION_TOKEN_SECRET`, `RATE_LIMIT_SECRET`, `CRON_SECRET`, and `INTERNAL_ADMIN_SECRET` in the hosting environment; never commit values.
- Rotating the session secret invalidates existing anonymous cookies. Record the operational decision before rotation.
- Use `TURNSTILE_MODE=adaptive` in normal production and provide both Turnstile keys. Use `always` during an abuse event; use `off` only for controlled local/CI work.
- Hide or disqualify a submission through the protected internal route or Supabase dashboard. Never expose the internal secret to browser code.
- Investigate repeated rate-limit, Turnstile, render, and origin failures using request IDs. Logs must not contain raw tokens, raw IPs, cookies, database URLs, or provider keys.
- Emergency publishing stop: remove/disable the publish route deployment or set limits to a deliberately low safe value, then document restoration.
