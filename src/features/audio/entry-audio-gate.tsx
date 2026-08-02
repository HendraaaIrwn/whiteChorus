"use client";

import { useRouter } from "next/navigation";

import { useMusic } from "@/components/providers/music-provider";
import { Button } from "@/components/ui/button";
import { ensureGuestSession } from "@/features/guest-session/ensure-guest-session";

export function EntryAudioGate() {
  const router = useRouter();
  const { enter } = useMusic();

  async function start(withMusic: boolean) {
    await ensureGuestSession().catch(() => undefined);
    await enter(withMusic);
    router.push("/studio");
  }

  return (
    <div className="entry-actions" aria-label="Enter White Chorus">
      <Button size="lg" onClick={() => void start(true)}>
        ENTER WITH MUSIC
      </Button>
      <Button size="lg" variant="tertiary" onClick={() => void start(false)}>
        ENTER SILENTLY
      </Button>
    </div>
  );
}
