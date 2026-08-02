"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Dices, RotateCcw, Sparkles } from "lucide-react";

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
}: {
  character: CharacterId;
  configuration: DressUpConfiguration;
}) {
  const value =
    character === "character-a"
      ? configuration.characterA
      : configuration.characterB;
  const top = getAsset(value.onePieceId ?? value.topId)?.swatch;
  const bottom = getAsset(value.onePieceId ?? value.bottomId)?.swatch;
  const hair = getAsset(value.hairId)?.swatch;
  const accessory = getAsset(value.accessoryIds[0] ?? null)?.swatch;
  return (
    <div
      className={`studio-avatar studio-avatar--${character === "character-a" ? "a" : "b"}`}
    >
      <span className="studio-avatar__hair" style={{ background: hair }} />
      <span className="studio-avatar__face" />
      <span className="studio-avatar__top" style={{ background: top }} />
      <span className="studio-avatar__bottom" style={{ background: bottom }} />
      {accessory ? (
        <span
          className="studio-avatar__accessory"
          style={{ background: accessory }}
        />
      ) : null}
    </div>
  );
}

export function DressUpStudio() {
  const hydrated = useHydrated();
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
        <div
          className={`studio-stage${productionMode ? "studio-stage--production" : ""}`}
          style={{
            background: `linear-gradient(145deg, ${background?.swatch ?? "#b6e5e8"}, #fdf7ec 70%)`,
          }}
        >
          {productionMode && background ? (
            <>
              <img
                className="studio-production-layer"
                src={background.renderPaths[0]}
                alt=""
              />
              {renderLayersFor(configuration).map((layer) => (
                <img
                  key={layer.path}
                  className="studio-production-layer"
                  src={layer.path}
                  alt=""
                />
              ))}
            </>
          ) : null}
          <span className="studio-stage__label">{background?.label}</span>
          {!productionMode ? (
            <>
              <FixtureCharacter
                character="character-a"
                configuration={configuration}
              />
              <FixtureCharacter
                character="character-b"
                configuration={configuration}
              />
            </>
          ) : null}
          {!productionMode ? (
            <Sparkles className="studio-stage__sparkle" aria-hidden="true" />
          ) : null}
        </div>
        <div className="character-switcher" aria-label="Choose character">
          {(["character-a", "character-b"] as const).map((character) => (
            <button
              key={character}
              type="button"
              aria-pressed={activeCharacter === character}
              onClick={() => setActiveCharacter(character)}
              className={activeCharacter === character ? "is-active" : ""}
            >
              DRESS {character === "character-a" ? "EMIR" : "FRISKA"}
            </button>
          ))}
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
          {backgroundAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              role="radio"
              aria-checked={configuration.backgroundId === asset.id}
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
              onClick={() =>
                setConfiguration((current) => ({
                  ...(current ?? restoredConfiguration),
                  backgroundId: asset.id,
                }))
              }
            >
              {configuration.backgroundId === asset.id ? (
                <Check aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>

        <div
          className="category-tabs"
          role="tablist"
          aria-label="Outfit categories"
        >
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              onClick={() => setCategory(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div
          className="item-grid"
          role="radiogroup"
          aria-label={`${category} items`}
        >
          {(category === "accessory"
            ? [{ id: "none", label: "None", swatch: "transparent" }, ...items]
            : items
          ).map((asset) => {
            const selected =
              asset.id === "none"
                ? !activeSelectedId
                : activeSelectedId === asset.id;
            return (
              <button
                key={asset.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? "is-selected" : ""}
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
                {selected ? (
                  <Check className="item-check" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
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

      {challengeRequired ? (
        <section className="turnstile-panel" aria-label="Publish security">
          <strong>ONE MORE BEAT</strong>
          <TurnstileChallenge
            key={challengeVersion}
            onToken={receiveTurnstileToken}
          />
        </section>
      ) : null}

      <div className="publish-bar">
        <p aria-live="polite">{status}</p>
        {publishedUrl ? (
          <Link
            className="button button--secondary button--md"
            href={publishedUrl}
          >
            VIEW YOUR LOOK
          </Link>
        ) : null}
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
