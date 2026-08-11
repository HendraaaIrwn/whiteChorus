import Image from "next/image";

import { EntryAudioGate } from "@/features/audio/entry-audio-gate";
import { productionAssets } from "@/features/dress-up/catalog";
import { HomeBeatList } from "@/features/home/home-beat-list";
import { Sparkle } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";

export { HomeManifesto } from "@/features/home/home-manifesto";

export function HowItWorks() {
  return (
    <section className="home-scene home-how" aria-labelledby="home-how-title">
      <div className="home-container">
        <div className="home-grid home-section-intro">
          <span className="home-label">05 · THREE BEATS</span>
          <MaskedHeading
            id="home-how-title"
            className="home-heading"
            lines={["HOW THE CHORUS", "COMES TOGETHER."]}
          />
        </div>
        <HomeBeatList />
      </div>
    </section>
  );
}

export function FinalHomeCta() {
  return (
    <section className="home-final-cta" aria-labelledby="home-final-title">
      <div className="home-container home-grid">
        <div className="home-final-cta__copy">
          <span className="home-label">06 · YOUR TURN</span>
          <MaskedHeading
            id="home-final-title"
            className="home-final-cta__title"
            lines={["PUT YOUR", "NEXT LOOK", "IN THE CHORUS."]}
          />
          <Sparkle className="home-final-cta__sparkle" />
          <div className="home-final-cta__action" data-cursor="DRESS">
            <EntryAudioGate triggerClassName="home-action home-action--giant" />
            <span>CHOOSE YOUR SOUND, THEN STEP INTO THE STUDIO.</span>
          </div>
        </div>

        <div className="home-final-cta__visual" aria-hidden="true">
          <div className="home-final-cta__characters">
            <Image
              src={productionAssets.characterLooks.emir}
              alt=""
              fill
              sizes="(max-width: 767px) 220vw, (max-width: 1199px) 98vw, 108vw"
            />
            <Image
              src={productionAssets.characterLooks.friska}
              alt=""
              fill
              sizes="(max-width: 767px) 220vw, (max-width: 1199px) 98vw, 108vw"
            />
          </div>
          <Sparkle className="home-final-cta__spark-deco home-final-cta__spark-deco--two" />
          <Sparkle className="home-final-cta__spark-deco home-final-cta__spark-deco--three" />
        </div>
      </div>
    </section>
  );
}
