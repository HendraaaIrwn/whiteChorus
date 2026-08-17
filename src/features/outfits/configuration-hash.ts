import "server-only";

import { createHash } from "node:crypto";

import { normalizeCatalogConfiguration } from "@/features/dress-up/catalog";
import {
  normalizeConfiguration,
  type DressUpConfiguration,
} from "@/features/dress-up/model";

export function configurationHash(configuration: DressUpConfiguration): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        normalizeConfiguration(normalizeCatalogConfiguration(configuration)),
      ),
    )
    .digest("hex");
}
