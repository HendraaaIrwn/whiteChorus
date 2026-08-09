"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import {
  backgroundAssets,
  getAsset,
  getItems,
  renderLayersFor,
} from "@/features/dress-up/catalog";
import {
  defaultConfiguration,
  selectItem,
  type CharacterId,
  type DressUpConfiguration,
  type OutfitCategory,
} from "@/features/dress-up/model";
import { Bow, Sparkle } from "@/features/home/home-doodles";
import { MaskedHeading } from "@/features/home/home-motion";

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
  const reduceMotion = useHydratedReducedMotion();

  const items = useMemo(
    () =>
      category === "background"
        ? backgroundAssets.slice(0, 3)
        : getItems(characterId, category as OutfitCategory).slice(0, 3),
    [category, characterId],
  );
  const currentId = selectedId(configuration, characterId, category);
  const background = getAsset(configuration.backgroundId);

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
          <motion.div
            className="home-teaser__layers"
            key={JSON.stringify(configuration)}
            initial={reduceMotion ? false : { opacity: 0.6, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
          >
            {renderLayersFor(configuration).map((layer) => (
              <Image
                className="home-teaser__layer"
                key={layer.path}
                src={layer.path}
                alt=""
                fill
                sizes="(max-width: 767px) 94vw, 58vw"
                style={{
                  top: layer.top ? `${(layer.top / 1600) * 100}%` : 0,
                }}
              />
            ))}
          </motion.div>
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
                ["character-a", "EMIR"],
                ["character-b", "FRISKA"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={characterId === id}
                onClick={() => {
                  setCharacterId(id);
                  setStatus(`${label} is ready to dress.`);
                }}
              >
                <span>{id === "character-a" ? "A" : "B"}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="home-teaser__categories" role="tablist">
            {(Object.keys(categoryLabels) as TeaserCategory[]).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={category === value}
                onClick={() => {
                  setCategory(value);
                  setStatus(`${categoryLabels[value]} opened.`);
                }}
              >
                {categoryLabels[value]}
              </button>
            ))}
          </div>

          <div className="home-teaser__items" role="radiogroup">
            {items.map((item, index) => (
              <button
                className="home-teaser__item"
                key={item.id}
                type="button"
                role="radio"
                aria-checked={currentId === item.id}
                aria-label={`${currentId === item.id ? "Selected: " : ""}${item.label}`}
                onClick={() => chooseItem(item.id, item.label)}
                data-cursor="DRESS"
              >
                <Image
                  src={item.previewPath}
                  alt=""
                  width={180}
                  height={180}
                  sizes="140px"
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <p className="home-teaser__status" aria-live="polite">
            {status}
          </p>
        </div>
      </div>
    </section>
  );
}
