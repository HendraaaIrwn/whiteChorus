"use client";

import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Variants,
} from "framer-motion";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { MusicControl } from "@/features/audio/music-control";
import { Bow, ChorusWave, Sparkle } from "@/features/home/home-doodles";

const menuItems = [
  ["/", "HOME"],
  ["/studio", "DRESS UP"],
  ["/hall-of-fame", "HALL OF FAME"],
  ["/daily-winners", "DAILY WINNERS"],
] as const;

const menuEase = [0.22, 1, 0.36, 1] as const;
const radialRevealEase = [0.65, 0, 0.35, 1] as const;

type MenuGeometry = {
  buttonLeft: number;
  buttonRadius: number;
  buttonSize: number;
  buttonTop: number;
  coverRadius: number;
  originX: number;
  originY: number;
};

const radialVariants: Variants = {
  closed: (geometry: MenuGeometry) => ({
    clipPath: `circle(${geometry.buttonRadius}px at ${geometry.originX}px ${geometry.originY}px)`,
    transition: {
      delay: 0.24,
      duration: 0.36,
      ease: menuEase,
    },
  }),
  open: (geometry: MenuGeometry) => ({
    clipPath: `circle(${geometry.coverRadius}px at ${geometry.originX}px ${geometry.originY}px)`,
    transition: { duration: 0.7, ease: radialRevealEase },
  }),
};

const topLineVariants: Variants = {
  closed: {
    y: -4,
    rotate: 0,
    transition: { delay: 0.4, duration: 0.18, ease: menuEase },
  },
  open: {
    y: 0,
    rotate: 45,
    transition: { duration: 0.18, ease: menuEase },
  },
};

const bottomLineVariants: Variants = {
  closed: {
    y: 4,
    rotate: 0,
    transition: { delay: 0.4, duration: 0.18, ease: menuEase },
  },
  open: {
    y: 0,
    rotate: -45,
    transition: { duration: 0.18, ease: menuEase },
  },
};

function measureMenuButton(button: HTMLButtonElement): MenuGeometry {
  const bounds = button.getBoundingClientRect();
  const originX = bounds.left + bounds.width / 2;
  const originY = bounds.top + bounds.height / 2;
  const coverRadius =
    Math.max(
      Math.hypot(originX, originY),
      Math.hypot(window.innerWidth - originX, originY),
      Math.hypot(originX, window.innerHeight - originY),
      Math.hypot(window.innerWidth - originX, window.innerHeight - originY),
    ) + 2;

  return {
    buttonLeft: bounds.left,
    buttonRadius: Math.max(bounds.width, bounds.height) / 2,
    buttonSize: Math.max(bounds.width, bounds.height),
    buttonTop: bounds.top,
    coverRadius,
    originX,
    originY,
  };
}

function MenuButtonVisual({ state }: { state: "closed" | "open" }) {
  return (
    <span
      className="home-menu-button__surface"
      data-menu-button-state={state}
      aria-hidden="true"
    >
      <motion.span
        className="home-menu-button__line-frame home-menu-button__line-frame--top"
        variants={topLineVariants}
        initial={false}
        animate={state === "closed" ? "closed" : undefined}
      >
        <span className="home-menu-button__line" />
      </motion.span>
      <motion.span
        className="home-menu-button__line-frame home-menu-button__line-frame--bottom"
        variants={bottomLineVariants}
        initial={false}
        animate={state === "closed" ? "closed" : undefined}
      >
        <span className="home-menu-button__line" />
      </motion.span>
    </span>
  );
}

type FullscreenRadialMenuProps = {
  activeArtwork: number;
  geometry: MenuGeometry;
  onActiveArtworkChange: (index: number) => void;
  onClose: () => void;
  reduceMotion: boolean;
};

