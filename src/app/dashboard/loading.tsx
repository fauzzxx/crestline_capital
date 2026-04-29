import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="section-container pb-20">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-72 mb-3" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-16 w-28" />
          <Skeleton className="h-16 w-28" />
        </div>
      </div>
      <Skeleton className="h-32 w-full mb-12 rounded-xl" />
      <div className="mb-20">
        <Skeleton className="h-7 w-56 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
