import { NextRequest, NextResponse } from "next/server";

import {
  getDailyWinnersOverview,
  getLiveDailyRanking,
} from "@/features/daily-winners/daily-winners";
import { dailyWinnerQuerySchema } from "@/features/daily-winners/daily-winner-query";
import { errorResponse, requestId } from "@/server/http/route-response";

export async function GET(request: NextRequest) {
  const id = requestId(request);
  try {
    const now = new Date();
    const url = new URL(request.url);
    const query = dailyWinnerQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
    });
    const [overview, ranking] = await Promise.all([
      getDailyWinnersOverview(now).catch(() => ({
        latestWinner: null,
        completedDays: [],
      })),
      getLiveDailyRanking({ now, page: query.page }),
    ]);
    return NextResponse.json(
      { ok: true, data: { ...overview, ranking } },
      {
        headers: {
          "cache-control": "no-store",
          "x-request-id": id,
        },
      },
    );
  } catch (error) {
    return errorResponse(error, id, "daily-winner.list");
  }
}
