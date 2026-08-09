"use client";

import Link from "next/link";

export function getHallPaginationHref(sort: string, page: number) {
  return `/hall-of-fame?sort=${sort}&page=${page}`;
}

export function Pagination({
  page,
  totalPages,
  sort,
  onNavigate,
}: {
  page: number;
  totalPages: number;
  sort: string;
  onNavigate?: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Hall of Fame pages">
      {page <= 1 ? (
        <span aria-disabled="true">← PREVIOUS</span>
      ) : (
        <Link
          href={getHallPaginationHref(sort, page - 1)}
          prefetch={false}
          scroll={false}
          data-cursor="OPEN"
          onClick={onNavigate}
        >
          <span aria-hidden="true">←</span> PREVIOUS
        </Link>
      )}
      <span>
        {String(page).padStart(2, "0")} OF {String(totalPages).padStart(2, "0")}
      </span>
      {page >= totalPages ? (
        <span aria-disabled="true">NEXT →</span>
      ) : (
        <Link
          href={getHallPaginationHref(sort, page + 1)}
          prefetch={false}
          scroll={false}
          data-cursor="OPEN"
          onClick={onNavigate}
        >
          NEXT <span aria-hidden="true">→</span>
        </Link>
      )}
    </nav>
  );
}
