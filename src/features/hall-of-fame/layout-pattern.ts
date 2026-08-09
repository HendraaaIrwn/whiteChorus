export type HallLookVariant =
  "large" | "portrait" | "compact" | "wide" | "feature";

export type HallLookTone = "aqua" | "pink" | "orange" | "primary" | "soft";

export type HallLookLayout = {
  tone: HallLookTone;
  variant: HallLookVariant;
};

export const HALL_CLUSTER_SIZES = [2, 2, 2, 2, 1] as const;

export const HALL_CARD_PATTERN: readonly HallLookLayout[] = [
  { variant: "large", tone: "aqua" },
  { variant: "portrait", tone: "pink" },
  { variant: "compact", tone: "orange" },
  { variant: "wide", tone: "primary" },
  { variant: "portrait", tone: "soft" },
  { variant: "large", tone: "aqua" },
  { variant: "wide", tone: "pink" },
  { variant: "compact", tone: "orange" },
  { variant: "feature", tone: "primary" },
] as const;

export const RELATED_LOOK_PATTERN: readonly HallLookLayout[] = [
  { variant: "large", tone: "aqua" },
  { variant: "compact", tone: "pink" },
  { variant: "wide", tone: "primary" },
] as const;

export function getHallClusterStart(clusterIndex: number): number {
  return HALL_CLUSTER_SIZES.slice(0, clusterIndex).reduce(
    (total, size) => total + size,
    0,
  );
}

export function getHallCardLayout(index: number): HallLookLayout {
  return HALL_CARD_PATTERN[index % HALL_CARD_PATTERN.length]!;
}

export function getRelatedLookLayout(index: number): HallLookLayout {
  return RELATED_LOOK_PATTERN[index % RELATED_LOOK_PATTERN.length]!;
}
