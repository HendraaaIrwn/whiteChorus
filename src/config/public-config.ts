export const publicConfig = {
  appName: "White Chorus",
  defaultMusicVolume: 0.35,
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  assetMode: process.env.NEXT_PUBLIC_ASSET_MODE ?? "fixture",
} as const;
