import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for ProductCard component
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      {/* Image Skeleton */}
      <div className="aspect-square p-5">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      <div className="flex-1 p-4">
        {/* Title Skeleton */}
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-3/4" />

        {/* Rating Skeleton */}
        <Skeleton className="mb-2 h-3 w-24" />

        {/* Price Skeleton */}
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="p-4 pt-0">
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}
