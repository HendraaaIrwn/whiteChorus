import { NextRequest, NextResponse } from "next/server";

import {
  getLiveDailyRanking,
  listDailyWinners,
} from "@/features/daily-winners/daily-winners";
import { errorResponse, requestId } from "@/server/http/route-response";

export async function GET(request: NextRequest) {
  const id = requestId(request);
  try {
    const [winners, ranking] = await Promise.all([
      listDailyWinners().catch(() => []),
      getLiveDailyRanking(),
    ]);
    return NextResponse.json(
      { ok: true, data: { winners, ranking } },
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
