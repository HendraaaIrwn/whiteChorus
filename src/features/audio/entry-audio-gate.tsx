"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMusic } from "@/components/providers/music-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";

export function EntryAudioGate({
  triggerClassName,
  triggerLabel = "START DRESSING",
}: {
  triggerClassName?: string;
  triggerLabel?: string;
} = {}) {
  const router = useRouter();
  const { enter } = useMusic();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function start(withMusic: boolean) {
    setBusy(true);
    await ensureGuestSession().catch(() => undefined);
    await enter(withMusic);
    router.push("/studio");
  }

  return (
    <>
      <Button
        className={triggerClassName}
        size="lg"
        onClick={(event) => {
          event.currentTarget.focus();
          setOpen(true);
        }}
      >
        <span className="entry-audio-gate__label">{triggerLabel}</span>
        <span className="entry-audio-gate__hover" aria-hidden="true">
          {triggerLabel} →
        </span>
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="HOW SHOULD THE CHORUS BEGIN?"
        description="Choose whether the studio opens with background music. You can change this at any time from the header."
      >
        <div className="entry-actions" aria-label="Enter White Chorus">
          <Button size="lg" disabled={busy} onClick={() => void start(true)}>
            {busy ? "OPENING STUDIO…" : "ENTER WITH MUSIC"}
          </Button>
          <Button
            size="lg"
            variant="tertiary"
            disabled={busy}
            onClick={() => void start(false)}
          >
            ENTER SILENTLY
          </Button>
        </div>
      </Dialog>
    </>
  );
}
