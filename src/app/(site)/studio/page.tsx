import type { Metadata } from "next";

import { DressUpStudio } from "@/features/dress-up/dress-up-studio";
import { ThreadStroke } from "@/features/home/home-doodles";
import { CustomCursor, MaskedHeading } from "@/features/home/home-motion";

export const metadata: Metadata = {
  title: "Studio",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <div className="studio-page" data-studio-page>
      <CustomCursor scope="studio" />
      <section className="studio-workspace" aria-labelledby="studio-page-title">
        <header className="studio-heading">
          <span className="studio-kicker">YOUR STAGE · TWO VOICES</span>
          <MaskedHeading
            id="studio-page-title"
            className="studio-heading__title"
            level="h1"
            lines={["STYLE EMIR", "& FRISKA"]}
            intro
          />
          <p>
            Both characters share one scene. Choose a voice, then dress the
            chorus one layer at a time.
          </p>
          <ThreadStroke aria-hidden="true" />
        </header>
        <DressUpStudio />
      </section>
    </div>
  );
}
