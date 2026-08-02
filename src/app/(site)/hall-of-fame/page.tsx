import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import {
  getHallOfFamePage,
  hallQuerySchema,
} from "@/features/hall-of-fame/hall-of-fame";
import { OutfitCard } from "@/features/hall-of-fame/outfit-card";
import { Pagination } from "@/features/hall-of-fame/pagination";

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
    <div className="page">
      <header className="hall-heading">
        <div>
          <p className="eyebrow">Community spotlight</p>
          <h1>HALL OF FAME</h1>
          <p>Fresh looks live for seven days. Stars decide who rises.</p>
        </div>
        <span aria-hidden="true">★</span>
      </header>
      <nav className="sort-tabs" aria-label="Sort Hall of Fame">
        {[
          ["newest", "NEWEST"],
          ["top-rated", "TOP RATED"],
          ["trending", "TRENDING"],
        ].map(([value, label]) => (
          <Link
            key={value}
            aria-current={query.sort === value ? "page" : undefined}
            href={`/hall-of-fame?sort=${value}&page=1`}
          >
            {label}
          </Link>
        ))}
        <Link href="/weekly-winners">WEEKLY WINNERS</Link>
      </nav>
      {result.items.length ? (
        <div className="hall-grid">
          {result.items.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
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
    </div>
  );
}
