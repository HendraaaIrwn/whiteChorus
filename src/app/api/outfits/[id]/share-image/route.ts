import { NextRequest } from "next/server";

import { getShareImage } from "@/features/sharing/share-image";
import { errorResponse, requestId } from "@/server/http/route-response";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = requestId(request);
  try {
    const result = await getShareImage((await params).id);
    const remainingSeconds = Math.max(
      1,
      Math.floor((result.expiresAt.getTime() - Date.now()) / 1000),
    );
    const maxAge = Math.min(3600, remainingSeconds);
    const filenameCode = result.shortCode.replace(/[^A-Z0-9_-]/gi, "");
    return new Response(Uint8Array.from(result.image), {
      headers: {
        "cache-control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
        "content-disposition": `inline; filename="white-chorus-look-${filenameCode}.png"`,
        "content-type": "image/png",
        "x-request-id": id,
      },
    });
  } catch (error) {
    return errorResponse(error, id, "outfit.share-image");
  }
}
