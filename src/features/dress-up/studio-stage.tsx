"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  editorialEase,
  editorialMotionDurations,
} from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import {
  CHARACTER_STAGE,
  getAsset,
  renderLayersFor,
  type RenderLayer,
} from "@/features/dress-up/catalog";
import type {
  CharacterId,
  DressUpConfiguration,
} from "@/features/dress-up/model";
import {
  Bow,
  Sparkle,
  StitchedArrow,
  ThreadStroke,
} from "@/features/home/home-doodles";

function CharacterLayers({
  active,
  character,
  failedAssets,
  layers,
  onAssetError,
  pointerX,
  randomizing,
  reduceMotion,
}: {
  active: boolean;
  character: CharacterId;
  failedAssets: ReadonlySet<string>;
  layers: RenderLayer[];
  onAssetError(path: string): void;
  pointerX: MotionValue<number>;
  randomizing: boolean;
  reduceMotion: boolean;
}) {
  const stage = CHARACTER_STAGE[character];
  const baseLayers = layers.filter((layer) => layer.kind === "base");
  const outfitLayers = layers.filter((layer) => layer.kind !== "base");

  /**
   * Character group is already at CHARACTER_STAGE. RenderLayer left/top are
   * absolute stage coords from resolveLayerPosition — convert to group-relative
   * so the base stays fixed while wardrobe-only corrections still apply.
   *
   * Registration uses CSS --layer-shift-* variables (not FM transform props) so
   * opacity enter/exit animation cannot clobber outfit alignment.
   */
  const layerOffsetStyle = (layer: RenderLayer): CSSProperties => {
    const relX = layer.left - stage.x;
    const relY = layer.top - stage.y;
    return {
      zIndex: layer.layerOrder % 100,
      ["--layer-shift-x" as string]: `${(relX / 1200) * 100}%`,
      ["--layer-shift-y" as string]: `${(relY / 1600) * 100}%`,
    };
  };

  const renderLayer = (layer: RenderLayer, index: number) => (
    <motion.img
      key={`${layer.assetId}:${layer.path}`}
      className="studio-production-layer"
      data-asset-id={layer.assetId}
      data-character={character}
      data-layer-left={layer.left}
      data-layer-top={layer.top}
      src={layer.path}
      alt=""
      width={1200}
      height={1600}
      fetchPriority={layer.kind === "base" ? "high" : undefined}
      onError={() => onAssetError(layer.path)}
      style={layerOffsetStyle(layer)}
      initial={reduceMotion || layer.kind === "base" ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={
        reduceMotion || layer.kind === "base"
          ? undefined
          : {
              opacity: 0,
              transition: {
                duration: editorialMotionDurations.layerExit,
              },
            }
      }
      transition={{
        delay:
          reduceMotion || layer.kind === "base" || !randomizing
            ? 0
            : index * 0.035,
        duration: reduceMotion
          ? 0
          : layer.kind === "base"
            ? 0.01
            : editorialMotionDurations.layerEnter,
        ease: editorialEase,
      }}
    />
  );

  return (
    <motion.div
      className={`studio-character-group studio-character-group--${character === "character-a" ? "emir" : "friska"}`}
      data-active={active || undefined}
      data-stage-x={stage.x}
      data-stage-y={stage.y}
      style={{
        left: `${(stage.x / 1200) * 100}%`,
        top: `${(stage.y / 1600) * 100}%`,
        scale: stage.scale,
        x: pointerX,
      }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, scale: active ? 1.008 : 0.998, y: active ? -3 : 0 }
      }
      transition={{ duration: reduceMotion ? 0 : 0.36, ease: editorialEase }}
    >
      <AnimatePresence initial={false}>
        {baseLayers
          .filter((layer) => !failedAssets.has(layer.path))
          .map((layer, index) => renderLayer(layer, index))}
      </AnimatePresence>
      <div className="studio-character-wardrobe">
        <AnimatePresence initial={false}>
          {outfitLayers
            .filter((layer) => !failedAssets.has(layer.path))
            .map((layer, index) => renderLayer(layer, index))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function CharacterStage({
  activeCharacter,
  backgroundDirection,
  configuration,
  disabled,
  onCharacterChange,
  onArtworkError,
  publishedUrl,
  publishing,
  randomizeCycle,
  randomizing,
}: {
  activeCharacter: CharacterId;
  backgroundDirection: number;
  configuration: DressUpConfiguration;
  disabled: boolean;
  onCharacterChange(character: CharacterId): void;
  onArtworkError(path: string): void;
  publishedUrl: string | null;
  publishing: boolean;
  randomizeCycle: number;
  randomizing: boolean;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const stageBounds = useRef<DOMRect | null>(null);
  const finePointer = useRef(false);
  const [failedAssets, setFailedAssets] = useState<Set<string>>(
    () => new Set(),
  );
  const pointerA = useMotionValue(0);
  const pointerB = useMotionValue(0);
  const pointerBackground = useMotionValue(0);
  const pointerDecoration = useMotionValue(0);
  const smoothA = useSpring(pointerA, {
    stiffness: 260,
    damping: 28,
    mass: 0.55,
  });
  const smoothB = useSpring(pointerB, {
    stiffness: 240,
    damping: 26,
    mass: 0.58,
  });
  const smoothBackground = useSpring(pointerBackground, {
    stiffness: 220,
    damping: 30,
    mass: 0.7,
  });
  const smoothDecoration = useSpring(pointerDecoration, {
    stiffness: 210,
    damping: 24,
    mass: 0.6,
  });

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCapability = () => {
      finePointer.current = query.matches && !reduceMotion;
    };
    const clearBounds = () => {
      stageBounds.current = null;
    };
    updateCapability();
    query.addEventListener("change", updateCapability);
    window.addEventListener("resize", clearBounds);
    return () => {
      query.removeEventListener("change", updateCapability);
      window.removeEventListener("resize", clearBounds);
    };
  }, [reduceMotion]);

  const markAssetFailed = useCallback(
    (path: string) => {
      setFailedAssets((current) => {
        if (current.has(path)) return current;
        const next = new Set(current);
        next.add(path);
        return next;
      });
      onArtworkError(path);
    },
    [onArtworkError],
  );
  const background = getAsset(configuration.backgroundId);
  const layers = renderLayersFor(configuration);
  const emirLayers = layers.filter(
    (layer) => layer.characterId === "character-a",
  );
  const friskaLayers = layers.filter(
    (layer) => layer.characterId === "character-b",
  );
  const watermark = layers.find((layer) => layer.kind === "watermark");

  return (
    <motion.section
      className="studio-stage-panel"
      aria-label="Character stage"
      aria-busy={publishing || undefined}
      initial={false}
      animate={{
        opacity: 1,
        clipPath: "inset(0% 0 0 0 round 36px)",
        transitionEnd: { clipPath: "none" },
      }}
      transition={{
        duration: reduceMotion ? 0 : editorialMotionDurations.scene,
        ease: editorialEase,
      }}
    >
      <div
        className="studio-stage"
        data-cursor="DRESS"
        onPointerEnter={(event) => {
          if (finePointer.current)
            stageBounds.current = event.currentTarget.getBoundingClientRect();
        }}
        onPointerMove={(event) => {
          if (!finePointer.current) return;
          const bounds =
            stageBounds.current ?? event.currentTarget.getBoundingClientRect();
          stageBounds.current = bounds;
          const normalized =
            (event.clientX - bounds.left - bounds.width / 2) /
            (bounds.width / 2);
          const range = window.innerWidth < 1200 ? 0.6 : 1;
          pointerA.set(normalized * 3 * range);
          pointerB.set(normalized * -4 * range);
          pointerBackground.set(normalized * 2.5 * range);
          pointerDecoration.set(normalized * 9 * range);
        }}
        onPointerLeave={() => {
          stageBounds.current = null;
          pointerA.set(0);
          pointerB.set(0);
          pointerBackground.set(0);
          pointerDecoration.set(0);
        }}
      >
        <div
          className="studio-stage__art"
          role="img"
          aria-label={`Emir and Friska on the ${background?.label ?? "selected"} background.`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {background?.assetSrcs[0] &&
            !failedAssets.has(background.assetSrcs[0]) ? (
              <motion.img
                key={background.assetSrcs[0]}
                className="studio-stage__background"
                src={background.assetSrcs[0]}
                alt=""
                width={1200}
                height={1600}
                fetchPriority="high"
                onError={() => markAssetFailed(background.assetSrcs[0]!)}
                style={{ x: smoothBackground }}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        clipPath:
                          backgroundDirection > 0
                            ? "inset(0 0 0 100%)"
                            : "inset(0 100% 0 0)",
                        scale: 1.02,
                      }
                }
                animate={{
                  opacity: 1,
                  clipPath: "inset(0 0 0 0)",
                  scale: 1,
                }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                transition={{
                  duration: reduceMotion
                    ? 0
                    : editorialMotionDurations.background,
                  ease: editorialEase,
                }}
              />
            ) : null}
          </AnimatePresence>

          <CharacterLayers
            active={activeCharacter === "character-a"}
            character="character-a"
            failedAssets={failedAssets}
            layers={emirLayers}
            onAssetError={markAssetFailed}
            pointerX={smoothA}
            randomizing={randomizing}
            reduceMotion={reduceMotion}
          />
          <CharacterLayers
            active={activeCharacter === "character-b"}
            character="character-b"
            failedAssets={failedAssets}
            layers={friskaLayers}
            onAssetError={markAssetFailed}
            pointerX={smoothB}
            randomizing={randomizing}
            reduceMotion={reduceMotion}
          />

          {watermark && !failedAssets.has(watermark.path) ? (
            <motion.img
              className="studio-production-layer studio-production-layer--watermark"
              src={watermark.path}
              alt=""
              width={1200}
              height={1600}
              onError={() => markAssetFailed(watermark.path)}
            />
          ) : null}

          <span className="studio-stage__label">
            SCENE · {background?.label ?? "LOADING"}
          </span>
          <motion.div
            className="studio-stage__doodle-layer"
            style={{ x: smoothDecoration }}
            aria-hidden="true"
          >
            <Bow className="studio-stage__bow" />
            <Sparkle className="studio-stage__sparkle" />
          </motion.div>
        </div>

        <div className="character-switcher" aria-label="Choose character">
          {(
            [
              ["character-b", "FRISKA"],
              ["character-a", "EMIR"],
            ] as const
          ).map(([character, label]) => {
            const active = activeCharacter === character;
            return (
              <button
                key={character}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onCharacterChange(character)}
                className={active ? "is-active" : ""}
                data-character={character}
                data-cursor="SELECT"
              >
                <Image
                  src={
                    character === "character-a"
                      ? "/dress-up/previews/emir-icon.webp"
                      : "/dress-up/previews/friska-icon.webp"
                  }
                  alt=""
                  width={42}
                  height={42}
                />
                <span>DRESS {label}</span>
                {active ? (
                  <motion.span
                    className="character-switcher__indicator"
                    layoutId="studio-active-character"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {failedAssets.size ? (
          <p className="studio-stage__asset-fallback" role="status">
            ARTWORK UNAVAILABLE · TRY ANOTHER ITEM OR REFRESH
          </p>
        ) : null}

        <AnimatePresence>
          {randomizeCycle > 0 ? (
            <motion.div
              key={randomizeCycle}
              className="studio-randomize-reaction"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.65 }}
              animate={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: [0, 1, 1, 0],
                      scale: [0.65, 1.08, 1, 0.96],
                      rotate: [0, 8, -3, 0],
                    }
              }
              transition={{
                duration: reduceMotion ? 0 : editorialMotionDurations.randomize,
              }}
              aria-hidden="true"
            >
              <Sparkle />
              <ThreadStroke />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {publishing ? (
            <motion.div
              className="studio-processing-spotlight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              aria-hidden="true"
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {publishedUrl ? (
            <motion.div
              key={publishedUrl}
              className="publish-success-burst"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1, 1, 0.96] }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.08 : 0.65 }}
              aria-hidden="true"
            >
              <Sparkle />
              <strong>LOOK IS LIVE</strong>
              <StitchedArrow />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
