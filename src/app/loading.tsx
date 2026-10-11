export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="container mx-auto px-4 space-y-10">
        {/* Hero / Banner Skeleton */}
        <div className="skeleton-shimmer h-64 w-full rounded-2xl shadow-sm" />

        {/* Section Title Skeleton */}
        <div className="space-y-3 max-w-md">
          <div className="skeleton-shimmer h-8 w-3/4 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[var(--color-border)] p-4 space-y-4 shadow-sm"
            >
              {/* Image box skeleton */}
              <div className="skeleton-shimmer h-48 w-full rounded-xl" />
              {/* Text content skeleton */}
              <div className="space-y-2">
                <div className="skeleton-shimmer h-5 w-4/5 rounded-md" />
                <div className="skeleton-shimmer h-4 w-3/5 rounded-md" />
              </div>
              {/* Action / price row skeleton */}
              <div className="flex items-center justify-between pt-2">
                <div className="skeleton-shimmer h-6 w-24 rounded-md" />
                <div className="skeleton-shimmer h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
