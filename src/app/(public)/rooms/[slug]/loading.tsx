import React from 'react';
import { SkeletonBox } from '@/components/ui/Skeletons';

/**
 * Route-Specific Skeleton Shimmer cho Tuyến /rooms/[slug] (Chi tiết phòng) - CLS = 0
 */
export default function RoomDetailLoading() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '3.5rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb Skeleton (Chống layout shift và loại bỏ ký tự raw '/' khi đang tải) */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <SkeletonBox width="80px" height="16px" rounded="4px" />
          <SkeletonBox width="100px" height="16px" rounded="4px" />
          <SkeletonBox width="160px" height="16px" rounded="4px" />
        </div>

        {/* Room Title & Price Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <SkeletonBox width="130px" height="24px" rounded="9999px" />
              <SkeletonBox width="140px" height="24px" rounded="9999px" />
            </div>
            <SkeletonBox width="340px" height="38px" rounded="8px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
            <SkeletonBox width="110px" height="14px" rounded="4px" />
            <SkeletonBox width="170px" height="36px" rounded="8px" />
          </div>
        </div>

        {/* Photo Gallery Banner Skeleton (gallery class preserved for tests) */}
        <div className="gallery" style={{ width: '100%', height: 'clamp(340px, 48vw, 540px)', marginBottom: '3rem' }}>
          <SkeletonBox height="100%" rounded="var(--radius-lg)" />
        </div>

        {/* 2 Columns: Room Details + Sticky Booking Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Quick Specs Badges */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <SkeletonBox height="44px" rounded="6px" />
              <SkeletonBox height="44px" rounded="6px" />
              <SkeletonBox height="44px" rounded="6px" />
              <SkeletonBox height="44px" rounded="6px" />
            </div>

            {/* Description Lines */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <SkeletonBox width="200px" height="26px" rounded="6px" />
              <SkeletonBox width="100%" height="16px" rounded="4px" />
              <SkeletonBox width="95%" height="16px" rounded="4px" />
              <SkeletonBox width="85%" height="16px" rounded="4px" />
            </div>

            {/* Amenities Grid */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <SkeletonBox width="220px" height="24px" rounded="6px" />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((a) => (
                  <SkeletonBox key={a} height="44px" rounded="var(--radius-md)" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card Skeleton */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <SkeletonBox width="140px" height="24px" rounded="6px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <SkeletonBox height="46px" rounded="10px" />
                <SkeletonBox height="46px" rounded="10px" />
                <SkeletonBox height="46px" rounded="10px" />
              </div>
              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <SkeletonBox width="90px" height="16px" rounded="4px" />
                  <SkeletonBox width="110px" height="16px" rounded="4px" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
