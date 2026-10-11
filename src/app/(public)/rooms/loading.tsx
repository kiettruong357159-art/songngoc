import React from 'react';
import { SkeletonBox, RoomCardSkeleton } from '@/components/ui/Skeletons';

/**
 * Route-Specific Skeleton Shimmer cho Tuyến /rooms (Danh mục phòng) - CLS = 0
 */
export default function RoomsLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10">
      <div className="container mx-auto px-4 space-y-8">
        {/* Breadcrumb & Heading Skeleton */}
        <div className="space-y-3 max-w-lg">
          <SkeletonBox width="140px" height="16px" rounded="4px" />
          <SkeletonBox width="320px" height="36px" rounded="8px" />
          <SkeletonBox width="420px" height="18px" rounded="6px" />
        </div>

        {/* Floating Filter / Date Bar Skeleton */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SkeletonBox height="46px" rounded="10px" />
          <SkeletonBox height="46px" rounded="10px" />
          <SkeletonBox height="46px" rounded="10px" />
          <SkeletonBox height="46px" rounded="10px" />
          <SkeletonBox height="46px" rounded="10px" />
        </div>

        {/* Room Cards Grid Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
