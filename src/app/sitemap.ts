import type { MetadataRoute } from "next";

import { hasServerConfiguration } from "@/config/env";
import { getPrisma } from "@/server/database/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/studio",
    "/hall-of-fame",
    "/daily-winners",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
  if (!hasServerConfiguration()) return staticRoutes;
  try {
    const now = new Date();
    const [outfits, winners] = await Promise.all([
      getPrisma().outfit.findMany({
        where: { status: "PUBLISHED", expiresAt: { gt: now } },
        select: { id: true, updatedAt: true },
      }),
      getPrisma().dailyWinner.findMany({
        select: { dayKey: true, createdAt: true },
      }),
    ]);
    return [
      ...staticRoutes,
      ...outfits.map((outfit) => ({
        url: `${base}/outfits/${outfit.id}`,
        lastModified: outfit.updatedAt,
      })),
      ...winners.map((winner) => ({
        url: `${base}/daily-winners/${winner.dayKey.trim()}`,
        lastModified: winner.createdAt,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
