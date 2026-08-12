"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { editorialEase } from "@/components/motion/motion-presets";
import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Button } from "@/components/ui/button";
import { TurnstileChallenge } from "@/features/abuse-protection/turnstile-challenge";

export type StudioFeedback = {
  message: string;
  tone: "polite" | "error";
};

export function StudioActionDock({
  challengeRequired,
  challengeVersion,
  controlsDisabled,
  feedback,
  onPublish,
  onRandomize,
  onReset,
  onTurnstileToken,
  publishDisabled,
  publishedUrl,
  publishing,
  randomizing,
}: {
  challengeRequired: boolean;
  challengeVersion: number;
  controlsDisabled: boolean;
  feedback: StudioFeedback;
  onPublish(): void;
  onRandomize(): void;
  onReset(): void;
  onTurnstileToken(token: string | null): void;
  publishDisabled: boolean;
  publishedUrl: string | null;
  publishing: boolean;
  randomizing: boolean;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.aside
      className="studio-action-dock"
      aria-label="Studio actions"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduceMotion ? 0 : 0.52,
        duration: reduceMotion ? 0 : 0.48,
        ease: editorialEase,
      }}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {feedback.tone === "polite" ? feedback.message : ""}
      </span>

      <AnimatePresence initial={false} mode="wait">
        {feedback.tone === "error" ? (
          <motion.p
            key={feedback.message}
            className="studio-feedback studio-feedback--error"
            role="alert"
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            {feedback.message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="studio-secondary-actions">
        <Button
          className="home-action studio-action studio-action--randomize"
          variant="secondary"
          disabled={controlsDisabled || randomizing}
          replacementLabel="MIX IT UP ↗"
          onClick={onRandomize}
          data-cursor="DRESS"
        >
          RANDOMIZE ALL
        </Button>
        <Button
          className="home-action studio-action studio-action--reset"
          variant="tertiary"
          disabled={controlsDisabled}
          replacementLabel="START OVER ↗"
          onClick={onReset}
          data-cursor="SELECT"
        >
          RESET ALL
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
        <Button
          className="home-action home-action--primary studio-action studio-action--publish"
          size="lg"
          loading={publishing}
          disabled={publishDisabled}
          replacementLabel="ENTER THE HALL ↗"
          onClick={onPublish}
          data-cursor="SAVE"
        >
          PUBLISH TO HALL OF FAME
        </Button>
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
