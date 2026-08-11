"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { RadialRevealButton } from "@/components/ui/radial-reveal-button";
import {
  backgroundAssets,
  getAsset,
  getItems,
  productionAssets,
  renderLayersFor,
} from "@/features/dress-up/catalog";
import {
  defaultConfiguration,
  selectItem,
  type CharacterId,
  type DressUpConfiguration,
  type OutfitCategory,
} from "@/features/dress-up/model";
import { Bow, chorusWavePath, Sparkle } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";
import { useHydrated } from "@/lib/use-hydrated";

type TeaserCategory = "top" | "one-piece" | "background";

const categoryLabels: Record<TeaserCategory, string> = {
  top: "TOPS",
  "one-piece": "ONE-PIECE",
  background: "BACKGROUND",
};

function selectedId(
  configuration: DressUpConfiguration,
  characterId: CharacterId,
  category: TeaserCategory,
) {
  if (category === "background") return configuration.backgroundId;
  const character =
    characterId === "character-a"
      ? configuration.characterA
      : configuration.characterB;
  return category === "top" ? character.topId : character.onePieceId;
}

export function DressUpTeaser() {
  const [configuration, setConfiguration] =
    useState<DressUpConfiguration>(defaultConfiguration);
  const [characterId, setCharacterId] = useState<CharacterId>("character-a");
  const [category, setCategory] = useState<TeaserCategory>("top");
  const [status, setStatus] = useState("Emir tops are ready to mix.");
  const hydrated = useHydrated();
  const reduceMotion = useHydratedReducedMotion();
  const previewCenterRef = useRef<HTMLSpanElement>(null);
  const previewCentered = useInView(previewCenterRef, {
    once: true,
    margin: "-49% 0px -49% 0px",
  });

  const items = useMemo(
    () =>
      category === "background"
        ? backgroundAssets.slice(0, 3)
        : getItems(characterId, category as OutfitCategory).slice(0, 3),
    [category, characterId],
  );
  const currentId = selectedId(configuration, characterId, category);
  const background = getAsset(configuration.backgroundId);
  const layers = useMemo(() => renderLayersFor(configuration), [configuration]);
  const staticLayers = layers.filter((layer) => layer.kind !== "wardrobe");
  const wardrobeLayers = layers.filter((layer) => layer.kind === "wardrobe");

  function chooseItem(assetId: string, label: string) {
    if (category === "background") {
      setConfiguration((current) => ({
        ...current,
        backgroundId: assetId,
      }));
    } else {
      setConfiguration((current) => {
        const key = characterId === "character-a" ? "characterA" : "characterB";
        let character = selectItem(current[key], category, assetId);
        if (category === "top" && !character.bottomId) {
          character = {
            ...character,
            bottomId:
              characterId === "character-a" ? "a-bottom-01" : "b-bottom-01",
          };
        }
        return { ...current, [key]: character };
      });
    }
    setStatus(
      `${label} selected${category === "background" ? "" : ` for ${characterId === "character-a" ? "Emir" : "Friska"}`}.`,
    );
  }

  return (
    <section
      className="home-scene home-teaser"
      aria-labelledby="home-teaser-title"
    >
      <div className="home-container home-grid home-teaser__intro">
        <span className="home-label">03 · TRY A VERSE</span>
        <MaskedHeading
          id="home-teaser-title"
          className="home-heading home-teaser__title"
          lines={["MIX A LOOK.", "THEN MAKE IT YOURS."]}
        />
        <p>
          A small live preview of the real wardrobe. Nothing you try here
          touches your saved Studio draft.
        </p>
      </div>

      <div className="home-container home-grid home-teaser__workspace">
        <div className="home-teaser__stage" data-cursor="DRESS">
          <span
            ref={previewCenterRef}
            className="home-teaser__preview-center-trigger"
            aria-hidden="true"
          />
          <AnimatePresence mode="popLayout" initial={false}>
            {background?.renderPaths[0] ? (
              <motion.div
                className="home-teaser__background"
                key={background.renderPaths[0]}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.28 }}
              >
                <Image
                  src={background.renderPaths[0]}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 94vw, 58vw"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="home-teaser__artwork">
            {staticLayers.map((layer) => (
              <Image
                className="home-teaser__layer"
                key={layer.path}
                src={layer.path}
                alt=""
                fill
                sizes="(max-width: 767px) 94vw, 58vw"
                style={{
                  top: layer.top ? `${(layer.top / 1600) * 100}%` : 0,
                  zIndex: layer.layerOrder,
                }}
              />
            ))}
            <AnimatePresence initial={false}>
              {wardrobeLayers.map((layer) => (
                <motion.div
                  className="home-teaser__layer-shell"
                  key={layer.path}
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96, y: 7 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96, y: -6 }
                  }
                  transition={{
                    duration: reduceMotion ? 0.01 : 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ zIndex: layer.layerOrder }}
                >
                  <Image
                    className="home-teaser__layer"
                    src={layer.path}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 94vw, 58vw"
                    style={{
                      top: layer.top ? `${(layer.top / 1600) * 100}%` : 0,
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <span className="home-teaser__stage-label">
            EMIR + FRISKA · LOCAL PREVIEW
          </span>
          <Bow className="home-teaser__bow" aria-hidden="true" />
          <Sparkle className="home-teaser__sparkle" aria-hidden="true" />
        </div>

        <div className="home-teaser__controls">
          <div
            className="home-teaser__characters"
            role="group"
            aria-label="Choose character"
          >
            {(
              [
                ["character-a", "EMIR", productionAssets.characterIcons.emir],
                [
                  "character-b",
                  "FRISKA",
                  productionAssets.characterIcons.friska,
                ],
              ] as const
            ).map(([id, label, icon]) => (
              <RadialRevealButton
                className="home-teaser__character"
                key={id}
                type="button"
                disabled={!hydrated}
                aria-pressed={characterId === id}
                revealOrigin="marked-element"
                onClick={() => {
                  setCharacterId(id);
                  setStatus(`${label} is ready to dress.`);
                }}
              >
                <span
                  className="home-teaser__character-icon"
                  data-radial-reveal-origin
                >
                  <Image
                    src={icon}
                    alt=""
                    width={48}
                    height={48}
                    sizes="48px"
                  />
                </span>
                {label}
              </RadialRevealButton>
            ))}
          </div>

          <div className="home-teaser__categories" role="tablist">
            {(Object.keys(categoryLabels) as TeaserCategory[]).map((value) => (
              <RadialRevealButton
                className="home-teaser__category"
                key={value}
                type="button"
                disabled={!hydrated}
                role="tab"
                aria-selected={category === value}
                onClick={() => {
                  setCategory(value);
                  setStatus(`${categoryLabels[value]} opened.`);
                }}
              >
                {categoryLabels[value]}
              </RadialRevealButton>
            ))}
          </div>

          <div className="home-teaser__items" role="radiogroup">
            {items.map((item, index) => (
              <motion.button
                className="home-teaser__item"
                key={item.id}
                type="button"
                disabled={!hydrated}
                role="radio"
                aria-checked={currentId === item.id}
                aria-label={`${currentId === item.id ? "Selected: " : ""}${item.label}`}
                onClick={() => chooseItem(item.id, item.label)}
                data-cursor="DRESS"
                whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 30,
                  mass: 0.72,
                }}
              >
                {currentId === item.id ? (
                  <motion.span
                    className="home-teaser__selection-frame"
                    layoutId="home-dress-selection-frame"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 390,
                            damping: 34,
                            mass: 0.78,
                          }
                    }
                    aria-hidden="true"
                  />
                ) : null}
                <Image
                  src={item.previewPath}
                  alt=""
                  width={180}
                  height={180}
                  sizes="140px"
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
              </motion.button>
            ))}
          </div>
          <div className="home-teaser__footer">
            <p className="home-teaser__status" aria-live="polite">
              {status}
            </p>
            <div data-cursor="OPEN">
              <RadialRevealButton
                className="home-teaser__cta"
                href="/studio"
                variant="apricot"
              >
                OPEN THE FULL STUDIO <span aria-hidden="true">↗</span>
              </RadialRevealButton>
            </div>
          </div>
        </div>
      </div>
      <div className="home-teaser__archive-wave" aria-hidden="true">
        <svg viewBox="0 0 1000 240" fill="none">
          <defs>
            <clipPath
              id="home-teaser-wave-reveal"
              clipPathUnits="userSpaceOnUse"
            >
              <motion.rect
                x="0"
                y="-24"
                height="288"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{
                  width: reduceMotion || previewCentered ? 1000 : 0,
                }}
                transition={{
                  duration: reduceMotion ? 0 : 2.25,
                  delay: reduceMotion ? 0 : 0.18,
                  ease: [0.65, 0, 0.35, 1],
                }}
              />
            </clipPath>
          </defs>
          <path
            d={chorusWavePath}
            clipPath="url(#home-teaser-wave-reveal)"
            stroke="currentColor"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </section>
  );
}
