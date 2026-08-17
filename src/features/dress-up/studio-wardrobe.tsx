"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  ImageOff,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  editorialEase,
  editorialMotionDurations,
} from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import type { DressUpAsset } from "@/features/dress-up/catalog";
import type { CharacterId, OutfitCategory } from "@/features/dress-up/model";
import { StitchedArrow } from "@/features/home/home-doodles";

export type StudioPanel = OutfitCategory | "background";

export type StudioWardrobeItem =
  DressUpAsset | { id: "none"; label: "None"; swatch: "transparent" };

export const studioPanels: OutfitCategory[] = [
  "hair",
  "top",
  "bottom",
  "one-piece",
  "shoes",
  "accessory",
];

export const studioPanelLabels: Record<StudioPanel, string> = {
  hair: "HAIR",
  top: "TOP",
  bottom: "BOTTOM",
  "one-piece": "ONE-PIECE",
  shoes: "SHOES",
  accessory: "ACCESSORIES",
  background: "BACKGROUND",
};

const wardrobeItemVariants: Variants = {
  rest: { opacity: 1, y: 0, scale: 1 },
  hover: { opacity: 1, y: -6, scale: 1.05 },
  selected: { opacity: 1, y: -4, scale: 1.035 },
  selectedHover: { opacity: 1, y: -7, scale: 1.065 },
  tap: { opacity: 1, y: -2, scale: 0.96 },
};

const wardrobeArtworkVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  selected: { scale: 1 },
  selectedHover: { scale: 1.03 },
  tap: { scale: 0.99 },
};

const wardrobeInteractionSpring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 26,
  mass: 0.6,
};

const wardrobeSelectionSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.65,
};

function WardrobeArtwork({
  eager,
  item,
  onArtworkError,
}: {
  eager: boolean;
  item: StudioWardrobeItem;
  onArtworkError(path: string): void;
}) {
  const iconSrc = "iconSrc" in item ? item.iconSrc : null;
  const iconPresentation =
    "iconPresentation" in item ? item.iconPresentation : "standard";
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const failed = Boolean(iconSrc && failedPath === iconSrc);

  if (!iconSrc)
    return (
      <span className="item-none" aria-hidden="true">
        <CircleOff />
      </span>
    );

  if (failed)
    return (
      <span
        className="item-thumbnail-fallback"
        style={{ background: item.swatch }}
        aria-hidden="true"
      >
        <ImageOff />
      </span>
    );

  return (
    <span
      className={`item-thumbnail-frame item-thumbnail-frame--${iconPresentation}`}
      aria-hidden="true"
    >
      <Image
        className="item-thumbnail"
        src={iconSrc}
        alt=""
        width={256}
        height={256}
        sizes="(max-width: 767px) 42vw, (max-width: 1199px) 18vw, 176px"
        loading={eager ? "eager" : "lazy"}
        onError={() => {
          setFailedPath(iconSrc);
          onArtworkError(iconSrc);
        }}
      />
    </span>
  );
}

