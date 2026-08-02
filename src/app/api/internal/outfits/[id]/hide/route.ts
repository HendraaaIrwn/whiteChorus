import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerEnv } from "@/config/env";
import { getPrisma } from "@/server/database/prisma";
import { DomainError } from "@/server/http/domain-error";
import { errorResponse, requestId } from "@/server/http/route-response";
import { assertJson, secretsMatch } from "@/server/security/request-security";

const operatorSchema = z
  .object({
    action: z.enum(["hide", "restore", "disqualify"]),
    reason: z.string().max(128).optional(),
  })
  .strict();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = requestId(request);
  try {
    if (
      !secretsMatch(
        request.headers.get("x-internal-secret"),
        getServerEnv().INTERNAL_ADMIN_SECRET,
      )
    )
      throw new DomainError("UNAUTHORIZED", "Unauthorized.", 401);
    assertJson(request);
    const input = operatorSchema.parse(await request.json());
    const outfitId = (await params).id;
    const current = await getPrisma().outfit.findUnique({
      where: { id: outfitId },
      select: { status: true, expiresAt: true },
    });
    if (!current)
      throw new DomainError(
        "OUTFIT_NOT_FOUND",
        "This look could not be found.",
        404,
      );
    const allowed =
      (input.action === "hide" && current.status === "PUBLISHED") ||
      (input.action === "restore" && current.status === "HIDDEN") ||
      (input.action === "disqualify" &&
        ["PUBLISHED", "HIDDEN"].includes(current.status));
    if (!allowed)
      throw new DomainError(
        "INVALID_OUTFIT_STATE",
        "This action is not valid for the current outfit state.",
        409,
      );
    if (
      input.action === "restore" &&
      (!current.expiresAt || current.expiresAt <= new Date())
    )
      throw new DomainError(
        "OUTFIT_EXPIRED",
        "An expired look cannot be restored.",
        409,
      );
    const data =
      input.action === "hide"
        ? {
            status: "HIDDEN" as const,
            hiddenAt: new Date(),
            hiddenReason: input.reason ?? "OPERATOR_HIDDEN",
          }
        : input.action === "restore"
          ? { status: "PUBLISHED" as const, hiddenAt: null, hiddenReason: null }
          : {
              isCompetitionEligible: false,
              hiddenReason: input.reason ?? "COMPETITION_DISQUALIFIED",
            };
    const outfit = await getPrisma().outfit.update({
      where: { id: outfitId },
      data,
      select: { id: true, status: true, isCompetitionEligible: true },
    });
    return NextResponse.json(
      { ok: true, data: outfit },
      { headers: { "x-request-id": id } },
    );
  } catch (error) {
    return errorResponse(error, id, "operator.outfit");
  }
}
