"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Dices, RotateCcw, Sparkles } from "lucide-react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Button } from "@/components/ui/button";
import { TurnstileChallenge } from "@/features/abuse-protection/turnstile-challenge";
import {
  backgroundAssets,
  getAsset,
  getItems,
  renderLayersFor,
  validateCatalogConfiguration,
} from "@/features/dress-up/catalog";
import {
  categories,
  defaultConfiguration,
  dressUpConfigurationSchema,
  isPublishReady,
  selectItem,
  type CharacterId,
  type DressUpConfiguration,
  type OutfitCategory,
} from "@/features/dress-up/model";
import { randomizeConfiguration } from "@/features/dress-up/randomize";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";
import { useHydrated } from "@/lib/use-hydrated";
import { publicConfig } from "@/config/public-config";

const DRAFT_KEY = "white-chorus:dress-up-draft:v1";
const standardEase = [0.2, 0.8, 0.2, 1] as const;
const confettiPieces = [
  { x: -74, y: -48, rotate: -38, color: "#d9878e" },
  { x: -42, y: -76, rotate: 24, color: "#f6c45c" },
  { x: -10, y: -64, rotate: -18, color: "#7db6ba" },
  { x: 22, y: -78, rotate: 42, color: "#8296b5" },
  { x: 54, y: -58, rotate: -28, color: "#fab876" },
  { x: 78, y: -34, rotate: 34, color: "#d9878e" },
] as const;

function selectedId(
  configuration: DressUpConfiguration,
  character: CharacterId,
  category: OutfitCategory,
): string | null {
  const value =
    character === "character-a"
      ? configuration.characterA
      : configuration.characterB;
  return category === "hair"
    ? value.hairId
    : category === "top"
      ? value.topId
      : category === "bottom"
        ? value.bottomId
        : category === "one-piece"
          ? value.onePieceId
          : category === "shoes"
            ? value.shoesId
            : (value.accessoryIds[0] ?? null);
}

