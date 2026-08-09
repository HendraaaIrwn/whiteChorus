import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getServerEnv } from "@/config/env";
import { productionAssets } from "@/features/dress-up/catalog";
import { findGuest } from "@/features/guest-session/guest-session";
import { getRelatedOutfits } from "@/features/hall-of-fame/hall-of-fame";
import { CustomCursor } from "@/features/home/home-motion";
import { getOutfitDetail } from "@/features/outfits/get-outfit-detail";
import { LookDetail } from "@/features/outfits/look-detail";
import { RelatedLooks } from "@/features/outfits/related-looks";
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
      openGraph: {
        images: [outfit.socialImageUrl || productionAssets.defaultSocialPath],
      },
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
    if (error instanceof DomainError && error.status === 410) {
      return (
        <div className="hall-page look-detail-page look-detail-state-page">
          <CustomCursor scope="hall" />
          <section
            className="look-detail-state"
            aria-labelledby="look-expired-title"
          >
            <span className="look-detail-state__label">THE SEVEN-DAY RUN</span>
            <h1 id="look-expired-title">THIS LOOK HAS LEFT THE STAGE.</h1>
            <p>{error.message}</p>
            <div className="look-detail-state__actions">
              <Link
                className="button button--primary button--md"
                href="/hall-of-fame"
                data-cursor="OPEN"
              >
                EXPLORE THE HALL
              </Link>
              <Link
                className="look-detail-state__link"
                href="/studio"
                data-cursor="DRESS"
              >
                CREATE A NEW LOOK ↗
              </Link>
            </div>
          </section>
        </div>
      );
    }
    if (error instanceof DomainError && error.status === 404) notFound();
    throw error;
  }
  const related = await getRelatedOutfits(outfit.id).catch(() => []);
  const shareUrl = new URL(
    `/outfits/${outfit.id}`,
    getServerEnv().APP_URL,
  ).toString();

  return (
    <div className="hall-page look-detail-page" data-look-detail-page>
      <CustomCursor scope="hall" />
      <LookDetail outfit={outfit} shareUrl={shareUrl} />
      <RelatedLooks outfits={related} />
    </div>
  );
}
