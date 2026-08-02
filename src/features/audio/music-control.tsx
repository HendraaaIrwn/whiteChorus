"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";

import { useMusic } from "@/components/providers/music-provider";

export function MusicControl() {
  const { muted, playbackError, toggle } = useMusic();
  const label = playbackError
    ? "Music unavailable"
    : muted
      ? "Play background music"
      : "Mute background music";

  return (
    <button
      className="music-control"
      type="button"
      onClick={() => void toggle()}
      aria-label={label}
    >
      {playbackError ? (
        <Music2 aria-hidden="true" />
      ) : muted ? (
        <VolumeX aria-hidden="true" />
      ) : (
        <Volume2 aria-hidden="true" />
      )}
      <span>
        {playbackError ? "UNAVAILABLE" : muted ? "MUSIC OFF" : "MUSIC ON"}
      </span>
    </button>
  );
}
