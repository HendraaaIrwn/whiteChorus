"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Camera, Copy, Download, RefreshCw, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";

type PreviewState =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; file: File; objectUrl: string };

type Feedback = {
  message: string;
  tone: "success" | "error" | "polite";
};

export function ShareActions({
  outfitId,
  shortCode,
  downloadUrl,
  shareImageUrl,
  shareUrl,
  primaryAction = "share",
}: {
  outfitId: string;
  shortCode: string;
  downloadUrl: string;
  shareImageUrl: string;
  shareUrl: string;
  primaryAction?: "share" | "download";
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });
  const [retryVersion, setRetryVersion] = useState(0);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [feedback, setFeedback] = useState<Feedback>({
    message: "",
    tone: "polite",
  });
  const shareText = `Rate White Chorus Look #${shortCode}`;

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    let objectUrl: string | undefined;

    void (async () => {
      try {
        const response = await fetch(shareImageUrl, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("SHARE_IMAGE_UNAVAILABLE");
        const blob = await response.blob();
        if (blob.type && blob.type !== "image/png")
          throw new Error("INVALID_SHARE_IMAGE");
        const file = new File([blob], `white-chorus-${shortCode}.png`, {
          type: "image/png",
        });
        objectUrl = URL.createObjectURL(file);
        if (!controller.signal.aborted)
          setPreview({ status: "ready", file, objectUrl });
      } catch (error) {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        )
          return;
        setPreview({ status: "error" });
        setFeedback({
          message: "The framed image could not load. Try again.",
          tone: "error",
        });
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, retryVersion, shareImageUrl, shortCode]);

  function openShareDialog() {
    setPreview({ status: "loading" });
    setFeedback({ message: "", tone: "polite" });
    setOpen(true);
  }

  function retryPreview() {
    setPreview({ status: "loading" });
    setFeedback({ message: "", tone: "polite" });
    setRetryVersion((current) => current + 1);
  }

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

  function beginProcessing() {
    if (processingRef.current) return false;
    processingRef.current = true;
    setProcessing(true);
    return true;
  }

  function finishProcessing() {
    processingRef.current = false;
    setProcessing(false);
  }

  function saveFramedImage(file: File, objectUrl: string): boolean {
    try {
      if ("download" in HTMLAnchorElement.prototype) {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = file.name;
        document.body.append(link);
        link.click();
        link.remove();
        setFeedback({
          message: "IMAGE SAVED — OPEN INSTAGRAM TO SHARE",
          tone: "success",
        });
        return true;
      }

      const previewWindow = window.open(objectUrl, "_blank");
      if (!previewWindow) throw new Error("PREVIEW_BLOCKED");
      previewWindow.opener = null;
      setFeedback({
        message:
          "The framed image is open. Save it, then upload it in Instagram.",
        tone: "success",
      });
      return true;
    } catch {
      setFeedback({
        message: "The framed image could not be saved. Please try again.",
        tone: "error",
      });
      return false;
    }
  }

  async function shareToInstagram() {
    if (preview.status !== "ready" || !beginProcessing()) return;
    setFeedback({ message: "", tone: "polite" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [preview.file] })) {
        await navigator.share({
          files: [preview.file],
          title: `White Chorus Look #${shortCode}`,
          text: shareText,
          url: shareUrl,
        });
        void record("instagram");
        setOpen(false);
        return;
      }

      if (saveFramedImage(preview.file, preview.objectUrl))
        void record("instagram");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setFeedback({
          message: "Sharing cancelled. Your framed look is still ready.",
          tone: "polite",
        });
      } else if (saveFramedImage(preview.file, preview.objectUrl)) {
        void record("instagram");
      }
    } finally {
      finishProcessing();
    }
  }

  async function copy() {
    if (!beginProcessing()) return;
    try {
      if (!navigator.clipboard)
        throw new Error("Clipboard access is unavailable.");
      await navigator.clipboard.writeText(shareUrl);
      void record("copy-link");
      setFeedback({ message: "LINK COPIED", tone: "success" });
    } catch {
      setFeedback({
        message: "Copy failed. Select the address from your browser instead.",
        tone: "error",
      });
    } finally {
      finishProcessing();
    }
  }

  async function download() {
    try {
      setDownloadMessage("");
      await ensureGuestSession();
      window.location.assign(downloadUrl);
    } catch (error) {
      setDownloadMessage(
        error instanceof Error ? error.message : "Download is unavailable.",
      );
    }
  }

  const platforms = [
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
      "WHATSAPP",
      "whatsapp",
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
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
        onClick={openShareDialog}
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

      <div
        className="share-download-feedback"
        aria-live="polite"
        aria-atomic="true"
      >
        {downloadMessage ? <p>{downloadMessage}</p> : null}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="SHARE YOUR LOOK"
        description="Your framed look is ready for the next stage."
        returnFocusSelector=".share-actions__share"
        className="share-dialog"
        panelClassName="share-dialog__panel"
        lockScroll
      >
        <div className="share-dialog__layout">
          <div
            className="share-dialog__preview"
            data-state={preview.status}
            aria-busy={preview.status === "loading" || undefined}
          >
            {preview.status === "loading" ? (
              <div className="share-dialog__skeleton skeleton">
                <span className="sr-only">Loading framed outfit preview…</span>
              </div>
            ) : null}
            {preview.status === "ready" ? (
              <Image
                src={preview.objectUrl}
                width={720}
                height={1280}
                unoptimized
                alt={`Framed White Chorus Look #${shortCode} ready to share.`}
              />
            ) : null}
            {preview.status === "error" ? (
              <div className="share-dialog__preview-error">
                <span>PREVIEW UNAVAILABLE</span>
                <Button variant="tertiary" onClick={retryPreview}>
                  <RefreshCw aria-hidden="true" /> RETRY
                </Button>
              </div>
            ) : null}
          </div>

          <div className="share-dialog__controls">
            <p className="share-dialog__helper">
              Choose Instagram from your device&apos;s share sheet. If file
              sharing is unavailable, we&apos;ll save the framed image for you.
            </p>
            <div className="share-dialog__primary-actions">
              <Button
                size="lg"
                onClick={() => void shareToInstagram()}
                disabled={preview.status !== "ready" || processing}
                aria-busy={processing || undefined}
                data-cursor="SHARE"
              >
                <Camera aria-hidden="true" />
                {processing ? "PREPARING SHARE…" : "SHARE TO INSTAGRAM"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setOpen(false)}
              >
                CANCEL
              </Button>
            </div>

            <section
              className="share-dialog__more"
              aria-labelledby="share-more-title"
            >
              <h3 id="share-more-title">MORE WAYS TO SHARE</h3>
              <div className="share-dialog__platforms">
                {platforms.map(([label, channel, href]) => (
                  <a
                    key={channel}
                    className="button button--tertiary button--md"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={processing || undefined}
                    data-cursor="SHARE"
                    onClick={(event) => {
                      if (processingRef.current) {
                        event.preventDefault();
                        return;
                      }
                      void record(channel);
                    }}
                  >
                    {label}
                  </a>
                ))}
                <Button
                  variant="tertiary"
                  onClick={() => void copy()}
                  disabled={processing}
                  data-cursor="SHARE"
                >
                  <Copy aria-hidden="true" /> COPY LINK
                </Button>
              </div>
            </section>

            <div
              className="share-feedback"
              data-tone={feedback.tone}
              aria-live="polite"
              aria-atomic="true"
            >
              {feedback.message ? (
                <p>
                  {feedback.tone === "success" ? (
                    <Check aria-hidden="true" size={16} />
                  ) : null}
                  {feedback.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
