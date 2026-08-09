"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, RotateCcw, Sparkles } from "lucide-react";

import { editorialEase } from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Button } from "@/components/ui/button";
import { TurnstileChallenge } from "@/features/abuse-protection/turnstile-challenge";
import { Magnetic } from "@/features/home/home-motion";

export function StudioActionDock({
  challengeRequired,
  challengeVersion,
  controlsDisabled,
  onPublish,
  onRandomize,
  onReset,
  onTurnstileToken,
  publishDisabled,
  publishedUrl,
  publishing,
  randomizing,
  status,
}: {
  challengeRequired: boolean;
  challengeVersion: number;
  controlsDisabled: boolean;
  onPublish(): void;
  onRandomize(): void;
  onReset(): void;
  onTurnstileToken(token: string | null): void;
  publishDisabled: boolean;
  publishedUrl: string | null;
  publishing: boolean;
  randomizing: boolean;
  status: string;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.aside
      className="studio-action-dock"
      aria-label="Studio actions"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduceMotion ? 0 : 0.52,
        duration: reduceMotion ? 0 : 0.48,
        ease: editorialEase,
      }}
    >
      <div className="publish-status" aria-live="polite" aria-atomic="true">
        <span>DRAFT SAVES AUTOMATICALLY</span>
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={status}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {status}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="studio-secondary-actions">
        <Magnetic>
          <Button
            className="studio-action studio-action--randomize"
            variant="secondary"
            disabled={controlsDisabled || randomizing}
            replacementLabel="MIX IT UP ↗"
            onClick={onRandomize}
            data-cursor="DRESS"
          >
            <Dices aria-hidden="true" /> RANDOMIZE ALL
          </Button>
        </Magnetic>
        <Button
          className="studio-action studio-action--reset"
          variant="tertiary"
          disabled={controlsDisabled}
          onClick={onReset}
          data-cursor="SELECT"
        >
          <RotateCcw aria-hidden="true" /> RESET ALL
        </Button>
      </div>

      <AnimatePresence>
        {challengeRequired ? (
          <motion.section
            key="publish-security"
            className="turnstile-panel"
            aria-label="Publish security"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
          >
            <strong>ONE MORE BEAT</strong>
            <TurnstileChallenge
              key={challengeVersion}
              onToken={onTurnstileToken}
            />
          </motion.section>
        ) : null}
      </AnimatePresence>

      <div className="studio-publish-action">
        <Magnetic>
          <Button
            className="studio-action studio-action--publish"
            size="lg"
            loading={publishing}
            disabled={publishDisabled}
            replacementLabel="ENTER THE HALL ↗"
            onClick={onPublish}
            data-cursor="SAVE"
          >
            <Sparkles aria-hidden="true" /> PUBLISH TO HALL OF FAME
          </Button>
        </Magnetic>
        {publishedUrl ? (
          <Link
            className="studio-view-look"
            href={publishedUrl}
            data-cursor="OPEN"
          >
            VIEW YOUR LOOK ↗
          </Link>
        ) : null}
      </div>
    </motion.aside>
  );
}
