import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/config/env";
import { createOrRestoreGuest } from "@/features/guest-session/guest-session";
import { errorResponse, requestId } from "@/server/http/route-response";
import {
  assertJson,
  assertSameOrigin,
} from "@/server/security/request-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const id = requestId(request);
  try {
    assertSameOrigin(request);
    assertJson(request);
    const env = getServerEnv();
    const result = await createOrRestoreGuest(
      request.cookies.get(env.SESSION_COOKIE_NAME)?.value,
      request,
    );
    const response = NextResponse.json(
      { ok: true, data: { expiresAt: result.guest.expiresAt.toISOString() } },
      { headers: { "x-request-id": id } },
    );
    if (result.rawToken) {
      response.cookies.set(env.SESSION_COOKIE_NAME, result.rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: env.SESSION_MAX_AGE_SECONDS,
      });
    }
    return response;
  } catch (error) {
    return errorResponse(error, id, "guest.session");
  }
}
