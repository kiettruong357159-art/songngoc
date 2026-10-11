import React from 'react';
import { SkeletonBox } from '@/components/ui/Skeletons';

/**
 * Route-Specific Skeleton Shimmer cho Tuyến /booking (Đặt phòng & Thanh toán) - CLS = 0
 */
export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2 max-w-md">
          <SkeletonBox width="120px" height="16px" rounded="4px" />
          <SkeletonBox width="280px" height="36px" rounded="8px" />
          <SkeletonBox width="360px" height="18px" rounded="6px" />
        </div>

        {/* 2 Columns: Form & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Guest Information Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-[var(--color-border)] space-y-6 shadow-sm">
            <SkeletonBox width="220px" height="24px" rounded="6px" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonBox width="100px" height="16px" rounded="4px" />
                <SkeletonBox height="44px" rounded="10px" />
              </div>
              <div className="space-y-2">
                <SkeletonBox width="110px" height="16px" rounded="4px" />
                <SkeletonBox height="44px" rounded="10px" />
              </div>
            </div>
            <div className="space-y-2">
              <SkeletonBox width="90px" height="16px" rounded="4px" />
              <SkeletonBox height="44px" rounded="10px" />
            </div>
            <div className="space-y-2">
              <SkeletonBox width="140px" height="16px" rounded="4px" />
              <SkeletonBox height="80px" rounded="10px" />
            </div>
            <SkeletonBox height="48px" rounded="12px" />
          </div>

          {/* Right Column: Order Summary & VietQR Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-6 shadow-sm">
            <SkeletonBox width="160px" height="22px" rounded="6px" />
            <div className="flex gap-4 items-center">
              <SkeletonBox width="80px" height="60px" rounded="8px" />
              <div className="space-y-2 flex-1">
                <SkeletonBox width="80%" height="18px" rounded="4px" />
                <SkeletonBox width="50%" height="14px" rounded="4px" />
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
              <div className="flex justify-between">
                <SkeletonBox width="100px" height="16px" rounded="4px" />
                <SkeletonBox width="80px" height="16px" rounded="4px" />
              </div>
              <div className="flex justify-between">
                <SkeletonBox width="120px" height="16px" rounded="4px" />
                <SkeletonBox width="90px" height="16px" rounded="4px" />
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[var(--color-border)]">
                <SkeletonBox width="110px" height="20px" rounded="4px" />
                <SkeletonBox width="130px" height="22px" rounded="6px" />
              </div>
            </div>
            <div className="p-4 bg-[var(--color-surface-hover)] rounded-xl space-y-2">
              <SkeletonBox width="100%" height="14px" rounded="4px" />
              <SkeletonBox width="80%" height="14px" rounded="4px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
