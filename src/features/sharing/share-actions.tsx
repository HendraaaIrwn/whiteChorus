"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Share2 } from "lucide-react";

import { useHydratedReducedMotion } from "@/components/motion/use-hydrated-reduced-motion";
import { Button } from "@/components/ui/button";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";

export function ShareActions({
  outfitId,
  shortCode,
  downloadUrl,
  shareUrl,
  primaryAction = "share",
}: {
  outfitId: string;
  shortCode: string;
  downloadUrl: string;
  shareUrl: string;
  primaryAction?: "share" | "download";
}) {
  const reduceMotion = useHydratedReducedMotion();
  const [message, setMessage] = useState("");
  const shareText = `Rate White Chorus Look #${shortCode}`;

  async function record(channel: string) {
    try {
      await ensureGuestSession();
      await fetch(`/api/outfits/${outfitId}/share`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channel }),
        keepalive: true,
      });
    } catch {
      // Sharing should still work if analytics is temporarily unavailable.
    }
  }
  async function share() {
    if (navigator.share) {
      void record("native-share");
      try {
        await navigator.share({
          title: `White Chorus Look #${shortCode}`,
          text: "Rate this anonymous White Chorus look.",
          url: shareUrl,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setMessage("Sharing is unavailable. Copy the link instead.");
      }
    } else {
      await copy();
    }
  }
  async function copy() {
    try {
      if (!navigator.clipboard)
        throw new Error("Clipboard access is unavailable.");
      await navigator.clipboard.writeText(shareUrl);
      await record("copy-link");
      setMessage("Link copied.");
    } catch {
      setMessage("Copy failed. Select the address from your browser instead.");
    }
  }
  async function download() {
    try {
      await ensureGuestSession();
      window.location.assign(downloadUrl);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Download is unavailable.",
      );
    }
  }

  const platforms = [
    [
      "WHATSAPP",
      "whatsapp",
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    ],
    [
      "FACEBOOK",
      "facebook",
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    ],
    [
      "X",
      "x",
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    ],
    [
      "TELEGRAM",
      "telegram",
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    ],
  ] as const;

  return (
    <div className="share-actions" data-primary-action={primaryAction}>
      {primaryAction === "download" ? (
        <Button
          className="share-actions__download"
          onClick={() => void download()}
          data-cursor="OPEN"
        >
          <Download aria-hidden="true" /> DOWNLOAD IMAGE
        </Button>
      ) : null}
      <Button
        className="share-actions__share"
        variant="secondary"
        onClick={() => void share()}
        data-cursor="SHARE"
      >
        <Share2 aria-hidden="true" /> SHARE OUTFIT
      </Button>
      {primaryAction === "share" ? (
        <Button
          className="share-actions__download"
          variant="tertiary"
          onClick={() => void download()}
          data-cursor="OPEN"
        >
          <Download aria-hidden="true" /> DOWNLOAD IMAGE
        </Button>
      ) : null}
      <details className="share-disclosure">
        <summary data-cursor="SHARE">
          MORE WAYS TO SHARE <span aria-hidden="true">+</span>
        </summary>
        <div className="share-disclosure__content">
          <Button
            variant="tertiary"
            onClick={() => void copy()}
            data-cursor="SHARE"
          >
            <Copy aria-hidden="true" /> COPY LINK
          </Button>
          <div className="share-platforms">
            {platforms.map(([label, channel, href]) => (
              <a
                key={channel}
                className="button button--tertiary button--md"
                href={href}
                target="_blank"
                rel="noreferrer"
                data-cursor="SHARE"
                onClick={() => void record(channel)}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </details>
      <div className="share-feedback" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false} mode="wait">
          {message ? (
            <motion.p
              key={message}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
            >
              <Check aria-hidden="true" size={16} /> {message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
