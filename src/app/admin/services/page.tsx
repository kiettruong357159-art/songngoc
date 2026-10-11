'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  RefreshCw,
  Search,
  Tags
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceCategoryIcon } from '@/components/admin/ServiceCategoryIcon';
import { ServiceCategoryManager } from '@/components/admin/ServiceCategoryManager';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  isActive: boolean;
}

export default function AdminServicesPage() {
  const { showToast } = useToast();
  const { can } = useAuth();
  const canManage = can('services:manage');
  const { categories, isFallback, reload: reloadCategories } = useServiceCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('MINIBAR');
  const [formPrice, setFormPrice] = useState<number>(20000);
  const [formUnit, setFormUnit] = useState('Lon');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      } else {
        showToast(data.error || 'Không thể tải danh mục dịch vụ', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, search]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName('');
    setFormCategory('MINIBAR');
    setFormPrice(20000);
    setFormUnit('Lon');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormPrice(service.price);
    setFormUnit(service.unit);
    setFormIsActive(service.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUnit.trim()) {
      showToast('Vui lòng nhập tên dịch vụ và đơn vị tính', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingService) {
        // Update
        const res = await fetch('/api/admin/services', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            name: formName.trim(),
            category: formCategory,
            price: Number(formPrice),
            unit: formUnit.trim(),
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã cập nhật dịch vụ', 'success');
          setIsModalOpen(false);
          fetchServices(true);
        } else {
          showToast(data.error || 'Cập nhật thất bại', 'error');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            category: formCategory,
            price: Number(formPrice),
            unit: formUnit.trim(),
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã thêm dịch vụ mới', 'success');
          setIsModalOpen(false);
          fetchServices(true);
        } else {
          showToast(data.error || 'Thêm mới thất bại', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi dữ liệu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          isActive: !service.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${!service.isActive ? 'kích hoạt' : 'tạm ngưng'} dịch vụ ${service.name}`, 'success');
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
        );
      } else {
        showToast(data.error || 'Thao tác thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'error');
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.unit.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, categoryFilter, search]);

  const totalPages = Math.ceil(filteredServices.length / pageSize) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  // Options cho bộ lọc danh mục
  const categoryFilterOptions: SelectOption[] = useMemo(() => [
    { value: 'ALL', label: `Tất cả danh mục (${services.length})` },
    ...categories.map((c) => ({
      value: c.code,
      label: `${c.name} (${services.filter((s) => s.category === c.code).length})`,
    })),
  ], [categories, services]);

  // Danh mục hiển thị trong form: danh mục đang bật + danh mục hiện tại của dịch vụ đang sửa (nếu đã tắt)
  const categorySelectOptions: SelectOption[] = categories
    .filter((c) => c.isActive || c.code === formCategory)
    .map((c) => ({
      value: c.code,
      label: c.name,
    }));

  const getCategoryName = (code: string) => categories.find((c) => c.code === code)?.name || code;

  const getCategoryIcon = (code: string) => (
    <ServiceCategoryIcon icon={categories.find((c) => c.code === code)?.icon} size={15} />
  );

  return (
    <div>
      {/* Standard Action Header */}
      <div className="admin-action-header">
        <div className="admin-action-header-left">
          {/* Breadcrumb handled by layout */}
        </div>
        <div className="admin-action-header-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchServices(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>

          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Tags size={15} />
              <span>Quản lý danh mục</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Thêm dịch vụ mới</span>
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
            placeholder="Tìm tên dịch vụ, đơn vị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Category Dropdown */}
        <div className="admin-filter-control" style={{ width: '260px' }}>
          <CustomSelect
            options={categoryFilterOptions}
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            placeholder="Chọn danh mục..."
          />
        </div>
      </div>

      {/* Category Pills (Quick Filter) */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setCategoryFilter('ALL')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            backgroundColor: categoryFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: categoryFilter === 'ALL' ? '#ffffff' : 'var(--color-text)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          Tất cả ({services.length})
        </button>

        {categories.map((cat) => {
          const catKey = cat.code;
          const label = cat.name;
          const count = services.filter((s) => s.category === catKey).length;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setCategoryFilter(catKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: categoryFilter === catKey ? 'var(--color-primary)' : 'var(--color-surface)',
                color: categoryFilter === catKey ? '#ffffff' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {getCategoryIcon(catKey)}
              <span>{label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Standard Table Card */}
      <div className="admin-table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên dịch vụ</th>
                <th>Danh mục</th>
                <th>Đơn giá</th>
                <th>Đơn vị tính</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Đang tải danh mục...</div>
                  </td>
                </tr>
              ) : paginatedServices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    Không có dịch vụ nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedServices.map((service) => (
                  <tr key={service.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {service.name}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {getCategoryIcon(service.category)}
                        <span>{getCategoryName(service.category)}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {formatVND(service.price)}
                    </td>
                    <td>{service.unit}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: service.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: service.isActive ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {service.isActive ? 'Đang bán' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-table-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(service)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit2 size={13} />
                          <span>Sửa</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleActive(service)}
                        >
                          {service.isActive ? 'Ngưng' : 'Bật'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standard Table Footer */}
        {!loading && (
          <div className="admin-table-footer">
            <div className="admin-table-count">
              {filteredServices.length > 0 ? (
                <>
                  Hiển thị <strong>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredServices.length)}</strong> trên tổng số <strong>{filteredServices.length}</strong> dịch vụ
                </>
              ) : (
                <span>Không có dịch vụ</span>
              )}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Service */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tên dịch vụ / mặt hàng <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bia Heineken bạc, Giặt ủi áo sơ mi..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Nhóm danh mục <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <CustomSelect
              options={categorySelectOptions}
              value={formCategory}
              onChange={(val) => setFormCategory(val)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Đơn giá (VNĐ) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={5000}
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontWeight: 700,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Đơn vị tính <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Lon, Chai, Bộ, Kg, Lượt..."
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Kích hoạt kinh doanh mặt hàng này ngay
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingService ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal quản lý danh mục dịch vụ */}
      <ServiceCategoryManager
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        isFallback={isFallback}
        onChanged={reloadCategories}
      />
    </div>
  );
}