function WardrobeIconItem({
  buttonRef,
  disabled,
  eager,
  item,
  onArtworkError,
  onKeyDown,
  onSelect,
  reduceMotion,
  selected,
  selectionLayoutId,
  tabIndex,
  targetName,
}: {
  buttonRef(node: HTMLButtonElement | null): void;
  disabled: boolean;
  eager: boolean;
  item: StudioWardrobeItem;
  onArtworkError(path: string): void;
  onKeyDown(event: KeyboardEvent<HTMLButtonElement>): void;
  onSelect(): void;
  reduceMotion: boolean;
  selected: boolean;
  selectionLayoutId: string;
  tabIndex: number;
  targetName: string;
}) {
  const accessibleLabel =
    item.id === "none"
      ? selected
        ? `No accessory selected for ${targetName}`
        : `Remove accessory from ${targetName}`
      : `${selected ? "Selected" : "Select"} ${item.label} for ${targetName}`;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={accessibleLabel}
      className={
        selected ? "wardrobe-icon-item is-selected" : "wardrobe-icon-item"
      }
      tabIndex={tabIndex}
      layout={reduceMotion ? false : "position"}
      initial={false}
      variants={wardrobeItemVariants}
      animate={selected ? "selected" : "rest"}
      whileHover={
        reduceMotion ? undefined : selected ? "selectedHover" : "hover"
      }
      whileTap={reduceMotion ? undefined : "tap"}
      transition={reduceMotion ? { duration: 0 } : wardrobeInteractionSpring}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      data-wardrobe-item={item.id}
      data-cursor="DRESS"
    >
      <span className="wardrobe-icon__hover-backplate" aria-hidden="true" />
      {selected ? (
        <motion.span
          className="wardrobe-icon__selection-frame"
          layoutId={reduceMotion ? undefined : selectionLayoutId}
          transition={reduceMotion ? { duration: 0 } : wardrobeSelectionSpring}
          aria-hidden="true"
        />
      ) : null}
      <motion.span
        className="wardrobe-icon__artwork"
        variants={wardrobeArtworkVariants}
        aria-hidden="true"
      >
        <WardrobeArtwork
          eager={eager}
          item={item}
          onArtworkError={onArtworkError}
        />
      </motion.span>
    </motion.button>
  );
}

