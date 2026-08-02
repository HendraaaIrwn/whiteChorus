import { existsSync } from "node:fs";
import { config } from "dotenv";

import { serverEnvSchema } from "../src/config/env-schema";

config({ path: existsSync(".env.local") ? ".env.local" : ".env", quiet: true });
serverEnvSchema.parse(process.env);
console.log("Environment contract is valid.");
