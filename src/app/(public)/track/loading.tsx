import React from 'react';
import { SkeletonBox } from '@/components/ui/Skeletons';

/**
 * Route-Specific Skeleton Shimmer cho Tuyến /track (Tra cứu đơn đặt phòng) - CLS = 0
 */
export default function TrackLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        {/* Centered Heading Skeleton */}
        <div className="text-center space-y-3 max-w-md mx-auto">
          <SkeletonBox width="140px" height="16px" rounded="4px" className="mx-auto" />
          <SkeletonBox width="280px" height="36px" rounded="8px" className="mx-auto" />
          <SkeletonBox width="360px" height="18px" rounded="6px" className="mx-auto" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white p-4 rounded-2xl border border-[var(--color-border)] shadow-sm flex gap-3">
          <SkeletonBox height="48px" rounded="12px" className="flex-1" />
          <SkeletonBox width="120px" height="48px" rounded="12px" />
        </div>

        {/* Order Details & Timeline Card Skeleton */}
        <div className="bg-white p-8 rounded-2xl border border-[var(--color-border)] space-y-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
            <div className="space-y-1">
              <SkeletonBox width="160px" height="20px" rounded="6px" />
              <SkeletonBox width="100px" height="14px" rounded="4px" />
            </div>
            <SkeletonBox width="110px" height="28px" rounded="9999px" />
          </div>

          {/* 4 Steps Timeline Skeleton */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="space-y-2 text-center">
                <SkeletonBox width="32px" height="32px" rounded="9999px" className="mx-auto" />
                <SkeletonBox width="70%" height="12px" rounded="4px" className="mx-auto" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
            <SkeletonBox width="100%" height="16px" rounded="4px" />
            <SkeletonBox width="85%" height="16px" rounded="4px" />
          </div>
        </div>
      </div>
    </div>
  );
}