function FullscreenRadialMenu({
  activeArtwork,
  geometry,
  onActiveArtworkChange,
  onClose,
  reduceMotion,
}: FullscreenRadialMenuProps) {
  const closeButtonStyle = {
    height: geometry.buttonSize,
    left: geometry.buttonLeft,
    top: geometry.buttonTop,
    width: geometry.buttonSize,
  } satisfies CSSProperties;
  return (
    <motion.div
      key="home-menu-radial-scene"
      className="home-menu-radial"
      custom={geometry}
      variants={reduceMotion ? undefined : radialVariants}
      initial={reduceMotion ? false : "closed"}
      animate={reduceMotion ? undefined : "open"}
      exit={
        reduceMotion ? { opacity: 0, transition: { duration: 0 } } : "closed"
      }
      style={
        reduceMotion
          ? {
              clipPath: `circle(${geometry.coverRadius}px at ${geometry.originX}px ${geometry.originY}px)`,
            }
          : undefined
      }
      data-menu-origin-x={geometry.originX}
      data-menu-origin-y={geometry.originY}
      data-menu-cover-radius={geometry.coverRadius}
    >
      <div className="home-menu-scene">
        <div className="home-menu-scene__top">
          <span className="home-menu-scene__wordmark">WHITE CHORUS</span>
          <button
            type="button"
            className="home-menu-close"
            style={closeButtonStyle}
            aria-label="Close menu"
            onClick={onClose}
          >
            <MenuButtonVisual state="open" />
          </button>
        </div>

        <nav aria-label="Primary navigation">
          <LayoutGroup id="home-menu-navigation">
            <ol>
              {menuItems.map(([href, label], index) => (
                <motion.li
                  key={href}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0, transition: { duration: 0 } }
                      : {
                          opacity: 0,
                          y: 12,
                          transition: {
                            delay: (menuItems.length - 1 - index) * 0.025,
                            duration: 0.11,
                            ease: menuEase,
                          },
                        }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          delay: 0.38 + index * 0.065,
                          duration: 0.3,
                          ease: menuEase,
                        }
                  }
                >
                  {activeArtwork === index ? (
                    <motion.span
                      className="home-menu-highlight"
                      layoutId="home-menu-highlight"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 460,
                              damping: 38,
                              mass: 0.68,
                            }
                      }
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="home-menu-scene__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={href}
                    data-home-menu-link
                    data-cursor="OPEN"
                    onMouseEnter={() => onActiveArtworkChange(index)}
                    onFocus={() => onActiveArtworkChange(index)}
                    onClick={onClose}
                  >
                    <span className="home-menu-scene__label">{label}</span>
                  </Link>
                </motion.li>
              ))}
            </ol>
          </LayoutGroup>
        </nav>

        <div
          className="home-menu-art"
          data-active={activeArtwork}
          aria-hidden="true"
        >
          <motion.div
            key={activeArtwork}
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.84, rotate: -6 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.42 }}
          >
            {activeArtwork % 2 ? <Bow /> : <Sparkle />}
          </motion.div>
          <ChorusWave />
        </div>

        <div className="home-menu-scene__meta">
          <MusicControl />
        </div>
      </div>
    </motion.div>
  );
}

export function HomeMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const geometryFrameRef = useRef<number | null>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [geometry, setGeometry] = useState<MenuGeometry | null>(null);
  const [activeArtwork, setActiveArtwork] = useState(0);
  const reduceMotion = useHydratedReducedMotion();

  const unlockBodyScroll = useCallback(() => {
    if (previousBodyOverflowRef.current === null) return;
    document.body.style.overflow = previousBodyOverflowRef.current;
    previousBodyOverflowRef.current = null;
  }, []);

  const updateGeometry = useCallback(() => {
    if (!triggerRef.current) return;
    setGeometry(measureMenuButton(triggerRef.current));
  }, []);

  const settleGeometry = useCallback(() => {
    if (geometryFrameRef.current !== null) {
      window.cancelAnimationFrame(geometryFrameRef.current);
    }

    let framesRemaining = 24;
    const measureNextFrame = () => {
      updateGeometry();
      framesRemaining -= 1;
      geometryFrameRef.current =
        framesRemaining > 0
          ? window.requestAnimationFrame(measureNextFrame)
          : null;
    };
    geometryFrameRef.current = window.requestAnimationFrame(measureNextFrame);
  }, [updateGeometry]);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new ResizeObserver(settleGeometry);
    observer.observe(trigger);
    window.addEventListener("resize", settleGeometry);
    window.visualViewport?.addEventListener("resize", settleGeometry);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", settleGeometry);
      window.visualViewport?.removeEventListener("resize", settleGeometry);
      if (geometryFrameRef.current !== null) {
        window.cancelAnimationFrame(geometryFrameRef.current);
        geometryFrameRef.current = null;
      }
    };
  }, [open, settleGeometry]);

  useEffect(
    () => () => {
      if (geometryFrameRef.current !== null) {
        window.cancelAnimationFrame(geometryFrameRef.current);
      }
      if (dialogRef.current?.open) dialogRef.current.close();
      unlockBodyScroll();
    },
    [unlockBodyScroll],
  );

  function openMenu() {
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    if (!dialog || !trigger || open) return;

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setGeometry(measureMenuButton(trigger));
    dialog.showModal();
    setOpen(true);
    window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>("[data-home-menu-link]")?.focus();
    });
  }

  function requestClose() {
    setOpen(false);
  }

  function finishClose() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    unlockBodyScroll();
    setGeometry(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="home-menu-trigger"
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="home-navigation-scene"
        onClick={openMenu}
      >
        <MenuButtonVisual state="closed" />
      </button>

      <dialog
        ref={dialogRef}
        className="home-menu-dialog"
        id="home-navigation-scene"
        aria-label="White Chorus navigation"
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
      >
        <AnimatePresence initial={false} onExitComplete={finishClose}>
          {open && geometry ? (
            <FullscreenRadialMenu
              activeArtwork={activeArtwork}
              geometry={geometry}
              onActiveArtworkChange={setActiveArtwork}
              onClose={requestClose}
              reduceMotion={reduceMotion}
            />
          ) : null}
        </AnimatePresence>
      </dialog>
    </>
  );
}
