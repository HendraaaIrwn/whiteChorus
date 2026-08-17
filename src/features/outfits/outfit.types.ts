export type OutfitCardDTO = {
  id: string;
  shortCode: string;
  thumbnailUrl: string;
  ratingAverage: number;
  ratingCount: number;
  publishedAt: string;
  expiresAt: string;
  remainingDays: number;
  isDailyWinner: boolean;
};

export type HallOutfitCardDTO = OutfitCardDTO & {
  canRate: boolean;
  viewerRating: number | null;
};

export type OutfitDetailDTO = OutfitCardDTO & {
  finalImageUrl: string;
  downloadUrl: string;
  socialImageUrl: string;
  shareImageUrl: string;
  isOwner: boolean;
  canRate: boolean;
  viewerRating: number | null;
};
