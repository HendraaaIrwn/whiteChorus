import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/config/env";
import { cleanupOutfits } from "@/features/outfits/cleanup-outfits";
import { DomainError } from "@/server/http/domain-error";
import { errorResponse, requestId } from "@/server/http/route-response";
import { secretsMatch } from "@/server/security/request-security";

async function handle(request: NextRequest) {
  const id = requestId(request);
  try {
    if (
      !secretsMatch(
        request.headers.get("authorization")?.replace(/^Bearer /, "") ?? null,
        getServerEnv().CRON_SECRET,
      )
    )
      throw new DomainError("UNAUTHORIZED", "Unauthorized.", 401);
    return NextResponse.json(
      { ok: true, data: await cleanupOutfits() },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "cron.expire");
  }
}

export const GET = handle;
export const POST = handle;
