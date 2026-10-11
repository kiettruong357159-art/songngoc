'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ServiceCategoryItem } from '@/lib/service-categories';

interface UseServiceCategoriesResult {
  categories: ServiceCategoryItem[];
  isFallback: boolean;
  loading: boolean;
  reload: () => Promise<void>;
}

/**
 * Hook tải danh mục dịch vụ từ API /api/admin/service-categories
 * @param activeOnly Chỉ lấy danh mục đang bật
 * @returns Danh sách danh mục, cờ fallback (chưa có bảng trong DB), trạng thái tải và hàm tải lại
 */
export function useServiceCategories(activeOnly = false): UseServiceCategoriesResult {
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/service-categories${activeOnly ? '?activeOnly=true' : ''}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setIsFallback(Boolean(data.isFallback));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, isFallback, loading, reload };
}
