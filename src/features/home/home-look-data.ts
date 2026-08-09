import type { DressUpConfiguration } from "@/features/dress-up/model";
import type { OutfitCardDTO } from "@/features/outfits/outfit.types";

export type LiveHomeLook = {
  kind: "live";
  id: string;
  outfit: OutfitCardDTO;
};

export type CuratedHomeLook = {
  kind: "curated";
  id: string;
  label: string;
  configuration: DressUpConfiguration;
};

export type HomeLook = LiveHomeLook | CuratedHomeLook;

function curatedConfiguration(
  index: number,
  backgroundId: string,
  onePiece = false,
): DressUpConfiguration {
  const suffix = String((index % 5) + 1).padStart(2, "0");
  const nextSuffix = String(((index + 2) % 5) + 1).padStart(2, "0");

  return {
    version: 1,
    backgroundId,
    characterA: onePiece
      ? {
          hairId: `a-hair-${suffix}`,
          topId: null,
          bottomId: null,
          onePieceId: `a-one-piece-${suffix}`,
          shoesId: `a-shoes-${nextSuffix}`,
          accessoryIds: [],
        }
      : {
          hairId: `a-hair-${suffix}`,
          topId: `a-top-${suffix}`,
          bottomId: `a-bottom-${nextSuffix}`,
          onePieceId: null,
          shoesId: `a-shoes-${suffix}`,
          accessoryIds: [],
        },
    characterB: onePiece
      ? {
          hairId: `b-hair-${nextSuffix}`,
          topId: `b-top-${nextSuffix}`,
          bottomId: `b-bottom-${suffix}`,
          onePieceId: null,
          shoesId: `b-shoes-${suffix}`,
          accessoryIds: [],
        }
      : {
          hairId: `b-hair-${nextSuffix}`,
          topId: null,
          bottomId: null,
          onePieceId: `b-one-piece-${nextSuffix}`,
          shoesId: `b-shoes-${nextSuffix}`,
          accessoryIds: [],
        },
  };
}

export const curatedHomeLooks: CuratedHomeLook[] = [
  ["studio-duet", "STUDIO DUET 01", "background-01", false],
  ["mint-verse", "MINT VERSE 02", "background-02", true],
  ["apricot-riff", "APRICOT RIFF 03", "background-03", false],
  ["blue-chorus", "BLUE CHORUS 04", "background-04", true],
  ["star-stage", "STAR STAGE 05", "background-05", false],
  ["soft-encore", "SOFT ENCORE 06", "background-02", true],
].map(([id, label, backgroundId, onePiece], index) => ({
  kind: "curated" as const,
  id: String(id),
  label: String(label),
  configuration: curatedConfiguration(
    index,
    String(backgroundId),
    Boolean(onePiece),
  ),
}));

export function buildHomeLooks(
  outfits: OutfitCardDTO[],
  winnerShortCode?: string | null,
): HomeLook[] {
  const live: HomeLook[] = outfits
    .filter((outfit) => outfit.shortCode !== winnerShortCode)
    .slice(0, 6)
    .map((outfit) => ({
      kind: "live" as const,
      id: `live-${outfit.id}`,
      outfit,
    }));

  return [...live, ...curatedHomeLooks.slice(0, 6 - live.length)];
}
