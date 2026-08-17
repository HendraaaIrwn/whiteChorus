import { z } from "zod";

export const dailyWinnerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export type DailyWinnerQuery = z.infer<typeof dailyWinnerQuerySchema>;
