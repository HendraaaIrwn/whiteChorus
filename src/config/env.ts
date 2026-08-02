import "server-only";

import { serverEnvSchema, type ServerEnv } from "@/config/env-schema";

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse(process.env);
  return cached;
}

export function hasServerConfiguration(): boolean {
  return serverEnvSchema.safeParse(process.env).success;
}
