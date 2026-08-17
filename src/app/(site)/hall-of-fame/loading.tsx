import { Skeleton } from "@/components/ui/skeleton";
import { HALL_PAGE_SIZE } from "@/features/hall-of-fame/hall-constants";
import { HallOfFameHero } from "@/features/hall-of-fame/hall-of-fame-hero";

export default function HallLoading() {
  const indexes = Array.from({ length: HALL_PAGE_SIZE }, (_, index) => index);

  return (
    <div className="hall-page hall-loading" aria-label="Loading Hall of Fame">
      <HallOfFameHero />
      <section className="hall-collection">
        <div className="hall-container">
          <header className="hall-grid-system hall-collection__header">
            <h2 className="hall-label">02 · THE OPEN HALL</h2>
          </header>
          <div className="hall-loading__tabs" aria-hidden="true">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
          <div className="hall-grid">
            {indexes.map((index) => (
              <div
                key={index}
                className="hall-look hall-look--grid hall-look--soft"
                aria-hidden="true"
              >
                <Skeleton className="hall-skeleton" />
                <Skeleton className="hall-skeleton__meta" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
