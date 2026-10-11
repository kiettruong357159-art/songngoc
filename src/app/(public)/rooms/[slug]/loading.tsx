import React from 'react';
import { SkeletonBox } from '@/components/ui/Skeletons';

/**
 * Route-Specific Skeleton Shimmer cho Tuyến /rooms/[slug] (Chi tiết phòng) - CLS = 0
 */
export default function RoomDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10">
      <div className="container mx-auto px-4 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 items-center">
          <SkeletonBox width="80px" height="16px" rounded="4px" />
          <span className="text-gray-300">/</span>
          <SkeletonBox width="100px" height="16px" rounded="4px" />
          <span className="text-gray-300">/</span>
          <SkeletonBox width="160px" height="16px" rounded="4px" />
        </div>

        {/* Room Title & Price Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <SkeletonBox width="340px" height="38px" rounded="8px" />
            <SkeletonBox width="200px" height="20px" rounded="6px" />
          </div>
          <div className="space-y-1 text-right">
            <SkeletonBox width="80px" height="14px" rounded="4px" />
            <SkeletonBox width="160px" height="32px" rounded="8px" />
          </div>
        </div>

        {/* Photo Gallery Grid Skeleton (380px) */}
        <div className="gallery grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ height: '380px' }}>
          <SkeletonBox height="100%" rounded="16px" />
          <SkeletonBox height="100%" rounded="16px" />
          <SkeletonBox height="100%" rounded="16px" />
        </div>

        {/* 2 Columns: Room Details + Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs Badges */}
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-[var(--color-border)]">
              <SkeletonBox width="100px" height="24px" rounded="6px" />
              <SkeletonBox width="100px" height="24px" rounded="6px" />
              <SkeletonBox width="100px" height="24px" rounded="6px" />
            </div>

            {/* Description Lines */}
            <div className="bg-white p-8 rounded-2xl border border-[var(--color-border)] space-y-4">
              <SkeletonBox width="180px" height="24px" rounded="6px" />
              <SkeletonBox width="100%" height="16px" rounded="4px" />
              <SkeletonBox width="95%" height="16px" rounded="4px" />
              <SkeletonBox width="85%" height="16px" rounded="4px" />
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-8 rounded-2xl border border-[var(--color-border)] space-y-4">
              <SkeletonBox width="200px" height="24px" rounded="6px" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {[1, 2, 3, 4, 5, 6].map((a) => (
                  <SkeletonBox key={a} height="36px" rounded="8px" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-6 shadow-md">
              <SkeletonBox width="140px" height="24px" rounded="6px" />
              <div className="space-y-4">
                <SkeletonBox height="46px" rounded="10px" />
                <SkeletonBox height="46px" rounded="10px" />
                <SkeletonBox height="46px" rounded="10px" />
              </div>
              <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                <div className="flex justify-between">
                  <SkeletonBox width="90px" height="16px" rounded="4px" />
                  <SkeletonBox width="110px" height="16px" rounded="4px" />
                </div>
                <div className="flex justify-between">
                  <SkeletonBox width="120px" height="20px" rounded="6px" />
                  <SkeletonBox width="140px" height="24px" rounded="6px" />
                </div>
              </div>
              <SkeletonBox height="50px" rounded="12px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
