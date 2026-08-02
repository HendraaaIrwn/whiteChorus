import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { log } from "@/server/observability/logger";
import { DomainError } from "@/server/http/domain-error";

export function requestId(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && /^[A-Za-z0-9._-]{1,128}$/.test(supplied)
    ? supplied
    : randomUUID();
}

export function errorResponse(
  error: unknown,
  id: string,
  operation: string,
): NextResponse {
  const domain =
    error instanceof DomainError
      ? error
      : error instanceof ZodError
        ? new DomainError("INVALID_REQUEST", "The request was not valid.", 400)
        : error instanceof Error && error.message === "INVALID_ORIGIN"
          ? new DomainError(
              "INVALID_ORIGIN",
              "This request is not allowed.",
              403,
            )
          : error instanceof Error && error.message === "INVALID_CONTENT_TYPE"
            ? new DomainError(
                "INVALID_CONTENT_TYPE",
                "Send this request as JSON.",
                415,
              )
            : new DomainError(
                "INTERNAL_ERROR",
                "Something went wrong. Please try again.",
                500,
              );

  log({ requestId: id, operation, result: "failure", errorCode: domain.code });
  return NextResponse.json(
    {
      ok: false,
      error: { code: domain.code, message: domain.message, requestId: id },
    },
    { status: domain.status, headers: { "x-request-id": id } },
  );
}
