"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  backgroundAssets,
  getItems,
  normalizeCatalogConfiguration,
  validateCatalogConfiguration,
} from "@/features/dress-up/catalog";
import {
  defaultConfiguration,
  dressUpConfigurationSchema,
  isPublishReady,
  resetConfiguration,
  selectItem,
  type CharacterId,
  type DressUpConfiguration,
  type OutfitCategory,
} from "@/features/dress-up/model";
import { randomizeConfiguration } from "@/features/dress-up/randomize";
import {
  StudioActionDock,
  type StudioFeedback,
} from "@/features/dress-up/studio-action-dock";
import { CharacterStage } from "@/features/dress-up/studio-stage";
import {
  studioPanelLabels,
  WardrobeDeck,
  type StudioPanel,
  type StudioWardrobeItem,
} from "@/features/dress-up/studio-wardrobe";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";
import { useHydrated } from "@/lib/use-hydrated";

const DRAFT_KEY = "white-chorus:dress-up-draft:v2";

function selectedId(
  configuration: DressUpConfiguration,
  character: CharacterId,
  panel: StudioPanel,
): string | null {
  if (panel === "background") return configuration.backgroundId;
  const value =
    character === "character-a"
      ? configuration.characterA
      : configuration.characterB;
  return panel === "hair"
    ? value.hairId
    : panel === "top"
      ? value.topId
      : panel === "bottom"
        ? value.bottomId
        : panel === "one-piece"
          ? value.onePieceId
          : panel === "shoes"
            ? value.shoesId
            : (value.accessoryIds[0] ?? null);
}

