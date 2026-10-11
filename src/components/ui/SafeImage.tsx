'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export const DEFAULT_ROOM_PLACEHOLDER = '/images/placeholder-room.svg';

export interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * SafeImage Component - Chống vỡ ảnh toàn hệ thống (Zero-Broken Images)
 * Tự động bắt lỗi tải ảnh và fallback về placeholder-room.svg tiêu chuẩn
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_ROOM_PLACEHOLDER,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    typeof src === 'string' && src.trim() !== '' ? src : fallbackSrc
  );

  useEffect(() => {
    if (typeof src === 'string' && src.trim() !== '') {
      setImgSrc(src);
    } else {
      setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'Song Ngọc Homestay'}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default SafeImage;
