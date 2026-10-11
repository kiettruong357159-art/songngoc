'use client';

import React from 'react';

export interface SkeletonBoxProps {
  width?: string | number;
  height?: string | number;
  rounded?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Khối nguyên tử Skeleton với hiệu ứng Shimmer sang trọng
 */
export function SkeletonBox({
  width = '100%',
  height = '1rem',
  rounded = 'var(--radius-md)',
  className = '',
  style = {},
}: SkeletonBoxProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded,
        ...style,
      }}
    />
  );
}

/**
 * Skeleton Card phòng cho Danh sách phòng (/rooms) - CLS = 0
 */
export function RoomCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2"
      style={{ minHeight: '320px' }}
    >
      {/* Cột trái: Ảnh phòng */}
      <div className="relative h-64 md:h-full bg-[var(--color-surface-hover)] skeleton-shimmer">
        <div className="absolute top-4 left-4 flex gap-2">
          <SkeletonBox width="140px" height="26px" rounded="9999px" />
        </div>
      </div>

      {/* Cột phải: Thông tin phòng */}
      <div className="p-6 md:p-8 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <SkeletonBox width="60%" height="28px" rounded="8px" />
          <SkeletonBox width="90%" height="16px" rounded="6px" />
          <SkeletonBox width="75%" height="16px" rounded="6px" />

          {/* Tiện ích icon */}
          <div className="flex gap-4 pt-3">
            <SkeletonBox width="80px" height="20px" rounded="6px" />
            <SkeletonBox width="70px" height="20px" rounded="6px" />
            <SkeletonBox width="60px" height="20px" rounded="6px" />
          </div>
        </div>

        {/* Giá & Nút CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <div className="space-y-1">
            <SkeletonBox width="50px" height="12px" rounded="4px" />
            <SkeletonBox width="110px" height="24px" rounded="6px" />
          </div>
          <SkeletonBox width="130px" height="42px" rounded="12px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Tổng quan Quản trị (/admin) - Chống FOUC & CLS = 0
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <SkeletonBox width="260px" height="32px" rounded="8px" />
          <SkeletonBox width="380px" height="18px" rounded="6px" />
        </div>
        <div className="flex gap-3">
          <SkeletonBox width="130px" height="40px" rounded="10px" />
          <SkeletonBox width="140px" height="40px" rounded="10px" />
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <SkeletonBox width="100px" height="16px" rounded="4px" />
              <SkeletonBox width="36px" height="36px" rounded="10px" />
            </div>
            <SkeletonBox width="140px" height="32px" rounded="8px" />
            <SkeletonBox width="70%" height="14px" rounded="4px" />
          </div>
        ))}
      </div>

      {/* PMS Room Rack / Status Grid Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] space-y-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
          <div className="space-y-1">
            <SkeletonBox width="200px" height="22px" rounded="6px" />
            <SkeletonBox width="300px" height="14px" rounded="4px" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((b) => (
              <SkeletonBox key={b} width="80px" height="26px" rounded="9999px" />
            ))}
          </div>
        </div>

        {/* 3 Floors */}
        {[1, 2, 3].map((floor) => (
          <div key={floor} className="space-y-3">
            <SkeletonBox width="120px" height="20px" rounded="6px" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((room) => (
                <div
                  key={room}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] space-y-2 skeleton-shimmer"
                  style={{ height: '110px' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Bảng Dữ liệu Quản trị (/admin/bookings, /admin/invoices,...)
 */
export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm space-y-4 p-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-[var(--color-border)]">
        <SkeletonBox width="300px" height="40px" rounded="10px" />
        <div className="flex gap-3">
          <SkeletonBox width="120px" height="40px" rounded="10px" />
          <SkeletonBox width="120px" height="40px" rounded="10px" />
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {/* Header row */}
        <div className="grid grid-cols-6 gap-4 py-3 bg-[var(--color-surface-hover)] rounded-lg px-4">
          {[1, 2, 3, 4, 5, 6].map((col) => (
            <SkeletonBox key={col} width="80%" height="16px" rounded="4px" />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-6 gap-4 py-4 px-4 border-b border-[var(--color-border)] items-center"
          >
            <SkeletonBox width="70%" height="18px" rounded="6px" />
            <SkeletonBox width="90%" height="16px" rounded="4px" />
            <SkeletonBox width="60%" height="16px" rounded="4px" />
            <SkeletonBox width="80px" height="24px" rounded="9999px" />
            <SkeletonBox width="75%" height="18px" rounded="4px" />
            <div className="flex justify-end gap-2">
              <SkeletonBox width="32px" height="32px" rounded="8px" />
              <SkeletonBox width="32px" height="32px" rounded="8px" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center pt-4">
        <SkeletonBox width="180px" height="16px" rounded="4px" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((p) => (
            <SkeletonBox key={p} width="36px" height="36px" rounded="8px" />
          ))}
        </div>
      </div>
    </div>
  );
}
