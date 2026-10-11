'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export const DEFAULT_ROOM_PLACEHOLDER = '/images/placeholder-room.svg';

/**
 * Kiểm tra tính hợp lệ của đường dẫn URL hình ảnh
 * Chấp nhận: đường dẫn nội bộ bắt đầu bằng '/', data URL, hoặc URL tuyệt đối http/https hợp lệ
 */
export function isValidImageSrc(src: unknown): boolean {
  if (typeof src !== 'string' || !src.trim()) return false;
  const trimmed = src.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * SafeImage Component - Chống vỡ ảnh toàn hệ thống (Zero-Broken Images)
 * Tự động kiểm tra URL hợp lệ, bắt lỗi tải ảnh và fallback về placeholder-room.svg tiêu chuẩn
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_ROOM_PLACEHOLDER,
  unoptimized,
  ...props
}: SafeImageProps) {
  const validFallback = typeof fallbackSrc === 'string' && fallbackSrc.trim() !== '' 
    ? fallbackSrc 
    : DEFAULT_ROOM_PLACEHOLDER;

  const safeInitialSrc = isValidImageSrc(src) ? (src as string) : validFallback;
  const [imgSrc, setImgSrc] = useState<string>(safeInitialSrc);

  useEffect(() => {
    if (isValidImageSrc(src)) {
      setImgSrc(src as string);
    } else {
      setImgSrc(validFallback);
    }
  }, [src, validFallback]);

  // Nếu là ảnh từ URL bên ngoài (http/https), bật unoptimized để tránh lỗi cấu hình remote host
  const isExternal = typeof imgSrc === 'string' && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));
  const shouldBeUnoptimized = unoptimized !== undefined ? unoptimized : isExternal;

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'Song Ngọc Homestay'}
      unoptimized={shouldBeUnoptimized}
      onError={() => {
        if (imgSrc !== validFallback) {
          setImgSrc(validFallback);
        }
      }}
    />
  );
}

export default SafeImage;
