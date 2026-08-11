import type { Metadata } from "next";

import { DressUpTeaser } from "@/features/home/dress-up-teaser";
import { EditorialStatement } from "@/features/home/editorial-statement";
import {
  FinalHomeCta,
  HomeManifesto,
  HowItWorks,
} from "@/features/home/home-sections";
import { CustomCursor } from "@/features/home/home-motion";
import { LandingHero } from "@/features/home/landing-hero";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <div className="home-page" data-home-page>
      <CustomCursor />
      <LandingHero />
      <HomeManifesto />
      <DressUpTeaser />
      <EditorialStatement />
      <HowItWorks />
      <FinalHomeCta />
    </div>
  );
}
