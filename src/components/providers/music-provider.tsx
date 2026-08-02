"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { publicConfig } from "@/config/public-config";
import { useHydrated } from "@/lib/use-hydrated";

type MusicContextValue = {
  muted: boolean;
  playbackError: boolean;
  enter(withMusic: boolean): Promise<void>;
  toggle(): Promise<void>;
};

const MusicContext = createContext<MusicContextValue | null>(null);
const STORAGE_KEY = "white-chorus:music-preference";

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hydrated = useHydrated();
  const persistedMuted = useMemo(
    () =>
      hydrated ? window.localStorage.getItem(STORAGE_KEY) !== "playing" : true,
    [hydrated],
  );
  const [mutedOverride, setMuted] = useState<boolean | null>(null);
  const muted = mutedOverride ?? persistedMuted;
  const [playbackError, setPlaybackError] = useState(false);

  const play = useCallback(async () => {
    try {
      await audioRef.current?.play();
      setPlaybackError(false);
    } catch {
      setPlaybackError(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || muted) return;
    const resumeAfterGesture = () => {
      window.removeEventListener("pointerdown", resumeAfterGesture);
      window.removeEventListener("keydown", resumeAfterGesture);
      if (audioRef.current?.paused) void play();
    };
    window.addEventListener("pointerdown", resumeAfterGesture);
    window.addEventListener("keydown", resumeAfterGesture);
    return () => {
      window.removeEventListener("pointerdown", resumeAfterGesture);
      window.removeEventListener("keydown", resumeAfterGesture);
    };
  }, [hydrated, muted, play]);

  const enter = useCallback(
    async (withMusic: boolean) => {
      setMuted(!withMusic);
      window.localStorage.setItem(STORAGE_KEY, withMusic ? "playing" : "muted");
      if (audioRef.current) audioRef.current.muted = !withMusic;
      if (withMusic) await play();
    },
    [play],
  );

  const toggle = useCallback(async () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    window.localStorage.setItem(STORAGE_KEY, nextMuted ? "muted" : "playing");
    if (audioRef.current) audioRef.current.muted = nextMuted;
    if (!nextMuted) await play();
  }, [muted, play]);

  return (
    <MusicContext.Provider value={{ muted, playbackError, enter, toggle }}>
      <audio
        ref={audioRef}
        src="/audio/white-chorus-theme.mp3"
        loop
        preload="none"
        muted={muted}
        onLoadedMetadata={(event) => {
          event.currentTarget.volume = publicConfig.defaultMusicVolume;
        }}
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextValue {
  const value = useContext(MusicContext);
  if (!value) throw new Error("useMusic must be used inside MusicProvider");
  return value;
}
