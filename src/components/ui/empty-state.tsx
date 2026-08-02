import Link from "next/link";
import { Star } from "lucide-react";

export function EmptyState({
  title = "No looks are here yet.",
  body = "Be the first to join the Hall of Fame.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="empty-state">
      <Star aria-hidden="true" size={44} />
      <h2>{title}</h2>
      <p>{body}</p>
      <Link className="button button--primary button--md" href="/studio">
        START DRESSING
      </Link>
    </section>
  );
}
