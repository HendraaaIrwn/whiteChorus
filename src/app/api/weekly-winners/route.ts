import { NextRequest, NextResponse } from "next/server";

import { listWeeklyWinners } from "@/features/weekly-winners/weekly-winners";
import { errorResponse, requestId } from "@/server/http/route-response";

export async function GET(request: NextRequest) {
  const id = requestId(request);
  try {
    return NextResponse.json(
      { ok: true, data: await listWeeklyWinners() },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "winner.list");
  }
}
