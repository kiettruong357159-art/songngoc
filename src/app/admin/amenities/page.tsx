'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  EyeOff,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { Pagination } from '@/components/ui/Pagination';
import AmenityModal, { AmenityData } from '@/components/admin/AmenityModal';
import { AmenityIcon } from '@/components/admin/AmenityIcon';
import { useToast } from '@/context/ToastContext';

const CATEGORY_NAMES: Record<string, string> = {
  GENERAL: 'Tiện nghi chung',
  BEDROOM: 'Phòng ngủ & Nghỉ ngơi',
  BATHROOM: 'Phòng tắm & Vệ sinh',
  MEDIA: 'Công nghệ & Giải trí',
};

const CATEGORY_BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  GENERAL: { bg: 'rgba(217, 119, 6, 0.1)', color: '#b45309', border: 'rgba(217, 119, 6, 0.25)' },
  BEDROOM: { bg: 'rgba(37, 99, 235, 0.1)', color: '#1d4ed8', border: 'rgba(37, 99, 235, 0.25)' },
  BATHROOM: { bg: 'rgba(13, 148, 136, 0.1)', color: '#0f766e', border: 'rgba(13, 148, 136, 0.25)' },
  MEDIA: { bg: 'rgba(124, 58, 237, 0.1)', color: '#6d28d9', border: 'rgba(124, 58, 237, 0.25)' },
};

export default function AdminAmenitiesPage() {
  const { showToast } = useToast();

  const [amenities, setAmenities] = useState<AmenityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<AmenityData | null>(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<AmenityData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAmenities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch('/api/admin/amenities');
      const data = await res.json();

      if (res.ok && data.success) {
        setAmenities(data.amenities || []);
      } else {
        throw new Error(data.error || 'Không thể tải danh sách tiện nghi');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi kết nối';
      showToast(message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  // Options cho bộ lọc danh mục
  const categoryFilterOptions: SelectOption[] = useMemo(() => [
    { value: 'ALL', label: `Tất cả danh mục (${amenities.length})` },
    { value: 'GENERAL', label: `Tiện nghi chung (${amenities.filter((a) => a.category === 'GENERAL').length})` },
    { value: 'BEDROOM', label: `Phòng ngủ & Nghỉ ngơi (${amenities.filter((a) => a.category === 'BEDROOM').length})` },
    { value: 'BATHROOM', label: `Phòng tắm & Vệ sinh (${amenities.filter((a) => a.category === 'BATHROOM').length})` },
    { value: 'MEDIA', label: `Công nghệ & Giải trí (${amenities.filter((a) => a.category === 'MEDIA').length})` },
  ], [amenities]);

  // Options cho bộ lọc trạng thái
  const statusFilterOptions: SelectOption[] = useMemo(() => [
    { value: 'ALL', label: `Tất cả trạng thái (${amenities.length})` },
    { value: 'ACTIVE', label: `Đang hoạt động (${amenities.filter((a) => a.isActive).length})` },
    { value: 'INACTIVE', label: `Tạm ẩn (${amenities.filter((a) => !a.isActive).length})` },
  ], [amenities]);

  // Lọc dữ liệu client-side
  const filteredAmenities = useMemo(() => {
    return amenities.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [amenities, search, categoryFilter, statusFilter]);

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredAmenities.length / pageSize) || 1;
  const paginatedAmenities = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAmenities.slice(start, start + pageSize);
  }, [filteredAmenities, page, pageSize]);

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setSelectedAmenity(null);
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (item: AmenityData) => {
    setSelectedAmenity(item);
    setIsModalOpen(true);
  };

  // Xóa tiện nghi
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/amenities/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xóa tiện nghi không thành công');
      }

      showToast(data.message || `Đã xóa tiện nghi "${deleteTarget.name}"`, 'success');
      setDeleteTarget(null);
      fetchAmenities(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa';
      showToast(message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Standard Action Header */}
      <div className="admin-action-header">
        <div className="admin-action-header-left">
          {/* Breadcrumb handled by AdminHeader */}
        </div>

        <div className="admin-action-header-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAmenities(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus size={16} />}
          >
            Thêm tiện nghi mới
          </Button>
        </div>
      </div>

      {/* Standard Filter Card */}
      <div className="admin-filter-card">
        {/* Search Input */}
        <div className="admin-search-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên tiện nghi, mã code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="admin-filter-control" style={{ width: '230px' }}>
          <CustomSelect
            options={categoryFilterOptions}
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            placeholder="Lọc danh mục..."
          />
        </div>

        {/* Status Filter */}
        <div className="admin-filter-control" style={{ width: '200px' }}>
          <CustomSelect
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Lọc trạng thái..."
          />
        </div>
      </div>

      {/* Standard Table Card */}
      <div className="admin-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tiện nghi</th>
                <th>Mã định danh (Code)</th>
                <th>Nhóm danh mục</th>
                <th style={{ textAlign: 'center' }}>Thứ tự</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--color-primary)' }} />
                    <div>Đang tải danh mục tiện nghi...</div>
                  </td>
                </tr>
              ) : paginatedAmenities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Không có tiện nghi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedAmenities.map((item) => {
                  const badgeStyle = CATEGORY_BADGE_STYLES[item.category] || CATEGORY_BADGE_STYLES.GENERAL;
                  return (
                    <tr key={item.id}>
                      {/* Tiện nghi: Icon + Tên */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <AmenityIcon icon={item.icon} size={17} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Icon: <code>{item.icon}</code>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mã code */}
                      <td>
                        <code
                          style={{
                            padding: '0.2rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.8125rem',
                            color: 'var(--color-text)',
                          }}
                        >
                          {item.code}
                        </code>
                      </td>

                      {/* Nhóm danh mục */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                          }}
                        >
                          {CATEGORY_NAMES[item.category] || item.category}
                        </span>
                      </td>

                      {/* Thứ tự */}
                      <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                        {item.sortOrder}
                      </td>

                      {/* Trạng thái */}
                      <td>
                        {item.isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Đang dùng
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: 'var(--color-bg)',
                              color: 'var(--color-text-muted)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            <EyeOff size={13} />
                            Tạm ẩn
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-table-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(item)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Edit size={13} />
                            <span>Sửa</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: 'var(--color-error)',
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Xóa</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Standard Table Footer */}
        {!loading && (
          <div className="admin-table-footer">
            <div className="admin-table-count">
              {filteredAmenities.length > 0 ? (
                <>
                  Hiển thị <strong>{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredAmenities.length)}</strong> trên tổng số <strong>{filteredAmenities.length}</strong> tiện nghi
                </>
              ) : (
                <span>Không có tiện nghi</span>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal Thêm / Chỉnh sửa Tiện Nghi */}
      <AmenityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amenityToEdit={selectedAmenity}
        onSuccess={() => fetchAmenities(true)}
      />

      {/* Hộp Thoại Xác Nhận Xóa Cao Cấp */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        variant="danger"
        title={deleteTarget ? `Xóa tiện nghi "${deleteTarget.name}"?` : 'Xác nhận xóa'}
        description={
          deleteTarget ? (
            <span>
              Hành động này sẽ xóa vĩnh viễn tiện nghi <strong>{deleteTarget.name}</strong> (mã <code>{deleteTarget.code}</code>) khỏi hệ thống quản lý. Các hạng phòng đang dùng mã này có thể sẽ không hiển thị biểu tượng tương ứng nữa.
            </span>
          ) : null
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
