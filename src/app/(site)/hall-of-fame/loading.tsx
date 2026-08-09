import { Skeleton } from "@/components/ui/skeleton";
import {
  getHallCardLayout,
  getHallClusterStart,
  HALL_CLUSTER_SIZES,
} from "@/features/hall-of-fame/layout-pattern";

export default function HallLoading() {
  const clusters = HALL_CLUSTER_SIZES.map((size, clusterIndex) => {
    const offset = getHallClusterStart(clusterIndex);
    const indexes = Array.from({ length: size }, (_, index) => offset + index);
    return { clusterIndex, indexes };
  });

  return (
    <div className="hall-page hall-loading" aria-label="Loading Hall of Fame">
      <section className="hall-hero">
        <div className="hall-container hall-loading__hero">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </section>
      <section className="hall-spotlight">
        <div className="hall-container hall-loading__spotlight">
          <Skeleton />
          <Skeleton />
        </div>
      </section>
      <section className="hall-collection">
        <div className="hall-container">
          <div className="hall-loading__intro">
            <Skeleton />
            <Skeleton />
          </div>
          <div className="hall-grid">
            {clusters.map(({ clusterIndex, indexes }) => (
              <section
                key={clusterIndex}
                className={`hall-cluster hall-cluster--${clusterIndex + 1}`}
                aria-hidden="true"
              >
                {indexes.map((index) => {
                  const layout = getHallCardLayout(index);
                  return (
                    <div
                      key={index}
                      className={`hall-look hall-look--${layout.variant} hall-look--${layout.tone}`}
                    >
                      <Skeleton className="hall-skeleton" />
                      <Skeleton className="hall-skeleton__meta" />
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
