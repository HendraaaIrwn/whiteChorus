import { existsSync } from "node:fs";

import { config } from "dotenv";

// Next.js loads .env.local for the application, while Vitest does not.
// CI supplies its own environment and remains authoritative because override is false.
if (existsSync(".env.local")) {
  config({ path: ".env.local", override: false, quiet: true });
}
