import type { Metadata } from "next";

import { DressUpStudio } from "@/features/dress-up/dress-up-studio";

export const metadata: Metadata = {
  title: "Studio",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <div className="page studio-page">
      <header className="page-heading">
        <p className="eyebrow">Your stage, your chorus</p>
        <h1>STYLE EMIR &amp; FRISKA</h1>
        <p>
          Both characters share one scene. Switch between them and build a look
          worth spotlighting.
        </p>
      </header>
      <DressUpStudio />
    </div>
  );
}
