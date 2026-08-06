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
}: {
  outfitId: string;
  shortCode: string;
  downloadUrl: string;
  shareUrl: string;
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
    await navigator.clipboard.writeText(shareUrl);
    await record("copy-link");
    setMessage("Link copied.");
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
    <div className="share-actions">
      <Button variant="secondary" onClick={() => void share()}>
        <Share2 aria-hidden="true" /> SHARE OUTFIT
      </Button>
      <Button variant="tertiary" onClick={() => void copy()}>
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
            onClick={() => void record(channel)}
          >
            {label}
          </a>
        ))}
      </div>
      <Button variant="tertiary" onClick={() => void download()}>
        <Download aria-hidden="true" /> DOWNLOAD IMAGE
      </Button>
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
