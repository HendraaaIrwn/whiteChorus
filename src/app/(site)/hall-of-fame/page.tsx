import type { Metadata } from "next";

import {
  MotionPage,
  RevealHeader,
} from "@/components/motion/motion-primitives";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getHallOfFamePage,
  hallQuerySchema,
} from "@/features/hall-of-fame/hall-of-fame";
import { OutfitCard } from "@/features/hall-of-fame/outfit-card";
import { Pagination } from "@/features/hall-of-fame/pagination";
import { SortTabs } from "@/features/hall-of-fame/sort-tabs";

export const metadata: Metadata = {
  title: "Hall of Fame",
  description:
    "Discover the newest, highest-rated, and trending anonymous looks.",
  alternates: { canonical: "/hall-of-fame" },
};
export const dynamic = "force-dynamic";

export default async function HallOfFamePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = hallQuerySchema.parse(await searchParams);
  const result = await getHallOfFamePage(query);
  return (
    <MotionPage className="page">
      <RevealHeader className="hall-heading" inView={false}>
        <div>
          <p className="eyebrow">Community spotlight</p>
          <h1>HALL OF FAME</h1>
          <p>Fresh looks live for seven days. Stars decide who rises.</p>
        </div>
        <span aria-hidden="true">★</span>
      </RevealHeader>
      <SortTabs activeSort={query.sort} />
      {result.items.length ? (
        <div className="hall-grid">
          {result.items.map((outfit, index) => (
            <OutfitCard key={outfit.id} outfit={outfit} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <Pagination
        page={result.pagination.page}
        totalPages={result.pagination.totalPages}
        sort={query.sort}
      />
    </MotionPage>
  );
}
