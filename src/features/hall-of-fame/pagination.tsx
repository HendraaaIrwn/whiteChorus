import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  sort,
}: {
  page: number;
  totalPages: number;
  sort: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Hall of Fame pages">
      {page <= 1 ? (
        <span aria-disabled="true">PREVIOUS</span>
      ) : (
        <Link href={`/hall-of-fame?sort=${sort}&page=${page - 1}`}>
          PREVIOUS
        </Link>
      )}
      <span>
        {page} OF {totalPages}
      </span>
      {page >= totalPages ? (
        <span aria-disabled="true">NEXT</span>
      ) : (
        <Link href={`/hall-of-fame?sort=${sort}&page=${page + 1}`}>NEXT</Link>
      )}
    </nav>
  );
}
