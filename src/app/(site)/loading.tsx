import { Skeleton } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="page" aria-label="Loading page">
      <Skeleton className="skeleton-heading" />
      <Skeleton className="skeleton-stage" />
    </div>
  );
}
