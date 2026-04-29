import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
  return (
    <div className="section-container">
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-10 w-2/3 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-10" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="aspect-video rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    </div>
  );
}
