import type { Metadata } from "next";

import { getLatestDailyWinner } from "@/features/daily-winners/daily-winners";
import { getHomepageOutfits } from "@/features/hall-of-fame/hall-of-fame";
import { DressUpTeaser } from "@/features/home/dress-up-teaser";
import { EditorialStatement } from "@/features/home/editorial-statement";
import {
  DailySpotlight,
  FeaturedLooks,
  FinalHomeCta,
  HallPreview,
  HomeManifesto,
  HowItWorks,
} from "@/features/home/home-sections";
import {
  buildHomeLooks,
  curatedHomeLooks,
} from "@/features/home/home-look-data";
import { CustomCursor } from "@/features/home/home-motion";
import { LandingHero } from "@/features/home/landing-hero";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [outfits, latestWinner] = await Promise.all([
    getHomepageOutfits(7).catch(() => []),
    getLatestDailyWinner().catch(() => null),
  ]);
  const looks = buildHomeLooks(outfits, latestWinner?.shortCode);

  return (
    <div className="home-page" data-home-page>
      <CustomCursor />
      <LandingHero />
      <HomeManifesto />
      <DressUpTeaser />
      <FeaturedLooks looks={looks.slice(0, 3)} />
      <EditorialStatement />
      <HowItWorks />
      <DailySpotlight
        winner={latestWinner}
        fallbackLook={curatedHomeLooks[0]!}
      />
      <HallPreview looks={looks.slice(3, 6)} />
      <FinalHomeCta />
    </div>
  );
}
