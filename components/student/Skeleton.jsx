export function Skeleton({ className = "" }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}