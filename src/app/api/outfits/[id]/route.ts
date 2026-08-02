import { NextRequest, NextResponse } from "next/server";

import { getOutfitDetail } from "@/features/outfits/get-outfit-detail";
import { errorResponse, requestId } from "@/server/http/route-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = requestId(request);
  try {
    return NextResponse.json(
      { ok: true, data: await getOutfitDetail((await params).id) },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "outfit.detail");
  }
}
