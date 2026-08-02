"use client";

import { useEffect, useRef } from "react";

import { publicConfig } from "@/config/public-config";

type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback(token: string): void;
      "expired-callback"(): void;
      "error-callback"(): void;
    },
  ): string;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const scriptId = "cloudflare-turnstile-script";

export function TurnstileChallenge({
  onToken,
}: {
  onToken(token: string | null): void;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widgetId: string | undefined;
    const render = () => {
      if (!container.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(container.current, {
        sitekey: publicConfig.turnstileSiteKey,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
    if (window.turnstile) render();
    else script.addEventListener("load", render, { once: true });
    return () => {
      script?.removeEventListener("load", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  if (!publicConfig.turnstileSiteKey)
    return (
      <p role="alert">
        The security challenge is not configured. Please contact support.
      </p>
    );
  return <div ref={container} aria-label="Security challenge" />;
}
