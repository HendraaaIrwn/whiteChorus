import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/config/env";
import {
  getHallOfFamePage,
  hallQuerySchema,
} from "@/features/hall-of-fame/hall-of-fame";
import { requireGuest } from "@/features/guest-session/guest-session";
import {
  publishOutfit,
  publishOutfitSchema,
} from "@/features/outfits/publish-outfit";
import { errorResponse, requestId } from "@/server/http/route-response";
import {
  assertJson,
  assertSameOrigin,
} from "@/server/security/request-security";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const id = requestId(request);
  try {
    const url = new URL(request.url);
    const query = hallQuerySchema.parse({
      sort: url.searchParams.get("sort") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
    });
    return NextResponse.json(
      { ok: true, data: await getHallOfFamePage(query) },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "outfit.list");
  }
}

export async function POST(request: NextRequest) {
  const id = requestId(request);
  try {
    assertSameOrigin(request);
    assertJson(request);
    const guest = await requireGuest(
      request.cookies.get(getServerEnv().SESSION_COOKIE_NAME)?.value,
    );
    const input = publishOutfitSchema.parse(await request.json());
    const data = await publishOutfit(guest.id, input);
    return NextResponse.json(
      { ok: true, data },
      { status: 201, headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "outfit.publish");
  }
}
