import { Skeleton } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="page site-loading" aria-label="Loading page">
      <Skeleton className="skeleton-heading" />
      <Skeleton className="skeleton-stage" />
    </div>
  );
}
