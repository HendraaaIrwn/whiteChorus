import { Skeleton } from "@/components/ui/skeleton";

export default function HallLoading() {
  return (
    <div className="page hall-grid">
      {Array.from({ length: 9 }, (_, index) => (
        <Skeleton key={index} className="hall-skeleton" />
      ))}
    </div>
  );
}
