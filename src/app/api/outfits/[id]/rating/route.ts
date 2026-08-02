import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/config/env";
import { requireGuest } from "@/features/guest-session/guest-session";
import { ratingSchema, upsertRating } from "@/features/ratings/upsert-rating";
import { errorResponse, requestId } from "@/server/http/route-response";
import {
  assertJson,
  assertSameOrigin,
} from "@/server/security/request-security";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = requestId(request);
  try {
    assertSameOrigin(request);
    assertJson(request);
    const guest = await requireGuest(
      request.cookies.get(getServerEnv().SESSION_COOKIE_NAME)?.value,
    );
    const input = ratingSchema.parse(await request.json());
    return NextResponse.json(
      {
        ok: true,
        data: await upsertRating((await params).id, guest.id, input.value),
      },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "rating.upsert");
  }
}
