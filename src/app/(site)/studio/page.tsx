import type { Metadata } from "next";

import { DressUpStudio } from "@/features/dress-up/dress-up-studio";
import { CustomCursor } from "@/features/home/home-motion";

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
          <h1 id="studio-page-title" className="studio-kicker">
            YOUR STAGE · TWO VOICES
          </h1>
        </header>
        <DressUpStudio />
      </section>
    </div>
  );
}
