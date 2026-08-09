import { Skeleton } from "@/components/ui/skeleton";

export default function LookDetailLoading() {
  return (
    <div
      className="hall-page look-detail-page look-detail-loading"
      aria-label="Loading look"
    >
      <section className="look-detail__hero">
        <div className="look-detail__container look-detail__grid">
          <Skeleton className="look-detail-loading__back" />
          <Skeleton className="look-detail-loading__stage" />
          <aside
            className="look-detail-loading__information"
            aria-hidden="true"
          >
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </aside>
        </div>
      </section>
      <section className="look-detail__related" aria-hidden="true">
        <div className="look-detail__container">
          <div className="look-detail-loading__related-heading">
            <Skeleton />
            <Skeleton />
          </div>
          <div className="look-detail-loading__related-grid">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
