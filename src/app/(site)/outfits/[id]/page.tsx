/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getServerEnv } from "@/config/env";
import { findGuest } from "@/features/guest-session/guest-session";
import { getOutfitDetail } from "@/features/outfits/get-outfit-detail";
import { StarRating } from "@/features/ratings/star-rating";
import { ShareActions } from "@/features/sharing/share-actions";
import { DomainError } from "@/server/http/domain-error";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const store = await cookies();
  const guest = await findGuest(
    store.get(getServerEnv().SESSION_COOKIE_NAME)?.value,
  );
  return getOutfitDetail(id, guest?.id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const outfit = await getOutfitDetail((await params).id);
    return {
      title: `Anonymous Look #${outfit.shortCode}`,
      description:
        "Rate this anonymous look and discover more styles in the White Chorus Hall of Fame.",
      openGraph: outfit.socialImageUrl
        ? { images: [outfit.socialImageUrl] }
        : undefined,
      alternates: { canonical: `/outfits/${outfit.id}` },
    };
  } catch {
    return { title: "Look unavailable", robots: { index: false } };
  }
}

export default async function OutfitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  let outfit;
  try {
    outfit = await load(id);
  } catch (error) {
    if (error instanceof DomainError && error.status === 410)
      return (
        <div className="page">
          <section className="empty-state">
            <h1>THIS LOOK HAS LEFT THE STAGE</h1>
            <p>{error.message}</p>
            <Link className="button button--primary button--md" href="/studio">
              CREATE A NEW LOOK
            </Link>
          </section>
        </div>
      );
    notFound();
  }
  return (
    <div className="page detail-page">
      <Link className="back-link" href="/hall-of-fame">
        ← BACK TO HALL OF FAME
      </Link>
      <div className="detail-layout">
        <div className="detail-image">
          {outfit.finalImageUrl ? (
            <img
              src={outfit.finalImageUrl}
              width="1200"
              height="1600"
              alt={`Anonymous White Chorus outfit ${outfit.shortCode}.`}
            />
          ) : (
            <div className="outfit-card__placeholder" aria-hidden="true">
              ♪ ✦
            </div>
          )}
        </div>
        <aside className="detail-panel">
          <p className="eyebrow">Community look</p>
          <h1>ANONYMOUS LOOK #{outfit.shortCode}</h1>
          <p>
            This look stays in the Hall of Fame until{" "}
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(outfit.expiresAt))}
            .
          </p>
          <StarRating
            outfitId={outfit.id}
            initialValue={outfit.viewerRating}
            average={outfit.ratingAverage}
            count={outfit.ratingCount}
            disabled={!outfit.canRate}
          />
          <ShareActions
            outfitId={outfit.id}
            shortCode={outfit.shortCode}
            downloadUrl={outfit.downloadUrl}
            shareUrl={new URL(
              `/outfits/${outfit.id}`,
              getServerEnv().APP_URL,
            ).toString()}
          />
        </aside>
      </div>
    </div>
  );
}
