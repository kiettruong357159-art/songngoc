'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime error to console or error monitor
    console.error('Unhandled runtime application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[var(--color-bg)] px-4 py-16">
      <div className="max-w-md w-full text-center bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Đã xảy ra sự cố
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Hệ thống gặp lỗi không mong muốn trong khi xử lý yêu cầu. Bạn có thể thử lại hoặc quay về trang chủ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl font-medium text-[var(--color-text)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors border border-[var(--color-border)]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
