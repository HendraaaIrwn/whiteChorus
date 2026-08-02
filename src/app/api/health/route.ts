import { NextRequest, NextResponse } from "next/server";

import { hasServerConfiguration } from "@/config/env";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { errorResponse, requestId } from "@/server/http/route-response";

export async function GET(request: NextRequest) {
  const id = requestId(request);
  try {
    if (!hasServerConfiguration())
      throw new DomainError(
        "CONFIGURATION_REQUIRED",
        "The service is not configured.",
        503,
      );
    await getPrisma().$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, data: { status: "healthy" } },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(
      error instanceof DomainError
        ? error
        : new DomainError(
            "DATABASE_UNAVAILABLE",
            "The database is unavailable.",
            503,
          ),
      id,
      "health.check",
    );
  }
}
