"use client";

import { useEffect, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
} from "@rive-app/react-webgl2";

RuntimeLoader.setWasmUrl("/animations/rive.wasm");

type RiveAvatarCanvasProps = {
  active: boolean;
  onFailure: () => void;
};

export function RiveAvatarCanvas({ active, onFailure }: RiveAvatarCanvasProps) {
  const [ready, setReady] = useState(false);
  const { rive, RiveComponent } = useRive(
    {
      src: "/animations/rive-avatars.riv",
      artboard: "Avatar 3",
      autoplay: false,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => setReady(true),
      onLoadError: onFailure,
    },
    { shouldUseIntersectionObserver: true },
  );

  useEffect(() => {
    if (!rive) return;

    if (active) rive.play();
    else rive.pause();

    return () => rive.pause();
  }, [active, rive]);

  function replay() {
    if (!rive) return;
    rive.reset();
    rive.play();
  }

  return (
    <button
      aria-label="Replay the animated guest avatar"
      className={ready ? "rive-avatar-canvas is-ready" : "rive-avatar-canvas"}
      onClick={replay}
      type="button"
    >
      <RiveComponent aria-hidden="true" />
    </button>
  );
}
