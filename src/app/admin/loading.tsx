import React from 'react';
import { AdminDashboardSkeleton } from '@/components/ui/Skeletons';

/**
 * Route-Specific Skeleton Shimmer cho Tuyến /admin (Cổng Quản trị PMS) - CLS = 0 & Chống FOUC
 */
export default function AdminLoading() {
  return (
    <div className="w-full">
      <AdminDashboardSkeleton />
    </div>
  );
}
