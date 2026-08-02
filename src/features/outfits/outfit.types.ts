export type OutfitCardDTO = {
  id: string;
  shortCode: string;
  thumbnailUrl: string;
  ratingAverage: number;
  ratingCount: number;
  publishedAt: string;
  expiresAt: string;
  remainingDays: number;
};

export type OutfitDetailDTO = OutfitCardDTO & {
  finalImageUrl: string;
  downloadUrl: string;
  socialImageUrl: string;
  canRate: boolean;
  viewerRating: number | null;
};