function FixtureCharacter({
  character,
  configuration,
  active,
}: {
  character: CharacterId;
  configuration: DressUpConfiguration;
  active: boolean;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const value =
    character === "character-a"
      ? configuration.characterA
      : configuration.characterB;
  const top = getAsset(value.onePieceId ?? value.topId)?.swatch;
  const bottom = getAsset(value.onePieceId ?? value.bottomId)?.swatch;
  const hair = getAsset(value.hairId)?.swatch;
  const accessory = getAsset(value.accessoryIds[0] ?? null)?.swatch;
  const layerTransition = {
    duration: reduceMotion ? 0 : 0.2,
    ease: standardEase,
  };

  return (
    <motion.div
      className={`studio-avatar studio-avatar--${character === "character-a" ? "a" : "b"}`}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: active ? 1 : 0.76, scale: active ? 1.02 : 0.98 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <motion.span
        key={`hair:${value.hairId ?? "none"}`}
        className="studio-avatar__hair"
        style={{ background: hair }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={layerTransition}
      />
      <span className="studio-avatar__face" />
      <motion.span
        key={`top:${value.onePieceId ?? value.topId ?? "none"}`}
        className="studio-avatar__top"
        style={{ background: top }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={layerTransition}
      />
      <motion.span
        key={`bottom:${value.onePieceId ?? value.bottomId ?? "none"}`}
        className="studio-avatar__bottom"
        style={{ background: bottom }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={layerTransition}
      />
      <AnimatePresence initial={false}>
        {accessory ? (
          <motion.span
            key={value.accessoryIds[0]}
            className="studio-avatar__accessory"
            style={{ background: accessory }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
            transition={layerTransition}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function DressUpStudio() {
  const hydrated = useHydrated();
  const reduceMotion = useHydratedReducedMotion();
  const restoredConfiguration = useMemo(() => {
    if (!hydrated) return defaultConfiguration;
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (!saved) return defaultConfiguration;
    try {
      const parsed = dressUpConfigurationSchema.safeParse(JSON.parse(saved));
      return parsed.success && !validateCatalogConfiguration(parsed.data).length
        ? parsed.data
        : defaultConfiguration;
    } catch {
      return defaultConfiguration;
    }
  }, [hydrated]);
  const [configurationOverride, setConfiguration] =
    useState<DressUpConfiguration | null>(null);
  const configuration = configurationOverride ?? restoredConfiguration;
  const [activeCharacter, setActiveCharacter] =
    useState<CharacterId>("character-a");
  const [category, setCategory] = useState<OutfitCategory>("hair");
  const [status, setStatus] = useState("Your draft is ready.");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const receiveTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token) setStatus("Security check complete. You can publish now.");
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(configuration));
  }, [configuration, hydrated]);

  const items = useMemo(
    () => getItems(activeCharacter, category),
    [activeCharacter, category],
  );
  const activeSelectedId = selectedId(configuration, activeCharacter, category);
  const background = getAsset(configuration.backgroundId);
  const productionMode = publicConfig.assetMode === "production";
  const selectionMotionKey = `${configuration.backgroundId}:${activeCharacter}:${category}:${activeSelectedId ?? "none"}`;

  function updateCharacter(assetId: string | null) {
    setConfiguration((current) => {
      current ??= restoredConfiguration;
      const key =
        activeCharacter === "character-a" ? "characterA" : "characterB";
      return { ...current, [key]: selectItem(current[key], category, assetId) };
    });
    setStatus(
      `${category.replace("-", " ")} selected for ${activeCharacter === "character-a" ? "Emir" : "Friska"}.`,
    );
  }

  async function publish() {
    setPublishing(true);
    setPublishedUrl(null);
    try {
      await ensureGuestSession();
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...configuration, turnstileToken }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { url: string };
        error?: { code: string; message: string };
      };
      if (!response.ok || !payload.ok || !payload.data) {
        if (
          payload.error?.code === "TURNSTILE_REQUIRED" ||
          payload.error?.code === "TURNSTILE_FAILED"
        ) {
          setChallengeRequired(true);
          setChallengeVersion((current) => current + 1);
          setTurnstileToken(null);
        }
        throw new Error(
          payload.error?.message ?? "Something went wrong. Please try again.",
        );
      }
      setPublishedUrl(payload.data.url);
      setStatus("Publish complete. Your look is live.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="studio-layout">
      <section className="studio-stage-panel">
        <motion.div
          className={`studio-stage${productionMode ? "studio-stage--production" : ""}`}
          animate={{
            background: productionMode
              ? "#fdf7ec"
              : `linear-gradient(145deg, ${background?.swatch ?? "#b6e5e8"}, #fdf7ec 70%)`,
          }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: standardEase }}
        >
          {productionMode && background ? (
            <AnimatePresence initial={false}>
              <motion.img
                key={`background:${background.renderPaths[0]}`}
                className="studio-production-layer"
                src={background.renderPaths[0]}
                alt=""
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22 }}
              />
              {renderLayersFor(configuration).map((layer) => (
                <motion.img
                  key={layer.path}
                  className="studio-production-layer"
                  src={layer.path}
                  alt=""
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                />
              ))}
            </AnimatePresence>
          ) : null}
          <span className="studio-stage__label">{background?.label}</span>
          {!productionMode ? (
            <>
              <FixtureCharacter
                character="character-a"
                configuration={configuration}
                active={activeCharacter === "character-a"}
              />
              <FixtureCharacter
                character="character-b"
                configuration={configuration}
                active={activeCharacter === "character-b"}
              />
            </>
          ) : null}
          {!productionMode ? (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                className="studio-stage__sparkle"
                key={selectionMotionKey}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: [0, 1, 1], scale: [0.7, 1.18, 1], rotate: 8 }
                }
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                transition={{ duration: reduceMotion ? 0.08 : 0.36 }}
                aria-hidden="true"
              >
                <Sparkles />
              </motion.span>
            </AnimatePresence>
          ) : null}
          <AnimatePresence>
            {publishedUrl ? (
              <motion.div
                key={publishedUrl}
                className="publish-success-burst"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
                animate={
                  reduceMotion
                    ? { opacity: [0, 1, 0] }
                    : {
                        opacity: [0, 1, 1, 1, 0],
                        scale: [0.86, 1, 1, 1, 0.98],
                      }
                }
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.1 : 0.65 }}
                aria-hidden="true"
              >
                <strong>LOOK IS LIVE!</strong>
                {reduceMotion
                  ? null
                  : confettiPieces.map((piece, index) => (
                      <motion.span
                        key={`${piece.x}:${piece.y}`}
                        className="confetti-piece"
                        style={{ backgroundColor: piece.color }}
                        initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: piece.x,
                          y: piece.y,
                          rotate: piece.rotate,
                        }}
                        transition={{
                          duration: 0.55,
                          delay: index * 0.025,
                          ease: standardEase,
                        }}
                      />
                    ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
        <div className="character-switcher" aria-label="Choose character">
          {(["character-a", "character-b"] as const).map((character) => {
            const active = activeCharacter === character;
            return (
              <motion.button
                key={character}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCharacter(character)}
                className={active ? "is-active" : ""}
                animate={reduceMotion ? undefined : { y: active ? -3 : 0 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              >
                <span>
                  DRESS {character === "character-a" ? "EMIR" : "FRISKA"}
                </span>
                {active ? (
                  <motion.span
                    className="character-switcher__indicator"
                    layoutId="active-character-indicator"
                    aria-hidden="true"
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="studio-controls" aria-label="Dress-up controls">
        <div>
          <p className="eyebrow">Shared scene</p>
          <h2>CHOOSE A BACKGROUND</h2>
        </div>
        <div
          className="background-row"
          role="radiogroup"
          aria-label="Backgrounds"
        >
          {backgroundAssets.map((asset) => {
            const selected = configuration.backgroundId === asset.id;
            return (
              <motion.button
                key={asset.id}
                type="button"
                role="radio"
                aria-checked={selected}
                title={asset.label}
                style={
                  productionMode
                    ? {
                        backgroundImage: `url(${asset.previewPath})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }
                    : { background: asset.swatch }
                }
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: selected ? 1 : 0.78,
                        scale: selected ? 1 : 0.96,
                      }
                }
                whileHover={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                onClick={() =>
                  setConfiguration((current) => ({
                    ...(current ?? restoredConfiguration),
                    backgroundId: asset.id,
                  }))
                }
              >
                <AnimatePresence initial={false}>
                  {selected ? (
                    <motion.span
                      key="selected"
                      className="background-check"
                      initial={
                        reduceMotion ? false : { opacity: 0, scale: 0.6 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        reduceMotion ? undefined : { opacity: 0, scale: 0.6 }
                      }
                    >
                      <Check aria-hidden="true" />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <div
          className="category-tabs"
          role="tablist"
          aria-label="Outfit categories"
        >
          {categories.map((item) => {
            const selected = category === item;
            return (
              <motion.button
                key={item}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCategory(item)}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                <span>{item.toUpperCase()}</span>
                {selected ? (
                  <motion.span
                    className="category-tab__indicator"
                    layoutId="studio-category-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>

        <div
          className="item-grid"
          role="radiogroup"
          aria-label={`${category} items`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {(category === "accessory"
              ? [{ id: "none", label: "None", swatch: "transparent" }, ...items]
              : items
            ).map((asset) => {
              const selected =
                asset.id === "none"
                  ? !activeSelectedId
                  : activeSelectedId === asset.id;
              return (
                <motion.button
                  key={asset.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={selected ? "is-selected" : ""}
                  layout={reduceMotion ? false : "position"}
                  initial={
                    reduceMotion ? false : { opacity: 0, scale: 0.94, y: 6 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          scale: selected ? 1 : 0.98,
                          y: selected ? -2 : 0,
                        }
                  }
                  exit={
                    reduceMotion ? undefined : { opacity: 0, scale: 0.94, y: 4 }
                  }
                  whileHover={reduceMotion ? undefined : { scale: 1, y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  onClick={() =>
                    updateCharacter(asset.id === "none" ? null : asset.id)
                  }
                >
                  {productionMode && "previewPath" in asset ? (
                    <img
                      className="item-thumbnail"
                      src={asset.previewPath}
                      alt=""
                    />
                  ) : (
                    <span
                      className="item-swatch"
                      style={{ background: asset.swatch }}
                    />
                  )}
                  <span>{asset.label.toUpperCase()}</span>
                  <AnimatePresence initial={false}>
                    {selected ? (
                      <motion.span
                        key="selected"
                        className="item-check"
                        initial={
                          reduceMotion ? false : { opacity: 0, scale: 0.5 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={
                          reduceMotion ? undefined : { opacity: 0, scale: 0.5 }
                        }
                      >
                        <Check aria-hidden="true" />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="studio-secondary-actions">
          <Button
            variant="secondary"
            onClick={() => {
              setConfiguration(randomizeConfiguration());
              setStatus("A valid random look is ready.");
            }}
          >
            <Dices aria-hidden="true" /> RANDOMIZE ALL
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              setConfiguration(defaultConfiguration);
              setStatus("The studio has been reset.");
            }}
          >
            <RotateCcw aria-hidden="true" /> RESET ALL
          </Button>
        </div>
      </section>

      <AnimatePresence>
        {challengeRequired ? (
          <motion.section
            key="publish-security"
            className="turnstile-panel"
            aria-label="Publish security"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
          >
            <strong>ONE MORE BEAT</strong>
            <TurnstileChallenge
              key={challengeVersion}
              onToken={receiveTurnstileToken}
            />
          </motion.section>
        ) : null}
      </AnimatePresence>

      <div className="publish-bar">
        <div className="publish-status" aria-live="polite" aria-atomic="true">
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={status}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
            >
              {status}
            </motion.p>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {publishedUrl ? (
            <motion.div
              key={publishedUrl}
              className="publish-result"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
              transition={{ duration: reduceMotion ? 0.08 : 0.22 }}
            >
              <Link
                className="button button--secondary button--md"
                href={publishedUrl}
              >
                VIEW YOUR LOOK
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <Button
          size="lg"
          loading={publishing}
          disabled={
            !isPublishReady(configuration) ||
            (challengeRequired && !turnstileToken)
          }
          onClick={() => void publish()}
        >
          PUBLISH TO HALL OF FAME
        </Button>
      </div>
    </div>
  );
}