export function WardrobeDeck({
  activeCharacter,
  activePanel,
  backgroundItems,
  disabled,
  items,
  onArtworkError,
  onBackgroundChange,
  onItemChange,
  onPanelChange,
  randomizeCycle,
  randomizing,
  selectedBackgroundId,
  selectedItemId,
}: {
  activeCharacter: CharacterId;
  activePanel: StudioPanel;
  backgroundItems: DressUpAsset[];
  disabled: boolean;
  items: StudioWardrobeItem[];
  onArtworkError(path: string): void;
  onBackgroundChange(item: StudioWardrobeItem): void;
  onItemChange(item: StudioWardrobeItem): void;
  onPanelChange(panel: StudioPanel): void;
  randomizeCycle: number;
  randomizing: boolean;
  selectedBackgroundId: string;
  selectedItemId: string | null;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const panelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const backgroundRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const targetName = activeCharacter === "character-a" ? "EMIR" : "FRISKA";
  const selectedBackgroundIndex = Math.max(
    0,
    backgroundItems.findIndex((item) => item.id === selectedBackgroundId),
  );

  useEffect(() => {
    if (activePanel !== "background") return;
    backgroundRefs.current[selectedBackgroundIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activePanel, reduceMotion, selectedBackgroundIndex]);

  function selectPanel(index: number, focus = false) {
    const wrapped = (index + studioPanels.length) % studioPanels.length;
    const next = studioPanels[wrapped];
    if (!next) return;
    onPanelChange(next);
    if (focus) {
      panelRefs.current[wrapped]?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
      panelRefs.current[wrapped]?.focus({ preventScroll: true });
    }
  }

  function handlePanelKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const targets: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: studioPanels.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    selectPanel(target, true);
  }

  function selectBackground(index: number, focus = false) {
    if (!backgroundItems.length) return;
    const wrapped = (index + backgroundItems.length) % backgroundItems.length;
    const next = backgroundItems[wrapped];
    if (!next) return;
    onBackgroundChange(next);
    backgroundRefs.current[wrapped]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
    if (focus) backgroundRefs.current[wrapped]?.focus();
  }

  function handleBackgroundKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const targets: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: backgroundItems.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    selectBackground(target, true);
  }

  function selectRailItem(index: number, focus = false) {
    const clamped = Math.min(items.length - 1, Math.max(0, index));
    const next = items[clamped];
    if (!next) return;
    onItemChange(next);
    itemRefs.current[clamped]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
    if (focus) itemRefs.current[clamped]?.focus();
  }

  function handleItemKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const targets: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: items.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    selectRailItem(target, true);
  }

  return (
    <motion.section
      className="studio-wardrobe"
      aria-label="Dress-up controls"
      aria-disabled={disabled || undefined}
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: reduceMotion ? 0 : 0.34,
        duration: reduceMotion ? 0 : 0.56,
        ease: editorialEase,
      }}
    >
      <div className="studio-wardrobe__heading">
        <span className="studio-kicker">WARDROBE · {targetName}</span>
        <h2>{studioPanelLabels[activePanel]}</h2>
        <StitchedArrow aria-hidden="true" />
      </div>

      <section
        id="studio-background-panel"
        className="background-carousel"
        aria-label="Background carousel"
      >
        <button
          className="background-carousel__control"
          type="button"
          disabled={disabled}
          aria-label="Previous background"
          onClick={() => selectBackground(selectedBackgroundIndex - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <div
          className="background-carousel__rail"
          role="radiogroup"
          aria-label="Background choices"
        >
          {backgroundItems.map((item, index) => {
            const selected = item.id === selectedBackgroundId;
            return (
              <motion.button
                ref={(node) => {
                  backgroundRefs.current[index] = node;
                }}
                key={item.id}
                className={selected ? "is-selected" : ""}
                type="button"
                disabled={disabled}
                role="radio"
                aria-checked={selected}
                aria-label={`${selected ? "Selected: " : "Choose "}${item.label} background`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectBackground(index)}
                onKeyDown={(event) => handleBackgroundKeys(event, index)}
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 30,
                  mass: 0.7,
                }}
                data-cursor="DRESS"
              >
                <WardrobeArtwork
                  eager
                  item={item}
                  onArtworkError={onArtworkError}
                />
                {selected ? (
                  <span
                    className="background-carousel__check"
                    aria-hidden="true"
                  >
                    <Check />
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </div>
        <button
          className="background-carousel__control"
          type="button"
          disabled={disabled}
          aria-label="Next background"
          onClick={() => selectBackground(selectedBackgroundIndex + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </section>

      <div
        className="category-tabs"
        role="tablist"
        aria-label="Outfit categories"
      >
        {studioPanels.map((panel, index) => {
          const selected = activePanel === panel;
          return (
            <button
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
              key={panel}
              id={`studio-category-${panel}`}
              type="button"
              disabled={disabled}
              role="tab"
              aria-label={studioPanelLabels[panel]}
              aria-selected={selected}
              aria-controls="studio-item-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => selectPanel(index)}
              onKeyDown={(event) => handlePanelKeys(event, index)}
              data-cursor="SELECT"
            >
              <span>{studioPanelLabels[panel]}</span>
              {selected ? (
                <motion.span
                  className="category-tab__indicator"
                  layoutId="studio-category-indicator"
                  transition={{ type: "spring", stiffness: 390, damping: 32 }}
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {activePanel !== "background" ? (
        <section
          id="studio-item-panel"
          className="item-panel"
          role="tabpanel"
          aria-labelledby={`studio-category-${activePanel}`}
        >
          <motion.div
            key={`${activePanel}:${activeCharacter}:${randomizeCycle}`}
            className="item-rail"
            data-randomizing={randomizing || undefined}
            role="group"
            aria-label={`${studioPanelLabels[activePanel]} items`}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduceMotion ? 0 : editorialMotionDurations.interaction,
              ease: editorialEase,
            }}
          >
            {items.map((item, index) => {
              const selected =
                item.id === "none"
                  ? selectedItemId === null
                  : selectedItemId === item.id;
              const noCurrentSelection = selectedItemId === null;
              return (
                <WardrobeIconItem
                  buttonRef={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  key={item.id}
                  disabled={disabled}
                  eager={index < 3}
                  item={item}
                  onArtworkError={onArtworkError}
                  onKeyDown={(event) => handleItemKeys(event, index)}
                  onSelect={() => selectRailItem(index)}
                  reduceMotion={reduceMotion}
                  selected={selected}
                  selectionLayoutId={`wardrobe-selection-${activeCharacter}-${activePanel}`}
                  tabIndex={
                    selected || (noCurrentSelection && index === 0) ? 0 : -1
                  }
                  targetName={targetName}
                />
              );
            })}
          </motion.div>
        </section>
      ) : null}
    </motion.section>
  );
}