export function DressUpStudio() {
  const hydrated = useHydrated();
  const restoredConfiguration = useMemo(() => {
    if (!hydrated) return defaultConfiguration;
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (!saved) return defaultConfiguration;
    try {
      const parsed = dressUpConfigurationSchema.safeParse(JSON.parse(saved));
      if (!parsed.success) return defaultConfiguration;
      const normalized = normalizeCatalogConfiguration(parsed.data);
      return !validateCatalogConfiguration(normalized).length
        ? normalized
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
  const [activePanel, setActivePanel] = useState<StudioPanel>("hair");
  const [feedback, setFeedback] = useState<StudioFeedback>({
    message: "Your draft is ready.",
    tone: "polite",
  });
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [challengeRequired, setChallengeRequired] = useState(false);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [backgroundDirection, setBackgroundDirection] = useState(1);
  const [randomizeCycle, setRandomizeCycle] = useState(0);
  const [randomizing, setRandomizing] = useState(false);
  const randomizeTimer = useRef<number | null>(null);

  const receiveTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
    if (token)
      setFeedback({
        message: "Security check complete. You can publish now.",
        tone: "polite",
      });
  }, []);
  const reportStageArtworkError = useCallback(() => {
    setFeedback({
      message: "Some studio artwork could not load. Your draft is still safe.",
      tone: "error",
    });
  }, []);
  const reportWardrobeArtworkError = useCallback(() => {
    setFeedback({
      message:
        "Some wardrobe artwork could not load. You can still choose another item.",
      tone: "error",
    });
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(configuration));
  }, [configuration, hydrated]);

  useEffect(
    () => () => {
      if (randomizeTimer.current) window.clearTimeout(randomizeTimer.current);
    },
    [],
  );

  const currentBackgroundIndex = Math.max(
    0,
    backgroundAssets.findIndex(
      (asset) => asset.id === configuration.backgroundId,
    ),
  );
  const items = useMemo<StudioWardrobeItem[]>(() => {
    if (activePanel === "background") return [];
    const wardrobeItems = getItems(activeCharacter, activePanel);
    return activePanel === "accessory" && wardrobeItems.length
      ? [{ id: "none", label: "None", swatch: "transparent" }, ...wardrobeItems]
      : wardrobeItems;
  }, [activeCharacter, activePanel]);
  const activeSelectedId = selectedId(
    configuration,
    activeCharacter,
    activePanel,
  );

  function chooseCharacter(character: CharacterId) {
    if (publishing) return;
    setActiveCharacter(character);
    setFeedback({
      message: `${character === "character-a" ? "Emir" : "Friska"} is ready to dress.`,
      tone: "polite",
    });
  }

  function choosePanel(panel: StudioPanel) {
    if (publishing) return;
    setActivePanel(panel);
    setFeedback({
      message:
        panel === "background"
          ? "Shared backgrounds are ready."
          : `${studioPanelLabels[panel]} opened for ${activeCharacter === "character-a" ? "Emir" : "Friska"}.`,
      tone: "polite",
    });
  }

  function chooseBackground(item: StudioWardrobeItem) {
    if (publishing) return;
    const nextIndex = backgroundAssets.findIndex(
      (asset) => asset.id === item.id,
    );
    if (nextIndex < 0) return;
    setBackgroundDirection(nextIndex >= currentBackgroundIndex ? 1 : -1);
    setConfiguration((current) => ({
      ...(current ?? restoredConfiguration),
      backgroundId: item.id,
    }));
    setFeedback({
      message: `${item.label} background selected.`,
      tone: "polite",
    });
  }

  function chooseItem(item: StudioWardrobeItem) {
    if (publishing || activePanel === "background") return;

    setConfiguration((current) => {
      current ??= restoredConfiguration;
      const key =
        activeCharacter === "character-a" ? "characterA" : "characterB";
      return {
        ...current,
        [key]: selectItem(
          current[key],
          activePanel as OutfitCategory,
          item.id === "none" ? null : item.id,
        ),
      };
    });
    setFeedback({
      message: `${item.label} selected for ${activeCharacter === "character-a" ? "Emir" : "Friska"}.`,
      tone: "polite",
    });
  }

  function randomize() {
    if (publishing || randomizing) return;
    const next = randomizeConfiguration();
    const nextBackgroundIndex = backgroundAssets.findIndex(
      (asset) => asset.id === next.backgroundId,
    );
    setBackgroundDirection(
      nextBackgroundIndex >= currentBackgroundIndex ? 1 : -1,
    );
    setConfiguration(next);
    setRandomizeCycle((current) => current + 1);
    setRandomizing(true);
    if (randomizeTimer.current) window.clearTimeout(randomizeTimer.current);
    randomizeTimer.current = window.setTimeout(() => {
      setRandomizing(false);
      randomizeTimer.current = null;
    }, 680);
    setFeedback({
      message: "A valid random look is ready.",
      tone: "polite",
    });
  }

  function reset() {
    if (publishing) return;
    if (randomizeTimer.current) {
      window.clearTimeout(randomizeTimer.current);
      randomizeTimer.current = null;
    }
    setRandomizing(false);
    setBackgroundDirection(currentBackgroundIndex > 0 ? -1 : 1);
    setConfiguration(resetConfiguration);
    setRandomizeCycle(0);
    setFeedback({
      message:
        "The studio has been reset. Dress both voices before publishing.",
      tone: "polite",
    });
  }

  async function publish() {
    if (publishing || randomizing) return;
    setPublishing(true);
    setPublishedUrl(null);
    try {
      await ensureGuestSession();
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...configuration, turnstileToken }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      let payload: {
        ok: boolean;
        data?: { url: string };
        error?: { code: string; message: string };
      } | null = null;
      if (contentType.toLowerCase().includes("application/json")) {
        try {
          payload = (await response.json()) as {
            ok: boolean;
            data?: { url: string };
            error?: { code: string; message: string };
          };
        } catch {
          payload = null;
        }
      }
      if (!response.ok || !payload?.ok || !payload.data) {
        if (
          payload?.error?.code === "TURNSTILE_REQUIRED" ||
          payload?.error?.code === "TURNSTILE_FAILED"
        ) {
          setChallengeRequired(true);
          setChallengeVersion((current) => current + 1);
          setTurnstileToken(null);
        }
        throw new Error(
          payload?.error?.message ??
            "We could not publish your look right now. Your draft is still saved. Please try again.",
        );
      }
      setPublishedUrl(payload.data.url);
      setFeedback({
        message: "Publish complete. Your look is live.",
        tone: "polite",
      });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        tone: "error",
      });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="studio-layout">
      <CharacterStage
        activeCharacter={activeCharacter}
        backgroundDirection={backgroundDirection}
        configuration={configuration}
        disabled={publishing}
        onCharacterChange={chooseCharacter}
        onArtworkError={reportStageArtworkError}
        publishedUrl={publishedUrl}
        publishing={publishing}
        randomizeCycle={randomizeCycle}
        randomizing={randomizing}
      />
      <div className="studio-control-column">
        <WardrobeDeck
          activeCharacter={activeCharacter}
          activePanel={activePanel}
          backgroundItems={backgroundAssets}
          disabled={publishing}
          items={items}
          onBackgroundChange={chooseBackground}
          onArtworkError={reportWardrobeArtworkError}
          onItemChange={chooseItem}
          onPanelChange={choosePanel}
          randomizeCycle={randomizeCycle}
          randomizing={randomizing}
          selectedBackgroundId={configuration.backgroundId}
          selectedItemId={activeSelectedId}
        />
        <StudioActionDock
          challengeRequired={challengeRequired}
          challengeVersion={challengeVersion}
          onPublish={() => void publish()}
          onRandomize={randomize}
          onReset={reset}
          onTurnstileToken={receiveTurnstileToken}
          controlsDisabled={publishing}
          publishDisabled={
            randomizing ||
            !isPublishReady(configuration) ||
            (challengeRequired && !turnstileToken)
          }
          publishedUrl={publishedUrl}
          publishing={publishing}
          randomizing={randomizing}
          feedback={feedback}
        />
      </div>
      <Dialog
        open={Boolean(publishedUrl)}
        onOpenChange={(open) => {
          if (!open) setPublishedUrl(null);
        }}
        title="YOUR LOOK IS IN THE HALL"
        description="The published image is ready to rate, share, and download. Your studio draft remains saved on this device."
        returnFocusSelector=".studio-action--publish"
      >
        <p className="dialog-status" role="status">
          Publish complete. Your look is live.
        </p>
        <div className="dialog-actions">
          {publishedUrl ? (
            <Link
              className="button button--secondary button--lg"
              href={publishedUrl}
            >
              VIEW YOUR LOOK
            </Link>
          ) : null}
          <Button variant="tertiary" onClick={() => setPublishedUrl(null)}>
            KEEP DRESSING
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
