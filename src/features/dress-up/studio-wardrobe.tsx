"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  editorialEase,
  editorialMotionDurations,
} from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import type { DressUpAsset } from "@/features/dress-up/catalog";
import type { CharacterId, OutfitCategory } from "@/features/dress-up/model";
import { Bow, StitchedArrow } from "@/features/home/home-doodles";

export type StudioPanel = OutfitCategory | "background";

export type StudioWardrobeItem =
  DressUpAsset | { id: "none"; label: "None"; swatch: "transparent" };

export const studioPanels: StudioPanel[] = [
  "hair",
  "top",
  "bottom",
  "one-piece",
  "shoes",
  "accessory",
  "background",
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

function WardrobeArtwork({
  eager,
  item,
  onArtworkError,
}: {
  eager: boolean;
  item: StudioWardrobeItem;
  onArtworkError(path: string): void;
}) {
  const previewPath = "previewPath" in item ? item.previewPath : null;
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const failed = Boolean(previewPath && failedPath === previewPath);

  if (!previewPath)
    return (
      <span className="item-none" aria-hidden="true">
        <Bow />
      </span>
    );

  if (failed)
    return (
      <span
        className="item-thumbnail-fallback"
        style={{ background: item.swatch }}
        aria-hidden="true"
      >
        <Bow />
      </span>
    );

  return (
    <Image
      className="item-thumbnail"
      src={previewPath}
      alt=""
      width={220}
      height={220}
      sizes="(max-width: 767px) 42vw, 130px"
      loading={eager ? "eager" : "lazy"}
      onError={() => {
        setFailedPath(previewPath);
        onArtworkError(previewPath);
      }}
      unoptimized
    />
  );
}

export function WardrobeDeck({
  activeCharacter,
  activePanel,
  disabled,
  items,
  onArtworkError,
  onItemChange,
  onPanelChange,
  randomizeCycle,
  randomizing,
  selectedItemId,
}: {
  activeCharacter: CharacterId;
  activePanel: StudioPanel;
  disabled: boolean;
  items: StudioWardrobeItem[];
  onArtworkError(path: string): void;
  onItemChange(item: StudioWardrobeItem): void;
  onPanelChange(panel: StudioPanel): void;
  randomizeCycle: number;
  randomizing: boolean;
  selectedItemId: string | null;
}) {
  const reduceMotion = useHydratedReducedMotion();
  const panelRailRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const targetName = activeCharacter === "character-a" ? "EMIR" : "FRISKA";

  const scrollPanelIntoView = useCallback((index: number) => {
    const rail = panelRailRef.current;
    const panel = panelRefs.current[index];
    if (!rail || !panel) return;

    const railBounds = rail.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    if (panelBounds.left < railBounds.left) {
      rail.scrollLeft += panelBounds.left - railBounds.left - 2;
    } else if (panelBounds.right > railBounds.right) {
      rail.scrollLeft += panelBounds.right - railBounds.right + 2;
    }
  }, []);

  useEffect(() => {
    scrollPanelIntoView(studioPanels.indexOf(activePanel));
  }, [activePanel, scrollPanelIntoView]);

  function selectPanel(index: number, focus = false) {
    const wrapped = (index + studioPanels.length) % studioPanels.length;
    const next = studioPanels[wrapped];
    if (!next) return;
    onPanelChange(next);
    if (focus) {
      panelRefs.current[wrapped]?.focus({ preventScroll: true });
      scrollPanelIntoView(wrapped);
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
      initial={reduceMotion ? false : { opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: reduceMotion ? 0 : 0.34,
        duration: reduceMotion ? 0 : 0.56,
        ease: editorialEase,
      }}
    >
      <div className="studio-wardrobe__heading">
        <span className="studio-kicker">
          WARDROBE ·{" "}
          {activePanel === "background" ? "SHARED SCENE" : targetName}
        </span>
        <h2>{studioPanelLabels[activePanel]}</h2>
        <StitchedArrow aria-hidden="true" />
      </div>

      <div
        ref={panelRailRef}
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
          role="radiogroup"
          aria-label={`${studioPanelLabels[activePanel]} items`}
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: reduceMotion ? 0 : editorialMotionDurations.interaction,
            ease: editorialEase,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, index) => {
              const selected =
                item.id === "none"
                  ? selectedItemId === null
                  : selectedItemId === item.id;
              const noCurrentSelection = selectedItemId === null;
              const accessibleLabel = `${selected ? "Selected: " : "Choose "}${item.label}${activePanel === "background" ? " background" : ""}`;
              return (
                <motion.button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  role="radio"
                  aria-checked={selected}
                  aria-label={accessibleLabel}
                  className={selected ? "is-selected" : ""}
                  tabIndex={
                    selected || (noCurrentSelection && index === 0) ? 0 : -1
                  }
                  layout={reduceMotion ? false : "position"}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 9, scale: 0.96 }
                  }
                  animate={{
                    opacity: 1,
                    y: selected && !reduceMotion ? -3 : 0,
                    scale: 1,
                  }}
                  exit={
                    reduceMotion ? undefined : { opacity: 0, y: 5, scale: 0.96 }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  onClick={() => selectRailItem(index)}
                  onKeyDown={(event) => handleItemKeys(event, index)}
                  data-cursor="DRESS"
                >
                  <span className="item-rail__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <WardrobeArtwork
                    eager={index < 3}
                    item={item}
                    onArtworkError={onArtworkError}
                  />
                  <strong>{item.label.toUpperCase()}</strong>
                  {selected ? (
                    <motion.span
                      className="item-check"
                      layoutId="studio-selected-item"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                      aria-hidden="true"
                    >
                      <Check />
                    </motion.span>
                  ) : null}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>
    </motion.section>
  );
}
