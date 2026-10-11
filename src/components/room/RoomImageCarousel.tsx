'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Camera, X, Maximize2 } from 'lucide-react';
import { SafeImage, DEFAULT_ROOM_PLACEHOLDER } from '@/components/ui/SafeImage';

export interface RoomImageCarouselProps {
  images: string[];
  roomName: string;
}

/**
 * Component trình chiếu ảnh phòng (Room Image Carousel) cao cấp
 * Tự động chuyển đổi giữa chế độ Banner đơn (1 ảnh) và Carousel trượt mượt mà (nhiều ảnh)
 * Hỗ trợ: Nút Glassmorphism, Badge đếm số ảnh, Dải thumbnail chọn nhanh, Touch swipe di động & Lightbox
 */
export function RoomImageCarousel({ images, roomName }: RoomImageCarouselProps) {
  // Lọc danh sách ảnh hợp lệ, nếu không có ảnh nào thì dùng placeholder mặc định
  const validImages = React.useMemo(() => {
    const list = Array.isArray(images)
      ? images.map((img) => (typeof img === 'string' ? img.trim() : '')).filter(Boolean)
      : [];
    return list.length > 0 ? list : [DEFAULT_ROOM_PLACEHOLDER];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const total = validImages.length;
  const isMultiple = total > 1;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < total) {
      setCurrentIndex(index);
    }
  }, [total]);

  // Cuộn thumbnail strip đến vị trí ảnh đang chọn
  useEffect(() => {
    if (!thumbnailContainerRef.current) return;
    const container = thumbnailContainerRef.current;
    const activeThumb = container.children[currentIndex] as HTMLElement | undefined;
    if (activeThumb) {
      const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Lắng nghe phím mũi tên và ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrev, isLightboxOpen]);

  // Xử lý cử chỉ vuốt (Touch Swipe) trên di động
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // TRƯỜNG HỢP 1: Chỉ có 1 ảnh -> Hiển thị Banner tĩnh sang trọng
  if (!isMultiple) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(320px, 45vw, 520px)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          marginBottom: '3rem',
        }}
      >
        <SafeImage
          src={validImages[0]}
          alt={`${roomName} - Ảnh đại diện`}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          priority
        />
      </div>
    );
  }

  // TRƯỜNG HỢP 2: Có nhiều ảnh -> Trình chiếu Carousel đầy đủ tính năng
  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Khung hiển thị ảnh chính (Main Viewport) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(340px, 48vw, 540px)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.09)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track trượt mượt mà bằng CSS Transform */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {validImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                flexShrink: 0,
                cursor: 'zoom-in',
              }}
              onClick={() => setIsLightboxOpen(true)}
              title="Nhấn để xem ảnh phóng to"
            >
              <SafeImage
                src={img}
                alt={`${roomName} - Ảnh ${idx + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Nút lùi (Prev) Glassmorphism */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="Xem ảnh trước"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.88)';
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Nút tiến (Next) Glassmorphism */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="Xem ảnh tiếp theo"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.88)';
          }}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>

        {/* Nút mở toàn màn hình (Fullscreen / Zoom trigger) ở góc trên bên phải */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Phóng to ảnh"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            padding: '0.45rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
          }}
        >
          <Maximize2 size={13} />
          <span>Phóng to</span>
        </button>

        {/* Badge đếm ảnh ở góc dưới bên phải */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            zIndex: 10,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Camera size={13} />
          <span>
            {currentIndex + 1} / {total} ảnh
          </span>
        </div>
      </div>

      {/* Dải ảnh nhỏ (Thumbnail Strip) bên dưới */}
      <div
        ref={thumbnailContainerRef}
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.875rem',
          overflowX: 'auto',
          paddingBottom: '0.35rem',
          scrollbarWidth: 'thin',
        }}
      >
        {validImages.map((img, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => goToIndex(idx)}
              aria-label={`Chuyển tới ảnh ${idx + 1}`}
              style={{
                position: 'relative',
                width: '92px',
                height: '62px',
                flexShrink: 0,
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: isActive ? '2.5px solid var(--color-primary)' : '2px solid transparent',
                opacity: isActive ? 1 : 0.6,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                backgroundColor: 'var(--color-surface)',
                padding: 0,
                boxShadow: isActive ? '0 4px 12px rgba(27, 67, 50, 0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.opacity = '0.6';
              }}
            >
              <SafeImage
                src={img}
                alt={`${roomName} - Thumbnail ${idx + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="92px"
              />
            </button>
          );
        })}
      </div>

      {/* Lightbox phóng to ảnh toàn màn hình (Modal) */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Nút đóng Lightbox */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Đóng cửa sổ ảnh phóng to"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10010,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <X size={24} />
          </button>

          {/* Vùng hiển thị ảnh phóng to ở trung tâm */}
          <div
            style={{
              position: 'relative',
              width: 'min(92vw, 1100px)',
              height: 'min(80vh, 720px)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={validImages[currentIndex]}
              alt={`${roomName} - Ảnh phóng to ${currentIndex + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="100vw"
              priority
            />
          </div>

          {/* Nút Prev trong Lightbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Ảnh trước"
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10010,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Nút Next trong Lightbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Ảnh kế tiếp"
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10010,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Tiêu đề & Chỉ số ảnh trong Lightbox */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.925rem',
              fontWeight: 500,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
            }}
          >
            {roomName} • {currentIndex + 1} / {total}
          </div>
        </div>
      )}
    </div>
  );
}
