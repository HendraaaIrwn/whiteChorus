import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { getServerEnv } from "@/config/env";
import { findGuest } from "@/features/guest-session/guest-session";
import { HallCollection } from "@/features/hall-of-fame/hall-collection";
import { HallOfFameCta } from "@/features/hall-of-fame/hall-of-fame-cta";
import { HallOfFameHero } from "@/features/hall-of-fame/hall-of-fame-hero";
import {
  getHallOfFamePage,
  hallQuerySchema,
  type HallQuery,
} from "@/features/hall-of-fame/hall-of-fame";
import { CustomCursor } from "@/features/home/home-motion";

import HallLoading from "./loading";

export const metadata: Metadata = {
  title: "Hall of Fame",
  description:
    "Discover the newest, highest-rated, and trending anonymous looks.",
  alternates: { canonical: "/hall-of-fame" },
};
export const dynamic = "force-dynamic";

async function HallOfFameContent({
  guestToken,
  query,
}: {
  guestToken?: string;
  query: HallQuery;
}) {
  const guest = await findGuest(guestToken);
  const hall = await getHallOfFamePage(query, guest?.id);

  return (
    <div className="hall-page" data-hall-page>
      <CustomCursor scope="hall" />
      <HallOfFameHero />
      <HallCollection
        activeSort={query.sort}
        items={hall.items}
        page={hall.pagination.page}
        totalPages={hall.pagination.totalPages}
      />
      <HallOfFameCta />
    </div>
  );
}

export default async function HallOfFamePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = hallQuerySchema.parse(await searchParams);
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(getServerEnv().SESSION_COOKIE_NAME)?.value;

  return (
    <Suspense fallback={<HallLoading />}>
      <HallOfFameContent guestToken={guestToken} query={query} />
    </Suspense>
  );
}
